import { describe, expect, it } from "vitest";
import { matchScene, sceneSignature } from "./matcher";
import { spontaneousScene } from "./sample";
import type { Scene } from "./types";

describe("executable pattern matcher", () => {
  it("returns a concrete double-bind subgraph for the canonical sample", () => {
    const matches = matchScene(spontaneousScene);
    const match = matches.find((item) => item.id === "double-bind");

    expect(match).toBeTruthy();
    expect(match?.nodeIds).toContain("rule-comply");
    expect(match?.nodeIds).toContain("rule-spontaneous");
    expect(match?.nodeIds).toContain("meta-gate");
    expect(match?.nodeIds).toContain("exit-gate");
    expect(match?.edgeIds).toContain("e3");
    expect(sceneSignature(matches)).toContain("DB");
  });

  it("recognizes a moving-goalposts motif structurally", () => {
    const scene: Scene = {
      id: "moving-goalposts-test",
      title: "Moving goalposts",
      actors: [],
      moves: [],
      nodes: [
        {
          id: "criterion",
          type: "Rule",
          label: "Достигни X",
          epistemic: "observed",
          level: 2,
        },
        {
          id: "meta",
          type: "MetaRule",
          label: "После X требуется Y",
          epistemic: "observed",
          level: 3,
        },
      ],
      edges: [
        {
          id: "update",
          from: "meta",
          to: "criterion",
          type: "updates",
        },
      ],
    };

    const matches = matchScene(scene);
    expect(matches.some((item) => item.id === "moving-goalposts")).toBe(true);
  });
});
