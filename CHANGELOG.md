# Changelog

> The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
> and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Alpha 前期测试]

### [**v0.5.1**] - _2023.9.16_

#### Added

- feat: 可设置是否在「自动格式化」时重新对正文进行分段并提行

#### Removed

- chore: 移除测试用设置菜单

### [**v0.5.0**] - _2023.9.16_

#### Added

- feat: 可设置在浏览帖子时隐藏所有用户的勋章

### [**v0.3.7**] - _2023.9.16_

#### Added

- feat: 可设置屏蔽「指定用户名」发布的「主题」
- feat: 可设置「自动替换」正文中的关键词组（生效范围同「自动格式化」）

#### Changed

- refactor: 梳理代码结构以获得更清晰的运行逻辑

### [**v0.3.6**] - _2023.9.15_

#### Added

- feat: 新增设置菜单快捷键

#### Fixed

- fix: 「自动格式化」功能现在对「资源区 > 小说」板块的帖子生效

### [**v0.3.5**] - _2023.9.15_

#### Changed

- improvement: 「自动格式化」功能修改后立刻生效（即时渲染）

### [**v0.3.4**] - _2023.9.15_

#### Added

- improvement: 优化样式 - 已读帖子变灰

### [**v0.3.3**] - _2023.9.14_

#### Deprecated

- refactor: 使用 TypeScript 完全重构整个脚本

#### Added

- feat: 可设置跳过异地 IP 登录提醒（由 [逝、死，存、生](https://mcseas.club/home.php?mod=space&uid=1019) 提出 [需求](https://mcseas.club/forum.php?mod=redirect&goto=findpost&ptid=50579&pid=1479122)）
- feat: 将配置项与代码解耦，新增脚本自带的设置菜单界面

#### Fixed

- fix: 「自动格式化」功能兼容 Discuz!X3.4 论坛自带的阅读模式
- fix: 「自动格式化」功能现在只对文区板块的帖子一楼生效（原创区包括图帖板块）

#### Changed

- improvement: 「自动关闭」等功能执行策略采用持续轮询（之前是等待加载时机）

### [**v0.1.5**] - _2023.8.6_

#### Changed

- improvement: 优化「高亮楼层的表现效果（简单改变背景颜色 → 带 `:hover` 动效的卡片样式）

### [**v0.1.4**] - _2023.8.6_

#### Added

- feat: 高亮显示当前地址（通过超链接）跳转到的楼层（由 [eliaaaa](https://mcseas.club/home.php?mod=space&uid=20101) 提出 [需求](https://mcseas.club/forum.php?mod=redirect&goto=findpost&ptid=50579&pid=1466392)）

### [**v0.1.3**] - _2023.8.5_

#### Added

- feat: 「自动格式化」功能可设置自定义正文（原创区帖子一楼）字体大小

#### Fixed

- fix: 兼容某些开头缺少「字数统计（论坛自带功能）」的旧版本帖子

### [**v0.1.2**] - _2023.8.5_

#### Added

- feat: 自动跳过首页的「未验证邮箱」提示对话框

### [**v0.1.1**] - _2023.8.4_

#### Added

- feat: 引入 [赫蹏](https://github.com/sivan/heti) 自动进行排版优化，包括但不限于中英文混排美化以及更优雅的标点挤压等
