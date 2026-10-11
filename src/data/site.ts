// 站点的“内容中枢”：大部分文案、板块、项目、视频都在这里修改。
// 需要双语的字段写成 { en: '...', zh: '...' }。
// 界面上的固定文字（按钮、标题等）在 src/i18n.ts 中。
// 文章本身写在 src/content/notes/*.md 中。
import type { L } from '../i18n';

export const site = {
  name: 'Deep Insight',
  domain: 'deepinsight.space',
  tagline: 'Geometry · Perception · Robotics',
  description: {
    en: 'Start from geometry, understand how machines see the world. A personal knowledge map of coordinate transforms, quaternions, 3D perception, SLAM and world models.',
    zh: '从几何出发，理解机器如何看见世界。关于坐标变换、四元数、3D 感知、SLAM 与世界模型的个人知识地图。',
  } as L,
  author: 'Danyang',
  /** “About the author / 认识作者”按钮跳转到这里 */
  github: 'https://github.com/sunnypeony',
  linkedin: 'https://www.linkedin.com/in/danyang-huang/',
  youtubeChannel: 'https://www.youtube.com/', // TODO: 换成你的频道地址
  email: '', // 可选：留空则不显示
};

export type Topic = {
  slug: string;
  index: string;
  en: string;
  title: L;
  summary: L;
  keywords: L[];
  /** 计划写的子主题，会显示在专题页里 */
  outline: { title: L; question: L }[];
};

export const topics: Topic[] = [
  {
    slug: 'foundations',
    index: '01',
    en: 'Foundations',
    title: { en: 'Geometry & Math', zh: '几何与数学基础' },
    summary: {
      en: 'Rebuilding linear algebra and vector calculus on geometric intuition.',
      zh: '用几何直觉重新理解线性代数与向量微积分。',
    },
    keywords: [
      { en: 'Vectors & matrices', zh: '向量与矩阵' },
      { en: 'Change of coordinates', zh: '坐标变换' },
      { en: 'Gradient / divergence / curl', zh: '梯度 / 散度 / 旋度' },
      { en: 'Where quaternions came from', zh: '四元数的来历' },
    ],
    outline: [
      {
        title: { en: 'A matrix is a transform, not a table', zh: '矩阵是“变换”而不是“表格”' },
        question: { en: 'Why is matrix multiplication defined the way it is?', zh: '为什么矩阵乘法要这样定义？' },
      },
      {
        title: { en: 'Gradient, divergence, curl', zh: '梯度、散度、旋度' },
        question: { en: 'What does a field tell us locally?', zh: '一个场在局部到底告诉了我们什么？' },
      },
      {
        title: { en: 'Where quaternions came from', zh: '四元数从哪里来' },
        question: { en: 'Why did Hamilton need a fourth number?', zh: 'Hamilton 为什么需要第四个数？' },
      },
      {
        title: { en: 'Same thing, different frame', zh: '换个坐标系看同一件事' },
        question: { en: 'Change of basis, similarity and invariants.', zh: '基变换、相似变换与不变量。' },
      },
    ],
  },
  {
    slug: 'transforms',
    index: '02',
    en: 'Transforms',
    title: { en: 'Robot Transforms', zh: '机器人空间变换' },
    summary: {
      en: 'Getting every sensor and every joint to speak the same coordinate language.',
      zh: '让每一个传感器、每一个关节都说同一种“坐标语言”。',
    },
    keywords: [
      { en: 'SO(3) / SE(3)', zh: 'SO(3) / SE(3)' },
      { en: 'Frame conventions', zh: '坐标系约定' },
      { en: 'ROS 2 TF', zh: 'ROS 2 TF' },
      { en: 'Camera–LiDAR calibration', zh: '相机与 LiDAR 标定' },
    ],
    outline: [
      {
        title: { en: 'Four ways to write a rotation', zh: '旋转的四种写法' },
        question: {
          en: 'The costs of Euler angles, rotation matrices, axis–angle and quaternions.',
          zh: '欧拉角、旋转矩阵、轴角、四元数各自的代价。',
        },
      },
      {
        title: { en: 'SE(3) and Lie algebra', zh: 'SE(3) 与李代数' },
        question: { en: 'Why optimize poses in the tangent space?', zh: '为什么优化位姿时要在切空间里做？' },
      },
      {
        title: { en: 'The ROS 2 TF tree', zh: 'ROS 2 TF 树' },
        question: { en: 'How map → odom → base_link → sensor fits together.', zh: 'map → odom → base_link → sensor 是怎么串起来的？' },
      },
      {
        title: { en: 'Extrinsic calibration', zh: '外参标定' },
        question: { en: 'Aligning a camera and a LiDAR to one world.', zh: '相机和 LiDAR 如何对齐到同一个世界？' },
      },
    ],
  },
  {
    slug: 'perception',
    index: '03',
    en: 'Perception',
    title: { en: '3D Perception', zh: '3D 感知与世界表示' },
    summary: {
      en: 'From pixels and point clouds to spatial representations a machine can reason about.',
      zh: '从像素和点云，到机器可以推理的空间表达。',
    },
    keywords: [
      { en: 'RGB-D / LiDAR', zh: 'RGB-D / LiDAR' },
      { en: 'SLAM', zh: 'SLAM' },
      { en: '3D reconstruction', zh: '三维重建' },
      { en: 'Occupancy / 3DGS', zh: '占据栅格 / 3DGS' },
    ],
    outline: [
      {
        title: { en: 'Pinhole cameras and depth', zh: '针孔相机与深度' },
        question: { en: 'How does a pixel get back into 3D space?', zh: '一个像素是如何回到三维空间的？' },
      },
      {
        title: { en: 'The skeleton of SLAM', zh: 'SLAM 的骨架' },
        question: { en: 'What front end, back end and loop closure each solve.', zh: '前端、后端、回环各自解决什么问题？' },
      },
      {
        title: { en: 'How should a world be stored?', zh: '世界该怎么存' },
        question: {
          en: 'Trade-offs between point clouds, voxels, TSDF, occupancy grids and Gaussian splats.',
          zh: '点云、体素、TSDF、占据栅格、高斯泼溅的取舍。',
        },
      },
    ],
  },
  {
    slug: 'world-models',
    index: '04',
    en: 'World Models',
    title: { en: 'World Models', zh: '世界模型与机器人' },
    summary: {
      en: 'From knowing what the world looks like to predicting how it will change.',
      zh: '从“知道世界长什么样”，走向“预测世界会怎样变化”。',
    },
    keywords: [
      { en: 'Spatial understanding', zh: '空间理解' },
      { en: 'Prediction & planning', zh: '预测与规划' },
      { en: 'Physical AI', zh: 'Physical AI' },
      { en: 'Embodied intelligence', zh: '具身智能' },
    ],
    outline: [
      {
        title: { en: 'From geometric maps to predictive world representations', zh: '从几何地图到可预测的世界表示' },
        question: { en: 'Beyond a map, what else does a robot need to know?', zh: '地图之外，机器人还需要知道什么？' },
      },
      {
        title: { en: 'The shapes of world models', zh: '世界模型的几种形态' },
        question: { en: 'Pixel-level, latent and object-level prediction.', zh: '像素级、潜空间、物体级预测的区别。' },
      },
      {
        title: { en: 'A roadmap for Physical AI', zh: 'Physical AI 的路线图' },
        question: { en: 'How perception, prediction and action close the loop.', zh: '感知、预测、行动如何闭环？' },
      },
    ],
  },
  {
    slug: 'projects',
    index: '05',
    en: 'Projects',
    title: { en: 'Projects & Practice', zh: '项目与实践' },
    summary: {
      en: 'Putting concepts back into real sensors, real data and failed experiments.',
      zh: '把概念放回真实的传感器、数据和失败的实验里。',
    },
    keywords: [
      { en: 'Drone Ranger', zh: 'Drone Ranger' },
      { en: 'Data collection', zh: '数据采集' },
      { en: 'Mapping', zh: '建图' },
      { en: 'Simulation & lab logs', zh: '仿真与实验记录' },
    ],
    outline: [
      {
        title: { en: 'Drone Ranger', zh: 'Drone Ranger' },
        question: { en: 'Building the system for a drone project, and what I learned.', zh: '无人机项目的系统搭建与经验。' },
      },
      {
        title: { en: 'Sensor data collection', zh: '传感器数据采集' },
        question: { en: 'Time sync, calibration and data formats.', zh: '时间同步、标定与数据格式。' },
      },
      {
        title: { en: 'From sim to real', zh: '仿真到实机' },
        question: { en: 'Pitfalls on the way from simulation to hardware.', zh: 'Sim-to-real 里踩过的坑。' },
      },
    ],
  },
];

export type Project = {
  name: string;
  status: 'active' | 'done' | 'planned';
  summary: L;
  tags: string[];
  href?: string;
};

export const projects: Project[] = [
  {
    name: 'Drone Ranger',
    status: 'active',
    summary: {
      en: 'Perception and mapping on a drone platform — from sensor selection and frame setup to flight-log replay.',
      zh: '无人机平台上的感知与建图：从传感器选型、坐标系搭建到飞行数据回放。',
    },
    tags: ['Drone', 'ROS 2', 'Mapping'],
  },
  {
    name: 'Sensor Rig',
    status: 'planned',
    summary: {
      en: 'Joint RGB-D and LiDAR capture, time synchronization and an extrinsic calibration workflow.',
      zh: 'RGB-D 与 LiDAR 的联合采集、时间同步与外参标定流程记录。',
    },
    tags: ['RGB-D', 'LiDAR', 'Calibration'],
  },
  {
    name: 'Sim Lab',
    status: 'planned',
    summary: {
      en: 'Reproducing mapping and planning experiments in simulation, logging every failure and fix.',
      zh: '在仿真中复现建图与规划实验，记录每一次失败与修正。',
    },
    tags: ['Simulation', 'Planning'],
  },
];

export type Video = {
  title: L;
  summary: L;
  /** YouTube 视频 ID，例如 https://youtu.be/dQw4w9WgXcQ 中的 dQw4w9WgXcQ；留空表示制作中 */
  youtubeId?: string;
  topic: L;
};

export const videos: Video[] = [
  {
    title: { en: 'Quaternions: from complex numbers to 3D rotation', zh: '四元数：从复数到三维旋转' },
    summary: {
      en: 'An animation of why q v q⁻¹ rotates a vector.',
      zh: '用一段动画看懂 q v q⁻¹ 为什么能旋转向量。',
    },
    topic: { en: 'Math intuition', zh: '数学直觉' },
  },
  {
    title: { en: 'ROS 2 TF: giving every sensor an address', zh: 'ROS 2 TF：给传感器一个“地址”' },
    summary: {
      en: 'Building and debugging a transform tree on real hardware.',
      zh: '用一台真实设备演示坐标树的搭建与调试。',
    },
    topic: { en: 'Robotics', zh: '机器人' },
  },
];

export const journey = [
  'Biomedical Imaging',
  'Computer Vision',
  '3D Perception',
  'Robotics & Simulation',
  'World Models',
];

/** 每篇文章共用的结构，首页“写作方法”区块会展示它 */
export const articleRecipe: { step: L; desc: L }[] = [
  { step: { en: 'Question', zh: '问题' }, desc: { en: 'The one question this note answers', zh: '这篇要回答的那一个问题' } },
  { step: { en: 'Intuition', zh: '直觉' }, desc: { en: 'A picture before any formula', zh: '不用公式，先建立画面' } },
  { step: { en: 'Formalism', zh: '表达' }, desc: { en: 'The precise math or geometry', zh: '数学或几何的精确描述' } },
  { step: { en: 'Robotics', zh: '例子' }, desc: { en: 'Where it shows up in a robot', zh: '它在机器人里出现在哪' } },
  { step: { en: 'Experiment', zh: '实验' }, desc: { en: 'Visuals, code or video', zh: '可视化、代码或视频' } },
  { step: { en: 'References', zh: '参考' }, desc: { en: 'Original papers and further reading', zh: '原始论文与延伸阅读' } },
];
