import { Diagnostic } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Node } from "@siteimprove/alfa-aria";
import { Element } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";

/**
 * @public
 */
export class WithAccessibleName extends Diagnostic {
  public static of(message: string): Diagnostic;

  public static of(message: string, accessibleName: string): Diagnostic;

  public static of(message: string, accessibleName?: string): Diagnostic {
    return accessibleName === undefined
      ? new Diagnostic(message)
      : new WithAccessibleName(message, accessibleName);
  }

  private readonly _accessibleName: string;

  protected constructor(message: string, accessibleName: string) {
    super(message);
    this._accessibleName = accessibleName;
  }

  public get accessibleName(): string {
    return this._accessibleName;
  }

  public toJSON(): WithAccessibleName.JSON {
    return {
      ...super.toJSON(),
      accessibleName: this._accessibleName,
    };
  }
}

/**
 * @public
 */
export namespace WithAccessibleName {
  export interface JSON extends Diagnostic.JSON {
    accessibleName: string;
  }

  export function isWithAccessibleName(
    value: Diagnostic,
  ): value is WithAccessibleName;

  export function isWithAccessibleName(
    value: unknown,
  ): value is WithAccessibleName;

  /**
   * @public
   */
  export function isWithAccessibleName(
    value: unknown,
  ): value is WithAccessibleName {
    return value instanceof WithAccessibleName;
  }

  export function getAccessibleName(
    element: Element,
    device: Device,
  ): Option<string> {
    return Node.from(element, device).name.map((x) => x.value);
  }
}
