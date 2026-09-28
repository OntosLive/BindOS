"use client";

import { useEffect, useMemo, useState } from "react";
import {
  communicationChannels,
  evaluateOperatorInfluence,
  transitionFieldForScene,
} from "@/lib/bindos/channels";
import { createId, removeSceneOperator } from "@/lib/bindos/graph";
import type {
  CommunicationChannel,
  CostReality,
  InfluenceDirection,
  Scene,
} from "@/lib/bindos/types";

export function ChannelFieldPanel({
  scene,
  onChange,
}: {
  scene: Scene;
  onChange: (scene: Scene) => void;
}) {
  const [moveId, setMoveId] = useState(scene.moves[0]?.id ?? "");
  const [channel, setChannel] =
    useState<CommunicationChannel>("verbal");
  const [direction, setDirection] =
    useState<InfluenceDirection>("cost");
  const [reality, setReality] = useState<CostReality>("expected");
  const [magnitude, setMagnitude] = useState(20);
  const [conductance, setConductance] = useState(0.8);
  const [gain, setGain] = useState(1);
  const [label, setLabel] = useState("");
  const [sourceActorId, setSourceActorId] = useState("");
  const [targetActorId, setTargetActorId] = useState("");

  useEffect(() => {
    if (!scene.moves.some((move) => move.id === moveId)) {
      setMoveId(scene.moves[0]?.id ?? "");
    }
  }, [scene.moves, moveId]);

  const fields = useMemo(() => transitionFieldForScene(scene), [scene]);
  const fieldOperators = useMemo(
    () => (scene.operators ?? []).filter((operator) => operator.influence),
    [scene],
  );

  function addInfluence(event: React.FormEvent) {
    event.preventDefault();
    const text = label.trim();
    if (!text || !moveId) return;

    onChange({
      ...scene,
      operators: [
        ...(scene.operators ?? []),
        {
          id: createId("op-channel"),
          type: direction === "cost" ? "sanctions" : "permits",
          label: text,
          sourceActorId: sourceActorId || undefined,
          targetActorId: targetActorId || undefined,
          channel,
          target: { kind: "move", id: moveId },
          influence: {
            moveId,
            direction,
            magnitude: Math.max(0, magnitude),
            conductance: Math.min(1, Math.max(0, conductance)),
            gain: Math.max(0, gain),
            reality,
          },
          epistemic: "observed",
        },
      ],
    });

    setLabel("");
  }

  return (
    <div className="channelFieldLayout">
      <div className="channelFieldMain">
        <div className="channelHeader">
          <div>
            <div className="eyebrow">Channel × Type × Cost</div>
            <h2>Поле доступности перехода</h2>
            <p className="muted">
              Слова, взгляд, просодия, дистанция, группа и среда могут
              одновременно менять стоимость одного и того же хода.
              Expected cost действует ещё до фактической санкции.
            </p>
          </div>
          <div className="fieldFormula">
            <span>ΔC</span>
            <strong>magnitude × conductance × gain</strong>
          </div>
        </div>

        <div className="transitionCards">
          {fields.length ? (
            fields.map((field) => {
              const move = scene.moves.find(
                (item) => item.id === field.moveId,
              );
              const sortedChannels = Object.entries(field.byChannel)
                .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));

              return (
                <article className="transitionCard" key={field.moveId}>
                  <div className="transitionCardHead">
                    <div>
                      <span>MOVE</span>
                      <strong>{move?.label ?? field.moveId}</strong>
                    </div>
                    <div className="transitionNet">
                      <span>net field</span>
                      <strong>
                        {field.netDelta >= 0 ? "+" : ""}
                        {field.netDelta.toFixed(1)}
                      </strong>
                    </div>
                  </div>

                  <div className="costSplit">
                    <span>
                      actual
                      <strong>
                        {field.actualDelta >= 0 ? "+" : ""}
                        {field.actualDelta.toFixed(1)}
                      </strong>
                    </span>
                    <span>
                      expected
                      <strong>
                        {field.expectedDelta >= 0 ? "+" : ""}
                        {field.expectedDelta.toFixed(1)}
                      </strong>
                    </span>
                  </div>

                  <div className="channelBars">
                    {sortedChannels.length ? (
                      sortedChannels.map(([name, value]) => (
                        <div className="channelBar" key={name}>
                          <span>{name}</span>
                          <div>
                            <i
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.abs(value),
                                )}%`,
                              }}
                            />
                          </div>
                          <strong>
                            {value >= 0 ? "+" : ""}
                            {value.toFixed(1)}
                          </strong>
                        </div>
                      ))
                    ) : (
                      <div className="muted">
                        Канальных влияний пока нет.
                      </div>
                    )}
                  </div>
                </article>
              );
            })
          ) : (
            <div className="muted">
              Сначала добавь хотя бы один Move.
            </div>
          )}
        </div>
      </div>

      <aside className="channelFieldSide">
        <form className="channelForm" onSubmit={addInfluence}>
          <div className="eyebrow">Добавить сигнал</div>

          <label>
            <span>На какой ход действует</span>
            <select
              value={moveId}
              onChange={(event) => setMoveId(event.target.value)}
            >
              <option value="">Выбрать Move</option>
              {scene.moves.map((move) => (
                <option key={move.id} value={move.id}>
                  {move.label}
                </option>
              ))}
            </select>
          </label>

          <div className="twoCols">
            <label>
              <span>Канал</span>
              <select
                value={channel}
                onChange={(event) =>
                  setChannel(
                    event.target.value as CommunicationChannel,
                  )
                }
              >
                {communicationChannels.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Эффект</span>
              <select
                value={direction}
                onChange={(event) =>
                  setDirection(
                    event.target.value as InfluenceDirection,
                  )
                }
              >
                <option value="cost">cost</option>
                <option value="relief">relief</option>
              </select>
            </label>
          </div>

          <div className="twoCols">
            <label>
              <span>Санкция</span>
              <select
                value={reality}
                onChange={(event) =>
                  setReality(event.target.value as CostReality)
                }
              >
                <option value="expected">expected</option>
                <option value="actual">actual</option>
              </select>
            </label>

            <label>
              <span>Magnitude</span>
              <input
                type="number"
                min="0"
                value={magnitude}
                onChange={(event) =>
                  setMagnitude(Number(event.target.value) || 0)
                }
              />
            </label>
          </div>

          <div className="twoCols">
            <label>
              <span>Проводимость 0–1</span>
              <input
                type="number"
                min="0"
                max="1"
                step="0.05"
                value={conductance}
                onChange={(event) =>
                  setConductance(Number(event.target.value) || 0)
                }
              />
            </label>

            <label>
              <span>Gain</span>
              <input
                type="number"
                min="0"
                step="0.1"
                value={gain}
                onChange={(event) =>
                  setGain(Number(event.target.value) || 0)
                }
              />
            </label>
          </div>

          {scene.actors.length > 0 && (
            <div className="twoCols">
              <label>
                <span>Источник</span>
                <select
                  value={sourceActorId}
                  onChange={(event) =>
                    setSourceActorId(event.target.value)
                  }
                >
                  <option value="">Не указан</option>
                  {scene.actors.map((actor) => (
                    <option key={actor.id} value={actor.id}>
                      {actor.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Получатель</span>
                <select
                  value={targetActorId}
                  onChange={(event) =>
                    setTargetActorId(event.target.value)
                  }
                >
                  <option value="">Не указан</option>
                  {scene.actors.map((actor) => (
                    <option key={actor.id} value={actor.id}>
                      {actor.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <label>
            <span>Что именно передаётся</span>
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Например: взгляд делает отказ дорогим"
            />
          </label>

          <button className="primaryButton compact" type="submit">
            Добавить в поле
          </button>
        </form>

        <div className="channelOperatorList">
          <div className="eyebrow">Активные сигналы</div>
          {fieldOperators.length ? (
            fieldOperators.map((operator) => {
              const evaluation = evaluateOperatorInfluence(operator);
              return (
                <div className="channelOperatorRow" key={operator.id}>
                  <div>
                    <span>
                      {operator.channel ?? "other"} ·{" "}
                      {operator.influence?.reality}
                    </span>
                    <strong>{operator.label}</strong>
                    <small>
                      {evaluation
                        ? `ΔC ${evaluation.delta >= 0 ? "+" : ""}${evaluation.delta.toFixed(1)}`
                        : ""}
                    </small>
                  </div>
                  <button
                    type="button"
                    className="tinyButton"
                    onClick={() =>
                      onChange(removeSceneOperator(scene, operator.id))
                    }
                    aria-label="Удалить сигнал"
                  >
                    ×
                  </button>
                </div>
              );
            })
          ) : (
            <div className="muted">Сигналов пока нет.</div>
          )}
        </div>
      </aside>
    </div>
  );
}
