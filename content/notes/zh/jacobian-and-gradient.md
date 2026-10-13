---
title: 雅可比与梯度：导数是局部线性映射
summary: 把一元导数推广到多元，导数就从一个数变成一个矩阵，即雅可比；标量场的雅可比转置后是梯度。本章推导梯度为何指向最快上升方向、为何垂直于等值面，并给出相机投影和位姿优化中的雅可比。
date: 2026-10-12
topic: foundations
tags: [jacobian, gradient, multivariable-calculus, optimization]
draft: false
series: local-derivatives
seriesOrder: 1
---

## 问题是什么

多元函数的"导数"到底是一个什么样的对象？为什么标量场的导数是一个向量，而向量场的导数是一个矩阵？

这个问题看起来只是记号上的区别，却决定了后面所有算子的位置。散度、旋度、海森、拉普拉斯都是从同一个对象，即雅可比矩阵 (Jacobian Matrix)，出发得到的。本章先把这个对象讲清楚。

## 直觉怎么理解

一元函数的导数回答的是：输入改变一点点，输出会改变多少。在一点附近放大函数图像，曲线看起来像一条直线，导数就是这条直线的斜率。

多元情形完全相同，只是"斜率"换成了矩阵。把一个映射 $\mathbf{F}:\mathbb{R}^n \to \mathbb{R}^m$ 放大到某一点附近，弯曲的映射看起来就像一个线性变换：一个小方格被映射成一个小平行四边形。描述这个线性变换的矩阵，就是该点的雅可比。

雅可比的每一列回答"沿某一个输入方向移动时，所有输出怎样变化"；每一行回答"某一个输出分量对所有输入方向的敏感程度"。

标量场 $f:\mathbb{R}^n \to \mathbb{R}$ 只有一个输出，雅可比只有一行。把这一行立起来写成列向量，就是梯度 (Gradient)。

## 数学 / 几何表达

### 从一元导数到雅可比

一元函数在 $x$ 附近的一阶展开为

$$
f(x + h) = f(x) + f'(x)\,h + o(|h|).
$$

对 $\mathbf{F}:\mathbb{R}^n \to \mathbb{R}^m$，如果存在矩阵 $J_{\mathbf{F}}(\mathbf{x})$ 使

$$
\mathbf{F}(\mathbf{x} + \mathbf{h}) = \mathbf{F}(\mathbf{x}) + J_{\mathbf{F}}(\mathbf{x})\,\mathbf{h} + o(\|\mathbf{h}\|),
$$

就称 $\mathbf{F}$ 在 $\mathbf{x}$ 处可微，$J_{\mathbf{F}}$ 为它的雅可比。取 $\mathbf{h} = t\,\mathbf{e}_j$ 并令 $t \to 0$，可以读出每个元素：

$$
(J_{\mathbf{F}})_{ij} = \frac{\partial F_i}{\partial x_j}, \qquad J_{\mathbf{F}} \in \mathbb{R}^{m \times n}.
$$

雅可比的形状是"输出维数 × 输入维数"，不一定是方阵。只有 $m = n$ 时才讨论它的行列式，即局部体积缩放比例。

### 链式法则就是矩阵乘法

设 $\mathbf{y} = \mathbf{F}(\mathbf{x})$，$\mathbf{z} = \mathbf{G}(\mathbf{y})$。对 $\mathbf{x}$ 的小变化 $\mathbf{h}$，有 $\delta\mathbf{y} \approx J_{\mathbf{F}}\mathbf{h}$，再有 $\delta\mathbf{z} \approx J_{\mathbf{G}}\,\delta\mathbf{y}$。于是

$$
J_{\mathbf{G} \circ \mathbf{F}}(\mathbf{x}) = J_{\mathbf{G}}\big(\mathbf{F}(\mathbf{x})\big)\, J_{\mathbf{F}}(\mathbf{x}).
$$

复合映射的局部线性近似，就是各段局部线性近似的乘积。机器人中的长链式求导（例如"位姿 → 三维点 → 像素 → 残差"）都是这个公式的反复应用。

### 梯度：标量场雅可比的转置

对标量场 $f:\mathbb{R}^n \to \mathbb{R}$，雅可比是一个 $1 \times n$ 的行向量。定义梯度为它的转置：

$$
\nabla f =
\begin{bmatrix}
\partial_1 f \\ \vdots \\ \partial_n f
\end{bmatrix},
\qquad J_f = (\nabla f)^\top .
$$

于是一阶展开可以写成 $f(\mathbf{x} + \mathbf{h}) \approx f(\mathbf{x}) + \nabla f^\top \mathbf{h}$。沿单位方向 $\mathbf{u}$ 的方向导数 (Directional Derivative) 为

$$
D_{\mathbf{u}} f = \lim_{t \to 0}\frac{f(\mathbf{x} + t\mathbf{u}) - f(\mathbf{x})}{t} = \nabla f \cdot \mathbf{u} .
$$

### 梯度为何指向最快上升方向

由 Cauchy–Schwarz 不等式（见[内积、协方差与相关系数](/zh/notes/inner-product-covariance-correlation/)），对单位向量 $\mathbf{u}$ 有

$$
D_{\mathbf{u}} f = \nabla f \cdot \mathbf{u} \le \|\nabla f\|\,\|\mathbf{u}\| = \|\nabla f\| ,
$$

等号成立当且仅当 $\mathbf{u}$ 与 $\nabla f$ 同向。所以在 $\nabla f \neq 0$ 的点，沿 $\nabla f / \|\nabla f\|$ 方向上升最快，最大变化率为 $\|\nabla f\|$；沿相反方向下降最快。这就是梯度下降的依据。

例如 $f(x, y, z) = x^2 + 2y^2 + 3z^2$，有 $\nabla f = (2x, 4y, 6z)^\top$。在点 $(1, 1, 1)$，最快上升方向是 $(2, 4, 6)$ 的单位向量，而不是位置向量 $(1, 1, 1)$ 的方向。各方向的"陡峭程度"不同，梯度会偏向更陡的坐标。

### 梯度垂直于等值面

设 $\boldsymbol{\gamma}(t)$ 是等值面 $\{f = c\}$ 上过 $\mathbf{x}$ 的任意光滑曲线，$\boldsymbol{\gamma}(0) = \mathbf{x}$。由于 $f(\boldsymbol{\gamma}(t)) = c$ 恒成立，对 $t$ 求导，并用链式法则：

$$
0 = \frac{d}{dt} f\big(\boldsymbol{\gamma}(t)\big)\Big|_{t=0} = \nabla f(\mathbf{x})^\top \boldsymbol{\gamma}'(0).
$$

$\boldsymbol{\gamma}'(0)$ 可以是等值面在 $\mathbf{x}$ 处的任意切向量，所以 $\nabla f$ 与整个切平面正交，即梯度是等值面的法向量。

### 导数与梯度之间隔着一个内积

严格地说，导数 $df_{\mathbf{x}}$ 是一个线性函数：它接收一个方向 $\mathbf{h}$，输出变化率 $df_{\mathbf{x}}(\mathbf{h})$。梯度则是借助内积，把这个线性函数表示成一个向量：对所有 $\mathbf{h}$，$df_{\mathbf{x}}(\mathbf{h}) = \langle \nabla f, \mathbf{h} \rangle$。

在笛卡尔坐标和标准内积下，两者的分量完全相同，所以这一步很容易被忽略。换成一般的内积 $\langle \mathbf{a}, \mathbf{b} \rangle = \mathbf{a}^\top G\, \mathbf{b}$（$G$ 对称正定）时，梯度变为 $G^{-1} J_f^\top$，与偏导数组成的向量不再相同。曲线坐标和流形上的梯度公式，都源于这一点。

## 机器人中的例子

### 相机投影的雅可比

对不含畸变的针孔相机，相机坐标系中的点 $\mathbf{P} = (X, Y, Z)^\top$（$Z > 0$）投影到像素

$$
u = f_x \frac{X}{Z} + c_x, \qquad v = f_y \frac{Y}{Z} + c_y .
$$

逐项求偏导：$\partial u/\partial X = f_x/Z$，$\partial u/\partial Y = 0$，$\partial u/\partial Z = -f_x X/Z^2$；$v$ 同理。于是

$$
J_\pi =
\begin{bmatrix}
f_x / Z & 0 & -f_x X / Z^2 \\
0 & f_y / Z & -f_y Y / Z^2
\end{bmatrix}.
$$

这是一个 $2 \times 3$ 矩阵，它预测三维点的微小移动会引起多大的像素位移。有两点可以直接读出来：

- 所有元素都含 $1/Z$，同样的三维位移，近处的点在图像上移动得更多；
- 第三列描述沿光轴方向的移动，它使点沿着从主点出发的射线方向在图像上移动。第 2 章推导光流散度时会再用到这一点。

### 隐式表面的法线

如果表面由隐式函数 $f(\mathbf{x}) = 0$ 定义，由"梯度垂直于等值面"可知，在 $\nabla f \neq 0$ 的光滑点，单位法线为

$$
\mathbf{n} = \frac{\nabla f}{\|\nabla f\|} .
$$

对精确的欧氏符号距离函数 (Signed Distance Function, SDF)，在光滑区域内有 $\|\nabla f\| = 1$（程函方程，Eikonal Equation），所以梯度本身就是单位法线。

需要注意的是，RGB-D 融合得到的截断符号距离函数 (TSDF) 通常只是沿视线方向的投影距离近似，还带有噪声、插值误差和截断饱和。它不能在全域当作精确的 SDF 使用，用梯度估计法线时，应只在表面附近、观测充分的体素中进行。

### 位姿优化中的梯度

设残差向量 $\mathbf{r}(\boldsymbol{\xi}) \in \mathbb{R}^m$ 依赖于位姿的局部参数 $\boldsymbol{\xi} \in \mathbb{R}^6$，目标函数为 $E = \frac12\|\mathbf{r}\|^2$。由链式法则，

$$
dE = \mathbf{r}^\top d\mathbf{r} = \mathbf{r}^\top J_{\mathbf{r}}\, d\boldsymbol{\xi}
\quad\Longrightarrow\quad
\nabla E = J_{\mathbf{r}}^\top \mathbf{r} .
$$

$J_{\mathbf{r}}$ 是 $m \times 6$ 矩阵，梯度是 $6 \times 1$ 向量。Gauss–Newton 法用 $J_{\mathbf{r}}^\top J_{\mathbf{r}}$ 近似海森，每一步求解 $(J_{\mathbf{r}}^\top J_{\mathbf{r}})\,\delta\boldsymbol{\xi} = -J_{\mathbf{r}}^\top \mathbf{r}$；第 3 章会说明这个近似从何而来。

这里的求导变量是位姿的局部参数，而不是三维世界坐标。六维位姿参数的雅可比还取决于扰动是左乘还是右乘，不同约定下的公式不能混用。ICP、RGB-D 里程计和光束法平差 (Bundle Adjustment) 中的 Jacobian 和 gradient，都属于这一套语言。

## 可视化 / 代码

下面的代码依次验证四件事：用 SymPy 求投影雅可比；与有限差分结果对照；最小二乘目标的梯度等于 $J^\top \mathbf{r}$；SDF 的梯度范数为 1。

```python
import numpy as np
import sympy as sp

# 1. 针孔投影的雅可比（符号推导）
X, Y, Z, fx, fy, cx, cy = sp.symbols("X Y Z f_x f_y c_x c_y", positive=True)
proj = sp.Matrix([fx * X / Z + cx, fy * Y / Z + cy])
J_sym = proj.jacobian([X, Y, Z])
sp.pprint(J_sym)

# 2. 与中心差分对照
J_fn = sp.lambdify((X, Y, Z, fx, fy), J_sym)
p_fn = sp.lambdify((X, Y, Z, fx, fy, cx, cy), proj)
P0 = np.array([0.4, -0.2, 3.0])
intr = (500.0, 500.0, 320.0, 240.0)
eps = 1e-6
J_num = np.zeros((2, 3))
for j in range(3):
    d = np.zeros(3); d[j] = eps
    J_num[:, j] = ((p_fn(*(P0 + d), *intr) - p_fn(*(P0 - d), *intr)) / (2 * eps)).ravel()
print(np.abs(J_num - np.array(J_fn(*P0, 500.0, 500.0))).max())   # 约 1e-8

# 3. 最小二乘：grad E = J^T r，R^6 -> R^100
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
# (100, 6) (6,) 约 1e-8

# 4. 单位球的 SDF：f(p) = |p| - 1，梯度 p/|p| 的范数恒为 1
p = rng.standard_normal((5, 3))
grad = p / np.linalg.norm(p, axis=1, keepdims=True)
print(np.linalg.norm(grad, axis=1))                              # [1. 1. 1. 1. 1.]
```

## 参考资料

1. Hartley, R., & Zisserman, A. (2004). *Multiple View Geometry in Computer Vision* (2nd ed.). Cambridge University Press.
2. Barfoot, T. D. (2017). *State Estimation for Robotics*. Cambridge University Press.
3. Strang, G. (2016). *Introduction to Linear Algebra* (5th ed.). Wellesley-Cambridge Press.
4. OpenStax. *Calculus Volume 3*, Chapter 4 (Differentiation of Functions of Several Variables). https://openstax.org/details/books/calculus-volume-3
5. Khan Academy. Derivatives of multivariable functions（含雅可比矩阵与梯度的视频）。https://www.khanacademy.org/math/multivariable-calculus/multivariable-derivatives
