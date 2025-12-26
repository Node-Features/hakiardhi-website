/**
 * Document Preview Utilities
 * Handles document thumbnail generation and preview images
 */

/**
 * Get the thumbnail path for a publication
 * Falls back to a placeholder if thumbnail doesn't exist
 */
export const getPublicationThumbnail = (publicationId: string | number, filename?: string): string => {
  // If a specific thumbnail filename is provided, use it
  if (filename) {
    return `/images/publications/thumbnails/${filename}`;
  }

  // Otherwise, generate from publication ID
  return `/images/publications/thumbnails/pub-${publicationId}.jpg`;
};

/**
 * Get fallback images for different document types
 */
export const getDocumentTypeFallback = (type: string): string => {
  const fallbacks: Record<string, string> = {
    'Report': '/images/hero_1.JPG',
    'Policy Brief': '/images/hero_2.JPG',
    'Journal Article': '/images/public_debate_1.JPG',
    'Case Study': '/images/public_debate_2.JPG',
    'Research Paper': '/images/hero_1.JPG',
    'Working Paper': '/images/hero_2.JPG',
  };

  return fallbacks[type] || '/images/hero_1.JPG';
};

/**
 * Generate a thumbnail filename from a PDF filename
 */
export const pdfToThumbnailFilename = (pdfFilename: string): string => {
  return pdfFilename.replace('.pdf', '.jpg').replace('.PDF', '.jpg');
};

/**
 * Check if an image exists (client-side)
 * Returns a promise that resolves to true if image loads successfully
 */
export const imageExists = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

/**
 * Get all possible thumbnail sources in priority order
 */
export const getThumbnailSources = (
  publicationId: string | number,
  type: string,
  customThumbnail?: string
): string[] => {
  const sources: string[] = [];

  // 1. Custom thumbnail (highest priority)
  if (customThumbnail) {
    sources.push(`/images/publications/thumbnails/${customThumbnail}`);
  }

  // 2. Generated thumbnail by ID
  sources.push(`/images/publications/thumbnails/pub-${publicationId}.jpg`);
  sources.push(`/images/publications/thumbnails/pub-${publicationId}.png`);

  // 3. Type-specific fallback
  sources.push(getDocumentTypeFallback(type));

  // 4. Default fallback
  sources.push('/images/hero_1.JPG');

  return sources;
};

/**
 * Instructions for generating thumbnails from PDFs
 * This should be run as a build step or manually
 */
export const THUMBNAIL_GENERATION_GUIDE = `
# How to Generate PDF Thumbnails

## Option 1: Using ImageMagick (Recommended)
\`\`\`bash
# Install ImageMagick
# macOS: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick
# Windows: Download from https://imagemagick.org/

# Generate thumbnail from PDF (first page)
convert -density 300 document.pdf[0] -quality 90 -resize 800x thumbnail.jpg

# Batch convert all PDFs in a directory
for file in *.pdf; do
  convert -density 300 "$file[0]" -quality 90 -resize 800x "\${file%.pdf}.jpg"
done
\`\`\`

## Option 2: Using pdf2image (Python)
\`\`\`python
from pdf2image import convert_from_path

def generate_thumbnail(pdf_path, output_path, dpi=300, width=800):
    images = convert_from_path(pdf_path, dpi=dpi, first_page=1, last_page=1)
    if images:
        images[0].thumbnail((width, width * 1.4))  # Maintain aspect ratio
        images[0].save(output_path, 'JPEG', quality=90)

# Example usage
generate_thumbnail('document.pdf', 'thumbnail.jpg')
\`\`\`

## Option 3: Using Node.js (pdf-thumbnail)
\`\`\`javascript
const fs = require('fs');
const pdf = require('pdf-thumbnail');

async function generateThumbnail(pdfPath, outputPath) {
  const thumbnail = await pdf(fs.readFileSync(pdfPath), {
    width: 800,
    quality: 90
  });
  fs.writeFileSync(outputPath, thumbnail);
}
\`\`\`

## Recommended Directory Structure
\`\`\`
public/
  images/
    publications/
      pdfs/           # Original PDF files
      thumbnails/     # Generated thumbnail images
        pub-1.jpg
        pub-2.jpg
        ...
\`\`\`

## Naming Convention
- Use publication ID: pub-{id}.jpg
- Or use descriptive names matching the PDF filename
- Store in: public/images/publications/thumbnails/
`;
