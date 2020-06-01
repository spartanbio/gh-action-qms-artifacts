# gh-action-qms-artifacts

GitHub actions to create artifacts suitable for the QMS.

## Usage

In your job's `steps` add:

```yml
uses: spartanbio/gh-action-qms-release@v1
```

### Inputs

- `files` (required): A glob pattern describing files to add to the artifacts. To use multiple glob patterns, separate them with newlines. Patterns are applied in the order listed.
- `name`: What to name the artifact. Defaults to `<repo-name>@<version>`. Version defaults to the latest tag matching `v[0-9]*`.
- `hash`: Should the current git hash be added to the artifacts in `git-hash.txt`. Defaults to `'true'`. Disable with `'false`'. This value must be a string.
- `env`: Environment variables to be included in the artifacts in `.env`. Each variable should be on a new line. Defaults to none.

## Example Workflow

```yml
name: Test Workflow

on: release

jobs:
  some-job:
    runs-on: ubuntu-latest
    steps:
      uses: spartanbio/gh-action-qms-release@v1
        with:
          files: |
            ./
            !.git*
            !**/node_modules/
```
