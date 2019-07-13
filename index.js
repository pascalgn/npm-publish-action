#!/usr/bin/env node

const process = require("process");
const { join } = require("path");
const { spawn } = require("child_process");
const { readFile } = require("fs");

async function main() {
  const dir = process.argv[2] || "/github/workspace";

  const eventFile =
    process.env.GITHUB_EVENT_PATH || "/github/workflow/event.json";
  const eventObj = await readJson(eventFile);

  const defaultBranch = process.env.DEFAULT_BRANCH || "master";

  if (eventObj.ref !== `refs/heads/${defaultBranch}`) {
    console.error(
      `Ref ${eventObj.ref} is not the default branch: ${defaultBranch}`
    );
    throw new NeutralExitError();
  }

  const { name, email } = eventObj.repository.owner;

  const config = {
    tagName: placeholderEnv("TAG_NAME", "v%s"),
    tagMessage: placeholderEnv("TAG_MESSAGE", "v%s"),
    tagAuthor: { name, email }
  };

  await processDirectory(dir, config);
}

function placeholderEnv(name, defaultValue) {
  const str = process.env[name];
  if (!str) {
    return defaultValue;
  } else if (!str.includes("%s")) {
    throw new Error(`missing placeholder in variable: ${name}`);
  } else {
    return str;
  }
}

async function processDirectory(dir, config) {
  const packageFile = join(dir, "package.json");
  const packageObj = await readJson(packageFile).catch(() =>
    Promise.reject(
      new NeutralExitError(`package file not found: ${packageFile}`)
    )
  );

  if (packageObj == null || packageObj.version == null) {
    throw new Error("missing version field!");
  }

  const { version } = packageObj;

  await createTag(dir, config, version);
  await publishPackage(dir, config, version);

  console.log("Done.");
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
    console.error(`Tag already exists: ${tagName}`);
    throw new NeutralExitError();
  }

  const { name, email } = config.tagAuthor;
  await run(dir, "git", "config", "user.name", name);
  await run(dir, "git", "config", "user.email", email);

  await run(dir, "git", "tag", "-a", "-m", tagMessage, tagName);
  await run(dir, "git", "push", "origin", `refs/tags/${tagName}`);

  console.log("Tag has been created successfully:", tagName);
}

async function publishPackage(dir, config, version) {
  await run(
    dir,
    "yarn",
    "publish",
    "--non-interactive",
    "--new-version",
    version
  );

  console.log("Version has been published successfully:", version);
}

function run(cwd, command, ...args) {
  console.error("Executing:", command, args.join(" "));
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd,
      stdio: ["ignore", "ignore", "inherit"]
    });
    proc.on("error", () => {
      reject(new Error(`command failed: ${command}`));
    });
    proc.on("exit", code => {
      if (code === 0) {
        resolve(true);
      } else {
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

class NeutralExitError extends Error {}

if (require.main === module) {
  main().catch(e => {
    if (e instanceof NeutralExitError) {
      process.exitCode = 78;
    } else {
      process.exitCode = 1;
      console.error(e);
    }
  });
}
