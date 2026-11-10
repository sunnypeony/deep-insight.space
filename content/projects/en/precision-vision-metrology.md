---
title: 2D/3D Precision Vision Metrology for Semiconductor Packaging Molds
summary: Designed and built the 2D vision software of an optical coordinate measuring machine for semiconductor packaging, covering calibration, calibration-based image stitching, sub-pixel localization, geometric measurement, 3D depth-map processing and LED solder segmentation.
status: done
date: 2017-10-01
order: 20
tags: [machine-vision, metrology, camera-calibration, image-stitching, segmentation]
role: "Vision Software Focal Person for 2D inspection and measurement: vision system architecture, calibration, stitching, measurement algorithms and on-machine debugging"
stack: [C/C++, Adaptive Vision Studio, OpenCV, Visual Studio, TCP/IP, Shared memory]
---

## Overview

From 2017 to 2019, at ASMPT's Chengdu R&D center, I worked on a high-precision 3D vision inspection machine, effectively an optical coordinate measuring machine (Optical CMM). It measures the dimensions and geometric tolerances of chip packaging molds (mold chassis and mold shots), and the height, position and tilt of solder on Mini/Micro LEDs. I was the focal person for 2D inspection and measurement, and took two generations of the vision software through design, implementation and on-machine debugging. The machines are in daily use in the company's packaging plants.

This page describes general methods and engineering trade-offs only. Original code, images and parameters stayed with the employer; all code and figures here are reproductions of the principles on simulated data.

## Problem

The difficulty of a measuring machine lies less in any single algorithm than in how errors accumulate along the chain:

- The part is much larger than one camera's field of view (FOV), so it has to be captured in many tiles and stitched, and stitching error goes straight into the measured dimensions.
- The camera rides on a motion stage, so the stage's positioning error adds a translation to every frame.
- The features to measure are lines, circles and arcs, which need sub-pixel edges and stable fitting.
- One piece of software has to handle several resolutions, several calibration sets and user-defined measurement regions.

## Approach

### 1. Vision system architecture

The software is split along the data flow into modules that can be debugged and replaced independently:

| Module | Responsibility |
|---|---|
| Acquisition and image management | 2D/3D grabbing, buffering and indexing, tagging each image with its stage position |
| Calibration | Pixel-to-world mapping, lens distortion, stage error compensation |
| Stitching and localization | Multi-tile stitching, target recognition, sub-pixel localization |
| Measurement | Geometric feature extraction, dimensions and tolerances, 3D depth and roughness |
| User interface | Adaptive Vision Studio (AVS) UI, teaching of shapes and measurement parameters, real-time alignment |

Commands and status travel between the vision software and the machine controller over TCP/IP; bulk image data is exchanged through shared memory so that images are not copied between processes.

<!-- Figure: architecture diagram ../../assets/precision-vision-metrology/architecture.png -->

### 2. Calibration and stage error compensation

**Goal**: give every pixel a physical position in the machine's world frame, and remove the effect of stage positioning error.

**Method**:

- When the measurement surface is close to a plane, undistorted pixel coordinates and physical coordinates on that plane are related by a homography:

$$
\tilde{\mathbf X} \sim H\,\tilde{\mathbf x},
$$

  where $\tilde{\mathbf x}$ and $\tilde{\mathbf X}$ are the homogeneous pixel and plane coordinates. Lens distortion follows a radial model, $\mathbf x_d = \mathbf x\,(1 + k_1 r^2 + k_2 r^4)$; points are undistorted before $H$ is applied.
- With the camera on the stage, frame $k$ maps to $\mathbf X = H(\mathbf x) + \mathbf t_k + \mathbf e(\mathbf t_k)$, where $\mathbf t_k$ is the commanded stage position and $\mathbf e(\cdot)$ its positioning error. Imaging a reference target on a regular grid of stage positions gives the measured error at each grid node; bilinear interpolation between nodes gives $\mathbf e(\mathbf t)$ anywhere, which serves as the compensation table.
- 3D calibration converts depth-map values to physical heights and brings the 3D sensor frame and the 2D camera frame into one world frame.

<!-- Code: homography estimation + interpolated compensation table (simulated data) -->
<!-- Figure: residuals before and after stage compensation ../../assets/precision-vision-metrology/stage-error-map.png -->

### 3. Image stitching based on geometric camera calibration

**Goal**: merge images from many tiles and cameras into one large image with accurate physical coordinates, correcting each camera's distortion along the way.

**Method**: instead of registering images to each other with features, every image is mapped onto a shared physical grid through its own calibration.

- **Inverse mapping**: for each mosaic pixel $\mathbf u$, compute its physical position $\mathbf X = s\,\mathbf u + \mathbf o$ ($s$ the output pixel size, $\mathbf o$ the origin), project it into source image $k$ as $\mathbf x = \pi_k(\mathbf X - \mathbf t_k)$, and sample bilinearly. Because $\pi_k$ contains the distortion model, stitching and undistortion happen in the same resampling pass.
- **Smooth transitions in overlaps**: overlaps are blended by feathering, with weight $w_k(\mathbf u)$ equal to the distance from the pixel to the border of image $k$:

$$
I(\mathbf u) = \frac{\sum_k w_k(\mathbf u)\, I_k(\mathbf u)}{\sum_k w_k(\mathbf u)},
$$

  so brightness and sharpness change gradually across seams.
- **Automatic brightness equalization**: overlap statistics give each image a gain $g_k$ that minimizes

$$
E = \sum_{i<j} \sum_{\mathbf u \in O_{ij}} \big(g_i I_i(\mathbf u) - g_j I_j(\mathbf u)\big)^2 + \lambda \sum_k (g_k - 1)^2,
$$

  where $O_{ij}$ is the overlap of images $i$ and $j$, and the second term keeps the gains from collapsing to zero together. $E$ is quadratic in $g$, so the solution is a small linear system.
- **Correcting small coordinate offsets**: template matching inside the overlaps estimates the residual translation between where calibration predicts an image to be and where it actually is, and the result updates $\mathbf t_k$.
- **Stitching across calibration sets**: images from different calibration sets all land on the same physical grid, so they can be stitched directly.
- **One calibration, many resolutions**: when the camera bins $b \times b$ or reads a window (ROI), the current pixel coordinates are mapped back to full resolution before the original calibration is applied. With pixel centers at integer coordinates, a binned pixel $\mathbf x_b$ relates to a full-resolution pixel $\mathbf x$ by

$$
\tilde{\mathbf x} = A_b\,\tilde{\mathbf x}_b,\qquad
A_b = \begin{pmatrix} b & 0 & r_x + \tfrac{b-1}{2} \\ 0 & b & r_y + \tfrac{b-1}{2} \\ 0 & 0 & 1 \end{pmatrix},
$$

  where $(r_x, r_y)$ is the window origin. Calibrating once at one resolution is enough.
- **Acquisition driven by camera ROI**: given the position and size of the region the user cares about, its boundary is projected onto each camera's sensor; the bounding box plus margins for overlap and interpolation, clipped to the sensor, is the ROI that camera needs to capture.

<!-- Code: calibration-based inverse-mapping stitcher + gain compensation (simulated checkerboard / dot grid) -->
<!-- Figure: before/after stitching, seam close-up ../../assets/precision-vision-metrology/stitching.png -->

### 4. Recognition and sub-pixel localization of large targets

**Goal**: find targets reliably in the stitched image and report their position to sub-pixel precision.

**Method**:

- Template matching with normalized cross-correlation (NCC), which is insensitive to global gain and offset in illumination:

$$
\mathrm{NCC}(\mathbf u) = \frac{\sum_{\mathbf v} \big(I(\mathbf u + \mathbf v) - \bar I_{\mathbf u}\big)\big(T(\mathbf v) - \bar T\big)}{\sqrt{\sum_{\mathbf v} \big(I(\mathbf u + \mathbf v) - \bar I_{\mathbf u}\big)^2 \sum_{\mathbf v} \big(T(\mathbf v) - \bar T\big)^2}}.
$$

- On large images, a coarse search runs on a low-resolution level of an image pyramid, followed by a fine search in a small neighborhood at full resolution.
- A parabola fitted through the integer peak along each axis gives the sub-pixel offset. With scores $c_0$ at the peak and $c_{-1}, c_{+1}$ at its neighbors,

$$
\delta = \frac{c_{-1} - c_{+1}}{2\,(c_{-1} - 2c_0 + c_{+1})}.
$$

<!-- Code: pyramid NCC + parabolic sub-pixel refinement (simulated data), with localization error statistics -->

### 5. Geometric feature extraction and measurement

**Goal**: extract lines, circles and arcs, and compute length, width, fillet radius and position tolerance.

**Method**:

- **Sub-pixel edges**: a set of caliper scan lines is placed along the normal of the expected edge; on each 1D intensity profile the gradient extremum is located and refined by parabolic interpolation.
- **Line fitting**: total least squares. After centering the edge points, the eigenvector of the covariance matrix with the smallest eigenvalue is the line normal.
- **Circle and arc fitting**: an algebraic fit (Kåsa method) provides the initial guess by minimizing $\sum_i (x_i^2 + y_i^2 + D x_i + E y_i + F)^2$, a linear least-squares problem in $D, E, F$; a nonlinear refinement then minimizes the geometric point-to-circle distance. Edge points that clearly deviate are rejected before fitting so that burrs and contamination do not pull the result.
- **Measured quantities**: length and width come from distances between fitted lines; fillet radius from the arc fit; position tolerance uses a diametral tolerance zone, $T = 2\sqrt{\Delta x^2 + \Delta y^2}$, where $(\Delta x, \Delta y)$ is the deviation of the measured center from its nominal position.

<!-- Code: caliper edges + line/circle fitting (simulated data with noise and outliers) -->
<!-- Figure: edge points and fits overlaid ../../assets/precision-vision-metrology/geometry-fit.png -->

### 6. 3D depth-map display and measurement

**Goal**: turn the depth maps from the 3D sensor into readable images, and measure depth and roughness.

**Method**:

- **False-color display**: heights are normalized to $[0, 1]$ with robust percentiles (for example 1% and 99%) and mapped through a colormap, with invalid pixels marked separately, so that a few outliers do not squeeze the color range of the whole image.
- **Depth measurement**: a plane is fitted to the reference surface and another to the target surface; their separation is the step height.
- **Roughness**: the form (a plane) is fitted and removed first, then areal roughness parameters are computed on the residuals $z_i$: $S_a = \frac{1}{N}\sum_i |z_i|$ and $S_q = \sqrt{\frac{1}{N}\sum_i z_i^2}$ (ISO 25178).

<!-- Figure: false-color depth map and roughness residuals ../../assets/precision-vision-metrology/depth-map.png -->

### 7. Defect and scratch detection

I designed the defect and scratch detection module on the AVS Deep Learning add-on, covering data labeling, the training workflow, and integration of detection results into the measurement software.

### 8. Mini/Micro LED solder segmentation and height measurement

**Goal**: segment the solder of every LED and measure its height, position and tilt.

**Method**:

- **Mini LED**: solder deposits are well separated, so thresholding followed by morphological opening and closing removes specks and fills holes. Height comes from the depth histogram: the peak of the height distribution inside the solder minus the peak of the surrounding substrate, which is far less sensitive to noise than taking the maximum.
- **Micro LED**: deposits are smaller and denser, and neighbors tend to merge after thresholding. Marker-controlled watershed separates them: the distance transform of the binary mask gives local maxima as foreground markers, and watershed on the gradient image splits the touching deposits.
- **Tilt**: a plane is fitted to the top of each deposit; the angle between its normal $\mathbf n$ and the vertical, $\theta = \arccos(\mathbf n \cdot \mathbf e_z)$, is the tilt.

<!-- Code: threshold + morphology vs marker-controlled watershed (simulated touching objects) -->
<!-- Figure: segmentation comparison ../../assets/precision-vision-metrology/led-solder.png -->

## Results

- Two generations of the vision software went through design, implementation and on-machine debugging; the machines are in daily use in the company's packaging plants and were well received by their users.
- The stitching module stitches across calibration sets, reuses one calibration at several resolutions, and computes each camera's capture ROI from the user's region of interest.

<!-- Reproduced results (simulated data): table of seam error, localization error and fitting error -->

## Lessons learned

- A measuring machine is only as accurate as its whole chain. The vision algorithm is one entry in the error budget; calibration, stage positioning error and illumination have to be modeled and verified together.
- Building stitching on calibration rather than on feature-based registration makes results predictable and errors traceable, at the price of needing a calibration procedure that is itself very stable.
- Problems after delivery rarely sit inside the algorithm. They come from the boundary conditions: new incoming part appearances, lighting drift and machine-to-machine differences.

<!-- Edit or extend with your own takeaways -->
