/*
 * Fetches placeholder text from the /placeholders.json endpoint.
 * Caches results by prefix to avoid duplicate network requests.
 */

const cache = {};

/**
 * Converts a string to camelCase for use as a JS property name.
 * @param {string} name The string to convert
 * @returns {string} The camelCase string
 */
function toCamelCase(name) {
  return name
    .toLowerCase()
    .replace(/[^0-9a-z]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

/**
 * Fetches placeholder values from /placeholders.json (or a locale-prefixed variant).
 * Returns a key-value map of placeholders for use in block decoration.
 * @param {string} [prefix] Optional locale prefix (e.g. '/us/en')
 * @returns {Promise<Record<string, string>>} A map of placeholder keys to values
 */
// eslint-disable-next-line import/prefer-default-export
export async function fetchPlaceholders(prefix = '') {
  if (cache[prefix]) return cache[prefix];

  const url = `${prefix}/placeholders.json`;
  const resp = await fetch(url);

  const placeholders = {};
  if (resp.ok) {
    const json = await resp.json();
    const data = json.data || json[':names']?.map((name, i) => json[name][i]) || [];
    data.forEach((entry) => {
      if (entry.Key) {
        placeholders[toCamelCase(entry.Key)] = entry.Text || '';
      }
    });
  }

  cache[prefix] = placeholders;
  return placeholders;
}
