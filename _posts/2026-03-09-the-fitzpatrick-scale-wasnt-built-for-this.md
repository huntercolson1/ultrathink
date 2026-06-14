---
title: The Fitzpatrick Scale Wasn't Built for This
date: 2026-03-09
author: Hunter Colson
subtitle: Dermatology AI often labels photographs with the Fitzpatrick scale, a clinical measure of sun response. That label choice affects fairness comparisons before model performance is evaluated.
description: How image-based Fitzpatrick labeling works in dermatology AI, what two public consensus pipelines agree on, and why coarse fairness buckets can shift for nearly one in four images.
tags:
  - dermatology
  - ai
  - datasets
  - fairness
  - medical-ai
  - computer-vision
---

## Introduction

Many dermatology AI papers report accuracy separately for lighter and darker skin, often through Fitzpatrick-based groups. Before those numbers can be computed, each image has to be assigned to a skin-type category. In much of this literature, that assignment runs through the Fitzpatrick scale.

Fairness work often starts one step later, with model performance across those groups. The labeling step is treated as settled preprocessing. It usually is not. The Fitzpatrick scale was built to describe how skin responds to sun exposure, not to read skin tone out of a single photograph. When two reasonable labeling pipelines disagree by one step on a six-point scale, that disagreement can still move an image from one coarse fairness bucket to another, which changes the groups before model evaluation begins.

## What Fitzpatrick was designed to measure

The Fitzpatrick scale runs from Type I to Type VI. Clinically, it describes sun sensitivity: at one end, skin that almost always burns; at the other, skin that almost never does, with the middle types falling in between.

<div class="post-figure-card" role="img" aria-label="Simplified explainer of the six-step Fitzpatrick scale from Type I to Type VI.">
  <span class="post-figure-card__label">Quick Explainer</span>
  <p class="post-figure-card__caption" style="margin-top: 0; font-style: normal;">
    The Fitzpatrick scale runs from Type I to Type VI. Clinically, it is about how skin reacts to sun exposure, not just how a photo looks.
  </p>
  <div class="post-scale-grid">
    <div class="post-scale-chip">
      <span class="post-scale-chip__roman">I</span>
      <span class="post-scale-chip__swatch" style="background: #f4f4f4;"></span>
      <span class="post-scale-chip__note">Always burns</span>
    </div>
    <div class="post-scale-chip">
      <span class="post-scale-chip__roman">II</span>
      <span class="post-scale-chip__swatch" style="background: #e0e0e0;"></span>
      <span class="post-scale-chip__note">Usually burns</span>
    </div>
    <div class="post-scale-chip">
      <span class="post-scale-chip__roman">III</span>
      <span class="post-scale-chip__swatch" style="background: #c7c7c7;"></span>
      <span class="post-scale-chip__note">Sometimes mild burn</span>
    </div>
    <div class="post-scale-chip">
      <span class="post-scale-chip__roman">IV</span>
      <span class="post-scale-chip__swatch" style="background: #9e9e9e;"></span>
      <span class="post-scale-chip__note">Rarely burns</span>
    </div>
    <div class="post-scale-chip">
      <span class="post-scale-chip__roman">V</span>
      <span class="post-scale-chip__swatch" style="background: #6b6b6b;"></span>
      <span class="post-scale-chip__note">Very rarely burns</span>
    </div>
    <div class="post-scale-chip">
      <span class="post-scale-chip__roman">VI</span>
      <span class="post-scale-chip__swatch" style="background: #2f2f2f;"></span>
      <span class="post-scale-chip__note">Almost never burns</span>
    </div>
  </div>
</div>

In clinic, the scale is useful when sun sensitivity matters: phototherapy dosing, burn risk, tanning response. A dermatologist can ask about burning and tanning, examine the skin under consistent lighting, and use the rest of the visit as context.

Image labeling has none of that. An annotator sees one photograph, taken under whatever lighting happened to be available, with healthy skin, inflamed skin, shadow, and camera color balance mixed together. Assigning a Fitzpatrick type from that image is a different task from the one the scale was built for. It is also the task dermatology AI papers ask it to perform, because Fitzpatrick remains the most common skin-type label in the literature.

## Coarse fairness buckets

Most fairness analyses do not keep all six Fitzpatrick types separate. They collapse them into three coarse groups, often I–II as "light," III–IV as "medium," and V–VI as "dark," then report accuracy or error rates for each group.

That collapse turns small disagreements into large ones. A Type II image labeled Type III has not moved far on the original scale, but it has crossed the boundary into a different fairness bucket. The relevant question is often not "Did the two annotators pick the same number?" but "Did they place the image in the same subgroup?" That placement happens before model evaluation, and it constrains what the fairness table can say.

## The two public label columns

I analyzed the public `Fitzpatrick17k` annotation CSV from Groh and colleagues ([Groh et al. 2021](https://arxiv.org/abs/2104.09957)). The file exposes two consensus columns, `fitzpatrick_scale` and `fitzpatrick_centaur`, which I read as Scale AI and Centaur Labs consensus pipelines. I treat neither column as ground truth. They are two public attempts to assign image-based Fitzpatrick labels at scale.

After dropping rows where either column was unknown, **15,230** images remained comparable. I measured exact agreement between the columns, agreement within one or two steps, Cohen's kappa under two weighting schemes, and how often an image stayed in the same coarse light/medium/dark bucket when the six types were collapsed the way fairness papers usually collapse them.

## Agreement at the type level

The two columns matched exactly on **47.89%** of images. That sounds low until you remember the scale has six rungs and most errors land nearby. Allow a one-step margin and agreement rises to **91.04%**. Allow two steps and it reaches **98.44%**.

<table class="post-metrics-table">
  <thead>
    <tr>
      <th>Metric</th>
      <th>Value</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Exact agreement between the two public columns</td><td><strong>47.89%</strong></td></tr>
    <tr><td>Agreement within 1 Fitzpatrick step</td><td><strong>91.04%</strong></td></tr>
    <tr><td>Agreement within 2 Fitzpatrick steps</td><td><strong>98.44%</strong></td></tr>
    <tr><td>Unweighted Cohen's kappa</td><td><strong>0.351</strong></td></tr>
    <tr><td>Quadratic-weighted Cohen's kappa</td><td><strong>0.786</strong></td></tr>
  </tbody>
</table>

The kappa values show the same split in formal terms. Unweighted kappa (0.351) treats every disagreement equally, so a III-versus-IV miss weighs the same as a I-versus-VI miss. Quadratic-weighted kappa (0.786) gives partial credit for near misses, which fits an ordered scale better. Strict exact matching makes the pipelines look unstable. Allowing neighboring types makes them look broadly aligned. Both readings describe the same CSV.

<figure class="post-figure-card">
  <img class="post-figure-card__media theme-asset theme-asset--light" src="/assets/img/dermatology-ai-labels/agreement-metrics.svg" alt="Bar chart showing exact agreement at 47.9%, within 1 step at 91.0%, and within 2 steps at 98.4%.">
  <img class="post-figure-card__media theme-asset theme-asset--dark" src="/assets/img/dermatology-ai-labels/agreement-metrics-dark.svg" alt="" aria-hidden="true">
  <figcaption>Exact match is under 50%, but within one Fitzpatrick step the two columns agree on more than 91% of images.</figcaption>
</figure>

### Where the disagreements cluster

The confusion matrix below counts how often one pipeline assigned row type *i* and the other assigned column type *j*. Mass sits on the diagonal and on the cells beside it: when the pipelines disagree, they usually disagree by one step.

<figure class="post-figure-card">
  <img class="post-figure-card__media theme-asset theme-asset--light" src="/assets/img/dermatology-ai-labels/consensus-confusion-matrix.svg" alt="6 by 6 confusion matrix comparing the Scale AI and Centaur Labs consensus labels, showing counts concentrated along the diagonal.">
  <img class="post-figure-card__media theme-asset theme-asset--dark" src="/assets/img/dermatology-ai-labels/consensus-confusion-matrix-dark.svg" alt="" aria-hidden="true">
  <figcaption>Most counts sit on or beside the diagonal. Pay attention to the cells straddling the II/III and IV/V boundaries, where one-step disagreements coincide with common fairness-bucket borders.</figcaption>
</figure>

Those boundary cells matter because fairness buckets are drawn through them. A disagreement between Types II and III, or IV and V, can reassign an image to a different subgroup even when the original scale labels look adjacent.

## What happens when types become buckets

Collapsing I–II, III–IV, and V–VI into light, medium, and dark groups, **76.8%** of images stayed in the same bucket regardless of which consensus column I used. **23.2%**, or **3,533 images**, moved.

<figure class="post-figure-card">
  <img class="post-figure-card__media theme-asset theme-asset--light" src="/assets/img/dermatology-ai-labels/bucket-consistency.svg" alt="Bar chart showing how often images stay in the same broad subgroup versus move to a different one.">
  <img class="post-figure-card__media theme-asset theme-asset--dark" src="/assets/img/dermatology-ai-labels/bucket-consistency-dark.svg" alt="" aria-hidden="true">
  <figcaption>Nearly one in four comparable images changes coarse subgroup depending on which public consensus column you use.</figcaption>
</figure>

Consider a paper that reports higher accuracy on light skin than on dark skin. If nearly a quarter of the images could land in a different bucket under another reasonable pipeline, part of that gap may reflect labeling choices rather than model behavior. The labels still carry information, but they are not stable enough to treat as fixed ground truth at the bucket level.

## Subgroup composition

Bucket switching is not symmetric noise. The two pipelines produce different overall distributions.

<figure class="post-figure-card">
  <img class="post-figure-card__media theme-asset theme-asset--light" src="/assets/img/dermatology-ai-labels/representation-shift.svg" alt="Grouped bar chart comparing the distribution of images across light, medium, and dark groups for each pipeline.">
  <img class="post-figure-card__media theme-asset theme-asset--dark" src="/assets/img/dermatology-ai-labels/representation-shift-dark.svg" alt="" aria-hidden="true">
  <figcaption>The two consensus columns disagree on individual labels and on overall group composition.</figcaption>
</figure>

In this subset, the Scale AI column yields about **48.2% light, 37.9% medium, and 13.9% dark**. The Centaur column yields about **56.3% light, 31.8% medium, and 11.9% dark**. Both distributions come from defensible human labeling workflows. They still change subgroup denominators, rare-case counts inside each group, and any fairness metric built on top of those groups.

## How hard is this task for people?

The Fitzpatrick17k paper describes Scale AI annotation with two to five annotators per image and quality checks against a 312-image dermatologist-labeled gold set. The 2022 follow-up ([Groh et al. 2022](https://arxiv.org/abs/2207.02942)) compared board-certified dermatologists, crowd protocols through Scale AI and Centaur Labs, and an algorithm called ITA-FST.

On a 320-image benchmark, pairs of dermatologists matched exactly on only 50–55% of images but within one category on 92–94%. Crowd pipelines landed in a similar range. ITA-FST did worse. Those numbers frame the CSV disagreement: image-based Fitzpatrick labeling is subjective even in expert hands, and the method changes the answer.

## Reading fairness claims built on these labels

Subgroup reporting should continue. A 2021 *JAMA Dermatology* scoping review found that only 10% of dermatology AI studies reported skin-tone information in at least one dataset ([Daneshjou et al.](https://pubmed.ncbi.nlm.nih.gov/34550305/)). A 2024 *International Journal of Dermatology* review highlighted persistent underrepresentation for skin of color ([Fliorent et al.](https://pubmed.ncbi.nlm.nih.gov/38444331/)). Work on the Diverse Dermatology Images dataset found performance gaps on darker skin tones and uncommon diseases ([Daneshjou et al.](https://pubmed.ncbi.nlm.nih.gov/35960806/)). Those disparities are real, and subgroup tables are one way to surface them.

They become harder to interpret when the skin-type variable is underspecified. Was the label drawn from metadata, expert review, crowd consensus, or an algorithm? How many annotators saw each image, and how were ties broken? How many cases were excluded as ambiguous? Was agreement reported, or only the final label?

Without that detail, a fairness table can look more definitive than the measurement supports. Skin-tone labeling belongs inside the evaluation, not outside it as a solved preprocessing step.

## Method note

I used the public [`fitzpatrick17k.csv`](https://github.com/mattgroh/fitzpatrick17k), compared `fitzpatrick_scale` and `fitzpatrick_centaur` on rows where both values were not `-1`, and collapsed I–II, III–IV, and V–VI into light, medium, and dark buckets. This is not a validation study, and I do not treat either column as the correct answer. Code, calculations, and figure scripts live in [`huntercolson1/fitzpatrick17k-label-methods`](https://github.com/huntercolson1/fitzpatrick17k-label-methods).

## Further reading

- [Groh et al. 2021, Fitzpatrick17k (CVPR)](https://arxiv.org/abs/2104.09957)
- [Groh et al. 2022, experts, crowds, and ITA-FST (CSCW)](https://arxiv.org/abs/2207.02942)
- [Daneshjou et al. 2021, JAMA Dermatology scoping review](https://pubmed.ncbi.nlm.nih.gov/34550305/)
- [Daneshjou et al. 2022, DDI dataset and performance disparities](https://pubmed.ncbi.nlm.nih.gov/35960806/)
- [Fliorent et al. 2024, AI in dermatology and skin of color](https://pubmed.ncbi.nlm.nih.gov/38444331/)
