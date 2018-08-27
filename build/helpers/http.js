/// <reference path="../types/axios.d.ts" />

const axios = require("axios");

/**
 * @param {string} url
 * @return {Promise<string>}
 */
async function fetch(url) {
  const response = await axios.get(url);
  return response.data;
}

exports.fetch = fetch;
