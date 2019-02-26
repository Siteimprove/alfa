# Architecture Documentation

## Architecture Decision Reports (ADR)

> For a more thorough introduction to ADRs, see [Documenting architecture decisions] by Michael Nygard which most of the section below is taken from.

An architecture decision report lives in the [`docs/architecture/decisions`](decisions) directory, is written in Markdown, and has a file name of `adr-nnn.md` where `nnn` is a monotonically increasing number. The report must include the following sections, with the heading level of each section noted in superscript:

- **Title** <sup>#</sup>  
  Architecture decision reports have names that are short noun phrases. For example, "ADR 1: Deployment on Ruby on Rails 3.0.10" or "ADR 9: LDAP for Multitenant Integration"

- **Context** <sup>##</sup>  
  This section describes the forces at play, including technological, political, social, and project local. These forces are probably in tension, and should be called out as such. The language in this section is value-neutral. It is simply describing facts.

- **Decision** <sup>##</sup>  
  This section describes our response to these forces. It is stated in full sentences, with active voice. "We will ..."

- **Status** <sup>##</sup>  
  A decision may be "proposed" if the project stakeholders haven't agreed with it yet, or "accepted" once it is agreed. If a later ADR changes or reverses a decision, it may be marked as "deprecated" or "superseded" with a reference to its replacement.

- **Consequences** <sup>##</sup>  
  This section describes the resulting context, after applying the decision. All consequences should be listed here, not just the "positive" ones. A particular decision may have positive, negative, and neutral consequences, but all of them affect the team and project in the future.

[documenting architecture decisions]: http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions "Documenting architecture decisions by Michael Nygard"
