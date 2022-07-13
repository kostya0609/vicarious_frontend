<template>

  <div class="body-wrapper">
    <el-row :gutter="24" class="mb15">
      <el-col :span="18">
        <h2> Заявка № {{requestId}}</h2>
        <h3>Статус заявки - {{requestStatus.value}} {{signature ? ', на подписании' : ''}} {{requestStatus.status==='rejected' ?  '(доп. информация в истории согласования)' : ''}}</h3>
      </el-col>
      <el-col :span="6">
        <div class="component-wrapper" v-if="(isResponsible || isRoot) && (requestStatus.status === 'completed' || requestStatus.status === 'agree' || requestStatus.status === 'deleted')">
          <el-button
              size="medium"
              icon="el-icon-refresh-left"
              type="danger"
              @click="returnToWork">
            Вернуть заявку в работу
          </el-button>
        </div>
        <div class="component-wrapper" v-if="(isResponsible || isRoot) && (requestStatus.status === 'performed' || requestStatus.status === 'rejected')">
          <el-button
              size="medium"
              icon="el-icon-refresh-left"
              type="danger"
              @click="returnToCreated">
            Вернуть на "Заявка создана"
          </el-button>
        </div>
      </el-col>
    </el-row>
    <el-container >
      <el-aside width="20px" :class="['label-color-grey', {'label-color-green' : requestStatus.status === 'agree' || requestStatus.status === 'completed'}, {'label-color-red' : requestStatus.status === 'rejected' || requestStatus.status === 'deleted'}]"></el-aside>
      <el-main>
        <label v-if="requestStatus.status === 'deleted'">
          Заявка была удалена
        </label>
        <label v-if="requestStatus.status === 'created'">
          Заявка ожидает обработки
        </label>
        <label v-if="requestStatus.status === 'performed' && !isApproving">
          Заявка принята в работу <span v-if="signature">, на подписании</span>
        </label>
        <label v-if="requestStatus.status === 'performed' && isApproving">
          Создание листа согласования заявки
        </label>
        <label v-if="requestStatus.status === 'pending_agree'">
          Заявка в процессе согласования. Подробнее во вкладке "История согласования"
        </label>
        <label v-if="requestStatus.status === 'agree'">
          Заявка согласована. Подробнее во вкладке "История согласования"
        </label>
        <label v-if="requestStatus.status === 'completed'">
          Заявка выполнена
        </label>
        <label v-if="requestStatus.status === 'rejected'">
          Заявка отклонена
        </label>
      </el-main>
    </el-container>
    <p v-if="documentId">Документ - № {{documentName}}</p>
    <p v-if="document_project"> Проект документа - <span v-html="project_file"></span></p>
    <p v-if="documentStorage">Место хранения оригинала документа - {{queryData.storageName}}</p>

    <hr/>

    <div  v-if="(isResponsible || isRoot) && !isApproving" v-loading="loading">
      <el-row class="component-wrapper"  v-if="requestStatus.status === 'performed' || requestStatus.status === 'agree'">
        <el-button
            size="medium"
            icon="el-icon-download"
            type="info"
            class="body-button"
            @click="getDocument">
          Сформировать проект документа
        </el-button>
      </el-row>

      <el-row class="component-wrapper" v-if="requestStatus.status === 'performed' && gen_document ">
        <el-upload
            action=""
            ref="uploadProject"
            class="body-button "
            :auto-upload="false"
            :on-change="fileChange">
          <el-button
              size="medium"
              icon="el-icon-document"
              type="info">
            Загрузить проект документа
          </el-button>
        </el-upload>
      </el-row>
      <el-row class="component-wrapper" v-if="requestStatus.status === 'performed' && document_project ">
        <el-button
            size="medium"
            icon="el-icon-coordinate"
            type="info"
            class="body-button"
            @click="isApproving=true">
          Согласовать заявку
        </el-button>
      </el-row>
      <el-row class="component-wrapper" v-if="(requestStatus.status === 'performed' || requestStatus.status === 'agree') && document_project">
      <el-button
            size="medium"
            icon="el-icon-edit-outline"
            type="info"
            class="body-button"
            @click="toSignature">
          {{signature ? 'Отозвать с подписания' : 'Отдать на подписание'}}
        </el-button>

        <div class="body-button-container" >
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
              type="primary"
          >
          </el-button>
        </div>
      </el-row>
      <el-row class="component-wrapper" v-if="(requestStatus.status === 'performed' || requestStatus.status === 'agree') && documentStorage">
        <el-upload
            class="body-button"
            action=""
            ref="uploadScan"
            :auto-upload="false"
            :on-change="completedRequest"
            :multiple="false">
          <el-button
              size="medium"
              icon="el-icon-upload2"
              type="info">
            Загрузить подписанный документ
          </el-button>
        </el-upload>
      </el-row>
    </div>
    <div v-if="isApproving">
      <Add class="component-wrapper"     v-if="requestStatus.status === 'performed'"/>
      <Pending class="component-wrapper" v-if="requestStatus.status === 'pending_agree'"/>
      <el-row class="component-wrapper"  v-if="requestStatus.status === 'pending_agree' && (isResponsible || isRoot)">
        <el-button
            class="body-button"
            size="medium"
            icon="el-icon-back"
            type="info"
            @click="backToShow">
          Вернуться к информации о заявке
        </el-button>
        <el-button
            class="body-button"
            icon="el-icon-close"
            type="danger"
            @click="cancelApprove">
          Остановить согласование
        </el-button>
      </el-row>
      <div class="component-wrapper">
        <el-button
            v-if="requestStatus.status === 'performed' && (isResponsible || isRoot)"
            size="medium"
            class="body-button"
            icon="el-icon-back"
            type="info"
            @click="isApproving=false">
          Назад
        </el-button>
      </div>
    </div>
    <el-row class="component-wrapper" v-if="(isResponsible || isRoot) && requestStatus.status === 'completed'">
        <el-button
            class="body-button"
            size="medium"
            icon="el-icon-document"
            type="info"
            @click="goToDocument"
            style="white-space: normal !important;">
          Перейти к документу № {{documentName}}
        </el-button>
      </el-row>
    <el-row class="component-wrapper" v-if="!isApproving">
        <el-button
            class="body-button body-button-color"
            size="medium"
            icon="el-icon-back"
            type="info"
            @click="backToShow">
          Вернуться к информации о заявке
        </el-button>
      </el-row>
    </div>
</template>
<script>
import Add from './approve/add'
import Pending from './approve/pending'
export default {
  name       : "requestDetailBusiness",
  components : {Add, Pending},
  emits      : ["toShowPage"],
  data(){
    return {
      storages    : [],
      isApproving : false,

      queryData   : {
        id          : '',
        storageId   : '',
        storageName : '',
      },

      errors      : {
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
        this.$store.commit('setLoading',value);
      }
    },
    requestId(){
      return this.$store.getters.requestId;
    },
    requestStatus() {
      return this.$store.getters.requestState;
    },
    isRoot(){
      return this.$store.getters.charters('root')
    },
    isResponsible(){
      return this.$store.getters.isResponsible;
    },
    gen_document(){
      return this.$store.getters.genDocument;
    },
    document_project(){
      return this.$store.getters.document_project;
    },
    project_file(){
      return this.$store.getters.projectFile;
    },
    signature(){
      return this.$store.getters.signature;
    },
    documentId(){
      return this.$store.getters.documentId;
    },
    documentName(){
      return this.$store.getters.documentName;
    },
    documentStorage(){
      return this.$store.getters.documentStorage
    },
  },
  methods :{
    backToShow(){
      this.$emit("toShowPage");
    },
    async fileChange(file) {
      this.loading = true;
      let data = new FormData();
      data.append('document_id', this.documentId);
      data.append('name', this.$store.getters.documentName + '_' + new Date().toLocaleDateString().split('.').join('_'));
      data.append('file[0]', this.$refs.uploadProject.uploadFiles[0].raw);
      let result = await this.$store.dispatch('query', {
        url   : '/api/vicarious/request/upload-project',
        data  : data,
        type  : 'file'
      });
      this.$refs.uploadProject.clearFiles();
      if (result.status == 'success') {
        // ниже метка того загружался ли в систему проект документа в word
        this.$store.commit("document_project", true);
        // ниже сам файл проекта документа - объект со всеми данными
        this.$store.commit('projectFile', result.href.value)

        this.$store.commit('setMessage', {text: result.message, header: 'Успешно!', type: 'success'});
      } else
        this.$store.commit('setMessage', {text: result.message, header: 'Возникла проблема!', type: 'error'});
      this.loading = false;
    },
    goToDocument(){
      this.$store.commit('setPage', 'document');
      this.$store.commit('setComponent', 'detail');
    },
    returnToWork(){
      this.$confirm(`Вы уверены, что хотите Вернуть заявку с ID - ${this.requestId} в работу ? Связанный с этой заявкой документ, при наличии, будет удален!`).then(async() => {
        let result = await this.$store.dispatch('query',{ url : '/api/vicarious/request/update-status', data : {id : this.requestId, type : 'performed' } });

        if (result.status === 'success' ){
          this.$store.commit('setRequestState', {status : 'performed', value : 'Принята в работу' });
          this.$store.commit('setGenDocument', 0);
          this.queryData.storageId = '';
          this.queryData.storageName = '';
          this.$store.commit('setDocumentId', null);
          this.$store.commit('setDocumentName', null);
          this.$store.commit('document_project', null);
          this.$store.commit('projectFile', null);
          this.$store.commit('setDocumentStorage', null);
          this.$store.commit('setMessage',{text : result.msg,type : 'success'});
        } else this.$store.commit('setMessage',{text : 'Возникла проблема!',type : 'error'});
      }).catch(() => {});
    },
    returnToCreated(){
      this.$confirm(`Вы уверены, что хотите Вернуть заявку с ID - ${this.requestId} в "Заявка создана" ? Связанный с этой заявкой документ, при наличии, будет удален!`).then(async() => {
        let result = await this.$store.dispatch('query',{ url : '/api/vicarious/request/update-status', data : {id : this.requestId, type : 'created' } });

        if (result.status === 'success' ){
          this.$store.commit('setRequestState', {status : 'created', value : 'Заявка создана' });
          this.$store.commit('setGenDocument', 0);
          this.queryData.storageId = '';
          this.queryData.storageName = '';
          this.$store.commit('setDocumentId', null);
          this.$store.commit('setDocumentName', null);
          this.$store.commit('document_project', null);
          this.$store.commit('projectFile', null);
          this.$store.commit('setDocumentStorage', null);
          this.$store.commit('setMessage',{text : result.msg,type : 'success'});
        } else this.$store.commit('setMessage',{text : 'Возникла проблема!',type : 'error'});
      }).catch(() => {});
    },
    async toSignature(){
      this.loading = true;
      let changeSignature;
      this.signature ? changeSignature = 0 : changeSignature =1;
      let result = await this.$store.dispatch('query',{
        url                  : '/api/vicarious/request/signature',
        data                 : {
          id        : this.requestId,
          signature : changeSignature,
        }
      });
      if (result.status == 'success') {
        this.$store.commit('setSignature', changeSignature);
        this.$store.commit('setMessage', {text: 'Успешно', header: 'Успешно!', type: 'success'});
      } else
        this.$store.commit('setMessage', {text: 'Не успешно', header: 'Возникла проблема!', type: 'error'});
      this.loading = false;
    },
    cancelApprove(){
      this.$confirm(`Вы уверены, что хотите прервать процесс согласования заявки с ID - ${this.requestId} ?`).then(async () => {
        this.loading = true;
        let result = await this.$store.dispatch('query',{
          url                  : '/api/vicarious/request/coordination-stop',
          data                 : {
            id : this.requestId,
          }
        });
        if (result.status == 'success') {
          this.$store.commit('setRequestState', {status: result.request_status, value: 'Принята в работу'});
          this.$store.commit('setMessage', {text: result.message, header: 'Успешно!', type: 'success'});
        } else
          this.$store.commit('setMessage', {text: result.message, header: 'Возникла проблема!', type: 'error'});
        this.loading = false;
      }).catch(() => {});
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
        if (result.name) fileName = result.name;
        this.$store.commit('setDocumentName', fileName.match(/.*\./i)[0].slice(0,-1));

        result = await this.$store.dispatch('query', {
          url               : '/api/vicarious/request/gen-document',
          data              : {id : this.requestId},
          downloadRequest   : true,
        });
        if (result.status === 200) {
          let blob       = await result.blob();
          let link       = document.createElement('a');
          link.href      = URL.createObjectURL(blob);
          link.download  = fileName;
          link.click();
          URL.revokeObjectURL(link.href);
          this.$store.commit('setGenDocument', 1);
          result = await this.$store.dispatch('query', {
            url  : '/api/vicarious/request/gen-document',
            data : {
              id     : this.requestId,
              doc_id : true
            },
          });
          if (result.length > 0 ) this.$store.commit('setDocumentId', result[0]); else this.$store.commit('setDocumentId', null)
        } else this.$store.commit('setMessage',{text : result.message,type : 'error'});
      } else
        this.$store.commit('setMessage', {text: result.message, type: 'error'});
      this.loading = false;
    },
    async saveStorage(){
      if (this.queryData.storageId === '') {this.errors.storage = 'Необходимо выбрать место!'; return};
      this.queryData.id = this.$store.getters.documentId;
      let result = await this.$store.dispatch('query', {
        url   : '/api/vicarious/storage/set-storage',
        data  : {id : this.queryData.id, storage : this.queryData.storageId}
      });
      if (result.status == 'success') {
        this.$store.commit('setDocumentStorage', this.queryData.storageId);
        this.storages.forEach(el => {if (el.value==this.queryData.storageId) {this.queryData.storageName = el.label; return}});
        this.$store.commit('setMessage', {text: result.message,type : 'success'});
      } else
        this.$store.commit('setMessage',{text : result.message,type : 'error'});
    },
    async completedRequest(){

      let typeFile = this.$refs.uploadScan.uploadFiles[0].raw.type;
      if ( typeFile == 'application/pdf' || typeFile == 'image/jpeg') {
         this.loading = true;
         let data = new FormData();
         data.append('id', this.requestId);
         data.append('name', this.$store.getters.documentName + '_' + new Date().toLocaleDateString().split('.').join('_'));
         data.append('file[0]', this.$refs.uploadScan.uploadFiles[0].raw);
         let result = await this.$store.dispatch('query',{url : '/api/vicarious/request/upload-scan', data : data, type : 'file'});
         if (result.status == 'success') {
           this.$store.commit('setMessage', {text: result.message, type : 'success'});
           if (result.request_status === 'completed') {
                this.$store.commit('setRequestState', {status: result.request_status, value: 'Выполнена'});
             this.$store.commit('setSignature', 0);
            };
         }else
            this.$store.commit('setMessage',{text : result.message, type : 'error'});
         this.$refs.uploadScan.clearFiles();
        this.loading = false;
      } else {
          this.$store.commit('setMessage', {text: 'Необходимо прикрепить файл в формате PDF или JPEG или JPG', header: 'Не верный формат файла', type: 'error'});
          this.$refs.uploadScan.clearFiles();
        }
     },
    async getData(){
      // ниже получаем список всех возможных мест хранения оригинала
      let result = await this.$store.dispatch('query',{ url : '/api/vicarious/storage/list' });
      if (result.status == 'success') {
        this.storages = result.data.map(el => {
          return {value : el.id, label : el.name};
        })
      }
      this.queryData.storageId = this.documentStorage;
      this.storages.forEach(el => {if (el.value === this.documentStorage) {this.queryData.storageName = el.label; return}});
    },
  },
  created(){
    this.requestStatus.status === 'pending_agree' ? this.isApproving = true : this.isApproving = false;
    this.getData();
    window.vicariousLoadFile = async function(id,fileName,type){
      try {
        let result = await this.$store.dispatch('query', {
          url             : '/api/vicarious/request/load-file',
          downloadRequest : true,
          data            : {document_project_id : id, type : type},
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
  },

  watch :{
    'requestStatus.status' : function (){
        this.requestStatus.status === 'pending_agree' ? this.isApproving = true : this.isApproving = false;
        this.getData();
    },
    'queryData.storageId'  : function(){
      this.errors.storage = null;
    },
  },
}
</script>

<style>


</style>
