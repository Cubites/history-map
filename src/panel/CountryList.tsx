import { useMemo } from 'react';
import { activeTerritories, type StaticData } from '../data/staticData.ts';
import { formatYear } from '../lib/year.ts';
import { REGION_FILTER_INFO, inRegionFilter } from '../schema/regions.ts';
import { useAppStore } from '../store/useAppStore.ts';

/**
 * 나라를 고르지 않았을 때 패널에 보이는 나라 목록 (2026-10-28, DESIGN.md §6.4).
 * 지금 연도에 지도에 영토가 있는 나라 가운데 지금 권역(세계면 전부)의 것을 가나다순으로 늘어놓는다.
 * 나라 아닌 지역 항목(점령지·귀속 논쟁 지역 등, level: region)은 뺀다. 누르면 지도에서 그 나라를 누른 것과 같다(store.select)
 */
export function CountryList({ data }: { data: StaticData }) {
  const year = useAppStore((s) => s.year);
  const regionFilter = useAppStore((s) => s.regionFilter);
  const select = useAppStore((s) => s.select);

  const countries = useMemo(() => {
    const ids = new Set(activeTerritories(data.territories, year).map((t) => t.entityId));
    return [...ids]
      .map((id) => data.entities.get(id))
      .filter((e) => e !== undefined && e.level !== 'region' && inRegionFilter(regionFilter, e.region))
      .sort((a, b) => a!.names.ko.localeCompare(b!.names.ko, 'ko'));
  }, [data.territories, data.entities, year, regionFilter]);

  const where = regionFilter === 'all' ? '세계' : REGION_FILTER_INFO[regionFilter].short;
  return (
    <section className="country-list" aria-label={`${formatYear(year)} ${where}의 나라`}>
      <h3>
        {formatYear(year)} {where}의 나라 <span className="country-list-count">{countries.length}</span>
      </h3>
      {countries.length === 0 ? (
        <p className="panel-note">이 시기에는 지도에 나라가 없습니다.</p>
      ) : (
        <ul>
          {countries.map((e) => (
            <li key={e!.id}>
              <button type="button" onClick={() => select(e!.id)}>
                <i className="country-list-swatch" style={{ background: e!.color }} aria-hidden />
                <span className="country-list-name">{e!.names.ko}</span>
                {(e!.names.hanja ?? e!.names.native) && <span className="country-list-native">{e!.names.hanja ?? e!.names.native}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
