---
title: From convolution to attention
summary: A convolutional layer takes inner products between shared learned templates and local patches; attention takes pairwise inner products between queries and keys generated from the input, then aggregates with softmax weights. This chapter derives both, the origin of the √d scaling and permutation equivariance, and asks how much "measuring relationships" really explains about why the two architectures succeed.
date: 2026-10-12
topic: foundations
tags: [cnn, transformer, attention, deep-learning]
draft: false
series: relationship-modeling
seriesOrder: 3
---

## The question

Attention in a Transformer and convolution in a CNN look like unrelated operations. Seen through the previous two chapters, are they the same kind of thing? If so, where exactly do they differ? And how much of the two architectures' success does "measuring relationships" actually explain?

## Intuition

A convolutional layer is a bank of fixed detectors. Each filter is a small learned template that slides over the image and asks "does this look like me?" After training the templates are fixed and independent of the input, and every comparison is local.

Attention hands the template over to the input as well. Each position (token) plays three roles at once:

- its query says what it is looking for;
- its key says what it offers;
- its value carries the content that actually gets passed on.

Position $i$ compares its query with every key and pulls in values in proportion to how well they match.

In the classic sentence "The animal didn't cross the street because it was tired", the query of "it" matches the key of "animal" strongly, so information from "animal" flows into the new representation of "it".

Both operations therefore compare, score and aggregate. They differ in what is compared and over what range:

- convolution compares a fixed template with local data;
- attention compares data with data, globally.

Each attention layer effectively redraws, for the current input, a graph of who talks to whom.

## Formalism

### A convolutional layer is a bank of template matches

Let the input be $X \in \mathbb{R}^{H \times W \times C_{\text{in}}}$, and let the layer have $C_{\text{out}}$ filters of size $r \times r$. Write $x_p \in \mathbb{R}^{r^2 C_{\text{in}}}$ for the flattened patch centered at $p$. Output channel $k$ at $p$ is

$$
y_k(p) = w_k^\top x_p + b_k, \qquad k = 1, \dots, C_{\text{out}} .
$$

Each output is the inner product of a learned template $w_k$ with a local patch: the unnormalized sliding inner product of [Chapter 2](/notes/cross-correlation-and-convolution/). The layer builds in three structural assumptions: locality, weight sharing and translation equivariance.

Stacking such layers with nonlinearities in between grows the receptive field. $L$ layers of $r \times r$ filters with stride 1 see a $1 + L(r-1)$ window. Early templates act on pixels (edges); later ones act on the responses of earlier ones (parts). This is the compositional hierarchy.

### Scaled dot-product attention

Let $X \in \mathbb{R}^{n \times d_{\text{model}}}$ hold one token per row.

$$
Q = XW_Q, \quad K = XW_K, \quad V = XW_V, \qquad
W_Q, W_K \in \mathbb{R}^{d_{\text{model}} \times d_k}, \;\; W_V \in \mathbb{R}^{d_{\text{model}} \times d_v},
$$

$$
\mathrm{Attn}(X) = \operatorname{softmax}\!\Big(\frac{QK^\top}{\sqrt{d_k}}\Big)\, V ,
$$

with the softmax taken row by row. Element-wise:

$$
s_{ij} = \frac{q_i^\top k_j}{\sqrt{d_k}}, \qquad
a_{ij} = \frac{\exp(s_{ij})}{\sum_l \exp(s_{il})}, \qquad
z_i = \sum_j a_{ij}\, v_j .
$$

The score can be rewritten as $q_i^\top k_j = x_i^\top W_Q W_K^\top x_j$, a bilinear form in the matrix $M = W_Q W_K^\top$.

$M$ is in general neither symmetric nor positive semidefinite, so strictly speaking this is a learned compatibility score rather than an inner product. Its computational form and role, however, are the same as the inner-product scores of the previous chapters.

### Where √d_k comes from

As a rough model at initialization, take the components of $q$ and $k$ to be independent with mean 0 and variance 1. Each term then satisfies

$$
\mathbb{E}[q_l k_l] = \mathbb{E}[q_l]\,\mathbb{E}[k_l] = 0, \qquad
\mathrm{Var}(q_l k_l) = \mathbb{E}[q_l^2]\,\mathbb{E}[k_l^2] - 0 = 1 .
$$

The terms are independent, so their variances add:

$$
\mathbb{E}[q^\top k] = 0, \qquad \mathrm{Var}(q^\top k) = d_k .
$$

The dot product has standard deviation $\sqrt{d_k}$; dividing by $\sqrt{d_k}$ keeps the score variance at 1 regardless of dimension.

Why control the variance? Within one row, the softmax Jacobian is

$$
\frac{\partial a_i}{\partial s_j} = a_i\,(\delta_{ij} - a_j).
$$

When scores are widely spread, the softmax is nearly one-hot: one $a_i \approx 1$ and the rest $\approx 0$. Every entry of the Jacobian is then close to zero, gradients vanish and training stalls. This is the reason Vaswani et al. (2017) gave for the scaling.

### Softmax is a soft argmax

With a temperature $\tau$, consider $\operatorname{softmax}(s/\tau)$:

- as $\tau \to 0$ it becomes one-hot at the argmax, which retrieves only the best match, just like taking the peak in Chapter 2's template matching;
- as $\tau \to \infty$ it becomes a uniform average.

Attention sits in between: a differentiable, weighted retrieval that gradient descent can train.

### Attention is kernel smoothing

With $\kappa(q, k) = \exp\!\big(q^\top k / \sqrt{d_k}\big)$, the attention output reads

$$
z_i = \frac{\sum_j \kappa(q_i, k_j)\, v_j}{\sum_j \kappa(q_i, k_j)} .
$$

This has the form of the Nadaraya–Watson estimator,

$$
\hat{f}(x) = \frac{\sum_j K(x, x_j)\, y_j}{\sum_j K(x, x_j)} ,
$$

which predicts at $x$ by averaging observed values $y_j$ weighted by similarity. Attention is kernel smoothing in which the query, key and kernel are all learned; Tsai et al. (2019) work this view out in detail.

A kernel $K(x, y)$ is the most general mathematical form of similarity, which is why this series is organized around similarity measures.

### Permutation equivariance and positional encoding

Let $P$ be a permutation matrix that reorders the tokens. Then

$$
\mathrm{Attn}(PX)
= \operatorname{softmax}\!\Big(\frac{PQK^\top P^\top}{\sqrt{d_k}}\Big) PV
= P\,\operatorname{softmax}\!\Big(\frac{QK^\top}{\sqrt{d_k}}\Big) P^\top P\, V
= P\,\mathrm{Attn}(X).
$$

The middle step holds because a row-wise softmax commutes with permuting rows and columns together (each row's entries are only reordered); the last step uses $P^\top P = I$.

Attention by itself has no notion of order or spatial position, which is why a positional encoding must be added. In contrast, convolution builds in locality and translation equivariance; attention has only permutation equivariance, a much weaker inductive bias.

Cordonnier et al. (2020) proved that multi-head self-attention with $N_h$ heads and relative positional encoding can express any convolutional layer with a $\sqrt{N_h} \times \sqrt{N_h}$ kernel. In terms of expressiveness, convolution is a special case of attention: one whose weights depend only on relative position, not on content.

### Side by side

| | Convolutional layer | Self-attention |
|---|---|---|
| What is compared | Learned template vs local patch | Query vs key, both generated from the input |
| Weights depend on input | No, fixed after training | Yes, recomputed for every input |
| Interaction range | Local, grown by stacking | Global |
| Built-in assumptions | Locality, weight sharing, translation equivariance | Permutation equivariance only; position must be encoded |
| Cost for $n$ positions | Proportional to $n$ | Proportional to $n^2$ |

### How much does this explain?

Return to the claim from the series overview. "Compare, score, aggregate" accurately describes the core operator both architectures share, and it determines what kind of computation they can express. On its own it does not explain why they learn well. At least three other factors matter as much.

**Inductive bias versus data.** A CNN's assumptions match the statistics of images, so it is data-efficient. Dosovitskiy et al. (2021) report that on mid-sized datasets such as ImageNet, without strong regularization, ViT trails comparable ResNets by a few points, and matches or exceeds them only after pre-training on much larger datasets. A weak bias means the structure has to be learned from data.

**Trainability.** Deep networks train because of residual connections (He et al., 2016) and normalization (BatchNorm, LayerNorm). Every Transformer block is built around a residual path with LayerNorm; without them, deep stacks of attention are hard to optimize.

**Scale and hardware.** Attention is dominated by large matrix multiplications, which parallelize well on GPUs, so performance keeps improving with data and compute.

The intuition that "correlation is the hidden logic behind the success of CNNs and Transformers" captures the first half: what these networks compute. The second half, why they learn well, also depends on structural assumptions, optimization and scale.

## In robotics

### Vision backbones

ViTs and hybrid CNN–Transformer designs are now common backbones for detection, segmentation and depth estimation. For robots, the choice often follows the trade-off above: onboard platforms with little data and tight compute lean on the convolutional bias, while attention's global modelling pays off when data is plentiful.

### Feature matching as learned cross-correlation

SfM and visual localization need correspondences between two images. The NCC of Chapter 2 compares raw pixels inside fixed windows.

SuperGlue (Sarlin et al., 2020) refines the keypoint descriptors of both images with alternating self-attention and cross-attention. Self-attention operates within one image; in cross-attention, queries come from image A and keys and values from image B. The final assignment is solved as an optimal transport problem with Sinkhorn iterations.

LoFTR (Sun et al., 2021) drops the keypoint detector. It applies Transformer self- and cross-attention to coarse CNN feature maps and then refines the dense matches from coarse to fine. In low-texture regions it does markedly better than detector-based pipelines.

What cross-attention computes is this: for every feature in A, its similarity to every feature in B, followed by a weighted aggregation. It can be read as a global, context-dependent cross-correlation. The difference from NCC is that the compared vectors are not raw pixels but representations learned with the whole image as context, so ambiguities from repeated or weak texture can be resolved by context.

## Experiment

A single-head attention in NumPy, checking three things in turn: rows of weights sum to 1; permutation equivariance; and the $\sqrt{d_k}$ scaling keeping the score variance at 1.

```python
import numpy as np

rng = np.random.default_rng(0)

def softmax(s, axis=-1):
    s = s - s.max(axis=axis, keepdims=True)    # numerical stability
    e = np.exp(s)
    return e / e.sum(axis=axis, keepdims=True)

def attention(X, Wq, Wk, Wv):
    Q, K, V = X @ Wq, X @ Wk, X @ Wv
    A = softmax(Q @ K.T / np.sqrt(K.shape[1]))
    return A @ V, A

n, d_model, d_k = 6, 16, 8
X = rng.standard_normal((n, d_model))
Wq, Wk, Wv = (rng.standard_normal((d_model, d_k)) / np.sqrt(d_model) for _ in range(3))

Z, A = attention(X, Wq, Wk, Wv)
print(A.sum(axis=1))                         # each row sums to 1

# permutation equivariance: Attn(PX) = P Attn(X)
P = np.eye(n)[rng.permutation(n)]
Zp, _ = attention(P @ X, Wq, Wk, Wv)
print(np.allclose(Zp, P @ Z))                # True

# dot-product variance grows with d; dividing by sqrt(d) brings it to about 1
for d in [4, 64, 1024]:
    q = rng.standard_normal((10_000, d))
    k = rng.standard_normal((10_000, d))
    s = (q * k).sum(axis=1)
    print(d, s.var().round(1), (s / np.sqrt(d)).var().round(2))
```

The attention matrix can be shown as a heat map; row $i$ is the share of information token $i$ pulls from each position:

```python
import matplotlib.pyplot as plt

plt.imshow(A, cmap="viridis")
plt.xlabel("key j")
plt.ylabel("query i")
plt.colorbar(label="a_ij")
plt.show()
```

## References

1. Vaswani, A., et al. (2017). Attention is all you need. *Advances in Neural Information Processing Systems (NeurIPS)*.
2. LeCun, Y., Bottou, L., Bengio, Y., & Haffner, P. (1998). Gradient-based learning applied to document recognition. *Proceedings of the IEEE*, 86(11), 2278–2324.
3. Dosovitskiy, A., et al. (2021). An image is worth 16x16 words: Transformers for image recognition at scale. *ICLR*.
4. Cordonnier, J.-B., Loukas, A., & Jaggi, M. (2020). On the relationship between self-attention and convolutional layers. *ICLR*.
5. Tsai, Y.-H. H., Bai, S., Yamada, M., Morency, L.-P., & Salakhutdinov, R. (2019). Transformer dissection: An unified understanding for Transformer's attention via the lens of kernel. *EMNLP-IJCNLP*.
6. He, K., Zhang, X., Ren, S., & Sun, J. (2016). Deep residual learning for image recognition. *CVPR*.
7. Ba, J. L., Kiros, J. R., & Hinton, G. E. (2016). Layer normalization. arXiv:1607.06450.
8. Sarlin, P.-E., DeTone, D., Malisiewicz, T., & Rabinovich, A. (2020). SuperGlue: Learning feature matching with graph neural networks. *CVPR*.
9. Sun, J., Shen, Z., Wang, Y., Bao, H., & Zhou, X. (2021). LoFTR: Detector-free local feature matching with transformers. *CVPR*.
10. Nadaraya, E. A. (1964). On estimating regression. *Theory of Probability & Its Applications*, 9(1); Watson, G. S. (1964). Smooth regression analysis. *Sankhyā, Series A*, 26(4).
11. Alammar, J. (2018). The Illustrated Transformer. https://jalammar.github.io/illustrated-transformer/
12. 3Blue1Brown. Neural networks (video series, including the chapters on Transformers and attention). https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi
