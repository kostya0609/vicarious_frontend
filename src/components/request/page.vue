<template>
  <div>
<!--    <keep-alive >-->
      <component :is="component"/>
<!--    </keep-alive>-->

<!--    <Add          v-if="component === 'add'"/>-->
<!--    <AddByExist   v-if="component === 'addByExist'"/>-->
<!--    <List         v-if="component === 'list'"/>-->
<!--    <Edit         v-if="component === 'edit'"/>-->
<!--    <Detail       v-if="component === 'detail'"/>-->
  </div>
</template>

<script>
import Add           from './add'
import AddByExist    from './addByExist'
import List          from './list'
import Edit          from './edit'
import Detail        from './detail'

export default {
  name        : "pageRequest",
  components  : {Add, AddByExist, List, Edit, Detail},
  computed    : {
    component : function(){
      return this.$store.getters.component;
    }
  },
}
</script>


