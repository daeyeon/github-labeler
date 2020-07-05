# Github-Labeler
A micro github webhook endpoint to auto-label new PRs on submission.

# Configurations
```
{
  // A comma-delimited list of repos to watch for
  "GITHUB_REPOS": [""],
  // A list of labels to attach to new pull requests
  "GITHUB_PR_LABELS": [
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
  // 1. `Add Webhook` and fill in `Payload URL`.
  // 2. `Content type` should be `application/json`.
  // 3. Select individual events for `Pull Request`.
  // 4. Fill in `Secret`  passphrase there and here.
  "GITHUB_SECRET": "",
  // https://github.com/settings/tokens/new
  // `public_repo` is required at least.
  "GITHUB_TOKEN": "",
  // default: 5696
  "PORT": 5696
}

```

# How to run

``
$ DEBUG="labeler,github" node github-labeler.js config/index.json
``
