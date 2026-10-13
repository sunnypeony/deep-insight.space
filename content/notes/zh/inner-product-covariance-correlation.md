---
title: 内积、协方差与相关系数
summary: 从内积出发，中心化得到协方差，再归一化得到相关系数；相关系数正是中心化后两个向量夹角的余弦。本章给出完整推导，并说明这些量在状态估计和点云处理中的用法。
date: 2026-10-12
topic: foundations
tags: [inner-product, covariance, correlation, statistics]
draft: false
series: relationship-modeling
seriesOrder: 1
---

## 问题是什么

给定两个向量或两个随机变量，怎样用一个数刻画它们"有多相关"？

这个问题是本系列所有后续概念的起点。互相关在每个平移位置上计算它，注意力在每一对 token 之间计算它，互信息则把它推广到非线性情形。

本章先推导三个最基础的量之间的关系：内积 (Inner Product)、协方差 (Covariance) 和相关系数 (Correlation Coefficient)。然后回答一个常见误解：相关系数为零，是否意味着两者没有关系。

## 直觉怎么理解

把两个向量逐分量相乘再求和，会出现三种情况：

- 对应分量同号且都较大时，乘积为正且大，总和就大；
- 符号杂乱时，正负互相抵消，总和接近零；
- 系统性异号时，总和为负。

所以内积衡量的是"两个模式在多大程度上对齐"。

内积有两个缺陷。

第一，它受整体偏移影响。两列彼此无关的数如果都加上 100，内积也会变得很大。

第二，它受尺度影响。把单位从米换成毫米，内积会放大 1000 倍。

协方差修正第一点：先减去各自的均值，只看"偏离平均水平的部分"是否同向。相关系数再修正第二点：除以各自的标准差，只留下方向信息。

几何上，这三步依次是：内积 → 平移到原点后的内积 → 平移到原点后的夹角余弦。

## 数学 / 几何表达

### 内积、范数与余弦

对 $x, y \in \mathbb{R}^n$：

$$
\langle x, y\rangle = x^\top y = \sum_{i=1}^n x_i y_i, \qquad \|x\| = \sqrt{\langle x, x\rangle}.
$$

余弦相似度 (Cosine Similarity) 定义为：

$$
\cos\theta = \frac{x^\top y}{\|x\|\,\|y\|}.
$$

要说明它确实落在 $[-1, 1]$ 内，需要用到 Cauchy–Schwarz 不等式。

### Cauchy–Schwarz 不等式

设 $y \neq 0$。对任意实数 $t$，有

$$
0 \le \|x - t y\|^2 = \|x\|^2 - 2t\,\langle x, y\rangle + t^2\|y\|^2 .
$$

右边是关于 $t$ 的二次函数，并且对所有 $t$ 都非负，所以它的判别式非正：

$$
4\langle x, y\rangle^2 - 4\|x\|^2\|y\|^2 \le 0
\;\Longrightarrow\;
|\langle x, y\rangle| \le \|x\|\,\|y\| .
$$

等号成立当且仅当存在 $t$ 使 $x = t y$，即两个向量共线。

这个证明只用到了内积的三条性质：双线性、对称性、正定性。因此它对任何满足这三条的"内积"都成立，下面马上就会用到这一点。

### 协方差：随机变量上的内积

对两个方差有限的随机变量 $U, V$，定义 $\langle U, V\rangle = \mathbb{E}[UV]$。它满足双线性和对称性；并且 $\mathbb{E}[U^2] \ge 0$，等号仅在 $U = 0$ 几乎必然成立时取到。所以它是一个内积。

协方差就是中心化之后的内积：

$$
\mathrm{Cov}(X, Y) = \mathbb{E}\big[(X - \mu_X)(Y - \mu_Y)\big] = \langle X - \mu_X,\; Y - \mu_Y \rangle .
$$

展开可得常用形式 $\mathrm{Cov}(X, Y) = \mathbb{E}[XY] - \mu_X \mu_Y$。在这个内积下：

- 方差是中心化变量的范数平方：$\mathrm{Var}(X) = \|X - \mu_X\|^2$；
- 标准差 $\sigma_X$ 就是这个范数。

对 $n$ 个样本，记 $\bar{x}$ 为样本均值，中心化向量为 $\tilde{x} = x - \bar{x}\mathbf{1}$（$\tilde{y}$ 同理）。样本协方差为

$$
\widehat{\mathrm{Cov}}(x, y) = \frac{1}{n-1}\,\tilde{x}^\top \tilde{y},
$$

也就是中心化向量的内积，只差一个常数因子。

由双线性还可得 $\mathrm{Cov}(aX + b,\; cY + d) = ac\,\mathrm{Cov}(X, Y)$。可见协方差对平移不变，但对尺度敏感。

### 相关系数：中心化向量的余弦

Pearson 相关系数定义为

$$
\rho_{XY} = \frac{\mathrm{Cov}(X, Y)}{\sigma_X\,\sigma_Y}
= \frac{\langle X - \mu_X,\; Y - \mu_Y\rangle}{\|X - \mu_X\|\,\|Y - \mu_Y\|},
$$

这正是中心化后两者夹角的余弦。在样本版本中，分子和分母里的 $\frac{1}{n-1}$ 互相抵消：

$$
r = \frac{\tilde{x}^\top \tilde{y}}{\|\tilde{x}\|\,\|\tilde{y}\|}.
$$

由 Cauchy–Schwarz 立即得到 $|\rho| \le 1$。$|\rho| = 1$ 当且仅当 $Y - \mu_Y = t\,(X - \mu_X)$ 几乎必然成立，即 $Y = aX + b$（$a \neq 0$）。

再由上面的尺度公式，$\rho(aX + b,\; cY + d) = \operatorname{sign}(ac)\,\rho(X, Y)$，量纲被完全消去。

三步可以总结为：

| 步骤 | 表达式 | 几何含义 |
|---|---|---|
| 内积 | $x^\top y$ | 未经处理的对齐程度 |
| 中心化 → 协方差 | $\frac{1}{n-1}\tilde{x}^\top \tilde{y}$ | 平移到均值后的对齐程度 |
| 归一化 → 相关系数 | $\tilde{x}^\top \tilde{y} \,/\, (\lVert\tilde{x}\rVert\,\lVert\tilde{y}\rVert)$ | 平移后夹角的余弦 |

### 协方差矩阵

对随机向量 $\mathbf{x} \in \mathbb{R}^d$，协方差矩阵为 $\Sigma = \mathbb{E}\big[(\mathbf{x} - \mu)(\mathbf{x} - \mu)^\top\big]$，其中 $\Sigma_{ij} = \mathrm{Cov}(x_i, x_j)$。后文会用到它的两条性质。

**线性变换。** 对 $\mathbf{y} = A\mathbf{x} + b$，

$$
\mathrm{Cov}(A\mathbf{x} + b) = \mathbb{E}\big[A(\mathbf{x} - \mu)(\mathbf{x} - \mu)^\top A^\top\big] = A\,\Sigma\,A^\top .
$$

**半正定。** 对任意 $v$，$v^\top \Sigma v = \mathrm{Var}(v^\top \mathbf{x}) \ge 0$。因此 $\Sigma$ 可以正交对角化为 $\Sigma = U \Lambda U^\top$：特征向量是方差的主方向，特征值是该方向上的方差。

### 相关为零不等于无关

设 $X$ 关于 0 对称分布，即 $\mathbb{E}[X] = 0$、$\mathbb{E}[X^3] = 0$，再令 $Y = X^2$。则

$$
\mathrm{Cov}(X, X^2) = \mathbb{E}[X^3] - \mathbb{E}[X]\,\mathbb{E}[X^2] = 0 .
$$

协方差严格等于 0，但 $Y$ 完全由 $X$ 决定。

原因在于：协方差只度量线性方向上的共同变化。$X$ 为正和为负时，$Y$ 随 $X$ 变化的方向相反，两部分正好抵消。

只有在特殊情形下（例如 $X, Y$ 联合高斯），零相关才等价于独立。要度量一般形式的依赖，需要第 4 章的[互信息](/zh/notes/mutual-information/)。

## 机器人中的例子

### 状态估计中的不确定性传播

扩展卡尔曼滤波 (Extended Kalman Filter, EKF) 的运动模型为 $\mathbf{x}_k = f(\mathbf{x}_{k-1}, \mathbf{u}_k) + \mathbf{w}_k$，其中 $\mathbf{w}_k \sim \mathcal{N}(0, Q)$。在当前估计处线性化，得到雅可比矩阵 $F = \partial f / \partial \mathbf{x}$。由上面的线性变换性质，预测步的协方差为

$$
P_{k\mid k-1} = F\,P_{k-1\mid k-1}\,F^\top + Q .
$$

在 SLAM 中，协方差描述位姿和地标位置的不确定性。ROS 2 的 `geometry_msgs/msg/PoseWithCovariance`（`nav_msgs/msg/Odometry` 的 `pose` 字段就是这个类型）携带一个 $6 \times 6$ 协方差矩阵，按行展开存为 36 个数。

数据关联时，常用马氏距离 (Mahalanobis Distance) 做门限：

$$
d^2 = (\mathbf{z} - \hat{\mathbf{z}})^\top S^{-1} (\mathbf{z} - \hat{\mathbf{z}}),
$$

其中 $S$ 是新息协方差。设 $S = LL^\top$（Cholesky 分解），则 $d^2 = \|L^{-1}(\mathbf{z} - \hat{\mathbf{z}})\|^2$。也就是说，马氏距离是用协方差"白化"之后的欧氏距离。

在高斯假设下，$d^2$ 服从自由度为观测维数的 $\chi^2$ 分布，门限可以直接查表。

### 点云法向量估计

取一点的 $k$ 个近邻 $p_1, \dots, p_k$，均值为 $\bar{p}$。拟合一个过 $\bar{p}$ 的平面，使各点到平面距离的平方和最小：

$$
\min_{\|n\| = 1}\; \sum_{i=1}^k \big(n^\top (p_i - \bar{p})\big)^2
= \min_{\|n\| = 1}\; n^\top C\, n,
\qquad
C = \sum_{i=1}^k (p_i - \bar{p})(p_i - \bar{p})^\top .
$$

$C$ 是样本协方差矩阵的 $k - 1$ 倍。构造拉格朗日函数 $n^\top C n - \lambda(n^\top n - 1)$，对 $n$ 求梯度并令其为零，得到 $C n = \lambda n$，此时目标值恰好为 $\lambda$。

因此法向量就是 $C$ 的最小特征值对应的特征向量。最小特征值占三个特征值之和的比例，常用作局部平坦程度的指标。

这正是 Hoppe 等 (1992) 使用的方法，也是 PCL 和 Open3D 中法向量估计的基础。无人机 LiDAR 点云的地面分割和平面拟合都会用到它。

## 可视化 / 代码

下面的代码依次验证四件事：相关系数等于中心化向量的余弦；协方差对尺度敏感而相关系数不敏感；$Y = X^2$ 的情形；用最小特征向量估计平面法向量。

```python
import numpy as np

rng = np.random.default_rng(0)

# 1. 相关系数 = 中心化向量的余弦
x = rng.standard_normal(1000)
y = 2.0 * x + rng.standard_normal(1000)
xc, yc = x - x.mean(), y - y.mean()
cos_centered = xc @ yc / (np.linalg.norm(xc) * np.linalg.norm(yc))
print(cos_centered, np.corrcoef(x, y)[0, 1])          # 两者相同

# 2. 换单位：协方差放大 1000 倍，相关系数不变
print(np.cov(x, y)[0, 1], np.cov(1000 * x, y)[0, 1])
print(np.corrcoef(1000 * x, y)[0, 1])

# 3. Y = X^2：完全依赖，但相关系数约为 0
u = rng.uniform(-1, 1, 100_000)
print(np.corrcoef(u, u**2)[0, 1])

# 4. 平面法向量 = 协方差矩阵最小特征值对应的特征向量
n_true = np.array([1.0, 2.0, 2.0]) / 3.0
_, _, Vt = np.linalg.svd(n_true[None, :])               # Vt[1:] 张成平面
coeffs = rng.uniform(-1, 1, (500, 2))
noise = 0.01 * rng.standard_normal((500, 1))
P = coeffs @ Vt[1:] + noise * n_true
evals, evecs = np.linalg.eigh(np.cov(P.T))              # 特征值升序
print(evals, abs(evecs[:, 0] @ n_true))                 # 最后一项约为 1
```

## 参考资料

1. Hoppe, H., DeRose, T., Duchamp, T., McDonald, J., & Stuetzle, W. (1992). Surface reconstruction from unorganized points. *Proceedings of SIGGRAPH '92*, 71–78.
2. Thrun, S., Burgard, W., & Fox, D. (2005). *Probabilistic Robotics*. MIT Press.
3. Wasserman, L. (2004). *All of Statistics*. Springer.
4. Strang, G. (2016). *Introduction to Linear Algebra* (5th ed.). Wellesley-Cambridge Press.
5. StatQuest（YouTube 频道）：协方差与相关系数的入门视频。https://www.youtube.com/@statquest
