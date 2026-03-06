function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function extractPlaceholders(template: string): string[] {
  const regex = /\[PREENCHER:\s*([^\]]+?)\s*\]/g;
  const placeholders: string[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    placeholders.push(match[1].trim());
  }

  return placeholders;
}

export function replacePlaceholders(
  template: string,
  values: Record<string, string>
): string {
  let result = template;

  for (const [rawKey, rawValue] of Object.entries(values)) {
    const key = rawKey.trim();
    const value = rawValue ?? '';
    const placeholderRegex = new RegExp(
      `\\[PREENCHER:\\s*${escapeRegExp(key)}\\s*\\]`,
      'g'
    );
    result = result.replace(placeholderRegex, value);
  }

  // Replace any remaining placeholders with empty string
  result = result.replace(/\[PREENCHER:\s*[^\]]+\]/g, '');

  return result;
}
