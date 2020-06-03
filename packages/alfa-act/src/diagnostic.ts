import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Map } from "@siteimprove/alfa-map";

import * as json from "@siteimprove/alfa-json";

export class Diagnostic implements Equatable, Serializable {
  public static of(
    message: string,
    data: Iterable<[string, unknown]> = []
  ): Diagnostic {
    return new Diagnostic(normalize(message), Map.from(data));
  }

  private readonly _message: string;
  private readonly _data: Map<string, unknown>;

  private constructor(message: string, data: Map<string, unknown>) {
    this._message = message;
    this._data = data;
  }

  public get message(): string {
    return this._message;
  }

  public get data(): Iterable<[string, unknown]> {
    return this._data;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Diagnostic &&
      value._message === this._message &&
      value._data.equals(this._data)
    );
  }

  public toJSON(): Diagnostic.JSON {
    return {
      message: this._message,
      data: this._data
        .toArray()
        .map(([key, value]) => [key, Serializable.toJSON(value)]),
    };
  }
}

export namespace Diagnostic {
  export interface JSON {
    [key: string]: json.JSON;
    message: string;
    data: Array<[string, json.JSON]>;
  }
}

function normalize(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}
