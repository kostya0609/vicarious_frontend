<template>
<div class="body-wrapper" v-loading="loading">
  <el-card class="component-wrapper">
    <template #header>
      <div class="card-header">
        <h3>Варианты выгрузки данных</h3>
      </div>
    </template>
    <el-table
        :data="show">
      <el-table-column
          prop="id"
          label="ID"
          width="100"
      >
      </el-table-column>
      <el-table-column
          prop="name"
          label="Название"
          width="250"
      >
      </el-table-column>
      <el-table-column
          prop="description"
          label="Описание"
          width="350"
      >
      </el-table-column>
      <el-table-column
          label="Функционал"
      >
        <template slot-scope="props">
          <p  v-for="item in props.row.functions">
            {{item.name}}
          </p>
        </template>
      </el-table-column>

      <el-table-column align="right">
        <template #default="scope">
          <el-button
            size="mini"
            type="info"
            icon="el-icon-edit"
            @click="editExchange(scope.row.id)"
          />
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="removeExchange(scope.$index)"
          />
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</div>
</template>

<script>
export default {
  name: "exchangeList",
  data(){
    return {
      show : [],
      functions : [],
    }
  },
  computed : {
    loading : {
      get : function(){
        return this.$store.getters.loading;
      },
      set : function(value){
        this.$store.commit('setLoading',value)
      }
    },
  },
  methods : {
    async getData(){
      this.loading = true;

      let result = await this.$store.dispatch('query',{url : '/api/vicarious/exchange/list',data : {}});
      if(result.status == 'success'){
        this.show = result.data;
      } else
           this.$store.commit('setMessage',{text : 'Некорректный ответ сервера',header : 'Возникла проблема!',type: 'error'});

      this.loading = false;
    },

    removeExchange(index){
      this.$confirm(`Вы уверены, что хотите удалить  - ${this.show[index].name} ?`).then(async () => {
        this.loading = true;
        let result = await this.$store.dispatch('query',{ url : '/api/vicarious/exchange/delete', data :  { id : this.show[index].id } });
        if (result.status == 'success') {
          this.$store.commit('setMessage', {text: result.message, type : 'success'});
          this.show.splice(index,1);
          this.getData();
          this.loading = false;
        } else
             this.$store.commit('setMessage',{text : 'Некорректный ответ сервера',header : 'Возникла проблема!',type: 'error'});
      }).catch(()=>{});
    },

    editExchange(id){
      this.$confirm(`Вы уверены, что хотите редактировать выгрузку с ID ${id}?`).then(async () => {
        this.$store.commit('setExchangeId', id)
        this.$store.commit('setComponent', 'edit');
      }).catch(()=>{});
    },

  },
  created() {
    this.getData();
  }
}
</script>

<style scoped>

</style>