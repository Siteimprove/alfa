import { Diagnostic } from "@siteimprove/alfa-act";
import { Role } from "@siteimprove/alfa-aria";

/**
 * @internal
 */
export class WithRole extends Diagnostic {
  public static of(message: string): Diagnostic;

  public static of(message: string, role: Role.Name): WithRole;

  public static of(message: string, role?: Role.Name): Diagnostic {
    return role === undefined
      ? new Diagnostic(message)
      : new WithRole(message, role);
  }

  private readonly _role: Role.Name;

  private constructor(message: string, role: Role.Name) {
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

  public toJSON(): WithRole.JSON {
    return {
      ...super.toJSON(),
      role: this._role,
    };
  }
}

/**
 * @internal
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
}
