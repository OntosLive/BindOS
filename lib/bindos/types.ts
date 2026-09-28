export type EpistemicState = "observed" | "inferred" | "suggested";
export type LogicalLevel = 0 | 1 | 2 | 3 | 4;

export type NodeType =
  | "Event"
  | "Message"
  | "Interpretation"
  | "Rule"
  | "MetaRule"
  | "Gate"
  | "Sanction"
  | "Context"
  | "State";

export type EdgeType =
  | "sends"
  | "interpretsAs"
  | "requires"
  | "forbids"
  | "sanctions"
  | "permits"
  | "blocks"
  | "dependsOn"
  | "escalates"
  | "reinforces"
  | "contradicts"
  | "reframes"
  | "exitsTo"
  | "updates";

export type GateType = "action" | "meta" | "exit" | "interpretation";
export type GateStatus = "open" | "closed" | "conditional";
export type MoveKind = "action" | "meta" | "exit";

export type TemporalKind =
  | "approach"
  | "withdraw"
  | "rescue"
  | "dependency"
  | "guilt-signal"
  | "compensate"
  | "demand"
  | "relief"
  | "pressure"
  | "repair-attempt"
  | "criterion-set"
  | "criterion-met"
  | "criterion-shift"
  | "other";

export type CommunicationChannel =
  | "verbal"
  | "text"
  | "prosody"
  | "facial"
  | "gaze"
  | "gesture"
  | "posture"
  | "proximity"
  | "touch"
  | "silence"
  | "timing"
  | "group-response"
  | "environmental"
  | "institutional"
  | "algorithmic"
  | "other";

export type SceneReferenceKind = "node" | "edge" | "operator" | "move";

export interface SceneReference {
  kind: SceneReferenceKind;
  id: string;
}

export type OperatorType =
  | "classifies"
  | "governs"
  | "permits"
  | "forbids"
  | "sanctions"
  | "reframes"
  | "updates"
  | "blocks"
  | "reinforces";

export type InfluenceDirection = "cost" | "relief";
export type CostReality = "actual" | "expected";

export interface TransitionInfluence {
  moveId: string;
  direction: InfluenceDirection;
  magnitude: number;
  conductance: number;
  gain: number;
  reality: CostReality;
}

export interface Actor {
  id: string;
  label: string;
}

export interface SceneNode {
  id: string;
  type: NodeType;
  label: string;
  epistemic: EpistemicState;
  level?: LogicalLevel;
  actorId?: string;
  metadata?: {
    gateType?: GateType;
    gateStatus?: GateStatus;
    severity?: number;
    interpreterAttack?: boolean;
    active?: boolean;
  };
  ui?: {
    x: number;
    y: number;
  };
}

export interface SceneEdge {
  id: string;
  from: string;
  to: string;
  type: EdgeType;
  weight?: number;
}

export interface SceneOperator {
  id: string;
  type: OperatorType;
  label: string;
  sourceNodeId?: string;
  sourceActorId?: string;
  targetActorId?: string;
  channel?: CommunicationChannel;
  target: SceneReference;
  influence?: TransitionInfluence;
  epistemic: EpistemicState;
}

export interface SceneMove {
  id: string;
  label: string;
  kind: MoveKind;
  level: LogicalLevel;
  violatesRuleIds?: string[];
  sanctionIds?: string[];
  blockedByGateIds?: string[];
}

export interface TemporalEvent {
  id: string;
  t: number;
  actorId?: string;
  kind: TemporalKind;
  label: string;
  magnitude?: number;
  respondsTo?: string;
  epistemic?: EpistemicState;
}

export interface Scene {
  id: string;
  title: string;
  actors: Actor[];
  nodes: SceneNode[];
  edges: SceneEdge[];
  operators?: SceneOperator[];
  moves: SceneMove[];
  timeline?: TemporalEvent[];
}

export interface OperatorInfluenceEvaluation {
  operatorId: string;
  label: string;
  channel: CommunicationChannel;
  reality: CostReality;
  direction: InfluenceDirection;
  delta: number;
}

export interface TransitionFieldEvaluation {
  moveId: string;
  actualDelta: number;
  expectedDelta: number;
  netDelta: number;
  contributions: OperatorInfluenceEvaluation[];
  byChannel: Partial<Record<CommunicationChannel, number>>;
}

export type MoveStatus = "clean" | "sanctioned" | "blocked";

export interface MoveEvaluation {
  move: SceneMove;
  status: MoveStatus;
  effectiveCost: number;
  sanctions: SceneNode[];
  closedGates: SceneNode[];
  transitionField: TransitionFieldEvaluation;
  reasons: string[];
}

export type SceneClass =
  | "ordinary"
  | "conflict"
  | "repairable-bind"
  | "bind-with-exit"
  | "double-bind"
  | "recursive-double-bind"
  | "interpreter-attack-bind"
  | "recursive-interpreter-bind";

export interface SceneAnalysis {
  classification: SceneClass;
  label: string;
  explanation: string;
  hasRuleConflict: boolean;
  hasRecursiveCycle: boolean;
  hasInterpreterAttack: boolean;
  cleanActionMoves: number;
  metaEscape: boolean;
  exitEscape: boolean;
  lowestBreakpoint: "B0" | "B2" | "B3" | "B4";
  moves: MoveEvaluation[];
}
