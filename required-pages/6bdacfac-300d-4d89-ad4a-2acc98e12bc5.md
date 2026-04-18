---
title: ImagePlugin
system-category: documentation
user-keywords:
  - default
uuid: 6bdacfac-300d-4d89-ad4a-2acc98e12bc5
slug: imageplugin
lastModified: '2026-03-25T00:00:00.000Z'
author: admin
---
# ImagePlugin

The **ImagePlugin** embeds images in pages with flexible layout and display options. See [Plugins] for a complete list of available plugins.

## Basic Syntax

```
[{Image src='path/to/image.jpg' caption='My Image'}]
```

## Parameters

### Required Parameters

%%table-striped
|| Parameter || Description || Example ||
| `src` | Image source: path, URL, or `media://filename` for media library items | `src='photo.jpg'` |
/%

### Optional Parameters

%%table-striped
|| Parameter || Description || Example || Default ||
| `caption` | Image caption (also used as alt if alt not provided) | `caption='Sunset over the ocean'` | None |
| `alt` | Alt text for accessibility | `alt='Beautiful sunset'` | Uses caption, or "Uploaded image" |
| `width` | Image width | `width='300'` or `width='50%'` | Original size |
| `height` | Image height | `height='200'` | Original size |
| `align` | Horizontal alignment | `align='left'`, `align='right'`, `align='center'` | None |
| `display` | Display mode (see below) | `display='block'`, `display='float'`, `display='inline'`, `display='full'` | `float` |
| `border` | Border width in pixels | `border='2'` | None |
| `style` | Custom inline CSS | `style='border-radius: 10px;'` | None |
| `class` | Custom CSS class | `class='thumbnail'` | `wiki-image` |
| `title` | Tooltip text | `title='Click to enlarge'` | None |
| `link` | URL to link the image to | `link='https://example.com'` | None |
/%

## Display Modes

The `display` parameter controls how the image interacts with surrounding text:

### `display='float'` (Default)

Allows text to wrap around the image. Best used with `align='left'` or `align='right'`.

**Example:**

```
[{Image src='/attachments/photo.jpg' align='left' display='float' caption='Text wraps around this image'}]
```

**Behavior:**

- Image floats to the specified side
- Text flows around the image
- Good for inline illustrations in articles

### `display='block'`

Image in its own block, no text wrapping. Text stays above and below the image.

**Example:**

```
[{Image src='/attachments/photo.jpg' align='left' display='block' caption='Image on left, but no text wrapping'}]
```

**Behavior:**

- Image positioned according to `align` parameter
- No text wrapping - text appears above and below
- Good for when you want clear separation

### `display='inline'`

Image flows inline with text like a word in a sentence.

**Example:**

```
Click the [{Image src='/icon.png' display='inline'}] icon to continue.
```

**Behavior:**

- Image sits on the text baseline
- Flows with text naturally
- Good for icons and small inline images

### `display='full'`

Full-width image that spans the entire container width.

**Example:**

```
[{Image src='/attachments/banner.jpg' display='full' caption='Full-width hero image'}]
```

**Behavior:**

- Takes up 100% of container width
- Height scales proportionally
- `align` parameter is ignored
- Good for banners and hero images

## Alignment Options

The `align` parameter works with all display modes:

%%table-striped
|| Align || Description || Best Used With ||
| `left` | Aligns image to the left | `display='float'` or `display='block'` |
| `right` | Aligns image to the right | `display='float'` or `display='block'` |
| `center` | Centers the image | `display='block'` |
/%

## Common Use Cases

### Article Image with Text Wrapping

```
[{Image src='/attachments/article-photo.jpg' align='left' caption='Figure 1: Research results' width='300'}]

Lorem ipsum dolor sit amet, consectetur adipiscing elit. The image floats to the left
and text wraps around it naturally...
```

### Standalone Image (No Text Wrap)

```
[{Image src='/attachments/diagram.jpg' align='center' display='block' caption='System Architecture Diagram'}]

The diagram above shows...
```

### Full-Width Banner

```
[{Image src='/attachments/hero-banner.jpg' display='full' caption='Welcome Banner'}]
```

### Inline Icon

```
Click the [{Image src='/icons/edit.png' display='inline' alt='edit icon'}] button to edit this page.
```

### Linked Image

```
[{Image src='/attachments/thumbnail.jpg' link='https://example.com' caption='Click to visit website'}]
```

### Image with Border and Styling

```
[{Image src='/attachments/photo.jpg' border='2' style='border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);' caption='Styled image'}]
```

## Source Types

`src` accepts three forms:

%%table-striped
|| Form || Example || Behaviour ||
| Filename | `src='photo.jpg'` | Resolved via [Attachments] — page-local first, then global |
| `media://` URI | `src='media://IMG_1234.jpg'` | Resolved via the [Media] library by filename — no upload needed |
| Absolute path / URL | `src='/public/img/logo.png'` or `src='https://…'` | Used as-is |
/%

### Embedding a Media Library Photo

If the [Media] feature is enabled, you can reference photos from the library without uploading them:

```
[{Image src='media://IMG_1234.jpg' caption='Family Trip 2024' align='center'}]
[{Image src='media://DSC_0042.jpg' align='left' display='float' caption='Sunset'}]
```

### Attachment Integration

When you upload an image through the [Attachments] system, simply use its filename — the system resolves it automatically:

```
[{Image src='photo.jpg' caption='Uploaded image'}]
```

The attachment system handles hash-based storage, deduplication, and page mention tracking behind the scenes.

## Accessibility

### Alt Text Best Practices

1. **Always provide descriptive alt text** for accessibility
2. If you don't provide `alt`, the plugin automatically uses `caption`
3. For decorative images, use `alt=''` (empty string)

**Example:**

```
[{Image src='/photo.jpg' caption='Team photo at conference'}]
```

This automatically uses "Team photo at conference" as the alt text.

### Caption Best Practices

- Keep captions concise but descriptive
- Captions appear below the image
- Captions are optional but recommended

## Responsive Images

Use percentage-based widths for responsive images:

```
[{Image src='/photo.jpg' width='100%' caption='Responsive image'}]
```

Or use the `display='full'` mode for full-width responsive images:

```
[{Image src='/photo.jpg' display='full' caption='Full-width responsive'}]
```

## Performance Tips

1. **Optimize images before upload** - compress and resize images appropriately
2. **Use appropriate dimensions** - specify `width` and `height` to prevent layout shift
3. **Consider lazy loading** - large images may benefit from lazy loading (future feature)
4. **Use thumbnails for galleries** - create smaller versions for grid layouts

## Examples Gallery

### Scientific Diagram

```
[{Image src='/attachments/nerve-action-potential.jpg'
  align='left'
  display='block'
  caption='Nerve Action Potentials'
  width='400'
  border='1'}]
```

### Hero Banner

```
[{Image src='/attachments/banner.jpg'
  display='full'
  caption='Welcome to ngdpbase'}]
```

### Thumbnail Grid (Manual)

```
[{Image src='/thumb1.jpg' width='200' style='display: inline-block; margin: 10px;'}]
[{Image src='/thumb2.jpg' width='200' style='display: inline-block; margin: 10px;'}]
[{Image src='/thumb3.jpg' width='200' style='display: inline-block; margin: 10px;'}]
```

### Article Illustration

```
[{Image src='/illustration.jpg'
  align='right'
  display='float'
  width='300'
  caption='Figure 2: Process flow'
  style='margin-left: 20px; border-radius: 8px;'}]
```

## Troubleshooting

### Image Not Displaying

1. **Check the path** - ensure `src` path is correct
2. **Verify file exists** - check if image is uploaded to attachments
3. **Check permissions** - ensure you have access to view the attachment
4. **Look for metadata** - verify attachment metadata file exists

### Text Not Wrapping

If text isn't wrapping around your image:

1. Use `display='float'` explicitly
2. Ensure `align='left'` or `align='right'` is set
3. Check that there's enough text content to wrap

### Image Too Large/Small

1. **Specify dimensions** - use `width` and `height` parameters
2. **Use percentages** - `width='50%'` for relative sizing
3. **Use `display='full'`** - for full-width images

### Caption Not Showing

1. **Check syntax** - ensure `caption='text'` is properly quoted
2. **Verify plugin execution** - check browser console for errors
3. **Test simple case** - try `caption='test'` to isolate issue

For uploading files, see [Attachments]. To embed files (PDFs, documents, and images), see [AttachPlugin]. To browse and embed photos from the media library, see [Media].

## More Information

There might be more information for this subject on one of the following:
[{ReferringPagesPlugin before='*' after='\n' }]
