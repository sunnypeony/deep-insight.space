---
title: Image-Based 3D Reconstruction
summary: Recovering camera poses and scene geometry and appearance from a set of photographs. The series follows the classical pipeline chapter by chapter, from the imaging model and epipolar geometry through feature matching, stereo, structure from motion, dense reconstruction, surface reconstruction and texturing.
topic: perception
date: 2026-10-12
draft: false
---

## What this series covers

Given a set of photographs of the same scene taken from different positions, can we recover where each camera was and which way it was pointing, the three-dimensional shape of the scene, and the color of its surfaces?

Image formation is a projection from 3D to 2D, and a single image loses depth. Image-based 3D reconstruction is the inverse problem: it uses geometric constraints between multiple views to recover the lost depth. This series does not treat the individual algorithms as isolated topics. It follows one complete pipeline, in which the output of each chapter is the input of the next.

## The pipeline

| Ch. | Stage | Input | Output | Core methods |
|---|---|---|---|---|
| 1 | Imaging model and calibration | Images of a calibration target | Intrinsic matrix $K$, distortion coefficients | Pinhole model, Zhang's method |
| 2 | Epipolar geometry | Point correspondences between two views | Fundamental matrix $F$ / essential matrix $E$, relative pose, triangulated points | Eight-point algorithm, five-point algorithm, triangulation |
| 3 | Image features | Raw images | Keypoints, descriptors, geometrically verified matches | SIFT, RANSAC |
| 4 | Stereo vision | A calibrated stereo image pair | Disparity map, depth map | Rectification, stereo matching |
| 5 | Structure from motion | An unordered image collection | All camera poses, sparse point cloud | Incremental SfM, bundle adjustment |
| 6 | Dense point cloud reconstruction | Images and camera poses | Per-pixel depth maps, dense point cloud | Photo-consistency, PatchMatch |
| 7 | Surface reconstruction | Dense point cloud with normals | Triangle mesh | Poisson surface reconstruction |
| 8 | Texture map generation | Mesh, images and camera poses | Textured mesh | View selection, seam handling |

Two points about the chapter order.

First, Chapter 2 assumes that correspondences between the two images are already given and asks only what can be inferred from them; Chapter 3 then answers where the correspondences come from. Geometry comes before features so that, when you reach feature matching, you already know what geometric verification is checking.

Second, stereo vision (Chapter 4) is a special case of two-view geometry: the relative pose $(R, \mathbf{t})$ between the two cameras is known from calibration, and after rectification the search for a correspondence reduces from two dimensions to one, along a horizontal scanline. Structure from motion (SfM, Chapter 5) handles the general case: camera poses are unknown, and there are many images in no particular order.

## Three ideas that run through the series

The whole pipeline can be read through three ideas: projection, correspondence and optimization.

### Projection

The pinhole camera model maps a point $\mathbf{X} = (X, Y, Z)^\top$ in the world frame to a pixel $\mathbf{x} = (u, v)^\top$. In homogeneous coordinates:

$$
\lambda \begin{bmatrix} u \\ v \\ 1 \end{bmatrix}
= K \begin{bmatrix} R & \mathbf{t} \end{bmatrix}
\begin{bmatrix} \mathbf{X} \\ 1 \end{bmatrix},
\qquad
K = \begin{bmatrix} f_x & s & c_x \\ 0 & f_y & c_y \\ 0 & 0 & 1 \end{bmatrix}
$$

Here $(R, \mathbf{t})$ are the extrinsics, the rigid-body transform from the world frame to the camera frame; $K$ holds the intrinsics, the mapping from the camera frame to pixel coordinates; and $\lambda$ is the depth of the point in the camera frame. Projection collapses the 3D point onto a ray through the optical center, and $\lambda$ is lost. Chapter 1 develops this model and adds lens distortion. The extrinsic part is exactly the rigid-body transform covered in [Transforms](/topics/transforms/).

### Correspondence

If the same 3D point appears at pixel $\mathbf{x}_1$ in one image and $\mathbf{x}_2$ in another, the two back-projected rays must meet at that point. The algebraic form of this constraint is the epipolar constraint:

$$
\tilde{\mathbf{x}}_2^\top F \, \tilde{\mathbf{x}}_1 = 0,
\qquad
F = K_2^{-\top} [\mathbf{t}]_\times R \, K_1^{-1}
$$

where $(R, \mathbf{t})$ is the relative pose from camera 1 to camera 2 and $[\mathbf{t}]_\times$ is the skew-symmetric matrix of $\mathbf{t}$. Removing the intrinsics gives the essential matrix $E = [\mathbf{t}]_\times R$. The constraint says that, given $\mathbf{x}_1$, its match in the second image can only lie on a line. Chapter 2 uses it to recover relative pose, Chapter 4 uses it to reduce stereo matching to a 1D search, and Chapter 6 uses it across many views to bound the depth search.

Finding correct correspondences is the least stable link in the whole pipeline: repetitive texture, lighting changes and occlusion all produce false matches. Chapter 3 covers how feature descriptors and RANSAC yield reliable correspondences.

### Optimization

Linear methods (the eight-point algorithm, DLT triangulation and so on) give closed-form solutions, but they minimize an algebraic error with no direct geometric meaning and are sensitive to noise. Practical systems use them as initial values and then minimize the reprojection error:

$$
\min_{\{R_i, \mathbf{t}_i\}, \{\mathbf{X}_j\}}
\sum_{(i,j) \in \mathcal{V}}
\rho\left( \left\| \mathbf{x}_{ij} - \pi(K_i, R_i, \mathbf{t}_i, \mathbf{X}_j) \right\|^2 \right)
$$

where $\pi(\cdot)$ is the projection function above, $\mathcal{V}$ is the set of observations "point $j$ is visible in image $i$", and $\rho(\cdot)$ is a robust kernel that suppresses outliers. Optimizing all cameras and all 3D points jointly is bundle adjustment (BA), the core of Chapter 5.

In dense reconstruction the objective changes from reprojection error to photo-consistency: if a pixel's depth is correct, the local image patch around it should look similar when projected into other views. Chapter 6 covers how to search efficiently for depths that satisfy this condition.

## Relation to neural rendering methods

Recent methods such as 3D Gaussian Splatting (3DGS) and NeRF achieve striking results in novel view synthesis, but they do not replace the classical pipeline; they build on its first half. Take 3DGS as an example: its camera poses and initial point cloud usually come directly from COLMAP's SfM output, which is the product of Chapters 1–5 of this series. What it replaces is Chapters 6–8: instead of explicitly estimating depth, extracting a mesh and applying textures, it represents the scene as a set of 3D Gaussian primitives and minimizes the photometric error between rendered and real images through differentiable rasterization.

Understanding the classical methods therefore pays off in two direct ways. First, when SfM fails (weak texture, repetitive structure, insufficient view coverage), downstream neural rendering fails with it, and debugging means going back to the first half of the pipeline. Second, the two families produce different representations: a mesh is an explicit surface that can be used directly for collision checking and physics simulation, while Gaussian primitives excel at rendering appearance but do not directly provide a closed surface.

One more issue is easy to miss in robotics applications: SfM from monocular images alone recovers structure only up to a global scale, the scale ambiguity. Reconstructing in meters requires extra metric information, such as a stereo camera with a known baseline, GNSS / IMU data, or an object of known size in the scene.

<!-- TODO: add the downstream step where reconstruction results enter the simulation environment (USDF part) -->

## Where this fits in Drone Ranger

The simulation part of [Drone Ranger](/projects/drone-ranger/) needs to turn real scenes into 3D scenes in the simulation environment. This series collects the classical mathematical methods behind that step. The methods actually used in the project, such as 3DGS, will be discussed separately on the project page and in later notes, with links back to the relevant chapters here.

## Before you start

Reading the chapters in order is recommended. The prerequisites are linear algebra (especially the singular value decomposition, SVD, and linear least squares), the basic ideas of nonlinear least squares (Gauss-Newton and Levenberg-Marquardt), and 3D rigid-body transforms. For the last, start with [Transforms](/topics/transforms/).

Readers already familiar with camera calibration can start at Chapter 2. Readers interested only in stereo depth estimation can read Chapters 1, 2 and 4 in that order. Chapter 5 is the hub of the series; Chapters 6–8 all depend on the camera poses it produces.

## References

1. Hartley, R., & Zisserman, A. *Multiple View Geometry in Computer Vision* (2nd ed.). Cambridge University Press, 2004. The main theoretical source for Chapters 1, 2 and 5.
2. Szeliski, R. *Computer Vision: Algorithms and Applications* (2nd ed.). Springer, 2022. Covers the whole series; a good general reference.
3. Zhang, Z. A flexible new technique for camera calibration. *IEEE TPAMI*, 22(11), 2000.
4. Lowe, D. G. Distinctive image features from scale-invariant keypoints. *IJCV*, 60(2), 2004.
5. Schönberger, J. L., & Frahm, J.-M. Structure-from-Motion Revisited. *CVPR*, 2016.
6. Schönberger, J. L., Zheng, E., Pollefeys, M., & Frahm, J.-M. Pixelwise View Selection for Unstructured Multi-View Stereo. *ECCV*, 2016.
7. Kazhdan, M., & Hoppe, H. Screened Poisson Surface Reconstruction. *ACM TOG*, 32(3), 2013.
8. Waechter, M., Moehrle, N., & Goesele, M. Let There Be Color! Large-Scale Texturing of 3D Reconstructions. *ECCV*, 2014.
9. Kerbl, B., Kopanas, G., Leimkühler, T., & Drettakis, G. 3D Gaussian Splatting for Real-Time Radiance Field Rendering. *ACM TOG*, 42(4), 2023.
