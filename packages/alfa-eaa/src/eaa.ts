import { Requirement } from "@siteimprove/alfa-act";
import { None, Option } from "@siteimprove/alfa-option";

import { Criteria } from "./criterion/data.js";

/**
 * @public
 */
export class EAA<
  C extends EAA.Chapter = EAA.Chapter,
> extends Requirement<"eaa"> {
  public static of<C extends EAA.Chapter>(chapter: C): EAA<C> {
    return new EAA(chapter);
  }

  private readonly _chapter: C;

  protected constructor(chapter: C) {
    super("eaa", "");
    this._chapter = chapter;
  }

  /**
   * The chapter of this criterion.
   */
  public get chapter(): C {
    return this._chapter;
  }

  /**
   * The title of this criterion.
   */
  public get title(): EAA.Title<C> {
    return Criteria[this._chapter].title;
  }
}

/**
 * @public
 */
export namespace EAA {
  export interface JSON<C extends EAA.Chapter = EAA.Chapter>
    extends Requirement.JSON<"eaa"> {
    chapter: C;
    version: string;
    title: string;
  }

  /**
   * The chapters of all criteria.
   */
  export type Chapter = keyof Criteria;

  export function isChapter(value: string): value is Chapter {
    return value in Criteria;
  }

  /**
   * The title of the specified criterion.
   */
  export type Title<C extends Chapter = Chapter> = Criteria[C]["title"];

  export function isEAA(value: unknown): value is EAA {
    return value instanceof EAA;
  }

  export function fromChapter(chapter: string): Option<EAA> {
    return isChapter(chapter) ? Option.of(EAA.of(chapter)) : None;
  }
}
