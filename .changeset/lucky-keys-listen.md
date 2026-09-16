---
"@siteimprove/alfa-rules": minor
---

**Added:** The new rule R120 checks that no element declares an access key that another element also declares.

Two elements competing for one key means at most one of them can be reached by it, and which one wins is left to the user agent. The diagnostic names the keys that are contested, so an element declaring several is told which of them clash.

The attribute holds a set of space-separated tokens, so `accesskey="a b"` declares two keys and is reported if either is shared. Tokens are compared without regard to case, so `A` and `a` are the same key. Elements that are not rendered are left out, since their access keys cannot be activated.
