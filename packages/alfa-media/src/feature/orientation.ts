import { String } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Option } from "@siteimprove/alfa-option";

import { Feature } from "./feature";
import { Err, Ok, Result } from "@siteimprove/alfa-result";

const { isString } = String;

export class Orientation extends Feature<"orientation", Orientation.Value> {
  public static myof(value: Option<Orientation.Value>): Orientation {
    return new Orientation(value);
  }

  private constructor(value: Option<Orientation.Value>) {
    super("orientation", value);
  }

  public matches(device: Device): boolean {
    // If there is no value, we are in boolean context and match everything but 'none' which is impossible,
    // hence "(orientation)" matches all devices.
    return this._value.every(
      (value) => value.value === device.viewport.orientation
    );
  }
}

export namespace Orientation {
  export type Value = String<"landscape"> | String<"portrait">;

  export function fromValue(
    value: Option<Feature.Value>
  ): Result<Orientation, string> {
    return value.every(validate)
      ? Ok.of(Orientation.myof(value))
      : Err.of("Orientation must be landscape or portrait");
  }

  function validate(value: Feature.Value): value is Value {
    return (
      isString(value) &&
      (value.value === "landscape" || value.value === "portrait")
    );
  }

  export function isOrientation(value: unknown): value is Orientation {
    return value instanceof Orientation;
  }
}
