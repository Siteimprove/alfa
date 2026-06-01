import type { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";

import type * as json from "@siteimprove/alfa-json";

// Minimal Hashable + Serializable target wrapping a number.
export class Target implements json.Serializable<number>, Hashable {
  public static of(value: number): Target {
    return new Target(value);
  }

  protected constructor(readonly value: number) {}

  public hash(hash: Hash): void {
    hash.writeUint32(this.value);
  }

  public equals(value: unknown): boolean {
    return value instanceof Target && value.value === this.value;
  }

  public toJSON(): number {
    return this.value;
  }
}

export namespace Target {
  export const one = Target.of(1);
  export const two = Target.of(2);

  export function from(values: Array<number>): Array<Target> {
    return values.map(Target.of);
  }
}
