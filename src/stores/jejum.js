// stores/jejum.js — Store do módulo de Jejum usando Pinia
// O "store" é como um banco de dados reativo do front-end.
// Qualquer componente pode ler ou modificar esses dados.

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useJejumStore = defineStore('jejum', () => {
  // ─── STATE (dados reativos) ───────────────────────────────────────────────
  // ref() torna a variável reativa: quando ela muda, a tela atualiza sozinha

  const fastWindow = ref(16)        // Horas de jejum escolhidas (ex: 16)
  const eatWindow = ref(8)          // Horas da janela alimentar (ex: 8)
  const fastStart = ref(null)       // Date/hora em que o jejum foi iniciado
  const fastActive = ref(false)     // Boolean: jejum está ativo agora?
  const fasts = ref([])             // Array com todos os jejuns já finalizados

  // ─── COMPUTED (valores calculados automaticamente) ────────────────────────
  // computed() recalcula o valor sempre que as dependências mudam

  // Jejuns apenas de hoje
  const todayFasts = computed(() => {
    const today = todayKey()
    return fasts.value.filter(f => f.date === today)
  })

  // Quantas horas já foram feitas no jejum atual
  const elapsedHours = computed(() => {
    if (!fastStart.value) return 0
    const ms = Date.now() - new Date(fastStart.value).getTime()
    return ms / 3600000  // converte milissegundos para horas
  })

  // Porcentagem de progresso do jejum atual (0 a 100)
  const fastProgress = computed(() => {
    return Math.min(100, (elapsedHours.value / fastWindow.value) * 100)
  })

  // ─── ACTIONS (funções que modificam o estado) ─────────────────────────────

  // Define a janela de jejum (ex: 16h de jejum, 8h de alimentação)
  function setWindow(fast, eat) {
    fastWindow.value = fast
    eatWindow.value = eat
    save()
  }

  // Inicia um novo ciclo de jejum
  function startFast() {
    fastStart.value = new Date().toISOString()  // salva horário atual como string ISO
    fastActive.value = true
    save()
  }

  // Finaliza o jejum e salva no histórico
  function endFast() {
    if (!fastStart.value) return

    const end = new Date()
    const start = new Date(fastStart.value)
    const durationHours = (end - start) / 3600000  // duração em horas

    // Cria um objeto representando este jejum e adiciona ao histórico
    fasts.value.push({
      id: Date.now(),                              // ID único baseado no timestamp
      date: todayKey(),                            // data no formato "YYYY-MM-DD"
      start: fastStart.value,                      // horário de início
      end: end.toISOString(),                      // horário de fim
      duration: Math.round(durationHours * 10) / 10,  // horas com 1 decimal
      window: fastWindow.value                     // meta de horas desse jejum
    })

    // Reseta o estado ativo
    fastActive.value = false
    fastStart.value = null
    save()
  }

  // Remove um jejum do histórico pelo id
  function deleteFast(id) {
    fasts.value = fasts.value.filter(f => f.id !== id)
    save()
  }

  // ─── PERSISTÊNCIA (localStorage) ─────────────────────────────────────────

  // Salva o estado atual no localStorage como JSON
  function save() {
    localStorage.setItem('mamba_jejum', JSON.stringify({
      fastWindow: fastWindow.value,
      eatWindow: eatWindow.value,
      fastStart: fastStart.value,
      fastActive: fastActive.value,
      fasts: fasts.value
    }))
  }

  // Carrega o estado salvo ao abrir o app
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem('mamba_jejum'))
      if (!saved) return
      fastWindow.value = saved.fastWindow ?? 16
      eatWindow.value = saved.eatWindow ?? 8
      fastStart.value = saved.fastStart ?? null
      fastActive.value = saved.fastActive ?? false
      fasts.value = saved.fasts ?? []
    } catch (e) {
      console.error('Erro ao carregar dados de jejum:', e)
    }
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────

  // Retorna a data de hoje no formato "YYYY-MM-DD"
  function todayKey() {
    return new Date().toISOString().slice(0, 10)
  }

  // Retorna os jejuns de um dia específico (formato "YYYY-MM-DD")
  function fastsForDate(dateStr) {
    return fasts.value.filter(f => f.date === dateStr)
  }

  // Soma total de horas de jejum em um dia
  function hoursForDate(dateStr) {
    return fastsForDate(dateStr).reduce((sum, f) => sum + f.duration, 0)
  }

  // ─── EXPORTAÇÕES ──────────────────────────────────────────────────────────
  // Tudo que listamos aqui fica disponível nos componentes que usarem este store
  return {
    fastWindow, eatWindow, fastStart, fastActive, fasts,
    todayFasts, elapsedHours, fastProgress,
    setWindow, startFast, endFast, deleteFast, load,
    fastsForDate, hoursForDate, todayKey
  }
})
