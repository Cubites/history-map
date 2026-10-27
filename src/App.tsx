import { useStaticData } from './data/staticData.ts';
import WorldMap from './map/WorldMap.tsx';
import { EventPanel } from './panel/EventPanel.tsx';
import { Timeline } from './timeline/Timeline.tsx';
import { SearchBox } from './search/SearchBox.tsx';
import { UpdateNotice } from './UpdateNotice.tsx';

export default function App() {
  const { data, error } = useStaticData();

  return (
    <div className="app">
      <UpdateNotice />
      {data ? (
        <>
          <div className="app-body">
            <main className="app-main">
              <WorldMap data={data} />
              {/* 사건·나라 검색창은 지도 왼쪽 위(2026-10-27: '역사 지도' 머리글을 없애고 옮김). 지도(.world-map) 밖이라 지도 끌기·휠이 닿지 않는다 */}
              <div className="map-search">
                <SearchBox data={data} />
              </div>
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
