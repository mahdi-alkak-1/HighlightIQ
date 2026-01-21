# HighlightIQ Frontend Notes

## Dashboard Snow Overlay

Snow overlay is mounted only inside the dashboard layout.

Toggle:
- Use the "Snow effect" switch in the Dashboard top bar.
- Preference is stored in localStorage (`highlightiq_dashboard_effects`).

Intensity:
- Presets are defined in `src/components/effects/snowOptions.ts`.
- Auto-forces low intensity on screens narrower than 768px.

Accessibility:
- When `prefers-reduced-motion` is enabled, the overlay stays off even if the toggle is on.
