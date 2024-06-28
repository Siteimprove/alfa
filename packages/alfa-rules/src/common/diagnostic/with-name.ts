import { Diagnostic } from "@siteimprove/alfa-act";
import type { Device } from "@siteimprove/alfa-device";
import { Node } from "@siteimprove/alfa-aria";
import type { Element } from "@siteimprove/alfa-dom";
import type { Option } from "@siteimprove/alfa-option";

/**
 * @public
 */
export class WithName extends Diagnostic {
  public static of(message: string): Diagnostic;

  public static of(message: string, name: string): Diagnostic;

  public static of(message: string, name?: string): Diagnostic {
    return name === undefined
      ? new Diagnostic(message)
      : new WithName(message, name);
  }

  protected readonly _name: string;

  protected constructor(message: string, name: string) {
    super(message);
    this._name = name;
  }

  public get name(): string {
    return this._name;
  }

  public toJSON(): WithName.JSON {
    return {
      ...super.toJSON(),
      name: this._name,
    };
  }
}

/**
 * @public
 */
export namespace WithName {
  export interface JSON extends Diagnostic.JSON {
    name: string;
  }

  export function isWithName(value: Diagnostic): value is WithName;

  export function isWithName(value: unknown): value is WithName;

  /**
   * @public
   */
  export function isWithName(value: unknown): value is WithName {
    return value instanceof WithName;
  }

  export function getName(element: Element, device: Device): Option<string> {
    return Node.from(element, device).name.map((x) => x.value);
  }
}
