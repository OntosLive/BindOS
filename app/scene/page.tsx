import { SceneWorkbench } from "@/components/scene/SceneWorkbench";

export default function ScenePage() {
  return (
    <main className="shell">
      <header className="pageHeader">
        <div className="eyebrow">BindOS / Scene</div>
        <h1>Лаборатория сцены</h1>
        <p>
          Первая исполняемая модель: «Будь спонтанным». Открывай и закрывай
          мета- и выходной уровни и наблюдай, когда конфликт превращается в bind.
        </p>
      </header>
      <SceneWorkbench />
    </main>
  );
}
