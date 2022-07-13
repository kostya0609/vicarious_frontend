<template>
  <div class="body-wrapper" v-loading="loading">
    <el-card class="component-wrapper">
      <template #header>
        <div class="card-header">
          <h3>Администрирование вариантов хранения оригиналов документа</h3>
        </div>
      </template>
      <el-row :gutter="12" class="mb15">
        <el-col :span="8">
          <label>Место хранения</label>
          <el-input
              type="text"
              v-model="storage"
              :class="errors.storage ? 'invalid' : ''"
              placeholder="Укажите место"
          />
          <small v-if="errors.storage">{{ errors.storage}}</small>
        </el-col>
        <el-col :span="4">
          <label><br></label>
          <el-button @click="addNewStorage" size="small" icon="el-icon-circle-plus" class="fluid-button" type="info">Добавить</el-button>
        </el-col>
      </el-row>

      <el-row :gutter="12" class="mb15">
        <el-col :span="12">
          <el-table
              :data="show">
            <el-table-column
                prop="id"
                label="ID"
            >
            </el-table-column>
            <el-table-column
                prop="name"
                label=Название
            >
            </el-table-column>

            <el-table-column
                align="right"
            >
              <template #default="scope">
                <el-button
                    size="mini"
                    type="danger"
                    icon="el-icon-remove"
                    @click="removeStorage(scope.$index)">Удалить</el-button>
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
  name : 'storageList',
  data(){
    return {
      storage : '',

      show : [],

      errors : {
        storage : null,
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
  },
  methods  : {
    async getData(){
      this.loading = true;
      let result = await this.$store.dispatch('query',{ url : '/api/vicarious/storage/list' });
      if (result.status == 'success') {
        //если пусто то добавить варианты по умолчанию
        if (result.data.length === 0) {
          let mokStorage = [
            {name : 'Выдано на руки'},{name : 'ДПУ'},{name : 'ДФИиУ'},{name : 'ОП МСК'},{name : 'ОП НСК'},{name : 'ОП ЕКТ'},{name : 'ОП СМР'}
          ];
          for (let i = 0; i < mokStorage.length; i++ ) {
            await this.$store.dispatch('query',{url : '/api/vicarious/storage/add',data : mokStorage[i]});
          }
          result = await this.$store.dispatch('query',{ url : '/api/vicarious/storage/list' });
        }

        this.show = result.data.map(el => {
           return {id : el.id, name : el.name};
        })

      } else
        this.$store.commit('setMessage',{text : 'Некорректный ответ сервера',header : 'Возникла проблема!',type: 'error'});
      this.loading = false;
    },

    async addNewStorage(){
      if (this.storage === '') {this.errors.storage = 'Необходимо выбрать место!'; return};
      this.loading = true;
      let result = await this.$store.dispatch('query',{ url : '/api/vicarious/storage/add', data :  { name : this.storage } });
      if (result.status == 'success') {
        this.storage = '';
        this.$store.commit('setMessage', {text: result.message, type : 'success'});
        this.getData();
      } else
        this.$store.commit('setMessage',{text : 'Некорректный ответ сервера',header : 'Возникла проблема!',type: 'error'});
      this.loading = false;
    },

    removeStorage(index){
      this.$confirm(`Вы уверены, что хотите удалить  - ${this.show[index].name} ?`).then(async () => {
        this.loading = true;
        let result = await this.$store.dispatch('query',{ url : '/api/vicarious/storage/delete', data :  { id : this.show[index].id } });
        if (result.status == 'success') {
          this.$store.commit('setMessage', {text: result.message, type : 'success'});
          this.show.splice(index,1);
          this.getData();
          this.loading = false;
        } else
            this.$store.commit('setMessage',{text : 'Некорректный ответ сервера',header : 'Возникла проблема!',type: 'error'});
      }).catch(()=>{});
    },
  },

  created() {
    this.getData();
  },

  watch : {
    storage(){
      this.errors.storage = null;
    },
  },
}
</script>