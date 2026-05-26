// stores/nutricao.js — Store do módulo de Nutrição
// Gerencia a meta calórica, as refeições e o progresso diário

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNutricaoStore = defineStore('nutricao', () => {
  // ─── STATE ────────────────────────────────────────────────────────────────

  const calGoal = ref(2000)    // Meta diária de calorias
  const meals = ref([])        // Array com todas as refeições registradas

  // ─── COMPUTED ─────────────────────────────────────────────────────────────

  // Refeições somente do dia de hoje
  const todayMeals = computed(() => {
    const today = todayKey()
    return meals.value.filter(m => m.date === today)
  })

  // Total de calorias consumidas hoje
  const todayCalories = computed(() => {
    return todayMeals.value.reduce((sum, m) => sum + m.cal, 0)
  })

  // Quantas calorias ainda restam para atingir a meta
  const remainingCalories = computed(() => {
    return Math.max(0, calGoal.value - todayCalories.value)
  })

  // Porcentagem do progresso calórico (pode passar de 100%)
  const caloriesProgress = computed(() => {
    return Math.min(100, (todayCalories.value / calGoal.value) * 100)
  })

  // ─── ACTIONS ──────────────────────────────────────────────────────────────

  // Atualiza a meta calórica diária
  function setGoal(value) {
    calGoal.value = value
    save()
  }

  // Adiciona uma nova refeição ao registro
  function addMeal(name, cal) {
    meals.value.push({
      id: Date.now(),                        // ID único
      date: todayKey(),                      // data de hoje
      name: name.trim(),                     // nome da refeição (sem espaços extras)
      cal: parseInt(cal),                    // calorias como número inteiro
      timestamp: new Date().toISOString()    // horário exato do registro
    })
    save()
  }

  // Remove uma refeição pelo id
  function deleteMeal(id) {
    meals.value = meals.value.filter(m => m.id !== id)
    save()
  }

  // ─── PERSISTÊNCIA ─────────────────────────────────────────────────────────

  function save() {
    localStorage.setItem('mamba_nutricao', JSON.stringify({
      calGoal: calGoal.value,
      meals: meals.value
    }))
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem('mamba_nutricao'))
      if (!saved) return
      calGoal.value = saved.calGoal ?? 2000
      meals.value = saved.meals ?? []
    } catch (e) {
      console.error('Erro ao carregar dados de nutrição:', e)
    }
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────

  function todayKey() {
    return new Date().toISOString().slice(0, 10)
  }

  // Total de calorias para uma data específica
  function caloriesForDate(dateStr) {
    return meals.value
      .filter(m => m.date === dateStr)
      .reduce((sum, m) => sum + m.cal, 0)
  }

  // Refeições para uma data específica
  function mealsForDate(dateStr) {
    return meals.value.filter(m => m.date === dateStr)
  }

  return {
    calGoal, meals,
    todayMeals, todayCalories, remainingCalories, caloriesProgress,
    setGoal, addMeal, deleteMeal, load,
    caloriesForDate, mealsForDate, todayKey
  }
})
