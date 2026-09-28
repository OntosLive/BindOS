"use client";

import { useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  addSceneEdge,
  GRAPH_LEVEL_Y,
  moveSceneNode,
  nearestLogicalLevel,
  removeSceneEdge,
  removeSceneNode,
  setSceneNodeLevel,
} from "@/lib/bindos/graph";
import type { PatternMatch } from "@/lib/bindos/matcher";
import type {
  EdgeType,
  Scene,
  SceneEdge,
  SceneNode,
} from "@/lib/bindos/types";

const NODE_W = 210;
const NODE_H = 72;
const MIN_WIDTH = 980;
const CANVAS_HEIGHT = 660;

type GraphMode = "move" | "connect";

function edgeClass(edge: SceneEdge): string {
  return `mapEdge ${edge.type}`;
}

function fallbackPosition(scene: Scene, node: SceneNode) {
  const peers = scene.nodes.filter(
    (candidate) => (candidate.level ?? 0) === (node.level ?? 0),
  );
  const index = Math.max(
    0,
    peers.findIndex((candidate) => candidate.id === node.id),
  );
  return {
    x: 150 + index * 235,
    y: GRAPH_LEVEL_Y[node.level ?? 0],
  };
}

function getPosition(scene: Scene, node: SceneNode) {
  return node.ui ?? fallbackPosition(scene, node);
}

function center(scene: Scene, node: SceneNode) {
  const position = getPosition(scene, node);
  return {
    x: position.x + NODE_W / 2,
    y: position.y + NODE_H / 2,
  };
}

function canvasWidth(scene: Scene) {
  const maxX = scene.nodes.reduce((max, node) => {
    const position = getPosition(scene, node);
    return Math.max(max, position.x + NODE_W + 80);
  }, MIN_WIDTH);
  return Math.max(MIN_WIDTH, maxX);
}

export function SceneMap({
  scene,
  onChange,
  activeMatch,
}: {
  scene: Scene;
  onChange: (scene: Scene) => void;
  activeMatch?: PatternMatch | null;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<{
    nodeId: string;
    offsetX: number;
    offsetY: number;
    moved: boolean;
  } | null>(null);

  const [mode, setMode] = useState<GraphMode>("move");
  const [edgeType, setEdgeType] = useState<EdgeType>("requires");
  const [linkSource, setLinkSource] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);

  const width = useMemo(() => canvasWidth(scene), [scene]);
  const motifNodes = useMemo(
    () => new Set(activeMatch?.nodeIds ?? []),
    [activeMatch],
  );
  const motifEdges = useMemo(
    () => new Set(activeMatch?.edgeIds ?? []),
    [activeMatch],
  );

  function clientToSvg(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / Math.max(1, rect.width)) * width,
      y:
        ((clientY - rect.top) / Math.max(1, rect.height)) *
        CANVAS_HEIGHT,
    };
  }

  function beginDrag(
    event: ReactPointerEvent<SVGGElement>,
    node: SceneNode,
  ) {
    if (mode !== "move") return;
    const point = clientToSvg(event.clientX, event.clientY);
    const position = getPosition(scene, node);
    dragRef.current = {
      nodeId: node.id,
      offsetX: point.x - position.x,
      offsetY: point.y - position.y,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedNode(node.id);
    setSelectedEdge(null);
  }

  function dragNode(event: ReactPointerEvent<SVGSVGElement>) {
    const drag = dragRef.current;
    if (!drag || mode !== "move") return;
    const point = clientToSvg(event.clientX, event.clientY);
    drag.moved = true;
    onChange(
      moveSceneNode(
        scene,
        drag.nodeId,
        point.x - drag.offsetX,
        point.y - drag.offsetY,
      ),
    );
  }

  function endDrag() {
    const drag = dragRef.current;
    if (!drag) return;
    const node = scene.nodes.find((candidate) => candidate.id === drag.nodeId);
    if (node?.ui && drag.moved) {
      onChange(
        setSceneNodeLevel(scene, node.id, nearestLogicalLevel(node.ui.y)),
      );
    }
    dragRef.current = null;
  }

  function chooseNode(nodeId: string) {
    setSelectedNode(nodeId);
    setSelectedEdge(null);
    if (mode !== "connect") return;

    if (!linkSource) {
      setLinkSource(nodeId);
      return;
    }

    if (linkSource === nodeId) {
      setLinkSource(null);
      return;
    }

    onChange(addSceneEdge(scene, linkSource, nodeId, edgeType));
    setLinkSource(null);
  }

  function deleteSelection() {
    if (selectedEdge) {
      onChange(removeSceneEdge(scene, selectedEdge));
      setSelectedEdge(null);
      return;
    }
    if (selectedNode) {
      onChange(removeSceneNode(scene, selectedNode));
      if (linkSource === selectedNode) setLinkSource(null);
      setSelectedNode(null);
    }
  }

  return (
    <div className="graphEditor">
      <div className="graphToolbar">
        <div className="segmented" aria-label="Режим карты">
          <button
            type="button"
            className={mode === "move" ? "active" : ""}
            onClick={() => {
              setMode("move");
              setLinkSource(null);
            }}
          >
            Двигать
          </button>
          <button
            type="button"
            className={mode === "connect" ? "active" : ""}
            onClick={() => setMode("connect")}
          >
            Связывать
          </button>
        </div>

        <label className="edgeTypeControl">
          <span>Связь</span>
          <select
            value={edgeType}
            onChange={(event) =>
              setEdgeType(event.target.value as EdgeType)
            }
          >
            {[
              "sends",
              "interpretsAs",
              "requires",
              "forbids",
              "sanctions",
              "permits",
              "blocks",
              "dependsOn",
              "escalates",
              "reinforces",
              "contradicts",
              "reframes",
              "exitsTo",
              "updates",
            ].map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>

        <div className="graphHint">
          {activeMatch
            ? `Подсвечен мотив: ${activeMatch.label}`
            : mode === "move"
              ? "Тяни узел. Вертикальное перемещение меняет логический уровень."
              : linkSource
                ? "Теперь выбери узел назначения."
                : "Выбери источник, затем узел назначения."}
        </div>

        <button
          type="button"
          className="dangerButton"
          disabled={!selectedNode && !selectedEdge}
          onClick={deleteSelection}
        >
          Удалить выбранное
        </button>
      </div>

      <div className="mapWrap">
        <svg
          ref={svgRef}
          className={`sceneMap mode-${mode}`}
          viewBox={`0 0 ${width} ${CANVAS_HEIGHT}`}
          style={{ minWidth: Math.min(width, 1180) }}
          role="img"
          aria-label="Интерактивная карта логических уровней сцены"
          onPointerMove={dragNode}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
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

          {([0, 1, 2, 3, 4] as const).map((level) => (
            <g key={level}>
              <rect
                x="18"
                y={GRAPH_LEVEL_Y[level] - 26}
                width={width - 36}
                height="98"
                rx="14"
                className="levelBand"
              />
              <text
                x="34"
                y={GRAPH_LEVEL_Y[level] - 7}
                className="levelLabel"
              >
                L{level}
              </text>
            </g>
          ))}

          {scene.edges.map((edge) => {
            const from = scene.nodes.find((node) => node.id === edge.from);
            const to = scene.nodes.find((node) => node.id === edge.to);
            if (!from || !to) return null;
            const a = center(scene, from);
            const b = center(scene, to);
            const selected = selectedEdge === edge.id;
            const motif = motifEdges.has(edge.id);

            return (
              <g key={edge.id}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  className={`${edgeClass(edge)} ${selected ? "selected" : ""} ${motif ? "motif" : ""}`}
                  markerEnd="url(#arrow)"
                />
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  className="edgeHit"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedEdge(edge.id);
                    setSelectedNode(null);
                  }}
                />
                <text
                  x={(a.x + b.x) / 2}
                  y={(a.y + b.y) / 2 - 7}
                  className={`edgeLabel ${motif ? "motif" : ""}`}
                >
                  {edge.type}
                </text>
              </g>
            );
          })}

          {scene.nodes.map((node) => {
            const position = getPosition(scene, node);
            const selected = selectedNode === node.id;
            const source = linkSource === node.id;
            const motif = motifNodes.has(node.id);

            return (
              <g
                key={node.id}
                transform={`translate(${position.x} ${position.y})`}
                className={`graphNode ${selected ? "selected" : ""} ${source ? "source" : ""} ${motif ? "motif" : ""}`}
                onPointerDown={(event) => beginDrag(event, node)}
                onClick={(event) => {
                  event.stopPropagation();
                  if (!dragRef.current?.moved) chooseNode(node.id);
                  else setSelectedNode(node.id);
                }}
              >
                <rect
                  width={NODE_W}
                  height={NODE_H}
                  rx="12"
                  className={`nodeRect ${node.type}`}
                />
                <foreignObject x="0" y="0" width={NODE_W} height={NODE_H}>
                  <div className="nodeLabel">
                    <div className="nodeType">
                      {node.type} · L{node.level ?? "?"} · {node.epistemic}
                    </div>
                    <div>{node.label}</div>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="graphLegend">
        <span><i className="legendLine contradiction" /> contradicts</span>
        <span><i className="legendLine blocking" /> blocks</span>
        <span><i className="legendLine feedback" /> feedback / update</span>
        <span><i className="legendNode motif" /> найденный мотив</span>
      </div>
    </div>
  );
}
