---
title: The Hidden Reason Medical Students Struggle With Real Research
date: 2025-11-15
author: Hunter Colson
subtitle: Why medical students need better tools for real research
description: ERAS is closing loopholes that made research padding easy. Here's why Python, modular scripts, Quarto, and AI copilots are the best entry point for medical students moving beyond case reports.
tags:
  - research
  - medical-education
  - data-science
  - python
---

## The Research Arms Race Is Changing, Not Ending

Research has become one of the main ways to strengthen a residency application, especially now that Step 1 and many preclinical curriculums are pass/fail. Students know this, so they chase "research productivity" to stand out.

You can see how that plays out on ERAS: long lists of case reports, low-effort projects, and the same poster copy-pasted across multiple conferences.

The problem is that the rules are changing. The research arms race is shifting away from raw volume and toward real, defensible work. Program directors are not impressed by noise, and ERAS is starting to close the loopholes that made that noise so easy to generate.

## How ERAS Is Changing the Game

Starting in the 2027 cycle, ERAS is rolling out several changes that directly target research padding.

Peer review now defines what counts as scholarship. If a piece of work has not gone through formal peer review, it does not belong in the Scholarly Work section. Letters to the editor, blog posts, informal talks, even high-effort opinion pieces all move under Experiences instead of functioning as research placeholders.

Applicants must choose three meaningful scholarly works. Programs will judge applicants based on what they present as their top work. If your flagship items are low-impact case reports or recycled posters, that signals something about your research development.

One product gets one line. A single poster presented at four conferences is not four achievements. It is one product with multiple venues. ERAS now enforces this through a "Scholarly Collections" structure.

Together, these changes push the culture away from superficial productivity and toward work that is peer-reviewed, reproducible, and intellectually honest. The arms race is not ending. It is shifting.

## Why So Many Students Feel Stuck

As this shift happens, students will not be able to rely on run-of-the-mill projects. They will need to work on real studies. And when you ask students what holds them back, you hear the same thing:

"I do not know how to do big projects."

Most students are comfortable with case reports. They feel natural because they follow a story: symptom, diagnosis, takeaway. Large-scale projects feel different. They are analytical rather than narrative, and medical school rarely trains analytical reasoning in any explicit way.

The distinction is simple:

Case reports are descriptive.

Large-scale research is inferential.

Descriptive work asks, "What happened?"

Inferential work asks, "What can I conclude and how confident am I?"

Once you see the difference, the bottleneck becomes obvious.

## The Real Skill Is Reasoning, Not Writing

Case reports mostly ask you to recount what happened. But inferential research asks you to define outcomes, decide which variables matter, choose a model that actually matches the question, check assumptions, and iterate when the model does not behave.

The skill required to do independent research is reasoning. Medical education trains recall, not reasoning, which explains why this transition feels difficult.

This is also where the tools matter. If your tools hide assumptions, make it hard to rerun analyses, or force you into trial-and-error menus, you will feel stuck even if you are capable of learning the underlying concepts.

## Why Excel Holds Students Back

Most students start in Excel because it feels intuitive. You can see the data. You can click around. You can drag things.

Then the file grows.

A sort breaks your dataset. A filter hides half your rows. Someone forgets which edits were made. Reproducing your workflow becomes nearly impossible because so much of it depended on a long sequence of unrecorded clicks.

Excel is great for small personal tasks, but it collapses once you need a reproducible and transparent workflow.

## SPSS and R: Powerful, But Not Friendly

Students often move to SPSS next. It can run real analyses, but everything happens through menus. Unless you build a syntax file on your own, there is no clear log of your decisions, which makes it hard to collaborate or revisit your work later.

R sits at the other extreme. It is powerful, but without guidance in RStudio, Quarto, or literate programming, it feels like a wall of syntax rather than a research environment. Most students never get formal training, so it becomes frustrating rather than enabling.

The result is predictable: SPSS feels opaque, and R feels intimidating. Neither is a natural entry point for a busy medical student.

## A Better Starting Point: Python, Modular Scripts, and an AI Copilot

For students in 2025 and 2026, the most accessible path into real analytics is:

**Python + clean `.py` files + an AI copilot + Quarto for documentation.**

This setup removes the hidden state and structural complexity of menu-driven tools and notebooks. It lets you focus on logic, reasoning, and reproducibility. You write your actual analysis in normal Python scripts, and those scripts produce the tables and figures that Quarto can pull into a unified research document.

It is simple, transparent, and scales without turning into a mess.

## Why This Structure Works

Python scripts force you to build the kind of habits large projects require: modular code, explicit steps, and named functions that you can test, rerun, and reuse. Instead of piling analysis into an ever-growing interactive environment, you build a small toolkit of scripts that do exactly what you expect.

Quarto then becomes the reasoning layer. You write your interpretation, methods, and narrative the same way you would in a Word document, but you can embed figures, tables, equations, and results directly from your scripts. The document stays clean, readable, and reproducible, and you never end up fighting the underlying structure.

If a dataset updates, you rerun your scripts. Quarto refreshes the tables and figures. Everything aligns.

## Where AI Actually Helps

The hardest part for beginners is not the math. It is translating intent into working code.

You can say something like:

Clean the dataset, handle missing values, and run a multivariable logistic regression with EF_low as the outcome and age, hypertension, diabetes, and BMI as predictors.

An AI copilot drafts the skeleton. You run it, inspect the output, ask questions, and adjust. Over time, you learn the underlying structure because you see it in context rather than piecemeal.

The AI is not doing the reasoning for you. It is removing friction so you can focus on the reasoning.

## A Concrete Example

Imagine a dataset of 500 heart failure patients.

In Excel, you would scroll, sort, filter, and hope nothing broke.

In SPSS, you would click through menus and hope you clicked the same boxes as last time.

In a Python script, you load the file, clean it, run the model, and generate a plot. Each step is explicit and reproducible.

Your AI copilot helps you write the code. Your scripts keep the logic transparent. Quarto pulls it all together into a coherent document. The result is a pipeline you can extend, rerun, or hand off without losing clarity.

## Where This Is Going on Ultrathink

Python, modular scripts, an AI copilot, and Quarto form the cleanest on-ramp to real research for medical students who want to move beyond case reports. This stack respects your time, respects your learning curve, mirrors real research workflows, and frees you to think.

The research arms race is not going away. It is simply changing targets, from how much you can list to how deeply you can reason.

I am putting together a step-by-step tutorial series in the Tutorials section of Ultrathink that will walk you through this entire setup and your first real analysis.
