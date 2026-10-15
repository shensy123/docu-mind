import stylelint from 'stylelint'

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions },
} = stylelint

export const ruleName = 'testim-plugin/no-color-blue'

export const messages = ruleMessages(ruleName, {
  // expected函数：构建报告消息的函数，接受未修复和修复后的值作为参数，并返回一个字符串消息。
  expected: (unfixed, fixed) => `Expected "${unfixed}" to be "${fixed}"`,
})

function getPlugin(primaryOption, secondaryOptionObject, context) {
  // lint函数：会对每个被 lint 的文件运行。
  return function lint(postcssRoot, postcssResult) {
    const validOptions = validateOptions(postcssResult, ruleName, {
      actual: primaryOption, //不允许用户注释临时禁用规则，必须要通过主配置
      possible: [true, false], //允许配置项的值为 true 或 false，表示启用或禁用规则
    })

    // 如果选项无效，则不继续执行规则
    if (!validOptions) {
      return
    }

    // 这里是规则的核心逻辑，遍历 CSS 中的每个声明，检查是否有 color 属性设置为 blue
    const isAutoFixing = Boolean(context.fix)

    //   // 遍历CSS中的每个声明
    postcssRoot.walkDecls(decl => {
      const hasBlue = decl.value.includes('blue')
      // 如果声明中没有包含 'blue'，则跳过该声明
      if (!hasBlue) {
        return
      }

      // 如果启用了自动修复功能，则将颜色值更改为 '#0000FF'
      if (isAutoFixing) {
        const newValue = decl.value.replace('blue', '#0000FF')

        if (decl.raws.value) {
          decl.raws.value.raw = newValue
        } else {
          decl.value = newValue
        }
      } else {
        report({
          ruleName,
          result: postcssResult,
          message: messages.expected('blue', '#0000FF'), // Build the reported message:
          node: decl,
          word: 'blue',
        })
      }
    })
  }
}

export default createPlugin(ruleName, getPlugin)
