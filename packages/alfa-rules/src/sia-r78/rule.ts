import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM, Node as ariaNode } from "@siteimprove/alfa-aria";
import { Element, Namespace, Node, Text } from "@siteimprove/alfa-dom";
import { Hash } from "@siteimprove/alfa-hash";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Page } from "@siteimprove/alfa-web";
import { expectation } from "../common/act/expectation";

import { Scope } from "../tags";
import isText = Text.isText;

const { hasHeadingLevel, hasRole, isIncludedInTheAccessibilityTree } = DOM;
const { hasNamespace, isContent, isElement } = Element;
const { not, tee } = Predicate;
const { and } = Refinement;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r78",
  tags: [Scope.Component],
  evaluate({ device, document }) {
    let headings: Sequence<Element>;

    return {
      applicability() {
        headings = document.descendants(Node.fullTree).filter(
          and(
            isElement,
            and(
              hasNamespace(Namespace.HTML),
              isIncludedInTheAccessibilityTree(device),
              hasRole(device, "heading"),
              // Headings containing a button is the ARIA pattern for accordions.
              // Headings containing a link is frequently misused instead.
              // Headings containing a link is also used for, e.g., list of news.
              not((heading) =>
                heading
                  .elementDescendants()
                  .some(hasRole(device, "button", "link"))
              )
            )
          )
        );

        return headings;
      },

      expectations(target) {
        const currentLevel = ariaNode
          .from(target, device)
          .attribute("aria-level")
          .map((level) => Number(level.value))
          .getOr(0);

        let nextLevel = -1;
        let end = false;

        const next = headings
          .skipUntil((heading) => heading.equals(target))
          .rest()
          .find(
            hasHeadingLevel(
              device,
              tee(
                (level) => level <= currentLevel,
                (level, isLower) => {
                  if (isLower) {
                    nextLevel = level;
                  }
                }
              )
            )
          )
          // If there is no more heading with a small enough level,
          // go to the end of the document and record we did it
          .getOrElse(() => {
            end = true;

            return (
              document
                .descendants(Node.fullTree)
                .last()
                // The document contains at least the target.
                .getUnsafe()
            );
          });

        return {
          1: expectation(
            Node.getNodesBetween(target, next, {
              includeFirst: false,
              // If this is the last heading (of this level or less), then the
              // last node of the document is acceptable content; otherwise, the
              // next heading (of this level or less) is not acceptable content.
              includeSecond: end,
            }).some(
              and(
                isIncludedInTheAccessibilityTree(device),
                isContent(Node.fullTree),
                not(and(isText, (text) => text.data.trim() === ""))
              )
            ),
            () =>
              Outcomes.hasContent(
                // The link between end nad the type of next is lost by TS
                end ? None : Some.of(next as Element),
                currentLevel,
                nextLevel
              ),
            () =>
              Outcomes.hasNoContent(
                // The link between end nad the type of next is lost by TS
                end ? None : Some.of(next as Element),
                currentLevel,
                nextLevel
              )
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const hasContent = (
    nextHeading: Option<Element>,
    currentLevel: number,
    nextLevel: number
  ) =>
    Ok.of(
      WithNextHeading.of(
        "There is content between this heading and the next",
        nextHeading,
        currentLevel,
        nextLevel
      )
    );

  export const hasNoContent = (
    nextHeading: Option<Element>,
    currentLevel: number,
    nextLevel: number
  ) =>
    Err.of(
      WithNextHeading.of(
        "There is no content between this heading and the next",
        nextHeading,
        currentLevel,
        nextLevel
      )
    );
}

/**
 * @internal
 */
export class WithNextHeading extends Diagnostic {
  public static of(message: string): Diagnostic;

  public static of(
    message: string,
    nextHeading: Option<Element>,
    currentLevel: number,
    nextLevel: number
  ): WithNextHeading;

  public static of(
    message: string,
    nextHeading?: Option<Element>,
    currentLevel?: number,
    nextLevel?: number
  ): Diagnostic {
    return nextHeading === undefined ||
      currentLevel === undefined ||
      nextLevel === undefined
      ? Diagnostic.of(message)
      : new WithNextHeading(message, nextHeading, currentLevel, nextLevel);
  }

  private readonly _nextHeading: Option<Element>;
  private readonly _currentLevel: number;
  private readonly _nextLevel: number;

  private constructor(
    message: string,
    nextHeading: Option<Element>,
    currentLevel: number,
    nextLevel: number
  ) {
    super(message);
    this._nextHeading = nextHeading;
    this._currentLevel = currentLevel;
    this._nextLevel = nextLevel;
  }

  public get nextHeading(): Option<Element> {
    return this._nextHeading;
  }

  public get currentHeadingLevel(): number {
    return this._currentLevel;
  }

  public get nextHeadingLevel(): number {
    return this._nextLevel;
  }

  public equals(value: WithNextHeading): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof WithNextHeading &&
      value._message === this._message &&
      value._nextHeading.equals(this._nextHeading) &&
      value._currentLevel === this._currentLevel &&
      value._nextLevel === this._nextLevel
    );
  }

  public hash(hash: Hash) {
    super.hash(hash);
    hash.writeNumber(this._currentLevel);
    hash.writeNumber(this._nextLevel);
    this._nextHeading.hash(hash);
  }

  public toJSON(): WithNextHeading.JSON {
    return {
      ...super.toJSON(),
      nextHeading: this._nextHeading.toJSON(),
      currentHeadingLevel: this._currentLevel,
      nextHeadingLevel: this._nextLevel,
    };
  }
}

/**
 * @internal
 */
export namespace WithNextHeading {
  export interface JSON extends Diagnostic.JSON {
    nextHeading: Option.JSON<Element>;
    currentHeadingLevel: number;
    nextHeadingLevel: number;
  }

  export function isWithNextHeading(
    value: Diagnostic
  ): value is WithNextHeading;

  export function isWithNextHeading(value: unknown): value is WithNextHeading;

  export function isWithNextHeading(value: unknown): value is WithNextHeading {
    return value instanceof WithNextHeading;
  }
}
