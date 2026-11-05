# Commute Agents

Agentic engineering for product engineers, one commute at a time:
https://pwlae.github.io/commute-agents/

Short lessons you can read on a phone. Each one explains how AI agents really
work, asks a few quick "Predict" questions, and ends with what to do
differently at work tomorrow. Part 1 levels you up on how models and agent
harnesses work underneath; later parts build a setup that ships real software
in a distributed system, first on your laptop, then for your team.

Sister site of [Commute Algorithms](https://pwlae.github.io/).

## Build

```
pip install pygments
PUPPETEER_SKIP_DOWNLOAD=1 npm install   # once, for Mermaid diagrams
python3 build.py
```

Lessons live in `lessons/`, the order in `curriculum.json`. The generated
pages (`index.html`, `l/`, `all.html`, `diagrams/`) are committed and served
by GitHub Pages. See `CLAUDE.md` for how lessons are written.

Code: MIT (`LICENSE`). Lessons: CC BY-SA 4.0 (`LICENSE-content.md`).
