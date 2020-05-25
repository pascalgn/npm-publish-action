# npm-publish-action

GitHub action to automatically publish packages to npm.

## Usage

Create a new `.github/workflows/npm-publish.yml` file:

```yaml
name: npm-publish
on:
  push:
    branches:
      - master # Change this to your default branch
jobs:
  npm-publish:
    name: npm-publish
    runs-on: ubuntu-latest
    steps:
    - name: Checkout repository
      uses: actions/checkout@master
    - name: Set up Node.js
      uses: actions/setup-node@master
      with:
        node-version: 10.0.0
    - name: Publish if version has been updated
      uses: pascalgn/npm-publish-action@4f4bf159e299f65d21cd1cbd96fc5d53228036df
      with: # All of theses inputs are optional
        tag_name: "v%s"
        tag_message: "v%s"
        commit_pattern: "^Release (\\S+)"
        package_path: "."
      env: # More info about the environment variables in the README
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # Leave this as is, it's automatically generated
        NPM_AUTH_TOKEN: ${{ secrets.NPM_AUTH_TOKEN }} # You need to set this in your repo settings
```

Now, when someone changes the version in `package.json` to 1.2.3 and pushes a commit with the message `Release 1.2.3`, the `npm-publish` action will create a new tag `v1.2.3` and publish the package to the npm registry.

### Inputs

These inputs are optional: that means that if you don't enter them, default values will be used and it'll work just fine.

- `tag_name`: the name pattern of the new tag
- `tag_message`: the message pattern of the new tag
- `commit_pattern`: pattern that the commit message needs to follow
- `package_path`: custom directory in the case that the package is not in the root.

### Environment variables

- `GITHUB_TOKEN`: this is a token that GitHub generates automatically, you only need to pass it to the action as in the example
- `NPM_AUTH_TOKEN`: this is the token the action will use to authenticate to [npm](https://npmjs.com). You need to generate one in npm, then you can add it to your secrets (settings -> secrets) so that it can be passed to the action. DO NOT put the token directly in your workflow file.

## Related projects

- [version-check](https://github.com/EndBug/version-check) allows to define custom workflows based on version changes

## License

[MIT](LICENSE)
