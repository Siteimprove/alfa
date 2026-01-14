---
"@siteimprove/alfa-css": minor
---

**Breaking:** CSS color representation now internally uses the `colorjs.io` library.

This implies many changes of the API:
* The old `RGB`, `Named`, `Hex`, … classes no longer exist. Everything is bundled into a `CC4Color` class. The `#red`, `#green`, `#blue`, `#alpha` still exist, returning the components in the sRGB color space.
* The constructors `Color.hsl`, `Color.hex`, … have similarly been removed.
* The `Color.rgb` constructor has been kept as it is used in many places.
* A new `Color.of` constructor is available, taking the CSS color string as input. It returns a `Result` since parsing the string may fall.
* The `CSS4Color.of` constructor also accepts the color space id (in `colorjs.io`) and components to directly create the color. This also returns a `Result` in case the color space id doesn't exist.
* The serializations have changed accordingly.

Colors creations (in other format than sRGB) can somewhat simply be adapted, e.g. the old `HSL.of(Angle.of(120, "deg"), Percentage.of(0.5), Number.of(40))` (or similar `Color.hsl`) can now be written as `Color.of("hsl(120deg 50% 40)").getUnsafe()` or `CSS4Color.of("hsl", [120, 50, 40]).getUnsafe()`. Note that the range of components depends on the format. Note that the `Result` must be unwrapped, `.getUnsafe` is only reliable when the format (or full input) is hard-coded as a static string.
