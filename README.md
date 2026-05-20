# hello-project

**Status: Lab — not production.** Frozen fanart project. 유지보수 / 기능 추가
계획 없음. 코드와 데이터를 공개하는 것이 목적이며, 외부 사용자 지원이나
정기 업데이트는 제공하지 않는다.

> Hello! Project (ハロー！プロジェクト) 멤버 타임라인 + 곡별 라인 분포 시각화.

25년 넘는 H!P 의 그룹 / 멤버 / 가입·졸업 이벤트를 인터랙티브 D3 타임라인으로
훑고, 각 곡의 멤버별 파트 비율을 막대 / 파이로 비교한다. 데이터는 MusicBrainz
API 에서 일괄 수집하고, 한국어 / 일본어 / 영어 세 언어로 멤버·그룹 이름을
보여준다.

## Currently implemented

- **멤버 타임라인 (`/timeline`)** — 그룹 별 lane, 멤버 별 막대. D3 zoom (1×–20×),
  사이드바 그룹 토글, 호버 시 가입/탈퇴 사유 툴팁 (졸업·탈퇴·해산·이적).
- **파트 분배 분석 (`/distribution`)** — 곡별 멤버 라인 비율. 막대 vs 파이 토글.
- **랜딩 (`/`)** — 통계 카드 + 활동 중인 그룹 칩.
- **데이터 수집 스크립트** — `scripts/scrape-musicbrainz.ts`. MB rate limit
  1.1초 준수, custom User-Agent, group MBID hardcoded + name search fallback,
  멤버 생일은 artist `life-span.begin` 에서 추출.
- **i18n** — ko / ja / en (랜딩, 멤버명, 그룹명, 가입/탈퇴 사유).
- **CI** — lint / typecheck / build workflow (`ci/add-workflow-and-fix-lint`).

## Planned

없음. Frozen.

## Design intent

- **정적 JSON → 런타임 비용 0.** 빌드 시점에 `src/data/*.json` 으로 고정.
  서버나 데이터베이스 없음. fanart 프로젝트가 호스팅 비용을 짊어질 이유가 없다.
- **MusicBrainz 단일 출처.** CC0 public domain, 커뮤니티가 큐레이션한 artist
  relations. 위키/팬 사이트를 스크랩해서 출처 책임이 모호해지는 것을 피한다.
- **D3 + Recharts 분리.** 타임라인은 zoom / pan / lane 레이아웃이 필요해서 D3,
  분포는 표준 차트라 Recharts. 한 라이브러리로 통일하지 않는다.
- **다국어를 데이터 레벨에 둠.** 멤버명 / 그룹명 / 사유까지 ko / ja / en
  세 필드로 저장. 컴포넌트가 언어 분기를 모르게 한다.

## Non-goals

- 라이브 데이터 업데이트 / 자동 동기화. JSON 은 수동 재생성.
- 사용자 인증, 댓글, 즐겨찾기 같은 community 기능.
- 모바일 최적화. 데스크탑 D3 zoom 이 주 사용 시나리오.
- Hello! Project, UP-FRONT 와의 공식 관계. 본 프로젝트는 어떠한 사단 /
  소속 회사와도 무관한 fan-made 시각화이다.

## Redacted

없음.

## 데이터 재생성

```bash
npx tsx scripts/scrape-musicbrainz.ts   # JSON 재생성 (MB rate limit 준수)
```

결과물: `src/data/{members,groups,memberships,songs,distributions}.json`.

## 개발

```bash
npm install
npm run dev      # 개발 서버
npm run build    # 정적 사이트 빌드
npm run lint     # ESLint
```

## Next.js 16 주의

이 프로젝트는 Next.js 16 의 새로운 컨벤션을 사용한다 (`AGENTS.md` 참조).
`params` / `searchParams` 가 Promise, `cookies()` async, `middleware.ts` 대신
`proxy.ts`. 코드를 수정하기 전에 `node_modules/next/dist/docs/` 의 가이드를
확인할 것.

## 라이선스 / 출처

- 코드: MIT
- 데이터 출처: MusicBrainz (CC0 — public domain)
- 멤버 / 그룹 이름과 활동 정보는 MusicBrainz 의 public artist relations.
