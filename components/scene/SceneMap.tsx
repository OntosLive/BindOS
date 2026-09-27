"use client";

import type { Scene, SceneEdge, SceneNode } from "@/lib/bindos/types";

const NODE_W = 190;
const NODE_H = 66;

function edgeClass(edge: SceneEdge): string {
  return `mapEdge ${edge.type}`;
}

function center(node: SceneNode) {
  return {
    x: (node.ui?.x ?? 0) + NODE_W / 2,
    y: (node.ui?.y ?? 0) + NODE_H / 2,
  };
}

export function SceneMap({ scene }: { scene: Scene }) {
  const positioned = new Map(
    scene.nodes
      .filter((node) => node.ui)
      .map((node) => [node.id, node] as const),
  );

  return (
    <div className="mapWrap">
      <svg
        className="sceneMap"
        viewBox="0 0 900 520"
        role="img"
        aria-label="Карта логических уровней сцены"
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#566170" />
          </marker>
        </defs>

        {[1, 2, 3, 4].map((level) => (
          <g key={level}>
            <line
              x1="26"
              x2="874"
              y1={level * 104 - 18}
              y2={level * 104 - 18}
              stroke="#222a33"
            />
            <text x="28" y={level * 104 - 26} className="levelLabel">
              L{level}
            </text>
          </g>
        ))}

        {scene.edges.map((edge) => {
          const from = positioned.get(edge.from);
          const to = positioned.get(edge.to);
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
          if (!node.ui) return null;
          return (
            <g key={node.id} transform={`translate(${node.ui.x} ${node.ui.y})`}>
              <rect
                width={NODE_W}
                height={NODE_H}
                rx="12"
                className={`nodeRect ${node.type}`}
              />
              <foreignObject x="0" y="0" width={NODE_W} height={NODE_H}>
                <div className="nodeLabel">
                  <div className="nodeType">
                    {node.type} · {node.epistemic}
                  </div>
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
