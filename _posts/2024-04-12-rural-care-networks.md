---
layout: post
title: "Designing Rural Care Networks with Off-Grid Connectivity"
subtitle: "Mapping the minimum viable stack for clinics that lose power weekly."
description: "A field report from rolling out resilient communication tools across four mountain clinics in the spring thaw."
tags:
  - infrastructure
  - medicine
  - operations
---

The best training for building resilient digital systems is spending a week somewhere that electricity is a rumor. Spring breakup in the mountains is beautiful, but it also means landslides, downed lines, and a lot of manual triage. Our team partnered with four rural clinics to design and deploy an offline-first messaging layer that keeps referrals flowing even when the grid disappears.

We focused on three layers:

1. **Local-first data capture.** Every endpoint caches encounter notes and orders in encrypted storage, then syncs opportunistically when a connection appears. No spinner, no panic.
2. **Mesh relays.** A mix of solar-powered LoRa repeaters and community Wi-Fi nodes bounce packets across valleys. The network is slow but steady, which is all the clinical workflows require.
3. **People processes.** We trained super users who run daily radio check-ins and escalate only when thresholds are crossed. The tech works because the community owns it.

The early metrics are promising—referral delays dropped by 34% and inventory reconciliation time halved. Next season we are layering in tele-ultrasound consults, but only after we co-create downtime protocols. Reliability is as cultural as it is technical.

