---
title: Logistic Regression From Scratch
date: 2026-02-19
author: Hunter Colson
subtitle: Build a working classifier in Excel and see every step of the learning process in plain sight.
description: Companion tutorial guide for Logistic_Regression_Tutorial.xlsx covering logistic regression, gradient descent, and model interpretation in Excel.
tags:
  - tutorial
  - machine-learning
  - logistic-regression
  - excel
---

## Introduction: What Is Machine Learning?

A doctor who reads tumor biopsies for long enough starts to notice patterns. Larger, rougher-looking nuclei tend to go with malignant cases. That judgment comes from experience, not from a fixed checklist written down on day one.

Machine learning does something similar, but systematically. A computer starts with no knowledge, looks at many labeled examples, and adjusts internal settings until it can classify new cases it has never seen before.

In this tutorial, you play the role of that computer. You will run every step of the learning process inside an Excel spreadsheet, with every calculation visible in the cells. Along the way, you will see how a model stores what it has learned as a handful of numbers, how it turns measurements into probabilities, how we score wrong answers, and how small repeated adjustments make those answers better. No prior machine learning background is required.

<div style="margin: var(--space-lg) 0; padding: var(--space-md) var(--space-lg); border: 1px solid var(--border-color); border-left: 4px solid var(--text-primary); display: flex; align-items: center; justify-content: space-between; gap: var(--space-lg); flex-wrap: wrap;">
  <div style="display: flex; flex-direction: column; gap: 0.25rem;">
    <span style="font-family: var(--font-mono); font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text-secondary);">Companion File</span>
    <span style="font-family: var(--font-mono); font-size: 1rem; font-weight: 600;">Logistic_Regression_Tutorial.xlsx</span>
    <span style="font-size: 0.85rem; color: var(--text-secondary);">The Excel workbook used throughout this tutorial. Download it before you begin.</span>
  </div>
  <a href="/assets/downloads/Logistic_Regression_Tutorial.xlsx" download class="c-btn c-btn--solid" style="white-space: nowrap; flex-shrink: 0; font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 0.05em;">↓ Download</a>
</div>

### What You Will Build

You will build a logistic regression model, one of the simplest and most widely used classifiers in machine learning. It takes measurements about a subject and returns a probability: how likely is this subject to belong to a particular category?

Your model will read two measurements from a breast tumor biopsy (the mean nuclear radius and nuclear texture of the sampled cells) and output a probability that the tumor is malignant. If the probability is above 50%, the model predicts malignant. If below 50%, it predicts benign.

### Prerequisites

You need basic familiarity with Excel (opening files, editing cells, copying and pasting). No programming, statistics, or advanced math knowledge is required. Any mathematical notation will be explained in plain language.

## The Dataset: Breast Tumor Measurements

Our dataset comes from the [Breast Cancer Wisconsin (Diagnostic) dataset](https://archive.ics.uci.edu/dataset/17/breast+cancer+wisconsin+diagnostic), a standard teaching dataset in machine learning. Researchers at the University of Wisconsin used fine needle aspirate (FNA) to collect cell samples from breast masses, digitized images of those cells, and measured geometric properties of the nuclei.

We use a subset of 150 samples with two features and one label:

| **Feature** | **Type** | **Description** |
| --- | --- | --- |
| **Radius** | Numeric (continuous) | The mean distance from the center of the cell nucleus to its perimeter. Larger values indicate bigger nuclei. |
| **Texture** | Numeric (continuous) | The standard deviation of gray-scale pixel values in the image. Higher values indicate rougher, more irregular surfaces. |
| **Malignant** | Binary (0 or 1) | The diagnosis: 1 if the tumor is malignant (cancerous), 0 if benign (not cancerous). This is what the model will predict. |

### The Prediction Task

**Given measurements of cell nuclei from a breast tumor biopsy, predict whether the tumor is malignant or benign.** This is called **binary classification** because there are exactly two possible outcomes (malignant or benign, encoded as 1 or 0).

### Why These Features?

We chose radius and texture because they carry real medical meaning. Malignant tumors often have larger nuclei (higher radius) and more irregular surfaces (higher texture). That gives the model a genuine pattern to find, not just noise. You can see this in the scatter plot on the Visualizations sheet: red (malignant) and blue (benign) points partially separate along these axes, though they overlap in the middle.

### Feature Normalization

The raw radius values range from about 7 to 25, while texture values range from about 10 to 31. When two features sit on different scales, training gets lopsided. The model ends up needing tiny weights for the larger-valued feature and larger weights for the smaller one, which slows learning down.

To fix this, we normalize each feature by subtracting its mean and dividing by its standard deviation:

$$
x' = \frac{x - \mu}{\sigma}
$$

After normalization, both features are centered around zero and have similar scales (most values fall between -2 and +2). That way both features can contribute equally from the start. The Data sheet in the workbook shows raw and normalized values side by side so you can see exactly what normalization does.

## The Model: How Logistic Regression Works

A logistic regression model is a small decision-making machine with adjustable knobs. It takes in numbers (the features), runs them through a formula, and outputs a probability. Those knobs are the model's parameters: the values that change during training.

### The Parameters

Our model has exactly three parameters:

- **Weight 1 (w1):** This controls how much the Radius feature influences the prediction. A large positive w1 means bigger radius pushes the prediction toward malignant. A large negative w1 would mean bigger radius pushes toward benign.

- **Weight 2 (w2):** This controls how much the Texture feature influences the prediction. Same logic: positive means higher texture pushes toward malignant.

- **Bias (b):** This shifts the overall prediction up or down, regardless of the input features. It works like a baseline tendency. A negative bias means the model leans toward predicting benign unless the features push it the other way.

These three numbers are the entirety of the model's "knowledge." Before training, all three are set to zero, meaning the model has no opinion about anything. After training, they will contain the learned pattern.

A machine learning model is a mathematical function with adjustable parameters. Training means finding the parameter values that make the function produce correct outputs.

### Step 1: The Linear Combination (Computing z)

The model's first calculation is a weighted sum:

$$
z = w_{1}x_{1} + w_{2}x_{2} + b
$$

Here, x1 is the normalized radius and x2 is the normalized texture. The model multiplies each feature by its corresponding weight, adds the results together, and adds the bias. The output z can be any number, positive or negative.

Think of z as a score. A positive z means the model is leaning toward predicting malignant. A negative z means the model leans toward benign. A z near zero means the model is uncertain. The larger the absolute value of z, the more confident the model is.

**Example:** If w1 = 2.0, w2 = 0.5, b = -0.3, and a sample has x1 = 1.5 (large radius) and x2 = 0.8 (above-average texture), then z = 2.0\*1.5 + 0.5\*0.8 + (-0.3) = 3.0 + 0.4 - 0.3 = 3.1. This is a confident positive score, suggesting malignant.

In the Training sheet, column E shows the z value for every sample. When all weights are zero (before training), every z equals zero.

### Step 2: The Sigmoid Function (Computing p)

The value z is a raw score, but we need a probability between 0 and 1. The sigmoid function performs this conversion:

$$
p = \frac{1}{1 + \exp(-z)}
$$

The function exp(-z) means "e raised to the power of negative z," where e is the mathematical constant approximately equal to 2.718. You do not need to memorize this. What matters is understanding the sigmoid's behavior:

- **When z is large and positive (e.g., z = 5):** exp(-5) is about 0.0067, so p = 1/(1 + 0.0067) = 0.993. The model is 99.3% confident the tumor is malignant.

- **When z is large and negative (e.g., z = -5):** exp(5) is about 148.4, so p = 1/(1 + 148.4) = 0.0067. The model is only 0.7% confident in malignant (99.3% confident in benign).

- **When z is exactly 0:** exp(0) = 1, so p = 1/(1 + 1) = 0.5. The model is perfectly uncertain, a coin flip.

The sigmoid creates a smooth S-shaped curve. It never outputs exactly 0 or exactly 1, but it gets arbitrarily close. That smoothness matters because it allows us to compute gradients, which we will need for learning. The Visualizations sheet includes a plot of this curve.

Hard thresholds would create sharp corners that make gradient computation impossible. The sigmoid's smoothness is what makes gradient descent work: it tells us not just which direction to go, but how far.

In the Training sheet, column F shows p = sigmoid(z) for every sample. When all weights are zero, every p equals exactly 0.5.

### Making a Classification Decision

The predicted probability p is continuous: it could be 0.73 or 0.12 or 0.51. To make an actual classification decision (malignant or benign), we apply a threshold:

> **If p >= 0.5, predict Malignant (1). Otherwise, predict Benign (0).**

The accuracy metric on the Parameters sheet counts how many samples are classified correctly using this threshold.

## The Loss Function: Measuring How Wrong the Model Is

Now we need a way to tell the model how wrong its predictions are. This is the job of the loss function. It takes the model's prediction (p) and the true answer (y) and outputs a single number: the loss. A small loss means the prediction was good. A large loss means it was bad.

### Binary Cross-Entropy (Log Loss)

For binary classification, we use a loss function called binary cross-entropy:

$$
Loss = -\left[ y \cdot \ln(p) + (1 - y) \cdot \ln(1 - p) \right]
$$

Here, ln is the natural logarithm. This formula looks complex, but it simplifies nicely depending on the true label:

**Case 1: True label y = 1 (tumor is actually malignant)**

The formula simplifies to: Loss = -ln(p)

If the model predicts p = 0.99 (correctly confident), Loss = -ln(0.99) = 0.01. Tiny loss, great prediction.

If the model predicts p = 0.50 (uncertain), Loss = -ln(0.50) = 0.69. Moderate loss.

If the model predicts p = 0.01 (confidently wrong), Loss = -ln(0.01) = 4.61. Huge loss, terrible prediction.

**Case 2: True label y = 0 (tumor is actually benign)**

The formula simplifies to: Loss = -ln(1 - p)

If the model predicts p = 0.01 (correctly confident in benign), Loss = -ln(0.99) = 0.01. Tiny loss.

If the model predicts p = 0.99 (confidently wrong), Loss = -ln(0.01) = 4.61. Huge loss.

### Why Cross-Entropy Instead of Simple Difference?

You might wonder: why not just use (p - y) squared as the loss? That would technically work, but cross-entropy penalizes confident wrong predictions much more harshly than uncertain ones. If the model predicts p = 0.99 for a benign tumor, the cross-entropy loss is 4.61, but the squared error loss would only be (0.99 - 0)^2 = 0.98. Cross-entropy gives a much stronger signal that something is seriously wrong, which speeds up learning.

### The Average Loss

Each of the 150 samples has its own individual loss (shown in column G of the Training sheet). We average all of them to get a single number that summarizes the model's overall performance:

$$
Average\ Loss = \frac{1}{N}\sum_{i=1}^{N}{Loss_{i}}
$$

This average loss is what we are trying to minimize. It appears on the Parameters sheet in cell B12. When the model starts (all weights zero), every prediction is 0.5, so the average loss is -ln(0.5) = 0.693. This is the loss of a model that is purely guessing. Any learning at all should bring the loss below this number.

## Training: How the Model Learns

We now have a model that makes predictions and a loss function that measures how wrong those predictions are. The remaining question is: how do we improve the parameters so the loss goes down? The answer is gradient descent.

### The Core Idea

Picture the loss as a landscape with hills and valleys. Each point on that landscape corresponds to one set of parameter values, and the height at that point is the loss. We want to find a valley: parameter values where the loss is low.

We cannot see the whole landscape at once, but we can measure the slope at our current position. That slope is the gradient. For each parameter, the gradient answers a simple question: if you nudge this parameter up by a tiny amount, does the loss go up or down? A positive gradient means increasing the parameter makes things worse, so we should decrease it. A negative gradient means increasing the parameter helps, so we should increase it.

Each update moves us a small step downhill. After enough steps, we land in a valley where the loss has stopped falling much.

### The Error Signal

The first step in computing gradients is calculating the error for each sample:

$$
error = p - y
$$

This is remarkably simple. It is just the predicted probability minus the true label. Let us think about what it means:

- **Malignant tumor (y = 1), model predicts p = 0.3:** error = 0.3 - 1.0 = -0.7. The error is negative, meaning the model needs to push its prediction higher.
- **Benign tumor (y = 0), model predicts p = 0.8:** error = 0.8 - 0.0 = 0.8. The error is positive, meaning the model needs to push its prediction lower.
- **Perfect prediction (p equals y):** error = 0. No adjustment needed.

The sign of the error tells us the direction of the needed correction. The magnitude tells us how large the correction should be. In the Training sheet, column H shows this error for every sample.

### Computing Gradients

The gradient for each weight tells us how much that weight contributed to the total error. For logistic regression, the math works out elegantly:

$$
\frac{\partial L}{\partial w_{1}} = \frac{1}{N}\sum_{i=1}^{N}{(p_{i} - y_{i}) \cdot x_{1,i}}
$$

$$
\frac{\partial L}{\partial w_{2}} = \frac{1}{N}\sum_{i=1}^{N}{(p_{i} - y_{i}) \cdot x_{2,i}}
$$

$$
\frac{\partial L}{\partial b} = \frac{1}{N}\sum_{i=1}^{N}{(p_{i} - y_{i})}
$$

For each sample, we multiply the error by the corresponding feature value. This makes intuitive sense:

- If a sample has a large error AND a large feature value, that feature contributed a lot to the wrong prediction, so its weight needs a big adjustment.

- If a sample has a large error but a small feature value, the feature did not contribute much, so its weight needs only a small adjustment.

- The bias gradient is just the average error, because the bias does not multiply any feature.

In the Training sheet, columns I and J show each sample's gradient contribution for w1 and w2 respectively. The averages of these columns (plus the average error for bias) appear in the aggregated cells P3 through R3 and are reflected on the Parameters sheet.

### The Update Rule

Once we have the gradients, we update each parameter:

$$
w_{1,\text{new}} = w_{1,\text{old}} - \alpha \cdot \frac{\partial L}{\partial w_{1}}
$$

$$
w_{2,\text{new}} = w_{2,\text{old}} - \alpha \cdot \frac{\partial L}{\partial w_{2}}
$$

$$
b_{\text{new}} = b_{\text{old}} - \alpha \cdot \frac{\partial L}{\partial b}
$$

Here α (alpha) is the learning rate. The minus sign is critical: we subtract the gradient because the gradient points uphill (toward higher loss), and we want to go downhill (toward lower loss). We walk in the opposite direction of the slope.

### The Learning Rate

The learning rate is a number (typically between 0.001 and 1.0) that controls the step size. It answers the question: "How far should we walk in the downhill direction?"

- **Too large (e.g., 10.0):** The model takes giant leaps and overshoots the valley. The loss may oscillate wildly or even increase. This is like running down a hill so fast that you fly past the bottom and up the other side.

- **Too small (e.g., 0.0001):** The model takes tiny baby steps. It will eventually converge, but it could take thousands of iterations. This is like inching down the hill one millimeter at a time.

- **Just right (e.g., 0.1):** The model makes steady progress, reaching a good solution in tens of iterations. The default value of 0.1 works well for this dataset.

Try changing the learning rate on the Parameters sheet to see its effect. Set it to 0.01 and notice how the loss decreases more slowly. Set it to 1.0 and watch the model learn faster, though it may become unstable for even larger values.

### What Is One Training Iteration?

One training iteration (also called an epoch) consists of one complete pass through all 150 training samples. The word “epoch” simply means one full cycle through the entire dataset. Each epoch produces one gradient update, moving the weights slightly closer to their optimal values. One epoch here consists of:

1.  Compute the linear activation z for every sample using the current weights and bias.

2.  Compute the predicted probability p = sigmoid(z) for every sample.

3.  Compute the loss for every sample and average them.

4.  Compute the error signal (p - y) for every sample.

5.  Compute the gradient for each parameter by averaging the gradient contributions.

6.  Update each parameter: new = old - learning_rate * gradient.

In the spreadsheet, steps 1 through 5 happen automatically through formulas. Step 6 is the part you do manually by copying the new parameter values.

## Detailed Walkthrough of the Excel Workbook

### Overview Sheet

The first sheet you see when you open the workbook. It provides a quick-start guide and lists all the sheets with their purposes. Use it as a reference card.

### Parameters Sheet

This is your control panel. It is organized into clearly labeled sections:

**Learnable Parameters (Yellow Cells)**

Cells B4, B5, and B6 hold w1, w2, and the bias. These are the only cells you should edit during training. They start at zero. The yellow background highlights that these are the user-editable inputs.

**Training Hyperparameter**

Cell B9 holds the learning rate (default 0.1). You can change this to experiment with faster or slower learning.

**Current Model Performance**

Cell B12 shows the average cross-entropy loss across all 150 samples. Cell B13 shows the classification accuracy (percentage of samples correctly classified). Cell B14 shows the raw count (e.g., "58 / 150"). These update instantly whenever you change the parameters.

**Computed Gradients**

Cells B17 through B19 show the current gradient for each parameter. These tell you the direction and magnitude of the needed adjustment. Negative gradient means you should increase the parameter; positive means decrease it.

**Updated Parameters (Red Cells)**

Cells B22, B23, and B24 show what the parameters should be after one gradient descent step. These are computed as: new = old - learning_rate * gradient. To perform a training iteration, you copy these values and paste them into the yellow cells above.

### Data Sheet

This sheet contains the full dataset of 150 tumor samples. The first section shows the normalization statistics (mean and standard deviation for each feature). The main table has six columns:

- Column A: Sample number (1 to 150)

- Column B: Raw Radius measurement

- Column C: Raw Texture measurement

- Column D: True label (1 = malignant, shown in orange; 0 = benign, shown in green)

- Column E: Normalized Radius = (raw - mean) / std

- Column F: Normalized Texture = (raw - mean) / std

The normalization formulas in columns E and F reference the statistics computed at the top of the sheet. You can click on any normalized cell to see the formula and verify the calculation.

### Training Sheet

This is the computational heart of the workbook. Every intermediate calculation is exposed as a visible column. There are two header rows: the first shows the short name, the second provides a description.

| **Column** | **Name** | **What It Represents** |
| --- | --- | --- |
| A | \# | Sample identifier (1 to 150) |
| B | x1 | Normalized Radius, pulled from the Data sheet via formula |
| C | x2 | Normalized Texture, pulled from the Data sheet via formula |
| D | y | True label (0 or 1), pulled from the Data sheet |
| E | z | Linear activation: w1\*x1 + w2\*x2 + bias. This is the raw score before sigmoid. |
| F | p | Predicted probability: sigmoid(z) = 1/(1+exp(-z)). Always between 0 and 1. |
| G | Loss | Binary cross-entropy loss for this one sample. Measures how wrong this prediction is. |
| H | Error | p - y. The direction and magnitude of the mistake. Used to compute gradients. |
| I | dL/dw1 | This sample's gradient contribution for w1: error * x1. Shows how much w1 contributed to the error. |
| J | dL/dw2 | This sample's gradient contribution for w2: error * x2. Shows how much w2 contributed to the error. |

The aggregated metrics appear in the top-right area of the sheet: average loss in N3, accuracy in O3, and the three averaged gradients in P3 (w1 gradient), Q3 (w2 gradient), and R3 (bias gradient). These are the values that flow back to the Parameters sheet to drive the update calculations.

> *Click on any formula cell in the Training sheet to see exactly what it computes. Every single calculation is transparent. There are no macros, no hidden code, and no VBA scripts. Everything is a standard Excel formula.*

### Iteration Log Sheet

This sheet records the model's performance across training iterations. The first 101 rows (iterations 0 through 100) are pre-filled with data from a simulation, so you can immediately see the loss curve chart without needing to do 100 manual iterations. The pre-filled data shows:

- Loss drops from 0.693 (random guessing) to 0.291 by iteration 100

- Accuracy jumps from 38.7% to ~90% after just one update (see Section 7.2 for a full explanation of why this jump is so dramatic)

- Weight w1 (Radius) grows to 1.63, while w2 (Texture) grows to 0.59, confirming that radius is a stronger predictor

- The bias becomes -0.45, reflecting that the majority class is benign

If you want to continue training beyond iteration 100, empty rows are provided below. Simply fill in the values from the Parameters sheet after each update.

### Visualizations Sheet

This sheet contains seven charts: a 2×3 grid with a full-width chart at the bottom. Charts 5 and 7 update automatically whenever you change parameters on the Parameters sheet. Charts 1, 2, 3, 4, and 6 draw from the pre-filled Iteration Log and static data, so they reflect the reference training run rather than your current parameter values.

**Chart 1: Training Loss vs Iteration**

This line chart plots the average loss at each iteration from the Iteration Log. You should see a curve that starts at 0.693 (the loss of a model that is purely guessing) and decreases rapidly at first, then gradually levels off into a plateau around iteration 80 to 100. This shape is characteristic of gradient descent: early iterations make large improvements because the model is far from optimal, while later iterations make smaller and smaller improvements as the model approaches the best it can do with two features and a linear decision boundary.

**Chart 2: Classification Accuracy vs Iteration**

This line chart plots the accuracy at each iteration from the Iteration Log. Notice the dramatic spike on iteration 1, where accuracy jumps from 38.7% to roughly 90%. After that initial jump, accuracy climbs more gradually and plateaus near the model's ceiling. Compare this directly with Chart 1: the loss curve is smooth while the accuracy curve is jagged and step-like. That contrast illustrates the fundamental difference between a continuous metric (loss) and a discrete one (accuracy).

**Chart 3: Weight Evolution During Training**

This line chart traces how all three learned parameters (w1 for Radius, w2 for Texture, and the bias) change across iterations. All three start at zero. w1 grows the fastest and reaches the highest final value (around 1.6 to 2.3), confirming that radius is the stronger predictor. w2 grows more slowly and stabilizes lower (around 0.5 to 0.7). The bias drifts negative (toward -0.4 to -0.5), reflecting the class imbalance: with more benign samples in the dataset, the model learns to start with a slight lean toward benign. All three curves flatten as the model converges.

**Chart 4: Feature Scatter Plot**

This scatter chart plots each sample as a point with normalized radius on the horizontal axis and normalized texture on the vertical axis. Red circles represent malignant samples and blue triangles represent benign samples. You can see the two classes partially separate (malignant samples cluster toward higher radius values on the right), but there is significant overlap in the middle. That overlap is why the model cannot reach 100% accuracy: some samples cannot be separated by any straight line through this feature space.

**Chart 5: Predicted Probability per Sample**

This scatter chart shows the model's current predicted probability for each of the 150 samples, split into two series: malignant (red) and benign (blue). The x-axis is the sample index and the y-axis is the predicted probability of malignancy. This chart updates automatically when you change parameters. Before any training, every dot sits at exactly 0.5 because all weights are zero. After one iteration, the dots spread dramatically. After full training, the red dots cluster near 1.0 and the blue dots cluster near 0.0, with a gap around 0.5 at the decision boundary. Samples that remain near 0.5 after training are the genuinely ambiguous cases the model is uncertain about.

**Chart 6: The Sigmoid Function**

This reference chart shows the S-shaped sigmoid curve: the mathematical function that converts the raw linear score z into a probability between 0 and 1. The curve is steepest near z = 0, where the model is most uncertain and a small change in weights produces the largest change in output. As z becomes very positive or very negative, the curve flattens out where the model is confident. This chart is static and does not change with training.

**Chart 7: All Predicted Probabilities**

This full-width chart at the bottom shows all 150 predicted probabilities in sample order. Unlike Chart 5, it does not separate samples by class; it shows the raw output of the current model for every input. Before training, it is a flat horizontal line at 0.5. After training, it shows a scattered pattern where samples the model classifies confidently are pulled toward 0 or 1, while samples near the decision boundary remain close to 0.5. This chart updates live and redraws every time you paste new parameters into the Parameters sheet.


## Hands-On: Running Training Iterations

### Step-by-Step Instructions

Follow these steps to perform one complete training iteration:

1.  Open the Parameters sheet. Note the current Average Loss in B12 and Accuracy in B13. Before any training, loss is 0.693 and accuracy is 38.7%. (Why 38.7% and not 50%? When all weights are zero, sigmoid(0) = 0.5 exactly, which the model rounds up to class 1 (malignant) for every sample. Since only 58 of 150 samples are actually malignant, the model is right 38.7% of the time purely by predicting malignant for everything.)

2.  Look at the red cells B22, B23, B24. These contain the NEW parameter values computed from one step of gradient descent.

3.  Select cells B22, B23, and B24. Press Ctrl+C (or Cmd+C on Mac) to copy them.

4.  Click on cell B4. Right-click and choose "Paste Special," then select "Values Only." (On Windows you can press Ctrl+Alt+V and then choose Values; on Mac press Cmd+Ctrl+V.) This replaces the old parameters with the new ones. It is important to paste values, not formulas, because pasting the formulas would create a circular reference.

5.  The spreadsheet recalculates. Check B12: the loss should be lower. Check B13: the accuracy should be higher (or at least the same).

6.  Optionally, go to the Iteration Log sheet to record your progress. The log is pre-filled for iterations 0 through 100 from a simulation run. To continue from iteration 100, copy the w1, w2, and bias values from row 106 of the Iteration Log (columns D, E, and F) and paste them as Values Only into cells B4, B5, and B6 on the Parameters sheet. The spreadsheet automatically recalculates the loss, accuracy, and updated parameters. Then copy B12 (average loss), B13 (classification accuracy), B22 (new w1), B23 (new w2), and B24 (new bias) and paste them as Values Only into row 107 of the Iteration Log, along with the iteration number. To start fresh from iteration 0, clear the pre-filled rows, reset B4, B5, and B6 to 0, and log each update the same way as you train.

7.  Return to the Parameters sheet and repeat from step 2 to perform another training iteration.

### What to Expect

Here is a rough guide for what you should see at different stages:

| **Iteration** | **Approx. Loss** | **Approx. Acc.** | **What Is Happening** |
| --- | --- | --- | --- |
| 0 | 0.693 | 38.7% | All weights zero. Every prediction is 0.5. The model knows nothing. |
| 1-5 | 0.62 - 0.67 | ~89% | Accuracy jumps dramatically on iteration 1 while loss only decreases slightly. This is expected: before training, all predictions are exactly 0.5, which rounds up to “malignant” for every sample. One small weight update is enough to push many predictions decisively to one side, flipping many correct calls at once. Loss changes more smoothly because it measures confidence, not just correctness. |
| 10-20 | 0.46 - 0.55 | ~89% | Steady improvement. Loss drops significantly with each iteration. |
| 30-50 | 0.35 - 0.41 | ~89% | Improvement slows down. The model is refining its decision boundary. |
| 80-100 | 0.29 - 0.31 | ~90% | Plateau. Loss barely decreases. The model has learned most of what it can from this data. |

### Troubleshooting

- **Loss increased after an update:** The learning rate is likely too high. Change B9 to 0.01, reset the weights to zero, and try again.

- **All predictions are the same:** Make sure you used Paste Special > Values, not a regular paste. A regular paste would paste the formulas, which would create circular references.

- **Accuracy is stuck:** Accuracy can be stable even while loss continues to decrease. This is because accuracy only changes when a sample crosses the 0.5 threshold. The model may be making better calibrated predictions (probabilities closer to 0 or 1) without changing which side of 0.5 they are on.

## Interpreting the Trained Model

### What the Weights Mean

After training, examine the final weight values:

- **w1 (Radius) reaches approximately 1.6 to 2.3:** This positive weight means larger normalized radius values push the prediction toward malignant. Since malignant cells tend to be larger than benign cells, the model has discovered a real medical pattern.

- **w2 (Texture) reaches approximately 0.5 to 0.7:** This positive weight means rougher texture also pushes toward malignant, but with less influence than radius. This matches the data: texture is a weaker predictor than radius for this subset.

- **Bias reaches approximately -0.4 to -0.5:** The negative bias reflects the class imbalance in the dataset (92 benign vs 58 malignant). The model starts with a slight lean toward benign, which features must overcome.

### The Decision Boundary

The model classifies a sample as malignant when p >= 0.5, which happens when z >= 0. Setting z = 0 gives us:

$$
w_{1}x_{1} + w_{2}x_{2} + b = 0
$$

This is the equation of a straight line in the feature space. Every point on one side of this line is predicted malignant; every point on the other side is predicted benign. As the weights change during training, this line rotates and shifts to better separate the two classes.

### Why the Model Cannot Reach 100% Accuracy

With only two features and a linear decision boundary, the model has limited expressive power. Some malignant and benign samples have similar nuclear radius and texture values, making them impossible to separate with a straight line. That is a property of the data, not a failure of the training process. To achieve higher accuracy, you would need more features, a more complex model (like a neural network), or both.

This limitation is part of what motivates deep learning: by stacking many logistic regression units in layers, you can learn curved decision boundaries that a single straight line cannot represent.

## The Bigger Picture: From Here to Neural Networks

Everything in this tutorial carries forward into larger systems. The model you built here (weighted sum, then sigmoid) is exactly one neuron. A neural network is many such units connected in layers, with data passing through intermediate layers that learn increasingly abstract patterns instead of going straight from inputs to output.

Real models often use hundreds or thousands of input features instead of two, but the math is the same: more weights to learn, same update rule. In production, a computer runs the copy-paste-update loop you did by hand millions of times per second on GPUs. The algorithm does not change; only the scale does.

In multi-layer networks, gradients are computed with backpropagation, which extends the same chain-rule logic you used here to networks where each layer depends on the one before it. For tasks with more than two categories, cross-entropy generalizes to multiple classes. For regression (predicting a continuous number rather than a category), other loss functions like mean squared error are common.

The core loop stays the same regardless of scale: start with adjustable parameters, compute predictions, measure loss, compute gradients, update parameters to reduce loss.

## Key Takeaways

A machine learning model is a function with adjustable parameters. Ours had just three (w1, w2, b) and still reached about 90% accuracy on tumor classification. The sigmoid converts a raw score into a probability. It is smooth, differentiable, and bounded between 0 and 1, which makes it well suited to classification problems.

Binary cross-entropy measures prediction quality by penalizing confident wrong answers much more than uncertain ones, giving the model a clear signal about where it went astray. Gradients point in the direction of steepest loss increase; moving opposite the gradient decreases loss. Gradient descent repeats that move many times, improving the parameters a little on each pass until the loss flattens out.

The learning rate sets the step size for each update. Too large and the model overshoots; too small and convergence takes forever. Feature normalization keeps all inputs on comparable scales so no single feature dominates the gradients.

This simple model is also the building block of neural networks. When you hear about AI systems "training" on data, the process is the same one you ran in Excel: compute predictions, measure errors, adjust parameters, repeat.

## Glossary

| **Term** | **Definition** |
| --- | --- |
| **Binary Classification** | A prediction task with exactly two possible outcomes (e.g., malignant/benign, spam/not spam, yes/no). |
| **Sigmoid Function** | A mathematical function that maps any real number to a value between 0 and 1, creating an S-shaped curve. Formula: 1/(1 + exp(-z)). |
| **Cross-Entropy Loss** | A loss function that measures the gap between predicted probabilities and true labels. Also called log loss. Harshly penalizes confident wrong predictions. |
| **Gradient** | The direction and magnitude of steepest increase for a function. In training, we move opposite the gradient to decrease loss. |
| **Gradient Descent** | An optimization algorithm that iteratively adjusts parameters by subtracting a fraction (the learning rate) of the gradient from each parameter. |
| **Learning Rate** | A hyperparameter that controls how large each parameter update step is. Too large causes instability; too small causes slow learning. |
| **Epoch / Iteration** | One complete pass through the entire dataset, computing predictions and updating parameters once. |
| **Normalization** | Scaling features so they have a mean of 0 and standard deviation of 1, ensuring all features contribute equally to learning. |
| **Weight** | A learnable parameter that determines how much influence a particular feature has on the prediction. Learned during training. |
| **Bias** | A learnable parameter that shifts the decision boundary independently of the input features. Like a y-intercept in a line equation. |
| **Decision Boundary** | The line (or surface) in feature space where the model's prediction transitions from one class to the other (where p = 0.5). |
| **Overfitting** | When a model memorizes training data noise rather than learning general patterns. Not a concern for logistic regression on this dataset due to its simplicity. |
| **Convergence** | The point at which additional training iterations produce negligible improvement. The loss has "flattened out" on the loss curve. |
| **Neuron** | A single computational unit that performs a weighted sum of inputs, adds a bias, and applies an activation function (like sigmoid). Logistic regression is one neuron. |
