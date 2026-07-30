import pdfParse from 'pdf-parse';
import fs from 'fs';

export async function extractTextFromPdf(filePath: string): Promise<string> {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const parsed = await pdfParse(dataBuffer);
    return parsed.text || '';
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return '';
  }
}
