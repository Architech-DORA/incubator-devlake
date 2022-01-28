package tasks

import (
	"github.com/merico-dev/lake/config"
	lakeModels "github.com/merico-dev/lake/models"
	githubModels "github.com/merico-dev/lake/plugins/github/models"
	"regexp"
	"strings"
)

var issueSeverityRegex *regexp.Regexp
var issueComponentRegex *regexp.Regexp
var issuePriorityRegex *regexp.Regexp
var issueTypeBugRegex *regexp.Regexp
var issueTypeRequirementRegex *regexp.Regexp
var issueTypeIncidentRegex *regexp.Regexp

func init() {
	var issueSeverity = config.V.GetString("GITHUB_ISSUE_SEVERITY")
	var issueComponent = config.V.GetString("GITHUB_ISSUE_COMPONENT")
	var issuePriority = config.V.GetString("GITHUB_ISSUE_PRIORITY")
	var issueTypeBug = config.V.GetString("GITHUB_ISSUE_TYPE_BUG")
	var issueTypeRequirement = config.V.GetString("GITHUB_ISSUE_TYPE_REQUIREMENT")
	var issueTypeIncident = config.V.GetString("GITHUB_ISSUE_TYPE_INCIDENT")
	if len(issueSeverity) > 0 {
		issueSeverityRegex = regexp.MustCompile(issueSeverity)
	}
	if len(issueComponent) > 0 {
		issueComponentRegex = regexp.MustCompile(issueComponent)
	}
	if len(issuePriority) > 0 {
		issuePriorityRegex = regexp.MustCompile(issuePriority)
	}
	if len(issueTypeBug) > 0 {
		issueTypeBugRegex = regexp.MustCompile(issueTypeBug)
	}
	if len(issueTypeRequirement) > 0 {
		issueTypeRequirementRegex = regexp.MustCompile(issueTypeRequirement)
	}
	if len(issueTypeIncident) > 0 {
		issueTypeIncidentRegex = regexp.MustCompile(issueTypeIncident)
	}
}

func EnrichGithubIssues() (err error) {
	githubIssue := &githubModels.GithubIssue{}
	cursor, err := lakeModels.Db.Model(&githubIssue).Rows()
	if err != nil {
		return err
	}
	defer cursor.Close()
	// iterate all rows
	for cursor.Next() {
		err = lakeModels.Db.ScanRows(cursor, githubIssue)
		if err != nil {
			return err
		}
		githubIssue.Severity = ""
		githubIssue.Component = ""
		githubIssue.Priority = ""
		githubIssue.Type = ""

		var issueLabels []string

		err = lakeModels.Db.Table("github_issue_labels").
			Where("issue_id = ?", githubIssue.GithubId).
			Pluck("`label_name`", &issueLabels).Error
		if err != nil {
			return err
		}

		for _, issueLabel := range issueLabels {
			setIssueLabel(issueLabel, githubIssue)
		}

		err = lakeModels.Db.Save(githubIssue).Error
		if err != nil {
			return err
		}
	}
	return nil
}

func setIssueLabel(label string, githubIssue *githubModels.GithubIssue) {
	if issueSeverityRegex != nil {
		groups := issueSeverityRegex.FindStringSubmatch(label)
		if len(groups) > 0 {
			githubIssue.Type = groups[1]
			return
		}
	}

	if issueComponentRegex != nil {
		groups := issueComponentRegex.FindStringSubmatch(label)
		if len(groups) > 0 {
			githubIssue.Component = groups[1]
			return
		}
	}

	if issuePriorityRegex != nil {
		groups := issuePriorityRegex.FindStringSubmatch(label)
		if len(groups) > 0 {
			githubIssue.Priority = strings.ToUpper(groups[1][0:1]) + groups[1][1:]
			return
		}
	}

	if issueTypeBugRegex != nil {
		if ok := issueTypeBugRegex.MatchString(label); ok {
			githubIssue.Type = "BUG"
			return
		}
	}

	if issueTypeRequirementRegex != nil {
		if ok := issueTypeRequirementRegex.MatchString(label); ok {
			githubIssue.Type = "REQUIREMENT"
			return
		}
	}

	if issueTypeIncidentRegex != nil {
		if ok := issueTypeIncidentRegex.MatchString(label); ok {
			githubIssue.Type = "INCIDENT"
			return
		}
	}
}
