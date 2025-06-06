import type { Equatable } from "@siteimprove/alfa-equatable";
import type { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import type { Serializable } from "@siteimprove/alfa-json";
import { Map } from "@siteimprove/alfa-map";

import type * as json from "@siteimprove/alfa-json";

import { Display } from "./display.js";
import { Preference } from "./preference.js";
import { Scripting } from "./scripting.js";
import { Viewport } from "./viewport.js";

/**
 * @public
 */
export class Device implements Equatable, Hashable, Serializable {
  /**
   * @remarks
   * If the iterable of preferences contains preferences with duplicate names,
   * the last preference with a given name will take precedence.
   */
  public static of(
    type: Device.Type,
    viewport: Viewport,
    display: Display,
    scripting: Scripting = Scripting.of(true),
    preferences: Iterable<Preference> = [],
  ): Device {
    return new Device(
      type,
      viewport,
      display,
      scripting,
      Map.from(
        Iterable.map(preferences, (preference) => [
          preference.name,
          preference,
        ]),
      ),
    );
  }

  private readonly _type: Device.Type;
  private readonly _viewport: Viewport;
  private readonly _display: Display;
  private readonly _scripting: Scripting;
  private readonly _preferences: Map<Preference.Name, Preference>;

  protected constructor(
    type: Device.Type,
    viewport: Viewport,
    display: Display,
    scripting: Scripting,
    preferences: Map<Preference.Name, Preference>,
  ) {
    this._type = type;
    this._viewport = viewport;
    this._display = display;
    this._scripting = scripting;
    this._preferences = preferences;
  }

  public get type(): Device.Type {
    return this._type;
  }

  public get viewport(): Viewport {
    return this._viewport;
  }

  public get display(): Display {
    return this._display;
  }

  public get scripting(): Scripting {
    return this._scripting;
  }

  public get preferences(): Iterable<Preference> {
    return this._preferences.values();
  }

  public preference<N extends Preference.Name>(name: N): Preference<N> {
    return this._preferences
      .get(name)
      .getOrElse(() =>
        Preference.of(name, Preference.unset(name)),
      ) as Preference<N>;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Device &&
      value._type === this._type &&
      value._viewport.equals(this._viewport) &&
      value._display.equals(this._display) &&
      value._scripting.equals(this._scripting) &&
      value._preferences.equals(this._preferences)
    );
  }

  public hash(hash: Hash): void {
    switch (this._type) {
      case Device.Type.Print:
        hash.writeUint8(1);
        break;
      case Device.Type.Screen:
        hash.writeUint8(2);
        break;
      case Device.Type.Speech:
        hash.writeUint8(3);
    }

    hash
      .writeHashable(this._viewport)
      .writeHashable(this._display)
      .writeHashable(this._scripting)
      .writeHashable(this._preferences);
  }

  public toJSON(options?: json.Serializable.Options): Device.JSON {
    return {
      type: this._type,
      viewport: this._viewport.toJSON(options),
      display: this._display.toJSON(options),
      scripting: this._scripting.toJSON(options),
      preferences: [...this._preferences.values()].map((preferece) =>
        preferece.toJSON(options),
      ),
    };
  }
}

/**
 * @public
 */
export namespace Device {
  export enum Type {
    Print = "print",
    Screen = "screen",
    Speech = "speech",
  }

  export interface JSON {
    [key: string]: json.JSON;
    type: `${Type}`;
    viewport: Viewport.JSON;
    display: Display.JSON;
    scripting: Scripting.JSON;
    preferences: Array<Preference.JSON>;
  }

  export function from(json: JSON): Device {
    return Device.of(
      json.type as Type,
      Viewport.from(json.viewport),
      Display.from(json.display),
      Scripting.from(json.scripting),
      json.preferences.map((json) => Preference.from(json)),
    );
  }

  export function standard(): Device {
    return Device.of(Type.Screen, Viewport.standard(), Display.standard());
  }

  export function isDevice(value: unknown): value is Device {
    return value instanceof Device;
  }
}
