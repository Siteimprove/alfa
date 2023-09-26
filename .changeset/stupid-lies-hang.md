---
"@siteimprove/alfa-cascade": patch
---

**Changed:** `<button>`'s `background-color` now defaults to `buttonface`.

`<button>` elements default `background-color` is somewhat different between user-agents. Rather than picking one, we use the system `buttonface` color instead. This notably opens way to handle it with a branched value, possibly also detecting whether we are in forced colors mode.
