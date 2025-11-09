---
layout: post
title: "Mixed Reality Simulation Labs on a Shoestring"
subtitle: "How we prototyped high-fidelity training with commodity hardware and open-source tooling."
description: "A behind-the-scenes look at building immersive clinical rehearsal spaces for less than the cost of a single mannequin."
tags:
  - simulation
  - education
  - engineering
---

Simulation labs tend to be expensive, centralized, and underbooked. This summer we piloted a mixed reality approach that compresses setup time while expanding who can practice. The secret was ruthless pruning—we only built what made the rehearsal feel emotionally real.

We combined open-source haptic gloves, commodity VR headsets, and a React-based scenario editor. Clinicians can drag-and-drop patient states, medication prompts, and branching complications. During sessions, instructors monitor performance on a tablet mirrored to the headset view, annotating timestamps for debrief.

Usability testing revealed that tactile cues matter more than graphical fidelity. Adding a low-tech vibration motor to a stethoscope replica transferred realism better than doubling polygon counts. The next milestone is to publish the hardware BOM and firmware so other teams can remix the setup. Democratizing rehearsal should not require a seven-figure budget.

