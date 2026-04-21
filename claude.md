# 🎯 NVIDIA-Style Lucky Draw System
## Expanded Implementation Spec for Claude / Codex

---

## 1. Project Goal

Build a **stage-ready lucky draw web application** for a large NVIDIA-related event.

The system should:
- ingest a participant list from Google Sheets / Excel
- visually convey that all ~700 participants are included
- select **10 + 10 finalists** in two waves
- display the **final 20** in a dramatic 5x2 grid
- transform those 20 into marbles
- use the base roulette simulation from:
  - https://github.com/lazygyu/roulette
- reveal **1 final winner**

This is **not** just a raffle tool.  
It should feel like a **live show sequence**.

---

## 2. High-Level Creative Direction

### Tone
- Dramatic
- Clean
- Minimal text
- Premium stage presentation
- Slightly playful, but **not goofy**

### Avoid
- Over-explaining the logic
- Obvious CPU vs GPU gimmicks
- Meme overload
- Cheap “casino” feeling
- Excessive spinning-wheel aesthetics

### Target Feeling
The audience should feel:
1. “Everyone is included”
2. “The tension is increasing”
3. “The final 20 matter”
4. “The marble simulation is the climax”
5. “The winner reveal feels earned”

---

## 3. Core Narrative

The event flow should present the finalists as people who **survived progressive stages**.

Do **not** frame the flow as:
- “random selection step 1”
- “random selection step 2”
- “now we spin again”

Instead frame it as:
- mass participant scan
- first wave survived
- second wave survived
- final 20 assembled
- final round begins

The roulette should feel like the **culmination** of the selection, not a separate disconnected tool.

---

## 4. Full Experience Flow

```text
700 Participants
    ↓
[Stage 1] Participant Scan
    ↓
[Stage 2] Wave 1: 10 survived
    ↓
[Stage 3] Wave 2: 10 more survived
    ↓
[Stage 4] Final 20 assembled (5x2 grid)
    ↓
[Stage 5] Candidate cards transform into marbles
    ↓
[Stage 6] Marble roulette simulation
    ↓
[Stage 7] Winner reveal
```

---

## 5. Functional Requirements

### Required
- import participant data
- validate and sanitize data
- remove duplicates
- randomly choose:
  - wave1 = 10
  - wave2 = 10
  - winner = 1 among final20
- present each stage with animation
- pass final 20 into roulette engine
- ensure final visual winner matches precomputed winner

### Optional but Recommended
- rehearsal mode
- fullscreen mode
- operator hotkeys or control buttons
- sound on/off toggle
- ability to restart from a stage
- logging and export of final results

---

## 6. Data Model

### 6.1 Participant Input Type

```ts
type Participant = {
  id: string;              // internal unique id
  name: string;            // required
  affiliation?: string;    // optional
  email?: string;          // optional, not shown on public display
  phone?: string;          // optional, not shown on public display
  metadata?: Record<string, unknown>;
};
```

### Notes
- `name` is required
- `affiliation` is optional but recommended for stage display
- personal/private fields must never be shown publicly unless explicitly allowed
- display should primarily use:
  - `name`
  - `affiliation`

### 6.2 Public Finalist Display Type

```ts
type DisplayCandidate = {
  id: string;
  name: string;
  affiliation?: string;
  publicLabel: string; // e.g. "Kim Minsoo · SNU"
};
```

### 6.3 Selection Result Type

```ts
type SelectionResult = {
  allParticipants: Participant[];
  wave1: Participant[];
  wave2: Participant[];
  final20: Participant[];
  winner: Participant;
};
```

---

## 7. Input Sources

Supported input formats:

### Option A: Excel file
- `.xlsx`
- `.csv`

### Option B: Google Sheets export
- CSV export
- pasted JSON
- or pre-downloaded spreadsheet file

### Expected input columns
At minimum:
- `name`

Optional:
- `affiliation`
- `email`
- `phone`

The app should allow mapping spreadsheet columns to internal fields if possible.

---

## 8. Data Preprocessing Rules

### 8.1 Validation
- drop rows with empty name
- trim whitespace
- normalize Unicode if needed
- collapse repeated spaces

### 8.2 Deduplication
Use a practical rule, for example:
- same normalized name + same affiliation → duplicate

If email exists:
- same email should be treated as duplicate

### 8.3 Randomization
After validation and deduplication:
- shuffle all valid participants

---

## 9. Selection Logic

### 9.1 Simple Version

```ts
shuffle(validParticipants);

wave1 = first 10;
wave2 = next 10;
final20 = [...wave1, ...wave2];
winner = random pick from final20;
```

### 9.2 Important Principle

The winner must be **computed before the final animation**.

Why:
- the animation must be deterministic for stage operation
- the roulette is a dramatic reveal, not the source of actual uncertainty during the live show
- live stage systems should avoid “true uncontrolled randomness” at reveal time

This means:
- `final20` are selected first
- `winner` is selected second
- roulette is configured so that the preselected winner becomes the final winner visually

### 9.3 Fairness Note
The README does not need to expose internal show mechanics to the audience.  
But engineering-wise, the selection process should be:
- random
- logged
- reproducible if needed

Suggested:
- store a session seed
- store participant hash
- store selected ids

---

## 10. UI Stage Breakdown

### Stage 1 — Participant Scan

#### Goal
Convince the audience that the entire pool is included.

#### Duration
~2 to 4 seconds

#### Visual
- dark background
- fast-moving names in multiple columns or a stream
- not intended to be individually readable
- names should feel dense and numerous

#### Motion
- quick horizontal or vertical motion
- slight blur
- occasional pause-like accents

#### Text Overlay
Recommended:
```text
All candidates loaded
```

Alternative:
```text
All participants entered
```

#### Key Constraint
Do not render 700 heavy animated cards simultaneously.  
Use lightweight text rendering for the scan stage.

---

### Stage 2 — Wave 1

#### Goal
Reveal the first 10 finalists.

#### Visual Behavior
- while scan continues or settles, 10 names “pop out”
- they may appear to detach from the stream
- they should land on one side or in temporary positions

#### Motion Style
- pop
- snap
- slight bounce
- mild glow

#### Text Overlay
```text
10 survived
```

#### Notes
This should not feel like a boring list.  
Each of the 10 should emerge with a little impact.

---

### Stage 3 — Wave 2

#### Goal
Reveal the second 10 finalists.

#### Visual Behavior
- another 10 emerge
- should feel like continuation, not repetition

#### Motion Variation Ideas
- different entrance angle
- slightly different grouping
- staggered timings

#### Text Overlay
Recommended:
```text
10 more survived
```

Alternative:
```text
Second wave cleared
```

#### Notes
Wave 1 and Wave 2 must feel related but not copy-pasted.

---

### Stage 4 — Final 20 Grid

#### Goal
Present the 20 finalists clearly and build emotional focus.

#### Layout
- 5 columns × 2 rows
- centered
- each card includes:
  - name
  - affiliation

#### Visual Style
- premium dark UI
- subtle glow or highlight border
- clean typography
- not too busy

#### Motion
- Wave 1 and Wave 2 move toward center
- cards settle into a 5x2 grid
- optional sequential spotlight or focus pass

#### Text Overlay
```text
Final 20
```

#### Notes
This is the first stage where the audience can actually read the finalists.

---

### Stage 5 — Card to Marble Transformation

#### Goal
Bridge the selection UI into the physics simulation world.

#### This is a critical transition.
If this is awkward, the whole experience feels stitched together.

#### Required Behavior
For each finalist card:
1. slight tension / shake
2. card breaks apart into particles or fragments
3. fragments condense into a marble
4. marble inherits candidate identity

#### Identity Preservation
Even after transformation, the audience should still understand:
- each marble corresponds to one finalist

Possible methods:
- label above marble
- list on side panel
- color-number mapping

#### Text Overlay
```text
Final round begins
```

#### Notes
This stage is what makes the roulette feel like a continuation of the narrative.

---

### Stage 6 — Marble Roulette Simulation

#### Goal
Deliver the visual climax using the lazygyu roulette repo.

#### Base Repo
- https://github.com/lazygyu/roulette

#### Core Intent
We are reusing the base physics simulation structure and adapting it to this event's visual language.

#### Visual Theme
- dark background
- NVIDIA-inspired green accents
- premium lighting
- avoid clutter
- keep readability high

#### Text Overlay Suggestions
At start:
```text
Round started
```

Near ending:
```text
Last one remains
```

At completion:
```text
Selection complete
```

#### Winner Rule
Recommended:
- winner = last marble crossing

This feels more dramatic.

#### Camera Suggestions
Optional:
- track active marbles
- zoom in for final 5
- stronger focus for final 3

---

### Stage 7 — Winner Reveal

#### Goal
Deliver a satisfying final moment.

#### Behavior
- isolate winner
- fade out non-winners
- winner name enlarged
- affiliation shown
- optional confetti / particles
- optional sound hit

#### Text Overlay
Possible:
```text
Winner
```

or simply show:
- full name
- affiliation

#### Notes
Keep it elegant.  
Do not turn this into a cheap game-show explosion unless the event tone explicitly wants that.

---

## 11. How to Adapt the lazygyu/roulette Repo

This section explains the intent of integration.

### 11.1 Current Use
The repo provides:
- marble generation
- stage geometry
- physics simulation
- ranking / finishing logic

We want to keep that core, while changing:
- input pipeline
- visual theming
- stage integration
- winner control

### 11.2 Required Repo-Level Changes

#### A. Accept structured candidate input
Current simple API may take string names.  
We need support for richer candidate objects.

Recommended internal type:
```ts
type FinalistMarble = {
  id: string;
  name: string;
  affiliation?: string;
  isWinner: boolean;
};
```

#### B. Theme customization
Update:
- background
- fonts
- marble labels
- color palette
- glow effects

Suggested palette:
- near black background
- white / off-white text
- NVIDIA green accent: `#76B900`

#### C. Precomputed winner support
The roulette should support a preselected winner.

Engineering goal:
- the final displayed winner must match `SelectionResult.winner`

Possible implementation approaches:
1. controlled physics parameters
2. stage bias
3. final ranking override
4. deterministic seeded simulation

Prefer:
- deterministic and subtle solution
- do not make winner control visually suspicious

#### D. Public label rendering
Each marble should visually map to a candidate.
Possible options:
- label above marble
- list on side panel
- color-number mapping

#### E. Event-stage embedding
The roulette should not be a separate page with abrupt context switch.
It should be mounted as the next stage in the same app flow.

---

## 12. Recommended Application Architecture

Use a React app.

Suggested stack:
- React
- TypeScript
- Framer Motion for stage transitions
- SheetJS for spreadsheet parsing
- Existing roulette engine embedded or adapted
- Zustand / Redux / context for state management

### 12.1 Suggested Folder Structure

```text
src/
  app/
    App.tsx
    routes/
  components/
    common/
    stage/
    roulette/
  features/
    input/
    selection/
    reveal/
  lib/
    parser/
    random/
    logger/
  state/
    useAppStore.ts
  types/
    participant.ts
    selection.ts
  assets/
    sounds/
    fonts/
    images/
```

### 12.2 Stage Components

Suggested stage components:

```text
ParticipantScanStage
WaveRevealStage
FinalGridStage
TransformStage
RouletteStage
WinnerRevealStage
```

---

## 13. State Machine Design

Suggested top-level app states:

```ts
type AppStage =
  | "idle"
  | "data_loaded"
  | "scan"
  | "wave1"
  | "wave2"
  | "final20"
  | "transform"
  | "roulette"
  | "winner";
```

### State Flow
```text
idle
→ data_loaded
→ scan
→ wave1
→ wave2
→ final20
→ transform
→ roulette
→ winner
```

### Notes
Using an explicit stage state makes it easier to:
- rehearse
- debug
- restart
- control operator flow

---

## 14. Operator Controls

Recommended operator actions:
- Load data
- Start show
- Next stage
- Replay current stage
- Skip to winner
- Toggle sound
- Fullscreen toggle

Optional keyboard shortcuts:
- Space: next stage
- R: replay stage
- F: fullscreen
- M: mute

---

## 15. Timing Guide

This is a recommended baseline.

### Stage Timing
- Scan: 2.5–4.0 sec
- Wave 1 reveal: 1.5–2.5 sec
- Wave 2 reveal: 1.5–2.5 sec
- Final 20 grid settle: 2.0–3.0 sec
- Card → marble transform: 1.5–2.5 sec
- Roulette: 6–12 sec depending on drama
- Winner reveal: 3–5 sec

### Full Show Duration
Recommended total:
- 18 to 28 seconds

Long enough to feel dramatic, short enough to keep attention.

---

## 16. Animation Principles

### Good
- clear hierarchy
- controlled pacing
- small pauses before transitions
- one focal action at a time

### Bad
- too much simultaneous motion
- too many particle effects
- unreadable text
- too many joke overlays
- abrupt hard cuts

---

## 17. Typography and Layout

### Typography
Use strong, clean, modern sans-serif typography.

### Hierarchy
- Stage text small and minimal
- Candidate names medium
- Winner name very large

### Layout Principles
- lots of negative space
- center-weighted composition
- avoid UI clutter
- keep alignment clean

---

## 18. Sound Design (Optional but Strongly Recommended)

### Stage 1
- subtle scanning texture
- low tension bed

### Wave stages
- soft impact sounds for pop-out

### Final 20
- tonal rise or shimmer

### Card → marble
- transformation sound
- particle swell

### Roulette
- rolling / collision texture
- escalating tension

### Winner
- impact + short celebratory lift

### Important
Sound should enhance tension, not become cheesy.

---

## 19. Logging / Audit Data

Store a log object like:

```ts
type DrawLog = {
  timestamp: string;
  participantCount: number;
  validParticipantCount: number;
  wave1Ids: string[];
  wave2Ids: string[];
  final20Ids: string[];
  winnerId: string;
  seed?: string;
};
```

This helps for:
- rehearsal verification
- dispute prevention
- post-event records

---

## 20. Rehearsal Mode

Recommended feature:
- load mock data
- generate fake names
- rerun full show repeatedly

Rehearsal mode is useful because event timing matters more than raw algorithm complexity.

---

## 21. Performance Constraints

### Must
- feel smooth on presentation hardware
- maintain responsive transitions
- avoid jank during stage handoff

### Recommendations
- do not mount expensive heavy components too early
- preload fonts and sounds
- preload final20 assets before roulette stage
- keep scan stage lightweight
- profile roulette stage independently

---

## 22. Privacy / Safety Considerations

If input data contains private fields:
- do not display them publicly
- keep stage display limited to approved public fields

Public display should usually show only:
- name
- affiliation

Never accidentally reveal:
- full email
- phone number
- private notes

---

## 23. Engineering Tasks Breakdown

### Task 1 — Data Input
- parse spreadsheet
- map fields
- validate
- deduplicate

### Task 2 — Selection Engine
- shuffle
- select wave1 / wave2 / final20 / winner
- store results

### Task 3 — Show State Management
- stage transitions
- replay logic
- operator controls

### Task 4 — Stage UI
- participant scan
- wave reveals
- final20 grid
- winner reveal

### Task 5 — Transformation System
- card to marble animation

### Task 6 — Roulette Integration
- adapt lazygyu repo
- accept finalists
- style theme
- deterministic winner

### Task 7 — Polish
- sounds
- overlays
- fullscreen
- logging

---

## 24. Implementation Priorities

### Priority 1
Get a full end-to-end working prototype:
- load data
- generate final20
- run all stages
- reveal winner

### Priority 2
Make transitions seamless:
- wave timing
- grid formation
- card → marble transformation

### Priority 3
Polish roulette:
- theme
- labels
- camera
- winner drama

### Priority 4
Add operator UX:
- controls
- restart
- rehearsal mode

---

## 25. Suggested MVP Scope

For the first working build, it is enough to support:

- CSV/XLSX input
- name + affiliation only
- scan animation using text
- wave1 / wave2 reveal
- final20 grid
- simple card → marble transition
- embedded roulette with 20 marbles
- predetermined winner
- final winner screen

Everything else can be layered on top afterward.

---

## 26. Final Creative Rule

This project should never feel like:
- a spreadsheet tool with animations
- a generic raffle website
- a casino spinner

It should feel like:
- a staged finalist selection sequence
- a premium event moment
- a dramatic simulation-based finale

---

## 27. Final Instruction for Implementers

When in doubt, prefer:
- simpler text
- cleaner visuals
- stronger transitions
- fewer jokes
- more confidence

The success of this project depends less on algorithm complexity and more on:
- pacing
- continuity
- readability
- emotional timing

---

## 28. One-Sentence Summary

> Build a premium, stage-ready finalist selection experience where 700 participants narrow to 20 in two dramatic waves, then transform seamlessly into a marble simulation that reveals one final winner.
