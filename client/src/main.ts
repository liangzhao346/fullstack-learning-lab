/** 浏览器入口。从 index.html 的 #app 挂载 Vue，并加载各页面共用的样式。 */
import { createApp } from 'vue';
import App from './App.vue';
import './style.css';

createApp(App).mount('#app');
