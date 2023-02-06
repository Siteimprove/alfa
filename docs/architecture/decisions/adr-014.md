# ADR 14: Implement our own command line wrapper package 

## Context

We want to have a command line interface for Alfa, with the possibility to have flags (optional arguments) and positional arguments. There exist many packages to model that in JavaScript. Since this is not used to produce the result, using one of them does not conflict with [ADR 5](./adr-005.md). However, we've usually seen one or more of the following problems: 

* slow startup, up to a few seconds;
* poor typing of the arguments; 
* risk of collision between flags accepting lists and positional arguments (requiring a counter-intuitive "end of arguments" argument (`--`) );
* strong link between the CLI argument's name and its internal representation (e.g., record key).

## Decision

We will implement our own package for modelling command line interface.

## Status

Accepted.

## Consequences

We will need to maintain the new package. On the other hand, we can also adapt it to other syntax if the need arises.

For more details about this decision, check [the corresponding Pull Request](https://github.com/Siteimprove/alfa/pull/265).
