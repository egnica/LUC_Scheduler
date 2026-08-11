export function parsePhone(description = "") {
  const match = description.match(
    /phone\s*[:\-]?\s*(?:\+?1[\s.-]?)?\(?(\d{3})\)?[\s.-]?(\d{3})[\s.-]?(\d{4})/i,
  );

  if (!match) {
    return null;
  }

  const [, areaCode, prefix, lineNumber] = match;

  return `+1${areaCode}${prefix}${lineNumber}`;
}
