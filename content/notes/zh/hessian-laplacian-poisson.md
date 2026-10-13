---
title: 海森、拉普拉斯与泊松重建
summary: 对梯度再求一次雅可比得到海森，取迹得到拉普拉斯。本章推导二阶泰勒展开、拉普拉斯与邻域平均的关系和二阶恒等式，再从一个最小二乘能量出发推导泊松表面重建方程，并说明 Gauss–Newton 对海森的近似从何而来。
date: 2026-10-12
topic: foundations
tags: [hessian, laplacian, poisson-reconstruction, vector-calculus]
draft: false
series: local-derivatives
seriesOrder: 3
---

## 问题是什么

对一个场再求一次导数，会得到什么？为什么拉普拉斯算子 (Laplacian) 既出现在图像边缘检测里，又出现在扩散方程和点云表面重建里？

[第 1 章](/zh/notes/jacobian-and-gradient/)说明了导数是局部线性映射，[第 2 章](/zh/notes/divergence-and-curl/)说明了散度和旋度是从雅可比中提取的信息。本章把同样的思路用到二阶：海森矩阵 (Hessian) 是完整的二阶信息，拉普拉斯是从中提取的一个数。

## 直觉怎么理解

梯度描述一个标量场在某点"往哪边倾斜、倾斜多少"。海森描述这种倾斜本身怎样变化，也就是局部的弯曲：像碗底、像山顶，还是像马鞍。

拉普拉斯把所有方向上的弯曲加起来，只留下一个数。它有一个更直接的含义：**一点的值与它周围邻域平均值之差。** 拉普拉斯为正，说明邻居平均比中心高，中心处于"低谷"；为负则中心处于"高处"。

这个含义解释了它的各种用途：

- 在扩散过程中，低于邻居的点上升、高于邻居的点下降，于是图像被平滑；
- 在边缘检测中，亮度剧烈变化处的二阶导数会变号；
- 在表面重建中，求解"拉普拉斯等于给定值"的方程，相当于在全局范围内把局部的梯度信息拼接成一个函数。

## 数学 / 几何表达

### 海森是梯度的雅可比

对标量场 $f$，海森定义为梯度场的雅可比：

$$
H_f = J_{\nabla f}, \qquad (H_f)_{ij} = \frac{\partial^2 f}{\partial x_j\,\partial x_i} .
$$

当 $f$ 二阶连续可微时，混合偏导可交换，所以 $H_f$ 是对称矩阵。

二阶泰勒展开说明了它的意义：

$$
f(\mathbf{x} + \mathbf{h}) = f(\mathbf{x}) + \nabla f(\mathbf{x})^\top \mathbf{h} + \tfrac12\,\mathbf{h}^\top H_f(\mathbf{x})\,\mathbf{h} + o(\|\mathbf{h}\|^2) .
$$

对单位方向 $\mathbf{u}$，$\mathbf{u}^\top H_f \mathbf{u}$ 就是沿该方向的二阶导数。由于 $H_f$ 对称，它可以正交对角化，特征向量是主曲率方向，特征值是这些方向上的二阶导数。

在驻点（$\nabla f = 0$）处，二阶项决定局部形状：

- $H_f$ 正定，即所有特征值为正，是严格局部极小；
- 负定，是严格局部极大；
- 不定，即特征值有正有负，是鞍点；
- 半定（有零特征值）时，仅凭二阶信息通常无法判定。

### 拉普拉斯是海森的迹

$$
\Delta f = \nabla\cdot(\nabla f) = f_{xx} + f_{yy} + f_{zz} = \operatorname{tr} H_f .
$$

它与"散度是雅可比的迹"完全平行：散度从雅可比中取迹，拉普拉斯从海森中取迹。

**拉普拉斯是各向同性的。** 把坐标旋转为 $\mathbf{x} = R\mathbf{y}$（$R$ 为旋转矩阵），由链式法则，新坐标下的海森为 $R^\top H_f R$。而迹在相似变换下不变：

$$
\operatorname{tr}(R^\top H_f R) = \operatorname{tr}(H_f R R^\top) = \operatorname{tr} H_f .
$$

所以拉普拉斯不依赖坐标轴的朝向。这正是边缘检测偏爱它的原因之一：它对任意方向的边缘一视同仁。

代价是方向信息全部丢失。例如 $g = x^2 - y^2$ 的海森为 $\operatorname{diag}(2, -2)$，不是零矩阵，但 $\Delta g = 0$。拉普拉斯为零只说明各方向的弯曲在迹上互相抵消，并不说明函数"不弯"。

### 拉普拉斯与邻域平均

在步长为 $h$ 的二维网格上，对 $x$ 方向做泰勒展开：

$$
f(x \pm h, y) = f \pm h f_x + \tfrac{h^2}{2} f_{xx} \pm \tfrac{h^3}{6} f_{xxx} + O(h^4) .
$$

两式相加，奇数阶项抵消：

$$
\frac{f(x + h, y) + f(x - h, y) - 2f(x, y)}{h^2} = f_{xx} + O(h^2) .
$$

$y$ 方向同理，相加得到五点差分格式：

$$
\Delta f(x, y) \approx \frac{f(x+h, y) + f(x-h, y) + f(x, y+h) + f(x, y-h) - 4f(x, y)}{h^2}
= \frac{4}{h^2}\big(\bar{f}_{\text{邻居}} - f(x, y)\big) .
$$

即"四个邻居之和减去中心值的四倍"，等价于"邻居平均值与中心值之差"的 $4/h^2$ 倍。

**扩散为什么会平滑。** 热方程 $\partial_t f = \kappa\,\Delta f$（$\kappa > 0$）让低于邻居平均的点上升、高于平均的点下降。用显式欧拉法离散，一步更新为

$$
f \leftarrow f + \frac{\kappa\,\Delta t}{h^2}\big(\textstyle\sum \text{邻居} - 4f\big) .
$$

取 $\kappa\,\Delta t / h^2 = 1/4$，右边化简为 $\frac14\sum\text{邻居}$：每一步就是用四邻域平均替换中心值。在二维中，$1/4$ 也是显式格式稳定的上限。

需要区分的是：拉普拉斯算子本身并不模糊图像，是以它驱动的扩散演化产生了平滑。

### 二阶恒等式

定义矩阵场 $S$ 的逐行散度为 $(\operatorname{Div} S)_i = \sum_j \partial_j S_{ij}$，向量场的逐分量拉普拉斯为 $\Delta\mathbf{F} = (\Delta F_1, \Delta F_2, \Delta F_3)^\top$。连续两次运算的结果整理如下：

| 运算 | 结果 | 类型 |
|---|---|---|
| 梯度的散度 $\nabla\cdot(\nabla f)$ | $\Delta f$ | 标量 |
| 梯度的旋度 $\nabla\times(\nabla f)$ | $\mathbf{0}$ | 向量 |
| 梯度的雅可比 $J_{\nabla f}$ | $H_f$ | 矩阵 |
| 旋度的散度 $\nabla\cdot(\nabla\times\mathbf{F})$ | $0$ | 标量 |
| 散度的梯度 $\nabla(\nabla\cdot\mathbf{F})$ | 一般非零 | 向量 |
| 雅可比的逐行散度 $\operatorname{Div}(J_{\mathbf{F}})$ | $\Delta\mathbf{F}$ | 向量 |
| 雅可比转置的逐行散度 $\operatorname{Div}(J_{\mathbf{F}}^\top)$ | $\nabla(\nabla\cdot\mathbf{F})$ | 向量 |
| 旋度的旋度 $\nabla\times(\nabla\times\mathbf{F})$ | $\nabla(\nabla\cdot\mathbf{F}) - \Delta\mathbf{F}$ | 向量 |

两个零恒等式已在第 2 章证明。最容易混淆的是中间两行：

$$
\big(\operatorname{Div} J_{\mathbf{F}}\big)_i = \sum_j \partial_j\partial_j F_i = \Delta F_i ,
\qquad
\big(\operatorname{Div} J_{\mathbf{F}}^\top\big)_i = \sum_j \partial_j\partial_i F_j = \partial_i(\nabla\cdot\mathbf{F}) .
$$

二者只差一次转置，结果却不同。"雅可比的散度"和"散度的梯度"不能无条件画等号。

**旋度的旋度。** 用 Levi-Civita 符号写 $(\nabla\times\mathbf{A})_i = \varepsilon_{ijk}\,\partial_j A_k$（重复指标求和），并利用恒等式 $\varepsilon_{ijk}\varepsilon_{klm} = \delta_{il}\delta_{jm} - \delta_{im}\delta_{jl}$：

$$
\big(\nabla\times(\nabla\times\mathbf{F})\big)_i
= \varepsilon_{ijk}\,\partial_j\big(\varepsilon_{klm}\,\partial_l F_m\big)
= (\delta_{il}\delta_{jm} - \delta_{im}\delta_{jl})\,\partial_j\partial_l F_m
= \partial_i\partial_m F_m - \partial_j\partial_j F_i .
$$

第一项是 $\partial_i(\nabla\cdot\mathbf{F})$，第二项是 $\Delta F_i$，于是 $\nabla\times(\nabla\times\mathbf{F}) = \nabla(\nabla\cdot\mathbf{F}) - \Delta\mathbf{F}$。

结合上面两个逐行散度的结果，还可以写成

$$
\operatorname{Div}\big(J_{\mathbf{F}} - J_{\mathbf{F}}^\top\big) = -\,\nabla\times(\nabla\times\mathbf{F}) .
$$

这与第 2 章的结论呼应：$J - J^\top$ 编码了旋度，对它再取散度，就得到旋度的旋度（差一个负号）。

## 机器人中的例子

### 高斯拉普拉斯边缘检测

直接对图像求二阶导数会放大噪声，所以通常先用高斯核 $G_\sigma$ 平滑，再求拉普拉斯。由于求导和卷积都是线性时不变运算，二者可以交换顺序（见[互相关与卷积](/zh/notes/cross-correlation-and-convolution/)）：

$$
\Delta(G_\sigma \ast I) = (\Delta G_\sigma) \ast I .
$$

于是只需要用一个固定的高斯拉普拉斯 (Laplacian of Gaussian, LoG) 核与图像卷积一次。Marr 与 Hildreth (1980) 把 LoG 响应的过零点作为边缘。

LoG 在尺度空间中也很重要：经过尺度归一化的 LoG 极值给出斑点 (Blob) 的位置和尺度。SIFT 用高斯差分 (Difference of Gaussians, DoG) 近似 LoG 来检测关键点 (Lowe, 2004)。

### 泊松表面重建

给定一组带朝向法线的点云，泊松表面重建 (Poisson Surface Reconstruction; Kazhdan 等, 2006) 求一个标量函数 $\chi$，其等值面就是重建出的表面。

它的出发点是：物体指示函数（内部为 1、外部为 0）经过平滑后，其梯度在表面附近近似等于向内的法线场，在其他地方近似为零。所以先把法线插值成一个向量场 $\mathbf{V}$，再找一个梯度最接近 $\mathbf{V}$ 的函数：

$$
E[\chi] = \frac12 \int_\Omega \big\|\nabla\chi - \mathbf{V}\big\|^2\, dV .
$$

**变分推导。** 对任意光滑扰动 $\eta$，考虑 $E[\chi + \epsilon\eta]$ 在 $\epsilon = 0$ 处的导数：

$$
\frac{d}{d\epsilon}E[\chi + \epsilon\eta]\Big|_{\epsilon=0} = \int_\Omega (\nabla\chi - \mathbf{V})\cdot\nabla\eta\; dV .
$$

记 $\mathbf{A} = \nabla\chi - \mathbf{V}$。由乘积法则 $\nabla\cdot(\eta\mathbf{A}) = \nabla\eta\cdot\mathbf{A} + \eta\,\nabla\cdot\mathbf{A}$，再用第 2 章的散度定理：

$$
\int_\Omega \mathbf{A}\cdot\nabla\eta\; dV = \oint_{\partial\Omega} \eta\,\mathbf{A}\cdot\mathbf{n}\; dS - \int_\Omega \eta\,\nabla\cdot\mathbf{A}\; dV .
$$

若 $\eta$ 在边界上为零（或取自然边界条件 $\mathbf{A}\cdot\mathbf{n} = 0$），边界项消失。极小值要求上式对所有 $\eta$ 都为零，所以 $\nabla\cdot\mathbf{A} = 0$，即

$$
\Delta\chi = \nabla\cdot\mathbf{V} .
$$

这就是泊松方程。整个流程是"法线向量场 → 散度 → 解泊松方程 → 标量隐式函数 → 提取等值面"，梯度、散度、拉普拉斯三个算子在这里依次出现。Kazhdan 等在八叉树上求解这个方程，并取 $\chi$ 在样本点处的平均值作为等值面阈值。Screened Poisson 方法 (Kazhdan & Hoppe, 2013) 在能量中加入点位置约束，以减少过度平滑。Open3D 等库都提供了现成实现。

需要注意，$\chi$ 是平滑的指示函数，而不是符号距离函数。泊松重建也不同于 TSDF 融合：前者从定向点云出发求解一个全局方程，后者逐帧融合深度观测，得到截断的距离表示。

### 位姿优化中的海森

第 1 章给出了最小二乘目标 $E = \frac12\|\mathbf{r}(\boldsymbol{\xi})\|^2$ 的梯度 $\nabla E = J^\top\mathbf{r}$。对它再求一次导数，逐分量写出：

$$
\frac{\partial^2 E}{\partial\xi_j\,\partial\xi_k}
= \frac{\partial}{\partial\xi_k}\sum_i J_{ij}\, r_i
= \sum_i J_{ij} J_{ik} + \sum_i r_i \frac{\partial^2 r_i}{\partial\xi_j\,\partial\xi_k} ,
$$

即

$$
H_E = J^\top J + \sum_i r_i\, H_{r_i} .
$$

Gauss–Newton 法丢掉第二项，只保留 $J^\top J$。这个近似在残差 $r_i$ 很小、或者残差函数接近线性（$H_{r_i}$ 很小）时都成立。它的好处是只需要一阶导数，而且 $J^\top J$ 一定是半正定的。Levenberg–Marquardt 法在此基础上加入阻尼项 $\lambda I$，在两者都不满足时也能稳定收敛。

## 可视化 / 代码

下面的代码依次验证四件事：用 SymPy 验证二阶恒等式；五点差分的精度；扩散等价于邻域平均；以及一个二维泊松重建的小例子。

```python
import numpy as np
import scipy.sparse as sp
import scipy.sparse.linalg as spla
import sympy as s

# 1. 二阶恒等式（对任意光滑的 P, Q, R）
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

# 2. 五点差分 vs 解析拉普拉斯
n = 201
h = 2.0 / (n - 1)
g = np.linspace(-1, 1, n)
Xg, Yg = np.meshgrid(g, g)
f = np.sin(np.pi * Xg) * np.cos(np.pi * Yg)
lap_exact = -2 * np.pi**2 * f
lap_5 = (f[1:-1, 2:] + f[1:-1, :-2] + f[2:, 1:-1] + f[:-2, 1:-1] - 4 * f[1:-1, 1:-1]) / h**2
print(np.abs(lap_5 - lap_exact[1:-1, 1:-1]).max())             # 约 1.6e-3，误差为 O(h^2)

# 3. kappa*dt/h^2 = 1/4 的扩散步 = 四邻域平均
rng = np.random.default_rng(0)
u = rng.random((64, 64))
print("std before:", u.std().round(3))
for _ in range(20):
    up = np.pad(u, 1, mode="edge")
    u = 0.25 * (up[1:-1, 2:] + up[1:-1, :-2] + up[2:, 1:-1] + up[:-2, 1:-1])
print("std after 20 steps:", u.std().round(3))                 # 0.288 -> 0.037

# 4. 二维泊松重建：从带噪声的"法线场"恢复圆盘
n = 128
h = 2.0 / (n - 1)
g = np.linspace(-1, 1, n)
X, Y = np.meshgrid(g, g)
r = np.hypot(X, Y)
chi0 = 0.5 * (1 - np.tanh((r - 0.5) / 0.05))   # 平滑后的圆盘指示函数（真值）
gy, gx = np.gradient(chi0, h)                  # 它的梯度：表面附近指向内部
Vx = gx + 0.2 * gx.std() * rng.standard_normal(gx.shape)   # 加噪声的观测
Vy = gy + 0.2 * gy.std() * rng.standard_normal(gy.shape)
divV = np.gradient(Vx, h, axis=1) + np.gradient(Vy, h, axis=0)

D = sp.diags([1.0, -2.0, 1.0], [-1, 0, 1], shape=(n, n)) / h**2
L = sp.kron(sp.identity(n), D) + sp.kron(D, sp.identity(n))   # 五点拉普拉斯，边界外取 0
chi = spla.spsolve(L.tocsc(), divV.ravel()).reshape(n, n)

inside0, inside = chi0 > 0.5, chi > 0.5
iou = (inside0 & inside).sum() / (inside0 | inside).sum()
print(np.abs(chi - chi0).max().round(3), iou.round(3))         # 约 0.016, 0.999
```

## 参考资料

1. Kazhdan, M., Bolitho, M., & Hoppe, H. (2006). Poisson surface reconstruction. *Proceedings of the Eurographics Symposium on Geometry Processing (SGP)*. https://hhoppe.com/proj/poissonrecon/
2. Kazhdan, M., & Hoppe, H. (2013). Screened Poisson surface reconstruction. *ACM Transactions on Graphics*, 32(3), 29.
3. Marr, D., & Hildreth, E. (1980). Theory of edge detection. *Proceedings of the Royal Society of London. Series B*, 207(1167), 187–217.
4. Lowe, D. G. (2004). Distinctive image features from scale-invariant keypoints. *International Journal of Computer Vision*, 60(2), 91–110.
5. Nocedal, J., & Wright, S. J. (2006). *Numerical Optimization* (2nd ed.), Chapter 10 (Least-Squares Problems). Springer.
6. Evans, L. C. (2010). *Partial Differential Equations* (2nd ed.). American Mathematical Society.
7. Khan Academy. The Hessian matrix 与 Intuition about the Laplacian（多元微积分课程中的视频）。https://www.khanacademy.org/math/multivariable-calculus
8. Brunton, S. L. Div, Grad, and Curl: Vector Calculus Building Blocks for PDEs（YouTube）。https://www.youtube.com/watch?v=lKXW7DRyyro
