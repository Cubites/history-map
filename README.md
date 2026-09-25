# 역사 지도 (History Map)

연도를 고르면 그 시기의 세계 지도가 나라 단위로 나타나고, 나라를 누르면 그 시기의 사건과 영향 관계를 보여주는 웹 서비스입니다. 설계는 [docs/DESIGN.md](docs/DESIGN.md)를 참고하세요.

## 개발

```bash
npm install
npm run dev      # http://localhost:5173/history-map/
npm run build    # dist/ 생성
```

`main` 브랜치에 push하면 GitHub Actions가 GitHub Pages로 배포합니다.

## 제보

역사 데이터는 운영자가 직접 작성합니다. 오류나 누락은 GitHub Issue로 제보해 주세요. **증거 사료(서명과 권·쪽, 또는 기관 자료 링크)가 있는 제보만** 검토 후 반영합니다.

## 라이선스

- 소스 코드: [MIT](LICENSE)
- 역사 데이터(`data/`): [CC BY-NC-SA 4.0](data/LICENSE)
- 기본 지도: [Natural Earth](https://www.naturalearthdata.com/) (퍼블릭 도메인)
