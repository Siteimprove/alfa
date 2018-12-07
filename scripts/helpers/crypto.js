const crypto = require("crypto");

/**
 * @param {string} input
 * @return {string}
 */
function getDigest(input) {
  return crypto
    .createHash("md5")
    .update(input)
    .digest("hex");
}

exports.getDigest = getDigest;
