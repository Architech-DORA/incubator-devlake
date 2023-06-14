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
// @Router /plugins/kube_deployment/fallback
func FallbackEndpoint(input *plugin.ApiResourceInput) (*plugin.ApiResourceOutput, errors.Error) {
	body := KubeDeploymentTestConnResponse{}
	body.Success = true
	body.Message = "success"
	body.Connection = nil
	return &plugin.ApiResourceOutput{Body: body, Status: 200}, nil

}
