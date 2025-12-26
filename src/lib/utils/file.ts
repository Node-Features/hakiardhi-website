/**
 * File utility functions for LARRRI Admin Portal
 */

/**
 * Convert File to base64 string
 * @param file - File object to convert
 * @returns Promise that resolves to base64 string (without data URL prefix)
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

/**
 * Convert File to base64 with data URL prefix
 * @param file - File object to convert
 * @returns Promise that resolves to complete data URL
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Convert base64 string to Blob
 * @param base64 - Base64 string
 * @param mimeType - MIME type of the file
 * @returns Blob object
 */
export function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Download file from base64 string
 * @param base64 - Base64 string
 * @param fileName - Name for downloaded file
 * @param mimeType - MIME type of the file
 */
export function downloadBase64File(base64: string, fileName: string, mimeType: string): void {
  const blob = base64ToBlob(base64, mimeType);
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Download file from URL
 * @param url - File URL
 * @param fileName - Name for downloaded file
 */
export function downloadFile(url: string, fileName: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Get file extension from filename
 * @param fileName - File name
 * @returns File extension (lowercase, without dot)
 */
export function getFileExtension(fileName: string): string {
  if (!fileName) return '';

  const parts = fileName.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

/**
 * Get MIME type from file extension
 * @param extension - File extension
 * @returns MIME type
 */
export function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',

    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

    // Text
    txt: 'text/plain',
    csv: 'text/csv',

    // Archives
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',

    // Video
    mp4: 'video/mp4',
    avi: 'video/x-msvideo',
    mov: 'video/quicktime',
  };

  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

/**
 * Check if file is an image
 * @param file - File object or MIME type string
 * @returns Boolean indicating if file is an image
 */
export function isImage(file: File | string): boolean {
  const mimeType = typeof file === 'string' ? file : file.type;
  return mimeType.startsWith('image/');
}

/**
 * Check if file is a PDF
 * @param file - File object or MIME type string
 * @returns Boolean indicating if file is a PDF
 */
export function isPDF(file: File | string): boolean {
  const mimeType = typeof file === 'string' ? file : file.type;
  return mimeType === 'application/pdf';
}

/**
 * Check if file is a video
 * @param file - File object or MIME type string
 * @returns Boolean indicating if file is a video
 */
export function isVideo(file: File | string): boolean {
  const mimeType = typeof file === 'string' ? file : file.type;
  return mimeType.startsWith('video/');
}

/**
 * Compress image file
 * @param file - Image file to compress
 * @param maxWidth - Maximum width
 * @param maxHeight - Maximum height
 * @param quality - JPEG quality (0-1)
 * @returns Promise that resolves to compressed file
 */
export function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    if (!isImage(file)) {
      reject(new Error('File is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}

/**
 * Create image preview URL
 * @param file - File object
 * @returns Promise that resolves to object URL
 */
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!isImage(file)) {
      reject(new Error('File is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Revoke object URL to free memory
 * @param url - Object URL to revoke
 */
export function revokeObjectURL(url: string): void {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

/**
 * Generate CSV content from array of objects
 * @param data - Array of objects to convert to CSV
 * @param headers - Array of header labels (optional)
 * @returns CSV string
 */
export function arrayToCSV(data: Record<string, any>[], headers?: string[]): string {
  if (data.length === 0) return '';

  const keys = headers || Object.keys(data[0]);
  const csvRows: string[] = [];

  // Add header row
  csvRows.push(keys.join(','));

  // Add data rows
  for (const row of data) {
    const values = keys.map(key => {
      const value = row[key] ?? '';
      // Escape values containing commas, quotes, or newlines
      const escaped = String(value).replace(/"/g, '""');
      return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

/**
 * Parse CSV string to array of objects
 * @param csvContent - CSV string to parse
 * @returns Array of objects
 */
export function parseCSV(csvContent: string): Record<string, string>[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const data: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index].trim();
      });
      data.push(row);
    }
  }

  return data;
}

/**
 * Parse a single CSV line handling quoted values
 * @param line - CSV line to parse
 * @returns Array of values
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

/**
 * Download CSV file
 * @param data - Array of objects to export
 * @param fileName - Name for downloaded file
 * @param headers - Optional custom headers
 */
export function downloadCSV(
  data: Record<string, any>[],
  fileName: string,
  headers?: string[]
): void {
  const csvContent = arrayToCSV(data, headers);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Read CSV file
 * @param file - File object to read
 * @returns Promise that resolves to parsed data
 */
export function readCSVFile(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const csvContent = event.target?.result as string;
        const data = parseCSV(csvContent);
        resolve(data);
      } catch (error) {
        reject(new Error('Failed to parse CSV file'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
