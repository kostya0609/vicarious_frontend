<template>
  <div class="body-wrapper">
    <el-button
        class="body-button body-button-color"
        size="medium"
        type="info"
        icon="el-icon-back"
        @click.prevent="$store.commit('setComponent','list')">
      Вернуться к списку
    </el-button>
    <el-tabs type="border-card" class="component-wrapper" v-model="page" @tab-click="setActiveMenu">
      <el-tab-pane v-for="(item, key) in menu" :label="item" :name="key" :key="key">
      </el-tab-pane>
      <Show     v-if="page === 'show'" />
      <Business v-if="page === 'business'"  @toShowPage="page='show'"/>
      <Comments v-if="page === 'comments'"  @toShowPage="page='show'"/>
      <History  v-if="page === 'history'"   @toShowPage="page='show'"/>
    </el-tabs>
    <div class="component-wrapper">
      <br>
      <el-link href="https://bitrix.bsi.local/knowledge/instrukcii/korportal/doverrennosti/" target="_blank"  type="danger" icon="el-icon-reading">Ознакомиться с инструкцией</el-link>
    </div>
  </div>
</template>
<script>

import Show     from './detail/show'
import Business from './detail/business'
import Comments from './detail/comments'
import History  from './detail/history'

export default {
  name        : "requestDetail",
  components  : {Show, Business, Comments, History},
  data(){
    return {
      menu        : {
        show      : 'Информация о заявке',
        business  : 'Действия с заявкой',
        comments  : 'История согласования',
        history   : 'История изменений'
      },
      page        : 'show',
    }
  },
  methods : {
    setActiveMenu(key) {
      if(key == null) return false;
      this.page = key.name;
    },
  },
}
</script>
<style>

</style>
