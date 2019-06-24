'use strict';

const express = require('express');
var bodyParser = require('body-parser');
const strategicProjectsMetrics = require('./strategic-project-metrics');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// env
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_DOMAIN = process.env.GITHUB_DOMAIN;
const GITHUB_ORG = process.env.GITHUB_ORG;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH;


// App
const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// ROOT
app.get('/', (req, res) => {
  res.send({up: true});
});

// strategic-project-metrics
app.get('/strategic-project-metrics', (req, res) => {

  strategicProjectsMetrics.getMetrics({
    github:{
      username: GITHUB_USERNAME,
      token: GITHUB_TOKEN,
      domain: GITHUB_DOMAIN,
      org: GITHUB_ORG,
      repo: GITHUB_REPO,
      branch: GITHUB_BRANCH
    }
  }).then(metrics => {
    res
    .set('Content-Type', strategicProjectsMetrics.getMetricsContentType())
    .send(metrics);
  });
});


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
