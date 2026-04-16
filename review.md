# hello-project — review

조사 일자: 2026-04-11
대상 커밋: `9694539`
스택: Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind v4 · D3 (timeline) · Recharts (distribution) · MusicBrainz API
도메인: Hello! Project (일본 아이돌 사단) 멤버 타임라인 + 곡별 라인 분포 시각화

---

## 1. 원격 상태 (heznpc/hello-project)

- 미해결 이슈: **0건**
- 미해결 PR: **0건**
- 커밋: 2개 (init → "H!P member timeline & line distribution viewer")
- 작업 트리: clean (`.idea/` 만 untracked, .gitignore에 포함되어 있지 않음)
- CI: 없음

→ 외부 보고 없음. 1인 fan-tool 프로젝트.

---

## 2. 코드 품질 종합

### 강점

- **Next 16 + React 19 + Tailwind v4 최신 stack**: AGENTS.md에 "this is NOT the Next.js you know" 명시. 컨벤션 의식적으로 따름.
- **D3 timeline의 정석적 패턴**: `clipPath`, `scaleTime`, `scaleBand`, `zoom().scaleExtent().translateExtent()`. clipping 영역을 따로 두어 zoom 시 라벨 영역 침범 방지. join 패턴으로 멱등 렌더.
- **MusicBrainz scraper의 rate limit 준수**: `await sleep(1100)` — MB API 정책(1초 + 안전 마진). User-Agent 명시. 외부 API 매너 좋음.
- **3개 locale (ko/ja/en) i18n 지원**: 멤버/그룹 이름이 locale별로 fallback 체인 구성 (`nameJa || nameEn`, `nameKo || nameJa || nameEn`).
- **strict TS + zero-runtime data**: 빌드 시 JSON으로 모두 포함. 정적 export 가능.
- **Recharts bar/pie 토글**: distribution view가 같은 데이터 두 가지 시각화. 무거운 라이브러리 두 개(D3 + recharts) 공존 비용은 있지만 각각의 차트 종류에 best fit.
- **데이터 분리**: `members.json`, `groups.json`, `memberships.json`, `songs.json`, `distributions.json` 5종으로 normalize. ER 설계 깔끔.

### Fix TODO (우선순위순)

**[P1] i18n.ts 파일에 모지바케 (Mojibake) 깨진 일본어 문자**
- 위치: `src/lib/i18n.ts:75` `timeline.all.ja` → `��べて`, `:112` `distribution.title.ja` → `パ��ト分析`
- 증상: 실제 텍스트가 invalid UTF-8 surrogate (`U+FFFD REPLACEMENT CHARACTER`). 일본어 사용자가 사이트를 ja로 보면 깨진 글자가 노출됨. **이건 명백한 회귀**.
- Fix:
  - `すべて` (`timeline.all`), `パート分析` (`distribution.title`) 로 복구.
  - 원인: 파일 편집기가 UTF-8 인코딩을 잘못 처리한 흔적. 다른 ja 텍스트 entry 전수 검사 필요.
  - 한 번에: `grep -n '\\ufffd' src/lib/i18n.ts` 로 모든 깨진 문자 위치 확인.

**[P1] README가 create-next-app 템플릿 그대로**
- 위치: `README.md`
- 증상: 프로젝트가 무엇인지 0 정보. GitHub 방문자에게 실패.
- Fix: 프로젝트 설명, 데이터 출처(MusicBrainz), 데이터 갱신 방법(`tsx scripts/scrape-musicbrainz.ts`), 라이선스(MB의 CC0 가정).

**[P2] timeline-chart의 zoom 핸들러가 `g:nth-child(3)` 로 selection**
- 위치: `src/app/timeline/timeline-chart.tsx:262`
  ```ts
  svg.select<SVGGElement>("g:nth-child(3)")
  ```
- 증상: SVG의 g 노드 순서를 hard-coded 인덱스로 selection. 새 child element 1개만 추가해도 깨짐. xAxis re-rendering이 엉뚱한 노드에 적용될 수 있음.
- Fix: xAxis의 g 노드에 `.attr("class", "x-axis")` 부여 + `svg.select(".x-axis")` 로 selection. d3 join 패턴의 standard idiom.

**[P2] tooltip이 `tooltip.html(...)` 사용**
- 위치: `src/app/timeline/timeline-chart.tsx:215-221`
- 증상: d3의 `.html()` 은 innerHTML과 동일. 멤버/그룹 이름 데이터가 MusicBrainz에서 옴 → 외부 데이터. 만약 멤버 이름에 `<script>` 가 있으면 (실제로는 없지만 가설적으로) XSS.
- Fix: 별도 escape 함수 또는 d3 selection으로 textContent 분리 (조금 verbose하지만 안전).

**[P2] scrape-musicbrainz.ts의 placeholder MBID resolve**
- 위치: `scripts/scrape-musicbrainz.ts:178-192`
- 증상: `d-juice-juice` 같은 placeholder를 search API로 resolve. MB search는 fuzzy → 동명이인 그룹이 있으면 잘못 매핑 가능. 한 번 commit된 결과(`groups.json`)를 검증 없이 신뢰.
- Fix: search 결과에 `disambiguation: "Hello! Project"` 또는 type=Group + tags 가 H!P 관련인지 strict check. 실패 시 manual fallback table.

**[P2] CI 부재**
- 증상: lint도 type-check도 build도 자동으로 안 돌아감. 위 P1 인코딩 깨짐도 CI가 있으면 잡혔을 것 (i18n 텍스트 전수 검사).
- Fix: GH Actions에 `npm run lint` + `npx tsc --noEmit` + `npm run build` 3-step. (followprint와 동일 설정 복붙 가능.)

**[P2] 테스트 0개**
- 증상: scrape script 의 데이터 변환 로직(rel mapping, slug 생성), `parseDate` (timeline-chart의 `1997` → `Date(1997,0,1)`), `hashColor` 등이 모두 untested.
- Fix:
  - `vitest`로 `parseDate`/`hashColor` unit test (각 5분).
  - scrape script는 fixture-based test (MB JSON 응답 fixture → 변환 → expected JSON).

**[P3] distribution-chart의 `{distribution.lines.length} members` 표기**
- 위치: `src/app/distribution/distribution-chart.tsx:107`
- 증상: 해당 곡의 lines 분포를 가진 member 수. 영어로 "members" 라고만 표시되어 ja/ko에서 그대로 영어. i18n 미적용.
- Fix: `t("distribution.linesCount")` 함수형 t로 추가.

**[P3] memberships의 `leaveReason` 항상 'graduation'**
- 위치: `scripts/scrape-musicbrainz.ts:269`
  ```ts
  leaveReason: rel.ended ? "graduation" : undefined
  ```
- 증상: H!P는 졸업/탈퇴/해산/이적이 명확히 구분되는 문화 (`卒業` vs `脱退`). 실제로는 모두 "graduation" 으로 매핑됨.
- Fix:
  - MB의 `rel.attributes` 또는 `rel.disambiguation` 에 단서가 있다면 그것 사용.
  - 아니면 manual override table을 별도 JSON으로 두고 merge.

**[P3] timeline-chart의 `colH[ci] += this.naturalHeight / this.naturalWidth * el.offsetWidth - 300`** — gallery 와 같은 패턴이지만 hello-project는 사용 안 함. (이 줄은 timeline에는 없음. gallery에만.)

**[P3] `useMemo` 부재**
- 위치: `timeline-chart.tsx:59-60` `memberMap` / `groupMap` 매 렌더마다 새로 생성
- 증상: useEffect의 deps에 들어가 있어 매 렌더마다 effect 재실행. 큰 데이터셋에서 reflow 발생.
- Fix: `useMemo(() => new Map(...), [members])`.

**[P3] i18n의 `t()` 가 string과 function 두 분기**
- 위치: `src/lib/i18n.ts:33-40` (function), `:11-15` (string)
- 증상: 호출부에서 `t("home.stats") as (m, g, ms) => string` cast 필요. 타입 안정성 약함.
- Fix: 함수형 entry는 별도 namespace (`tFn(...)`) 또는 모든 entry를 함수로 통일 (template-only는 인자 없는 함수로 wrap).

---

## 3. 테스트 상태

- **테스트 0개.**
- 엉터리 테스트는 없음 (없으니까).
- 최우선: scrape-musicbrainz.ts 의 데이터 변환부 (`memberId` 슬러그화, sort-name 한자 감지, role/leaveReason 매핑) — 한 줄 typo 가 전체 데이터셋을 망가뜨림.

---

## 4. 시장 가치 (2026-04-11 기준, 글로벌 관점)

**한 줄 평**: hardcore H!P fan만의 niche tool — 글로벌 audience 약 5만 명 추정 활동 팬, 그 중 데이터 시각화 수요는 1% 미만. **시장 가치는 사실상 0이며, 본 프로젝트의 가치는 fan service / 작가의 portfolio**.

**경쟁/대안**

- **time.graphics/line/215809** — Hello! Project member timeline을 이미 비슷하게 호스팅. ([time.graphics](https://time.graphics/line/215809))
- **Hello! Project Wiki on Fandom** — 멤버/그룹/곡 데이터 정리. 시각화 없음. ([Fandom](https://helloproject.fandom.com/wiki/Hello!_Project_Wiki))
- **MusicBrainz** — raw 데이터 출처. UI는 없음.
- **본 프로젝트의 차별화**: D3 zoom 가능한 인터랙티브 timeline + 곡별 line distribution 분석 + 3 locale (KO/JA/EN). 특히 KO 지원이 실질적 차별점 — H!P는 일본 그룹이지만 한국 팬이 적지 않음.

**ROI 분석**

- **타깃 audience**: H!P fan (active fanbase 글로벌 약 5–10만 명, 일본 70% / 동아시아 20% / 그 외 10%).
- **수익화**: 0. fan tool 카테고리는 광고도 안 맞고 결제도 무리.
- **기술 학습 가치**: 본 프로젝트의 가장 큰 효용. D3 + Next 16 + MusicBrainz API + 3 locale i18n 의 결합은 portfolio piece로 가치 있음.
- **운영 비용**: 정적 사이트 + 데이터 갱신 수작업 → 사실상 0.
- **확장 잠재**: distribution.json 채우는 작업이 가장 큰 시간 투자. line distribution 데이터 자체가 fan이 손으로 영상 보면서 측정해야 함 → 자동화 어려움.

**유사 모델 (다른 사단 fanbase)**

- K-pop의 SM/HYBE 멤버 timeline 시각화는 거의 없음. **K-pop 도메인으로 fork 시** 같은 코드베이스가 훨씬 큰 audience 가능. (한국어 i18n 이미 있음.)
- 단, K-pop은 그룹/멤버 변경 빈도가 낮아 timeline의 의미가 작음. H!P는 25년+ 역사에 졸업 시스템이 있어 시각화가 정확히 가치 있는 도메인.

**결론**

- **시장 가치**: ★☆☆☆☆ (글로벌). 도메인이 너무 좁음.
- **기술/portfolio 가치**: ★★★★☆. D3 + i18n + MB API 통합이 매우 깔끔.
- **권장**: i18n 모지바케 fix하고 (5분), README 채우고 (30분), distribution 데이터를 1–2곡이라도 채워서 데모 가능 상태 만든 후 X에 공유 → fan 100명 이내 reach. 그 이상 욕심내지 말 것.

---

## 5. 한 줄 요약

> Next 16 + D3 + i18n 통합이 매우 깔끔한 fan tool. **i18n.ts에 일본어 mojibake 2건** (P1 회귀)과 README 미작성, CI 부재를 닫으면 portfolio piece로 완성. 시장 가치는 거의 없으니 수익화 시도는 권장하지 않음.

## Sources

- [time.graphics — Hello!Project member timeline (existing competitor)](https://time.graphics/line/215809)
- [Hello! Project Wiki — Fandom](https://helloproject.fandom.com/wiki/Hello!_Project_Wiki)
- [MusicBrainz API documentation](https://musicbrainz.org/doc/MusicBrainz_API) (data source)
