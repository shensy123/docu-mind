// store/conversation.ts 回归测试——覆盖 5 项修正:
// ①deleteSession filter !==  ②删除 currentSessionId ref(派生 currentSession.id,删当前会话自动清空)
// ③删 onMounted(初始化即读 localStorage)  ④messages ||= [] 守卫(空会话 addMessage 不崩)
// ⑤persistCurrent 无 id 跳过(不产生 chat_session_item_undefined 键)
import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { BasicSession, SessionItem } from '@/types/chat'
import { useConversationStore } from '@/store/conversation'

const mkSession = (id: string, title = `会话${id}`, modelKey = 'qwen-turbo'): SessionItem => ({
  id,
  title,
  modelKey,
  updatedTime: new Date('2026-08-01T00:00:00Z'),
  messages: [],
})

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

describe('store/conversation（5 项修正回归）', () => {
  it('修正④：空会话 addMessage 不崩（messages ||= [] 守卫）', () => {
    const store = useConversationStore()
    expect(() => store.addMessage({ role: 'user', content: '你好' })).not.toThrow()
    expect(store.currentSession.messages?.length).toBe(1)
  })

  it('修正⑤：无会话 id 时不写 localStorage（不产生 chat_session_item_undefined 键）', () => {
    const store = useConversationStore()
    store.updateModelKey('qwen-max')
    const keys = Object.keys(localStorage)
    expect(keys.some(k => k.includes('chat_session_item_undefined'))).toBe(false)
  })

  it('createSession 创建会话并持久化，currentSession 指向新会话', () => {
    const store = useConversationStore()
    store.createSession(mkSession('s1', '首条'))
    expect(store.sessionList[0]!.id).toBe('s1')
    expect(store.currentSession.id).toBe('s1')
    expect(localStorage.getItem('chat_session_list')).toContain('s1')
    expect(localStorage.getItem('chat_session_item_s1')).toBeTruthy()
  })

  it('修正①：deleteSession 用 !== 过滤，只删目标、保留其他', () => {
    const store = useConversationStore()
    store.createSession(mkSession('a'))
    store.createSession(mkSession('b'))
    store.deleteSession('a')
    expect(store.sessionList.map(s => s.id)).toEqual(['b'])
  })

  it('修正②：删除当前会话后自动清空 currentSession（派生自 currentSession.id）', () => {
    const store = useConversationStore()
    store.createSession(mkSession('cur'))
    expect(store.currentSession.id).toBe('cur')
    store.deleteSession('cur')
    expect(store.currentSession.id).toBeUndefined()
  })

  it('openEmptySession 从真实会话切换到空白新会话（幂等）', () => {
    const store = useConversationStore()
    store.createSession(mkSession('x'))
    store.openEmptySession()
    expect(store.currentSession.id).toBeUndefined()
  })

  it('deleteAllSessions 清空列表与 currentSession', () => {
    const store = useConversationStore()
    store.createSession(mkSession('a'))
    store.createSession(mkSession('b'))
    store.deleteAllSessions()
    expect(store.sessionList).toEqual([])
    expect(store.currentSession.id).toBeUndefined()
  })

  it('修正③：store 初始化即读 localStorage（不依赖组件 onMounted）', () => {
    const seed: BasicSession[] = [{ id: 'seed', title: '种子', updatedTime: new Date() }]
    localStorage.setItem('chat_session_list', JSON.stringify(seed))
    const store = useConversationStore()
    expect(store.sessionList.length).toBe(1)
    expect(store.sessionList[0]!.id).toBe('seed')
  })

  it('openSession 从 localStorage 读取并同步 currentModelKey', () => {
    const store = useConversationStore()
    store.createSession(mkSession('h', '历史', 'qwen-max'))
    store.openEmptySession()
    store.openSession('h')
    expect(store.currentSession.id).toBe('h')
    expect(store.currentModelKey).toBe('qwen-max')
  })
})
