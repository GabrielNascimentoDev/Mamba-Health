<template>
  <div>

    <!-- ─── MÉTRICAS RESUMIDAS ─── -->
    <div class="metric-grid">
      <div class="metric-card">
        <div class="metric-label">Jejuns completos</div>
        <div class="metric-value">{{ stats.completedFasts }}</div>
        <div class="metric-sub">últimos 7 dias</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Total em jejum</div>
        <div class="metric-value">{{ stats.totalFastHours }}h</div>
        <div class="metric-sub">últimos 7 dias</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Média calórica</div>
        <div class="metric-value">{{ stats.avgCalories || '—' }}</div>
        <div class="metric-sub">kcal/dia</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Dias com jejum</div>
        <div class="metric-value">{{ stats.daysWithFast }}/7</div>
        <div class="metric-sub">dias</div>
      </div>
    </div>

    <!-- ─── CALENDÁRIO VISUAL DE JEJUM ─── -->
    <div class="card">
      <div class="card-title">horas de jejum — 7 dias</div>

      <div class="week-grid">
        <div
          v-for="day in weekDays"
          :key="day.dateStr"
          class="week-col"
        >
          <!-- Label do dia da semana -->
          <div class="week-day-label">{{ day.label }}</div>

          <!-- Barra proporcional às horas de jejum -->
          <div class="week-bar-wrap">
            <div
              class="week-bar"
              :style="{
                height: day.barHeight + 'px',
                background: day.barColor
              }"
              :title="`${day.hours}h de jejum`"
            ></div>
          </div>

          <!-- Valor numérico abaixo da barra -->
          <div class="week-bar-val">{{ day.hours > 0 ? day.hours + 'h' : '—' }}</div>
        </div>
      </div>

      <!-- Legenda -->
      <div class="legend">
        <span class="legend-item">
          <span class="legend-dot" style="background: #185FA5;"></span> Meta atingida
        </span>
        <span class="legend-item">
          <span class="legend-dot" style="background: #B5D4F4;"></span> Parcial
        </span>
        <span class="legend-item">
          <span class="legend-dot" style="background: #e5e4e0;"></span> Sem jejum
        </span>
      </div>
    </div>

    <!-- ─── GRÁFICO DE CALORIAS SEMANAIS ─── -->
    <div class="card">
      <div class="card-title">calorias por dia — 7 dias</div>
      <div style="position: relative; height: 180px;">
        <canvas
          ref="weekChartCanvas"
          role="img"
          aria-label="Gráfico de barras com calorias consumidas nos últimos 7 dias"
        >Sem dados suficientes para exibir o gráfico.</canvas>
      </div>
      <!-- Legenda manual do gráfico -->
      <div class="legend" style="margin-top: 8px;">
        <span class="legend-item">
          <span class="legend-dot" style="background: #B5D4F4; border-radius: 2px;"></span> Calorias
        </span>
        <span class="legend-item">
          <span style="display:inline-block; width:20px; height:2px; background:#BA7517; vertical-align:middle; margin-right:4px;"></span>Meta
        </span>
      </div>
    </div>

    <!-- ─── LISTA DE JEJUNS DA SEMANA ─── -->
    <div class="card">
      <div class="card-title">histórico de jejuns — 7 dias</div>
      <div class="history-list">
        <div v-if="weekFasts.length === 0" class="empty-state">
          📅 Nenhum jejum nos últimos 7 dias
        </div>
        <div
          v-for="fast in weekFasts"
          :key="fast.id"
          class="history-item"
        >
          <div>
            <div class="history-item-name">
              {{ formatDate(fast.date) }} — {{ fast.window }}h:{{ 24 - fast.window }}h
            </div>
            <div class="history-item-detail">
              Duração: {{ fast.duration }}h •
              {{ formatTime(fast.start) }} → {{ formatTime(fast.end) }}
            </div>
          </div>
          <span class="badge" :class="fast.duration >= fast.window ? 'green' : 'amber'">
            {{ fast.duration >= fast.window ? 'Completo' : 'Parcial' }}
          </span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useJejumStore } from '../stores/jejum'
import { useNutricaoStore } from '../stores/nutricao'

Chart.register(...registerables)

const jejumStore  = useJejumStore()
const nutStore    = useNutricaoStore()
const weekChartCanvas = ref(null)
let weekChart = null

// ─── Helpers de data ──────────────────────────────────────────────────────────

// Retorna array com as datas dos últimos 7 dias no formato "YYYY-MM-DD"
function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))  // 6 dias atrás até hoje
    return d.toISOString().slice(0, 10)
  })
}

// ─── Dados calculados ─────────────────────────────────────────────────────────

// Array dos 7 dias com todos os dados necessários para o calendário visual
const weekDays = computed(() => {
  const days = getLast7Days()
  const maxHours = Math.max(...days.map(d => jejumStore.hoursForDate(d)), 1)

  return days.map(dateStr => {
    const hours = Math.round(jejumStore.hoursForDate(dateStr) * 10) / 10
    const barHeight = hours > 0 ? Math.max(4, Math.round((hours / maxHours) * 80)) : 2
    const metaAtingida = hours >= jejumStore.fastWindow

    // Labels curtos dos dias da semana
    const dayName = new Date(dateStr + 'T12:00:00')
      .toLocaleDateString('pt-BR', { weekday: 'short' })
      .slice(0, 3)
      .toUpperCase()

    return {
      dateStr,
      label: dayName,
      hours,
      barHeight,
      barColor: hours === 0 ? '#e5e4e0' : metaAtingida ? '#185FA5' : '#B5D4F4'
    }
  })
})

// Estatísticas resumidas dos 7 dias
const stats = computed(() => {
  const days = getLast7Days()

  // Filtra jejuns dos últimos 7 dias
  const fasts7 = jejumStore.fasts.filter(f => days.includes(f.date))

  const completedFasts = fasts7.filter(f => f.duration >= f.window).length
  const totalFastHours = Math.round(fasts7.reduce((s, f) => s + f.duration, 0) * 10) / 10
  const daysWithFast   = new Set(fasts7.map(f => f.date)).size

  // Calorias: só conta dias que têm alguma refeição registrada
  const calDays = days.map(d => nutStore.caloriesForDate(d)).filter(c => c > 0)
  const avgCalories = calDays.length
    ? Math.round(calDays.reduce((s, c) => s + c, 0) / calDays.length)
    : 0

  return { completedFasts, totalFastHours, daysWithFast, avgCalories }
})

// Jejuns dos últimos 7 dias em ordem cronológica reversa
const weekFasts = computed(() => {
  const days = getLast7Days()
  return jejumStore.fasts
    .filter(f => days.includes(f.date))
    .slice()
    .reverse()
})

// ─── Gráfico semanal de calorias ──────────────────────────────────────────────
function renderWeekChart() {
  if (!weekChartCanvas.value) return

  const days    = getLast7Days()
  const labels  = days.map(d =>
    new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })
  )
  const calData = days.map(d => nutStore.caloriesForDate(d))
  const goalLine = Array(7).fill(nutStore.calGoal)

  if (weekChart) {
    // Atualiza os dados sem recriar o gráfico
    weekChart.data.labels = labels
    weekChart.data.datasets[0].data = calData
    weekChart.data.datasets[1].data = goalLine
    weekChart.update()
    return
  }

  weekChart = new Chart(weekChartCanvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Calorias',
          data: calData,
          // Cor condicional: vermelho se ultrapassou a meta, azul se não
          backgroundColor: calData.map(c => c > nutStore.calGoal ? '#F09595' : '#B5D4F4'),
          borderColor:     calData.map(c => c > nutStore.calGoal ? '#A32D2D' : '#185FA5'),
          borderWidth: 1,
          borderRadius: 4
        },
        {
          // Linha de meta sobreposta ao gráfico de barras
          type: 'line',
          label: 'Meta',
          data: goalLine,
          borderColor: '#BA7517',
          borderDash: [5, 4],   // linha tracejada
          borderWidth: 2,
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,.06)' },
          ticks: { font: { size: 11 } }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 10 } }
        }
      }
    }
  })
}

// ─── Helpers de formatação ────────────────────────────────────────────────────
function formatTime(isoStr) {
  if (!isoStr) return '--'
  return new Date(isoStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit'
  })
}

onMounted(() => { renderWeekChart() })
onUnmounted(() => { if (weekChart) weekChart.destroy() })
</script>

<style scoped>
.week-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  align-items: flex-end;
}

.week-col {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.week-day-label {
  font-size: 10px;
  color: var(--color-text-faint);
  margin-bottom: 4px;
  font-weight: 600;
}

.week-bar-wrap {
  height: 88px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
}

.week-bar {
  width: 70%;
  border-radius: 3px 3px 0 0;
  min-height: 2px;
  transition: height 0.4s ease;
}

.week-bar-val {
  font-size: 10px;
  color: var(--color-text-muted);
  margin-top: 4px;
}

.legend {
  display: flex;
  gap: 1rem;
  margin-top: 0.75rem;
  font-size: 12px;
  color: var(--color-text-muted);
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  display: inline-block;
}
</style>
