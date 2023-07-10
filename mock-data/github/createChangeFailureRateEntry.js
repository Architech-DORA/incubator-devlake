/*
RUN:
  node createChangeFailureRateEntry.js

This generates a file named "deployments-output.txt" with the SQL commands to insert the mock data.
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

const pimCols = [
  'id', 'created_at', 'updated_at', '_raw_data_params', '_raw_data_table', '_raw_data_id', '_raw_data_remark', 'project_name', 'deployment_id'
].join(',');

const issueCols =
  'id, created_at, updated_at, _raw_data_params, _raw_data_table, ' + // 0-4
  '_raw_data_id, _raw_data_remark, url, icon_url, issue_key, ' + // 5-9
  'title, description, epic_key, type, status, ' + // 10-14
  'original_status, resolution_date, created_date, updated_date, parent_issue_id, ' + // 15-19
  'priority, original_estimate_minutes, time_spent_minutes, time_remaining_minutes, creator_id, ' + // 20-24
  'creator_name, assignee_id, assignee_name, severity, component, ' + // 25-29
  'lead_time_minutes, original_project, original_type, story_point '; // 29-34

const boardIssueCols =
  'board_id, issue_id, created_at, updated_at, ' +
  '_raw_data_params, _raw_data_table, _raw_data_id, _raw_data_remark';

// tables used: cicd_deployment_commits, project_mapping, and projects
//
async function main() {
  try {
    const fileStream = fs.createWriteStream('output-change-failure.sql');

    // deployment
    const createdDate = new Date(2023, 3, 24, 12, 9, 20);
    const finishedDate = new Date(2023, 3, 24, 12, 30, 10);
    // issue
    const issueCreatedDate = new Date(2023, 3, 23, 14, 1, 30)
    const issuedResolvedDate = new Date(2023, 3, 24, 12, 31, 10);

    const count = 11

    const deploymentId = 5180099982 + count; // deployment id
    const deploymentKey = 100 + count; //
    const baseIssueId = 178882261061 + count;
    const issueKey = 21150 + count;

    const defaultBoardId = '57135124';
    const defaultRepoName = 'githubuser/newrepo'
    const defaultIsSuccess = true;
    const isIncident = false;

    const createdDateString = `${createdDate.getFullYear()}-${createdDate.getMonth() + 1}-${createdDate.getDate()} ${createdDate.getHours()}:${createdDate.getMinutes()}:${createdDate.getSeconds()}.${createdDate.getMilliseconds()}`;
    const finishedDateString = `${finishedDate.getFullYear()}-${finishedDate.getMonth() + 1}-${finishedDate.getDate()} ${finishedDate.getHours()}:${finishedDate.getMinutes()}:${finishedDate.getSeconds()}.${finishedDate.getMilliseconds()}`;
    const issueCreatedDateString = `${issueCreatedDate.getFullYear()}-${issueCreatedDate.getMonth() + 1}-${issueCreatedDate.getDate()} ${issueCreatedDate.getHours()}:${issueCreatedDate.getMinutes()}:${issueCreatedDate.getSeconds()}.${issueCreatedDate.getMilliseconds()}`;
    const issueResolvedDateString = `${issuedResolvedDate.getFullYear()}-${issuedResolvedDate.getMonth() + 1}-${issuedResolvedDate.getDate()} ${issuedResolvedDate.getHours()}:${issuedResolvedDate.getMinutes()}:${issuedResolvedDate.getSeconds()}.${issuedResolvedDate.getMilliseconds()}`;

    const boardId = defaultBoardId;
    const connectionId = 1;
    const repositoryName = defaultRepoName;
    const issueId = `github:GithubIssue:${connectionId}:${baseIssueId}`;
    const projectName = 'github_proj';
    const isResolved = true
    const creatorId = '888881';
    const creatorName = 'githubuser3';

    const runId = `github:GithubRun:${connectionId}:${boardId}:${deploymentId}`
    const repoId = `github:GithubRepo:${connectionId}:${boardId}`;
    const repoUrl = `https://github.com/${repositoryName}`;

    const date1 = new Date(createdDateString);
    const date2 = new Date(finishedDateString);

    const differenceInMilliseconds = Math.abs(date2 - date1);
    const differenceInSeconds = Math.floor(differenceInMilliseconds / (1000));

    const cdcValues = [
      `'${runId}:${repoUrl}'`,
      `'${createdDateString}'`, `'${createdDateString}'`, `'{"ConnectionId":${connectionId},"Name":"${repositoryName}"}'`,
      `'_raw_github_api_runs'`, deploymentKey, `'DELETE_THIS'`, `'${repoId}'`, `'${runId}'`, `'pages build and deployment'`,
      `'${defaultIsSuccess ? 'SUCCESS' : 'FAILURE'}'`, `'DONE'`, `'PRODUCTION'`, `'${createdDateString}'`, `'${createdDateString}'`,
      `'${finishedDateString}'`, `${differenceInSeconds}`, `'alskwerejwrwklwkjerlkwjer'`, `'master'`, `'${repoId}'`, `'${repoUrl}'`, `''`
    ].join(',');

    const pimValues = [
      `'${issueId}'`, `'${createdDateString}'`, `'${createdDateString}'`, `''`, `''`, 1, `'DELETE_THIS'`, `'${projectName}'`, `'${runId}'`
    ]

    const rawDataParams = `{"ConnectionId":${connectionId},"Name":"${repositoryName}"}`;
    const rawDataTable = '_raw_github_graphql_issues';

    const issueDiffMillis = Math.abs(issueCreatedDate - issuedResolvedDate);
    const issueDiffMinutes = Math.floor(issueDiffMillis / (1000 * 60));

    const issueValues = [
      `'${issueId}'`, `'${issueCreatedDateString}'`, `'${issueCreatedDateString}'`, `'${rawDataParams}'`, `'${rawDataTable}'`, // 0-4
      `'46'`, `'DELETE_THIS'`, `'https://github.com/${repositoryName}/issues/${issueId}'`, `''`, `'${issueKey}'`, // 5-9
      `'title'`, `'desc'`, `'DELETE_THIS'`, `${isIncident ? '\'INCIDENT\'' : '\'\''}`, isResolved ? '\'DONE\'' : '\'TODO\'', // 10-14
      isResolved ? '\'CLOSED\'' : '\'OPEN\'', isResolved ? `'${issueResolvedDateString}'` : 'null', `'${issueCreatedDateString}'`, `'${issueCreatedDateString}'`, `''`, // 15-19
      `''`, '0', '0', '0', `'github:GithubAccount:${connectionId}:${creatorId}'`, // 20-24
      `'${creatorName}'`, `'github:GithubAccount:${connectionId}:0'`, `''`, `''`, `''`, // 25-29
      `${isResolved ? issueDiffMinutes : 0}`, `''`, `''`, '0' // 29-34
    ].join(',')

    const boardIssueValues = [`'github:GithubRepo:${connectionId}:${boardId}'`, `'${issueId}'`, `'${createdDateString}'`, `'${createdDateString}'`, `'${rawDataParams}'`, `'${rawDataTable}'`, `'46'`, `'DELETE_THIS'`].join(',');

    const cdcStatement = `INSERT INTO cicd_deployment_commits (${cdcCols}) \nvalues (${cdcValues});\n\n`;
    const pimStatement = `INSERT INTO project_issue_metrics (${pimCols}) \nvalues (${pimValues});\n\n`;
    const issueStatement = `INSERT INTO issues (${issueCols}) \nvalues (${issueValues});\n\n`;
    const boardIssueStatement = `INSERT INTO board_issues (${boardIssueCols}) \nvalues (${boardIssueValues});\n\n`;

    fileStream.write(cdcStatement);
    fileStream.write(pimStatement);
    fileStream.write(issueStatement);
    fileStream.write(boardIssueStatement);

    fileStream.end();

    console.log('Data has been written to pr-output.txt');
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    rl.close();
  }
}

main();
