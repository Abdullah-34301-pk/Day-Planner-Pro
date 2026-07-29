# Day Planner — Feature Gap List

Consolidated list of features found in competitor tools (Todoist, Things 3, TickTick, Notion-style planners, Forest/Focus To-Do, Habitica, Google Tasks/Apple Reminders) that this planner currently doesn't have.

---

## 📊 Dashboard

- [ ] **Progress dashboard** — a dedicated view (or an expanded Insights tab) showing the user's overall progress at a glance, not just individual stats scattered across the header and focus row. Should pull together:
  - **Completion rate** — percentage of tasks done this week/month, not just today.
  - **Trend over time** — a line or bar chart of tasks completed per day/week (extends the existing weekly-bars into a real history rather than a single snapshot).
  - **Streak history** — current streak plus longest streak ever, not just the live number.
  - **Category breakdown** — which categories (Work/Study/Health/etc.) get the most completions vs. which are neglected.
  - **Focus time logged** — total Pomodoro/focus minutes this week, once the timer is linked to sessions.
  - **Goal vs. actual** — if a daily/weekly task-count goal is set, show progress toward it (e.g. a ring or bar: "6 of 8 tasks this week").
  - This is the natural home for the XP/leveling and badge/milestone ideas below — a single screen that answers "how am I doing overall," rather than just "what's next."

## ✍️ Task creation & structure

- [ ] Natural-language date parsing ("tomorrow 3pm", "every Monday")
- [ ] Recurring tasks (daily/weekly/custom repeat rules)
- [ ] Multiple priority levels (not just urgent/not-urgent)
- [ ] Sub-projects or nested categories, not just a flat dropdown
- [ ] Subtasks/checklists inside a task
- [ ] Custom fields per task (beyond the fixed title/date/category/urgent/tags/notes)
- [ ] Task dependencies ("can't start B until A is done")

## ✏️ Editing & triage

- [ ] Inline task editing (currently only toggle done/urgent/delete — no edit-in-place)
- [ ] "Today / Upcoming / Anytime / Someday" style triage buckets, not just date sort
- [ ] Quick-entry global keyboard shortcut for capture from anywhere

## 📅 Calendar

- [ ] Multi-month navigation (prev/next) — currently locked to the current month
- [ ] Multiple saved views of the same data (e.g. kanban board, not just table/calendar)

## ⏱️ Timer & focus

- [ ] Timer linked to a specific task, with a session history log
- [ ] Break-cycle logic (25 work / 5 short break / 15 long break every 4 cycles) — currently just a flat 25-minute countdown
- [ ] Visual/gamified feedback during a focus session (not just numbers counting down)

## 🏆 Gamification & motivation

- [ ] XP/leveling system tied to completing tasks, not just a day-streak
- [ ] Difficulty-weighted tasks (harder tasks earn more points)
- [ ] Self-defined rewards you can "spend" points on
- [ ] Habit tracking separate from one-off tasks (recurring check-ins like water intake, reading, etc.)

## 🔔 Notifications & sync

- [ ] Native OS notifications/reminders at a specific time — nothing currently alerts you when something's due
- [ ] Cross-device sync/cloud backup — data currently lives only in one browser's localStorage, with manual JSON export as the only backup path
- [ ] Location-based reminders

---

*Next step: pick a subset from above and I'll build it into the existing planner files.*
