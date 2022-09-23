# ADR 12: Use side effect free (monadic) questions

## Context

When performing semi-automated audits, input from users (answers to question) needs to be provided to complete the audit. 

An obvious way to do it is through side effects by storing the answer in a new variable (this does not goes against [ADR 6](./adr-006.md) because the side effect is local to the rule asking the question and does not leak to callers).

However, in many cases, questions come one by one and the next question is unknown before looking at the answer, or might be ultimately useless. For example, we currently only test non-streaming videos, so there is no need to ask whether a streaming video has audio. In such a case, we can either pre-ask all possible questions, at the cost of adding useless work to the end-user's workload; or mix up the side effects with tests on the result to ask only the needed questions, at the cost of increasing the entanglement and complexity of the code.

Another possibility to handle the questions is to delegate the side effect to the interview mechanism. Questions are returned as values (rather than functions that must produce a value (the answer) before evaluation can continue). The audit only asks the question when it actually tries to unpack and use it (rather than when it is declared). This is the classical monadic approach of functional languages handling side effects.

## Decision

We will use questions-as-values, with a monadic handling of the answers. A `Question` object holds both the question itself (expecting a certain type of answer); and a `quester` mapper, transforming the answer to whatever is needed for the audit. The monadic `map` on question adds transformations to the `quester`.

## Status

Accepted.

## Consequences

Using questions-as-value opens way for better separation of concerns in the code. It is possible to declare all questions upfront, and then group the logic for how they interact (transforming them through their monadic structure). Only the questions that are effectively returned (not just declared) are asked to the end user.

The monadic structure can be harder to grasp for new developers. The syntax for handling questions can be unsettling at first, increasing the entry cost into the code base.   

See more discussion about this choice in "[The great refactoring](https://github.com/Siteimprove/alfa/pull/165)" pull request.
