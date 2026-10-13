---
title: 基于图像的三维重建
summary: 从一组照片恢复相机位姿与场景的几何和外观。本系列沿经典流水线逐章展开：成像模型、对极几何、特征匹配、双目、运动恢复结构、稠密重建、表面重建与纹理生成。
topic: perception
date: 2026-10-12
draft: false
---

## 这个系列要回答的问题

给定一组从不同位置拍摄的同一场景的照片，能否恢复出：每张照片拍摄时相机在哪里、朝向哪里；场景本身的三维形状；以及场景表面的颜色？

成像是一个从三维到二维的投影过程，单张图像丢失了深度。基于图像的三维重建 (Image-based 3D Reconstruction) 是它的逆问题：利用多个视角之间的几何约束，把丢失的深度找回来。本系列不把各个算法当作孤立的知识点，而是按照一条完整的流水线来讲。每一章的输出，都是下一章的输入。

## 整条流水线

| 章 | 阶段 | 输入 | 输出 | 核心方法 |
|---|---|---|---|---|
| 1 | 成像模型与标定 | 标定板图像 | 内参矩阵 $K$、畸变系数 | 针孔模型、张正友标定法 |
| 2 | 对极几何 | 两视图间的对应点 | 基础矩阵 $F$ / 本质矩阵 $E$、相对位姿、三角化点 | 八点法、五点法、三角化 |
| 3 | 图像特征 | 原始图像 | 关键点、描述子、经过几何校验的匹配 | SIFT、RANSAC |
| 4 | 双目立体视觉 | 已标定的双目图像对 | 视差图、深度图 | 极线校正、立体匹配 |
| 5 | 运动恢复结构 | 无序图像集合 | 全部相机位姿、稀疏点云 | 增量式 SfM、光束法平差 |
| 6 | 稠密点云重建 | 图像与相机位姿 | 逐像素深度图、稠密点云 | 光度一致性、PatchMatch |
| 7 | 表面重建 | 带法向的稠密点云 | 三角网格 | 泊松表面重建 |
| 8 | 纹理图像生成 | 网格、图像与相机位姿 | 带纹理贴图的网格 | 视角选择、接缝处理 |

章节顺序有两处需要说明。

第一，第 2 章假设两张图像之间的对应点已经给定，只讨论"有了对应点能推出什么"；第 3 章再回答"对应点从哪里来"。先讲几何、后讲特征，是为了让读者在学习特征匹配时已经知道几何校验 (Geometric Verification) 在校验什么。

第二，双目立体视觉（第 4 章）是两视图几何的一个特例：两台相机的相对位姿 $(R, \mathbf{t})$ 已经通过标定得到，经过极线校正后，对应点的搜索从二维退化为沿水平扫描线的一维搜索。运动恢复结构 (Structure from Motion, SfM)（第 5 章）则处理更一般的情形：相机位姿未知，图像数量多且无序。

## 贯穿全系列的三个概念

整条流水线可以用三个概念串起来：投影、对应、优化。

### 投影

针孔相机模型 (Pinhole Camera Model) 把世界坐标系中的点 $\mathbf{X} = (X, Y, Z)^\top$ 映射为图像上的像素 $\mathbf{x} = (u, v)^\top$。用齐次坐标 (Homogeneous Coordinates) 写作：

$$
\lambda \begin{bmatrix} u \\ v \\ 1 \end{bmatrix}
= K \begin{bmatrix} R & \mathbf{t} \end{bmatrix}
\begin{bmatrix} \mathbf{X} \\ 1 \end{bmatrix},
\qquad
K = \begin{bmatrix} f_x & s & c_x \\ 0 & f_y & c_y \\ 0 & 0 & 1 \end{bmatrix}
$$

其中 $(R, \mathbf{t})$ 是外参 (Extrinsics)，描述世界坐标系到相机坐标系的刚体变换；$K$ 是内参 (Intrinsics)，描述相机坐标系到像素坐标系的映射；$\lambda$ 是该点在相机坐标系下的深度。投影把三维点压缩到一条过光心的射线上，$\lambda$ 的信息就此丢失。第 1 章展开这个模型并加入镜头畸变，外参部分的刚体变换与 [坐标变换](/zh/topics/transforms/) 中的内容完全一致。

### 对应

如果同一个三维点在两张图像中的像素位置分别是 $\mathbf{x}_1$ 和 $\mathbf{x}_2$，两条反投影射线必然相交于这个点。这一约束的代数形式是对极约束 (Epipolar Constraint)：

$$
\tilde{\mathbf{x}}_2^\top F \, \tilde{\mathbf{x}}_1 = 0,
\qquad
F = K_2^{-\top} [\mathbf{t}]_\times R \, K_1^{-1}
$$

其中 $(R, \mathbf{t})$ 是从相机 1 到相机 2 的相对位姿，$[\mathbf{t}]_\times$ 是 $\mathbf{t}$ 的反对称矩阵。去掉内参后得到本质矩阵 (Essential Matrix) $E = [\mathbf{t}]_\times R$。对极约束说明：给定 $\mathbf{x}_1$，它在第二张图中的对应点只可能落在一条直线上。第 2 章由此恢复相对位姿，第 4 章利用它把立体匹配化简为一维搜索，第 6 章在多视图间用它约束深度搜索的范围。

找到正确的对应关系，是整条流水线中最不稳定的一环：重复纹理、光照变化和遮挡都会产生错误匹配。第 3 章讨论如何通过特征描述子和 RANSAC 得到可靠的对应。

### 优化

线性方法（八点法、DLT 三角化等）给出闭式解，但它们最小化的是代数误差，没有直接的几何意义，并且对噪声敏感。实际系统用它们作为初值，再最小化重投影误差 (Reprojection Error)：

$$
\min_{\{R_i, \mathbf{t}_i\}, \{\mathbf{X}_j\}}
\sum_{(i,j) \in \mathcal{V}}
\rho\left( \left\| \mathbf{x}_{ij} - \pi(K_i, R_i, \mathbf{t}_i, \mathbf{X}_j) \right\|^2 \right)
$$

其中 $\pi(\cdot)$ 是上面的投影函数，$\mathcal{V}$ 是"点 $j$ 在图像 $i$ 中可见"的观测集合，$\rho(\cdot)$ 是用于抑制外点的鲁棒核函数 (Robust Kernel)。同时优化所有相机和所有三维点，就是光束法平差 (Bundle Adjustment, BA)，它是第 5 章的核心。

稠密重建阶段的优化目标从"重投影误差"变成"光度一致性 (Photo-consistency)"：如果某个像素的深度估计正确，那么把它投影到其他视图后，周围局部图像块的外观应当相似。第 6 章讨论如何高效地搜索满足这一条件的深度。

## 与神经渲染方法的关系

近年的 3D Gaussian Splatting (3DGS) 和 NeRF 等方法在新视角合成上效果显著，但它们并没有取代经典流水线，而是建立在其前半段之上。以 3DGS 为例：它的相机位姿和初始点云通常直接来自 COLMAP 的 SfM 结果，也就是本系列第 1–5 章的产物。它替换的是第 6–8 章：不再显式地估计深度、提取网格和贴纹理，而是用一组三维高斯基元表示场景，通过可微光栅化 (Differentiable Rasterization) 直接最小化渲染图像与真实照片之间的光度误差。

因此，理解经典方法有两个直接的用处。其一，SfM 失败时（例如弱纹理、重复结构、视角覆盖不足），下游的神经渲染方法也会随之失败，排查问题需要回到前半段。其二，两类方法产出的表示不同：网格是显式的表面，可以直接用于碰撞检测和物理仿真；高斯基元擅长外观渲染，但并不直接给出一个封闭的表面。

还有一个在机器人应用中容易被忽略的问题：仅靠单目图像的 SfM 只能恢复相差一个全局尺度的结构，即尺度不确定性 (Scale Ambiguity)。要得到以米为单位的重建，需要额外的度量信息，例如已知基线的双目相机、GNSS / IMU 数据或场景中已知尺寸的物体。

<!-- TODO: 补充重建结果进入仿真环境的后续环节（USDF 部分） -->

## 在 Drone Ranger 中的位置

[Drone Ranger](/zh/projects/drone-ranger/) 的仿真部分需要把真实场景重建为仿真环境中的三维场景。本系列整理的是这一环节背后的经典数学方法；项目中实际使用的 3DGS 等方法，会在项目页和后续笔记中单独讨论，并回链到本系列的对应章节。

## 阅读路线

建议按章节顺序阅读。需要的预备知识是：线性代数（特别是奇异值分解 SVD 和线性最小二乘）、非线性最小二乘的基本思路（高斯-牛顿法、Levenberg-Marquardt 法），以及三维刚体变换。刚体变换部分可以先阅读 [坐标变换](/zh/topics/transforms/)。

已经熟悉相机标定的读者可以从第 2 章开始。只关心双目深度估计的读者，可以按第 1、2、4 章的顺序阅读。第 5 章是全系列的枢纽，第 6–8 章都依赖它给出的相机位姿。

## 参考资料

1. Hartley, R., & Zisserman, A. *Multiple View Geometry in Computer Vision* (2nd ed.). Cambridge University Press, 2004. 第 1、2、5 章的主要理论来源。
2. Szeliski, R. *Computer Vision: Algorithms and Applications* (2nd ed.). Springer, 2022. 覆盖全系列，适合作为整体参考。
3. Zhang, Z. A flexible new technique for camera calibration. *IEEE TPAMI*, 22(11), 2000.
4. Lowe, D. G. Distinctive image features from scale-invariant keypoints. *IJCV*, 60(2), 2004.
5. Schönberger, J. L., & Frahm, J.-M. Structure-from-Motion Revisited. *CVPR*, 2016.
6. Schönberger, J. L., Zheng, E., Pollefeys, M., & Frahm, J.-M. Pixelwise View Selection for Unstructured Multi-View Stereo. *ECCV*, 2016.
7. Kazhdan, M., & Hoppe, H. Screened Poisson Surface Reconstruction. *ACM TOG*, 32(3), 2013.
8. Waechter, M., Moehrle, N., & Goesele, M. Let There Be Color! Large-Scale Texturing of 3D Reconstructions. *ECCV*, 2014.
9. Kerbl, B., Kopanas, G., Leimkühler, T., & Drettakis, G. 3D Gaussian Splatting for Real-Time Radiance Field Rendering. *ACM TOG*, 42(4), 2023.