/**
 * PDF Generator Utility
 *
 * Client-side PDF generation using jsPDF library.
 * Converts markdown template with replaced placeholders to downloadable PDF.
 *
 * @example
 * ```ts
 * await generatePDF({
 *   template: templateContent,
 *   values: formValues,
 *   filename: 'peticao_inicial_jec_sp',
 *   onSuccess: () => toast.success('PDF gerado!'),
 *   onError: (error) => toast.error(error.message),
 * });
 * ```
 */

import { jsPDF } from 'jspdf';
import type { PDFGenerateOptions } from '../types/form';

/**
 * Simple markdown to text converter
 * Converts basic markdown formatting to plain text with line breaks
 */
function markdownToText(markdown: string): string {
  let text = markdown;

  // Remove markdown headers
  text = text.replace(/^#{1,6}\s+/gm, '');

  // Remove bold/italic markers
  text = text.replace(/\*\*\*/g, '');
  text = text.replace(/\*\*/g, '');
  text = text.replace(/\*/g, '');
  text = text.replace(/___/g, '');
  text = text.replace(/__/g, '');
  text = text.replace(/_/g, '');

  // Remove links but keep text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Convert horizontal rules to line breaks
  text = text.replace(/^---+$/gm, '\n' + '─'.repeat(50) + '\n');

  // Convert blockquotes
  text = text.replace(/^>\s+/gm, '"');

  // Remove extra line breaks but preserve paragraph breaks
  text = text.replace(/\n{3,}/g, '\n\n');

  return text;
}

/**
 * Split text into pages that fit within PDF margins
 */
function splitIntoPages(
  text: string,
  maxWidth: number,
  maxHeight: number,
  fontSize: number,
  lineHeight: number
): string[] {
  const pages: string[] = [];
  const lines = text.split('\n');
  let currentPage = '';
  let currentHeight = 0;

  // Approximate character width (varies by font, this is conservative)
  const charWidth = fontSize * 0.5;
  const maxCharsPerLine = Math.floor(maxWidth / charWidth);

  for (const line of lines) {
    // Split long lines into multiple lines
    const wrappedLines: string[] = [];
    let remainingLine = line;

    while (remainingLine.length > maxCharsPerLine) {
      wrappedLines.push(remainingLine.substring(0, maxCharsPerLine));
      remainingLine = remainingLine.substring(maxCharsPerLine);
    }
    wrappedLines.push(remainingLine);

    for (const wrappedLine of wrappedLines) {
      const lineHeightPx = lineHeight * fontSize;

      if (currentHeight + lineHeightPx > maxHeight) {
        // Start new page
        pages.push(currentPage.trim());
        currentPage = wrappedLine + '\n';
        currentHeight = lineHeightPx;
      } else {
        currentPage += wrappedLine + '\n';
        currentHeight += lineHeightPx;
      }
    }
  }

  // Add last page if it has content
  if (currentPage.trim()) {
    pages.push(currentPage.trim());
  }

  return pages.length > 0 ? pages : [''];
}

/**
 * Generate PDF from template and form values
 */
export async function generatePDF(options: PDFGenerateOptions): Promise<void> {
  const {
    template,
    values,
    filename,
    onSuccess,
    onError,
    onProgress,
  } = options;

  try {
    // Step 1: Replace placeholders in template
    if (onProgress) onProgress(10);

    const { replacePlaceholders } = await import('./templateParser');
    const filledTemplate = replacePlaceholders(template, values);

    // Step 2: Convert markdown to plain text
    if (onProgress) onProgress(30);

    const textContent = markdownToText(filledTemplate);

    // Step 3: Create PDF document
    if (onProgress) onProgress(50);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // PDF dimensions (A4)
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    const maxHeight = pageHeight - 2 * margin;

    // Font settings
    const fontSize = 12;
    const lineHeight = 1.5;

    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', 'normal');

    // Step 4: Split content into pages
    if (onProgress) onProgress(70);

    const pages = splitIntoPages(textContent, maxWidth, maxHeight, fontSize, lineHeight);

    // Step 5: Add pages to PDF
    if (onProgress) onProgress(85);

    pages.forEach((pageContent, index) => {
      if (index > 0) {
        pdf.addPage();
      }

      // Add text to page
      const lines = pageContent.split('\n');
      let yPosition = margin;

      lines.forEach(line => {
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight * fontSize * 0.35; // Convert to mm
      });
    });

    // Step 6: Generate filename with CPF if available
    if (onProgress) onProgress(95);

    const cpf = values.cpf || values.cpf_assinatura || '';
    const safeFilename = cpf
      ? `${filename}_${cpf}.pdf`
      : `${filename}.pdf`;

    // Step 7: Save PDF
    if (onProgress) onProgress(100);

    pdf.save(safeFilename);

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    const pdfError = error instanceof Error
      ? error
      : new Error('Erro ao gerar PDF');

    if (onError) {
      onError(pdfError);
    } else {
      console.error('PDF generation error:', pdfError);
      throw pdfError;
    }
  }
}

/**
 * Generate PDF from markdown content directly
 * Simpler version that doesn't use template replacement
 */
export async function generatePDFFromMarkdown(
  markdown: string,
  filename: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  try {
    if (onProgress) onProgress(20);

    const textContent = markdownToText(markdown);

    if (onProgress) onProgress(50);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    const maxHeight = pageHeight - 2 * margin;

    const fontSize = 12;
    const lineHeight = 1.5;

    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', 'normal');

    if (onProgress) onProgress(70);

    const pages = splitIntoPages(textContent, maxWidth, maxHeight, fontSize, lineHeight);

    if (onProgress) onProgress(85);

    pages.forEach((pageContent, index) => {
      if (index > 0) {
        pdf.addPage();
      }

      const lines = pageContent.split('\n');
      let yPosition = margin;

      lines.forEach(line => {
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight * fontSize * 0.35;
      });
    });

    if (onProgress) onProgress(100);

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    const pdfError = error instanceof Error
      ? error
      : new Error('Erro ao gerar PDF a partir de markdown');
    console.error('PDF generation error:', pdfError);
    throw pdfError;
  }
}

export default generatePDF;
