---
title: "Blog"
nav_order: 2
---

# Blog

Essays, updates, and tutorials. Latest posts are below.

<ul class="list-style-none">
{% assign posts = site.blog | sort: 'date' | reverse %}
{% for post in posts limit:10 %}
  <li class="mb-2">
    <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    <span class="fs-2 text-grey-dk-000"> — {{ post.date | date: "%b %-d, %Y" }}</span>
    {% if post.summary %}<div class="fs-2 text-grey-dk-000">{{ post.summary }}</div>{% endif %}
  </li>
{% endfor %}
</ul>
