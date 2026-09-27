import { analyzeScene } from "./engine";
import type { Scene } from "./types";

export interface PatternMatch {
  id: string;
  label: string;
  evidence: string[];
}

export function matchScene(scene: Scene): PatternMatch[] {
  const analysis = analyzeScene(scene);
  const matches: PatternMatch[] = [];

  if (
    analysis.classification === "double-bind" ||
    analysis.classification === "recursive-double-bind" ||
    analysis.classification === "interpreter-attack-bind" ||
    analysis.classification === "recursive-interpreter-bind"
  ) {
    matches.push({
      id: "double-bind",
      label: "Double Bind",
      evidence: [
        "конфликт правил",
        "нет чистого хода первого уровня",
        "мета- и выходной переходы не дают чистого размыкания",
      ],
    });
  }

  if (
    analysis.classification === "recursive-double-bind" ||
    analysis.classification === "recursive-interpreter-bind"
  ) {
    matches.push({
      id: "recursive-double-bind",
      label: "Recursive Double Bind",
      evidence: ["обнаружен цикл среди усиливающих / обновляющих связей"],
    });
  }

  if (
    analysis.classification === "interpreter-attack-bind" ||
    analysis.classification === "recursive-interpreter-bind"
  ) {
    matches.push({
      id: "interpreter-attack",
      label: "Interpreter Attack",
      evidence: ["обнаружен узел интерпретации, помеченный как атака на декодер"],
    });
  }

  return matches;
}
