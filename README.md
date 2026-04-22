# 🎉 NVIDIA Lucky Draw

> **Stage-ready finalist selection system**  
> Built for Bryan Catanzaro's NVIDIA session @ Seoul National University (303 Building · 2026-04-22)

---

![NVIDIA Lucky Draw](public/first_page.png)

---

## ✨ Overview

**NVIDIA Lucky Draw** is a high-impact, live-event-ready raffle system designed for large audiences.

It turns a simple draw into a **cinematic experience** —  
from dynamic shuffling to a dramatic final reveal.

- ⚡ Real-time randomness (no precomputation)
- 🎬 Stage-optimized animations
- 🎯 Designed for large-scale audiences (100–1000+ participants)

---

## 🧠 Core Experience

### 🎡 Pick 1 Mode
- 20 finalists selected in a **dramatic wave**
- Spinning wheel (SVG-based)
- 22-second cinematic deceleration
- Final zoom-in winner reveal

### 🎆 Pick 5 Mode
- 5 finalists instantly revealed
- Fireworks celebration (no wheel)
- Optimized for fast-paced events

---

## 🔥 Highlights

- 🎲 **True randomness at click-time**
  - Seed = `Date.now()` + `crypto`
  - Nothing precomputed → fully fair

- 🌊 **Dramatic selection waves**
  - Full pool shuffle → finalists pop in sequentially
  - Spring-based motion (Framer Motion)

- 🎡 **Custom spinning wheel**
  - Neon gradient slices
  - Smooth 22s ease-out physics
  - Camera zoom toward pointer

- 🎆 **Fireworks finale**
  - Powered by canvas-confetti
  - 5-second celebration burst

- 📊 **Flexible spreadsheet input**
  - `.xlsx`, `.csv`, Google Sheets
  - Smart bilingual header parsing
  - Email-based deduplication

- 🎛 **Operator-friendly controls**
  - Keyboard shortcuts:
    - `Space` → next / stop
    - `R` → replay
    - `F` → fullscreen
    - `M` → mute

- 🖥 **Resolution-independent**
  - Fixed 1440×900 canvas
  - Auto scaling for any display

- 🧾 **Audit log export**
  - Seeds
  - Selected IDs
  - Participant fingerprint hash

---

## 🛠 Tech Stack

- React 19
- TypeScript 5.6
- Vite 7
- Framer Motion
- canvas-confetti
- read-excel-file
- Node ≥ 18

---

## 🚀 Getting Started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build
```

---

## 📄 Input Format (Excel / CSV)

- First row → **header**
- Minimum **20 participants required**
- If sheet `정리` exists → automatically used

### Supported Fields

| Field | Required | Notes |
|------|--------|------|
| name | ✅ | 필수 |
| affiliation | ❌ | optional |
| email | ❌ | deduplication |
| phone | ❌ | optional |

---

### 📌 Example

| 이름 / Name | 학과 / Major | 이메일 |
|------------|------------|--------|
| 홍길동 | 컴퓨터공학부 | hong@snu.ac.kr |
| Akanksh Eati | Materials Science | akanksh@gmail.com |
| 김우진 | 통계학과 | kim@snu.ac.kr |

---

## 🎯 Why This Exists

Most raffle tools are:
- boring ❌
- predictable ❌
- not stage-friendly ❌

This one is built to:
- **engage the audience**
- **look impressive on screen**
- **feel fair and transparent**

---

## 🙌 Credits

Built with care by  
https://github.com/euntimes2
