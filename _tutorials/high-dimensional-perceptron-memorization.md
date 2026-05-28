---
title: How a Simple Perceptron Memorizes Random Labels
date: 2026-05-27
author: Hunter Colson
subtitle: Pixels, hyperplanes, VC dimension, and the limits of perfect training accuracy.
description: A walkthrough of how a high-dimensional perceptron can fit random labels on real cat and dog images, and what that teaches about memorization, rank, VC dimension, and generalization.
tags:
  - tutorial
  - machine-learning
  - perceptron
  - linear-algebra
  - vc-dimension
---

<section id="the-strange-experiment">
<h2>The experiment</h2>
<p>The experiment starts with a folder of cat and dog face photographs. Each image is shrunk to a 64 by 64 grayscale square, turned into pixel numbers, and given to a single perceptron.</p>
<p>When the labels still mean cat and dog, perfect training accuracy sounds like evidence that the model learned something visual. The model saw the training images, adjusted its weights, and eventually got every one right. The usual explanation is that it picked up some feature of the animals: ears, eyes, snouts, fur texture, or some pattern a person could point to in the photographs.</p>
<p>This experiment removes that explanation. After the images are processed, the true labels are thrown out and replaced with random <span class="math inline">\(+1\)</span> and <span class="math inline">\(-1\)</span> targets. Some cats receive <span class="math inline">\(+1\)</span>, some cats receive <span class="math inline">\(-1\)</span>, and the same thing happens to the dogs. The photographs are still real, but the target beside each photograph no longer means cat or dog. It is a coin flip attached to an image.</p>
<p>In the processed dataset used here, the perceptron can still fit those random labels perfectly through 4097 training examples. That cannot mean the model recognized cats, because the target no longer contains a cat concept. It means the model had enough adjustable numbers to put each training image on whichever side it was told to occupy. Perfect training accuracy can come from learning a rule that transfers to new examples, but it can also come from having enough room to memorize the training set.</p>
<p>The experiment supports a narrow claim: when a model has many adjustable numbers compared with the number of training examples, even a plain <a href="#glossary-linear-classifier">linear classifier</a> can fit labels that carry no meaning. That ability is called <a href="#glossary-capacity">capacity</a>, and it is one reason perfect training accuracy should be treated with care.</p>
</section>
<section id="the-experiment">
<h2>The setup</h2>
<p>The experiment uses the AFHQ animal-faces dataset and keeps the procedure plain. The code loads cat and dog images, resizes them to 64 by 64 grayscale, flattens each image into a row of 4096 numbers, assigns random binary labels, and then checks the same question in two ways. The code and figure-generation scripts are linked in the <a href="#source-note">source note</a> at the end.</p>
<p>The first check uses linear algebra. It asks whether any set of weights could classify every randomly labeled training image correctly. To answer that, the code builds a matrix from the images, adds one <a href="#glossary-bias">bias</a> column, checks the <a href="#glossary-rank">rank</a> of that matrix, and solves for weights whose scores match the labels exactly:</p>
<p><span id="eq-linear-system"><span class="math display">\[
X_{\mathrm{aug}}\tilde{w} = y.
\tag{1}\]</span></span></p>
<p>The equation asks for one parameter vector, <span class="math inline">\(\tilde{w}\)</span>, whose scores match the label vector <span class="math inline">\(y\)</span>. In ordinary language, we want one setting of all the pixel weights and the bias that gives image 1 its requested score, image 2 its requested score, and so on through the training set. If every requested score is exactly <span class="math inline">\(+1\)</span> or <span class="math inline">\(-1\)</span>, every score lands on the correct side of zero, and the perceptron makes no training mistakes on those random labels.</p>
<p>The second check uses the original <a href="#glossary-perceptron">perceptron</a> learning rule. Instead of solving the equation in one step, the model starts with weights at zero, looks at one image at a time, and changes its weights when it makes a mistake. These checks answer different questions. The solve asks whether working weights exist. The training run asks whether this mistake-by-mistake procedure finds them. Figure 1 shows how the same images move through both checks.</p>
<figure class="post-figure-card post-figure-card--image" id="fig-pipeline">

<div class="post-figure-card__media-frame"><img alt="The experiment turns images into a high-dimensional linear-algebra problem. Real cat and dog images are resized, flattened into 4096-pixel vectors, augmented with a bias column, assigned random labels, and then passed to both a direct solve and perceptron training." class="post-figure-card__media theme-asset theme-asset--light" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/experiment_pipeline.svg?v=20260527h"/><img alt="" aria-hidden="true" class="post-figure-card__media theme-asset theme-asset--dark" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/experiment_pipeline-dark.svg?v=20260527h"/></div><figcaption class="post-figure-card__caption" id="fig-pipeline-caption-0ceaefa1-69ba-4598-a22c-09a6ac19f8ca">
The experiment as a pipeline. The photographs are real, but the labels used for training are random. After resizing and flattening, each image becomes a 4096-number row; adding the bias gives the algebra and the perceptron learning rule the same input representation.
</figcaption>
</figure>
</section>
<section id="how-to-read-the-experiment">
<h2>The notation</h2>
<p>The argument starts with an image, turns it into a row of pixel numbers, uses that row in a perceptron score, and then folds the bias into the same table as the pixels. After that, the VC-dimension result becomes a counting question: how many separate score requests can one linear model satisfy at the same time?</p>
<p>The notation names those pieces. <span class="math inline">\(x\)</span> is an image after it has been turned into numbers. <span class="math inline">\(w\)</span> is the list of weights applied to those numbers. <span class="math inline">\(b\)</span> shifts the cutoff. <a href="#glossary-rank">Rank</a> checks whether the image rows are giving the solve new information or repeating information it already has. The equation <span class="math inline">\(X_{\mathrm{aug}}\tilde{w}=y\)</span> writes the whole training set as one request: choose weights whose scores match the labels. The <a href="#glossary-perceptron-rule">perceptron learning rule</a> tries to reach working weights by correcting mistakes one image at a time.</p>
<div class="post-note">
<p>Later, the tables show the direct solve succeeding even when a short perceptron run has not converged. Those results can both be true because they answer different questions: the weights can exist even if the training procedure has not reached them yet.</p>
</div>
</section>
<section id="symbols-used-in-this-chapter">
<h2>Symbols used in this chapter</h2>
<p>The main symbols are:</p>
<figure class="post-table-figure symbol-table">
<div>
<table class="post-data-table">
<thead>
<tr>
<th>symbol</th>
<th>plain meaning</th>
</tr>
</thead>
<tbody>
<tr>
<td><span class="math inline">\(i\)</span></td>
<td>The example number. If <span class="math inline">\(i=17\)</span>, we are talking about the 17th image.</td>
</tr>
<tr>
<td><span class="math inline">\(x_i\)</span></td>
<td>The input vector for image <span class="math inline">\(i\)</span>: its pixel brightness values after the image has been flattened into a row.</td>
</tr>
<tr>
<td><span class="math inline">\(y_i\)</span></td>
<td>The target label for image <span class="math inline">\(i\)</span>. In this experiment, labels are intentionally only <span class="math inline">\(-1\)</span> or <span class="math inline">\(+1\)</span>.</td>
</tr>
<tr>
<td><span class="math inline">\(w\)</span></td>
<td>The vector of pixel weights. It tells the perceptron how much each pixel position should push the score up or down.</td>
</tr>
<tr>
<td><span class="math inline">\(b\)</span></td>
<td>The <a href="#glossary-bias">bias</a>, a single extra number that shifts the cutoff.</td>
</tr>
<tr>
<td><span class="math inline">\(s_i\)</span></td>
<td>The raw score for image <span class="math inline">\(i\)</span>. The classifier predicts from the sign of this score.</td>
</tr>
<tr>
<td><span class="math inline">\(X_{\mathrm{aug}}\)</span></td>
<td>The training table after the bias column has been added. Each row is one image; each column is one number the solver can use when it builds a score.</td>
</tr>
<tr>
<td><span class="math inline">\(\tilde{w}\)</span></td>
<td>The weight vector after the bias has been folded in. The tilde is a visual reminder that this is the expanded version of <span class="math inline">\(w\)</span>.</td>
</tr>
<tr>
<td><span class="math inline">\(N\)</span></td>
<td>The number of training images.</td>
</tr>
<tr>
<td><span class="math inline">\(d\)</span></td>
<td>The number of input features. Here <span class="math inline">\(d=4096\)</span> because each 64 by 64 image has 4096 pixels.</td>
</tr>
</tbody>
</table>
</div>
</figure>
</section>
<section id="the-capacity-claim">
<h2>The number that matters</h2>
<p>A 64 by 64 grayscale image has</p>
<p><span class="math display">\[
64 \times 64 = 4096
\]</span></p>
<p>pixels. Flattening keeps those same values and changes only their arrangement. The square image becomes one long row of numbers:</p>
<p><span class="math display">\[
x = (x_1, x_2, \ldots, x_{4096}).
\]</span></p>
<p>The symbol <span class="math inline">\(x\)</span> means one input image after it has been converted into numbers. The subscript names a slot in the list. The value <span class="math inline">\(x_1\)</span> is the first pixel, <span class="math inline">\(x_2\)</span> is the second pixel, and the sequence continues until <span class="math inline">\(x_{4096}\)</span>. The perceptron has one weight for each pixel position, plus one bias term that shifts the <a href="#glossary-decision-boundary">decision boundary</a>. Its raw score is</p>
<p><span id="eq-score"><span class="math display">\[
\begin{aligned}
s ={}& w_1x_1 + w_2x_2 + \cdots \\
&+ w_{4096}x_{4096} + b.
\end{aligned}
\tag{2}\]</span></span></p>
<p>The values <span class="math inline">\(w_1,\ldots,w_{4096}\)</span> are the pixel weights, <span class="math inline">\(b\)</span> is the bias, and <span class="math inline">\(s\)</span> is the signed score produced by the model. A positive score becomes the prediction <span class="math inline">\(+1\)</span>; a negative score becomes the prediction <span class="math inline">\(-1\)</span>. The score itself can be a decimal during ordinary training, such as <span class="math inline">\(3.7\)</span> or <span class="math inline">\(-0.42\)</span>, while the target label stays locked to one of the two class signs. The classifier does not need the score to be exactly <span class="math inline">\(+1\)</span> or <span class="math inline">\(-1\)</span>. It only needs the sign of the score to match the sign of the label.</p>
<p>The perceptron has 4097 adjustable numbers: 4096 pixel weights and one bias. This count drives the experiment. For linear classifiers in <span class="math inline">\(d\)</span> input dimensions, the <a href="#glossary-vc-dimension">VC dimension</a> is <span class="math inline">\(d+1\)</span>. Here <span class="math inline">\(d=4096\)</span>, so the boundary is <span class="math inline">\(d+1=4097\)</span>. With the right rank condition, a linear classifier can fit any binary labels on up to 4097 examples, even labels assigned by random coin flips. If the model fits those randomized labels, the success cannot be credited to cat features or dog features, because the labels no longer point to animals. The fit shows that the model has enough adjustable numbers, and enough information in the image rows, to put the training examples on the requested sides of one boundary.</p>
</section>
<section id="the-data-animal-faces-become-rows-of-numbers">
<h2>How images become rows of numbers</h2>
<p>The dataset is Kaggle’s <code>andrewmvd/animal-faces</code>, commonly known as AFHQ, short for Animal Faces-HQ. It contains high-resolution animal face images in cat, dog, and wildlife categories. This experiment uses only cats and dogs. The true animal class is used to select the images and to make the figures readable. After that, the training labels are replaced with random <span class="math inline">\(-1\)</span> and <span class="math inline">\(+1\)</span> targets.</p>
<p>The original inputs are photographs, but the perceptron never receives them as photographs. Before training, every image goes through the same processing steps:</p>
<ol type="1">
<li>load the image;</li>
<li>convert it to grayscale;</li>
<li>resize it to 64 by 64 pixels;</li>
<li>scale the pixel values numerically;</li>
<li>flatten the image into a 4096-number row.</li>
</ol>
<p>Turning the image into a row does not erase the image. It changes the shape of the same information. A 64 by 64 grid and a 4096-number row contain the same brightness values in different arrangements. The grid is easier for us to inspect visually, while the row is easier for the model to multiply by weights. For a tiny 3 by 3 grayscale image, the same rearrangement would look like this:</p>
<figure class="post-figure-card pixel-flatten-figure" id="fig-3x3-pixel-grid">
<div class="post-figure-card__media-frame">
<div class="pixel-flatten" aria-label="A 3 by 3 pixel grid flattened row by row into a vector">
<div class="pixel-grid" role="img" aria-label="3 by 3 grayscale pixel grid with values 12, 40, 91, 8, 55, 110, 4, 61, and 130">
<span style="background: rgb(12 12 12); color: #fff;">12</span>
<span style="background: rgb(40 40 40); color: #fff;">40</span>
<span style="background: rgb(91 91 91); color: #fff;">91</span>
<span style="background: rgb(8 8 8); color: #fff;">8</span>
<span style="background: rgb(55 55 55); color: #fff;">55</span>
<span style="background: rgb(110 110 110); color: #fff;">110</span>
<span style="background: rgb(4 4 4); color: #fff;">4</span>
<span style="background: rgb(61 61 61); color: #fff;">61</span>
<span style="background: rgb(130 130 130); color: #111;">130</span>
</div>
<div class="pixel-flatten__arrow" aria-hidden="true">→</div>
<ol class="pixel-row" aria-label="Flattened vector entries in row-major order">
<li>12</li>
<li>40</li>
<li>91</li>
<li>8</li>
<li>55</li>
<li>110</li>
<li>4</li>
<li>61</li>
<li>130</li>
</ol>
</div>
</div>
<figcaption class="post-figure-card__caption">
A 3x3 image is nine brightness numbers arranged as pixels. Flattening reads the grid row by row, so the same nine values become a vector the perceptron can multiply by nine weights.
</figcaption>
</figure>
<p>Nothing has been averaged or thrown away. The first row of pixels becomes the first three entries of the vector, the second row becomes the next three entries, and the third row becomes the final three entries. The 64 by 64 case does the same thing with many more cells: 4096 pixel values instead of nine.</p>
<p>A <a href="#glossary-vector">vector</a> is a list where position matters. In this image vector, the first slot is not an arbitrary brightness value; it is the brightness value from a particular pixel location. Pixel 1 might be the upper-left corner, and pixel 4096 might be the lower-right corner. Once every image has been turned into that kind of ordered row, the training set becomes a table: one image per row, one pixel position per column. If there are <span class="math inline">\(N\)</span> images, the table has <span class="math inline">\(N\)</span> rows and 4096 pixel columns. We call that table <span class="math inline">\(X\)</span>.</p>
<div class="post-note">
<p>The grid helps us inspect the pixels; the vector lets the perceptron multiply the same values by weights.</p>
</div>
</section>
<section id="the-perceptron-as-a-small-machine">
<h2>The perceptron</h2>
<p>The perceptron is a <a href="#glossary-linear-classifier">linear classifier</a>, which means its whole computation is a weighted sum followed by a sign check. It takes the input numbers, multiplies each one by a corresponding weight, adds those products together, adds a bias, and then asks whether the final score is positive or negative.</p>
<p>The weighted sum acts like a vote. Each pixel position has a weight that says how much brightness in that location should count. A bright pixel with a positive weight pushes the score upward, a bright pixel with a negative weight pushes the score downward, and a pixel whose weight is near zero barely changes the score. The bias gives the whole score a starting tilt before the pixel values are counted, so changing the bias moves the cutoff without changing which pixels matter.</p>
<p><a href="#fig-perceptron-anatomy">Figure 2</a> draws that computation. Pixel values enter on the left, weights scale them, the bias shifts the sum, and the sign of the final score becomes the prediction.</p>
<figure class="post-figure-card post-figure-card--image" id="fig-perceptron-anatomy">

<div class="post-figure-card__media-frame"><img alt="A perceptron multiplies each input feature by a weight, adds the weighted values plus the bias, and predicts by checking whether the score is positive or negative." class="post-figure-card__media theme-asset theme-asset--light" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/perceptron_anatomy.svg?v=20260527h"/><img alt="" aria-hidden="true" class="post-figure-card__media theme-asset theme-asset--dark" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/perceptron_anatomy-dark.svg?v=20260527h"/></div><figcaption class="post-figure-card__caption" id="fig-perceptron-anatomy-caption-0ceaefa1-69ba-4598-a22c-09a6ac19f8ca">
A perceptron turns an input vector into one signed score. The weights decide how much each pixel position contributes, the bias shifts the cutoff point, and the final sign becomes the predicted label.
</figcaption>
</figure>
<p>Linear means the perceptron has only this one kind of move. It does not multiply pixels by other pixels, build a hierarchy of eye and ear detectors, or search for local patches the way a modern vision network might. It computes the weighted sum in <a href="#eq-score">Equation 2</a> and checks the sign. Geometrically, that sign check is the same as drawing one flat boundary through the input space, with <span class="math inline">\(+1\)</span> on one side and <span class="math inline">\(-1\)</span> on the other.</p>
<p>In symbols, the prediction is</p>
<p><span class="math display">\[
\hat{y} =
\begin{cases}
+1 &amp; \text{if } w^\top x + b \ge 0, \\
-1 &amp; \text{if } w^\top x + b &lt; 0.
\end{cases}
\]</span></p>
<p>The symbol <span class="math inline">\(\hat{y}\)</span>, pronounced “y-hat,” means the model’s predicted label. The hat marks it as the model’s guess. The true target label is written <span class="math inline">\(y\)</span>, and in this experiment it is always either <span class="math inline">\(+1\)</span> or <span class="math inline">\(-1\)</span>. The learned model is contained in <span class="math inline">\(w\)</span> and <span class="math inline">\(b\)</span>: <span class="math inline">\(w\)</span> holds the pixel weights, and <span class="math inline">\(b\)</span> holds the bias. Before training, those numbers are starting values. During training, they are adjusted until the signs of the scores match the labels on the training set.</p>
</section>
<section id="a-line-before-a-hyperplane">
<h2>A line before a hyperplane</h2>
<p>The 4096-dimensional case cannot be drawn faithfully. A two-input version has the same algebra with fewer terms:</p>
<p><span class="math display">\[
s = w_1x_1 + w_2x_2 + b.
\]</span></p>
<p>The decision boundary is the set of points where that score equals zero:</p>
<p><span class="math display">\[
w_1x_1 + w_2x_2 + b = 0.
\]</span></p>
<p>In two dimensions, that equation describes a line. Points on one side have positive scores, points on the other side have negative scores, and points exactly on the line are the cases where the model is undecided. For three points:</p>
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
<p>This means <span class="math inline">\(w_1=2\)</span>, <span class="math inline">\(w_2=2\)</span>, and <span class="math inline">\(b=-1\)</span>. The scores are:</p>
<p><span class="math display">\[
\begin{aligned}
A &amp;: 2(0) + 2(0) - 1 = -1, \\
B &amp;: 2(1) + 2(0) - 1 = +1, \\
C &amp;: 2(0) + 2(1) - 1 = +1.
\end{aligned}
\]</span></p>
<p>The scores exactly equal the labels, so their signs are correct as well. The perceptron does not need that much precision to classify correctly; a positive example only needs a positive score, and a negative example only needs a negative score. Exact scores give us a stronger target. If the scores equal <span class="math inline">\(+1\)</span> and <span class="math inline">\(-1\)</span>, correct classification follows from the signs.</p>
<figure class="post-figure-card post-figure-card--image" id="fig-toy-separator">

<div class="post-figure-card__media-frame"><img alt="A line separating three points in two dimensions. The same logic scales to a hyperplane in 4096 dimensions." class="post-figure-card__media theme-asset theme-asset--light" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/toy_separator_2d.svg?v=20260527h"/><img alt="" aria-hidden="true" class="post-figure-card__media theme-asset theme-asset--dark" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/toy_separator_2d-dark.svg?v=20260527h"/></div><figcaption class="post-figure-card__caption" id="fig-toy-separator-caption-0ceaefa1-69ba-4598-a22c-09a6ac19f8ca">
In two dimensions, the separator is a line. In the image experiment, the same equation becomes a hyperplane in a space with 4096 pixel axes plus the bias.
</figcaption>
</figure>
<p>The same structure appears in the image experiment. There are two input numbers plus one bias term here, giving three numbers we can adjust. With three points that give independent equations, those adjustable numbers can be chosen so the scores match the labels. For images, the two input numbers become 4096 pixel values. The boundary becomes a hyperplane, the high-dimensional version of a line or plane.</p>
</section>
<section id="what-a-perceptron-cannot-do">
<h2>Where a perceptron fails</h2>
<p>The perceptron is limited because a single flat boundary cannot carve up space in every possible pattern. The classic failure case is XOR, where four points sit at the corners of a square with matching labels on opposite corners:</p>
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
<p>XOR means “one or the other, but not both.” In this table the output is positive when exactly one input is 1: <span class="math inline">\((1,0)\)</span> and <span class="math inline">\((0,1)\)</span>. The output is negative when the inputs match: <span class="math inline">\((0,0)\)</span> and <span class="math inline">\((1,1)\)</span>. That puts the positive examples on opposite corners of the square and the negative examples on the other two opposite corners.</p>
<p>No single line can separate those labels. If a line tries to keep the two positive corners together, it has to cross the square in a way that also captures one of the negative corners. If it tries to keep the two negative corners together, the same problem happens in reverse. The pattern needs a curved boundary, multiple linear pieces, or an extra hidden feature such as <span class="math inline">\(x_1x_2\)</span>. A lone perceptron only has one straight boundary, so XOR is outside what it can represent.</p>
<figure class="post-figure-card post-figure-card--image" id="fig-xor">

<div class="post-figure-card__media-frame"><img alt="The XOR pattern is not linearly separable because matching labels sit on opposite corners of the square." class="post-figure-card__media theme-asset theme-asset--light" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/xor_nonseparable.svg?v=20260527h"/><img alt="" aria-hidden="true" class="post-figure-card__media theme-asset theme-asset--dark" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/xor_nonseparable-dark.svg?v=20260527h"/></div><figcaption class="post-figure-card__caption" id="fig-xor-caption-0ceaefa1-69ba-4598-a22c-09a6ac19f8ca">
XOR shows the basic limit of one straight boundary. One line cannot put both positive corners on one side and both negative corners on the other.
</figcaption>
</figure>
<p>A single perceptron cannot learn every pattern, because it only has one flat boundary to work with. When the input has thousands of dimensions and the dataset is not too large, that one boundary can still be adjusted in many ways.</p>
<p>There is no contradiction between failing on XOR and fitting thousands of random labels in the image experiment. XOR is arranged in a square that one straight line cannot separate. The images live in a much larger space, with thousands of pixel coordinates, and the rows in this experiment are independent enough that the flat boundary has far more room to move.</p>
</section>
<section id="random-labels-are-the-diagnostic">
<h2>Why random labels help</h2>
<p>If we trained on true cat and dog labels and got 100 percent training accuracy, it would be natural to say the model learned cats versus dogs. It might have, but training accuracy alone cannot prove that. The same number can come from a model that learned a visual rule and from a model that only found a way to fit the examples it saw.</p>
<p>This experiment leaves the images alone and destroys the meaning of the labels. Every training image receives a target label</p>
<p><span class="math display">\[
y_i \in \{-1,+1\}.
\]</span></p>
<p>The subscript \(i\) means “for example \(i\),” so <span class="math inline">\(y_i\)</span> is the label attached to example <span class="math inline">\(i\)</span>. If <span class="math inline">\(i=17\)</span>, then <span class="math inline">\(y_{17}\)</span> is the random label assigned to image 17, independent of whether image 17 is a cat or a dog. The label is never a decimal in this experiment. It is one of two class signs, <span class="math inline">\(-1\)</span> or <span class="math inline">\(+1\)</span>. The perceptron’s raw score can be any real number, including a decimal, but the target label stays binary.</p>
<figure class="post-figure-card post-figure-card--image" id="fig-random-labels">

<div class="post-figure-card__media-frame"><img alt="Real AFHQ cat and dog images with random training labels. The random label, not the true animal class, is what the perceptron is asked to fit." class="post-figure-card__media theme-asset theme-asset--light" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/random_label_examples_n500.png?v=20260527h"/><img alt="" aria-hidden="true" class="post-figure-card__media theme-asset theme-asset--dark" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/random_label_examples_n500-dark.png?v=20260527h"/></div><figcaption class="post-figure-card__caption" id="fig-random-labels-caption-0ceaefa1-69ba-4598-a22c-09a6ac19f8ca">
The photographs still look like cats and dogs to us, but the model is asked to fit the random labels printed beside them. The animal category is no longer the target.
</figcaption>
</figure>
<p>If the perceptron fits those labels, the explanation cannot be that it learned the visual concept cat or dog. The label no longer contains that concept. The model is fitting a random split of the training images, so the experiment is testing how much the model can fit, not whether it recognizes animals.</p>
</section>
<section id="what-is-vc-dimension">
<h2>VC dimension</h2>
<p><a href="#glossary-vc-dimension">VC dimension</a> asks how many points a type of model can handle when the labels are allowed to be arbitrary. For a few dots on a page, each dot could be colored black or white. If the model can draw a boundary for every possible coloring of those dots, then that type of model can <a href="#glossary-shattering">shatter</a> that many points.</p>
<p>For <span class="math inline">\(N\)</span> points, with two label choices per point, there are</p>
<p><span class="math display">\[
2^N
\]</span></p>
<p>possible labelings. For three points, that gives <span class="math inline">\(2^3 = 8\)</span> possible assignments; for ten points, <span class="math inline">\(2^{10}=1024\)</span>. VC dimension asks whether a type of model can fit all of those assignments, including the ones with no visible pattern. No matter how <span class="math inline">\(+1\)</span> and <span class="math inline">\(-1\)</span> are assigned, some model of that type has to get all the labels right.</p>
<p>For straight-line classifiers, the number comes from how many values can be adjusted in the boundary. In two input dimensions, a line has three adjustable numbers: the weight on <span class="math inline">\(x_1\)</span>, the weight on <span class="math inline">\(x_2\)</span>, and the bias. In the hand example earlier, those three numbers let us hit three labels exactly. A linear separator in <span class="math inline">\(d\)</span> input dimensions has <span class="math inline">\(d\)</span> feature weights plus one bias, so the VC dimension is:</p>
<p><span id="eq-vc-dimension"><span class="math display">\[
d + 1.
\tag{3}\]</span></span></p>
<p>In this experiment:</p>
<p><span class="math display">\[
d = 4096,
\qquad
d + 1 = 4097.
\]</span></p>
<p>In this experiment, a linear classifier in 4096 dimensions can shatter 4097 points when those points are in a suitable position. A duplicate image shows how that condition can fail: if two rows were exactly the same image but had opposite random labels, no deterministic classifier could give one row <span class="math inline">\(+1\)</span> and the identical row <span class="math inline">\(-1\)</span>. The rows need to differ in ways the weights can use.</p>
<p>The code checks that condition with <a href="#glossary-rank">rank</a>. If the rank of the augmented image matrix equals the number of training images, then none of the image rows is merely a repeat or an exact mix of the others. Each row gives the direct solve a separate score request it can control. Figure 6 shows where that stops: after the bias column is added, the matrix has 4097 columns, so its rank cannot keep rising forever.</p>
<p>VC dimension does not say the perceptron understands cats and dogs. It says a linear boundary has enough freedom to fit any labeling of a well-positioned set of up to 4097 image vectors. Random labels make that visible because they remove the animal-recognition explanation.</p>
<figure class="post-figure-card post-figure-card--image" id="fig-capacity-boundary">

<div class="post-figure-card__media-frame"><img alt="The augmented image matrix has one row per example and 4097 columns after the bias is added. In this sampled AFHQ run, the rank follows the number of examples through 4097 and then stops at the column limit, which is exactly the capacity boundary this chapter is testing." class="post-figure-card__media theme-asset theme-asset--light" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/capacity_boundary.svg?v=20260527h"/><img alt="" aria-hidden="true" class="post-figure-card__media theme-asset theme-asset--dark" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/capacity_boundary-dark.svg?v=20260527h"/></div><figcaption class="post-figure-card__caption" id="fig-capacity-boundary-caption-0ceaefa1-69ba-4598-a22c-09a6ac19f8ca">
After the bias column is added, the data matrix has 4097 columns. In this sampled AFHQ run, the rank follows the number of examples through 4097 and then hits the column ceiling.
</figcaption>
</figure>
</section>
<section id="why-the-bias-creates-4097-columns">
<h2>Where the extra column comes from</h2>
<p>The bias is where the extra <span class="math inline">\(+1\)</span> comes from. The perceptron score is:</p>
<p><span class="math display">\[
s = w^\top x + b.
\]</span></p>
<p>The notation <span class="math inline">\(w^\top x\)</span> is shorthand for:</p>
<p><span class="math display">\[
w_1x_1 + w_2x_2 + \cdots + w_{4096}x_{4096}.
\]</span></p>
<p>The bias <span class="math inline">\(b\)</span> is separate from the pixel weights in the usual formula. It is the amount added before the pixels contribute anything. To put it into the same matrix as the pixel weights, we add one extra input that is always equal to 1. Then the bias behaves like the weight on that always-on input.</p>
<p>For one image, define the <a href="#glossary-augmented">augmented</a> input as</p>
<p><span class="math display">\[
x_{\mathrm{aug}} = (x_1, x_2, \ldots, x_{4096}, 1).
\]</span></p>
<p>The word “augmented” means “with something added.” Here the added thing is the final 1. Now define the augmented parameter vector as</p>
<p><span class="math display">\[
\tilde{w} = (w_1, w_2, \ldots, w_{4096}, b).
\]</span></p>
<p>The tilde over <span class="math inline">\(\tilde{w}\)</span> is a reminder that this vector includes the bias. The last entry of <span class="math inline">\(x_{\mathrm{aug}}\)</span> is 1, and the last entry of <span class="math inline">\(\tilde{w}\)</span> is <span class="math inline">\(b\)</span>, so their product is <span class="math inline">\(1 \cdot b=b\)</span>. With this notation, the score becomes</p>
<p><span class="math display">\[
s = x_{\mathrm{aug}}^\top \tilde{w}.
\]</span></p>
<p>The score has not changed. We have only rewritten it so the bias sits beside the pixel weights. For a whole dataset with <span class="math inline">\(N\)</span> images, the augmented matrix <span class="math inline">\(X_{\mathrm{aug}}\)</span> has <span class="math inline">\(N\)</span> rows and 4097 columns, with each row holding one image plus the final 1:</p>
<p><span class="math display">\[
X_{\mathrm{aug}} =
\begin{bmatrix}
x_{1,1} &amp; x_{1,2} &amp; \cdots &amp; x_{1,4096} &amp; 1 \\
x_{2,1} &amp; x_{2,2} &amp; \cdots &amp; x_{2,4096} &amp; 1 \\
\vdots &amp; \vdots &amp; \ddots &amp; \vdots &amp; \vdots \\
x_{N,1} &amp; x_{N,2} &amp; \cdots &amp; x_{N,4096} &amp; 1
\end{bmatrix}.
\]</span></p>
<p>The number 4097 comes from this bookkeeping. The perceptron has 4096 pixel weights plus one bias, and the bias turns the image matrix into a 4097-column augmented matrix. If the image were 3 by 3 instead, there would be nine pixel weights plus one bias, so the augmented table would have 10 columns.</p>
</section>
<section id="the-linear-system-construction">
<h2>Solving for a separator directly</h2>
<p>The direct solve is the score equation repeated once per training image. For the first image, we ask the weights to produce the first label. For the second image, we ask the same weights to produce the second label. The phrase “the same weights” matters because the model does not get a private set of weights for each image. One shared vector has to satisfy every row at once. For the first few images, the requirements would be</p>
<p><span class="math display">\[
x_{1,\mathrm{aug}}^\top \tilde{w} = y_1.
\]</span></p>
<p><span class="math display">\[
x_{2,\mathrm{aug}}^\top \tilde{w} = y_2.
\]</span></p>
<p><span class="math display">\[
x_{3,\mathrm{aug}}^\top \tilde{w} = y_3.
\]</span></p>
<p>Instead of writing thousands of separate equations, we stack them into one matrix equation:</p>
<p><span class="math display">\[
X_{\mathrm{aug}}\tilde{w} = y.
\]</span></p>
<p>Figure 7 draws the same equation as a matrix so the dimensions are visible. <span class="math inline">\(X_{\mathrm{aug}}\)</span> is the data matrix, with one row per image and one column per parameter. In this experiment it has 4097 columns. <span class="math inline">\(\tilde{w}\)</span> is the vector of unknown parameters, meaning all pixel weights plus the bias. <span class="math inline">\(y\)</span> is the vector of labels, with one random target for each image. Multiplying the first row of <span class="math inline">\(X_{\mathrm{aug}}\)</span> by <span class="math inline">\(\tilde{w}\)</span> gives the score for image 1, multiplying the second row gives the score for image 2, and the same pattern continues down the matrix.</p>
<figure class="post-figure-card post-figure-card--image" id="fig-linear-system">

<div class="post-figure-card__media-frame"><img alt="The direct solve writes all training-score equations at once. The augmented image matrix has one row per training image. The unknown vector contains the pixel weights and bias. The label vector contains the randomly assigned targets." class="post-figure-card__media theme-asset theme-asset--light" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/linear_system_construction.svg?v=20260527h"/><img alt="" aria-hidden="true" class="post-figure-card__media theme-asset theme-asset--dark" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/linear_system_construction-dark.svg?v=20260527h"/></div><figcaption class="post-figure-card__caption" id="fig-linear-system-caption-0ceaefa1-69ba-4598-a22c-09a6ac19f8ca">
The direct solve writes all training-score equations at once. Each row of the augmented image matrix asks for one score, the unknown vector holds the pixel weights plus the bias, and the label vector supplies the random targets.
</figcaption>
</figure>
<p>In the actual code, this direct solve uses NumPy’s least-squares solver, <code>np.linalg.lstsq</code>, after adding the bias column. Least squares often means “find the closest fit,” but when the augmented matrix has <a href="#glossary-full-row-rank">full row rank</a> and <span class="math inline">\(N \le 4097\)</span>, the closest fit can be exact. The solver can find one <span class="math inline">\(\tilde{w}\)</span> that makes the row-by-row scores equal the requested labels. Once that happens, every score has the correct sign: <span class="math inline">\(+1\)</span> predicts <span class="math inline">\(+1\)</span>, and <span class="math inline">\(-1\)</span> predicts <span class="math inline">\(-1\)</span>.</p>
<div class="post-note">
<p>The direct solve is not how the perceptron trains; it only checks whether working weights exist. The perceptron learning rule is the procedure that tries to find working weights by correcting mistakes.</p>
</div>
</section>
<section id="rank-is-the-part-that-makes-the-proof-work">
<h2>Rank and the solve</h2>
<p>The equation <span class="math inline">\(X_{\mathrm{aug}}\tilde{w}=y\)</span> is a list of score requests. Row 1 asks the shared weights to produce <span class="math inline">\(y_1\)</span>. Row 2 asks those same weights to produce <span class="math inline">\(y_2\)</span>. The solve can hit any random label vector only if those rows give the weights enough separate information to work with. <a href="#glossary-rank">Rank</a> is the check for that.</p>
<p>If two rows are identical, they are not two separate requests. They are the same image asking the same weights for the same score. If random labeling gives those identical rows opposite labels, the solve is impossible, because the same input must produce the same score under the same weights.</p>
<p>A row can also fail to add new information even when it is not an exact copy. Suppose row 3 is row 1 plus row 2. Then, no matter what weights are chosen, the score on row 3 must equal the score on row 1 plus the score on row 2. The labels would have to obey that same relationship. If the random labels ask for something different, no solver can satisfy all three equations at once. Rank measures those hidden repeats.</p>
<p>Full row rank means none of the <span class="math inline">\(N\)</span> image rows is redundant in that exact sense. The matrix has rank <span class="math inline">\(N\)</span>, so each row adds another score request that is not already forced by the others. When that happens, the weights can be chosen to hit any target vector in <span class="math inline">\(\mathbb{R}^N\)</span>. The model is not understanding the images. The rows give the weights enough separate ways to move the scores.</p>
<p>Rank enters here because random labels do not follow a visual rule. The direct solve does not need a visual rule when the rows have full row rank; it needs enough separate equations for the weights to set the requested scores. In that case, memorization is possible because the matrix gives the weights enough room to answer each training row on its own terms.</p>
<p>The logic is:</p>
<ol type="1">
<li>Each processed image is a 4096-dimensional vector.</li>
<li>Adding the bias creates a 4097-dimensional augmented vector.</li>
<li>Stacking <span class="math inline">\(N\)</span> augmented images gives <span class="math inline">\(X_{\mathrm{aug}}\)</span>.</li>
<li>If <span class="math inline">\(N \le 4097\)</span> and <span class="math inline">\(\mathrm{rank}(X_{\mathrm{aug}})=N\)</span>, the rows are independent.</li>
<li><a href="#glossary-full-row-rank">Full row rank</a> implies <span class="math inline">\(X_{\mathrm{aug}}\tilde{w}=y\)</span> has a solution for any label vector <span class="math inline">\(y\)</span>.</li>
<li>If the solution makes the scores equal <span class="math inline">\(y_i \in \{-1,+1\}\)</span>, every score has the correct sign.</li>
<li>Therefore a linear separator exists for those labels.</li>
</ol>
<p>The rank check and the solve show that a separator exists. They do not show that the perceptron learning rule has already found it. The training run checks whether this mistake-driven rule reaches a separator.</p>
</section>
<section id="why-exact-scores-imply-correct-classification">
<h2>Why exact scores guarantee correct classification</h2>
<p>Suppose the solve gives:</p>
<p><span class="math display">\[
X_{\mathrm{aug}}\tilde{w} = y.
\]</span></p>
<p>For one image <span class="math inline">\(i\)</span>, this says:</p>
<p><span class="math display">\[
s_i = y_i.
\]</span></p>
<p>The score <span class="math inline">\(s_i\)</span> is the perceptron’s raw score for image <span class="math inline">\(i\)</span>. The label <span class="math inline">\(y_i\)</span> is either <span class="math inline">\(+1\)</span> or <span class="math inline">\(-1\)</span>. In ordinary prediction, the score only needs to be on the correct side of zero. The direct solve goes further and makes the score equal to the label.</p>
<p>If <span class="math inline">\(y_i = +1\)</span>, then <span class="math inline">\(s_i = +1\)</span>, so the perceptron predicts <span class="math inline">\(+1\)</span>. If <span class="math inline">\(y_i = -1\)</span>, then <span class="math inline">\(s_i = -1\)</span>, so the perceptron predicts <span class="math inline">\(-1\)</span>.</p>
<p>The same sign check can be written as:</p>
<p><span class="math display">\[
y_i s_i = y_i^2 = 1 &gt; 0.
\]</span></p>
<p>The product is positive when the label and the score have the same sign. Geometrically, the boundary is where the score equals zero, so positive-label points need to land on the positive side and negative-label points need to land on the negative side. Setting the scores to exactly <span class="math inline">\(+1\)</span> and <span class="math inline">\(-1\)</span> places every training point on the correct side with a little room away from the boundary.</p>
<p>The direct solve helps because exact scores make the classification question automatic. Once <span class="math inline">\(s_i=y_i\)</span> for every training image, every positive label has a positive score and every negative label has a negative score, so the training error is zero.</p>
</section>
<section id="the-perceptron-learning-rule">
<h2>The perceptron learning rule</h2>
<p>The exact solve tells us that a separator exists. The <a href="#glossary-perceptron-rule">perceptron learning rule</a> tries to find one by correcting mistakes. It starts with all weights at zero, so no pixel position is pushing the score up or down yet. Then the algorithm loops through the training images, computes a score, and checks whether the sign matches the label:</p>
<p><span class="math display">\[
s_i = w^\top x_i + b.
\]</span></p>
<p>If the sign of <span class="math inline">\(s_i\)</span> matches <span class="math inline">\(y_i\)</span>, nothing changes. The model already put that image on the correct side of the boundary. If the sign is wrong, the model updates its weights:</p>
<p><span class="math display">\[
w \leftarrow w + \eta y_i x_i,
\]</span></p>
<p><span class="math display">\[
b \leftarrow b + \eta y_i.
\]</span></p>
<p>The symbol <span class="math inline">\(\eta\)</span>, pronounced eta, is the <a href="#glossary-learning-rate">learning rate</a>. It controls the size of the correction. If <span class="math inline">\(\eta=1\)</span>, the update moves by one copy of the image vector. Smaller or larger values make the same correction gentler or stronger.</p>
<p>The update changes the score for the image that was just missed. The score is <span class="math inline">\(w^\top x_i+b\)</span>. If the true label is <span class="math inline">\(+1\)</span> but the score is negative, the score needs to move upward. Adding <span class="math inline">\(\eta x_i\)</span> to the weights makes the next score for that same image larger, because the new dot product includes an extra <span class="math inline">\(\eta x_i^\top x_i\)</span>, which is positive unless the image vector is all zeros. Adding <span class="math inline">\(\eta\)</span> to the bias also pushes the score upward.</p>
<p>If the true label is <span class="math inline">\(-1\)</span> but the score is positive, the score needs to move downward. The update subtracts <span class="math inline">\(\eta x_i\)</span> from the weights and subtracts <span class="math inline">\(\eta\)</span> from the bias, so the next score for that image drops. After a mistake, the rule moves the current image’s score toward the correct side of zero.</p>
<p>After many updates, the final weight vector is the sum of all those score corrections. The weights can be reshaped into a 64 by 64 image because there is still one learned weight per pixel location. In a real cat-versus-dog task, those weights might line up with visual patterns. In this random-label experiment, they record the corrections needed to satisfy a random split.</p>
<figure class="post-figure-card post-figure-card--image" id="fig-weight-story">

<div class="post-figure-card__media-frame"><img alt="Perceptron weights are built from signed image-like updates. The final weight image is a memory trace of the random training split, not a clean cat or dog template." class="post-figure-card__media theme-asset theme-asset--light" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/weight_update_story_n500.png?v=20260527h"/><img alt="" aria-hidden="true" class="post-figure-card__media theme-asset theme-asset--dark" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/weight_update_story_n500-dark.png?v=20260527h"/></div><figcaption class="post-figure-card__caption" id="fig-weight-story-caption-0ceaefa1-69ba-4598-a22c-09a6ac19f8ca">
Perceptron training changes the weights by adding or subtracting image vectors. With random labels, the final weight image is a trace of the random split, not a cat or dog template.
</figcaption>
</figure>
<p>Because the labels are arbitrary, the weight image in <a href="#fig-weight-story">Figure 8</a> is not a cat detector or dog detector. It records the corrections needed to separate this particular random split.</p>
</section>
<section id="why-enough-iterations-does-not-give-a-simple-epoch-formula">
<h2>Eventually is not an epoch count</h2>
<p>The perceptron convergence theorem says that if the training data are <a href="#glossary-linearly-separable">linearly separable</a>, repeated perceptron updates will eventually find a separator. That theorem is helpful, but it does not tell us how many epochs this dataset should take.</p>
<p>There is no rule saying that 4097 examples should take 4097 epochs, or that a dataset near the VC-dimension boundary should converge quickly. The number of updates depends on where the examples sit and how much room the separating boundary has.</p>
<p>The term for that room is <a href="#glossary-margin">margin</a>. A large margin means the closest points are still comfortably away from the boundary. A small margin means a separator exists, but some points sit very close to it, so the algorithm may need many corrections before it lands on a boundary that gets everything right.</p>
<p>The classic perceptron mistake bound says that if every input has norm at most <span class="math inline">\(R\)</span>, and there exists a unit-length separator with margin <span class="math inline">\(\gamma\)</span>, then the perceptron makes at most:</p>
<p><span class="math display">\[
\left(\frac{R}{\gamma}\right)^2
\]</span></p>
<p>mistakes.</p>
<p>Here <span class="math inline">\(R\)</span> is a bound on the size of the input vectors, and <span class="math inline">\(\gamma\)</span>, pronounced gamma, is the margin. If the margin is tiny, <span class="math inline">\(R/\gamma\)</span> is large, and the mistake bound becomes large. Random labels usually make training harder because they ask the model to thread a boundary through points with no underlying visual rule, which is why convergence can take far longer than the direct solve makes it sound.</p>
<p>The experiment reports both the exact solve and the perceptron training run because they answer different questions. The solve checks whether working weights exist for the random labels. The training run shows how far the mistake-driven update rule got within the number of passes we allowed. When the solve succeeds and the 50-epoch perceptron run fails, the separator has not disappeared; the short training run has not reached it.</p>
</section>
<section id="the-experimental-result">
<h2>The results</h2>
<p>The first sweep trains the perceptron for 50 epochs. The two error columns are related, but they are not measuring the same thing.</p>
<p>The “exact-separator” result asks whether any linear boundary could perfectly separate these random labels. To check that, we solve the system directly. If the exact-separator error is zero, then some perfect set of weights exists.</p>
<p>The “perceptron” result shows what happened during training. Instead of solving the system directly, we let the perceptron learn from its mistakes over 50 passes through the data and see whether it finds a separating boundary. One column tells us whether a solution exists at all. The other tells us whether this particular training process reached one within the time we gave it.</p>
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
<p>In Table 1, the rank column rises with the number of training examples through <span class="math inline">\(N=4097\)</span>. The augmented image rows are independent enough for the direct solve to hit the random labels exactly, so the exact-separator training error stays at zero up to the 4097-example boundary.</p>
<p>The perceptron column shows what happened during training. At <span class="math inline">\(N=500\)</span>, the perceptron drives the training error to zero within 50 epochs. At larger sample sizes, 50 epochs is not enough, even though the exact solve says a perfect separator exists. The boundary is there, but this short training run did not find it. To check whether the perceptron can still get there with more time, the experiment also runs longer training for the separable sample sizes:</p>
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
<p>The longer runs complete the 50-epoch sweep. The exact solve already showed that a separator exists through 4097 examples in this sampled dataset. With more passes through the data, the perceptron also reaches zero training error at each of those sample sizes. The random labels are separable up to the boundary, but the training process needs more corrections as the sample grows.</p>
<figure class="post-figure-card post-figure-card--image" id="fig-long-run">

<div class="post-figure-card__media-frame"><img alt="Long perceptron runs reach zero training error up through 4097 examples, though the number of epochs rises substantially." class="post-figure-card__media theme-asset theme-asset--light" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/perceptron_long_run_epochs.svg?v=20260527h"/><img alt="" aria-hidden="true" class="post-figure-card__media theme-asset theme-asset--dark" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/perceptron_long_run_epochs-dark.svg?v=20260527h"/></div><figcaption class="post-figure-card__caption" id="fig-long-run-caption-0ceaefa1-69ba-4598-a22c-09a6ac19f8ca">
Long perceptron runs reach zero training error through the 4097-example boundary. The separator exists, but finding it takes many more passes as the sample size grows.
</figcaption>
</figure>
<p>The number of epochs it takes is not fixed. It can change with the random seed, preprocessing, the order of the examples, the learning rate, and the margin. The value 1228 is a result from this run, not a law of the perceptron. In this run, the perceptron reached zero error on random labels at the VC-dimension boundary, as the separability result says it can.</p>
</section>
<section id="why-the-5000-example-row-changes">
<h2>Why 5000 examples changes the result</h2>
<p>At <span class="math inline">\(N=5000\)</span>, the augmented matrix still has only 4097 columns, so its rank cannot rise past 4097. In this run the rank is 4097 while the number of rows is 5000. There are now more score requests than the matrix can support independently, so at least some rows have to depend on other rows.</p>
<p>The direct solve can no longer hit every random target exactly, so its training error rises to 0.0262. The error is small, but it marks the change the experiment was looking for: the fit is no longer perfect once the number of examples passes the 4097-column limit.</p>
<p>Datasets with more than 4097 examples can still be separable in some cases. VC dimension is about fitting every possible labeling of a set, not about ruling out every lucky case above the threshold. The guarantee ends after <span class="math inline">\(d+1\)</span> examples, and in this random-label run, 5000 examples are enough for the direct solve to lose the perfect fit.</p>
</section>
<section id="how-to-interpret-the-plots">
<h2>Reading the plots</h2>
<p>The training-error plot compares the direct solve with the 50-epoch training run. The rank plot shows why the direct solve works through 4097 examples and then runs out of room. The update plot shows how much work the perceptron does as the sample grows. The <span class="math inline">\(N=500\)</span> training trace shows the weights changing over time.</p>
<figure class="post-figure-card post-figure-card--image" id="fig-training-error">

<div class="post-figure-card__media-frame"><img alt="Training error across sample sizes. The exact separator has zero error through 4097 examples, while finite 50-epoch perceptron training does not converge for the larger sample sizes." class="post-figure-card__media theme-asset theme-asset--light" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/training_error.svg?v=20260527h"/><img alt="" aria-hidden="true" class="post-figure-card__media theme-asset theme-asset--dark" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/training_error-dark.svg?v=20260527h"/></div><figcaption class="post-figure-card__caption" id="fig-training-error-caption-0ceaefa1-69ba-4598-a22c-09a6ac19f8ca">
Training error across sample sizes. The exact separator reaches zero error through 4097 examples; the finite 50-epoch perceptron run succeeds at 500 examples but stops short on larger randomized sets.
</figcaption>
</figure>
<p>In the training-error plot, the exact separator line answers whether weights exist that can fit the labels perfectly. The perceptron line shows how far the 50-epoch training run got. Those lines can differ because finding a boundary is not the same as proving that one exists.</p>
<figure class="post-figure-card post-figure-card--image" id="fig-rank">

<div class="post-figure-card__media-frame"><img alt="Rank versus sample size. The rank follows the number of examples until it reaches the 4097-column ceiling." class="post-figure-card__media theme-asset theme-asset--light" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/rank_vs_sample_size.svg?v=20260527h"/><img alt="" aria-hidden="true" class="post-figure-card__media theme-asset theme-asset--dark" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/rank_vs_sample_size-dark.svg?v=20260527h"/></div><figcaption class="post-figure-card__caption" id="fig-rank-caption-0ceaefa1-69ba-4598-a22c-09a6ac19f8ca">
Rank versus sample size. The rank follows the number of examples until the augmented matrix reaches its 4097-column ceiling.
</figcaption>
</figure>
<p>In the rank plot, the line rises with the number of examples at first. That means every new image is still giving the solver a new equation it can satisfy separately from the others. The rise stops at 4097 because the augmented matrix only has 4097 columns: 4096 pixel weights plus the bias. After that point, adding more rows gives the solver more score requests than those 4097 adjustable columns can satisfy for every random labeling.</p>
<figure class="post-figure-card post-figure-card--image" id="fig-updates">

<div class="post-figure-card__media-frame"><img alt="Perceptron updates after 50 epochs. Larger randomized training sets require many more corrections." class="post-figure-card__media theme-asset theme-asset--light" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/perceptron_updates.svg?v=20260527h"/><img alt="" aria-hidden="true" class="post-figure-card__media theme-asset theme-asset--dark" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/perceptron_updates-dark.svg?v=20260527h"/></div><figcaption class="post-figure-card__caption" id="fig-updates-caption-0ceaefa1-69ba-4598-a22c-09a6ac19f8ca">
Perceptron updates after 50 epochs. Larger randomized training sets require many more corrections, even when the algebraic separator exists.
</figcaption>
</figure>
<p>The update plot shows how much work training took. A separator may exist, but the perceptron still has to reach it by correcting mistakes. Random labels make that take longer because the updates are not following a cat-versus-dog pattern.</p>
<figure class="post-figure-card post-figure-card--image" id="fig-journey">

<div class="post-figure-card__media-frame"><img alt="Training trace for 500 randomly labeled images, including snapshots of the evolving weight image." class="post-figure-card__media theme-asset theme-asset--light" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/perceptron_training_journey_n500.png?v=20260527h"/><img alt="" aria-hidden="true" class="post-figure-card__media theme-asset theme-asset--dark" decoding="async" loading="lazy" src="/assets/img/perceptron-memorization/perceptron_training_journey_n500-dark.png?v=20260527h"/></div><figcaption class="post-figure-card__caption" id="fig-journey-caption-0ceaefa1-69ba-4598-a22c-09a6ac19f8ca">
The 500-example run as a training trace: mistakes drive updates, the weight image changes, and the training error eventually reaches zero.
</figcaption>
</figure>
<p>The training trace shows one run over time. The model starts wrong on many examples, each update moves the weights, and eventually the training error reaches zero. Because the labels were random, that success is not evidence of a learned animal concept. It shows that the model found weights that separate this particular random split.</p>
</section>
<section id="how-the-weights-store-information">
<h2>What the weights remember</h2>
<p>The perceptron does not keep a database of images or filenames, so saying it “stores the training set” can be misleading. What it does keep is a weight vector shaped by the examples that caused updates. After training, that vector can be written as a sum of signed training examples:</p>
<p><span class="math display">\[
w = \sum_i \alpha_i y_i x_i.
\]</span></p>
<p>Here <span class="math inline">\(x_i\)</span> is training image <span class="math inline">\(i\)</span>, <span class="math inline">\(y_i\)</span> is its label, and <span class="math inline">\(\alpha_i\)</span> records how much that example contributed through mistakes and updates. If an example never caused an update, its contribution may be zero; if it caused multiple updates, its contribution may be larger. The final weight vector is shaped by the examples that pushed on the model during training.</p>
<p>Because the weights are built from image vectors, the final <span class="math inline">\(w\)</span> can be reshaped into a 64 by 64 image. In the random-label experiment, however, that image is not a cat template or a dog template. It is a signed accumulation of corrections: pixels from examples labeled <span class="math inline">\(+1\)</span> and pixels from examples labeled <span class="math inline">\(-1\)</span> have been added and subtracted until the training split becomes separable.</p>
<p>Under random labels, the weights are not learning catness or dogness. They are building a signed record of this particular split of this particular training set.</p>
</section>
<section id="what-this-does-and-does-not-prove">
<h2>What the experiment proves</h2>
<p>This experiment proves a specific claim on a specific processed dataset. It does not show that all high-dimensional models only memorize, that neural networks cannot generalize, that real cat-versus-dog classification is impossible, or that VC dimension alone explains modern deep learning. Those would be larger claims than this experiment can support.</p>
<p>The supported claim is narrower: a high-dimensional linear classifier can fit random labels when the number of examples is small enough relative to the number of adjustable weights and the data matrix has the right rank. The exact solve explains why the perfect fit exists, and the longer perceptron runs show that the original learning rule can find it when given enough passes through the data.</p>
<ol type="1">
<li>A high-dimensional linear model can fit arbitrary labels when the number of examples is small enough relative to the number of input values and the data matrix has the right rank.</li>
<li>A perceptron can eventually find a separator when one exists, but the number of epochs depends on geometry.</li>
<li>Training accuracy alone cannot distinguish semantic learning from memorization.</li>
<li>Random labels remove semantic meaning from the target.</li>
<li>Generalization requires more than fitting the training set.</li>
</ol>
<p>The warning for real machine learning is about training accuracy. We care about performance on new examples, not only performance on the training set. If a model performs well only on the data it trained on, it may have memorized the examples without learning a rule that travels beyond them. Random labels make that failure mode impossible to hide behind a familiar category name.</p>
</section>
<section id="a-hand-exercise">
<h2>A hand calculation</h2>
<p>The 4096-dimensional result has a three-parameter version that fits on the page.</p>
<p>The three points are:</p>
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
<p>After adding the bias column:</p>
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
<p>The equation is:</p>
<p><span class="math display">\[
X_{\mathrm{aug}}\tilde{w}=y.
\]</span></p>
<p>Written row by row:</p>
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
<p>Therefore:</p>
<p><span class="math display">\[
\tilde{w} = (2,2,-1).
\]</span></p>
<p>The separator is:</p>
<p><span class="math display">\[
2x_1 + 2x_2 - 1 = 0.
\]</span></p>
<p>The separator is the one shown in <a href="#fig-toy-separator">Figure 3</a>. The large experiment uses the same linear-system idea with 4097 columns instead of 3.</p>
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
<p id="glossary-augmented"><strong>Augmented.</strong> Expanded by adding something. In this post, the image vector is augmented by adding a final 1. That little extra slot lets the bias sit inside the same dot product as the pixel weights, so the whole score can be written as one row times one weight vector.</p>
<p id="glossary-bias"><strong>Bias.</strong> A parameter added to the weighted sum that shifts the cutoff. Pixel weights decide how the image affects the score; the bias decides where zero sits before those pixel contributions are counted. In matrix form, it is handled by adding a constant column of 1s to the data.</p>
<p id="glossary-binary-classification"><strong>Binary classification.</strong> A prediction task with two possible labels. This project uses <span class="math inline">\(-1\)</span> and <span class="math inline">\(+1\)</span> because signs make the perceptron math clean.</p>
<p id="glossary-capacity"><strong>Capacity.</strong> How much freedom a model has to fit different label patterns. A model with more capacity can handle more complicated assignments, which can help when the pattern is real and cause trouble when the labels are noise. In this experiment, capacity is the reason the perceptron can fit coin-flip labels through 4097 examples.</p>
<p id="glossary-decision-boundary"><strong>Decision boundary.</strong> The place where the model is exactly undecided. For a perceptron, this is where <span class="math inline">\(w^\top x + b = 0\)</span>. Points on one side get a positive score; points on the other side get a negative score.</p>
<p id="glossary-epoch"><strong>Epoch.</strong> One full pass through the training set. If there are 500 images, one epoch means the algorithm has had one chance to check all 500 images.</p>
<p id="glossary-feature"><strong>Feature.</strong> One input variable. In this project, each pixel position is a feature, so a 64 by 64 image has 4096 features.</p>
<p id="glossary-full-row-rank"><strong>Full row rank.</strong> A matrix with <span class="math inline">\(N\)</span> rows has full row rank when its rank is <span class="math inline">\(N\)</span>. In this experiment, that means none of the image rows is wasted. No row is an exact repeat, and no row is forced by a combination of earlier rows, so the direct solve can treat each training image as its own score request.</p>
<p id="glossary-hyperplane"><strong>Hyperplane.</strong> The high-dimensional version of a line or plane. In two dimensions, a perceptron boundary is a line. In 4096 dimensions, the same kind of flat boundary is called a hyperplane.</p>
<p id="glossary-learning-rate"><strong>Learning rate.</strong> The size of each perceptron correction. A larger learning rate makes each mistake move the weights more.</p>
<p id="glossary-linear-classifier"><strong>Linear classifier.</strong> A classifier that draws one flat boundary. It can use thousands of input dimensions, but it still makes its decision by adding weighted inputs and checking which side of zero the score lands on.</p>
<p id="glossary-linearly-separable"><strong>Linearly separable.</strong> A dataset is linearly separable if some flat boundary can place all positive examples on one side and all negative examples on the other.</p>
<p id="glossary-margin"><strong>Margin.</strong> The amount of room between a separator and the closest training examples. If the closest points barely clear the boundary, the perceptron may need many corrections before it finds a separator that works. If the points are farther away, training is usually easier.</p>
<p id="glossary-perceptron"><strong>Perceptron.</strong> A linear classifier that predicts from the sign of a weighted sum. It multiplies each input by a weight, adds the products plus a bias, and predicts from whether the result is positive or negative.</p>
<p id="glossary-perceptron-rule"><strong>Perceptron learning rule.</strong> The mistake-driven update rule for training a perceptron. If the model gets an example right, it leaves the weights alone. If it gets an example wrong, it changes the weights in the direction that would move that same example’s score toward the correct side of zero.</p>
<p id="glossary-random-labels"><strong>Random labels.</strong> Labels assigned independently of the real class. They test memorization by removing semantic meaning. A cat can be labeled <span class="math inline">\(+1\)</span> or <span class="math inline">\(-1\)</span> by chance.</p>
<p id="glossary-rank"><strong>Rank.</strong> The amount of non-repeated information in a matrix. If a row is a duplicate, or if it can be perfectly built from other rows, it does not raise the rank because it is not giving the solver a new equation to work with. In this experiment, rank tells us whether the image rows are separate enough for the solver to set their scores independently.</p>
<p id="glossary-shattering"><strong>Shattering.</strong> A model class shatters a set of points if it can fit every possible binary labeling of those points. It is a demanding test: the model has to handle all label assignments, not only the convenient ones.</p>
<p id="glossary-training-error"><strong>Training error.</strong> The fraction of training examples classified incorrectly. Zero training error means every training example is classified correctly, but it does not prove the model will work on new examples.</p>
<p id="glossary-vc-dimension"><strong>VC dimension.</strong> A way to measure how many arbitrary labels a type of model can handle. It does not ask whether the labels are sensible; it asks whether the model class could fit every possible assignment of <span class="math inline">\(+1\)</span> and <span class="math inline">\(-1\)</span> on a set of points. For linear separators in <span class="math inline">\(d\)</span> dimensions, the VC dimension is <span class="math inline">\(d+1\)</span>, which becomes 4097 for 4096-pixel image vectors.</p>
<p id="glossary-vector"><strong>Vector.</strong> An ordered list of numbers. For an image, the order matters because each slot corresponds to a pixel location.</p>
</section>
<section id="source-note">
<h2>Source note</h2>
<p>This project was inspired by the perceptron and VC-dimension discussion in <em>The Welch Labs Illustrated Guide to AI</em>. The public site repository is <a href="https://github.com/huntercolson1/ultrathink">huntercolson1/ultrathink</a>. The experiment code that generated the results adds the bias column, checks <code>np.linalg.matrix_rank</code>, solves with <code>np.linalg.lstsq</code>, and runs the Rosenblatt perceptron update on AFHQ animal-face images.</p>
</section>
