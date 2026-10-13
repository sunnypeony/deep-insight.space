---
title: "The Jacobian and the gradient: the derivative as a local linear map"
summary: Extend the one-variable derivative to several variables and it turns from a number into a matrix, the Jacobian; the transpose of a scalar field's Jacobian is the gradient. This chapter derives why the gradient points uphill fastest and is normal to level sets, and works out the Jacobians of camera projection and pose optimization.
date: 2026-10-12
topic: foundations
tags: [jacobian, gradient, multivariable-calculus, optimization]
draft: false
series: local-derivatives
seriesOrder: 1
---

## The question

What kind of object is the "derivative" of a multivariable function? Why is the derivative of a scalar field a vector, while the derivative of a vector field is a matrix?

This looks like a question about notation, but it fixes the place of every later operator. Divergence, curl, the Hessian and the Laplacian are all obtained from one object, the Jacobian matrix. This chapter makes that object precise.

## Intuition

The derivative of a one-variable function answers: if the input changes a little, how much does the output change? Zoom in on the graph near a point and the curve looks like a line; the derivative is its slope.

The multivariable case is the same, except that the slope becomes a matrix. Zoom in on a map $\mathbf{F}:\mathbb{R}^n \to \mathbb{R}^m$ near a point and the curved map looks like a linear transformation: a tiny square goes to a tiny parallelogram. The matrix of that linear transformation is the Jacobian at that point.

Each column of the Jacobian answers "how do all outputs change when I move along one input direction?". Each row answers "how sensitive is one output component to every input direction?".

A scalar field $f:\mathbb{R}^n \to \mathbb{R}$ has one output, so its Jacobian is a single row. Stand that row up as a column vector and you have the gradient.

## Formalism

### From the derivative to the Jacobian

The first-order expansion of a one-variable function near $x$ is

$$
f(x + h) = f(x) + f'(x)\,h + o(|h|).
$$

A map $\mathbf{F}:\mathbb{R}^n \to \mathbb{R}^m$ is differentiable at $\mathbf{x}$ if there is a matrix $J_{\mathbf{F}}(\mathbf{x})$ with

$$
\mathbf{F}(\mathbf{x} + \mathbf{h}) = \mathbf{F}(\mathbf{x}) + J_{\mathbf{F}}(\mathbf{x})\,\mathbf{h} + o(\|\mathbf{h}\|),
$$

and $J_{\mathbf{F}}$ is its Jacobian. Setting $\mathbf{h} = t\,\mathbf{e}_j$ and letting $t \to 0$ reads off each entry:

$$
(J_{\mathbf{F}})_{ij} = \frac{\partial F_i}{\partial x_j}, \qquad J_{\mathbf{F}} \in \mathbb{R}^{m \times n}.
$$

The Jacobian has shape "output dimension × input dimension" and need not be square. Only when $m = n$ does its determinant, the local volume scaling factor, make sense.

### The chain rule is matrix multiplication

Let $\mathbf{y} = \mathbf{F}(\mathbf{x})$ and $\mathbf{z} = \mathbf{G}(\mathbf{y})$. A small change $\mathbf{h}$ in $\mathbf{x}$ gives $\delta\mathbf{y} \approx J_{\mathbf{F}}\mathbf{h}$, and then $\delta\mathbf{z} \approx J_{\mathbf{G}}\,\delta\mathbf{y}$. Hence

$$
J_{\mathbf{G} \circ \mathbf{F}}(\mathbf{x}) = J_{\mathbf{G}}\big(\mathbf{F}(\mathbf{x})\big)\, J_{\mathbf{F}}(\mathbf{x}).
$$

The local linear approximation of a composition is the product of the local linear approximations. The long derivative chains of robotics, such as "pose → 3D point → pixel → residual", are this formula applied repeatedly.

### The gradient is the transposed Jacobian of a scalar field

For a scalar field $f:\mathbb{R}^n \to \mathbb{R}$, the Jacobian is a $1 \times n$ row. The gradient is defined as its transpose:

$$
\nabla f =
\begin{bmatrix}
\partial_1 f \\ \vdots \\ \partial_n f
\end{bmatrix},
\qquad J_f = (\nabla f)^\top .
$$

The first-order expansion then reads $f(\mathbf{x} + \mathbf{h}) \approx f(\mathbf{x}) + \nabla f^\top \mathbf{h}$, and the directional derivative along a unit vector $\mathbf{u}$ is

$$
D_{\mathbf{u}} f = \lim_{t \to 0}\frac{f(\mathbf{x} + t\mathbf{u}) - f(\mathbf{x})}{t} = \nabla f \cdot \mathbf{u} .
$$

### Why the gradient points uphill fastest

By the Cauchy–Schwarz inequality (see [Inner products, covariance and correlation](/notes/inner-product-covariance-correlation/)), for every unit vector $\mathbf{u}$,

$$
D_{\mathbf{u}} f = \nabla f \cdot \mathbf{u} \le \|\nabla f\|\,\|\mathbf{u}\| = \|\nabla f\| ,
$$

with equality exactly when $\mathbf{u}$ points along $\nabla f$. Wherever $\nabla f \neq 0$, the direction $\nabla f / \|\nabla f\|$ gives the fastest increase, at rate $\|\nabla f\|$, and the opposite direction the fastest decrease. This is what justifies gradient descent.

For example, $f(x, y, z) = x^2 + 2y^2 + 3z^2$ has $\nabla f = (2x, 4y, 6z)^\top$. At $(1, 1, 1)$ the steepest ascent is along the unit vector of $(2, 4, 6)$, not along the position vector $(1, 1, 1)$. The function is steeper in some coordinates than others, and the gradient leans towards the steeper ones.

### The gradient is normal to level sets

Let $\boldsymbol{\gamma}(t)$ be any smooth curve in the level set $\{f = c\}$ with $\boldsymbol{\gamma}(0) = \mathbf{x}$. Since $f(\boldsymbol{\gamma}(t)) = c$ for all $t$, differentiating with the chain rule gives

$$
0 = \frac{d}{dt} f\big(\boldsymbol{\gamma}(t)\big)\Big|_{t=0} = \nabla f(\mathbf{x})^\top \boldsymbol{\gamma}'(0).
$$

$\boldsymbol{\gamma}'(0)$ can be any tangent vector of the level set at $\mathbf{x}$, so $\nabla f$ is orthogonal to the whole tangent plane: the gradient is the normal of the level set.

### An inner product sits between the derivative and the gradient

Strictly speaking, the derivative $df_{\mathbf{x}}$ is a linear function: it takes a direction $\mathbf{h}$ and returns the rate of change $df_{\mathbf{x}}(\mathbf{h})$. The gradient is the vector that represents this linear function through an inner product: $df_{\mathbf{x}}(\mathbf{h}) = \langle \nabla f, \mathbf{h} \rangle$ for every $\mathbf{h}$.

With Cartesian coordinates and the standard inner product the two have identical components, so this step is easy to overlook. With a general inner product $\langle \mathbf{a}, \mathbf{b} \rangle = \mathbf{a}^\top G\, \mathbf{b}$ ($G$ symmetric positive definite), the gradient becomes $G^{-1} J_f^\top$, no longer the vector of partial derivatives. Gradient formulas in curvilinear coordinates and on manifolds all stem from this.

## In robotics

### The Jacobian of camera projection

For an undistorted pinhole camera, a point $\mathbf{P} = (X, Y, Z)^\top$ in the camera frame ($Z > 0$) projects to the pixel

$$
u = f_x \frac{X}{Z} + c_x, \qquad v = f_y \frac{Y}{Z} + c_y .
$$

Differentiating term by term gives $\partial u/\partial X = f_x/Z$, $\partial u/\partial Y = 0$, $\partial u/\partial Z = -f_x X/Z^2$, and likewise for $v$:

$$
J_\pi =
\begin{bmatrix}
f_x / Z & 0 & -f_x X / Z^2 \\
0 & f_y / Z & -f_y Y / Z^2
\end{bmatrix}.
$$

This $2 \times 3$ matrix predicts how far a pixel moves when the 3D point moves slightly. Two things can be read straight off it:

- every entry carries a $1/Z$, so the same 3D displacement moves near points further in the image;
- the third column describes motion along the optical axis, which moves the image point along the ray from the principal point. Chapter 2 uses this when deriving the divergence of optical flow.

### Normals of implicit surfaces

If a surface is the zero set $f(\mathbf{x}) = 0$ of an implicit function, the level-set result gives the unit normal at smooth points with $\nabla f \neq 0$:

$$
\mathbf{n} = \frac{\nabla f}{\|\nabla f\|} .
$$

For an exact Euclidean signed distance function (SDF), $\|\nabla f\| = 1$ in smooth regions (the Eikonal equation), so the gradient itself is the unit normal.

A truncated SDF (TSDF) fused from RGB-D data, however, usually stores a projective distance along the viewing ray, together with noise, interpolation error and truncation. It cannot be treated as an exact SDF everywhere; gradient-based normals should be computed only in well-observed voxels near the surface.

### The gradient in pose optimization

Let a residual vector $\mathbf{r}(\boldsymbol{\xi}) \in \mathbb{R}^m$ depend on local pose parameters $\boldsymbol{\xi} \in \mathbb{R}^6$, with objective $E = \frac12\|\mathbf{r}\|^2$. The chain rule gives

$$
dE = \mathbf{r}^\top d\mathbf{r} = \mathbf{r}^\top J_{\mathbf{r}}\, d\boldsymbol{\xi}
\quad\Longrightarrow\quad
\nabla E = J_{\mathbf{r}}^\top \mathbf{r} .
$$

$J_{\mathbf{r}}$ is $m \times 6$ and the gradient is $6 \times 1$. Gauss–Newton approximates the Hessian by $J_{\mathbf{r}}^\top J_{\mathbf{r}}$ and solves $(J_{\mathbf{r}}^\top J_{\mathbf{r}})\,\delta\boldsymbol{\xi} = -J_{\mathbf{r}}^\top \mathbf{r}$ at each step; Chapter 3 shows where this approximation comes from.

The variable here is the local pose parameter, not a 3D world coordinate. The Jacobian with respect to a six-dimensional pose also depends on whether perturbations are applied on the left or the right, and formulas from different conventions must not be mixed. The Jacobians and gradients of ICP, RGB-D odometry and bundle adjustment all belong to this language.

## Experiment

The script checks four things in turn: the projection Jacobian from SymPy; agreement with finite differences; the least-squares gradient equal to $J^\top \mathbf{r}$; and the unit gradient norm of an SDF.

```python
import numpy as np
import sympy as sp

# 1. Jacobian of pinhole projection (symbolic)
X, Y, Z, fx, fy, cx, cy = sp.symbols("X Y Z f_x f_y c_x c_y", positive=True)
proj = sp.Matrix([fx * X / Z + cx, fy * Y / Z + cy])
J_sym = proj.jacobian([X, Y, Z])
sp.pprint(J_sym)

# 2. compare with central differences
J_fn = sp.lambdify((X, Y, Z, fx, fy), J_sym)
p_fn = sp.lambdify((X, Y, Z, fx, fy, cx, cy), proj)
P0 = np.array([0.4, -0.2, 3.0])
intr = (500.0, 500.0, 320.0, 240.0)
eps = 1e-6
J_num = np.zeros((2, 3))
for j in range(3):
    d = np.zeros(3); d[j] = eps
    J_num[:, j] = ((p_fn(*(P0 + d), *intr) - p_fn(*(P0 - d), *intr)) / (2 * eps)).ravel()
print(np.abs(J_num - np.array(J_fn(*P0, 500.0, 500.0))).max())   # about 1e-8

# 3. least squares: grad E = J^T r, for R^6 -> R^100
rng = np.random.default_rng(0)
A = rng.standard_normal((100, 6))
b = rng.standard_normal(100)
r = lambda xi: np.sin(A @ xi) - b
J_r = lambda xi: np.cos(A @ xi)[:, None] * A
E = lambda xi: 0.5 * r(xi) @ r(xi)
xi0 = rng.standard_normal(6)
g_analytic = J_r(xi0).T @ r(xi0)
g_numeric = np.array([(E(xi0 + eps * e) - E(xi0 - eps * e)) / (2 * eps) for e in np.eye(6)])
print(J_r(xi0).shape, g_analytic.shape, np.abs(g_analytic - g_numeric).max())
# (100, 6) (6,) about 1e-8

# 4. SDF of the unit sphere: f(p) = |p| - 1, gradient p/|p| always has norm 1
p = rng.standard_normal((5, 3))
grad = p / np.linalg.norm(p, axis=1, keepdims=True)
print(np.linalg.norm(grad, axis=1))                              # [1. 1. 1. 1. 1.]
```

## References

1. Hartley, R., & Zisserman, A. (2004). *Multiple View Geometry in Computer Vision* (2nd ed.). Cambridge University Press.
2. Barfoot, T. D. (2017). *State Estimation for Robotics*. Cambridge University Press.
3. Strang, G. (2016). *Introduction to Linear Algebra* (5th ed.). Wellesley-Cambridge Press.
4. OpenStax. *Calculus Volume 3*, Chapter 4 (Differentiation of Functions of Several Variables). https://openstax.org/details/books/calculus-volume-3
5. Khan Academy. Derivatives of multivariable functions (videos on the Jacobian matrix and the gradient). https://www.khanacademy.org/math/multivariable-calculus/multivariable-derivatives
