import { Diagnostic } from "@siteimprove/alfa-act";
import type { Role } from "@siteimprove/alfa-aria";
import { Node } from "@siteimprove/alfa-aria";
import type { Device } from "@siteimprove/alfa-device";
import type { Element } from "@siteimprove/alfa-dom";
import type * as dom from "@siteimprove/alfa-dom";
import type { Hash } from "@siteimprove/alfa-hash";

/**
 * @public
 */
export class WithRole extends Diagnostic {
  public static of(message: string): Diagnostic;

  public static of(message: string, role: Role.Name): WithRole;

  public static of(message: string, role?: Role.Name): Diagnostic {
    return role === undefined
      ? new Diagnostic(message)
      : new WithRole(message, role);
  }

  protected readonly _role: Role.Name;

  protected constructor(message: string, role: Role.Name) {
    super(message);
    this._role = role;
  }

  public get role(): Role.Name {
    return this._role;
  }

  public equals(value: WithRole): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof WithRole &&
      value._message === this._message &&
      value._role === this._role
    );
  }

  public hash(hash: Hash) {
    super.hash(hash);
    hash.writeString(this._role);
  }

  public toJSON(options?: dom.Node.SerializationOptions): WithRole.JSON {
    return {
      ...super.toJSON(options),
      role: this._role,
    };
  }
}

/**
 * @public
 */
export namespace WithRole {
  export interface JSON extends Diagnostic.JSON {
    role: string;
  }

  export function isWithRole(value: Diagnostic): value is WithRole;

  export function isWithRole(value: unknown): value is WithRole;

  export function isWithRole(value: unknown): value is WithRole {
    return value instanceof WithRole;
  }

  export function getRoleName(element: Element, device: Device): Role.Name {
    return Node.from(element, device)
      .role.map((role) => role.name)
      .getOr("generic");
  }
}
