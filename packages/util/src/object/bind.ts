const { getOwnPropertyNames } = Object;

export function bind(object: object): void {
  let self: any = object;

  for (const key of getOwnPropertyNames(self.constructor.prototype)) {
    const val: any = self[key];

    if (key !== "constructor" && typeof val === "function") {
      self[key] = (val as Function).bind(self);
    }
  }
}
