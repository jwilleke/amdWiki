[**amdWiki API v1.5.0**](../../../README.md)

***

[amdWiki API](../../../README.md) / [plugins/ImagePlugin](../README.md) / export=

# Variable: export=

> `const` **export=**: `object`

Defined in: [plugins/ImagePlugin.js:32](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/plugins/ImagePlugin.js#L32)

Image plugin for amdWiki
Implements inline image functionality similar to JSPWiki's Image plugin

Syntax: [{Image src='path/to/image.jpg' alt='description' width='200' height='150'}]

Parameters:
  src (required) - Image source path or URL
  alt (optional) - Alt text (defaults to caption if not provided)
  caption (optional) - Image caption (also used as alt if alt not provided)
  width (optional) - Image width
  height (optional) - Image height
  align (optional) - Horizontal alignment: left, right, center
  display (optional) - Display mode:
    - float (default): Allows text wrapping around image
    - block: Image in its own block, no text wrapping
    - inline: Image flows inline with text
    - full: Full-width image
  border (optional) - Border width in pixels
  style (optional) - Custom inline CSS styles
  class (optional) - Custom CSS class
  title (optional) - Title attribute (tooltip)
  link (optional) - URL to link the image to

Examples:
  [{Image src='/path/image.jpg' caption='My Image'}]
  [{Image src='/path/image.jpg' align='left' display='float' caption='Floats with text'}]
  [{Image src='/path/image.jpg' align='left' display='block' caption='No text wrapping'}]
  [{Image src='/path/image.jpg' display='full' caption='Full width image'}]

## Type Declaration

### execute()

> **execute**(`context`, `params`): `string`

Execute the plugin

#### Parameters

##### context

`any`

Rendering context

##### params

`any`

Plugin parameters object (parsed from syntax)

#### Returns

`string`

HTML output

### name

> **name**: `string` = `"Image"`
