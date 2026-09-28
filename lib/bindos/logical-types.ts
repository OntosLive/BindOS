import type {
  Scene,
  SceneOperator,
  SceneReference,
  SceneReferenceKind,
} from "./types";

export interface LogicalTypeIssue {
  kind: "dangling-reference" | "cycle";
  message: string;
  ref?: SceneReference;
}

export interface LogicalTypeEntry {
  ref: SceneReference;
  rank: number | null;
  label: string;
  target?: SceneReference;
}

export interface LogicalTypeInspection {
  entries: LogicalTypeEntry[];
  maxRank: number;
  issues: LogicalTypeIssue[];
  buckets: Record<number, LogicalTypeEntry[]>;
}

export interface ReferenceFootprint {
  nodeIds: string[];
  edgeIds: string[];
  operatorIds: string[];
}

export function referenceKey(ref: SceneReference): string {
  return `${ref.kind}:${ref.id}`;
}

function operatorById(scene: Scene, id: string): SceneOperator | undefined {
  return (scene.operators ?? []).find((operator) => operator.id === id);
}

function labelForRef(scene: Scene, ref: SceneReference): string {
  if (ref.kind === "node") {
    const node = scene.nodes.find((item) => item.id === ref.id);
    return node ? `${node.type}: ${node.label}` : `missing node: ${ref.id}`;
  }

  if (ref.kind === "edge") {
    const edge = scene.edges.find((item) => item.id === ref.id);
    if (!edge) return `missing edge: ${ref.id}`;
    const from = scene.nodes.find((item) => item.id === edge.from)?.label ?? edge.from;
    const to = scene.nodes.find((item) => item.id === edge.to)?.label ?? edge.to;
    return `${from} -[${edge.type}]-> ${to}`;
  }

  const operator = operatorById(scene, ref.id);
  return operator ? `${operator.type}: ${operator.label}` : `missing operator: ${ref.id}`;
}

function refExists(scene: Scene, ref: SceneReference): boolean {
  if (ref.kind === "node") return scene.nodes.some((item) => item.id === ref.id);
  if (ref.kind === "edge") return scene.edges.some((item) => item.id === ref.id);
  return Boolean(operatorById(scene, ref.id));
}

export function rankOfReference(
  scene: Scene,
  ref: SceneReference,
  issues: LogicalTypeIssue[] = [],
  stack: string[] = [],
): number | null {
  if (!refExists(scene, ref)) {
    issues.push({
      kind: "dangling-reference",
      message: `Ссылка ${referenceKey(ref)} не существует в сцене.`,
      ref,
    });
    return null;
  }

  if (ref.kind === "node") return 0;
  if (ref.kind === "edge") return 1;

  if (stack.includes(ref.id)) {
    issues.push({
      kind: "cycle",
      message: `Обнаружено циклическое самоприменение операторов: ${[
        ...stack,
        ref.id,
      ].join(" → ")}.`,
      ref,
    });
    return null;
  }

  const operator = operatorById(scene, ref.id);
  if (!operator) return null;

  const targetRank = rankOfReference(
    scene,
    operator.target,
    issues,
    [...stack, ref.id],
  );

  return targetRank === null ? null : targetRank + 1;
}

function dedupeIssues(issues: LogicalTypeIssue[]): LogicalTypeIssue[] {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    const key = `${issue.kind}:${issue.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function inspectLogicalTypes(scene: Scene): LogicalTypeInspection {
  const issues: LogicalTypeIssue[] = [];
  const entries: LogicalTypeEntry[] = [];

  for (const node of scene.nodes) {
    entries.push({
      ref: { kind: "node", id: node.id },
      rank: 0,
      label: `${node.type}: ${node.label}`,
    });
  }

  for (const edge of scene.edges) {
    const ref: SceneReference = { kind: "edge", id: edge.id };
    entries.push({
      ref,
      rank: rankOfReference(scene, ref, issues),
      label: labelForRef(scene, ref),
    });
  }

  for (const operator of scene.operators ?? []) {
    const ref: SceneReference = { kind: "operator", id: operator.id };
    entries.push({
      ref,
      rank: rankOfReference(scene, ref, issues),
      label: `${operator.type}: ${operator.label}`,
      target: operator.target,
    });

    if (operator.sourceNodeId && !scene.nodes.some((node) => node.id === operator.sourceNodeId)) {
      issues.push({
        kind: "dangling-reference",
        message: `Оператор ${operator.id} ссылается на отсутствующий source node ${operator.sourceNodeId}.`,
      });
    }
  }

  const buckets: Record<number, LogicalTypeEntry[]> = {};
  let maxRank = 0;

  for (const entry of entries) {
    if (entry.rank === null) continue;
    maxRank = Math.max(maxRank, entry.rank);
    (buckets[entry.rank] ??= []).push(entry);
  }

  return {
    entries,
    maxRank,
    issues: dedupeIssues(issues),
    buckets,
  };
}

export function logicalTypeSignature(scene: Scene): string {
  const inspection = inspectLogicalTypes(scene);
  const parts = Object.keys(inspection.buckets)
    .map(Number)
    .sort((a, b) => a - b)
    .map((rank) => `τ${rank}:${inspection.buckets[rank].length}`);

  return parts.length ? parts.join(" · ") : "∅";
}

export function collectReferenceFootprint(
  scene: Scene,
  ref: SceneReference,
  visited = new Set<string>(),
): ReferenceFootprint {
  const key = referenceKey(ref);
  if (visited.has(key)) {
    return { nodeIds: [], edgeIds: [], operatorIds: [] };
  }
  visited.add(key);

  if (ref.kind === "node") {
    return { nodeIds: [ref.id], edgeIds: [], operatorIds: [] };
  }

  if (ref.kind === "edge") {
    const edge = scene.edges.find((item) => item.id === ref.id);
    return {
      nodeIds: edge ? [edge.from, edge.to] : [],
      edgeIds: [ref.id],
      operatorIds: [],
    };
  }

  const operator = operatorById(scene, ref.id);
  if (!operator) {
    return { nodeIds: [], edgeIds: [], operatorIds: [ref.id] };
  }

  const target = collectReferenceFootprint(scene, operator.target, visited);
  return {
    nodeIds: [
      ...new Set([
        ...(operator.sourceNodeId ? [operator.sourceNodeId] : []),
        ...target.nodeIds,
      ]),
    ],
    edgeIds: target.edgeIds,
    operatorIds: [...new Set([ref.id, ...target.operatorIds])],
  };
}

export function referenceOptions(
  scene: Scene,
  kind: SceneReferenceKind,
): Array<{ id: string; label: string }> {
  if (kind === "node") {
    return scene.nodes.map((node) => ({
      id: node.id,
      label: `${node.type}: ${node.label}`,
    }));
  }

  if (kind === "edge") {
    return scene.edges.map((edge) => ({
      id: edge.id,
      label: labelForRef(scene, { kind: "edge", id: edge.id }),
    }));
  }

  return (scene.operators ?? []).map((operator) => ({
    id: operator.id,
    label: `${operator.type}: ${operator.label}`,
  }));
}
