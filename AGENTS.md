# ReplayX — AGENTS.md (Codex-First Version)

## Codex operating instructions for this repository

Codex reads `AGENTS.md` before doing work, and merges instruction files from global scope to project scope to more specific nested scope, with deeper files overriding broader ones.

---

## What ReplayX is

**ReplayX** is a Codex-first incident response system. It takes an incident bundle - logs, stacktrace, metrics, recent code context - and turns it into:

- a ranked root-cause diagnosis
- a validated fix proposal
- a reviewed patch
- a postmortem
- and a reusable incident skill

The system is intentionally **Codex-native**. Use **Codex SDK** for orchestration and thread control, and use **Codex CLI** for local iteration, scripted repo tasks, and code review workflows.

---

## Core stack

- **Orchestration:** `@openai/codex-sdk` in Node.js 18+
- **Interactive development:** Codex CLI (`npm i -g @openai/codex`)
- **Frontend:** React + Vite
- **Demo app:** Node.js + Express + PostgreSQL
- **Load tests:** k6
- **Source control / PRs:** git + GitHub CLI

---

## Repo expectations

- Keep the architecture **Codex-first**. Do not introduce OpenAI Agents SDK as the primary runtime.
- Prefer Codex SDK threads for diagnosis, validation, fixing, and review phases.
- Use Codex CLI for prompt iteration, local repo review, and scripted `codex exec` automation where helpful.
- Keep durable repo rules in this file instead of repeating them in every prompt.
- Keep this file concise; long prompt catalogs belong in `PROMPTS.md` and flow docs belong in `PIPELINE.md`, because Codex instruction discovery has a size cap by default.

---

## Key directories

```text
replay-x/
├── AGENTS.md
├── README.md
├── PIPELINE.md
├── PROMPTS.md
├── DECISION_CODEX_FIRST.md
├── orchestrator/
│   ├── main.ts
│   ├── diagnosis_arena.ts
│   ├── adversary.ts
│   ├── fix_arena.ts
│   ├── review_pass.ts
│   └── skill_writer.ts
├── demo_app/
├── incidents/
├── skills/
└── dashboard/
```

---

## Run commands

```bash
# Install repo deps
npm install

# Install Codex CLI globally
npm i -g @openai/codex

# Run ReplayX orchestrator
npm run dev

# Run dashboard
cd dashboard && npm run dev

# Run tests
npm test

# Run load tests
k6 run k6/incident_checkout.js
```

---

## Done means

A task is only complete when all of these are true:

1. The requested code or prompt change is implemented.
2. Relevant tests pass or the failure is explained clearly.
3. If behavior changed, the diff has been reviewed.
4. If a workflow became repeatable, consider whether it should become a skill.
5. Do not claim success without verification.

---

## Working style for Codex

For complex tasks:

- plan first
- identify goal, context, constraints, and done-when
- work one coherent thread per unit of work when possible
- use subagents only for bounded parallel subtasks
- review before finalizing

---

## Useful references

- Codex SDK: https://developers.openai.com/codex/sdk
- Codex CLI: https://developers.openai.com/codex/cli
- AGENTS.md guide: https://developers.openai.com/codex/guides/agents-md
- Codex best practices: https://developers.openai.com/codex/learn/best-practices
