<template>
  <!-- Template é o HTML do componente -->
  <!-- O Vue substitui as diretivas (v-if, v-on, etc.) por comportamento real -->
  <div class="app-container">

    <!-- Cabeçalho fixo -->
    <header class="app-header">
      <div class="header-inner">
        <div class="brand">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          <span>Mamba Health</span>
        </div>
      </div>
    </header>

    <!-- Navegação entre módulos -->
    <!-- @click é a forma Vue de adicionar event listener de clique -->
    <nav class="main-nav">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="nav-tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <!-- v-html renderiza HTML dentro da string -->
        <span v-html="tab.icon"></span>
        {{ tab.label }}
      </button>
    </nav>

    <!-- Conteúdo principal -->
    <!-- <component :is="..."> renderiza o componente dinamicamente com base na aba ativa -->
    <main class="app-main">
      <Transition name="fade" mode="out-in">
        <component :is="currentComponent" :key="activeTab" />
      </Transition>
    </main>

  </div>
</template>

<script setup>
// <script setup> é a Composition API do Vue 3 — código mais limpo e moderno
// Tudo declarado aqui fica disponível no <template> acima automaticamente

import { ref, computed, onMounted } from 'vue'
import { useJejumStore } from './stores/jejum'
import { useNutricaoStore } from './stores/nutricao'
import JejumView from './views/JejumView.vue'
import NutricaoView from './views/NutricaoView.vue'
import DashboardView from './views/DashboardView.vue'

// Instâncias dos stores
const jejumStore = useJejumStore()
const nutricaoStore = useNutricaoStore()

// ref() cria uma variável reativa — quando muda, o template re-renderiza
const activeTab = ref('jejum')

// Definição das abas de navegação
const tabs = [
  {
    id: 'jejum',
    label: 'Jejum',
    icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
  },
  {
    id: 'nutricao',
    label: 'Nutrição',
    icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 2v10l4.24 4.24"/></svg>'
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>'
  }
]

// computed() calcula um valor com base em outros reativos
// Retorna o componente Vue correto com base na aba ativa
const currentComponent = computed(() => {
  const map = {
    jejum: JejumView,
    nutricao: NutricaoView,
    dashboard: DashboardView
  }
  return map[activeTab.value]
})

// onMounted() executa quando o componente é inserido no DOM (página carregada)
// Aqui carregamos os dados salvos do localStorage
onMounted(() => {
  jejumStore.load()
  nutricaoStore.load()
})
</script>

<style>
/* Estilos globais — aplicados em toda a aplicação */

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --color-bg: #f8f7f4;
  --color-surface: #ffffff;
  --color-border: rgba(0, 0, 0, 0.1);
  --color-border-strong: rgba(0, 0, 0, 0.2);
  --color-text: #1a1a18;
  --color-text-muted: #6b6b66;
  --color-text-faint: #9b9b96;
  --color-blue: #185FA5;
  --color-blue-light: #E6F1FB;
  --color-green: #3B6D11;
  --color-green-light: #EAF3DE;
  --color-amber: #854F0B;
  --color-amber-light: #FAEEDA;
  --color-red: #A32D2D;
  --color-red-light: #FCEBEB;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
}

body {
  font-family: 'DM Sans', system-ui, sans-serif;
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 15px;
  line-height: 1.6;
  min-height: 100vh;
}

/* ─── Layout principal ─────────────────────────────────────── */
.app-container {
  max-width: 680px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  position: sticky;
  top: 0;
  background: var(--color-surface);
  border-bottom: 0.5px solid var(--color-border);
  z-index: 10;
  padding: 0 1rem;
}

.header-inner {
  display: flex;
  align-items: center;
  height: 52px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-blue);
}

/* ─── Navegação ────────────────────────────────────────────── */
.main-nav {
  display: flex;
  gap: 4px;
  padding: 8px 1rem;
  background: var(--color-surface);
  border-bottom: 0.5px solid var(--color-border);
  position: sticky;
  top: 52px;
  z-index: 9;
}

.nav-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 10px;
  border: 0.5px solid transparent;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.nav-tab:hover {
  background: var(--color-bg);
}

/* :class="{ active: ... }" adiciona esta classe quando a condição é verdadeira */
.nav-tab.active {
  background: var(--color-blue-light);
  color: var(--color-blue);
  border-color: rgba(24, 95, 165, 0.2);
}

.app-main {
  flex: 1;
  padding: 1rem;
}

/* ─── Transição entre abas ─────────────────────────────────── */
/* <Transition name="fade"> usa estas classes automaticamente */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ─── Componentes reutilizáveis ────────────────────────────── */

/* Card — caixa com borda e fundo branco */
.card {
  background: var(--color-surface);
  border: 0.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.875rem;
}

/* Métricas numéricas */
.metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 8px;
  margin-bottom: 1rem;
}

.metric-card {
  background: var(--color-bg);
  border-radius: var(--radius-md);
  padding: 0.75rem;
}

.metric-label {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-bottom: 3px;
}

.metric-value {
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}

.metric-sub {
  font-size: 11px;
  color: var(--color-text-faint);
  margin-top: 1px;
}

/* Botões */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border: 0.5px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  white-space: nowrap;
}

.btn:hover { background: var(--color-bg); }
.btn:active { transform: scale(0.98); }

.btn.primary {
  background: var(--color-blue);
  color: var(--color-blue-light);
  border-color: #0C447C;
}
.btn.primary:hover { background: #0C447C; }

.btn.danger {
  background: var(--color-red);
  color: var(--color-red-light);
  border-color: #791F1F;
}
.btn.danger:hover { background: #791F1F; }

.btn.sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-group {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Formulários */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-muted);
}

input[type="text"],
input[type="number"] {
  padding: 8px 10px;
  border: 0.5px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 14px;
  font-family: inherit;
  width: 100%;
  transition: border-color 0.15s;
}

input:focus {
  outline: none;
  border-color: var(--color-blue);
}

/* Barra de progresso */
.progress-wrap { margin: 0.75rem 0; }

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--color-text-muted);
  margin-bottom: 5px;
}

.progress-track {
  height: 8px;
  background: var(--color-bg);
  border-radius: 4px;
  overflow: hidden;
  border: 0.5px solid var(--color-border);
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease, background-color 0.3s ease;
}

.progress-fill.ok    { background: var(--color-blue); }
.progress-fill.warn  { background: #BA7517; }
.progress-fill.over  { background: var(--color-red); }

/* Lista de histórico */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 280px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 11px;
  background: var(--color-bg);
  border-radius: var(--radius-md);
  border: 0.5px solid var(--color-border);
}

.history-item-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
}

.history-item-detail {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 1px;
}

.history-item-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Badges de status */
.badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
}

.badge.green  { background: var(--color-green-light); color: var(--color-green); }
.badge.amber  { background: var(--color-amber-light); color: var(--color-amber); }
.badge.red    { background: var(--color-red-light);   color: var(--color-red); }
.badge.blue   { background: var(--color-blue-light);  color: var(--color-blue); }

/* Botão de deletar */
.btn-icon {
  background: none;
  border: none;
  color: var(--color-text-faint);
  cursor: pointer;
  padding: 3px 6px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  transition: all 0.15s;
}
.btn-icon:hover { color: var(--color-red); background: var(--color-red-light); }

/* Estado vazio */
.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--color-text-faint);
  font-size: 13px;
}

/* Separador */
.divider {
  border: none;
  border-top: 0.5px solid var(--color-border);
  margin: 0.875rem 0;
}

/* Responsividade mobile */
@media (max-width: 480px) {
  .app-main { padding: 0.75rem; }
  .metric-value { font-size: 18px; }
}
</style>
