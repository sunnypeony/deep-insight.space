---
title: "Cross-correlation and convolution: the sliding inner product"
summary: Adding a shift to the inner product gives cross-correlation; flipping the kernel gives convolution. This chapter derives how the two relate, why linear time-invariant systems are exactly convolutions, and why normalized cross-correlation is the correlation coefficient over a window, with uses in template matching and stereo.
date: 2026-10-12
topic: foundations
tags: [cross-correlation, convolution, template-matching, stereo]
draft: false
series: relationship-modeling
seriesOrder: 2
---

## The question

Two signals have the same shape but are offset. How do we find the offset? More generally, how do we find where a given pattern occurs in an image?

The inner product of [Chapter 1](/notes/inner-product-covariance-correlation/) only compares vectors that are already aligned. This chapter adds a single operation, the shift, which gives cross-correlation. It then shows that convolution differs from cross-correlation only by a flip, and explains why the "convolution" in a CNN actually computes cross-correlation.

## Intuition

Slide a short template along a long signal. At each offset, take the inner product of the template with the stretch it covers. The result is a curve of match quality against position, and its peak marks the best alignment. In two dimensions the template moves pixel by pixel over the image and produces a response map.

Convolution computes almost the same thing, except that the template is flipped before sliding: reversed in 1D, rotated by 180° in 2D. The flip comes from what convolution means in systems theory. Convolution describes how the responses left behind by every past input impulse add up, and those responses run backwards in time relative to the input.

Plain cross-correlation has one flaw: bright regions produce large sums whatever their shape. Centering and normalizing both the template and the window removes the flaw, and the quantity that results is exactly the correlation coefficient from Chapter 1.

## Formalism

### Definitions

For real discrete signals $f, g$, define

$$
(f \star g)[n] = \sum_m f[m]\, g[m+n], \qquad (f \ast g)[n] = \sum_m f[m]\, g[n-m].
$$

Texts differ in where they put the shift; the conventions differ only in the sign of $n$.

Let $\bar{f}[m] = f[-m]$ be the flipped signal. Then

$$
(\bar{f} \ast g)[n] = \sum_m f[-m]\, g[n-m] \overset{k = -m}{=} \sum_k f[k]\, g[n+k] = (f \star g)[n].
$$

Cross-correlating with $f$ is the same as convolving with the flipped $f$.

In two dimensions, with image $I$, kernel $K$ and indices $i, j \in \{-r, \dots, r\}$:

$$
S_\star[u, v] = \sum_{i,j} K[i,j]\; I[u+i,\, v+j], \qquad
S_\ast[u, v] = \sum_{i,j} K[i,j]\; I[u-i,\, v-j].
$$

Fix a position $(u, v)$ and let $I_{u,v}$ be the window of the same size as $K$ centered there. $S_\star[u, v]$ is the inner product of the flattened kernel and the flattened window:

$$
S_\star[u, v] = \big\langle \operatorname{vec}(K),\; \operatorname{vec}(I_{u,v}) \big\rangle .
$$

This is the sliding inner product.

### Why the flip does not matter in a CNN

The kernel of a convolutional layer is a learned parameter. Training with convolution and obtaining $K$ is equivalent to training with cross-correlation and obtaining the flipped $\bar{K}$: both describe the same function, the two parameterizations correspond one to one, and gradient descent simply learns whichever version the layer uses.

Deep learning frameworks, PyTorch's `Conv2d` for example, therefore implement cross-correlation and skip the flip. Chapter 9 of Goodfellow et al.'s *Deep Learning* says so explicitly. When later chapters say "convolutional layer", the computation is cross-correlation.

### Algebraic properties and translation equivariance

The flip buys convolution better algebra. Convolution is commutative and associative:

$$
f \ast g = g \ast f, \qquad (f \ast g) \ast h = f \ast (g \ast h).
$$

Associativity means two cascaded filters can be merged into one. Cross-correlation is not commutative; instead $(f \star g)[n] = (g \star f)[-n]$.

**LTI systems are convolutions.** Let $T$ be a linear time-invariant (LTI) system with impulse response $h = T(\delta)$. Any input decomposes into shifted impulses, $x[n] = \sum_k x[k]\,\delta[n-k]$.

- Linearity gives $T(x) = \sum_k x[k]\; T(\delta[\cdot - k])$.
- Time invariance gives $T(\delta[\cdot - k])[n] = h[n-k]$.

Together, $y = x \ast h$. Every LTI system is a convolution, and every convolution is clearly LTI.

**Translation equivariance.** With the shift operator $(\tau_s x)[n] = x[n-s]$,

$$
\big((\tau_s x) \ast h\big)[n] = \sum_m x[m-s]\; h[n-m] = (x \ast h)[n-s] = \big(\tau_s (x \ast h)\big)[n],
$$

where the middle step substitutes $m' = m - s$. Cross-correlation has the same property.

Shift the input and the output shifts by the same amount. A pattern produces the same response wherever it appears, which is where [Chapter 3](/notes/from-convolution-to-attention/) begins its discussion of the CNN's inductive bias.

**Frequency domain.** By the convolution theorem, $\mathcal{F}\{f \ast g\} = \mathcal{F}\{f\}\cdot\mathcal{F}\{g\}$. For real signals and the definition above, $\mathcal{F}\{f \star g\} = \overline{\mathcal{F}\{f\}}\cdot\mathcal{F}\{g\}$. For large templates the FFT makes matching much faster.

### Normalized cross-correlation is a windowed correlation coefficient

Let the template $T$ have $N$ pixels and let $W_{u,v}$ be the window at position $(u, v)$. The raw sum $\sum T \cdot W$ is inflated in bright regions. Removing the means and dividing by the scales gives normalized cross-correlation (NCC):

$$
\mathrm{NCC}(u, v) =
\frac{\sum_{i,j} \big(T[i,j] - \bar{T}\big)\big(W_{u,v}[i,j] - \bar{W}_{u,v}\big)}
{\sqrt{\sum_{i,j} \big(T[i,j] - \bar{T}\big)^2}\;\sqrt{\sum_{i,j} \big(W_{u,v}[i,j] - \bar{W}_{u,v}\big)^2}} .
$$

Treat the $N$ pixel pairs $(T[i,j],\, W_{u,v}[i,j])$ as $N$ paired samples, and this is precisely the sample correlation coefficient $r$ from Chapter 1. NCC inherits its properties directly:

- $\mathrm{NCC} \in [-1, 1]$, and it equals 1 exactly when $W = aT + b$ with $a > 0$.
- It is unchanged by an affine change of window brightness $W \to aW + b$ with $a > 0$, so it is robust to exposure gain and global illumination offsets.

**Relation to the sum of squared differences (SSD).** Let $\hat{t}, \hat{w}$ be the template and window vectors after centering and scaling to unit length. Then

$$
\|\hat{t} - \hat{w}\|^2 = \|\hat{t}\|^2 + \|\hat{w}\|^2 - 2\,\hat{t}^\top \hat{w} = 2 - 2\,\mathrm{NCC}.
$$

After normalization, minimizing the squared difference and maximizing the correlation are the same criterion.

## In robotics

### Template matching

When the target's appearance is known, such as a landing pad, the border of a marker board or a symbol on a charging station, NCC template matching is the most direct detector.

It is neither rotation- nor scale-invariant. In practice it needs templates at several scales and angles, or it gives way to feature-based methods.

### Stereo matching

In a rectified stereo pair, a scene point moves only horizontally along the same image row. That horizontal offset is the disparity $d$.

For a left-image pixel $(u, v)$, with $u$ the column coordinate, search along the same row of the right image:

$$
d^\ast(u, v) = \arg\max_{d \in [0,\, d_{\max}]} \;\mathrm{NCC}\big(W^{L}_{u,v},\; W^{R}_{u-d,\,v}\big),
$$

and recover depth as $Z = fB/d$, where $f$ is the focal length in pixels and $B$ the baseline.

This is the first stage in the taxonomy of Scharstein and Szeliski (2002), which splits stereo matching into four stages: matching cost computation, cost aggregation, disparity computation and disparity refinement. NCC, SAD and census are all standard matching costs. When the two cameras' exposures differ, NCC holds up better than SAD, precisely because of the affine invariance above.

Multi-view dense reconstruction, for example PatchMatch-based MVS, also commonly scores photometric consistency between neighbouring views with NCC.

## Experiment

The first script checks that cross-correlation equals convolution with the flipped kernel.

```python
import numpy as np
from scipy.signal import correlate2d, convolve2d

rng = np.random.default_rng(0)
I = rng.standard_normal((32, 32))
K = rng.standard_normal((3, 3))

corr = correlate2d(I, K, mode="valid")
conv = convolve2d(I, K[::-1, ::-1], mode="valid")   # kernel rotated by 180°
print(np.allclose(corr, conv))                       # True
```

The second script implements NCC by hand, compares it with OpenCV's `TM_CCOEFF_NORMED`, and checks invariance to an affine brightness change.

```python
import numpy as np
import cv2

rng = np.random.default_rng(0)
img = rng.random((120, 160)).astype(np.float32)
tpl = img[40:56, 70:90].copy()

def ncc_map(img, tpl):
    h, w = tpl.shape
    t = tpl - tpl.mean()
    t_norm = np.sqrt((t**2).sum())
    H, W = img.shape
    out = np.empty((H - h + 1, W - w + 1), np.float32)
    for u in range(H - h + 1):
        for v in range(W - w + 1):
            c = img[u:u + h, v:v + w]
            c = c - c.mean()
            out[u, v] = (t * c).sum() / (t_norm * np.sqrt((c**2).sum()) + 1e-12)
    return out

mine = ncc_map(img, tpl)
ref = cv2.matchTemplate(img, tpl, cv2.TM_CCOEFF_NORMED)
print(np.abs(mine - ref).max())                          # about 1e-6
print(np.unravel_index(mine.argmax(), mine.shape))       # (40, 70)

# affine brightness change of the template: same peak location and value
tpl2 = 0.5 * tpl + 0.2
res2 = cv2.matchTemplate(img, tpl2, cv2.TM_CCOEFF_NORMED)
print(np.unravel_index(res2.argmax(), res2.shape), res2.max())   # (40, 70), about 1.0
```

## References

1. Lewis, J. P. (1995). Fast normalized cross-correlation. *Vision Interface*.
2. Scharstein, D., & Szeliski, R. (2002). A taxonomy and evaluation of dense two-frame stereo correspondence algorithms. *International Journal of Computer Vision*, 47(1–3), 7–42.
3. Oppenheim, A. V., Willsky, A. S., & Nawab, S. H. (1997). *Signals and Systems* (2nd ed.). Prentice Hall.
4. Goodfellow, I., Bengio, Y., & Courville, A. (2016). *Deep Learning*, Chapter 9. MIT Press. https://www.deeplearningbook.org/
5. Szeliski, R. (2022). *Computer Vision: Algorithms and Applications* (2nd ed.). Springer.
