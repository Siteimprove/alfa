declare module "should" {
  function should(obj: unknown): should.Should;

  namespace should {
    interface Should {
      (obj: unknown): void;

      be: this;
      null: this;
    }

    type AssertionHandler = (this: { obj: unknown }) => void;

    namespace Assertion {
      function add(name: string, handler: AssertionHandler): void;
    }
  }

  export = should;
}

interface Object {
  should: import("should").Should;
}
