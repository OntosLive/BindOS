import Link from "next/link";
import { SceneWorkbench } from "@/components/scene/SceneWorkbench";

export default function ScenePage() {
  return (
    <main className="shell">
      <header className="pageHeader">
        <div className="eyebrow">BindOS / Scene</div>
        <h1>Лаборатория сцены</h1>
        <p>
          Теперь это уже графический конструктор. Двигай элементы между
          логическими уровнями, соединяй их типизированными связями и смотри,
          как kernel пересчитывает структуру.
        </p>
        <div className="navRow">
          <Link className="controlButton" href="/atlas">
            Atlas 0.1
          </Link>
          <Link className="controlButton" href="/">
            Главная
          </Link>
        </div>
      </header>
      <SceneWorkbench />
    </main>
  );
}
