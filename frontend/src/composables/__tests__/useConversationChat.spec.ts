// useConversationChat 编排回归:首条消息建会话、追加不新建、空输入守卫、retry 替换重发。
// chatQwenStream 以 mock 模拟 SSE 回调,不触网。
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { chatQwenStream, type StreamCallbacks } from '@/api/chat'
import type { ChatMessage } from '@/types/chat'
import { useConversationStore } from '@/store/conversation'
import { useConversationChat } from '@/composables/useConversationChat'

vi.mock('@/api/chat', () => ({
  chatQwenStream:
    vi.fn<
      (
        messages: ChatMessage[],
        callbacks: StreamCallbacks,
        model?: string,
        signal?: AbortSignal
      ) => Promise<void>
    >(),
}))

const mockedStream = vi.mocked(chatQwenStream)

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

// 模拟一个完整的流式回复
const mockReply = (text = '你好！我是助手。') => {
  mockedStream.mockImplementation(async (_msgs, callbacks) => {
    callbacks.onToken(text)
    callbacks.onComplete(text)
  })
}

describe('useConversationChat（发送→流式→回复编排）', () => {
  it('首条消息:创建会话 + 用户消息入列 + 助手回复落库', async () => {
    const store = useConversationStore()
    const chat = useConversationChat(store)
    mockReply()

    chat.inputText.value = '你好'
    await chat.sendMessage()

    expect(store.sessionList.length).toBe(1)
    expect(store.currentSession.id).toBeTruthy()
    expect(store.sessionList[0]!.title).toBe('你好')
    const msgs = store.currentSession.messages
    expect(msgs.length).toBe(2)
    expect(msgs[0]!.role).toBe('user')
    expect(msgs[1]!.role).toBe('assistant')
    expect(msgs[1]!.content).toContain('你好！')
    expect(mockedStream).toHaveBeenCalledTimes(1)
  })

  it('后续消息:不新建会话,追加进当前会话', async () => {
    const store = useConversationStore()
    const chat = useConversationChat(store)
    mockReply()

    chat.inputText.value = '第一条'
    await chat.sendMessage()
    mockReply('这是第二条回复。')
    chat.inputText.value = '第二条'
    await chat.sendMessage()

    expect(store.sessionList.length).toBe(1)
    expect(store.currentSession.messages.length).toBe(4)
    expect(mockedStream).toHaveBeenCalledTimes(2)
  })

  it('空输入不发请求(trim 守卫)', async () => {
    const store = useConversationStore()
    const chat = useConversationChat(store)
    mockReply()

    chat.inputText.value = '   '
    await chat.sendMessage()

    expect(store.sessionList.length).toBe(0)
    expect(mockedStream).not.toHaveBeenCalled()
  })

  it('retry:删除原失败消息并重新请求,新回复落库', async () => {
    const store = useConversationStore()
    const chat = useConversationChat(store)
    mockReply()

    chat.inputText.value = '问题'
    await chat.sendMessage()
    expect(store.currentSession.messages.length).toBe(2)

    mockReply('重新生成的回复。')
    await chat.retryMessage(1) // 重试 assistant 那条

    const msgs = store.currentSession.messages
    expect(msgs.length).toBe(2) // 删旧回复 + 新回复
    expect(msgs[1]!.content).toContain('重新生成的回复')
    expect(mockedStream).toHaveBeenCalledTimes(2)
  })
})
