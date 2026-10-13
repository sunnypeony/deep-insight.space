---
title: "Measuring Relationships: From Inner Products to Attention"
summary: Covariance, correlation, cross-correlation, convolution, attention and mutual information all answer one question, namely how strongly two things are related. This series derives them along a single line of reasoning and shows which parts of CNNs and Transformers that line explains, and which it does not.
topic: foundations
date: 2026-10-12
draft: false
---

## What this series covers

Covariance, correlation, cross-correlation, convolution, attention and mutual information are usually taught in separate courses: statistics, signal processing, deep learning and information theory. They share a common structure. Each one places two objects side by side, produces a number that measures how strongly they are related, and then uses that number in further computation.

The most basic form of this structure is the inner product:

$$
\langle x, y \rangle = \sum_i x_i y_i
$$

The better two vectors match, the larger their inner product. Every other concept in the series can be read as the inner product with one more operation added: centering, normalization, shifting, generating the compared vectors from the input, and finally dropping the linearity assumption.

Following this line leads to a fairly precise claim:

> One core mechanism of modern representation learning is to compare representations, measure how they relate, and select and aggregate information according to the strength of those relations, which produces a new representation. CNNs and Transformers are two structured implementations of this mechanism.

They differ in *what is compared with what*. A CNN takes a bank of shared, learned local templates and computes their inner product with the local neighborhood at every position. A Transformer generates queries and keys from the input itself, scores every pair of positions, and takes a weighted sum of the values according to those scores.

The series also states the limits of this view, in two places.

First, it describes *what* the two architectures compute, not *why* they work. Inductive bias, the trainability that comes from residual connections and normalization, and the scale of data and compute matter just as much. Chapter 3 takes this up.

Second, these concepts sit at different levels. Covariance, correlation and mutual information are **measures** of a relationship. Cross-correlation, convolution and attention are **computational mechanisms** that use one. A confusion matrix is an **evaluation tool**. Chapter 4 derives the exact link between confusion matrices and mutual information, but that link does not put the three levels on equal footing.

Each chapter ends in a concrete robotics or vision use: covariance matrices in SLAM, normalized cross-correlation in stereo matching, attention in learned feature matchers, and mutual information in camera–LiDAR extrinsic calibration.

## How the chapters connect

Each chapter adds exactly one operation to the previous one:

1. [Inner products, covariance and correlation](/notes/inner-product-covariance-correlation/): start from the inner product, center it to get covariance, then normalize it to get correlation. The correlation coefficient is the cosine of the angle between the two centered vectors.
2. [Cross-correlation and convolution](/notes/cross-correlation-and-convolution/): add a shift and take an inner product at every offset. Normalized cross-correlation (NCC) is the correlation coefficient computed over a window; convolution differs from cross-correlation only by flipping the kernel.
3. [From convolution to attention](/notes/from-convolution-to-attention/): replace the fixed template with queries and keys generated from the input. The comparison changes from "template against a local patch" to "any position against any other", and softmax weights then aggregate the values.
4. [Mutual information](/notes/mutual-information/): drop the linearity assumption and measure any form of statistical dependence through probability distributions. For Gaussian variables, mutual information is fully determined by the correlation coefficient, and a confusion matrix can be read as a joint distribution table.

The whole chain in one line:

$$
\text{inner product} \;\rightarrow\; \text{center / normalize} \;\rightarrow\; \text{shift} \;\rightarrow\; \text{input-dependent comparison} \;\rightarrow\; \text{beyond linearity}
$$

Chapters 1 and 2 need no deep learning background. Chapter 3 builds on both. Chapter 4 depends mainly on Chapter 1 and can be read right after it.

## Before you start

- **Linear algebra**: inner products, norms, matrix multiplication. Chapter 1 uses the Cauchy–Schwarz inequality and proves it.
- **Probability**: expectation, variance, joint and marginal distributions, independence.
- **Deep learning** (Chapter 3 only): a basic idea of fully connected layers and backpropagation is enough. No prior knowledge of CNN or Transformer internals is assumed.
- **Information theory** (Chapter 4 only): no background needed; entropy is defined from scratch.
- **Code**: examples use Python and NumPy; Chapter 2 also uses SciPy and OpenCV.
