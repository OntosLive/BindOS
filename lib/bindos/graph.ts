import type { EdgeType, LogicalLevel, Scene, SceneReference } from "./types";

export const GRAPH_LEVEL_Y: Record<LogicalLevel, number> = {
  0: 58,
  1: 176,
  2: 294,
  3: 412,
  4: 530,
};

export function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function addSceneEdge(
  scene: Scene,
  from: string,
  to: string,
  type: EdgeType,
): Scene {
  if (!from || !to || from === to) return scene;

  const duplicate = scene.edges.some(
    (edge) => edge.from === from && edge.to === to && edge.type === type,
  );
  if (duplicate) return scene;

  return {
    ...scene,
    edges: [
      ...scene.edges,
      {
        id: createId("edge"),
        from,
        to,
        type,
      },
    ],
  };
}

function operatorCascade(
  scene: Scene,
  removedRefs: SceneReference[],
): Set<string> {
  const removed = new Set(
    removedRefs
      .filter((ref) => ref.kind === "operator")
      .map((ref) => ref.id),
  );

  const removedKeys = new Set(removedRefs.map((ref) => `${ref.kind}:${ref.id}`));
  let changed = true;

  while (changed) {
    changed = false;
    for (const operator of scene.operators ?? []) {
      if (removed.has(operator.id)) continue;
      const targetKey = `${operator.target.kind}:${operator.target.id}`;
      const sourceRemoved =
        operator.sourceNodeId &&
        removedKeys.has(`node:${operator.sourceNodeId}`);
      const targetRemoved =
        removedKeys.has(targetKey) ||
        (operator.target.kind === "operator" && removed.has(operator.target.id));

      if (sourceRemoved || targetRemoved) {
        removed.add(operator.id);
        changed = true;
      }
    }
  }

  return removed;
}

export function removeSceneEdge(scene: Scene, edgeId: string): Scene {
  const removedOperators = operatorCascade(scene, [
    { kind: "edge", id: edgeId },
  ]);

  return {
    ...scene,
    edges: scene.edges.filter((edge) => edge.id !== edgeId),
    operators: (scene.operators ?? []).filter(
      (operator) => !removedOperators.has(operator.id),
    ),
  };
}

export function removeSceneOperator(scene: Scene, operatorId: string): Scene {
  const removedOperators = operatorCascade(scene, [
    { kind: "operator", id: operatorId },
  ]);

  return {
    ...scene,
    operators: (scene.operators ?? []).filter(
      (operator) => !removedOperators.has(operator.id),
    ),
  };
}

export function removeSceneNode(scene: Scene, nodeId: string): Scene {
  const removedEdgeIds = scene.edges
    .filter((edge) => edge.from === nodeId || edge.to === nodeId)
    .map((edge) => edge.id);

  const removedOperators = operatorCascade(scene, [
    { kind: "node", id: nodeId },
    ...removedEdgeIds.map((id): SceneReference => ({ kind: "edge", id })),
  ]);

  return {
    ...scene,
    nodes: scene.nodes.filter((node) => node.id !== nodeId),
    edges: scene.edges.filter(
      (edge) => edge.from !== nodeId && edge.to !== nodeId,
    ),
    operators: (scene.operators ?? []).filter(
      (operator) => !removedOperators.has(operator.id),
    ),
    moves: scene.moves.map((move) => ({
      ...move,
      sanctionIds: (move.sanctionIds ?? []).filter((id) => id !== nodeId),
      blockedByGateIds: (move.blockedByGateIds ?? []).filter(
        (id) => id !== nodeId,
      ),
      violatesRuleIds: (move.violatesRuleIds ?? []).filter(
        (id) => id !== nodeId,
      ),
    })),
  };
}

export function moveSceneNode(
  scene: Scene,
  nodeId: string,
  x: number,
  y: number,
): Scene {
  return {
    ...scene,
    nodes: scene.nodes.map((node) =>
      node.id === nodeId
        ? {
            ...node,
            ui: {
              x: Math.max(110, Math.round(x)),
              y: Math.max(28, Math.round(y)),
            },
          }
        : node,
    ),
  };
}

export function nearestLogicalLevel(y: number): LogicalLevel {
  const entries = Object.entries(GRAPH_LEVEL_Y) as Array<
    [`${LogicalLevel}`, number]
  >;

  let best: LogicalLevel = 0;
  let distance = Number.POSITIVE_INFINITY;

  for (const [rawLevel, levelY] of entries) {
    const next = Math.abs(y - levelY);
    if (next < distance) {
      distance = next;
      best = Number(rawLevel) as LogicalLevel;
    }
  }

  return best;
}

export function setSceneNodeLevel(
  scene: Scene,
  nodeId: string,
  level: LogicalLevel,
): Scene {
  return {
    ...scene,
    nodes: scene.nodes.map((node) =>
      node.id === nodeId ? { ...node, level } : node,
    ),
  };
}
