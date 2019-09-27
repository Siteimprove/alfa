import { Device, DeviceType, Orientation } from "./types";

const { freeze } = Object;

const defaultDevice: Device = freeze({
  type: DeviceType.Screen,
  viewport: {
    width: 1280,
    height: 720,
    orientation: Orientation.Landscape
  },
  display: {
    resolution: 1
  }
});

export function getDefaultDevice(): Device {
  return defaultDevice;
}
