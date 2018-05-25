# Alfa

> :wheelchair: Suite of open and standards-based tools for performing reliable accessibility conformance testing at scale

Alfa is an open and standards-based accessibility conformance testing engine used for testing websites built using HTML, CSS, and JavaScript against the [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/TR/WCAG/). It is the result of distilling the best parts of our proprietary accessibility conformance testing engine and implementing them on top of the open [Accessibility Conformance Testing (ACT) Rules Format](https://www.w3.org/TR/act-rules-format/). In comparison to our proprietary engine, Alfa also brings several improvements that make it possible to implement and execute advanced rules without relying on Siteimprove infrastructure.

> :warning: Alfa is still in the very early stages of development. Nothing is final, nothing is published, and breaking API changes will be swift and unforgiving. You should however not let it deter you from exploring the project and some of the new and interesting ideas we're trying to bring to the table.

## Contents

* [Goals](#goals)
* [Overview](#overview)
* [Funding](#funding)
* [License](#license)

## Goals

* Alfa sets out to strike a balance between false positives and negatives with the goal of having result sets reach a high [F<sub>1</sub> score](https://en.wikipedia.org/wiki/F1_score). If a false positive is encountered, it is therefore just as important to avoid introducing a potential false negative as it is fixing the false positive.

* Alfa is committed to complete transparency on how test results came to be. Every line of code that has the potential to influence test results will therefore always reside within Alfa itself and never with a third-party. This does not mean that you will never encounter a dependency from a third-party, only that there are limitations to what third-party dependencies may be used for.

* Alfa wants to foster a thriving ecosystem with people from many different backgrounds contributing where they can. To this end, high quality documentation is paramount to the success of Alfa. Picking up and contributing to any one of the many subsystems within Alfa should be a straightforward experience with every subsystem clearly stating its purpose and structure.

## Overview

At its core, Alfa is built around a tree structure that mirrors a subset of the [Document Object Model (DOM)](https://www.w3.org/TR/dom) and [CSS Object Model (CSSOM)](https://www.w3.org/TR/cssom/) interfaces. This tree structure can be created statically from an HTML document and associated CSS style sheets, or it can be extracted from within a browser to also provide executing of JavaScript. Anything else that a browser would normally provide, such as querying elements or computing styles, Alfa implements according to the corresponding W3C specifications.

By implementing browser aspects, such as a style system and the accessibility tree, directly within Alfa, we gain the ability to do some interesting things that would otherwise not be possible had we relied on only the APIs provided by the browser. The most radical difference is perhaps computation of CSS properties, where Alfa can follow declared CSS properties up through cascade, inheritance, and absolutisation.

At the code level, Alfa is structured as a monolithic repository consisting of several packages that each have their own area of responsibility. The primary packages are:

* [**DOM**](packages/alfa-dom)
* [**CSS**](packages/alfa-css)
* [**ARIA**](packages/alfa-aria)
* [**ACT**](packages/alfa-act)
* [**WCAG**](packages/alfa-wcag)

You can find more information on the overall architecture of Alfa in the [architecture documentation](docs/architecture). We also write and maintain [architecture decision reports](docs/architecture/decisions) if you want to get the complete picture of how Alfa came to be.

## Funding

[<img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/Flag_of_Europe.svg" height="96" align="right" alt="European emblem">](https://ec.europa.eu/)

Alfa is part of a project that has received funding from the European Union's [Horizon 2020 research and innovation programme](https://ec.europa.eu/programmes/horizon2020/) under [grant agreement Nº780057](https://cordis.europa.eu/project/rcn/213106_en.html). We would therefore like to give thanks to the European Commission for their grant, as well as all European citizens, who have indirectly contributed to making Alfa possible. You rock! :raised_hands:

## License

Copyright &copy; 2017-2018 [Siteimprove A/S](https://siteimprove.com/). Released under the terms of the [MIT license](LICENSE.md).
