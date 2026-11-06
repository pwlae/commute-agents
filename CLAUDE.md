# Commute Agents

A small multi-page site that teaches agentic engineering to working software engineers,
one commute at a time. Sister site of Commute Algorithms (`../pwlae.github.io`), built
with the same engine. Repo: https://github.com/pwlae/commute-agents, served by GitHub Pages
from `master` at https://pwlae.github.io/commute-agents/. The repo is public: never put the
owner's employers, colleagues or private tools in it.

## Why it exists (the owner's brief, condensed)

- Engineers keep hearing about "10x with AI agents", but most companies get maybe 3x.
  People prompt an agent to write code that looks hand-written, then review every line
  as if a human wrote it. The reviewer becomes the bottleneck. Agent-written PRs rarely
  get merged, because the team's standards are unwritten and live only in people's heads.
- Almost every company is in the same state: no shared setup. Everyone has their own
  local tools, prompts and tricks, and none of it is shared.
- **The reader is a product engineer**, not a member of an AI platform team. They build
  real products in distributed systems: transactions, migrations, many repositories,
  strict standards. That is very different from writing Terraform or laptop install
  scripts. Their hands-on experience is valuable, and this course helps them turn it
  into a setup they can prove works: first on their own laptop, then for their team,
  then for the company. The promise: you become the person whose way of working the
  company adopts, because you showed it works in practice.
- Toy examples don't transfer. A one-page website is easy for any agent. Part 3 uses a
  realistic practice system (gateway, 2–3 services, Kafka, a saga, 2–3 databases with
  migrations, messy logs, Grafana + Prometheus), because agents struggle much more in
  distributed systems, and that's where most companies live.
- Before building anything, **level the reader up** (Part 1). They already know what a
  skill, MCP or a plugin is, so skip that. Explain how things work underneath: tokens,
  caching, the agent loop, context, memory, subagents, open-weight models, GPUs. Someone
  who finishes only Part 1 should be able to answer most AI questions at work.
- There is no secret "factory" software. A factory is the same agent harness, run by a
  script, a schedule or CI, in separate git worktrees. Show this plainly. "My agent runs
  more agents" is the right answer, not a boring one.
- Narrowly scoped "persona" agents often get in the way (they refuse work outside their
  scope). Restrictions earn their place as permissions (read-only, no network), and as
  a clean context for a side task. Teach that honestly.

## Why the reader comes back (keep these)

What the owner loves about Commute Algorithms, and so what this site must keep:

- **Zero friction.** Open the page, read the idea, act. No hunting for material, no
  wall of text, nothing to set up before the first win. Usable in 25 minutes on the
  Northern line, or 5 minutes waiting at a child's gymnastics class.
- **A quick win you can check.** LeetCode has "Accepted". Here it is the **Predict
  card**: a short realistic situation, you guess, tap to see the answer, tick "I got it".
- **"Use it at work"**: every lesson ends with what to do differently tomorrow, in
  real work. Knowing is not enough; the reader should use it.
- **The interesting fact** stays. Readers love it.
- Fixed order, easiest first, prerequisites linked.

## Course shape

`curriculum.json` is the source of truth. Four parts:

1. **Level up**: how models and agent harnesses work underneath. Phone-only.
2. **Your workbench**: a local setup you are proud of. One folder per task, scripts for
   everything that can be a script and one small agent step for the rest, context files,
   unwritten rules turned into checks, the agent proving its work, review before git.
3. **The loop on a real system**: the practice system, then ticket → PR, many repos,
   on-call (alert → triage → fix), risk tiers and auto-merge, self-healing.
   Theory on the phone, a hands-on step at home.
4. **Team and company**: share the setup, prove it with numbers, work within a
   regulated company's rules (humans review the guardrails and high-risk changes,
   not every diff), post-mortems for agent mistakes, one setup for everyone.

Real failure stories make the best examples. One from the owner: an agent built a new
integration and ignored the team's client library for that third party, which already
had circuit breaking, rate limits and retries set up. It hand-wrote all of that instead,
and it took several more PRs to fix. Lesson: a good prompt is not a guardrail. Make the
rule checkable (a lint rule, an architecture test, a skill that points at the library).

## Hard requirements (same as the sister site)

- **Light and fast.** Inline CSS/JS, no frameworks, no web fonts, no runtime JS libraries.
  Home ≈ 25 KB, lesson pages ≈ 20–65 KB.
- **Phone first.** 16px gutter, 44px tap targets, no horizontal page scroll.
  Code lines ≤ 39 characters (`python3 tools/check_code_width.py [id]`).
- **Printable.** White background, black text. On print, hints and facts expand and
  answers move to an "Answers" page at the end of the lesson.
- **Diagrams: Mermaid only**, rendered to SVG at build time, ≤ 450px wide.
  The only photo is `images/tube.webp` (public domain, shared with the sister site).
- Progress lives in `localStorage` only (keys `cag-*`; the sister site uses `ca-*` on
  the same origin, so never reuse its keys or delete its caches). No accounts, no
  backend, no analytics. Works offline after one visit (`sw.js`, caches `cag-*`).
- Code: any Pygments language (Python, bash, JSON, YAML, TypeScript…).
- Licences: code MIT (`LICENSE`); lessons CC BY-SA 4.0 (`LICENSE-content.md`).

## Accuracy

This field changes every few months, and a wrong fact costs the course its credibility.

- Teach mechanisms that last (tokens, caching, the loop, context, memory as files) and
  treat products as examples.
- Every lesson that states a product detail (prices, limits, flags, model names) ends
  with `<p class="checked">Facts checked: Month YYYY.</p>` before the recap.
- Prefer primary sources: vendor docs, papers, well-known engineering blogs. Never
  invent internals of a company's systems. If it isn't public, say so.
- Facts in `<fact>` must be true and well documented.

## How the site is built

```
curriculum.json      title, url, stages, ordered lessons (id, title, stage, requires)
lessons/<id>.html    one HTML fragment per lesson
template.html        page shell: all CSS + JS inline
build.py             → GENERATED, committed: index.html, l/<id>.html, all.html,
                       diagrams/*.svg, sitemap.xml, robots.txt, manifest.webmanifest
```

- Build: `python3 build.py` (needs `pygments`; diagrams need `node_modules`, first time
  `PUPPETEER_SKIP_DOWNLOAD=1 npm install`, which uses the system Chromium).
- Preview: `python3 -m http.server 8766`, then
  `/snap/bin/chromium --headless --no-sandbox --hide-scrollbars --window-size=390,6000 --screenshot=$PWD/preview/m.png http://localhost:8766/l/<id>.html`
  and `--print-to-pdf=$PWD/preview/<id>.pdf ...`. Use `preview/` (gitignored).
- Link-preview image and icons: `node tools/make_images.cjs <photo.jpg>` (run by hand,
  outputs committed in `images/`).

## Writing a lesson

Target: **~10 minutes of reading + 3–6 Predict cards ≈ one commute.** 400–900 words of
prose. Short sentences, plain words, define every term the first time. The reader is
an experienced engineer, so don't explain programming, but never assume AI jargon.

Sections, in this order (`<h3>`):

1. `<p class="lead">`: one or two sentences: what this is and why it matters. It is also
   the page's meta description and link-preview text.
2. **The idea**: a real-life picture, then how it works in a few steps. At least one
   Mermaid diagram.
3. **Up close**: the mechanism, with a small code or config example where it helps.
4. **Worked example**: optional, a small table works well.
5. **At your laptop** (Parts 2–3 only, optional): one short hands-on step for when the
   reader is at a computer. Everything above it must still make sense on a phone.
6. **Your turn**: 3–6 `<predict>` cards, easiest first. Each one is a realistic
   situation from work with a clear, short answer that explains *why*.
7. `<atwork>`: 2–4 things to do differently tomorrow, then "If someone asks…" with a
   two-sentence answer the reader can say out loud.
8. `<fact title="...">`: a true, well-documented real-world story.
9. `<p class="checked">` (when there are product details), then `<recap>`: 3 bullets.

Markup (build.py expands it):

```html
<pre><code class="language-python">...</code></pre>
<pre class="mermaid" data-alt="what the diagram shows">flowchart TD ...</pre>
<predict id="unique-words" minutes="2">
  <q><p>Situation and question.</p></q>
  <hint>optional nudge</hint>
  <answer><p>Answer and why.</p></answer>
</predict>
<atwork><ul><li>...</li></ul><p><b>If someone asks…</b> ...</p></atwork>
<fact title="Short title">...</fact>
<recap><ul><li>...</li></ul></recap>
```

Predict ids must be unique across the whole course (the build fails otherwise).
`lessons/prompt-caching.html` is the model lesson.

## Loop workflow (Linear, parallel)

Work is tracked in Linear: workspace **Commute Agents** (linear.app/commute-agents), team **COM**, project
**commute-agents**. One issue per lesson, titled `Lesson: <title> [<id>]`, plus setup
issues (e.g. the Part 3 practice system). The issue descriptions come from
`plan/lessons.md`. Blockers follow each lesson's `requires` in `curriculum.json`, so
lessons with no unwritten prerequisites can be written in parallel.

- `/linear-setup` creates the project and issues once (`.claude/commands/linear-setup.md`).
- `/loop /lesson-loop` runs the loop (`.claude/commands/lesson-loop.md`). The owner
  approved subagents, git worktrees, and merging to `master` without review.
- **Orchestrator** (main session, on `master`): picks up to 4 ready issues, starts one
  subagent per issue in its own worktree, merges them one at a time, rebuilds, pushes,
  comments on the issue and moves it to Done. Only the orchestrator pushes or touches
  Linear.
- **Subagent**: writes `lessons/<id>.html`, checks every fact against a primary source,
  passes the build and width check, looks at the phone screenshot and print PDF, and
  commits only the lesson file and new diagrams.
- Site problems go into new issues in the same project, never into lesson commits.
