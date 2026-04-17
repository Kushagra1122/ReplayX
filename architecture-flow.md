# ReplayX — How It Works

> Drop a bug report. Get a diagnosis, a fix, a postmortem, and a reusable skill — automatically.

```mermaid
flowchart TD
    IN1["Slack · #bugs"]
    IN2["CLI · golden-run"]

    subgraph ORCH["ReplayX Orchestrator"]
        direction TB
        P1["Intake\nnormalize the incident"]
        P2{"Skill Match\nseen this before?"}
        P3["Repro\nconfirm the bug is real"]
        P4["Diagnosis Arena\n6 workers in parallel"]
        P5["Challenger\nfalsify the top theory"]
        P6["Fix Arena\nrank by blast radius"]
        P7["Review\napprove or veto"]
        P8["Postmortem + Skill Write"]

        P1 --> P2
        P2 -->|known pattern| P8
        P2 -->|new incident| P3
        P3 --> P4
        P4 --> P5
        P5 --> P6
        P6 --> P7
        P7 --> P8
    end

    subgraph WORKERS["Parallel Codex Workers"]
        direction LR
        W1["concurrency"]
        W2["auth"]
        W3["data shape"]
        W4["recent change"]
        W5["database"]
        W6["state handoff"]
    end

    subgraph CTX["Incident Context"]
        direction TB
        C1["error · logs · stack trace"]
        C2["repo · recent commits"]
        C3["demo app repro scripts"]
    end

    subgraph ART["Artifact Store"]
        direction TB
        A1["diagnosis.json"]
        A2["fix_recommendation.json"]
        A3["postmortem.json"]
        A4["skill.md"]
    end

    subgraph DASH["Live Dashboard · Next.js + WebSocket"]
        direction LR
        D1["Live Run View"]
        D2["Replay View"]
    end

    IN1 --> P1
    IN2 --> P1

    P3 --> CTX

    P4 -.->|fan out| WORKERS
    WORKERS -.->|ranked diagnoses| P5

    P4 --> A1
    P6 --> A2
    P8 --> A3
    P8 --> A4

    A4 -->|reused on next similar incident| P2

    ART -->|file watch · WebSocket push| D1
    ART --> D2
```

## Walkthrough

| # | Phase | What happens |
|---|-------|-------------|
| 1 | **Intake** | Normalizes the report — title, error, logs, repo, recent changes — into a clean bundle |
| 2 | **Skill Match** | Checks if this pattern was seen before. Match → skip straight to Postmortem |
| 3 | **Repro** | Runs the failing command against the demo app to confirm the bug before spending compute |
| 4 | **Diagnosis Arena** | 6 Codex workers run in parallel, each owning a failure domain |
| 5 | **Challenger** | A dedicated worker tries to falsify the top theory. Weak diagnoses get rejected here |
| 6 | **Fix Arena** | Fix strategies ranked by blast radius: minimal patch → safe refactor → durable redesign |
| 7 | **Review** | Final worker approves or vetoes the fix proposal |
| 8 | **Postmortem + Skill** | Writes a postmortem and a `skill.md` that feeds back into Skill Match for future runs |
| — | **Dashboard** | Every phase streams live over WebSocket. Any past run is replayable from saved artifacts |
