import WorldMap from './map/WorldMap';

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>역사 지도</h1>
      </header>
      <main className="app-main">
        <WorldMap />
      </main>
      <footer className="app-footer">
        지도 데이터: <a href="https://www.naturalearthdata.com/">Natural Earth</a> · 역사 데이터 CC BY-NC-SA 4.0 ·{' '}
        <a href="https://github.com/Cubites/history-map">GitHub</a>
      </footer>
    </div>
  );
}
