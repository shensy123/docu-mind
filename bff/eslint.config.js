// bff eslint 配置：typescript-eslint recommended 基线＋注释两门禁（移植自 frontend，无 .vue 故从简）。
// 格式归 prettier（bff 码风有分号双引号），配置尾部的 eslint-config-prettier 负责关闭格式类规则避免两边打架。

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import skipFormatting from "eslint-config-prettier/flat";

export default tseslint.config(
  // data/ 为 SQLite 数据目录（gitignore），显式排除
  { ignores: ["data/"] },

  js.configs.recommended,
  tseslint.configs.recommended,

  // —— 注释两门禁（docs/coding-standard/comment-style.md §5，02 号立规、03 号接入 bff）——
  // ① no-warning-comments：计划类标记禁入（工作区合法，入库即拦）
  // ② dm/require-file-header：头注存在性（测试文件不入此门禁——无头注为其常态）
  {
    files: ["**/*.ts"],
    ignores: ["**/__tests__/**"],
    plugins: {
      dm: {
        rules: {
          "require-file-header": {
            meta: {
              type: "problem",
              schema: [],
              messages: {
                missing: "文件头注缺失：前 8 行内须有注释（comment-style §3；豁免清单见 §5）",
              },
            },
            create(context) {
              return {
                Program(node) {
                  const hasHeader = context.sourceCode
                    .getAllComments()
                    .some((c) => (c.loc?.start.line ?? Infinity) <= 8);
                  if (!hasHeader) context.report({ node, messageId: "missing" });
                },
              };
            },
          },
        },
      },
    },
    rules: {
      "no-warning-comments": ["error", { terms: ["todo", "fixme", "hack"], location: "start" }],
      "dm/require-file-header": "error",
    },
  },

  skipFormatting,
);
