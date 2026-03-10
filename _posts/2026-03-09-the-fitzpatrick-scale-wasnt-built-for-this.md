---
title: The Fitzpatrick Scale Wasn't Built for This
date: 2026-03-09
author: Hunter Colson
subtitle: Dermatology AI papers often use the Fitzpatrick scale to sort images by skin tone, even though the scale was built for sun response, not for reading photographs.
description: Why the Fitzpatrick scale keeps showing up in dermatology AI, and why different labeling pipelines can quietly change the fairness groups a paper reports.
tags:
  - dermatology
  - ai
  - datasets
  - fairness
  - medical-ai
  - computer-vision
---

## Introduction

When people talk about fairness in dermatology AI, the conversation usually starts at the end of the pipeline. Does the model work worse on darker skin? That's an important question. But before a model can underperform on a group, someone has to decide who belongs in that group in the first place.

That's the layer this post is about. Not model accuracy, but the measurement underneath it. The part where images get sorted into skin-tone groups before a model ever sees them.

The tool almost everyone reaches for is the Fitzpatrick scale. I want to walk through what it actually measures, why it gets reused in AI, and what happens when you ask a simple question: if two reasonable labeling pipelines look at the same image, do they put it in the same bucket?

## What the Fitzpatrick Scale Is

The Fitzpatrick scale is a six-step clinical scale, from Type I to Type VI, originally designed around how skin responds to sun exposure. Type I skin almost always burns. Type VI skin almost never burns. The types in between sit somewhere along that range.

<div class="post-figure-card" role="img" aria-label="Simplified explainer of the six-step Fitzpatrick scale from Type I to Type VI.">
  <span class="post-figure-card__label">Quick Explainer</span>
  <p class="post-figure-card__caption" style="margin-top: 0; font-style: normal;">
    The Fitzpatrick scale runs from Type I to Type VI. Clinically, it's about how skin reacts to sun exposure, not just how a photo looks.
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

That makes the scale useful when sun sensitivity matters: phototherapy dosing, burn risk, tanning response. What it wasn't built for is estimating skin tone from a single photograph.

That difference matters more than it might seem. In clinic, a dermatologist can ask the patient about burning and tanning, look at the skin under consistent lighting, and use context from the visit. A photo annotator gets none of that. They get one image, taken under whatever lighting happened to be in the room, with some mix of healthy skin, inflamed skin, shadow, and camera color balance all folded together. That's a very different job from the one the scale was made for.

And yet the Fitzpatrick scale is still the most common skin-type label in dermatology AI papers. The field has taken a clinical concept and asked it to do a computer-vision job.

## Why a Small Disagreement Can Be a Big Deal

At first glance, a one-step disagreement on a six-point scale doesn't sound serious. If one annotator says Type III and another says Type IV, that feels close enough.

The trouble starts when those labels get used downstream.

Most papers don't keep the Fitzpatrick types as six separate bins. They collapse them into broader groups and report model performance for each group. That's the fairness table. A common grouping is I–II as "light," III–IV as "medium," and V–VI as "dark."

Once you do that, a one-step disagreement can move an image across a group boundary. A Type II that becomes a Type III jumps from "light" to "medium." So the real question isn't just whether two annotators picked the same exact number. It's whether they put the same image in the same fairness bucket.

That's the question that shapes the conclusions a paper can draw.

## What I Looked At

To put numbers on this, I used the public `Fitzpatrick17k` annotation CSV from the dataset introduced by Groh and colleagues in 2021 ([Groh et al. 2021](https://arxiv.org/abs/2104.09957)).

The CSV has two consensus columns: `fitzpatrick_scale` and `fitzpatrick_centaur`. I read those as the Scale AI and Centaur Labs consensus labeling pipelines. I didn't treat either one as ground truth. I treated them as two public attempts to assign image-based Fitzpatrick labels at scale.

After dropping rows where either column was unknown, I had **15,230** comparable images. I asked two questions. First, how often do the two columns agree exactly? Second, if I collapse the six types into broader groups, how often does an image stay in the same group?

## How Often the Two Pipelines Agree

The first thing I looked at was exact agreement: for each image, did the two columns assign the same Fitzpatrick type? They matched exactly on **47.89%** of images.

On its own, that sounds alarming. But a six-point scale is fairly granular, and most of the disagreements are small. If you allow a one-step margin, agreement jumps to **91.04%**. Allow two steps, and it reaches **98.44%**. Most of the time, the two pipelines land on the same type or a neighboring one.

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

The chart below puts those three numbers side by side. The picture changes dramatically depending on how strictly you define "agreement." That's normal for an ordinal scale. If two people had to sort thousands of photos onto a six-step ladder, you would expect a lot of near-misses even when they broadly see the same thing.

<figure class="post-figure-card">
  <img class="post-figure-card__media theme-asset theme-asset--light" src="/assets/img/dermatology-ai-labels/agreement-metrics.svg" alt="Bar chart showing exact agreement at 47.9%, within 1 step at 91.0%, and within 2 steps at 98.4%.">
  <img class="post-figure-card__media theme-asset theme-asset--dark" src="/assets/img/dermatology-ai-labels/agreement-metrics-dark.svg" alt="" aria-hidden="true">
  <figcaption>The same data tells very different stories depending on how strictly you define "agreement." Exact match is under 50%, but within one Fitzpatrick step, the two columns agree over 91% of the time.</figcaption>
</figure>

The Cohen's kappa values in the table are a more formal way to say the same thing. Unweighted kappa (0.351) treats every disagreement equally, so a III-vs-IV miss counts just as much as a I-vs-VI miss. Quadratic-weighted kappa (0.786) gives partial credit for near-misses, which makes more sense for an ordered scale like this. If you care about exact matching, the two columns look shaky. If you care about whether they usually land close together, they look much more consistent. Both readings are true.

### Where the Disagreements Actually Fall

To see where the two pipelines agree and disagree in more detail, it helps to look at the full confusion matrix. Each cell represents a pair of labels: one pipeline assigned the row type, the other assigned the column type. The darker the cell, the more images fell into that pairing.

<figure class="post-figure-card">
  <img class="post-figure-card__media theme-asset theme-asset--light" src="/assets/img/dermatology-ai-labels/consensus-confusion-matrix.svg" alt="6 by 6 confusion matrix comparing the Scale AI and Centaur Labs consensus labels, showing counts concentrated along the diagonal.">
  <img class="post-figure-card__media theme-asset theme-asset--dark" src="/assets/img/dermatology-ai-labels/consensus-confusion-matrix-dark.svg" alt="" aria-hidden="true">
  <figcaption>Each cell shows how many images got one Fitzpatrick type from one pipeline and a different type from the other. The heaviest counts sit on or right next to the diagonal, meaning most disagreements are by a single step. But look at the cells right at the boundary between Types II and III, or IV and V. Those one-step disagreements happen to land exactly where the common fairness-bucket boundaries fall.</figcaption>
</figure>

Most of the counts sit on the diagonal, where the two pipelines agree exactly, or just beside it, where they're one step apart. That matches the summary numbers above: when the pipelines disagree, they usually disagree by a small amount.

But the location of those near-misses matters. Look at the boundary between Types II and III, where the "light" and "medium" buckets meet. There's a lot of weight on both sides of that line. The same thing happens between IV and V, where "medium" meets "dark." These are just one-step disagreements on paper, but they can move an image into a different subgroup in the final fairness analysis.

## What Happens When You Collapse Into Buckets

This is the part that matters most for fairness analysis.

When I collapsed the six Fitzpatrick types into the three broader groups that fairness analyses usually use, **76.8%** of images stayed in the same group regardless of which pipeline I used. The other **23.2%**, or **3,533 images**, moved to a different subgroup.

<figure class="post-figure-card">
  <img class="post-figure-card__media theme-asset theme-asset--light" src="/assets/img/dermatology-ai-labels/bucket-consistency.svg" alt="Bar chart showing how often images stay in the same broad subgroup versus move to a different one.">
  <img class="post-figure-card__media theme-asset theme-asset--dark" src="/assets/img/dermatology-ai-labels/bucket-consistency-dark.svg" alt="" aria-hidden="true">
  <figcaption>When the six Fitzpatrick types are collapsed into light, medium, and dark groupings, nearly one in four comparable images changes subgroup depending on which public consensus column you use.</figcaption>
</figure>

Nearly one in four images. Put yourself in the position of a reader looking at a paper that says, "our model achieved 92% accuracy on light skin and 84% accuracy on dark skin." That eight-point gap looks like a clean disparity. But if almost a quarter of the images in those groups could have landed in a different bucket under a different but still reasonable labeling pipeline, part of that gap may be telling you about labeling choices rather than model behavior.

That doesn't mean the labels are useless or the dataset is broken. It means subgroup membership can shift at scale before the model ever makes a prediction.

## How the Distribution Shifts

The bucket-switching from the previous section doesn't just cancel out as random noise. When you put the two pipelines side by side, they produce noticeably different distributions across the three groups.

<figure class="post-figure-card">
  <img class="post-figure-card__media theme-asset theme-asset--light" src="/assets/img/dermatology-ai-labels/representation-shift.svg" alt="Grouped bar chart comparing the distribution of images across light, medium, and dark groups for each pipeline.">
  <img class="post-figure-card__media theme-asset theme-asset--dark" src="/assets/img/dermatology-ai-labels/representation-shift-dark.svg" alt="" aria-hidden="true">
  <figcaption>The two consensus columns don't just disagree on individual images. They produce different overall group sizes. A fairness analysis built on one pipeline would be working with a measurably different subgroup composition than one built on the other.</figcaption>
</figure>

In this subset, the Scale AI consensus column comes out to about **48.2% light, 37.9% medium, and 13.9% dark**. The Centaur Labs consensus column comes out to about **56.3% light, 31.8% medium, and 11.9% dark**. Neither is obviously "wrong." They're both outputs of reasonable human labeling processes. But the fairness analysis you build on top of them still changes. The subgroup sizes change. The denominators in the accuracy table change. The number of rare cases inside each group changes.

So the uncertainty isn't only at the level of the individual image. The shape of the dataset shifts too.

## Who Did the Labeling

The original Fitzpatrick17k paper describes the annotation process in some detail. Images were labeled by human annotators through Scale AI, with each image reviewed by two to five annotators using a dynamic consensus process. Annotator quality was benchmarked against a 312-image gold-standard set labeled by a board-certified dermatologist.

The 2022 follow-up paper ([Groh et al. 2022](https://arxiv.org/abs/2207.02942)) went further and compared several annotation methods head to head: three board-certified dermatologists, crowd-based protocols through Scale AI, crowd-based protocols through Centaur Labs, and an algorithmic method called ITA-FST.

The results are worth pausing on. Any two board-certified dermatologists matched exactly on only 50–55% of a 320-image benchmark, but matched within one category on 92–94%. The crowd pipelines performed in a similar range. The ITA-FST algorithm did noticeably worse.

That matters because it changes how we should read disagreement in the public CSV. These aren't numbers that point to obviously sloppy labeling. They're close to what you'd expect even if board-certified dermatologists were doing the work. Image-based Fitzpatrick labeling is just a subjective task. The answer changes with the method, even when the people doing the labeling are experts.

## What This Means for Reading Dermatology AI Papers

I don't think the takeaway is to stop reporting subgroup performance. If anything, the field needs more of it. A 2021 scoping review in *JAMA Dermatology* found that only 10% of dermatology AI studies reported skin-tone information in at least one dataset ([Daneshjou et al.](https://pubmed.ncbi.nlm.nih.gov/34550305/)). A 2024 review in the *International Journal of Dermatology* highlighted ongoing underrepresentation challenges for skin of color ([Fliorent et al.](https://pubmed.ncbi.nlm.nih.gov/38444331/)). And a 2022 paper on the Diverse Dermatology Images dataset found that several dermatology AI systems performed worse on dark skin tones and uncommon diseases ([Daneshjou et al.](https://pubmed.ncbi.nlm.nih.gov/35960806/)). Those are real problems, and subgroup reporting is how we notice them.

But when a paper makes fairness claims by skin tone, it should also be clear about the measurement. What skin-type variable was used? Was it based on metadata, expert review, crowd consensus, or an algorithm? How many annotators were involved, and how were disagreements resolved? How many images were too ambiguous to classify? Was inter-annotator agreement reported, or only the final label?

Without that context, a fairness table can look more definitive than it really is. Treating image-based Fitzpatrick labels as clean ground truth makes the results feel firmer than they are. Skin-tone measurement is part of the evaluation problem, not a solved preprocessing step.

## Method Note

The analysis in this post used the public [`fitzpatrick17k.csv`](https://github.com/mattgroh/fitzpatrick17k) and compared the two exposed consensus columns, `fitzpatrick_scale` and `fitzpatrick_centaur`, on rows where both values were not `-1`. I read those as the Scale AI and Centaur Labs consensus columns. I also collapsed Fitzpatrick I–II, III–IV, and V–VI into light, medium, and dark subgroup buckets to estimate how often images would move between the kinds of coarse groups fairness analyses commonly rely on. This isn't a validation study, and I'm not treating one column as the real answer. I put the code, calculations, and figure-generation scripts for this post in a public repo here: [`huntercolson1/fitzpatrick17k-label-methods`](https://github.com/huntercolson1/fitzpatrick17k-label-methods).

## Further Reading

- [Groh et al. 2021, Fitzpatrick17k (CVPR)](https://arxiv.org/abs/2104.09957)
- [Groh et al. 2022, experts, crowds, and ITA-FST (CSCW)](https://arxiv.org/abs/2207.02942)
- [Daneshjou et al. 2021, JAMA Dermatology scoping review](https://pubmed.ncbi.nlm.nih.gov/34550305/)
- [Daneshjou et al. 2022, DDI dataset and performance disparities](https://pubmed.ncbi.nlm.nih.gov/35960806/)
- [Fliorent et al. 2024, AI in dermatology and skin of color](https://pubmed.ncbi.nlm.nih.gov/38444331/)
