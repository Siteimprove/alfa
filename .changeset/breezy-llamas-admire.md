---
"@siteimprove/alfa-rules": minor
---

**Changed:** SIA-R83 now has improved detection of containers large enough to not clip content.

When the potential clipping ancestor is at least twice as big (in the correct axis) as the potentially clipped content, Alfa now assumes that the content won't be clipped at 200%. This can only happen when layout boxes are provided for the audit.
