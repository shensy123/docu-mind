// 现役聊天编排层:发送/停止/重试/流式状态管理(自 ChatPanel 抽出),会话读写走 store/conversation.ts。
// 溯源:任务 02(注释体系存量收敛一期,头注四要素核对补齐)
// 拍板:流式中途切会话为合法操作——旧请求跑完,回复由 activeSessionId 守卫丢弃(不中断新会话)
// 约束:abortController 生命周期封闭于本层,onScopeDispose 自动中止在途请求;组件只消费返回的 api
import type { ChatMessage, SessionItem } from '@/types/chat'
import { chatQwenStream } from '@/api/chat'
import { useConversationStore } from '@/store/conversation'

const systemMessage: ChatMessage = { role: 'assistant', content: '你是一位乐于助人的助手。' }

export function useConversationChat(store: ReturnType<typeof useConversationStore>) {
  const inputText = ref('')
  const isStreaming = ref(false)
  const streamText = ref('')
  const streamReasoning = ref('')
  const errorMsg = ref('')
  const firstMessage = ref(true)

  let abortController: AbortController | null = null
  // 本次流式请求所属会话 id,用于把回复追加回正确的会话(防止流式中途切换会话导致串台)
  let activeSessionId = ''

  const resetStreamData = () => {
    isStreaming.value = false
    streamText.value = ''
    streamReasoning.value = ''
    abortController = null
    // 注意:不在此清 activeSessionId。commitReply 在 onComplete/onError 之后检查
    // canCommitReply(currentSession.id === activeSessionId),若提前清空会导致回复永远被丢弃。
    // 串台守卫由「切会话后 currentSession.id 变化」天然保证,activeSessionId 在下一次 requestReply 时覆盖。
  }

  const buildTitle = (msg: string) => (msg.length > 10 ? `${msg.slice(0, 10)}...` : msg)

  const genarateSessionId = () => Math.random().toString(36).slice(2, 9)

  // 流式传输中切会话是合法操作:让旧请求跑完,但回复丢弃到新会话外(activeSessionId 守卫)
  const canCommitReply = () => store.currentSession.id === activeSessionId

  const requestReply = async () => {
    const messages = store.currentSession.messages || []
    const historyMessages = messages
      .filter(({ error, interrupted }) => !error && !interrupted)
      .map(({ role, content }) => ({ role, content }))
    const requestMessages = [systemMessage, ...historyMessages]

    isStreaming.value = true
    activeSessionId = store.currentSession.id

    const replayMessage: ChatMessage = { role: 'assistant', content: '', reasoning: undefined }
    const callbacks = {
      onToken: (token: string) => {
        streamText.value += token
      },
      onReasoning: (reasoning: string) => {
        streamReasoning.value += reasoning
      },
      onComplete: (fullText: string) => {
        replayMessage.content = fullText || streamText.value
        replayMessage.reasoning = streamReasoning.value || undefined
        resetStreamData()
      },
      onError: (error: string) => {
        errorMsg.value = error
        if (streamText.value) {
          replayMessage.content = `${streamText.value}\n\n[回复中断]`
          replayMessage.reasoning = streamReasoning.value || undefined
          replayMessage.interrupted = true
        } else {
          replayMessage.content = `❌ 请求失败: ${error}`
          replayMessage.error = true
        }
        resetStreamData()
      },
    }

    abortController = new AbortController()
    await chatQwenStream(requestMessages, callbacks, store.currentModelKey, abortController.signal)
    replayMessage.time = new Date()
    return replayMessage
  }

  const commitReply = (replayMessage: ChatMessage) => {
    // 空回复(如停止/中断后)与串台回复都不落库
    if (replayMessage.content && canCommitReply()) {
      store.addMessage(replayMessage)
    }
  }

  const sendMessage = async () => {
    const sendText = inputText.value.trim()
    if (!sendText || isStreaming.value) return

    inputText.value = ''
    errorMsg.value = ''

    const userMsg: ChatMessage = { role: 'user', content: sendText, time: new Date() }

    if (firstMessage.value) {
      const newSessionData: SessionItem = {
        id: genarateSessionId(),
        title: buildTitle(sendText),
        modelKey: store.currentModelKey,
        updatedTime: new Date(),
        messages: [userMsg],
      }
      store.createSession(newSessionData)
      firstMessage.value = false
    } else {
      store.addMessage(userMsg)
    }

    const replayMessage = await requestReply()
    commitReply(replayMessage)
  }

  const stopStreaming = () => {
    abortController?.abort()

    if (streamText.value && canCommitReply()) {
      const interruptedMessage: ChatMessage = {
        role: 'assistant',
        content: `${streamText.value}\n\n[已停止生成]`,
        reasoning: streamReasoning.value || undefined,
        interrupted: true,
      }
      store.addMessage(interruptedMessage)
    }
    resetStreamData()
  }

  const retryMessage = async (idx: number) => {
    store.deleteMessage(idx)
    const replayMessage = await requestReply()
    commitReply(replayMessage)
  }

  // 切换会话/新建空会话时重置输入与流式态;流式进行中的 id 变更(首条建会话)不打断,由请求方自守卫
  watch(
    () => store.currentSession.id,
    () => {
      if (isStreaming.value) return
      inputText.value = ''
      errorMsg.value = ''
      resetStreamData()
      firstMessage.value = !store.currentSession.messages?.length
    }
  )

  // 卸载时中止在途流式请求(composable 作用域内自动注册,调用方无需处理)
  onScopeDispose(() => abortController?.abort())

  return {
    inputText,
    isStreaming,
    streamText,
    streamReasoning,
    errorMsg,
    firstMessage,
    sendMessage,
    stopStreaming,
    retryMessage,
  }
}
