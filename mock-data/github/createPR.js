/*
RUN:
  node createPR.js

This generates a file named "pr-output.txt" with the SQL commands to insert the mock data.
You can just click enter on all questions and use the default answers.


# cleanup
DELETE FROM boards WHERE boards._raw_data_remark = 'DELETE_THIS';
DELETE FROM pull_requests WHERE issues.epic_key = 'DELETE_THIS';
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

const TYPES = {
    GITHUB: 'github:GithubIssue'
    // other types later
}

async function main() {
    try {
        const fileStream = fs.createWriteStream('output-pr.sql');
        const createdDate = new Date(2023, 0, 23, 11, 9, 20, 916);
        const mergeDate = new Date(2023, 0, 27, 11, 11, 20, 916);

        const count = 4
        const baseId = 1403983009
        const baseKey = 109
        const defaultBoardId = '57135124';
        const defaultRepoName = 'githubuser/newrepo'
        const defaultIsMerged = 'true'
        const defaultIsClosed = 'true'
        const defaultUser = 'githubuser3'
        const defaultUserId = '888881'


        const defaultCreatedDateString = `${createdDate.getFullYear()}-${createdDate.getMonth() + 1}-${createdDate.getDate()} ${createdDate.getHours()}:${createdDate.getMinutes()}:${createdDate.getSeconds()}.${createdDate.getMilliseconds()}`;
        const defaultMergedDateString = `${mergeDate.getFullYear()}-${mergeDate.getMonth() + 1}-${mergeDate.getDate()} ${mergeDate.getHours()}:${mergeDate.getMinutes()}:${mergeDate.getSeconds()}.${mergeDate.getMilliseconds()}`;

        const boardId = await question('Enter your board id eg. "506666443"', defaultBoardId);
        const numberOfIssues = await question('Enter the number of issues ', 1);
        const connectionId = await question('Enter your connection id ', 1);
        const repositoryName = await question('Enter your repository name eg. "nodejs/node" ', defaultRepoName);

        const startingId = await question('Enter your starting github PR id eg. "1783828" ', `${baseId + count}`);
        const startingKey = await question('Enter your starting github PR key eg. "100" ', `${baseKey + count}`);
        const prTitle = await question('Enter your title ', 'PR Title');
        const prDesc = await question('Enter your description ', 'PR Description');
        const createdDateString = await question('Enter the created date ', defaultCreatedDateString);
        let mergedDate = null
        let closedDate = null

        const isMerged = (await question('Is the PR merged? ', defaultIsMerged)) === 'true';
        let isClosed;
        if (isMerged) {
            mergedDate = await question('Enter the merged date ', defaultMergedDateString);
        } else {
            isClosed = await question('Is the PR closed? ', defaultIsClosed) === 'true';
        }
        if (isClosed) {
            closedDate = await question('Enter the closed date ', defaultMergedDateString);
        }

        const creatorId = await question('Enter your creator id ["id" from "_tool_github_accounts" like "8603391"] ', defaultUserId); // eg. "1"
        const creatorName = await question('Enter your creator name ["name" from "_tool_github_accounts"] ', defaultUser); // eg. "John Doe"

        const boardCols = 'id, created_at, updated_at, _raw_data_params, _raw_data_table, _raw_data_id, _raw_data_remark, name, description, url, created_date, type';
        const repoCols = 'id, created_at, updated_at, _raw_data_params, _raw_data_table, _raw_data_id, _raw_data_remark, name, url, description, owner_id, language, forked_from, created_date, updated_date, deleted';

        const boardValues = [
            `'github:GithubRepo:${connectionId}:${boardId}'`, `'2023-06-20 10:58:22.201'`, `'2023-06-20 10:58:22.201'`, `''`, `''`, 1, `'DELETE_THIS'`, `'${repositoryName}'`, `''`, `'https://github.com/${repositoryName}/issues'`, `'2023-06-20 10:58:22.201'`, `''`
        ].join(',')

        const repoValues = [
            `'github:GithubRepo:${connectionId}:${boardId}'`, `'2023-06-21 14:14:02.955'`, `'2023-06-23 13:20:07.298'`, `''`, `''`, 1, `'DELETE_THIS'`, `'${repositoryName}'`, `''`, `''`, `'github:GithubAccount:${connectionId}:${creatorId}'`, `'JavaScript'`, `''`, `'2023-06-22 14:55:08.063'`, `'2023-06-22 14:55:08.063'`, 0
        ].join(',')

        const boardStatement = `INSERT INTO boards (${boardCols}) values (${boardValues});\n\n`;
        const repoStatement = `INSERT INTO repos (${repoCols}) values (${repoValues});\n\n`;

        fileStream.write(boardStatement);
        fileStream.write(repoStatement);

        const prCols = [
            'id', 'created_at', 'updated_at', '_raw_data_params', '_raw_data_table', // 0-4
            '_raw_data_id', '_raw_data_remark', 'base_repo_id', 'head_repo_id', 'status', // 5-9
            'title', 'description', 'url', 'author_name', 'author_id', // 10-14
            'parent_pr_id', 'pull_request_key', 'created_date', 'merged_date', 'closed_date', // 15-19
            'type', 'component', 'merge_commit_sha', 'head_ref', 'base_ref', // 20-24
            'base_commit_sha', 'head_commit_sha' // 25-26
        ].join(',');

        for(let i = 0; i < numberOfIssues; i++) {
            const issueId = `github:GithubPullRequest:${connectionId}:${startingId + i}`;
            const rawDataParams = `{"ConnectionId":${connectionId},"Name":"${repositoryName}"}`
            const rawDataTable = '_raw_github_graphql_prs';
            const rawDataId = `43`; // ??
            const baseRepoId = `github:GithubRepo:${connectionId}:${boardId}`;
            const rawDataRemark = 'DELETE_THIS';
            const headRepoId = 'github:GithubRepo:1:0';
            const status = isMerged ? 'MERGED' : (isClosed ? 'CLOSED' : 'OPEN');
            const url = `https://github.com/${repositoryName}/pull/${startingKey + i}`;

            const prValues = [
                `'${issueId}'`, `'${createdDateString}'`, `'${createdDateString}'`, `'${rawDataParams}'`, `'${rawDataTable}'`, // 0-4
                `'${rawDataId}'`, `'${rawDataRemark}'`, `'${baseRepoId}'`, `'${headRepoId}'`, `'${status}'`, // 5-9
                `'${prTitle + i}'`, `'${prDesc + i}'`, `'${url}'`, `'${creatorName}'`, `'${creatorId}'`, // 10-14
                `''`, startingKey + i, `'${createdDateString}'`, mergedDate ? `'${mergedDate}'` : 'null', closedDate ? `'${closedDate}'` : 'null', // 15-19
                `''`, `''`, `''`, `'feat/asdf${i}'`, `'master'`, // 20-24
                `'alsdfjakljdfljsakl'`, `'asldfkasldkfjskd'` // 25-26
            ].join(',')

            const insertStatement = `INSERT INTO pull_requests (${prCols}) \nVALUES (${prValues});\n\n`;

            fileStream.write(insertStatement);
        }

        fileStream.end();

        console.log('Data has been written to pr-output.txt');
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        rl.close();
    }
}

main();
