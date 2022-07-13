<template>
  <div  v-loading="loading">
    <el-table
        :data="showTable"
        style="width: 100%">
      <el-table-column
          align="left"
          prop="label"
          label="Согласующие заявку">
      </el-table-column>
      <el-table-column
          align="left"
          prop="solution"
          label="Решение по заявке">
      </el-table-column>
    </el-table>
    <div class="component-wrapper" v-if="currentApproverId === user_id">
      <label>Комментарий</label>
      <el-input
          type="textarea"
          rows="4"
          v-model="comment"
          :class="errors.comment ? 'invalid' : ''"
          >
      </el-input>
      <small v-if="errors.comment">{{ errors.comment}}</small>
      <div style="margin-top: 15px" align="right">
        <el-button
            class="body-button"
            icon="el-icon-check"
            type="success"
            @click="requestDecision(true)">
          Утвердить
        </el-button>
        <el-button
            class="body-button"
            icon="el-icon-close"
            type="danger"
            @click="requestDecision(false)">
          Отклонить
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "requestDetailBusinessApprovePending",
  data(){
    return {
      currentApproverId     : null,
      currentApproverKey    : null,
      comment               : '',
      showTable             : [],

      errors                : {
        comment             : null,
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
      return this.$store.getters.requestId
    },
    user_id() {
      return this.$store.getters.userId
    },

  },
  methods : {
    async getData(){
      this.loading = true;
      let result = await this.$store.dispatch('query',{
        url                  : '/api/vicarious/request/coordination-list',
        data                 : {
        request_id           : this.requestId,
        }
      });
      if(result.status == 'success') {
        if(result.data instanceof Array){
          let solution = null, firstNull = true;
          result.data.forEach(el => {
            if (el.solution === 1) solution='Согласовано';
            if (el.solution === 0) {
              solution = 'Отказ согласования';
              firstNull = false;// если был отказ то кнопки согласования никогда не покажутся
            }
            if (el.solution === null) solution='В очереди';
            if (el.solution === null && firstNull){
              this.currentApproverId = el.value;
              this.currentApproverKey = el.key;
              solution = 'На согласовании';
              firstNull = false;
            }
            this.showTable.push(
                {
                  label       : el.label ,//+' ( id -'+el.value+')',
                  solution    : solution,
                })
          })
        } else {
           result.request_status === 'agree'    ? this.$store.commit('setRequestState', {status: result.request_status, value: 'Согласована'}) : '';
           result.request_status === 'rejected' ? this.$store.commit('setRequestState', {status: result.request_status, value: 'Заявка отклонена'}) : '';
        }
      }else
         this.$store.commit('setMessage',{text : result.message,type : 'error'});
      this.loading = false;
    },
    async requestDecision(decision){
      if (!decision && !this.comment){
        this.errors.comment = 'Необходимо указать причину!';
        return;
      } else {
          this.loading = true;
          let result = await this.$store.dispatch('query',{
            url    :  '/api/vicarious/request/coordination-solution',
            data   :   {
              request_id       : this.requestId,
              user_id          : this.user_id,
              id               : this.currentApproverKey,
              solution         : decision,
              reason           : this.comment,
            }
          });
          if(result.status == 'success') {
            this.$store.commit('setMessage', {text: result.message,type : 'success'});
          } else
              this.$store.commit('setMessage',{text : result.message,type : 'error'});
          this.loading = false;
          this.showTable = [];
          this.getData();
        }
    },
  },
  created() {
    this.getData();
  },
  watch :{
    'comment' : function(){
      this.errors.comment = null;
    },
  },
}
</script>
<style scoped>
.body-button{
  width: 15%;
}
.el-col small {
  color: #ff2400;
}
.invalid {
  border:solid 1px;
  border-color: #ff7f50;
}
</style>

