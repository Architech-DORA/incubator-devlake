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

package helper

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"

	"github.com/Azure/azure-sdk-for-go/profiles/latest/containerservice/mgmt/containerservice"
	"github.com/Azure/go-autorest/autorest/azure/auth"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
)

type KubeApiClient struct {
	ClientSet *kubernetes.Clientset
}

func (k *KubeApiClient) TestConnection() error {
	fmt.Println("TestConnection from Kube API Client")
	return nil
}

func NewKubeApiClient(credentials map[string]interface{}) *KubeApiClient {
	println("credentials: ", credentials)
	jsonData, _ := json.Marshal(credentials)
	fmt.Println(string(jsonData))
	fmt.Println(credentials["accessKey"])
	providerType, ok := credentials["providerType"].(string)

	if providerType == "" || !ok {
		err := errors.New("providerType is not defined")
		panic(err)
	}

	var kubeApiClient *kubernetes.Clientset

	if providerType == "azure" {
		fmt.Println("Create Azure Kube Client")
		fmt.Println("providerType: ", providerType)
		clientID := credentials["clientId"].(string)
		fmt.Println("clientID: ", clientID)
		kubeApiClient = createAzureClientConfig(credentials)
	} else if providerType == "local" {
		fmt.Println("Create Local Kube Client")
		kubeApiClient = createClientConfig()
	}

	return &KubeApiClient{
		ClientSet: kubeApiClient,
	}
}

func createAzureClientConfig(creds map[string]interface{}) *kubernetes.Clientset {
	clientID := creds["clientId"].(string)
	clientSecret := creds["clientSecret"].(string)
	tenantID := creds["tenantId"].(string)
	subscriptionID := creds["subscriptionId"].(string)
	clusterName := creds["clusterName"].(string)
	resourceGroupName := creds["resourceGroupName"].(string)
	fmt.Println("clientID: ", clientID)
	fmt.Println("clientSecret: ", clientSecret)
	fmt.Println("tenantID: ", tenantID)
	fmt.Println("subscriptionID: ", subscriptionID)
	fmt.Println("clusterName: ", clusterName)
	fmt.Println("resourceGroupName: ", resourceGroupName)

	authorizer, err := auth.NewClientCredentialsConfig(clientID, clientSecret, tenantID).Authorizer()
	if err != nil {
		panic(err.Error())
	}

	client := containerservice.NewManagedClustersClient(subscriptionID)

	client.Authorizer = authorizer

	credentials, err := client.ListClusterAdminCredentials(context.Background(), resourceGroupName, clusterName, "")
	if err != nil {
		panic(err.Error())
	}
	kubeConfigs := *credentials.Kubeconfigs
	fmt.Println(string(*kubeConfigs[0].Value))
	if len(kubeConfigs) == 0 {
		panic("empty kube config")
	}
	log.Println("Azure data", "Kubeconfigs", string(*kubeConfigs[0].Value))
	kubeconfigAZ := *kubeConfigs[0].Value

	clientConfig, err := clientcmd.NewClientConfigFromBytes(kubeconfigAZ)
	config, _ := clientConfig.ClientConfig()

	if err != nil {
		panic(err)
	}

	clientSet, err := kubernetes.NewForConfig(config)
	if err != nil {
		panic(err)
	}

	return clientSet
}

func createClientConfig() *kubernetes.Clientset {

	kubeconfig := "/Users/johnpaulbelga/.kube/config"

	// Build the client config from the kubeconfig file
	config, err := clientcmd.BuildConfigFromFlags("", kubeconfig)
	if err != nil {
		panic(err)
	}

	// Create the clientset
	clientSet, err := kubernetes.NewForConfig(config)
	if err != nil {
		panic(err)
	}

	return clientSet
}
