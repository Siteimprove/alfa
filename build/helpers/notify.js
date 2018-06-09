// @ts-check

const { Signale } = require("signale");
const figures = require("figures");

const notify = new Signale({
  types: {
    skip: {
      badge: figures.ellipsis,
      color: "gray",
      label: "skipped"
    }
  }
});

notify.config({ displayTimestamp: true });

module.exports = { notify };
