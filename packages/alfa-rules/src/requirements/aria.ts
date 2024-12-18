import { Requirement } from "@siteimprove/alfa-act";

/**
 * @public
 */
export class ARIA extends Requirement<"ARIA"> {
  public static of(uri: string): ARIA {
    return new ARIA(uri);
  }

  protected constructor(uri: string) {
    super("ARIA", uri);
  }

  public toJSON(): ARIA.JSON {
    return super.toJSON();
  }
}

/**
 * @public
 */
export namespace ARIA {
  export interface JSON extends Requirement.JSON<"ARIA"> {}

  export function isARIA(value: unknown): value is ARIA {
    return value instanceof ARIA;
  }
}
