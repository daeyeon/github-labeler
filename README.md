# Github-Labeler
A micro github webhook endpoint to auto-label new PRs. This is a toy for the environment where github action isn't available.

# Configurations
```
{
  // A list of labels to attach to new pull requests
  "PR_LABELS": [
    {
      "base": "conditional",
      "label": ["conditional"]
    },
    {
      "base": "*",
      "label": ["all"]
    }
  ],
  // https://github.com/{accout)/{your-respo)/settings/hooks
  // 1. `Add webhook` and fill in `Payload URL`.
  // 2. `Content type` should be `application/json`.
  // 3. Select individual events for `Pull Request`.
  // 4. Fill in `Secret`  passphrase there and here.
  "SECRET": "",
  // https://github.com/settings/tokens/new
  // `public_repo` is required at least.
  "TOKEN": "",
  // default: 5696
  "PORT": 5696,
  // the path for the GitHub callback: default: "/"
  "PATH": "/"
}

```

# How to run

``
$ DEBUG="labeler,github" node github-labeler.js config/index.json
``
