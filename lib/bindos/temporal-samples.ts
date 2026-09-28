import type { Scene } from "./types";

export const pursuerDistancerScene: Scene = {
  id: "pursuer-distancer-demo",
  title: "Преследование ↔ дистанция",
  actors: [
    { id: "a", label: "A" },
    { id: "b", label: "B" }
  ],
  nodes: [],
  edges: [],
  moves: [],
  timeline: [
    { id: "pd1", t: 1, actorId: "a", kind: "approach", label: "A усиливает контакт", epistemic: "observed" },
    { id: "pd2", t: 2, actorId: "b", kind: "withdraw", label: "B увеличивает дистанцию", respondsTo: "pd1", epistemic: "observed" },
    { id: "pd3", t: 3, actorId: "a", kind: "approach", label: "A усиливает контакт ещё сильнее", respondsTo: "pd2", epistemic: "observed" },
    { id: "pd4", t: 4, actorId: "b", kind: "withdraw", label: "B отдаляется ещё сильнее", respondsTo: "pd3", epistemic: "observed" }
  ]
};

export const rescueDependencyScene: Scene = {
  id: "rescue-dependency-demo",
  title: "Спасение ↔ зависимость",
  actors: [
    { id: "a", label: "A" },
    { id: "b", label: "B" }
  ],
  nodes: [],
  edges: [],
  moves: [],
  timeline: [
    { id: "rd1", t: 1, actorId: "b", kind: "dependency", label: "B не выполняет функцию самостоятельно", epistemic: "observed" },
    { id: "rd2", t: 2, actorId: "a", kind: "rescue", label: "A берёт функцию на себя", respondsTo: "rd1", epistemic: "observed" },
    { id: "rd3", t: 3, actorId: "b", kind: "relief", label: "Немедленное напряжение снимается", respondsTo: "rd2", epistemic: "inferred" },
    { id: "rd4", t: 4, actorId: "b", kind: "dependency", label: "Необходимость внешнего замещения возвращается", respondsTo: "rd3", epistemic: "inferred" }
  ]
};

export const guiltCompensationScene: Scene = {
  id: "guilt-compensation-demo",
  title: "Вина ↔ компенсация",
  actors: [
    { id: "a", label: "A" },
    { id: "b", label: "B" }
  ],
  nodes: [],
  edges: [],
  moves: [],
  timeline: [
    { id: "gc1", t: 1, actorId: "b", kind: "guilt-signal", label: "Возникает сигнал, запускающий вину", epistemic: "observed" },
    { id: "gc2", t: 2, actorId: "a", kind: "compensate", label: "A компенсирует", respondsTo: "gc1", epistemic: "observed" },
    { id: "gc3", t: 3, actorId: "a", kind: "relief", label: "Напряжение временно снижается", respondsTo: "gc2", epistemic: "inferred" },
    { id: "gc4", t: 4, actorId: "b", kind: "guilt-signal", label: "Тот же управляющий сигнал возникает снова", respondsTo: "gc3", epistemic: "observed" }
  ]
};
