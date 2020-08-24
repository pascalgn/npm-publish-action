# tag-gh-publish-action

GitHub action to automatically publish packages to github tag.

## Usage

Create a new `.github/workflows/tag-release.yml` file:

```yaml
name: tag-release
on:
  push:
    branches:
      - master # Change this to your default branch
jobs:
  tag-release:
    name: tag-release
    runs-on: ubuntu-latest
    steps:
    - name: Checkout repository
      uses: actions/checkout@master
    - name: Set up Node.js
      uses: actions/setup-node@master
      with:
        node-version: 10.0.0
    - name: Publish if version has been updated
      uses: tonthanhhung/tag-gh-publish-action@f1eb478
      env: # More info about the environment variables in the README
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # Leave this as is, it's automatically generated        
```

Now, when someone changes the version in `package.json` to 1.2.3 and pushes a commit with the message `Release 1.2.3`, the `npm-publish` action will create a new tag `v1.2.3` and publish the package to the npm registry.

### Environment variables

- `GITHUB_TOKEN`: this is a token that GitHub generates automatically, you only need to pass it to the action as in the example

## Related projects

- [version-check](https://github.com/EndBug/version-check) allows to define custom workflows based on version changes

## License

[MIT](LICENSE)
