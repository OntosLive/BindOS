import { describe, expect, it } from "vitest";
import {
  inspectLogicalTypes,
  logicalTypeSignature,
  rankOfReference,
} from "./logical-types";
import { spontaneousScene } from "./sample";
import type { Scene } from "./types";

describe("Russell logical type kernel", () => {
  it("computes object, relation, meta-relation and meta-meta ranks", () => {
    expect(
      rankOfReference(spontaneousScene, { kind: "node", id: "message" }),
    ).toBe(0);
    expect(
      rankOfReference(spontaneousScene, { kind: "edge", id: "e1" }),
    ).toBe(1);
    expect(
      rankOfReference(spontaneousScene, { kind: "operator", id: "op-meaning" }),
    ).toBe(2);
    expect(
      rankOfReference(spontaneousScene, { kind: "operator", id: "op-meta-lock" }),
    ).toBe(3);

    expect(logicalTypeSignature(spontaneousScene)).toContain("τ3:1");
  });

  it("detects cyclic self-application instead of assigning a rank", () => {
    const scene: Scene = {
      id: "cycle",
      title: "cycle",
      actors: [],
      nodes: [],
      edges: [],
      moves: [],
      operators: [
        {
          id: "a",
          type: "updates",
          label: "A",
          target: { kind: "operator", id: "b" },
          epistemic: "observed",
        },
        {
          id: "b",
          type: "updates",
          label: "B",
          target: { kind: "operator", id: "a" },
          epistemic: "observed",
        },
      ],
    };

    const inspection = inspectLogicalTypes(scene);
    expect(inspection.issues.some((issue) => issue.kind === "cycle")).toBe(true);
    expect(
      rankOfReference(scene, { kind: "operator", id: "a" }),
    ).toBeNull();
  });
});
