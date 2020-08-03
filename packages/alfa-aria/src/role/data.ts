// This file has been automatically generated based on the various WAI-ARIA
// specifications. Do therefore not modify it directly! If you wish to make
// changes, do so in `scripts/roles.js` and run `yarn generate` to rebuild this
// file.

export type Roles = typeof Roles;

export const Roles = {
  alert: {
    index: 0,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [
        ["aria-atomic", "true"],
        ["aria-live", "assertive"],
      ],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  alertdialog: {
    index: 1,
    abstract: false,
    inherited: ["alert", "dialog"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  application: {
    index: 2,
    abstract: false,
    inherited: ["structure"],
    attributes: {
      supported: [
        "aria-activedescendant",
        "aria-disabled",
        "aria-errormessage",
        "aria-expanded",
        "aria-haspopup",
        "aria-invalid",
      ],
      required: [],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  article: {
    index: 3,
    abstract: false,
    inherited: ["document"],
    attributes: {
      supported: ["aria-posinset", "aria-setsize"],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  banner: {
    index: 4,
    abstract: false,
    inherited: ["landmark"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  blockquote: {
    index: 5,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  button: {
    index: 6,
    abstract: false,
    inherited: ["command"],
    attributes: {
      supported: [
        "aria-disabled",
        "aria-expanded",
        "aria-haspopup",
        "aria-pressed",
      ],
      required: [],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["contents", "author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  caption: {
    index: 7,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: true,
      from: [],
    },
    parent: {
      required: ["figure", "grid", "table"],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  cell: {
    index: 8,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [
        "aria-colindex",
        "aria-colspan",
        "aria-rowindex",
        "aria-rowspan",
      ],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["contents", "author"],
    },
    parent: {
      required: ["row"],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  checkbox: {
    index: 9,
    abstract: false,
    inherited: ["input"],
    attributes: {
      supported: [
        "aria-checked",
        "aria-errormessage",
        "aria-expanded",
        "aria-invalid",
        "aria-readonly",
        "aria-required",
      ],
      required: ["aria-checked"],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["contents", "author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  code: {
    index: 10,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: true,
      from: [],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  columnheader: {
    index: 11,
    abstract: false,
    inherited: ["cell", "gridcell", "sectionhead"],
    attributes: {
      supported: ["aria-sort"],
      required: [],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["contents", "author"],
    },
    parent: {
      required: ["row"],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  combobox: {
    index: 12,
    abstract: false,
    inherited: ["input"],
    attributes: {
      supported: [
        "aria-activedescendant",
        "aria-autocomplete",
        "aria-controls",
        "aria-errormessage",
        "aria-expanded",
        "aria-haspopup",
        "aria-invalid",
        "aria-readonly",
        "aria-required",
      ],
      required: ["aria-controls", "aria-expanded"],
      defaults: [
        ["aria-expanded", "false"],
        ["aria-haspopup", "listbox"],
      ],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  command: {
    index: 13,
    abstract: true,
    inherited: ["widget"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  complementary: {
    index: 14,
    abstract: false,
    inherited: ["landmark"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  composite: {
    index: 15,
    abstract: true,
    inherited: ["widget"],
    attributes: {
      supported: ["aria-activedescendant", "aria-disabled"],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  contentinfo: {
    index: 16,
    abstract: false,
    inherited: ["landmark"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  definition: {
    index: 17,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  deletion: {
    index: 18,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: true,
      from: [],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  dialog: {
    index: 19,
    abstract: false,
    inherited: ["window"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  directory: {
    index: 20,
    abstract: false,
    inherited: ["list"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  document: {
    index: 21,
    abstract: false,
    inherited: ["structure"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  emphasis: {
    index: 22,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: true,
      from: [],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  feed: {
    index: 23,
    abstract: false,
    inherited: ["list"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [["article"]],
    },
  },
  figure: {
    index: 24,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  form: {
    index: 25,
    abstract: false,
    inherited: ["landmark"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  generic: {
    index: 26,
    abstract: false,
    inherited: ["structure"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: true,
      from: [],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  grid: {
    index: 27,
    abstract: false,
    inherited: ["composite", "table"],
    attributes: {
      supported: ["aria-multiselectable", "aria-readonly"],
      required: [],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [["row"], ["rowgroup", "row"]],
    },
  },
  gridcell: {
    index: 28,
    abstract: false,
    inherited: ["cell", "widget"],
    attributes: {
      supported: [
        "aria-disabled",
        "aria-errormessage",
        "aria-expanded",
        "aria-haspopup",
        "aria-invalid",
        "aria-readonly",
        "aria-required",
        "aria-selected",
      ],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["contents", "author"],
    },
    parent: {
      required: ["row"],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  group: {
    index: 29,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: ["aria-activedescendant", "aria-disabled"],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  heading: {
    index: 30,
    abstract: false,
    inherited: ["sectionhead"],
    attributes: {
      supported: ["aria-level"],
      required: ["aria-level"],
      defaults: [["aria-level", "2"]],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["contents", "author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  img: {
    index: 31,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  input: {
    index: 32,
    abstract: true,
    inherited: ["widget"],
    attributes: {
      supported: ["aria-disabled"],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  insertion: {
    index: 33,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: true,
      from: [],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  landmark: {
    index: 34,
    abstract: true,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  link: {
    index: 35,
    abstract: false,
    inherited: ["command"],
    attributes: {
      supported: ["aria-disabled", "aria-expanded"],
      required: [],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["contents", "author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  list: {
    index: 36,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [["listitem"]],
    },
  },
  listbox: {
    index: 37,
    abstract: false,
    inherited: ["select"],
    attributes: {
      supported: [
        "aria-errormessage",
        "aria-expanded",
        "aria-invalid",
        "aria-multiselectable",
        "aria-readonly",
        "aria-required",
      ],
      required: [],
      defaults: [["aria-orientation", "vertical"]],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [["group", "option"], ["option"]],
    },
  },
  listitem: {
    index: 38,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: ["aria-level", "aria-posinset", "aria-setsize"],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: ["directory", "list"],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  log: {
    index: 39,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [["aria-live", "polite"]],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  main: {
    index: 40,
    abstract: false,
    inherited: ["landmark"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  marquee: {
    index: 41,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  math: {
    index: 42,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  meter: {
    index: 43,
    abstract: false,
    inherited: ["range"],
    attributes: {
      supported: ["aria-valuemax", "aria-valuemin", "aria-valuenow"],
      required: ["aria-valuemax", "aria-valuemin", "aria-valuenow"],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  menu: {
    index: 44,
    abstract: false,
    inherited: ["select"],
    attributes: {
      supported: [],
      required: [],
      defaults: [["aria-orientation", "vertical"]],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [
        ["group", "menuitem"],
        ["group", "menuitemradio"],
        ["group", "menuitemcheckbox"],
        ["menuitem"],
        ["menuitemcheckbox"],
        ["menuitemradio"],
      ],
    },
  },
  menubar: {
    index: 45,
    abstract: false,
    inherited: ["menu"],
    attributes: {
      supported: [],
      required: [],
      defaults: [["aria-orientation", "horizontal"]],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [
        ["group", "menuitem"],
        ["group", "menuitemradio"],
        ["group", "menuitemcheckbox"],
        ["menuitem"],
        ["menuitemcheckbox"],
        ["menuitemradio"],
      ],
    },
  },
  menuitem: {
    index: 46,
    abstract: false,
    inherited: ["command"],
    attributes: {
      supported: [
        "aria-disabled",
        "aria-expanded",
        "aria-haspopup",
        "aria-posinset",
        "aria-setsize",
      ],
      required: [],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["contents", "author"],
    },
    parent: {
      required: ["group", "menu", "menubar"],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  menuitemcheckbox: {
    index: 47,
    abstract: false,
    inherited: ["checkbox", "menuitem"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["contents", "author"],
    },
    parent: {
      required: ["group", "menu", "menubar"],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  menuitemradio: {
    index: 48,
    abstract: false,
    inherited: ["menuitemcheckbox", "radio"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["contents", "author"],
    },
    parent: {
      required: ["group", "menu", "menubar"],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  navigation: {
    index: 49,
    abstract: false,
    inherited: ["landmark"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  none: {
    index: 50,
    abstract: false,
    inherited: [],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: [],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  note: {
    index: 51,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  option: {
    index: 52,
    abstract: false,
    inherited: ["input"],
    attributes: {
      supported: [
        "aria-checked",
        "aria-posinset",
        "aria-selected",
        "aria-setsize",
      ],
      required: ["aria-selected"],
      defaults: [["aria-selected", "false"]],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["contents", "author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  paragraph: {
    index: 53,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: true,
      from: [],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  presentation: {
    index: 54,
    abstract: false,
    inherited: ["structure"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: true,
      from: [],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  progressbar: {
    index: 55,
    abstract: false,
    inherited: ["range", "widget", "status"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  radio: {
    index: 56,
    abstract: false,
    inherited: ["input"],
    attributes: {
      supported: ["aria-checked", "aria-posinset", "aria-setsize"],
      required: ["aria-checked"],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["contents", "author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  radiogroup: {
    index: 57,
    abstract: false,
    inherited: ["select"],
    attributes: {
      supported: [
        "aria-errormessage",
        "aria-invalid",
        "aria-readonly",
        "aria-required",
      ],
      required: [],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [["radio"]],
    },
  },
  range: {
    index: 58,
    abstract: true,
    inherited: ["structure"],
    attributes: {
      supported: [
        "aria-valuemax",
        "aria-valuemin",
        "aria-valuenow",
        "aria-valuetext",
      ],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  region: {
    index: 59,
    abstract: false,
    inherited: ["landmark"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  roletype: {
    index: 60,
    abstract: true,
    inherited: [],
    attributes: {
      supported: [
        "aria-atomic",
        "aria-busy",
        "aria-controls",
        "aria-current",
        "aria-describedby",
        "aria-details",
        "aria-dropeffect",
        "aria-flowto",
        "aria-grabbed",
        "aria-hidden",
        "aria-keyshortcuts",
        "aria-label",
        "aria-labelledby",
        "aria-live",
        "aria-owns",
        "aria-relevant",
        "aria-roledescription",
      ],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: [],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  row: {
    index: 61,
    abstract: false,
    inherited: ["group", "widget"],
    attributes: {
      supported: [
        "aria-colindex",
        "aria-expanded",
        "aria-level",
        "aria-posinset",
        "aria-rowindex",
        "aria-selected",
        "aria-setsize",
      ],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["contents", "author"],
    },
    parent: {
      required: ["grid", "rowgroup", "table", "treegrid"],
    },
    children: {
      presentational: false,
      required: [["cell"], ["columnheader"], ["gridcell"], ["rowheader"]],
    },
  },
  rowgroup: {
    index: 62,
    abstract: false,
    inherited: ["structure"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["contents", "author"],
    },
    parent: {
      required: ["grid", "table", "treegrid"],
    },
    children: {
      presentational: false,
      required: [["row"]],
    },
  },
  rowheader: {
    index: 63,
    abstract: false,
    inherited: ["cell", "gridcell", "sectionhead"],
    attributes: {
      supported: ["aria-expanded", "aria-sort"],
      required: [],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["contents", "author"],
    },
    parent: {
      required: ["row"],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  scrollbar: {
    index: 64,
    abstract: false,
    inherited: ["range", "widget"],
    attributes: {
      supported: [
        "aria-controls",
        "aria-disabled",
        "aria-orientation",
        "aria-valuemax",
        "aria-valuemin",
        "aria-valuenow",
      ],
      required: ["aria-controls", "aria-valuenow"],
      defaults: [
        ["aria-orientation", "vertical"],
        ["aria-valuemax", "100"],
        ["aria-valuemin", "0"],
      ],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  search: {
    index: 65,
    abstract: false,
    inherited: ["landmark"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  searchbox: {
    index: 66,
    abstract: false,
    inherited: ["textbox"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  section: {
    index: 67,
    abstract: true,
    inherited: ["structure"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: [],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  sectionhead: {
    index: 68,
    abstract: true,
    inherited: ["structure"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["contents", "author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  select: {
    index: 69,
    abstract: true,
    inherited: ["composite", "group"],
    attributes: {
      supported: ["aria-orientation"],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  separator: {
    index: 70,
    abstract: false,
    inherited: ["structure", "widget"],
    attributes: {
      supported: [
        "aria-disabled",
        "aria-orientation",
        "aria-valuemax",
        "aria-valuemin",
        "aria-valuenow",
        "aria-valuetext",
      ],
      required: ["aria-valuenow"],
      defaults: [
        ["aria-orientation", "horizontal"],
        ["aria-valuemax", "100"],
        ["aria-valuemin", "0"],
      ],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  slider: {
    index: 71,
    abstract: false,
    inherited: ["input", "range"],
    attributes: {
      supported: [
        "aria-errormessage",
        "aria-haspopup",
        "aria-invalid",
        "aria-orientation",
        "aria-readonly",
        "aria-valuemax",
        "aria-valuemin",
        "aria-valuenow",
      ],
      required: ["aria-valuenow"],
      defaults: [
        ["aria-orientation", "horizontal"],
        ["aria-valuemax", "100"],
        ["aria-valuemin", "0"],
      ],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  spinbutton: {
    index: 72,
    abstract: false,
    inherited: ["composite", "input", "range"],
    attributes: {
      supported: [
        "aria-errormessage",
        "aria-invalid",
        "aria-readonly",
        "aria-required",
        "aria-valuemax",
        "aria-valuemin",
        "aria-valuenow",
        "aria-valuetext",
      ],
      required: [],
      defaults: [
        ["aria-valuemax", ""],
        ["aria-valuemin", ""],
        ["aria-valuenow", "0"],
      ],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  status: {
    index: 73,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [
        ["aria-atomic", "true"],
        ["aria-live", "polite"],
      ],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  strong: {
    index: 74,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: true,
      from: [],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  structure: {
    index: 75,
    abstract: true,
    inherited: ["roletype"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: [],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  subscript: {
    index: 76,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: true,
      from: [],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  superscript: {
    index: 77,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: true,
      from: [],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  switch: {
    index: 78,
    abstract: false,
    inherited: ["checkbox"],
    attributes: {
      supported: ["aria-checked"],
      required: ["aria-checked"],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["contents", "author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  tab: {
    index: 79,
    abstract: false,
    inherited: ["sectionhead", "widget"],
    attributes: {
      supported: [
        "aria-disabled",
        "aria-expanded",
        "aria-haspopup",
        "aria-posinset",
        "aria-selected",
        "aria-setsize",
      ],
      required: [],
      defaults: [["aria-selected", "false"]],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["contents", "author"],
    },
    parent: {
      required: ["tablist"],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  table: {
    index: 80,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: ["aria-colcount", "aria-rowcount"],
      required: [],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [["row"], ["rowgroup", "row"]],
    },
  },
  tablist: {
    index: 81,
    abstract: false,
    inherited: ["composite"],
    attributes: {
      supported: ["aria-level", "aria-multiselectable", "aria-orientation"],
      required: [],
      defaults: [["aria-orientation", "horizontal"]],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [["tab"]],
    },
  },
  tabpanel: {
    index: 82,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  term: {
    index: 83,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  textbox: {
    index: 84,
    abstract: false,
    inherited: ["input"],
    attributes: {
      supported: [
        "aria-activedescendant",
        "aria-autocomplete",
        "aria-errormessage",
        "aria-haspopup",
        "aria-invalid",
        "aria-multiline",
        "aria-placeholder",
        "aria-readonly",
        "aria-required",
      ],
      required: [],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  time: {
    index: 85,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  timer: {
    index: 86,
    abstract: false,
    inherited: ["status"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  toolbar: {
    index: 87,
    abstract: false,
    inherited: ["group"],
    attributes: {
      supported: ["aria-orientation"],
      required: [],
      defaults: [["aria-orientation", "horizontal"]],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  tooltip: {
    index: 88,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["contents", "author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  tree: {
    index: 89,
    abstract: false,
    inherited: ["select"],
    attributes: {
      supported: [
        "aria-errormessage",
        "aria-invalid",
        "aria-multiselectable",
        "aria-required",
      ],
      required: [],
      defaults: [["aria-orientation", "vertical"]],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [["group", "treeitem"], ["treeitem"]],
    },
  },
  treegrid: {
    index: 90,
    abstract: false,
    inherited: ["grid", "tree"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [["row"], ["rowgroup", "row"]],
    },
  },
  treeitem: {
    index: 91,
    abstract: false,
    inherited: ["listitem", "option"],
    attributes: {
      supported: ["aria-expanded", "aria-haspopup"],
      required: [],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["contents", "author"],
    },
    parent: {
      required: ["group", "tree"],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  widget: {
    index: 92,
    abstract: true,
    inherited: ["roletype"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: [],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  window: {
    index: 93,
    abstract: true,
    inherited: ["roletype"],
    attributes: {
      supported: ["aria-modal"],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "graphics-document": {
    index: 94,
    abstract: false,
    inherited: ["document"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "graphics-object": {
    index: 95,
    abstract: false,
    inherited: ["group"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author", "contents"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "graphics-symbol": {
    index: 96,
    abstract: false,
    inherited: ["img"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-abstract": {
    index: 97,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-acknowledgments": {
    index: 98,
    abstract: false,
    inherited: ["landmark"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-afterword": {
    index: 99,
    abstract: false,
    inherited: ["landmark"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-appendix": {
    index: 100,
    abstract: false,
    inherited: ["landmark"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-backlink": {
    index: 101,
    abstract: false,
    inherited: ["link"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["contents", "author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-biblioentry": {
    index: 102,
    abstract: false,
    inherited: ["listitem"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: ["doc-bibliography"],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-bibliography": {
    index: 103,
    abstract: false,
    inherited: ["landmark"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [["doc-biblioentry"]],
    },
  },
  "doc-biblioref": {
    index: 104,
    abstract: false,
    inherited: ["link"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["contents", "author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-chapter": {
    index: 105,
    abstract: false,
    inherited: ["landmark"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-colophon": {
    index: 106,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-conclusion": {
    index: 107,
    abstract: false,
    inherited: ["landmark"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-cover": {
    index: 108,
    abstract: false,
    inherited: ["img"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-credit": {
    index: 109,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-credits": {
    index: 110,
    abstract: false,
    inherited: ["landmark"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-dedication": {
    index: 111,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-endnote": {
    index: 112,
    abstract: false,
    inherited: ["listitem"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: ["doc-endnotes"],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-endnotes": {
    index: 113,
    abstract: false,
    inherited: ["landmark"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [["doc-endnote"]],
    },
  },
  "doc-epigraph": {
    index: 114,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-epilogue": {
    index: 115,
    abstract: false,
    inherited: ["landmark"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-errata": {
    index: 116,
    abstract: false,
    inherited: ["landmark"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-example": {
    index: 117,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-footnote": {
    index: 118,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-foreword": {
    index: 119,
    abstract: false,
    inherited: ["landmark"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-glossary": {
    index: 120,
    abstract: false,
    inherited: ["landmark"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [["term", "definition"]],
    },
  },
  "doc-glossref": {
    index: 121,
    abstract: false,
    inherited: ["link"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["contents", "author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-index": {
    index: 122,
    abstract: false,
    inherited: ["navigation"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-introduction": {
    index: 123,
    abstract: false,
    inherited: ["landmark"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-noteref": {
    index: 124,
    abstract: false,
    inherited: ["link"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["contents", "author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-notice": {
    index: 125,
    abstract: false,
    inherited: ["note"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-pagebreak": {
    index: 126,
    abstract: false,
    inherited: ["separator"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-pagelist": {
    index: 127,
    abstract: false,
    inherited: ["navigation"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-part": {
    index: 128,
    abstract: false,
    inherited: ["landmark"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: true,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-preface": {
    index: 129,
    abstract: false,
    inherited: ["landmark"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-prologue": {
    index: 130,
    abstract: false,
    inherited: ["landmark"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-pullquote": {
    index: 131,
    abstract: false,
    inherited: ["none"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-qna": {
    index: 132,
    abstract: false,
    inherited: ["section"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-subtitle": {
    index: 133,
    abstract: false,
    inherited: ["sectionhead"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-tip": {
    index: 134,
    abstract: false,
    inherited: ["note"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
  "doc-toc": {
    index: 135,
    abstract: false,
    inherited: ["navigation"],
    attributes: {
      supported: [],
      required: [],
      defaults: [],
    },
    name: {
      required: false,
      prohibited: false,
      from: ["author"],
    },
    parent: {
      required: [],
    },
    children: {
      presentational: false,
      required: [],
    },
  },
} as const;
