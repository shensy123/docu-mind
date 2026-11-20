// 会话/消息状态收敛于此,useConversationChat 与 Conversation 组件消费。
// 溯源:任务 02(注释体系存量收敛一期,头注四要素核对补齐)
// 注:旧 store/chat.ts(SessionChat 体系的退役 store)已于 2026-09-08 归档至 _archive/L2-退役聊天实现/gen3-sessionChat/;
// 两者曾共用同一套 localStorage key(chat_session_*),归档后本 store 是唯一读写方。
import type { BasicSession, ChatMessage, SessionItem } from '@/types/chat'
import { useSessionList, useSession } from '@/composables/useChatSession'

const { getSessionList, setSessionList, destroySessionList } = useSessionList()
const { getSession, setSession, destroySession } = useSession()

export const useConversationStore = defineStore('conversation', () => {
  const sessionList = ref<BasicSession[]>(getSessionList() || [])
  const currentSession = ref<SessionItem>({} as SessionItem)
  const currentModelKey = ref<string>('qwen3.8-flash')
  const isTemporary = ref<boolean>(false)

  // 无会话 id(空/临时态)时不写 localStorage,避免 chat_session_item_undefined 键
  const persistCurrent = () => {
    if (currentSession.value.id) setSession(currentSession.value)
  }

  const openEmptySession = () => {
    if (!currentSession.value.id) return
    currentSession.value = {} as SessionItem
    currentModelKey.value = 'qwen3.8-flash'
    isTemporary.value = false // 2026-11-05 修复：临时标记无重置点，开新会话后残留 true 导致新会话被误标
  }

  const openSession = (id: string) => {
    const session = getSession(id)
    currentSession.value = session || ({} as SessionItem)
    currentModelKey.value = session?.modelKey || 'qwen3.8-flash'
    isTemporary.value = false // 打开既有会话即离开临时态（2026-11-05）
  }

  const updateSessionName = (id: string, name: string) => {
    const session = sessionList.value.find(item => item.id === id)
    if (!session) return
    session.title = name
    currentSession.value.title = name

    setSessionList(sessionList.value)
    persistCurrent()

    ElMessage({ type: 'success', message: '更改成功' })
  }

  const deleteSession = (id: string) => {
    sessionList.value = sessionList.value.filter(item => item.id !== id)

    setSessionList(sessionList.value)
    destroySession(id)

    if (currentSession.value.id === id) {
      openEmptySession()
    }

    ElMessage({ type: 'success', message: '删除成功' })
  }

  const deleteAllSessions = () => {
    sessionList.value.forEach(({ id }) => {
      destroySession(id)
    })
    destroySessionList()

    sessionList.value = []
    currentSession.value = {} as SessionItem
    currentModelKey.value = 'qwen3.8-flash'

    ElMessage({ type: 'success', message: '全部删除成功' })
  }

  const onTemporarySession = () => {
    isTemporary.value = true
    openEmptySession()
  }

  const createSession = (session: SessionItem) => {
    const { messages: _messages, ...rest } = session
    sessionList.value.unshift(rest)
    currentSession.value = session
    currentModelKey.value = session.modelKey

    setSessionList(sessionList.value)
    persistCurrent()
  }

  const updateModelKey = (modelKey: string) => {
    currentModelKey.value = modelKey
    currentSession.value.modelKey = modelKey

    persistCurrent()
    ElMessage({ type: 'success', message: `已切换模型：${modelKey}` })
  }

  const addMessage = (message: ChatMessage) => {
    const lastTime = message.time || new Date()

    const session = sessionList.value.find(item => item.id === currentSession.value.id)
    if (session) {
      session.updatedTime = lastTime
    }

    currentSession.value.messages ||= []
    currentSession.value.messages.push(message)
    currentSession.value.updatedTime = lastTime

    setSessionList(sessionList.value)
    persistCurrent()
  }

  const deleteMessage = (idx: number) => {
    currentSession.value.messages ||= []
    const length = currentSession.value.messages.length || -1
    if (length < 0) return
    currentSession.value.messages.splice(idx, 1)

    if (idx === length - 1) {
      const lastMsg = currentSession.value.messages.at(-1)
      const lastTime = lastMsg?.time || new Date()
      const session = sessionList.value.find(item => item.id === currentSession.value.id)
      currentSession.value.updatedTime = lastTime
      if (session) {
        session.updatedTime = lastTime
        setSessionList(sessionList.value)
      }
    }

    persistCurrent()
    ElMessage({ type: 'success', message: '删除成功' })
  }

  return {
    sessionList,
    currentSession,
    currentModelKey,
    isTemporary,
    openEmptySession,
    openSession,
    updateSessionName,
    deleteSession,
    deleteAllSessions,
    onTemporarySession,
    createSession,
    updateModelKey,
    addMessage,
    deleteMessage,
  }
})
