# 秩序心海

提升「混沌心海」论坛用户体验的 Tampermonkey 脚本。

- [GitHub 源码仓库 - midniht/lawful-mcseas](https://github.com/midniht/lawful-mcseas) ![源码最新版本](https://img.shields.io/github/package-json/v/midniht/lawful-mcseas/main?logo=typescript&logoColor=fff&label=%E6%BA%90%E7%A0%81%E6%9C%80%E6%96%B0%E7%89%88%E6%9C%AC) ![最近更新](https://img.shields.io/github/last-commit/midniht/lawful-mcseas/gh-pages?logo=github&label=%E6%9C%80%E8%BF%91%E6%9B%B4%E6%96%B0)
- [Greasy Fork 发布地址 - 秩序心海](https://greasyfork.org/scripts/472436) ![脚本最新版本](https://img.shields.io/greasyfork/v/472436?logo=tampermonkey&label=%E8%84%9A%E6%9C%AC%E6%9C%80%E6%96%B0%E7%89%88%E6%9C%AC) ![脚本总安装量](https://img.shields.io/greasyfork/dt/472436?logo=tampermonkey&label=%E8%84%9A%E6%9C%AC%E6%80%BB%E5%AE%89%E8%A3%85%E9%87%8F)

## 功能

1. 自动格式化正文（文区的帖子一楼）内容：
   - 包括自定义字体和大小（原理是调用本地字体，只要电脑上安装了写上字体名就能用）；
   - 以及使用 [<ruby><rb>赫蹏</rb><rp>（</rp><rt>hè tí</rt><rp>）</rp></ruby>](https://github.com/sivan/heti) 自动进行排版优化，包括但不限于中英文混排美化以及更优雅的标点挤压等。\
      兼容 Discuz!X3.4 论坛自带的阅读模式。（沉浸式阅读模式有 bug：赫蹏 JS 未生效。由于是**新增节点**到 `div#append_parent` 这个容器里，需要在更新 DOM 后使用赫蹏重排。）
2. 自动跳过首页的「邮箱未验证」提示。
3. 可设置是否跳过「异地 IP 登录」安全提醒。
4. 高亮显示（通过超链接）跳转到的楼层。

## Todo

- ~~优化高亮楼层的表现效果~~ 2023.8.6 done
- ~~沉浸式阅读模式下自动滚动 `document.documentElement.scrollTop`~~ 已放弃（长按鼠标中键：你在干嘛？）
- ~~将配置项与源码解耦，以免用户每次更新脚本后都需要重新设置~~ 2023.9.14 done
- 全文关键词替换（可以用来换主角名字，我觉得过于羞耻接受不能，但曾经听说 Pixiv 出过这功能，想必还是有市场的）
- ~~已读帖子变灰（理论上改下 `:visited` 伪类 CSS 颜色的事，但下意识感觉好像没有这么简单）~~ done 想多了
- 优化论坛自带的阅读模式（容器宽度、行间距等），做成真正的沉浸式
- 自定义字体 / 大小实时生效（现在是修改后自动刷新页面）
- 可选设置鼠标覆盖时 `:hover` 添加下划线（波浪线 `text-decoration-style: wavy;`）
- 检测用户本地是否安装了某字体：
  1. 思路一（暴力）：直接随便找个字画出来（与 fallback 的默认字体）比较像素。
     - 优点：兼容性好。
     - 缺点：过于绿皮。
  2. 思路二（优雅）：使用 [`window.queryLocalFonts()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/queryLocalFonts) 方法。
     - 优点：实现合理（精准而优雅）。
     - 缺点：兼容性过差（[Chrome 103 以上](https://caniuse.com/mdn-api_window_querylocalfonts) 才支持，目前只有 Chrome 和 Edge）。\
       不安全（貌似会弹警告），这是因为字体安装情况由于——不同 OS 版本、个人选择、软件自带「嫁妆」——带来的差异而具有高度的独特性，可以当作某种指纹使用（识别用户身份）。

## 开发

- [开发脚手架 lisonge/vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey)
- [Tampermonkey 文档](https://www.tampermonkey.net/documentation.php)
