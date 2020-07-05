const express = require('express');
const request = require('axios');
const fs = require('fs');

const GithubWebHook = require('express-github-webhook');
const debug = {
  agent: require('debug')('labeler'),
  remote: require('debug')('github'),
};

// load config
const configFile = process.argv.slice(2)[0];

let env;
try {
  env = JSON.parse(fs.readFileSync(configFile));
  Object.freeze(env);
} catch (e) {
  console.error(`Fail to load ${configFile}.`);
  process.exit(1);
}

const repos = env.GITHUB_REPOS || [];
const labels = {
  pr: env.GITHUB_PR_LABELS || [],
  issue: env.GITHUB_ISSUE_LABELS || [],
};

debug.agent(`label rules: ${JSON.stringify(labels)}`);

const accessToken = env.GITHUB_TOKEN;
const hooker = GithubWebHook({
  path: env.WEBHOOK_PATH || '/',
  secret: env.GITHUB_SECRET || '',
});

const app = express();
app.set('port', env.PORT || 5696);
app.use(express.json()); // body-parser
app.use(hooker);

// https://docs.github.com/en/developers/webhooks-and-events/webhook-events-and-payloads#pull_request
hooker.on('pull_request', (repo, data) => {
  if (
    repos.indexOf(repo) < 0 ||
    data.action !== 'opened' ||
    labels.pr.length === 0
  ) {
    return;
  }

  const pr = data.pull_request;

  debug.agent(`incoming webhook. (${repo}:${pr.base.ref}#${pr.number})`);

  const found = labels.pr.find(
    (item) => item.base == '*' || item.base == pr.base.ref,
  );

  if (!found) return;

  // https://docs.github.com/en/rest/reference/issues#add-labels-to-an-issue
  let opts = {
    method: 'POST',
    url: `${pr.issue_url}/labels`,
    headers: {
      'User-Agent': 'github-labeler',
      Authorization: `token ${accessToken}`,
      'Content-Type': 'application/json',
    },
    data: JSON.stringify(found.label),
  };

  request(opts)
    .then((response) => {
      debug.remote(`adding label response ${JSON.stringify(response.data)}`);
    })
    .catch((error) => {
      console.error(error);
    });
});

hooker.on('error', (error) => {
  console.error('Error:', error);
});

app.listen(app.get('port'), () => {
  debug.agent(`listening on port ${app.get('port')}`);
});
