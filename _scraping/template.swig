---
layout: single
title: "{{ title }}"
redirect_from: /node/{{ id }}
categories:
tags: {{ tags | join(',') }}
comments: {% for comment in comments %}
    - author: {{ comment.author}}
      date: {{ comment.date }}
      text: |
        {{ comment.comment }}{% endfor %}
---
{{ content | safe }}
