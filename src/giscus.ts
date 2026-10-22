// Giscus 评论配置（基于 GitHub Discussions）。
// 这些值不是机密：Giscus 的嵌入代码本来就会公开它们。
// 取值方法：在 https://giscus.app 填入仓库名，页面下方生成的 <script> 里
// data-repo-id / data-category-id 就是 repoId / categoryId。
// 前提：评论仓库是公开的、已开启 Discussions，并安装了 giscus app。

export const giscus = {
  repo: 'sunnypeony/deepinsight-comments',
  // TODO: 从 giscus.app 复制 data-repo-id
  repoId: '',
  category: 'Announcements',
  // TODO: 从 giscus.app 复制 data-category-id
  categoryId: '',
} as const;

/** 两个 ID 都填好之后才会加载评论区 */
export const giscusConfigured = Boolean(giscus.repoId && giscus.categoryId);
