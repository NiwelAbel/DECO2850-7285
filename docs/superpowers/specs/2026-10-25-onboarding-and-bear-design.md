# Baobei Onboarding and Live Bear Design

## Intent

Help first-time parent users understand how the app, teddy bear and child work together, while making the home screen visibly respond to the bear's current state.

## Design

- Show a four-step onboarding after the first successful login or signup: connection, voice messages, light responses, and privacy.
- Include Back, Next, Skip and Get Started controls, a progress indicator, and save completion in `localStorage`.
- Add a Replay Tutorial action under Profile > Help & Support.
- Replace the emoji-only Bear component with an accessible SVG/CSS bear supporting calm, happy, message, glowing, disconnected and listening states.
- Keep bear status in `App` so Home and Live Activity present the same state.
- Avoid presenting the bear's expression as a reliable reading of the child's emotions. Labels describe device activity instead.

## Constraints

- Keep the existing React/Vite structure and visual style.
- Add no runtime dependencies.
- Treat hardware communication as a future integration point; this version simulates state locally.
- Preserve existing login, messages, profile and Live Activity flows.

## Approaches considered

1. Static image assets: quick, but hard to animate and maintain across states.
2. SVG/CSS stateful component: selected because it is scalable, lightweight and maps cleanly to future hardware events.
3. Canvas animation: more expressive, but unnecessarily complex for this prototype.

