const { getOwnPropertyNames } = Object;

export class Bound {
  constructor() {
    let self: any = this;

    for (const key of getOwnPropertyNames(self.constructor.prototype)) {
      const val: any = self[key];

      if (key !== "constructor" && typeof val === "function") {
        self[key] = (val as Function).bind(self);
      }
    }
  }
}
