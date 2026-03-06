export function extractPlaceholders(template: string): string[] {
  const regex = /\[PREENCHER:([^\]]+)\]/g;
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

  for (const [key, value] of Object.entries(values)) {
    const placeholder = `[PREENCHER:${key}]`;
    result = result.replace(new RegExp(placeholder, 'g'), value);
  }

  // Replace any remaining placeholders with empty string
  result = result.replace(/\[PREENCHER:[^\]]+\]/g, '');

  return result;
}
