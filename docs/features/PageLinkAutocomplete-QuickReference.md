# Page Link Autocomplete - Quick Reference

## One-Page Cheat Sheet

### 🚀 Quick Start

```
Editor:  Type [sys → Shows: SystemInfo, System Variables...
Search:  Type sys  → Shows: Matching pages dropdown
Result:  Click or press Enter to select
```

---

### 📍 Where It Works

| Location | Trigger | Action |
|----------|---------|--------|
| **Page Editor** | Type `[page` | Inserts `[PageName]` |
| **Search Page** | Type `query` | Navigate to page |
| **Header Search** | Type `query` | Navigate to page |
| **Edit Index** | Type `query` | Edit selected page |

---

### ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↓` | Next suggestion |
| `↑` | Previous suggestion |
| `Enter` | Select current |
| `Escape` | Close dropdown |

---

### 🎯 Smart Sorting

1. **Exact match** - `home` → **HomePage** (exact)
2. **Prefix match** - `home` → **HomePages** (starts with)
3. **Contains match** - `home` → **MyHomePage** (contains)
4. **Alphabetical** - Within each priority group

---

### ✅ Best Practices

✓ Type at least **2 characters**
✓ Wait briefly (~200ms delay)
✓ Use arrow keys for speed
✓ Check category badges
✓ Type distinctive words

---

### ❌ Won't Trigger For

- Plugin syntax: `[{Image src='...'}]`
- Variable syntax: `[{$applicationname}]`
- Escaped text: `[[escaped content]`
- Already closed: `[HomePage] text`
- Less than 2 chars: `[h`

---

### 🔧 API Endpoint

```bash
# Request
GET /api/page-suggestions?q=system&limit=10

# Response
{
  "query": "system",
  "suggestions": [
    {
      "name": "SystemInfo",
      "slug": "systeminfo",
      "title": "SystemInfo",
      "category": "system"
    }
  ],
  "count": 1
}
```

---

### 🐛 Troubleshooting

**No dropdown?**

- Type 2+ characters
- Check browser console (F12)
- Verify in supported location

**Wrong results?**

- Type more characters
- Use distinctive words
- Check category badges

**Keyboard not working?**

- Click input field first
- Verify dropdown is open
- Check focus is in field

---

### 📊 Performance

- Response time: ~50-100ms (90 pages)
- Debounce delay: 200ms
- Max suggestions: 10 (default)
- Browser caching: Automatic

---

### 🔗 Related Features

- English Plural Matching (automatic)
- JSPWiki Variable Syntax: `[{$var}]`
- Standard Page Links: `[PageName]`
- Advanced Search (full-text)

---

### 📚 Full Documentation

- **User Guide:** `/wiki/Page%20Link%20Autocomplete`
- **Technical Docs:** `docs/features/PageLinkAutocomplete.md`
- **GitHub Issue:** #90 - TypeDown for Internal Page Links

---

### 🎓 Common Patterns

**Create link while editing:**

```
1. Type: [sys
2. Arrow Down to System Variables
3. Press Enter
4. Result: [System Variables]
```

**Quick page navigation:**

```
1. Header search: home
2. Click HomePage
3. Navigate immediately
```

**Find page to edit:**

```
1. /edit-index search: test
2. Autocomplete shows options
3. Click to edit
```

---

### 💡 Pro Tips

- **Keyboard warriors:** Use ↓↑ and Enter - never touch the mouse
- **Recent pages:** Higher priority (future feature)
- **Categories:** Use category badges to disambiguate similar names
- **Partial words:** Type any part: "var" finds "System Variables"

---

### 📝 Configuration

**For Administrators:**

```javascript
// Adjust in page templates
new PageAutocomplete({
  minChars: 3,           // Require 3 chars
  maxSuggestions: 15,    // Show 15 results
  debounceMs: 300        // 300ms delay
})
```

---

### 🆕 Version Info

- **Version:** 1.0.0
- **Released:** October 12, 2025
- **Status:** Production Ready
- **Issue:** #90

---

*Print or bookmark this page for quick reference!*
