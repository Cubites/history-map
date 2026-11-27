import { useState } from 'react';
import { useStaticData } from './data/staticData.ts';
import { MiniGame } from './minigame/MiniGame.tsx';
import WorldMap from './map/WorldMap.tsx';
import { EventPanel } from './panel/EventPanel.tsx';
import { MapYearControls } from './timeline/MapYearControls.tsx';
import { WarStepBar } from './timeline/WarStepBar.tsx';
import { SearchBox } from './search/SearchBox.tsx';
import { UpdateNotice } from './UpdateNotice.tsx';

export default function App() {
  const { data, error } = useStaticData();
  // 미니게임(2026-11-17): 지도 오른쪽 위의 게임패드 단추나 주소의 ?minigame 으로 연다. 본 지도 위에 덮어 띄운다
  const [gameOpen, setGameOpen] = useState(() => new URLSearchParams(window.location.search).has('minigame'));

  return (
    <div className="app">
      <UpdateNotice />
      {data ? (
        <>
          <div className="app-body">
            <main className="app-main">
              <WorldMap data={data} />
              {/* 평소의 연도 조절(2026-10-28부터): 휴대폰은 지도 오른쪽 세로 막대, PC는 지도 아래 가로 띠, 둘 다 지도 아래 가운데 연도 입력 칸. 전쟁 보기에서는 숨기고 날짜는 전쟁 정보 패널(WarPanel)에서 고른다 */}
              <MapYearControls data={data} />
              {/* 전쟁 보기의 상황 막대(2026-11-23): 연도 막대 자리(PC 지도 아래 가로, 휴대폰 지도 오른쪽 세로)에 번호 붙은 상황 눈금 */}
              <WarStepBar data={data} />
              {/* 미니게임으로 가는 단추(2026-11-19): 지도 오른쪽 위의 게임패드 아이콘. 크기는 '주요 전쟁' 단추 높이의 2배(휴대폰 1.3배), styles.css .mg-launch */}
              <button type="button" className="mg-launch" aria-label="미니게임" title="미니게임" onClick={() => setGameOpen(true)}>
                <span className="ui-bg" aria-hidden="true" />
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="6.5" width="20" height="11" rx="4.5" />
                  <path d="M6.5 12h4M8.5 10v4" />
                  <circle cx="15.2" cy="13.2" r="0.6" fill="currentColor" />
                  <circle cx="17.8" cy="10.8" r="0.6" fill="currentColor" />
                </svg>
              </button>
              {/* 사건·나라 검색창: 휴대폰은 지도 위쪽(2026-10-27: '역사 지도' 머리글을 없애고 옮김), PC는 아래 왼쪽 칸 맨 위(.side-search).
                  지도(.world-map) 밖이라 지도 끌기·휠이 닿지 않는다 */}
              <div className="map-search">
                <SearchBox data={data} />
              </div>
            </main>
            {/* PC 왼쪽 칸: 검색창(스크롤해도 맨 위에 남음) + 나라 정보·사건 패널(전쟁 보기에서는 전쟁 정보, 2026-11-21). 휴대폰은 display: contents로 칸이 없는 것처럼 */}
            <div className="side">
              <div className="side-search">
                <SearchBox data={data} />
              </div>
              <EventPanel data={data} />
            </div>
          </div>
        </>
      ) : (
        <div className="app-loading">{error ? `데이터를 불러오지 못했습니다: ${error}` : '데이터를 불러오는 중…'}</div>
      )}
      <footer className="app-footer">
        지도 데이터: <a href="https://www.naturalearthdata.com/">Natural Earth</a> · 역사 데이터 CC BY-NC-SA 4.0 ·{' '}
        <a href="https://github.com/Cubites/history-map">GitHub</a>      </footer>
      {gameOpen && data && <MiniGame data={data} onClose={() => setGameOpen(false)} />}
    </div>
  );
}
