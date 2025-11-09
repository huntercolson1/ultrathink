---
title: Markdown Display Capabilities
subtitle: A comprehensive showcase of all markdown features
tags: [demo, markdown, showcase]
date: 2024-12-15
---

This post demonstrates all the markdown display capabilities available on this site. From basic formatting to advanced features, here's everything you can use in your posts.

* Table of Contents
{:toc}

---

## Headers

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

---

## Text Formatting

This paragraph demonstrates **bold text**, *italic text*, ***bold and italic***, and `inline code`. You can also use ~~strikethrough text~~ and <mark>highlighted text</mark> (if supported).

Here's some `inline code` with backticks, and here's some more **bold** and *italic* formatting.

---

## Lists

### Unordered Lists

- First item
- Second item
  - Nested item one
  - Nested item two
    - Deeply nested item
- Third item
- Fourth item

### Ordered Lists

1. First numbered item
2. Second numbered item
3. Third numbered item
   1. Nested numbered item
   2. Another nested item
4. Fourth numbered item

### Task Lists (GFM)

- [x] Completed task
- [x] Another completed task
- [ ] Incomplete task
- [ ] Another incomplete task
- [x] Mixed with regular list items

---

## Code Blocks

### Inline Code

Use `backticks` for inline code like `const x = 42;` or `function hello() {}`.

### Code Blocks with Syntax Highlighting

```javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log(result);
```

```python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)
```

```html
<!DOCTYPE html>
<html>
<head>
    <title>Example</title>
</head>
<body>
    <h1>Hello, World!</h1>
</body>
</html>
```

```css
.container {
    display: flex;
    gap: 1rem;
    padding: 2rem;
}

@media (max-width: 768px) {
    .container {
        flex-direction: column;
    }
}
```

---

## Links

### Inline Links

This is an [inline link](https://example.com) to an external site. Here's another link to [GitHub](https://github.com) and one to [Wikipedia](https://wikipedia.org).

### Reference-Style Links

This is a [reference-style link][ref1] and here's [another one][ref2]. You can also use [implicit link names][].

[ref1]: https://example.com
[ref2]: https://github.com
[implicit link names]: https://wikipedia.org

### Auto-links

Visit https://example.com or email someone@example.com.

---

## Images

![Alt text for image](https://via.placeholder.com/800x400/333333/FFFFFF?text=Example+Image)

You can also use reference-style images:

![Another image][img-ref]

[img-ref]: https://via.placeholder.com/600x300/666666/FFFFFF?text=Reference+Style+Image

---

## Blockquotes

> This is a blockquote. It can span multiple lines and contain
> various types of content including **bold text**, *italic text*,
> and even `code`.

> ### Nested Blockquote
> 
> You can nest blockquotes:
> 
> > This is a nested blockquote
> > with multiple lines
> 
> And continue with the outer quote.

> Blockquotes can also contain lists:
> 
> 1. First item
> 2. Second item
> 3. Third item

---

## Tables

| Column 1 | Column 2 | Column 3 | Column 4 |
|----------|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   | Cell 4   |
| Data A   | Data B   | Data C   | Data D   |
| Value 1  | Value 2  | Value 3  | Value 4  |

### Aligned Tables

| Left Aligned | Center Aligned | Right Aligned |
|:-------------|:--------------:|--------------:|
| Left         | Center         | Right         |
| Text         | Text           | Text          |
| More         | More           | More          |

### Complex Tables

| Feature | Status | Notes |
|---------|:------:|-------|
| Markdown | ✅ | Fully supported |
| Syntax Highlighting | ✅ | Via kramdown |
| Tables | ✅ | GFM style |
| Task Lists | ✅ | Checkbox support |
| Math | ✅ | LaTeX syntax |

---

## Horizontal Rules

You can use horizontal rules to separate sections:

---

Or with different styles:

***

___

---

## Definition Lists

Term 1
: Definition for term 1
: Another definition for term 1

Term 2
: Definition for term 2
: Another definition for term 2

---

## Math (LaTeX)

### Inline Math

The quadratic formula is $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$.

Euler's identity: $e^{i\pi} + 1 = 0$

### Block Math

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

$$
\begin{aligned}
\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} &= \frac{4\pi}{c}\vec{\mathbf{j}} \\
\nabla \cdot \vec{\mathbf{E}} &= 4 \pi \rho \\
\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t} &= \vec{\mathbf{0}} \\
\nabla \cdot \vec{\mathbf{B}} &= 0
\end{aligned}
$$

---

## Escaping

You can escape special characters: \*not italic\*, \`not code\`, \[not a link\].

---

## Line Breaks

This line has two spaces at the end.  
This creates a line break.

Or use a blank line for a paragraph break.

---

## Abbreviations

The HTML specification is maintained by the W3C.

*[HTML]: HyperText Markup Language
*[W3C]: World Wide Web Consortium

---

## Footnotes

Here's a sentence with a footnote[^1]. And here's another reference[^note].

[^1]: This is the first footnote.
[^note]: This is a named footnote with more content. It can span multiple lines and contain **formatting** and `code`.

---

## Mixed Content Example

Here's a paragraph that combines multiple features: **bold text**, *italic text*, `inline code`, and a [link](https://example.com). You can also include math like $E = mc^2$ inline.

> This blockquote contains:
> 
> 1. A numbered list
> 2. With **bold** and *italic* text
> 3. And `code` examples
> 
> And even a table:
> 
> | A | B |
> |---|---|
> | 1 | 2 |

---

## Summary

This post demonstrates:

- ✅ Headers (H1-H6)
- ✅ Text formatting (bold, italic, strikethrough, code)
- ✅ Lists (ordered, unordered, nested, task lists)
- ✅ Code blocks with syntax highlighting
- ✅ Links (inline and reference-style)
- ✅ Images
- ✅ Blockquotes
- ✅ Tables (with alignment)
- ✅ Horizontal rules
- ✅ Definition lists
- ✅ Math equations (LaTeX)
- ✅ Escaping special characters
- ✅ Line breaks
- ✅ Abbreviations
- ✅ Footnotes

All of these features are available for use in your blog posts!
