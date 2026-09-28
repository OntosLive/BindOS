import { analyzeScene } from "./engine";
import {
  executablePatterns,
  nodeSatisfiesConstraint,
  type ExecutablePattern,
  type PatternEdgeConstraint,
} from "./patterns";
import type { Scene, SceneEdge } from "./types";

export interface PatternMatch {
  id: string;
  label: string;
  family: string;
  invariant: string;
  evidence: string[];
  roles: Record<string, string>;
  nodeIds: string[];
  edgeIds: string[];
}

function matchingEdges(
  scene: Scene,
  constraint: PatternEdgeConstraint,
  roles: Record<string, string>,
): SceneEdge[] {
  const from = roles[constraint.from];
  const to = roles[constraint.to];
  if (!from || !to) return [];

  return scene.edges.filter((edge) => {
    if (edge.type !== constraint.type) return false;
    const direct = edge.from === from && edge.to === to;
    const reverse =
      constraint.bidirectional && edge.from === to && edge.to === from;
    return direct || Boolean(reverse);
  });
}

function distinctEnough(
  role: string,
  nodeId: string,
  pattern: ExecutablePattern,
  roles: Record<string, string>,
): boolean {
  const constraint = pattern.nodeConstraints.find((item) => item.role === role);
  if (!constraint) return true;

  if (Object.values(roles).includes(nodeId)) return false;

  for (const otherRole of constraint.distinctFrom ?? []) {
    if (roles[otherRole] === nodeId) return false;
  }

  return true;
}

function structuralMatch(
  scene: Scene,
  pattern: ExecutablePattern,
): PatternMatch | null {
  const roles: Record<string, string> = {};
  const constraints = pattern.nodeConstraints;

  function search(index: number): boolean {
    if (index >= constraints.length) {
      return pattern.edgeConstraints
        .filter((edge) => !edge.optional)
        .every((edge) => matchingEdges(scene, edge, roles).length > 0);
    }

    const constraint = constraints[index];
    const candidates = scene.nodes.filter((node) =>
      nodeSatisfiesConstraint(node, constraint),
    );

    for (const candidate of candidates) {
      if (!distinctEnough(constraint.role, candidate.id, pattern, roles)) {
        continue;
      }
      roles[constraint.role] = candidate.id;
      if (search(index + 1)) return true;
      delete roles[constraint.role];
    }

    return false;
  }

  if (!search(0)) return null;

  const edges = pattern.edgeConstraints.flatMap((constraint) =>
    matchingEdges(scene, constraint, roles),
  );

  const nodeIds = [...new Set(Object.values(roles))];
  const edgeIds = [...new Set(edges.map((edge) => edge.id))];

  const evidence = [
    ...pattern.nodeConstraints.map(
      (constraint) => `${constraint.role} → ${roles[constraint.role]}`,
    ),
    ...pattern.edgeConstraints
      .filter((constraint) => !constraint.optional)
      .map(
        (constraint) =>
          `${constraint.from} -[${constraint.type}]-> ${constraint.to}`,
      ),
  ];

  return {
    id: pattern.id,
    label: pattern.name,
    family: pattern.family,
    invariant: pattern.invariant,
    evidence,
    roles: { ...roles },
    nodeIds,
    edgeIds,
  };
}

function derivedDoubleBindMatch(scene: Scene): PatternMatch | null {
  const analysis = analyzeScene(scene);
  if (
    ![
      "double-bind",
      "recursive-double-bind",
      "interpreter-attack-bind",
      "recursive-interpreter-bind",
    ].includes(analysis.classification)
  ) {
    return null;
  }

  const ruleConflict = scene.edges.find((edge) => edge.type === "contradicts");
  const nodes = new Set<string>();
  const edges = new Set<string>();

  if (ruleConflict) {
    nodes.add(ruleConflict.from);
    nodes.add(ruleConflict.to);
    edges.add(ruleConflict.id);
  }

  for (const move of analysis.moves) {
    for (const sanction of move.sanctions) nodes.add(sanction.id);
    for (const gate of move.closedGates) nodes.add(gate.id);
  }

  return {
    id: "double-bind",
    label: "Double Bind",
    family: "bind",
    invariant:
      "Нет чистого хода первого уровня, конфликт правил активен, а доступные размыкания закрыты.",
    evidence: [
      "kernel: конфликт правил",
      "kernel: чистых ходов L0 = 0",
      "kernel: MetaGate / ExitGate не дают чистого перехода",
    ],
    roles: {},
    nodeIds: [...nodes],
    edgeIds: [...edges],
  };
}

export function matchScene(scene: Scene): PatternMatch[] {
  const matches = executablePatterns
    .map((pattern) => structuralMatch(scene, pattern))
    .filter((match): match is PatternMatch => Boolean(match));

  if (!matches.some((match) => match.id === "double-bind")) {
    const derived = derivedDoubleBindMatch(scene);
    if (derived) matches.unshift(derived);
  }

  return matches;
}

export function sceneSignature(matches: PatternMatch[]): string {
  if (!matches.length) return "∅";
  const codes: Record<string, string> = {
    "double-bind": "DB",
    "recursive-double-bind": "RDB",
    "interpreter-attack": "IA",
    "moving-goalposts": "MG",
  };
  return matches.map((match) => codes[match.id] ?? match.id).join(" + ");
}
