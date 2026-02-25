---
layout: ../../layouts/ArticleLayout.astro
title: 'Building a Flat File CMS with Astro'
pubDate: 2026-02-25
description: 'Learn how to create a lightweight Flat File CMS using Astro, without needing a database.'
author: 'Miguel Benjamin Zubieta Rios'
tags: ["astro", "flat-file-cms", "static-site", "jamstack"]
---

# Building a Flat File CMS with Astro

A Flat File CMS is a content management system that stores all content as flat files (like Markdown) instead of relying on a database. This approach is increasingly popular for small to medium-sized projects. Let me walk you through how to build one with Astro.

## Why Choose a Flat File CMS?

### Advantages

- **No Database Needed**: Content is stored as simple text files
- **Version Control**: Easily track changes with Git
- **Performance**: Lightning-fast build times and load times
- **Simplicity**: Easy to understand and modify
- **Portability**: Move your site anywhere without database migrations

### Perfect For

- Blogs and documentation sites
- Small business websites
- Portfolio sites
- Educational projects

## Project Structure

```
src/
├── content/
│   └── posts/
│       ├── article1.md
│       ├── article2.md
│       └── article3.md
├── layouts/
│   ├── ArticleLayout.astro
│   └── BaseLayout.astro
├── pages/
│   ├── index.astro
│   └── article/
│       └── [slug].astro
└── styles/
    └── global.css
```

## Setting Up Content Collections

Astro provides built-in support for Content Collections. Define your schema and let Astro handle the rest:

```javascript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.date(),
    author: z.string(),
    category: z.string(),
  }),
});

export const collections = { posts };
```

## Creating Content

Write your articles in Markdown with frontmatter:

```markdown
---
title: "My Article"
date: 2026-02-25
author: "Your Name"
category: "General"
---

# Article content here

Your markdown content...
```

## Building Dynamic Routes

Create a dynamic route to render articles:

```astro
// src/pages/article/[slug].astro
import { getCollection } from 'astro:content';
import ArticleLayout from '../../layouts/ArticleLayout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('posts');
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();
```

## Key Benefits of This Approach

1. **Easy Deployment**: Deploy to Netlify, Vercel, or any static host
2. **Low Cost**: No server or database fees
3. **Full Control**: Own your content completely
4. **Developer Friendly**: Simple, readable code
5. **SEO Friendly**: Pre-rendered HTML pages

## Conclusion

Building a Flat File CMS with Astro gives you the perfect balance between simplicity and functionality. You get all the benefits of a modern static site generator with straightforward content management.

Start small, iterate, and scale as needed!