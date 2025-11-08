# CI/CD & Project Integration

Automations powered by GitHub Actions + GitHub Projects:
- Create an Issue automatically when a PR opens and link it to the PR
- Run tests on every PR
- Deploy automatically on merge to main
- Move the ticket to "Deployed" after a successful deployment

## Workflows
- .github/workflows/pr-create-issue.yml
- .github/workflows/ci.yml
- .github/workflows/deploy.yml
- .github/workflows/issue-labeled-to-pr.yml

## Setup (GitHub side)
1) Permissions
- Repo → Settings → Actions → General → Workflow permissions: enable Read and write permissions.

2) Repository Secrets (Settings → Secrets and variables → Actions)
- DOCKER_USERNAME, DOCKER_PASSWORD, REGISTRY
- DEPLOY_SERVER, DEPLOY_USER, DEPLOY_SSH_KEY, DEPLOY_PATH
- PROJECT_ID, STATUS_FIELD_ID, DEPLOYED_OPTION_ID
- Optional: PAT_FOR_API (if your org limits GITHUB_TOKEN for GraphQL APIs)

3) Add your GitHub Project (Projects V2)
- Ensure your Project has Status options: Todo, In Progress, Done, Deployed.
- Store IDs in secrets (see below) so the workflow can move items to Deployed.

## How to get Project IDs (GraphQL)
Use the GitHub GraphQL Explorer.

- Project ID by title:
```graphql
query($owner:String!, $number:Int!){
  organization(login:$owner){
    projectV2(number:$number){ id title }
  }
}
```

- Status field and option IDs:
```graphql
query($projectId:ID!){
  node(id:$projectId){
    ... on ProjectV2 {
      fields(first:50){ nodes { id name ... on ProjectV2SingleSelectField { options { id name } } } }
    }
  }
}
```
Set PROJECT_ID, STATUS_FIELD_ID (the Status field), and DEPLOYED_OPTION_ID (the "Deployed" option) as secrets.

## What happens end-to-end
- PR opened → pr-create-issue.yml creates an Issue, adds `Related-Issue: #NNN` to PR, and (if PROJECT_ID is set) adds the Issue to the Project.
- PR updated → ci.yml runs Frontend + Backend tests on the PR.
- Merge to main → deploy.yml builds and pushes images, deploys via SSH with docker-compose, then:
  - Comments on the related Issue and adds label deployed
  - Updates your Project item’s Status to Deployed (if IDs provided)
- Issue ↔ PR labels → issue-labeled-to-pr.yml mirrors Issue labels to the linked PR.

## Notes
- Frontend tests run from `Frontend/`.
- Backend tests use Postgres service in CI (DB=eclinic_test).

## Troubleshooting
- Project status didn’t update: ensure PROJECT_ID, STATUS_FIELD_ID, DEPLOYED_OPTION_ID are set and GITHUB_TOKEN/PAT permits Project mutations.
- Deploy failed: verify SSH connectivity, DEPLOY_PATH, and docker-compose on the server.
- Images not found on server: ensure REGISTRY is correct and server can pull images.

## Security
- Never hardcode tokens in the repo. Keep credentials only in GitHub Secrets.
