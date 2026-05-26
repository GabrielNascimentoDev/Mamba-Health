<template>
  <div>

    <!-- ─── SELEÇÃO DA JANELA DE JEJUM ─── -->
    <div class="card">
      <div class="card-title">janela de jejum</div>

      <!-- v-for renderiza um elemento para cada item do array -->
      <!-- :class vincula a classe dinamicamente -->
      <div class="window-grid">
        <button
          v-for="opt in windowOptions"
          :key="opt.label"
          class="window-btn"
          :class="{ active: jejumStore.fastWindow === opt.fast && !customMode }"
          @click="selectWindow(opt)"
        >
          {{ opt.label }}
        </button>
        <button
          class="window-btn"
          :class="{ active: customMode }"
          @click="customMode = true"
        >
          Custom
        </button>
      </div>

      <!-- v-if mostra ou esconde o elemento com base na condição -->
      <div v-if="customMode" class="custom-inputs">
        <div class="input-row">
          <div class="form-group">
            <label class="form-label">Horas em jejum</label>
            <!-- v-model faz two-way binding: input atualiza a variável e vice-versa -->
            <input type="number" v-model.number="customFast" min="1" max="23" @input="applyCustom" />
          </div>
          <div class="form-group">
            <label class="form-label">Janela alimentar</label>
            <input type="number" v-model.number="customEat" min="1" max="23" @input="applyCustom" />
          </div>
        </div>
      </div>
    </div>

    <!-- ─── TIMER DE JEJUM ─── -->
    <div class="card">
      <div class="card-title">ciclo atual</div>

      <div class="timer-display">{{ timerDisplay }}</div>

      <p class="timer-sub">{{ timerSubtitle }}</p>

      <!-- Barra de progresso do jejum -->
      <div class="progress-wrap">
        <div class="progress-labels">
          <span>Progresso do jejum</span>
          <!-- {{ }} é interpolação de texto — exibe o valor da variável -->
          <span>{{ Math.round(jejumStore.fastProgress) }}%</span>
        </div>
        <div class="progress-track">
          <!-- :style vincula estilos dinamicamente -->
          <div
            class="progress-fill"
            :class="progressClass"
            :style="{ width: jejumStore.fastProgress + '%' }"
          ></div>
        </div>
      </div>

      <div class="btn-group" style="margin-top: 1rem;">
        <!-- v-if / v-else renderiza condicionalmente -->
        <button v-if="!jejumStore.fastActive" class="btn primary" @click="jejumStore.startFast()">
          ▶ Iniciar Jejum
        </button>
        <button v-else class="btn danger" @click="handleEndFast">
          ■ Finalizar Jejum
        </button>
      </div>
    </div>

    <!-- ─── HISTÓRICO DO DIA ─── -->
    <div class="card">
      <div class="card-title">jejuns de hoje</div>

      <div class="history-list">
        <!-- v-if com v-else para estado vazio -->
        <div v-if="jejumStore.todayFasts.length === 0" class="empty-state">
          ⏳ Nenhum jejum registrado hoje
        </div>

        <!-- v-for para listar os jejuns — :key é obrigatório e deve ser único -->
        <div
          v-for="fast in [...jejumStore.todayFasts].reverse()"
          :key="fast.id"
          class="history-item"
        >
          <div>
            <div class="history-item-name">
              {{ fast.window }}h:{{ 24 - fast.window }}h — {{ fast.duration }}h concluídas
            </div>
            <div class="history-item-detail">
              {{ formatTime(fast.start) }} → {{ formatTime(fast.end) }}
            </div>
          </div>
          <div class="history-item-right">
            <span class="badge" :class="fast.duration >= fast.window ? 'green' : 'amber'">
              {{ fast.duration >= fast.window ? 'Completo' : 'Parcial' }}
            </span>
            <button class="btn-icon" @click="jejumStore.deleteFast(fast.id)" title="Remover">✕</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useJejumStore } from '../stores/jejum'

// Conecta este componente ao store de jejum
const jejumStore = useJejumStore()

// ─── Estado local do componente ──────────────────────────────────────────────
const customMode = ref(false)
const customFast = ref(14)
const customEat  = ref(10)

// Contador interno para o cronômetro (segundos decorridos)
const elapsedSeconds = ref(0)
let timerInterval = null

// Opções pré-definidas de janela de jejum
const windowOptions = [
  { label: '16:8', fast: 16, eat: 8 },
  { label: '18:6', fast: 18, eat: 6 },
  { label: '20:4', fast: 20, eat: 4 }
]

// ─── Computed ─────────────────────────────────────────────────────────────────

// Formata os segundos decorridos como HH:MM:SS
const timerDisplay = computed(() => {
  const total = elapsedSeconds.value
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

// Texto de status abaixo do timer
const timerSubtitle = computed(() => {
  if (!jejumStore.fastActive) return 'Selecione uma janela e inicie o jejum'
  const meta = jejumStore.fastWindow
  const feito = elapsedSeconds.value / 3600
  const restam = Math.max(0, meta - feito)
  if (restam <= 0) return '🎉 Meta atingida! Você completou o jejum.'
  const rh = Math.floor(restam)
  const rm = Math.floor((restam % 1) * 60)
  return `Meta: ${meta}h • Faltam ${rh}h ${rm}min`
})

// Classe CSS da barra de progresso
const progressClass = computed(() => {
  const p = jejumStore.fastProgress
  if (p >= 100) return 'ok'
  if (p >= 60)  return 'ok'
  return 'ok'
})

// ─── Métodos ──────────────────────────────────────────────────────────────────

function selectWindow(opt) {
  customMode.value = false
  jejumStore.setWindow(opt.fast, opt.eat)
}

function applyCustom() {
  jejumStore.setWindow(customFast.value, customEat.value)
}

function handleEndFast() {
  jejumStore.endFast()
  clearInterval(timerInterval)
  elapsedSeconds.value = 0
}

// Inicia o intervalo que atualiza o cronômetro a cada segundo
function startTicking() {
  clearInterval(timerInterval)
  // Calcula quantos segundos já passaram desde o início do jejum
  if (jejumStore.fastStart) {
    const ms = Date.now() - new Date(jejumStore.fastStart).getTime()
    elapsedSeconds.value = Math.floor(ms / 1000)
  }
  timerInterval = setInterval(() => {
    elapsedSeconds.value++
  }, 1000)
}

function formatTime(isoString) {
  if (!isoString) return '--'
  return new Date(isoString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

// ─── Ciclo de vida do componente ───────────────────────────────────────────────
// onMounted: executado quando o componente aparece na tela
onMounted(() => {
  if (jejumStore.fastActive) startTicking()

  // Observa mudanças no estado ativo do jejum para iniciar/parar o timer
  // Como não usamos watch() aqui, fazemos via polling leve
})

// Watch no fastActive para reagir a mudanças
import { watch } from 'vue'
watch(() => jejumStore.fastActive, (isActive) => {
  if (isActive) {
    startTicking()
  } else {
    clearInterval(timerInterval)
    elapsedSeconds.value = 0
  }
})

// onUnmounted: executado quando o componente sai da tela
// Limpa o intervalo para evitar vazamento de memória
onUnmounted(() => {
  clearInterval(timerInterval)
})
</script>

<style scoped>
/* scoped = estes estilos afetam APENAS este componente */

.window-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-bottom: 0.875rem;
}

.window-btn {
  padding: 8px;
  border: 0.5px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s;
  font-family: inherit;
}

.window-btn:hover { background: var(--color-blue-light); color: var(--color-blue); }

.window-btn.active {
  border-color: var(--color-blue);
  background: var(--color-blue-light);
  color: var(--color-blue);
}

.custom-inputs {
  margin-bottom: 0.75rem;
}

.input-row {
  display: flex;
  gap: 10px;
}

.input-row .form-group { flex: 1; }

/* Cronômetro gigante */
.timer-display {
  font-size: 52px;
  font-weight: 600;
  color: var(--color-text);
  text-align: center;
  letter-spacing: -2px;
  padding: 0.75rem 0;
  font-variant-numeric: tabular-nums;
  font-family: 'DM Mono', monospace;
}

.timer-sub {
  text-align: center;
  font-size: 13px;
  color: var(--color-text-muted);
  margin-bottom: 0.25rem;
}
</style>
