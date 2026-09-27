import type { EdgeType, LogicalLevel, Scene } from "./types";

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

export function removeSceneEdge(scene: Scene, edgeId: string): Scene {
  return {
    ...scene,
    edges: scene.edges.filter((edge) => edge.id !== edgeId),
  };
}

export function removeSceneNode(scene: Scene, nodeId: string): Scene {
  return {
    ...scene,
    nodes: scene.nodes.filter((node) => node.id !== nodeId),
    edges: scene.edges.filter(
      (edge) => edge.from !== nodeId && edge.to !== nodeId,
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
