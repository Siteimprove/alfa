// This file has been automatically generated based on the various WAI-ARIA
// specifications. Do therefore not modify it directly! If you wish to make
// changes, do so in `scripts/roles.js` and run `yarn generate` to rebuild this
// file.

export type Roles = typeof Roles;

export const Roles = {
  alert: {
    abstract: false,
    inherited: ["section"],
    attributes: [
      [
        "aria-atomic",
        {
          required: false,
          value: "true",
        },
      ],
      [
        "aria-live",
        {
          required: false,
          value: "assertive",
        },
      ],
    ],
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
    abstract: false,
    inherited: ["alert", "dialog"],
    attributes: [],
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
    abstract: false,
    inherited: ["structure"],
    attributes: [
      [
        "aria-activedescendant",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-disabled",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-errormessage",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-expanded",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-haspopup",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-invalid",
        {
          required: false,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["document"],
    attributes: [
      [
        "aria-posinset",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-setsize",
        {
          required: false,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["landmark"],
    attributes: [],
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
    abstract: false,
    inherited: ["section"],
    attributes: [],
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
    abstract: false,
    inherited: ["command"],
    attributes: [
      [
        "aria-disabled",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-expanded",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-haspopup",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-pressed",
        {
          required: false,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["section"],
    attributes: [],
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
    abstract: false,
    inherited: ["section"],
    attributes: [
      [
        "aria-colindex",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-colspan",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-rowindex",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-rowspan",
        {
          required: false,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["input"],
    attributes: [
      [
        "aria-checked",
        {
          required: true,
          value: null,
        },
      ],
      [
        "aria-errormessage",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-expanded",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-invalid",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-readonly",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-required",
        {
          required: false,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["section"],
    attributes: [],
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
    abstract: false,
    inherited: ["cell", "gridcell", "sectionhead"],
    attributes: [
      [
        "aria-sort",
        {
          required: false,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["input"],
    attributes: [
      [
        "aria-activedescendant",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-autocomplete",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-controls",
        {
          required: true,
          value: null,
        },
      ],
      [
        "aria-errormessage",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-expanded",
        {
          required: true,
          value: "false",
        },
      ],
      [
        "aria-haspopup",
        {
          required: false,
          value: "listbox",
        },
      ],
      [
        "aria-invalid",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-readonly",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-required",
        {
          required: false,
          value: null,
        },
      ],
    ],
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
    abstract: true,
    inherited: ["widget"],
    attributes: [],
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
    abstract: false,
    inherited: ["landmark"],
    attributes: [],
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
    abstract: true,
    inherited: ["widget"],
    attributes: [
      [
        "aria-activedescendant",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-disabled",
        {
          required: false,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["landmark"],
    attributes: [],
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
    abstract: false,
    inherited: ["section"],
    attributes: [],
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
    abstract: false,
    inherited: ["section"],
    attributes: [],
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
    abstract: false,
    inherited: ["window"],
    attributes: [],
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
    abstract: false,
    inherited: ["list"],
    attributes: [],
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
    abstract: false,
    inherited: ["structure"],
    attributes: [],
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
    abstract: false,
    inherited: ["section"],
    attributes: [],
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
    abstract: false,
    inherited: ["list"],
    attributes: [],
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
    abstract: false,
    inherited: ["section"],
    attributes: [],
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
    abstract: false,
    inherited: ["landmark"],
    attributes: [],
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
    abstract: false,
    inherited: ["structure"],
    attributes: [],
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
    abstract: false,
    inherited: ["composite", "table"],
    attributes: [
      [
        "aria-multiselectable",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-readonly",
        {
          required: false,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["cell", "widget"],
    attributes: [
      [
        "aria-disabled",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-errormessage",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-expanded",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-haspopup",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-invalid",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-readonly",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-required",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-selected",
        {
          required: false,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["section"],
    attributes: [
      [
        "aria-activedescendant",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-disabled",
        {
          required: false,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["sectionhead"],
    attributes: [
      [
        "aria-level",
        {
          required: true,
          value: "2",
        },
      ],
    ],
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
    abstract: false,
    inherited: ["section"],
    attributes: [],
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
    abstract: true,
    inherited: ["widget"],
    attributes: [
      [
        "aria-disabled",
        {
          required: false,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["section"],
    attributes: [],
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
    abstract: true,
    inherited: ["section"],
    attributes: [],
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
    abstract: false,
    inherited: ["command"],
    attributes: [
      [
        "aria-disabled",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-expanded",
        {
          required: false,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["section"],
    attributes: [],
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
    abstract: false,
    inherited: ["select"],
    attributes: [
      [
        "aria-errormessage",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-expanded",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-invalid",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-multiselectable",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-orientation",
        {
          required: false,
          value: "vertical",
        },
      ],
      [
        "aria-readonly",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-required",
        {
          required: false,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["section"],
    attributes: [
      [
        "aria-level",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-posinset",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-setsize",
        {
          required: false,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["section"],
    attributes: [
      [
        "aria-live",
        {
          required: false,
          value: "polite",
        },
      ],
    ],
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
    abstract: false,
    inherited: ["landmark"],
    attributes: [],
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
    abstract: false,
    inherited: ["section"],
    attributes: [],
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
    abstract: false,
    inherited: ["section"],
    attributes: [],
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
    abstract: false,
    inherited: ["range"],
    attributes: [
      [
        "aria-valuemax",
        {
          required: true,
          value: null,
        },
      ],
      [
        "aria-valuemin",
        {
          required: true,
          value: null,
        },
      ],
      [
        "aria-valuenow",
        {
          required: true,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["select"],
    attributes: [
      [
        "aria-orientation",
        {
          required: false,
          value: "vertical",
        },
      ],
    ],
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
    abstract: false,
    inherited: ["menu"],
    attributes: [
      [
        "aria-orientation",
        {
          required: false,
          value: "horizontal",
        },
      ],
    ],
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
    abstract: false,
    inherited: ["command"],
    attributes: [
      [
        "aria-disabled",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-expanded",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-haspopup",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-posinset",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-setsize",
        {
          required: false,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["checkbox", "menuitem"],
    attributes: [],
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
    abstract: false,
    inherited: ["menuitemcheckbox", "radio"],
    attributes: [],
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
    abstract: false,
    inherited: ["landmark"],
    attributes: [],
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
    abstract: false,
    inherited: [],
    attributes: [],
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
    abstract: false,
    inherited: ["section"],
    attributes: [],
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
    abstract: false,
    inherited: ["input"],
    attributes: [
      [
        "aria-checked",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-posinset",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-selected",
        {
          required: true,
          value: "false",
        },
      ],
      [
        "aria-setsize",
        {
          required: false,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["section"],
    attributes: [],
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
    abstract: false,
    inherited: ["structure"],
    attributes: [],
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
    abstract: false,
    inherited: ["range", "widget", "status"],
    attributes: [],
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
    abstract: false,
    inherited: ["input"],
    attributes: [
      [
        "aria-checked",
        {
          required: true,
          value: null,
        },
      ],
      [
        "aria-posinset",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-setsize",
        {
          required: false,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["select"],
    attributes: [
      [
        "aria-errormessage",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-invalid",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-readonly",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-required",
        {
          required: false,
          value: null,
        },
      ],
    ],
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
    abstract: true,
    inherited: ["structure"],
    attributes: [
      [
        "aria-valuemax",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-valuemin",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-valuenow",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-valuetext",
        {
          required: false,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["landmark"],
    attributes: [],
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
    abstract: true,
    inherited: [],
    attributes: [
      [
        "aria-atomic",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-busy",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-controls",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-current",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-describedby",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-details",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-dropeffect",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-flowto",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-grabbed",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-hidden",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-keyshortcuts",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-label",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-labelledby",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-live",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-owns",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-relevant",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-roledescription",
        {
          required: false,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["group", "widget"],
    attributes: [
      [
        "aria-colindex",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-expanded",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-level",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-posinset",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-rowindex",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-selected",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-setsize",
        {
          required: false,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["structure"],
    attributes: [],
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
    abstract: false,
    inherited: ["cell", "gridcell", "sectionhead"],
    attributes: [
      [
        "aria-expanded",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-sort",
        {
          required: false,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["range", "widget"],
    attributes: [
      [
        "aria-controls",
        {
          required: true,
          value: null,
        },
      ],
      [
        "aria-disabled",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-orientation",
        {
          required: false,
          value: "vertical",
        },
      ],
      [
        "aria-valuemax",
        {
          required: false,
          value: "100",
        },
      ],
      [
        "aria-valuemin",
        {
          required: false,
          value: "0",
        },
      ],
      [
        "aria-valuenow",
        {
          required: true,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["landmark"],
    attributes: [],
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
    abstract: false,
    inherited: ["textbox"],
    attributes: [],
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
    abstract: true,
    inherited: ["structure"],
    attributes: [],
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
    abstract: true,
    inherited: ["structure"],
    attributes: [],
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
    abstract: true,
    inherited: ["composite", "group"],
    attributes: [
      [
        "aria-orientation",
        {
          required: false,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["structure", "widget"],
    attributes: [
      [
        "aria-disabled",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-orientation",
        {
          required: false,
          value: "horizontal",
        },
      ],
      [
        "aria-valuemax",
        {
          required: false,
          value: "100",
        },
      ],
      [
        "aria-valuemin",
        {
          required: false,
          value: "0",
        },
      ],
      [
        "aria-valuenow",
        {
          required: true,
          value: null,
        },
      ],
      [
        "aria-valuetext",
        {
          required: false,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["input", "range"],
    attributes: [
      [
        "aria-errormessage",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-haspopup",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-invalid",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-orientation",
        {
          required: false,
          value: "horizontal",
        },
      ],
      [
        "aria-readonly",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-valuemax",
        {
          required: false,
          value: "100",
        },
      ],
      [
        "aria-valuemin",
        {
          required: false,
          value: "0",
        },
      ],
      [
        "aria-valuenow",
        {
          required: true,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["composite", "input", "range"],
    attributes: [
      [
        "aria-errormessage",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-invalid",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-readonly",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-required",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-valuemax",
        {
          required: false,
          value: "",
        },
      ],
      [
        "aria-valuemin",
        {
          required: false,
          value: "",
        },
      ],
      [
        "aria-valuenow",
        {
          required: false,
          value: "0",
        },
      ],
      [
        "aria-valuetext",
        {
          required: false,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["section"],
    attributes: [
      [
        "aria-atomic",
        {
          required: false,
          value: "true",
        },
      ],
      [
        "aria-live",
        {
          required: false,
          value: "polite",
        },
      ],
    ],
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
    abstract: false,
    inherited: ["section"],
    attributes: [],
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
    abstract: true,
    inherited: ["roletype"],
    attributes: [],
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
    abstract: false,
    inherited: ["section"],
    attributes: [],
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
    abstract: false,
    inherited: ["section"],
    attributes: [],
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
    abstract: false,
    inherited: ["checkbox"],
    attributes: [
      [
        "aria-checked",
        {
          required: true,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["sectionhead", "widget"],
    attributes: [
      [
        "aria-disabled",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-expanded",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-haspopup",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-posinset",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-selected",
        {
          required: false,
          value: "false",
        },
      ],
      [
        "aria-setsize",
        {
          required: false,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["section"],
    attributes: [
      [
        "aria-colcount",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-rowcount",
        {
          required: false,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["composite"],
    attributes: [
      [
        "aria-level",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-multiselectable",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-orientation",
        {
          required: false,
          value: "horizontal",
        },
      ],
    ],
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
    abstract: false,
    inherited: ["section"],
    attributes: [],
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
    abstract: false,
    inherited: ["section"],
    attributes: [],
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
    abstract: false,
    inherited: ["input"],
    attributes: [
      [
        "aria-activedescendant",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-autocomplete",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-errormessage",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-haspopup",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-invalid",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-multiline",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-placeholder",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-readonly",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-required",
        {
          required: false,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["section"],
    attributes: [],
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
    abstract: false,
    inherited: ["status"],
    attributes: [],
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
    abstract: false,
    inherited: ["group"],
    attributes: [
      [
        "aria-orientation",
        {
          required: false,
          value: "horizontal",
        },
      ],
    ],
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
    abstract: false,
    inherited: ["section"],
    attributes: [],
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
    abstract: false,
    inherited: ["select"],
    attributes: [
      [
        "aria-errormessage",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-invalid",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-multiselectable",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-orientation",
        {
          required: false,
          value: "vertical",
        },
      ],
      [
        "aria-required",
        {
          required: false,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["grid", "tree"],
    attributes: [],
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
    abstract: false,
    inherited: ["listitem", "option"],
    attributes: [
      [
        "aria-expanded",
        {
          required: false,
          value: null,
        },
      ],
      [
        "aria-haspopup",
        {
          required: false,
          value: null,
        },
      ],
    ],
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
    abstract: true,
    inherited: ["roletype"],
    attributes: [],
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
    abstract: true,
    inherited: ["roletype"],
    attributes: [
      [
        "aria-modal",
        {
          required: false,
          value: null,
        },
      ],
    ],
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
    abstract: false,
    inherited: ["document"],
    attributes: [],
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
    abstract: false,
    inherited: ["group"],
    attributes: [],
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
    abstract: false,
    inherited: ["img"],
    attributes: [],
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
    abstract: false,
    inherited: ["section"],
    attributes: [],
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
    abstract: false,
    inherited: ["landmark"],
    attributes: [],
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
    abstract: false,
    inherited: ["landmark"],
    attributes: [],
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
    abstract: false,
    inherited: ["landmark"],
    attributes: [],
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
    abstract: false,
    inherited: ["link"],
    attributes: [],
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
    abstract: false,
    inherited: ["listitem"],
    attributes: [],
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
    abstract: false,
    inherited: ["landmark"],
    attributes: [],
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
    abstract: false,
    inherited: ["link"],
    attributes: [],
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
    abstract: false,
    inherited: ["landmark"],
    attributes: [],
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
    abstract: false,
    inherited: ["section"],
    attributes: [],
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
    abstract: false,
    inherited: ["landmark"],
    attributes: [],
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
    abstract: false,
    inherited: ["img"],
    attributes: [],
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
    abstract: false,
    inherited: ["section"],
    attributes: [],
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
    abstract: false,
    inherited: ["landmark"],
    attributes: [],
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
    abstract: false,
    inherited: ["section"],
    attributes: [],
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
    abstract: false,
    inherited: ["listitem"],
    attributes: [],
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
    abstract: false,
    inherited: ["landmark"],
    attributes: [],
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
    abstract: false,
    inherited: ["section"],
    attributes: [],
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
    abstract: false,
    inherited: ["landmark"],
    attributes: [],
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
    abstract: false,
    inherited: ["landmark"],
    attributes: [],
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
    abstract: false,
    inherited: ["section"],
    attributes: [],
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
    abstract: false,
    inherited: ["section"],
    attributes: [],
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
    abstract: false,
    inherited: ["landmark"],
    attributes: [],
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
    abstract: false,
    inherited: ["landmark"],
    attributes: [],
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
    abstract: false,
    inherited: ["link"],
    attributes: [],
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
    abstract: false,
    inherited: ["navigation"],
    attributes: [],
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
    abstract: false,
    inherited: ["landmark"],
    attributes: [],
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
    abstract: false,
    inherited: ["link"],
    attributes: [],
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
    abstract: false,
    inherited: ["note"],
    attributes: [],
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
    abstract: false,
    inherited: ["separator"],
    attributes: [],
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
    abstract: false,
    inherited: ["navigation"],
    attributes: [],
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
    abstract: false,
    inherited: ["landmark"],
    attributes: [],
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
    abstract: false,
    inherited: ["landmark"],
    attributes: [],
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
    abstract: false,
    inherited: ["landmark"],
    attributes: [],
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
    abstract: false,
    inherited: ["none"],
    attributes: [],
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
    abstract: false,
    inherited: ["section"],
    attributes: [],
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
    abstract: false,
    inherited: ["sectionhead"],
    attributes: [],
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
    abstract: false,
    inherited: ["note"],
    attributes: [],
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
    abstract: false,
    inherited: ["navigation"],
    attributes: [],
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
