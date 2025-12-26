# Publication Thumbnail Generation Guide

## Overview
This guide explains how to generate high-quality thumbnail images from PDF documents for use in the Research & Publications section.

## Recommended Approach

### Why Pre-generated Thumbnails?
- ⚡ **Instant Loading**: No client-side processing delay
- 🎨 **Consistent Quality**: All thumbnails have uniform appearance
- 📱 **Better UX**: Works reliably across all devices
- 🔍 **SEO Friendly**: Actual images can be indexed by search engines
- 💪 **Performance**: Lower CPU/memory usage on client

## Directory Structure

```
public/
  images/
    publications/
      pdfs/              # Original PDF files
        report-2023.pdf
        policy-brief.pdf
      thumbnails/        # Generated thumbnail images
        pub-1.jpg
        pub-2.jpg
        report-2023.jpg
```

## Method 1: ImageMagick (Recommended for Batch Processing)

### Installation

**macOS:**
```bash
brew install imagemagick
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install imagemagick ghostscript
```

**Windows:**
Download and install from: https://imagemagick.org/script/download.php

### Generate Single Thumbnail

```bash
convert -density 300 input.pdf[0] \
  -quality 90 \
  -resize 800x1120 \
  -gravity center \
  -extent 800x1120 \
  output.jpg
```

**Parameters Explained:**
- `-density 300`: High resolution for crisp text
- `[0]`: First page only
- `-quality 90`: JPEG quality (90 is excellent)
- `-resize 800x1120`: Target size (A4 aspect ratio)
- `-gravity center -extent`: Crop/pad to exact size

### Batch Convert All PDFs

```bash
#!/bin/bash
# Save as: generate-thumbnails.sh

INPUT_DIR="public/images/publications/pdfs"
OUTPUT_DIR="public/images/publications/thumbnails"

mkdir -p "$OUTPUT_DIR"

for pdf in "$INPUT_DIR"/*.pdf; do
  filename=$(basename "$pdf" .pdf)
  echo "Processing: $filename"

  convert -density 300 "$pdf[0]" \
    -quality 90 \
    -resize 800x1120 \
    -gravity center \
    -extent 800x1120 \
    "$OUTPUT_DIR/$filename.jpg"

  echo "✓ Created: $filename.jpg"
done

echo "Done! Generated $(ls -1 "$OUTPUT_DIR" | wc -l) thumbnails"
```

**Run it:**
```bash
chmod +x generate-thumbnails.sh
./generate-thumbnails.sh
```

## Method 2: Python (pdf2image)

### Installation

```bash
pip install pdf2image Pillow
```

**Note:** Also requires `poppler-utils`:
- **macOS**: `brew install poppler`
- **Ubuntu**: `sudo apt-get install poppler-utils`
- **Windows**: Download from http://blog.alivate.com.au/poppler-windows/

### Python Script

```python
# generate_thumbnails.py
import os
from pdf2image import convert_from_path
from PIL import Image

def generate_thumbnail(pdf_path, output_path, width=800, height=1120, dpi=300):
    """Generate a thumbnail from the first page of a PDF"""
    try:
        # Convert first page to image
        images = convert_from_path(
            pdf_path,
            dpi=dpi,
            first_page=1,
            last_page=1
        )

        if images:
            img = images[0]

            # Resize maintaining aspect ratio, then crop to exact size
            img.thumbnail((width, height))

            # Create a white background
            background = Image.new('RGB', (width, height), (255, 255, 255))

            # Paste the thumbnail centered
            offset = ((width - img.width) // 2, (height - img.height) // 2)
            background.paste(img, offset)

            # Save as JPEG
            background.save(output_path, 'JPEG', quality=90, optimize=True)
            print(f"✓ Created: {os.path.basename(output_path)}")
            return True
    except Exception as e:
        print(f"✗ Error processing {pdf_path}: {e}")
        return False

def batch_generate(input_dir, output_dir):
    """Generate thumbnails for all PDFs in a directory"""
    os.makedirs(output_dir, exist_ok=True)

    pdf_files = [f for f in os.listdir(input_dir) if f.lower().endswith('.pdf')]
    print(f"Found {len(pdf_files)} PDF files")

    success_count = 0
    for pdf_file in pdf_files:
        pdf_path = os.path.join(input_dir, pdf_file)
        output_name = pdf_file.replace('.pdf', '.jpg').replace('.PDF', '.jpg')
        output_path = os.path.join(output_dir, output_name)

        if generate_thumbnail(pdf_path, output_path):
            success_count += 1

    print(f"\nDone! Successfully generated {success_count}/{len(pdf_files)} thumbnails")

if __name__ == "__main__":
    INPUT_DIR = "public/images/publications/pdfs"
    OUTPUT_DIR = "public/images/publications/thumbnails"

    batch_generate(INPUT_DIR, OUTPUT_DIR)
```

**Run it:**
```bash
python generate_thumbnails.py
```

## Method 3: Node.js (For Integration into Build Process)

### Installation

```bash
npm install --save-dev pdf-thumbnail sharp
```

### Node.js Script

```javascript
// scripts/generate-thumbnails.js
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-thumbnail');
const sharp = require('sharp');

const INPUT_DIR = path.join(__dirname, '../public/images/publications/pdfs');
const OUTPUT_DIR = path.join(__dirname, '../public/images/publications/thumbnails');

async function generateThumbnail(pdfPath, outputPath) {
  try {
    const pdfBuffer = fs.readFileSync(pdfPath);

    // Generate thumbnail
    const thumbnail = await pdf(pdfBuffer, {
      width: 800,
      quality: 90
    });

    // Process with sharp for better quality
    await sharp(thumbnail)
      .resize(800, 1120, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255 }
      })
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    console.log(`✓ Created: ${path.basename(outputPath)}`);
    return true;
  } catch (error) {
    console.error(`✗ Error processing ${pdfPath}:`, error.message);
    return false;
  }
}

async function batchGenerate() {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const files = fs.readdirSync(INPUT_DIR)
    .filter(f => f.toLowerCase().endsWith('.pdf'));

  console.log(`Found ${files.length} PDF files`);

  let successCount = 0;

  for (const file of files) {
    const pdfPath = path.join(INPUT_DIR, file);
    const outputName = file.replace(/\.pdf$/i, '.jpg');
    const outputPath = path.join(OUTPUT_DIR, outputName);

    if (await generateThumbnail(pdfPath, outputPath)) {
      successCount++;
    }
  }

  console.log(`\nDone! Successfully generated ${successCount}/${files.length} thumbnails`);
}

batchGenerate().catch(console.error);
```

**Add to package.json:**
```json
{
  "scripts": {
    "generate-thumbnails": "node scripts/generate-thumbnails.js"
  }
}
```

**Run it:**
```bash
npm run generate-thumbnails
```

## Naming Convention

### Option 1: By Publication ID (Recommended)
```
pub-1.jpg
pub-2.jpg
pub-3.jpg
```

**Pros:** Clean, consistent, easy to manage

### Option 2: By PDF Filename
```
annual-report-2023.jpg
policy-brief-land-rights.jpg
```

**Pros:** Descriptive, easy to identify

### Option 3: Both
Store with descriptive names, reference by ID in code

## Image Specifications

- **Format:** JPEG (best balance of quality and file size)
- **Dimensions:** 800x1120 pixels (A4 aspect ratio)
- **Quality:** 90% (excellent quality, reasonable file size)
- **DPI:** 300 for source, renders well at display size
- **File Size:** Typically 50-150 KB per thumbnail

## Optimization Tips

### Further Compress Images

```bash
# Using ImageOptim (macOS)
imageoptim public/images/publications/thumbnails/*.jpg

# Using jpegoptim (Linux/macOS)
jpegoptim --max=85 --strip-all public/images/publications/thumbnails/*.jpg

# Using TinyPNG API (cross-platform)
# Sign up at https://tinypng.com/developers
```

### Convert to WebP (Modern Format)

```bash
# Using cwebp
for img in *.jpg; do
  cwebp -q 90 "$img" -o "${img%.jpg}.webp"
done
```

**Update component to support WebP:**
```typescript
const sources = [
  `/images/publications/thumbnails/pub-${publicationId}.webp`,
  `/images/publications/thumbnails/pub-${publicationId}.jpg`,
  // ... fallbacks
];
```

## Updating Publication Data

After generating thumbnails, update your publication data:

```typescript
// src/data/research.tsx
export const publications = [
  {
    id: 1,
    title: 'Annual Report 2023',
    coverImage: 'annual-report-2023.jpg', // Custom thumbnail name
    // ... other fields
  },
  {
    id: 2,
    title: 'Policy Brief',
    // No coverImage - will auto-use pub-2.jpg
    // ... other fields
  },
];
```

## Fallback Strategy

The system uses a smart fallback strategy:

1. **Custom thumbnail** (if specified in data)
2. **Generated thumbnail by ID** (`pub-{id}.jpg`)
3. **Type-specific fallback** (from existing images)
4. **SVG placeholder** (as last resort)

## Automation in CI/CD

### GitHub Actions Example

```yaml
# .github/workflows/generate-thumbnails.yml
name: Generate PDF Thumbnails

on:
  push:
    paths:
      - 'public/images/publications/pdfs/**'

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y imagemagick ghostscript

      - name: Generate thumbnails
        run: |
          chmod +x scripts/generate-thumbnails.sh
          ./scripts/generate-thumbnails.sh

      - name: Commit thumbnails
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add public/images/publications/thumbnails/
          git commit -m "Auto-generate PDF thumbnails" || echo "No changes"
          git push
```

## Troubleshooting

### ImageMagick "not authorized" error

Edit `/etc/ImageMagick-6/policy.xml` (or similar):

```xml
<!-- Change this: -->
<policy domain="coder" rights="none" pattern="PDF" />

<!-- To this: -->
<policy domain="coder" rights="read|write" pattern="PDF" />
```

### Python pdf2image not finding poppler

Set the poppler path explicitly:

```python
images = convert_from_path(
    pdf_path,
    poppler_path='/usr/local/bin'  # Adjust to your path
)
```

### Low quality thumbnails

Increase DPI and size, then resize down:

```bash
convert -density 600 input.pdf[0] \
  -resize 1600x2240 \
  -resize 800x1120 \
  output.jpg
```

## Best Practices

1. ✅ **Generate thumbnails during build/deployment**, not runtime
2. ✅ **Use consistent dimensions** for uniform card layouts
3. ✅ **Optimize file sizes** to improve page load speed
4. ✅ **Version control thumbnails** alongside PDFs
5. ✅ **Automate the process** to avoid manual work
6. ✅ **Test fallbacks** to ensure graceful degradation
7. ✅ **Use descriptive alt text** for accessibility

## Summary

**Recommended workflow:**
1. Add PDFs to `public/images/publications/pdfs/`
2. Run thumbnail generation script
3. Thumbnails appear in `public/images/publications/thumbnails/`
4. Component automatically uses them
5. Fallback to SVG if thumbnail missing

This approach provides the best balance of performance, quality, and maintainability for a production application.
