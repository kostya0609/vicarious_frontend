<template>
  <div class="body-wrapper" v-loading="loading">
    <el-button
        class="body-button body-button-color"
        size="medium"
        type="info"
        icon="el-icon-back"
        @click.prevent="$store.commit('setComponent','list')">
      Вернуться к списку
    </el-button>
    <el-card class="component-wrapper" >
      <h3>Создание новой группы пользователей</h3>
      <el-row :gutter="20" class="mb15">
        <el-col :span="8">
          <label>Название</label>
          <el-input
              type="text"
              v-model="formData.name"
              :class="errors.name ? 'invalid' : ''"
              placeholder="Укажите название"/>
          <small v-if="errors.name">{{ errors.name}}</small>
        </el-col>
        <el-col :span="8">
          <label>Примечание</label>
          <el-input
              type="textarea"
              rows="4"
              v-model="formData.note"
              placeholder="Укажите примечание"
              >
          </el-input>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb15">
        <el-col :span="8">
          <br/>
        </el-col>
        <el-col :span="8">
          <el-button @click="setFormData" size="medium" icon="el-icon-upload" :class="'fluid-button'" type="primary">Добавить роль</el-button>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>
<script>
export default {
  name : 'usersAdd',
  data : function (){
    return {
      formData : {
        name : '',
        note : '',
      },
      errors : {
        name:null,
      },
    };
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
    isValid(formData){
      for (let key in this.errors) this.errors[key] = null;
      let isValid = true;
      if (!formData.name) {isValid = false; this.errors.name = 'Необходимо ввести название роли!'};
      return isValid
    },
    async setFormData() {
      if (this.isValid(this.formData)) {
        this.loading = true;
        let result = await this.$store.dispatch('query',{url : '/api/vicarious/role/add',data : this.formData});
        if(result.status == 'success') {
          this.formData = {
            name : '',
            note : '',
          }
          this.$store.commit('setMessage', {text: result.message, type : 'success'});
        }else
          this.$store.commit('setMessage', {text : result.message,type : 'error'});
        this.loading = false;
      }
    },
  },
  watch : {
    'formData.name' : function(){
      this.errors.name = null;
    },
  },
}
</script>

<style scoped>
.el-col small {
  color: #ff2400;
}

.el-col .invalid {
  border:solid 1px;
  border-color: #ff7f50;
}
</style>

