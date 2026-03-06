export async function fetchTemplate(templatePath: string): Promise<string> {
  try {
    const response = await fetch(templatePath);
    if (!response.ok) {
      throw new Error(`Template not found: ${templatePath}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Failed to fetch template:', error);
    throw error;
  }
}
