import { Display } from "./display";
import { Viewport } from "./viewport";

export class Device {
  public static of(
    type: Device.Type,
    viewport: Viewport,
    display: Display
  ): Device {
    return new Device(type, viewport, display);
  }

  private readonly _type: Device.Type;
  private readonly _viewport: Viewport;
  private readonly _display: Display;

  private constructor(type: Device.Type, viewport: Viewport, display: Display) {
    this._type = type;
    this._viewport = viewport;
    this._display = display;
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

  public toJSON(): Device.JSON {
    return {
      type: this._type,
      viewport: this._viewport.toJSON(),
      display: this._display.toJSON()
    };
  }
}

export namespace Device {
  export enum Type {
    Print = "print",
    Screen = "screen",
    Speech = "speech"
  }

  export interface JSON {
    type: Type;
    viewport: Viewport.JSON;
    display: Display.JSON;
  }

  export function from(json: JSON): Device {
    return Device.of(
      json.type,
      Viewport.from(json.viewport),
      Display.from(json.display)
    );
  }

  export function standard(): Device {
    return Device.of(Type.Screen, Viewport.standard(), Display.standard());
  }
}
