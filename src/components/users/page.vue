<template>
  <div>
<!--    <keep-alive>-->
      <component :is="component"/>
<!--    </keep-alive>-->
<!--    <Add      v-if="component === 'add'"/>-->
<!--    <List     v-if="component === 'list'"/>-->
<!--    <Connect  v-if="component === 'connect'"/>-->
  </div>
</template>

<script>
import List from './list'
import Add from './add'
import Connect from './connect'

export default {
  name        : "usersPage",
  components  : {List, Add, Connect},
  computed    : {
    component : function(){
      return this.$store.getters.component;
    }
  },

}
</script>