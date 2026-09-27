import Link from "next/link";
import { atlasPatterns } from "@/lib/bindos/atlas";

export default function AtlasPage() {
  return (
    <main className="shell">
      <header className="pageHeader">
        <div className="eyebrow">BindOS / Atlas 0.1</div>
        <h1>Карта устойчивых реляционных машин.</h1>
        <p>
          Не типы людей. Повторяющиеся топологии связей, правил, санкций и обратных связей.
        </p>
        <div className="navRow">
          <Link className="controlButton" href="/scene">Лаборатория сцены</Link>
          <Link className="controlButton" href="/">Главная</Link>
        </div>
      </header>

      <section className="atlasGrid">
        {atlasPatterns.map((pattern, index) => (
          <article className="atlasCard" key={pattern.id}>
            <div className="atlasIndex">{String(index + 1).padStart(2, "0")}</div>
            <div className="eyebrow">{pattern.family}</div>
            <h2>{pattern.name}</h2>
            <p className="atlasInvariant">{pattern.invariant}</p>
            <div className="atlasColumns">
              <div>
                <strong>Контур</strong>
                <ul>{pattern.mechanism.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
              <div>
                <strong>Размыкание</strong>
                <ul>{pattern.breakpoints.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
