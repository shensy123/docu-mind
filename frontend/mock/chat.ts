import Mock from 'mockjs'

const { Random } = Mock

export default [
  {
    url: '/api/chat',
    method: 'post',
    response: () => {
      const replyText = '（Mock）你好，我是Qwen AI 模拟回复：' + Random.csentence(20, 80)
      return {
        code: 0,
        data: replyText,
      }
    },
  },
]
