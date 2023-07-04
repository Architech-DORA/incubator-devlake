const fs = require('fs');
const {faker} = require('@faker-js/faker')


let sql = `INSERT INTO issues (id,
                               created_at,
                               updated_at,
                               _raw_data_params,
                               _raw_data_table,
                               _raw_data_id,
                               _raw_data_remark,
                               url,
                               icon_url,
                               issue_key,
                               title,
                               description,
                               epic_key,
                               type,
                               status,
                               original_status,
                               resolution_date,
                               created_date,
                               updated_date,
                               parent_issue_id,
                               priority,
                               original_estimate_minutes,
                               time_spent_minutes,
                               time_remaining_minutes,
                               creator_id,
                               creator_name,
                               assignee_id,
                               assignee_name,
                               severity,
                               component,
                               lead_time_minutes,
                               original_project,
                               original_type,
                               story_point)
           VALUES `;

const length = 200;

for (let i = 1; i <= length; i++) {
  const createdAt = faker.date.past().toISOString().slice(0, 19).replace('T', ' ');
  const updatedAt = faker.date.recent().toISOString().slice(0, 19).replace('T', ' ');

  sql += `
    (
        'jira:JiraIssues:1:${10000 + i}',
        '${createdAt}',
        '${updatedAt}',
        'raw_data_params_${i}',
        'raw_data_table_${i}',
        '${i}',
        'raw_data_remark_${i}',
        '${faker.internet.url()}',
        '${faker.image.url()}',
        'JIRA-${i}',
        '${faker.lorem.sentence()}',
        '${faker.lorem.paragraph()}',
        'EPIC-${i}',
        '${faker.string.fromCharacters(["REQUIREMENT", "BUG", "INCIDENT"])}',
        '${faker.string.fromCharacters(["TODO", "IN_PROGRESS", "DONE"])}',
        '${faker.string.fromCharacters(["Open", "In Progress", "Resolved", "Closed"])}',
        '${faker.date.future().toISOString().slice(0, 19).replace('T', ' ')}',
        '${createdAt}',
        '${updatedAt}',
        NULL,
        '${faker.string.fromCharacters(["Low", "Medium", "High"])}',
        ${faker.number.bigInt({min: 60, max: 240})},
        ${faker.number.bigInt({min: 30, max: 120})},
        ${faker.number.bigInt({min: 30, max: 120})},
        'user${faker.number.bigInt({min: 1, max: 10})}',
        '${faker.person.firstName().replace("'", "\\'")} ${faker.name.lastName().replace("'", "\\'")}',
        'user${faker.number.bigInt({min: 1, max: 10})}',
        '${faker.person.firstName().replace("'", "\\'")} ${faker.name.lastName().replace("'", "\\'")}',
        '${faker.string.fromCharacters(["Minor", "Major", "Critical"])}',
        'Component${faker.number.bigInt({min: 1, max: 10})}',
        ${faker.number.bigInt({min: 30, max: 120})},
        'Project${faker.number.bigInt({min: 1, max: 10})}',
        '${faker.string.fromCharacters(["Story", "Bug", "Epic"])}',
        ${faker.number.bigInt({min: 1, max: 10})}
    )${i < length ? ',' : ';'}`
}

fs.writeFileSync('insert_issues.sql', sql);
console.log(`${length} rows of issue data generated!`);
