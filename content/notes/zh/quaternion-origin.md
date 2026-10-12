---
title: 四元数从哪里来，又为什么适合表示旋转？
summary: 从 Hamilton 在布鲁姆桥上刻下的公式出发，理解单位四元数与三维旋转的关系。
date: 2026-10-10
topic: foundations
tags: [quaternions, rotation, history of math]
draft: true
---

## 问题是什么

复数可以优雅地表示二维旋转，那么三维呢？

## 直觉怎么理解

（待补充：从复数乘法 = 旋转 + 缩放说起）

## 数学 / 几何表达

$$
i^2 = j^2 = k^2 = ijk = -1
$$

$$
q = \cos\tfrac{\theta}{2} + \sin\tfrac{\theta}{2}\,(u_x i + u_y j + u_z k)
$$

## 机器人中的例子

（待补充：ROS 中 `geometry_msgs/Quaternion`、IMU 姿态、插值 slerp）

## 参考资料

（待补充）
