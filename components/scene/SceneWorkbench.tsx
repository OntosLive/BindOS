"use client";

import { useMemo, useState } from "react";
import { analyzeScene } from "@/lib/bindos/engine";
import { spontaneousScene } from "@/lib/bindos/sample";
import type { GateStatus, Scene } from "@/lib/bindos/types";
import { SceneMap } from "./SceneMap";

function setGate(scene: Scene, gateId: string, gateStatus: GateStatus): Scene {
  return {
    ...scene,
    nodes: scene.nodes.map((node) =>
      node.id === gateId
        ? {
            ...node,
            metadata: {
              ...node.metadata,
              gateStatus,
            },
          }
        : node,
    ),
  };
}

function toggleGate(scene: Scene, gateId: string): Scene {
  const gate = scene.nodes.find((node) => node.id === gateId);
  const next = gate?.metadata?.gateStatus === "open" ? "closed" : "open";
  return setGate(scene, gateId, next);
}

function gateIsOpen(scene: Scene, id: string) {
  return (
    scene.nodes.find((node) => node.id === id)?.metadata?.gateStatus === "open"
  );
}

const breakpointText = {
  B0: "Есть ход внутри текущих правил.",
  B2: "Нужно вынести правило в явную метакоммуникацию.",
  B3: "Нужно изменить правило о том, как можно обсуждать правила.",
  B4: "Нужно изменить или покинуть сам контекст сцены.",
};

export function SceneWorkbench() {
  const [scene, setScene] = useState<Scene>(spontaneousScene);
  const analysis = useMemo(() => analyzeScene(scene), [scene]);

  const metaOpen = gateIsOpen(scene, "meta-gate");
  const exitOpen = gateIsOpen(scene, "exit-gate");

  return (
    <section className="workbench">
      <div className="summaryGrid">
        <div className="panel">
          <div className="eyebrow">Kernel output</div>
          <h2 className="analysisTitle">{analysis.label}</h2>
          <p className="muted">{analysis.explanation}</p>

          <div className="statusRow">
            <span className="badge">
              conflict: {analysis.hasRuleConflict ? "yes" : "no"}
            </span>
            <span className="badge">
              clean L0: {analysis.cleanActionMoves}
            </span>
            <span className={`badge ${analysis.metaEscape ? "clean" : "blocked"}`}>
              meta: {analysis.metaEscape ? "open" : "closed"}
            </span>
            <span className={`badge ${analysis.exitEscape ? "clean" : "blocked"}`}>
              exit: {analysis.exitEscape ? "open" : "closed"}
            </span>
          </div>

          <div className="breakpoint">
            <strong>Lowest breakpoint · {analysis.lowestBreakpoint}</strong>
            <div className="muted">
              {breakpointText[analysis.lowestBreakpoint]}
            </div>
          </div>
        </div>

        <div className="panel controls">
          <div className="eyebrow">Изменить геометрию</div>
          <button
            className="controlButton"
            data-open={metaOpen}
            onClick={() => setScene((current) => toggleGate(current, "meta-gate"))}
            type="button"
          >
            <span>MetaGate</span>
            <strong>{metaOpen ? "OPEN" : "CLOSED"}</strong>
          </button>
          <button
            className="controlButton"
            data-open={exitOpen}
            onClick={() => setScene((current) => toggleGate(current, "exit-gate"))}
            type="button"
          >
            <span>ExitGate</span>
            <strong>{exitOpen ? "OPEN" : "CLOSED"}</strong>
          </button>
          <button
            className="controlButton"
            onClick={() => setScene(spontaneousScene)}
            type="button"
          >
            <span>Вернуть исходную сцену</span>
            <strong>RESET</strong>
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="eyebrow">Topology</div>
        <SceneMap scene={scene} />
      </div>

      <div className="panel">
        <div className="eyebrow">Moves</div>
        <div className="moves">
          {analysis.moves.map((item) => (
            <div className="move" key={item.move.id}>
              <div>
                <strong>{item.move.label}</strong>
                <div className="muted">
                  {item.reasons.length
                    ? item.reasons.join(" · ")
                    : "ограничений не найдено"}
                </div>
              </div>
              <span className={`badge ${item.status}`}>
                {item.status.toUpperCase()}
                {item.effectiveCost > 0 ? ` · cost ${item.effectiveCost}` : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
