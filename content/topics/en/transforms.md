---
title: Robot Transforms
eyebrow: Transforms
order: 2
summary: Getting every sensor and every joint to speak the same coordinate language.
keywords:
  - SO(3) / SE(3)
  - Frame conventions
  - ROS 2 TF
  - Camera–LiDAR calibration
outline:
  - title: Four ways to write a rotation
    question: The costs of Euler angles, rotation matrices, axis–angle and quaternions.
  - title: SE(3) and Lie algebra
    question: Why optimize poses in the tangent space?
  - title: The ROS 2 TF tree
    question: How map → odom → base_link → sensor fits together.
  - title: Extrinsic calibration
    question: Aligning a camera and a LiDAR to one world.
---
