<template>
  <component :is="component"/>
</template>

<script>
import Add           from './add'
import List          from './list'
import Edit           from './edit'

export default {
  name        : "pageExchange",
  components  : {Add, List,Edit},
  computed    : {
    component : function(){
      return this.$store.getters.component;
    }
  },
}
</script>


