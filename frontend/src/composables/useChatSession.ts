import type { BasicSession, SessionItem } from '@/types/chat'

export function useChatSession() {
  const CHAT_SESSION_LIST = 'chat_session_list'
  const CHAT_SESSION_ITEM = 'chat_session_item'

  const getSessionList = (): BasicSession[] => {
    const data = localStorage.getItem(CHAT_SESSION_LIST) // 从本地存储中获取会话列表数据
    return data ? JSON.parse(data) : []
  }

  const saveSessionList = (sessions: BasicSession[]) => {
    localStorage.setItem(CHAT_SESSION_LIST, JSON.stringify(sessions))
  }

  const updateSessionList = (sessionId: string) => {
    let sessions = getSessionList()
    sessions = sessions.filter(s => s.id !== sessionId)
    saveSessionList(sessions)
  }

  const getSession = (sessionId: string): SessionItem | null => {
    const data = localStorage.getItem(`${CHAT_SESSION_ITEM}_${sessionId}`)
    return data ? JSON.parse(data) : null
  }

  const saveSession = (sessionId: string, session: SessionItem) => {
    localStorage.setItem(`${CHAT_SESSION_ITEM}_${sessionId}`, JSON.stringify(session))
  }

  // 移除会话
  const removeSession = (sessionId: string) => {
    localStorage.removeItem(`${CHAT_SESSION_ITEM}_${sessionId}`)
  }

  return {
    getSessionList,
    saveSessionList,
    updateSessionList,
    getSession,
    saveSession,
    removeSession,
  }
}

export function useSessionList() {
  const CHAT_SESSION_LIST = 'chat_session_list'

  const getSessionList = (): BasicSession[] => {
    const data = localStorage.getItem(CHAT_SESSION_LIST)
    return data ? JSON.parse(data) : []
  }

  const setSessionList = (sessions: BasicSession[]) => {
    localStorage.setItem(CHAT_SESSION_LIST, JSON.stringify(sessions))
  }

  const destroySessionList = () => {
    localStorage.removeItem(CHAT_SESSION_LIST)
  }

  return {
    getSessionList,
    setSessionList,
    destroySessionList,
  }
}

export function useSession() {
  const CHAT_SESSION_ITEM = 'chat_session_item'

  const getSession = (id: string): SessionItem | null => {
    const data = localStorage.getItem(`${CHAT_SESSION_ITEM}_${id}`)
    return data ? JSON.parse(data) : null
  }

  const setSession = (session: SessionItem) => {
    localStorage.setItem(`${CHAT_SESSION_ITEM}_${session.id}`, JSON.stringify(session))
  }

  const destroySession = (id: string) => {
    localStorage.removeItem(`${CHAT_SESSION_ITEM}_${id}`)
  }

  return {
    getSession,
    setSession,
    destroySession,
  }
}
