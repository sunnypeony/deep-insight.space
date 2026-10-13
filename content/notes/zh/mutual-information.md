---
title: 互信息：超越线性的依赖
summary: 相关系数为零并不意味着独立。互信息用概率分布度量任意形式的统计依赖。本章推导它的三种等价定义和非负性，证明高斯情形下它完全由相关系数决定，把混淆矩阵读作联合分布，并说明它在相机–LiDAR 标定中的用法。
date: 2026-10-12
topic: foundations
tags: [mutual-information, entropy, information-theory, calibration]
draft: false
series: relationship-modeling
seriesOrder: 4
---

## 问题是什么

[第 1 章](/zh/notes/inner-product-covariance-correlation/)说明了：当 $Y = X^2$ 时，协方差为零，但 $Y$ 完全由 $X$ 决定。所以我们需要另一个量，满足两个条件：当且仅当两个变量独立时它为零；并且它不关心依赖的具体形式。这个量就是互信息 (Mutual Information)。

本章还要回答系列开头留下的两个问题：混淆矩阵 (Confusion Matrix) 与这些概念究竟是什么关系；以及关系度量、计算机制、评价工具这三个层次应该怎样区分。

## 直觉怎么理解

在知道 $X$ 之前，我们对 $Y$ 有一定的不确定性；知道 $X$ 之后，不确定性减少了。减少的量就是互信息。

- 如果 $X$ 与 $Y$ 独立，知道 $X$ 毫无帮助，互信息为零。
- 对 $Y = X^2$，知道 $X$ 后 $Y$ 就完全确定，互信息等于 $Y$ 的全部不确定性。

换一个角度：互信息衡量联合分布离"独立时的样子" $p(x)\,p(y)$ 有多远。相关系数只看散点图的线性趋势，互信息看的是联合分布的整体形状。

## 数学 / 几何表达

### 熵

对离散随机变量，熵 (Entropy) 定义为

$$
H(X) = -\sum_x p(x)\log p(x).
$$

类似地有联合熵 $H(X, Y)$ 和条件熵 $H(Y \mid X) = -\sum_{x,y} p(x,y)\log p(y \mid x)$。对数以 2 为底时，单位是比特 (bit)。

### 三种等价定义

$$
I(X;Y) = H(Y) - H(Y \mid X) = H(X) + H(Y) - H(X, Y) = \sum_{x,y} p(x,y)\,\log\frac{p(x,y)}{p(x)\,p(y)} .
$$

**第一式等于第三式。** 利用 $p(y) = \sum_x p(x,y)$：

$$
H(Y) - H(Y \mid X)
= -\sum_{x,y} p(x,y)\log p(y) + \sum_{x,y} p(x,y)\log p(y \mid x)
= \sum_{x,y} p(x,y)\log\frac{p(x,y)}{p(x)\,p(y)} .
$$

**第一式等于第二式。** 由链式法则 $H(X, Y) = H(X) + H(Y \mid X)$ 直接得到。

第三式正是 KL 散度 (Kullback–Leibler Divergence)：

$$
I(X;Y) = D_{\mathrm{KL}}\big(p_{XY} \,\big\|\, p_X\, p_Y\big),
$$

并且它关于 $X$ 和 $Y$ 对称。

### 非负性与独立性

对两个分布 $p, q$，在 $p$ 的支撑集上求和。因为 $\log$ 是凹函数，由 Jensen 不等式得

$$
-D_{\mathrm{KL}}(p \,\|\, q) = \sum_x p(x)\log\frac{q(x)}{p(x)} \le \log\sum_x p(x)\,\frac{q(x)}{p(x)} \le \log 1 = 0 .
$$

等号成立当且仅当 $q/p$ 在支撑集上为常数，即 $p = q$。

因此 $I(X;Y) \ge 0$，并且 $I(X;Y) = 0$ 当且仅当对所有 $x, y$ 都有 $p(x,y) = p(x)\,p(y)$，也就是 $X$ 与 $Y$ 独立。

这正是相关系数做不到的：相关系数为零，只能说明没有线性依赖。

### 回到 Y = X²

设 $X$ 在 $\{-1, 0, 1\}$ 上均匀分布，$Y = X^2$。由第 1 章，二者的协方差为零。

$Y$ 取值 0 的概率为 $1/3$，取值 1 的概率为 $2/3$。给定 $X$ 后 $Y$ 是确定的，所以 $H(Y \mid X) = 0$。于是

$$
I(X;Y) = H(Y) = -\tfrac13\log_2\tfrac13 - \tfrac23\log_2\tfrac23 \approx 0.918\ \text{bit}.
$$

### 高斯情形：相关系数与互信息的桥梁

对连续变量，把求和换成积分、把熵换成微分熵 $h$，互信息的定义形式不变。与微分熵本身不同，互信息仍然非负。

此外，互信息在对 $X$、$Y$ 分别做可逆变换时保持不变：$I(f(X); g(Y)) = I(X;Y)$。相比之下，相关系数只在仿射变换下不变。

$d$ 维高斯分布 $\mathcal{N}(\mu, \Sigma)$ 的微分熵为 $h = \frac12\log\big((2\pi e)^d \det\Sigma\big)$。

对二维高斯 $(X, Y)$，设标准差为 $\sigma_X, \sigma_Y$，相关系数为 $\rho$，则 $\det\Sigma = \sigma_X^2\sigma_Y^2(1 - \rho^2)$。代入得

$$
\begin{aligned}
I(X;Y) &= h(X) + h(Y) - h(X, Y) \\
&= \tfrac12\log(2\pi e\,\sigma_X^2) + \tfrac12\log(2\pi e\,\sigma_Y^2) - \tfrac12\log\!\big((2\pi e)^2\sigma_X^2\sigma_Y^2(1 - \rho^2)\big) \\
&= -\tfrac12\log(1 - \rho^2) .
\end{aligned}
$$

这个结果有三点含义：

- 对联合高斯变量，互信息只是 $|\rho|$ 的单调函数，相关系数已经包含了全部依赖信息。
- $\rho = 0 \iff I = 0 \iff$ 独立。这正是"零相关等价于独立"成立的那个特殊情形。
- $|\rho| \to 1$ 时 $I \to \infty$。连续变量之间的确定性关系对应无穷大的互信息；实际计算中得到的有限值，来自离散化或有限样本。

### 混淆矩阵是一张联合分布表

设共有 $c$ 个类别、$N$ 个样本。记 $N_{ij}$ 为真实标签为 $i$、预测为 $j$ 的样本数，令 $\hat{p}(i, j) = N_{ij}/N$。

这样得到的就是 $(Y, \hat{Y})$ 的经验联合分布：行和是真实类别的分布，列和是预测类别的分布。于是

$$
\hat{I}(Y;\hat{Y}) = \sum_{i,j}\hat{p}(i,j)\,\log\frac{\hat{p}(i,j)}{\hat{p}(i,\cdot)\,\hat{p}(\cdot,j)}, \qquad
\mathrm{Acc} = \sum_i \hat{p}(i,i).
$$

看两个二分类的例子，两个类别各 50 个样本，所以 $H(Y) = 1$ bit：

| 混淆矩阵 | 准确率 | $\hat{I}(Y;\hat{Y})$ |
|---|---|---|
| $\begin{pmatrix}40 & 10\\ 5 & 45\end{pmatrix}$ | 0.85 | ≈ 0.397 bit |
| $\begin{pmatrix}0 & 50\\ 50 & 0\end{pmatrix}$ | 0 | 1 bit |

第二个分类器把标签全部弄反了，准确率为 0，互信息却达到最大值 $H(Y)$。

原因在于：互信息衡量的是"预测告诉了我们多少关于真值的信息"，而不是"预测对不对"。把标签对调并不损失任何信息。这说明互信息不能代替准确率、精确率、召回率这些评价指标，也正好说明了下一节的层次区分。

### 三个层次

| 层次 | 概念 | 回答的问题 |
|---|---|---|
| 关系度量 | 协方差、相关系数、互信息 | 两个量之间有多少线性的或一般的依赖？ |
| 计算机制 | 互相关、卷积、注意力 | 怎样在模型中计算并利用这种关系？ |
| 评价工具 | 混淆矩阵 | 预测与真值的联合分布是什么样的？ |

一个层次的工具可以用另一个层次的语言来解读，比如从混淆矩阵计算互信息。但这并不意味着它们是同一类东西。

本系列的主线把它们连在了一起：从"两个向量长得像不像"（内积），走到了"两个随机变量之间有多少统计依赖"（互信息）。

## 机器人中的例子

### 相机–LiDAR 外参标定

目标是在不使用标定板的情况下，求出 LiDAR 到相机的外参 $(R, t)$。Pandey 等 (2012) 的做法如下。

对一组候选外参 $(R, t)$，用相机内参 $K$ 把每个 LiDAR 点 $p_i$ 投影到图像上，像素位置为 $\pi\big(K(Rp_i + t)\big)$。收集配对 $(r_i, g_i)$，其中 $r_i$ 是该点的反射率，$g_i$ 是投影位置的灰度值。估计 $(r, g)$ 的联合分布（直方图或核密度），计算互信息 $I_{R,t}(r; g)$，再求

$$
(R^\ast, t^\ast) = \arg\max_{R,\,t}\; I_{R,t}(r;\, g) .
$$

为什么这样可行？外参正确时，每个配对来自同一个物理表面点，反射率与灰度之间存在统计依赖。外参错误时，配对来自错位的表面，两者更接近独立。

为什么不用相关系数？反射率与灰度之间的关系随材质和光照而变，不一定是线性的，甚至不一定单调。互信息只要求"存在依赖"，不要求依赖的具体形式。

这一思路更早用于医学影像的多模态配准（如 CT 与 MR）：Viola 与 Wells (1997)，以及 Maes 等 (1997)。

### 估计中的注意事项

- **直方图估计 (Plug-in Estimator)**：结果依赖分箱数量，样本少时会系统性偏高，即使变量真正独立，估计值也是正的。基于 $k$ 近邻的 KSG 估计 (Kraskov 等, 2004) 是常用的替代方法。
- **优化**：互信息作为 $(R, t)$ 的目标函数是非凸的，需要较好的初值，例如来自 CAD 模型或手工测量。

## 可视化 / 代码

下面的代码依次验证三件事：直方图估计与高斯公式的对照；$Y = X^2$ 的情形；从混淆矩阵计算互信息。

```python
import numpy as np

rng = np.random.default_rng(0)

def mi_from_joint(P):
    """由（未归一化的）联合计数或概率表计算互信息，单位 bit。"""
    P = P / P.sum()
    px = P.sum(axis=1, keepdims=True)
    py = P.sum(axis=0, keepdims=True)
    nz = P > 0
    return float((P[nz] * np.log2(P[nz] / (px @ py)[nz])).sum())

def mi_hist(x, y, bins=32):
    H, _, _ = np.histogram2d(x, y, bins=bins)
    return mi_from_joint(H)

# 1. 高斯：直方图估计 vs -0.5*log2(1 - rho^2)
n = 200_000
for rho in [0.0, 0.5, 0.9]:
    x = rng.standard_normal(n)
    y = rho * x + np.sqrt(1 - rho**2) * rng.standard_normal(n)
    print(rho, round(mi_hist(x, y), 3), round(-0.5 * np.log2(1 - rho**2), 3))
# 估计值略高于理论值（0, 0.208, 1.198），rho = 0 时也是小的正数

# 2. Y = X^2：相关系数约为 0，互信息估计值很大
x = rng.uniform(-1, 1, n)
print(np.corrcoef(x, x**2)[0, 1].round(3), round(mi_hist(x, x**2), 3))
# 理论值为无穷大；估计值随分箱数增加而增大

# 3. 混淆矩阵
C = np.array([[40, 10], [5, 45]])
print(round(mi_from_joint(C), 3), np.trace(C) / C.sum())   # 约 0.397, 0.85
S = np.array([[0, 50], [50, 0]])
print(round(mi_from_joint(S), 3), np.trace(S) / S.sum())   # 1.0, 0.0
```

## 参考资料

1. Shannon, C. E. (1948). A mathematical theory of communication. *Bell System Technical Journal*, 27(3), 379–423; 27(4), 623–656.
2. Cover, T. M., & Thomas, J. A. (2006). *Elements of Information Theory* (2nd ed.). Wiley.
3. Viola, P., & Wells, W. M. (1997). Alignment by maximization of mutual information. *International Journal of Computer Vision*, 24(2), 137–154.
4. Maes, F., Collignon, A., Vandermeulen, D., Marchal, G., & Suetens, P. (1997). Multimodality image registration by maximization of mutual information. *IEEE Transactions on Medical Imaging*, 16(2), 187–198.
5. Pandey, G., McBride, J. R., Savarese, S., & Eustice, R. M. (2012). Automatic targetless extrinsic calibration of a 3D lidar and camera by maximizing mutual information. *AAAI Conference on Artificial Intelligence*.
6. Kraskov, A., Stögbauer, H., & Grassberger, P. (2004). Estimating mutual information. *Physical Review E*, 69(6), 066138.
7. StatQuest（YouTube 频道）：熵与互信息的入门视频。https://www.youtube.com/@statquest
