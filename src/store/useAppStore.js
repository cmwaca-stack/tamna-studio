import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { NOTES_TABLE, supabase } from '../lib/supabase'
import { askAgent } from '../api/client'

// ── 앱 전체가 함께 쓰는 상태(store) ───────────────────────────
// 여러 페이지가 같이 쓰는 값은 여기에, 한 페이지에서만 쓰는 값은 그 페이지의 useState 에 둡니다.
const NO_DB = 'Supabase 설정(.env.local)이 필요해요'

export const useAppStore = create(
  persist(
    (set, get) => ({
      // ① 사용자·선택 상태 — localStorage 에 저장되어 새로고침해도 유지
      nickname: '',
      setNickname: (nickname) => set({ nickname: nickname.trim() }),
      themeKey: 'oreum',
      setThemeKey: (themeKey) => set({ themeKey }),

      // ② 알림(토스트)
      toasts: [],
      toast: (message, variant = 'ok') => {
        const id = Date.now() + Math.random()
        set({ toasts: [...get().toasts, { id, message, variant }] })
        setTimeout(() => set({ toasts: get().toasts.filter((t) => t.id !== id) }), 2800)
      },

      // ③ 내 소재 노트 — Supabase tamna_notes 테이블과 동기화
      notes: [],
      notesLoading: false,
      owner: () => get().nickname || '익명',

      loadNotes: async () => {
        if (!supabase) return get().toast(NO_DB, 'warn')
        set({ notesLoading: true })
        const { data, error } = await supabase
          .from(NOTES_TABLE).select('*').eq('nickname', get().owner()).order('created_at', { ascending: false })
        set({ notesLoading: false })
        if (error) return get().toast(error.message, 'error')
        set({ notes: data })
      },

      addNote: async ({ source, id, title }) => {
        if (!supabase) return get().toast(NO_DB, 'warn')
        const row = { nickname: get().owner(), theme: get().themeKey, source, item_id: String(id), title }
        const { data, error } = await supabase.from(NOTES_TABLE).insert(row).select().single()
        if (error) {
          return error.code === '23505'
            ? get().toast('이미 내 소재 노트에 있어요', 'warn')
            : get().toast(error.message, 'error')
        }
        set({ notes: [data, ...get().notes] })
        get().toast('내 소재 노트에 저장했어요')
      },

      updateMemo: async (id, memo) => {
        if (!supabase) return
        const { error } = await supabase.from(NOTES_TABLE).update({ memo }).eq('id', id)
        if (error) return get().toast(error.message, 'error')
        set({ notes: get().notes.map((n) => (n.id === id ? { ...n, memo } : n)) })
        get().toast('메모를 저장했어요')
      },

      removeNote: async (id) => {
        if (!supabase) return
        const { error } = await supabase.from(NOTES_TABLE).delete().eq('id', id)
        if (error) return get().toast(error.message, 'error')
        set({ notes: get().notes.filter((n) => n.id !== id) })
        get().toast('삭제했어요')
      },

      // ④ AI 가이드 대화 — 페이지를 옮겨 다녀도 대화가 남도록 store 에 둡니다
      messages: [], // { role: 'user' | 'assistant', text, steps? }
      chatLoading: false,
      sendMessage: async (text) => {
        const history = get().messages.map((m) => ({ role: m.role, content: m.text }))
        set({ messages: [...get().messages, { role: 'user', text }], chatLoading: true })
        try {
          const { answer, steps } = await askAgent(text, history)
          set({ messages: [...get().messages, { role: 'assistant', text: answer, steps }] })
        } catch (e) {
          get().toast(e.message, 'error')
        } finally {
          set({ chatLoading: false })
        }
      },
      clearChat: () => set({ messages: [] }),
    }),
    {
      name: 'tamna-studio-store',
      partialize: (s) => ({ nickname: s.nickname, themeKey: s.themeKey }), // 저장할 항목만 고르기
    },
  ),
)
