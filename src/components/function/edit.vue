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
      <h3>Редактирование функции</h3>
      <el-row :gutter="24" class="mb15">
        <el-col :span="8">
          <label>Название</label>
          <el-input type="text" v-model="formData.name" :class="errors.name ? 'invalid' : ''"/>
          <small v-if="errors.name">{{ errors.name}}</small>
        </el-col>
        <el-col :span="8">
          <label>Тип функции</label>
          <el-select
              v-model="formData.function"
              placeholder="Тип функции">
            <el-option
                v-for="item in function_type"
                :key="item.key"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
        </el-col>
      </el-row>
      <el-row :gutter="24" class="mb15">
        <el-col :span="8">
          <label>Позиция в сортировке</label>
          <el-input placeholder="Введите число" type="number" min="1" v-model.number="formData.sort"></el-input>
        </el-col>
        <el-col :span="8">
          <label>Активность</label>
          <el-checkbox-group v-model="formData.active"  fill="#909399" text-color="white">
            <el-checkbox-button :label="formData.active ? 'Вкл' : 'Откл'" v-model="formData.active"></el-checkbox-button>
          </el-checkbox-group>
        </el-col>
      </el-row>
      <el-row :gutter="24" class="mb15">
        <el-col :span="8">
          <label>Текст в документе</label>
          <el-input type="textarea" rows="10" v-model="formData.text" :class="errors.text ? 'invalid' : ''"></el-input>
          <small v-if="errors.text">{{ errors.text}}</small>
        </el-col>
        <el-col :span="8">
          <label>Примечание</label>
          <el-input type="textarea" rows="10" v-model="formData.note" ></el-input>
        </el-col>
      </el-row>
      <el-row :gutter="24" class="mb15">
        <el-col :span="8">
          <br/>
        </el-col>
        <el-col :span="8">
          <el-button @click="setFormData" size="medium" icon="el-icon-upload" :class="'fluid-button'" type="primary">Сохранить функцию</el-button>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>
<script>
export default {
  name : 'functionEdit',
  data : function (){
    return {
      formData   : {
        name     : '',
        text     : '',
        note     : '',
        function : '',
        active   : false,
        sort     : '',
      },
      errors     : {
        name     : null,
        text     : null,
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
    function_type : function(){
      return this.$store.getters.function_type;
    },
    id(){
      return this.$store.getters.componentParams.id[0].value
    },
  },
  methods : {
    isValid(formData){
      for (let key in this.errors) this.errors[key] = null;
      let isValid = true;
      if (!formData.name) {isValid = false; this.errors.name = 'Необходимо ввести название функционала!'};
      if (!formData.text) {isValid = false; this.errors.text = 'Необходимо выбрать тип функционала!'};
      return isValid
    },
    async setFormData() {
      if (this.isValid(this.formData)) {
        this.loading = true;
        this.formData.event = 'set';
        let result = await this.$store.dispatch('query',{url : '/api/vicarious/function/edit',data : this.formData});
        if(result.status == 'success')
          this.$store.commit('setMessage',{text : result.message,header : 'Успешно!', type: 'success'});
        else
          this.$store.commit('setMessage',{text : result.message,header : 'Возникла проблема!',type: 'error' });
        this.loading = false;
      }
    }
  },
  created : async function(){
    this.loading = true;
    let result = await this.$store.dispatch('query',{url : '/api/vicarious/function/edit',data : {id : this.id, event : 'get'}});
    if(result.status == 'success'){
      this.formData.id       = result.data.id;
      this.formData.name     = result.data.name;
      this.formData.sort     = result.data.sort;
      this.formData.text     = result.data.text;
      this.formData.note     = result.data.note;
      this.formData.function = result.data.function;
      this.formData.active   = result.data.active;
    }else
      this.$store.commit('setMessage',{text : result.message,header : 'Возникла проблема!',type: 'error'});
    this.loading = false;
  },
  watch: {
    'formData.name' : function(){
      this.errors.name = null;
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

