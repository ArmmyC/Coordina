# CareFlow Web App UI Blueprint

## Product framing
**CareFlow** is not a generic dashboard. The interface should make one thing obvious in under 10 seconds:

> The hospital looks crowded, but the real bottleneck is deeper — and CareFlow explains it.

So the UI should be designed around **progressive explanation**:
1. Show hospital pressure
2. Show department-level signals
3. Reveal AI root cause
4. Show safe next follow-up actions
5. Show impact and human review

---

## Core UI principle
Design CareFlow like a **mission control + executive intelligence product**, not like old hospital software.

The feeling should be:
- calm under pressure
- trustworthy
- high-signal
- operationally serious
- AI-native
- premium enough for judges to say “this feels real”

Avoid:
- cluttered EMR-style screens
- too many table-heavy admin panels
- overly bright emergency-red interfaces
- chatbot-first UI

The AI is the main intelligence layer, so the interface should be **insight-first**, not data-first.

---

## Design style
### Visual style
Use a clean, modern operations UI:
- dark navy / slate base or very clean light mode
- white or soft-slate cards
- one strong accent color for AI insights
- semantic colors only for status
- rounded cards
- soft shadows
- spacious layout
- minimal borders
- large numbers with clear labels

### Recommended visual direction
- **Primary background:** deep navy or cool off-white
- **Card background:** white / light slate
- **Primary accent:** cyan or teal for AI intelligence
- **Warning:** amber
- **Critical:** red
- **Stable:** green
- **Muted text:** slate gray

### Product personality
CareFlow should feel like:
- hospital-safe
- executive-grade
- intelligent but not flashy
- advanced without looking experimental

---

## Information architecture
Top navigation should be simple and judge-friendly.

### Main nav
- Overview
- Agents
- Root Cause
- Time Loss Mode
- Action Brief
- Anomaly Radar
- Impact
- Future Modes

### Secondary utility area
Top-right:
- Hospital selector
- Scenario selector
- Time snapshot
- Synthetic data badge
- Safety boundary badge

---

## Recommended app structure

## 1. Landing / Intro screen
### Goal
Immediately explain the product and give a strong first impression.

### Layout
**Hero section**
- Headline: `CareFlow: The AI coordination layer for Post-AGI hospitals`
- Subheadline: `Normal dashboards show that the queue is long. CareFlow explains why — and what humans should consider next.`
- Primary CTA: `Open Live Hospital Simulation`
- Secondary CTA: `See How CareFlow Works`

### Supporting visual
On the right side, use a visual showing:
- ED pressure
- Department agents
- central AI conclusion
- action brief preview

### Below hero
Three value cards:
- Detect root cause, not just symptoms
- Coordinate across departments
- Keep humans in control

### Footer strip
Badges:
- Synthetic demo data
- No clinical decision-making
- Human-in-the-loop
- Time Loss Mode MVP

---

## 2. Main hospital overview dashboard
### Goal
This is the first real product screen. It should show the hospital state at a glance.

### Layout
Use a **12-column grid**.

#### Top row: KPI strip
6 compact KPI cards:
- ED Occupancy
- ED Boarders
- Ward Occupancy
- Expected Discharges Today
- Discharge Blockers
- Estimated Time Loss Today

Each card should show:
- value
- trend vs baseline
- tiny status indicator
- one-line explanation

Example:
- `ED Occupancy: 46 / 32`
- `+18% vs weekday baseline`

#### Main middle area
Split into two major columns.

### Left: Hospital Flow Summary panel
This is a large visual card.
Show:
- patient flow from ED → Ward → Discharge
- visible congestion points
- labels for blocked stages
- simple animated flow arrows

This should visually communicate:
- patients are entering
- they are not moving forward efficiently
- blockers are downstream

### Right: Central AI Snapshot
This should be one of the most visually important cards.

Sections:
- **Visible problem**
- **Naive explanation**
- **CareFlow insight**
- **Confidence**
- **Departments involved**
- **Safety note**

Example structure:
- Visible problem: `ED queue is long`
- Naive explanation: `Too many patients arrived`
- CareFlow insight: `Main cause is output blockage from discharge and bed-turnover delays`

Buttons:
- View full analysis
- Add to action brief
- Mark reviewed

#### Bottom row
Three medium cards:
- Department pressure ranking
- Time loss breakdown
- Operational status / anomaly status

---

## 3. Department Agents screen
### Goal
Show the multi-agent concept clearly and beautifully.

This page is important because it proves the architecture.

### Layout
A grid of agent cards, 3 columns on desktop.

### Agent cards
Each card should include:
- agent name
- status badge
- affected patients
- estimated time lost
- confidence
- one-sentence summary
- tiny sparkline or trend strip

Example card structure:

**ED Agent**
- Status: High pressure
- Affected patients: 15
- Time lost: 210 min
- Confidence: 0.89
- Summary: `ED crowding is high, but output blockage appears more important than new arrivals.`

### Recommended agents
- ED Agent
- Bed Agent
- Lab Agent
- Radiology Agent
- Pharmacy Agent
- Discharge Agent
- Transport Agent
- Staff Workload Agent
- Anomaly Agent

### Interaction
Clicking a card opens a side drawer with:
- local metrics
- local evidence
- why this may or may not be the main bottleneck
- related departments
- affected patient groups

This makes the UI feel much more premium than a static card grid.

---

## 4. Root Cause Analysis screen
### Goal
This is the biggest wow screen.

The interface must help judges understand the difference between:
- what people think is happening
- what is actually happening

### Layout
Two-column narrative layout.

### Left side
A stacked explanation flow:
1. Visible symptom
2. Surface explanation
3. Deeper evidence
4. Root cause
5. Recommended review path

### Right side
Evidence cards grouped by department.

### Main visual block
A large AI reasoning card with sections:
- Symptom
- Why the symptom is misleading
- Root cause chain
- Highest-leverage intervention areas
- Uncertainty
- Safety boundary

### Best visual pattern
Use a **cause chain flow**:
`Long ED queue` → `ED boarders cannot move` → `Ward beds unavailable` → `Discharges delayed` → `Pharmacy + cleaning + pickup + transport bottlenecks`

That chain is one of the most important visuals in the whole product.

### Buttons
- Add root cause summary to brief
- Assign for review
- Export shift summary

---

## 5. Time Loss Mode screen
### Goal
Make the MVP mode visually obvious and measurable.

### Layout
Top summary panel + main chart area + ranked actions.

### Top summary
- Total estimated time loss today
- Biggest bottleneck source
- Highest-impact department
- Patients most affected

### Main chart options
Best choices:
- horizontal bar chart for time lost by source
- sankey / flow map for where time is trapped
- heatmap by department and severity

### Recommended main chart
A horizontal bar chart is easiest for judges to read fast.

Categories:
- ED boarding
- Ward bed delay
- Discharge meds
- Bed cleaning
- Family pickup
- Transport
- Radiology
- Paperwork
- Consult delay

### Right-side panel: highest leverage actions
Each item includes:
- title
- owner role
- estimated time saved
- affected patients
- confidence
- evidence tags

This page should make the MVP feel operational and practical.

---

## 6. Suggested Follow-Up Actions screen
### Goal
Show AI usefulness without pretending the system executes hospital actions.

### Layout
A ranked list of action cards.

### Each action card includes
- action title
- owner role
- affected department
- reason
- affected patient count
- estimated time saved
- confidence level
- evidence tags
- uncertainty note
- safety note

### Example cards
- `Prioritize discharge medication queue`
- `Escalate medicine bed cleaning turnaround`
- `Confirm family pickup for discharge-ready patients`
- `Review porter availability for delayed transfers`

### Buttons on each card
- Mark reviewed
- Assign to role
- Add to action brief
- Escalate for decision

### Important UX rule
Do not use action buttons that imply automatic execution.
No:
- Approve
- Execute
- Discharge patient
- Override

Yes:
- Review
- Assign
- Add to brief
- Escalate

---

## 7. Action Brief screen
### Goal
Show the human-readable output of the AI system.

This should feel like something a hospital operations lead would actually use.

### Layout
A document-style panel with clean formatting.

### Header
- Brief title: `11:00 Hospital Flow Brief`
- hospital name
- timestamp
- scenario badge
- generated by CareFlow

### Sections
- Main issue
- Root cause
- Departments involved
- Suggested follow-up
- Operational watchouts
- Safety note

### Right-side utility panel
- Export PDF
- Copy summary
- Send to shift brief
- Save snapshot

### UX note
This page should look more like an executive memo than a dashboard.
That contrast makes the product feel sophisticated.

---

## 8. Anomaly Radar screen
### Goal
Show future-looking intelligence while staying safety-safe.

### Layout
Top anomaly status banner + pattern cards + baseline comparison chart.

### Normal state
Banner says:
`No abnormal operational surge detected.`

### Alert state
Banner says:
`Unusual respiratory-related ED arrival pattern detected. Recommend human review.`

### Main content
- today vs baseline
- anomaly score
- affected departments
- reason for escalation
- recommended human reviewer

### Wording rules
Always say:
- unusual pattern
- escalation for review
- operational anomaly

Never say:
- pandemic detected
- outbreak confirmed
- diagnosis inferred

---

## 9. Impact screen
### Goal
Give judges a strong closing screen.

### Layout
Large outcome metrics with strong typography.

### Show
- total time loss identified
- highest-impact root cause
- estimated releasable capacity
- departments coordinated
- action brief generated
- safety boundary respected

### Closing statement card
`AGI may tell us what a patient has. CareFlow helps the hospital safely make room to care for them.`

This screen should feel pitch-ready.

---

## 10. Future Modes screen
### Goal
Show roadmap without distracting from MVP.

### Layout
Three large cards.

#### Card 1
**Time Loss Mode**
- Status: Live Demo
- Purpose: Find where patient-flow time is being lost

#### Card 2
**Safety Risk Mode**
- Status: Future
- Purpose: Escalate delay patterns that may create patient safety risk

#### Card 3
**Workload Relief Mode**
- Status: Future
- Purpose: Reduce avoidable staff coordination burden

Keep this simple and polished.

---

## Cross-screen UI patterns

## A. Sticky top status bar
Include across product:
- Hospital: Chiang Rai Provincial Hospital Demo
- Snapshot time: Monday 10:30 AM
- Data type: Synthetic operational simulation
- Safety: Coordination support only

This reminds judges the scenario is coherent and safe.

## B. Reusable Insight Card
Use one consistent card style for AI-generated insights:
- title
- explanation
- confidence
- evidence chips
- uncertainty note
- safety note
- action buttons

## C. Evidence chips
Use small chips for:
- Pharmacy backlog
- Bed cleaning delay
- Family pickup blocked
- Transport delay
- High nurse workload

These make reasoning feel grounded and transparent.

## D. Confidence display
Do not overemphasize precision.
Use simple labels:
- High confidence
- Moderate confidence
- Limited confidence

You can still show numeric score in smaller text.

---

## Best page flow for judges
For a demo, structure the experience like this:
1. Landing
2. Overview
3. Agents
4. Root Cause
5. Time Loss Mode
6. Follow-Up Actions
7. Action Brief
8. Anomaly Radar
9. Impact

That order tells a clear story.

---

## Recommended homepage wireframe

```text
┌───────────────────────────────────────────────────────────────────────┐
│ CareFlow logo                     Synthetic Demo   Safe AI   10:30AM │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  CareFlow: The AI coordination layer for Post-AGI hospitals           │
│  Normal dashboards show that the queue is long. CareFlow explains why │
│                                                                       │
│  [Open Live Hospital Simulation]   [See How It Works]                 │
│                                                                       │
│                         mini visual of system flow                     │
│                                                                       │
├───────────────────────────────────────────────────────────────────────┤
│  Root cause, not just metrics   |  Multi-agent coordination |  Human  │
│  Keep patients moving safely    |  Department-level insight  |  review │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Recommended dashboard wireframe

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Top bar: Hospital / Scenario / Snapshot / Synthetic / Safety               │
├─────────────────────────────────────────────────────────────────────────────┤
│ KPI 1      KPI 2      KPI 3      KPI 4      KPI 5      KPI 6               │
├───────────────────────────────────────┬─────────────────────────────────────┤
│ Hospital Flow Summary                 │ Central AI Snapshot                 │
│ ED → Ward → Discharge visual          │ Visible problem                     │
│ congestion markers                    │ Naive explanation                   │
│ blocked points                        │ CareFlow insight                    │
│                                       │ Confidence / Safety                 │
├───────────────────────────┬───────────┴─────────────────────────────────────┤
│ Dept pressure ranking     │ Time loss breakdown  │ Operational anomaly       │
└───────────────────────────┴──────────────────────┴──────────────────────────┘
```

---

## UX recommendations for hackathon speed
To ship fast, focus on these UI priorities:

### Must-have
- polished overview dashboard
- strong root-cause screen
- clean agent cards
- strong time loss chart
- action brief page

### Nice-to-have
- animated transitions
- side drawers on agent click
- simulated timeline playback
- role assignment interactions

### Skip for MVP
- login flow
- complex filters
- dense tables
- mobile-first optimization
- real collaboration tools

---

## Typography recommendations
Use clean, modern typography with strong hierarchy:
- large headline for product framing
- medium section titles
- compact labels for operational metrics
- monospace or semi-mono style for IDs/timestamps only

Keep text highly scannable because judges have little time.

---

## Microcopy recommendations
Use short, intelligent, calm wording.

### Good wording
- `CareFlow insight`
- `Likely root cause`
- `Human review recommended`
- `Coordination support only`
- `Estimated time loss`
- `Operational pressure`
- `Affected patient flow`

### Avoid wording
- `AI command`
- `AI decision`
- `Approve discharge`
- `Execute fix`
- `Auto-resolve`
- `Predicted death risk`

---

## Final UI direction in one sentence
**Build CareFlow as an AI-native hospital mission-control product where the interface moves from pressure → explanation → action brief, with the central AI insight as the hero moment.**

