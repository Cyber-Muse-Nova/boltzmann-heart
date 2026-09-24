# 字体

游戏优先使用 **Fusion Pixel Font（缝合像素字体）12px**，OFL-1.1 许可：
<https://github.com/TakWolf/fusion-pixel-font>

把下列任意一个文件放进这个目录即可自动启用（`style.css` 里已写好 `@font-face`）：

- `fusion-pixel-12px-monospaced-zh_hans.woff2`（推荐）
- `fusion-pixel-12px-monospaced-zh_hans.ttf`
- `fusion-pixel-12px-proportional-zh_hans.woff2` / `.ttf`

同时请把字体包里的 `OFL.txt` 一并放进来。

缺少字体文件时，游戏会退回系统字体（如文泉驿点阵正黑、宋体），并把文字做硬边处理，保持像素感。
