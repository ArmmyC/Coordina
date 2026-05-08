# CareFlow Codex Implementation Prompt

Use this together with:
- CareFlow Current Summary
- UI Blueprint
- UI reference picture

This prompt tells Codex how to implement the CareFlow MVP web app.

---

## Context

You are building a polished web app MVP called **CareFlow**.

CareFlow is a **multi-agent AI hospital coordination layer** for Post-AGI hospitals. It is **not** a diagnosis app and **not** a generic dashboard. Its core purpose is to analyze department-level operational data, identify the **real cross-department root cause** behind bottlenecks, surface **deep operational insights**, and prepare **safe human-review follow-up actions**.

The app should follow the uploaded UI guideline image and CareFlow concept summary. The design should feel like a modern premium SaaS operations product: clear, calm, fast to scan, easy to understand, and not overloaded with data.

---

## Product goal

The main user experience should answer this in under 10 seconds:

**What is the real bottleneck in the hospital right now, why is it happening, and what should humans review next?**

The UI must prioritize:
1. central AI insight
2. root-cause explanation
3. suggested follow-up actions
4. supporting department evidence
5. anomaly notification and escalation
6. human-readable action brief

---

## UX confirmation

This is the intended structure:

### Main Section
The primary section of the dashboard should be the **Central AI Insight** area.
It should clearly show:
- main bottleneck
- concise summary
- cause chain
- suggested actions
- confidence
- safety note

This section must dominate the page visually.

### Department Section
Below the main section, show a **Department Overview** area with compact cards.
This section supports the main insight and should not overwhelm the user.
It should be easy to scan quickly in a real hospital operations context.

### Notification and Anomaly Layer
Anomaly detection should notify the user, but it should not be noisy.
Use:
- notification bell / panel for passive alerts
- top banner for important anomalies
- persistent escalation UI only for higher-severity events

### Action Brief
Users should be able to add recommended items into a human-readable operational brief.
This should feel like a real hospital coordination memo, not like an admin export.

---

## Important product requirement: deep insights

The app must not produce shallow insights like:
- beds are full
- discharge is slow
- ED is crowded

That is not enough.

CareFlow insight must explain:
- what visible problem staff are seeing
- why the obvious explanation is incomplete
- what hidden cross-department cause is actually creating the bottleneck
- what action path has highest leverage
- what uncertainty still exists

### Required insight structure
Every insight should follow this structure:
- **Visible problem**
- **Naive explanation**
- **CareFlow insight**
- **Why the naive explanation is incomplete**
- **Departments involved**
- **Supporting evidence**
- **Highest leverage actions**
- **Confidence**
- **Uncertainty**
- **Safety note**

### Example of a good deep insight

**Visible problem:** ED queue is long  
**Naive explanation:** Too many new patients arrived  
**CareFlow insight:** The main bottleneck is ED output blockage caused by delayed ward turnover, driven by discharge medication backlog, bed cleaning delays, family pickup friction, and limited transport capacity.  
**Why naive explanation is incomplete:** New arrivals are only slightly above baseline; most lost time is downstream after admission decision.  
**Departments involved:** ED, Beds, Pharmacy, Discharge, Transport  
**Highest leverage actions:** review discharge meds queue, prioritize cleaning of assigned medicine beds, confirm family pickup for discharge-ready patients  
**Confidence:** High  
**Uncertainty:** Some bed assignment timestamps may lag by 10–15 minutes  
**Safety note:** No clinical discharge or triage decisions are made by CareFlow

Build the app so the AI insight always feels like this level of depth.

---

## Main app structure

Create a desktop-first React web app with the following sections:

### 1. Header
Include:
- CareFlow logo / wordmark
- hospital selector
- snapshot time
- synthetic data badge
- coordination support only badge
- notification bell
- user avatar

Example labels:
- Chiang Rai Provincial Hospital Demo
- Mon 10:30 AM
- Synthetic Data
- Coordination Support Only

---

### 2. KPI row
Show 4 compact KPI cards:
- ED Occupancy
- Ward Occupancy
- Discharge Blockers
- Estimated Time Loss

Each KPI card should have:
- label
- large value
- status pill
- micro trend
- one supporting line

These should be visually clean and secondary to the main AI section.

---

### 3. Central AI Insight section
This is the most important section on the page.

Include:
- title: Central AI Insight
- main bottleneck headline
- concise summary
- suggested actions
- cause chain visual
- confidence indicator
- safety note
- action buttons

#### Required subsections

**Main Bottleneck**  
Large, bold summary such as:  
"ED output blockage from discharge and bed-turnover delays"

**Summary**  
2–3 short, readable sentences.

**Suggested Actions**  
3 ranked action cards, concise and actionable.

**Cause Chain**  
Example:  
Long ED queue → Ward beds unavailable → Delayed discharge → Pharmacy / cleaning / pickup / transport

**Buttons**
- View Full Analysis
- Add to Action Brief
- Mark Reviewed

Do not use buttons like:
- Approve
- Execute
- Discharge
- Override

---

### 4. Department Overview section
Below the main insight, show compact department cards.

Include these departments:
- ED
- Beds
- Pharmacy
- Discharge
- Transport
- Radiology

Each card should include:
- department name
- status pill
- affected patients
- estimated time lost
- one-line summary

Keep these cards concise. They are supporting evidence, not the main story.

Clicking a department card should open a side panel or modal with:
- local metrics
- local summary
- evidence
- whether this department is a primary cause, secondary cause, or not a major bottleneck

---

### 5. Full Root Cause Analysis view
Create a deeper analysis page or modal.

It should show:
- visible symptom
- naive explanation
- actual root cause
- evidence grouped by department
- bottleneck chain
- leverage analysis
- uncertainty
- safety boundary

This screen should feel like an AI operations reasoning interface, not a chatbot.

---

### 6. Suggested Follow-Up Actions section
Show ranked action cards with:
- action title
- owner role
- affected department
- estimated time saved
- affected patients
- confidence
- evidence tags
- safety note

Actions should be non-clinical and realistic.

Examples:
- Review discharge medication queue
- Prioritize cleaning of assigned medicine beds
- Confirm family pickup for discharge-ready patients
- Review porter availability for delayed transfers

---

### 7. Action Brief section
Create a human-readable operational brief.

Example format:
- title: 11:00 Hospital Flow Brief
- main issue
- root cause
- departments involved
- suggested follow-up
- watchouts
- safety note

Allow:
- copy brief
- export brief
- save snapshot

This should look like an executive operational memo, not a raw dashboard card.

---

### 8. Anomaly Detection / Notification UX
Implement anomaly detection as a **notification and escalation system**, not a random warning widget.

#### Required behavior
Use 3 levels:

**Level 1: Passive**
- anomaly appears in notification center / event feed
- small badge on bell icon
- no modal popup

**Level 2: Important**
- show top banner in app
- add to anomaly panel
- create recommended review card

**Level 3: Escalation**
- persistent banner
- highlighted anomaly card
- suggested reviewer role
- option to add to action brief

#### Important wording
Use phrases like:
- unusual operational pattern
- escalation recommended
- above baseline
- review suggested
- anomaly score

Do not use phrases like:
- pandemic detected
- outbreak confirmed
- disease identified
- diagnosis inferred

#### Example anomaly
"Respiratory-related ED arrivals are 38% above weekday baseline and porter delays are rising. Recommend review by ED lead and operations supervisor."

#### Notification Center
Build a notification panel accessible from the bell icon.
Notification items can include:
- anomaly alerts
- bottleneck changes
- improvement updates
- brief-ready suggestions

Each notification should have:
- title
- timestamp
- severity
- short explanation
- action button

Example actions:
- Review insight
- Open anomaly
- Add to brief
- Mark reviewed

Do not make the app noisy with repeated popups.

---

## Important product requirement: deep insights engine

The app should simulate an AI reasoning layer that generates non-obvious insights from department data.

### The logic should combine signals across departments

Bad shallow output:
- Beds are nearly full
- Pharmacy backlog is high

Good deep output:
- Ward occupancy alone is not the main issue. The larger constraint is delayed bed turnover: 4 beds are assigned but unavailable because discharge medications and cleaning are unfinished. This is prolonging ED boarding more than new arrivals.

Another good example:
- Radiology wait time is rising, but only 3 patients are materially affected. Pharmacy and discharge delays are causing more total flow loss hospital-wide, so radiology is not the primary bottleneck right now.

Another:
- Transport is not the largest delay by total minutes, but it is the final blocker for several discharge-ready patients, making it a high-leverage coordination target.

Implement this as structured mock AI logic using synthetic data. It does not need real LLM calls for now, but structure the code so it could later be replaced by OpenAI API responses.

---

## Tech stack

Use:
- React
- TypeScript
- Tailwind CSS
- shadcn/ui or similar clean component system
- lucide-react icons
- Recharts for charts if needed

Prefer a single-page polished demo app with modular components.

---

## Design system requirements

The interface should feel:
- premium
- modern
- readable
- calm under pressure
- quick to scan
- not overloaded

### Visual style
- light background
- white / soft slate cards
- teal/cyan accent for AI intelligence
- amber / red only for warnings
- rounded corners
- soft shadows
- generous spacing

### Typography
- clear hierarchy
- large numbers for KPIs
- strong headline in central insight
- short readable summaries
- minimal dense text

---

## App state / demo scenario

Use a realistic synthetic Thai hospital demo scenario.

Example:
- hospital: Chiang Rai Provincial Hospital Demo
- time: Monday 10:30 AM
- ED occupancy: 46 / 32
- ward occupancy: 96%
- discharge blockers: 9
- pharmacy backlog: high
- bed cleaning delay: medium
- transport delay: high
- radiology delay: moderate
- lab delay: normal

The main AI conclusion in the default scenario should be:

"The long ED queue is not mainly caused by new arrivals. The main cause is output blockage from discharge and bed-turnover delays."

---

## Required components

Implement reusable components for:
- HeaderBar
- StatusBadge
- KpiCard
- CentralInsightCard
- CauseChain
- SuggestedActionCard
- DepartmentCard
- DepartmentDrawer
- NotificationBell
- NotificationPanel
- AnomalyBanner
- RootCauseDetailView
- ActionBriefCard
- ConfidenceBadge
- EvidenceChip

---

## Required pages or views

At minimum implement:
1. Main Dashboard
2. Root Cause Detail View
3. Action Brief View
4. Notification / Anomaly Panel

Optional if time:
5. Department detail drawer
6. Future Modes page

---

## Interaction details

### Main dashboard behavior
- user lands on dashboard
- main AI insight is visible immediately
- department cards are visible below
- anomalies show via notification bell and optional top banner
- actions can be added to action brief

### Notification behavior
- clicking bell opens panel
- user can open anomaly, review insight, or add item to brief
- reviewed notifications can be muted or marked resolved

### Action brief behavior
- user can collect recommended actions
- brief updates in real time
- brief remains clearly non-clinical

---

## Safety boundaries

These must be visible in the product and code comments.

CareFlow can:
- summarize operational bottlenecks
- explain root causes
- identify time loss
- flag unusual patterns
- suggest non-clinical follow-up
- prepare action briefs

CareFlow cannot:
- diagnose
- prescribe
- decide admission
- decide discharge
- override triage
- make clinical predictions
- claim outbreaks or pandemics

Include microcopy like:
- Coordination support only
- Human review required
- No clinical decisions made by CareFlow
- Clinical safety overrides flow improvement

---

## Deliverables

Build a polished demo-ready UI with:
- realistic synthetic data
- strong visual hierarchy
- central AI insight as hero
- department evidence section
- anomaly notification system
- action brief workflow
- modular, readable React code

Also do the following:
1. Create clean demo data in TypeScript objects
2. Implement a mock insight-generation utility that turns department data into deep insights
3. Use clear component structure and folder organization
4. Make the interface feel close to the uploaded UI guideline image
5. Optimize for hackathon demo quality, not production backend complexity

---

## Coding guidance

Before coding:
- propose the component tree
- propose the data model
- propose the main layout
- then implement

When implementing:
- prioritize polish and clarity over feature count
- avoid overly dense charts
- avoid tables unless necessary
- keep the main dashboard elegant and easy to scan
- keep everything buildable and realistic

Return complete React / TypeScript / Tailwind code for the MVP UI.

---

## Final product feel

The finished product should feel like this:

A hospital operations lead opens CareFlow and instantly sees:
- what the real bottleneck is
- why it is happening
- which departments are involved
- what follow-up actions have the highest leverage
- whether any unusual operational patterns need escalation

The product should feel smarter than a dashboard because it explains hidden coordination failure, not just surface metrics.

---

## Final reminder for Codex

Do not build CareFlow as a normal BI dashboard.
Do not build it as a hospital chatbot.
Do not build it as a clinical AI tool.

Build it as an **AI-native hospital mission control product** where the screen flows from:

**pressure → explanation → action brief**

The core hero moment is the central AI insight explaining the true root cause behind the visible hospital bottleneck.
