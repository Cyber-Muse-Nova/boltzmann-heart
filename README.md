# boltzmann-heart
Boltzmann Heart — Universe, Galaxy, Music, Mathematics, Physics &amp; Chaos

## 我的宇宙 · My Universe

新增页面 `universe.html`：星系地图 + 可分类筛选的作品档案，首页导航「我的宇宙」与作品区下方的入口卡片均可进入。纯静态，无构建步骤。

### 如何添加新项目（一步）

在 `data/projects.js` 的 `window.PROJECTS` 数组中追加一个对象：

```js
{ id: "my-new-site", name: "My New Site", title_zh: "中文标题", desc_zh: "一句话中文简介。",
  category: "ai",          // ai | game | scifi | art | other
  status: "已上线",         // 已上线 | 开发中 | 未部署
  url: "https://cyber-muse-nova.github.io/my-new-site/",   // 未上线写 null
  repo: "https://github.com/Cyber-Muse-Nova/my-new-site",
  cover: "assets/universe/my-new-site.webp",               // 可为 null，自动生成星球占位
  tags: ["标签"], year: 2026 }
```

卡片、分类计数和星系地图中的星球都会自动生成。预览图建议 1200×750、webp、小于 120KB，放在 `assets/universe/`。
