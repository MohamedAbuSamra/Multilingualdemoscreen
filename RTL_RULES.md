# RTL/LTR Development Rules

## Critical Rules for Bidirectional Support

### 1. CSS Logical Properties - ALWAYS USE
Never use directional CSS properties. Always use logical properties:

**❌ NEVER USE:**
- `left-*`, `right-*`
- `pl-*`, `pr-*` (padding-left, padding-right)
- `ml-*`, `mr-*` (margin-left, margin-right)
- `text-left`, `text-right`
- `border-left-*`, `border-right-*`
- `rounded-l-*`, `rounded-r-*`

**✅ ALWAYS USE:**
- `start-*`, `end-*`
- `ps-*`, `pe-*` (padding-start, padding-end)
- `ms-*`, `me-*` (margin-start, margin-end)
- `text-start`, `text-end`
- `border-s-*`, `border-e-*`
- `rounded-s-*`, `rounded-e-*`

### 2. Translation Keys - NO HARDCODED TEXT
**❌ NEVER:**
```tsx
<button>Upload File</button>
<placeholder="Search products...">
```

**✅ ALWAYS:**
```tsx
<button>{t('uploadFile')}</button>
<placeholder={t('searchProducts')}>
```

Add all translations to both `en` and `ar` sections in `LanguageContext.tsx`.

### 3. Portal Components Direction
Components rendered in Portals (Dialog, DropdownMenu, Popover, etc.) must observe document direction:

```tsx
function MyPortalContent() {
  const [dir, setDir] = React.useState<'ltr' | 'rtl'>(() => {
    return (document.documentElement.dir as 'ltr' | 'rtl') || 'ltr';
  });

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      const direction = document.documentElement.dir as 'ltr' | 'rtl';
      setDir(direction || 'ltr');
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir'],
    });

    return () => observer.disconnect();
  }, []);

  return <Portal><Content dir={dir}>...</Content></Portal>;
}
```

### 4. Dropdown/Menu Alignment
Dynamic alignment based on language:

```tsx
const { language } = useLanguage();
<DropdownMenuContent align={language === 'ar' ? 'end' : 'start'}>
```

### 5. Avoid Conditional RTL Logic
**❌ BAD:**
```tsx
className={`${isRTL ? 'pr-4' : 'pl-4'}`}
```

**✅ GOOD:**
```tsx
className="ps-4"
```

### 6. Text Alignment in Lists/Items
Always add explicit text alignment to dropdown items, list items, etc:

```tsx
<DropdownMenuItem className="text-start">
  {t('menuItem')}
</DropdownMenuItem>
```

### 7. Flexbox Direction
Flex direction will automatically reverse in RTL, but if you need specific control:

**❌ AVOID:**
```tsx
className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
```

**✅ PREFER:**
```tsx
className="flex" // Automatically reverses in RTL
```

### 8. Icons and Directional Elements
Some icons need to flip in RTL (arrows, chevrons). Use CSS transform:

```tsx
<ChevronRight className="[.rtl_&]:rotate-180" />
```

Or conditionally:
```tsx
{language === 'ar' ? <ChevronLeft /> : <ChevronRight />}
```

## Checklist Before Committing

- [ ] No hardcoded English/Arabic text anywhere
- [ ] No `left-`, `right-`, `pl-`, `pr-`, `ml-`, `mr-` classes
- [ ] All text uses `text-start` or `text-end`, never `text-left` or `text-right`
- [ ] Portal components properly handle `dir` attribute
- [ ] Dropdown/menu alignments are language-aware
- [ ] All translations added to both English and Arabic
- [ ] Tested in both Arabic (RTL) and English (LTR) modes

## Testing RTL/LTR
1. Switch language using the language toggle button
2. Verify all text aligns correctly (right in Arabic, left in English)
3. Check dropdown menus open on correct side
4. Verify close buttons and icons position correctly
5. Ensure no text overflow or layout breaks

## Common Mistakes to Watch For
1. Copy-pasting code from external sources (often has `left`/`right`)
2. Using Tailwind autocomplete without thinking about direction
3. Forgetting to add Arabic translations when adding English
4. Not testing Portal components in both directions
5. Using absolute positioning without logical properties
