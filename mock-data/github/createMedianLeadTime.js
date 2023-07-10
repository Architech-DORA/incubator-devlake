/*
RUN:
  node createMedianLeadTime.js

This generates a file named "output-median.txt" with the SQL commands to insert the mock data.
You can just click enter on all questions and use the default answers.


# cleanup
DELETE FROM project_mapping WHERE project_mapping._raw_data_remark = 'DELETE_THIS';
DELETE FROM projects WHERE projects._raw_data_remark = 'DELETE_THIS';
DELETE FROM cicd_deployment_commits WHERE projects._raw_data_remark = 'DELETE_THIS';
DELETE FROM repos WHERE repos._raw_data_remark = 'DELETE_THIS';

Date format example:
'2023-5-22 11:9:20.916'


Copy to Macbook clipboard:
pbcopy < pr-output.txt

*/

const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query, defaultValue) {
  return new Promise((resolve, reject) => {
    rl.question(query + (defaultValue ? ` (${defaultValue})` : '') + ': ', (answer) => {
      resolve(answer || defaultValue);
    });
  });
}

const cdcCols = [
  'id', 'created_at', 'updated_at', '_raw_data_params', '_raw_data_table', // 0-4
  '_raw_data_id', '_raw_data_remark', 'cicd_scope_id', 'cicd_deployment_id', 'name', // 5-9
  'result', 'status', 'environment', 'created_date', 'started_date', // 10-14
  'finished_date', 'duration_sec', 'commit_sha', 'ref_name', 'repo_id', // 15-19
  'repo_url', 'prev_success_deployment_commit_id' // 20-21
].join(',');

const ppmCols = [
  'id', 'created_at', 'updated_at', '_raw_data_params', '_raw_data_table', // 0-4
  '_raw_data_id', '_raw_data_remark', 'project_name', 'first_commit_sha', 'pr_coding_time', // 5-9
  'first_review_id', 'pr_pickup_time', 'pr_review_time', 'deployment_commit_id', 'pr_deploy_time', // 10-14
  'pr_cycle_time' // 15
].join(',');

const prCols = [
  'id', 'created_at', 'updated_at', '_raw_data_params', '_raw_data_table', // 0-4
  '_raw_data_id', '_raw_data_remark', 'base_repo_id', 'head_repo_id', 'status', // 5-9
  'title', 'description', 'url', 'author_name', 'author_id', // 10-14
  'parent_pr_id', 'pull_request_key', 'created_date', 'merged_date', // 15-18
  'closed_date', 'type', 'component', 'merge_commit_sha', 'head_ref', // 19-23
  'base_ref', 'base_commit_sha', 'head_commit_sha' // 24-26
].join(','); // 27

async function main() {
  try {
    const fileStream = fs.createWriteStream('median.sql');

    const createdDate = new Date(2023, 4, 20, 12, 9, 20);
    const finishedDate = new Date(2023, 4, 24, 12, 30, 10);

    const prCreatedDate = new Date(2023, 3, 23, 12, 9, 20);
    const prMergedDate = new Date(2023, 3, 24, 11, 30, 10);


    const cycleTimeMins = Math.floor(Math.abs(prCreatedDate - prMergedDate) / (1000 * 60));

    const count = 1

    const deploymentId = 6080032382 + count; // deployment id
    const deploymentKey = 200 + count; //

    const prId = 2802326702 + count;
    const prKey = 100 + count;

    const boardId = '57135124';
    const repositoryName = 'githubuser/newrepo'
    const authorName = 'githubuser3'
    const authorId = '888881'
    const projectName = 'github_proj';
    const defaultIsSuccess = true;

    const createdDateString = `${createdDate.getFullYear()}-${createdDate.getMonth() + 1}-${createdDate.getDate()} ${createdDate.getHours()}:${createdDate.getMinutes()}:${createdDate.getSeconds()}.${createdDate.getMilliseconds()}`;
    const finishedDateString = `${finishedDate.getFullYear()}-${finishedDate.getMonth() + 1}-${finishedDate.getDate()} ${finishedDate.getHours()}:${finishedDate.getMinutes()}:${finishedDate.getSeconds()}.${finishedDate.getMilliseconds()}`;

    const prCreateDateString = `${prCreatedDate.getFullYear()}-${prCreatedDate.getMonth() + 1}-${prCreatedDate.getDate()} ${prCreatedDate.getHours()}:${prCreatedDate.getMinutes()}:${prCreatedDate.getSeconds()}.${prCreatedDate.getMilliseconds()}`;
    const prMergedDateString = `${prMergedDate.getFullYear()}-${prMergedDate.getMonth() + 1}-${prMergedDate.getDate()} ${prMergedDate.getHours()}:${prMergedDate.getMinutes()}:${prMergedDate.getSeconds()}.${prMergedDate.getMilliseconds()}`;

    const connectionId = 1;

    const runId = `github:GithubRun:${connectionId}:${boardId}:${deploymentId}`
    const repoId = `github:GithubRepo:${connectionId}:${boardId}`;
    const repoUrl = `https://github.com/${repositoryName}`;

    const differenceInSeconds = Math.floor(Math.abs(createdDate - finishedDate) / (1000));

    const cdcValues = [
      `'${runId}:${repoUrl}'`,
      `'${createdDateString}'`, `'${createdDateString}'`, `'{"ConnectionId":${connectionId},"Name":"${repositoryName}"}'`,
      `'_raw_github_api_runs'`, deploymentKey, `'DELETE_THIS'`, `'${repoId}'`, `'${runId}'`, `'pages build and deployment'`,
      `'${defaultIsSuccess ? 'SUCCESS' : 'FAILURE'}'`, `'DONE'`, `'PRODUCTION'`, `'${createdDateString}'`, `'${createdDateString}'`,
      `'${finishedDateString}'`, `${differenceInSeconds}`, `'alskwerejwrwklwkjerlkwjer'`, `'master'`, `'${repoId}'`, `'${repoUrl}'`, `''`
    ].join(',');

    const pullRequestId = `github:GithubPullRequest:${connectionId}:${prId}`

    const prValues = [
      `'${pullRequestId}'`, `'${prCreateDateString}'`, `'${prCreateDateString}'`, `'{"ConnectionId":${connectionId},"Name":"${repositoryName}"}'`, `'_raw_github_graphql_prs'`,
      '46', `'DELETE_THIS'`, `'${repoId}'`, `'github:GithubRepo:${connectionId}:0'`, `'CLOSED'`,
      `'test pr'`, `'test pr'`, `'https://github.com/${repositoryName}/pull/${prKey}'`, `'${authorName}'`, `'github:GithubAccount:${connectionId}:${authorId}'`,
      `''`, `'${prKey}'`, `'${prCreateDateString}'`, `'${prMergedDateString}'`, `'${prMergedDateString}'`,
      `''`, `''`, `'wwlksjfliwejrliewjlijlewijri'`, `'branch-blah'`, `'master'`,
      `'wwlksjfliwejrliewjlijlewijri'`, `'wwlksjfliwejrliewjlijlewijri'`
    ].join(',');

    const ppmValues = [
      `'${pullRequestId}'`, `'${prCreateDateString}'`, `'${prCreateDateString}'`, `'{"ConnectionId":${connectionId},"Name":"${repositoryName}"}'`, `'_raw_github_graphql_prs'`,
      '46', `'DELETE_THIS'`, `'${projectName}'`, `'lsjdfliwieorwoer'`, '88',
      `''`, 'null', 'null', `'${runId}:${repoUrl}'`, 'null',
      `${cycleTimeMins}`
    ].join(',');

    const cdcStatement = `INSERT INTO cicd_deployment_commits (${cdcCols}) \nvalues (${cdcValues});\n\n`;
    const prStatement = `INSERT INTO pull_requests (${prCols}) \nvalues (${prValues});\n\n`;
    const ppmStatement = `INSERT INTO project_pr_metrics (${ppmCols}) \nvalues (${ppmValues});\n\n`;

    fileStream.write(cdcStatement);
    fileStream.write(prStatement);
    fileStream.write(ppmStatement);

    fileStream.end();

    console.log('Data has been written to pr-output.txt');
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    rl.close();
  }
}

main();
