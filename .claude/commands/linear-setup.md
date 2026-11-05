---
description: One-time setup of the Commute Agents Linear project from plan/lessons.md.
---

Create the Linear project and issues for this course. Run once. Re-running is safe: it
skips anything that already exists.

1. **Check the workspace.** `list_teams` must show team **PWL** (workspace
   pwlae-personal-blog). If it doesn't, stop and tell the owner to reconnect the Linear
   connector to that workspace. Never create these issues anywhere else.
2. **Project.** In team PWL, find or create project **commute-agents**:
   "Commute Agents: agentic engineering for product engineers, one commute at a time.
   Site: https://pwlae.github.io/commute-agents/ · Repo: https://github.com/pwlae/commute-agents".
3. **Issues.** For every lesson in `curriculum.json` that has no `lessons/<id>.html`, and
   for each setup issue in `plan/lessons.md`, find or create one issue (search the
   project for `[<id>]` first):
   - Title: `Lesson: <title> [<id>]` (setup issues: `Setup: <title> [<id>]`).
   - Description: the lesson's section from `plan/lessons.md`, as written, followed by
     a line: `Lesson position in curriculum.json: <index>`.
   - State: Todo.
4. **Blockers**, after all issues exist: each lesson issue is blocked by the issues of
   the lessons in its `requires` that aren't written yet. Setup issues block the lessons
   their section names (`practice-system` blocks `reference-system`).
5. **Report** the project URL, the number of issues, and which ones are ready now
   (no open blockers).
