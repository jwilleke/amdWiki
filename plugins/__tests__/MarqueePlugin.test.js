/**
 * Unit tests for MarqueePlugin (#454)
 *
 * @jest-environment node
 */

const MarqueePlugin = require('../MarqueePlugin');

const ctx = { pageName: 'TestPage', linkGraph: {} };

describe('MarqueePlugin — metadata', () => {
  test('has expected name and execute function', () => {
    expect(MarqueePlugin.name).toBe('MarqueePlugin');
    expect(typeof MarqueePlugin.execute).toBe('function');
  });
});

describe('MarqueePlugin — missing text', () => {
  test('returns an error message when text is omitted', () => {
    const out = MarqueePlugin.execute(ctx, {});
    expect(out).toContain('no text provided');
  });

  test('returns an error message when text is empty string', () => {
    const out = MarqueePlugin.execute(ctx, { text: '' });
    expect(out).toContain('no text provided');
  });
});

describe('MarqueePlugin — basic output', () => {
  test('wraps text in a marquee container', () => {
    const out = MarqueePlugin.execute(ctx, { text: 'Hello World' });
    expect(out).toContain('ngdp-marquee-wrap');
    expect(out).toContain('ngdp-marquee-inner');
    expect(out).toContain('Hello World');
  });

  test('includes a <style> block with @keyframes', () => {
    const out = MarqueePlugin.execute(ctx, { text: 'Hello' });
    expect(out).toContain('<style>');
    expect(out).toContain('@keyframes');
  });

  test('duplicates text for seamless scroll loop (default behavior)', () => {
    const out = MarqueePlugin.execute(ctx, { text: 'Ticker' });
    const count = (out.match(/Ticker/g) || []).length;
    expect(count).toBeGreaterThanOrEqual(2);
  });
});

describe('MarqueePlugin — XSS safety', () => {
  test('escapes HTML in text', () => {
    const out = MarqueePlugin.execute(ctx, { text: '<script>alert(1)</script>' });
    expect(out).not.toContain('<script>');
    expect(out).toContain('&lt;script&gt;');
  });

  test('escapes HTML in separator', () => {
    const out = MarqueePlugin.execute(ctx, { text: 'Hi', separator: '<b>SEP</b>' });
    expect(out).not.toContain('<b>SEP</b>');
    expect(out).toContain('&lt;b&gt;SEP&lt;/b&gt;');
  });

  test('escapes HTML in cssclass', () => {
    const out = MarqueePlugin.execute(ctx, { text: 'Hi', cssclass: '"onmouseover=alert(1)' });
    expect(out).not.toContain('"onmouseover=alert(1)');
  });
});

describe('MarqueePlugin — speed parameter', () => {
  test('slow speed produces 30s animation', () => {
    const out = MarqueePlugin.execute(ctx, { text: 'Hi', speed: 'slow' });
    expect(out).toContain('30s');
  });

  test('fast speed produces 10s animation', () => {
    const out = MarqueePlugin.execute(ctx, { text: 'Hi', speed: 'fast' });
    expect(out).toContain('10s');
  });

  test('medium (default) produces 20s animation', () => {
    const out = MarqueePlugin.execute(ctx, { text: 'Hi' });
    expect(out).toContain('20s');
  });

  test('numeric speed is used directly', () => {
    const out = MarqueePlugin.execute(ctx, { text: 'Hi', speed: '7' });
    expect(out).toContain('7s');
  });

  test('invalid speed falls back to medium (20s)', () => {
    const out = MarqueePlugin.execute(ctx, { text: 'Hi', speed: 'turbo' });
    expect(out).toContain('20s');
  });
});

describe('MarqueePlugin — direction parameter', () => {
  test('left direction (default) animates toward negative translateX', () => {
    const out = MarqueePlugin.execute(ctx, { text: 'Hi', direction: 'left' });
    expect(out).toContain('translateX(-50%)');
  });

  test('right direction animates starting from negative translateX', () => {
    const out = MarqueePlugin.execute(ctx, { text: 'Hi', direction: 'right' });
    // right: keyframe starts at -50%
    expect(out).toContain('translateX(-50%)');
  });

  test('unknown direction defaults to left', () => {
    const out = MarqueePlugin.execute(ctx, { text: 'Hi', direction: 'up' });
    expect(out).toContain('translateX(-50%)');
  });
});

describe('MarqueePlugin — behavior parameter', () => {
  test('behavior=slide does not duplicate text in content', () => {
    const out = MarqueePlugin.execute(ctx, { text: 'Unique', behavior: 'slide' });
    // aria-label + 1 content occurrence = 2 total (no duplication in content)
    const count = (out.match(/Unique/g) || []).length;
    expect(count).toBe(2);
  });

  test('behavior=slide uses ease-out timing', () => {
    const out = MarqueePlugin.execute(ctx, { text: 'Hi', behavior: 'slide' });
    expect(out).toContain('ease-out');
  });

  test('behavior=alternate does not duplicate text in content', () => {
    const out = MarqueePlugin.execute(ctx, { text: 'Bounce', behavior: 'alternate' });
    // aria-label + 1 content occurrence = 2 total (no duplication in content)
    const count = (out.match(/Bounce/g) || []).length;
    expect(count).toBe(2);
  });

  test('behavior=alternate uses ease-in-out timing', () => {
    const out = MarqueePlugin.execute(ctx, { text: 'Hi', behavior: 'alternate' });
    expect(out).toContain('ease-in-out');
  });
});

describe('MarqueePlugin — styling parameters', () => {
  test('bgcolor is applied to wrapper style', () => {
    const out = MarqueePlugin.execute(ctx, { text: 'Hi', bgcolor: '#ff0000' });
    expect(out).toContain('background:#ff0000');
  });

  test('color is applied to wrapper style', () => {
    const out = MarqueePlugin.execute(ctx, { text: 'Hi', color: 'white' });
    expect(out).toContain('color:white');
  });

  test('cssclass is added to wrapper', () => {
    const out = MarqueePlugin.execute(ctx, { text: 'Hi', cssclass: 'my-banner' });
    expect(out).toContain('my-banner');
  });
});

describe('MarqueePlugin — pause on hover', () => {
  test('inner span has mouse event handlers for pause/resume', () => {
    const out = MarqueePlugin.execute(ctx, { text: 'Hi' });
    expect(out).toContain('onmouseenter');
    expect(out).toContain('onmouseleave');
    expect(out).toContain('animationPlayState');
  });
});

describe('MarqueePlugin — accessibility', () => {
  test('wrapper has aria-label with original text', () => {
    const out = MarqueePlugin.execute(ctx, { text: 'Accessible text' });
    expect(out).toContain('aria-label="Accessible text"');
  });
});

describe('MarqueePlugin — multiple instances', () => {
  test('each call produces a unique keyframe name', () => {
    const out1 = MarqueePlugin.execute(ctx, { text: 'A' });
    const out2 = MarqueePlugin.execute(ctx, { text: 'B' });
    const id1 = (out1.match(/@keyframes (ngdp-mq-\d+)/) || [])[1];
    const id2 = (out2.match(/@keyframes (ngdp-mq-\d+)/) || [])[1];
    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id1).not.toBe(id2);
  });
});
