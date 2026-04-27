/**
 * imageTransform — parseSize + transformImage tests
 *
 * @jest-environment node
 */
import { parseSize, transformImage } from '../imageTransform';

const mockPipeline = vi.hoisted(() => ({
  rotate: vi.fn().mockReturnThis(),
  resize: vi.fn().mockReturnThis(),
  jpeg: vi.fn().mockReturnThis(),
  webp: vi.fn().mockReturnThis(),
  png: vi.fn().mockReturnThis(),
  toBuffer: vi.fn().mockResolvedValue(Buffer.from('mock-image-data'))
}));

vi.mock('sharp', () => ({
  default: vi.fn().mockReturnValue(mockPipeline)
}));

describe('parseSize', () => {
  test('parses "300x300"', () => {
    expect(parseSize('300x300')).toEqual({ width: 300, height: 300 });
  });

  test('parses "150x100"', () => {
    expect(parseSize('150x100')).toEqual({ width: 150, height: 100 });
  });

  test('parses "1920x1080"', () => {
    expect(parseSize('1920x1080')).toEqual({ width: 1920, height: 1080 });
  });

  test('returns null for missing separator', () => {
    expect(parseSize('300300')).toBeNull();
  });

  test('returns null for x at start (sep < 1)', () => {
    expect(parseSize('x300')).toBeNull();
  });

  test('returns null for non-numeric width', () => {
    expect(parseSize('abcx300')).toBeNull();
  });

  test('returns null for non-numeric height', () => {
    expect(parseSize('300xabc')).toBeNull();
  });

  test('returns null for zero width', () => {
    expect(parseSize('0x300')).toBeNull();
  });

  test('returns null for zero height', () => {
    expect(parseSize('300x0')).toBeNull();
  });

  test('returns null for negative width', () => {
    expect(parseSize('-100x300')).toBeNull();
  });

  test('returns null for empty string', () => {
    expect(parseSize('')).toBeNull();
  });
});

describe('transformImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPipeline.rotate.mockReturnThis();
    mockPipeline.resize.mockReturnThis();
    mockPipeline.jpeg.mockReturnThis();
    mockPipeline.webp.mockReturnThis();
    mockPipeline.png.mockReturnThis();
    mockPipeline.toBuffer.mockResolvedValue(Buffer.from('mock'));
  });

  test('transforms to jpeg with width and height', async () => {
    const result = await transformImage(Buffer.from('input'), { width: 300, height: 200, format: 'jpeg' });

    expect(result).toBeInstanceOf(Buffer);
    expect(mockPipeline.resize).toHaveBeenCalledWith(300, 200, { fit: 'inside' });
    expect(mockPipeline.jpeg).toHaveBeenCalled();
  });

  test('transforms to webp without resize', async () => {
    const result = await transformImage(Buffer.from('input'), { format: 'webp', quality: 75 });

    expect(result).toBeInstanceOf(Buffer);
    expect(mockPipeline.resize).not.toHaveBeenCalled();
    expect(mockPipeline.webp).toHaveBeenCalledWith({ quality: 75 });
  });

  test('transforms to png', async () => {
    const result = await transformImage(Buffer.from('input'), { format: 'png' });

    expect(result).toBeInstanceOf(Buffer);
    expect(mockPipeline.png).toHaveBeenCalled();
    expect(mockPipeline.jpeg).not.toHaveBeenCalled();
  });
});
