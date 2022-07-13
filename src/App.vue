<template>
<div>
  <div v-if="isToken">
    <el-menu :default-active="page" mode="horizontal" @select="setActiveMenu" v-if="$store.getters.component === 'list' ">
      <el-menu-item v-for="(item,key) in menu" :index="key" :key="key">{{item}}</el-menu-item>
      <el-menu-item class="menu-right-element" @click="$store.commit('setComponent','add')" v-if="page in addLang">
        <el-button class="menu-right-element-button">
          Добавить {{addLang[page]}}
        </el-button>
      </el-menu-item>
    </el-menu>
    <component :is="page + 'Page'" />
  </div>

  <el-container v-else class="body-wrapper">
    <el-aside width="20px" :style="error ? 'background-color: #F56C6C' : 'background-color: #909399'"></el-aside>
    <el-main>
      <label>{{error ? error : 'Ожидание авторизации на сервере!'}}</label>
    </el-main>
  </el-container>

  <div class="message_container" v-if="'text' in $store.getters.message">
    <el-alert
        :type="$store.getters.message.type"
        show-icon
        :title="$store.getters.message.header"
        :description ="$store.getters.message.description"
        @close="$store.commit('setMessage',{})"
    >
      <template v-slot><span v-html="$store.getters.message.text"/></template>
    </el-alert>
  </div>
</div>
</template>
<script>
import requestPage from './components/request/page';
import documentPage from './components/document/page';
import functionPage from './components/function/page';
import usersPage from './components/users/page';
import accessPage from './components/access/page';
import storagePage from './components/storage'
import exchangePage from './components/exchange/page'

export default {
  components : {documentPage, requestPage, functionPage, usersPage, accessPage, storagePage, exchangePage},
  computed : {
    page : function() {
      return this.$store.getters.page;
    },
    component : function(){
      return this.$store.getters.component;
    },
    user_id() {
      return this.$store.getters.userId
    },
  },
  data : function () {
    return {
      isToken     : false,
      menu        : {
        request    : 'Заявки',
        document   : 'Документы',

        //users      : 'Группы пользователей',
        //access     : 'Права доступа',

        //storage    : 'Варианты хранения оригинала',
        //exchange   : 'Выгрузка'
      },
      addLang : {
        request   : 'заявку',
        function  : 'функцию',
        users     : 'группу',
        access    : 'привелегию',
        exchange  : 'выгрузку'
      },
      error       : '',
    }
  },
  methods : {
    setActiveMenu(key) {
      if (key == null) return false;

      if (key !== this.$store.getters.page) {
        this.$store.commit('setPage',key);
        this.$store.commit('setPaginationPage', 1);
        this.$store.commit('setPaginationSize', 10);
      }
      if (this.component !== 'list') this.$store.commit('setComponent','list');
    },

    async initData(){
      if (window._userId)  {
        this.$store.commit('setUserId', window._userId);
      } else {
        this.$store.commit('setUserId', null);
        };

      window._token ? window.token = window._token : window.token = '';

      let result = await  this.$store.dispatch('query',{url : '/api/vicarious/home',data : { id : this.user_id} });
      if (window.token) {
          this.isToken = true; //в этом случае наверху отрисуется начальный компонент
          this.error   = '';
              if (result.charters) {
                this.$store.commit('setCharters', result.charters);
                this.manageMenu();
              } else this.$store.commit('setCharters', []);

              if (result.individuals) {
                this.$store.commit('setIndividuals', result.individuals);
                this.manageMenu();
              } else this.$store.commit('setIndividuals', []);

      } else {
          this.$store.commit('setMessage',{text : 'Некорректный ответ сервера',header : 'Возникла проблема c токеном!', type: 'error'});
          this.isToken = false;
          this.error   = 'Возникла проблема с получением токена при авторизации на сервере!';
          this.$store.commit('setCharters', []);
        };
    },
    manageMenu(){
     if (this.$store.getters.charters('root')) {
        this.menu = {
          request    : 'Заявки',
          document   : 'Документы',
          function   : 'Функционал',
          users      : 'Группы пользователей',
          access     : 'Права доступа',
          storage    : 'Варианты хранения оригинала',
          exchange   : 'Выгрузка'
        };
        return;
      }

     if (this.$store.getters.charters('manageRequest')) {
        this.menu = {
          request    : 'Заявки',
          document   : 'Документы',
          storage    : 'Варианты хранения оригинала'
        };
        return;
      }

     if (this.$store.getters.charters('manageFunction')) {
       this.menu = {
         request  : 'Заявки',
         document : 'Документы',
         function : 'Функционал',
       };
       return;
     }
    },
  },
  created() {
    this.initData();
  },
}
</script>
<style>

/*таблица деталки*/
/*цвет текста*/
.el-table {
  color: black!important;

}

/*цвет полосок*/
.el-table td, .el-table th.is-leaf{
  border-bottom: 1px solid #e0e0e0 !important;
}

.el-table--border::after, .el-table--group::after, .el-table::before {
  border-bottom: 1px solid #e0e0e0 !important;
}

/*цвет рамок*/
.el-tabs--border-card {
  border: 1px solid #cccccc !important;
}
.el-tabs--border-card>.el-tabs__header{
  border-bottom: 1px solid #cccccc !important;
}
.el-tabs--border-card>.el-tabs__header .el-tabs__item.is-active{
  border-left: 1px solid #cccccc !important;
  border-right: 1px solid #cccccc !important;
  color: #409EFF!important;
}
.el-tabs--border-card>.el-tabs__header .el-tabs__item {
  color: black!important;
}

.el-button--info {
  /*background-color:  #c4c4c4 !important;*/
}

.el-button--info.is-disabled, .el-button--info.is-disabled:active, .el-button--info.is-disabled:focus, .el-button--info.is-disabled:hover {
  background-color:  #c4c4c4 !important;
  border-collor: #c4c4c4 !important;
}

#workarea {
  overflow-y: unset !important;
}
#workarea-content {
  overflow: unset !important;
}
.workarea-content-paddings{
  overflow-x: unset !important;
}
.message_container{
  position: fixed;
  top: 0;
  right: 0;
  padding: 10px 20px;
  z-index: 9999;
  max-width: 400px;
}
.menu-right-element{
  float: right !important;
}

.menu-right-element-button{
  background: #3bc8f5 !important;
  border-color: #3bc8f5 !important;
  color : white !important;
  text-transform: uppercase;
}
.menu-right-element-button:hover{
  background: #3fddff !important;
}

.el-button--primary{
  background : #3bc8f5 !important;
  border-color: #3bc8f5 !important;
}

.el-button--primary:hover{
  background: #3fddff !important;
}

.body-button {
  margin: 0px !important;
  width: 22% ;
  margin-right: 20px !important;
}
.body-button-color {
  background: #3bc8f5 !important;
  border-color: #3bc8f5 !important;
  color : white !important;
}

.body-button-color:hover{
  background: #3fddff !important;
}

.body-button button.el-button.el-button--info {
  width: 100%;
}

.el-alert .el-alert__description{
  margin: 5px 10px 0px 0px;
}
.mb15{
  margin-bottom: 15px;
}
.el-col > label{
  width: 100%;
  display: block;
  margin: 0 0 .28571429rem 0;
  color: rgba(0,0,0,.87);
  font-size: .92857143em;
  font-weight: 700;
  text-transform: none;
}
.fluid-button,
.el-upload,
.el-select,
.el-date-editor.el-input,
.el-date-editor.el-input__inner{
  width: 100% !important;
  margin-top: 5px;

}
.el-tag{
  max-width: 98% !important;
}
.el-tag.el-tag--info .el-tag__close{
  top: -7px !important;
  right: 10px !important;
}
.el-select__tags-text{
  overflow: hidden;
  display: inline-block;
  -ms-text-overflow: ellipsis;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: .5px;
  width: 100% !important;
  padding-right: 10px !important;

}
.el-textarea__inner{
  min-height: 40px !important;
  white-space: normal !important;
}
.body-wrapper {
  padding: 15px;
}
.component-wrapper {
  margin-top: 15px;
}
.body-button-container {
  display: flex;
  box-sizing: border-box;
  margin-top: 15px;
  align-items: flex-end;
}

.fluid-button .el-upload, .el-select, .el-date-editor.el-input, .el-date-editor.el-input__inner{
  margin: 0!important;
}
.column-body{
  justify-content: left !important;
}

.tableWithOutHeader .el-table__header-wrapper {
  display: none!important;
}

.label-color-grey {
  background-color: #909399;
}
.label-color-green {
  background-color: #67C23A;
}
.label-color-red {
  background-color: #F56C6C;
}

.ps__thumb-x{
  height: 11px !important;
}

.ps__rail-x {
  opacity: 1 !important;
}


small {
  color: #ff2400;
}
.invalid {
  border:solid 1px;
  border-color: #ff2400;
}
</style>

