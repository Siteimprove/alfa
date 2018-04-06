# Alfa

> Suite of open and standards-based tools for performing reliable accessibility conformance testing at scale

Alfa is the result of distilling the best parts of our proprietary accessibility conformance testing engine and implementing them on top of the open [Accessibility Conformance Testing (ACT) Rules Format](https://www.w3.org/TR/act-rules-format/). In comparison to our proprietary engine, Alfa also brings several improvements that make it possible to implement and execute advanced rules without relying on Siteimprove infrastructure.

## Contents

* [Goals](#goals)
* [Funding](#funding)
* [License](#license)

## Goals

* Alfa sets out to strike a balance between false positives and negatives with the goal of having result sets reach a high [F<sub>1</sub> score](https://en.wikipedia.org/wiki/F1_score). If a false positive is encountered, it is therefore just as important to avoid introducing a potential false negative as it is fixing the false positive.

* Alfa is committed to complete transparency on how test results came to be. Every line of code that has the potential to influence test results will therefore always reside within Alfa itself and never with a third-party. This does not mean that you will never encounter a dependency from a third-party, only that there are limitations to what third-party dependencies may be used for.

* Alfa wants to foster a thriving ecosystem with people from many different backgrounds contributing where they can. To this end, high quality documentation is paramount to the success of Alfa. Picking up and contributing to any one of the many subsystems within Alfa should be a straightforward experience with every subsystem clearly stating its purpose and structure.

## Funding

[<img src="https://upload.wikimedia.org/wikipedia/commons/8/84/European_Commission.svg" width="200" align="right" alt="Logo of the European Commission">](https://ec.europa.eu/)

Alfa has been funded by the European Commission as part of the [Horizon 2020 Programme for Research and Innovation](https://ec.europa.eu/programmes/horizon2020/). We would therefore like to give thanks to not only the European Commission for their grant but also you, as a European citizen, for your contribution to making Alfa possible!

## License

Copyright &copy; 2017-2018 [Siteimprove A/S](https://siteimprove.com/). Released under the terms of the [MIT license](LICENSE.md).
