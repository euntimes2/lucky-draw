# NVIDIA Lucky Draw

Stage-ready finalist selection web app for live events. Built with React 19, TypeScript, Vite, Framer Motion, and canvas-confetti.

## Features

- **Two modes**
  - **Pick 1** — draws 20 finalists in a single wave → 20-slice spinning wheel → 1 winner
  - **Pick 5** — draws 5 finalists → fireworks celebration (no wheel)
- **Click-time randomness** — every Draw / Stop click generates a fresh seed (`Date.now()` + `crypto`) on the spot. No pre-computation.
- **Dramatic waves** — 4-second ticker shuffles through the full pool, then finalists pop in sequentially with spring physics.
- **Spinning wheel** — custom SVG with dark neon gradient slices, 22-second ease-out deceleration with zoom-in toward the pointer.
- **Continuous fireworks** — canvas-confetti bursts trigger non-stop on winner / Pick 5 celebration screen.
- **Spreadsheet input** — `.xlsx` / `.csv` / Google Sheets CSV. Token-based header matching (Korean + English aliases). Email-based deduplication.
- **Operator controls** — center CTA for primary action, bottom-right strip for back / replay / restart / sound / fullscreen / export log. Shortcuts: `Space` (next/stop), `R` (replay), `F` (fullscreen), `M` (mute).
- **Resolution-independent** — locked to a 1440×900 canvas, scaled uniformly on any display via `transform: scale()`.
- **Audit log** — JSON export with seeds, picked IDs, and participant fingerprint hash.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production bundle in dist/
```

Requires Node ≥ 18.

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

- **Duplicates** removed by email when present, otherwise by normalised `name + affiliation`.
- Unknown columns are preserved on each record's `metadata` and never rendered on stage.

### Minimal example

| 이름 / Name | 학과 / Major | 이메일 / Email |
| --- | --- | --- |
| 홍길동 / Gildong Hong | 컴퓨터공학부 | hong@snu.ac.kr |
| Akanksh Eati | Materials Science | akanksh@gmail.com |
| 김우진 | 통계학과 | kim@snu.ac.kr |
| … (20+ rows) |

## Credits

Built by [@euntimes2](https://github.com/euntimes2).
