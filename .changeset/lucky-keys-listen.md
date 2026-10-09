---
"@siteimprove/alfa-rules": minor
---

**Added:** A new experimental rule SIA-R122 is available. It checks that the access keys an element declares are usable.

It makes three checks. No other element may declare the same key, since two elements competing for one key means at most one of them can be reached and which one wins is left to the user agent. Each key must be a single character, since anything longer is not a key a user can press. And an element may not declare the same key twice.

Case is folded throughout, so `A` and `a` are the same key. Two elements declaring them compete, and `accesskey="a A"` on one element declares that key twice and is reported for the repeat. That is stricter than the W3C checker, which compares the tokens of a single value literally and accepts it.

The attribute holds a set of space-separated tokens, so `accesskey="a b"` declares two keys and each is checked separately.
