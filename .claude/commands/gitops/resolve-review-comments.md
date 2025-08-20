# Resolve GitHub PR Review Comment

---
description: Resolve GitHub PR Review Comment
argument-hint: <comment_id or comment url> [--resolve]
---

This guide explains how to resolve a specific review comment on a GitHub Pull Request. Ask for user confirmation (YES/NO) before applying the changes to the source code file.

If $ARGUMENTS contains `--resolve`, the comment will be resolved after replying.

## Steps

1. **Extract comment id**

    Extract comment id from $ARGUMENTS if not directly specified.

    - The comment ID can be found in the PR comment URL: `https://github.com/{owner}/{repo}/pull/{pr_number}#discussion_r{comment_id}`

2. **Check the specific comment**

    ```bash
    gh api repos/{owner}/{repo}/pulls/comments/{comment_id}
    ```
    Example:
    ```bash
    gh api repos/nakamasato/github-actions-practice/pulls/comments/2196280386
    ```

3. **Read and check the relevant codes**

    - Read the comment and suggestion.
    - Check the relevant codes.
    - Think deeply whether to follow the suggestion.

4. **Fix the issue**

    - Make the necessary code changes based on the review feedback
    - Ensure the fix addresses the reviewer's concerns

5. **Commit and push**

    - Stage your changes
    - Create a descriptive commit message
    - Push to the feature branch

6. **Reply to the comment**

    ```bash
    gh api -X POST repos/{owner}/{repo}/pulls/{pr_number}/comments/{comment_id}/replies \
        -f body="Fixed in commit {commit_sha}. {description_of_fix}"
    ```

    If fixed, please reply with commit link:

    Example:
    ```bash
    gh api -X POST repos/nakamasato/github-actions-practice/pulls/2239/comments/2196280386/replies \
        -f body="Fixed in commit 2b36629. The redundant existence check has been removed since main() already validates the metadata file."
    ```
    Otherwise, just reply to the comment.

7. **Resolve the review comment only if specified --resolve**

    Resolve the review comment only when `--resolve` option is specified in $ARGUMENTS.

    First, get the thread ID:
    ```bash
    gh api graphql -f query='
    query {
        repository(owner: "{owner}", name: "{repo}") {
        pullRequest(number: {pr_number}) {
            reviewThreads(first: 50) {
            nodes {
                id
                isResolved
                comments(first: 1) {
                nodes {
                    id
                    body
                }
                }
            }
            }
        }
        }
    }'
    ```

    Then resolve the thread:
    ```bash
    gh api graphql -f query='
    mutation {
        resolveReviewThread(input: {threadId: "{thread_id}"}) {
        thread {
            isResolved
        }
        }
    }'
    ```

    Example:
    ```bash
    gh api graphql -f query='
    mutation {
        resolveReviewThread(input: {threadId: "PRRT_kwDOOybamM5TqrEt"}) {
        thread {
            isResolved
        }
        }
    }'
    ```

## Notes

- The comment ID can be found in the PR comment URL: `https://github.com/{owner}/{repo}/pull/{pr_number}#discussion_r{comment_id}`
- Thread IDs are different from comment IDs and must be retrieved via GraphQL
- Only users with write access can resolve review threads
- The thread will be automatically marked as resolved when using the GraphQL mutation