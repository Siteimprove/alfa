import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Map } from "@siteimprove/alfa-map";

import * as json from "@siteimprove/alfa-json";

import { Display } from "./display";
import { Preference } from "./preference";
import { Scripting } from "./scripting";
import { Viewport } from "./viewport";

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
    preferences: Iterable<Preference> = []
  ): Device {
    return new Device(
      type,
      viewport,
      display,
      scripting,
      Map.from(
        Iterable.map(preferences, (preference) => [preference.name, preference])
      )
    );
  }

  private readonly _type: Device.Type;
  private readonly _viewport: Viewport;
  private readonly _display: Display;
  private readonly _scripting: Scripting;
  private readonly _preferences: Map<Preference.Name, Preference>;

  private constructor(
    type: Device.Type,
    viewport: Viewport,
    display: Display,
    scripting: Scripting,
    preferences: Map<Preference.Name, Preference>
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
      .getOrElse(() => Preference.unset(name)) as Preference<N>;
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
        Hash.writeUint8(hash, 1);
        break;
      case Device.Type.Screen:
        Hash.writeUint8(hash, 2);
        break;
      case Device.Type.Screen:
        Hash.writeUint8(hash, 3);
    }

    this._viewport.hash(hash);
    this._display.hash(hash);
    this._scripting.hash(hash);
    this._preferences.hash(hash);
  }

  public toJSON(): Device.JSON {
    return {
      type: this._type,
      viewport: this._viewport.toJSON(),
      display: this._display.toJSON(),
      scripting: this._scripting.toJSON(),
      preferences: [...this._preferences.values()].map((preferece) =>
        preferece.toJSON()
      ),
    };
  }
}

export namespace Device {
  export enum Type {
    Print = "print",
    Screen = "screen",
    Speech = "speech",
  }

  export interface JSON {
    [key: string]: json.JSON;
    type: Type;
    viewport: Viewport.JSON;
    display: Display.JSON;
    scripting: Scripting.JSON;
    preferences: Array<Preference.JSON>;
  }

  export function from(json: JSON): Device {
    return Device.of(
      json.type,
      Viewport.from(json.viewport),
      Display.from(json.display),
      Scripting.from(json.scripting),
      json.preferences.map((json) => Preference.from(json))
    );
  }

  export function standard(): Device {
    return Device.of(Type.Screen, Viewport.standard(), Display.standard());
  }
}
