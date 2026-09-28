import { describe, expect, it } from "vitest";
import {
  guiltCompensationScene,
  pursuerDistancerScene,
  rescueDependencyScene,
} from "./temporal-samples";
import { matchTrajectory, trajectorySignature } from "./trajectory";

describe("temporal kernel", () => {
  it("recognizes pursuer-distancer from alternating events", () => {
    const matches = matchTrajectory(pursuerDistancerScene);
    expect(matches.some((match) => match.id === "pursuer-distancer")).toBe(true);
    expect(trajectorySignature(matches)).toContain("PD");
  });

  it("recognizes rescue-dependency as a temporal cycle", () => {
    const matches = matchTrajectory(rescueDependencyScene);
    expect(matches.some((match) => match.id === "rescue-dependency-loop")).toBe(true);
  });

  it("recognizes guilt-compensation as a temporal cycle", () => {
    const matches = matchTrajectory(guiltCompensationScene);
    expect(matches.some((match) => match.id === "guilt-compensation-loop")).toBe(true);
  });
});
