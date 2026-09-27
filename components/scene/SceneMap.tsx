"use client";

import type { Scene, SceneEdge, SceneNode } from "@/lib/bindos/types";

const NODE_W = 190;
const NODE_H = 66;
const X_GAP = 220;
const Y_GAP = 118;

function edgeClass(edge: SceneEdge): string {
  return `mapEdge ${edge.type}`;
}

function layout(scene: Scene) {
  const levels = new Map<number, SceneNode[]>();
  for (const node of scene.nodes) {
    const level = node.level ?? 0;
    levels.set(level, [...(levels.get(level) ?? []), node]);
  }

  const positions = new Map<string, { x: number; y: number }>();
  let maxCount = 1;

  for (const [level, nodes] of levels) {
    maxCount = Math.max(maxCount, nodes.length);
    nodes.forEach((node, index) => {
      positions.set(node.id, {
        x: 150 + index * X_GAP,
        y: 50 + level * Y_GAP,
      });
    });
  }

  return {
    positions,
    width: Math.max(900, 220 + maxCount * X_GAP),
    height: 70 + 5 * Y_GAP,
  };
}

function center(position: { x: number; y: number }) {
  return { x: position.x + NODE_W / 2, y: position.y + NODE_H / 2 };
}

export function SceneMap({ scene }: { scene: Scene }) {
  const { positions, width, height } = layout(scene);

  return (
    <div className="mapWrap">
      <svg
        className="sceneMap"
        viewBox={`0 0 ${width} ${height}`}
        style={{ minWidth: Math.min(width, 1120) }}
        role="img"
        aria-label="Карта логических уровней сцены"
      >
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#566170" />
          </marker>
        </defs>

        {[0, 1, 2, 3, 4].map((level) => (
          <g key={level}>
            <line x1="26" x2={width - 26} y1={40 + level * Y_GAP} y2={40 + level * Y_GAP} stroke="#222a33" />
            <text x="28" y={32 + level * Y_GAP} className="levelLabel">L{level}</text>
          </g>
        ))}

        {scene.edges.map((edge) => {
          const from = positions.get(edge.from);
          const to = positions.get(edge.to);
          if (!from || !to) return null;
          const a = center(from);
          const b = center(to);
          return (
            <line
              key={edge.id}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              className={edgeClass(edge)}
              markerEnd="url(#arrow)"
            />
          );
        })}

        {scene.nodes.map((node) => {
          const position = positions.get(node.id);
          if (!position) return null;
          return (
            <g key={node.id} transform={`translate(${position.x} ${position.y})`}>
              <rect width={NODE_W} height={NODE_H} rx="12" className={`nodeRect ${node.type}`} />
              <foreignObject x="0" y="0" width={NODE_W} height={NODE_H}>
                <div className="nodeLabel">
                  <div className="nodeType">{node.type} · {node.epistemic}</div>
                  <div>{node.label}</div>
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
