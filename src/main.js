// main.js — Ponto de entrada da aplicação Vue
// Aqui inicializamos o Vue, o Pinia (gerenciador de estado) e montamos o app no HTML

import { createApp } from 'vue'          // Função principal do Vue 3
import { createPinia } from 'pinia'       // Gerenciador de estado global
import App from './App.vue'              // Componente raiz da aplicação

const app = createApp(App)   // Cria a instância do app Vue com o componente raiz
const pinia = createPinia()  // Cria a instância do Pinia

app.use(pinia)  // Registra o Pinia no app para que todos os componentes possam usá-lo
app.mount('#app')  // "Liga" o Vue ao elemento <div id="app"> do index.html
