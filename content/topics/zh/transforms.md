---
title: 机器人空间变换
eyebrow: Transforms
order: 2
summary: 让每一个传感器、每一个关节都说同一种“坐标语言”。
keywords:
  - SO(3) / SE(3)
  - 坐标系约定
  - ROS 2 TF
  - 相机与 LiDAR 标定
outline:
  - title: 旋转的四种写法
    question: 欧拉角、旋转矩阵、轴角、四元数各自的代价。
  - title: SE(3) 与李代数
    question: 为什么优化位姿时要在切空间里做？
  - title: ROS 2 TF 树
    question: map → odom → base_link → sensor 是怎么串起来的？
  - title: 外参标定
    question: 相机和 LiDAR 如何对齐到同一个世界？
---
