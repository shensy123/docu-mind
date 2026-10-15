/** @type {import("stylelint").Config} */
export default {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-recommended-vue/scss',
    'stylelint-prettier/recommended',
  ],
  files: ['**/*.{css,scss,vue}'],
  plugins: ['stylelint-prettier', './src/plugin/stylelint/no-color-blue.js'], // 引入自定义规则插件
  rules: {
    'at-rule-no-unknown': null, //注释： 关闭css语法的at-rule报错
    'scss/at-rule-no-unknown': true, //注释： 开启scss语法的at-rule报错
    'testim-plugin/no-color-blue': true, // 启用自定义的规则
    'selector-class-pattern': '^[a-z0-9\\-\\_]+$', // 选择器类名必须是小写字母、数字、连字符、下划线连字符
  },
}
