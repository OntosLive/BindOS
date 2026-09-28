"use client";

import { useMemo, useState } from "react";
import { createId, removeSceneOperator } from "@/lib/bindos/graph";
import {
  collectReferenceFootprint,
  inspectLogicalTypes,
  logicalTypeSignature,
  referenceOptions,
} from "@/lib/bindos/logical-types";
import type {
  OperatorType,
  Scene,
  SceneReferenceKind,
} from "@/lib/bindos/types";

const operatorTypes: OperatorType[] = [
  "classifies",
  "governs",
  "permits",
  "forbids",
  "sanctions",
  "reframes",
  "updates",
  "blocks",
];

const targetKinds: SceneReferenceKind[] = ["node", "edge", "operator"];

export function LogicalTypePanel({
  scene,
  onChange,
  onFocus,
}: {
  scene: Scene;
  onChange: (scene: Scene) => void;
  onFocus: (focus: { nodeIds: string[]; edgeIds: string[] }) => void;
}) {
  const [operatorType, setOperatorType] = useState<OperatorType>("reframes");
  const [label, setLabel] = useState("");
  const [sourceNodeId, setSourceNodeId] = useState("");
  const [targetKind, setTargetKind] = useState<SceneReferenceKind>("edge");
  const [targetId, setTargetId] = useState("");

  const inspection = useMemo(() => inspectLogicalTypes(scene), [scene]);
  const options = useMemo(
    () => referenceOptions(scene, targetKind),
    [scene, targetKind],
  );

  function addOperator(event: React.FormEvent) {
    event.preventDefault();
    const text = label.trim();
    if (!text || !targetId) return;

    onChange({
      ...scene,
      operators: [
        ...(scene.operators ?? []),
        {
          id: createId("op"),
          type: operatorType,
          label: text,
          sourceNodeId: sourceNodeId || undefined,
          target: { kind: targetKind, id: targetId },
          epistemic: "observed",
        },
      ],
    });

    setLabel("");
    setTargetId("");
  }

  function focusOperator(id: string) {
    const footprint = collectReferenceFootprint(scene, {
      kind: "operator",
      id,
    });
    onFocus({
      nodeIds: footprint.nodeIds,
      edgeIds: footprint.edgeIds,
    });
  }

  return (
    <div className="logicalTypeLayout">
      <div className="logicalTypeMain">
        <div className="logicalTypeHeader">
          <div>
            <div className="eyebrow">Russell type system</div>
            <h2>Логические типы, а не этажи интерфейса</h2>
            <p className="muted">
              τ0 — объекты сцены. τ1 — отношения над объектами. Оператор,
              действующий на τn, получает тип τ(n+1). Тип вычисляется по
              мишени оператора, а не назначается по смысловому названию.
            </p>
          </div>
          <div className="signatureBox">
            <span>Типовой профиль</span>
            <strong>{logicalTypeSignature(scene)}</strong>
          </div>
        </div>

        <div className="typeBuckets">
          {Array.from({ length: inspection.maxRank + 1 }, (_, rank) => (
            <section className="typeBucket" key={rank}>
              <div className="typeRank">τ{rank}</div>
              <div className="typeItems">
                {(inspection.buckets[rank] ?? []).map((entry) => (
                  <div className="typeItem" key={`${entry.ref.kind}:${entry.ref.id}`}>
                    <span>{entry.ref.kind}</span>
                    <strong>{entry.label}</strong>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {inspection.issues.length > 0 && (
          <div className="typeIssues">
            <strong>Type errors</strong>
            {inspection.issues.map((issue) => (
              <div key={issue.message}>{issue.message}</div>
            ))}
          </div>
        )}
      </div>

      <aside className="logicalTypeSide">
        <form className="operatorForm" onSubmit={addOperator}>
          <div className="eyebrow">Новый метаоператор</div>
          <label>
            <span>Операция</span>
            <select
              value={operatorType}
              onChange={(event) =>
                setOperatorType(event.target.value as OperatorType)
              }
            >
              {operatorTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Носитель правила, необязательно</span>
            <select
              value={sourceNodeId}
              onChange={(event) => setSourceNodeId(event.target.value)}
            >
              <option value="">Без отдельного node</option>
              {scene.nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.type}: {node.label}
                </option>
              ))}
            </select>
          </label>

          <div className="twoCols">
            <label>
              <span>Мишень</span>
              <select
                value={targetKind}
                onChange={(event) => {
                  setTargetKind(event.target.value as SceneReferenceKind);
                  setTargetId("");
                }}
              >
                {targetKinds.map((kind) => (
                  <option key={kind}>{kind}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Объект</span>
              <select
                value={targetId}
                onChange={(event) => setTargetId(event.target.value)}
              >
                <option value="">Выбрать</option>
                {options.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            <span>Что делает оператор</span>
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Например: выполнение по просьбе считается неспонтанным"
            />
          </label>

          <button className="primaryButton compact" type="submit">
            Добавить метаоператор
          </button>
        </form>

        <div className="operatorList">
          <div className="eyebrow">Операторы сцены</div>
          {(scene.operators ?? []).length ? (
            (scene.operators ?? []).map((operator) => {
              const entry = inspection.entries.find(
                (item) =>
                  item.ref.kind === "operator" && item.ref.id === operator.id,
              );
              return (
                <div className="operatorRow" key={operator.id}>
                  <button
                    type="button"
                    className="operatorFocus"
                    onClick={() => focusOperator(operator.id)}
                  >
                    <span>τ{entry?.rank ?? "?"} · {operator.type}</span>
                    <strong>{operator.label}</strong>
                    <small>
                      → {operator.target.kind}:{operator.target.id}
                    </small>
                  </button>
                  <button
                    type="button"
                    className="tinyButton"
                    onClick={() => {
                      onFocus({ nodeIds: [], edgeIds: [] });
                      onChange(removeSceneOperator(scene, operator.id));
                    }}
                    aria-label="Удалить метаоператор"
                  >
                    ×
                  </button>
                </div>
              );
            })
          ) : (
            <div className="muted">Метаоператоров пока нет.</div>
          )}
        </div>
      </aside>
    </div>
  );
}
