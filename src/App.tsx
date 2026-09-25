import { useStaticData } from './data/staticData.ts';
import WorldMap from './map/WorldMap.tsx';
import { EventPanel } from './panel/EventPanel.tsx';
import { Timeline } from './timeline/Timeline.tsx';

export default function App() {
  const { data, error } = useStaticData();

  return (
    <div className="app">
      <header className="app-header">
        <h1>역사 지도</h1>
      </header>
      {data ? (
        <>
          <div className="app-body">
            <main className="app-main">
              <WorldMap data={data} />
            </main>
            <EventPanel data={data} />
          </div>
          <Timeline data={data} />
        </>
      ) : (
        <div className="app-loading">{error ? `데이터를 불러오지 못했습니다: ${error}` : '데이터를 불러오는 중…'}</div>
      )}
      <footer className="app-footer">
        지도 데이터: <a href="https://www.naturalearthdata.com/">Natural Earth</a> · 역사 데이터 CC BY-NC-SA 4.0 ·{' '}
        <a href="https://github.com/Cubites/history-map">GitHub</a>
      </footer>
    </div>
  );
}
