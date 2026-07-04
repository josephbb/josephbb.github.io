---
layout: post
title: Code and figures reference (draft)
date: 2026-01-01 12:00:00 -0500
description: Cheat sheet for blog formatting — not for publishing.
tags: reference
categories: reference
---

This file lives in `_drafts/`, so it is previewable locally but not deployed. Copy snippets into your real post.

## Figures

Single image with lightbox zoom:

<div class="col-sm mt-3 mt-md-0">
  {% include figure.liquid path="assets/img/prof_pic.jpg" class="img-fluid rounded z-depth-1" zoomable=true %}
</div>

With a caption:

<div class="col-sm mt-3 mt-md-0">
  {% include figure.liquid path="assets/img/prof_pic.jpg" class="img-fluid rounded z-depth-1" zoomable=true caption="Optional caption text." %}
</div>

Two figures side by side (use two columns):

<div class="row">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid path="assets/img/prof_pic.jpg" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid path="assets/img/prof_pic.jpg" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
</div>

## Code

```python
def hello(name: str) -> None:
    print(f"Hello, {name}")
```

```bash
bundle exec jekyll serve
```

Code inside a list item needs extra indentation (3 spaces per list level):

1. First step.

   ```python
   x = 1
   ```

2. Second step.

## Blockquote

> A quoted passage or callout.

## Math (optional)

If you enable math in `_config.yml`, inline $E = mc^2$ and display math work:

$$
\hat{\beta} = (X^\top X)^{-1} X^\top y
$$
