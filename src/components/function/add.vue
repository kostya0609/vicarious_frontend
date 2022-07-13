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
    <el-card class="component-wrapper">
      <h3>Создание новой функции</h3>
      <el-row :gutter="24" class="mb15">
        <el-col :span="8">
          <label>Название</label>
          <el-input
              type="text"
              v-model="formData.name"
              :class="errors.name ? 'invalid' : ''"
              placeholder="Укажите название"
          />
          <small v-if="errors.name">{{ errors.name}}</small>
        </el-col>
        <el-col :span="8">
          <label>Тип функционала</label>
          <el-select
              v-model="formData.function"
              placeholder="Тип функционала"
              :class="errors.function ? 'invalid' : ''">
            <el-option
                v-for="item in function_type"
                :key="item.key"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
          <small v-if="errors.function">{{ errors.function}}</small>
        </el-col>
      </el-row>
      <el-row :gutter="24" class="mb15">
        <el-col :span="8">
          <label>Текст в документе</label>
          <el-input
              type="textarea"
              rows="4"
              v-model="formData.text"
              :class="errors.text ? 'invalid' : ''"
              placeholder="Укажите текст">
          </el-input>
          <small v-if="errors.text">{{ errors.text}}</small>
        </el-col>
        <el-col :span="8">
          <label>Примечание</label>
          <el-input
              type="textarea"
              rows="4"
              v-model="formData.note"
              placeholder="Укажите примечание"
          ></el-input>
        </el-col>

      </el-row>
      <el-row :gutter="24" class="mb15">
        <el-col :span="8">
          <br/>
        </el-col>
        <el-col :span="8">
          <el-button @click="setFormData" size="medium" icon="el-icon-upload" :class="'fluid-button'" type="primary">Добавить функцию</el-button>
        </el-col>
      </el-row>
    </el-card>

  </div>
</template>
<script>
export default {
  name : 'functionAdd',
  data : function (){
    return {
      formData   : {
        name     : '',
        text     : '',
        note     : '',
        function : ''
      },
      errors      : {
        name      : null,
        text      : null,
        function  : null,
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
    function_type(){
      return this.$store.getters.function_type;
    },
  },
  methods : {
    isValid(formData){
      for (let key in this.errors) this.errors[key] = null;
      let isValid = true;
      if (!formData.name)     {isValid = false; this.errors.name     = 'Необходимо ввести название функционала!'};
      if (!formData.text)     {isValid = false; this.errors.text     = 'Необходимо выбрать тип функционала!'};
      if (!formData.function) {isValid = false; this.errors.function = 'Необходимо текс в документе!'};
      return isValid
    },
    async setFormData() {
      if (this.isValid(this.formData)) {
        this.loading = true;
        let result = await this.$store.dispatch('query',{url : '/api/vicarious/function/add',data : this.formData});
        if(result.status == 'success'){
          this.formData = {
            name     : '',
            text     : '',
            note     : '',
            function : ''
          }
          this.$store.commit('setMessage', {text: result.message, header: 'Успешно!', type: 'success'});
        }else
          this.$store.commit('setMessage',{text : result.message,header : 'Возникла проблема!',type: 'error'});
        this.loading = false;
      }
    }
  },
  watch: {
    'formData.name' : function(){
      this.errors.name = null;
    },
    'formData.function' : function(){
      this.errors.function = null;
    },
    'formData.text' : function(){
      this.errors.text = null;
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

