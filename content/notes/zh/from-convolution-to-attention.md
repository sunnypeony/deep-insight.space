---
title: 从卷积到注意力
summary: 卷积层用共享的学习模板与局部区域做内积，注意力则用由输入生成的 query 与 key 两两做内积，再按 softmax 权重聚合。本章推导两者的形式、√d 缩放的来源和置换等变性，并讨论"关系度量"能在多大程度上解释两类网络的成功。
date: 2026-10-12
topic: foundations
tags: [cnn, transformer, attention, deep-learning]
draft: false
series: relationship-modeling
seriesOrder: 3
---

## 问题是什么

Transformer 的注意力 (Attention) 与 CNN 的卷积，看起来是两种完全不同的运算。从前两章的角度看，它们是不是同一类东西？如果是，差别在哪里？"关系度量"这条主线，又能在多大程度上解释两类网络的成功？

## 直觉怎么理解

卷积层像一组固定的"探测器"。每个滤波器是训练出来的一个小模板，在图像各处滑动，问"这里像不像我"。模板在训练结束后就固定了，与输入无关；比较只发生在局部邻域。

注意力把"模板"也交给输入来生成。每个位置（token）同时扮演三个角色：

- 用 query 表达"我在找什么"；
- 用 key 表达"我能提供什么"；
- 用 value 携带"真正被传递的内容"。

位置 $i$ 拿自己的 query 与所有位置的 key 比较，按匹配程度从各个位置取回 value。

经典例句 "The animal didn't cross the street because it was tired" 中，处理 "it" 时，它的 query 与 "animal" 的 key 匹配程度高。于是 "animal" 的信息被更多地聚合到 "it" 的新表示里。

所以二者都在做"比较 → 打分 → 聚合"，差别在于比较的对象和范围：

- 卷积是"固定模板 vs 局部数据"；
- 注意力是"数据 vs 数据"，而且范围是全局的。

每一层注意力都相当于根据当前输入，重新画一张"谁和谁交流"的图。

## 数学 / 几何表达

### 卷积层是一组模板匹配

设输入为 $X \in \mathbb{R}^{H \times W \times C_{\text{in}}}$，卷积层有 $C_{\text{out}}$ 个尺寸为 $r \times r$ 的滤波器。记 $x_p \in \mathbb{R}^{r^2 C_{\text{in}}}$ 为以位置 $p$ 为中心的窗口展平后的向量。第 $k$ 个输出通道在 $p$ 处的值为

$$
y_k(p) = w_k^\top x_p + b_k, \qquad k = 1, \dots, C_{\text{out}} .
$$

每个输出都是学习模板 $w_k$ 与局部窗口的内积，也就是[第 2 章](/zh/notes/cross-correlation-and-convolution/)中未经归一化的滑动内积。卷积层内置了三条结构假设：局部性、权重共享、平移等变。

经过非线性层后逐层堆叠，感受野随之扩大。$L$ 层 $r \times r$、步长为 1 的卷积，感受野为 $1 + L(r-1)$。浅层的模板作用在像素上（如边缘），深层的模板作用在下层的响应上（如部件）。这就是组合式的层级结构 (Compositional Hierarchy)。

### 缩放点积注意力

设输入为 $X \in \mathbb{R}^{n \times d_{\text{model}}}$，每一行是一个 token。

$$
Q = XW_Q, \quad K = XW_K, \quad V = XW_V, \qquad
W_Q, W_K \in \mathbb{R}^{d_{\text{model}} \times d_k}, \;\; W_V \in \mathbb{R}^{d_{\text{model}} \times d_v},
$$

$$
\mathrm{Attn}(X) = \operatorname{softmax}\!\Big(\frac{QK^\top}{\sqrt{d_k}}\Big)\, V ,
$$

其中 softmax 按行计算。逐元素写出来：

$$
s_{ij} = \frac{q_i^\top k_j}{\sqrt{d_k}}, \qquad
a_{ij} = \frac{\exp(s_{ij})}{\sum_l \exp(s_{il})}, \qquad
z_i = \sum_j a_{ij}\, v_j .
$$

打分项可以改写为 $q_i^\top k_j = x_i^\top W_Q W_K^\top x_j$。这是关于矩阵 $M = W_Q W_K^\top$ 的双线性型。

$M$ 一般既不对称也不半正定，所以严格来说它不是一个内积，而是一种"学到的相容度"。但它的计算形式和作用，与前两章的内积打分是一样的。

### √d_k 从何而来

在初始化阶段可以粗略假设：$q$ 与 $k$ 的各分量相互独立，均值为 0，方差为 1。于是每一项满足

$$
\mathbb{E}[q_l k_l] = \mathbb{E}[q_l]\,\mathbb{E}[k_l] = 0, \qquad
\mathrm{Var}(q_l k_l) = \mathbb{E}[q_l^2]\,\mathbb{E}[k_l^2] - 0 = 1 .
$$

各项相互独立，方差可以相加，因此

$$
\mathbb{E}[q^\top k] = 0, \qquad \mathrm{Var}(q^\top k) = d_k .
$$

点积的标准差为 $\sqrt{d_k}$，除以 $\sqrt{d_k}$ 之后，无论 $d_k$ 多大，打分的方差都保持为 1。

为什么要控制方差？看 softmax 在同一行内的雅可比矩阵：

$$
\frac{\partial a_i}{\partial s_j} = a_i\,(\delta_{ij} - a_j).
$$

如果打分的差距很大，softmax 会接近 one-hot：某一项的 $a_i \approx 1$，其余项 $\approx 0$。此时雅可比矩阵的所有元素都接近 0，梯度消失，训练停滞。Vaswani 等 (2017) 引入缩放因子正是出于这个原因。

### softmax 是"软"的 argmax

引入温度 $\tau$，考虑 $\operatorname{softmax}(s/\tau)$：

- $\tau \to 0$ 时趋于 argmax 处的 one-hot，即只取最匹配的那个位置，相当于第 2 章模板匹配中取峰值；
- $\tau \to \infty$ 时趋于均匀平均。

注意力介于两者之间：它是一种可微的加权检索，因此可以用梯度训练。

### 注意力是一种核平滑

令 $\kappa(q, k) = \exp\!\big(q^\top k / \sqrt{d_k}\big)$，注意力的输出可以写成

$$
z_i = \frac{\sum_j \kappa(q_i, k_j)\, v_j}{\sum_j \kappa(q_i, k_j)} .
$$

这与 Nadaraya–Watson 核回归的形式一致：

$$
\hat{f}(x) = \frac{\sum_j K(x, x_j)\, y_j}{\sum_j K(x, x_j)} ,
$$

即在 $x$ 处的预测是已观测值 $y_j$ 按相似度加权的平均。注意力就是 query、key 和核都由学习得到的核平滑 (Kernel Smoothing)，Tsai 等 (2019) 对此做了系统分析。

核函数 $K(x, y)$ 是"相似度"最一般的数学形式，这也是本系列以相似度度量为主线的理由。

### 置换等变与位置编码

设 $P$ 为置换矩阵，即对 token 重新排序。则

$$
\mathrm{Attn}(PX)
= \operatorname{softmax}\!\Big(\frac{PQK^\top P^\top}{\sqrt{d_k}}\Big) PV
= P\,\operatorname{softmax}\!\Big(\frac{QK^\top}{\sqrt{d_k}}\Big) P^\top P\, V
= P\,\mathrm{Attn}(X).
$$

中间一步成立，是因为按行计算的 softmax 与同时置换行和列可交换（每行的元素只是换了顺序）；最后一步用到 $P^\top P = I$。

这说明注意力本身不感知顺序和空间位置，必须额外加入位置编码 (Positional Encoding)。对比来看：卷积内置了局部性和平移等变，注意力只有置换等变，归纳偏置弱得多。

Cordonnier 等 (2020) 证明：带相对位置编码、含 $N_h$ 个头的多头自注意力，可以表达任意 $\sqrt{N_h} \times \sqrt{N_h}$ 的卷积层。就表达能力而言，卷积可以看成注意力的特例：一种权重只依赖相对位置、不依赖内容的注意力。

### 对照

| | 卷积层 | 自注意力 |
|---|---|---|
| 比较对象 | 学习模板 vs 局部窗口 | query vs key，二者都由输入生成 |
| 权重是否依赖输入 | 否，训练后固定 | 是，每个输入重新计算 |
| 交互范围 | 局部邻域，靠堆叠扩大 | 全局 |
| 内置结构假设 | 局部性、权重共享、平移等变 | 仅置换等变，位置需额外编码 |
| 计算量（$n$ 个位置） | 与 $n$ 成正比 | 与 $n^2$ 成正比 |

### 这条主线能解释多少

回到系列开头的论断。"比较 → 打分 → 聚合"准确地描述了两类网络共享的核心算子，它决定了网络能表达哪一类计算。但仅凭它，不足以解释网络为什么能学好。至少还有三个因素同样关键。

**归纳偏置 (Inductive Bias) 与数据量的权衡。** CNN 的结构假设与图像的统计规律相符，因此数据效率高。Dosovitskiy 等 (2021) 报告：在 ImageNet 这类中等规模数据上、没有强正则化时，ViT 的精度比同等规模的 ResNet 低几个百分点；在更大规模的数据上预训练之后，ViT 才达到或超过 CNN。弱偏置意味着结构需要从数据中学出来。

**可优化性。** 深层网络之所以能训练，依赖残差连接 (He 等, 2016) 和归一化（BatchNorm、LayerNorm）。Transformer 的每个块都是"残差 + LayerNorm"的结构；去掉它们，深层的注意力堆叠很难训练。

**规模与硬件。** 注意力的主体是大规模矩阵乘法，非常适合 GPU 并行，性能可以随数据量和算力持续提升。

所以"相关性是 CNN 和 Transformer 成功的隐藏底层逻辑"这一直觉，抓住的是前一半：它们算的是什么。后一半，也就是它们为什么学得好，还要看结构假设、优化性质和规模。

## 机器人中的例子

### 视觉骨干网络

ViT 以及 CNN–Transformer 混合结构，已经广泛用作检测、分割和深度估计的骨干网络。对机器人而言，选择的依据往往正是上一节的权衡：数据少、算力受限的机载平台更依赖卷积的归纳偏置；数据充足时，注意力的全局建模能力更有优势。

### 特征匹配：学习到的互相关

SfM 和视觉定位都需要两幅图像之间的对应关系。第 2 章的 NCC 比较的是固定窗口内的原始像素。

SuperGlue (Sarlin 等, 2020) 用交替的自注意力和交叉注意力更新两幅图像中的关键点描述子。自注意力在同一幅图像内交互；交叉注意力的 query 来自图像 A，key 和 value 来自图像 B。随后用最优传输（Sinkhorn 迭代）求解匹配分配。

LoFTR (Sun 等, 2021) 不使用关键点检测器。它在 CNN 提取的粗分辨率特征图上，用 Transformer 做自注意力和交叉注意力，再由粗到细地得到稠密匹配。在弱纹理区域，它的表现明显优于基于检测器的方法。

交叉注意力的计算是：对 A 中每个特征，计算它与 B 中所有特征的相似度，再加权聚合。这可以看作一种全局的、依赖上下文的互相关。它与 NCC 的区别在于，参与比较的不是原始像素，而是以整幅图像为条件学出来的表示。因此重复纹理和弱纹理造成的歧义，可以借助上下文来消除。

## 可视化 / 代码

下面用 NumPy 实现单头注意力，依次验证三件事：每行权重和为 1；置换等变；$\sqrt{d_k}$ 缩放使打分方差保持为 1。

```python
import numpy as np

rng = np.random.default_rng(0)

def softmax(s, axis=-1):
    s = s - s.max(axis=axis, keepdims=True)    # 数值稳定
    e = np.exp(s)
    return e / e.sum(axis=axis, keepdims=True)

def attention(X, Wq, Wk, Wv):
    Q, K, V = X @ Wq, X @ Wk, X @ Wv
    A = softmax(Q @ K.T / np.sqrt(K.shape[1]))
    return A @ V, A

n, d_model, d_k = 6, 16, 8
X = rng.standard_normal((n, d_model))
Wq, Wk, Wv = (rng.standard_normal((d_model, d_k)) / np.sqrt(d_model) for _ in range(3))

Z, A = attention(X, Wq, Wk, Wv)
print(A.sum(axis=1))                         # 每行和为 1

# 置换等变：Attn(PX) = P Attn(X)
P = np.eye(n)[rng.permutation(n)]
Zp, _ = attention(P @ X, Wq, Wk, Wv)
print(np.allclose(Zp, P @ Z))                # True

# 点积方差随 d 增长，除以 sqrt(d) 后约为 1
for d in [4, 64, 1024]:
    q = rng.standard_normal((10_000, d))
    k = rng.standard_normal((10_000, d))
    s = (q * k).sum(axis=1)
    print(d, s.var().round(1), (s / np.sqrt(d)).var().round(2))
```

用 matplotlib 可以把注意力矩阵画成热力图，第 $i$ 行就是 token $i$ 从各个位置取回信息的比例：

```python
import matplotlib.pyplot as plt

plt.imshow(A, cmap="viridis")
plt.xlabel("key j")
plt.ylabel("query i")
plt.colorbar(label="a_ij")
plt.show()
```

## 参考资料

1. Vaswani, A., et al. (2017). Attention is all you need. *Advances in Neural Information Processing Systems (NeurIPS)*.
2. LeCun, Y., Bottou, L., Bengio, Y., & Haffner, P. (1998). Gradient-based learning applied to document recognition. *Proceedings of the IEEE*, 86(11), 2278–2324.
3. Dosovitskiy, A., et al. (2021). An image is worth 16x16 words: Transformers for image recognition at scale. *ICLR*.
4. Cordonnier, J.-B., Loukas, A., & Jaggi, M. (2020). On the relationship between self-attention and convolutional layers. *ICLR*.
5. Tsai, Y.-H. H., Bai, S., Yamada, M., Morency, L.-P., & Salakhutdinov, R. (2019). Transformer dissection: An unified understanding for Transformer's attention via the lens of kernel. *EMNLP-IJCNLP*.
6. He, K., Zhang, X., Ren, S., & Sun, J. (2016). Deep residual learning for image recognition. *CVPR*.
7. Ba, J. L., Kiros, J. R., & Hinton, G. E. (2016). Layer normalization. arXiv:1607.06450.
8. Sarlin, P.-E., DeTone, D., Malisiewicz, T., & Rabinovich, A. (2020). SuperGlue: Learning feature matching with graph neural networks. *CVPR*.
9. Sun, J., Shen, Z., Wang, Y., Bao, H., & Zhou, X. (2021). LoFTR: Detector-free local feature matching with transformers. *CVPR*.
10. Nadaraya, E. A. (1964). On estimating regression. *Theory of Probability & Its Applications*, 9(1); Watson, G. S. (1964). Smooth regression analysis. *Sankhyā, Series A*, 26(4).
11. Alammar, J. (2018). The Illustrated Transformer. https://jalammar.github.io/illustrated-transformer/
12. 3Blue1Brown. Neural networks（系列视频，含 Transformer 与注意力章节）。https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi
