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

package api

import (
	"github.com/apache/incubator-devlake/core/errors"
	"github.com/apache/incubator-devlake/core/plugin"
)

// @Summary Fallback kube_deployment api endpoint
// @Description Fallback kube_deployment api endpoint
// @Tags plugins/kube_deployment/fallback
// @Param body body models.KubeConn true "json body"
// @Success 200  {object} KubeDeploymentTestConnResponse "Success"
// @Failure 400  {string} errcode.Error "Bad Request"
// @Failure 500  {string} errcode.Error "Internal Error"
// @Router /plugins/kube_deployment/fallback [POST]
func FallbackEndpoint(input *plugin.ApiResourceInput) (*plugin.ApiResourceOutput, errors.Error) {
	body := KubeDeploymentTestConnResponse{}
	body.Success = true
	body.Message = "success"
	body.Connection = nil
	return &plugin.ApiResourceOutput{Body: body, Status: 200}, nil

}
