# BindOS Canon

**Status:** canonical foundation  
**Version:** 0.1  
**Project:** BindOS

## 1. What BindOS is

BindOS is a formal system for representing, detecting, simulating, and visually explaining recurring relational patterns in human interaction.

BindOS does **not** diagnose people and does not decide who is right.

Its object is the **executable structure of a scene**: participants, messages, meta-messages, rules, sanctions, permissions, blocked transitions, feedback loops, and changes of logical level.

The central question is not:

> Who is toxic?

The central question is:

> **What moves are admissible inside the current rules, and at what logical level can the structure be changed?**

## 2. Canonical principles

### 2.1 Scene

A **scene** is an active interaction contour placed in a concrete context.

A scene contains at minimum:

- actors;
- observable events;
- messages;
- meta-messages;
- rules;
- sanctions;
- gates;
- transitions between possible states.

Working formula:

> **Scene = contour + context.**

### 2.2 Logical levels

BindOS distinguishes at least these levels:

- **L0 — Event / action:** what happened.
- **L1 — Message:** what is said about the event or requested action.
- **L2 — Relational rule:** what the message means for the relationship and what behaviour is expected.
- **L3 — Meta-rule:** rules about how rules and messages may be interpreted, discussed, disputed, or repaired.
- **L4 — Context / participation:** whether the frame itself may be changed, suspended, or exited.

The numbering is operational rather than metaphysical. More levels may be introduced if the scene requires them.

### 2.3 The main object is the space of admissible responses

BindOS treats communication as a constrained transition system.

For a scene state S, let:

- A(S) be the set of possible actions;
- K(S) be the constraints currently in force;
- V(S) be the subset of actions that remain admissible after constraints and sanctions are applied.

The first diagnostic question is:

> **Is V(S) empty?**

If at least one admissible move exists at the current level, the system contains a conflict or constraint but not necessarily a bind.

If no admissible move exists, BindOS searches upward:

1. Can the rules be discussed?
2. Can one rule lose obligatory status?
3. Can the context be changed?
4. Can the participant exit the interaction?

### 2.4 Double bind

A **double bind** is not merely contradiction.

Minimal BindOS criteria:

1. two or more relevant rules or demands conflict;
2. compliance with one creates violation of another;
3. violations carry meaningful sanctions or relational costs;
4. the conflict cannot be repaired at the same logical level;
5. meta-communication and/or exit is blocked or itself sanctioned.

A stronger form appears when the attempt to identify or leave the bind becomes material for the bind itself.

### 2.5 Gates

A **gate** controls accessibility of a transition.

Canonical gates:

- **ActionGate:** may a particular action be performed?
- **MetaGate:** may the rules themselves be named, questioned, or renegotiated?
- **ExitGate:** may the participant leave or change the interaction context?
- **InterpretationGate:** may an alternative interpretation remain legitimate?

A gate may be open, closed, conditional, asymmetric, or costly.

### 2.6 Sanction

A **sanction** is any consequence that changes the effective cost or admissibility of a move.

Sanctions may be:

- explicit or implicit;
- immediate or delayed;
- social, material, emotional, reputational, procedural, or symbolic;
- symmetric or asymmetric.

BindOS records sanctions as structural properties of a scene, not as proof of malicious intent.

### 2.7 Meta-communication

Meta-communication is communication about the current communication, its rules, its interpretation, or its frame.

It is a central repair mechanism because it allows a scene to move from:

> “Which answer is correct?”

to:

> “What rule makes all available answers fail?”

### 2.8 Interpreter attack

An **interpreter attack** occurs when recognition of a contradiction is itself reframed as evidence that the recognizer is defective, dishonest, unstable, disloyal, or incapable of understanding.

Structural effect:

> conflict in the message layer is relocated into distrust of the decoder.

This pattern may occur with or without deliberate manipulation. BindOS models the structure, not the hidden motive.

### 2.9 Recursion

A bind becomes recursive when a repair attempt is consumed as new input by the same pattern.

Examples:

- naming the contradiction becomes proof of disloyalty;
- requesting clarity becomes proof that one “does not understand naturally”;
- attempting to leave becomes proof of guilt;
- refusing a role becomes evidence that the role was correctly assigned.

Canonical formula:

> **attempted exit → new evidence inside the original frame**

### 2.10 Pattern

A **relational pattern** is a recurring topology of actors, rules, gates, sanctions, and feedback relations that can recur across different people, institutions, vocabularies, and settings.

BindOS classifies patterns, not personalities.

Two scenes may contain completely different content yet instantiate the same relational topology.

## 3. Kernel architecture

The BindOS kernel must remain deterministic and inspectable.

Canonical separation:

> **Kernel canonical. LLM optional.**

The kernel is responsible for:

- scene representation;
- logical-level representation;
- rule compatibility;
- gate states;
- sanction costs;
- reachability;
- pattern matching;
- loop detection;
- simulation of transitions;
- identification of candidate breakpoints.

A language model, if attached later, may:

- parse free-form descriptions;
- propose actors, rules, messages, sanctions, and edges;
- map natural language to a candidate scene graph;
- explain kernel results in natural language.

A language model must **not** be the authoritative source of the scene graph.

Human confirmation and explicit scene data remain canonical.

## 4. Scene graph

A BindOS scene is represented as a typed directed graph.

### Canonical node classes

- Actor
- Event
- Message
- Rule
- MetaRule
- Gate
- Sanction
- Context
- State
- Interpretation

### Canonical edge classes

- sends
- interpretsAs
- requires
- forbids
- sanctions
- permits
- blocks
- dependsOn
- escalates
- reinforces
- contradicts
- reframes
- exitsTo
- updates

The schema may evolve, but all additions must preserve inspectability.

## 5. Pattern atlas

The Atlas is a library of reusable graph motifs.

Initial canonical families:

- double bind;
- recursive double bind;
- interpreter attack / gaslight bind;
- rescue-dependency loop;
- guilt-compensation loop;
- pursuer-distancer loop;
- domination-submission loop;
- avoidance-reinforcement loop;
- intermittent reinforcement;
- triangulation;
- scapegoating;
- moving goalposts / impossible standard.

Each Atlas entry should contain:

1. identifier;
2. minimal topology;
3. activation conditions;
4. self-maintaining mechanism;
5. observable structural signatures;
6. possible false positives;
7. breakpoints;
8. neighbouring or mutating patterns;
9. examples separated from the canonical definition.

## 6. Breakpoints

BindOS does not prescribe a morally “correct” response.

It identifies **structural breakpoints** where the space of possible transitions changes.

Canonical breakpoint levels:

- **B0 — Action change:** choose another move inside the same rules.
- **B1 — Strategy change:** alter a sequence of moves while preserving the rules.
- **B2 — Rule exposure:** make an implicit rule explicit.
- **B3 — Meta-rule change:** change how rules may be discussed, interpreted, or sanctioned.
- **B4 — Context change:** suspend, leave, or redefine the interaction frame.

A core diagnostic output is:

> **At what lowest level does a non-trapped transition become reachable?**

## 7. Non-goals

BindOS is not:

- a psychiatric diagnostic system;
- a personality classifier;
- a lie detector;
- a court of who is right;
- a substitute for evidence;
- a system for inferring hidden intentions;
- an automatic “abuse detector” from isolated phrases.

It may represent scenes involving abuse, coercion, manipulation, or clinical concepts, but its formal outputs must remain tied to explicit structural evidence in the scene.

## 8. Epistemic rule

Every BindOS output must distinguish:

- **Observed:** directly entered or imported information.
- **Inferred:** derived deterministically from confirmed structure.
- **Suggested:** a possible interpretation or pattern match requiring confirmation.

No suggested relation silently becomes an observed fact.

## 9. Product invariant

The product should make a relational structure visually obvious before it explains it verbally.

Preferred interaction:

> **Show the scene → reveal the topology → simulate moves → expose the logical level → show breakpoints.**

The map is primary. Long prose is secondary.

## 10. Founding invariant

> **A large class of apparently insoluble communication problems becomes insoluble because the conflict is located at a different logical level from the level on which the participants are trying to solve it.**

BindOS exists to make that level visible.


## 11. Russellian logical types

BindOS distinguishes **scene bands** from **Russellian logical types**.

The visual bands S0–S4 are an interface convention for arranging events, messages, rules, meta-rules, and context. They are not themselves Russell's type hierarchy.

The canonical type rule is relational:

- **τ0:** scene objects;
- **τ1:** relations over scene objects;
- **τ(n+1):** an operator acting on an entity of type τn.

Therefore a rule that acts on a relation is represented not merely as a “higher node”, but as an explicit operator targeting that relation. A further rule may target that operator and therefore occupy the next logical type.

Logical type is **computed from the target of the operation**, not inferred from vocabulary such as “rule”, “meta-rule”, “context”, or social status.

The resulting structure may branch. BindOS therefore treats logical typing as a partial order of relations-over-relations, not as one mandatory semantic staircase.

Direct or indirect operator self-application creates a type cycle. The kernel must surface that cycle explicitly rather than silently assigning a type.

Canonical distinction:

> **Scene band answers where we place something for human reading. Russell type answers what that thing operates on.**

This distinction is foundational for all future analysis of cross-level conflicts, meta-communication, recursive binds, and rule changes.


## 12. Channel × logical type × transition cost

BindOS treats communication channel, Russellian logical type, and transition cost as independent axes.

Channel answers **how a difference is transmitted**. Russellian type answers **what the signal or operator acts on**. Transition cost answers **how strongly the signal changes the practical accessibility of a move**.

Canonical channels include verbal language, text, prosody, facial expression, gaze, gesture, posture, proximity, touch, silence, timing, group response, environment, institutions, and algorithms.

A move may be formally permitted while being functionally expensive.

BindOS represents channel influence using:

> **ΔC = sign × magnitude × conductance × gain**

The kernel distinguishes **actual sanction** from **expected sanction**. A sanction need not occur in the present scene to alter behaviour if its expected cost already changes the geometry of available transitions.

Canonical distinction:

> **Permission is not the same thing as low transition cost.**

Text and physical presence may therefore instantiate different transition fields even when verbal content is identical.

What is ordinarily called charisma, authority, intimidation, social pressure, or presence should not be assumed to be primitive traits. BindOS first attempts to decompose them into channels, conductance, gain, group reinforcement, expected cost, and logical operators.

The product surface is now:

> **Topology × Russell type × Channel × Cost × Time.**


## 13. Minimal primitive model

BindOS uses five canonical primitives:

1. **Entity** — something that can participate in a scene.
2. **Relation** — a directed or undirected connection between entities.
3. **Operator** — something that acts on an entity, relation, move, or another operator.
4. **Channel** — the medium through which an operator is transmitted.
5. **Weight** — the strength, conductance, gain, cost, or relief carried by that relation or operator.

Everything else should be derived where possible.

Russell rank is derived from the target of an operator.

Transition cost is derived from weighted influences on a move.

Meta-level is derived from operators targeting relations or other operators.

Hierarchy and dominance are derived from direction, reachability, asymmetry, reinforcement, and weight.

A channel is not a logical type. A verbal, nonverbal, textual, institutional, or algorithmic signal can occupy different Russell ranks depending on what it acts on.

Canonical compression rule:

> **Do not add a new primitive if the phenomenon can be reconstructed from entity + relation + operator + channel + weight.**
