---
layout: post
title: Post title goes here
date: 2026-07-02 12:00:00 -0400
description: One-line summary shown on the blog index and in search results.
tags: []
categories: []
# typograms: false
# related_posts: true
---

Write your opening paragraph here.

## A section heading

More text. Use **bold**, *italics*, and [links](https://example.com) as usual.

### Code

Inline code looks like `variable_name`. For a block, use fenced code with a language tag:

```python
import pandas as pd

df = pd.read_csv("data.csv")
print(df.head())
```

```r
fit <- lm(y ~ x, data = dat)
summary(fit)
```

### A figure

Put images in `assets/img/`, then reference them like this:

<div class="col-sm mt-3 mt-md-0">
  {% include figure.liquid path="assets/img/prof_pic.jpg" class="img-fluid rounded z-depth-1" zoomable=true %}
</div>

Add a caption after the figure if you want.

### Another section

Keep writing.

---

**To publish:** move this file to `_posts/YYYY-MM-DD-your-slug.md`, set the `date`, and fill in `title` / `description` / `tags`.

**To preview locally:** with Docker running, open `http://127.0.0.1:8080/blog/YYYY/your-slug/` (drafts in `_drafts/` are built with `--drafts`; they are not deployed to GitHub Pages).
