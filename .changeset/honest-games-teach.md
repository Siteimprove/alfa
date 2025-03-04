---
"@siteimprove/alfa-flags": minor
---

**Added:** A `Flags.named` class factory is now available for flags sets where flags can be accessed by name.

For example:

```
const MyFlags = Flags.named("a", "b", "c"); // create a new class for three flags named "a", "b", and "c".
const flags = MyFlags.of("a"); // create a flags set where only "a" is set.

MyFlags.b; // Value of the second flag, i.e. 2^1 = 2, mostly used internally.
flags.c; // Is the third flag set? (here false).

flags.has("a");
flags.has(MyFlags.b);
```
