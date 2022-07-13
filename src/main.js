import Vue from 'vue';
import App from './App.vue';
import store from './store';
import VGD from 'volumetric-datagrid'

Vue.use(VGD);

Vue.config.productionTip = true;

//console.log(process.env.NODE_ENV);

//window._userId = 13048;
//window._token  = '$2y$10$OOyb6fCHwqiaXWRIwKxf1.MA7b7lizXFu8J.0M6XhdJqLM6G.3ipO';

//window._userId = 14317;
//window._token  = '$2y$10$NMJZxfAaRIJpLeroZdnB5OQrFlm/o.2Hyx.mZWtADsWN9eyLanpOy';

Vue.prototype.$eventBus = new Vue();

Vue.directive('eventBus',{
 bind(el,binding){
    Vue.prototype.$eventBus.$on(binding.arg, binding.value)
 },
 unbind(){
     Vue.prototype.$eventBus.$off()
 },
});

new Vue({
  store,
  render(h){ return h(App) },
}).$mount('#app')



