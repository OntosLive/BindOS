import type {
  CommunicationChannel,
  OperatorInfluenceEvaluation,
  Scene,
  SceneOperator,
  TransitionFieldEvaluation,
} from "./types";

export const communicationChannels: CommunicationChannel[] = [
  "verbal",
  "text",
  "prosody",
  "facial",
  "gaze",
  "gesture",
  "posture",
  "proximity",
  "touch",
  "silence",
  "timing",
  "group-response",
  "environmental",
  "institutional",
  "algorithmic",
  "other",
];

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function evaluateOperatorInfluence(
  operator: SceneOperator,
): OperatorInfluenceEvaluation | null {
  const influence = operator.influence;
  if (!influence) return null;

  const magnitude = Math.max(0, influence.magnitude);
  const conductance = clamp(influence.conductance, 0, 1);
  const gain = Math.max(0, influence.gain);
  const sign = influence.direction === "cost" ? 1 : -1;

  return {
    operatorId: operator.id,
    label: operator.label,
    channel: operator.channel ?? "other",
    reality: influence.reality,
    direction: influence.direction,
    delta: sign * magnitude * conductance * gain,
  };
}

export function evaluateTransitionField(
  scene: Scene,
  moveId: string,
): TransitionFieldEvaluation {
  const contributions = (scene.operators ?? [])
    .filter((operator) => operator.influence?.moveId === moveId)
    .map(evaluateOperatorInfluence)
    .filter(
      (item): item is OperatorInfluenceEvaluation => Boolean(item),
    );

  const byChannel: TransitionFieldEvaluation["byChannel"] = {};
  let actualDelta = 0;
  let expectedDelta = 0;

  for (const item of contributions) {
    if (item.reality === "actual") actualDelta += item.delta;
    else expectedDelta += item.delta;

    byChannel[item.channel] = (byChannel[item.channel] ?? 0) + item.delta;
  }

  return {
    moveId,
    actualDelta,
    expectedDelta,
    netDelta: actualDelta + expectedDelta,
    contributions,
    byChannel,
  };
}

export function transitionFieldForScene(
  scene: Scene,
): TransitionFieldEvaluation[] {
  return scene.moves.map((move) =>
    evaluateTransitionField(scene, move.id),
  );
}
