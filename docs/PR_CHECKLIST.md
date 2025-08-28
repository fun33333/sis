# Pull Request Checklist


Use this checklist before submitting or merging a PR.


## Before creating PR (author)
- [ ] Branch from `dev` (or the branch specified by the task)
- [ ] Branch name follows convention: `feature/<issue#>-short-desc` or `fix/<issue#>-short-desc`
- [ ] Added/updated `README` or docs when behavior changes
- [ ] Added/updated tests for new logic (unit/integration)
- [ ] Updated `backend/requirements.txt` or `frontend/package.json` if dependencies changed
- [ ] Ran linting and formatting locally (ESLint/Prettier, black/isort)
- [ ] Verified the service runs locally with `docker-compose up --build` (if applicable)
- [ ] Confirmed sensitive keys are not committed


## When creating PR
- [ ] Title follows conventional commits style (e.g. `feat(auth): add login endpoint`)
- [ ] Description explains intent, how to test, and linked issue number
- [ ] Add reviewer(s) and appropriate labels (area/frontend, area/backend, infra)


## For reviewers
- [ ] Tests pass (CI)
- [ ] Code is readable and follows style guidelines
- [ ] No secrets leaked in diffs
- [ ] Ensure migrations are safe and documented
- [ ] Approve or request changes with clear comments


## After merge
- [ ] Delete the branch (squash merge preferred)
- [ ] Verify staging deployment (if applicable)