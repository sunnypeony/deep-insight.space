---
title: "Mutual information: dependence beyond linearity"
summary: Zero correlation does not mean independence. Mutual information measures any form of statistical dependence through probability distributions. This chapter derives its three equivalent definitions and its non-negativity, shows that for Gaussians it is fully determined by the correlation coefficient, reads a confusion matrix as a joint distribution, and shows how it drives camera–LiDAR calibration.
date: 2026-10-12
topic: foundations
tags: [mutual-information, entropy, information-theory, calibration]
draft: false
series: relationship-modeling
seriesOrder: 4
---

## The question

[Chapter 1](/notes/inner-product-covariance-correlation/) showed that for $Y = X^2$ the covariance is zero although $Y$ is fully determined by $X$. We need a quantity that meets two conditions: it is zero exactly when the variables are independent, and it does not care what form the dependence takes. That quantity is mutual information.

This chapter also answers two questions left open by the series overview: how confusion matrices relate to these concepts, and how to tell apart the three levels of relationship measures, computational mechanisms and evaluation tools.

## Intuition

Before observing $X$ we are uncertain about $Y$. Observing $X$ reduces that uncertainty, and the size of the reduction is the mutual information.

- If $X$ and $Y$ are independent, knowing $X$ does not help and the mutual information is zero.
- For $Y = X^2$, knowing $X$ removes all uncertainty about $Y$, so the mutual information equals the full uncertainty of $Y$.

Another view: mutual information measures how far the joint distribution is from what it would be under independence, $p(x)\,p(y)$. Correlation looks only at the linear trend of a scatter plot; mutual information looks at the whole shape of the joint distribution.

## Formalism

### Entropy

For a discrete random variable, the entropy is

$$
H(X) = -\sum_x p(x)\log p(x),
$$

with joint entropy $H(X, Y)$ and conditional entropy $H(Y \mid X) = -\sum_{x,y} p(x,y)\log p(y \mid x)$ defined analogously. With base-2 logarithms the unit is the bit.

### Three equivalent definitions

$$
I(X;Y) = H(Y) - H(Y \mid X) = H(X) + H(Y) - H(X, Y) = \sum_{x,y} p(x,y)\,\log\frac{p(x,y)}{p(x)\,p(y)} .
$$

**First equals third.** Using $p(y) = \sum_x p(x,y)$:

$$
H(Y) - H(Y \mid X)
= -\sum_{x,y} p(x,y)\log p(y) + \sum_{x,y} p(x,y)\log p(y \mid x)
= \sum_{x,y} p(x,y)\log\frac{p(x,y)}{p(x)\,p(y)} .
$$

**First equals second.** This follows directly from the chain rule $H(X, Y) = H(X) + H(Y \mid X)$.

The third form is a Kullback–Leibler divergence,

$$
I(X;Y) = D_{\mathrm{KL}}\big(p_{XY} \,\big\|\, p_X\, p_Y\big),
$$

and it is symmetric in $X$ and $Y$.

### Non-negativity and independence

For distributions $p$ and $q$, sum over the support of $p$. Since $\log$ is concave, Jensen's inequality gives

$$
-D_{\mathrm{KL}}(p \,\|\, q) = \sum_x p(x)\log\frac{q(x)}{p(x)} \le \log\sum_x p(x)\,\frac{q(x)}{p(x)} \le \log 1 = 0 .
$$

Equality holds exactly when $q/p$ is constant on the support, that is, when $p = q$.

Hence $I(X;Y) \ge 0$, and $I(X;Y) = 0$ exactly when $p(x,y) = p(x)\,p(y)$ for all $x, y$, which is independence.

This is precisely what correlation cannot offer: zero correlation rules out only linear dependence.

### Back to Y = X²

Let $X$ be uniform on $\{-1, 0, 1\}$ and $Y = X^2$. By Chapter 1 their covariance is zero.

$Y$ is 0 with probability $1/3$ and 1 with probability $2/3$. Given $X$, $Y$ is certain, so $H(Y \mid X) = 0$ and

$$
I(X;Y) = H(Y) = -\tfrac13\log_2\tfrac13 - \tfrac23\log_2\tfrac23 \approx 0.918\ \text{bit}.
$$

### The Gaussian case: the bridge between correlation and information

For continuous variables, sums become integrals and entropy becomes differential entropy $h$; the definition of mutual information keeps the same form. Unlike differential entropy itself, mutual information stays non-negative.

It is also invariant under separate invertible transformations of the two variables, $I(f(X); g(Y)) = I(X;Y)$. Correlation, by comparison, is invariant only under affine maps.

A $d$-dimensional Gaussian $\mathcal{N}(\mu, \Sigma)$ has differential entropy $h = \frac12\log\big((2\pi e)^d \det\Sigma\big)$.

For a bivariate Gaussian $(X, Y)$ with standard deviations $\sigma_X, \sigma_Y$ and correlation $\rho$, $\det\Sigma = \sigma_X^2\sigma_Y^2(1 - \rho^2)$. Substituting:

$$
\begin{aligned}
I(X;Y) &= h(X) + h(Y) - h(X, Y) \\
&= \tfrac12\log(2\pi e\,\sigma_X^2) + \tfrac12\log(2\pi e\,\sigma_Y^2) - \tfrac12\log\!\big((2\pi e)^2\sigma_X^2\sigma_Y^2(1 - \rho^2)\big) \\
&= -\tfrac12\log(1 - \rho^2) .
\end{aligned}
$$

Three consequences follow:

- For jointly Gaussian variables, mutual information is a monotone function of $|\rho|$ alone; the correlation coefficient already carries all the dependence.
- $\rho = 0 \iff I = 0 \iff$ independence. This is the special case in which zero correlation does imply independence.
- As $|\rho| \to 1$, $I \to \infty$. A deterministic relationship between continuous variables carries infinite information; the finite values seen in practice come from discretization or finite samples.

### A confusion matrix is a joint distribution table

With $c$ classes and $N$ samples, let $N_{ij}$ count samples with true label $i$ and predicted label $j$, and set $\hat{p}(i, j) = N_{ij}/N$.

The result is the empirical joint distribution of $(Y, \hat{Y})$: row sums give the true class distribution and column sums the predicted one. Then

$$
\hat{I}(Y;\hat{Y}) = \sum_{i,j}\hat{p}(i,j)\,\log\frac{\hat{p}(i,j)}{\hat{p}(i,\cdot)\,\hat{p}(\cdot,j)}, \qquad
\mathrm{Acc} = \sum_i \hat{p}(i,i).
$$

Two binary examples, each with 50 samples per class, so $H(Y) = 1$ bit:

| Confusion matrix | Accuracy | $\hat{I}(Y;\hat{Y})$ |
|---|---|---|
| $\begin{pmatrix}40 & 10\\ 5 & 45\end{pmatrix}$ | 0.85 | ≈ 0.397 bit |
| $\begin{pmatrix}0 & 50\\ 50 & 0\end{pmatrix}$ | 0 | 1 bit |

The second classifier swaps every label. Its accuracy is zero, yet its mutual information reaches the maximum $H(Y)$.

The reason is that mutual information measures how much the prediction tells us about the truth, not whether the prediction is correct, and swapping labels loses no information. This is why mutual information cannot replace accuracy, precision or recall as an evaluation metric, and it motivates the level distinction below.

### Three levels

| Level | Concepts | Question answered |
|---|---|---|
| Relationship measure | Covariance, correlation, mutual information | How much linear or general dependence exists between two quantities? |
| Computational mechanism | Cross-correlation, convolution, attention | How does a model compute and use that relationship? |
| Evaluation tool | Confusion matrix | What does the joint distribution of prediction and truth look like? |

A tool at one level can be read in the language of another, as when mutual information is computed from a confusion matrix. That does not make them the same kind of object.

The thread of this series connects them: from "do two vectors look alike?" (the inner product) to "how much statistical dependence do two random variables share?" (mutual information).

## In robotics

### Camera–LiDAR extrinsic calibration

The goal is to recover the LiDAR-to-camera extrinsics $(R, t)$ without a calibration target. Pandey et al. (2012) proceed as follows.

For a candidate $(R, t)$, project every LiDAR point $p_i$ into the image with the camera intrinsics $K$, at pixel $\pi\big(K(Rp_i + t)\big)$. Collect pairs $(r_i, g_i)$ of the point's reflectivity and the gray value at its projection. Estimate the joint distribution of $(r, g)$ with a histogram or kernel density, compute the mutual information $I_{R,t}(r; g)$, and solve

$$
(R^\ast, t^\ast) = \arg\max_{R,\,t}\; I_{R,t}(r;\, g) .
$$

Why does this work? With the correct extrinsics, each pair comes from the same physical surface point, so reflectivity and brightness are statistically dependent. With wrong extrinsics, pairs come from mismatched surfaces and are closer to independent.

Why not correlation? The relationship between reflectivity and gray value changes with material and lighting; it need not be linear or even monotonic. Mutual information requires only that some dependence exists, not a particular functional form.

The same idea appeared earlier in multimodal medical image registration, such as CT to MR, in the work of Viola and Wells (1997) and Maes et al. (1997).

### Practical caveats in estimation

- **Histogram (plug-in) estimators** depend on the number of bins and are biased upward for small samples; truly independent variables still give a positive estimate. The $k$-nearest-neighbour KSG estimator (Kraskov et al., 2004) is a common alternative.
- **Optimization**: as a function of $(R, t)$, the mutual-information objective is non-convex, so a reasonable initial guess is needed, for example from a CAD model or hand measurement.

## Experiment

The script below checks three things in turn: histogram estimates against the Gaussian formula; the $Y = X^2$ case; and mutual information computed from a confusion matrix.

```python
import numpy as np

rng = np.random.default_rng(0)

def mi_from_joint(P):
    """Mutual information in bits from an (unnormalized) joint count or probability table."""
    P = P / P.sum()
    px = P.sum(axis=1, keepdims=True)
    py = P.sum(axis=0, keepdims=True)
    nz = P > 0
    return float((P[nz] * np.log2(P[nz] / (px @ py)[nz])).sum())

def mi_hist(x, y, bins=32):
    H, _, _ = np.histogram2d(x, y, bins=bins)
    return mi_from_joint(H)

# 1. Gaussian: histogram estimate vs -0.5*log2(1 - rho^2)
n = 200_000
for rho in [0.0, 0.5, 0.9]:
    x = rng.standard_normal(n)
    y = rho * x + np.sqrt(1 - rho**2) * rng.standard_normal(n)
    print(rho, round(mi_hist(x, y), 3), round(-0.5 * np.log2(1 - rho**2), 3))
# estimates sit slightly above the theory (0, 0.208, 1.198); even rho = 0 gives a small positive value

# 2. Y = X^2: correlation near 0, large mutual-information estimate
x = rng.uniform(-1, 1, n)
print(np.corrcoef(x, x**2)[0, 1].round(3), round(mi_hist(x, x**2), 3))
# the true value is infinite; the estimate grows with the number of bins

# 3. confusion matrices
C = np.array([[40, 10], [5, 45]])
print(round(mi_from_joint(C), 3), np.trace(C) / C.sum())   # about 0.397, 0.85
S = np.array([[0, 50], [50, 0]])
print(round(mi_from_joint(S), 3), np.trace(S) / S.sum())   # 1.0, 0.0
```

## References

1. Shannon, C. E. (1948). A mathematical theory of communication. *Bell System Technical Journal*, 27(3), 379–423; 27(4), 623–656.
2. Cover, T. M., & Thomas, J. A. (2006). *Elements of Information Theory* (2nd ed.). Wiley.
3. Viola, P., & Wells, W. M. (1997). Alignment by maximization of mutual information. *International Journal of Computer Vision*, 24(2), 137–154.
4. Maes, F., Collignon, A., Vandermeulen, D., Marchal, G., & Suetens, P. (1997). Multimodality image registration by maximization of mutual information. *IEEE Transactions on Medical Imaging*, 16(2), 187–198.
5. Pandey, G., McBride, J. R., Savarese, S., & Eustice, R. M. (2012). Automatic targetless extrinsic calibration of a 3D lidar and camera by maximizing mutual information. *AAAI Conference on Artificial Intelligence*.
6. Kraskov, A., Stögbauer, H., & Grassberger, P. (2004). Estimating mutual information. *Physical Review E*, 69(6), 066138.
7. StatQuest (YouTube channel): introductory videos on entropy and mutual information. https://www.youtube.com/@statquest
