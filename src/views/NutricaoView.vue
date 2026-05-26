<template>
  <div>

    <!-- ─── META CALÓRICA ─── -->
    <div class="card">
      <div class="card-title">meta calórica diária</div>

      <div class="input-row">
        <div class="form-group" style="flex: 1;">
          <label class="form-label">Meta de calorias (kcal/dia)</label>
          <input type="number" v-model.number="goalInput" min="500" max="9999" />
        </div>
        <button class="btn sm" style="align-self: flex-end;" @click="saveGoal">Salvar meta</button>
      </div>

      <!-- Resumo em cards numéricos -->
      <div class="metric-grid" style="margin-top: 0.875rem;">
        <div class="metric-card">
          <div class="metric-label">Meta</div>
          <div class="metric-value">{{ nutStore.calGoal }}</div>
          <div class="metric-sub">kcal/dia</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Consumido</div>
          <!-- :style com objeto permite múltiplas propriedades CSS dinâmicas -->
          <div class="metric-value" :style="{ color: caloriesColor }">{{ nutStore.todayCalories }}</div>
          <div class="metric-sub">kcal hoje</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Restante</div>
          <div class="metric-value">{{ nutStore.remainingCalories }}</div>
          <div class="metric-sub">kcal</div>
        </div>
      </div>

      <!-- Barra de progresso calórico -->
      <div class="progress-wrap">
        <div class="progress-labels">
          <span>{{ Math.round(nutStore.caloriesProgress) }}% da meta</span>
          <span v-if="nutStore.todayCalories > nutStore.calGoal" style="color: var(--color-red);">
            +{{ nutStore.todayCalories - nutStore.calGoal }} kcal acima
          </span>
        </div>
        <div class="progress-track">
          <div
            class="progress-fill"
            :class="progressClass"
            :style="{ width: nutStore.caloriesProgress + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- ─── REGISTRAR REFEIÇÃO ─── -->
    <div class="card">
      <div class="card-title">registrar refeição</div>

      <div class="input-row" style="align-items: flex-end; flex-wrap: wrap; gap: 8px;">
        <div class="form-group" style="flex: 2; min-width: 160px;">
          <label class="form-label">Nome da refeição</label>
          <input
            type="text"
            v-model="mealName"
            placeholder="Ex: Almoço, Café da manhã..."
            maxlength="50"
            @keyup.enter="addMeal"
          />
        </div>
        <div class="form-group" style="flex: 1; min-width: 100px;">
          <label class="form-label">Calorias (kcal)</label>
          <input
            type="number"
            v-model.number="mealCal"
            placeholder="0"
            min="1"
            max="5000"
            @keyup.enter="addMeal"
          />
        </div>
        <button class="btn primary sm" @click="addMeal" style="height: 36px;">
          + Adicionar
        </button>
      </div>

      <!-- Mensagem de erro simples -->
      <p v-if="errorMsg" style="font-size: 12px; color: var(--color-red); margin-top: 4px;">
        {{ errorMsg }}
      </p>

      <!-- Gráfico de barras das refeições do dia -->
      <div v-if="nutStore.todayMeals.length > 0" style="margin-top: 1rem;">
        <div class="card-title" style="margin-bottom: 0.5rem;">calorias por refeição</div>
        <div style="position: relative; height: 180px;">
          <!-- ref="chartCanvas" permite acessar o elemento DOM diretamente -->
          <canvas ref="chartCanvas" role="img" aria-label="Gráfico de barras com calorias de cada refeição"></canvas>
        </div>
      </div>
    </div>

    <!-- ─── HISTÓRICO DE REFEIÇÕES ─── -->
    <div class="card">
      <div class="card-title">refeições de hoje</div>

      <div class="history-list">
        <div v-if="nutStore.todayMeals.length === 0" class="empty-state">
          🥗 Nenhuma refeição registrada hoje
        </div>

        <div
          v-for="meal in [...nutStore.todayMeals].reverse()"
          :key="meal.id"
          class="history-item"
        >
          <div>
            <div class="history-item-name">{{ meal.name }}</div>
            <div class="history-item-detail">
              {{ formatTime(meal.timestamp) }} •
              {{ Math.round((meal.cal / nutStore.calGoal) * 100) }}% da meta
            </div>
          </div>
          <div class="history-item-right">
            <span style="font-size: 15px; font-weight: 600; color: var(--color-text);">
              {{ meal.cal }} kcal
            </span>
            <button class="btn-icon" @click="nutStore.deleteMeal(meal.id)" title="Remover">✕</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useNutricaoStore } from '../stores/nutricao'

// Registra todos os tipos de gráficos do Chart.js
Chart.register(...registerables)

const nutStore = useNutricaoStore()

// ─── Estado local ─────────────────────────────────────────────────────────────
const goalInput = ref(nutStore.calGoal)
const mealName  = ref('')
const mealCal   = ref(null)
const errorMsg  = ref('')
const chartCanvas = ref(null)  // ref para o elemento <canvas> do DOM
let chartInstance = null       // instância do Chart.js

// ─── Computed ─────────────────────────────────────────────────────────────────

// Cor do número de calorias consumidas
const caloriesColor = computed(() => {
  const p = nutStore.caloriesProgress
  if (p > 100) return 'var(--color-red)'
  if (p > 85)  return '#BA7517'
  return 'var(--color-text)'
})

// Classe CSS da barra de progresso calórica
const progressClass = computed(() => {
  const p = nutStore.caloriesProgress
  if (p > 100) return 'over'
  if (p > 85)  return 'warn'
  return 'ok'
})

// ─── Métodos ──────────────────────────────────────────────────────────────────

function saveGoal() {
  if (goalInput.value >= 500) {
    nutStore.setGoal(goalInput.value)
  }
}

function addMeal() {
  errorMsg.value = ''
  if (!mealName.value.trim()) {
    errorMsg.value = 'Informe o nome da refeição.'
    return
  }
  if (!mealCal.value || mealCal.value <= 0) {
    errorMsg.value = 'Informe um valor de calorias válido.'
    return
  }
  nutStore.addMeal(mealName.value, mealCal.value)
  mealName.value = ''
  mealCal.value = null
}

function formatTime(isoStr) {
  if (!isoStr) return ''
  return new Date(isoStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

// Renderiza ou atualiza o gráfico de barras
async function renderChart() {
  // nextTick garante que o DOM já foi atualizado antes de acessar o canvas
  await nextTick()

  if (!chartCanvas.value) return

  const meals = nutStore.todayMeals

  if (chartInstance) {
    // Atualiza os dados do gráfico existente em vez de criar um novo
    chartInstance.data.labels   = meals.map(m => m.name)
    chartInstance.data.datasets[0].data = meals.map(m => m.cal)
    chartInstance.update()
    return
  }

  // Cria o gráfico pela primeira vez
  chartInstance = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels: meals.map(m => m.name),
      datasets: [{
        label: 'kcal',
        data: meals.map(m => m.cal),
        backgroundColor: '#B5D4F4',
        borderColor: '#185FA5',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }  // ocultamos a legenda padrão
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,.06)' },
          ticks: { font: { size: 11 } }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 }, autoSkip: false }
        }
      }
    }
  })
}

// ─── Watchers ─────────────────────────────────────────────────────────────────
// watch() observa uma variável reativa e executa uma função quando ela muda

// Quando as refeições mudam, atualiza o gráfico
watch(() => nutStore.todayMeals, (newMeals) => {
  if (newMeals.length > 0) {
    renderChart()
  } else if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
}, { deep: true })  // deep: true para observar mudanças dentro do array

// Sincroniza o input da meta com o store
watch(() => nutStore.calGoal, (val) => {
  goalInput.value = val
})

onUnmounted(() => {
  if (chartInstance) chartInstance.destroy()
})
</script>

<style scoped>
.input-row {
  display: flex;
  gap: 8px;
}
</style>
