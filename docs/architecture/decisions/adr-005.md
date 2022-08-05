# ADR 5: Don't depend on third party code to produce results

## Context

External dependencies and packages often offer great functionalities that can be leveraged to quickly scale and develop large applications. However, dependencies are not exempt from bugs and fixing them is often out of our power. The bug needs to be fixed upstream, and might not be prioritized by the external team, … Moreover, dependencies require frequent updates that are often conflicting.

## Decision

We will not use external dependencies and packages for anything that is business critical, namely producing the outcome of accessibility audits.

We may use external dependencies for tooling ("`devDependencies`"), for integrations with other frameworks, and for post-manipulation of the outcome (e.g. serialization, …) since none of these are business critical.

The transparency produced by owning all relevant code is required by Alfa's [second goal](../../../README.md#goals).

## Status

Accepted.

## Consequences

By rejecting external dependencies, we need to re-implement (and maintain) ourselves many basic functionalities.

At the same time, we only need to maintain what is actually used in Alfa and can focus on this API. Moreover, we can ensure that these implementations follow the rest of the coding standard in Alfa and further ADRs. 
