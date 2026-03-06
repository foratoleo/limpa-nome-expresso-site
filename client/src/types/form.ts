export interface FormField {
  id: string;
  templateKey?: string;
  label: string;
  type: 'text' | 'number' | 'currency' | 'date' | 'textarea';
  placeholder: string;
  required: boolean;
  section: string;
  preFillFrom?: 'email' | 'name' | 'phone' | 'cpf';
  maxLength?: number;
  validation?: {
    pattern?: RegExp;
    custom?: (value: string) => boolean;
    errorMessage: string;
  };
}

export type FieldValueType = string | number | Date;

export interface FormValues {
  [fieldId: string]: FieldValueType;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  isExpanded?: boolean;
}

/**
 * PDF generation options
 */
export interface PDFGenerateOptions {
  /** Template content with placeholders */
  template: string;
  /** Form values to replace placeholders with */
  values: Record<string, string>;
  /** Output filename (without .pdf extension) */
  filename: string;
  /** Optional: success callback */
  onSuccess?: () => void;
  /** Optional: error callback */
  onError?: (error: Error) => void;
  /** Optional: progress callback during generation */
  onProgress?: (progress: number) => void;
}
