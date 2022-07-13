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
    <el-row :gutter="24" class="mb15">
      <el-col :span="18">
        <h2>Доверенность № {{documentName}}</h2>
        <h3>Статус: {{map[documentStatus]}}</h3>
      </el-col>
      <el-col :span="6">
        <div class="component-wrapper">
          <el-button
              size="medium"
              icon="el-icon-document"
              type="info"
              @click="goToRequest">
            Перейти к заявке № {{requestId}}
          </el-button>
        </div>
      </el-col>
    </el-row>
    <Show v-model="show" v-if="!loading"/>
    <br/>
    <div class="component-wrapper" v-if="(isManageRequest || isRoot) && !reject">
      <div class="body-button-container" v-if="isForSignature || isActive">
          <span class="body-button" >
          <label>Хранение оригинала</label>
          <el-select
              :class="errors.storage ? 'invalid' : ''"
              v-model="queryData.storageId"
              placeholder="Хранение оригинала"
              >
            <el-option
                v-for="item in storages"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
        </span>
        <el-button
            @click="saveStorage"
            size="medium"
            icon="el-icon-check"
            type="primary">
        </el-button>
      </div>
      <div class="body-button-container" v-if="isActive && isRoot">
          <span class="body-button">
          <label>Новый функционал для документа</label>
          <el-select
              :class="errors.functions ? 'invalid' : ''"
              v-model="queryData.functions"
              placeholder="Функционал"
              multiple >
            <el-option
                v-for="item in functions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
        </span>
        <el-button
            @click="saveFunction"
            size="medium"
            icon="el-icon-check"
            type="primary"
            :disabled="!isActive">
        </el-button>
      </div>
    </div>
    <br/>

    <div  v-if="!reject">
      <div class="body-button-container">
        <el-button
            @click="addByExist"
            class="body-button"
            size="medium"
            icon="el-icon-plus"
            type="info" >
          Копировать данные в новую заявку
        </el-button>
        <el-button
            v-if="(isManageRequest || isRoot) && (isForSignature || isActive)"
            @click="getDocument"
            class="body-button"
            size="medium"
            icon="el-icon-download"
            type="info" >
          Сформировать проект документа
        </el-button>
        <el-upload
            v-if="(isManageRequest && documentStorage && (isForSignature || isActive)) ||  isRoot && documentStatus!=='cancel'"
            class="body-button"
            action=""
            ref="upload"
            :auto-upload="false"
            :on-change="upLoadScan"
            :multiple="false">
          <el-button
              icon="el-icon-upload2"
              size="medium"
              type="info">
            Загрузить подписанный документ
          </el-button>
        </el-upload>
        <el-button
            v-if="(isManageRequest || isRoot) && (isForSignature || isActive)"
            @click="cancelDocument"
            class="body-button"
            size="medium"
            icon="el-icon-close"
            type="danger">
          {{isForSignature ? 'Аннулировать документ' : 'Прекратить действие'}}
        </el-button>
      </div>
    </div>

    <div v-else>

      <div v-if="isActive" class="body-button-container">
        <span class="body-button">
          <label >Дата прекращения действия</label>
          <el-date-picker
              :picker-options="{ firstDayOfWeek: 1 }"
              :class="errors.dateFinalNew ? 'invalid' : ''"
              v-model="dateFinalNew"
              type="date"
              format="dd.MM.yyyy"
              value-format="dd.MM.yyyy"
              placeholder="Прекращение действия документа"
              style="width: 30%"
          >
        </el-date-picker>
        <small v-if="errors.dateFinalNew">{{ errors.dateFinalNew}}</small>
        </span>
      </div>
      <br/>
      <label>Причина {{ isForSignature ? 'аннулирования' : 'прекращения действия'}} документа</label>
      <el-input
          type="textarea"
          rows="4"
          v-model="comment"
          :class="errors.comment ? 'invalid' : ''"
          >
      </el-input>
      <small v-if="errors.comment">{{ errors.comment}}</small>
      <div class="body-button-container">
        <el-button
            @click="noCancelDocument"
            class="body-button"
            size="medium"
            icon="el-icon-back"
            type="info">
          Назад
        </el-button>
        <el-button
            @click="confirmCancelDocument"
            class="body-button"
            size="medium"
            icon="el-icon-check"
            type="danger">
          {{isForSignature ? 'Аннулировать' : 'Прекратить действие'}}
        </el-button>
      </div>
    </div>
  </div>
</template>
<script>

import Show from './detail/show'

export default {
  name: "documentDetail",
  components: {Show},
  data() {
    return {
      documentStatus : '',
      show           : [],
      functions      : [],
      storages       : [],
      map            : {},
      reject         : false,
      dateFinal      : '',
      dateFinalNew   : '',
      comment        : '',

      queryData      : {
        functions   : [],
        storageId   : '',
        storageName : '',
      },

      errors         : {
        functions : null,
        comment   : null,
        storage   : null,
        dateFinalNew : null,
      },
    }
  },
  computed : {
    loading: {
      get: function () {
        return this.$store.getters.loading;
      },
      set: function (value) {
        this.$store.commit('setLoading', value);
      }
    },
    documentId(){
      return this.$store.getters.documentId;
    },
    documentName(){
      return this.$store.getters.documentName;
    },
    requestId(){
      return this.$store.getters.requestId;
    },
    isManageRequest(){
      return this.$store.getters.charters('manageRequest');
    },
    isRoot(){
      return this.$store.getters.charters('root');
    },
    documentStorage(){
      return this.$store.getters.documentStorage
    },
    isActive(){
      return this.documentStatus === 'active' ? true : false;
    },
    isForSignature(){
      return this.documentStatus === 'for_signature' ? true : false;
    },
  },
  methods :{
    goToRequest(){
      this.$store.commit('setPage', 'request');
      this.$store.commit('setComponent', 'detail');
    },
    async saveFunction(){
      if (this.queryData.functions.length <= 0) {this.errors.functions = 'Необходимо выбрать функционал!'; return};

      let result = await this.$store.dispatch('query', {
        url   : '/api/vicarious/request/update-functions',
        data  : {id : this.requestId, functions : this.queryData.functions}
      });
      if (result.status == 'success') {
        this.$store.commit('setMessage', {text: result.message,type : 'success'});
        this.queryData.functions = [];
        this.getData();
      } else
        this.$store.commit('setMessage',{text : result.message,type : 'error'});
    },
    async saveStorage(){
      if (this.queryData.storage === '') {this.errors.storage = 'Необходимо выбрать место!'; return};
      let result = await this.$store.dispatch('query', {
        url   : '/api/vicarious/storage/set-storage',
        data  : {id : this.documentId, storage : this.queryData.storageId}
      });
      if (result.status == 'success') {
        this.$store.commit('setDocumentStorage', this.queryData.storageId);
        this.storages.forEach(el => {if (el.value === this.queryData.storageId) {this.queryData.storageName = el.label; return}});
        this.$store.commit('setMessage', {text: result.message,type : 'success'});
        this.getData();
      } else
        this.$store.commit('setMessage',{text : result.message,type : 'error'});
    },
    addByExist(){
      this.$confirm(`Вы уверены, что хотите создать новую заявку на основе данных заявки с ID - ${this.requestId} ?`).then(() => {
        this.$store.commit('setPage', 'request');
        this.$store.commit('setComponent', 'addByExist');
      }).catch( () => {} );
    },
    async getDocument(){
      this.loading = true;
      let result = await this.$store.dispatch('query', {
        url         : '/api/vicarious/request/gen-document',
        data        : {
          id        : this.requestId,
          name      : true,
        },
      });
      if (result.status === 'success') {
        let fileName = 'Текущая заявка';
        result.name ? fileName = result.name : '';
        result = await this.$store.dispatch('query', {
          url               : '/api/vicarious/request/gen-document',
          data              : {id : this.requestId},
          downloadRequest  : true,
        });
        if (result.status === 200) {
          let blob       = await result.blob();
          let link       = document.createElement('a');
          link.href      = URL.createObjectURL(blob);
          link.download  = fileName;
          link.click();
          URL.revokeObjectURL(link.href);
        } else this.$store.commit('setMessage',{text : result.message,type : 'error'});
      } else
        this.$store.commit('setMessage', {text : result.message, type: 'error'});
      this.loading = false;
    },
    async upLoadScan(){
      let typeFile = this.$refs.upload.uploadFiles[0].raw.type;
      if ( typeFile == 'application/pdf' || typeFile == 'image/jpeg') {

        this.loading = true;
        let data = new FormData();
        data.append('id', this.requestId);
        data.append('name', this.$store.getters.documentName + '_' + new Date().toLocaleDateString().split('.').join('_'));
        data.append('file[0]', this.$refs.upload.uploadFiles[0].raw);
        let result = await this.$store.dispatch('query',{url : '/api/vicarious/request/upload-scan',data : data,type : 'file'});
        if (result.status == 'success') {
          this.$store.commit('setMessage', {text: result.message,type : 'success'});
        } else
          this.$store.commit('setMessage',{text : result.message,type : 'error'});
        this.$refs.upload.clearFiles();
        this.getData();
        this.loading = false;
      } else {
          this.$store.commit('setMessage', {text: 'Необходимо прикрепить файл в формате PDF', header: 'Не верный формат файла', type: 'error'});
          this.$refs.upload.clearFiles();
      }
    },
    cancelDocument(){
      this.reject = true;
      setTimeout(() => {window.scrollTo(0,15000)},0)
    },
    noCancelDocument(){
      this.comment = '';
      this.reject = false;
    },
    confirmCancelDocument(){
      let delta = new Date(this.dateFinalNew.split('.').reverse().join('.')).getTime() - new Date(this.dateFinal.split('.').reverse().join('.')).getTime();
      // ниже проверки что пользователь не олень
      if (delta > 0) {
        this.errors.dateFinalNew = 'Выбранная дата не может превышать дату окончания действия документа. !';
        return;
      }
      if (!this.dateFinalNew) {
        this.errors.dateFinalNew = 'Необходимо указать дату!';
        return;
      }
      if (!this.comment) {
        this.errors.comment = 'Необходимо указать причину!';
        return;
      }
      // ниже принятие решения о том что делаем - или аннулируем или прекращвем действие досрочно
      let status = null;
      if (this.isActive)       status = 'terminated';
      if (this.isForSignature) status = 'cancel';

      //ниже аннулируем документ или прекращаем действие документа
      this.$confirm(`Вы уверены, что хотите ${this.isForSignature ? 'анулировать документ' : 'прекратить действие документа'}  с ID - ${this.documentId} ?`).then(async () => {
         this.loading = true;
         let  first_result = await this.$store.dispatch('query',{
           url    :  '/api/vicarious/request/document-cancel',
           data   :   {
             id          : this.documentId,
             request_id  : this.requestId,
             reason      : this.comment,
             status      : status,
             date_cancel : this.dateFinalNew,
           }
         });

        if (first_result.status == 'success') {
          this.$store.commit('setMessage', {text: first_result.message, header: 'Успешно!', type: 'success'});
          await this.getData();
        } else
            this.$store.commit('setMessage', {text: first_result.message, header: 'Возникла проблема с аннулированием документа!', type: 'error'});
        this.comment = '';
        this.reject = false;
        this.loading = false;
      }).catch(() => {});
    },
    async getData(){
      this.loading = true;
      // ниже маппинг для перевода английских слов в русские
      this.$store.getters.queryStatusDocument.forEach(el => {this.map[el.value] = el.label});
      // ниже получаем список всех возможных мест хранения оригинала
      let result = await this.$store.dispatch('query',{ url : '/api/vicarious/storage/list' });
      if (result.status == 'success') {
        this.storages = result.data.map(el => {
          return {value : el.id, label : el.name};
        })
      }
      // ниже получаем список всех функций и сохраняем в this.functions
      result = await this.$store.dispatch('query', {url: '/api/vicarious/function/list', data: {}});
      if (result.status == 'success') {
        this.functions = result.data.map(el => {
          return {value: el.id[0].value, label: el.name[0].value};
        })
      }
      // ниже получаем данные именно по заявке которая была у документа, чтоб узнать ее функционал, и отрисовать в компаненте через массив this.show
      result = await this.$store.dispatch('query', {
        url   : '/api/vicarious/request/get-edit',
        data  : {id: this.requestId}
      });
      let functions = [];
      if (result.status == 'success') {
        result.data.functions.forEach(el => {this.functions.forEach(item => {item.value === el ? functions.push(item.label) : ''})});
      } else {
        this.$store.commit('setMessage', {text: result.message, header: 'Возникла проблема!', type: 'error'});
        functions.push('Проблема с получением данных');
      }
      // ниже получаем сам документ
      result = await this.$store.dispatch('query', {
        url   : '/api/vicarious/request/document-get',
        data  : {id: this.documentId}
      });

      if (result.status == 'success') {
        //ниже информация о конечной дате действия... нужна для корректного прекращения действия
        this.dateFinal = result.data.document_final;
        //ниже обновляем информацию о месте хранения документа
        this.queryData.storageId = result.data.storage_id;
        this.$store.commit('setDocumentStorage',this.queryData.storageId);
        this.storages.forEach(el => {if (el.value === this.queryData.storageId) {this.queryData.storageName = el.label; return}});
        //ниже название документа и статус
        this.$store.commit('setDocumentName', result.data.name)
        this.documentStatus  = result.data.status;
        //ниже причины отклонения или аннулирования документа
        let reason = '';
        if (this.documentStatus === 'cancel' || this.documentStatus === 'terminated') reason = result.data.date_cancel + ', ' + result.data.who_cancel + ', ' + ' причина - '+ result.data.reason; else reason = '';
        // ниже сканы документов
        let files = [];
        result.data.files.length > 0 ? files = result.data.files.map(el => {return el.value}) : files.push ('Нет данных');
        // ниже доверенные лица
        let usersToShow = [], whoReceive ='';
        whoReceive = result.data.receiver;

        if (whoReceive === 'individual'){
          if (result.data.users.length > 0){
            for (let i = 0; i < result.data.users.length; i++) {
              usersToShow.push(result.data.users[i].href + ', ' + result.data.users[i].department + ', ' +result.data.users[i].position)
              if (result.data.users[i].org instanceof Array) {
                for (let j = 0; j < result.data.users[i].org.length; j++) { usersToShow.push('( ' + result.data.users[i].org[j].name + ', ' + result.data.users[i].org[j].position + ' )' )}
              }
            }
          }
        } else {
          if (result.data.users.length > 0){
            usersToShow.push(result.data.users[0].label)
          }
        }

        // ниже сама таблица, значение ключа value всегда должно быть массивом, иначе при отрисовки таблице в компаненте show будет столько строк сколько букв в слове
        this.show = [
          {label : 'Начало действия документа',           value : [result.data.document_start]},
          {label : 'Окончание действия документа',        value : [result.data.document_final]},
          {label : 'ID документа',                        value : [result.data.id]},
          {label : 'ID заявки',                           value : [result.data.request_id]},
          {label : 'Тип доверенности',                    value : [result.data.document_type]},
          {label : 'Заказчик',                            value : result.data.creator.map(el => {return  el.value +', ' + el.department +', ' + el.position})},
          {label : whoReceive === 'individual' ? 'Доверенное лицо' : 'Доверенная организация', value : usersToShow},
          {label : 'Организация',                         value : [result.data.company]},
          {label : 'Функционал',                          value : functions},
          {label : 'Хранение оригинала',                  value : [this.queryData.storageName]},
          {label : 'Причина аннулирования / прекращения', value : [reason]},
          {label : 'Сканы документов',                    value : files},
        ];

      } else
        this.$store.commit('setMessage', {text: result.message, header: 'Возникла проблема!', type: 'error'});

      setTimeout(() => {window.scrollTo(0,15000)},0)
      this.loading = false;
    },
  },
  created() {
    window.vicariousLoadFile = async function(id,fileName,type){
      try {
        let result = await this.$store.dispatch('query', {
          url             : '/api/vicarious/request/load-file',
          downloadRequest : true,
          data            : {scan_id: id, type : type},
        });
        let blob      = await result.blob();
        let url       = URL.createObjectURL(blob);
        let link      = document.createElement('a');
        link.href     = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);
      }catch(e){
        this.$store.commit('setMessage',{text : 'Некорректный ответ сервера',header : 'Возникла проблема!', type: 'error'});
      }
      return false;
    }.bind(this);
    this.dateFinalNew = new Date().toLocaleDateString();
    this.getData();
  },
  watch :{
    'queryData.functions' : function(){
      this.errors.functions = null;
    },
    'queryData.storage' : function(){
      this.errors.storage = null;
    },
    'comment' : function(){
      this.errors.comment = null;
    },
    'dateFinalNew' : function(){
      this.errors.dateFinalNew = null;
    },
  },
}
</script>
<style>
</style>