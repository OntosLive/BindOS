import { describe, expect, it } from "vitest";
import {
  deriveMoveVector,
  primitiveSignature,
  projectToPrimitives,
} from "./primitive-model";
import { presencePressureScene } from "./channel-samples";
import { spontaneousScene } from "./sample";

describe("minimal primitive model", () => {
  it("projects an existing scene into the five primitives", () => {
    const projection = projectToPrimitives(spontaneousScene);
    expect(projection.entities.length).toBeGreaterThan(0);
    expect(projection.relations.length).toBeGreaterThan(0);
    expect(projection.operators.length).toBeGreaterThan(0);
    expect(primitiveSignature(spontaneousScene)).toContain("E");
  });

  it("derives channel weights instead of storing channel hierarchy", () => {
    const projection = projectToPrimitives(presencePressureScene);
    const gaze = projection.channels.find((item) => item.name === "gaze");
    const verbal = projection.channels.find((item) => item.name === "verbal");
    expect(gaze).toBeTruthy();
    expect(verbal).toBeTruthy();
    expect(Math.abs(gaze!.netWeight)).toBeGreaterThan(
      Math.abs(verbal!.netWeight),
    );
  });

  it("derives move cost from primitive weighted operators", () => {
    const vector = deriveMoveVector(presencePressureScene);
    const refuse = vector.find((item) => item.id === "refuse");
    expect(refuse).toBeTruthy();
    expect(refuse!.cost).toBeGreaterThan(40);
  });
});
