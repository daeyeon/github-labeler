const express = require('express');
const axios = require('axios');
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

const labels = env.PR_LABELS || [];
const accessToken = env.TOKEN;
const port = env.PORT || 5696;
const hooker = GithubWebHook({
  path: env.PATH || '/',
  secret: env.SECRET,
});

debug.agent(`label rules: ${JSON.stringify(labels)}`);

const app = express();
app.use(express.json()); // body-parser
app.use(hooker);

// https://docs.github.com/en/developers/webhooks-and-events/webhook-events-and-payloads#pull_request
hooker.on('pull_request', (repo, data) => {
  if (data.action !== 'opened') {
    return;
  }

  const pr = data.pull_request;
  const found = labels.find(
    (item) => item.base == '*' || item.base == pr.base.ref,
  );

  debug.agent(`incoming webhook. (${repo}:${pr.base.ref}#${pr.number})`);

  if (!found) {
    return;
  }

  // https://docs.github.com/en/rest/reference/issues#add-labels-to-an-issue
  let config = {
    method: 'POST',
    url: `${pr.issue_url}/labels`,
    headers: {
      'User-Agent': 'github-labeler',
      'Content-Type': 'application/json',
      Authorization: `token ${accessToken}`,
    },
    data: JSON.stringify(found.label),
  };

  axios(config)
    .then((response) => {
      debug.remote(`adding label response ${JSON.stringify(response.data)}`);
    })
    .catch((error) => {
      console.error(error);
    });
});

hooker.on('error', (err, req, res) => {
  console.error('Error:', err);
});

app.listen(port, () => {
  debug.agent(`listening on port ${port}`);
});
