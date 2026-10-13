---
title: 互相关与卷积：滑动的内积
summary: 在内积上加入平移就得到互相关，把核翻转就得到卷积。本章推导两者的关系、线性时不变系统与卷积的等价性，并说明归一化互相关就是窗口上的相关系数，以及它在模板匹配和立体匹配中的用法。
date: 2026-10-12
topic: foundations
tags: [cross-correlation, convolution, template-matching, stereo]
draft: false
series: relationship-modeling
seriesOrder: 2
---

## 问题是什么

两个信号形状相同，只是位置错开，怎样找出错开了多少？更一般地，怎样在一幅图像中找到某个模式出现的位置？

[第 1 章](/zh/notes/inner-product-covariance-correlation/)中的内积只能比较已经对齐的两个向量。本章加入平移这一个操作，得到互相关 (Cross-correlation)。然后说明卷积 (Convolution) 与互相关只差一次翻转，以及为什么 CNN 中的"卷积"实际计算的是互相关。

## 直觉怎么理解

拿一个短模板在长信号上滑动。每滑到一个位置，就把模板与它覆盖的那一段做一次内积。这样得到一条"匹配程度随位置变化"的曲线，峰值所在就是最佳对齐位置。二维情形同理：模板在图像上逐像素滑动，输出一张响应图。

卷积的计算过程几乎相同，只是模板在滑动前要先翻转：一维是首尾颠倒，二维是旋转 180°。这个翻转来自卷积在系统理论中的含义。卷积描述的是"每个输入脉冲在之后各时刻留下的响应如何叠加"，响应的时间方向与输入相反。

直接做互相关有一个问题：图像中较亮的区域，不论形状如何，乘积和都偏大。把模板和窗口都先中心化、再归一化，这个问题就消失了。而这样处理之后得到的量，恰好就是第 1 章的相关系数。

## 数学 / 几何表达

### 定义

对实值离散信号 $f, g$，定义

$$
(f \star g)[n] = \sum_m f[m]\, g[m+n], \qquad (f \ast g)[n] = \sum_m f[m]\, g[n-m].
$$

不同教材的平移约定不完全一致，差别只在 $n$ 的符号。

令 $\bar{f}[m] = f[-m]$ 为翻转后的信号，则

$$
(\bar{f} \ast g)[n] = \sum_m f[-m]\, g[n-m] \overset{k = -m}{=} \sum_k f[k]\, g[n+k] = (f \star g)[n].
$$

也就是说，与 $f$ 做互相关，等于与翻转后的 $f$ 做卷积。

二维情形下，设图像为 $I$，核为 $K$，下标 $i, j \in \{-r, \dots, r\}$：

$$
S_\star[u, v] = \sum_{i,j} K[i,j]\; I[u+i,\, v+j], \qquad
S_\ast[u, v] = \sum_{i,j} K[i,j]\; I[u-i,\, v-j].
$$

固定位置 $(u, v)$，记 $I_{u,v}$ 为以 $(u, v)$ 为中心、与 $K$ 同尺寸的窗口。$S_\star[u, v]$ 就是 $K$ 与这个窗口展平后的内积：

$$
S_\star[u, v] = \big\langle \operatorname{vec}(K),\; \operatorname{vec}(I_{u,v}) \big\rangle .
$$

这就是"滑动的内积"。

### 为什么 CNN 中翻不翻转无关紧要

卷积层的核是可学习参数。用卷积训练得到核 $K$，与用互相关训练得到翻转核 $\bar{K}$，表示的是同一个函数。两种参数化之间一一对应，梯度下降会自动学到相应的版本。

因此深度学习框架（例如 PyTorch 的 `Conv2d`）直接实现互相关，省去翻转这一步。Goodfellow 等的《Deep Learning》第 9 章也明确说明了这一点。后文提到"卷积层"时，计算上指的都是互相关。

### 卷积的代数性质与平移等变

翻转换来了更好的代数性质。卷积满足交换律和结合律：

$$
f \ast g = g \ast f, \qquad (f \ast g) \ast h = f \ast (g \ast h).
$$

结合律意味着两个级联的滤波器可以合并成一个。互相关不满足交换律，而是 $(f \star g)[n] = (g \star f)[-n]$。

**线性时不变系统等价于卷积。** 设系统 $T$ 线性且时不变 (Linear Time-Invariant, LTI)，其单位脉冲响应为 $h = T(\delta)$。任意输入都可以分解为脉冲的叠加：$x[n] = \sum_k x[k]\,\delta[n-k]$。

- 由线性，$T(x) = \sum_k x[k]\; T(\delta[\cdot - k])$；
- 由时不变，$T(\delta[\cdot - k])[n] = h[n-k]$。

合起来得 $y = x \ast h$。所以任何 LTI 系统都是一个卷积；反过来，卷积显然是 LTI 的。

**平移等变 (Translation Equivariance)。** 记平移算子为 $(\tau_s x)[n] = x[n-s]$，则

$$
\big((\tau_s x) \ast h\big)[n] = \sum_m x[m-s]\; h[n-m] = (x \ast h)[n-s] = \big(\tau_s (x \ast h)\big)[n].
$$

中间一步做了换元 $m' = m - s$。互相关同样满足这一性质。

它的含义是：输入平移多少，输出就平移多少。同一个模式无论出现在哪里，都会在对应位置产生相同的响应。这是[第 3 章](/zh/notes/from-convolution-to-attention/)讨论 CNN 归纳偏置的出发点。

**频域。** 由卷积定理，$\mathcal{F}\{f \ast g\} = \mathcal{F}\{f\}\cdot\mathcal{F}\{g\}$。对实信号，按上面的定义有 $\mathcal{F}\{f \star g\} = \overline{\mathcal{F}\{f\}}\cdot\mathcal{F}\{g\}$。模板较大时，可以用 FFT 加速匹配。

### 归一化互相关就是窗口上的相关系数

设模板 $T$ 含 $N$ 个像素，$W_{u,v}$ 为对应位置的窗口。直接计算的 $\sum T \cdot W$ 在亮区域普遍偏大。去掉均值并除以尺度，就得到归一化互相关 (Normalized Cross-Correlation, NCC)：

$$
\mathrm{NCC}(u, v) =
\frac{\sum_{i,j} \big(T[i,j] - \bar{T}\big)\big(W_{u,v}[i,j] - \bar{W}_{u,v}\big)}
{\sqrt{\sum_{i,j} \big(T[i,j] - \bar{T}\big)^2}\;\sqrt{\sum_{i,j} \big(W_{u,v}[i,j] - \bar{W}_{u,v}\big)^2}} .
$$

把 $N$ 个像素对 $(T[i,j],\, W_{u,v}[i,j])$ 看作 $N$ 个配对样本，这个式子正是第 1 章的样本相关系数 $r$。因此 NCC 直接继承了相关系数的性质：

- $\mathrm{NCC} \in [-1, 1]$；它等于 1 当且仅当 $W = aT + b$ 且 $a > 0$。
- 对窗口亮度的仿射变化 $W \to aW + b$（$a > 0$）保持不变，所以对曝光增益和整体光照偏移是稳健的。

**与差的平方和 (Sum of Squared Differences, SSD) 的关系。** 设 $\hat{t}, \hat{w}$ 分别是中心化并归一化到单位长度后的模板和窗口向量，则

$$
\|\hat{t} - \hat{w}\|^2 = \|\hat{t}\|^2 + \|\hat{w}\|^2 - 2\,\hat{t}^\top \hat{w} = 2 - 2\,\mathrm{NCC}.
$$

所以在归一化之后，"差的平方和最小"与"相关最大"是同一个准则。

## 机器人中的例子

### 模板匹配

当目标的外观已知时（例如降落标志、标记板的边框、充电桩上的标识），NCC 模板匹配是最直接的检测方法。

它的局限是没有旋转和尺度不变性。通常需要准备多尺度、多角度的模板，或者改用特征点方法。

### 双目立体匹配

在校正后的双目图像中，同一个空间点只在同一行上产生水平偏移，这个偏移量就是视差 (Disparity) $d$。

设左图像素为 $(u, v)$，其中 $u$ 为列坐标。在右图的同一行上搜索：

$$
d^\ast(u, v) = \arg\max_{d \in [0,\, d_{\max}]} \;\mathrm{NCC}\big(W^{L}_{u,v},\; W^{R}_{u-d,\,v}\big),
$$

深度由 $Z = fB/d$ 得到，其中 $f$ 是以像素为单位的焦距，$B$ 是基线长度。

这一步是 Scharstein 与 Szeliski (2002) 的分类框架中的第一步。该框架把立体匹配分为四步：匹配代价计算、代价聚合、视差计算、视差优化。NCC、SAD 和 census 都是常用的匹配代价。当左右相机曝光不一致时，NCC 比 SAD 更稳健，原因正是上面的仿射不变性。

多视图稠密重建（例如基于 PatchMatch 的 MVS）在评价邻域视图之间的光度一致性时，也常用 NCC 打分。

## 可视化 / 代码

第一段代码验证：互相关等于与翻转核做卷积。

```python
import numpy as np
from scipy.signal import correlate2d, convolve2d

rng = np.random.default_rng(0)
I = rng.standard_normal((32, 32))
K = rng.standard_normal((3, 3))

corr = correlate2d(I, K, mode="valid")
conv = convolve2d(I, K[::-1, ::-1], mode="valid")   # 核旋转 180°
print(np.allclose(corr, conv))                       # True
```

第二段代码手写 NCC，与 OpenCV 的 `TM_CCOEFF_NORMED` 对照，并验证 NCC 对亮度仿射变化不变。

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
print(np.abs(mine - ref).max())                          # 约 1e-6
print(np.unravel_index(mine.argmax(), mine.shape))       # (40, 70)

# 模板亮度做仿射变化，峰值位置和峰值不变
tpl2 = 0.5 * tpl + 0.2
res2 = cv2.matchTemplate(img, tpl2, cv2.TM_CCOEFF_NORMED)
print(np.unravel_index(res2.argmax(), res2.shape), res2.max())   # (40, 70)，约 1.0
```

## 参考资料

1. Lewis, J. P. (1995). Fast normalized cross-correlation. *Vision Interface*.
2. Scharstein, D., & Szeliski, R. (2002). A taxonomy and evaluation of dense two-frame stereo correspondence algorithms. *International Journal of Computer Vision*, 47(1–3), 7–42.
3. Oppenheim, A. V., Willsky, A. S., & Nawab, S. H. (1997). *Signals and Systems* (2nd ed.). Prentice Hall.
4. Goodfellow, I., Bengio, Y., & Courville, A. (2016). *Deep Learning*, Chapter 9. MIT Press. https://www.deeplearningbook.org/
5. Szeliski, R. (2022). *Computer Vision: Algorithms and Applications* (2nd ed.). Springer.
