"use client";

import { useMemo, useState } from "react";
import { createId } from "@/lib/bindos/graph";
import {
  matchTrajectory,
  trajectorySignature,
} from "@/lib/bindos/trajectory";
import type { Scene, TemporalKind } from "@/lib/bindos/types";

const kinds: TemporalKind[] = [
  "approach",
  "withdraw",
  "rescue",
  "dependency",
  "guilt-signal",
  "compensate",
  "demand",
  "relief",
  "pressure",
  "repair-attempt",
  "criterion-set",
  "criterion-met",
  "criterion-shift",
  "other",
];

export function TrajectoryPanel({
  scene,
  onChange,
}: {
  scene: Scene;
  onChange: (scene: Scene) => void;
}) {
  const [kind, setKind] = useState<TemporalKind>("other");
  const [label, setLabel] = useState("");
  const matches = useMemo(() => matchTrajectory(scene), [scene]);
  const highlighted = new Set(matches.flatMap((match) => match.eventIds));
  const events = [...(scene.timeline ?? [])].sort((a, b) => a.t - b.t);

  function addEvent(event: React.FormEvent) {
    event.preventDefault();
    const text = label.trim();
    if (!text) return;

    const nextT = events.length ? Math.max(...events.map((item) => item.t)) + 1 : 1;
    onChange({
      ...scene,
      timeline: [
        ...(scene.timeline ?? []),
        {
          id: createId("time"),
          t: nextT,
          kind,
          label: text,
          epistemic: "observed",
        },
      ],
    });
    setLabel("");
  }

  function removeEvent(id: string) {
    onChange({
      ...scene,
      timeline: (scene.timeline ?? []).filter((event) => event.id !== id),
    });
  }

  return (
    <div className="trajectoryLayout">
      <div className="trajectoryMain">
        <div className="trajectoryHeader">
          <div>
            <div className="eyebrow">Temporal kernel</div>
            <h2>Траектория сцены</h2>
          </div>
          <div className="signatureBox">
            <span>Динамическая сигнатура</span>
            <strong>{trajectorySignature(matches)}</strong>
          </div>
        </div>

        <div className="timeline">
          {events.length ? (
            events.map((event, index) => (
              <div
                className={`timeEvent ${highlighted.has(event.id) ? "matched" : ""}`}
                key={event.id}
              >
                <div className="timeIndex">t{event.t}</div>
                <div className="timeStem" />
                <div className="timeBody">
                  <div className="timeKind">{event.kind}</div>
                  <strong>{event.label}</strong>
                  <small>{event.epistemic ?? "observed"}</small>
                </div>
                <button
                  type="button"
                  className="tinyButton"
                  aria-label={`Удалить событие ${index + 1}`}
                  onClick={() => removeEvent(event.id)}
                >
                  ×
                </button>
              </div>
            ))
          ) : (
            <div className="muted">Траектория пока пуста.</div>
          )}
        </div>
      </div>

      <aside className="trajectorySide">
        <form className="temporalForm" onSubmit={addEvent}>
          <div className="eyebrow">Добавить событие</div>
          <label>
            <span>Тип изменения</span>
            <select
              value={kind}
              onChange={(event) => setKind(event.target.value as TemporalKind)}
            >
              {kinds.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Что произошло</span>
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Например: A усиливает контакт"
            />
          </label>
          <button type="submit" className="primaryButton compact">
            Добавить во время
          </button>
        </form>

        <div className="dynamicMatches">
          <div className="eyebrow">Dynamic motifs</div>
          {matches.length ? (
            matches.map((match) => (
              <article className="dynamicMatch" key={match.id}>
                <div>
                  <strong>{match.code} · {match.label}</strong>
                  <span>{Math.round(match.strength * 100)}%</span>
                </div>
                <p>{match.invariant}</p>
                <details>
                  <summary>Траектория</summary>
                  <ol>
                    {match.evidence.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                </details>
              </article>
            ))
          ) : (
            <div className="muted">
              Пока нет повторяющейся динамической формы.
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
