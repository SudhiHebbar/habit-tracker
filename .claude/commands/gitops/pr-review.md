    # Pull Request Code Review
    ---
    description: Perform a comprehensive code review for a given Pull Request.
    argument-hint: <pull_request_number_or_url>
    ---
    Please analyze the Pull Request at $ARGUMENTS for the following aspects:

    ## Review Checklist:
    1.  **Code Quality:** Check for clean code, adherence to coding standards, and best practices.
    2.  **Functionality:** Verify if the changes address the intended problem and introduce no regressions.
    3.  **Test Coverage:** Assess the presence and quality of unit and integration tests.
    4.  **Performance:** Identify potential performance bottlenecks.
    5.  **Security:** Look for any security vulnerabilities or insecure practices.
    6.  **Documentation:** Check if code comments and documentation are clear and up-to-date.
    7.  **Maintainability:** Evaluate the ease of understanding and modifying the code in the future.

    ## Steps:
    1.  Use `gh pr view $ARGUMENTS --json files,commits,reviews,body,title` to retrieve detailed information about the PR.
    2.  Analyze the changes in each file, focusing on the checklist points above.
    3.  Provide constructive feedback, suggesting improvements and identifying potential issues.
    4.  Summarize the review findings and suggest a clear recommendation (e.g., "Approve," "Request Changes," "Comment Only").