#!/usr/bin/env node
const core = require('@actions/core');

const process = require("process");
const {join} = require("path");
const {spawn} = require("child_process");
const {readFile} = require("fs");

async function main() {
  const dir =
    process.env.WORKSPACE ||
    process.env.GITHUB_WORKSPACE ||
    "/github/workspace";

  const eventFile =
    process.env.GITHUB_EVENT_PATH || "/github/workflow/event.json";
  const eventObj = await readJson(eventFile);

  const commitPattern =
    getEnv("COMMIT_PATTERN") || "^(?:Release|Version) (\\S+)";

  const {name, email} = eventObj.repository.owner;

  const config = {
    commitPattern,
    tagName: placeholderEnv("TAG_NAME", "v%s"),
    tagMessage: placeholderEnv("TAG_MESSAGE", "v%s"),
    tagAuthor: {name, email}
  };

  await processDirectory(dir, config, eventObj.commits);
}

function getEnv(name) {
  return process.env[name] || process.env[`INPUT_${name}`];
}

function placeholderEnv(name, defaultValue) {
  const str = getEnv(name);
  if (!str) {
    return defaultValue;
  } else if (!str.includes("%s")) {
    throw new Error(`missing placeholder in variable: ${name}`);
  } else {
    return str;
  }
}

async function getVersion(dir) {
  const packageFile = join(dir, "package.json");
  const packageObj = await readJson(packageFile).catch(() =>
    Promise.reject(
      new NeutralExitError(`package file not found: ${packageFile}`)
    )
  );

  if (packageObj == null || packageObj.version == null) {
    throw new Error("missing version field!");
  }

  const {version} = packageObj;
  return version
}

async function processDirectory(dir, config, commits) {

  let version = await getVersion(dir)
  await gitSetup(dir, config)

  await addBuiltPackage(dir);
  version = await bumpVersion(dir, config, getCommitVersion(config, commits), commits);

  await run(dir, "git", "push", "origin", `refs/tags/v${version}`);
  await run(dir, "git", "reset", "--soft", "HEAD^")
  await run(dir, "git", "restore", "--staged", ".")
  await run(dir, "git", "commit", "-a", "-m", `Release ${version}`).catch(e =>
    e instanceof ExitError && e.code === 1 ? false : Promise.reject(e)
  )
  await run(dir, "git", "push")

  console.log("Done.");
}


async function bumpVersion(dir, config, version, commits) {
  const args = version ? ["--new-version", version] : [`--${getStrategyFromCommit(commits)}`]

  await run(
    dir,
    "yarn",
    "version",
    ...args,
  ).catch(e =>
    e instanceof ExitError && e.code === 1 ? false : Promise.reject(e)
  );

  const newVersion = await getVersion(dir)
  console.log(`New version: ${newVersion}`)
  return newVersion;
}


function getCommitVersion(config, commits) {
  for (const commit of commits) {
    const match = commit.message.match(config.commitPattern);
    if (match && match[1]) {
      return match[1]
    }
  }
  return null
}

function getStrategyFromCommit(commits) {

  if (commits.some(({message}) =>
    message.includes("BREAKING CHANGE") ||
    message.toLowerCase().includes("major")
  )) {
    return "major"
  }

  if (commits.some(({message}) =>
    message.toLowerCase().startsWith("feat") ||
    message.toLowerCase().includes("minor")
  )) {
    return "minor"
  }
  return "patch"
}


async function readJson(file) {
  const data = await new Promise((resolve, reject) =>
    readFile(file, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    })
  );
  return JSON.parse(data);
}

async function gitSetup(dir, config) {
  const {name, email} = config.tagAuthor;
  await run(dir, "git", "config", "user.name", name);
  await run(dir, "git", "config", "user.email", email);
}

async function createTag(dir, config, version) {
  const tagName = config.tagName.replace(/%s/g, version);
  const tagMessage = config.tagMessage.replace(/%s/g, version);

  const tagExists = await run(
    dir,
    "git",
    "rev-parse",
    "-q",
    "--verify",
    `refs/tags/${tagName}`
  ).catch(e =>
    e instanceof ExitError && e.code === 1 ? false : Promise.reject(e)
  );

  if (tagExists) {
    console.log(`Tag already exists: ${tagName}`);
    throw new NeutralExitError();
  }

  await run(dir, "git", "tag", "-a", "-m", tagMessage, tagName);
  await run(dir, "git", "push", "origin", `refs/tags/${tagName}`);

  console.log("Tag has been created successfully:", tagName);
}

async function addBuiltPackage(dir) {
  await run(dir, "yarn");
  await run(dir, "yarn", "build");
  await run(dir, "git", "add", "-f", "dist")
}

function run(cwd, command, ...args) {
  console.log("Executing:", command, args.join(" "));
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd,
      stdio: ["ignore", "ignore", "pipe"]
    });
    const buffers = [];
    proc.stderr.on("data", data => buffers.push(data));
    proc.on("error", () => {
      reject(new Error(`command failed: ${command}`));
    });
    proc.on("exit", code => {
      if (code === 0) {
        resolve(true);
      } else {
        const stderr = Buffer.concat(buffers).toString("utf8").trim();
        if (stderr) {
          console.log(`command failed with code ${code}`);
          console.log(stderr);
        }
        reject(new ExitError(code));
      }
    });
  });
}

class ExitError extends Error {
  constructor(code) {
    super(`command failed with code ${code}`);
    this.code = code;
  }
}

class NeutralExitError extends Error {
}

if (require.main === module) {
  main().catch(e => {
    if (e instanceof NeutralExitError) {
      // GitHub removed support for neutral exit code:
      // https://twitter.com/ethomson/status/1163899559279497217
      process.exitCode = 0;
    } else {
      process.exitCode = 1;
      console.log(e.message || e);
    }
  });
}
