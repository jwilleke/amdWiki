---
name: "ImagePlugin"
description: "Inline image display with alignment and caption support"
dateModified: "2025-12-18"
category: "plugins"
relatedModules: ["PluginManager", "ConfigurationManager"]
version: "1.0.0"
---

# ImagePlugin

Displays inline images with customizable alignment, display modes, captions, and styling.

## Overview

The ImagePlugin implements JSPWiki-style inline image functionality. It supports various display modes (float, block, inline, full-width), alignment options, captions, and can wrap images in links.

**Source:** `plugins/ImagePlugin.js`

## Plugin Metadata

| Property | Value |
|----------|-------|
| Name | Image |
| Author | amdWiki |
| Version | 1.0.0 |
| JSPWiki Compatible | Yes |

## Usage

### Basic Syntax

```wiki
[{Image src='path/to/image.jpg'}]
```

### With Caption

```wiki
[{Image src='photo.jpg' caption='My Photo'}]
```

### Full Example

```wiki
[{Image src='diagram.png' alt='Architecture' width='400' align='center' caption='System Architecture'}]
```

## Parameters

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| src | string | - | Yes | Image source path or URL |
| alt | string | caption or "Uploaded image" | No | Alt text for accessibility |
| caption | string | - | No | Caption below image |
| width | string | - | No | Image width |
| height | string | - | No | Image height |
| align | string | - | No | Alignment: left, right, center |
| display | string | float | No | Display mode: float, block, inline, full |
| border | number | - | No | Border width in pixels |
| style | string | - | No | Custom CSS styles |
| class | string | wiki-image | No | CSS class name |
| title | string | - | No | Tooltip text |
| link | string | - | No | URL to link image to |

### Display Modes

| Mode | Description |
|------|-------------|
| float | Allows text wrapping around image (default) |
| block | Image in its own block, no text wrapping |
| inline | Image flows inline with text |
| full | Full-width image |

### Alignment Options

| Align | Float Mode | Block Mode | Inline Mode |
|-------|------------|------------|-------------|
| left | Float left, text wraps | Left-aligned, no wrap | Margin-right added |
| right | Float right, text wraps | Right-aligned, no wrap | Margin-left added |
| center | Block centered | Block centered | Vertical-align middle |

## Examples

### Example 1: Simple Image

```wiki
[{Image src='/images/logo.png'}]
```

### Example 2: Image with Caption

```wiki
[{Image src='photo.jpg' caption='Team Photo 2025'}]
```

**Output:**

```html
<div class="image-plugin-container">
  <img src="/images/photo.jpg" alt="Team Photo 2025" class="wiki-image" />
  <div class="image-caption">Team Photo 2025</div>
</div>
```

### Example 3: Floating Image with Text Wrap

```wiki
[{Image src='diagram.png' align='left' display='float' caption='Architecture Diagram'}]

This text will wrap around the image on the right side.
```

### Example 4: Full-Width Image

```wiki
[{Image src='banner.jpg' display='full' caption='Welcome Banner'}]
```

### Example 5: Clickable Image

```wiki
[{Image src='thumbnail.jpg' link='https://example.com/full-image.jpg' caption='Click to enlarge'}]
```

### Example 6: Styled Image

```wiki
[{Image src='photo.jpg' border=2 style='border-radius: 8px;' class='featured-image'}]
```

## Configuration

The plugin reads these configuration options:

| Property | Default | Description |
|----------|---------|-------------|
| `amdwiki.features.images.defaultAlt` | "Uploaded image" | Default alt text |
| `amdwiki.features.images.defaultClass` | "wiki-image" | Default CSS class |

## Technical Implementation

### Path Resolution

- Absolute paths (starting with `/` or `http`) are used as-is
- Relative paths are prefixed with `/images/`

```javascript
if (!src.startsWith("http") && !src.startsWith("/")) {
  src = `/images/${src}`;
}
```

### Context Usage

- `context.engine.getManager("ConfigurationManager")` - For default settings

## JSPWiki Compatibility

| Feature | JSPWiki | amdWiki | Notes |
|---------|---------|---------|-------|
| Basic syntax | Yes | Yes | Fully compatible |
| src, alt, width, height | Yes | Yes | Same behavior |
| align | Yes | Yes | Same values |
| caption | Yes | Yes | Same behavior |
| link | Yes | Yes | Same behavior |
| display modes | Partial | Yes | Extended options |

## Error Handling

| Error | Cause | Output |
|-------|-------|--------|
| Missing src | src not provided | Error message span |
| Invalid path | Image not found | Browser handles 404 |

## CSS Classes

| Class | Applied To | Description |
|-------|-----------|-------------|
| wiki-image | img | Default image class |
| image-plugin-container | div | Container when caption present |
| image-caption | div | Caption text styling |

## Related Plugins

- [ConfigAccessorPlugin](./ConfigAccessorPlugin.md) - For accessing image configuration

## Related Documentation

- [Plugin System Architecture](../architecture/Plugin-Architecture.md)
- [Image-Video-Implementation-Planning](../planning/Image-Video-Implementation-Planning.md)

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-10-19 | Initial implementation |
