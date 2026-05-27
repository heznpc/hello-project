# hello-project

**Status: Lab — closed-period archive.** Hello! Project 1998-11 ~ 2014-12
구간만 시각화한 *역사 아카이브* 입니다. 종결된 시기를 다루므로 졸업·
가입·신곡 같은 최신 동향은 의도적으로 반영하지 않습니다. 한·일 30–40대
올드팬을 위한 시각 자료가 목적입니다.

**Live**: https://heznpc.github.io/hello-project/

> ハロー！プロジェクト 黄金期・プラチナ期 アーカイブ — 멤버 lineage
> 타임라인 + 곡별 라인 분포. D3 + Recharts, 정적 JSON, 광고 없음.

## 왜 2014-12 컷오프인가

일본 팬덤이 명확히 인정하는 시대 절단선입니다.

- **2013-05-21 田中れいな 졸업** — 플래티넘기의 마지막 멤버가 떠나며
  한 시대가 끝남 ([문춘 온라인이 "전설"로 기술](https://bunshun.jp/articles/-/43563?page=2)).
- **2014-01 モーニング娘。'14 표기 도입** — 라인업 자체가 "갱신되는 그룹"
  으로 명시적으로 바뀜.
- **2014-12** = 모무사 '14 첫 1년 종료 + 12기 (오가타·노노카·마키노·하가)
  안정기 + 컨트리·걸즈 결성 직후. 자연스러운 1년 단위 컷.

이 사이트는 "전설로 회상되는 시기를 보면서 들을 수 있는" 자료가 됩니다.
2026-02 H!P 전곡 스트리밍 개방 이후, 황금기 곡까지 모두 합법적으로
재생 가능해진 것이 본 아카이브의 가치를 결정적으로 끌어올립니다.

## Currently implemented

- **멤버 lineage 타임라인 (`/timeline`)** — 26개 그룹 lane, 84명 멤버
  막대, D3 zoom (1×–20×), 사이드바 그룹 토글, hover 시 가입/탈퇴 사유
  툴팁 (졸업·탈퇴·해산·이적).
- **곡별 라인 분포 (`/distribution`)** — 292곡 중 205곡에 분포 데이터,
  멤버별 비율을 막대 / 파이로 비교.
- **랜딩 (`/`)** — 통계 카드 + 시기별 활동 그룹.
- **i18n** — ko / ja / en (랜딩, 멤버명, 그룹명, 가입/탈퇴 사유).
- **데이터 수집** — `scripts/scrape-musicbrainz.ts` (멤버·그룹·membership)
  + `scripts/scrape-songs.ts` (곡·라인 분포, H!P Fandom wiki + 가사 wiki).
  MB rate limit 1.1초 준수, custom User-Agent, group MBID hardcoded.
- **컷오프 자동화** — `scripts/apply-cutoff.sh`. scrape 후 항상 적용.
- **CI** — lint / typecheck / build.

## 데이터 범위 (2014-12-31 컷오프)

### 자매 그룹 (4대 정규)

| 그룹 | 멤버 | 싱글 | 활동 |
|---|---|---|---|
| モーニング娘。 | 38 (1~12기) | 67 | 1997-11 ~ 컷오프 진행중 |
| ℃-ute | 8 | 37 | 2005-06 ~ 컷오프 진행중 |
| Berryz工房 | 8 | 42 | 2004-01 ~ 컷오프 진행중 |
| アンジュルム (S/mileage) | 12 | 25 | 2009-04 ~ 컷오프 진행중 (2014-11 ANGERME 개칭 포함) |

### 콜라보 / 셔플 유닛

| 유닛 | 멤버 | 싱글 | 결성 |
|---|---|---|---|
| Buono! | 3 | 13 | 2007-09 |
| Tanpopo | 8 | 8 | 1998-09 |
| Petitmoni | 3 | 4 | 1999-08 |
| GAM | 2 | 4 | 2006-06 |
| ZYX | 6 | 2 | 2003-04 |
| DEF.DIVA | 4 | 2 | 2005-09 |
| Aa! | 3 | (wiki 미수록) | 2003 |
| High-King | 5 | (wiki 미수록) | 2008-04 |

### 사토야마·사토우미 무브먼트 (2011-2014)

| 유닛 | 멤버 | 싱글 |
|---|---|---|
| Peaberry | 2 | 2 |
| Harvest | 4 | (wiki 미수록) |
| Green Fields | 3 | (wiki 미수록) |

### 그 외 OG 그룹

| 그룹 | 멤버 | 싱글 |
|---|---|---|
| 멜론기념일 | (Country Musume 등 거쳐 합산) | 다수 |
| 太陽とシスコムーン | 4 | 다수 |
| Country Musume | 다수 | 13 |
| Coconuts Musume | 다수 | 9 |
| v-u-den | 3 | 12 |
| W (Double You) | 2 | 7 |
| Mini Moni | 다수 | 13 |
| Juice=Juice | 5 (2013-02 ~) | 진행중 |
| Country Girls | 5 (2014-11 ~) | 진행중 |
| 모무사 오토메구미 / 사쿠라구미 | 분파 |  |

### 합계 (컷오프 후)

| 카테고리 | 수량 |
|---|---|
| 그룹 / 유닛 | **26개** |
| 멤버 (중복 제거) | **84명** |
| 멤버십 (그룹×멤버) | 159개 |
| 곡 | **292곡** |
| 라인 분포 분석 | **205곡** |

## Known gaps

| 결손 | 영향 | 비고 |
|---|---|---|
| 멤버 사진 0장 | 큼 — 일본 팬덤 시각 의존도 높음 | Wikimedia Commons 활용 가능 |
| Apple Music / Spotify 링크 | 중 — 2026-02 스트리밍 개방 활용 못 함 | MB streaming URL relation 으로 자동화 가능 |
| 가사 (한국어 / 일본어 / 영어) | 중 | 저작권 (JASRAC / KOMCA) 으로 전재 불가. 한국어 H!P 가사 hub 부재로 deep-link 도 어려움. 외부 사이트 deep-link 만 가능 |
| 모바일 D3 줌 | 중 — pinch-zoom 미지원 | 데스크탑 마우스 휠 전제 |
| Aa! / High-King / Harvest / Green Fields / Diana Lane 의 곡 데이터 | 소 | H!P Fandom Wiki 에 해당 그룹 Singles 카테고리가 없음. 멤버 lineage 만 수록 |
| Diana Lane (사토우미 트리오, 2012) | 소 | MB 미등록. 그룹 자체가 lineage 에서 누락 |
| 셔플 유닛 (Sexy 8, Happy 7, Odoru 11 등 연말 셔플) | 중 | MB / wiki 양쪽에서 시드 부족. 추후 hand-craft 필요 |

### YouTube 영상

곡마다 YouTube 검색 deep-link 가 distribution 페이지의 곡 헤더에 있음
(`▶ YouTube 公式 MV` 버튼). 검색 키워드는 `<그룹> <곡명> official` 이고,
공식 채널 영상이 거의 항상 첫 결과로 나옴.

**검색 deep-link 를 쓰는 이유**: (1) 곡별 정확한 영상 ID 의 자동 수집 데이터가
MB / Fandom Wiki 양쪽에서 부실 (LOVE Machine 같은 인기곡 외 등록률 0%).
(2) `&sp=...` 같은 비공식 필터 파라미터로 verified channel 만 노출시키면
정확하지만 YouTube 가 바꾸면 깨짐. (3) 임베드 0개 = 페이지 로딩 비용 0.

위 결손은 별도 작업으로 분리되어 있습니다. **frozen era archive** 의
데이터 보강이지 framing 변경이 아닙니다.

## Planned

없음. **종결된 시기를 다루는 아카이브** 이므로 정의상 신규 콘텐츠는 추가
계획에 들어가지 않습니다. Known gaps 의 데이터 시드 / 사진 / 스트리밍
링크는 "현 framing 내 완성도" 작업이며 "새 기능" 이 아닙니다.

## Design intent

- **종결된 시기만 다루기.** 현재진행형 H!P 추적은 일본 자국의 공식 사이트
  + 실시간 SNS + 위키가 압도적이므로 한국발 사이트가 들어갈 자리가 없음.
  반면 "황금기·플래티넘기를 보면서 들을 수 있는 시각 아카이브" 는 빈자리.
- **정적 JSON → 런타임 비용 0.** 빌드 시점에 `src/data/*.json` 으로 고정.
  서버나 DB 없음. 아카이브가 호스팅 비용을 짊어질 이유가 없음.
- **MusicBrainz 단일 출처.** CC0 public domain, 커뮤니티 큐레이션. 위키나
  팬 사이트를 스크랩해서 출처 책임이 모호해지는 것을 피함.
- **D3 + Recharts 분리.** 타임라인은 zoom / pan / lane 레이아웃 → D3.
  분포는 표준 차트 → Recharts. 한 라이브러리로 통일하지 않음.
- **다국어를 데이터 레벨에 둠.** 멤버명 / 그룹명 / 사유까지 ko / ja / en
  세 필드로 저장. 컴포넌트가 언어 분기를 모르게 함.

## Non-goals

- **현재진행형 H!P 추적.** 2015-01 이후 졸업·가입·신곡은 명시적으로 제외.
- 라이브 데이터 동기화. JSON 은 수동 재생성.
- 사용자 인증, 댓글, 즐겨찾기. 아카이브에 커뮤니티 기능 없음.
- 콘서트 / 굿즈 / 티켓 정보. 종결된 시기라 의미 없음.
- Hello! Project / UP-FRONT 와의 공식 관계. 본 프로젝트는 어떠한 사단 /
  소속 회사와도 무관한 fan-made 시각 아카이브.

## Redacted

없음.

## 데이터 재생성

```bash
npx tsx scripts/scrape-musicbrainz.ts   # JSON 재생성 (MB rate limit 준수)
```

결과물: `src/data/{members,groups,memberships,songs,distributions}.json`.
재생성 후에는 2015-01-01 컷오프 필터를 다시 적용해야 합니다 (현재는 수동
jq 파이프라인). 자동화는 known gaps 의 일부.

## 개발

```bash
npm install
npm run dev      # 개발 서버 (basePath 없음, http://localhost:3000)
npm run build    # 정적 사이트 빌드 → out/
npm run lint     # ESLint
```

## 배포 (GitHub Pages)

`main` 푸시 → `.github/workflows/deploy.yml` 가 자동으로 `out/` 정적 산출물을
GitHub Pages 환경에 업로드. URL 은 https://heznpc.github.io/hello-project/.

- `NEXT_PUBLIC_BASE_PATH=/hello-project` 가 CI 빌드에서만 주입되므로 로컬
  dev/build 는 루트로 동작.
- 동시 배포는 1개로 제한 (`concurrency: pages`). 진행 중 배포는 강제 취소
  되지 않음 (production 보호).
- 본 사이트는 데이터 컷오프 고정이라 빌드 산출물도 사실상 고정 — 정적
  호스팅 비용 0 이 의도된 설계 일부.

## Next.js 16 주의

이 프로젝트는 Next.js 16 의 새로운 컨벤션을 사용합니다 (`AGENTS.md` 참조).
`params` / `searchParams` 가 Promise, `cookies()` async, `middleware.ts`
대신 `proxy.ts`. 코드를 수정하기 전에 `node_modules/next/dist/docs/` 의
가이드를 확인할 것.

## 라이선스 / 출처

- 코드: MIT
- 데이터 출처: MusicBrainz (CC0 — public domain)
- 멤버 / 그룹 이름과 활동 정보는 MusicBrainz 의 public artist relations.
