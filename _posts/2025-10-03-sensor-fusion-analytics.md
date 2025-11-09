---
layout: post
title: "Sensor Fusion Analytics for Hybrid Care Teams"
subtitle: "Coordinating bedside and remote monitoring without overwhelming clinicians."
description: "Architecture notes from unifying telemetry streams across inpatient rooms, wearables, and home devices."
tags:
  - analytics
  - remote-care
  - engineering
---

Telemetry is abundant; insight is scarce. When we connected inpatient monitors, wearable patches, and home vitals into a unified stream, clinicians immediately asked: *Which of these numbers deserves my attention right now?* The goal of this project was to make sure the answer arrives before alarm fatigue does.

We built a rules engine that merges signals into composite stories—"Patient resting comfortably, PT session scheduled in 40 minutes, nocturnal desaturation trend improving." Instead of dashboards filled with line charts, teams receive narrative summaries with drill-down links. The system flags anomalies using Bayesian changepoint detection, but every alert includes a plain-language rationale to keep humans in the loop.

The biggest win came from pairing remote care teams with bedside nurses through shared annotations. When an at-home clinician tags a trend, the inpatient counterpart sees it in context, reducing duplicated outreach. Next iteration, we will experiment with generative summaries that adapt tone based on who is reading—surgeon, dietitian, or family caregiver.

