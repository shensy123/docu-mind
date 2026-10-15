import { fileURLToPath } from 'node:url'
import { globalIgnores } from 'eslint/config'
import type { Rule } from 'eslint'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from 'eslint-config-prettier/flat'

// oxlint 配置路径：基于本文件位置解析，保证在 monorepo 根目录运行时也能找到 frontend/.oxlintrc.json
const oxlintConfigPath = fileURLToPath(new URL('./.oxlintrc.json', import.meta.url))

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  // _archive 为归档参考库（不参与构建），显式排除以免从仓库根直接跑 eslint 时误扫
  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/_archive/**']),

  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },

  {
    name: 'app/project-rules',
    rules: {
      // 项目组件命名习惯为单词名 + index.vue（Theme.vue、user/index.vue 等），不做多词强制
      'vue/multi-word-component-names': 'off',
      // 存量 any 约 8 处，短期降 warn 还债（见 _drafts 体检报告 P1-6），后续逐步收紧回 error
      '@typescript-eslint/no-explicit-any': 'warn',
      // `_` 前缀的参数/变量视为有意保留（与 oxlint 默认行为对齐）
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // —— 注释两门禁（docs/coding-standard/comment-style.md §5，2026-10-11 立）——
  // ① no-warning-comments：TODO/FIXME/HACK 禁入（C4 计划类 TODO 仅工作区合法，入库即拦）
  // ② dm/require-file-header：头注存在性（测试文件不入此门禁——无头注为其常态）
  // 头注门禁（comment-style §5）：非测试源文件前 8 行内须有注释。
  // 豁免清单见 docs/coding-standard/comment-style.md §5（只减不增）。
  {
    files: ['src/**/*.{ts,vue}'],
    ignores: ['**/__tests__/**'],
    plugins: {
      dm: {
        rules: {
          'require-file-header': {
            meta: {
              type: 'problem',
              schema: [],
              messages: {
                missing: '文件头注缺失：前 8 行内须有注释（comment-style §3；豁免清单见 §5）',
              },
            },
            create(context) {
              return {
                Program(node) {
                  const hasHeader = context.sourceCode
                    .getAllComments()
                    .some(c => (c.loc?.start.line ?? Infinity) <= 8)
                  if (!hasHeader) context.report({ node, messageId: 'missing' })
                },
              }
            },
          } satisfies Rule.RuleModule,
        },
      },
    },
    rules: {
      'no-warning-comments': ['error', { terms: ['todo', 'fixme', 'hack'], location: 'start' }],
      'dm/require-file-header': 'error',
    },
  },

  // 豁免清单（comment-style §5：存量收敛一期棘轮——核心 8 文件已补齐，其余存量豁免，只减不增；
  // 新增文件一律守头注门禁，不进本清单）
  {
    files: [
      'src/App.vue',
      'src/api/test.ts',
      'src/components/MomentsList.vue',
      'src/components/VirtualList.vue',
      'src/components/common/BasicLayout.vue',
      'src/components/common/BasicScrollContainer.vue',
      'src/directives/focus.ts',
      'src/layouts/FastAsideRight.vue',
      'src/layouts/MainLayout.vue',
      'src/layouts/VMenuList.vue',
      'src/layouts/vAsideLeft.vue',
      'src/layouts/vHeaderOperate.vue',
      'src/layouts/vTabHistory.vue',
      'src/router/menuRoutes.ts',
      'src/router/settingRoutes.ts',
      'src/store/auth.ts',
      'src/theme/index.ts',
      'src/types/chat/index.ts',
      'src/types/login.ts',
      'src/utils/request.ts',
      'src/utils/routeHelper.ts',
      'src/views/AboutView.vue',
      'src/views/Chat/index.vue',
      'src/views/Conversation/CvIndex.vue',
      'src/views/Conversation/components/CvInputTools.vue',
      'src/views/Conversation/components/CvMessageItem.vue',
      'src/views/Conversation/components/CvMessages.vue',
      'src/views/Conversation/components/CvPanel.vue',
      'src/views/Conversation/components/CvSetting.vue',
      'src/views/Conversation/components/CvSidebar.vue',
      'src/views/DocuSetting/Document.vue',
      'src/views/DocuSetting/SettingLayout.vue',
      'src/views/DocuSetting/Theme.vue',
      'src/views/Document/DocumentUpload.vue',
      'src/views/HomeView.vue',
      'src/views/NotFound.vue',
      'src/views/SettingPage.vue',
      'src/views/TestPage/FriendsCircle.vue',
      'src/views/TestPage/LogList.vue',
      'src/views/TestPage/VirtualTest.vue',
      'src/views/login/LoginForm.vue',
      'src/views/login/index.vue',
      'src/views/user/index.vue',
    ],
    rules: { 'dm/require-file-header': 'off' },
  },

  ...pluginOxlint.buildFromOxlintConfigFile(oxlintConfigPath),

  skipFormatting
)
