# ## 📝 Content Management

## Metadata & Organization
* **[Page-Metadata](../pages/Page-Metadata)** - **COMPLETE metadata field documentation**
* **[Categories]** - Available category values
* **[System Keywords]** - System-level keyword management
* **[User Keywords]** - User keyword management
* **[Metadata Cleanup Progress]** - Metadata standardization progress

## Templates & Styling
* **[Footer]** - Wiki footer configuration
* **[LeftMenu]** - Navigation menu configuration
* **[Welcome]** - Default welcome page content

## Plugins & Extensions
* **[Image Plugin]** - Inline image support with upload functionality

### Image Plugin
The Image plugin enables inline image insertion using JSPWiki-compatible syntax:

**Basic Usage:**
```markdown
[{Image src='image.jpg' alt='Description'}]
```

**Available Parameters:**
* `src` (required): Image path or URL
* `alt`: Alternative text for accessibility
* `width`: Image width in pixels
* `height`: Image height in pixels
* `class`: CSS class for styling
* `style`: Inline CSS styles
* `caption`: Text displayed below the image
* `align`: Image alignment (left, right, center)
* `link`: URL to link the image to
* `border`: Border size in pixels
* `title`: Hover text for the image

**Examples:**
```markdown
[{Image src='photo.jpg' alt='My Photo' width='300' height='200'}]
[{Image src='/images/logo.png' class='logo'}]
[{Image src='https://example.com/image.gif' style='border: 1px solid black;'}]
[{Image src='flowers.jpg' alt='Flowers' caption='Our Flowers' align='left' style='font-size: 120%;background-color: white;'}]
[{Image src='thumbnail.jpg' link='full-image.jpg' title='Click to enlarge'}]
```

**Image Upload:**
* Images can be uploaded through the page editor interface
* Supported formats: JPEG, PNG, GIF, WebP
* Maximum file size: 5MB (configurable)
* Uploaded images are stored in `/public/images/`
* Use relative paths for uploaded images or absolute URLs for external images
