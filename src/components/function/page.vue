<template>
  <div>
<!--    <keep-alive>-->
      <component :is="component"/>
<!--    </keep-alive>-->
<!--    <Add  v-if="component === 'add'"/>-->
<!--    <List v-if="component === 'list'"/>-->
<!--    <Edit v-if="component === 'edit'"/>-->
  </div>
</template>
<script>
import List from './list'
import Add from './add'
import Edit from './edit'
export default {
  name       : "functionPage",
  components : {List,Add,Edit},
  computed   : {
   component : function(){
      return this.$store.getters.component;
   }
  },
}
</script>
