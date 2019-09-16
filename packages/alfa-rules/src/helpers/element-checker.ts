import { getRole, Role } from "@siteimprove/alfa-aria";
import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  //  Element,
  getElementNamespace,
  isElement,
  Namespace,
  Node
} from "@siteimprove/alfa-dom";
// import { Predicate } from "@siteimprove/alfa-util";

function emptyOrHas<T>(elt: T, set?: Set<T>) {
  return set === undefined || set.has(elt);
}

export class ElementChecker {
  private context?: Node;
  public withContext(context: Node): ElementChecker {
    this.context = context;
    return this;
  }

  private namespacesSet?: Set<Namespace>;
  public withNamespace(...namespaces: Array<Namespace>): ElementChecker {
    this.namespacesSet = new Set(namespaces);
    return this;
  }

  private namesSet?: Set<string>;
  public withName(...names: Array<string>): ElementChecker {
    this.namesSet = new Set(names);
    return this;
  }

  private device?: Device;
  private rolesSet?: Set<Role>;
  public withRole(device: Device, ...roles: Array<Role>): ElementChecker {
    this.device = device;
    this.rolesSet = new Set(roles);
    return this;
  }

  public build(): (node: Node) => boolean | BrowserSpecific<boolean> {
    return node => {
      if (!isElement(node)) {
        return false;
      }

      const elementNamespace =
        this.context === undefined
          ? null
          : getElementNamespace(node, this.context);

      const simpleChecks = // checks that are not browser Specific
        // Checking name, always passing if no names were specified
        emptyOrHas(node.localName, this.namesSet) &&
        // Checking namespace, always passing if no namespace
        (this.namespacesSet === undefined ||
          (elementNamespace !== null &&
            this.namespacesSet.has(elementNamespace)));

      const browserSpecificChecks: boolean | BrowserSpecific<boolean> =
        this.device === undefined
          ? true
          : this.context !== undefined &&
            BrowserSpecific.map(
              getRole(node, this.context, this.device),
              role => emptyOrHas(role, this.rolesSet)
            );

      return simpleChecks ? browserSpecificChecks : simpleChecks;
    };
  }
}
