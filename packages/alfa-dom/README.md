# Alfa DOM

Implementation of the DOM and CSSOM specifications.

## Test specificities

Because this is the package that defines Alfa's custom JSX transformation, the tests that use JSX syntax need to do some magic.

From other packages, setting `jsxImportSource: "@siteimprove/alfa-dom"` in the `compilerOptions` of the `tsconfig.json` file is enough to make the tests work. 

However, this points to the **compiled** version of the JSX transformation (in the `dist` directory). This means that the resulting `Element`, … will be from the classes defined there. Which, in turns, means that if we point the test files to the **uncomplied** `src` directory, Vitest will make its own compilation resulting in **different** `Element`, … classes and breaking every `instanceof`, … checks (used, notably, in the `isElement`, … guards).

It seems that it is not possible to point the `jsxImportSource` to the `src` directory, which makes sense as Vitest needs a compiled version of it to run during its own compilation process.

Hence, the only way to use the same class for both the tests and the JSX transformation is to also have the tests import from `dist`, instead of doing it from `src` as usual; which also means importing from the `.js` compiled files instead of the `.ts` source files.
