# myguru

Interactive CS learning platform — **Learn → Try → Confirm** with **52 labs** ported from the [guruji](../) open-source visualizer collection.

## Run locally

```bash
cd myguru
npm install
npm run dev
```

Open http://localhost:5173

## Tracks & labs (37 total)

| Track | Lessons | Highlights |
|-------|--------:|------------|
| **DSA** | 16 | + quick sort, stack/queue, linked list, trie, MST, Dijkstra, dedicated BFS |
| **System Design** | 11 | + Paxos, stability/retry storms, interview simulator |
| **AI/ML** | 11 | + diffusion explainer, embedding atlas, GraphRAG hybrid, agent-replay fix |
| **CS Fundamentals** | 13 | + git game, CPU arch (Ripes), cipher museum, OS memory sim |

## Source repos (ported)

| Module | Upstream |
|--------|----------|
| DSA step engines | ChazWyllie/data-structure-visualizer, easyhard/dpv |
| Load balancer | pronzzz/sysarch-interactive |
| Consistent hashing | ionmx/consistent-hashing-simulator |
| Kafka | idsulik/kafka-concepts-visualizer |
| Raft | AarjavPatni/raft-visualization |
| DB replication | PatrickKoss/database-internals-visualized |
| Agent / RAG | ferhatatagun/agent-replay, sap156/RAGflow, VIS-SUSTech/RAGTrace |
| Transformer / CNN | poloclub/transformer-explainer, poloclub/cnn-explainer (iframe) |
| Neural playground | tensorflow/playground (simplified) |
| B+ tree, crypto, OS | Yusux/BPlusTreeVisualizer, powergr/cipherflow-visualizer, AmirShakibafar/OS-Visualizer |
| Git, DNS, compilers | pcottle/learnGitBranching, jsg0000/dns-trace, danielace1/compiler-visualizer |

## Architecture

```
src/
├── pages/              Home, track list, lab (Learn/Try/Confirm)
├── modules/
│   ├── dsa/            10 visualizers + step-engine
│   ├── system-design/  8 simulators (Konva, canvas, React)
│   ├── ai-ml/          9 labs (native + iframe embeds)
│   └── cs-fundamentals/ 9 interactive demos
├── data/tracks.ts
└── modules/lab-registry.ts
```

## Build

```bash
npm run build   # ✓ passes
npm run preview
```

## License

Ported logic retains MIT/Apache licenses from source repos — see `@see` comments in each module.
