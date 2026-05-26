# 🐍 Mamba Health Tracker

Aplicativo de controle de saúde com Jejum Intermitente e Monitoramento Calórico.
Desenvolvido com **Vue.js 3**, **Pinia** e **Chart.js**.

---

## ▶️ Como rodar o projeto

```bash
# 1. Instale as dependências (só na primeira vez)
npm install

# 2. Inicie o servidor de desenvolvimento
npm run dev

# 3. Abra no navegador: http://localhost:5173
```

---

## 📁 Estrutura de arquivos

```
mamba-health-tracker/
├── index.html              → Página HTML base (apenas uma div #app)
├── vite.config.js          → Configuração do Vite (bundler)
├── package.json            → Dependências do projeto
└── src/
    ├── main.js             → Ponto de entrada: cria o app Vue e registra o Pinia
    ├── App.vue             → Componente raiz: layout, navegação entre abas
    ├── stores/
    │   ├── jejum.js        → Store Pinia do módulo de jejum
    │   └── nutricao.js     → Store Pinia do módulo de nutrição
    └── views/
        ├── JejumView.vue   → Tela de controle de jejum
        ├── NutricaoView.vue→ Tela de nutrição e refeições
        └── DashboardView.vue → Dashboard semanal com gráficos
```

---

## 🧠 Conceitos técnicos implementados

### 1. Vue.js 3 — Composition API (`<script setup>`)
O projeto usa a sintaxe moderna do Vue 3 com `<script setup>`, onde:
- `ref()` → cria variáveis reativas (a tela atualiza quando mudam)
- `computed()` → valores calculados automaticamente
- `watch()` → observa mudanças e executa ações
- `onMounted()` → executa ao carregar o componente
- `onUnmounted()` → executa ao desmontar (limpa timers, etc.)

### 2. Pinia — Gerenciamento de Estado Global
Cada store (`jejum.js`, `nutricao.js`) é como um "banco de dados reativo" acessível por qualquer componente. Substitui o Vuex (antigo padrão) e é a solução oficial do Vue 3.

### 3. Persistência com localStorage
```javascript
// Salvar
localStorage.setItem('chave', JSON.stringify(objeto))

// Carregar
JSON.parse(localStorage.getItem('chave'))
```
Os dados sobrevivem mesmo ao fechar o navegador.

### 4. Chart.js — Gráficos
- `NutricaoView.vue` → gráfico de barras das refeições do dia
- `DashboardView.vue` → gráfico de barras + linha de meta (misto)

### 5. Componentização
Cada tela é um componente `.vue` separado com template, lógica e estilo encapsulados. O `App.vue` usa `<component :is="...">` para renderizar dinamicamente a view correta.

### 6. Diretivas Vue
| Diretiva | O que faz |
|----------|-----------|
| `v-for` | Renderiza lista |
| `v-if / v-else` | Renderização condicional |
| `v-model` | Two-way binding em inputs |
| `:class` | Classe CSS dinâmica |
| `:style` | Estilo CSS dinâmico |
| `@click` | Event listener de clique |
| `@keyup.enter` | Tecla Enter |

---

## 📋 Requisitos atendidos

### Módulo de Jejum ✅
- [x] Iniciar e finalizar ciclo de jejum em tempo real
- [x] Janelas pré-definidas: 16:8, 18:6, 20:4
- [x] Janela personalizada (custom)
- [x] Cronômetro ao vivo com barra de progresso
- [x] Histórico dos jejuns do dia
- [x] Badges "Completo" / "Parcial"

### Módulo de Nutrição ✅
- [x] Meta diária de calorias configurável
- [x] Formulário para registrar refeições
- [x] Barra de progresso calórico (azul / laranja / vermelho)
- [x] Gráfico de barras das refeições (Chart.js)
- [x] Histórico detalhado das refeições do dia

### Dashboard Semanal ✅
- [x] Métricas dos últimos 7 dias
- [x] Calendário visual de horas de jejum
- [x] Gráfico misto: barras de calorias + linha de meta
- [x] Lista dos jejuns da semana

### Requisitos técnicos ✅
- [x] Vue.js 3 com Composition API
- [x] Pinia para gerenciamento de estado
- [x] localStorage para persistência
- [x] Chart.js para gráficos
- [x] Design responsivo
- [x] Componentização lógica
