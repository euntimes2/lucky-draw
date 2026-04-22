# NVIDIA Lucky Draw

Stage-ready finalist selection web app for live events.

![NVIDIA Lucky Draw](public/first_page.png)

### Tech stack

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-12-0055FF?style=flat-square&logo=framer&logoColor=white)
![canvas-confetti](https://img.shields.io/badge/canvas--confetti-1.9-FFB800?style=flat-square)
![read-excel-file](https://img.shields.io/badge/read--excel--file-9-1D6F42?style=flat-square&logo=microsoftexcel&logoColor=white)
![Node](https://img.shields.io/badge/Node-%E2%89%A518-5FA04E?style=flat-square&logo=node.js&logoColor=white)

## Features

- **Two modes**
  - **Pick 1** — draws 20 finalists in a single wave → 20-slice spinning wheel → 1 winner
  - **Pick 5** — draws 5 finalists → fireworks celebration (no wheel)
- **Click-time randomness** — every Draw / Stop click seeds the RNG on the spot (`Date.now()` + `crypto`). Nothing is pre-computed.
- **Dramatic waves** — 4-second ticker shuffles through the full pool, then finalists pop in sequentially with spring physics.
- **Spinning wheel** — custom SVG, dark neon gradient slices, 22-second ease-out deceleration with zoom toward the pointer.
- **Fireworks finale** — `canvas-confetti` bursts for 5 seconds on the winner / Pick 5 celebration screen.
- **Spreadsheet input** — `.xlsx` / `.csv` / Google Sheets CSV. Token-based bilingual header matching. Email-based deduplication.
- **Operator controls** — center CTA for primary action, bottom-right strip for back / replay / restart / sound / fullscreen / export log. Shortcuts: `Space` (next / stop), `R` (replay), `F` (fullscreen), `M` (mute).
- **Resolution-independent** — locked to a 1440×900 canvas, scaled uniformly on any display via `transform: scale()`.
- **Audit log** — JSON export with seeds, picked IDs, and participant fingerprint hash.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production bundle in dist/
```

## Excel / CSV format

- **First row = header**, second row onwards = participants.
- **Minimum 20 participants** (app refuses to start below that).
- If the workbook contains a sheet named **`정리`**, that sheet is used; otherwise the first sheet.
- Column order does not matter — the parser matches headers by **token**. Header cells can be long bilingual composites (e.g. `"1. 이름 / Name\n\n예시) 홍길동 / Gildong Hong"`) and still match on any recognised token.

| Internal field | Required | Accepted header tokens (case / spacing insensitive) |
| --- | --- | --- |
| `name` | **yes** | `이름`, `성명`, `참가자`, `name`, `fullname`, `participant`, `candidate` |
| `affiliation` | optional | `학과`, `전공`, `major`, `department`, `단과대학`, `college`, `school`, `학교`, `소속`, `affiliation`, `organization`, `company`, `회사`, `기관`, `team` |
| `email` | optional | `이메일`, `email`, `mail` |
| `phone` | optional | `휴대폰`, `연락처`, `전화`, `mobile`, `phone` |

Duplicates are removed by email when present, otherwise by normalised `name + affiliation`. Unknown columns are preserved on each record's `metadata` and never rendered on stage.

### Minimal example

| 이름 / Name | 학과 / Major | 이메일 / Email |
| --- | --- | --- |
| 홍길동 / Gildong Hong | 컴퓨터공학부 | hong@snu.ac.kr |
| Akanksh Eati | Materials Science | akanksh@gmail.com |
| 김우진 | 통계학과 | kim@snu.ac.kr |
| … (20+ rows) |

## Credits

Built by [@euntimes2](https://github.com/euntimes2).
