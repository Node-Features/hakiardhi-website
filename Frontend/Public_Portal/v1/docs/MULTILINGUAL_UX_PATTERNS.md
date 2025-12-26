# Multilingual UI/UX Patterns & Best Practices

This document outlines standard patterns for presenting language selection and multilingual features in software applications, based on industry best practices and user experience research.

---

## Table of Contents

1. [Language Selector Placement](#language-selector-placement)
2. [Selector Design Patterns](#selector-design-patterns)
3. [Visual Presentation Examples](#visual-presentation-examples)
4. [User Flow Patterns](#user-flow-patterns)
5. [Content Adaptation](#content-adaptation)
6. [Accessibility Considerations](#accessibility-considerations)
7. [Implementation Recommendations](#implementation-recommendations)

---

## Language Selector Placement

### Standard Locations

```
┌─────────────────────────────────────────────────────────────┐
│  Logo            Navigation Links           [EN|SW] User ▼  │  ← Header (Most Common)
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                      Page Content                           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Footer Links    |    Legal    |    [Language ▼]           │  ← Footer (Alternative)
└─────────────────────────────────────────────────────────────┘
```

### Placement Priority (Industry Standard)

| Location | Usage | Best For |
|----------|-------|----------|
| **Header - Top Right** | 85% of multilingual sites | Primary choice - always visible |
| **Header - Near User Menu** | 60% | Grouped with user preferences |
| **Footer** | 40% | Secondary access, less prominent |
| **Floating Widget** | 10% | Special cases, accessibility needs |

### Recommended Placement for Hakiardhi

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  [Logo]    Home  Services  Resources  Contact    🌐EN▼  👤  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Rationale:**
- Top-right corner follows F-pattern reading
- Globe icon (🌐) universally recognized for language
- Positioned before user account for quick access
- Visible on all pages without scrolling

---

## Selector Design Patterns

### Pattern 1: Dropdown (Most Common)

```
┌──────────────┐
│ 🌐 English ▼ │
└──────────────┘
       │
       ▼
┌──────────────┐
│ ✓ English    │
│   Kiswahili  │
└──────────────┘
```

**Pros:** Compact, scalable for many languages
**Cons:** Requires click interaction
**Best for:** 3+ languages, limited header space

### Pattern 2: Toggle Switch (For 2 Languages)

```
┌─────────────────┐
│  EN  |  SW     │
│ [●]     ○      │
└─────────────────┘
```

**Pros:** One-click switch, always visible options
**Cons:** Only works for 2 languages
**Best for:** Bilingual sites like Hakiardhi

### Pattern 3: Text Links

```
English | Kiswahili
```

**Pros:** Simple, no interaction needed to see options
**Cons:** Takes horizontal space
**Best for:** Footer placement, simple sites

### Pattern 4: Flag Icons (Use with Caution)

```
┌─────┐ ┌─────┐
│ 🇬🇧  │ │ 🇹🇿  │
└─────┘ └─────┘
```

**Pros:** Visual recognition
**Cons:** Flags represent countries, not languages; can be politically sensitive
**Best for:** Avoid - or use alongside text labels

### Pattern 5: Native Language Names

```
┌──────────────┐
│ English      │
│ Kiswahili    │
└──────────────┘
```

**Pros:** Users can identify their language regardless of current language
**Cons:** Requires space
**Best for:** Accessibility, user-friendly approach

---

## Visual Presentation Examples

### Example 1: Header Dropdown (Recommended for Hakiardhi)

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  [HAKIARDHI]   Nyumbani  Huduma  Rasilimali  Wasiliana    🌐SW ▼  👤│
│   Land Rights                                                       │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                         Dropdown Open:                              │
│                                              ┌─────────────────┐    │
│                                              │   English       │    │
│                                              │ ✓ Kiswahili     │    │
│                                              └─────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Example 2: Toggle in Header

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  [HAKIARDHI]   Home  Services  Resources  Contact   ┌─────────┐  👤 │
│   Land Rights                                       │ EN | SW │     │
│                                                     └─────────┘     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Toggle States:
┌─────────┐      ┌─────────┐
│[EN]│ SW │  or  │ EN │[SW]│
└─────────┘      └─────────┘
  Active           Active
```

### Example 3: Footer Secondary Access

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  Quick Links        Services          Legal           Language      │
│  ─────────────      ─────────         ─────           ─────────     │
│  • Home             • Land Search     • Privacy       ○ English     │
│  • About Us         • Verification    • Terms         ● Kiswahili   │
│  • Contact          • Registration    • Cookies                     │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│  © 2024 Hakiardhi. Haki zote zimehifadhiwa.                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Example 4: First-Time Visitor Modal

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│         ┌───────────────────────────────────────────┐               │
│         │                                           │               │
│         │   🌐 Choose Your Language                 │               │
│         │      Chagua Lugha Yako                    │               │
│         │                                           │               │
│         │   ┌─────────────────────────────────┐     │               │
│         │   │                                 │     │               │
│         │   │         English                 │     │               │
│         │   │                                 │     │               │
│         │   └─────────────────────────────────┘     │               │
│         │                                           │               │
│         │   ┌─────────────────────────────────┐     │               │
│         │   │                                 │     │               │
│         │   │        Kiswahili                │     │               │
│         │   │                                 │     │               │
│         │   └─────────────────────────────────┘     │               │
│         │                                           │               │
│         │   □ Remember my choice                    │               │
│         │     Kumbuka chaguo langu                  │               │
│         │                                           │               │
│         └───────────────────────────────────────────┘               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Example 5: Mobile Responsive Design

```
Mobile Header (Collapsed):
┌─────────────────────────┐
│ [≡]  HAKIARDHI  🌐 👤   │
└─────────────────────────┘

Mobile Menu (Expanded):
┌─────────────────────────┐
│ [✕]  HAKIARDHI          │
├─────────────────────────┤
│ Home                    │
│ Services            >   │
│ Resources           >   │
│ Contact                 │
├─────────────────────────┤
│ Language                │
│ ┌─────────────────────┐ │
│ │ ○ English           │ │
│ │ ● Kiswahili         │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ Login | Register        │
└─────────────────────────┘
```

---

## User Flow Patterns

### Flow 1: Automatic Detection with Confirmation

```
User visits site
       │
       ▼
┌─────────────────┐
│ Detect browser  │
│ language        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     Yes    ┌─────────────────┐
│ Supported       │───────────>│ Load in that    │
│ language?       │            │ language        │
└────────┬────────┘            └────────┬────────┘
         │ No                           │
         ▼                              ▼
┌─────────────────┐            ┌─────────────────┐
│ Load default    │            │ Show subtle     │
│ (English)       │            │ confirmation    │
└─────────────────┘            │ toast           │
                               └─────────────────┘

Toast Example:
┌─────────────────────────────────────┐
│ 🌐 Tumeona unapendelea Kiswahili.   │
│    We noticed you prefer Swahili.   │
│                          [Confirm]  │
└─────────────────────────────────────┘
```

### Flow 2: Manual Selection (Recommended)

```
User visits site
       │
       ▼
┌─────────────────┐
│ Check stored    │
│ preference      │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
Has pref   No pref
    │         │
    ▼         ▼
Load       Load default
stored     (English or
language   detected)
    │         │
    └────┬────┘
         │
         ▼
┌─────────────────┐
│ Language always │
│ changeable via  │
│ header selector │
└─────────────────┘
```

### Flow 3: Language Switch Behavior

```
User clicks language selector
              │
              ▼
┌──────────────────────┐
│ Save preference to   │
│ localStorage/cookie  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Reload UI strings    │
│ (no page refresh)    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Fetch localized      │
│ content from API     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Update URL if using  │
│ localized routes     │
│ /en/... → /sw/...    │
└──────────────────────┘
```

---

## Content Adaptation

### Text Expansion Considerations

Swahili text is typically **15-30% longer** than English. Design must accommodate:

```
English:                          Swahili:
┌─────────────────┐              ┌───────────────────────┐
│ Search          │              │ Tafuta                │
└─────────────────┘              └───────────────────────┘

┌─────────────────┐              ┌───────────────────────┐
│ Submit          │              │ Wasilisha             │
└─────────────────┘              └───────────────────────┘

┌─────────────────┐              ┌─────────────────────────────┐
│ Land Search     │              │ Utafutaji wa Ardhi          │
└─────────────────┘              └─────────────────────────────┘

┌─────────────────┐              ┌─────────────────────────────────────┐
│ Privacy Policy  │              │ Sera ya Faragha                     │
└─────────────────┘              └─────────────────────────────────────┘
```

### Design Solutions

1. **Flexible Containers**
```css
.button {
  min-width: 100px;
  padding: 8px 16px;
  white-space: nowrap;
}

.nav-item {
  flex: 0 1 auto;
  padding: 0 12px;
}
```

2. **Truncation with Tooltips**
```
┌──────────────────┐
│ Utafutaji wa... │ ← Tooltip: "Utafutaji wa Ardhi"
└──────────────────┘
```

3. **Responsive Breakpoints**
```
Desktop:  Full text labels
Tablet:   Abbreviated or wrapped
Mobile:   Icons with labels below
```

### Date & Number Formatting

```
English:                    Swahili:
─────────                   ─────────
March 15, 2024             15 Machi 2024
1,234,567.89               1.234.567,89  (or 1,234,567.89)
$100.00                    TSh 100.00
```

### Layout Direction

Both English and Swahili are LTR (Left-to-Right), so no layout mirroring needed.

---

## Accessibility Considerations

### ARIA Labels

```html
<!-- Language selector button -->
<button
  aria-label="Select language. Current language: English"
  aria-haspopup="listbox"
  aria-expanded="false"
>
  🌐 EN ▼
</button>

<!-- Language options -->
<ul role="listbox" aria-label="Available languages">
  <li role="option" aria-selected="true">English</li>
  <li role="option" aria-selected="false">Kiswahili</li>
</ul>
```

### Keyboard Navigation

```
Tab       → Focus language selector
Enter     → Open dropdown
↓/↑       → Navigate options
Enter     → Select language
Escape    → Close dropdown
```

### Screen Reader Announcements

```javascript
// Announce language change
const announceLanguageChange = (newLang: string) => {
  const announcement = newLang === 'sw'
    ? 'Lugha imebadilishwa kuwa Kiswahili'
    : 'Language changed to English';

  // Use aria-live region
  const liveRegion = document.getElementById('aria-live');
  liveRegion.textContent = announcement;
};
```

### Native Language Labels

Always display language names in their native form:

```
✓ English / Kiswahili      (Correct)
✗ English / Swahili        (Incorrect - Swahili is English name)
✗ Kiingereza / Kiswahili   (Incorrect - non-speakers can't read)
```

---

## Implementation Recommendations

### Recommended Design for Hakiardhi Public Portal

#### Desktop Header

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  [HAKIARDHI LOGO]                                                   │
│  Land Rights Information                                            │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  Nyumbani   Huduma   Rasilimali   Habari   Wasiliana   ┌────────┐  │
│                                                        │ EN│ SW │  │
│                                                        └────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Active State (Swahili selected):
┌────────┐
│ EN│[SW]│
└────────┘
 ───  ███
```

#### Mobile Header

```
┌─────────────────────────────┐
│ [≡]   HAKIARDHI    EN|SW 👤 │
└─────────────────────────────┘
```

### Component Specification

```typescript
// LanguageSelector.tsx

interface LanguageSelectorProps {
  variant: 'toggle' | 'dropdown';
  position: 'header' | 'footer' | 'mobile-menu';
  showLabels: boolean;
  showIcon: boolean;
}

// Desktop Header
<LanguageSelector
  variant="toggle"
  position="header"
  showLabels={true}
  showIcon={false}
/>

// Mobile Menu
<LanguageSelector
  variant="dropdown"
  position="mobile-menu"
  showLabels={true}
  showIcon={true}
/>

// Footer
<LanguageSelector
  variant="dropdown"
  position="footer"
  showLabels={true}
  showIcon={false}
/>
```

### CSS Implementation

```css
/* Toggle Variant (Recommended for Header) */
.language-toggle {
  display: inline-flex;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  font-size: 13px;
  font-weight: 600;
}

.language-toggle__option {
  padding: 6px 12px;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.language-toggle__option:first-child {
  border-right: 1px solid #e2e8f0;
}

.language-toggle__option--active {
  background: #1e40af;
  color: white;
}

.language-toggle__option:hover:not(.language-toggle__option--active) {
  background: #f1f5f9;
}

/* Focus states for accessibility */
.language-toggle__option:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
```

### Interaction States

```
Default:
┌────────┐
│ EN │ SW│
└────────┘
 Gray  Gray

Hover on SW:
┌────────┐
│ EN │ SW│
└────────┘
 Gray Light BG

Active (English):
┌────────┐
│[EN]│ SW│
└────────┘
 Blue  Gray

Active (Swahili):
┌────────┐
│ EN │[SW]│
└────────┘
 Gray  Blue
```

### First Visit Experience

For first-time visitors, consider a subtle prompt:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  [HAKIARDHI]    Nav Items...           EN|SW   👤   │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │ 🌐 Would you prefer Kiswahili?                │  │
│  │    Ungependa Kiswahili?                       │  │
│  │                                               │  │
│  │    [Switch to Kiswahili]    [Keep English]    │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Trigger conditions:**
- Browser language is Swahili
- IP geolocation is Tanzania
- First visit (no stored preference)

### URL Strategy

**Option A: Language in Path (Recommended)**
```
https://portal.hakiardhi.or.tz/en/land-search
https://portal.hakiardhi.or.tz/sw/utafutaji-ardhi
```

**Option B: Language as Query Parameter**
```
https://portal.hakiardhi.or.tz/land-search?lang=en
https://portal.hakiardhi.or.tz/land-search?lang=sw
```

**Option C: Subdomain**
```
https://en.portal.hakiardhi.or.tz/land-search
https://sw.portal.hakiardhi.or.tz/land-search
```

**Recommendation:** Option A (Language in Path)
- Better SEO
- Shareable localized URLs
- Clear language context

---

## Summary: Key Principles

### Do's ✓

1. **Place selector in header** - Top-right, always visible
2. **Use native language names** - "Kiswahili" not "Swahili"
3. **Persist preferences** - Remember user's choice
4. **Provide instant feedback** - No full page reload
5. **Design for text expansion** - Swahili is longer
6. **Include in mobile menu** - Easy access on all devices
7. **Use clear visual indicators** - Active state obvious
8. **Support keyboard navigation** - Accessibility

### Don'ts ✗

1. **Don't use flags alone** - Flags are countries, not languages
2. **Don't hide the selector** - Should be discoverable
3. **Don't auto-redirect** - Let users choose
4. **Don't forget fallbacks** - Handle missing translations
5. **Don't ignore text length** - Test with longest translations
6. **Don't use machine translation** - Quality matters for legal content

---

## Final Recommendation for Hakiardhi

### Primary Selector: Header Toggle

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  [HAKIARDHI]   Home  Services  Resources  Contact   [EN│SW]  👤 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Secondary Access: Footer

```
Language: English | Kiswahili
```

### Mobile: In Hamburger Menu

```
┌─────────────────┐
│ Language        │
│ ○ English       │
│ ● Kiswahili     │
└─────────────────┘
```

This approach:
- Is immediately visible
- Works for exactly 2 languages
- Requires single click to switch
- Follows established patterns
- Is accessible and mobile-friendly
