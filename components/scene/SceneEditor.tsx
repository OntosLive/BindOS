"use client";

import { useMemo, useState } from "react";
import type {
  EdgeType,
  GateStatus,
  GateType,
  LogicalLevel,
  MoveKind,
  NodeType,
  Scene,
} from "@/lib/bindos/types";

const nodeTypes: NodeType[] = [
  "Event",
  "Message",
  "Interpretation",
  "Rule",
  "MetaRule",
  "Gate",
  "Sanction",
  "Context",
  "State",
];

const edgeTypes: EdgeType[] = [
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
];

const levels: LogicalLevel[] = [0, 1, 2, 3, 4];
const moveKinds: MoveKind[] = ["action", "meta", "exit"];
const gateTypes: GateType[] = ["action", "meta", "exit", "interpretation"];
const gateStatuses: GateStatus[] = ["open", "closed", "conditional"];

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function SceneEditor({
  scene,
  onChange,
}: {
  scene: Scene;
  onChange: (scene: Scene) => void;
}) {
  const [nodeType, setNodeType] = useState<NodeType>("Message");
  const [nodeLabel, setNodeLabel] = useState("");
  const [nodeLevel, setNodeLevel] = useState<LogicalLevel>(1);
  const [gateType, setGateType] = useState<GateType>("meta");
  const [gateStatus, setGateStatus] = useState<GateStatus>("closed");
  const [severity, setSeverity] = useState(1);

  const [edgeFrom, setEdgeFrom] = useState("");
  const [edgeTo, setEdgeTo] = useState("");
  const [edgeType, setEdgeType] = useState<EdgeType>("requires");

  const [moveLabel, setMoveLabel] = useState("");
  const [moveKind, setMoveKind] = useState<MoveKind>("action");
  const [moveLevel, setMoveLevel] = useState<LogicalLevel>(0);
  const [moveSanction, setMoveSanction] = useState("");
  const [moveGate, setMoveGate] = useState("");

  const sanctions = useMemo(
    () => scene.nodes.filter((node) => node.type === "Sanction"),
    [scene.nodes],
  );
  const gates = useMemo(
    () => scene.nodes.filter((node) => node.type === "Gate"),
    [scene.nodes],
  );

  function addNode(event: React.FormEvent) {
    event.preventDefault();
    const label = nodeLabel.trim();
    if (!label) return;

    const metadata =
      nodeType === "Gate"
        ? { gateType, gateStatus }
        : nodeType === "Sanction"
          ? { severity: Math.max(0, severity) }
          : undefined;

    onChange({
      ...scene,
      nodes: [
        ...scene.nodes,
        {
          id: uid("node"),
          type: nodeType,
          label,
          epistemic: "observed",
          level: nodeLevel,
          metadata,
        },
      ],
    });
    setNodeLabel("");
  }

  function addEdge(event: React.FormEvent) {
    event.preventDefault();
    if (!edgeFrom || !edgeTo || edgeFrom === edgeTo) return;
    onChange({
      ...scene,
      edges: [
        ...scene.edges,
        { id: uid("edge"), from: edgeFrom, to: edgeTo, type: edgeType },
      ],
    });
  }

  function addMove(event: React.FormEvent) {
    event.preventDefault();
    const label = moveLabel.trim();
    if (!label) return;

    onChange({
      ...scene,
      moves: [
        ...scene.moves,
        {
          id: uid("move"),
          label,
          kind: moveKind,
          level: moveLevel,
          sanctionIds: moveSanction ? [moveSanction] : [],
          blockedByGateIds: moveGate ? [moveGate] : [],
        },
      ],
    });
    setMoveLabel("");
    setMoveSanction("");
    setMoveGate("");
  }

  function removeNode(id: string) {
    onChange({
      ...scene,
      nodes: scene.nodes.filter((node) => node.id !== id),
      edges: scene.edges.filter((edge) => edge.from !== id && edge.to !== id),
      moves: scene.moves.map((move) => ({
        ...move,
        sanctionIds: (move.sanctionIds ?? []).filter((item) => item !== id),
        blockedByGateIds: (move.blockedByGateIds ?? []).filter((item) => item !== id),
        violatesRuleIds: (move.violatesRuleIds ?? []).filter((item) => item !== id),
      })),
    });
  }

  return (
    <div className="editorGrid">
      <form className="editorPanel" onSubmit={addNode}>
        <div className="eyebrow">Добавить узел</div>
        <label>
          <span>Тип</span>
          <select value={nodeType} onChange={(e) => setNodeType(e.target.value as NodeType)}>
            {nodeTypes.map((type) => <option key={type}>{type}</option>)}
          </select>
        </label>
        <label>
          <span>Подпись</span>
          <input value={nodeLabel} onChange={(e) => setNodeLabel(e.target.value)} placeholder="Что действует в сцене?" />
        </label>
        <label>
          <span>Логический уровень</span>
          <select value={nodeLevel} onChange={(e) => setNodeLevel(Number(e.target.value) as LogicalLevel)}>
            {levels.map((level) => <option key={level} value={level}>L{level}</option>)}
          </select>
        </label>
        {nodeType === "Gate" && (
          <div className="twoCols">
            <label>
              <span>Gate</span>
              <select value={gateType} onChange={(e) => setGateType(e.target.value as GateType)}>
                {gateTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            <label>
              <span>Статус</span>
              <select value={gateStatus} onChange={(e) => setGateStatus(e.target.value as GateStatus)}>
                {gateStatuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
          </div>
        )}
        {nodeType === "Sanction" && (
          <label>
            <span>Вес санкции</span>
            <input type="number" min="0" step="1" value={severity} onChange={(e) => setSeverity(Number(e.target.value) || 0)} />
          </label>
        )}
        <button className="primaryButton compact" type="submit">Добавить узел</button>
      </form>

      <form className="editorPanel" onSubmit={addEdge}>
        <div className="eyebrow">Связать узлы</div>
        <label>
          <span>Откуда</span>
          <select value={edgeFrom} onChange={(e) => setEdgeFrom(e.target.value)}>
            <option value="">Выбрать узел</option>
            {scene.nodes.map((node) => <option key={node.id} value={node.id}>{node.type}: {node.label}</option>)}
          </select>
        </label>
        <label>
          <span>Тип связи</span>
          <select value={edgeType} onChange={(e) => setEdgeType(e.target.value as EdgeType)}>
            {edgeTypes.map((type) => <option key={type}>{type}</option>)}
          </select>
        </label>
        <label>
          <span>Куда</span>
          <select value={edgeTo} onChange={(e) => setEdgeTo(e.target.value)}>
            <option value="">Выбрать узел</option>
            {scene.nodes.map((node) => <option key={node.id} value={node.id}>{node.type}: {node.label}</option>)}
          </select>
        </label>
        <button className="primaryButton compact" type="submit">Добавить связь</button>
      </form>

      <form className="editorPanel" onSubmit={addMove}>
        <div className="eyebrow">Добавить ход</div>
        <label>
          <span>Ход</span>
          <input value={moveLabel} onChange={(e) => setMoveLabel(e.target.value)} placeholder="Например: отказаться" />
        </label>
        <div className="twoCols">
          <label>
            <span>Тип</span>
            <select value={moveKind} onChange={(e) => setMoveKind(e.target.value as MoveKind)}>
              {moveKinds.map((kind) => <option key={kind}>{kind}</option>)}
            </select>
          </label>
          <label>
            <span>Уровень</span>
            <select value={moveLevel} onChange={(e) => setMoveLevel(Number(e.target.value) as LogicalLevel)}>
              {levels.map((level) => <option key={level} value={level}>L{level}</option>)}
            </select>
          </label>
        </div>
        <label>
          <span>Санкция</span>
          <select value={moveSanction} onChange={(e) => setMoveSanction(e.target.value)}>
            <option value="">Нет</option>
            {sanctions.map((node) => <option key={node.id} value={node.id}>{node.label}</option>)}
          </select>
        </label>
        <label>
          <span>Блокирующий Gate</span>
          <select value={moveGate} onChange={(e) => setMoveGate(e.target.value)}>
            <option value="">Нет</option>
            {gates.map((node) => <option key={node.id} value={node.id}>{node.label}</option>)}
          </select>
        </label>
        <button className="primaryButton compact" type="submit">Добавить ход</button>
      </form>

      <div className="editorPanel">
        <div className="eyebrow">Узлы сцены</div>
        <div className="structureList">
          {scene.nodes.map((node) => (
            <div className="structureRow" key={node.id}>
              <div>
                <strong>{node.type} · L{node.level ?? "?"}</strong>
                <span>{node.label}</span>
              </div>
              <button type="button" className="tinyButton" onClick={() => removeNode(node.id)}>×</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
