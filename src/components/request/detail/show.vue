<template>
  <div class="body-wrapper" v-loading="loading">
    <el-row :gutter="24" class="mb15">
      <el-col :span="18">
        <h2> Заявка № {{requestId}}</h2>
        <h3>Статус заявки - {{requestStatus.value}} {{signature ? ', на подписании' : ''}} {{requestStatus.status==='rejected' ?  '(доп. информация в истории согласования)' : ''}}</h3>
      </el-col>
      <el-col :span="6">
        <div class="component-wrapper" v-if="isManageRequest && gen_document">
          <el-button
              size="medium"
              icon="el-icon-document "
              type="info"
              @click="goToDocument"
              style="white-space: normal !important;">
            Перейти к документу № {{documentName}}
          </el-button>
        </div>
      </el-col>
    </el-row>
    <ShowInfo :show="show" v-if="!loading"/>
    <div class="body-button-container" v-if="requestStatus.status==='completed' &&  !reject">
      <el-button
          @click="addByExist"
          size="medium"
          icon="el-icon-plus"
          class="body-button"
          type="info" >
        Копировать заявку
      </el-button>
    </div>
    <div class="body-button-container" v-if="requestStatus.status!=='completed' && requestStatus.status!=='deleted' &&  !reject" >
      <el-button
          v-if="isCreator || isResponsible || isRoot"
          @click="editRequest"
          size="medium"
          icon="el-icon-edit"
          class="body-button"
          type="info"
          :disabled="notPossibleEdit">
        Редактировать заявку
      </el-button>
      <el-button
          v-if="(isCreator || isDeleteRejected) && requestStatus.status!=='deleted'"
          @click="deleteRequest"
          size="medium"
          icon="el-icon-delete"
          class="body-button"
          type="danger"
          :disabled="notPossibleDelete">
        Удалить заявку
      </el-button>
      <el-button
          v-if="isManageRequest && requestStatus.status==='created'"
          @click="performRequest"
          size="medium"
          icon="el-icon-check"
          class="body-button"
          type="info"
          :disabled="requestStatus.status!=='created'">
        Принять заявку
      </el-button>
      <el-button
          v-if="(isResponsible || isRoot) && requestStatus.status === 'performed'"
          @click="rejectRequest"
          size="medium"
          icon="el-icon-close"
          class="body-button"
          type="info">
        Отклонить заявку
      </el-button>
    </div>
    <div class="component-wrapper"     v-if="reject" >
      <label><b>Причина отклонения заявки</b></label>
      <el-input
          type="textarea"
          rows="4"
          v-model="comment"
          :class="errors.comment ? 'invalid' : ''"
          >
      </el-input>
      <small v-if="errors.comment">{{errors.comment}}</small>
      <div class="component-wrapper">
        <el-button
            size="medium"
            class="body-button"
            icon="el-icon-back"
            type="info"
            @click="cancelRejectRequest">
          Назад
        </el-button>
        <el-button
            size="medium"
            class="body-button"
            icon="el-icon-check"
            type="info"
            @click="confirmRejectRequest">
          Отклонить
        </el-button>
      </div>
    </div>
    <div class="component-wrapper" v-if="requestStatus.status!=='completed' && !isCreator && !isManageRequest&& !isDeleteRejected">
      <el-button
          size="medium"
          class="body-button body-button-color"
          @click="$store.commit('setComponent', 'list')"
          icon="el-icon-back"
          plain
          type="info">
        Вернуться к списку
      </el-button>
    </div>
  </div>
</template>
<script>
import ShowInfo from './showInfo'
export default {
  name       : "requestDetailShow",
  components : {ShowInfo},
  data(){
    return {
      comment           : '',
      show              : {
        table_1  : [],
        table_2  : [],
      },
      functions         : [],
      reject            : false,

      map               : {},
      errors            : {
        comment         : '',
      }
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

    notPossibleEdit (){
      if (this.isManageRequest)
        return (this.requestStatus.status === 'created' || this.requestStatus.status === 'rejected' || this.requestStatus.status === 'performed') ? false : true;
      if (this.isCreator)
        return (this.requestStatus.status === 'created' || this.requestStatus.status === 'rejected') ? false : true;
    },
    notPossibleDelete (){
      return ( (this.requestStatus.status === 'created' || this.requestStatus.status === 'rejected') && this.isCreator || this.requestStatus.status === 'rejected' && this.isDeleteRejected) ? false : true;
    },

    requestId() {
      return this.$store.getters.requestId;
    },
    requestStatus(){
      return this.$store.getters.requestState
    },

    gen_document(){
      return this.$store.getters.genDocument;
    },
    signature(){
      return this.$store.getters.signature;
    },
    documentId(){
      return this.$store.getters.documentId;
    },
    documentName(){
      return this.$store.getters.documentName
    },
    user_id() {
      return this.$store.getters.userId
    },
    isCreator(){
      return this.$store.getters.isCreator;
    },
    isResponsible(){
      return this.$store.getters.isResponsible;
    },
    isManageRequest(){
      return this.$store.getters.charters('manageRequest')
    },
    isRoot(){
      return this.$store.getters.charters('root')
    },
    isDeleteRejected(){
      this.$store.getters.charters('deleteRejected')
    },
  },
  methods : {
    goToDocument(){
      this.$store.commit('setPage', 'document');
      this.$store.commit('setComponent', 'detail');
    },
    addByExist(){
      this.$confirm(`Вы уверены, что хотите создать новую заявку на основе данных заявки с ID - ${this.requestId} ?`).then(() => {
        this.$store.commit('setPage', 'request');
        this.$store.commit('setComponent', 'addByExist');
      }).catch(() => {});
    },
    editRequest() {
        this.$confirm(`Вы уверены, что хотите Редактировать заявку с ID - ${this.requestId} ?`).then(() => {
          this.$store.commit('setComponent', 'edit')
        }).catch(() => {});
    },
    deleteRequest() {
      if (this.requestStatus.status === 'created' || this.requestStatus.status === 'rejected'){
        this.$confirm(`Вы уверены, что хотите удалить заявку с ID - ${this.requestId} ?`).then(async() => {
          this.loading = true;
          let result = await this.$store.dispatch('query', {
            url: '/api/vicarious/request/delete',
            data: {
              id : this.requestId,
            }
          });
          if (result.status == 'success') {
            this.$store.commit('setComponentParams',{});
            this.$store.commit('setRequestState',   {});
            this.$store.commit('setGenDocument',    false);
            this.$store.commit('setCreatorId',      null);
            this.$store.commit('setResponsibleId',  null);
            this.$store.commit('setComponent',      'list')
            this.$store.commit('setMessage',        {text: result.message, header: 'Успешно!', type: 'success'});
          } else
            this.$store.commit('setMessage',        {text: result.message, header: 'Возникла проблема!', type: 'error'});
          this.loading = false;
        }).catch(() => {});
      } else
        this.$store.commit('setMessage',{header : `Текущий статус заявки - ${this.requestStatus.value}.`, text: 'Удалить возможно только заявку со статусом - "Заявка создана" или "Заявка отклонена"  !', type : 'warning'});
    },
    performRequest() {
      if (this.requestStatus.status === 'created'){
        this.$confirm(`Вы уверены, что хотите Принять в работу заявку с ID - ${this.requestId} ?`).then(async() => {
          this.loading = true;
          let result = await this.$store.dispatch('query',{
            url   : '/api/vicarious/request/set-work',
            data  : {
              id  : this.requestId,
            }
          });
          if(result.status == 'success') {
            this.$store.commit('setMessage', {text: result.message, header: 'Успешно!', type: 'success'});
            this.$store.commit('setResponsibleId', this.user_id);
            await this.getData();
            this.$store.commit('setRequestState', {status : result.request_status.en, value : result.request_status.rus});
          }else
            this.$store.commit('setMessage',{text : result.message,header : 'Возникла проблема!', type: 'error'});
          this.loading = false;
        }).catch(() => {});
      }else
        this.$store.commit('setMessage',{header : `Текущий статус заявки - ${this.requestStatus.value}.`, text: 'Принять в работу возможно только заявку со статусом - "Заявка создана" !', type : 'warning'});
    },
    rejectRequest() {
      this.reject = true;
      setTimeout(() => {window.scrollTo(0,15000)},0)
    },
    confirmRejectRequest() {
      if (this.comment) {
        this.$confirm(`Вы уверены, что хотите Отклонить заявку с ID - ${this.requestId} ?`).then(async () => {
          this.loading = true;
          let first_result = await this.$store.dispatch('query',{
            url    :  '/api/vicarious/request/set-reject',
            data   :   {
              id             : this.requestId,
              document_id    : this.documentId,
              solution       : false,
              reason         : this.comment,
            }
          });
          if (first_result.status == 'success') {
            this.$store.commit('setMessage', {text: first_result.message, header: 'Успешно!', type: 'success'});
            await this.getData();
            this.$store.commit('setRequestState', {status : first_result.request_status.en, value : first_result.request_status.rus});
            this.$store.commit('setSignature', 0);
          } else
            this.$store.commit('setMessage', {text: first_result.message, header: 'Возникла проблема с отклонением заявки!', type: 'error'});
          this.comment = '';
          this.reject  = false;
          this.loading = false;
        }).catch(() => {});
      } else this.errors.comment = 'Необходимо указать причину!'
    },
    cancelRejectRequest(){
      this.comment = '';
      this.reject  = false;
    },
    async getData() {
      this.loading = true;

      // ниже заполняем маппинг - перевод ангийских слов в русские
      this.$store.getters.queryType.forEach(el => {this.map[el.value] = el.label});
      this.$store.getters.queryTypeDocument.forEach(el => {this.map[el.value] = el.label});
      this.$store.getters.statusList.forEach(el => {this.map[el.value] = el.label});

      // список всех существующих функций
      let functions = await this.$store.dispatch('query',{url : '/api/vicarious/function/list',data : {}});
      if (functions.status == 'success'){
        this.functions = functions.data.map(el => {
          return {value : el.id[0].value, label : el.name[0].value};
        })
      }

      // ниже получаем ВСЮ информацию о заявке, зная ее ID
      let result = await this.$store.dispatch('query',{url : '/api/vicarious/request/get-edit',data : {id : this.requestId}});

      if(result.status == 'success') {

        // ниже закинуть в store  ID и имя документа,  documentStorageId
        if (result.data.document.length > 0 ) {
          this.$store.commit("setDocumentId", result.data.document[0].id);
          this.$store.commit("setDocumentName", result.data.document[0].name);
          this.$store.commit('setDocumentStorage', result.data.document[0].storage)
        } else {
          this.$store.commit("setDocumentId",null);
          this.$store.commit("setDocumentName",null);
          this.$store.commit('setDocumentStorage', null)
        }

        // ниже статус заявки, там ключи: status -английский вариант и value - русский вариант
        this.$store.commit('setRequestState', result.data.status[0]);

        // ниже метка того формировался ли проект документа в word
        this.$store.commit('setGenDocument', result.data.gen_document)

        // ниже метка того загружался ли в систему проект документа в word
        this.$store.commit("document_project", result.data.document_project);

        // ниже сам файл проекта документа - объект со всеми данными
        if(result.data.document_project)
            this.$store.commit('projectFile', result.data.project_files[0].value);
          else  this.$store.commit('projectFile', {});

        // ниже метка того на подписи заявка или нет
        this.$store.commit('setSignature', result.data.signature)

        // ниже кто создатель заявки и кто по ней ответственный
        this.$store.commit('setCreatorId', result.data.creator[0].value);
        if (result.data.responsible.length > 0) this.$store.commit('setResponsibleId', result.data.responsible[0].key);

        // ниже готовим данные для таблицы компонента showInfo

       // ниже функционал заявки
        let functions = [];
        result.data.functions.length > 0 ?
          result.data.functions.forEach(el => {this.functions.forEach(item => {item.value === el ? functions.push(item.label) : ''})}) :
          functions.push('Нет данных') ;

        //ниже причины отклонения или аннулирования документа
        let reason = '';
        if (this.requestStatus.status === 'rejected') reason = result.data.date_cancel + ', ' + result.data.who_cancel + ', ' + ' причина - '+ result.data.reason; else reason = '';

        // доп файлы у заявки
        let files = [];
        result.data.files.length > 0 ? files = result.data.files.map(el => {return el.value}) : files.push('Нет данных');
        //значение ключа value всегда должно быть массивом, иначе при отрисовки таблице в компаненте showInfo будет столько строк сколько букв в слове

        // ниже формируем сами таблицы для деталки
        this.show.table_1 = [
          {label_1 : 'Тип заявки',       value_1 : [this.map[result.data.type]],          label_2 : 'Дата создания заявки', value_2 : [result.data.created_at]},
          {label_1 : 'Тип доверенности', value_1 : [this.map[result.data.document_type]], label_2 : 'Дата принятия заявки', value_2 : [result.data.responsible_date]},
        ];

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

        this.show.table_2 =[
          {label : 'Заказчик',                           value : result.data.creator.map(el => {return  el.label +', ' + el.department +', ' + el.position})},
          {label : whoReceive === 'individual' ? 'Доверенное лицо' : 'Доверенная организация', value : usersToShow},
          {label : 'Ответственный',                      value : [result.data.responsible[0].value]},
          {label : 'Организация',                        value : [result.data.company.label]},
          {label : 'Функционал',                         value : functions},
          {label : 'Дата начала действия документа',     value : [result.data.date_start]},
          {label : 'Дата окончания действия документа',  value : [result.data.date_final]},
          {label : 'Причина отклонения / аннулирования', value : [reason]},
          {label : 'Комментарии',                        value : [result.data.comment]},
          {label : 'Дополнительные файлы (прошлые доверенности НЕ прикладывать)', value : files},
        ];
        //if (this.requestStatus.status === 'rejected'){this.show.table_2.splice(7,0, {label : 'Причина отклонения / аннулирования', value : [reason]});}

      } else
         this.$store.commit('setMessage', {text: result.message, header: 'Возникла проблема!', type: 'error'});
      this.loading = false;
      setTimeout(() => {window.scrollTo(0,15000)},0)
    },
  },
  created() {
    window.vicariousLoadFile = async function(id, fileName,type){
      try {
        let result = await this.$store.dispatch('query', {
          url             : '/api/vicarious/request/load-file',
          downloadRequest : true,
          data            : {id : id, type : type},
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
    this.getData();
  },
  watch :{
    'comment' : function(){
      this.errors.comment = null;
    },
  },
}
</script>
<style>
</style>


