# boltzmann-heart
Boltzmann Heart — Universe, Galaxy, Music, Mathematics, Physics &amp; Chaos

## 我的宇宙 · My Universe

新增页面 `universe.html`：星系地图加上可按分类筛选的作品档案。首页导航的「My Universe / 我的宇宙」和作品区下方的入口卡片都能进入。纯静态，无构建步骤。

### 中英双语 / Bilingual

- 默认英文。导航右侧的 `EN / 中文` 按钮切换语言，选择保存在 localStorage（键名 `nova-lang`），首页和 universe 页共享。
- 也可以用 URL 参数：`?lang=zh` 或 `?lang=en`。
- 界面文案集中在 `assets/i18n.js`。HTML 元素用 `data-i18n="key"` 标记，aria-label 用 `data-i18n-aria="key"`。

### 如何添加新项目（一步）/ Add a project

在 `data/projects.js` 的 `window.PROJECTS` 数组末尾追加一个对象，中英文字段都要填写：

```js
{ id: "my-new-site", name: "My New Site",
  title_zh: "中文标题", desc_zh: "一句话中文简介。",
  title_en: "English Title", desc_en: "One-line English description.",
  category: "ai",          // ai | game | scifi | art | other
  status: "已上线",         // 已上线 | 开发中 | 未部署（页面会自动显示 Live / In Development / Not Deployed）
  url: "https://cyber-muse-nova.github.io/my-new-site/",   // 未上线写 null
  repo: "https://github.com/Cyber-Muse-Nova/my-new-site",
  cover: "assets/universe/my-new-site.webp",               // 可为 null，自动生成星球占位图
  tags: ["标签"], tags_en: ["Tag"], year: 2026 }
```

卡片、分类计数和星系地图中的星球会自动生成。缺少英文字段时自动回退显示中文。预览图建议 1200×750、webp、小于 120KB，放在 `assets/universe/`。
