import { discrete } from "./discrete";

export const Orientation = discrete(
  "orientation",
  ["portrait", "landscape"],
  (device) => device.viewport.orientation,
);
