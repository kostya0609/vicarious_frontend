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
      <h3>Создание привелегии</h3>
      <el-row :gutter="8" class="mb15">
        <el-col :span="8">
          <label>Выбрать тип привелегии</label>
          <el-select  v-model="typeSelected" placeholder="Выбрать тип привелегии">
            <el-option
                v-for="(item,i) in type"
                :key="i"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="8" v-if="typeSelected==='custom'">
          <label>Название</label>
          <el-input
              type="text"
              v-model="custom"
              @input="clearSelectSearch('custom_search', custom, custom)"
              :ref="'custom_search'"
              :class="errors.charterToSent ? 'invalid' : ''"
              placeholder="Укажите название"
          />
          <small v-if="errors.charterToSent">{{ errors.charterToSent}}</small>
        </el-col>
        <el-col :span="8" v-if="typeSelected==='user'">
          <label>Доверенное лицо</label>
          <el-select
              v-model="userSelected"
              filterable
              remote
              reserve-keyword
              placeholder="Укажите ФИО"
              :remote-method="searchUser"
              :loading="loading"
              @change="clearSelectSearch('user_search', userSelected, users)"
              :ref="'user_search'"
              :class="errors.charterToSent ? 'invalid' : ''"
          >
            <el-option
                v-for="item in users"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
          <small v-if="errors.charterToSent">{{ errors.charterToSent}}</small>
        </el-col>
        <el-col :span="8" v-if="typeSelected==='company'">
          <label>Доверенная организация</label>
          <el-select
              v-model="companySelected"
              filterable
              remote
              reserve-keyword
              placeholder="Укажите организацию"
              :remote-method="searchCompany"
              :loading="loading"
              @change="clearSelectSearch('company_search', companySelected, company)"
              :ref="'company_search'"
              :class="errors.charterToSent ? 'invalid' : ''"
          >
            <el-option
                v-for="item in company"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
          <small v-if="errors.charterToSent">{{ errors.charterToSent}}</small>
        </el-col>
        <el-col :span="8" v-if="typeSelected==='department' || typeSelected==='department_child'">
          <label>Департамент</label>
          <el-select
              v-model="departmentSelected"
              filterable
              remote
              reserve-keyword
              placeholder="Укажите департамент или отдел"
              :remote-method="searchDepartment"
              :loading="loading"
              @change="clearSelectSearch('department_search', departmentSelected, department)"
              :ref="'department_search'"
              :class="errors.charterToSent ? 'invalid' : ''"
          >
            <el-option
                v-for="item in department"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
          <small v-if="errors.charterToSent">{{ errors.charterToSent}}</small>
        </el-col>
      </el-row>

      <el-row :gutter="16" class="mb15">
        <el-col :span="16">
          <label>Примечание</label>
          <el-input
              type="textarea"
              rows="4"
              v-model="note"
              placeholder="Укажите примечание"
              >
          </el-input>
        </el-col>
      </el-row>

      <el-row :gutter="24" class="mb15">
        <el-col :span="8">
          <br/>
        </el-col>
        <el-col :span="8">
          <el-button @click="setFormData" size="medium" icon="el-icon-upload" :class="'fluid-button'" type="primary">Добавить привелегию</el-button>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>
<script>
export default {
  name : 'accessAdd',
  data : function (){
    return {
      type               : [
          {value : 'user',             label : 'Доверенное лицо'},
          {value : 'company',          label : 'Организация'},
          {value : 'department',       label : 'Департамент, без иерархиии дочерних подразделений'},
          {value : 'department_child', label : 'Департамент, с иерархией дочерних подразделений'},
          {value : 'custom',           label : 'Общее'},
       ],

      label              : '',
      typeSelected       : 'user',

      custom             : '',
      users              : [],
      userSelected      : '',
      company            : [],
      companySelected    : '',
      department         : [],
      departmentSelected : '',

      charterToSent      : '',
      note               : '',

      errors   : {
        charterToSent   : null,
      },
    };
  },
computed:{
  loading : {
    get(){
      return this.$store.getters.loading;
    },
    set(value){
      this.$store.commit('setLoading',value)
    }
  },
},

  methods : {
    clearSelectSearch : function(key, value, data){
      this.$refs[key].query = '';
      let label = '';
      this.charterToSent = value ;
      if (data instanceof Array) {
        data.forEach(el => { if (el.value === value)  return label = el.label });
        this.label = 'Документы -' + label;
      } else this.label = data;

    },
    searchUser: function(query) {
      if (query !== '')
        this.search(query,'user');
    },
    searchCompany : function(query){
      if (query !== '')
        this.search(query,'company');
    },
    searchDepartment : function(query){
      if (query !== '')
        this.search(query,'department');
    },
    search : async function(query,key){
      let url,obj,department = 0;

      if(key == 'user'){
        obj = 'users';
        url = '/api/vicarious/user/search';
      }

      if(key == 'company'){
        obj = 'company';
        url = '/api/vicarious/company/search';
      }

      if(key == 'department'){
        obj = 'department';
        url = '/api/vicarious/user/dep-search';
      }

      let result = await this.$store.dispatch('query',{url : url,data :  {q : query}});

      if(result.status == 'success'){
        this[obj] = result.data;
      }
    },

    async setFormData() {
        if (!this.charterToSent) {this.errors.charterToSent = 'Необходимо ввести название привелегии!'; return};
        let name = this.typeSelected;
        let label = this.label;
        if (this.charterToSent === 'custom'){ name = this.custom, label = this.custom}
        this.loading = true;
        let result = await this.$store.dispatch('query',{
          url : '/api/vicarious/charter/add',
          data : {name, label, individuals : this.charterToSent, note : this.note}
        });
        if(result.status == 'success') {
          this.charterToSent      = '';
          this.label              = '';
          this.custom             = '';
          this.usersSelected      = '';
          this.companySelected    = '';
          this.departmentSelected = '';
          this.$store.commit('setMessage', {text: result.message, type: 'success'});
        }else
          this.$store.commit('setMessage',{text : result.message,type : 'error'});
        this.loading = false;
      }
    },

  watch:{
    typeSelected : function(){
      this.custom               = '';
      this.usersSelected        = '';
      this.companySelected      = '';
      this.departmentSelected   = '';
      this.errors.charterToSent = null;
    },
    charterToSent : function(){
      this.errors.charterToSent = null;
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

