import re
from pathlib import Path
import sys

def fix_separator_row(line):
    """Fix a single separator row to have proper spacing."""
    parts = line.split('|')
    fixed_parts = []
    for part in parts:
        stripped = part.strip()
        if stripped and re.match(r'^:?-+:?$', stripped):
            fixed_parts.append(f' {stripped} ')
        else:
            fixed_parts.append(part)
    return '|'.join(fixed_parts)

def fix_markdown_tables(content):
    """Fix markdown table separator rows to have proper spacing."""
    lines = content.split('\n')
    fixed_lines = []
    for i, line in enumerate(lines):
        if re.match(r'^\s*\|[-:\s|]+\|\s*$', line):
            if i > 0 and '|' in lines[i-1]:
                line = fix_separator_row(line)
        fixed_lines.append(line)
    return '\n'.join(fixed_lines)

def process_directory(directory, dry_run=False):
    """Process all markdown files in a directory recursively."""
    path = Path(directory)
    md_files = list(path.rglob('*.md'))
    print(f"Found {len(md_files)} markdown files")
    modified_count = 0
    for filepath in md_files:
        try:
            content = filepath.read_text(encoding='utf-8')
            fixed = fix_markdown_tables(content)
            if content != fixed:
                if dry_run:
                    print(f"Would fix: {filepath}")
                else:
                    filepath.write_text(fixed, encoding='utf-8')
                    print(f"Fixed: {filepath}")
                modified_count += 1
        except Exception as e:
            print(f"Error processing {filepath}: {e}")
    action = 'Would modify' if dry_run else 'Modified'
    print(f"\n{action}: {modified_count} files")

if __name__ == "__main__":
    directory = sys.argv[1] if len(sys.argv) > 1 else "."
    dry_run = "--dry-run" in sys.argv
    process_directory(directory, dry_run=dry_run)
