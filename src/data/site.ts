// 站点的“内容中枢”：大部分文案、板块、项目、视频都在这里修改。
// 文章本身写在 src/content/notes/*.md 中。

export const site = {
  name: 'Deep Insight',
  domain: 'deepinsight.space',
  tagline: 'Geometry · Perception · Robotics',
  description:
    '从几何出发，理解机器如何看见世界。关于坐标变换、四元数、3D 感知、SLAM 与世界模型的个人知识地图。',
  author: 'Danyang',
  youtubeChannel: 'https://www.youtube.com/', // TODO: 换成你的频道地址
  github: 'https://github.com/sunnypeony',
  email: '', // 可选：留空则不显示
};

export const nav = [
  { label: '知识地图', href: '/#map' },
  { label: '最近在想', href: '/#notes' },
  { label: '项目', href: '/#projects' },
  { label: '视频', href: '/#videos' },
  { label: '关于', href: '/#about' },
];

export type Topic = {
  slug: string;
  index: string;
  en: string;
  title: string;
  summary: string;
  keywords: string[];
  /** 计划写的子主题，会显示在专题页里 */
  outline: { title: string; question: string }[];
};

export const topics: Topic[] = [
  {
    slug: 'foundations',
    index: '01',
    en: 'Foundations',
    title: '几何与数学基础',
    summary: '用几何直觉重新理解线性代数与向量微积分。',
    keywords: ['向量与矩阵', '坐标变换', '梯度 / 散度 / 旋度', '四元数的来历'],
    outline: [
      { title: '矩阵是“变换”而不是“表格”', question: '为什么矩阵乘法要这样定义？' },
      { title: '梯度、散度、旋度', question: '一个场在局部到底告诉了我们什么？' },
      { title: '四元数从哪里来', question: 'Hamilton 为什么需要第四个数？' },
      { title: '换个坐标系看同一件事', question: '基变换、相似变换与不变量。' },
    ],
  },
  {
    slug: 'transforms',
    index: '02',
    en: 'Transforms',
    title: '机器人空间变换',
    summary: '让每一个传感器、每一个关节都说同一种“坐标语言”。',
    keywords: ['SO(3) / SE(3)', '坐标系约定', 'ROS 2 TF', '相机与 LiDAR 标定'],
    outline: [
      { title: '旋转的四种写法', question: '欧拉角、旋转矩阵、轴角、四元数各自的代价。' },
      { title: 'SE(3) 与李代数', question: '为什么优化位姿时要在切空间里做？' },
      { title: 'ROS 2 TF 树', question: 'map → odom → base_link → sensor 是怎么串起来的？' },
      { title: '外参标定', question: '相机和 LiDAR 如何对齐到同一个世界？' },
    ],
  },
  {
    slug: 'perception',
    index: '03',
    en: 'Perception',
    title: '3D 感知与世界表示',
    summary: '从像素和点云，到机器可以推理的空间表达。',
    keywords: ['RGB-D / LiDAR', 'SLAM', '三维重建', '占据栅格 / 3DGS'],
    outline: [
      { title: '针孔相机与深度', question: '一个像素是如何回到三维空间的？' },
      { title: 'SLAM 的骨架', question: '前端、后端、回环各自解决什么问题？' },
      { title: '世界该怎么存', question: '点云、体素、TSDF、占据栅格、高斯泼溅的取舍。' },
    ],
  },
  {
    slug: 'world-models',
    index: '04',
    en: 'World Models',
    title: '世界模型与机器人',
    summary: '从“知道世界长什么样”，走向“预测世界会怎样变化”。',
    keywords: ['空间理解', '预测与规划', 'Physical AI', '具身智能'],
    outline: [
      { title: '从几何地图到可预测的世界表示', question: '地图之外，机器人还需要知道什么？' },
      { title: '世界模型的几种形态', question: '像素级、潜空间、物体级预测的区别。' },
      { title: 'Physical AI 的路线图', question: '感知、预测、行动如何闭环？' },
    ],
  },
  {
    slug: 'projects',
    index: '05',
    en: 'Projects',
    title: '项目与实践',
    summary: '把概念放回真实的传感器、数据和失败的实验里。',
    keywords: ['Drone Ranger', '数据采集', '建图', '仿真与实验记录'],
    outline: [
      { title: 'Drone Ranger', question: '无人机项目的系统搭建与经验。' },
      { title: '传感器数据采集', question: '时间同步、标定与数据格式。' },
      { title: '仿真到实机', question: 'Sim-to-real 里踩过的坑。' },
    ],
  },
];

export type Project = {
  name: string;
  status: '进行中' | '已完成' | '计划中';
  summary: string;
  tags: string[];
  href?: string;
};

export const projects: Project[] = [
  {
    name: 'Drone Ranger',
    status: '进行中',
    summary: '无人机平台上的感知与建图：从传感器选型、坐标系搭建到飞行数据回放。',
    tags: ['Drone', 'ROS 2', 'Mapping'],
  },
  {
    name: 'Sensor Rig',
    status: '计划中',
    summary: 'RGB-D 与 LiDAR 的联合采集、时间同步与外参标定流程记录。',
    tags: ['RGB-D', 'LiDAR', 'Calibration'],
  },
  {
    name: 'Sim Lab',
    status: '计划中',
    summary: '在仿真中复现建图与规划实验，记录每一次失败与修正。',
    tags: ['Simulation', 'Planning'],
  },
];

export type Video = {
  title: string;
  summary: string;
  /** YouTube 视频 ID，例如 https://youtu.be/dQw4w9WgXcQ 中的 dQw4w9WgXcQ；留空表示制作中 */
  youtubeId?: string;
  topic: string;
};

export const videos: Video[] = [
  {
    title: '四元数：从复数到三维旋转',
    summary: '用一段动画看懂 q v q⁻¹ 为什么能旋转向量。',
    topic: '数学直觉',
  },
  {
    title: 'ROS 2 TF：给传感器一个“地址”',
    summary: '用一台真实设备演示坐标树的搭建与调试。',
    topic: '机器人',
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
export const articleRecipe = [
  { step: '问题', desc: '这篇要回答的那一个问题' },
  { step: '直觉', desc: '不用公式，先建立画面' },
  { step: '表达', desc: '数学或几何的精确描述' },
  { step: '例子', desc: '它在机器人里出现在哪' },
  { step: '实验', desc: '可视化、代码或视频' },
  { step: '参考', desc: '原始论文与延伸阅读' },
];
