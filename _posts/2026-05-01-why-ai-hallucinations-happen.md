---
title: Why AI Hallucinations Happen
date: 2026-05-01
author: Hunter Colson
published: true
subtitle: Why language models sometimes produce fluent answers that are false, unsupported, or unfaithful to a source.
description: An explanation of AI hallucinations, from basic intuition through training objectives, retrieval, abstention, measurement, and practical mitigations.
tags:
  - ai
  - llm
  - reliability
  - research
---

## Fluent answers and false claims

A chatbot cites a case that was never decided. A summary adds a patient detail that never appeared in the source. A medical draft lists references that look real and turn out to be invented. In each case the prose is often fine: complete sentences, the right register, the kind of citation format you expect in that domain. The failure shows up only when someone checks the underlying claim.

These mistakes are often described as bugs, as if the model briefly malfunctioned. Hallucinations follow from training data, training objectives, system incentives, and the questions we ask models to answer. A language model learns to continue text in ways that fit what it has read before. Truth and fit overlap heavily, but they are not the same target, and most hallucinations appear where those two goals diverge.

The sections below move from intuition to mechanism. Early sections assume no machine learning background. Later ones cover next-token training, long-tail knowledge, retrieval, abstention, benchmarks, and open problems in the research.

## Pattern completion without a fact check

Think of someone who has read an enormous archive of books, articles, messages, and homework answers and become very good at finishing other people's sentences.

"The capital of France is…" probably ends with "Paris." "Peanut butter and…" often ends with "jelly." Most of the time the habit works because the pattern is real and well repeated.

Ask for the title of an obscure dissertation or the first paper to report a particular finding, and the person may not know. The sentence-finishing habit can still produce an answer with the right shape: formatting, tone, and confidence, even when the content is not in the record of facts.

That is the basic failure mode. The model outputs text that reads like an answer without the answer being true, supported, or checked.

This is not deception in the human sense. The model is not hiding what it knows. It is extending a pattern. Sometimes the pattern tracks reality; sometimes it tracks the appearance of an informed reply. A fluent paragraph does not by itself show that the underlying claim has been verified.

## Not a database

A language model is not a database. Treating it like one leads to misplaced trust.

A database stores records in fields. You request an entry; the system returns it. The entry can be wrong, but the operation is lookup. During training, a language model reads vast amounts of text and internalizes regularities: which words follow which words, which ideas cluster, what an abstract or a legal citation looks like, how medical explanations are usually phrased.

That statistical learning is what makes these systems useful. They generalize, explain, translate, summarize, and reason in ways lookup systems cannot. Their core skill is producing text that fits a context, not retrieving verified truth.

For common stable facts, fit and truth usually align. Paris appears as France's capital across encyclopedias, textbooks, quizzes, and news. The model sees the association often and learns it well. Problems accumulate when a question depends on something rare, disputed, changed after training, buried in one document, or contingent on choosing the right source. The model may still produce a smooth answer because smooth answering is what it was trained to do.

Models also learn the surface grammar of expertise: journal references, court citations, differential diagnoses, confident paragraph structure. When the underlying fact is weak or missing, the form can remain intact. A wrong answer can look like a right one until someone verifies it.

Skepticism should scale with the stakes. The more a question depends on a specific source, a recent event, an obscure fact, or a high-stakes judgment, the less an unverified reply should count as sufficient. Ask for sources, read them, and confirm they support the specific claim being made.

## Factuality and faithfulness

"Hallucination" names more than one kind of error.

A factual hallucination is wrong about the world: a birth date that does not match the record, a paper that does not exist, an indication the FDA never approved. A faithfulness hallucination is different. The claim might even be true somewhere, but it is not supported by the source the model was supposed to use. You ask for a summary of a one-page article; it says the patient improved after treatment though the article never says so. Whether the patient improved elsewhere in a chart does not repair the summary. It failed to stay faithful to the text you provided.

Three questions get collapsed into one:

1. Is the statement true?
2. Is it supported by the evidence you supplied?
3. Does the citation justify the specific claim?

A model can answer correctly for the wrong reason, cite a related but non-supporting source, or add details from prior knowledge while summarizing. It can also stay faithful to a source that is itself outdated or wrong.

Maynez and colleagues showed early in abstractive summarization that neural summarizers were "highly prone to hallucinate content that is unfaithful to the input document" even when the writing was fluent ([Maynez et al., 2020](https://aclanthology.org/2020.acl-main.173/)). Summarization research also distinguishes intrinsic hallucinations, which contradict the source, from extrinsic ones, which add material not inferable from it. In ordinary chat there may be no single source document, but the distinction still helps: some errors contradict what you gave the model; others add unsupported material.

Citations improve auditability, but they do not guarantee correctness. A citation can be fabricated, real but irrelevant, or attached to a claim it does not support.

## Next-token prediction and its limits

Models hallucinate partly because they predict the next token. That explanation is true and incomplete.

A token is a chunk of text, often a whole word, sometimes part of one. In pretraining the model sees text and learns to predict what comes next by adjusting internal parameters until its predictions resemble the training corpus. The objective is not "mark every claim true or false" or "maintain a current world model." It is closer to: given this context, assign high probability to the token that actually appeared.

The probability of a sentence under a text distribution is not the probability that the sentence is true. A model may assign high probability to "Dr. Smith won the 2016 Lasker Award for work on X" because that sequence is plausible in text, not because it verified the claim in the world.

TruthfulQA built questions where popular misconceptions are tempting answers. Models reproduced those falsehoods because misconceptions appear often in human writing, and scaling alone did not reliably fix the problem in the systems tested ([Lin, Hilton, and Evans, 2022](https://aclanthology.org/2022.acl-long.229/)). Learning from human text also learns human error.

Next-token prediction therefore explains part of the story: when the objective rewards plausible continuation, a fluent falsehood can beat silence. The rest requires the shape of training data, retrieval behavior, inference choices, and post-training incentives that reward complete helpful answers over careful abstention. Likely text and true text correlate without being the same optimization target.

## The long tail and stale facts

Model knowledge is uneven. Common facts are learned well; rare facts are fragile.

Capitals, freezing points, and famous dates appear across encyclopedias, textbooks, news, and forums. The model gets many repetitions. Other facts live in the long tail: one paper, one PDF, one court filing, one GitHub thread. The model may have seen them once, inconsistently, or not at all. Similar-looking facts about other people, papers, cases, or API functions can interfere.

Obscure questions are risky because the model may know the shape of an answer without knowing the answer. It can invent a paper title that sounds real, a case name in proper citation form, or an API method that matches a library's naming style, and plausible form can stand in for verified content.

Kandpal and colleagues showed that factoid QA accuracy tracks how often relevant information appeared in pretraining data, with long-tail facts especially hard to learn parametrically ([Kandpal et al., 2023](https://proceedings.mlr.press/v202/kandpal23a.html)). The model simply has more to go on where the data is rich.

Staleness adds another layer. A model trained before a fact changed may answer from an outdated distribution: last year's officeholder, superseded guidance, an API from before a breaking change. Without retrieval or tools, it has no built-in way to notice the world moved on. Search, databases, and source documents help only if the system retrieves the right material, interprets it correctly, and avoids padding the reply with unsupported claims.

Performance varies by region within the same model: strong on textbook biology but weak on a niche PubMed reference, fluent in common Python but inventive about a rare package function, accurate on a famous case but sloppy on an obscure district holding.

## Retrieval helps and still fails

Retrieval-augmented generation gives the model documents to read, search results to cite, and evidence to ground answers in. When a question depends on recent information, private records, institutional knowledge, or long-tail facts, retrieval usually beats closed-book generation. It does not eliminate hallucination.

Retrieval has two fragile stages. First, the system must find relevant material. It can miss the right document, return something topically adjacent but wrong, surface partial evidence that omits a crucial caveat, or pull stale or conflicting sources. Second, the model must use what it retrieved faithfully. It can ignore the passages, overgeneralize beyond them, merge two sources into a claim neither supports, or attach the right document to the wrong sentence.

RAGTruth annotated nearly 18,000 retrieval-augmented responses and found unsupported and contradictory claims even when retrieved content was present ([Niu et al., 2024](https://aclanthology.org/2024.acl-long.585/)). Legal research tools show the same pattern: retrieval of cases and statutes should help, and often does, yet evaluated legal RAG systems still show nonzero hallucination rates. With retrieval in place, the relevant question is whether the system found the right evidence and used it correctly, not whether the model memorized a fact.

Source-linked replies are easier to check than unsourced ones, but someone still has to read the source and confirm it supports the sentence.

## Abstention and benchmark incentives

Models fail under uncertainty not only when they lack knowledge, but when the surrounding system makes guessing more attractive than stopping.

OpenAI's 2025 analysis treats this partly as a measurement problem. Many benchmarks score exact correct answers and award nothing for "I don't know." A guessing model might get lucky; an abstaining model gets zero. Over thousands of items, guessers can look better on accuracy while producing more wrong answers ([OpenAI, 2025](https://openai.com/index/why-language-models-hallucinate/)). Leaderboards and training pipelines that reward attempts push models toward acting as though they know even when they do not.

SimpleQA separates correct, incorrect, and not attempted responses ([OpenAI, 2024](https://openai.com/index/introducing-simpleqa/)). That third bucket matters. A refusal can be less satisfying to read and more appropriate in context. The design problem is selective abstention: answer when evidence supports it, ask clarifying questions when the prompt is underspecified, search when freshness matters, cite when claims need support, and stop when none of that is available.

Medicine shows how delicate the balance is. A model that refuses every clinical question is safe but not useful; one that answers every clinical question may appear helpful while giving unsupported advice. What you want is context-sensitive behavior: educational answers where risk is low, requests for missing information where context changes the answer, citations for factual claims, and restraint about patient-specific recommendations without adequate data.

Accuracy can improve while abstention policy lags behind. The model may know more than its predecessors and still need better rules for what to do when it does not know enough.

## Measurement is fragmented

A single hallucination score would be convenient and misleading.

TruthfulQA probes whether models mimic common human falsehoods. SimpleQA tests short factual answers with clear verification. Summarization benchmarks check consistency with a source document. FActScore decomposes long outputs into atomic claims. RAGTruth focuses on retrieval-grounded generation. Attribution benchmarks ask whether cited sources support specific claims. Each measures something real; none captures the whole phenomenon.

Short-answer benchmarks are easier to grade but miss long-form synthesis. Long-form benchmarks are more realistic but contain many claims per answer. Faithfulness benchmarks assume a chosen source; many real questions require choosing the source first. Some questions have no stable single answer because facts change, sources disagree, and fields define terms differently, even when benchmarks demand one label.

Model cards and leaderboards compress these differences into a line or a rank. "Better factuality" might mean fewer short-answer errors, better citations, improved abstention, higher long-form precision, or stronger document faithfulness, and those improvements do not always move together.

When someone says Model A hallucinates less than Model B, the follow-up is: on which task, under which conditions, with which scoring rule?

## Training objective versus what users need

At the technical level, hallucinations reflect a mismatch between what training optimizes and what deployment often requires.

A base language model learns a conditional distribution over next tokens:

$$
p_\theta(x_t \mid x_{<t})
$$

by minimizing cross-entropy against observed text:

$$
L = -\sum_t \log p_\theta(x_t \mid x_{<t})
$$

That objective teaches syntax, facts, style, reasoning traces, genre conventions, and latent structure. It still optimizes the likelihood of text, not direct truth-tracking. Users frequently want something closer to epistemic probability:

$$
P(\text{claim is true} \mid \text{evidence, time, context})
$$

Hallucinations appear when high-probability text diverges from truth, evidence, or proper attribution.

Training data is noisy, duplicated, stale, biased toward popular entities, and internally contradictory. Parametric memory compresses information lossily, so similar entities, citation formats, and API names can blur. Inference differs from training: decoding under a prompt, with particular temperature and context, can activate latent associations a small wording change would have suppressed; the model may commit to an initially plausible path and continue coherently along it. Post-training for helpfulness can reinforce complete satisfying answers unless abstention is explicitly rewarded. Retrieval introduces conflicts between parametric memory and provided context, and models do not always defer to the latter. Token probabilities are not semantic confidence.

Semantic entropy samples multiple answers, clusters them by meaning rather than wording, and estimates uncertainty over semantic variation ([Farquhar et al., 2024](https://www.nature.com/articles/s41586-024-07421-0)). It detects an important subset of hallucinations, which Farquhar and colleagues call confabulations, but not all of them. Some errors are systematic and repeatable because training encoded a misconception, the prompt embedded a false premise, or the model holds a stable wrong association.

Recent mechanistic work suggests internal activations sometimes correlate with truthfulness, and inference-time steering can improve benchmark performance, hinting that models may encode more than they reliably say. So far that signal remains model-specific, benchmark-specific, and brittle out of distribution.

A model trained on next-token likelihood learns a compressed, uneven, context-sensitive representation of textually observed regularities. At inference, prompted decoding turns that representation into a sequence. Hallucinations occur when the sequence is plausible under the learned text distribution but insufficiently constrained by truth, source evidence, calibration, or incentives to abstain.

## What helps in practice

The realistic goal is not zero hallucinations. It is fewer hallucinations, earlier detection, and workflows that limit harm when they occur.

When answers depend on external, recent, or specialized facts, retrieval should fetch sources, show them, and ground claims in them. Tools should handle arithmetic, current events, structured lookup, code execution, and domain-specific databases rather than letting the model pretend to do those jobs from memory. Verification layers can draft an answer, decompose it into atomic claims, and check each against evidence. Calibration should change behavior when error is likely, through abstention, clarifying questions, search, human escalation, or toned-down confidence. Cited sources should actually support cited claims. Human review remains mandatory in medicine, law, finance, safety engineering, and public health.

Bhattacharyya and colleagues asked ChatGPT-3.5 to generate medical references; of 115 references, 47% were fabricated, 46% authentic but inaccurate, and 7% both authentic and accurate ([Bhattacharyya et al., 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10277170/)). Dahl and colleagues found public-facing LLMs hallucinating in at least 58% of cases in their legal benchmark and often failing to correct false premises in user questions ([Dahl et al., 2024](https://impact.stanford.edu/article/large-legal-fictions-profiling-legal-hallucinations-large-language-models)). Wrong references and citations can look entirely normal without verification.

Useful systems in high-stakes settings stack retrieval, tools, verification, calibration, citation checking, and human review so errors are less likely, less invisible, and less costly when they slip through. A drafting assistant with mandatory source checking is a different workflow from using the model as an unchecked authority.

## Open problems

Researchers understand a great deal about why hallucinations happen. A complete theory and general cure remain out of reach.

Open questions include whether hallucinations can be fully eliminated in open-ended generation or only bounded; how models should calibrate abstention without becoming useless; whether internal truthfulness signals can be made deployment-reliable; how to evaluate long-form factuality when one dangerous false claim can hide inside an otherwise accurate answer; how systems should handle contested or time-dependent facts; and how to prevent citation laundering, where real-looking references create trust the content does not earn.

Hallucination is a reliability problem that appears whenever fluent generation is asked to stand in for grounded knowledge. Systems need to make evidence visible, treat uncertainty as normal, and build verification into ordinary use.

Language models learn to produce likely text, not to maintain a perfect current map of what is true. Likely and true overlap especially for common stable facts, and they diverge most when facts are rare, recent, ambiguous, source-specific, or thinly represented in training data. The divergence grows when systems reward guessing over abstention, when retrieval returns incomplete evidence, when citations go unchecked, and when a polished answer is taken as verified without checking. When truth matters, the workflow must supply grounding, checking, and accountability.

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
