"use client";

import { useMemo, useState } from "react";
import { analyzeScene } from "@/lib/bindos/engine";
import {
  matchScene,
  sceneSignature,
  type PatternMatch,
} from "@/lib/bindos/matcher";
import { spontaneousScene } from "@/lib/bindos/sample";
import {
  guiltCompensationScene,
  pursuerDistancerScene,
  rescueDependencyScene,
} from "@/lib/bindos/temporal-samples";
import { trajectorySignature, matchTrajectory } from "@/lib/bindos/trajectory";
import type { GateStatus, Scene } from "@/lib/bindos/types";
import { SceneEditor } from "./SceneEditor";
import { SceneMap } from "./SceneMap";
import { TrajectoryPanel } from "./TrajectoryPanel";

function setGate(scene: Scene, gateId: string, gateStatus: GateStatus): Scene {
  return {
    ...scene,
    nodes: scene.nodes.map((node) =>
      node.id === gateId
        ? { ...node, metadata: { ...node.metadata, gateStatus } }
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
  return scene.nodes.find((node) => node.id === id)?.metadata?.gateStatus === "open";
}

function makeEmptyScene(): Scene {
  return {
    id: "untitled-scene",
    title: "Новая сцена",
    actors: [],
    nodes: [],
    edges: [],
    moves: [],
    timeline: [],
  };
}

const breakpointText = {
  B0: "Есть ход внутри текущих правил.",
  B2: "Нужно вынести правило в явную метакоммуникацию.",
  B3: "Нужно изменить правило о том, как можно обсуждать правила.",
  B4: "Нужно изменить или покинуть сам контекст сцены.",
};

export function SceneWorkbench() {
  const [scene, setScene] = useState<Scene>(spontaneousScene);
  const [editorOpen, setEditorOpen] = useState(false);
  const [activePatternId, setActivePatternId] = useState<string | null>(null);

  const analysis = useMemo(() => analyzeScene(scene), [scene]);
  const matches = useMemo(() => matchScene(scene), [scene]);
  const dynamicMatches = useMemo(() => matchTrajectory(scene), [scene]);
  const staticSignature = useMemo(() => sceneSignature(matches), [matches]);
  const temporalSignature = useMemo(
    () => trajectorySignature(dynamicMatches),
    [dynamicMatches],
  );
  const signature =
    temporalSignature === "∅"
      ? staticSignature
      : staticSignature === "∅"
        ? temporalSignature
        : `${staticSignature} | ${temporalSignature}`;

  const activeMatch: PatternMatch | null =
    matches.find((match) => match.id === activePatternId) ??
    matches[0] ??
    null;

  const metaOpen = gateIsOpen(scene, "meta-gate");
  const exitOpen = gateIsOpen(scene, "exit-gate");
  const hasCanonicalGates = scene.nodes.some(
    (node) => node.id === "meta-gate" || node.id === "exit-gate",
  );

  function replaceScene(next: Scene) {
    setScene(next);
    setActivePatternId(null);
  }

  return (
    <section className="workbench">
      <div className="summaryGrid">
        <div className="panel">
          <div className="eyebrow">Kernel output</div>
          <h2 className="analysisTitle">{analysis.label}</h2>
          <p className="muted">{analysis.explanation}</p>

          <div className="signatureBox">
            <span>Сигнатура сцены</span>
            <strong>{signature}</strong>
          </div>

          <div className="statusRow">
            <span className="badge">conflict: {analysis.hasRuleConflict ? "yes" : "no"}</span>
            <span className="badge">clean L0: {analysis.cleanActionMoves}</span>
            <span className={`badge ${analysis.metaEscape ? "clean" : "blocked"}`}>
              meta: {analysis.metaEscape ? "open" : "closed"}
            </span>
            <span className={`badge ${analysis.exitEscape ? "clean" : "blocked"}`}>
              exit: {analysis.exitEscape ? "open" : "closed"}
            </span>
            <span className="badge">time: {scene.timeline?.length ?? 0}</span>
          </div>

          <div className="breakpoint">
            <strong>Lowest breakpoint · {analysis.lowestBreakpoint}</strong>
            <div className="muted">{breakpointText[analysis.lowestBreakpoint]}</div>
          </div>

          <div className="patternMatches">
            <div className="eyebrow">Executable motif matches</div>
            {matches.length ? (
              matches.map((match) => (
                <button
                  type="button"
                  className={`patternMatchButton ${activeMatch?.id === match.id ? "active" : ""}`}
                  key={match.id}
                  onClick={() => setActivePatternId(match.id)}
                >
                  <span>
                    <strong>{match.label}</strong>
                    <small>{match.family}</small>
                  </span>
                  <em>{match.nodeIds.length} nodes · {match.edgeIds.length} edges</em>
                </button>
              ))
            ) : (
              <div className="muted">Статических мотивов пока не найдено.</div>
            )}
          </div>

          {activeMatch && (
            <div className="motifInspector">
              <div className="eyebrow">Selected motif</div>
              <strong>{activeMatch.label}</strong>
              <p>{activeMatch.invariant}</p>
              <details>
                <summary>Показать структурное доказательство</summary>
                <ul>
                  {activeMatch.evidence.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </details>
            </div>
          )}
        </div>

        <div className="panel controls">
          <div className="eyebrow">Управление сценой</div>
          {hasCanonicalGates && (
            <>
              <button className="controlButton" data-open={metaOpen} onClick={() => replaceScene(toggleGate(scene, "meta-gate"))} type="button">
                <span>MetaGate</span><strong>{metaOpen ? "OPEN" : "CLOSED"}</strong>
              </button>
              <button className="controlButton" data-open={exitOpen} onClick={() => replaceScene(toggleGate(scene, "exit-gate"))} type="button">
                <span>ExitGate</span><strong>{exitOpen ? "OPEN" : "CLOSED"}</strong>
              </button>
            </>
          )}
          <button className="controlButton" onClick={() => setEditorOpen((value) => !value)} type="button">
            <span>Формы / таблица</span><strong>{editorOpen ? "CLOSE" : "OPEN"}</strong>
          </button>
          <button className="controlButton" onClick={() => replaceScene(makeEmptyScene())} type="button">
            <span>Пустая сцена</span><strong>NEW</strong>
          </button>
          <button className="controlButton" onClick={() => replaceScene(spontaneousScene)} type="button">
            <span>Double Bind</span><strong>LOAD</strong>
          </button>
          <button className="controlButton" onClick={() => replaceScene(pursuerDistancerScene)} type="button">
            <span>Pursuer–Distancer</span><strong>TIME</strong>
          </button>
          <button className="controlButton" onClick={() => replaceScene(rescueDependencyScene)} type="button">
            <span>Rescue–Dependency</span><strong>TIME</strong>
          </button>
          <button className="controlButton" onClick={() => replaceScene(guiltCompensationScene)} type="button">
            <span>Guilt–Compensation</span><strong>TIME</strong>
          </button>
        </div>
      </div>

      <div className="panel topologyPanel">
        <div className="sectionIntro">
          <div className="eyebrow">Topology editor</div>
          <h2>Машина внутри сцены</h2>
          <p className="muted">
            Статический граф показывает структуру. Временная дорожка ниже показывает,
            как структура разворачивается и самоподдерживается.
          </p>
        </div>
        <SceneMap scene={scene} onChange={replaceScene} activeMatch={activeMatch} />
      </div>

      <div className="panel">
        <TrajectoryPanel scene={scene} onChange={replaceScene} />
      </div>

      {editorOpen && (
        <div className="panel">
          <div className="sectionIntro">
            <div className="eyebrow">Scene compiler</div>
            <h2>Точная разметка</h2>
            <p className="muted">Формы остаются вторым входом для санкций, gates и ходов.</p>
          </div>
          <SceneEditor scene={scene} onChange={replaceScene} />
        </div>
      )}

      <div className="panel">
        <div className="eyebrow">Moves</div>
        <div className="moves">
          {analysis.moves.map((item) => (
            <div className="move" key={item.move.id}>
              <div>
                <strong>{item.move.label}</strong>
                <div className="muted">
                  {item.reasons.length ? item.reasons.join(" · ") : "ограничений не найдено"}
                </div>
              </div>
              <span className={`badge ${item.status}`}>
                {item.status.toUpperCase()}
                {item.effectiveCost > 0 ? ` · cost ${item.effectiveCost}` : ""}
              </span>
            </div>
          ))}
          {!analysis.moves.length && <div className="muted">Ходов пока нет.</div>}
        </div>
      </div>
    </section>
  );
}
