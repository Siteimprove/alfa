import { Device, DeviceType, Orientation } from "./types";

export function getDefaultDevice(): Device {
  return {
    type: DeviceType.Screen,
    viewport: {
      width: 1280,
      height: 720,
      orientation: Orientation.Landscape
    },
    display: {
      resolution: 1
    }
  };
}
