# 英语学习演示工具

基于 Next.js 的英语学习演示工具，支持上传 Markdown 文件自动生成演示页面。

## 功能特性

- 📁 文件上传 - 支持上传 Markdown 格式的学习资料
- 🎯 逐步展示 - 按 Enter 键逐步展示词汇注释
- ▶️ 自动播放 - 按 Space 键开启/停止自动播放
- 🎨 深色主题 - 符合现代设计风格的深色界面
- 📱 响应式 - 适配不同屏幕尺寸

## 使用方法

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
npm start
```

## Markdown 文件格式

工具支持解析符合以下格式的 Markdown 文件：

```markdown
### 章节标题

> I stood in the middle of a black forest

**整段翻译：**
> 我站在一片黑色森林的中央

**固定搭配/短语：**

| 表达 | 意思 |
|------|------|
| in the middle of | 在……中央 |
| stand in | 站在……里 |

**难点词：**

| 词 | 音标 | 词性 | 意思 |
|----|------|------|------|
| stood | /stʊd/ | v. | stand 过去式，站 |

**时态/句型：**
- 一般过去时：描述过去发生的事情
- 独立主格结构：省略 be 动词
```

## 快捷键

- `Enter` - 展示下一个词汇
- `Space` - 开启/停止自动播放

## 技术栈

- Next.js 15
- TypeScript
- Tailwind CSS
- React 19