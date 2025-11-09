---
layout: post
title: "Building a Data Compass for Rounds"
subtitle: "Turning scattered vitals and notes into a single glanceable briefing."
description: "Lessons learned from designing a rounding dashboard that keeps teams aligned without drowning them in alerts."
tags:
  - product
  - engineering
  - medicine
---

Every care team has that whiteboard photo taped to a workstation. It is the unofficial "truth" about bed status, pending consults, and discharge blockers. My goal this winter was to build a living digital equivalent that could be trusted the way sharpie on laminated plastic is trusted.

I started with ethnographic interviews and shadowing charge nurses. Their requirement list was short but non-negotiable: no scrollbars, fewer than seven categories, and the ability to surface a single patient's trajectory without navigating away. We iterated through four Figma prototypes and two live pilots before discovering the right balance between structured data and open annotation space.

The result is a responsive canvas that auto-prioritizes tasks by acuity, highlights unresolved orders, and pulls in social work notes when discharge plans stall. The engineering challenge was keeping the sync lightweight—so we opted for edge caching on tablets and a WebSocket fall back when Wi-Fi flickers. Next sprint we will integrate predictive risk scores, but only after clinicians can override them with a single tap. Trust is the real feature here.

