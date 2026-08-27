/**
 * Minimal, dependency-free RFC 4180 CSV parser.
 *
 * Handles quoted fields, escaped quotes (""), embedded commas/newlines and
 * both LF and CRLF line endings. Kept tiny on purpose: the CMS file is small
 * and shipping a parser library for it would be overkill.
 */

/**
 * Parse CSV text into an array of rows (each row an array of cell strings).
 * @param {string} text
 * @returns {string[][]}
 */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  // Normalise line endings so we only ever deal with "\n".
  const input = String(text).replace(/\r\n?/g, "\n");

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"'; // escaped quote
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  // Flush whatever is left in the buffer.
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // Drop blank lines.
  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ""));
}

/**
 * Parse CSV text into objects keyed by the header row.
 * Header names are lower-cased and trimmed so the CSV is forgiving to edit.
 * @param {string} text
 * @returns {Record<string, string>[]}
 */
export function parseCsvToObjects(text) {
  const [header, ...body] = parseCsv(text);
  if (!header) return [];

  const keys = header.map((key) => key.trim().toLowerCase());

  return body.map((cells) => {
    /** @type {Record<string, string>} */
    const record = {};
    keys.forEach((key, index) => {
      record[key] = (cells[index] ?? "").trim();
    });
    return record;
  });
}
