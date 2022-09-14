import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { DOM, Node as ariaNode } from "@siteimprove/alfa-aria";
import { Document, Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { Scope } from "../tags";

const { hasHeadingLevel, hasRole, isIncludedInTheAccessibilityTree } = DOM;
const { isDocumentElement, isElement } = Element;
const { equals } = Predicate;
const { and } = Refinement;

export default Rule.Atomic.of<Page, Document>({
  uri: "https://alfa.siteimprove.com/rules/sia-r61",
  tags: [Scope.Page],
  evaluate({ device, document }) {
    const firstHeading = document
      .descendants(Node.flatTree)
      .filter(and(isElement, isIncludedInTheAccessibilityTree(device)))
      .find(hasRole(device, "heading"));

    return {
      applicability() {
        return Node.hasChild(isDocumentElement)(document) &&
          firstHeading.isSome()
          ? [document]
          : [];
      },

      expectations(target) {
        // The heading is guaranteed to exist because of the test in Applicability
        const heading = firstHeading.get();

        const level = ariaNode
          .from(firstHeading.get(), device)
          .attribute("aria-level")
          .map((level) => Number(level.value))
          // The level is guaranteed to exist because heading has a role of heading.
          .get();

        return {
          1: expectation(
            level === 1,
            () => Outcomes.StartWithLevel1Heading(heading, level),
            () => Outcomes.StartWithHigherLevelHeading(heading, level)
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const StartWithLevel1Heading = (heading: Element, level: number) =>
    Ok.of(
      WithFirstHeading.of(
        `The document starts with a level 1 heading`,
        heading,
        level
      )
    );

  export const StartWithHigherLevelHeading = (
    heading: Element,
    level: number
  ) =>
    Err.of(
      WithFirstHeading.of(
        `The document does not start with a level 1 heading`,
        heading,
        level
      )
    );
}

/**
 * @internal
 */
export class WithFirstHeading extends Diagnostic {
  public static of(message: string): Diagnostic;

  public static of(
    message: string,
    firstHeading: Element,
    level: number
  ): WithFirstHeading;

  public static of(
    message: string,
    firstHeading?: Element,
    level?: number
  ): Diagnostic {
    return firstHeading === undefined || level === undefined
      ? Diagnostic.of(message)
      : new WithFirstHeading(message, firstHeading, level);
  }

  private _firstHeading: Element;
  private _level: number;

  private constructor(message: string, firstHeading: Element, level: number) {
    super(message);
    this._firstHeading = firstHeading;
    this._level = level;
  }

  public get firstHeading(): Element {
    return this._firstHeading;
  }

  public get firstHeadingLevel(): number {
    return this._level;
  }

  public equals(value: WithFirstHeading): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof WithFirstHeading &&
      value._message === this._message &&
      value._firstHeading.equals(this._firstHeading) &&
      value._level === this._level
    );
  }

  public toJSON(): WithFirstHeading.JSON {
    return {
      ...super.toJSON(),
      firstHeading: this._firstHeading.toJSON(),
      firstHeadingLevel: this._level,
    };
  }
}

/**
 * @internal
 */
export namespace WithFirstHeading {
  export interface JSON extends Diagnostic.JSON {
    firstHeading: Element.JSON;
    firstHeadingLevel: number;
  }

  export function isWithFirstHeading(
    value: Diagnostic
  ): value is WithFirstHeading;

  export function isWithFirstHeading(value: unknown): value is WithFirstHeading;

  export function isWithFirstHeading(
    value: unknown
  ): value is WithFirstHeading {
    return value instanceof WithFirstHeading;
  }
}
