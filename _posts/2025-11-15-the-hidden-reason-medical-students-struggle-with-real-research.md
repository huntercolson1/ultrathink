---
title: The Hidden Reason Medical Students Struggle With Real Research
date: 2025-11-15
author: Hunter Colson
subtitle: Why medical students need better tools for real research
description: ERAS is closing loopholes that made research padding easy. Here's why Python, notebooks, and AI copilots are the best entry point for medical students moving beyond case reports.
tags:
  - research
  - medical-education
  - data-science
  - python
---
## The Research Arms Race Is Changing

Research has become one of the main ways to strengthen a residency application, especially with Step 1 and many preclinical curriculums going pass/fail. Students know this, so they chase “research productivity” as a way to stand out.

You can see how that plays out on ERAS: long lists of case reports, low-effort projects, and the same poster copy-pasted across five conferences.

There are two problems with this.

1. Residency program directors are not fooled. They know what real scholarship looks like.
2. ERAS is actively closing the loopholes that made research fluff so easy.

Starting in the 2027 cycle, [ERAS](https://vimeo.com/1129670590) is rolling out three changes that directly target this kind of padding:

1. **Only peer-reviewed work counts as “Scholarly Work.”**
    
    Anything not vetted through formal peer review (letters to the editor, blog posts, opinion pieces, informal presentations, etc.) goes under “Experiences” instead. You cannot label non-scholarly content as research output.
    
2. **You must pick your three most meaningful scholarly works.**
    
    Programs will see what you consider your flagship contributions, not a wall of low-impact noise.
    
3. **One product gets one line.**
    
    If you present the same poster at multiple conferences, it is one entry with multiple venues, not five separate “achievements.” The new “Scholarly Collections” feature lets you group related outputs but prevents padding.
    

All of this pushes the culture away from superficial productivity and back toward what actually matters: meaningful, peer-reviewed, intellectually honest work.

---

## Why So Many Students Get Stuck

As these changes hit, students will not be able to coast on run-of-the-mill projects. They will need to participate in real, substantial work.

When I talk to other medical students about this, I hear the same thing over and over:

> “I don’t know how to do big projects.”
> 

If you dig deeper, the story is more specific. Most students are comfortable with case reports. Many even enjoy them. Case reports feel natural because they are narrative. You walk from symptom to diagnosis to lessons learned.

Large-scale projects feel completely different. They are not narrative, they are analytical. And analytical reasoning is usually underdeveloped in preclinical education, which is overwhelmingly focused on recall.

The core distinction looks like this:

- **Case reports are descriptive.**
- **Large-scale research is inferential.**

That single shift explains most of the gap.

---

## The Real Skill Is Reasoning, Not Writing

Case reports ask you to recount what happened.

Inferential research asks you to decide:

- Why does something happen
- How do variables relate
- What should be measured
- Which model can actually answer the question

This is where most students hit the wall. The moment a project moves beyond storytelling and into structured analysis, the bottleneck becomes the statistics.

Not the math itself, but the process:

- Defining an outcome
- Choosing covariates
- Building a model
- Checking assumptions
- Iterating when the model is wrong

This is where the tooling matters more than people want to admit.

> “The skill set required to do independent research is not writing. It is reasoning. And medical education rarely trains reasoning explicitly. It trains recall.”
> 

If your tools make reasoning harder, you are going to feel stuck even if you are perfectly capable of learning the concepts.

---

## Why Excel Holds Students Back

Most students start in Excel. It feels intuitive at first: a grid of cells, formulas you can see, drag and drop everything.

Then the project grows.

- The file becomes fragile.
- A misplaced sort silently breaks your dataset.
- No one remembers which filters were applied.
- Reproducing your analysis requires recreating a sequence of unrecorded clicks.

Excel is fine for small personal tasks. It is not designed for serious analytics. It hides assumptions, blocks reproducibility, and collapses the moment you need anything more than a t-test.

So students move on.

---

## SPSS and R: Powerful, But Not Friendly

The next stops are usually SPSS and R.

**SPSS** is entirely point-and-click. It can run serious analyses, but there is no transparent record of what you did. Every choice lives in a trail of menu clicks. That makes it very hard to:

- Share your workflow
- Rerun your analysis
- Hand off your work to someone else

**R** is extremely capable, especially for biostatistics, but the learning curve is steep. Most students never get formal instruction in RStudio, Quarto, or literate programming in general. Without that, R feels like a wall of syntax instead of a research environment.

The result: SPSS feels too opaque. R feels too specialized. Neither feels like a natural starting point for a busy medical student trying to get into real data.

---

## A Better Starting Point: Python, Notebooks, and an AI Copilot

This is why I think the most accessible and scalable entry point for med students in 2025 and 2026 is:

**Python + a Jupyter-style notebook + an AI copilot.**

This combination:

- Lowers the syntax barrier
- Makes every step of the analysis visible
- Gives you a modern, reproducible workflow
- Does not require you to become a “programmer”

### Why notebooks

Notebooks fix the structural problems immediately.

A notebook holds your:

- Code
- Comments
- Outputs
- Interpretation

in one place.

There are no hidden steps and no mystery buttons.

- If you need to rerun your analysis after adding more patients, you rerun the notebook.
- If your mentor asks how you handled missing values, the answer is in the code cell where you did it.
- If another student inherits your project, they see the whole pipeline instead of a folder full of screenshots.

### Why Python

Python fits this environment well because it is:

- General-purpose
- Clean to read
- Built for data

In a single notebook you can:

- Load a CSV
- Recode variables
- Run a logistic regression
- Create publication-quality figures
- Export tables for your manuscript

As you grow, you can add survival analysis, machine learning, automation, or whatever your project needs. None of this demands deep software engineering skills. It only requires a workspace where reasoning comes first and syntax comes second.

### Where AI actually helps

The hardest part for beginners is not understanding what logistic regression is. The hard part is translating “I want to do X” into working code.

This is where an AI copilot is useful.

You describe what you want:

- “Load this dataset, clean missing values, and run a multivariable logistic regression with EF_low as the outcome and age, hypertension, diabetes, and BMI as predictors.”

The copilot drafts the code.

You run it, review the output, and ask follow-up questions.

You learn by example:

- How the data is loaded
- How missingness is handled
- How the model is specified

Instead of wrestling with syntax and searching for the right function name, you spend your time on the analysis itself. The AI does not replace reasoning. It removes friction so you can actually practice reasoning.

---

## A Concrete Example

Imagine you have a dataset of 500 heart failure patients.

In Excel, you would:

- Scroll, sort, and filter
- Hope you did not break anything

In SPSS, you would:

- Click through a series of menus
- Try to remember what each option does

In a notebook, you can:

- Load the dataset in one cell
- Clean and recode in another
- Run your logistic regression in a third
- Generate plots in a fourth

Your AI copilot helps you write the code.

The notebook keeps a clean record of every step.

You now have a reproducible pipeline instead of a one-time experiment.

---

## Where This Is Going on Ultrathink

I think Python, notebooks, and AI form the best entry point for medical students who want to move past case reports and into real research.

This stack:

- Respects your time
- Respects your learning curve
- Mirrors the workflow used by researchers and data scientists everywhere
- Creates space for you to actually think

If you have never opened a notebook before, I am putting together a simple step-by-step tutorial series in the Tutorials section of Ultrathink that will walk you through the full setup.