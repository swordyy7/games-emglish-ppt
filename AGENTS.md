# 项目概述

这是一个基于 Next.js 的英语学习演示工具，用于将 Markdown 格式的学习资料转换为互动式演示幻灯片。用户可以上传 Markdown 文件，系统会自动解析并生成带有动画效果的演示页面，支持逐步展示词汇、短语和翻译。

## 技术栈

- **框架**: Next.js 16.1.6 (App Router)
- **UI 库**: React 19.2.3
- **语言**: TypeScript 5
- **样式**: Tailwind CSS 3.4.19
- **动画**: Framer Motion 12.37.0
- **测试**: Jest 29.7.0, ts-jest 29.4.6, jsdom 29.7.0

## 项目结构

```
ppt-app/
├── app/                        # Next.js App Router 目录
│   ├── favicon.ico
│   ├── globals.css            # 全局样式
│   ├── layout.tsx             # 根布局组件
│   └── page.tsx               # 主页面（核心功能组件）
├── __tests__/                 # 测试目录
│   └── parseMarkdown.test.ts  # Markdown 解析器测试
├── public/                    # 静态资源
├── test.md                    # 示例 Markdown 文件
├── test-parser.js             # 独立的解析器测试脚本
├── test-full-parser.js        # 完整解析器测试
├── next.config.ts             # Next.js 配置
├── tsconfig.json              # TypeScript 配置
├── tailwind.config.js         # Tailwind CSS 配置
├── jest.config.js             # Jest 配置
├── jest.setup.js              # Jest 设置文件
└── package.json               # 项目依赖和脚本
```

## 核心功能

### 1. 文件上传
- 支持上传 `.md` 格式的 Markdown 文件
- 使用 HTML5 FileReader API 读取文件内容

### 2. Markdown 解析器
系统内置自定义解析器（位于 `app/page.tsx` 的 `parseMarkdown` 函数），可解析特定格式的 Markdown 文件：

- **章节标题**: 以 `### ` 开头的行（如 `### 1. 开场独白`）
- **原文**: `**原文：**` 后的引用块（`>` 开头）
- **翻译**: `**整段翻译：**` 后的引用块
- **难点词表格**: `**难点词：**` 后的表格，包含：
  - 词
  - 音标
  - 词性
  - 词根/词缀
  - 意思
  - 常见搭配
- **固定搭配表格**: `**固定搭配/短语：**` 后的表格，包含：
  - 表达
  - 意思
  - 例句
  - 一般什么时候用
- **语法点**: `**时态/句型：**` 后的列表项

### 3. 互动演示
- **逐步展示**: 按下 Enter 键逐步展示难点词和固定搭配
- **自动播放**: 按下 Space 键开启/停止自动播放（每 2 秒切换一次）
- **进度显示**: 右上角显示当前页码和内容进度
- **文本高亮**: 已展示的词汇会在原文中高亮显示

### 4. 视觉设计
- **深色主题**: 黑色背景（`bg-black`），金色和橙色强调色
- **动画效果**: 使用 Framer Motion 实现流畅的过渡动画
- **响应式布局**: 适配不同屏幕尺寸
- **字体系统**: 主要使用 Inter 字体，英文部分使用 Georgia/Times New Roman 衬线字体

### 5. 演示流程
1. 初始状态：显示文件上传按钮
2. 上传文件后：显示原文，隐藏其他内容
3. 按 Enter：逐个展示难点词（显示在下方网格）
4. 难点词展示完：逐个展示固定搭配
5. 所有词汇展示完：隐藏词汇表，显示翻译
6. 完成当前页：自动进入下一页
7. 最后一页完成：停止自动播放

## 构建和运行

### 开发模式
```bash
npm run dev
```
访问 http://localhost:3000

### 生产构建
```bash
npm run build
npm start
```

### 测试
```bash
npm test
```

### 代码检查
```bash
npm run lint
```

## 开发约定

### TypeScript 配置
- 严格模式开启（`strict: true`）
- 目标 ES2017
- 使用 JSX 编译为 `react-jsx`
- 路径别名 `@/*` 指向项目根目录

### 样式约定
- 使用 Tailwind CSS 进行样式开发
- 主要颜色：
  - 黑色背景: `#000000`
  - 金色强调: `#FFD700`, `#FF9800`
  - 灰色文本: `#333333`, `#666666`, `#999999`
- 自定义动画：`slide-in-from-top`
- 字体大小：使用大号字体（40px-56px）以适应演示需求

### 组件结构
- 使用 React Hooks (`useState`, `useEffect`, `useRef`)
- 使用 TypeScript 接口定义数据类型
- 使用 Framer Motion 的 `AnimatePresence` 和 `motion` 组件实现动画

### 测试约定
- 使用 Jest 作为测试框架
- 测试文件位于 `__tests__/` 目录
- 使用 jsdom 环境模拟 DOM
- 配置了 `jest.setup.js` 用于测试环境设置

## Markdown 文件格式示例

```markdown
### 1. 开场独白

**原文：**
> I stood in the middle of a black forest, my reasons and past all lost to me.

**难点词：**

| 词 | 音标 | 词性 | 词根/词缀 | 意思 | 常见搭配 |
|----|------|------|-----------|------|----------|
| stood | /stʊd/ | v. | stand 过去式 | 站 | stand in |
| lost | /lɒst/ | adj. | lose 的过去分词 | 失去的 | lost to me |

**固定搭配/短语：**

| 表达 | 意思 | 例句 | 一般什么时候用 |
|------|------|------|----------------|
| in the middle of | 在……中央 | I stood in the middle of the room. | 描述位置时 |
| lost to me | 对我而言已失去 | Those memories are lost to me. | 表达失去时 |

**时态/句型：**
- 一般过去时：描述过去发生的事情
- 独立主格结构：省略 be 动词

**整段翻译：**
> 我站在一片黑色森林的中央，我的理由和过往全都离我而去。
```

## 快捷键

- `Enter` - 展示下一个词汇或进入下一页
- `Space` - 开启/停止自动播放

## 注意事项

1. 解析器使用自定义的逐行解析逻辑，不依赖 `marked` 库（虽然测试文件中使用了 `marked`）
2. 表格解析时会跳过表头行和分隔行（包含 `---` 的行）
3. 解析器会检查行的有效性，避免解析分隔行或空行
4. 测试脚本 `test-parser.js` 和 `test-full-parser.js` 是独立的测试工具，可以直接运行
5. 项目使用 Next.js 16 和 React 19，确保使用最新的 API 和特性

## 常见问题

### 解析器不工作
检查 Markdown 文件格式是否符合要求，特别是：
- 章节标题是否以 `### ` 开头
- 表格是否有正确的表头和分隔行
- 原文和翻译是否使用引用块（`>`）

### 样式不正确
确保 Tailwind CSS 配置正确，检查 `tailwind.config.js` 中的 `content` 配置是否包含所有组件文件。

### 测试失败
检查 Jest 配置是否正确，确保 `jest.setup.js` 正确配置了测试环境。

## 未来改进方向

- 支持更多的 Markdown 格式变体
- 添加更多自定义主题选项
- 支持导出演示为 PDF 或视频
- 添加演示保存和恢复功能
- 支持从 URL 加载 Markdown 文件