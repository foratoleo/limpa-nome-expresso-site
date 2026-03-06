import type { FormField, FormSection, FormValues } from "@/types/form";

const PLACEHOLDER_REGEX = /\[PREENCHER:\s*([^\]]+?)\s*\]/g;
const HEADING_REGEX = /^#{2,3}\s+(.+?)\s*$/;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function inferFieldType(placeholder: string): FormField["type"] {
  const normalized = placeholder.toLowerCase();

  if (
    normalized.includes("descreva") ||
    normalized.includes("repita o prejuizo") ||
    normalized.includes("repita o prejuízo")
  ) {
    return "textarea";
  }

  if (normalized.startsWith("dia")) {
    return "number";
  }

  if (normalized.includes("data")) {
    return "date";
  }

  if (normalized.includes("valor") || normalized.includes("r$")) {
    return "currency";
  }

  return "text";
}

function inferPreFillFrom(placeholder: string): FormField["preFillFrom"] | undefined {
  const normalized = placeholder.toLowerCase();

  if (normalized.includes("email") || normalized.includes("e-mail")) {
    return "email";
  }

  if (normalized.includes("cpf")) {
    return "cpf";
  }

  if (normalized.includes("telefone") || normalized.includes("celular")) {
    return "phone";
  }

  if (normalized.includes("nome completo")) {
    return "name";
  }

  return undefined;
}

function inferValidation(placeholder: string): FormField["validation"] | undefined {
  const normalized = placeholder.toLowerCase();

  if (normalized.includes("cpf")) {
    return {
      pattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
      errorMessage: "CPF inválido. Use o formato: 000.000.000-00",
    };
  }

  if (normalized.includes("cnpj")) {
    return {
      pattern: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
      errorMessage: "CNPJ inválido. Use o formato: 00.000.000/0001-00",
    };
  }

  if (normalized.includes("email") || normalized.includes("e-mail")) {
    return {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      errorMessage: "E-mail inválido",
    };
  }

  if (normalized.includes("telefone")) {
    return {
      pattern: /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/,
      errorMessage: "Telefone inválido. Exemplo: (11) 91234-5678",
    };
  }

  return undefined;
}

function ensureSection(
  sections: FormSection[],
  sectionById: Map<string, FormSection>,
  sectionTitle: string
): FormSection {
  const sectionId = slugify(sectionTitle) || "dados_principais";
  const existing = sectionById.get(sectionId);
  if (existing) return existing;

  const created: FormSection = {
    id: sectionId,
    title: sectionTitle,
    fields: [],
    isExpanded: sections.length === 0,
  };
  sections.push(created);
  sectionById.set(sectionId, created);
  return created;
}

export function buildFormSchemaFromTemplate(
  template: string,
  fallbackSectionTitle = "Campos da Petição"
): FormSection[] {
  const sections: FormSection[] = [];
  const sectionById = new Map<string, FormSection>();
  const usedPlaceholders = new Set<string>();
  const idCount = new Map<string, number>();
  let currentSectionTitle = fallbackSectionTitle;

  for (const line of template.split("\n")) {
    const headingMatch = line.match(HEADING_REGEX);
    if (headingMatch) {
      currentSectionTitle = headingMatch[1].trim();
    }

    const matches = [...line.matchAll(PLACEHOLDER_REGEX)];
    if (matches.length === 0) continue;

    const section = ensureSection(sections, sectionById, currentSectionTitle);

    for (const match of matches) {
      const placeholderText = match[1].trim();
      if (!placeholderText || usedPlaceholders.has(placeholderText)) continue;

      usedPlaceholders.add(placeholderText);

      const baseId = slugify(placeholderText) || "campo";
      const count = (idCount.get(baseId) || 0) + 1;
      idCount.set(baseId, count);
      const fieldId = count === 1 ? baseId : `${baseId}_${count}`;
      const fieldType = inferFieldType(placeholderText);

      section.fields.push({
        id: fieldId,
        templateKey: placeholderText,
        label: placeholderText,
        type: fieldType,
        placeholder: `[PREENCHER: ${placeholderText}]`,
        required: true,
        section: section.id,
        preFillFrom: inferPreFillFrom(placeholderText),
        maxLength: fieldType === "textarea" ? 700 : 220,
        validation: inferValidation(placeholderText),
      });
    }
  }

  if (sections.length > 0) {
    return sections;
  }

  const placeholders = [...template.matchAll(PLACEHOLDER_REGEX)].map((match) => match[1].trim());
  if (placeholders.length === 0) {
    return [];
  }

  const fallback = ensureSection(sections, sectionById, fallbackSectionTitle);
  for (const placeholderText of placeholders) {
    if (!placeholderText || usedPlaceholders.has(placeholderText)) continue;
    usedPlaceholders.add(placeholderText);

    fallback.fields.push({
      id: slugify(placeholderText) || `campo_${fallback.fields.length + 1}`,
      templateKey: placeholderText,
      label: placeholderText,
      type: inferFieldType(placeholderText),
      placeholder: `[PREENCHER: ${placeholderText}]`,
      required: true,
      section: fallback.id,
      preFillFrom: inferPreFillFrom(placeholderText),
      maxLength: 220,
      validation: inferValidation(placeholderText),
    });
  }

  return sections;
}

export function mapFormValuesToTemplateValues(
  values: FormValues,
  schema: FormSection[]
): Record<string, string> {
  const mapped: Record<string, string> = {};

  for (const section of schema) {
    for (const field of section.fields) {
      const templateKey = field.templateKey || field.id;
      const value = values[field.id];
      mapped[templateKey] = value == null ? "" : String(value);
    }
  }

  return mapped;
}
