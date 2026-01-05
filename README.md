# 面试题生成器 (Interview Questions Generator)

一个基于 AI 的智能面试问题生成工具，可以根据候选人的简历和职位描述自动生成针对性的面试问题。

## 功能特性

- 🤖 **AI 驱动**：使用阿里云 DashScope 的 Qwen 模型智能生成面试问题
- 📄 **多格式支持**：支持上传 PDF、Word (.docx) 和文本格式的简历
- 🎯 **精准匹配**：根据简历内容和职位描述生成相关性强的问题
- 📊 **多类型问题**：支持技术类、行为类和职位相关问题
- 💾 **历史记录**：保存生成的面试问题历史记录
- 📤 **导出功能**：支持将问题导出为多种格式
- 🎨 **现代化界面**：基于 Next.js 和 Tailwind CSS 构建的响应式界面

## 技术栈

- **前端框架**：Next.js 16 (App Router)
- **UI 框架**：React 19
- **样式**：Tailwind CSS 4
- **语言**：TypeScript
- **AI 服务**：阿里云 DashScope API (Qwen 2.5-7B-Instruct)
- **文档解析**：
  - PDF.js (PDF 文件解析)
  - Mammoth (Word 文档解析)
  - Docx (Word 文档处理)

## 快速开始

### 前置要求

- Node.js 18.x 或更高版本
- npm、yarn 或 pnpm
- 阿里云 DashScope API 密钥

### 1. 克隆项目

```bash
git clone https://github.com/wetuhutu/interview-questions-generator.git
cd interview-questions-generator
```

### 2. 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 3. 配置 DashScope API

#### 获取 API 密钥

1. 访问 [阿里云 DashScope 控制台](https://dashscope.console.aliyun.com/)
2. 登录或注册阿里云账号
3. 在控制台中创建 API Key
4. 复制生成的 API Key

#### 配置环境变量

在项目根目录创建 `.env.local` 文件：

```bash
# DashScope API 配置
NEXT_PUBLIC_DASHSCOPE_API_KEY=your_api_key_here
```

**重要提示**：
- 将 `your_api_key_here` 替换为你的实际 API Key
- 不要将 `.env.local` 文件提交到 Git 仓库
- 确保使用 `NEXT_PUBLIC_` 前缀，以便在客户端访问

#### 验证配置

确保你的 API Key 有足够的配额：
- 免费版：每天 100 次调用
- 付费版：根据购买的套餐确定

### 4. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

开发服务器将在 [http://localhost:3000](http://localhost:3000) 启动

### 5. 构建生产版本

```bash
npm run build
npm start
# 或
yarn build
yarn start
# 或
pnpm build
pnpm start
```

## 使用说明

### 基本流程

1. **上传简历**
   - 点击上传区域或拖拽文件
   - 支持 PDF、Word (.docx) 和文本文件
   - 文件大小建议不超过 10MB

2. **输入职位描述**
   - 在职位描述文本框中输入目标职位的要求
   - 描述越详细，生成的问题越精准

3. **配置问题参数**
   - 选择问题数量（默认 8 个）
   - 选择问题类型：
     - 技术类问题
     - 行为类问题
     - 职位相关问题

4. **生成问题**
   - 点击"生成面试问题"按钮
   - 等待 AI 分析并生成问题（通常 5-15 秒）

5. **查看和管理**
   - 查看生成的问题列表
   - 查看历史记录
   - 导出问题（支持多种格式）

### API 调用说明

项目使用内部 API 路由 `/api/generate-questions` 来处理请求：

```typescript
// 请求示例
const response = await fetch('/api/generate-questions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    resumeText: '简历文本内容',
    jobDescription: '职位描述内容',
    questionCount: 8,
    questionTypes: ['technical', 'behavioral', 'position-related']
  })
});

const data = await response.json();
console.log(data.questions);
```

## 项目结构

```
interview-questions-generator/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── generate-questions/
│   │   │       └── route.ts          # API 路由
│   │   ├── favicon.ico
│   │   ├── globals.css               # 全局样式
│   │   ├── layout.tsx                # 根布局
│   │   └── page.tsx                  # 主页面
│   ├── components/
│   │   ├── FeaturesSection.tsx       # 功能展示组件
│   │   ├── Footer.tsx                # 页脚组件
│   │   ├── Header.tsx                # 头部组件
│   │   ├── HeroSection.tsx           # 主页横幅
│   │   ├── HistorySection.tsx        # 历史记录组件
│   │   ├── InputSection.tsx          # 输入区域组件
│   │   └── ResultsSection.tsx        # 结果展示组件
│   ├── hooks/
│   │   └── useQuestionsGenerator.ts # 自定义 Hook
│   ├── services/
│   │   └── aiService.ts              # AI 服务
│   ├── types/
│   │   └── index.ts                  # 类型定义
│   └── utils/
│       ├── documentParser.ts         # 文档解析工具
│       ├── exportUtils.ts            # 导出工具
│       └── localStorage.ts           # 本地存储工具
├── public/                          # 静态资源
├── test/                            # 测试文件
├── .env.local                       # 环境变量（需创建）
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── README.md
```

## 环境变量说明

| 变量名 | 说明 | 必需 | 示例 |
|--------|------|------|------|
| `NEXT_PUBLIC_DASHSCOPE_API_KEY` | DashScope API 密钥 | 是 | `sk-xxxxxxxxxxxx` |

## 常见问题

### 1. API 调用失败

**问题**：生成问题时出现 API 错误

**解决方案**：
- 检查 `.env.local` 文件中的 API Key 是否正确
- 确认 API Key 是否有足够的配额
- 检查网络连接是否正常
- 查看 DashScope 控制台的服务状态

### 2. 文件上传失败

**问题**：无法上传简历文件

**解决方案**：
- 确认文件格式是否支持（PDF、DOCX、TXT）
- 检查文件大小是否过大（建议小于 10MB）
- 确认文件是否损坏

### 3. 生成的问题质量不高

**问题**：AI 生成的问题不够精准

**解决方案**：
- 提供更详细的职位描述
- 确保简历内容清晰完整
- 调整问题类型和数量
- 尝试使用不同的 AI 模型参数

### 4. 开发服务器启动失败

**问题**：运行 `npm run dev` 时出错

**解决方案**：
- 确认 Node.js 版本是否满足要求（18.x+）
- 删除 `node_modules` 和 `package-lock.json`，重新安装依赖
- 检查端口 3000 是否被占用

## 开发指南

### 添加新的文档格式支持

1. 在 `src/utils/documentParser.ts` 中添加新的解析函数
2. 在 `src/components/InputSection.tsx` 中更新文件类型过滤器
3. 测试新格式的解析功能

### 自定义 AI 提示词

编辑 `src/services/aiService.ts` 中的 `prompt` 变量来调整 AI 的行为：

```typescript
const prompt = `
基于以下简历信息和职位描述，生成${questionCount}个面试问题。
// 自定义你的提示词
`;
```

### 添加新的导出格式

在 `src/utils/exportUtils.ts` 中添加新的导出函数：

```typescript
export const exportToCustomFormat = (questions: Question[]) => {
  // 实现自定义导出逻辑
};
```

## 部署

### Vercel 部署

1. 将项目推送到 GitHub
2. 在 [Vercel](https://vercel.com) 上导入项目
3. 在 Vercel 设置中添加环境变量 `NEXT_PUBLIC_DASHSCOPE_API_KEY`
4. 点击部署

### 其他平台

确保在部署平台中正确配置环境变量，并构建生产版本：

```bash
npm run build
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 联系方式

如有问题或建议，请通过以下方式联系：
- GitHub Issues: [https://github.com/wetuhutu/interview-questions-generator/issues](https://github.com/wetuhutu/interview-questions-generator/issues)

## 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [DashScope](https://dashscope.aliyun.com/) - AI 服务提供商
- [PDF.js](https://mozilla.github.io/pdf.js/) - PDF 解析库
- [Mammoth](https://github.com/mwilliamson/mammoth.js) - Word 文档解析库
