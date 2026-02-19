---
title: Logistic Regression From Scratch — An Interactive Excel Tutorial
date: 2026-02-19
author: Hunter Colson
subtitle: Learn how a machine learning model learns to classify data, one spreadsheet cell at a time.
description: Companion tutorial guide for Logistic_Regression_Tutorial.xlsx covering logistic regression, gradient descent, and model interpretation in Excel.
tags:
  - tutorial
  - machine-learning
  - logistic-regression
  - excel
---

**Logistic Regression**

**From Scratch**

An Interactive Excel Tutorial

*Learn how a machine learning model learns to classify data,*

*one spreadsheet cell at a time.*

Companion document for Logistic_Regression_Tutorial.xlsx

## Introduction: What Is Machine Learning?

Imagine you are a doctor examining tumor biopsies. After years of experience, you develop an intuition: larger, rougher tumors tend to be malignant. You cannot write down an exact rule, but you have learned patterns from hundreds of past cases.

Machine learning automates this process. Instead of a human learning patterns from experience, a computer learns patterns from data. The computer starts with no knowledge, looks at many examples, and gradually adjusts its internal settings until it can make accurate predictions on new cases it has never seen.

In this tutorial, you will play the role of that computer. You will manually perform every step of the learning process inside an Excel spreadsheet, with every calculation visible and inspectable. By the end, you will understand the fundamental mechanism behind how machines learn.

### What You Will Build

You will build a logistic regression model. This is one of the simplest and most important models in all of machine learning. It takes in measurements (numbers describing something) and outputs a probability: how likely is it that this thing belongs to a particular category?

Specifically, your model will take two measurements of a breast tumor (its radius and its texture) and output a probability that the tumor is malignant. If the probability is above 50%, the model predicts malignant. If below 50%, it predicts benign.

### What You Will Learn

This tutorial is designed for someone with no prior machine learning experience. By working through it, you will develop an intuitive understanding of:

- How a model represents its knowledge as a small set of numbers (weights and a bias)

- How a model converts input features into a probability (the sigmoid function)

- How we measure whether the model is right or wrong (the loss function)

- How the model figures out which direction to adjust its numbers (gradients)

- How repeatedly adjusting those numbers makes the model better (gradient descent)

- Why some features matter more than others (learned weights)

### Prerequisites

You need basic familiarity with Excel (opening files, editing cells, copying and pasting). No programming, statistics, or advanced math knowledge is required. Any mathematical notation will be explained in plain language.

## The Dataset: Breast Tumor Measurements

Our dataset comes from the Breast Cancer Wisconsin (Diagnostic) dataset, one of the most widely used datasets in machine learning education. It was created by researchers at the University of Wisconsin who used a fine needle aspirate (FNA) procedure to extract cell samples from breast masses. They then digitized images of those cells and measured various geometric properties of the cell nuclei.

We use a subset of 150 samples with two features and one label:

| **Feature** | **Type** | **Description** |
| --- | --- | --- |
| **Radius** | Numeric (continuous) | The mean distance from the center of the cell nucleus to its perimeter. Larger values indicate bigger nuclei. |
| **Texture** | Numeric (continuous) | The standard deviation of gray-scale pixel values in the image. Higher values indicate rougher, more irregular surfaces. |
| **Malignant** | Binary (0 or 1) | The diagnosis: 1 if the tumor is malignant (cancerous), 0 if benign (not cancerous). This is what the model will predict. |

### The Prediction Task

**Given a tumor's radius and texture, predict whether it is malignant or benign.** This is called **binary classification** because there are exactly two possible outcomes (malignant or benign, encoded as 1 or 0).

### Why These Features?

We chose radius and texture because they have real medical significance. In general, malignant tumors tend to have larger nuclei (higher radius) and more irregular surfaces (higher texture). This means there is a genuine pattern for the model to discover. You can verify this yourself by looking at the scatter plot on the Visualizations sheet: the red (malignant) and blue (benign) points partially separate along these axes, though they overlap.

### Feature Normalization

The raw radius values range from about 7 to 25, while texture values range from about 10 to 31. These different scales can cause problems during training: the model would need to use tiny weights for the larger-valued feature and larger weights for the smaller one. This makes the learning process lopsided and slow.

To fix this, we normalize each feature by subtracting its mean and dividing by its standard deviation:

$$
x' = \frac{x - \mu}{\sigma}
$$

After normalization, both features are centered around zero and have similar scales (most values fall between -2 and +2). This ensures both features contribute equally to learning from the start. The Data sheet in the workbook shows both the raw and normalized values side by side so you can see exactly what normalization does.

## The Model: How Logistic Regression Works

A logistic regression model is like a simple decision-making machine with adjustable knobs. It takes in numbers (the features), processes them through a formula, and outputs a probability. The adjustable knobs are the model's parameters: the values that change during training.

### The Parameters

Our model has exactly three parameters:

- **Weight 1 (w1):** This controls how much the Radius feature influences the prediction. A large positive w1 means bigger radius pushes the prediction toward malignant. A large negative w1 would mean bigger radius pushes toward benign.

- **Weight 2 (w2):** This controls how much the Texture feature influences the prediction. Same logic: positive means higher texture pushes toward malignant.

- **Bias (b):** This shifts the overall prediction up or down, regardless of the input features. Think of it as the model's baseline tendency. A negative bias means the model leans toward predicting benign unless the features push it the other way.

These three numbers are the entirety of the model's "knowledge." Before training, all three are set to zero, meaning the model has no opinion about anything. After training, they will contain the learned pattern.

> *Key insight: A machine learning model is just a mathematical function with adjustable parameters. "Training" means finding the parameter values that make the function produce correct outputs.*

### Step 1: The Linear Combination (Computing z)

The model's first calculation is a weighted sum:

$$
z = w_{1}x_{1} + w_{2}x_{2} + b
$$

Here, x1 is the normalized radius and x2 is the normalized texture. The model multiplies each feature by its corresponding weight, adds the results together, and adds the bias. The output z can be any number, positive or negative.

Think of z as a score. A positive z means the model is leaning toward predicting malignant. A negative z means the model leans toward benign. A z near zero means the model is uncertain. The larger the absolute value of z, the more confident the model is.

**Example:** If w1 = 2.0, w2 = 0.5, b = -0.3, and a sample has x1 = 1.5 (large radius) and x2 = 0.8 (above-average texture), then z = 2.0*1.5 + 0.5*0.8 + (-0.3) = 3.0 + 0.4 - 0.3 = 3.1. This is a confident positive score, suggesting malignant.

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

The sigmoid creates a smooth S-shaped curve. It never outputs exactly 0 or exactly 1, but it gets arbitrarily close. This smoothness is mathematically important because it allows us to compute gradients (which we will need for learning). The Visualizations sheet includes a plot of this curve.

> *Why not just use a hard threshold? We could simply say "if z > 0, predict 1; if z < 0, predict 0." But hard thresholds create sharp corners that make it impossible to compute gradients. The sigmoid's smoothness is what makes gradient descent work. It tells us not just which direction to go, but how far.*

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

You might wonder: why not just use (p - y) squared as the loss? This would technically work, but cross-entropy has an important advantage. It penalizes confident wrong predictions much more harshly than uncertain ones. If the model predicts p = 0.99 for a benign tumor, the cross-entropy loss is 4.61, but the squared error loss would only be (0.99 - 0)^2 = 0.98. Cross-entropy provides a much stronger signal to the model that something is seriously wrong, which speeds up learning.

> *Think of it this way: cross-entropy says "being confidently wrong is much worse than being uncertain." This harsh penalty for confident mistakes is exactly what we want, because it forces the model to be honest about its uncertainty.*

### The Average Loss

Each of the 150 samples has its own individual loss (shown in column G of the Training sheet). We average all of them to get a single number that summarizes the model's overall performance:

$$
Average\ Loss = \frac{1}{N}\sum_{i=1}^{N}{Loss_{i}}
$$

This average loss is what we are trying to minimize. It appears on the Parameters sheet in cell B12. When the model starts (all weights zero), every prediction is 0.5, so the average loss is -ln(0.5) = 0.693. This is the loss of a model that is purely guessing. Any learning at all should bring the loss below this number.

## Training: How the Model Learns

We now have a model that makes predictions and a loss function that measures how wrong those predictions are. The remaining question is: how do we improve the parameters so the loss goes down? The answer is gradient descent.

### The Core Idea

Imagine you are standing on a hilly landscape in complete fog. You cannot see which way is downhill, but you can feel the slope of the ground beneath your feet. Gradient descent is like taking a step in whichever direction feels most downhill. After many steps, you end up in a valley (a low point of the loss).

The gradient tells you the slope. Specifically, for each parameter, the gradient tells you: "If you increase this parameter by a tiny amount, how much does the loss increase?" If the gradient is positive, increasing the parameter makes things worse, so you should decrease it. If the gradient is negative, increasing the parameter makes things better, so you should increase it.

### The Error Signal

The first step in computing gradients is calculating the error for each sample:

$$
error = p - y
$$

This is remarkably simple. It is just the predicted probability minus the true label. Let us think about what it means:

- **Malignant tumor (y=1), model predicts p=0.3:** error = 0.3 - 1.0 = -0.7. The error is negative, meaning the model needs to push its prediction higher.

- **Benign tumor (y=0), model predicts p=0.8:** error = 0.8 - 0.0 = 0.8. The error is positive, meaning the model needs to push its prediction lower.

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

Here α (alpha) is the learning rate. The minus sign is critical: we subtract the gradient because the gradient points uphill (toward higher loss), and we want to go downhill (toward lower loss). Think of it as walking in the opposite direction of the slope.

### The Learning Rate

The learning rate is a number (typically between 0.001 and 1.0) that controls the step size. It answers the question: "How far should we walk in the downhill direction?"

- **Too large (e.g., 10.0):** The model takes giant leaps and overshoots the valley. The loss may oscillate wildly or even increase. This is like running down a hill so fast that you fly past the bottom and up the other side.

- **Too small (e.g., 0.0001):** The model takes tiny baby steps. It will eventually converge, but it could take thousands of iterations. This is like inching down the hill one millimeter at a time.

- **Just right (e.g., 0.1):** The model makes steady progress, reaching a good solution in tens of iterations. The default value of 0.1 works well for this dataset.

> *Experiment! Try changing the learning rate on the Parameters sheet to see its effect. Set it to 0.01 and notice how the loss decreases more slowly. Set it to 1.0 and watch the model learn faster (but be aware it may become unstable for even larger values).*

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
| E | z | Linear activation: w1*x1 + w2*x2 + bias. This is the raw score before sigmoid. |
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

This sheet contains seven charts. Charts 1, 2, and 3 update automatically when you change parameters. Charts 4 through 7 are static reference charts.

**Chart 1: Training Loss vs Iteration**

This line chart plots the average loss at each iteration. You should see a curve that starts high (0.693) and decreases rapidly at first, then gradually levels off into a plateau around iteration 80 to 100. This shape is characteristic of gradient descent: early iterations make large improvements because the model is far from optimal, while later iterations make smaller improvements as the model approaches its best possible performance.

**Chart 2: Feature Scatter Plot**

This scatter chart plots each tumor sample as a point, with Radius on the horizontal axis and Texture on the vertical axis. Red circles represent malignant tumors, and blue triangles represent benign tumors. You can see that the two classes partially separate (malignant tumors cluster toward higher radius), but there is significant overlap, which is why the model cannot achieve 100% accuracy.

**Chart 3: Predicted Probability per Sample**

This chart shows the model's current predicted probability for each sample. Before training, every dot is at exactly 0.5 (a horizontal line). As you train, the dots should spread apart: malignant samples should move toward 1.0 and benign samples should move toward 0.0. After sufficient training, you should see a clear separation between the two groups, though some samples near the decision boundary will remain close to 0.5.

**Chart 4: The Sigmoid Function**

This reference chart shows the S-shaped sigmoid curve. It helps you visualize how the linear activation z gets transformed into a probability p. Notice how the curve is steepest around z = 0 (where the model is most uncertain) and flattens out as z becomes very positive or very negative (where the model is very confident).

**Chart 5: Accuracy vs Iteration**

This line chart plots the classification accuracy at each iteration from the Iteration Log. You will notice a dramatic spike on iteration 1 (from 38.7% up to roughly 90%) followed by more gradual improvement. This is the accuracy jump explained in Section 7.2: a single small weight update shifts enough samples past the 0.5 decision threshold to cause a large, discrete jump in accuracy. After that initial spike, accuracy improvements become smaller and more incremental as the model fine-tunes near its performance ceiling.

**Chart 6: Weight Evolution**

This chart traces how the two weights (w1 for Radius and w2 for Texture) evolve across training iterations. Both weights start at zero and grow as the model learns. Notice that w1 (Radius) grows faster and reaches a higher final value than w2 (Texture), visually confirming that radius is the stronger predictor. The curves typically level off around iteration 80 to 100, showing that the model has converged and additional training would produce diminishing returns.

**Chart 7: Loss vs Accuracy (Combined View)**

This full-width chart overlays both training loss and accuracy on the same axis, letting you directly compare how the two metrics evolve together. This is the chart that most clearly illustrates why loss and accuracy behave so differently: loss (the continuous curve) decreases smoothly while accuracy (the step-function curve) jumps sharply at first and then plateaus. The divergence between these two curves is a fundamental concept in machine learning: a model can continue to improve its confidence and calibration (reducing loss) even after accuracy has stopped increasing.

## Hands-On: Running Training Iterations

### Step-by-Step Instructions

Follow these steps to perform one complete training iteration:

7.  Open the Parameters sheet. Note the current Average Loss in B12 and Accuracy in B13. Before any training, loss is 0.693 and accuracy is 38.7%. (Why 38.7% and not 50%? When all weights are zero, sigmoid(0) = 0.5 exactly, which the model rounds up to class 1 (malignant) for every sample. Since only 58 of 150 samples are actually malignant, the model is right 38.7% of the time purely by predicting malignant for everything.)

8.  Look at the red cells B22, B23, B24. These contain the NEW parameter values computed from one step of gradient descent.

9.  Select cells B22, B23, and B24. Press Ctrl+C (or Cmd+C on Mac) to copy them.

10. Click on cell B4. Right-click and choose "Paste Special," then select "Values Only." (On Windows you can press Ctrl+Alt+V and then choose Values; on Mac press Cmd+Ctrl+V.) This replaces the old parameters with the new ones. It is important to paste values, not formulas, because pasting the formulas would create a circular reference.

11. The spreadsheet recalculates. Check B12: the loss should be lower. Check B13: the accuracy should be higher (or at least the same).

12. Optionally, go to the Iteration Log sheet to record your progress. The log is pre-filled for iterations 0 through 100 from a simulation run, so if you are continuing beyond iteration 100, find the first empty row (row 107 onward) and enter your current iteration number along with the loss, accuracy, w1, w2, and bias values from the Parameters sheet. If you want to start fresh from iteration 0, clear the pre-filled rows and enter your own values as you train.

13. Return to the Parameters sheet and repeat from step 2. Each cycle is one training iteration.

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

With only two features and a linear decision boundary, the model has limited expressive power. Some malignant and benign tumors have similar radius and texture values, making them impossible to separate with a straight line. This is not a failure of the model; it is a reflection of the data. To achieve higher accuracy, you would need more features, a more complex model (like a neural network), or both.

> *This limitation is actually the key insight that motivates deep learning: by stacking many logistic regression units in layers (creating a neural network), you can learn curved, complex decision boundaries that separate data that a single straight line cannot.*

## The Bigger Picture: From Here to Neural Networks

Everything you have learned in this tutorial is the foundation of modern AI systems. Here is how the concepts scale up:

- **One neuron is logistic regression:** The model you built (weighted sum, then sigmoid) is exactly one neuron. A neural network is many of these neurons connected in layers.

- **More features:** Real models might have hundreds or thousands of input features instead of just two. The math is the same; there are just more weights to learn.

- **Hidden layers:** Instead of going directly from inputs to output, neural networks pass data through intermediate layers of neurons. Each layer learns increasingly abstract patterns.

- **Automatic training:** In practice, a computer performs the copy-paste-update loop millions of times per second using GPUs. The same gradient descent algorithm you did by hand runs at enormous scale.

- **Backpropagation:** In multi-layer networks, gradients are computed using a technique called backpropagation, which is an extension of the same chain-rule logic used here.

- **Different loss functions:** For tasks with more than two categories, cross-entropy generalizes to multiple classes. For regression tasks (predicting a continuous number), other loss functions like mean squared error are used.

The conceptual core is always the same: start with adjustable parameters, compute predictions, measure loss, compute gradients, and update parameters to reduce loss. You now understand this core.

## Key Takeaways

After working through this tutorial, here are the essential ideas:

- A machine learning model is a function with adjustable parameters. Our model had just three parameters (w1, w2, b), yet it learned to classify tumors with 90% accuracy.

- The sigmoid function converts a raw score into a probability. It is smooth, differentiable, and bounded between 0 and 1, which makes it ideal for classification.

- The loss function measures prediction quality. Binary cross-entropy harshly penalizes confident wrong predictions, providing a strong learning signal.

- Gradients point in the direction of steepest loss increase. By moving opposite the gradient, we decrease the loss.

- Gradient descent is iterative. Each iteration improves the parameters a little. Over many iterations, the model converges to a good solution.

- The learning rate controls the trade-off between speed and stability. Too large causes overshooting; too small causes slow convergence.

- Feature normalization ensures all features contribute equally to learning and prevents the gradient from being dominated by one feature.

- This simple model is the building block of neural networks. Everything in deep learning builds on the concepts you have just learned.

**Congratulations on completing this tutorial. You now have a working understanding of the fundamental mechanism behind how machines learn from data. Every time you hear about AI "training" on data, you know exactly what that means: computing predictions, measuring errors, and adjusting parameters to do better next time.**

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
