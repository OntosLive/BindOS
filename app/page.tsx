import Link from "next/link";

export default function HomePage() {
  return (
    <main className="shell landing">
      <div className="eyebrow">BindOS 0.1</div>
      <h1>Рентген исполняемых отношений.</h1>
      <p className="lead">
        Не определяет, кто прав. Показывает, какие правила действуют,
        какие ходы доступны и на каком логическом уровне возникает ловушка.
      </p>

      <div className="founding">
        <span>Главный объект</span>
        <strong>пространство допустимых ответов</strong>
      </div>

      <div className="navRow">
        <Link className="primaryButton" href="/scene">Открыть сцену</Link>
        <Link className="controlButton" href="/atlas">Открыть Atlas 0.1</Link>
      </div>
    </main>
  );
}
