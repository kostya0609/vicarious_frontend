<template>
  <div>
<!--    <keep-alive>-->
      <component :is="component"/>
<!--    </keep-alive>-->
<!--    <List   v-if="component === 'list'"/>-->
<!--    <detail v-if="component === 'detail'"/>-->
  </div>
</template>
<script>

import List   from './list'
import Detail from './detail'

export default {
  name       : "documentPage",
  components : {List, Detail},
  computed   : {
   component : function(){
      return this.$store.getters.component;
   }
  },
}
</script>
