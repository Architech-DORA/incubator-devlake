/*
RUN:
  node createIssue.js

This generates a file named "output.txt" with the SQL commands to insert the mock data.
You can just click enter on all questions and use the default answers.


Cleaning Up all mock data:

# cleanup
DELETE FROM boards WHERE boards._raw_data_remark = 'DELETE_THIS';
DELETE FROM issues WHERE issues.epic_key = 'DELETE_THIS';
DELETE FROM board_issues WHERE board_issues._raw_data_remark = 'DELETE_THIS';
DELETE FROM repos WHERE repos._raw_data_remark = 'DELETE_THIS';

Date format example:
'2023-5-22 11:9:20.916'


Copy to Macbook clipboard:
pbcopy < output.txt

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

const TYPES = {
    GITHUB: 'github:GithubIssue'
    // other types later
}

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

const projectMappingCols = [
  'project_name', '`table`', 'row_id', 'created_at', 'updated_at', // 0-4
  '_raw_data_params', '_raw_data_table', '_raw_data_id', '_raw_data_remark'
].join(',') // 5-8

const projectsCols = [
  'name', 'description', 'created_at', 'updated_at', '_raw_data_params', // 0-4
  '_raw_data_table', '_raw_data_id', '_raw_data_remark' // 5-7
].join(',')

async function main() {
    const defaultRepoName = 'githubuser/newrepo';
    const count = 15;

    // default answers
    const defaultBoardId = '57135124';
    const defaultStartId = 178885061061;
    const defaultStartKey = 21121;
    const defaultUserId = '888881';
    const defaultUser = 'githubuser3';
    const defaultIsResolved = 'true';
    const defaultIsIncident = 'true';
    const defaultProjectName = 'github_proj';

    try {
        const fileStream = fs.createWriteStream('output-issues.sql');

        const createdDate = new Date(2023, 5, 1, 10, 3, 23, 916);
        const mergeDate = new Date(2023, 5, 1, 11, 11, 28, 916);

        const defaultCreatedDateString = `${createdDate.getFullYear()}-${createdDate.getMonth() + 1}-${createdDate.getDate()} ${createdDate.getHours()}:${createdDate.getMinutes()}:${createdDate.getSeconds()}.${createdDate.getMilliseconds()}`;
        const defaultResolvedDateString = `${mergeDate.getFullYear()}-${mergeDate.getMonth() + 1}-${mergeDate.getDate()} ${mergeDate.getHours()}:${mergeDate.getMinutes()}:${mergeDate.getSeconds()}.${mergeDate.getMilliseconds()}`;
        const issueType = TYPES.GITHUB; // initial type (maybe later we can ask the user)

        const boardId = await question('Enter your board id eg. "506666443"', defaultBoardId);
        const numberOfIssues = await question('Enter the number of issues ', 1);
        const connectionId = await question('Enter your connection id ', 1);
        const repositoryName = await question('Enter your repository name eg. "nodejs/node" ', defaultRepoName);
        const projectName = await question('Enter your project name ', defaultProjectName);
        const isIncident = await question('Is this an incident? ', defaultIsIncident);
        const startingIssueId = defaultStartId + count;
        const startingIssueKey = defaultStartKey + count;
        const issueTitle = await question('Enter your issue title ', 'title');
        const issueDesc = await question('Enter your issue description ', 'desc');
        const resolvedValue = await question('Is the issue resolved? ', defaultIsResolved);
        const createdDateString = await question('Enter the created date ', defaultCreatedDateString);
        let resolvedDateString = null
        const isResolved = resolvedValue === 'true';

        if (isResolved) {
            resolvedDateString = await question('Enter the resolved date ', defaultResolvedDateString);
        }
        const creatorId = await question('Enter your creator id ["id" from "_tool_github_accounts" like "8603391"] ', defaultUserId); // eg. "1"
        const creatorName = await question('Enter your creator name ["name" from "_tool_github_accounts"] ', defaultUser); // eg. "John Doe"

        const assigneeId = await question('Enter your assignee id ["id" from "_tool_github_accounts"]', '0');
        const assigneeName = await question('Enter your assignee name ["name" from "_tool_github_accounts"] ', '');

        const boardCols = 'id, created_at, updated_at, _raw_data_params, _raw_data_table, _raw_data_id, _raw_data_remark, name, description, url, created_date, type';
        const repoCols = 'id, created_at, updated_at, _raw_data_params, _raw_data_table, _raw_data_id, _raw_data_remark, name, url, description, owner_id, language, forked_from, created_date, updated_date, deleted';

        const boardValues = [
            `'github:GithubRepo:${connectionId}:${boardId}'`, `'2023-06-20 10:58:22.201'`, `'2023-06-20 10:58:22.201'`, `''`, `''`, 1, `'DELETE_THIS'`, `'${repositoryName}'`, `''`, `'https://github.com/${repositoryName}/issues'`, `'2023-06-20 10:58:22.201'`, `''`
        ].join(',');

        const repoValues = [
            `'github:GithubRepo:${connectionId}:${boardId}'`, `'2023-06-21 14:14:02.955'`, `'2023-06-23 13:20:07.298'`, `''`, `''`, 1, `'DELETE_THIS'`, `'${repositoryName}'`, `''`, `''`, `'github:GithubAccount:${connectionId}:${creatorId}'`, 'JavaScript', '', '2023-06-22 14:55:08.063', '2023-06-22 14:55:08.063', 0
        ].join(',');

      const projectMappingValues = [
        `'${projectName}'`, `'boards'`, `'github:GithubRepo:${connectionId}:${boardId}'`, `'2022-01-20 10:58:22.201'`, `'2022-06-20 10:58:22.201'`, `'${projectName}'`, `''`, 1, `'DELETE_THIS'`
      ].join(',');

      const projectsValues = [
        `'${projectName}'`, `''`, `'2022-06-19 16:56:10.013'`, `'2022-06-19 16:56:10.013'`, `''`, `''`, 1, `'DELETE_THIS'`
      ].join(',');

        const boardStatement = `INSERT INTO boards (${boardCols}) \nvalues (${boardValues});\n\n`;
        const repoStatement = `INSERT INTO repos (${repoCols}) \nvalues (${repoValues});\n\n`;
        const projectMappingStatement = `INSERT INTO project_mapping (${projectMappingCols}) \nvalues (${projectMappingValues});\n\n`;
        const projectsStatement = `INSERT INTO projects (${projectsCols}) \nvalues (${projectsValues});\n\n`;

        fileStream.write(boardStatement);
        fileStream.write(repoStatement);
        fileStream.write(projectMappingStatement);
        fileStream.write(projectsStatement);

        for(let i = 0; i < numberOfIssues; i++) {
            const issueId = `${issueType}:${connectionId}:${startingIssueId + i}`;
            const rawDataParams = `{"ConnectionId":${connectionId},"Name":"${repositoryName}"}`;
            const rawDataTable = '_raw_github_graphql_issues';
            const rawDataId = '46'; // not sure why
            const rawDataRemark = '';
            const url = `https://github.com/${repositoryName}/issues/${startingIssueId + i}`;
            const iconUrl = '';
            const issueKey = `${startingIssueKey + i}`;
            const title = `${issueTitle} ${i}`;
            const description = `${issueDesc} ${i}`;
            const epicKey = 'DELETE_THIS';
            const type = isIncident ? 'INCIDENT' : '';
            const date1 = new Date(createdDateString);
            const date2 = new Date(resolvedDateString);

            var differenceInMilliseconds = Math.abs(date2 - date1);
            var differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));

            const issueValues = [
                `'${issueId}'`, `'${createdDateString}'`, `'${createdDateString}'`, `'${rawDataParams}'`, `'${rawDataTable}'`, // 0-4
                `'${rawDataId}'`, `'${rawDataRemark}'`, `'${url}'`, `'${iconUrl}'`, `'${issueKey}'`, // 5-9
                `'${title}'`, `'${description}'`, `'${epicKey}'`, `'${type}'`, isResolved ? '\'DONE\'' : '\'TODO\'', // 10-14
                isResolved ? '\'CLOSED\'' : '\'OPEN\'', isResolved ? `'${resolvedDateString}'` : 'null', `'${createdDateString}'`, `'${createdDateString}'`, `''`, // 15-19
                `''`, '0', '0', '0', `'github:GithubAccount:${connectionId}:${creatorId}'`, // 20-24
                `'${creatorName}'`, `'github:GithubAccount:${connectionId}:${assigneeId}'`, `'${assigneeName}'`, `''`, `''`, // 25-29
                `${isResolved ? differenceInMinutes : 0}`, `''`, `''`, '0' // 29-34
            ].join(',')

            const boardIssueValues = [`'github:GithubRepo:${connectionId}:${boardId}'`, `'${issueId}'`, `'${createdDateString}'`, `'${createdDateString}'`, `'${rawDataParams}'`, `'${rawDataTable}'`, `'46'`, `'DELETE_THIS'`].join(',');

            const insertStatement = `INSERT INTO issues (${issueCols}) VALUES (${issueValues});\n\n`;
            const boardIssueStatement = `INSERT INTO board_issues (${boardIssueCols}) VALUES (${boardIssueValues});\n\n`;

            fileStream.write(insertStatement);
            fileStream.write(boardIssueStatement);
        }

        fileStream.end();

        console.log('Data has been written to output.txt');
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        rl.close();
    }
}

main();
