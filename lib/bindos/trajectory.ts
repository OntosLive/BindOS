import type { Scene, TemporalEvent, TemporalKind } from "./types";

export interface DynamicMatch {
  id: string;
  label: string;
  code: string;
  invariant: string;
  eventIds: string[];
  evidence: string[];
  strength: number;
}

function ordered(scene: Scene): TemporalEvent[] {
  return [...(scene.timeline ?? [])].sort((a, b) => a.t - b.t);
}

function hasSequence(
  events: TemporalEvent[],
  kinds: TemporalKind[],
): TemporalEvent[] | null {
  const picked: TemporalEvent[] = [];
  let cursor = 0;

  for (const event of events) {
    if (event.kind !== kinds[cursor]) continue;
    picked.push(event);
    cursor += 1;
    if (cursor === kinds.length) return picked;
  }

  return null;
}

function repeatedAlternation(
  events: TemporalEvent[],
  a: TemporalKind,
  b: TemporalKind,
): TemporalEvent[] | null {
  const filtered = events.filter((event) => event.kind === a || event.kind === b);
  if (filtered.length < 4) return null;

  for (let start = 0; start <= filtered.length - 4; start += 1) {
    const slice = filtered.slice(start, start + 4);
    const patternA =
      slice[0].kind === a &&
      slice[1].kind === b &&
      slice[2].kind === a &&
      slice[3].kind === b;
    const patternB =
      slice[0].kind === b &&
      slice[1].kind === a &&
      slice[2].kind === b &&
      slice[3].kind === a;

    if (patternA || patternB) return slice;
  }

  return null;
}

export function matchTrajectory(scene: Scene): DynamicMatch[] {
  const events = ordered(scene);
  const matches: DynamicMatch[] = [];

  const pursuer = repeatedAlternation(events, "approach", "withdraw");
  if (pursuer) {
    matches.push({
      id: "pursuer-distancer",
      label: "Pursuer–Distancer",
      code: "PD",
      invariant:
        "Приближение и дистанцирование образуют взаимно усиливающуюся последовательность.",
      eventIds: pursuer.map((event) => event.id),
      evidence: pursuer.map(
        (event) => `t${event.t}: ${event.kind} → ${event.label}`,
      ),
      strength: Math.min(1, pursuer.length / 4),
    });
  }

  const rescue = hasSequence(events, [
    "dependency",
    "rescue",
    "relief",
    "dependency",
  ]);
  if (rescue) {
    matches.push({
      id: "rescue-dependency-loop",
      label: "Rescue–Dependency Loop",
      code: "RD",
      invariant:
        "Спасение производит облегчение, после которого дефицит возвращается как новая потребность в спасении.",
      eventIds: rescue.map((event) => event.id),
      evidence: rescue.map(
        (event) => `t${event.t}: ${event.kind} → ${event.label}`,
      ),
      strength: 1,
    });
  }

  const guilt = hasSequence(events, [
    "guilt-signal",
    "compensate",
    "relief",
    "guilt-signal",
  ]);
  if (guilt) {
    matches.push({
      id: "guilt-compensation-loop",
      label: "Guilt–Compensation Loop",
      code: "GC",
      invariant:
        "Сигнал вины вызывает компенсацию, временное облегчение закрепляет канал, и сигнал возникает снова.",
      eventIds: guilt.map((event) => event.id),
      evidence: guilt.map(
        (event) => `t${event.t}: ${event.kind} → ${event.label}`,
      ),
      strength: 1,
    });
  }

  const goalposts = hasSequence(events, [
    "criterion-set",
    "criterion-met",
    "criterion-shift",
  ]);
  if (goalposts) {
    matches.push({
      id: "moving-goalposts-temporal",
      label: "Moving Goalposts · temporal",
      code: "MGt",
      invariant:
        "Критерий изменяется после выполнения исходного условия.",
      eventIds: goalposts.map((event) => event.id),
      evidence: goalposts.map(
        (event) => `t${event.t}: ${event.kind} → ${event.label}`,
      ),
      strength: 1,
    });
  }

  return matches;
}

export function trajectorySignature(matches: DynamicMatch[]): string {
  return matches.length ? matches.map((match) => match.code).join(" + ") : "∅";
}
