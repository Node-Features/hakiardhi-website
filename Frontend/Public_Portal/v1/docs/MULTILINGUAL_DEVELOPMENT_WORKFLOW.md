# Multilingual Feature Development Workflow

This document outlines the standard development workflow, team structure, tools, and processes used by experienced developers to build and maintain multilingual software applications.

---

## Table of Contents

1. [Development Phases](#development-phases)
2. [Team Structure & Roles](#team-structure--roles)
3. [Development Workflow](#development-workflow)
4. [Translation Management System](#translation-management-system)
5. [Code Architecture Patterns](#code-architecture-patterns)
6. [CI/CD Integration](#cicd-integration)
7. [Quality Assurance Process](#quality-assurance-process)
8. [Maintenance & Updates](#maintenance--updates)

---

## Development Phases

### Phase Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    MULTILINGUAL DEVELOPMENT LIFECYCLE           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Phase 1        Phase 2        Phase 3        Phase 4           │
│  ─────────      ─────────      ─────────      ─────────         │
│  Foundation     Extraction     Translation    Integration       │
│  (1-2 weeks)    (1 week)       (2-3 weeks)    (1 week)          │
│                                                                 │
│     │              │              │              │               │
│     ▼              ▼              ▼              ▼               │
│  ┌───────┐     ┌───────┐     ┌───────┐     ┌───────┐            │
│  │Setup  │     │Extract│     │Translate    │Integrate           │
│  │i18n   │ ──> │Strings│ ──> │& Review│ ──>│& Test  │           │
│  │Library│     │to JSON│     │        │     │        │           │
│  └───────┘     └───────┘     └───────┘     └───────┘            │
│                                                                 │
│                         Phase 5                                 │
│                         ─────────                               │
│                         Ongoing Maintenance                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 1: Foundation Setup (Week 1-2)

**Activities:**
1. Select i18n library (i18next, react-intl, vue-i18n)
2. Configure project structure
3. Set up translation file format (JSON, YAML, PO)
4. Implement language detection
5. Create language switcher component
6. Set up routing strategy (URL-based, cookie-based)

**Deliverables:**
- i18n configuration file
- Base translation structure
- Language switcher UI
- Developer documentation

### Phase 2: String Extraction (Week 3)

**Activities:**
1. Identify all hardcoded strings in codebase
2. Extract strings to translation files
3. Add translation keys to components
4. Create base language file (usually English)
5. Document context for translators

**Deliverables:**
- Complete English translation files
- All components using i18n
- String extraction report
- Translation context documentation

### Phase 3: Translation (Week 4-6)

**Activities:**
1. Send strings to translators
2. Manage translation workflow
3. Review translations for quality
4. Handle edge cases and pluralization
5. Iterate on feedback

**Deliverables:**
- Complete translations for all languages
- Reviewed and approved content
- Glossary of terms

### Phase 4: Integration & Testing (Week 7)

**Activities:**
1. Integrate translations into application
2. Test all pages in all languages
3. Fix layout issues from text expansion
4. Verify date/number formatting
5. Test language switching
6. Perform accessibility testing

**Deliverables:**
- Fully functional multilingual application
- Test reports
- Bug fixes completed

### Phase 5: Ongoing Maintenance

**Activities:**
1. Add new strings as features developed
2. Update existing translations
3. Handle translation requests
4. Monitor for missing translations
5. Regular quality audits

---

## Team Structure & Roles

### Core Team

```
┌─────────────────────────────────────────────────────────────────┐
│                      PROJECT TEAM STRUCTURE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    ┌───────────────┐                            │
│                    │ Project Lead  │                            │
│                    │ / i18n Owner  │                            │
│                    └───────┬───────┘                            │
│                            │                                    │
│           ┌────────────────┼────────────────┐                   │
│           │                │                │                   │
│     ┌─────▼─────┐    ┌─────▼─────┐    ┌─────▼─────┐             │
│     │ Frontend  │    │Translation│    │    QA     │             │
│     │ Developer │    │  Manager  │    │  Tester   │             │
│     └─────┬─────┘    └─────┬─────┘    └───────────┘             │
│           │                │                                    │
│           │          ┌─────┴─────┐                               │
│           │          │           │                               │
│           │    ┌─────▼───┐ ┌─────▼───┐                           │
│           │    │Translator│ │Translator│                         │
│           │    │(English) │ │(Swahili) │                         │
│           │    └─────────┘ └─────────┘                           │
│           │                                                     │
│     ┌─────▼─────┐                                               │
│     │ Backend   │                                               │
│     │ Developer │                                               │
│     └───────────┘                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Role Responsibilities

| Role | Responsibilities |
|------|------------------|
| **i18n Owner** | Overall strategy, tool selection, workflow design, stakeholder communication |
| **Frontend Developer** | Implement i18n library, create components, extract strings, handle formatting |
| **Backend Developer** | API localization, database schema, content delivery |
| **Translation Manager** | Coordinate translators, manage TMS, quality control, glossaries |
| **Translators** | Translate content, maintain consistency, provide context feedback |
| **QA Tester** | Test all languages, report bugs, verify fixes, accessibility testing |

### Communication Flow

```
Developer               Translation Manager          Translator
    │                          │                         │
    │  New strings ready       │                         │
    ├─────────────────────────>│                         │
    │                          │  Translation request    │
    │                          ├────────────────────────>│
    │                          │                         │
    │                          │  Completed translations │
    │                          │<────────────────────────┤
    │                          │                         │
    │  Review needed           │                         │
    │<─────────────────────────┤                         │
    │                          │                         │
    │  Approved / Feedback     │                         │
    ├─────────────────────────>│                         │
    │                          │                         │
```

---

## Development Workflow

### Daily Development Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVELOPER DAILY WORKFLOW                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Write Feature Code                                          │
│     └─> Use t() function for ALL user-facing strings            │
│                                                                 │
│  2. Add Translation Keys                                        │
│     └─> Add to English JSON with descriptive keys               │
│                                                                 │
│  3. Run Extraction Script (optional)                            │
│     └─> Auto-extract strings to find missing ones               │
│                                                                 │
│  4. Test in Both Languages                                      │
│     └─> Switch languages, check layout                          │
│                                                                 │
│  5. Commit with Translation Files                               │
│     └─> Include updated JSON files in PR                        │
│                                                                 │
│  6. CI Checks Run                                                │
│     └─> Validate translation completeness                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### String Extraction Process

#### Manual Extraction

```typescript
// Before: Hardcoded string
<h1>Welcome to Hakiardhi</h1>
<button>Search Land</button>

// After: Using i18n
<h1>{t('home.welcome')}</h1>
<button>{t('actions.search_land')}</button>

// Translation file (en/common.json)
{
  "home": {
    "welcome": "Welcome to Hakiardhi"
  },
  "actions": {
    "search_land": "Search Land"
  }
}
```

#### Automated Extraction with i18next-parser

```javascript
// i18next-parser.config.js
module.exports = {
  locales: ['en', 'sw'],
  output: 'public/locales/$LOCALE/$NAMESPACE.json',
  input: ['src/**/*.{ts,tsx}'],

  // Key naming
  defaultNamespace: 'common',
  keySeparator: '.',
  namespaceSeparator: ':',

  // Behavior
  createOldCatalogs: false,
  keepRemoved: false,
  sort: true,

  // Context for translators
  contextSeparator: '_',
  pluralSeparator: '_',
};
```

```bash
# Run extraction
npx i18next-parser

# Output:
# ✔ Parsed 145 files
# ✔ Found 320 translation keys
# ✔ Created en/common.json
# ✔ Created sw/common.json (with empty values)
```

### Key Naming Conventions

```json
{
  // ✓ Good: Hierarchical, descriptive
  "land_search": {
    "title": "Land Search",
    "form": {
      "parcel_number": "Parcel Number",
      "submit": "Search"
    },
    "results": {
      "found": "{{count}} parcels found",
      "not_found": "No parcels found"
    }
  },

  // ✗ Bad: Flat, unclear
  "str1": "Land Search",
  "btn1": "Search",
  "msg1": "{{count}} parcels found"
}
```

### Translation File Organization

```
public/locales/
├── en/
│   ├── common.json      # Shared UI strings
│   ├── navigation.json  # Menu, breadcrumbs
│   ├── forms.json       # Form labels, validation
│   ├── errors.json      # Error messages
│   ├── land.json        # Land-specific terms
│   └── auth.json        # Authentication
└── sw/
    ├── common.json
    ├── navigation.json
    ├── forms.json
    ├── errors.json
    ├── land.json
    └── auth.json
```

---

## Translation Management System

### Tools Comparison

| Tool | Best For | Features | Cost |
|------|----------|----------|------|
| **Lokalise** | Professional teams | TMS, API, GitHub sync | Paid |
| **Crowdin** | Open source/Community | Crowdsourcing, Git sync | Free tier |
| **Phrase** | Enterprise | Workflows, quality checks | Paid |
| **POEditor** | Small teams | Simple UI, affordable | Free tier |
| **SimpleLocalize** | Developers | CLI, auto-translation | Free tier |
| **Manual (Git)** | Small projects | Full control, free | Free |

### Recommended: Lokalise Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOKALISE WORKFLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  GitHub Repo                Lokalise                Translators │
│  ───────────                ────────                ─────────── │
│                                                                 │
│  ┌─────────┐   Push       ┌─────────┐   Assign    ┌─────────┐  │
│  │ en/*.json├────────────>│ Project │────────────>│ Translator │
│  └─────────┘              │         │             └────┬────┘  │
│                           │         │                  │        │
│  ┌─────────┐   Pull       │         │   Translate     │        │
│  │sw/*.json│<─────────────┤         │<─────────────────┘        │
│  └─────────┘              └─────────┘                           │
│       │                        │                                │
│       │                        │ Review & Approve               │
│       │                   ┌────▼────┐                           │
│       │                   │ Manager │                           │
│       │                   └─────────┘                           │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────┐                                                    │
│  │  Build  │                                                    │
│  │ & Deploy│                                                    │
│  └─────────┘                                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Git-based Workflow (Simple Projects)

```bash
# 1. Developer adds English strings
git checkout -b feature/add-search-page
# Edit en/land.json with new keys
git add public/locales/en/
git commit -m "feat: add land search translations (EN)"
git push

# 2. Create PR with translation request
# PR Template includes:
# - [ ] English strings added
# - [ ] Swahili translations needed
# - [ ] Context provided for translators

# 3. Translator adds Swahili via PR
git checkout feature/add-search-page
# Edit sw/land.json with translations
git add public/locales/sw/
git commit -m "feat: add land search translations (SW)"
git push

# 4. Review and merge
# Code review + translation review
git merge feature/add-search-page
```

### Translation Context File

```json
// public/locales/translation-context.json
{
  "land_search.title": {
    "description": "Page title for land search feature",
    "maxLength": 30,
    "screenshot": "screenshots/land-search.png"
  },
  "land_search.form.parcel_number": {
    "description": "Label for parcel number input field",
    "example": "12345/678",
    "context": "Form label, should be concise"
  },
  "land_search.results.found": {
    "description": "Message showing number of search results",
    "placeholders": {
      "count": "Number of parcels found"
    }
  }
}
```

---

## Code Architecture Patterns

### Pattern 1: Namespace-based Organization

```typescript
// Each feature has its own namespace
import { useTranslation } from 'react-i18next';

// Land search component
const LandSearch = () => {
  const { t } = useTranslation('land');

  return (
    <div>
      <h1>{t('search.title')}</h1>
      <input placeholder={t('search.placeholder')} />
    </div>
  );
};

// Authentication component
const Login = () => {
  const { t } = useTranslation('auth');

  return (
    <form>
      <h1>{t('login.title')}</h1>
      <button>{t('login.submit')}</button>
    </form>
  );
};
```

### Pattern 2: Component-level Translations

```typescript
// Component with co-located translations
// components/SearchForm/index.tsx
import { useTranslation } from 'react-i18next';

const SearchForm = () => {
  const { t } = useTranslation('components/search-form');

  return (
    <form>
      <label>{t('label')}</label>
      <input placeholder={t('placeholder')} />
      <button>{t('submit')}</button>
    </form>
  );
};

// components/SearchForm/locales/en.json
{
  "label": "Search",
  "placeholder": "Enter parcel number",
  "submit": "Search"
}
```

### Pattern 3: HOC for Page-level i18n

```typescript
// Higher-order component for pages
const withPageTranslation = (namespace: string) => {
  return (Component: React.ComponentType) => {
    return (props: any) => {
      const { t, ready } = useTranslation(namespace);

      if (!ready) return <LoadingSpinner />;

      return <Component {...props} t={t} />;
    };
  };
};

// Usage
const LandSearchPage = ({ t }) => {
  return <h1>{t('title')}</h1>;
};

export default withPageTranslation('land-search')(LandSearchPage);
```

### Pattern 4: Centralized Translation Service

```typescript
// services/translationService.ts
import i18n from '../i18n/config';

class TranslationService {
  // Get current language
  getCurrentLanguage(): string {
    return i18n.language;
  }

  // Change language
  async changeLanguage(lang: string): Promise<void> {
    await i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
    localStorage.setItem('language', lang);
  }

  // Translate with namespace
  translate(key: string, options?: any): string {
    return i18n.t(key, options);
  }

  // Check if translation exists
  exists(key: string): boolean {
    return i18n.exists(key);
  }

  // Get all available languages
  getLanguages(): string[] {
    return i18n.languages;
  }
}

export const translationService = new TranslationService();
```

### Pattern 5: Lazy Loading Translations

```typescript
// i18n/config.ts
import i18n from 'i18next';
import HttpBackend from 'i18next-http-backend';

i18n.use(HttpBackend).init({
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
  },

  // Only load needed namespaces
  ns: ['common'],
  defaultNS: 'common',

  // Lazy load additional namespaces
  partialBundledLanguages: true,
});

// Load namespace on demand
const loadNamespace = async (namespace: string) => {
  if (!i18n.hasResourceBundle(i18n.language, namespace)) {
    await i18n.loadNamespaces(namespace);
  }
};

// Usage in component
useEffect(() => {
  loadNamespace('land-search');
}, []);
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/i18n-check.yml
name: i18n Checks

on:
  pull_request:
    paths:
      - 'src/**'
      - 'public/locales/**'

jobs:
  translation-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Check for missing translations
        run: npm run i18n:check

      - name: Validate JSON syntax
        run: npm run i18n:validate

      - name: Check for unused keys
        run: npm run i18n:unused

      - name: Run translation tests
        run: npm test -- --grep "translation"

  notify-translators:
    needs: translation-check
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - name: Check for new English strings
        id: check-new
        run: |
          # Compare en/*.json with previous commit
          git diff HEAD~1 public/locales/en/ > diff.txt
          if [ -s diff.txt ]; then
            echo "new_strings=true" >> $GITHUB_OUTPUT
          fi

      - name: Notify translation team
        if: steps.check-new.outputs.new_strings == 'true'
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "New strings need translation in PR #${{ github.event.pull_request.number }}"
            }
```

### npm Scripts

```json
// package.json
{
  "scripts": {
    "i18n:extract": "i18next-parser",
    "i18n:check": "node scripts/check-translations.js",
    "i18n:validate": "node scripts/validate-json.js",
    "i18n:unused": "node scripts/find-unused-keys.js",
    "i18n:sort": "node scripts/sort-translations.js",
    "i18n:sync": "node scripts/sync-with-lokalise.js"
  }
}
```

### Translation Check Script

```javascript
// scripts/check-translations.js
const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../public/locales');
const LANGUAGES = ['en', 'sw'];
const BASE_LANG = 'en';

function getAllKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      return getAllKeys(value, fullKey);
    }
    return fullKey;
  });
}

function checkTranslations() {
  const errors = [];
  const namespaces = fs.readdirSync(path.join(LOCALES_DIR, BASE_LANG))
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));

  namespaces.forEach(namespace => {
    const basePath = path.join(LOCALES_DIR, BASE_LANG, `${namespace}.json`);
    const baseContent = JSON.parse(fs.readFileSync(basePath, 'utf8'));
    const baseKeys = getAllKeys(baseContent);

    LANGUAGES.filter(lang => lang !== BASE_LANG).forEach(lang => {
      const langPath = path.join(LOCALES_DIR, lang, `${namespace}.json`);

      if (!fs.existsSync(langPath)) {
        errors.push(`Missing file: ${lang}/${namespace}.json`);
        return;
      }

      const langContent = JSON.parse(fs.readFileSync(langPath, 'utf8'));
      const langKeys = getAllKeys(langContent);

      // Check for missing keys
      const missing = baseKeys.filter(key => !langKeys.includes(key));
      missing.forEach(key => {
        errors.push(`Missing in ${lang}/${namespace}.json: ${key}`);
      });

      // Check for extra keys
      const extra = langKeys.filter(key => !baseKeys.includes(key));
      extra.forEach(key => {
        errors.push(`Extra key in ${lang}/${namespace}.json: ${key}`);
      });
    });
  });

  if (errors.length > 0) {
    console.error('Translation errors found:');
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }

  console.log('✓ All translations are complete');
}

checkTranslations();
```

---

## Quality Assurance Process

### Testing Checklist

```
┌─────────────────────────────────────────────────────────────────┐
│                    QA TESTING CHECKLIST                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Functional Testing                                             │
│  ──────────────────                                             │
│  [ ] Language switcher works on all pages                       │
│  [ ] Selected language persists after refresh                   │
│  [ ] Language persists across sessions                          │
│  [ ] All pages display in selected language                     │
│  [ ] Forms validate in correct language                         │
│  [ ] Error messages display in correct language                 │
│  [ ] Dynamic content loads in correct language                  │
│                                                                 │
│  Visual Testing                                                 │
│  ──────────────                                                 │
│  [ ] No text overflow or truncation                             │
│  [ ] Buttons accommodate longer text                            │
│  [ ] Tables display correctly                                   │
│  [ ] Navigation doesn't break with longer labels                │
│  [ ] Forms are properly aligned                                 │
│  [ ] Modal dialogs fit content                                  │
│                                                                 │
│  Content Testing                                                │
│  ───────────────                                                │
│  [ ] No missing translations (keys showing)                     │
│  [ ] No machine translation artifacts                           │
│  [ ] Consistent terminology                                     │
│  [ ] Proper grammar and spelling                                │
│  [ ] Context-appropriate translations                           │
│  [ ] Pluralization works correctly                              │
│  [ ] Numbers format correctly                                   │
│  [ ] Dates format correctly                                     │
│                                                                 │
│  Technical Testing                                              │
│  ─────────────────                                              │
│  [ ] No console errors related to i18n                          │
│  [ ] Lazy loading works for namespaces                          │
│  [ ] Performance is acceptable                                  │
│  [ ] SEO tags are correct (hreflang)                            │
│  [ ] URLs update correctly                                      │
│                                                                 │
│  Accessibility Testing                                          │
│  ─────────────────────                                          │
│  [ ] Screen reader announces language changes                   │
│  [ ] Language switcher is keyboard accessible                   │
│  [ ] lang attribute is correct on <html>                        │
│  [ ] Focus management works after switch                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Visual Regression Testing

```javascript
// cypress/e2e/visual-regression.cy.ts
describe('Visual Regression - Multilingual', () => {
  const pages = [
    '/',
    '/land-search',
    '/about',
    '/contact'
  ];

  const languages = ['en', 'sw'];

  languages.forEach(lang => {
    pages.forEach(page => {
      it(`should render ${page} correctly in ${lang}`, () => {
        cy.visit(`/${lang}${page}`);
        cy.wait(500); // Wait for fonts/images

        // Take screenshot
        cy.screenshot(`${lang}${page.replace(/\//g, '-') || 'home'}`, {
          capture: 'fullPage'
        });

        // Compare with baseline
        cy.compareSnapshot(`${lang}-${page}`);
      });
    });
  });
});
```

### Translation Review Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRANSLATION REVIEW PROCESS                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Initial Translation                                         │
│     └─> Translator completes all strings                        │
│                                                                 │
│  2. Self-Review                                                 │
│     └─> Translator reviews own work                             │
│                                                                 │
│  3. Peer Review                                                 │
│     └─> Another translator reviews                              │
│                                                                 │
│  4. In-Context Review                                           │
│     └─> Review translations in actual UI                        │
│                                                                 │
│  5. Stakeholder Review                                          │
│     └─> Domain expert reviews terminology                       │
│                                                                 │
│  6. Final Approval                                              │
│     └─> Translation manager approves                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Maintenance & Updates

### Adding New Strings

```typescript
// 1. Developer adds to component
const NewFeature = () => {
  const { t } = useTranslation('features');

  return (
    <div>
      <h2>{t('new_feature.title')}</h2>
      <p>{t('new_feature.description')}</p>
    </div>
  );
};

// 2. Add to English file immediately
// public/locales/en/features.json
{
  "new_feature": {
    "title": "New Feature",
    "description": "This is a new feature that does something useful."
  }
}

// 3. Add placeholder to Swahili file
// public/locales/sw/features.json
{
  "new_feature": {
    "title": "[NEEDS TRANSLATION] New Feature",
    "description": "[NEEDS TRANSLATION] This is a new feature..."
  }
}

// 4. Create translation request
// - PR description includes new strings
// - Tag translation team for review
```

### Handling Updates

```bash
# When updating existing translations:

# 1. Update English first
git checkout -b update/privacy-policy-text

# 2. Mark Swahili as needing update
{
  "privacy": {
    "title": "Privacy Policy",
    "content": "[UPDATE NEEDED] Previous translation..."
  }
}

# 3. Create PR with clear description
# "Updated privacy policy text - Swahili translation needs update"

# 4. Translation team updates Swahili in same or follow-up PR
```

### Monthly Maintenance Tasks

```
┌─────────────────────────────────────────────────────────────────┐
│                    MONTHLY MAINTENANCE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Week 1: Audit                                                  │
│  ─────────────────                                              │
│  • Run unused key detection                                     │
│  • Check for missing translations                               │
│  • Review error logs for i18n issues                            │
│                                                                 │
│  Week 2: Cleanup                                                │
│  ─────────────────                                              │
│  • Remove unused keys                                           │
│  • Fix any missing translations                                 │
│  • Update outdated translations                                 │
│                                                                 │
│  Week 3: Quality                                                │
│  ─────────────────                                              │
│  • Review consistency of terminology                            │
│  • Check for style guide compliance                             │
│  • Update glossary if needed                                    │
│                                                                 │
│  Week 4: Planning                                               │
│  ─────────────────                                              │
│  • Review upcoming features for i18n needs                      │
│  • Estimate translation workload                                │
│  • Schedule translator availability                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Monitoring & Alerts

```typescript
// services/i18nMonitoring.ts

class I18nMonitoring {
  // Track missing translations in production
  logMissingKey(key: string, language: string) {
    analytics.track('missing_translation', {
      key,
      language,
      page: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  }

  // Monitor language usage
  trackLanguageSwitch(from: string, to: string) {
    analytics.track('language_switch', {
      from,
      to,
      timestamp: new Date().toISOString()
    });
  }

  // Weekly report
  async generateReport(): Promise<I18nReport> {
    return {
      missingKeys: await this.getMissingKeys(),
      languageDistribution: await this.getLanguageUsage(),
      switchPatterns: await this.getSwitchPatterns()
    };
  }
}
```

---

## Summary: Best Practices

### Development Best Practices

1. **Never hardcode strings** - Always use t() function
2. **Use descriptive keys** - `user.profile.edit_button` not `btn1`
3. **Provide context** - Help translators understand usage
4. **Test early** - Don't wait until end to test languages
5. **Automate checks** - CI should catch missing translations
6. **Document edge cases** - Pluralization, gender, etc.

### Translation Best Practices

1. **Use a TMS** - Don't manage via email/spreadsheets
2. **Maintain glossaries** - Ensure consistent terminology
3. **Review in context** - See translations in actual UI
4. **Allow iteration** - Translations improve with feedback
5. **Version control** - Track all translation changes

### Team Best Practices

1. **Clear ownership** - Someone owns i18n strategy
2. **Defined workflow** - Everyone knows the process
3. **Regular communication** - Developers ↔ Translators
4. **Quality gates** - Reviews before deployment
5. **Continuous improvement** - Learn from issues

---

## Recommended Workflow for Hakiardhi

### Phase 1: Setup (Week 1)
- Install i18next with recommended configuration
- Create translation file structure
- Build language switcher component
- Set up CI checks

### Phase 2: Extraction (Week 2)
- Extract all existing strings to English files
- Add translation keys throughout codebase
- Create context documentation

### Phase 3: Translation (Week 3-4)
- Professional translator for Swahili
- Review translations in context
- Iterate on feedback

### Phase 4: Testing (Week 5)
- Full QA in both languages
- Fix layout and content issues
- Accessibility testing

### Phase 5: Launch & Maintain
- Deploy with both languages
- Monitor for issues
- Establish monthly maintenance routine

This workflow ensures a systematic, professional approach to building and maintaining multilingual capabilities in the Hakiardhi Public Portal.
