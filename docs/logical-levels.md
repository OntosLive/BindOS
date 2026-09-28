# Logical Levels and Russell Types

BindOS now separates two different structures that must not be confused.

## 1. Scene bands

The visual lanes S0–S4 are an operational arrangement for reading a scene:

- S0: event or action
- S1: message
- S2: relational rule
- S3: meta-rule
- S4: context and participation

These bands are useful for human reading, but they are **not Russell's logical types**.

## 2. Russellian logical types

A logical type is computed from what an entity ranges over or operates on.

BindOS uses the following executable convention:

- **τ0**: objects represented by scene nodes;
- **τ1**: relations over τ0 objects, represented by graph edges;
- **τ(n+1)**: an operator whose target is an entity of type τn.

Therefore an operator acting on an edge is τ2. An operator acting on that operator is τ3.

The hierarchy is derived from the target relation. It is not assigned because something is called a “meta-rule”.

## 3. Partial order, not one staircase

Different branches of a scene can have independent type chains. The result is a partial order of meta-relations rather than one universal semantic ladder.

## 4. Self-application

If an operator directly or indirectly targets itself, BindOS does not assign it a valid Russell rank. It records a type-cycle issue.

This is the computational analogue of the problem that motivated Russell's type discipline: unrestricted self-application can make the system paradoxical.

## 5. Communication

Human communication may legitimately cross logical types. A message may classify another message, a rule may govern a relation, and a meta-rule may govern that rule.

The presence of several types is not itself a pathology.

A bind becomes interesting when operators at different types impose incompatible constraints while repair, reinterpretation, or exit is blocked.
