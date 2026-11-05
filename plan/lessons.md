# Lesson plan

One section per lesson that isn't written yet, in curriculum order. Each section
becomes one Linear issue (see `.claude/commands/linear-setup.md`). Blockers follow
`requires` in `curriculum.json`. Fact ideas are leads, not finished facts: the writer
checks each one against a primary source before using it, and swaps it if it can't be
confirmed.

Parts 2 and 3 lessons add an optional **At your laptop** step (see CLAUDE.md).

---

## Setup issues (not lessons)

### practice-system: Build the practice system for Part 3
Blocks: reference-system.
A separate public repo (working name `commute-agents-shop`) that runs locally with one
`docker compose up`: a gateway, 2–3 services in different styles (e.g. orders, payments,
inventory), Kafka, an order saga with compensation, 2–3 Postgres databases with migration
history, deliberately messy logs, Prometheus + Grafana with a few dashboards and alerts.
Seeded with realistic "legacy" quirks and unwritten conventions (a shared HTTP client
library the team must use, naming rules, an idempotency-key rule). Comes with a list of
small tickets and planted bugs for Part 3 lessons to use. Must run on a 16 GB laptop.

---

## Part 1 · The model

### tokens: Tokens and the context window
- Scope: what a token is (pieces of words, ~¾ of an English word), why limits and prices
  are in tokens, input vs output tokens, context window as the model's whole working
  memory, why code and non-English text use more tokens. Counting tokens with the API.
- Predict ideas: why a model miscounts letters in a word; why a long JSON log costs more
  than its character count suggests; what happens when the conversation is longer than
  the window.
- At work: estimate the token size of your repo's key files; spot the biggest token
  consumers in an agent session.
- Fact idea: "SolidGoldMagikarp" glitch tokens (Rumbelow and Watkins, 2023), or the
  letter-counting failures caused by tokenisation.

### sampling: How the next token is chosen
- Scope: the model outputs probabilities for every possible next token; sampling picks
  one; temperature and top-p in plain words; why the same prompt gives different answers;
  why many newer APIs no longer let you set temperature (check current docs).
- Predict ideas: running the same agent task twice gives two different diffs, which
  matters for tests; why "temperature 0" still isn't fully deterministic.
- At work: never assume one agent run is representative; run twice before judging.
- Fact idea: "temperature" is borrowed from statistical physics (the Boltzmann
  distribution).

### prefill-decode: Reading fast, writing slow
- Scope: prefill (reading the prompt, all tokens in parallel) vs decode (writing one token
  at a time); the KV cache in plain words; why output tokens cost more; time to first
  token vs tokens per second; why long answers are slow.
- Predict ideas: why a 100k-token prompt with a 50-token answer is fast but a 5k prompt
  with a 5k answer is slow; why output is priced ~5x input.
- At work: ask agents for short outputs (diffs, not whole files) when speed matters.
- Fact idea: speculative decoding (Leviathan et al., Google, 2022): a small model guesses
  several tokens and the big model checks them in one pass.

### thinking-effort: Thinking and effort levels
- Scope: reasoning tokens before the answer; adaptive thinking and effort levels;
  thinking is billed as output; when more effort helps (hard bugs, design) and when it
  wastes money (renames, formatting).
- Predict ideas: effort for a subagent that only greps files; why the bill doubled after
  switching effort to max for everything.
- At work: pick effort per task type; lower effort for helpers.
- Fact idea: "Let's think step by step" (Kojima et al., 2022) raised zero-shot arithmetic
  accuracy dramatically with one sentence.

## Part 1 · The harness

### agent-loop: An agent is a while loop
- Scope: model → tool call → harness runs it → result back into context → repeat until
  the model stops; the harness is ordinary code; Claude Code, Codex CLI and others are
  harnesses around a model. Show a ~20-line loop.
- Predict ideas: who actually runs `rm`, the model or the harness; why an agent "stops
  early" (it returned text instead of a tool call).
- At work: when someone says "agent factory", ask which loop runs and who starts it.
- Fact idea: ReAct (Yao et al., 2022) named the reason-then-act loop.

### tool-calls: Tool calls up close
- Scope: a tool is a name, a description and a JSON schema; the model writes JSON, the
  harness validates and runs it; results are just text in the context; good tool
  descriptions matter; parallel tool calls; errors returned as results.
- Predict ideas: a tool with a vague description gets misused; why a tool returning 50k
  lines of logs hurts the whole session.
- At work: review one tool or MCP server your team uses: is the output small and useful?
- Fact idea: Toolformer (Meta AI, 2023) taught a model to decide when to call APIs.

### context-management: Why long sessions get worse
- Scope: everything stays in context until removed; attention spreads thin over long
  contexts; compaction (summarising) and clearing old tool results; the cost of
  compaction (details are lost); starting fresh sessions on purpose.
- Predict ideas: the agent forgets an instruction from 2 hours ago; when to /clear vs
  compact; why a fresh session with a good brief beats a long one.
- At work: one task per session; write a short brief at the start.
- Fact idea: "Lost in the Middle" (Liu et al., 2023): models use facts at the start and
  end of long contexts better than in the middle.

### memory: Agent memory is just files
- Scope: models remember nothing between sessions; "memory" = files the harness loads
  into context (CLAUDE.md/AGENTS.md, memory folders), always-loaded vs loaded on demand;
  memory costs tokens on every request; stale memory is worse than none.
- Predict ideas: a rule in memory the agent ignores (too long, buried); why a 2,000-line
  CLAUDE.md slows everything down.
- At work: trim your context file; move rarely needed detail into files loaded on demand.
- Fact idea: MemGPT (Packer et al., 2023) treated context like RAM and storage like disk.

### skills-mcp: Skills, MCP and plugins up close
- Scope: progressive disclosure: only short descriptions are always loaded, full skill
  text or tool schemas load when needed; MCP as a protocol between harness and tool
  servers; plugins as bundles; deferred tool loading; cost of 30 MCP servers.
- Predict ideas: why adding 15 MCP servers made the agent worse; a skill that never
  triggers (bad description).
- At work: audit installed MCP servers and skills; remove the unused ones.
- Fact idea: MCP was published by Anthropic in November 2024 as an open standard and was
  adopted by other AI companies within months (verify which and when).

### hooks-permissions: Hooks and permissions: rules that always run
- Scope: an instruction in a prompt is a request; a hook or permission rule is enforced
  by the harness every time; pre/post tool hooks; blocking commands; auto-format after
  edits; why guardrails belong in code.
- Predict ideas: "never edit migrations" in CLAUDE.md vs a hook that blocks it; a hook
  that runs the linter after each edit.
- At work: turn one rule you keep repeating to the agent into a hook.
- Fact idea: Git hooks and the pre-commit framework (started at Yelp, 2014).

### subagents: Subagents and orchestration
- Scope: a subagent = fresh context + a prompt + returns a summary; why: clean context,
  parallel work, cheaper models for reading; why narrow "persona" agents often get in the
  way; restrictions as permissions (read-only); "my agent runs agents" is the real answer.
- Predict ideas: a code-search subagent saves the main context; a "backend agent" refuses
  a one-line frontend fix; three parallel subagents edit the same file.
- At work: use subagents for searching and reviewing, not for job titles.
- Fact idea: Doug McIlroy's 1964 memo on pipes; the Unix "do one thing well" idea.

### headless: Running agents without you
- Scope: non-interactive mode, agent SDKs, CI jobs, schedules, webhooks; worktrees for
  parallel runs; permissions for unattended runs; logs and budgets. The "factory" is this.
- Predict ideas: an unattended run that waits forever for a permission prompt; two
  scheduled runs on the same branch.
- At work: run one agent task from a script with a fixed prompt and a time limit.
- Fact idea: cron, Unix's scheduler since the 1970s (verify version and year).

## Part 1 · Models and safety

### open-weights: Frontier vs open-weight models
- Scope: what "open weights" means (not open source data or code), licences, where open
  models are close to frontier and where they lag (long agentic tasks), privacy and
  cost reasons for using them.
- Predict ideas: is a model "open source" if you can download weights but not the
  training data; which tasks suit a small open model in your loop.
- At work: know your company's rules on which models may see which code.
- Fact idea: Meta's LLaMA weights leaked online within about a week of their limited
  research release in March 2023.

### local-gpu: Running a model on your own GPU
- Scope: memory ≈ parameters × bytes per parameter; quantisation (16-bit, 8-bit, 4-bit);
  KV cache grows with context; tokens per second and memory bandwidth; what fits on a
  24 GB card or a 64 GB laptop.
- Predict ideas: will a 70B model at 4-bit fit in 24 GB; why the same model gets slower
  with a long context.
- At work: estimate whether a model your team wants to self-host fits your hardware.
- Fact idea: llama.cpp (Georgi Gerganov, March 2023) ran LLaMA on a MacBook in plain C/C++.

### inference-economics: Why an API is usually cheaper
- Scope: decode is limited by memory bandwidth, so serving many users at once (batching)
  makes each token cheap; a local GPU sits idle most of the day; when self-hosting pays
  (privacy, huge steady volume).
- Predict ideas: your GPU at 3% use vs an API; why batch APIs are cheaper and slower.
- At work: compare cost per completed task, not per token.
- Fact idea: continuous batching from the Orca paper (Yu et al., OSDI 2022).

### evals: Evals: better or just different?
- Scope: an eval = fixed tasks + a way to grade; why one run proves nothing (sampling);
  small eval sets from your own tickets; grading by tests vs by a model; overfitting.
- Predict ideas: a new prompt "feels better" after 3 tries; a grader model that likes
  long answers.
- At work: keep 10 past tickets as a personal eval set for your setup.
- Fact idea: SWE-bench (Jimenez et al., Princeton, 2023) built from real GitHub issues;
  SWE-bench Verified (2024) a human-checked subset.

### prompt-injection: Prompt injection and the lethal trifecta
- Scope: text the agent reads can contain instructions; models can't reliably tell data
  from orders; the lethal trifecta (private data + untrusted content + a way to send data
  out); defences: remove one leg, permissions, sandboxing, human approval for risky tools.
- Predict ideas: an issue comment that tells the agent to post secrets; a web page
  fetched during research; which leg to cut for an on-call agent.
- At work: check your agent setups for all three legs at once.
- Fact idea: Simon Willison named "prompt injection" in September 2022 and the "lethal
  trifecta" in 2025.

## Part 2 · Your workbench

### task-workspace: One folder per task
- Scope: one folder per task with git worktrees of every repo it touches, a short task
  brief file, and its own agent session; why: clean context, parallel tasks, easy cleanup.
- Predict ideas: two tasks in one checkout; a cross-service bug needing three repos.
- At your laptop: script that creates a task folder with worktrees and a brief.
- At work: start your next ticket in its own folder.
- Fact idea: `git worktree` arrived in Git 2.5 (2015).

### scripts-first: Script first, one small agent step
- Scope: everything predictable (cloning, branching, running tests, formatting) is a
  script; the agent only does the part that needs judgment (e.g. which repos a ticket
  touches); cheap fast model for small steps; deterministic = repeatable and cheap.
- Predict ideas: letting an agent clone repos by itself vs a script; where judgment is
  really needed in triage.
- At your laptop: a triage step: a small model reads a ticket and outputs a JSON list of
  repos; a script does the rest.
- At work: find one multi-step routine you do by hand and script it.
- Fact idea: Make (Stuart Feldman, Bell Labs, 1976).

### context-files: Context files that earn their tokens
- Scope: what belongs in CLAUDE.md/AGENTS.md (commands, conventions, gotchas) and what
  doesn't (what the code already says); short and current; one per repo plus per task.
- Predict ideas: a context file that describes every folder; a rule the agent keeps
  breaking because it's on line 400.
- At your laptop: rewrite one repo's context file to under 100 lines.
- At work: add the three things a new joiner always gets wrong.
- Fact idea: AGENTS.md as a shared convention across agent tools (verify origin and date).

### unwritten-rules: Turn unwritten rules into checks
- Scope: the owner's story: an agent ignored the team's resilient third-party client
  library (circuit breaker, rate limits, retries) and hand-wrote it all. A prompt is not a
  guardrail; make rules checkable: lint rules, architecture tests (ArchUnit-style),
  forbidden imports, a skill that points at the right library.
- Predict ideas: which check would have caught the client-library mistake; a rule that is
  too vague to check.
- At your laptop: write one architecture test for a rule from your last code review.
- At work: collect review comments that repeat; each is a check waiting to be written.
- Fact idea: Google's Tricorder (Sadowski et al., 2015): analysers that reviewers found
  unhelpful too often were turned off.

### verify-loop: Make the agent prove it works
- Scope: the agent must run tests, start the service, hit the endpoint, and show output
  before calling a task done; definition of done in the brief; fast feedback matters.
- Predict ideas: "all tests pass" when no test touched the change; an agent that can't
  start the service locally.
- At your laptop: a `verify` script the agent must run and paste.
- At work: add a definition of done to your task brief template.
- Fact idea: Toyota's andon cord: any worker can stop the line on a defect.

### review-before-git: Review before git
- Scope: self-review with a fresh-context reviewer subagent; diff-only review against
  the rules; checks that run before a commit is allowed; the human reviews what's left.
- Predict ideas: the same session reviewing its own code vs a fresh one; a reviewer
  that nitpicks style a formatter should fix.
- At your laptop: a review subagent that reads only the diff and the team rules.
- At work: run a review agent before you request human review.
- Fact idea: Facebook's Infer analyser reports on diffs during code review (open-sourced
  2015).

### measure-yourself: Measure your own loop
- Scope: track time per ticket, review rounds, rework PRs, agent cost per task; a simple
  log; compare against your eval set; avoid vanity metrics.
- Predict ideas: lines of code per day as a metric; fewer review rounds but more bugs.
- At your laptop: a log file your scripts append to.
- At work: measure your last five tickets before changing anything.
- Fact idea: DORA's four key metrics (Accelerate, Forsgren, Humble and Kim, 2018).

## Part 3 · A real system

### reference-system: Tour of the practice system
- Scope: walk through the practice system (see practice-system issue): services, Kafka
  topics, the saga, databases, dashboards, its unwritten rules. Why distributed systems
  are hard for agents: many repos, async flows, state across services.
- Predict ideas: where an agent would get lost first; which rule isn't written anywhere.
- At your laptop: `docker compose up`, place one order, find it in the logs.
- Fact idea: Google's Online Boutique demo (11 microservices) used to show Kubernetes
  and service meshes.

### contracts: Contracts between services
- Scope: API and event schemas as contracts; consumer-driven contract tests; schema
  registry for Kafka events; the agent can't break a contract without a red check.
- Predict ideas: renaming a JSON field in one service; adding an enum value to an event.
- At your laptop: add a contract test between two practice services.
- Fact idea: Pact, consumer-driven contract testing (verify origin).

### migrations: Database migrations agents can't break
- Scope: expand/contract migrations, backwards compatible steps, locks on big tables,
  checks that block dangerous migrations (dropping columns in use, NOT NULL without
  default), migration review rules as code.
- Predict ideas: renaming a column in one deploy; adding an index on a huge table.
- At your laptop: a check that fails on an unsafe migration in the practice system.
- Fact idea: GitHub's gh-ost online schema migration tool for MySQL (2016).

### sagas: Sagas, retries and idempotency
- Scope: sagas and compensation; at-least-once delivery means duplicates; idempotency
  keys; retries with backoff; why agents often forget these; checks and tests that
  catch it (duplicate-message tests).
- Predict ideas: a payment event delivered twice; a compensation step that fails.
- At your laptop: a test that replays every Kafka message twice.
- Fact idea: "Sagas" (Garcia-Molina and Salem, 1987).

### observability: Logs and metrics an agent can read
- Scope: structured logs, trace IDs across services, metrics with clear names, giving an
  agent read-only query access (logs, Prometheus); small focused queries, not log dumps.
- Predict ideas: an agent reading 200k lines of raw logs; a missing trace ID.
- At your laptop: a read-only tool that returns logs for one trace ID.
- Fact idea: Google's Dapper paper (2010) inspired Zipkin and Jaeger.

## Part 3 · The loop

### ticket-to-pr: From ticket to pull request
- Scope: the full pipeline for one ticket: triage, task folder, brief, implement, verify,
  self-review, PR with evidence; where a human still decides.
- Predict ideas: a vague ticket; a ticket that touches a contract.
- At your laptop: run a practice ticket end to end with no typing after the start.
- Fact idea: SWE-agent (Yang et al., Princeton, 2024) and its "agent-computer interface".

### many-repos: One change, many repositories
- Scope: changes across services: order of merges, compatibility windows, one task
  folder with several worktrees, linked PRs, parallel subagents per repo.
- Predict ideas: merging the consumer before the producer; two agents changing one
  shared library.
- At your laptop: a change across two practice services, merged in the right order.
- Fact idea: Google keeps most of its code in one repository (Potvin and Levenberg,
  CACM 2016).

### on-call-loop: Alert, triage, fix
- Scope: alert → agent gathers logs, metrics and recent deploys → writes a triage note →
  proposes a fix or rollback; read-only by default; humans approve actions.
- Predict ideas: the agent restarts a service on its own; an alert caused by a deploy
  an hour ago.
- At your laptop: trigger a planted bug in the practice system and let the agent triage.
- Fact idea: error budgets from Google's SRE book (2016).

### risk-tiers: Risk tiers and auto-merge
- Scope: classify changes by risk (docs, tests, config, code, migrations, money paths);
  low risk merges after checks pass; high risk always gets a human; rules as code
  (CODEOWNERS, path rules); canary and rollback.
- Predict ideas: which tier for a log message change vs a currency rounding change; an
  agent editing the risk rules themselves.
- At your laptop: a script that labels a PR's risk tier from its paths.
- Fact idea: automated canary analysis (Kayenta, Netflix and Google, 2018).

### self-healing: The self-healing loop, end to end
- Scope: put it together: observe → report → ticket → fix → verify → risk tier → merge →
  watch; where it fails; stop conditions and budgets; humans own the rules.
- Predict ideas: a fix that causes a new alert (loops); a budget that runs out.
- At your laptop: run the whole loop on one planted bug.
- Fact idea: Kubernetes restarting failed containers, an idea from Google's Borg
  (Verma et al., 2015).

## Part 4 · Your company

### share-with-team: From your laptop to your team
- Scope: package your setup (repo of scripts, shared context files, hooks, skills as a
  plugin); team conventions; onboarding a colleague; keeping it small.
- Predict ideas: sharing your personal 2,000-line prompt; one teammate's hook breaks
  another's flow.
- At work: share one script and one check with your team this week.
- Fact idea: "inner source" (Tim O'Reilly, 2000).

### prove-it: Prove it with numbers
- Scope: before/after on real tickets; time to merge, review rounds, defects, cost; a
  one-page write-up; pick metrics that are hard to game.
- Predict ideas: a manager asks "how much faster?"; a metric that improves while
  quality drops.
- At work: draft your one-page results note.
- Fact idea: Goodhart's law (1975).

### regulated: Agents in a regulated company
- Scope: segregation of duties and the four-eyes principle; humans review rules and
  high-risk changes, not every diff; audit trails (who/what changed what); which data
  models may see; talking to risk and compliance early. No legal advice; describe
  principles only.
- Predict ideas: "a human must approve every change" vs approving the system that makes
  them; an auditor asks who wrote a line of code.
- At work: find your company's change-management policy and map your loop onto it.
- Fact idea: Knight Capital (2012) lost about $440 million in 45 minutes after a faulty
  deployment.

### agent-postmortems: Post-mortems for agent mistakes
- Scope: blameless post-mortems for agent failures; every miss becomes a check, a
  context-file line or a test; track repeat failures.
- Predict ideas: blaming the model vs fixing the guardrail; the same mistake three times.
- At work: write a short post-mortem for your last agent mistake.
- Fact idea: blameless post-mortems at Etsy (John Allspaw, 2012).

### company-setup: One setup for the whole company
- Scope: from team to company: shared guardrails, paved roads, a platform owned by the
  people who build products; versioning shared skills and hooks; measuring adoption.
- Predict ideas: a central AI team that never ships product; one team's rule that
  doesn't fit another.
- At work: propose one shared check to another team.
- Fact idea: Spotify's "golden paths" and Backstage (open-sourced 2020).
