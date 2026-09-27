# BindOS

BindOS is a visual debugger for relational systems.

It represents a human interaction as a typed scene graph, detects recurring relational topologies, simulates admissible moves, and shows the logical level at which a trapped system can be changed.

## Founding principle

> The main object is not the message. It is the space of admissible responses.

## Product direction

1. Build a scene.
2. Reveal its topology.
3. Detect recurring patterns.
4. Simulate moves.
5. Show breakpoints.
6. Keep the kernel deterministic and inspectable.

See [CANON.md](./CANON.md) for the source of truth.

## Architecture

- `kernel/` deterministic scene and pattern logic
- `atlas/` canonical relational pattern definitions
- `docs/` conceptual and product architecture
- future `app/` visual Next.js interface

**Kernel canonical. LLM optional.**
