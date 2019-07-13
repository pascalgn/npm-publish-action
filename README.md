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
  uses = "pascalgn/npm-publish-action@master"
  secrets = ["NPM_AUTH_TOKEN"]
  env = {
    TAG_NAME = "v%s"
    TAG_MESSAGE = "v%s"
  }
}
```

## Configuration

The following environment variables are supported:

- `TAG_NAME`: The name pattern of the new tag
- `TAG_MESSAGE`: The message pattern of the new tag
- `NPM_AUTH_TOKEN`: The [npm](https://www.npmjs.com/) authentication token

## License

[MIT](LICENSE)
