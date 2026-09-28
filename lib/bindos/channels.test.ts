import { describe, expect, it } from "vitest";
import {
  evaluateOperatorInfluence,
  evaluateTransitionField,
} from "./channels";
import {
  presencePressureScene,
  textRefusalScene,
} from "./channel-samples";
import { evaluateMove } from "./engine";

describe("channel field", () => {
  it("keeps text refusal cheap when relief dominates", () => {
    const field = evaluateTransitionField(textRefusalScene, "refuse");
    expect(field.netDelta).toBeLessThan(0);
    const move = textRefusalScene.moves.find((item) => item.id === "refuse");
    expect(move).toBeTruthy();
    expect(evaluateMove(textRefusalScene, move!).effectiveCost).toBe(0);
  });

  it("makes in-person refusal costly through expected multi-channel pressure", () => {
    const field = evaluateTransitionField(presencePressureScene, "refuse");
    expect(field.expectedDelta).toBeGreaterThan(40);
    const move = presencePressureScene.moves.find(
      (item) => item.id === "refuse",
    );
    expect(move).toBeTruthy();
    expect(
      evaluateMove(presencePressureScene, move!).effectiveCost,
    ).toBeGreaterThan(40);
  });

  it("applies conductance and gain explicitly", () => {
    const operator = presencePressureScene.operators?.find(
      (item) => item.id === "presence-gaze",
    );
    expect(operator).toBeTruthy();
    expect(evaluateOperatorInfluence(operator!)?.delta).toBeCloseTo(
      34.2,
      5,
    );
  });
});
