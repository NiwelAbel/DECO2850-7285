# Baobei Onboarding and Live Bear Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add first-use parent guidance and a shared animated 2D bear that reflects app activity.

**Architecture:** Pure state helpers define onboarding persistence and bear-state labels. `App` owns shared state and passes it to Home, Live and Profile; focused components render the onboarding and SVG bear.

**Tech Stack:** React 18, Vite 6, SVG, CSS, Node built-in test runner.

**Spec:** `docs/superpowers/specs/2026-10-25-onboarding-and-bear-design.md`

## Global Constraints

- Add no new dependencies.
- Do not claim simulated events are live hardware data.
- Preserve existing navigation and message functionality.

## Review Focus

- Returning users must not be forced through onboarding again.
- Skip and Get Started must both persist completion.
- Replay Tutorial must work without clearing account data.
- Unknown bear states must fall back to calm.
- SVG and animation must remain readable at Home and Live sizes.

---

### Task 1: State helpers and 2D bear

**Files:**
- Create: `Baobei App/src/lib/experience.js`
- Create: `Baobei App/src/lib/experience.test.js`
- Modify: `Baobei App/src/components/Bear.jsx`
- Modify: `Baobei App/src/styles.css`

**Interfaces:**
- Produces: `getBearPresentation(state)` and onboarding storage helpers.
- Produces: `<Bear state size showStatus />`.

- [ ] Write failing tests for valid and unknown bear states and onboarding storage behavior.
- [ ] Run `node --test src/lib/experience.test.js` and confirm expected failures.
- [ ] Implement the helpers and SVG bear.
- [ ] Run the tests and confirm they pass.

### Task 2: Onboarding flow and shared app state

**Files:**
- Create: `Baobei App/src/components/Onboarding.jsx`
- Modify: `Baobei App/src/App.jsx`
- Modify: `Baobei App/src/pages/Home.jsx`
- Modify: `Baobei App/src/pages/Live.jsx`
- Modify: `Baobei App/src/pages/Profile.jsx`
- Modify: `Baobei App/src/styles.css`

**Interfaces:**
- Consumes: Task 1 bear and persistence helpers.
- Produces: first-run onboarding, replay entry, and shared bear reactions.

- [ ] Add onboarding component and state wiring.
- [ ] Update Home and Live to display and change shared state.
- [ ] Add Replay Tutorial under Help & Support.
- [ ] Run state tests and `npm run build`.

