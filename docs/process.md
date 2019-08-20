# Development process

This document outlines the development process that the Alfa development team follows. The purpose of this document is two-fold: As a reference to both ourselves and new developers brought onboard the development team and as a guidance to contributors in order to be transparent about how and when we deal with reported issues and opened pull requests.

In general, our development process draws heavily on [Kanban](https://www.atlassian.com/agile/kanban) with additional aspects borrowed from [Scrum](https://www.atlassian.com/agile/scrum) and is designed to allow us a high degree of flexibility in our daily work. As we interface with a lot of different stakeholders, from standardisation groups to external contributors and other Siteimprove development teams, we require a lean development process that still allows for a certain level of predictability with regards to deliverables to these stakeholders.

## Artefacts

The two artefacts we concern ourselves with in the development process are work items and our project board.

### Work items

A work item is a unit of work to be performed by a developer and consists of either a [GitHub issue](https://help.github.com/articles/about-issues/), a [GitHub pull request](https://help.github.com/articles/about-pull-requests/), or a combination of the two in the event that a pull request relates to an issue.

### Project board

As is customary from Kanban, a board is used for visualising and keeping track of the progress of work items. For this, we make use of a [GitHub project board](https://help.github.com/articles/about-project-boards/) separated into the following four stages:

- **To do**

  Newly opened issues, and already closed issues that have been reopened, automatically end up in the to do stage. This stage forms the backlog of work items to be worked on by the development team.

- **Ready**

  When a given work item has been sufficiently clarified as part of [refinement](#refinement), it is moved to the ready stage. Decisions pertaining to the "how" of a work item, be it design, architecture, or otherwise, must be answered before the item is moved to this stage. When in this stage, a work item is ready to be worked on by a developer.

- **In progress**

  When a developer starts working on a work item, or opens a pull request related to one, the item is moved to the in progress stage either automatically in the case of a pull request or manually on the case of an issue. The number of work items in this stage should be kept to a minimum; whenever possible, existing work should be finished before new work is started.

  Before pull requests can leave this stage, they must be reviewed by the associated [code owner(s)](https://help.github.com/articles/about-codeowners/) before being merged. Reviews are kept light and focus on sanity checking the code in question.

- **Done**

  When a work item is completed, either by closing an issue or merging a pull request, it is moved to the done stage.

## Activities

At the heart of our development process are four different activities that we perform at varying frequencies. With the exception of check-ins, activities are performed ad hoc with the requirement that they must be performed at least as often as indicated by the given activity. As such, refinement does not need to happen on the same day at the same hour every week, but is to be performed at least once during any given week.

### Check-in

Check-ins are performed daily and, if possible, should be held at the same time and location every day. Check-ins are similar in format to a typical stand-up, but without an emphasis on any specific pose; as we are a partly distributed team, people are welcome to call in and participate in the check-in from the comfort of their couch. The primary purpose of the check-in is to identify potentially blocked work items and bottlenecks and to discuss how to get items moving across the board.

### Refinement

Refinements are performed at least once a week. The purpose of the refinement is to look through work items in the backlog and clarify and assign labels to these. It is not a requirement that every new work item be looked at at each refinement session; it is sufficient to refine enough items needed to keep developers occupied until the next refinement session.

### Review

Reviews are performed at least once every two weeks. The purpose of the review is to present to internal stakeholders what has been worked on since the last review session. The specific stakeholders that might have an interest in attending a review will differ from review to review, but at the very least key stakeholders, in addition to the development team, should be present.

### Retrospective

Retrospectives are performed as needed. The purpose of the retrospective is to evaluate the development process and make adjustments as necessary. The outcome of the retrospective, in the event that changes to the development process are made, is a pull request updating this document and detailing the reasons for the change in the description of the pull request.
