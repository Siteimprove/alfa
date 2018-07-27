import axios from "axios";

/**
 * @param {string} url
 * @return {Promise<string>}
 */
export async function fetch(url) {
  const response = await axios.get(url);
  return response.data;
}
