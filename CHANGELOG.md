# Changelog

## 1.0.2 — 2026-11-26

- **Fixed on Windows:** LUNA on Windows sizes the page to the window's outer size, title bar and frame included, so the bottom 39 px and the right 16 px were hidden. The page now leaves that space out on Windows, so everything at the bottom and right edges shows in full.
  the part you can see, so the controls at the bottom were hidden. The page now fits itself to
  the window size LUNA reports; nothing changes where the two match.
- **Report copy:** Alt-click on the version now always says in the status bar that the report was copied. Where the system clipboard is blocked (seen on some Windows set-ups) it uses a fallback, and if that fails too it shows the report selected so you can copy it by hand.

## 1.0.1 — 2026-11-25

- A short getting-started guide: the first time it opens it asks for your language, then walks
  you through the window in it. The **Guide** button brings it back.
- Catalan, French, German, Italian and Portuguese showed some old labels ("Més jo", "Plus de
  moi", "Von den Fadern"…) instead of Volume and From the mix; fixed.

## 1.0.0 — 2026-11-25

- First release: four headphone mixes on LUNA's cue sends, one column per cue with its own name
  and colour (yellow, red, green and blue by default).
- From the mix (per cue or in all 4, through sub-mix buses, click never muted), group faders
  with mute that open to each channel's own fader, or every channel on its own fader (per cue), Volume (−24 to +12 dB) for the musician's own
  channels, Copy and Paste between cues.
- Sub-mix buses stay silent in the cues, so no channel is heard twice.
- Session groups: Click always, the rest yours, set from coloured chips with filters by kind,
  rename, add, delete and Suggest from names.
- Pre- or post-fader sends; meter and level per cue bus.
- Everything is saved in the session itself.
- Dark and grey themes, seven colours, 7 languages, Alt-click the version for a support report.
