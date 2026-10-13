---
title: Inner products, covariance and correlation
summary: Starting from the inner product, centering gives covariance and normalizing gives correlation; the correlation coefficient is the cosine of the angle between the centered vectors. This chapter derives the chain in full and shows where these quantities appear in state estimation and point-cloud processing.
date: 2026-10-12
topic: foundations
tags: [inner-product, covariance, correlation, statistics]
draft: false
series: relationship-modeling
seriesOrder: 1
---

## The question

Given two vectors, or two random variables, how do we summarize with a single number how strongly they are related?

Every later idea in this series builds on the answer. Cross-correlation evaluates it at every shift, attention evaluates it for every pair of tokens, and mutual information extends it beyond linear relationships.

This chapter makes the relationship between three basic quantities precise: the inner product, covariance and the correlation coefficient. It then settles a common misconception, namely that zero correlation means "unrelated".

## Intuition

Multiply two vectors component by component and add up the products. Three things can happen:

- If matching components share a sign and are large, the products are large and positive, and so is the sum.
- If the signs are mixed, positive and negative terms cancel and the sum is near zero.
- If the signs are systematically opposite, the sum is negative.

The inner product therefore measures how well two patterns line up.

It has two defects.

First, it reacts to offsets. Add 100 to two unrelated columns of numbers and their inner product becomes large.

Second, it reacts to scale. Switch from meters to millimeters and it grows by a factor of 1000.

Covariance fixes the first defect by subtracting each mean, so that only the deviations from the typical value are compared. Correlation fixes the second by dividing by each standard deviation, which leaves only directional information.

Geometrically the three steps are: inner product, inner product after moving the cloud to the origin, and cosine of the angle after moving it to the origin.

## Formalism

### Inner product, norm and cosine

For $x, y \in \mathbb{R}^n$:

$$
\langle x, y\rangle = x^\top y = \sum_{i=1}^n x_i y_i, \qquad \|x\| = \sqrt{\langle x, x\rangle}.
$$

The cosine similarity is

$$
\cos\theta = \frac{x^\top y}{\|x\|\,\|y\|}.
$$

The Cauchy–Schwarz inequality is what guarantees that this lies in $[-1, 1]$.

### The Cauchy–Schwarz inequality

Let $y \neq 0$. For every real $t$,

$$
0 \le \|x - t y\|^2 = \|x\|^2 - 2t\,\langle x, y\rangle + t^2\|y\|^2 .
$$

The right-hand side is a quadratic in $t$ that is never negative, so its discriminant cannot be positive:

$$
4\langle x, y\rangle^2 - 4\|x\|^2\|y\|^2 \le 0
\;\Longrightarrow\;
|\langle x, y\rangle| \le \|x\|\,\|y\| .
$$

Equality holds exactly when $x = t y$ for some $t$, that is, when the vectors are collinear.

The proof uses only three properties of the inner product: bilinearity, symmetry and positive definiteness. It therefore holds for any inner product, which we need immediately.

### Covariance is an inner product on random variables

For random variables $U, V$ with finite variance, define $\langle U, V\rangle = \mathbb{E}[UV]$. It is bilinear and symmetric, and $\mathbb{E}[U^2] \ge 0$ with equality only when $U = 0$ almost surely. So it is an inner product.

Covariance is this inner product applied to centered variables:

$$
\mathrm{Cov}(X, Y) = \mathbb{E}\big[(X - \mu_X)(Y - \mu_Y)\big] = \langle X - \mu_X,\; Y - \mu_Y \rangle .
$$

Expanding gives the familiar form $\mathrm{Cov}(X, Y) = \mathbb{E}[XY] - \mu_X \mu_Y$. Under this inner product:

- the variance is the squared norm of the centered variable, $\mathrm{Var}(X) = \|X - \mu_X\|^2$;
- the standard deviation $\sigma_X$ is that norm.

For $n$ samples with mean $\bar{x}$, write the centered vector as $\tilde{x} = x - \bar{x}\mathbf{1}$, and $\tilde{y}$ likewise. Then

$$
\widehat{\mathrm{Cov}}(x, y) = \frac{1}{n-1}\,\tilde{x}^\top \tilde{y},
$$

so the sample covariance is the inner product of the centered vectors, up to a constant.

Bilinearity also gives $\mathrm{Cov}(aX + b,\; cY + d) = ac\,\mathrm{Cov}(X, Y)$. Covariance ignores shifts but scales with units.

### Correlation is the cosine of the centered vectors

The Pearson correlation coefficient is

$$
\rho_{XY} = \frac{\mathrm{Cov}(X, Y)}{\sigma_X\,\sigma_Y}
= \frac{\langle X - \mu_X,\; Y - \mu_Y\rangle}{\|X - \mu_X\|\,\|Y - \mu_Y\|},
$$

which is exactly the cosine of the angle between the centered variables. In the sample version the factor $\frac{1}{n-1}$ cancels:

$$
r = \frac{\tilde{x}^\top \tilde{y}}{\|\tilde{x}\|\,\|\tilde{y}\|}.
$$

Cauchy–Schwarz gives $|\rho| \le 1$ at once. $|\rho| = 1$ exactly when $Y - \mu_Y = t\,(X - \mu_X)$ almost surely, that is, when $Y = aX + b$ with $a \neq 0$.

The scaling rule gives $\rho(aX + b,\; cY + d) = \operatorname{sign}(ac)\,\rho(X, Y)$, so units drop out entirely.

| Step | Expression | Geometric meaning |
|---|---|---|
| Inner product | $x^\top y$ | Raw alignment |
| Center → covariance | $\frac{1}{n-1}\tilde{x}^\top \tilde{y}$ | Alignment after moving to the mean |
| Normalize → correlation | $\tilde{x}^\top \tilde{y} \,/\, (\lVert\tilde{x}\rVert\,\lVert\tilde{y}\rVert)$ | Cosine of the angle after moving to the mean |

### The covariance matrix

For a random vector $\mathbf{x} \in \mathbb{R}^d$, the covariance matrix is $\Sigma = \mathbb{E}\big[(\mathbf{x} - \mu)(\mathbf{x} - \mu)^\top\big]$, with $\Sigma_{ij} = \mathrm{Cov}(x_i, x_j)$. Two properties are used below.

**Linear maps.** For $\mathbf{y} = A\mathbf{x} + b$,

$$
\mathrm{Cov}(A\mathbf{x} + b) = \mathbb{E}\big[A(\mathbf{x} - \mu)(\mathbf{x} - \mu)^\top A^\top\big] = A\,\Sigma\,A^\top .
$$

**Positive semidefiniteness.** For every $v$, $v^\top \Sigma v = \mathrm{Var}(v^\top \mathbf{x}) \ge 0$. Hence $\Sigma = U \Lambda U^\top$ with orthonormal $U$: the eigenvectors are the principal directions of spread, and the eigenvalues are the variances along them.

### Zero correlation is not independence

Let $X$ be symmetric about zero, so that $\mathbb{E}[X] = 0$ and $\mathbb{E}[X^3] = 0$, and set $Y = X^2$. Then

$$
\mathrm{Cov}(X, X^2) = \mathbb{E}[X^3] - \mathbb{E}[X]\,\mathbb{E}[X^2] = 0 .
$$

The covariance is exactly zero, yet $Y$ is a deterministic function of $X$.

The reason is that covariance only sees co-variation along a linear trend. For positive and negative $X$, $Y$ moves in opposite directions relative to $X$, and the two halves cancel.

Zero correlation implies independence only in special cases, such as jointly Gaussian variables. Measuring general dependence requires [mutual information](/notes/mutual-information/), the subject of Chapter 4.

## In robotics

### Propagating uncertainty in state estimation

The motion model of an extended Kalman filter (EKF) is $\mathbf{x}_k = f(\mathbf{x}_{k-1}, \mathbf{u}_k) + \mathbf{w}_k$ with $\mathbf{w}_k \sim \mathcal{N}(0, Q)$. Linearizing at the current estimate gives the Jacobian $F = \partial f / \partial \mathbf{x}$, and the linear-map rule above yields the prediction step

$$
P_{k\mid k-1} = F\,P_{k-1\mid k-1}\,F^\top + Q .
$$

In SLAM, covariances describe the uncertainty of poses and landmarks. In ROS 2, `geometry_msgs/msg/PoseWithCovariance` (the type of the `pose` field in `nav_msgs/msg/Odometry`) carries a $6 \times 6$ covariance stored row-major as 36 numbers.

Data association commonly gates candidate matches with the Mahalanobis distance

$$
d^2 = (\mathbf{z} - \hat{\mathbf{z}})^\top S^{-1} (\mathbf{z} - \hat{\mathbf{z}}),
$$

where $S$ is the innovation covariance. With the Cholesky factorization $S = LL^\top$, $d^2 = \|L^{-1}(\mathbf{z} - \hat{\mathbf{z}})\|^2$. The Mahalanobis distance is therefore the Euclidean distance after the covariance has been whitened away.

Under a Gaussian model, $d^2$ follows a $\chi^2$ distribution with as many degrees of freedom as the measurement has dimensions, so the gate threshold comes straight from a table.

### Estimating point-cloud normals

Take the $k$ nearest neighbours $p_1, \dots, p_k$ of a point, with mean $\bar{p}$. Fit a plane through $\bar{p}$ that minimizes the sum of squared point-to-plane distances:

$$
\min_{\|n\| = 1}\; \sum_{i=1}^k \big(n^\top (p_i - \bar{p})\big)^2
= \min_{\|n\| = 1}\; n^\top C\, n,
\qquad
C = \sum_{i=1}^k (p_i - \bar{p})(p_i - \bar{p})^\top .
$$

$C$ is $k - 1$ times the sample covariance. Setting the gradient of the Lagrangian $n^\top C n - \lambda(n^\top n - 1)$ to zero gives $C n = \lambda n$, and at such a point the objective equals $\lambda$.

The normal is therefore the eigenvector of the smallest eigenvalue. The share of that eigenvalue in the sum of all three is a common flatness measure.

This is the method of Hoppe et al. (1992), and it underlies normal estimation in PCL and Open3D. Ground segmentation and plane fitting on drone LiDAR scans rely on it.

## Experiment

The script below checks four things in turn: correlation equals the cosine of the centered vectors; covariance depends on units while correlation does not; the $Y = X^2$ case; and the plane normal recovered as the smallest eigenvector.

```python
import numpy as np

rng = np.random.default_rng(0)

# 1. correlation = cosine of the centered vectors
x = rng.standard_normal(1000)
y = 2.0 * x + rng.standard_normal(1000)
xc, yc = x - x.mean(), y - y.mean()
cos_centered = xc @ yc / (np.linalg.norm(xc) * np.linalg.norm(yc))
print(cos_centered, np.corrcoef(x, y)[0, 1])          # identical

# 2. change of units: covariance grows 1000x, correlation does not
print(np.cov(x, y)[0, 1], np.cov(1000 * x, y)[0, 1])
print(np.corrcoef(1000 * x, y)[0, 1])

# 3. Y = X^2: fully dependent, correlation close to 0
u = rng.uniform(-1, 1, 100_000)
print(np.corrcoef(u, u**2)[0, 1])

# 4. plane normal = eigenvector of the smallest covariance eigenvalue
n_true = np.array([1.0, 2.0, 2.0]) / 3.0
_, _, Vt = np.linalg.svd(n_true[None, :])               # Vt[1:] spans the plane
coeffs = rng.uniform(-1, 1, (500, 2))
noise = 0.01 * rng.standard_normal((500, 1))
P = coeffs @ Vt[1:] + noise * n_true
evals, evecs = np.linalg.eigh(np.cov(P.T))              # ascending eigenvalues
print(evals, abs(evecs[:, 0] @ n_true))                 # last value close to 1
```

## References

1. Hoppe, H., DeRose, T., Duchamp, T., McDonald, J., & Stuetzle, W. (1992). Surface reconstruction from unorganized points. *Proceedings of SIGGRAPH '92*, 71–78.
2. Thrun, S., Burgard, W., & Fox, D. (2005). *Probabilistic Robotics*. MIT Press.
3. Wasserman, L. (2004). *All of Statistics*. Springer.
4. Strang, G. (2016). *Introduction to Linear Algebra* (5th ed.). Wellesley-Cambridge Press.
5. StatQuest (YouTube channel): introductory videos on covariance and correlation. https://www.youtube.com/@statquest
