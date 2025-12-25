# Quick Start Guide - Viewing Flowcharts

## 🚀 Fastest Way to View (No Installation Required)

1. **Go to** https://mermaid.live
2. **Open** any `.mmd` file in this folder with a text editor (Notepad, VS Code, etc.)
3. **Copy** all the text from the file
4. **Paste** it into the Mermaid Live Editor
5. **View** your beautiful flowchart!
6. **Export** as PNG or SVG using the download button

---

## 📥 Convert to Images for PowerPoint

### Step 1: Install Node.js (if not already installed)
- Download from: https://nodejs.org/
- Install the LTS version
- Restart your computer

### Step 2: Install Mermaid CLI
Open Command Prompt (cmd) and run:
```cmd
npm install -g @mermaid-js/mermaid-cli
```

### Step 3: Convert Flowcharts
Simply double-click: **`convert_to_images.bat`**

This will create PNG files for all flowcharts!

---

## 📱 Quick Reference

### For Presentations:
- **Use:** PNG files (after conversion)
- **Insert:** Into PowerPoint, Word, PDF

### For Documentation:
- **Use:** `.mmd` files directly
- **View:** In VS Code with Mermaid extension

### For Web/GitHub:
- **Use:** Embed in markdown files
- **Renders:** Automatically on GitHub

---

## 🎯 Files in This Folder

| File | Description | Best For |
|------|-------------|----------|
| `1_incident_reporting_flow.mmd` | Citizen incident reporting | Community presentations |
| `2_legal_aid_request_flow.mmd` | Legal aid process | Legal team training |
| `3_ai_message_routing.mmd` | AI chatbot logic | Technical docs |
| `4_system_architecture.mmd` | System overview | Stakeholder briefings |
| `5_lawyer_assignment_logic.mmd` | Case assignment algorithm | Process optimization |
| `6_credibility_screening.mmd` | Report validation | Quality control |
| `7_complete_data_flow.mmd` | Technical data flow | Developer onboarding |

---

## ❓ Troubleshooting

**"mmdc is not recognized"**
- Make sure Node.js is installed
- Run: `npm install -g @mermaid-js/mermaid-cli`
- Restart Command Prompt

**"Puppeteer error"**
- Run: `npm install -g puppeteer`
- Try again

**Can't see colors in exported images**
- The colors are defined in the .mmd files
- Use Mermaid Live Editor for best results
- Export as SVG for highest quality

---

## 💡 Tips

1. **For presentations:** Export as SVG (better quality when zooming)
2. **For printing:** Export as PNG at 300 DPI
3. **For editing:** Keep the `.mmd` files and edit them with any text editor
4. **For sharing:** Share both `.mmd` source and PNG exports

---

**Need help?** Check the main README.md file in this folder.
