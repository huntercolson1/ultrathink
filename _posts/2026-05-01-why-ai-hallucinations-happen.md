---
title: Why AI Hallucinations Happen
date: 2026-05-01
author: Hunter Colson
published: true
subtitle: A layered explanation, from the simple intuition to the harder parts of the problem.
description: Why AI hallucinations happen, from the basic intuition to the technical reasons they are hard to eliminate.
tags:
  - ai
  - llm
  - reliability
  - research
---

## Why fluent answers can still be wrong

When a chatbot cites a legal case that was never decided, or a summary adds a detail that never appeared in the source document, people tend to describe the failure as a bug, as if something broke inside the model and produced nonsense. The answer often sounds fine on the surface: complete sentences, appropriate tone, the right kind of vocabulary for the domain. Only on inspection does it turn out that some part of the claim is false or unsupported.

Calling it a bug misses the point. Hallucinations are not random in the way television static is random. They follow from how language models are trained, what the training data contains, what the system is rewarded for doing, and what we ask the model to produce. A model learns to generate text that fits the patterns it has seen. Truth and fit overlap heavily, but they are not identical, and most hallucinations arise where those two goals diverge.

The explanation below is layered on purpose. Each section goes a little further than the one before it, so you can stop reading once you have what you need. The opening sections assume no background in machine learning. Later sections cover training objectives, long-tail knowledge, retrieval, calibration, benchmarks, and open problems that researchers still argue about.

## The simplest version

Picture someone who has read an enormous library of books, websites, articles, messages, and homework answers. Over time they become very good at finishing other people's sentences.

Say "The capital of France is…" and they will probably supply "Paris." Say "Peanut butter and…" and "jelly" is a reasonable guess. Most of the time this habit serves them well, because the pattern they are completing is a real one they have encountered many times before.

Now ask something harder: the title of an obscure person's dissertation, or which paper first reported a particular medical finding. They may not know. But the habit of completing sentences is strong, and they may still produce an answer with the right rhythm, formatting, and tone, one that reads like it belongs in the conversation even when it does not belong in the record of facts.

That is the basic shape of a hallucination. The model produces text that sounds like an answer without the answer being true, supported, or checked.

None of this resembles human deception. The model is not withholding what it knows in order to mislead you. It is continuing a pattern. Sometimes the pattern tracks reality; sometimes it tracks the appearance of an informed reply. For everyday use, the takeaway is straightforward: fluency is not evidence. Confidence in tone does not mean the underlying claim has been verified.

## The everyday version

A language model is not a database, and treating it like one is the fastest route to misplaced trust.

In a database, information sits in rows and fields. You request a record; the system returns it. The data can be wrong, but the operation is lookup. A language model, during training, reads vast quantities of text and internalizes statistical regularities: which words follow which words, which ideas cluster together, what a scientific abstract sounds like, how legal citations are formatted, how medical explanations are usually phrased, how people tend to answer different kinds of questions.

That statistical learning is what makes these systems useful. They generalize, explain, translate, summarize, write code, and work through problems in ways lookup systems cannot. Their core competence is producing text that fits a context, not retrieving verified truth.

For common, stable facts, fit and truth usually align. Paris appears as the capital of France in encyclopedias, textbooks, quizzes, and news articles. The model sees the association repeatedly and learns it well. The trouble starts when a question depends on something rare, disputed, changed after training, buried in a single document, or contingent on choosing the right source. The model may still produce a smooth answer, because smooth answering is what it was trained to do.

What makes hallucinations hard to spot is that models learn the surface grammar of expertise. They know what a journal reference looks like, what a Supreme Court citation looks like, what a differential diagnosis sounds like, how a confident paragraph is structured. When the underlying fact is weak or absent, the form can remain intact. A wrong answer can look indistinguishable from a right one until someone checks it.

The practical implication is proportional skepticism. The more a question depends on a specific source, a recent event, an obscure fact, or a high-stakes judgment, the less you should treat an unverified model reply as sufficient. Ask for sources, read them, and confirm that they actually support the claim being made.

## Factuality and faithfulness are not the same

"Hallucination" covers more than one kind of failure, and conflating them makes the problem harder to reason about.

A factual hallucination is wrong about the world: a birth date that does not match the record, a paper title that does not exist, a drug indication the FDA never approved. A faithfulness hallucination is different. The claim might even be true somewhere, but it is not supported by the source the model was supposed to use. You hand it a one-page article and ask for a summary; it writes that the patient improved after treatment, though the article never says so. Whether the patient improved elsewhere in a chart is irrelevant. The summary failed to stay faithful to the text you provided.

People routinely collapse three separate questions into one:

1. Is the statement true?
2. Is it supported by the evidence you supplied?
3. Does the citation actually justify the specific claim?

A model can answer correctly for the wrong reason, cite a related but non-supporting source, or add details from prior knowledge while summarizing. It can also stay perfectly faithful to a source that is itself outdated or incorrect.

Maynez and colleagues documented this distinction early in abstractive summarization research. Neural summarizers, they found, were "highly prone to hallucinate content that is unfaithful to the input document" even when the prose was fluent and readable ([Maynez et al., 2020](https://aclanthology.org/2020.acl-main.173/)). Summarization research also distinguishes intrinsic hallucinations, which contradict the source, from extrinsic ones, which add material not inferable from it. In chat there is often no single source document, but the categories still help: some errors contradict what you gave the model; others introduce unsupported additions.

Adding citations does not close the loop by itself. Citations make answers easier to audit, yet a citation can be fabricated, real but irrelevant, or attached to a claim it does not support. Decoration is not grounding.

## Why next-token prediction is only the start

You will hear that models hallucinate because they "predict the next token." That is directionally correct and incomplete.

A token is a chunk of text, often a whole word, sometimes part of one. During pretraining the model sees text and learns to predict what comes next, adjusting its internal parameters until its predictions resemble the training corpus. The objective is not "label every claim true or false" or "maintain a current world model." It is closer to: given this context, assign high probability to the token that actually appeared.

The probability of a sentence under a text distribution is not the probability that the sentence is true. Consider a model that assigns high probability to "Dr. Smith won the 2016 Lasker Award for work on X." It has not cleanly estimated the chance the claim holds in the world. It has estimated how plausible that word sequence is given everything it read.

TruthfulQA illustrated the gap deliberately. The benchmark uses questions where popular misconceptions are tempting answers. Models reproduced those falsehoods because falsehoods appear often in human text, and scaling alone did not reliably fix the problem in the systems tested ([Lin, Hilton, and Evans, 2022](https://aclanthology.org/2022.acl-long.229/)). Imitation cuts both ways.

Next-token prediction therefore explains part of the story: when the objective rewards plausible continuation, a fluent falsehood can beat silence. But you also need the shape of the training data (some facts everywhere, others almost nowhere), retrieval behavior (evidence provided but misused), inference choices (temperature, sampling, prompt wording, context length), and post-training incentives (systems rewarded for helpful, complete answers may learn to guess rather than defer). Likely text and true text correlate without being the same optimization target, and that mismatch runs through nearly every mechanism discussed in this post.

## Rare facts, stale facts, and the long tail

Models are not uniformly knowledgeable. They tend to be reliable on common facts and fragile on rare ones.

Some information appears across encyclopedias, textbooks, news, and forums: capitals, freezing points, well-known historical dates. The model gets many repetitions and strong associations. Other facts live in the long tail: a single paper, a local news item, one PDF, a court filing, a GitHub thread, an old forum post. The model may have encountered them once, inconsistently, or not at all. Even when it did, similar-looking facts about other people, papers, cases, or API functions can interfere.

Obscure questions are especially risky because the model may know the shape of an answer without knowing the answer. It can invent a paper title that sounds real, a case name that fits citation format, an API method that matches a library's naming style. Plausibility of form substitutes for verification of content.

Kandpal and colleagues showed that factoid QA accuracy tracks how often relevant information appeared in pretraining data, with long-tail facts especially hard to learn parametrically ([Kandpal et al., 2023](https://proceedings.mlr.press/v202/kandpal23a.html)). Model knowledge is denser where the data is denser.

Staleness adds another layer. A model trained before a fact changed may answer from an outdated distribution: last year's officeholder, superseded clinical guidance, an API from before a breaking change. Without retrieval or tools, it has no built-in way to notice the world moved on. External search, databases, and source documents help, but only if the system retrieves the right material, interprets it correctly, and resists padding the reply with unsupported claims afterward.

Performance varies by region of knowledge within the same model. Strong on textbook biology, weak on a niche PubMed reference; fluent in common Python, inventive about a rare package function; accurate on a famous case, sloppy on an obscure district holding. Hallucination is local, not global.

## Why retrieval helps, and why it still fails

Retrieval-augmented generation, which gives the model documents to read, search results to cite, and evidence to ground answers in, is among the most important practical mitigations we have. When a question depends on recent information, private records, institutional knowledge, or long-tail facts, retrieval usually beats closed-book generation.

It does not eliminate hallucination.

Retrieval has two fragile stages. First, the system must find relevant material. It can miss the right document, return something topically adjacent but wrong, surface partial evidence that omits a crucial caveat, or pull stale or conflicting sources; in adversarial settings, retrieved text can even be poisoned. Second, the model must use what it retrieved faithfully. It can ignore the passages and answer from memory, overgeneralize beyond them, merge two sources into a claim neither supports, attach the right document to the wrong sentence, or produce an answer that is mostly grounded except for one unsupported clause.

RAGTruth annotated nearly 18,000 naturally generated retrieval-augmented responses and found unsupported and contradictory claims even when retrieved content was present ([Niu et al., 2024](https://aclanthology.org/2024.acl-long.585/)). Legal research tools illustrate the same pattern: retrieval of cases and statutes should help, and empirically it often does, yet evaluated legal RAG systems still show nonzero hallucination rates. The question shifts from "Did the model memorize this?" to "Did the system find the right evidence and use it correctly?" That is a better question, and one that still demands an affirmative answer.

Source-linked replies beat unsourced ones, but the link is not the proof. Someone still has to read the source and confirm it supports the sentence.

## Why models answer when they should stop

Uncertainty behavior may be the least intuitive piece of the puzzle. A model fails not only when it lacks knowledge, but when the surrounding system makes guessing more attractive than stopping.

OpenAI's 2025 analysis treats this partly as a measurement problem. Many benchmarks score exact correct answers and award nothing for "I don't know." A guessing model might get lucky; an abstaining model gets zero. Over thousands of items, guessers can look better on accuracy while producing more wrong answers ([OpenAI, 2025](https://openai.com/index/why-language-models-hallucinate/)). Leaderboards and training pipelines that reward attempts push models toward acting as though they know even when they do not.

SimpleQA separates correct, incorrect, and not attempted responses, and that third bucket matters. A refusal can be less satisfying to read and more appropriate in context ([OpenAI, 2024](https://openai.com/index/introducing-simpleqa/)). The design problem is selective abstention: answer when the evidence supports it, ask clarifying questions when the prompt is underspecified, search when freshness matters, cite when claims need support, and stop when none of that is available.

Medicine shows how delicate the balance is. A model that refuses every clinical question is safe and useless; one that answers every clinical question is useful-looking and dangerous. What you want is context-sensitive behavior: educational answers where risk is low, requests for missing information where context changes the answer, citations for factual claims, and restraint about patient-specific recommendations without adequate data.

Accuracy can improve while abstention policy lags behind. The model may know more than its predecessors and still need better rules for what to do when it does not know enough.

## Why hallucinations are hard to measure

A single hallucination score would be convenient and misleading.

TruthfulQA probes whether models mimic common human falsehoods. SimpleQA tests short factual answers with clear verification. Summarization benchmarks check consistency with a source document. FActScore decomposes long outputs into atomic claims. RAGTruth focuses on retrieval-grounded generation. Attribution benchmarks ask whether cited sources support specific claims. Each measures something real; none captures the whole phenomenon.

Short-answer benchmarks are easier to grade but miss long-form synthesis. Long-form benchmarks are more realistic but contain many claims per answer, some central and some incidental. Faithfulness benchmarks assume a chosen source; many real questions require choosing the source first. Citation benchmarks help, yet they can miss incomplete or outdated corpora. Some questions have no stable single answer. Facts change, sources disagree, and fields define terms differently, while benchmarks often demand one label.

Model cards and leaderboards compress these differences into a line or a rank. "Better factuality" might mean fewer short-answer errors, better citations, improved abstention, higher long-form precision, or stronger document faithfulness. Related, but not interchangeable.

Serious evaluation asks several things at once: Is the answer true? Is it supported by the provided source? Are the citations real? Do they support the specific claims? Does the model express uncertainty appropriately? Does it ask for clarification when needed? Does performance hold on rare, recent, and domain-specific facts?

When someone says Model A hallucinates less than Model B, the necessary follow-up is: on which task, under which conditions, with which scoring rule?

## The technical version

At the technical level, hallucinations reflect a mismatch between what training optimizes and what deployment often requires.

A base language model learns a conditional distribution over next tokens:

$$
p_\theta(x_t \mid x_{<t})
$$

by minimizing cross-entropy against observed text:

$$
L = -\sum_t \log p_\theta(x_t \mid x_{<t})
$$

That objective is extraordinarily effective. It teaches syntax, facts, style, reasoning traces, genre conventions, and latent structure. It still optimizes the likelihood of text, not direct truth-tracking. Users frequently want something closer to epistemic probability:

$$
P(\text{claim is true} \mid \text{evidence, time, context})
$$

Hallucinations appear when high-probability text diverges from truth, evidence, or proper attribution.

Several mechanisms drive that divergence. Training data is noisy, duplicated, stale, biased toward popular entities, and internally contradictory; the model absorbs structure without building a clean fact table, and long-tail facts have weak representation. Parametric memory compresses information lossily, so similar entities, citation formats, and API names can blur. Inference differs from training: decoding under a prompt, with particular temperature and context, can activate latent associations that a small wording change would have suppressed; the model may commit to an initially plausible path and continue coherently along it. Post-training for helpfulness and alignment improves usability and sometimes factuality, but can also reinforce the habit of supplying satisfying complete answers unless abstention is explicitly rewarded. Retrieval introduces conflicts between parametric memory and provided context, and models do not always defer to the latter. Token probabilities are not semantic confidence; verbal expressions of certainty are unreliable.

Semantic entropy addresses one slice of this by sampling multiple answers, clustering them by meaning rather than wording, and estimating uncertainty over semantic variation ([Farquhar et al., 2024](https://www.nature.com/articles/s41586-024-07421-0)). It detects an important subset of hallucinations, which Farquhar and colleagues call confabulations, but not all of them. Some errors are systematic and repeatable because training data encoded a misconception, the prompt embedded a false premise, or the model holds a stable wrong association. Variation across samples is evidence; lack of variation is not proof.

Recent mechanistic work suggests internal activations sometimes correlate with truthfulness, and inference-time steering can improve benchmark performance, hinting that models may encode more than they reliably say. That remains model-specific, benchmark-specific, and brittle out of distribution, not yet a general engineering fix.

The fuller picture: a model trained on next-token likelihood learns a compressed, uneven, context-sensitive representation of textually observed regularities. At inference, prompted decoding turns that representation into a sequence. Hallucinations occur when the sequence is plausible under the learned text distribution but insufficiently constrained by truth, source evidence, calibration, or incentives to abstain. Multiple mechanisms interact; no single patch converts a general generator into an infallible authority.

## What reduces hallucinations in practice

The realistic goal is not zero hallucinations. It is fewer hallucinations, earlier detection, and workflows that limit the damage when they occur.

Retrieval comes first when answers depend on external, recent, or specialized facts: fetch sources, show them, ground claims in them. Tools handle what models should not pretend to do internally: arithmetic, current events, structured lookup, code execution, domain-specific databases. Verification layers can draft an answer, decompose it into atomic claims, and check each against evidence; imperfect, but it catches obvious unsupported statements. Calibration should change behavior when error is likely, through abstention, clarifying questions, search, human escalation, or toned-down confidence. Citation discipline requires that cited sources actually support cited claims; a reference that decorates an answer is not grounding. Human review remains mandatory in medicine, law, finance, safety engineering, and public health, where a fluent paragraph cannot carry liability.

The medical citation study by Bhattacharyya and colleagues is worth keeping in view. ChatGPT-3.5 generated references for short medical papers; of 115 references, 47% were fabricated, 46% authentic but inaccurate, and 7% both authentic and accurate ([Bhattacharyya et al., 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10277170/)). Wrong references can look entirely normal. Dahl and colleagues found similar patterns in legal settings, with public-facing LLMs hallucinating in at least 58% of cases in their benchmark and often failing to correct false premises in user questions ([Dahl et al., 2024](https://impact.stanford.edu/article/large-legal-fictions-profiling-legal-hallucinations-large-language-models)). Recognizable citation format makes fabricated authority easy to miss without verification.

None of this implies AI is useless in high-stakes fields. It implies that workflow design matters: a drafting assistant with mandatory source checking is a different product from an unchecked oracle. Effective systems stack retrieval, tools, verification, calibration, citation checking, and human review so errors are less likely, less invisible, and less costly when they slip through.

## What remains unresolved

Researchers understand a great deal about why hallucinations happen. A complete theory and a general cure remain out of reach.

Open questions include whether hallucinations can be fully eliminated in open-ended generation or only bounded; how models should calibrate abstention without becoming useless; whether internal truthfulness signals can be made deployment-reliable; how to evaluate long-form factuality when one dangerous false claim can hide inside an otherwise accurate answer; how systems should handle contested or time-dependent facts; and how to prevent citation laundering, where real-looking references create trust the content does not earn.

These are not peripheral concerns. They sit at the center of responsible use.

Hallucination is less a one-time bug to patch than a structural reliability problem that appears whenever fluent generation is asked to stand in for grounded knowledge. The systems that age best will probably not be those that promise never to err, but those that make evidence visible, treat uncertainty as acceptable, and build verification into ordinary use.

## The short version

Language models learn to produce likely text, not to maintain a perfect, current map of what is true. Likely and true overlap especially for common, stable facts, and they diverge most when facts are rare, recent, ambiguous, source-specific, or thinly represented in training data. The gap widens when systems reward guessing over abstention, when retrieval returns incomplete evidence, when citations go unchecked, and when readers treat polish as proof.

Using these tools well means knowing what they are: powerful generators and reasoning assistants that are not, by default, sources of truth. When truth matters, the workflow must supply grounding, checking, and accountability.

## Glossary

Abstention: When a model chooses not to answer because it lacks enough evidence or confidence. A good system should abstain selectively, not constantly.

Attribution: Whether a claim can be traced to a source that actually supports it.

Calibration: The relationship between confidence and correctness. A calibrated model that says it is 80% confident should be right about 80% of the time in similar cases.

Cross-entropy loss: A training loss that penalizes the model when it assigns low probability to the actual next token in the training data.

Faithfulness: Whether an answer stays supported by the source or context it was given.

Factuality: Whether a claim is true in the world.

Hallucination: Generated content that is false, unsupported, unverifiable, or not faithful to the relevant source.

Long-tail knowledge: Rare or obscure information that appears infrequently in training data.

Parametric memory: Information stored implicitly in the model's weights.

RAG, or retrieval-augmented generation: A system design where the model retrieves external documents and uses them to answer.

Semantic entropy: An uncertainty method that samples multiple answers and measures variation in meaning rather than variation in wording.

Token: A chunk of text used by the model, often a word, part of a word, or punctuation.

## Further reading

* Joshua Maynez, Shashi Narayan, Bernd Bohnet, and Ryan McDonald, "[On Faithfulness and Factuality in Abstractive Summarization](https://aclanthology.org/2020.acl-main.173/)", ACL 2020.
* Stephanie Lin, Jacob Hilton, and Owain Evans, "[TruthfulQA: Measuring How Models Mimic Human Falsehoods](https://aclanthology.org/2022.acl-long.229/)", ACL 2022.
* Nikhil Kandpal, Haikang Deng, Adam Roberts, Eric Wallace, and Colin Raffel, "[Large Language Models Struggle to Learn Long-Tail Knowledge](https://proceedings.mlr.press/v202/kandpal23a.html)", ICML 2023.
* Cheng Niu et al., "[RAGTruth: A Hallucination Corpus for Developing Trustworthy Retrieval-Augmented Language Models](https://aclanthology.org/2024.acl-long.585/)", ACL 2024.
* Sebastian Farquhar, Jannik Kossen, Lorenz Kuhn, and Yarin Gal, "[Detecting hallucinations in large language models using semantic entropy](https://www.nature.com/articles/s41586-024-07421-0)", Nature 2024.
* OpenAI, "[Introducing SimpleQA](https://openai.com/index/introducing-simpleqa/)", 2024.
* OpenAI, "[Why language models hallucinate](https://openai.com/index/why-language-models-hallucinate/)", 2025.
* Matthew Dahl, Varun Magesh, Mirac Suzgun, and Daniel E. Ho, "[Large Legal Fictions: Profiling Legal Hallucinations in Large Language Models](https://impact.stanford.edu/article/large-legal-fictions-profiling-legal-hallucinations-large-language-models)", Journal of Legal Analysis, 2024.
* Mehul Bhattacharyya, Valerie M. Miller, Debjani Bhattacharyya, and Larry E. Miller, "[High Rates of Fabricated and Inaccurate References in ChatGPT-Generated Medical Content](https://pmc.ncbi.nlm.nih.gov/articles/PMC10277170/)", Cureus 2023.
