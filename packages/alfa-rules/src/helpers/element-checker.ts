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
  constructor(namesSet?: Set<string>) {
    this.namesSet = namesSet;
  }

  public withContext(context: Node): ElementCheckerWithContext {
    const checker = new ElementCheckerWithContext(context, this.namesSet);
    return checker;
  }

  protected namesSet?: Set<string>;
  public withName(...names: Array<string>): ElementChecker {
    this.namesSet = new Set(names);
    return this;
  }

  public build(): (node: Node) => boolean | BrowserSpecific<boolean> {
    return node => {
      if (!isElement(node)) {
        return false;
      }

      return emptyOrHas(node.localName, this.namesSet);
    };
  }
}

class ElementCheckerWithContext extends ElementChecker {
  private readonly context: Node;

  constructor(context: Node, namesSet?: Set<string>) {
    super(namesSet);
    this.context = context;
  }

  private namespacesSet?: Set<Namespace>;
  public withNamespace(
    ...namespaces: Array<Namespace>
  ): ElementCheckerWithContext {
    this.namespacesSet = new Set(namespaces);
    return this;
  }

  private device?: Device;
  private rolesSet?: Set<Role>;
  public withRole(
    device: Device,
    ...roles: Array<Role>
  ): ElementCheckerWithContext {
    this.device = device;
    this.rolesSet = new Set(roles);
    return this;
  }

  public build(): (node: Node) => boolean | BrowserSpecific<boolean> {
    return node => {
      if (!isElement(node)) {
        return false;
      }

      const elementNamespace = getElementNamespace(node, this.context);

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
          : BrowserSpecific.map(
              getRole(node, this.context, this.device),
              role => emptyOrHas(role, this.rolesSet)
            );

      return simpleChecks ? browserSpecificChecks : simpleChecks;
    };
  }
}
