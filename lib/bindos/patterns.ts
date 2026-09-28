import type {
  EdgeType,
  GateStatus,
  GateType,
  NodeType,
  SceneNode,
} from "./types";

export interface PatternNodeConstraint {
  role: string;
  type: NodeType;
  gateType?: GateType;
  gateStatus?: GateStatus;
  interpreterAttack?: boolean;
  distinctFrom?: string[];
}

export interface PatternEdgeConstraint {
  from: string;
  to: string;
  type: EdgeType;
  optional?: boolean;
  bidirectional?: boolean;
}

export interface ExecutablePattern {
  id: string;
  name: string;
  family: string;
  nodeConstraints: PatternNodeConstraint[];
  edgeConstraints: PatternEdgeConstraint[];
  invariant: string;
}

export const executablePatterns: ExecutablePattern[] = [
  {
    id: "double-bind",
    name: "Double Bind",
    family: "bind",
    invariant:
      "Два конфликтующих правила санкционируют альтернативные ходы, а мета- и выходной переходы закрыты.",
    nodeConstraints: [
      { role: "ruleA", type: "Rule", distinctFrom: ["ruleB"] },
      { role: "ruleB", type: "Rule", distinctFrom: ["ruleA"] },
      { role: "sanctionA", type: "Sanction", distinctFrom: ["sanctionB"] },
      { role: "sanctionB", type: "Sanction", distinctFrom: ["sanctionA"] },
      {
        role: "metaGate",
        type: "Gate",
        gateType: "meta",
        gateStatus: "closed",
      },
      {
        role: "exitGate",
        type: "Gate",
        gateType: "exit",
        gateStatus: "closed",
      },
    ],
    edgeConstraints: [
      {
        from: "ruleA",
        to: "ruleB",
        type: "contradicts",
        bidirectional: true,
      },
      { from: "ruleA", to: "sanctionA", type: "sanctions" },
      { from: "ruleB", to: "sanctionB", type: "sanctions" },
      {
        from: "metaGate",
        to: "ruleA",
        type: "blocks",
        optional: true,
      },
      {
        from: "metaGate",
        to: "ruleB",
        type: "blocks",
        optional: true,
      },
      {
        from: "exitGate",
        to: "ruleA",
        type: "blocks",
        optional: true,
      },
      {
        from: "exitGate",
        to: "ruleB",
        type: "blocks",
        optional: true,
      },
    ],
  },
  {
    id: "interpreter-attack",
    name: "Interpreter Attack",
    family: "interpretation",
    invariant:
      "Распознавание структуры само становится объектом отрицательной интерпретации.",
    nodeConstraints: [
      {
        role: "decoderAttack",
        type: "Interpretation",
        interpreterAttack: true,
      },
    ],
    edgeConstraints: [],
  },
  {
    id: "moving-goalposts",
    name: "Moving Goalposts",
    family: "rule-update",
    invariant:
      "Метаправило обновляет критерий после того, как исходный критерий уже вошёл в сцену.",
    nodeConstraints: [
      { role: "criterion", type: "Rule" },
      { role: "metaRule", type: "MetaRule" },
    ],
    edgeConstraints: [
      { from: "metaRule", to: "criterion", type: "updates" },
    ],
  },
];

export function nodeSatisfiesConstraint(
  node: SceneNode,
  constraint: PatternNodeConstraint,
): boolean {
  if (node.type !== constraint.type) return false;
  if (
    constraint.gateType !== undefined &&
    node.metadata?.gateType !== constraint.gateType
  ) {
    return false;
  }
  if (
    constraint.gateStatus !== undefined &&
    node.metadata?.gateStatus !== constraint.gateStatus
  ) {
    return false;
  }
  if (
    constraint.interpreterAttack !== undefined &&
    node.metadata?.interpreterAttack !== constraint.interpreterAttack
  ) {
    return false;
  }
  return true;
}
