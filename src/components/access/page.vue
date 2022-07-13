<template>
  <div>
<!--    <keep-alive>-->
      <component :is="component"/>
<!--    </keep-alive>-->
<!--    <Add  v-if="component === 'add'"/>-->
<!--    <List v-if="component === 'list'"/>-->
  </div>
</template>

<script>
import Add from './add'
import List from './list'
export default {
  name        : "accessPage",
  components  : {List, Add},
  computed    : {
    component : function(){
      return this.$store.getters.component;
    }
  }
}
</script>