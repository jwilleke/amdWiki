---
name: "MarqueePlugin"
description: "CSS-based horizontally scrolling text banner"
dateModified: "2026-04-05"
category: "plugins"
relatedModules: ["PluginManager"]
version: "1.0.0"
---

# MarqueePlugin

Displays a horizontally scrolling text banner using CSS animation (not the
deprecated `<marquee>` HTML element).  Pauses on mouse hover.  Multiple
banners on the same page each get an isolated `@keyframes` name so they
never interfere with each other.

**Source:** `plugins/MarqueePlugin.ts`

## Plugin Metadata

| Property | Value |
| --- | --- |
| Name | MarqueePlugin |
| Author | ngdpbase |
| Version | 1.0.0 |
| JSPWiki Compatible | Partial (new plugin, no JSPWiki equivalent) |

## Usage

### Minimal

```wiki
[{MarqueePlugin text='Hello World!'}]
```

### Full Example

```wiki
[{MarqueePlugin text='Breaking News: server maintenance at midnight'
               speed='fast'
               direction='left'
               bgcolor='#fff3cd'
               color='#856404'
               separator=' ★ '}]
```

## Parameters

| Parameter | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `text` | string | — | **Yes** | The message to scroll. |
| `speed` | string \| number | `medium` | No | `slow` (30 s), `medium` (20 s), `fast` (10 s), or a number of seconds per cycle. |
| `direction` | string | `left` | No | `left` or `right`. |
| `behavior` | string | `scroll` | No | `scroll` (seamless loop), `slide` (enter and stop), `alternate` (bounce). |
| `loop` | string \| number | `infinite` | No | Number of passes or `infinite`. Applies to `slide` / `alternate` only; `scroll` is always infinite. |
| `bgcolor` | string | — | No | CSS `background` value for the banner strip (e.g. `#ffe` or `rgba(0,0,0,.1)`). |
| `color` | string | — | No | CSS `color` value for the text. |
| `separator` | string | `•` | No | String inserted between the two repetitions in `scroll` mode. |
| `cssclass` | string | — | No | Extra CSS class added to the outer wrapper `<div>`. |

## Behaviors

### `scroll` (default)

Text is duplicated internally so the loop appears seamless.  The duplicate
is hidden offscreen while the original scrolls off — no visible jump at
the wrap point.

### `slide`

Text enters from the off-screen side and stops flush with the opposite
edge.  Good for one-time announcements.  Combine with `loop='1'` to play
once.

### `alternate`

Text bounces between the left and right edges.  Direction of the first
movement is controlled by `direction`.

## Examples

### Announcement Banner

```wiki
[{MarqueePlugin text='Community meeting Tuesday 7 PM in the clubhouse'
               speed='slow' bgcolor='#d1ecf1' color='#0c5460'}]
```

### Error / Alert Strip

```wiki
[{MarqueePlugin text='System maintenance window: 02:00–04:00 UTC'
               speed='fast' bgcolor='#f8d7da' color='#721c24'}]
```

### Slide-In Once

```wiki
[{MarqueePlugin text='Welcome to the site!' behavior='slide' loop='1' speed='slow'}]
```

### Right-to-Left Scroll

```wiki
[{MarqueePlugin text='Latest updates' direction='right'}]
```

### Custom Separator

```wiki
[{MarqueePlugin text='News item one' separator=' | '}]
```

## Technical Implementation

### Output Structure

```html
<style>@keyframes ngdp-mq-N { from{…} to{…} }</style>
<div class="ngdp-marquee-wrap [cssclass]"
     style="overflow:hidden;white-space:nowrap;[bgcolor];[color]"
     aria-label="[text]">
  <span class="ngdp-marquee-inner"
        style="display:inline-block;animation:ngdp-mq-N Xs linear infinite;…"
        onmouseenter="this.style.animationPlayState='paused'"
        onmouseleave="this.style.animationPlayState='running'">
    [text][separator][text][separator]   <!-- scroll: duplicated -->
    [text]                                <!-- slide/alternate: single -->
  </span>
</div>
```

### XSS Safety

`text`, `separator`, and `cssclass` are passed through `escapeHtml()` from
`src/utils/pluginFormatters.ts` before being written into the HTML output.
`bgcolor` and `color` are written into a `style` attribute; values
containing `"` or `;` are not further sanitised — authors should use only
valid CSS colour values.

### Unique Keyframe Names

A module-level counter increments on each `execute()` call producing names
`ngdp-mq-1`, `ngdp-mq-2`, … so multiple banners never share a keyframe
definition.

## Error Handling

| Condition | Output |
| --- | --- |
| `text` omitted or empty | `<span class="text-muted"><em>[MarqueePlugin: no text provided]</em></span>` |
| Invalid `speed` value | Falls back to `medium` (20 s) |
| Invalid `direction` value | Falls back to `left` |
| Invalid `behavior` value | Falls back to `scroll` |

## Tests

`plugins/__tests__/MarqueePlugin.test.js` — 27 tests covering metadata,
missing-text guard, XSS safety, speed presets, direction, all three
behaviors, styling parameters, hover pause, aria-label, and unique keyframe
names per instance.

## Related Documentation

- [Plugin System Architecture](../architecture/Plugin-Architecture.md)
- [PluginManager](../managers/PluginManager.md)
- [pluginFormatters utility](../../src/utils/pluginFormatters.ts)

## Version History

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2026-04-05 | Initial implementation (#454) |
