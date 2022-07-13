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
      <h3>Редактирование выгрузки</h3>
      <el-row :gutter="24" class="mb15">
        <el-col :span="8">
          <label>Название выгрузки</label>
          <el-input
              v-model="queryData.name"
              placeholder="Название выгрузки"
              :class="errors.name ? 'invalid' : ''"
          />
          <small v-if="errors.name">{{ errors.name}}</small>
        </el-col>
        <el-col :span="8">
          <label>Описание выгрузки</label>
          <el-input
              v-model="queryData.description"
              type="textarea"
              rows="1"
              placeholder="Описание выгрузки"
          />
        </el-col>
      </el-row>
      <el-row :gutter="24" class="mb15">
        <el-col :span="8">
          <label>Функционал</label>
          <el-select
              v-model="queryData.functions"
              placeholder="Функционал"
              :class="errors.function ? 'invalid' : ''"
              multiple
              ref="selectFunction"
          >
            <el-option
                :style="{width: $refs.selectFunction.$el.offsetWidth + 30 +'px', whiteSpace: 'normal', height: 'auto'}"
                v-for="item in functions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            >
              <div
                  v-on:mouseover="mouseOnFunctionOptions($event,true, item)"
                  v-on:mouseout="mouseOnFunctionOptions($event, false, '')"
              >
                {{item.label}}
              </div>
            </el-option>
          </el-select>
          <small v-if="errors.function">{{ errors.function}}</small>
        </el-col>
        <el-col :span="8">
          <br/>
        </el-col>
        <el-col :span="8">
          <label><br/></label>
          <el-button
              @click="saveForm"
              :class="'fluid-button'"
              size="medium"
              icon="el-icon-upload"
              type="primary"
          >
            Сохранить выгрузку
          </el-button>
        </el-col>
      </el-row>
    </el-card>
    <div class="context-menu-wrapper" v-if="functionsDetail.show">
      <div class="context-menu-element" v-if="functionsDetail.note"> <h4>Примечание</h4> {{functionsDetail.note}}</div>
      <div class="context-menu-element" v-if="functionsDetail.text"> <h4>Описание  </h4> {{functionsDetail.text}}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "exchangeEdit",
  data(){
    return {
      queryData : {
        name        : '',
        description : '',
        functions   : [],
      },
      functionsDetail : {
        show : false,
        text : '',
        note : '',
      },
      functions : [],
      errors      : {
        name      : null,
        function  : null,
      },
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
    exchangeId(){
      return this.$store.getters.exchangeId;
    },
  },
  methods : {
    mouseOnFunctionOptions(e,isShow, item){
      if (isShow) {
        this.functionsDetail.show = true;
        this.functionsDetail.text = item.text;
        this.functionsDetail.note = item.note;
        this.$nextTick(() => {
          let menu = document.querySelector('.context-menu-wrapper'),
              clientClick = {
                y : e.clientY,
              };
          menu.style.maxWidth = 45 + '%';
          menu.style.position = 'relative';
          menu.style.left = this.$refs.selectFunction.$el.offsetWidth  + 62 + 'px';
          if (clientClick.y < this.$refs.selectFunction.$el.getBoundingClientRect().y)  menu.style.top =  - 190 + 'px';
          else  menu.style.top =  -22 + 'px';
        });
      } else {
        this.functionsDetail.show = false;
        this.functionsDetail.text = '';
        this.functionsDetail.note = '';
      }
    },

    async getData() {
      this.loading = true;
      let functions = await this.$store.dispatch('query', {url: '/api/vicarious/function/list', data: {}});
      if (functions.status == 'success') {
        this.functions = functions.data.map(el => {
          return {value: el.id[0].value, label: el.name[0].value, text: el.text[0].value, note: el.note[0].value};
        })
      }

      let result = await this.$store.dispatch('query',{url : '/api/vicarious/exchange/edit',data : {id : this.exchangeId, edit : 'get'}});
      if(result.status == 'success'){
          this.queryData.id = result.data.id;
          this.queryData.name = result.data.name;
          this.queryData.description = result.data.description;
          this.queryData.functions = result.data.functions.map(el => {return el.id})
      } else
          this.$store.commit('setMessage',{text : 'Некорректный ответ сервера',header : 'Возникла проблема!',type: 'error'});


      this.loading = false;
    },

    isValid(queryData){
      for (let key in this.errors) this.errors[key] = null;
      let isValid = true;
      if (!queryData.name)                   {isValid = false; this.errors.name     = 'Необходимо ввести название выгрузки'};
      if (queryData.functions.length === 0 ) {isValid = false; this.errors.function = 'Необходимо выбрать функцию'};
      return isValid
    },

    async saveForm(){
      if (this.isValid(this.queryData)) {
        this.loading = true;
        let result = await this.$store.dispatch('query',{url : '/api/vicarious/exchange/edit',data : {edit : 'set', ...this.queryData} });
        if(result.status == 'success'){
          this.$store.commit('setMessage', {text: result.message, header: 'Успешно!', type: 'success'});
          this.$store.commit('setComponent', 'list');
        }else
          this.$store.commit('setMessage',{text : result.message,header : 'Возникла проблема!',type: 'error'});
        this.loading = false;
      }
    },
  },
  created() {
    this.getData();
  },
  watch: {
    'queryData.name' : function(){
      this.errors.name = null;
    },
    'queryData.functions' : function(){
      this.errors.function = null;
    },

  },
}
</script>

<style scoped>

</style>