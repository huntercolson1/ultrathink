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

People usually talk about AI hallucinations as if they are mysterious bugs. A chatbot invents a legal case, a model makes up a medical citation, or a summary includes a detail that was never in the source document. The answer sounds normal, maybe even polished, but some part of it is false or unsupported.

That surface description is accurate, but it does not explain much. It makes hallucinations sound like random glitches, as if the model briefly malfunctioned and then returned to normal. Hallucinations are not random in the way static on a screen is random. They come from the way language models are trained, the data they learn from, the incentives they are given, and the questions they are asked to answer.

A language model learns to produce likely text. Truth is related to likely text, but it is not the same thing. Hallucinations live in that gap.

This post is written in layers. Each section gives a more detailed explanation than the last, so you can stop wherever the answer feels complete. The early sections are meant for someone with no AI background. The later sections get into training objectives, long-tail knowledge, retrieval, calibration, benchmarks, and the parts of the problem that are still not settled.

## The simplest version

Imagine someone who has read a huge number of books, websites, articles, messages, and homework answers. They have seen so many sentences that they have become unusually good at finishing other people’s thoughts.

If you say, “The capital of France is…,” they know the next word is probably “Paris.” If you say, “Peanut butter and…,” they know “jelly” is a pretty safe guess. Most of the time, this is useful. They have seen the pattern before, so they can finish it correctly.

But now imagine you ask a harder question: “What was the title of this obscure person’s PhD dissertation?” or “Which paper first reported this exact medical finding?” The person may not actually know. Because they are so used to finishing sentences, though, they may still give you an answer that sounds as if it belongs there, with the right rhythm, formatting, and tone. It may still be wrong.

That is the simplest version of an AI hallucination: the model gives a sentence that sounds like an answer, but the answer is not true, not supported, or not actually checked.

The important part is that the model is not lying the way a person lies. It is not sitting there thinking, “I know the truth, but I will say something false.” It is producing text that fits the pattern it has learned. Sometimes that pattern points toward truth. Sometimes it points toward something that only sounds true.

A hallucination, in this basic sense, is a right-sounding answer that is wrong or unsupported.

This explanation is enough for everyday use. If you are using a chatbot to draft, summarize, brainstorm, or explain something, remember that fluency is not proof. A model can sound confident before it has earned that confidence.

## The everyday version

The first thing to get clear is that a language model is not a database.

A database stores information in a structured way. You can imagine rows, columns, fields, dates, IDs, and values. If you ask for a particular record, the system looks it up and returns it. A database can still contain wrong information, but the mechanism is lookup.

A language model works differently. During training, it reads enormous amounts of text and learns the statistical structure of language. It learns which words tend to follow other words, which ideas tend to appear together, what a scientific abstract sounds like, how legal citations are formatted, how medical explanations are usually phrased, and how people answer different kinds of questions.

That makes it very powerful. It can generalize, explain, translate, summarize, write code, and reason through problems in ways that simple lookup systems cannot. It also means the model’s basic skill is producing text that fits, not retrieving verified truth.

Most of the time, those overlap. True statements often appear in the training data many times. Common facts are repeated across books, articles, encyclopedias, and websites. If a fact is common, stable, and well represented, a model has a good chance of answering correctly.

Some questions are different. The fact may be rare, disputed, changed after training, buried in one document, or dependent on knowing which source should be trusted. In those cases, the model may still produce a smooth answer because smooth answering is what it has learned to do.

Hallucinations can be so convincing because the model has learned the surface form of expertise. It knows what a journal reference looks like, what a Supreme Court case citation looks like, what a differential diagnosis sounds like, and how a confident paragraph is usually written. If the underlying fact is weak, missing, or confused, the style can remain intact.

That is the dangerous part: bad AI answers often do not look bad. They look like normal answers.

A useful practical rule follows from that: the more a question depends on a specific source, a recent fact, a rare fact, or a high-stakes judgment, the less you should trust an unverified answer. Ask for sources, check the sources, and make sure the cited source actually supports the claim.

Language models are often reliable when the pattern is common and stable. They become less reliable when the answer depends on rare, recent, contested, or source-specific information.

For most people using AI tools, that is enough. You do not need to know the math to use the tool carefully; you just need to remember that a polished answer and a verified answer are different things.

## Factuality and faithfulness are not the same

Once you look more closely, the word “hallucination” turns out to cover several different problems.

The first useful distinction is factuality versus faithfulness.

A factual hallucination is wrong about the world. If a model says a living person was born on the wrong date, names a paper that does not exist, or claims that a drug has an indication it does not have, the answer is factually wrong.

A faithfulness hallucination is different. Here the problem is not necessarily that the claim is false in the world, but that it is not supported by the source the model was supposed to use. Suppose you give a model a one-page article and ask for a summary. The model writes, “The patient improved after treatment,” but the article never says that. Maybe the patient really did improve somewhere else in the medical record; maybe not. Either way, the summary is not faithful to the source.

That distinction matters because people often blur three questions together:

1. Is the statement true?
2. Is the statement supported by the provided evidence?
3. Does the citation actually justify the statement?

Those are not the same question.

A model can give a true answer for the wrong reason. It can cite a source that is related to the topic but does not support the specific claim. It can summarize a document in a way that sounds reasonable but adds details from prior knowledge. It can also be perfectly faithful to a source that is itself outdated or wrong.

Early work on abstractive summarization helped define this problem. In 2020, Maynez and colleagues found that neural summarization systems were “highly prone to hallucinate content that is unfaithful to the input document,” even when the summaries were fluent and readable ([Maynez et al., 2020](https://aclanthology.org/2020.acl-main.173/)). That framing is still useful because it separates the quality of the writing from the faithfulness of the content.

There is another related distinction from summarization research: intrinsic versus extrinsic hallucination. An intrinsic hallucination contradicts the source. An extrinsic hallucination adds something that is not inferable from the source. In a summary, “the patient denied chest pain” would be intrinsic hallucination if the note says the patient had chest pain. “The patient was discharged the next morning” would be extrinsic hallucination if the source never discusses discharge.

In ordinary chat, the boundary is less clean because there may not be a single source document. But the distinction still helps. Some hallucinations are contradictions. Others are unsupported additions.

Hallucination is not one failure type. It can mean a false claim, an unsupported claim, a bad citation, or a failure to stay faithful to a source.

That is why “just add citations” is not enough. Citations improve auditability, but they do not guarantee correctness. The source might not say what the model claims. It might be real but irrelevant. In the worst cases, the citation itself might be fabricated.

## Why next-token prediction is only the start

You will often hear that language models hallucinate because they “predict the next token.” That explanation is directionally right, but too thin on its own.

A token is a chunk of text, often a word or part of a word. During pretraining, a language model is given text and trained to predict missing or next tokens. It learns by adjusting its internal parameters so that the text it predicts becomes closer to the text it saw in training.

The basic objective is not “mark every claim as true or false.” It is not “build a perfectly updated model of the world.” It is closer to “given this context, assign high probability to the text that actually came next.”

This matters because the probability of a sentence under a text distribution is not the same thing as the probability that the sentence is true.

For example, suppose the model gives high probability to a sentence like:

“Dr. Smith won the 2016 Lasker Award for work on X.”

The model has not necessarily estimated, in a clean way, “What is the probability that this claim is true in the world?” It has estimated something closer to, “How plausible is this sequence of words given the patterns I learned?” Those two quantities often correlate, but they can come apart.

TruthfulQA made this point in a concrete way. The benchmark was designed around questions where common human misconceptions are tempting. The authors reported that models could produce false answers that mimic popular misconceptions, and that in their tested systems, scaling alone did not guarantee truthfulness ([Lin, Hilton, and Evans, 2022](https://aclanthology.org/2022.acl-long.229/)). The point was not that bigger models are always less truthful. The point was that imitation of human text can reproduce human falsehoods.

So yes, next-token prediction is part of the explanation. If the training objective rewards likely continuation, a fluent falsehood can be preferred over silence. But the full story needs more pieces.

It needs data distribution, because some facts appear constantly while others barely appear at all. It needs retrieval behavior, because a model can be given evidence and still fail to use it faithfully. It needs inference-time behavior, because temperature, sampling, prompting, context length, and decoding choices can change what comes out. It also needs post-training incentives. If the system is rewarded for being helpful and answering, it may learn to answer even when uncertainty would be more appropriate.

That is why “it predicts the next word” is a useful first sentence, not a complete explanation.

The model learns likely text. Truth often influences likely text, but the training objective does not directly make truth the thing being optimized.

The difference between those two ideas is the core of the problem.

## Rare facts, stale facts, and the long tail

Hallucinations are not evenly distributed. Models are usually better with common facts than rare ones.

The reason is easier to see if you think about the training data. Some facts are repeated everywhere. Paris is the capital of France. Water freezes at 0°C under standard pressure. George Washington was the first U.S. president. These facts appear in many contexts, from encyclopedias to textbooks to quizzes to children’s books. The model gets many chances to learn them.

Other facts live in the long tail. They may appear in one paper, one local news story, one PDF, one court filing, one GitHub issue, one old forum thread, or one obscure biography. The model may have seen them rarely, inconsistently, or not at all. Even if it saw them, they may be competing with similar-looking facts about other people, papers, cases, or functions.

Obscure questions are risky because the model may know the shape of the answer without knowing the answer itself. It can produce the title of a paper that sounds real, name a court case that sounds real, or invent an API method that fits the library’s naming style. The answer is plausible because the local pattern is plausible, not because the fact has been verified.

Work on long-tail knowledge supports this pattern. Kandpal and colleagues showed that model accuracy on factoid question answering strongly tracks how often relevant information appears in pretraining data, and that long-tail facts are especially difficult for models to learn parametrically ([Kandpal et al., 2023](https://proceedings.mlr.press/v202/kandpal23a.html)). In other words, model “knowledge” is not evenly spread across the world. It is denser where the data is denser.

Staleness creates a different version of the same problem. A model trained before a fact changes may answer from an older distribution. The model may know who held an office last year, which guideline used to be current, or what a library’s API looked like before a breaking change. Without retrieval or tool use, it may have no way to know that the world has moved on.

External tools help with this. Search, retrieval, calculators, databases, and source documents can give the model access to information outside its parameters. But they do not remove the need for judgment. The model still has to call the tool, retrieve the right evidence, interpret it correctly, and avoid adding unsupported claims afterward.

Hallucination risk rises when the answer lives in the long tail, changed recently, or depends on one specific source.

This also means hallucination is not a single model-wide trait. A model can be excellent in one region of knowledge and brittle in another. It can answer textbook biology well and fabricate a niche PubMed reference, explain Python syntax well and invent a function from a less common package, or summarize a famous case correctly and mishandle a random district court holding.

## Why retrieval helps, and why it still fails

Retrieval-augmented generation is the natural next step. Instead of asking the model to answer from memory, give it documents, let it search, let it cite, and force it to ground the answer.

This helps a lot, and it is one of the most important practical mitigations we have. If the question depends on recent information, private documents, institutional knowledge, or long-tail facts, retrieval is usually better than closed-book generation.

But retrieval does not make the system hallucination-free.

A retrieval system has at least two parts: it has to find relevant material, and the language model has to use that material faithfully. Either part can fail.

The retrieval step can miss the right document, retrieve one that is topically similar but not actually relevant, surface partial evidence that leaves out a key caveat, return conflicting or stale evidence, or, in adversarial settings, pull in malicious or prompt-injected content.

The generation step can then fail in its own way. The model can ignore the retrieved text and answer from its internal memory, overgeneralize beyond the passages, merge two sources into a claim neither source supports, cite the right document for the wrong sentence, or produce an answer that is mostly grounded except for one unsupported clause.

RAGTruth, a benchmark focused on retrieval-augmented generation, makes this concrete. The project collected nearly 18,000 naturally generated RAG responses and annotated hallucinations at both the case and word level. The authors note that even with retrieved content, models may produce unsupported or contradictory claims ([Niu et al., 2024](https://aclanthology.org/2024.acl-long.585/)).

The practical lesson is that retrieval changes the question from “Did the model memorize the fact?” to “Did the system retrieve the right evidence and use it correctly?” That is a better question, but it still has to be asked.

Legal AI makes this point especially clearly. Legal research tools can retrieve cases, statutes, and regulations, which should reduce hallucinations compared with a general chatbot. But even legal RAG systems have been found to produce nonzero hallucination rates in empirical evaluations. The important distinction is not “RAG versus no RAG.” It is whether the answer is actually supported by the sources it cites.

Retrieval reduces hallucinations by giving the model evidence, but the model can still misuse, ignore, overextend, or mis-cite that evidence.

A source-linked answer is better than an unsourced answer, but it is not automatically correct. The real test is whether the source supports the sentence.

## Why models answer when they should stop

One of the hardest parts of hallucination is behavior under uncertainty.

A model can fail because it does not know the answer, but it can also fail because the system around it has made guessing more rewarding than abstaining.

OpenAI’s 2025 analysis frames this as an evaluation problem. Many benchmarks reward exact correct answers and give no credit for saying “I don’t know.” If a model guesses, it might get lucky; if it abstains, it gets no points. Over thousands of questions, a guessing model can look better on accuracy even while producing more wrong answers ([OpenAI, 2025](https://openai.com/index/why-language-models-hallucinate/)).

That sounds like a small scoring detail, but it matters. If leaderboards and training pipelines reward answer-attempts, models will be pushed toward answer-attempts. The system becomes optimized not only for knowing things, but for acting like it knows things.

SimpleQA makes this easier to see because it separates responses into correct, incorrect, and not attempted. That third category matters. A model that refuses or abstains may be less superficially satisfying, but in many settings, a non-answer is better than a confident false answer ([OpenAI, 2024](https://openai.com/index/introducing-simpleqa/)).

The answer is not simply to make models say “I don’t know” more often. Too much abstention makes the system useless. The hard problem is selective abstention: knowing when to answer, when to ask a clarifying question, when to search, when to cite, and when to stop.

Medicine is a good example. A model that refuses every clinical question is safe but not useful. A model that answers every clinical question is useful-looking but dangerous. The desired behavior is more delicate. It should answer low-risk educational questions, ask for context when context matters, cite reliable sources when making factual claims, and avoid unsupported patient-specific recommendations.

Hallucination is partly an uncertainty problem. A safer model is not just more accurate; it is better at knowing when not to answer.

Hallucinations persist even as models improve because accuracy can rise while the abstention policy remains imperfect. The model may know more, but the system still has to decide what to do when it does not know enough.

## Why hallucinations are hard to measure

A single hallucination score sounds convenient, but it would also be misleading.

Different benchmarks measure different things. A model can improve on one and fail on another because hallucination is not one task.

TruthfulQA tests whether models mimic common human falsehoods. SimpleQA tests short factual answers to questions with clear, verifiable answers. Summarization benchmarks test whether a summary is consistent with a source document. FActScore breaks long-form outputs into atomic facts and checks how many are supported. RAGTruth focuses on retrieval-grounded outputs. Attribution benchmarks ask whether claims are properly supported by cited sources.

All of these benchmarks are useful, and none is complete.

Short factuality benchmarks are easier to grade, but they do not capture long-form synthesis. Long-form factuality benchmarks are more realistic, but they are harder to evaluate because one answer can contain many claims. Source-faithfulness benchmarks are useful when a source exists, but many real questions require choosing the source in the first place. Citation benchmarks help measure grounding, but they can miss cases where the cited corpus is incomplete or outdated.

There is also the problem of ambiguity. Some questions do not have one stable answer. Facts change. Sources disagree. Definitions vary across fields. A benchmark may require a single label, but the world often does not.

This matters because model cards and leaderboards can flatten these differences. “Better factuality” may mean fewer short-answer errors, better citation behavior, improved abstention, better long-form precision, or stronger document faithfulness. Those are related, but they are not interchangeable.

A serious evaluation should ask several questions at once. Is the answer true? Is it supported by the provided source? Are the citations real? Do the citations support the specific claims? Does the model express uncertainty appropriately? Does it ask for clarification when the question is underspecified? Does performance hold up on rare facts, recent facts, and domain-specific facts?

Hallucination measurement is fragmented because hallucination itself is fragmented.

So “Model A hallucinates less than Model B” should always trigger a follow-up question: less on what task, under what conditions, and with what scoring rule?

## The technical version

At the technical level, hallucinations arise from a mismatch between what the model is optimized to do during training and what users often need from it during deployment.

A base language model is trained to maximize the likelihood of observed text. Informally, given a sequence of previous tokens, it learns to assign high probability to the next token that appeared in the training data. In notation, the model is learning a distribution like:

$$
p_\theta(x_t \mid x_{<t})
$$

where $x_t$ is the next token, $x_{<t}$ is the preceding context, and $\theta$ represents the model parameters.

The usual training objective minimizes cross-entropy loss:

$$
L = -\sum_t \log p_\theta(x_t \mid x_{<t})
$$

This objective is extremely powerful. It forces the model to learn syntax, facts, style, reasoning traces, world regularities, genre conventions, and latent structure from text. But it is still optimizing the likelihood of text, not direct truth-tracking.

The user often wants something closer to:

$$
P(\text{claim is true} \mid \text{evidence, time, context})
$$

Those are different targets. The first is a probability over text; the second is an epistemic probability over a claim. Hallucinations appear when high-probability text diverges from truth, evidence, or attribution.

Several mechanisms contribute to that divergence.

First, the training data is imperfect. It is noisy, duplicated, stale, biased toward popular entities, and full of contradictions. The model absorbs structure from that data, but not as a clean fact table. Long-tail knowledge is especially fragile because rare facts have weak representation. Scaling helps in many cases, but it does not evenly solve sparse, arbitrary, or changing facts.

Second, compression is lossy. Parametric memory stores information in distributed weights, and the model does not preserve every source and every fact with perfect fidelity. Similar facts can interfere. Entities with similar names, citations with similar formats, and APIs with similar naming conventions can blur together.

Third, inference is not training. At generation time, the model is sampled or decoded under a prompt, with a particular temperature, context window, system instruction, and conversation history. Small changes in prompt phrasing can alter which latent associations become active. The model may start down a plausible path and then continue coherently along that path even if the first step was unsupported.

Fourth, post-training changes behavior. Instruction tuning and reinforcement learning from human feedback make models more helpful, conversational, and aligned with user preferences. That usually improves usability and often improves factuality, but it can also strengthen the tendency to provide a satisfying answer. If the model is implicitly rewarded for helpfulness, confidence, and completion, abstention has to be trained and rewarded too.

Fifth, retrieval creates conflicts. When retrieved context disagrees with parametric memory, the model has to decide which to trust. It does not always defer to the provided context; it can answer from memory, blend memory with context, or overfit to a misleading retrieved passage. This is why even correct retrieval does not guarantee faithful generation.

Sixth, uncertainty is not directly exposed. Token probabilities are not the same as semantic confidence. A model can be locally confident about the next word while globally uncertain about the claim, and it can express verbal confidence poorly. Asking “how sure are you?” is not a reliable calibration method.

Semantic entropy tries to address one part of this. Farquhar and colleagues proposed sampling multiple answers, grouping them by meaning rather than wording, and estimating uncertainty over semantic clusters. If sampled answers differ in meaning, the model may be uncertain in a way that token-level entropy would miss. Their Nature paper showed that semantic entropy can detect an important subset of hallucinations, which they call confabulations ([Farquhar et al., 2024](https://www.nature.com/articles/s41586-024-07421-0)).

That last phrase matters: a subset. Some hallucinations are arbitrary, while others are systematic. A model may give the same wrong answer every time because the data supported a misconception, the prompt induced a false premise, or the model has a stable but wrong internal association. Semantic variation is useful evidence, but lack of variation is not proof of truth.

Current research gets especially interesting here. Some mechanistic work suggests models may contain internal signals correlated with truthfulness. Inference-time intervention studies have shown that steering certain internal activations can improve truthfulness on benchmarks. That hints that models sometimes “know” more than they say. But this is not yet a general engineering solution. Internal truthfulness signals may be model-specific, benchmark-specific, or brittle out of distribution.

The frontier view is therefore not simply that models hallucinate because they predict tokens. It is closer to this:

A model trained on next-token likelihood learns a compressed, uneven, and context-sensitive representation of the textual world. At inference time, a prompted decoding process turns that representation into a sequence. Hallucinations occur when the generated sequence is plausible under the learned text distribution but not adequately constrained by truth, source evidence, calibration, or incentives to abstain.

That is longer than the usual explanation, but it is closer to the real object.

Hallucination is not one mechanism. It is the failure mode that appears when likelihood-trained generation is asked to behave like grounded, calibrated truth-tracking.

The problem has no single fix. Better data, retrieval, tool use, verification, calibration, abstention, and human review all help. None of them turns a general-purpose generator into an infallible source of truth.

## What reduces hallucinations in practice

The practical goal is not to eliminate hallucinations. It is to reduce them, surface them, and make them easier to catch.

Retrieval is usually the first layer. If the answer depends on external facts, especially recent or specialized facts, the system should not rely only on parametric memory. It should retrieve sources, show them, and ground the answer in them.

Tool use is another layer. Calculators should do arithmetic, search should handle current information, databases should handle structured lookup, code execution should test code, and domain-specific systems should use domain-specific resources.

Verification is a third layer. A model can draft an answer and then check each claim against sources, ask targeted verification questions, or decompose a long answer into atomic claims and inspect them one by one. This is not perfect, especially if the model has no external evidence, but it can reduce obvious unsupported claims.

Calibration is a fourth layer. The system should estimate when it is likely to be wrong and change behavior accordingly. That might mean abstaining, asking a clarifying question, searching, escalating to a human, or lowering the confidence of the answer.

Citation discipline is a fifth layer. The model should cite sources when claims need support, but the system should also check whether the cited source supports the claim. A citation that merely decorates an answer is not grounding.

Human review is still required in high-stakes settings, especially in medicine, law, finance, safety engineering, and public health. The model can help with drafting, searching, summarizing, and organizing, but responsibility cannot be outsourced to a fluent paragraph.

Medical citation hallucinations are a good example of why. Bhattacharyya and colleagues asked ChatGPT-3.5 to generate short medical papers with references. Of 115 generated references, 47% were fabricated, 46% were authentic but inaccurate, and only 7% were authentic and accurate ([Bhattacharyya et al., 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10277170/)). The dangerous part is not only that the references were wrong, but that wrong references can look normal.

Legal hallucinations show the same pattern. In Large Legal Fictions, Dahl and colleagues found that public-facing LLMs hallucinated at least 58% of the time in their legal benchmark setup and often failed to correct false assumptions in user questions ([Dahl et al., 2024](https://impact.stanford.edu/article/large-legal-fictions-profiling-legal-hallucinations-large-language-models)). Legal citations have a recognizable form, which makes fabricated authority especially easy to miss if nobody checks it.

These examples should not lead to the conclusion that AI is useless in medicine or law. They point to something more precise: the usefulness of AI in high-stakes domains depends on workflow design. A model used as a writing assistant with source verification is different from a model used as an unchecked authority.

The safest systems do not depend on one hallucination fix. They layer retrieval, tools, verification, calibration, citation checking, and human review.

The question is not whether the model can ever be wrong. It can. The question is whether the system is designed so that wrongness is less likely, less hidden, and less consequential.

## What remains unresolved

The field understands a lot about why hallucinations happen, but it does not yet have a complete theory.

Several open questions still matter.

Can hallucinations be fully eliminated in open-ended generative systems, or only reduced? The answer depends partly on what we mean by hallucination. If a model is allowed to abstain on every uncertain question, many hallucinations can be avoided, but the system becomes less useful. If the system must answer broad, ambiguous, source-dependent questions, some risk remains.

How should models decide when to abstain? This is harder than it sounds. Abstaining too little creates confident errors. Abstaining too much creates a tool that refuses useful work. Good abstention requires calibrated uncertainty, task awareness, and sensitivity to the cost of error.

Can internal truthfulness signals become reliable enough for deployment? Mechanistic work suggests that models may encode information related to truthfulness, but turning that into a dependable, general-purpose safety method is still unresolved.

How should we evaluate long-form factuality? Short answers are easier to grade. Long answers contain many claims, some central and some incidental. A model might be 95% correct and still include one dangerous false statement. Whole-answer scores are often too coarse.

How should systems handle contested or changing facts? Truth is not always a stable lookup. Some claims depend on time, jurisdiction, source choice, definitions, or expert disagreement. In those cases, source attribution and uncertainty may be more appropriate than a single confident answer.

How do we prevent citation laundering? Once users see citations, they may trust the answer. But citations can be fabricated, irrelevant, outdated, or attached to claims they do not support. A system that cites sources without checking support can create a false sense of reliability.

These are not edge cases. They are central to using AI responsibly.

The most honest conclusion is that hallucination is not a strange side effect we can patch once and forget. It is a structural reliability problem that appears whenever fluent generation is asked to substitute for grounded knowledge. The best systems will not be the ones that promise never to hallucinate; they will be the ones that make grounding visible, uncertainty acceptable, and verification part of the workflow.

## The short version

AI hallucinations happen because language models learn to produce likely text, not because they possess a perfect truth-tracking mechanism. Likely text is often true, especially for common and stable facts, but the two can come apart. They come apart most often when a fact is rare, recent, ambiguous, source-specific, or poorly represented in training data.

The problem is made worse when systems reward answering over abstaining, when retrieval finds incomplete evidence, when citations are treated as decoration, or when users mistake fluency for verification.

The answer is not to stop using AI. It is to understand what kind of tool it is. A language model is a powerful generator and reasoning assistant, but it is not, by default, a source of truth. When truth matters, the workflow has to add grounding, checking, and accountability.

## Glossary

Abstention: When a model chooses not to answer because it lacks enough evidence or confidence. A good system should abstain selectively, not constantly.

Attribution: Whether a claim can be traced to a source that actually supports it.

Calibration: The relationship between confidence and correctness. A calibrated model that says it is 80% confident should be right about 80% of the time in similar cases.

Cross-entropy loss: A training loss that penalizes the model when it assigns low probability to the actual next token in the training data.

Faithfulness: Whether an answer stays supported by the source or context it was given.

Factuality: Whether a claim is true in the world.

Hallucination: Generated content that is false, unsupported, unverifiable, or not faithful to the relevant source.

Long-tail knowledge: Rare or obscure information that appears infrequently in training data.

Parametric memory: Information stored implicitly in the model’s weights.

RAG, or retrieval-augmented generation: A system design where the model retrieves external documents and uses them to answer.

Semantic entropy: An uncertainty method that samples multiple answers and measures variation in meaning rather than variation in wording.

Token: A chunk of text used by the model, often a word, part of a word, or punctuation.

## Further reading

* Joshua Maynez, Shashi Narayan, Bernd Bohnet, and Ryan McDonald, “[On Faithfulness and Factuality in Abstractive Summarization](https://aclanthology.org/2020.acl-main.173/)”, ACL 2020.
* Stephanie Lin, Jacob Hilton, and Owain Evans, “[TruthfulQA: Measuring How Models Mimic Human Falsehoods](https://aclanthology.org/2022.acl-long.229/)”, ACL 2022.
* Nikhil Kandpal, Haikang Deng, Adam Roberts, Eric Wallace, and Colin Raffel, “[Large Language Models Struggle to Learn Long-Tail Knowledge](https://proceedings.mlr.press/v202/kandpal23a.html)”, ICML 2023.
* Cheng Niu et al., “[RAGTruth: A Hallucination Corpus for Developing Trustworthy Retrieval-Augmented Language Models](https://aclanthology.org/2024.acl-long.585/)”, ACL 2024.
* Sebastian Farquhar, Jannik Kossen, Lorenz Kuhn, and Yarin Gal, “[Detecting hallucinations in large language models using semantic entropy](https://www.nature.com/articles/s41586-024-07421-0)”, Nature 2024.
* OpenAI, “[Introducing SimpleQA](https://openai.com/index/introducing-simpleqa/)”, 2024.
* OpenAI, “[Why language models hallucinate](https://openai.com/index/why-language-models-hallucinate/)”, 2025.
* Matthew Dahl, Varun Magesh, Mirac Suzgun, and Daniel E. Ho, “[Large Legal Fictions: Profiling Legal Hallucinations in Large Language Models](https://impact.stanford.edu/article/large-legal-fictions-profiling-legal-hallucinations-large-language-models)”, Journal of Legal Analysis, 2024.
* Mehul Bhattacharyya, Valerie M. Miller, Debjani Bhattacharyya, and Larry E. Miller, “[High Rates of Fabricated and Inaccurate References in ChatGPT-Generated Medical Content](https://pmc.ncbi.nlm.nih.gov/articles/PMC10277170/)”, Cureus 2023.
