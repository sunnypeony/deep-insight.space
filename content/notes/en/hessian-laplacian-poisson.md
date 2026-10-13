---
title: Hessian, Laplacian and Poisson reconstruction
summary: Taking the Jacobian of the gradient gives the Hessian, and its trace gives the Laplacian. This chapter derives the second-order Taylor expansion, the link between the Laplacian and neighbourhood averages, and the second-order identities, then derives the Poisson surface reconstruction equation from a least-squares energy and shows where the Gauss–Newton approximation of the Hessian comes from.
date: 2026-10-12
topic: foundations
tags: [hessian, laplacian, poisson-reconstruction, vector-calculus]
draft: false
series: local-derivatives
seriesOrder: 3
---

## The question

What do we get by differentiating a field a second time? And why does the Laplacian show up in image edge detection, in diffusion equations and in point-cloud surface reconstruction alike?

[Chapter 1](/notes/jacobian-and-gradient/) established that the derivative is a local linear map, and [Chapter 2](/notes/divergence-and-curl/) that divergence and curl are information extracted from the Jacobian. This chapter applies the same idea at second order: the Hessian is the complete second-order information, and the Laplacian is one number extracted from it.

## Intuition

The gradient says which way a scalar field tilts at a point, and how steeply. The Hessian says how that tilt itself changes: the local bending, whether the point sits like the bottom of a bowl, the top of a hill or the middle of a saddle.

The Laplacian adds up the bending over all directions and keeps one number. It has a more direct meaning: **the difference between the value at a point and the average over its neighbourhood.** A positive Laplacian means the neighbours are higher on average, so the centre sits in a dip; a negative one means the centre sits on a bump.

That meaning explains its many uses:

- in diffusion, points below their neighbours rise and points above them fall, so an image is smoothed;
- in edge detection, the second derivative changes sign where brightness changes sharply;
- in surface reconstruction, solving "the Laplacian equals a given function" stitches local gradient information into one global function.

## Formalism

### The Hessian is the Jacobian of the gradient

For a scalar field $f$, the Hessian is the Jacobian of its gradient field:

$$
H_f = J_{\nabla f}, \qquad (H_f)_{ij} = \frac{\partial^2 f}{\partial x_j\,\partial x_i} .
$$

When $f$ is twice continuously differentiable, mixed partials commute and $H_f$ is symmetric.

The second-order Taylor expansion shows what it means:

$$
f(\mathbf{x} + \mathbf{h}) = f(\mathbf{x}) + \nabla f(\mathbf{x})^\top \mathbf{h} + \tfrac12\,\mathbf{h}^\top H_f(\mathbf{x})\,\mathbf{h} + o(\|\mathbf{h}\|^2) .
$$

For a unit direction $\mathbf{u}$, $\mathbf{u}^\top H_f \mathbf{u}$ is the second derivative along that direction. Because $H_f$ is symmetric it can be orthogonally diagonalized; its eigenvectors are the principal directions of curvature and its eigenvalues the second derivatives along them.

At a stationary point ($\nabla f = 0$) the second-order term decides the local shape:

- $H_f$ positive definite, i.e. all eigenvalues positive: strict local minimum;
- negative definite: strict local maximum;
- indefinite, with eigenvalues of both signs: saddle point;
- semidefinite (some zero eigenvalue): second-order information alone usually cannot decide.

### The Laplacian is the trace of the Hessian

$$
\Delta f = \nabla\cdot(\nabla f) = f_{xx} + f_{yy} + f_{zz} = \operatorname{tr} H_f .
$$

This parallels "divergence is the trace of the Jacobian" exactly: divergence takes the trace of the Jacobian, the Laplacian takes the trace of the Hessian.

**The Laplacian is isotropic.** Rotate coordinates as $\mathbf{x} = R\mathbf{y}$ with a rotation matrix $R$. By the chain rule the Hessian in the new coordinates is $R^\top H_f R$, and the trace is invariant under this similarity:

$$
\operatorname{tr}(R^\top H_f R) = \operatorname{tr}(H_f R R^\top) = \operatorname{tr} H_f .
$$

The Laplacian does not depend on the orientation of the axes. This is one reason edge detectors favour it: it treats edges in every direction the same way.

The price is that all directional information is lost. For example $g = x^2 - y^2$ has Hessian $\operatorname{diag}(2, -2)$, which is not zero, yet $\Delta g = 0$. A zero Laplacian only says the bending in different directions cancels in the trace, not that the function is flat.

### The Laplacian and neighbourhood averages

On a 2D grid with spacing $h$, Taylor-expand in $x$:

$$
f(x \pm h, y) = f \pm h f_x + \tfrac{h^2}{2} f_{xx} \pm \tfrac{h^3}{6} f_{xxx} + O(h^4) .
$$

Adding the two cancels the odd-order terms:

$$
\frac{f(x + h, y) + f(x - h, y) - 2f(x, y)}{h^2} = f_{xx} + O(h^2) .
$$

Doing the same in $y$ and adding gives the five-point stencil:

$$
\Delta f(x, y) \approx \frac{f(x+h, y) + f(x-h, y) + f(x, y+h) + f(x, y-h) - 4f(x, y)}{h^2}
= \frac{4}{h^2}\big(\bar{f}_{\text{neighbours}} - f(x, y)\big) .
$$

"The sum of the four neighbours minus four times the centre" is $4/h^2$ times "the neighbour average minus the centre".

**Why diffusion smooths.** The heat equation $\partial_t f = \kappa\,\Delta f$ with $\kappa > 0$ raises points below their neighbourhood average and lowers points above it. With explicit Euler time stepping, one update reads

$$
f \leftarrow f + \frac{\kappa\,\Delta t}{h^2}\big(\textstyle\sum \text{neighbours} - 4f\big) .
$$

Choosing $\kappa\,\Delta t / h^2 = 1/4$ reduces the right-hand side to $\frac14\sum\text{neighbours}$: each step replaces the centre with the average of its four neighbours. In 2D, $1/4$ is also the stability limit of the explicit scheme.

The distinction matters: the Laplacian operator does not blur an image by itself; the diffusion it drives does.

### Second-order identities

Define the row-wise divergence of a matrix field $S$ as $(\operatorname{Div} S)_i = \sum_j \partial_j S_{ij}$, and the component-wise Laplacian of a vector field as $\Delta\mathbf{F} = (\Delta F_1, \Delta F_2, \Delta F_3)^\top$. Composing two operations gives:

| Operation | Result | Type |
|---|---|---|
| Divergence of a gradient, $\nabla\cdot(\nabla f)$ | $\Delta f$ | Scalar |
| Curl of a gradient, $\nabla\times(\nabla f)$ | $\mathbf{0}$ | Vector |
| Jacobian of a gradient, $J_{\nabla f}$ | $H_f$ | Matrix |
| Divergence of a curl, $\nabla\cdot(\nabla\times\mathbf{F})$ | $0$ | Scalar |
| Gradient of a divergence, $\nabla(\nabla\cdot\mathbf{F})$ | Nonzero in general | Vector |
| Row-wise divergence of the Jacobian, $\operatorname{Div}(J_{\mathbf{F}})$ | $\Delta\mathbf{F}$ | Vector |
| Row-wise divergence of the transposed Jacobian, $\operatorname{Div}(J_{\mathbf{F}}^\top)$ | $\nabla(\nabla\cdot\mathbf{F})$ | Vector |
| Curl of a curl, $\nabla\times(\nabla\times\mathbf{F})$ | $\nabla(\nabla\cdot\mathbf{F}) - \Delta\mathbf{F}$ | Vector |

The two zero identities were proved in Chapter 2. The rows most easily confused are the middle two:

$$
\big(\operatorname{Div} J_{\mathbf{F}}\big)_i = \sum_j \partial_j\partial_j F_i = \Delta F_i ,
\qquad
\big(\operatorname{Div} J_{\mathbf{F}}^\top\big)_i = \sum_j \partial_j\partial_i F_j = \partial_i(\nabla\cdot\mathbf{F}) .
$$

A single transpose changes the result. "The divergence of the Jacobian" and "the gradient of the divergence" are not interchangeable.

**The curl of a curl.** Write $(\nabla\times\mathbf{A})_i = \varepsilon_{ijk}\,\partial_j A_k$ with the Levi-Civita symbol (repeated indices summed) and use $\varepsilon_{ijk}\varepsilon_{klm} = \delta_{il}\delta_{jm} - \delta_{im}\delta_{jl}$:

$$
\big(\nabla\times(\nabla\times\mathbf{F})\big)_i
= \varepsilon_{ijk}\,\partial_j\big(\varepsilon_{klm}\,\partial_l F_m\big)
= (\delta_{il}\delta_{jm} - \delta_{im}\delta_{jl})\,\partial_j\partial_l F_m
= \partial_i\partial_m F_m - \partial_j\partial_j F_i .
$$

The first term is $\partial_i(\nabla\cdot\mathbf{F})$ and the second is $\Delta F_i$, so $\nabla\times(\nabla\times\mathbf{F}) = \nabla(\nabla\cdot\mathbf{F}) - \Delta\mathbf{F}$.

Combined with the two row-wise divergences above, this can also be written

$$
\operatorname{Div}\big(J_{\mathbf{F}} - J_{\mathbf{F}}^\top\big) = -\,\nabla\times(\nabla\times\mathbf{F}) .
$$

This echoes Chapter 2: $J - J^\top$ encodes the curl, and taking its divergence gives the curl of the curl, up to a sign.

## In robotics

### Laplacian-of-Gaussian edge detection

Second derivatives of a raw image amplify noise, so the image is first smoothed with a Gaussian kernel $G_\sigma$. Differentiation and convolution are both linear and shift-invariant, so their order can be swapped (see [Cross-correlation and convolution](/notes/cross-correlation-and-convolution/)):

$$
\Delta(G_\sigma \ast I) = (\Delta G_\sigma) \ast I .
$$

One convolution with a fixed Laplacian-of-Gaussian (LoG) kernel is enough. Marr and Hildreth (1980) took the zero crossings of the LoG response as edges.

The LoG also matters in scale space: extrema of the scale-normalized LoG give the location and scale of blobs. SIFT approximates the LoG by a difference of Gaussians (DoG) to detect keypoints (Lowe, 2004).

### Poisson surface reconstruction

Given a point cloud with oriented normals, Poisson surface reconstruction (Kazhdan et al., 2006) seeks a scalar function $\chi$ whose level set is the reconstructed surface.

The starting observation is that the gradient of a smoothed indicator function (1 inside the object, 0 outside) is approximately the inward normal field near the surface and approximately zero elsewhere. So the normals are first interpolated into a vector field $\mathbf{V}$, and then we look for the function whose gradient is closest to it:

$$
E[\chi] = \frac12 \int_\Omega \big\|\nabla\chi - \mathbf{V}\big\|^2\, dV .
$$

**Variational derivation.** For any smooth perturbation $\eta$, differentiate $E[\chi + \epsilon\eta]$ at $\epsilon = 0$:

$$
\frac{d}{d\epsilon}E[\chi + \epsilon\eta]\Big|_{\epsilon=0} = \int_\Omega (\nabla\chi - \mathbf{V})\cdot\nabla\eta\; dV .
$$

Let $\mathbf{A} = \nabla\chi - \mathbf{V}$. The product rule $\nabla\cdot(\eta\mathbf{A}) = \nabla\eta\cdot\mathbf{A} + \eta\,\nabla\cdot\mathbf{A}$ together with the divergence theorem of Chapter 2 gives

$$
\int_\Omega \mathbf{A}\cdot\nabla\eta\; dV = \oint_{\partial\Omega} \eta\,\mathbf{A}\cdot\mathbf{n}\; dS - \int_\Omega \eta\,\nabla\cdot\mathbf{A}\; dV .
$$

If $\eta$ vanishes on the boundary (or the natural boundary condition $\mathbf{A}\cdot\mathbf{n} = 0$ holds), the boundary term drops. At a minimum the expression must vanish for every $\eta$, so $\nabla\cdot\mathbf{A} = 0$, that is,

$$
\Delta\chi = \nabla\cdot\mathbf{V} .
$$

This is the Poisson equation. The pipeline is "oriented normals → vector field → divergence → Poisson solve → implicit function → level set", and gradient, divergence and Laplacian appear in turn. Kazhdan et al. solve the equation on an octree and use the average of $\chi$ at the sample points as the iso-value. Screened Poisson reconstruction (Kazhdan & Hoppe, 2013) adds point-position constraints to the energy to reduce over-smoothing. Libraries such as Open3D provide ready implementations.

Note that $\chi$ is a smoothed indicator function, not a signed distance function. Poisson reconstruction also differs from TSDF fusion: the former solves one global equation from an oriented point cloud, while the latter fuses depth observations frame by frame into a truncated distance representation.

### The Hessian in pose optimization

Chapter 1 gave the gradient $\nabla E = J^\top\mathbf{r}$ of the least-squares objective $E = \frac12\|\mathbf{r}(\boldsymbol{\xi})\|^2$. Differentiating once more, component by component:

$$
\frac{\partial^2 E}{\partial\xi_j\,\partial\xi_k}
= \frac{\partial}{\partial\xi_k}\sum_i J_{ij}\, r_i
= \sum_i J_{ij} J_{ik} + \sum_i r_i \frac{\partial^2 r_i}{\partial\xi_j\,\partial\xi_k} ,
$$

that is,

$$
H_E = J^\top J + \sum_i r_i\, H_{r_i} .
$$

Gauss–Newton drops the second term and keeps only $J^\top J$. The approximation is good when the residuals $r_i$ are small, or when the residual functions are nearly linear so that $H_{r_i}$ is small. Its advantages are that it needs only first derivatives and that $J^\top J$ is always positive semidefinite. Levenberg–Marquardt adds a damping term $\lambda I$ on top of it, so that it still converges stably when neither condition holds.

## Experiment

The script checks four things in turn: the second-order identities with SymPy; the accuracy of the five-point stencil; diffusion as neighbourhood averaging; and a small 2D Poisson reconstruction.

```python
import numpy as np
import scipy.sparse as sp
import scipy.sparse.linalg as spla
import sympy as s

# 1. second-order identities (for arbitrary smooth P, Q, R)
x, y, z = s.symbols("x y z")
v = [x, y, z]
F = s.Matrix([s.Function(n)(x, y, z) for n in "PQR"])
curl = lambda A: s.Matrix([A[2].diff(y) - A[1].diff(z),
                           A[0].diff(z) - A[2].diff(x),
                           A[1].diff(x) - A[0].diff(y)])
div = lambda A: sum(A[i].diff(v[i]) for i in range(3))
grad = lambda f: s.Matrix([f.diff(vi) for vi in v])
lap = lambda A: s.Matrix([sum(Ai.diff(vi, 2) for vi in v) for Ai in A])
Div = lambda M: s.Matrix([sum(M[i, j].diff(v[j]) for j in range(3)) for i in range(3)])
J = F.jacobian(v)
print(s.simplify(curl(curl(F)) - (grad(div(F)) - lap(F))).T)   # [0, 0, 0]
print(s.simplify(Div(J) - lap(F)).T, s.simplify(Div(J.T) - grad(div(F))).T)

# 2. five-point stencil vs the analytic Laplacian
n = 201
h = 2.0 / (n - 1)
g = np.linspace(-1, 1, n)
Xg, Yg = np.meshgrid(g, g)
f = np.sin(np.pi * Xg) * np.cos(np.pi * Yg)
lap_exact = -2 * np.pi**2 * f
lap_5 = (f[1:-1, 2:] + f[1:-1, :-2] + f[2:, 1:-1] + f[:-2, 1:-1] - 4 * f[1:-1, 1:-1]) / h**2
print(np.abs(lap_5 - lap_exact[1:-1, 1:-1]).max())             # about 1.6e-3, error O(h^2)

# 3. a diffusion step with kappa*dt/h^2 = 1/4 is a four-neighbour average
rng = np.random.default_rng(0)
u = rng.random((64, 64))
print("std before:", u.std().round(3))
for _ in range(20):
    up = np.pad(u, 1, mode="edge")
    u = 0.25 * (up[1:-1, 2:] + up[1:-1, :-2] + up[2:, 1:-1] + up[:-2, 1:-1])
print("std after 20 steps:", u.std().round(3))                 # 0.288 -> 0.037

# 4. 2D Poisson reconstruction: recover a disc from a noisy "normal field"
n = 128
h = 2.0 / (n - 1)
g = np.linspace(-1, 1, n)
X, Y = np.meshgrid(g, g)
r = np.hypot(X, Y)
chi0 = 0.5 * (1 - np.tanh((r - 0.5) / 0.05))   # smoothed indicator of a disc (ground truth)
gy, gx = np.gradient(chi0, h)                  # its gradient points inward near the boundary
Vx = gx + 0.2 * gx.std() * rng.standard_normal(gx.shape)   # noisy observation
Vy = gy + 0.2 * gy.std() * rng.standard_normal(gy.shape)
divV = np.gradient(Vx, h, axis=1) + np.gradient(Vy, h, axis=0)

D = sp.diags([1.0, -2.0, 1.0], [-1, 0, 1], shape=(n, n)) / h**2
L = sp.kron(sp.identity(n), D) + sp.kron(D, sp.identity(n))   # five-point Laplacian, zero outside
chi = spla.spsolve(L.tocsc(), divV.ravel()).reshape(n, n)

inside0, inside = chi0 > 0.5, chi > 0.5
iou = (inside0 & inside).sum() / (inside0 | inside).sum()
print(np.abs(chi - chi0).max().round(3), iou.round(3))         # about 0.016, 0.999
```

## References

1. Kazhdan, M., Bolitho, M., & Hoppe, H. (2006). Poisson surface reconstruction. *Proceedings of the Eurographics Symposium on Geometry Processing (SGP)*. https://hhoppe.com/proj/poissonrecon/
2. Kazhdan, M., & Hoppe, H. (2013). Screened Poisson surface reconstruction. *ACM Transactions on Graphics*, 32(3), 29.
3. Marr, D., & Hildreth, E. (1980). Theory of edge detection. *Proceedings of the Royal Society of London. Series B*, 207(1167), 187–217.
4. Lowe, D. G. (2004). Distinctive image features from scale-invariant keypoints. *International Journal of Computer Vision*, 60(2), 91–110.
5. Nocedal, J., & Wright, S. J. (2006). *Numerical Optimization* (2nd ed.), Chapter 10 (Least-Squares Problems). Springer.
6. Evans, L. C. (2010). *Partial Differential Equations* (2nd ed.). American Mathematical Society.
7. Khan Academy. The Hessian matrix and Intuition about the Laplacian (videos in the multivariable calculus course). https://www.khanacademy.org/math/multivariable-calculus
8. Brunton, S. L. Div, Grad, and Curl: Vector Calculus Building Blocks for PDEs (YouTube). https://www.youtube.com/watch?v=lKXW7DRyyro
