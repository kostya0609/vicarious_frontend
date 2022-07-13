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
      <template #header>
        <div class="card-header">
          <h3>Редактирование группы пользователей - {{$store.getters.componentParams.name[0].value}}</h3>
        </div>
      </template>
    <el-row :gutter="12" class="mb15">
      <el-col :span="8">
        <label>Пользователь</label>
        <el-select
            v-model="connect.user"
            filterable
            remote
            reserve-keyword
            placeholder="Укажите ФИО"
            :remote-method="searchUser"
            :loading="loading"
            :class="errors.user ? 'invalid' : ''"
        >
          <el-option
              v-for="item in users"
              :key="item.value"
              :label="item.label"
              :value="item.value">
          </el-option>
        </el-select>
        <small v-if="errors.user">{{ errors.user}}</small>
      </el-col>
      <el-col :span="4">
        <label><br/></label>
        <el-button @click="addNewUser" size="small" icon="el-icon-circle-plus" class="fluid-button" type="info">Добавить</el-button>
      </el-col>
    </el-row>
    <el-row :gutter="12" class="mb15">
      <el-col :span="12">
        <el-table
            :data="show.user"
            style="width: 100%">
          <el-table-column
              prop="text"
              :label="'Пользователи группы - '+ $store.getters.componentParams.name[0].value">
          </el-table-column>
          <el-table-column
              align="right"
          >
            <template #default="scope">
              <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-remove"
                  @click="removeUser(scope.$index)">Удалить</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <el-row :gutter="12" class="mb15">
      <el-col :span="8">
        <label>Привелегия</label>
        <el-select
            v-model="connect.charter"
            placeholder="Привелегии"
            :class="errors.charter ? 'invalid' : ''"
        >
          <el-option
              v-for="item in charters"
              :key="item.value"
              :label="item.label"
              :value="item.value">
          </el-option>
        </el-select>
        <small v-if="errors.charter">{{ errors.charter}}</small>
      </el-col>
      <el-col :span="4">
        <label><br></label>
        <el-button @click="addNewCharter" size="small" icon="el-icon-circle-plus" class="fluid-button" type="info">Добавить</el-button>
      </el-col>
    </el-row>
    <el-row :gutter="12" class="mb15">
      <el-col :span="12">
        <el-table
            :data="show.charter"
            style="width: 100%">
          <el-table-column
              prop="label"
              :label="'Привелегии у группы - '+ $store.getters.componentParams.name[0].value">
          </el-table-column>
          <el-table-column
              align="right"
          >
            <template #default="scope">
              <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-remove"
                  @click="removeCharter(scope.$index)">Удалить</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    </el-card>
  </div>
</template>
<script>
export default {
  name : 'usersConnect',
  data : function (){
    return {
      formData  : {
        charter : [],
        user    : []
      },
      connect   : {
        charter : '',
        user    : '',
      },
      show      : {
        user    : [],
        charter : []
      },
      users     : [],
      charters  : [],
      errors    : {
        user    : null,
        charter : null,
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
    role_id(){
      return this.$store.getters.componentParams.id[0].value
    },
  },
  methods : {
    getSyncData : async function(){
    this.loading = true;
      let result = await this.$store.dispatch('query',{url : '/api/vicarious/role/get-connect',data : {
           role_id : this.role_id
         }});
      if(result.status == 'success') {
        this.show.user    = result.data.user;
        this.show.charter = result.data.charter;
      }
      let charter = await this.$store.dispatch('query',{url : '/api/vicarious/charter/list',data : {}});
      if(charter.status == 'success') {
        this.charters = [];
        charter.data.forEach(el => {
          this.charters.push({value : el.id[0].value, label : el.label[0].value});
        });
      }
      this.loading = false;
    },
    addNewUser(){
      this.connect.user ? this.setSyncUser() : this.errors.user = 'Необходимо выбрать пользователя!'
    },
    setSyncUser : async function(){
        this.loading = true;
        this.show.user.forEach(el => {
          this.formData.user.push(el.value);
        });
        if(this.connect.user !== '')
          this.formData.user.push(this.connect.user);
        let result = await this.$store.dispatch('query',{url : '/api/vicarious/role/set-connect',data : {
            role_id   : this.role_id,
            users     : this.formData.user,
            type      : 'user',
          }});
        if(result.status == 'success') {
          this.formData = {
            charter : [],
            user    : []
          }
          this.connect = {
            charter : '',
            user    : ''
          }
          await this.getSyncData();
          this.$store.commit('setMessage',{text : result.message,header : 'Успешно!',type: 'success'});
        }else
          this.$store.commit('setMessage',{text : result.message,header : 'Возникла проблема!',type: 'error'});
        this.loading = false;
    },
    removeUser : function(index){
      this.$confirm(`Вы уверены, что хотите удалить пользователя - ${this.show.user[index].text} ?`).then(() => {
        this.show.user.splice(index,1);
        this.setSyncUser();
      }).catch(()=>{});
    },
    addNewCharter(){
      this.connect.charter ? this.setSyncCharter() : this.errors.charter = 'Необходимо выбрать привелегию!'
    },
    async setSyncCharter(){
        this.loading = true;
        this.show.charter.forEach(el => {
          this.formData.charter.push(el.value);
        });
        if(this.connect.charter !== '')
          this.formData.charter.push(this.connect.charter);
        let result = await this.$store.dispatch('query',{url : '/api/vicarious/role/set-connect',data : {
            role_id  : this.$store.getters.componentParams.id[0].value,
            charters : this.formData.charter,
            type     : 'charter',
          }});
        if(result.status == 'success') {
          this.formData = {
            charter : [],
            user    : []
          }
          this.connect = {
            charter : '',
            user    : ''
          }
          await this.getSyncData();
          this.$store.commit('setMessage',{text : result.message,header : 'Успешно!',type: 'success'});
        }else
          this.$store.commit('setMessage',{text : result.message,header : 'Возникла проблема!',type: 'error'});
        this.loading = false;
    },
    removeCharter : function(index){
      this.$confirm(`Вы уверены, что хотите удалить привелегию - ${this.show.charter[index].text}?`).then(() => {
        this.show.charter.splice(index,1);
        this.setSyncCharter();
      }).catch(()=>{});
    },
    searchUser : async function(query){
      let result = await this.$store.dispatch('query',{url : '/api/vicarious/user/search',data :  {q : query}});
      if(result.status == 'success'){this.users = result.data;}
    },
  },
  watch:{
    'connect.user' : function(){
      this.errors.user = null;
    },
    'connect.charter' : function(){
      this.errors.charter = null;
    },
  },
  async created() {
    await this.getSyncData();
  }
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
