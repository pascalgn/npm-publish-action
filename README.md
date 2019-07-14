# npm-publish-action

GitHub action to automatically publish packages to npm.

## Usage

Add this to your `.github/main.workflow` file:

```
workflow "publish to npm on push" {
  on = "push"
  resolves = ["npm publish"]
}

action "npm publish" {
  uses = "pascalgn/npm-publish-action@6fff82ba2c6462bf4f6940168afe65303bbdbd56"
  secrets = ["GITHUB_TOKEN", "NPM_AUTH_TOKEN"]
  env = {
    TAG_NAME = "v%s"
    TAG_MESSAGE = "v%s"
    COMMIT_PATTERN = "^Release (\\S+)"
  }
}
```

## Configuration

The following environment variables are supported:

- `TAG_NAME`: The name pattern of the new tag
- `TAG_MESSAGE`: The message pattern of the new tag
- `COMMIT_PATTERN`: Pattern that the commit message needs to follow
- `NPM_AUTH_TOKEN`: The [npm](https://www.npmjs.com/) authentication token

## License

[MIT](LICENSE)
