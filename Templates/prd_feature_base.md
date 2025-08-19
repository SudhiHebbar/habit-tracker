name: "Base Feature Template - Context-Rich with Validation Loops"
description: |

## Purpose
Template optimized for AI agents to implement features with sufficient context and self-validation capabilities to achieve working code through iterative refinement.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules**: Be sure to follow all rules in CLAUDE.md

---

## Goal
[What needs to be built - be specific about the end state and desires agains the current state]

## Why
- [Business value and user impact]
- [Integration with existing features]
- [Problems this solves and for whom]

## What
[User-visible behavior and technical requirements]

### Success Criteria
- [ ] [Specific measurable outcomes]

## Tech Stack
- [Layer]: [Technology list]

Note: Include the research based technology stack

## Functional Requirements
- [List of functional scopes]

## Non-Functional Requirements
- [List of non-fucntional socpe]

## Technical Requirements
- [Based on the technology stack and other implementation aspects]

## Data Requirements
- [Detailed Database schema for each of the entity]

## UX Requirements
- [Detailed UX requirements based on the research following modern design approach and standards, unless something specified by the user]

## Core Entities
### [Entity_#_Name]

- [Key responsibilities]
- [Business rules]
- [Constraints or invariants]

## Stories
- [For each of the epic, containing epicID and short description define the stories]

### User Stories
- User Stories, complete with:  
  * User Story ID  
  * Full story format: "As a..., I want..., so that..."  
  * Acceptance Criteria

Note: 
- If a user story requires more than 20 hours of effort, break it down into smaller, more manageable stories.
- Document every functional and  non-functional requirement as a detailed user story and map it to an Epic.
- Ensure that data requirements and core entities are considered during the user story creation process.
- If the codebase URL is not provided, create user stories for creation of new project based on the technical stack and organize them under the Technical Epic.
- Clearly define acceptance criteria for each user story, ensuring they are specific, measurable, and testable.
Regularly review and refine user stories to maintain relevance and accuracy throughout the project lifecycle.

Format:
```yaml
### Epic: \<Title\> for each epic.  
* Under each epic, add all the stories associated to the epic:  
  * #### User Story: <ID>  
  * [Story to be populated]
      Acceptance Criteria:[]
      
```
## Risks & Mitigations
- [Limit this to the scope of Functional and Non-Functional Requirements only]

## Constraints & Assumptions
- [Rationale, limited to Functional and Non-Functional Requirements scope only]

## All Needed Context

### Documentation & References (list all context needed for planning)
```yaml
# MUST READ - Include these in your context window
- url: [Official API docs URL]
  why: [Specific sections/methods you'll need]
  
- file: [path/to/example.py]
  why: [Pattern to follow, gotchas to avoid]
  
- doc: [Library documentation URL] 
  section: [Specific section about common pitfalls]
  critical: [Key insight that prevents common errors]

- docfile: [PRPs/ai_docs/file.md]
  why: [docs that the user has pasted in to the project]

```
## Areas for Potential Improvement  
- [List specific, actionable suggestions for improvement, if any.]