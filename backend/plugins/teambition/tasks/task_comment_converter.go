/*
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements.  See the NOTICE file distributed with
this work for additional information regarding copyright ownership.
The ASF licenses this file to You under the Apache License, Version 2.0
(the "License"); you may not use this file except in compliance with
the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package tasks

import (
	"encoding/json"
	"github.com/apache/incubator-devlake/core/dal"
	"github.com/apache/incubator-devlake/core/errors"
	"github.com/apache/incubator-devlake/core/models/domainlayer"
	"github.com/apache/incubator-devlake/core/models/domainlayer/ticket"
	"github.com/apache/incubator-devlake/core/plugin"
	helper "github.com/apache/incubator-devlake/helpers/pluginhelper/api"
	"github.com/apache/incubator-devlake/plugins/teambition/models"
	"reflect"
)

var ConvertTaskCommentsMeta = plugin.SubTaskMeta{
	Name:             "convertTaskComments",
	EntryPoint:       ConvertTaskComments,
	EnabledByDefault: true,
	Description:      "convert teambition task comments",
	DomainTypes:      []string{plugin.DOMAIN_TYPE_TICKET},
}

func ConvertTaskComments(taskCtx plugin.SubTaskContext) errors.Error {
	rawDataSubTaskArgs, data := CreateRawDataSubTaskArgs(taskCtx, RAW_TASK_ACTIVITY_TABLE)
	db := taskCtx.GetDal()
	logger := taskCtx.GetLogger()
	logger.Info("convert project:%v task comments", data.Options.ProjectId)
	clauses := []dal.Clause{
		dal.From(&models.TeambitionTaskActivity{}),
		dal.Where("connection_id = ? AND project_id = ? AND action = ?", data.Options.ConnectionId, data.Options.ProjectId, "comment"),
	}

	cursor, err := db.Cursor(clauses...)
	if err != nil {
		return err
	}
	defer cursor.Close()
	converter, err := helper.NewDataConverter(helper.DataConverterArgs{
		RawDataSubTaskArgs: *rawDataSubTaskArgs,
		InputRowType:       reflect.TypeOf(models.TeambitionTaskActivity{}),
		Input:              cursor,
		Convert: func(inputRow interface{}) ([]interface{}, errors.Error) {
			userTool := inputRow.(*models.TeambitionTaskActivity)
			issueComment := &ticket.IssueComment{
				DomainEntity: domainlayer.DomainEntity{
					Id: getTaskActivityIdGen().Generate(data.Options.ConnectionId, userTool.Id),
				},
				IssueId:     getTaskIdGen().Generate(userTool.ConnectionId, userTool.TaskId),
				AccountId:   getAccountIdGen().Generate(userTool.ConnectionId, userTool.CreatorId),
				CreatedDate: userTool.CreateTime.ToTime(),
			}
			comment := &models.TeambitionTaskComment{}
			err := json.Unmarshal([]byte(userTool.Content), comment)
			if err != nil {
				return nil, errors.Convert(err)
			}
			issueComment.Body = comment.Comment
			return []interface{}{
				issueComment,
			}, nil
		},
	})

	if err != nil {
		return err
	}

	return converter.Execute()
}
