# Guruji

Curated mirror of open-source **CS learning visualizer** repositories — DSA, system design, AI/ML, and CS fundamentals.

Built from StudyForge market research (`cslearn/future-considerations/`) plus web discovery via Composer subagents (2026-06-15).

## Structure

```
guruji/
├── manifest.json      # Full repo index by category
├── clone-all.sh       # Clone every repo listed in manifest
└── repos/
    ├── dsa/           # Algorithm & data structure visualizers
    ├── system-design/ # Distributed systems, architecture, Kafka, Raft
    ├── ai-ml/         # Transformers, RAG, embeddings, agents
    └── cs-fundamentals/ # OS, networking, compilers, crypto, git, etc.
```

## Quick start

```bash
chmod +x clone-all.sh
./clone-all.sh
```

Repos clone into `repos/<category>/<owner>__<repo>/` with shallow history (`--depth 1`).

## myguru — integrated learning app

The [`myguru/`](myguru/) subfolder is a React app that ports the best visualizers into a unified **Learn → Try → Confirm** experience:

```bash
cd myguru && npm install && npm run dev
```

See [myguru/README.md](myguru/README.md) for module mapping and architecture.

## Stats

| Category | Repos |
|----------|------:|
| DSA | 33 |
| System Design | 48 |
| AI / ML | 35 |
| CS Fundamentals | 34 |
| **Total** | **150** |

## License note

These are third-party projects with mixed licenses (MIT, Apache-2.0, unverified, etc.). Check each repo's `LICENSE` before forking or embedding in production apps.

## Re-clone / update

```bash
find repos -name .git -type d | while read g; do
  git -C "$(dirname "$g")" pull --ff-only
done
```
