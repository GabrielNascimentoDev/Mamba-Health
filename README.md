<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0d1117,50:1a2744,100:0d2137&height=180&section=header&text=🐍%20Mamba%20Health&fontSize=50&fontColor=00d4aa&fontAlignY=38&desc=Controle%20de%20Jejum%20e%20Nutrição%20com%20Vue.js%203&descAlignY=58&descSize=18&animation=fadeIn"/>

[![Vue.js](https://img.shields.io/badge/Vue.js%203-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white)](#)
[![Pinia](https://img.shields.io/badge/Pinia-FFD859?style=flat-square&logo=vue.js&logoColor=black)](#)
[![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chartdotjs&logoColor=white)](#)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](#)

</div>

---

## 💡 A ideia por trás do projeto

Quem já tentou fazer jejum intermitente ou controlar calorias sabe: a maioria dos apps é complicada, cheia de anúncios, ou exige cadastro para fazer o básico. Você quer só saber **"quantas horas já passei sem comer?"** e o app te manda para uma paywall.

O **Mamba Health** nasceu disso — um tracker limpo, direto e que funciona no navegador, sem conta, sem anúncio, sem enrolação.

> *"Se Kobe Bryant acordava às 4h pra treinar com disciplina total, eu posso pelo menos controlar o que como."* — Inspiração no nome 🐍

---

## 🎯 Qual dor ele resolve?

| Problema | Como o Mamba Health resolve |
|---|---|
| Apps de saúde são complexos demais | Interface limpa com 3 abas apenas |
| Exigem cadastro para usar | Funciona 100% no navegador, sem login |
| Dados somem ao fechar o app | Persistência com `localStorage` |
| Difícil visualizar progresso | Dashboard semanal com gráficos |
| Sem flexibilidade no jejum | Janelas pré-definidas + modo personalizado |

---

## ✨ Funcionalidades

### 🕐 Módulo de Jejum
- Iniciar e encerrar ciclos de jejum em tempo real
- Janelas pré-definidas: **16:8**, **18:6**, **20:4**
- Janela **personalizada** (você escolhe as horas)
- Cronômetro ao vivo com **barra de progresso**
- Badges visuais: **"Completo" ✅** ou **"Parcial" ⚠️**
- Histórico dos jejuns do dia

### 🥗 Módulo de Nutrição
- Meta diária de calorias **configurável**
- Registro de refeições com nome e calorias
- Barra de progresso calórico com alerta visual (azul → laranja → vermelho)
- Gráfico de barras das refeições do dia
- Histórico detalhado das refeições

### 📊 Dashboard Semanal
- Métricas consolidadas dos últimos **7 dias**
- Calendário visual de horas de jejum por dia
- Gráfico misto: **barras de calorias + linha de meta**
- Lista dos jejuns da semana com duração

---

## 🧠 O que aprendi construindo isso

Este projeto foi meu laboratório de Vue.js 3 moderno. Precisei dominar:

- **Composition API com `<script setup>`** — `ref()`, `computed()`, `watch()`, `onMounted()`
- **Pinia** — gerenciamento de estado global como alternativa moderna ao Vuex
- **Persistência com `localStorage`** — dados que sobrevivem ao fechar o navegador
- **Chart.js integrado ao Vue** — renderizar gráficos reativos que se atualizam com os dados
- **Componentização** — dividir a UI em `views/` e usar `<component :is="...">` para navegação dinâmica
- **Diretivas Vue** — `v-for`, `v-if`, `v-model`, `:class`, `@click`

---

## 🛠️ Tecnologias utilizadas

| Tecnologia | Papel no projeto |
|---|---|
| **Vue.js 3** | Framework reativo — Composition API |
| **Pinia** | Gerenciamento de estado global |
| **Chart.js** | Gráficos interativos de barra e linha |
| **Vite** | Bundler — build e servidor de dev rápido |
| **localStorage** | Persistência de dados sem backend |

---

## 🗂️ Estrutura do projeto

```
mamba-health/
├── index.html                  → Base HTML (apenas <div id="app">)
├── vite.config.js              → Configuração do Vite
└── src/
    ├── main.js                 → Inicializa Vue + Pinia
    ├── App.vue                 → Layout raiz + navegação entre abas
    ├── stores/
    │   ├── jejum.js            → Estado global do módulo de jejum
    │   └── nutricao.js         → Estado global do módulo de nutrição
    └── views/
        ├── JejumView.vue       → Tela de controle de jejum
        ├── NutricaoView.vue    → Tela de nutrição e refeições
        └── DashboardView.vue   → Dashboard semanal com gráficos
```

---

## 🚀 Como rodar localmente

```bash
# Clone o repositório
git clone https://github.com/GabrielNascimentoDev/Mamba-Health.git
cd Mamba-Health

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev

# Acesse em: http://localhost:5173
```

---

## 🔮 Próximos passos

- [ ] Modo escuro / claro
- [ ] Notificação quando o jejum terminar
- [ ] Exportar histórico em PDF
- [ ] PWA — instalar como app no celular
- [ ] Gráfico de peso ao longo do tempo

---

<div align="center">

**Desenvolvido por [Gabriel Henrique](https://github.com/GabrielNascimentoDev)** 🐍

*"Disciplina é a ponte entre metas e realizações."*

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0d2137,50:1a2744,100:0d1117&height=100&section=footer"/>

</div>
