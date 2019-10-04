# npm-publish-action

GitHub action to automatically publish packages to npm.

## Usage

Add a step like this to your workflow:

```yaml
- name: Publish if version has been updated
  uses: pascalgn/npm-publish-action@1.0.1
  with: # All of theses inputs are optional
    tag_name: 'v%s'
    tag__message: 'v%s'
    commit_pattern: '^Release (\\S+)'
  env: # More info about the environment variables in the README
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # Leave this as is, it's automatically generated
    NPM_AUTH_TOKEN: ${{ secrets.NPM_AUTH_TOKEN }} # You need to set this in your repo settings
```

You can find a complete workflow example [here](doc/example-workflow.yml).

### Inputs

These inputs are optional: that means that if you don't enter them, default values will be used and it'll work just fine.

- `tag_name`: the name pattern of the new tag
- `tag_message`: the message pattern of the new tag
- `commit_pattern`: pattern that the commit message needs to follow

### Environment variables

- `GITHUB_TOKEN`: this is a token that GitHub generates automatically, you only need to pass it to the action as in the example
- `NPM_AUTH_TOKEN`: this is the token the action will use to authenticate to [npm](https://npmjs.com). You need to generate one in npm, then you can add it to your secrets (settings -> secrets) so that it can be passed to the action. DO NOT put the token directly in your workflow file.

## License

[MIT](LICENSE)
