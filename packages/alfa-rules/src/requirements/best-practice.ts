import { Requirement } from "@siteimprove/alfa-act";

/**
 * @public
 */
export class BestPractice extends Requirement<"best practice"> {
  public static of(uri: string): BestPractice {
    return new BestPractice(uri);
  }

  protected constructor(uri: string) {
    super("best practice", uri);
  }

  public toJSON(): BestPractice.JSON {
    return super.toJSON();
  }
}

/**
 * @public
 */
export namespace BestPractice {
  export interface JSON extends Requirement.JSON<"best practice"> {}

  export function isBestPractice(value: unknown): value is BestPractice {
    return value instanceof BestPractice;
  }
}
