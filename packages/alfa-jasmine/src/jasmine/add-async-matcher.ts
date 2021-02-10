/// <reference types="jasmine" />

export function addAsyncMatcher(
  name: string,
  matcher: jasmine.CustomAsyncMatcherFactory
): void {
  beforeEach(() => {
    jasmine.addAsyncMatchers({
      [name]: matcher,
    });
  });
}
