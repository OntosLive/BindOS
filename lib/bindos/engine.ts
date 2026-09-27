import type {
  MoveEvaluation,
  Scene,
  SceneAnalysis,
  SceneEdge,
  SceneMove,
  SceneNode,
} from "./types";

const recursiveEdgeTypes = new Set<SceneEdge["type"]>([
  "reinforces",
  "updates",
  "escalates",
  "reframes",
]);

function nodeById(scene: Scene, id: string): SceneNode | undefined {
  return scene.nodes.find((node) => node.id === id);
}

function severity(node: SceneNode): number {
  const value = node.metadata?.severity ?? 1;
  return Number.isFinite(value) ? Math.max(0, value) : 1;
}

export function evaluateMove(scene: Scene, move: SceneMove): MoveEvaluation {
  const sanctions = (move.sanctionIds ?? [])
    .map((id) => nodeById(scene, id))
    .filter((node): node is SceneNode => Boolean(node));

  const closedGates = (move.blockedByGateIds ?? [])
    .map((id) => nodeById(scene, id))
    .filter(
      (node): node is SceneNode =>
        Boolean(node) &&
        node?.type === "Gate" &&
        node.metadata?.gateStatus === "closed",
    );

  const effectiveCost = sanctions.reduce((sum, node) => sum + severity(node), 0);
  const status = closedGates.length
    ? "blocked"
    : sanctions.length
      ? "sanctioned"
      : "clean";

  const reasons = [
    ...closedGates.map((gate) => `gate closed: ${gate.label}`),
    ...sanctions.map((sanction) => `sanction: ${sanction.label}`),
  ];

  return {
    move,
    status,
    effectiveCost,
    sanctions,
    closedGates,
    reasons,
  };
}

export function evaluateMoves(scene: Scene): MoveEvaluation[] {
  return scene.moves.map((move) => evaluateMove(scene, move));
}

function hasRuleConflict(scene: Scene): boolean {
  const ruleIds = new Set(
    scene.nodes
      .filter((node) => node.type === "Rule" || node.type === "MetaRule")
      .map((node) => node.id),
  );

  return scene.edges.some(
    (edge) =>
      edge.type === "contradicts" &&
      ruleIds.has(edge.from) &&
      ruleIds.has(edge.to),
  );
}

function hasInterpreterAttack(scene: Scene): boolean {
  return scene.nodes.some(
    (node) =>
      node.type === "Interpretation" &&
      node.metadata?.interpreterAttack === true,
  );
}

function hasRecursiveCycle(scene: Scene): boolean {
  const adjacency = new Map<string, string[]>();

  for (const edge of scene.edges) {
    if (!recursiveEdgeTypes.has(edge.type)) continue;
    const list = adjacency.get(edge.from) ?? [];
    list.push(edge.to);
    adjacency.set(edge.from, list);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (id: string): boolean => {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;

    visiting.add(id);
    for (const next of adjacency.get(id) ?? []) {
      if (visit(next)) return true;
    }
    visiting.delete(id);
    visited.add(id);
    return false;
  };

  return [...adjacency.keys()].some(visit);
}

function gateOpen(scene: Scene, type: "meta" | "exit"): boolean {
  const matching = scene.nodes.filter(
    (node) => node.type === "Gate" && node.metadata?.gateType === type,
  );

  if (!matching.length) return false;
  return matching.some((node) => node.metadata?.gateStatus === "open");
}

export function analyzeScene(scene: Scene): SceneAnalysis {
  const moves = evaluateMoves(scene);
  const conflict = hasRuleConflict(scene);
  const interpreterAttack = hasInterpreterAttack(scene);
  const recursiveCycle = hasRecursiveCycle(scene);

  const actionMoves = moves.filter((item) => item.move.kind === "action");
  const cleanActionMoves = actionMoves.filter(
    (item) => item.status === "clean",
  ).length;

  const metaEscape =
    gateOpen(scene, "meta") &&
    moves.some(
      (item) => item.move.kind === "meta" && item.status === "clean",
    );

  const exitEscape =
    gateOpen(scene, "exit") &&
    moves.some(
      (item) => item.move.kind === "exit" && item.status === "clean",
    );

  if (!conflict) {
    return {
      classification: "ordinary",
      label: "Обычная сцена",
      explanation: "Формального конфликта активных правил не найдено.",
      hasRuleConflict: false,
      hasRecursiveCycle: recursiveCycle,
      hasInterpreterAttack: interpreterAttack,
      cleanActionMoves,
      metaEscape,
      exitEscape,
      lowestBreakpoint: "B0",
      moves,
    };
  }

  if (cleanActionMoves > 0) {
    return {
      classification: "conflict",
      label: "Конфликт правил",
      explanation:
        "Правила конфликтуют, но внутри текущего уровня остаётся чистый ход.",
      hasRuleConflict: true,
      hasRecursiveCycle: recursiveCycle,
      hasInterpreterAttack: interpreterAttack,
      cleanActionMoves,
      metaEscape,
      exitEscape,
      lowestBreakpoint: "B0",
      moves,
    };
  }

  if (metaEscape) {
    return {
      classification: "repairable-bind",
      label: "Bind, доступный ремонту",
      explanation:
        "Первый уровень зажат, но MetaGate открыт: правила можно вынести в явную метакоммуникацию.",
      hasRuleConflict: true,
      hasRecursiveCycle: recursiveCycle,
      hasInterpreterAttack: interpreterAttack,
      cleanActionMoves,
      metaEscape,
      exitEscape,
      lowestBreakpoint: "B2",
      moves,
    };
  }

  if (exitEscape) {
    return {
      classification: "bind-with-exit",
      label: "Bind с доступным выходом",
      explanation:
        "Внутри правил чистого хода нет, но рамку можно покинуть или сменить.",
      hasRuleConflict: true,
      hasRecursiveCycle: recursiveCycle,
      hasInterpreterAttack: interpreterAttack,
      cleanActionMoves,
      metaEscape,
      exitEscape,
      lowestBreakpoint: "B4",
      moves,
    };
  }

  const base = {
    hasRuleConflict: true,
    hasRecursiveCycle: recursiveCycle,
    hasInterpreterAttack: interpreterAttack,
    cleanActionMoves,
    metaEscape,
    exitEscape,
    lowestBreakpoint: "B3" as const,
    moves,
  };

  if (interpreterAttack && recursiveCycle) {
    return {
      ...base,
      classification: "recursive-interpreter-bind",
      label: "Recursive interpreter bind",
      explanation:
        "Чистого хода нет, распознавание конфликта атакуется, а ремонтная попытка возвращается в тот же контур.",
    };
  }

  if (interpreterAttack) {
    return {
      ...base,
      classification: "interpreter-attack-bind",
      label: "Double bind + interpreter attack",
      explanation:
        "Чистого хода нет, а способность распознать противоречие сама становится объектом санкции.",
    };
  }

  if (recursiveCycle) {
    return {
      ...base,
      classification: "recursive-double-bind",
      label: "Recursive double bind",
      explanation:
        "Попытка ремонта возвращается в исходную структуру и помогает ей самовоспроизводиться.",
    };
  }

  return {
    ...base,
    classification: "double-bind",
    label: "Double bind",
    explanation:
      "Первый уровень не содержит чистого хода, MetaGate и ExitGate не дают разомкнуть рамку.",
  };
}
