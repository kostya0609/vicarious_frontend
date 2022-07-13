<template>
  <div class="body-wrapper" v-loading="loading">
    <h2> Заявка № {{requestId}}</h2>
    <h3>Статус заявки - {{requestStatus.value}} {{signature ? ', на подписании' : ''}} </h3>
    <hr/>
      <el-table
          :data="showTable"
          style="width: 100%">
        <el-table-column
            align="left"
            prop="date_update"
            label="Дата изменения">
        </el-table-column>
        <el-table-column
            align="left"
            prop="who_change"
            label="Исполнитель">
        </el-table-column>
        <el-table-column
            align="left"
            prop="modification"
            label="Изменение">
        </el-table-column>
        <el-table-column
            align="left"
            prop="previous_value"
            label="Предыдущее значение">
        </el-table-column>
        <el-table-column
            align="left"
            prop="new_value"
            label="Новое значение">
        </el-table-column>
      </el-table>
    <div class="body-button-container">
      <el-button
          class="body-button body-button-color"
          size="medium"
          icon="el-icon-back"
          type="info"
          @click="backToShow">
        Вернуться к информации о заявке
      </el-button>
    </div>
  </div>
</template>
<script>

export default {
  name : "requestDetailHistory",
  emits   : ["backToShow"],
  data(){
    return {
      showTable : [],
      map       : {
        function        : 'Функционал',
        company         : 'Организация',
        comment         : 'Комментарий',
        status          : 'Статус',
        document_status : 'Статус документа',
        document_type   : 'Тип документа',
        type            : 'Тип заявки',
        document_name   : 'Имя документа',
        document_start  : 'Дата начала действия документа',
        document_final  : 'Дата окончания действия документа',
        'gen-document'  : 'Создан документ',
        ''              : '-'
      },
    }
  },
  computed :{
    loading : {
      get : function(){
        return this.$store.getters.loading;
      },
      set : function(value){
        this.$store.commit('setLoading',value)
      }
    },
    requestId() {
      return this.$store.getters.requestId;
    },
    requestStatus(){
      return this.$store.getters.requestState
    },
    signature(){
      return this.$store.getters.signature;
    },

  },
  methods : {
    backToShow(){
      this.$emit("toShowPage")
    },
    async getData(){
      this.loading = true;
      this.$store.getters.queryType.forEach(el => {this.map[el.value] = el.label});
      this.$store.getters.queryTypeDocument.forEach(el => {this.map[el.value] = el.label});
      this.$store.getters.queryStatusDocument.forEach(el => {this.map[el.value] = el.label});
      this.$store.getters.statusList.forEach(el => {this.map[el.value] = el.label});
      this.showTable = [];
      let result = await this.$store.dispatch('query',{
        url    :  '/api/vicarious/request/history',
        data   :   {
          id  : this.requestId,
        }
      });
      if(result.status == 'success') {
        if(result.data instanceof Array){
          let obj = {}
          result.data.forEach( el => {
            obj = {
              date_update     : el.date_update,
              modification    : this.map[el.modification],
              who_change      : el.who_change,
              new_value       : this.map[el.new_value] ? this.map[el.new_value] : el.new_value ,
              previous_value  : this.map[el.previous_value] ? this.map[el.previous_value] : el.previous_value ,
            }
            this.showTable.push(obj)
          })
        }
      } else
        this.$store.commit('setMessage',{text : result.message,type : 'error'});
      this.loading = false;
    },
  },
  created() {
    this.getData()
  }
}
</script>
<style>
</style>
