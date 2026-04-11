# hello-project

> Hello! Project (ハロー！プロジェクト) 멤버 타임라인 + 곡별 라인 분포 시각화.

25년 넘는 H!P 의 그룹 / 멤버 / 가입·졸업 이벤트를 인터랙티브 D3 타임라인으로
훑고, 각 곡의 멤버별 파트 비율을 막대 / 파이로 비교한다. 데이터는 MusicBrainz
API 에서 일괄 수집하고, 한국어 / 일본어 / 영어 세 언어로 멤버·그룹 이름을
보여준다.

## 무엇이 들어 있는가

- **멤버 타임라인 (`/timeline`)** — 그룹 별 lane, 멤버 별 막대. D3 zoom (1×–20×),
  사이드바 그룹 토글, 호버 시 가입/탈퇴 사유 툴팁 (졸업·탈퇴·해산·이적).
- **파트 분배 분석 (`/distribution`)** — 곡별 멤버 라인 비율. 막대 vs 파이 토글.
- **랜딩 (`/`)** — 통계 카드 + 활동 중인 그룹 칩.

## 데이터 출처

- [MusicBrainz](https://musicbrainz.org/) 의 group / member / membership relations.
- 수집 스크립트: `scripts/scrape-musicbrainz.ts` — MB rate limit 1.1초 준수,
  custom User-Agent, group MBID는 hardcoded + name search fallback, 멤버 생일은
  artist `life-span.begin` 에서 추출.
- 결과물: `src/data/{members,groups,memberships,songs,distributions}.json`.

```bash
npx tsx scripts/scrape-musicbrainz.ts   # JSON 재생성
```

## 기술 스택

- **Next.js 16 (App Router)** + React 19 + TypeScript strict
- **Tailwind v4**
- **D3 v7** (timeline) + **Recharts v3** (distribution)
- 정적 JSON 데이터 → 런타임 비용 0
- i18n: ko / ja / en (랜딩, 멤버명, 그룹명, 가입/탈퇴 사유)

## 개발

```bash
npm install
npm run dev      # 개발 서버
npm run build    # 정적 사이트 빌드
npm run lint     # ESLint
```

## 주의

이 프로젝트는 Next.js 16 의 새로운 컨벤션을 사용한다 (`AGENTS.md` 참조).
`params` / `searchParams` 가 Promise, `cookies()` async, `middleware.ts` 대신
`proxy.ts`. 코드를 수정하기 전에 `node_modules/next/dist/docs/` 의 가이드를
한 번 확인할 것.

## 라이선스 / 출처

- 코드: MIT
- 데이터 출처: MusicBrainz (CC0 — public domain)
- 멤버 / 그룹 이름과 활동 정보는 MusicBrainz 의 public artist relations.
- 본 프로젝트는 Hello! Project, UP-FRONT, 또는 어떠한 사단/소속 회사와도
  공식 관계가 없는 fan-made 시각화이다.
