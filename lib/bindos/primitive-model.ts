import { evaluateTransitionField } from "./channels";
import { inspectLogicalTypes } from "./logical-types";
import type {
  CommunicationChannel,
  Scene,
  SceneOperator,
} from "./types";

export interface PrimitiveEntity {
  id: string;
  label: string;
  source: "actor" | "node" | "move";
}

export interface PrimitiveRelation {
  id: string;
  label: string;
  from?: string;
  to?: string;
  source: "edge" | "operator";
}

export interface PrimitiveOperator {
  id: string;
  label: string;
  target: string;
  rank: number | null;
}

export interface PrimitiveChannel {
  name: CommunicationChannel;
  count: number;
  netWeight: number;
}

export interface PrimitiveWeight {
  id: string;
  label: string;
  value: number;
  source: "edge" | "operator";
}

export interface PrimitiveProjection {
  entities: PrimitiveEntity[];
  relations: PrimitiveRelation[];
  operators: PrimitiveOperator[];
  channels: PrimitiveChannel[];
  weights: PrimitiveWeight[];
}

function operatorWeight(operator: SceneOperator): number {
  if (!operator.influence) return 0;
  const sign = operator.influence.direction === "cost" ? 1 : -1;
  return (
    sign *
    Math.max(0, operator.influence.magnitude) *
    Math.max(0, Math.min(1, operator.influence.conductance)) *
    Math.max(0, operator.influence.gain)
  );
}

export function projectToPrimitives(scene: Scene): PrimitiveProjection {
  const logical = inspectLogicalTypes(scene);
  const rankByOperator = new Map(
    logical.entries
      .filter((entry) => entry.ref.kind === "operator")
      .map((entry) => [entry.ref.id, entry.rank] as const),
  );

  const entities: PrimitiveEntity[] = [
    ...scene.actors.map((actor) => ({
      id: actor.id,
      label: actor.label,
      source: "actor" as const,
    })),
    ...scene.nodes.map((node) => ({
      id: node.id,
      label: node.label,
      source: "node" as const,
    })),
    ...scene.moves.map((move) => ({
      id: move.id,
      label: move.label,
      source: "move" as const,
    })),
  ];

  const relations: PrimitiveRelation[] = [
    ...scene.edges.map((edge) => ({
      id: edge.id,
      label: edge.type,
      from: edge.from,
      to: edge.to,
      source: "edge" as const,
    })),
    ...(scene.operators ?? []).map((operator) => ({
      id: operator.id,
      label: operator.type,
      to: `${operator.target.kind}:${operator.target.id}`,
      source: "operator" as const,
    })),
  ];

  const operators: PrimitiveOperator[] = (scene.operators ?? []).map(
    (operator) => ({
      id: operator.id,
      label: operator.label,
      target: `${operator.target.kind}:${operator.target.id}`,
      rank: rankByOperator.get(operator.id) ?? null,
    }),
  );

  const channelMap = new Map<
    CommunicationChannel,
    { count: number; netWeight: number }
  >();

  for (const operator of scene.operators ?? []) {
    const channel = operator.channel ?? "other";
    const current = channelMap.get(channel) ?? { count: 0, netWeight: 0 };
    current.count += 1;
    current.netWeight += operatorWeight(operator);
    channelMap.set(channel, current);
  }

  const channels: PrimitiveChannel[] = [...channelMap.entries()]
    .map(([name, value]) => ({ name, ...value }))
    .sort((a, b) => Math.abs(b.netWeight) - Math.abs(a.netWeight));

  const weights: PrimitiveWeight[] = [
    ...scene.edges
      .filter((edge) => edge.weight !== undefined)
      .map((edge) => ({
        id: edge.id,
        label: edge.type,
        value: edge.weight ?? 0,
        source: "edge" as const,
      })),
    ...(scene.operators ?? [])
      .filter((operator) => operator.influence)
      .map((operator) => ({
        id: operator.id,
        label: operator.label,
        value: operatorWeight(operator),
        source: "operator" as const,
      })),
  ];

  return { entities, relations, operators, channels, weights };
}

export function primitiveSignature(scene: Scene): string {
  const p = projectToPrimitives(scene);
  return [
    `E${p.entities.length}`,
    `R${p.relations.length}`,
    `O${p.operators.length}`,
    `C${p.channels.length}`,
    `W${p.weights.length}`,
  ].join(" · ");
}

export function deriveMoveVector(scene: Scene): Array<{
  id: string;
  label: string;
  cost: number;
}> {
  return scene.moves.map((move) => {
    const field = evaluateTransitionField(scene, move.id);
    return {
      id: move.id,
      label: move.label,
      cost: Math.max(0, field.netDelta),
    };
  });
}
