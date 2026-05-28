---
title: How a Simple Perceptron Memorizes Random Labels
date: 2026-05-27
author: Hunter Colson
subtitle: A beginner-friendly chapter on pixels, hyperplanes, VC dimension, and why perfect training accuracy can fool you.
description: A long-form tutorial showing how a high-dimensional perceptron can fit random labels on real cat and dog images, and what that teaches about memorization, rank, VC dimension, and generalization.
tags:
  - tutorial
  - machine-learning
  - perceptron
  - linear-algebra
  - vc-dimension
---

<section id="the-strange-experiment">
<h2>The strange experiment</h2>
<p>Start with something familiar: a folder of cat and dog face photographs. Shrink every image to a 64 by 64 grayscale square, turn the pixels into numbers, and give those numbers to one of the simplest classifiers in machine learning, a single perceptron.</p>
<p>If the labels still mean cat and dog, perfect training accuracy sounds like a small victory. The model saw the training images, adjusted its weights, and eventually got every one right. It is tempting to imagine that it found something visual: ears, eyes, snouts, fur texture, or some other pattern that would also make sense to a person looking at the photographs.</p>
<p>This chapter removes that explanation on purpose. After the images are processed, the true labels are thrown away and replaced with random <span class="math inline">\(+1\)</span> and <span class="math inline">\(-1\)</span> targets. Some cats receive <span class="math inline">\(+1\)</span>, some cats receive <span class="math inline">\(-1\)</span>, and the same thing happens to the dogs. The photographs remain real, but the target attached to each photograph no longer means cat or dog. It is a coin flip written beside an image.</p>
<p>For the processed images used here, the perceptron can still fit those random labels perfectly through 4097 training examples. That result cannot mean the model recognized cats, because the labels no longer contain a cat concept to recognize. It means the model had enough geometric freedom to assign the requested signs to the particular images in front of it. Perfect training accuracy can come from a useful rule, but it can also come from a space with enough room to memorize.</p>
<p>The lesson is narrow, which is why it is useful. This is not an argument that perceptrons are bad, that high-dimensional models are useless, or that VC dimension explains all of modern deep learning. It is a clean demonstration of capacity. When the number of examples is small relative to the number of input dimensions, even a plain linear classifier can fit labels that contain no meaning at all.</p>
</section>
<section id="the-experiment">
<h2>The experiment in one pass</h2>
<p>The experiment uses the AFHQ animal-faces dataset and keeps the machinery deliberately plain. The code loads cat and dog images, resizes them to 64 by 64 grayscale, flattens each image into a row of 4096 numbers, assigns random binary labels, and then asks one question in two different ways.</p>
<p>The first route is algebraic. It asks whether we can directly construct weights that classify every randomized training image correctly. This route builds a matrix from the images, adds one bias column, checks whether the rows of that matrix have the right rank, and then solves for weights whose scores match the target labels exactly:</p>
<p><span id="eq-linear-system"><span class="math display">\[
X_{\mathrm{aug}}\tilde{w} = y.
\tag{1}\]</span></span></p>
<p>The equation asks whether there is one parameter vector, <span class="math inline">\(\tilde{w}\)</span>, whose scores exactly match the label vector <span class="math inline">\(y\)</span>. If the score for each image is exactly <span class="math inline">\(+1\)</span> or <span class="math inline">\(-1\)</span>, then the sign of every score is correct, and the perceptron has zero training error on the randomized labels.</p>
<p>The second route is algorithmic. It uses the perceptron learning rule instead of solving the equation directly. The model starts with weights at zero, looks at one image at a time, and changes its weights only when it makes a mistake. Once the algebra tells us a separator exists, the training run asks a more practical question: how hard is it for the original mistake-driven algorithm to find one? Figure 1 shows how the same images move through both tests.</p>
<figure class="post-figure-card post-figure-card--image" id="fig-pipeline">

<div class="post-figure-card__media-frame"><img alt="The experiment turns images into a high-dimensional linear-algebra problem. Real cat and dog images are resized, flattened into 4096-pixel vectors, augmented with a bias column, assigned random labels, and then passed to both an exact separator proof and perceptron training." class="post-figure-card__media theme-asset theme-asset--light" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/experiment_pipeline.svg?v=20260527h"/><img alt="" aria-hidden="true" class="post-figure-card__media theme-asset theme-asset--dark" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/experiment_pipeline-dark.svg?v=20260527h"/></div><figcaption class="post-figure-card__caption" id="fig-pipeline-caption-0ceaefa1-69ba-4598-a22c-09a6ac19f8ca">
The whole experiment as a pipeline. The photographs are real, but the labels used for training are random. After resizing and flattening, each image becomes a 4096-number row; adding the bias gives the algebra and the perceptron learning rule the same input representation.
</figcaption>
</figure>
</section>
<section id="how-to-read-the-experiment">
<h2>How to read the experiment</h2>
<p>This chapter assumes no machine learning background. The math is here because the claim is mathematical, but the symbols arrive only when they have a job to do. We will start with an image, turn it into a vector, turn a perceptron into a weighted sum over that vector, and then treat the bias term as one more column in a matrix. Once those pieces are in place, the VC-dimension statement becomes a concrete claim about how many independent constraints a linear model can satisfy.</p>
<p>By the end, the notation should feel like a compact language for things you can already picture. You should know what <span class="math inline">\(x\)</span> is, what <span class="math inline">\(w\)</span> is, why <span class="math inline">\(b\)</span> can be treated as another weight, what rank is checking, why <span class="math inline">\(X_{\mathrm{aug}}\tilde{w}=y\)</span> proves that a separator exists, why the perceptron learning rule can still take many epochs, and why training accuracy alone cannot tell us whether the model learned a concept that will travel to new examples. The thread is simple once the notation is unpacked: a perceptron is a weighted sum, an image is a long list of pixels, and a high-dimensional list gives that weighted sum many adjustable directions.</p>
</section>
<section id="the-capacity-claim">
<h2>The number hiding in the image</h2>
<p>A 64 by 64 grayscale image contains</p>
<p><span class="math display">\[
64 \times 64 = 4096
\]</span></p>
<p>pixels. Flattening does not change those values; it only changes their arrangement. The square image becomes one long row of numbers, which we write as</p>
<p><span class="math display">\[
x = (x_1, x_2, \ldots, x_{4096}).
\]</span></p>
<p>The symbol <span class="math inline">\(x\)</span> means one input image after it has been converted into numbers. The value <span class="math inline">\(x_1\)</span> is the first pixel, <span class="math inline">\(x_2\)</span> is the second pixel, and the sequence continues until the last pixel, <span class="math inline">\(x_{4096}\)</span>. The perceptron has one weight for each of those pixel positions, plus one bias term that shifts the decision boundary. Its raw score is</p>
<p><span id="eq-score"><span class="math display">\[
\begin{aligned}
s ={}& w_1x_1 + w_2x_2 + \cdots \\
&+ w_{4096}x_{4096} + b.
\end{aligned}
\tag{2}\]</span></span></p>
<p>The values <span class="math inline">\(w_1,\ldots,w_{4096}\)</span> are the pixel weights, <span class="math inline">\(b\)</span> is the bias, and <span class="math inline">\(s\)</span> is the signed score produced by the model. A positive score becomes the prediction <span class="math inline">\(+1\)</span>; a negative score becomes the prediction <span class="math inline">\(-1\)</span>. The whole classifier is controlled by 4097 adjustable numbers: 4096 pixel weights and one bias.</p>
<p>That count is the center of the experiment. For linear classifiers in <span class="math inline">\(d\)</span> input dimensions, the VC dimension is <span class="math inline">\(d+1\)</span>. Here <span class="math inline">\(d=4096\)</span>, so the boundary is <span class="math inline">\(d+1=4097\)</span>. Under the right rank condition, a linear classifier can fit any binary labels on up to 4097 examples, even labels assigned by random coin flips. If the model fits the randomized labels, the success cannot be credited to cat features or dog features. The labels no longer point to animals; they point to capacity.</p>
</section>
<section id="the-data-animal-faces-become-rows-of-numbers">
<h2>The data: animal faces become rows of numbers</h2>
<p>The dataset is Kaggle’s <code>andrewmvd/animal-faces</code>, commonly known as AFHQ, short for Animal Faces-HQ. It contains high-resolution animal face images in cat, dog, and wildlife categories. This experiment uses only cats and dogs. The true animal class is used only to select the images and to make the figures readable; after that, the training labels are replaced with random <span class="math inline">\(-1\)</span> and <span class="math inline">\(+1\)</span> targets.</p>
<p>The original inputs are photographs, but the perceptron never receives them as photographs. Before training, each image goes through the same processing pipeline:</p>
<ol type="1">
<li>load the image;</li>
<li>convert it to grayscale;</li>
<li>resize it to 64 by 64 pixels;</li>
<li>scale the pixel values numerically;</li>
<li>flatten the image into a 4096-number row.</li>
</ol>
<p>At first this can feel as if the image has disappeared. It has not. A 64 by 64 grid and a 4096-number row contain the same brightness values in different arrangements. The grid is easier for us to inspect visually; the row is easier for the model to multiply by weights. For a tiny 3 by 3 grayscale image, the same rearrangement would look like this:</p>
<p><span class="math display">\[
\begin{bmatrix}
12 &amp; 40 &amp; 91 \\
8 &amp; 55 &amp; 110 \\
4 &amp; 61 &amp; 130
\end{bmatrix}
\quad \longrightarrow \quad
(12, 40, 91, 8, 55, 110, 4, 61, 130).
\]</span></p>
<p>A vector is an ordered list of numbers. The order matters because each position corresponds to a location in the original image. Pixel 1 might be the upper-left corner. Pixel 4096 might be the lower-right corner. Once every image has been turned into a vector, the training set becomes a table: one image per row, one pixel position per column. If there are <span class="math inline">\(N\)</span> images, the table has <span class="math inline">\(N\)</span> rows and 4096 pixel columns. We call that table <span class="math inline">\(X\)</span>.</p>
</section>
<section id="the-perceptron-as-a-small-machine">
<h2>The perceptron as a small machine</h2>
<p>The perceptron is a linear classifier, which means its entire computation is a weighted sum followed by a sign check. It takes the input numbers, multiplies each one by a corresponding weight, adds those products together, adds a bias, and then asks whether the final score is positive or negative.</p>
<p><a href="#fig-perceptron-anatomy">Figure 2</a> draws that computation as a small machine. Pixel values enter on the left, weights scale them, the bias shifts the sum, and the sign of the final score becomes the prediction.</p>
<figure class="post-figure-card post-figure-card--image" id="fig-perceptron-anatomy">

<div class="post-figure-card__media-frame"><img alt="A perceptron multiplies each input feature by a weight, adds the weighted values plus the bias, and predicts by checking whether the score is positive or negative." class="post-figure-card__media theme-asset theme-asset--light" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/perceptron_anatomy.svg?v=20260527h"/><img alt="" aria-hidden="true" class="post-figure-card__media theme-asset theme-asset--dark" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/perceptron_anatomy-dark.svg?v=20260527h"/></div><figcaption class="post-figure-card__caption" id="fig-perceptron-anatomy-caption-0ceaefa1-69ba-4598-a22c-09a6ac19f8ca">
A perceptron turns an input vector into one signed score. The weights decide how much each pixel position contributes, the bias shifts the cutoff point, and the final sign becomes the predicted label.
</figcaption>
</figure>
<p>The word “linear” matters. This single perceptron does not multiply pixels by other pixels, build a hierarchy of eye and ear detectors, or search for local patches the way a modern vision network might. It computes the weighted sum in <a href="#eq-score">Equation 2</a> and checks the sign.</p>
<p>In symbols, the prediction is</p>
<p><span class="math display">\[
\hat{y} =
\begin{cases}
+1 &amp; \text{if } w^\top x + b \ge 0, \\
-1 &amp; \text{if } w^\top x + b &lt; 0.
\end{cases}
\]</span></p>
<p>The symbol <span class="math inline">\(\hat{y}\)</span>, pronounced “y-hat,” means the model’s predicted label. The true target label is written <span class="math inline">\(y\)</span>, and in this experiment it is always either <span class="math inline">\(+1\)</span> or <span class="math inline">\(-1\)</span>. The learned model is contained in <span class="math inline">\(w\)</span> and <span class="math inline">\(b\)</span>: the vector <span class="math inline">\(w\)</span> holds the pixel weights, and the scalar <span class="math inline">\(b\)</span> holds the bias. Before training, those numbers are starting values. During training, they are adjusted until the signs of the scores match the labels on the training set.</p>
</section>
<section id="a-line-before-a-hyperplane">
<h2>A line before a hyperplane</h2>
<p>The 4096-dimensional case is impossible to draw honestly, so it helps to begin in a toy world with only two inputs. In that smaller world, the perceptron score has the same structure as before, only with fewer terms:</p>
<p><span class="math display">\[
s = w_1x_1 + w_2x_2 + b.
\]</span></p>
<p>The decision boundary is the set of points where that score equals zero:</p>
<p><span class="math display">\[
w_1x_1 + w_2x_2 + b = 0.
\]</span></p>
<p>In two dimensions, that equation describes a line. Points on one side have positive scores, points on the other side have negative scores, and points exactly on the line are the cases where the model is undecided. Now take three points:</p>
<table class="post-data-table">
<thead>
<tr>
<th>point</th>
<th><span class="math inline">\(x_1\)</span></th>
<th><span class="math inline">\(x_2\)</span></th>
<th>label</th>
</tr>
</thead>
<tbody>
<tr>
<td>A</td>
<td>0</td>
<td>0</td>
<td>-1</td>
</tr>
<tr>
<td>B</td>
<td>1</td>
<td>0</td>
<td>+1</td>
</tr>
<tr>
<td>C</td>
<td>0</td>
<td>1</td>
<td>+1</td>
</tr>
</tbody>
</table>
<p>One separator is:</p>
<p><span class="math display">\[
2x_1 + 2x_2 - 1 = 0.
\]</span></p>
<p>This means <span class="math inline">\(w_1=2\)</span>, <span class="math inline">\(w_2=2\)</span>, and <span class="math inline">\(b=-1\)</span>. Check the score at each point:</p>
<p><span class="math display">\[
\begin{aligned}
A &amp;: 2(0) + 2(0) - 1 = -1, \\
B &amp;: 2(1) + 2(0) - 1 = +1, \\
C &amp;: 2(0) + 2(1) - 1 = +1.
\end{aligned}
\]</span></p>
<p>The scores exactly equal the labels, so their signs are correct as well. The perceptron does not need the score to equal the label in order to classify correctly, but equality gives us a cleaner construction: the same equation both assigns the scores and proves the classifications are right.</p>
<figure class="post-figure-card post-figure-card--image" id="fig-toy-separator">

<div class="post-figure-card__media-frame"><img alt="A line separating three points in two dimensions. The same logic scales to a hyperplane in 4096 dimensions." class="post-figure-card__media theme-asset theme-asset--light" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/toy_separator_2d.svg?v=20260527h"/><img alt="" aria-hidden="true" class="post-figure-card__media theme-asset theme-asset--dark" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/toy_separator_2d-dark.svg?v=20260527h"/></div><figcaption class="post-figure-card__caption" id="fig-toy-separator-caption-0ceaefa1-69ba-4598-a22c-09a6ac19f8ca">
In two dimensions, the separator is a line. In the image experiment, the same equation becomes a hyperplane in a space with 4096 pixel axes plus the bias.
</figcaption>
</figure>
<p>This tiny example already contains the larger result. There are two input dimensions plus one bias term, giving three adjustable numbers, and with three points in a favorable position those numbers can be chosen so the scores match arbitrary binary labels. For images, replace the two input dimensions with 4096. The same kind of separator becomes a hyperplane, which is the high-dimensional version of a line or plane.</p>
</section>
<section id="what-a-perceptron-cannot-do">
<h2>What a perceptron cannot do</h2>
<p>The perceptron is limited. A single perceptron can draw only one linear boundary. The classic failure case is XOR, where four points sit at the corners of a square with matching labels on opposite corners:</p>
<table class="post-data-table">
<thead>
<tr>
<th><span class="math inline">\(x_1\)</span></th>
<th><span class="math inline">\(x_2\)</span></th>
<th>label</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>0</td>
<td>-1</td>
</tr>
<tr>
<td>1</td>
<td>0</td>
<td>+1</td>
</tr>
<tr>
<td>0</td>
<td>1</td>
<td>+1</td>
</tr>
<tr>
<td>1</td>
<td>1</td>
<td>-1</td>
</tr>
</tbody>
</table>
<p>No single line can separate those labels, because whichever way the line is drawn, one corner from each class ends up on the wrong side.</p>
<figure class="post-figure-card post-figure-card--image" id="fig-xor">

<div class="post-figure-card__media-frame"><img alt="The XOR pattern is not linearly separable because matching labels sit on opposite corners of the square." class="post-figure-card__media theme-asset theme-asset--light" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/xor_nonseparable.svg?v=20260527h"/><img alt="" aria-hidden="true" class="post-figure-card__media theme-asset theme-asset--dark" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/xor_nonseparable-dark.svg?v=20260527h"/></div><figcaption class="post-figure-card__caption" id="fig-xor-caption-0ceaefa1-69ba-4598-a22c-09a6ac19f8ca">
XOR is the small counterexample every perceptron tutorial needs. One line cannot put both positive corners on one side and both negative corners on the other.
</figcaption>
</figure>
<p>This is why the result in this chapter has to be stated carefully. A perceptron cannot learn every pattern. It can still fit many arbitrary labelings when the input dimension is large and the number of examples is not too large.</p>
<p>XOR belongs in the chapter because it keeps the capacity claim honest. It shows the limitation of a single linear boundary, while VC dimension shows how much freedom that same boundary can have when the examples live in a high-dimensional space.</p>
</section>
<section id="random-labels-are-the-diagnostic">
<h2>Random labels are the diagnostic</h2>
<p>If we trained on true cat and dog labels and got 100 percent training accuracy, it would be natural to say the model learned cats versus dogs. It might have. Training accuracy alone cannot prove that, because the same number can come from a model that learned a visual rule and from a model that found a way to fit the examples it saw.</p>
<p>The cleaner test is to destroy the meaning of the labels while leaving the images intact. In this experiment, every training image receives a target label</p>
<p><span class="math display">\[
y_i \in \{-1,+1\}.
\]</span></p>
<p>The subscript \(i\) means “for example \(i\).” So \(y_{17}\) is the random label assigned to image 17, independent of whether image 17 is a cat or a dog.</p>
<figure class="post-figure-card post-figure-card--image" id="fig-random-labels">

<div class="post-figure-card__media-frame"><img alt="Real AFHQ cat and dog images with random training labels. The random label, not the true animal class, is what the perceptron is asked to fit." class="post-figure-card__media theme-asset theme-asset--light" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/random_label_examples_n500.png?v=20260527h"/><img alt="" aria-hidden="true" class="post-figure-card__media theme-asset theme-asset--dark" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/random_label_examples_n500-dark.png?v=20260527h"/></div><figcaption class="post-figure-card__caption" id="fig-random-labels-caption-0ceaefa1-69ba-4598-a22c-09a6ac19f8ca">
The photographs still look like cats and dogs to us, but the model is asked to fit the random labels printed beside them. The animal category is no longer the target.
</figcaption>
</figure>
<p>If the perceptron fits those labels, the explanation cannot be that it learned the visual concept cat or dog. The label no longer encodes that concept. The model is fitting a random split of the training images, turning the experiment into a capacity test instead of an animal-recognition test.</p>
</section>
<section id="what-is-vc-dimension">
<h2>What is VC dimension?</h2>
<p>VC dimension is a way to measure how flexible a class of models is. The formal theory goes deeper than this chapter needs, but the central idea starts with a counting question. Take \(N\) points. If each point can receive one of two labels, there are</p>
<p><span class="math display">\[
2^N
\]</span></p>
<p>possible labelings. For three points, that gives \(2^3 = 8\) possible assignments; for ten points, \(2^{10}=1024\). VC dimension asks whether a class of models can realize all of those assignments, not merely one convenient assignment.</p>
<p>A model class is said to shatter a particular set of points if it can fit every possible binary labeling of those points. No matter how you assign <span class="math inline">\(+1\)</span> and <span class="math inline">\(-1\)</span>, some model in the class gets all the labels right.</p>
<p>The VC dimension is the size of the largest set of points the model class can shatter in the right geometric position. For linear separators in <span class="math inline">\(d\)</span> input dimensions, the VC dimension is:</p>
<p><span id="eq-vc-dimension"><span class="math display">\[
d + 1.
\tag{3}\]</span></span></p>
<p>In this experiment:</p>
<p><span class="math display">\[
d = 4096,
\qquad
d + 1 = 4097.
\]</span></p>
<p>Stated without the formal machinery, a linear classifier in 4096 dimensions can shatter 4097 points in general position. “General position” is a geometry phrase for points that have not fallen into a degenerate arrangement that removes independent directions. In the code, we do not assume the condition; we check it by measuring the rank of the augmented image matrix. Figure 6 shows why 4097 is the ceiling in this setup.</p>
<p>VC dimension does not say the perceptron understands cats and dogs. It says the class of linear separators has enough capacity to realize any labeling of a sufficiently well-positioned set of up to 4097 image vectors. Random labels make that statement visible because they remove the visual story that would otherwise distract from the geometry.</p>
<figure class="post-figure-card post-figure-card--image" id="fig-capacity-boundary">

<div class="post-figure-card__media-frame"><img alt="The augmented image matrix has one row per example and 4097 columns after the bias is added. In this sampled AFHQ run, the rank follows the number of examples through 4097 and then stops at the column limit, which is exactly the capacity boundary this chapter is testing." class="post-figure-card__media theme-asset theme-asset--light" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/capacity_boundary.svg?v=20260527h"/><img alt="" aria-hidden="true" class="post-figure-card__media theme-asset theme-asset--dark" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/capacity_boundary-dark.svg?v=20260527h"/></div><figcaption class="post-figure-card__caption" id="fig-capacity-boundary-caption-0ceaefa1-69ba-4598-a22c-09a6ac19f8ca">
After the bias column is added, the data matrix has 4097 columns. In this sampled AFHQ run, the rank follows the number of examples through 4097 and then hits the column ceiling.
</figcaption>
</figure>
</section>
<section id="why-the-bias-creates-4097-columns">
<h2>Why the bias creates 4097 columns</h2>
<p>The perceptron score is:</p>
<p><span class="math display">\[
s = w^\top x + b.
\]</span></p>
<p>The notation <span class="math inline">\(w^\top x\)</span> is shorthand for:</p>
<p><span class="math display">\[
w_1x_1 + w_2x_2 + \cdots + w_{4096}x_{4096}.
\]</span></p>
<p>The bias \(b\) is separate from the pixel weights in the usual formula, but it can be folded into the same vector by adding one extra input that is always equal to 1. For one image, define the augmented input as</p>
<p><span class="math display">\[
x_{\mathrm{aug}} = (x_1, x_2, \ldots, x_{4096}, 1).
\]</span></p>
<p>The word “augmented” only means that the extra constant value has been appended. Now define the augmented parameter vector as</p>
<p><span class="math display">\[
\tilde{w} = (w_1, w_2, \ldots, w_{4096}, b).
\]</span></p>
<p>The tilde over \(\tilde{w}\) is a reminder that this vector includes the bias. With this notation, the score becomes</p>
<p><span class="math display">\[
s = x_{\mathrm{aug}}^\top \tilde{w}.
\]</span></p>
<p>This is the same score as before, only rewritten so the bias behaves like one more weight. For a whole dataset with \(N\) images, the augmented matrix \(X_{\mathrm{aug}}\) has \(N\) rows and 4097 columns, with each row holding one image plus the final 1:</p>
<p><span class="math display">\[
X_{\mathrm{aug}} =
\begin{bmatrix}
x_{1,1} &amp; x_{1,2} &amp; \cdots &amp; x_{1,4096} &amp; 1 \\
x_{2,1} &amp; x_{2,2} &amp; \cdots &amp; x_{2,4096} &amp; 1 \\
\vdots &amp; \vdots &amp; \ddots &amp; \vdots &amp; \vdots \\
x_{N,1} &amp; x_{N,2} &amp; \cdots &amp; x_{N,4096} &amp; 1
\end{bmatrix}.
\]</span></p>
<p>This is the source of the number 4097. The perceptron has 4096 pixel weights plus one bias, and the bias is what turns the image matrix into a 4097-column augmented matrix.</p>
</section>
<section id="the-linear-system-construction">
<h2>The exact separator construction</h2>
<p>The phrase “linear system construction” can sound abstract, but it is only a compact way of writing down the requirement that every training score should match its label. For the first few images, that requirement would be</p>
<p><span class="math display">\[
x_{1,\mathrm{aug}}^\top \tilde{w} = y_1.
\]</span></p>
<p><span class="math display">\[
x_{2,\mathrm{aug}}^\top \tilde{w} = y_2.
\]</span></p>
<p><span class="math display">\[
x_{3,\mathrm{aug}}^\top \tilde{w} = y_3.
\]</span></p>
<p>Instead of writing one equation per image for thousands of images, we stack the equations into one matrix equation:</p>
<p><span class="math display">\[
X_{\mathrm{aug}}\tilde{w} = y.
\]</span></p>
<p>Figure 7 draws the same equation as a matrix so the dimensions are visible. \(X_{\mathrm{aug}}\) is the data matrix, with one row per image and one column per parameter. In this experiment it has 4097 columns. \(\tilde{w}\) is the vector of unknown parameters, meaning all pixel weights plus the bias. \(y\) is the vector of labels, with one random target for each image.</p>
<figure class="post-figure-card post-figure-card--image" id="fig-linear-system">

<div class="post-figure-card__media-frame"><img alt="The exact separator proof writes all training-score equations at once. The augmented image matrix has one row per training image. The unknown vector contains the pixel weights and bias. The label vector contains the randomly assigned targets." class="post-figure-card__media theme-asset theme-asset--light" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/linear_system_construction.svg?v=20260527h"/><img alt="" aria-hidden="true" class="post-figure-card__media theme-asset theme-asset--dark" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/linear_system_construction-dark.svg?v=20260527h"/></div><figcaption class="post-figure-card__caption" id="fig-linear-system-caption-0ceaefa1-69ba-4598-a22c-09a6ac19f8ca">
The exact separator proof writes all training-score equations at once. Each row of the augmented image matrix asks for one score, the unknown vector holds the pixel weights plus the bias, and the label vector supplies the random targets.
</figcaption>
</figure>
<p>If the equation can be solved, then every score has the correct sign. A score of \(+1\) predicts \(+1\), and a score of \(-1\) predicts \(-1\). Solving the linear system is stronger than merely classifying the examples correctly, because it sets each score equal to the label itself.</p>
</section>
<section id="rank-is-the-part-that-makes-the-proof-work">
<h2>Rank is the part that makes the proof work</h2>
<p>The linear system <span class="math inline">\(X_{\mathrm{aug}}\tilde{w}=y\)</span> is solvable for every possible label vector <span class="math inline">\(y\)</span> when the rows of <span class="math inline">\(X_{\mathrm{aug}}\)</span> are linearly independent.</p>
<p>Rows are linearly independent when no row can be perfectly built from a weighted combination of the other rows. In this project, each row is an image. Full row rank means each training image contributes an independent direction in the augmented pixel space.</p>
<p>Rank is the number of independent rows or columns in a matrix. If <span class="math inline">\(X_{\mathrm{aug}}\)</span> has <span class="math inline">\(N\)</span> rows and rank <span class="math inline">\(N\)</span>, then all <span class="math inline">\(N\)</span> rows are independent. We call this full row rank.</p>
<p>The reason rank matters is that full row rank lets the map from parameter vectors <span class="math inline">\(\tilde{w}\)</span> to training scores reach any target vector in <span class="math inline">\(\mathbb{R}^N\)</span>. The weights have enough freedom to assign arbitrary scores to the training examples, not because they understand the images, but because the rows of the matrix give them enough independent directions to move in.</p>
<p>The proof chain is:</p>
<ol type="1">
<li>Each processed image is a 4096-dimensional vector.</li>
<li>Adding the bias creates a 4097-dimensional augmented vector.</li>
<li>Stacking <span class="math inline">\(N\)</span> augmented images gives <span class="math inline">\(X_{\mathrm{aug}}\)</span>.</li>
<li>If <span class="math inline">\(N \le 4097\)</span> and <span class="math inline">\(\mathrm{rank}(X_{\mathrm{aug}})=N\)</span>, the rows are independent.</li>
<li>Full row rank implies <span class="math inline">\(X_{\mathrm{aug}}\tilde{w}=y\)</span> has a solution for any label vector <span class="math inline">\(y\)</span>.</li>
<li>If the solution makes the scores equal <span class="math inline">\(y_i \in \{-1,+1\}\)</span>, every score has the correct sign.</li>
<li>Therefore a linear separator exists for those labels.</li>
</ol>
<p>This is the point where it is easy to mix up two claims. The rank construction proves that a separator exists. It does not show that the perceptron learning rule has already found it. That is why the project includes both the exact solve and the training run.</p>
</section>
<section id="why-exact-scores-imply-correct-classification">
<h2>Why exact scores imply correct classification</h2>
<p>Suppose the solve gives:</p>
<p><span class="math display">\[
X_{\mathrm{aug}}\tilde{w} = y.
\]</span></p>
<p>For one image <span class="math inline">\(i\)</span>, this says:</p>
<p><span class="math display">\[
s_i = y_i.
\]</span></p>
<p>The score <span class="math inline">\(s_i\)</span> is the perceptron’s raw score for image <span class="math inline">\(i\)</span>. The label <span class="math inline">\(y_i\)</span> is either <span class="math inline">\(+1\)</span> or <span class="math inline">\(-1\)</span>.</p>
<p>If <span class="math inline">\(y_i = +1\)</span>, then <span class="math inline">\(s_i = +1\)</span>, so the perceptron predicts <span class="math inline">\(+1\)</span>. If <span class="math inline">\(y_i = -1\)</span>, then <span class="math inline">\(s_i = -1\)</span>, so the perceptron predicts <span class="math inline">\(-1\)</span>.</p>
<p>A compact way to write this is:</p>
<p><span class="math display">\[
y_i s_i = y_i^2 = 1 &gt; 0.
\]</span></p>
<p>That expression says the label and the score have the same sign. When their product is positive, the point is correctly classified.</p>
<p>This is why the direct solve is useful. It constructs scores that exactly match the labels, so the training error is zero.</p>
</section>
<section id="the-perceptron-learning-rule">
<h2>The perceptron learning rule</h2>
<p>The exact solve proves that a separator exists. The perceptron learning rule is the historical training algorithm that tries to find one through mistakes. It starts with weights at zero, loops through the training examples, and for each image computes:</p>
<p><span class="math display">\[
s_i = w^\top x_i + b.
\]</span></p>
<p>If the sign of <span class="math inline">\(s_i\)</span> matches <span class="math inline">\(y_i\)</span>, nothing changes. If the sign is wrong, the model updates its weights:</p>
<p><span class="math display">\[
w \leftarrow w + \eta y_i x_i,
\]</span></p>
<p><span class="math display">\[
b \leftarrow b + \eta y_i.
\]</span></p>
<p>The symbol <span class="math inline">\(\eta\)</span>, pronounced eta, is the learning rate. It controls the size of the update.</p>
<p>The update is intuitive by cases. If the true label is <span class="math inline">\(+1\)</span> and the model predicts <span class="math inline">\(-1\)</span>, the score is too low. The update adds the image vector to the weights, so bright pixels in that image push future scores upward. If the true label is <span class="math inline">\(-1\)</span> and the model predicts <span class="math inline">\(+1\)</span>, the score is too high, so the update subtracts the image vector from the weights.</p>
<p>The perceptron therefore builds its weights out of signed copies of training images. Images labeled <span class="math inline">\(+1\)</span> tend to get added when they are misclassified. Images labeled <span class="math inline">\(-1\)</span> tend to get subtracted when they are misclassified. This also explains why the final weight vector can be reshaped into a 64 by 64 image: there is one weight per pixel location.</p>
<figure class="post-figure-card post-figure-card--image" id="fig-weight-story">

<div class="post-figure-card__media-frame"><img alt="Perceptron weights are built from signed image-like updates. The final weight image is a memory trace of the random training split, not a clean cat or dog template." class="post-figure-card__media theme-asset theme-asset--light" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/weight_update_story_n500.png?v=20260527h"/><img alt="" aria-hidden="true" class="post-figure-card__media theme-asset theme-asset--dark" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/weight_update_story_n500-dark.png?v=20260527h"/></div><figcaption class="post-figure-card__caption" id="fig-weight-story-caption-0ceaefa1-69ba-4598-a22c-09a6ac19f8ca">
Perceptron training changes the weights by adding or subtracting image vectors. With random labels, the final weight image is a trace of the random split rather than a clean cat or dog template.
</figcaption>
</figure>
<p>The random-label setting is essential here. The weight image in <a href="#fig-weight-story">Figure 8</a> should not be read as a cat detector or dog detector. The labels are arbitrary. The weight image records the corrections needed to separate this particular random split.</p>
</section>
<section id="why-enough-iterations-does-not-give-a-simple-epoch-formula">
<h2>Why “eventually” is not an epoch count</h2>
<p>The perceptron convergence theorem says that if the training data are linearly separable, the perceptron learning rule will eventually find a separator. The theorem connects the existence proof to the training process, but it is a guarantee of eventual success, not a stopwatch.</p>
<p>In particular, the theorem does not say that 4097 examples should take exactly 4097 epochs, and it does not give a tight practical prediction for this dataset. The number of updates depends on the geometry of the examples.</p>
<p>The key geometric quantity is the margin: the amount of breathing room between the separating hyperplane and the closest training points. A large margin means the classes are separated comfortably. A small margin means a separator exists, but some points sit very close to the boundary, so the algorithm may need many corrections before it finds a separating direction.</p>
<p>The classic perceptron mistake bound says that if every input has norm at most <span class="math inline">\(R\)</span>, and there exists a unit-length separator with margin <span class="math inline">\(\gamma\)</span>, then the perceptron makes at most:</p>
<p><span class="math display">\[
\left(\frac{R}{\gamma}\right)^2
\]</span></p>
<p>mistakes.</p>
<p>Here \(R\) is a bound on the size of the input vectors, and \(\gamma\), pronounced gamma, is the margin. The ratio carries the lesson. If the margin is tiny, \(R/\gamma\) is large, and the mistake bound becomes large. Random labels usually create awkward geometry because they ask the model to thread a boundary through points with no underlying visual rule, which is why convergence can take far longer than the clean algebraic proof makes it sound.</p>
<p>The experiment therefore separates two responsibilities. The exact solve asks whether a separator exists at all. Perceptron training asks whether this particular update rule found one within the epoch budget we gave it.</p>
<ol type="1">
<li>VC dimension and rank tell us whether a separator exists.</li>
<li>The perceptron training run tells us how long this algorithm took to find one in this setup.</li>
</ol>
</section>
<section id="the-experimental-result">
<h2>The experimental result</h2>
<p>The first sweep trains for 50 epochs. The exact-separator column comes from the linear-system construction, while the perceptron column comes from finite perceptron training. The two columns answer different questions: one asks what exists somewhere in parameter space, and the other asks what the mistake-driven algorithm found within a limited run.</p>
<figure class="post-table-figure" id="tbl-main-results">
<figcaption class="post-table-figure__caption" id="tbl-main-results-caption-0ceaefa1-69ba-4598-a22c-09a6ac19f8ca">
Fifty-epoch sweep on randomized AFHQ cat/dog labels.
</figcaption>
<div>
<table class="post-data-table">
<colgroup>
<col style="width: 20%"/>
<col style="width: 20%"/>
<col style="width: 20%"/>
<col style="width: 20%"/>
<col style="width: 20%"/>
</colgroup>
<thead>
<tr>
<th><span class="math inline">\(N\)</span></th>
<th>rank of <span class="math inline">\(X_{\mathrm{aug}}\)</span></th>
<th>exact-separator train error</th>
<th>perceptron train error after 50 epochs</th>
<th>perceptron converged?</th>
</tr>
</thead>
<tbody>
<tr>
<td>500</td>
<td>500</td>
<td>0.0000</td>
<td>0.0000</td>
<td>yes</td>
</tr>
<tr>
<td>1000</td>
<td>1000</td>
<td>0.0000</td>
<td>0.0340</td>
<td>no</td>
</tr>
<tr>
<td>2000</td>
<td>2000</td>
<td>0.0000</td>
<td>0.1585</td>
<td>no</td>
</tr>
<tr>
<td>4096</td>
<td>4096</td>
<td>0.0000</td>
<td>0.2925</td>
<td>no</td>
</tr>
<tr>
<td>4097</td>
<td>4097</td>
<td>0.0000</td>
<td>0.2563</td>
<td>no</td>
</tr>
<tr>
<td>5000</td>
<td>4097</td>
<td>0.0262</td>
<td>0.2252</td>
<td>no</td>
</tr>
</tbody>
</table>
</div>
</figure>
<p>In Table 1, the rank column carries the existence proof. Through \(N=4097\), the rank equals \(N\). The augmented image rows are independent, so the exact solve fits the random labels with zero training error all the way up to the 4097-example boundary.</p>
<p>The perceptron column tells the training story. At \(N=500\), the perceptron reaches zero training error within 50 epochs. At larger sample sizes, 50 epochs is not enough. That does not contradict the proof; it only says the training run stopped before the algorithm reached a separator. To test the “given enough iterations” part more directly, the experiment also runs longer perceptron training for the separable sample sizes:</p>
<figure class="post-table-figure" id="tbl-long-run">
<figcaption class="post-table-figure__caption" id="tbl-long-run-caption-0ceaefa1-69ba-4598-a22c-09a6ac19f8ca">
Long perceptron runs on randomized labels up to the VC-dimension boundary.
</figcaption>
<div>
<table class="post-data-table">
<colgroup>
<col style="width: 20%"/>
<col style="width: 20%"/>
<col style="width: 20%"/>
<col style="width: 20%"/>
<col style="width: 20%"/>
</colgroup>
<thead>
<tr>
<th><span class="math inline">\(N\)</span></th>
<th>max epochs allowed</th>
<th>epochs to zero error</th>
<th>updates</th>
<th>converged?</th>
</tr>
</thead>
<tbody>
<tr>
<td>500</td>
<td>50</td>
<td>48</td>
<td>2638</td>
<td>yes</td>
</tr>
<tr>
<td>1000</td>
<td>1000</td>
<td>80</td>
<td>9046</td>
<td>yes</td>
</tr>
<tr>
<td>2000</td>
<td>2000</td>
<td>214</td>
<td>44162</td>
<td>yes</td>
</tr>
<tr>
<td>4096</td>
<td>5000</td>
<td>945</td>
<td>365288</td>
<td>yes</td>
</tr>
<tr>
<td>4097</td>
<td>5000</td>
<td>1228</td>
<td>381320</td>
<td>yes</td>
</tr>
</tbody>
</table>
</div>
</figure>
<p>Table 2 is the direct demonstration. The exact solve proves that a separator exists through 4097 examples in this sampled dataset, and the long perceptron runs show the learning rule reaching zero training error at each of those sample sizes.</p>
<figure class="post-figure-card post-figure-card--image" id="fig-long-run">

<div class="post-figure-card__media-frame"><img alt="Long perceptron runs reach zero training error up through 4097 examples, though the number of epochs rises substantially." class="post-figure-card__media theme-asset theme-asset--light" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/perceptron_long_run_epochs.svg?v=20260527h"/><img alt="" aria-hidden="true" class="post-figure-card__media theme-asset theme-asset--dark" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/perceptron_long_run_epochs-dark.svg?v=20260527h"/></div><figcaption class="post-figure-card__caption" id="fig-long-run-caption-0ceaefa1-69ba-4598-a22c-09a6ac19f8ca">
Long perceptron runs reach zero training error through the 4097-example boundary. The separator exists, but finding it takes many more passes as the sample size grows.
</figcaption>
</figure>
<p>The epoch counts are not universal constants. They depend on the random seed, preprocessing, example order, learning rate, and margin. The result to carry forward is not that \(N=4097\) took 1228 epochs specifically; it is that the perceptron converged on random labels at the VC-dimension boundary, exactly as the separability result says it can.</p>
</section>
<section id="why-the-5000-example-row-changes">
<h2>Why the 5000-example row changes</h2>
<p><span>At \(N=5000\), the augmented matrix still has 4097 columns, so its rank cannot rise past 4097. In this run the rank is 4097 while the number of rows is 5000, which means the rows cannot all be independent. The exact linear solve no longer has enough independent degrees of freedom to hit every random target exactly; its training error rises to 0.0262. The numerical error is small, but the qualitative change is the one the experiment was built to show: the fit is no longer perfect.</span></p>
<p><span>The VC-dimension boundary becomes visible here. The statement gives a shattering guarantee up to \(d+1\) examples under the right geometric condition. Once \(N\) is larger than \(d+1\), the guarantee has ended. Some particular labelings above the boundary may still be separable, because VC dimension is about fitting every possible labeling of a set, not about ruling out every favorable case above the threshold. In this random-label run, 5000 examples are enough for the exact construction to lose perfect fit.</span></p>
</section>
<section id="how-to-interpret-the-plots">
<h2>How to interpret the plots</h2>
<p>The figures in this part of the chapter form one sequence. The training-error plot compares the exact construction with finite perceptron training; the rank plot shows where the linear-algebra guarantee holds; the update plot shows how training cost changes as the sample size grows; and the \(N=500\) training journey makes the update process small enough to inspect closely.</p>
<figure class="post-figure-card post-figure-card--image" id="fig-training-error">

<div class="post-figure-card__media-frame"><img alt="Training error across sample sizes. The exact separator has zero error through 4097 examples, while finite 50-epoch perceptron training does not converge for the larger sample sizes." class="post-figure-card__media theme-asset theme-asset--light" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/training_error.svg?v=20260527h"/><img alt="" aria-hidden="true" class="post-figure-card__media theme-asset theme-asset--dark" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/training_error-dark.svg?v=20260527h"/></div><figcaption class="post-figure-card__caption" id="fig-training-error-caption-0ceaefa1-69ba-4598-a22c-09a6ac19f8ca">
Training error across sample sizes. The exact separator reaches zero error through 4097 examples; the finite 50-epoch perceptron run succeeds at 500 examples but stops short on larger randomized sets.
</figcaption>
</figure>
<figure class="post-figure-card post-figure-card--image" id="fig-rank">

<div class="post-figure-card__media-frame"><img alt="Rank versus sample size. The rank follows the number of examples until it reaches the 4097-column ceiling." class="post-figure-card__media theme-asset theme-asset--light" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/rank_vs_sample_size.svg?v=20260527h"/><img alt="" aria-hidden="true" class="post-figure-card__media theme-asset theme-asset--dark" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/rank_vs_sample_size-dark.svg?v=20260527h"/></div><figcaption class="post-figure-card__caption" id="fig-rank-caption-0ceaefa1-69ba-4598-a22c-09a6ac19f8ca">
Rank versus sample size. The rank follows the number of examples until the augmented matrix reaches its 4097-column ceiling.
</figcaption>
</figure>
<figure class="post-figure-card post-figure-card--image" id="fig-updates">

<div class="post-figure-card__media-frame"><img alt="Perceptron updates after 50 epochs. Larger randomized training sets require many more corrections." class="post-figure-card__media theme-asset theme-asset--light" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/perceptron_updates.svg?v=20260527h"/><img alt="" aria-hidden="true" class="post-figure-card__media theme-asset theme-asset--dark" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/perceptron_updates-dark.svg?v=20260527h"/></div><figcaption class="post-figure-card__caption" id="fig-updates-caption-0ceaefa1-69ba-4598-a22c-09a6ac19f8ca">
Perceptron updates after 50 epochs. Larger randomized training sets require many more corrections, even when the algebraic separator exists.
</figcaption>
</figure>
<figure class="post-figure-card post-figure-card--image" id="fig-journey">

<div class="post-figure-card__media-frame"><img alt="Training journey for 500 randomly labeled images, including snapshots of the evolving weight image." class="post-figure-card__media theme-asset theme-asset--light" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/perceptron_training_journey_n500.png?v=20260527h"/><img alt="" aria-hidden="true" class="post-figure-card__media theme-asset theme-asset--dark" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/perceptron_training_journey_n500-dark.png?v=20260527h"/></div><figcaption class="post-figure-card__caption" id="fig-journey-caption-0ceaefa1-69ba-4598-a22c-09a6ac19f8ca">
The 500-example run as a training story: mistakes drive updates, the weight image changes, and the training error eventually reaches zero.
</figcaption>
</figure>
<p>The training journey makes the distinction concrete. The model starts wrong on many examples, each update moves the weights, and eventually the training error reaches zero. Because the labels were random, that success is not evidence of a learned animal concept. It is evidence that the model found a separating set of weights for this particular random split.</p>
</section>
<section id="how-the-weights-store-information">
<h2>How the weights store information</h2>
<p><span>It is tempting to say the perceptron stores the training set in its weights. A more precise version is that the learning rule leaves traces of the training examples inside the weight vector. The perceptron does not keep a database of images or filenames; instead, the final weight vector becomes a sum of signed training examples:</span></p>
<p><span class="math display">\[
w = \sum_i \alpha_i y_i x_i.
\]</span></p>
<p>Here \(x_i\) is training image \(i\), \(y_i\) is its label, and \(\alpha_i\) records how much that example contributed through mistakes and updates. If an example never caused an update, its contribution may be zero; if it caused multiple updates, its contribution may be larger. The final weight vector is therefore shaped by the examples that pushed on the model during training.</p>
<p>Because the weights are built from image vectors, the final \(w\) can be reshaped into a 64 by 64 image. In the random-label experiment, however, that image is not a cat template or a dog template. It is a signed accumulation of corrections: pixels from examples labeled \(+1\) and pixels from examples labeled \(-1\) have been added and subtracted until the training split becomes separable.</p>
<p>A compact intuition is:</p>
<blockquote class="blockquote">
<p>Under random labels, the weights are not learning catness or dogness. They are accumulating signed pixel evidence for this particular split of this particular training set.</p>
</blockquote>
</section>
<section id="what-this-does-and-does-not-prove">
<h2>What this does and does not prove</h2>
<p>This experiment proves a specific capacity claim on a specific processed dataset. It does not show that all high-dimensional models only memorize, that neural networks cannot generalize, that real cat-versus-dog classification is impossible, or that VC dimension alone explains modern deep learning. Those would be larger claims than this experiment can support.</p>
<p>The result is narrower and sturdier: a high-dimensional linear classifier can fit random labels when the number of examples is small enough relative to the number of adjustable directions. The exact separator explains why the fit exists, and the long perceptron runs show that the original learning rule can find it when given enough iterations.</p>
<ol type="1">
<li>A high-dimensional linear model can fit arbitrary labels when the number of examples is small enough relative to the number of input dimensions and the data matrix has the right rank.</li>
<li>A perceptron can eventually find a separator when one exists, but the number of epochs depends on geometry.</li>
<li>Training accuracy alone cannot distinguish semantic learning from memorization.</li>
<li>Random labels are useful because they remove semantic meaning from the target.</li>
<li>Generalization requires more than fitting the training set.</li>
</ol>
<p>That is the part that carries over to real machine learning. We care about performance on new examples, not only performance on the training set. If a model performs well only on the data it trained on, it may have memorized the examples without learning a rule that travels beyond them. Random labels are useful because they make that failure mode impossible to hide behind a familiar category name.</p>
</section>
<section id="a-hand-exercise">
<h2>A small version to solve by hand</h2>
<p>Before trusting the 4096-dimensional result, solve a three-parameter version by hand.</p>
<p>Use the three points:</p>
<table class="post-data-table">
<thead>
<tr>
<th>point</th>
<th><span class="math inline">\(x_1\)</span></th>
<th><span class="math inline">\(x_2\)</span></th>
<th>label</th>
</tr>
</thead>
<tbody>
<tr>
<td>A</td>
<td>0</td>
<td>0</td>
<td>-1</td>
</tr>
<tr>
<td>B</td>
<td>1</td>
<td>0</td>
<td>+1</td>
</tr>
<tr>
<td>C</td>
<td>0</td>
<td>1</td>
<td>+1</td>
</tr>
</tbody>
</table>
<p>Add the bias column:</p>
<p><span class="math display">\[
X_{\mathrm{aug}} =
\begin{bmatrix}
0 &amp; 0 &amp; 1 \\
1 &amp; 0 &amp; 1 \\
0 &amp; 1 &amp; 1
\end{bmatrix},
\qquad
y =
\begin{bmatrix}
-1 \\
+1 \\
+1
\end{bmatrix}.
\]</span></p>
<p>Solve:</p>
<p><span class="math display">\[
X_{\mathrm{aug}}\tilde{w}=y.
\]</span></p>
<p>This means:</p>
<p><span class="math display">\[
\begin{aligned}
b &amp;= -1, \\
w_1 + b &amp;= +1, \\
w_2 + b &amp;= +1.
\end{aligned}
\]</span></p>
<p>Since <span class="math inline">\(b=-1\)</span>, the other two equations give:</p>
<p><span class="math display">\[
w_1 = 2,
\qquad
w_2 = 2.
\]</span></p>
<p>So:</p>
<p><span class="math display">\[
\tilde{w} = (2,2,-1).
\]</span></p>
<p>The separator is:</p>
<p><span class="math display">\[
2x_1 + 2x_2 - 1 = 0.
\]</span></p>
<p>That is the same separator shown in <a href="#fig-toy-separator">Figure 3</a>. The large experiment is not using a different kind of reasoning. It is the same linear-system idea with 4097 columns instead of 3.</p>
</section>
<section id="practice-questions">
<h2>Practice questions</h2>
<ol type="1">
<li><p>In your own words, explain why fitting random labels cannot be evidence that the model learned cats versus dogs.</p></li>
<li><p>A grayscale image is resized to 32 by 32. What is the input dimension? How many parameters does a perceptron have after adding a bias? What is the VC dimension of linear separators in that input space?</p></li>
<li><p>Suppose a dataset has <span class="math inline">\(N=100\)</span> examples and <span class="math inline">\(d=20\)</span> input dimensions. Can VC dimension guarantee that a linear classifier can shatter all 100 examples? Why or why not?</p></li>
<li><p>In the hand exercise, change the labels to <span class="math inline">\((+1,-1,+1)\)</span>. Solve the new linear system and write the separator.</p></li>
<li><p>Explain why the direct linear-system solve is not the same thing as perceptron training.</p></li>
<li><p>The long run reaches zero error for <span class="math inline">\(N=4097\)</span> after 1228 epochs. Does VC dimension predict the number 1228? If not, what kind of information would help reason about training time?</p></li>
<li><p>If a model reaches 100 percent training accuracy and 50 percent test accuracy on balanced random labels, what does that tell you about memorization and generalization?</p></li>
<li><p>Look at the weight image. Why is it reasonable that the weights can be reshaped into an image? Why would it be misleading to call that image a cat detector in the random-label experiment?</p></li>
</ol>
</section>
<section id="glossary">
<h2>Glossary</h2>
<p><strong>Bias.</strong> A parameter added to the weighted sum that shifts the decision boundary. In matrix form, it is handled by adding a constant column of 1s to the data.</p>
<p><strong>Binary classification.</strong> A prediction task with two possible labels. This project uses <span class="math inline">\(-1\)</span> and <span class="math inline">\(+1\)</span>.</p>
<p><strong>Decision boundary.</strong> The set of input points where the model is exactly undecided. For a perceptron, this is where <span class="math inline">\(w^\top x + b = 0\)</span>.</p>
<p><strong>Epoch.</strong> One full pass through the training set.</p>
<p><strong>Feature.</strong> One input variable. In this project, each pixel position is a feature.</p>
<p><strong>Full row rank.</strong> A matrix with <span class="math inline">\(N\)</span> rows has full row rank when its rank is <span class="math inline">\(N\)</span>. This means the rows are linearly independent.</p>
<p><strong>Hyperplane.</strong> The high-dimensional version of a line or plane. A perceptron’s decision boundary is a hyperplane.</p>
<p><strong>Linearly separable.</strong> A dataset is linearly separable if some hyperplane can place all positive examples on one side and all negative examples on the other.</p>
<p><strong>Margin.</strong> The amount of breathing room between a separator and the closest training examples. Larger margins usually make perceptron learning easier.</p>
<p><strong>Perceptron.</strong> A linear classifier that predicts from the sign of a weighted sum.</p>
<p><strong>Random labels.</strong> Labels assigned independently of the real class. They are useful for testing memorization because they remove semantic meaning.</p>
<p><strong>Rank.</strong> The number of independent directions represented by the rows or columns of a matrix.</p>
<p><strong>Shattering.</strong> A model class shatters a set of points if it can fit every possible binary labeling of those points.</p>
<p><strong>Training error.</strong> The fraction of training examples classified incorrectly.</p>
<p><strong>VC dimension.</strong> A measure of model capacity. For linear separators in <span class="math inline">\(d\)</span> dimensions, the VC dimension is <span class="math inline">\(d+1\)</span>.</p>
</section>
<section id="source-note">
<h2>Source note</h2>
<p>This project was inspired by the perceptron and VC-dimension discussion in <em>The Welch Labs Illustrated Guide to AI</em>. The repository turns that idea into a self-contained experiment and learning module using AFHQ animal-face images.</p>
</section>
