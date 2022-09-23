# ADR 13: Use trilean logic for reasoning about possibly unknown results 

## Context

ACT rules can be _composite_, that is their outcome depends solely on the evaluation of other rules through some first order propositional logic (i.e. not inspecting the page further).

When combined with semi-automated tests, there can be cases where the outcomes of the components are not known yet, but the composite rule still needs to provide a result.

A strict reading of the ACT rules formula "at least one of the following rule passes" may lead to the conclusion that the composite rule fails if its components are either failing or `cantTell`. However, this effectively leads to false positives where we flag a problem just because we didn't get all needed answers.

## Decision

We will use trilean values (`true`/`false`/`undefined`) to model possibly unknown booleans and propositional formulas over them.

Given our use cases, trilean will be combined according to Kleene's [strong logic of indeterminacy](https://en.wikipedia.org/wiki/Three-valued_logic#Kleene_and_Priest_logics) (also known as Priest's "logic of paradox").

## Status

Accepted.

## Consequences

Outcomes of semi-automated composite rules can be computed in a way closer to intuition, i.e. returning `cantTell` when some information is missing to evaluate the components.
