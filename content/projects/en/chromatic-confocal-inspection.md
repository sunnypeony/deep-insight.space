---
title: "Chromatic Confocal 3D Inspection Module: From Prototype to Product"
summary: Built the vision prototype platform, image-quality algorithms and assembly tools for the chromatic confocal 3D module of an automated optical inspection machine, plus image- and FFT-based analysis of motion control errors.
status: done
date: 2017-07-01
order: 21
tags: [chromatic-confocal, 3d-measurement, aoi, image-quality, camera-calibration, fft]
role: Platform Owner of the vision prototype; Algorithm Library Owner
stack: [C/C++, Adaptive Vision Studio, Visual Studio]
---

## Overview

Automated optical inspection (AOI) machines check chip quality after wire bonding and soldering. I worked on their 3D module: an optical module based on chromatic confocal measurement that measures the height, size and tilt of solder balls after die soldering. The work had three phases:

| Phase | Period | Scope |
|---|---|---|
| Prototype | 2017.07 – 2018.07 | Vision prototype platform in AVS; proof of concept (POC) |
| Productization | 2020.01 – 2021.07 | Image quality check (IQC) algorithms and assembly tools for the optical modules |
| Control/vision co-debugging | 2021.04 – 2021.07 | Image-based analysis of motion repeatability and motion error |

This page describes general methods and engineering trade-offs only. Original code, images and parameters stayed with the employer; all code and figures here are reproductions of the principles on simulated data.

## Problem

Chromatic confocal sensing turns a height measurement into the question "which wavelength is in best focus", so its accuracy depends on optics and mechanics at once:

- After assembly, misalignment between pinholes, camera and objective, together with aberrations, shifts the measured height directly. Every module needs quantitative image-quality metrics before it can be accepted.
- Assembly itself needs live feedback: the technician has to see the current alignment and focus state while adjusting.
- During scanning, the images are extremely sensitive to motion control error. Stage repeatability and accumulated displacement error have to be measurable from the images themselves, so that problems can be located together with the controls team.

## Approach

### Measurement principle

Broadband light passes through an objective that deliberately keeps its longitudinal chromatic aberration, so each wavelength $\lambda$ focuses at a different depth $z_f(\lambda)$. When the reflected light returns to the confocal pinhole, only the wavelength focused exactly on the surface passes efficiently. Locating the peak wavelength $\lambda^*$ of a point's spectral signal $S(\lambda)$ and reading the calibration curve gives that point's height:

$$
z = z_f(\lambda^*),\qquad \lambda^* = \arg\max_\lambda S(\lambda).
$$

In practice the peak is located to sub-sample precision by a centroid or Gaussian fit, and $z_f(\lambda)$ is a polynomial fitted to calibration data. The width of the axial response sets the height resolution; in the paraxial approximation it scales roughly with $\lambda / \mathrm{NA}^2$, which is why the numerical aperture (NA) is evaluated below.

<!-- Figure: chromatic confocal principle ../../assets/chromatic-confocal-inspection/principle.png -->

### Prototype phase

#### 1. Hardware-triggered acquisition synchronized with motion

During a scan the motion controller emits a trigger at programmed positions, so the camera exposes by position rather than by time. Even when the stage speed fluctuates, consecutive images keep a fixed spatial spacing, and the 3D reconstruction needs no time-to-position conversion.

#### 2. Vision prototype platform in AVS

I developed a machine-vision application in the Adaptive Vision Studio (AVS) visual programming language, running on two prototype platforms. It provides:

- shape teaching, with dynamic, real-time height measurement of the target;
- a testbed for validating 3D correction and reconstruction algorithms;
- support for optical image-quality experiments.

The project passed its POC on this software and moved into the product phase; the prototype platform remained in use as the benchmark validation platform.

### Productization phase: image quality and assembly tools

#### 3. Energy drop and full width at half maximum of the confocal signal

**Goal**: quantify the energy drop of the confocal signal and the width of its response peak.

**Method**: the signal curves from one measurement are stacked into a matrix and analyzed with principal component analysis (PCA):

$$
C = \frac{1}{n-1} \sum_{i=1}^{n} (\mathbf s_i - \bar{\mathbf s})(\mathbf s_i - \bar{\mathbf s})^\top = V \Lambda V^\top.
$$

The first principal component captures the dominant mode of variation across the curves, which isolates the energy drop and suppresses random noise. On the resulting response curve, the peak $s_{\max}$ is found and the crossings of $s_{\max}/2$ on either side are linearly interpolated to $x_l$ and $x_r$; the full width at half maximum (FWHM) is $x_r - x_l$. For a near-Gaussian response, $\mathrm{FWHM} = 2\sqrt{2\ln 2}\,\sigma \approx 2.355\,\sigma$.

<!-- To confirm: exactly how PCA was applied here (which curves, which component) -->
<!-- Code: simulate a family of noisy confocal responses → PCA → FWHM -->

#### 4. Camera calibration, multi-camera center alignment and pinhole calibration

**Goal**: calibrate the cameras, align the centers of several cameras to a common reference, and calibrate where each pinhole appears in the image.

**Method**:

- The Hough transform detects lines and circles in the calibration pattern, which supply the feature points.
- The homography $H$ is estimated with the direct linear transform (DLT): each correspondence $\mathbf x_i \leftrightarrow \mathbf x'_i$ gives two linear equations in $\mathbf h = \mathrm{vec}(H)$; stacking them gives $A\mathbf h = \mathbf 0$, solved by the right singular vector of $A$ with the smallest singular value. Normalizing the points first (translate to the centroid, scale to a mean distance of $\sqrt 2$) makes this numerically stable.
- Multi-camera center alignment: each camera's homography to the common reference plane maps its image center into one frame; the offsets between them are the adjustments needed during assembly.
- Pinhole calibration: the center of every pinhole spot is extracted, giving a correspondence between pinhole index and image position that later measurement and drift analysis rely on.

<!-- Code: normalized DLT + multi-camera center offsets (simulated data) -->

#### 5. Focus and defocus evaluation by Gaussian-kernel template matching

**Goal**: evaluate how well each pinhole spot is focused.

**Method**: a defocused point spot is well approximated by an ideal spot convolved with a Gaussian kernel, with larger $\sigma$ for stronger defocus. A bank of Gaussian kernels with different $\sigma$ serves as templates; the $\sigma$ with the highest matching score against a measured spot is that spot's defocus estimate. Collecting this over all pinholes gives the focus distribution across the field of view.

<!-- To confirm: how the template bank was built and which score was used -->
<!-- Figure: defocus heat map over the FOV (simulated) ../../assets/chromatic-confocal-inspection/defocus-map.png -->

#### 6. Rotational symmetry of the numerical aperture

**Goal**: evaluate the rotational symmetry of the module's numerical aperture. An asymmetric NA makes the axial response differ by direction and introduces a direction-dependent height error.

<!-- To add: the method. The original résumé says "约登变换"; confirm which transform this was -->

#### 7. Extracting motion error and image-quality error by template matching

Template matching compares the measured position of each pinhole spot in every frame with its nominal position: the common translation reflects motion error, while local changes in spot shape and position reflect image-quality error.

#### 8. Module assembly tools

The metrics from sections 4 and 5 were packaged into assembly tools. While adjusting a module, the technician sees the center offsets and focus state live, and finishes the adjustment by the numbers rather than by feel.

### Control/vision co-debugging: image-based motion error analysis

**Goal**: for an LVDT motion module, measure motion repeatability, accumulated displacement error and motion pattern from images captured during motion, and locate problems together with the controls team.

**Method**:

- **Energy-drop curve and duty cycle**: the image sequence is median-filtered, and each frame is sampled at the pinhole positions with bilinear interpolation, giving energy over time. With half maximum as the threshold, the fraction of each period spent above it is the duty cycle $D = T_{\mathrm{on}} / T$.
- **Pinhole drift**: image moments give the centroid of each spot,

$$
M_{pq} = \sum_{x,y} x^p y^q I(x,y),\qquad (\bar x, \bar y) = \left(\frac{M_{10}}{M_{00}}, \frac{M_{01}}{M_{00}}\right),
$$

  and tracking the centroids over time gives the drift.
- **Accumulated displacement error**: ideally the pinhole array is a 2D point lattice, so a 2D array of impulses (a Dirac comb) can serve as the template. The position of its cross-correlation peak with the image is the translation of the whole lattice; accumulating it frame by frame gives the displacement error.
- **Motion pattern**: a 2D line-lattice impulse template responds only to translation perpendicular to its lines, which separates the motion along the two axes.
- **FFT acceleration**: the template is about as large as the image, so direct cross-correlation is expensive. The convolution theorem moves the computation to the frequency domain:

$$
I \star T = \mathcal F^{-1}\!\left\{ \mathcal F\{I\} \cdot \overline{\mathcal F\{T\}} \right\},
$$

  which for an $N\times N$ image and an $M\times M$ template reduces the cost from $O(N^2 M^2)$ to $O(N^2 \log N)$.

<!-- Code: simulate lattice motion with periodic error → Dirac-comb cross-correlation via FFT → displacement curve -->
<!-- Figure: accumulated displacement error and motion pattern ../../assets/chromatic-confocal-inspection/motion-error.png -->

## Results

- The prototype platform carried the project through its POC into the product phase, and stayed in use as the benchmark validation platform.
- The productization algorithms covered every stage of the optical modules and the machine, produced more precise QC reports, and gave assembly live quantitative feedback.
- Image-based motion error analysis let the controls and vision teams discuss problems from the same data.

<!-- Reproduced results (simulated data): FWHM estimation error, defocus estimation error, FFT speed-up -->

## Lessons learned

- In scanning optical metrology, vision and motion control cannot be debugged separately. Measuring motion error directly from images is what makes the two teams effective together.
- Turning assembly know-how into quantitative image metrics both qualifies the modules and shortens the time spent adjusting them.
- This work built up my knowledge of optical assembly and light-source design, so I can tell faster whether a problem comes from the optics, the mechanics or the algorithm.

<!-- Edit or extend with your own takeaways -->
