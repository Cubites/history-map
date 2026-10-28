import { useStaticData } from './data/staticData.ts';
import WorldMap from './map/WorldMap.tsx';
import { EventPanel } from './panel/EventPanel.tsx';
import { Timeline } from './timeline/Timeline.tsx';
import { MapYearControls } from './timeline/MapYearControls.tsx';
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
              {/* 평소의 연도 조절: 지도 오른쪽 세로 막대와 지도 아래 가운데 연도 입력 칸(2026-10-28 시험 중). 전쟁 보기에서는 아래 줄(Timeline) */}
              <MapYearControls data={data} />
              {/* 사건·나라 검색창: 휴대폰은 지도 위쪽(2026-10-27: '역사 지도' 머리글을 없애고 옮김), PC는 아래 왼쪽 칸 맨 위(.side-search).
                  지도(.world-map) 밖이라 지도 끌기·휠이 닿지 않는다 */}
              <div className="map-search">
                <SearchBox data={data} />
              </div>
            </main>
            {/* PC 왼쪽 칸: 검색창(스크롤해도 맨 위에 남음) + 나라 정보·사건 패널. 휴대폰은 display: contents로 칸이 없는 것처럼 */}
            <div className="side">
              <div className="side-search">
                <SearchBox data={data} />
              </div>
              <EventPanel data={data} />
            </div>
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
