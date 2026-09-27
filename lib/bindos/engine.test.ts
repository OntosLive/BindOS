import { describe, expect, it } from "vitest";
import { analyzeScene } from "./engine";
import { spontaneousScene } from "./sample";
import type { Scene } from "./types";

function openGate(scene: Scene, id: string): Scene {
  return {
    ...scene,
    nodes: scene.nodes.map((node) =>
      node.id === id
        ? {
            ...node,
            metadata: { ...node.metadata, gateStatus: "open" },
          }
        : node,
    ),
  };
}

describe("BindOS kernel", () => {
  it("classifies the closed spontaneous-command scene as a double bind", () => {
    const result = analyzeScene(spontaneousScene);
    expect(result.classification).toBe("double-bind");
    expect(result.cleanActionMoves).toBe(0);
    expect(result.metaEscape).toBe(false);
    expect(result.exitEscape).toBe(false);
  });

  it("moves the solution to B2 when MetaGate opens", () => {
    const result = analyzeScene(openGate(spontaneousScene, "meta-gate"));
    expect(result.classification).toBe("repairable-bind");
    expect(result.metaEscape).toBe(true);
    expect(result.lowestBreakpoint).toBe("B2");
  });

  it("exposes a context exit when ExitGate opens", () => {
    const result = analyzeScene(openGate(spontaneousScene, "exit-gate"));
    expect(result.classification).toBe("bind-with-exit");
    expect(result.exitEscape).toBe(true);
    expect(result.lowestBreakpoint).toBe("B4");
  });
});
