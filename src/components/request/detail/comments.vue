<template>

  <div class="body-wrapper" v-loading="loading">

    <h2> Заявка № {{requestId}}</h2>
    <h3>Статус заявки - {{requestStatus.value}} {{signature ? ', на подписании' : ''}}</h3>
    <hr/>
    <el-table
        :data="showTable"
        style="width: 100%">
      <el-table-column
          align="left"
          prop="label"
          label="Решение принял">
      </el-table-column>
      <el-table-column
          align="left"
          prop="solution"
          label="Состояние">
      </el-table-column>
      <el-table-column
          align="left"
          prop="comment"
          label="Комментарий">
      </el-table-column>
      <el-table-column
          align="left"
          prop="date"
          label="Дата">
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
  name    : "requestDetailComments",
  emits   : ["backToShow"],
  data(){
    return {
      showTable : [],
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
      return this.$store.getters.requestState;
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
      let result = await this.$store.dispatch('query',{
        url    :  '/api/vicarious/request/solution-list',
        data   :   {
          request_id  : this.requestId,
        }
      });
      if(result.status == 'success') {
        if(result.data instanceof Array){
          let solution = null, firstNull = true;
          result.data.forEach(el => {
            if (el.solution === 1) solution = 'Согласовано';
            if (el.solution === 0) {
              solution  = 'Заявка отклонена';
              firstNull = false;
            }
            if (el.solution === null) solution = '-';
            if (el.solution === null && firstNull){
              solution  = 'На согласовании';
              firstNull = false;
            }
            this.showTable.push(
                {
                  'label'       : el.label,
                  'solution'    : solution,
                  'comment'     : el.comment,
                  'date'        : el.date,
                })
          })
          if (result.data.length <= 0){
            this.showTable.push(
                {
                  'label'       : 'Процесс согласования не запускался',
                  'solution'    : '-',
                  'comment'     : '-',
                  'date'        : '-',
            })
          } // если не было процесса согласования
        }// если data это массив
      }else
        this.$store.commit('setMessage',{text : result.message,type : 'error'});
      this.loading = false;
    },
  },
  created() {
    this.getData();
  }
}
</script>
<style>
</style>
