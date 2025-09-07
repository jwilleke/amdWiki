# TODO: JSPWiki Styles Implementation

## 📋 **JSPWiki Styles Analysis & Recommendation**

### 🏗️ **Architecture Overview**

**JSPWiki uses a sophisticated LESS-based build system with:**

1. **Modular Bootstrap 3.3.7 Integration**: Custom theme built on Bootstrap foundation
2. **Comprehensive LESS Structure**: 
   - `haddock/` main theme directory
   - `bootstrap/` - Custom Bootstrap 3 variant  
   - `default/` - JSPWiki-specific components
   - `fontjspwiki/` - Custom icon fonts
   - `static/templates/` - Compiled CSS output

3. **Component-Based Organization**:
   - Core styling (type, variables, scaffolding)
   - Template-specific styles (View, Edit, Search, etc.)
   - Plugin-specific styles (TOC, Index, Weblog, etc.)
   - Dynamic components (Tabs, Accordion, Carousel, etc.)

### 🎯 **Is it Good for Node.js Implementation?**

**YES - Excellent choice with modifications!** Here's why:

#### ✅ **Advantages:**
- **Professional Design System**: Mature, battle-tested visual language
- **Component Modularity**: Easy to pick/choose needed components
- **Responsive Design**: Built-in mobile responsiveness
- **Accessibility**: Proper ARIA support and keyboard navigation
- **Customizable**: LESS variables make theming straightforward
- **Cross-browser**: Handles vendor prefixes and compatibility

#### ⚠️ **Considerations:**
- **Bootstrap 3 → 5 Migration**: JSPWiki uses Bootstrap 3.3.7, you'd want Bootstrap 5
- **LESS vs SCSS**: Modern tooling often prefers SCSS over LESS
- **Java-specific Components**: Some components assume JSP/Java backend

### 🛠️ **Implementation Difficulty: MODERATE (6/10)**

#### **Easy Parts (2-4 weeks):**
- Basic color scheme and typography
- Grid system and responsive breakpoints  
- Button styles and form components
- Navigation structure

#### **Moderate Parts (4-6 weeks):**
- Plugin-specific styling (TOC, Search, etc.)
- Template system integration
- Dynamic components (tabs, accordions)
- Custom icon font integration

#### **Complex Parts (6-8 weeks):**
- Full Bootstrap 3→5 migration
- Java→Node template adaptations
- Complete build system setup
- Cross-browser testing

### 📦 **Recommended Implementation Strategy**

#### **Phase 1: Foundation (2 weeks)**
```javascript
// Install modern equivalents
npm install sass bootstrap@5 @fortawesome/fontawesome-free
npm install --save-dev vite postcss autoprefixer
```

#### **Phase 2: Core Adaptation (3 weeks)**
1. **Extract Variables**: Convert LESS variables to SCSS
2. **Migrate Components**: Port essential components to Bootstrap 5
3. **Custom Components**: Recreate JSPWiki-specific styling

#### **Phase 3: Advanced Features (3 weeks)**
1. **Plugin Integration**: Style wiki-specific components
2. **Dynamic Features**: Implement interactive components  
3. **Responsive Polish**: Fine-tune mobile experience

### 🎨 **Quick Start Recommendation**

Rather than full implementation, I suggest:

1. **Cherry-pick the best parts**:
   - Color palette and typography
   - Component spacing and shadows
   - Navigation patterns
   - Form styling

2. **Use modern equivalents**:
   - Bootstrap 5 instead of 3
   - CSS Custom Properties instead of LESS variables
   - CSS Grid where appropriate

3. **Focus on key components**:
   - Navigation and page layout
   - Content typography and code blocks
   - Forms and buttons
   - Plugin-specific components you actually need

### 💡 **Alternative: Inspired Approach**

Instead of full port, create a **JSPWiki-inspired design system**:

```css
/* JSPWiki-inspired color palette */
:root {
  --wiki-primary: #337ab7;
  --wiki-sidebar: #f8f9fa;
  --wiki-border: #dee2e6;
  --wiki-success: #5cb85c;
  --wiki-warning: #f0ad4e;
  --wiki-danger: #d9534f;
}
```

This gives you the professional JSPWiki aesthetic without the complexity of full migration.

### 🏁 **Bottom Line**

**Worth doing**: The JSPWiki styles are excellent and would give your wiki a professional, familiar feel. However, I'd recommend a **selective implementation** focusing on the visual language rather than full codebase port.

**Time investment**: 4-6 weeks for a solid JSPWiki-inspired theme vs 8-12 weeks for full implementation.

**Best ROI**: Extract the design principles, color schemes, and component patterns while using modern CSS tools and Bootstrap 5.

---

## 🎯 **Immediate Action Items**

### High Priority
- [ ] Extract JSPWiki color palette and implement as CSS custom properties
- [ ] Port JSPWiki typography system to our current CSS
- [ ] Implement JSPWiki-style sidebar navigation
- [ ] Add JSPWiki-inspired form styling
- [ ] **Implement JSPWiki TablePlugin Row Styling Features**:
  - [ ] `rowNumber`: Starting row number for counting (default: 0)
  - [ ] `style`: CSS styling for the entire table
  - [ ] `dataStyle`: CSS formatting for all data cells (single pipe |)
  - [ ] `headerStyle`: CSS formatting for header cells (double pipe ||)
  - [ ] `evenRowStyle`: CSS formatting for even rows
  - [ ] `oddRowStyle`: CSS formatting for odd rows
  - [ ] Support `%%table-striped` syntax for theme-based alternating rows
  - [ ] Implement `|#` syntax for automatic row numbering

### Medium Priority  
- [ ] Port JSPWiki button and component styling
- [ ] Implement JSPWiki-style search interface
- [ ] Add JSPWiki-inspired page layout patterns
- [ ] Create JSPWiki-style plugin components (TOC, etc.)

### Low Priority
- [ ] Full Bootstrap 3→5 migration analysis
- [ ] Custom icon font integration
- [ ] Advanced dynamic components
- [ ] Cross-browser compatibility testing

### Research Tasks
- [ ] Analyze JSPWiki's responsive breakpoints
- [ ] Study JSPWiki's accessibility patterns
- [ ] Review JSPWiki's dark theme implementation
- [ ] Investigate JSPWiki's print stylesheet approach

---

## 📚 **Reference Links**

- [JSPWiki Styles Repository](https://github.com/apache/jspwiki/tree/master/jspwiki-war/src/main/styles)
- [JSPWiki Haddock Theme](https://github.com/apache/jspwiki/tree/master/jspwiki-war/src/main/styles/haddock)
- [Bootstrap 5 Migration Guide](https://getbootstrap.com/docs/5.0/migration/)
- [LESS to SCSS Conversion Guide](https://sass-lang.com/documentation/syntax#differences-from-less)

---

## 💭 **Notes**

- Current implementation already uses Bootstrap 5 - good foundation
- Page Source Dialog is already excellent - JSPWiki quality
- Navigation structure is clean and minimal - matches JSPWiki philosophy
- Consider implementing JSPWiki's "Haddock" theme as inspiration
