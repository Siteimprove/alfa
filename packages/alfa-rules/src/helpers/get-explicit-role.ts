import { getRole, Role } from "@siteimprove/alfa-aria";
import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-util";

const { map } = BrowserSpecific;

export function getExplicitRole(
  element: Element,
  context: Node,
  device: Device
): Option<Role> | BrowserSpecific<Option<Role>> {
  return map(
    getRole(element, context, device, { implicit: false }),
    explicitRole => {
      if (explicitRole === null) {
        return null;
      }

      return map(
        getRole(element, context, device, { explicit: false }),
        implicitRole => {
          if (explicitRole !== implicitRole) {
            return explicitRole;
          }

          return null;
        }
      );
    }
  );
}
