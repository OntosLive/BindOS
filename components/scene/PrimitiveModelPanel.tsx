"use client";

import { useMemo } from "react";
import {
  deriveMoveVector,
  primitiveSignature,
  projectToPrimitives,
} from "@/lib/bindos/primitive-model";
import type { Scene } from "@/lib/bindos/types";

export function PrimitiveModelPanel({ scene }: { scene: Scene }) {
  const primitives = useMemo(() => projectToPrimitives(scene), [scene]);
  const moveVector = useMemo(() => deriveMoveVector(scene), [scene]);

  const cards = [
    {
      key: "entity",
      label: "Entity",
      value: primitives.entities.length,
      detail: "что существует в сцене",
    },
    {
      key: "relation",
      label: "Relation",
      value: primitives.relations.length,
      detail: "что с чем связано",
    },
    {
      key: "operator",
      label: "Operator",
      value: primitives.operators.length,
      detail: "что действует на что",
    },
    {
      key: "channel",
      label: "Channel",
      value: primitives.channels.length,
      detail: "через что проходит различие",
    },
    {
      key: "weight",
      label: "Weight",
      value: primitives.weights.length,
      detail: "насколько сильно действует",
    },
  ];

  return (
    <div className="primitiveModel">
      <div className="primitiveHeader">
        <div>
          <div className="eyebrow">Minimal kernel</div>
          <h2>Пять примитивов</h2>
          <p className="muted">
            Всё остальное должно быть вычислимым представлением: Russell rank,
            transition cost, dominance, meta-level, паттерн и динамика.
          </p>
        </div>
        <div className="signatureBox">
          <span>Primitive signature</span>
          <strong>{primitiveSignature(scene)}</strong>
        </div>
      </div>

      <div className="primitiveGrid">
        {cards.map((card) => (
          <article className="primitiveCard" key={card.key}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.detail}</small>
          </article>
        ))}
      </div>

      <div className="primitiveDerived">
        <div>
          <div className="eyebrow">Derived, not stored as primitive</div>
          <strong>Russell type</strong>
          <span>вычисляется из мишени оператора</span>
        </div>
        <div>
          <strong>Transition cost</strong>
          <span>вычисляется из weight × conductance × gain</span>
        </div>
        <div>
          <strong>Meta-level</strong>
          <span>возникает из operator → relation/operator</span>
        </div>
        <div>
          <strong>Hierarchy / dominance</strong>
          <span>возникает из направленности, веса и усиления</span>
        </div>
      </div>

      {moveVector.length > 0 && (
        <div className="primitiveMoveVector">
          <div className="eyebrow">Current effective move vector</div>
          <div className="moveVectorRow">
            {moveVector.map((move) => (
              <span key={move.id}>
                {move.label}
                <strong>{move.cost.toFixed(1)}</strong>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
