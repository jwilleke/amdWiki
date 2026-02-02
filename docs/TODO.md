---
title: amdWiki Development TODO
category: System
user-keywords:
  - todo
  - planning
  - roadmap
uuid: 124f3d52-75a0-4e61-8008-de37d1da4ef6
lastModified: '2026-01-27T00:00:00.000Z'
slug: amdwiki-todo
---

# Project Development TODO

 The tag v1.5.5 was just pushed, so the Docker build should be running now. But if you want it to auto-trigger whenever the version file changes (without manually creating a tag), we'd need to modify the workflow to also trigger on pushes to master that change
  package.json, and have it read the version from there.

  Want me to add that auto-trigger, or is the tag-based approach fine going forward? The tag approach is actually the more standard practice — it gives you explicit control over which commits become Docker releases.

## [BUG] Broken Search Page #222

Include User Keywords

Put "Search Text" on one row at top

```html
<div class="col-md-4">
  <label for="query" class="form-label fw-bold">
    <i class="fas fa-search me-1"></i>Search Text
  </label>
  <input type="text" class="form-control" id="query" name="q" value="" placeholder="Enter search terms...">
</div>
```

Following row with "Search In"

<div class="col-md-4">
  <label class="form-label fw-bold">
    <i class="fas fa-filter me-1"></i>Search In
  </label>
  <div class="border rounded p-2" style="max-height: 120px; overflow-y: auto;">
    <div class="form-check">
      <-- This is default >
      <input class="form-check-input" type="checkbox" id="searchIn_all" name="searchIn" value="all" checked="">
      <label class="form-check-label" for="searchIn_all">All Fields</label>
    </div>
    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="searchIn_title" name="searchIn" value="title">
      <label class="form-check-label" for="searchIn_title">Page Titles</label>
    </div>
    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="searchIn_content" name="searchIn" value="content">
      <label class="form-check-label" for="searchIn_content">Page Content</label>
    </div>
    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="searchIn_category" name="searchIn" value="category">
      <label class="form-check-label" for="searchIn_category">Categories</label>
    </div>
    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="searchIn_keywords" name="searchIn" value="keywords">
      <label class="form-check-label" for="searchIn_keywords">Keywords</label>
    </div>
  </div>
</div>

Then onsame row add "Include Categories"

NONE Checked by Default

``` html
<div class="col-md-6">
  <label class="form-label fw-bold">
    <i class="fas fa-folder me-1"></i>Include Categories
  </label>
  <div class="border rounded p-2" style="max-height: 150px; overflow-y: auto;">

    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="category_developer" name="category" value="developer">
      <label class="form-check-label" for="category_developer">
        developer
      </label>
    </div>

    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="category_documentation" name="category" value="documentation">
      <label class="form-check-label" for="category_documentation">
        documentation
      </label>
    </div>

    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="category_general" name="category" value="general">
      <label class="form-check-label" for="category_general">
        general
      </label>
    </div>

    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="category_system" name="category" value="system">
      <label class="form-check-label" for="category_system">
        system
      </label>
    </div>

  </div>
</div>
```

Then on same row "Include User Keywords"
NONE Checked by Default

```html
<div class="col-md-6">
  <label class="form-label fw-bold">
    <i class="fas fa-tags me-1"></i>Include User Keywords
  </label>
  <div class="border rounded p-2" style="max-height: 150px; overflow-y: auto;">

    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="keyword_default" name="keywords" value="default">
      <label class="form-check-label" for="keyword_default">
        default
      </label>
    </div>

    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="keyword_private" name="keywords" value="private">
      <label class="form-check-label" for="keyword_private">
        private
      </label>
    </div>

    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="keyword_draft" name="keywords" value="draft">
      <label class="form-check-label" for="keyword_draft">
        draft
      </label>
    </div>

    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="keyword_review" name="keywords" value="review">
      <label class="form-check-label" for="keyword_review">
        review
      </label>
    </div>

    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="keyword_published" name="keywords" value="published">
      <label class="form-check-label" for="keyword_published">
        published
      </label>
    </div>

    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="keyword_medicine" name="keywords" value="medicine">
      <label class="form-check-label" for="keyword_medicine">
        medicine
      </label>
    </div>

    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="keyword_geology" name="keywords" value="geology">
      <label class="form-check-label" for="keyword_geology">
        geology
      </label>
    </div>

    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="keyword_meteorology" name="keywords" value="meteorology">
      <label class="form-check-label" for="keyword_meteorology">
        meteorology
      </label>
    </div>

    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="keyword_oceanography" name="keywords" value="oceanography">
      <label class="form-check-label" for="keyword_oceanography">
        oceanography
      </label>
    </div>

    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="keyword_psychology" name="keywords" value="psychology">
      <label class="form-check-label" for="keyword_psychology">
        psychology
      </label>
    </div>

    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="keyword_sociology" name="keywords" value="sociology">
      <label class="form-check-label" for="keyword_sociology">
        sociology
      </label>
    </div>

    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="keyword_anthropology" name="keywords" value="anthropology">
      <label class="form-check-label" for="keyword_anthropology">
        anthropology
      </label>
    </div>

    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="keyword_economics" name="keywords" value="economics">
      <label class="form-check-label" for="keyword_economics">
        economics
      </label>
    </div>

    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="keyword_political_science" name="keywords"
        value="political-science">
      <label class="form-check-label" for="keyword_political_science">
        political-science
      </label>
    </div>

  </div>
</div>
```

ON New Row The "Search" button

```html
<div class="col-md-4 d-flex align-items-end">
  <button class="btn btn-primary w-100" type="submit">
    <i class="fas fa-search me-1"></i>Search
  </button>
</div>
```

So we could have a query for "Search Text" in "All Fields"
which could be narrowed by "Include Categories" (A specific category)
AND
which could be narrowed by "Include User Keywords" (A specific keyword)
