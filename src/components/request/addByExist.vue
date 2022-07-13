<template>
  <div class="body-wrapper" v-loading="loading">
    <el-button
        class="body-button body-button-color"
        size="medium"
        type="info"
        icon="el-icon-back"
        @click.prevent="toBack">
      Вернуться к просмотру
    </el-button>
    <el-card class="component-wrapper" >
      <h3>Создание новой заявки</h3>
      <el-row :gutter="24" class="mb15">
        <el-col :span="8">
          <label>Тип заявки</label>
          <el-select
              v-model="queryData.type"
              placeholder="Тип заявки"
              @change="queryTypeChange(queryData.type)">
            <el-option
                v-for="item in queryType"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="8">
          <label>Тип доверенности</label>
          <el-select
              v-model="queryData.documentType"
              placeholder="Тип доверенности"
              @change="queryTypeDocumentChange(queryData.documentType)">
            <el-option
                v-for="item in queryTypeDocument"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
        </el-col>
      </el-row>
      <el-row :gutter="24" class="mb15">
        <el-col :span="8">
          <label>Организация, выдающая доверенность</label>
          <el-select
              v-model="queryData.company"
              filterable
              remote
              reserve-keyword
              placeholder="Укажите организацию"
              :remote-method="searchGiveCompany"
              :loading="loading"
              :disabled="queryData.type == 'personal'"
              @change="clearSelectSearch('company_search')"
              :ref="'company_search'"
              :class="errors.company ? 'invalid' : ''"
          >
            <el-option
                v-for="item in company"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
          <small v-if="errors.company">{{ errors.company }}</small>
        </el-col>
      </el-row>
      <el-row :gutter="24" class="mb15">
        <el-col :span="8">
          <label>Кто получает доверенность</label>
          <el-radio-group v-model="whoReceive" @change="whoReceiveChange" fill="#909399">
            <el-radio-button label="Пользователь"></el-radio-button>
            <el-radio-button label="Организация" :disabled="queryData.type == 'personal'"></el-radio-button>
          </el-radio-group>
        </el-col>
        <el-col :span="8">
          <label>{{ whoReceive === 'Пользователь' ? 'Получает пользователь' : 'Получает организация' }}</label>
          <el-select
              v-model="queryData.users"
              :multiple="isMultipleUser"
              filterable
              remote
              reserve-keyword
              :placeholder="whoReceive==='Пользователь' ?  'Укажите ФИО' : 'Укажите организацию'"
              :remote-method="whoReceive==='Пользователь' ? searchReceiveUser : searchReceiveCompany"
              :loading="loading"
              :disabled="queryData.type == 'personal'"
              @change="clearSelectSearch('user_search')"
              :ref=" 'user_search'"
              :class="errors.users ? 'invalid' : ''"
          >
            <el-option
                v-for="item in users"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
          <small v-if="errors.users">{{ errors.users }}</small>
        </el-col>
      </el-row>
      <el-row :gutter="24" class="mb15">
        <el-col :span="8">
          <label>Период действия документа</label>
          <el-date-picker
              :class="errors.dateStart || errors.date  ? 'invalid' : ''"
              v-model="queryData.dateStart"
              type="date"
              format="dd.MM.yyyy"
              value-format="dd.MM.yyyy"
              placeholder="Начало действия документа"
              :picker-options="{ firstDayOfWeek: 1 }"
          >
          </el-date-picker>
          <small v-if="errors.date">{{ errors.date }}</small>
          <small v-if="errors.dateStart">{{ errors.dateStart }}</small>
        </el-col>
        <el-col :span="8">
          <label><br/></label>
          <el-date-picker
              :class="errors.dateFinal || errors.date ? 'invalid' : ''"
              v-model="queryData.dateFinal"
              type="date"
              format="dd.MM.yyyy"
              value-format="dd.MM.yyyy"
              placeholder="Окончание действия документа"
              :picker-options="{ firstDayOfWeek: 1 }"
          >
          </el-date-picker>
          <small v-if="errors.dateFinal">{{ errors.dateFinal }}</small>
        </el-col>
      </el-row>
      <el-row :gutter="24" class="mb15">
        <el-col :span="8">
          <label>Функционал</label>
          <el-select
              v-model="queryData.functions"
              placeholder="Функционал"
              multiple
              :class="errors.functions ? 'invalid' : ''"
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
          <small v-if="errors.functions">{{ errors.functions }}</small>
        </el-col>
        <el-col :span="8" ref="commentCol">
          <label>Комментарий</label>
          <el-input
              type="textarea"
              rows="1"
              v-model="queryData.comment"
              >
          </el-input>
        </el-col>
      </el-row>
      <el-row :gutter="24" class="mb15">
        <el-col :span="8" ref="uploadCol">
          <label>Дополнительные файлы (прошлые доверенности НЕ прикладывать)</label>
          <el-upload
              action=""
              ref="upload"
              :auto-upload="false"
              :file-list="queryData.file_exists"
              :on-change="fileChange"
              :on-remove="fileRemove">
            <el-button
                size="medium"
                icon="el-icon-download"
                class="fluid-button"
                type="info"
                @click="errors.functions=null"
            >
              Добавить файл
            </el-button>
          </el-upload>
        </el-col>
        <el-col :span="8">
          <label><br/></label>
        </el-col>
        <el-col :span="8">
          <label><br/></label>
          <el-button
              @click="saveForm"
              size="medium"
              icon="el-icon-upload"
              :class="'fluid-button'"
              type="primary">
            Отправить заявку
          </el-button>
        </el-col>
      </el-row>
    </el-card>
    <el-row :gutter="24" class="mb15">
      <el-col :span="24">
        <br>
        <el-link href="https://bitrix.bsi.local/knowledge/instrukcii/korportal/doverrennosti/" target="_blank"  type="danger" icon="el-icon-reading">Ознакомиться с инструкцией</el-link>
      </el-col>
    </el-row>
    <div class="context-menu-wrapper" v-if="functionsDetail.show">
      <div class="context-menu-element" v-if="functionsDetail.note"> <h4>Примечание</h4> {{functionsDetail.note}}</div>
      <div class="context-menu-element" v-if="functionsDetail.text"> <h4>Описание  </h4> {{functionsDetail.text}}</div>
    </div>
  </div>
</template>
<script>
export default {
  name: "requestEdit",
  data(){
    return {
      functionsDetail : {
        show : false,
        text : '',
        note : '',
      },
      oldDocumentTypeValue     : '',
      isMultipleUser           : false,
      whoReceive               : '',
      users                    : [],
      usersSelected            : [],
      company                  : [],
      companySelected          : [],
      functions                : [],
      errors                   : {},
      queryData       : {
        type          : '',
        users         : null,
        company       : '',
        documentType  : '',
        dateStart     : '',
        dateFinal     : '',
        functions     : [],
        comment       : '',
        file          : [],
        file_save     : [],
        file_exists   : [],
        isFile        : false,
      },
    }
  },
  computed: {
    loading: {
      get: function () {
        return this.$store.getters.loading;
      },
      set: function (value) {
        this.$store.commit('setLoading', value)
      }
    },
    queryTypeDocument() {
      return this.$store.getters.queryTypeDocument;
    },
    queryType (){
      return this.$store.getters.queryType;
    },
    requestId() {
      return this.$store.getters.requestId;
    },
  },
  methods: {
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
          menu.style.left = this.$refs.selectFunction.$el.offsetWidth  + 60 + 'px';
          if (clientClick.y < this.$refs.selectFunction.$el.getBoundingClientRect().y)  menu.style.top =  - 426 - this.$refs.commentCol.$el.clientHeight + 68  - this.$refs.uploadCol.$el.clientHeight + 59 + 'px';
          else  menu.style.top =  - 102 - this.$refs.commentCol.$el.clientHeight + 68 - this.$refs.uploadCol.$el.clientHeight + 59 + 'px';
        });
      } else {
        this.functionsDetail.show = false;
        this.functionsDetail.text = '';
        this.functionsDetail.note = '';
      }
    },
    toBack(){
      this.$store.commit('setPage', this.$store.getters.previousPage);

      this.$store.commit('setComponent', 'detail');
    },
    clearSelectSearch(key) {
      this.$refs[key].query = '';
      this.$forceUpdate()
    },
    searchReceiveUser(query) {
      if (query !== '')
        this.search(query, 'receiveUser');
    },
    searchReceiveCompany(query) {
      if (query !== '')
        this.search(query, 'receiveCompany');
    },
    searchGiveCompany(query) {
      if (query !== '')
        this.search(query, 'giveCompany');
    },
    async search(query, key) {
      let url, obj;
      if (key == 'receiveUser') {
        obj = 'users';
        url = '/api/vicarious/user/search';
      }
      if (key == 'receiveCompany') {
        obj = 'users';
        url = '/api/vicarious/company/search';
      }
      if (key == 'giveCompany') {
        obj = 'company';
        url = '/api/vicarious/company/search';
      }
      let result = await this.$store.dispatch('query', {url: url, data: {q: query}});
      if (result.status == 'success') {
        this[obj] = result.data;
        // ниже код чтоб добавить в лист выбранные ранее позиции
        this[obj + 'Selected'].forEach(el => {
          let notExists = true
          this[obj].forEach(item => item.value == el.value ? notExists = false : '');
          notExists ? this[obj].push(el) : '';
        });
      }
    },
    async getSaveData() {
      this.loading = true;
      this.company = [];
      let functions = await this.$store.dispatch('query', {url: '/api/vicarious/function/list', data: {}});
      if (functions.status == 'success') {
        this.functions = functions.data.map(el => {
          return {value: el.id[0].value, label: el.name[0].value, text : el.text[0].value, note : el.note[0].value};
        })
      }
      let result = await this.$store.dispatch('query', {
        url   : '/api/vicarious/request/get-edit',
        data  : {id: this.requestId}
      });
      if (result.status == 'success') {
        result.data.receiver === 'individual' ? this.whoReceive = 'Пользователь' : this.whoReceive = 'Организация'
        this.users = result.data.users;
        this.company.push(result.data.company);
        let currentUsers = null;
        if (result.data.documentType === 'notarial' && result.data.type !== 'personal') {
          this.isMultipleUser = true;
          currentUsers = result.data.users.map(el => {return el.value});
        } else {
          this.isMultipleUser = false;
          currentUsers = result.data.users.length > 0 ? result.data.users[0].value : '' ;
        }
        let dateStartlOld    = new Date(result.data.date_start.split('.').reverse().join('.'));
        let secondStartOld   = dateStartlOld.getTime();
        let dateFinalOld     = new Date(result.data.date_final.split('.').reverse().join('.'));
        let secondFinalOld   = dateFinalOld.getTime();
        let delta            = secondFinalOld - secondStartOld;
        let secondStartNew   = secondFinalOld + 3600*24*1000; // добавил сутки
        let secondFinalNew   = secondStartNew + delta;
        let dateStartNew     = new Date(secondStartNew).toLocaleDateString();
        let dateFinalNew     = new Date(secondFinalNew).toLocaleDateString();

        this.queryData = {
          type            : result.data.type,
          company         : result.data.company.value,
          documentType    : result.data.document_type == 'only' ? 'special' : result.data.document_type,
          users           : currentUsers,
          dateStart       : dateStartNew,
          dateFinal       : dateFinalNew,
          functions       : result.data.functions,
          comment         : result.data.comment,
          file_save       : result.data.files,
          file_exists     : result.data.files,// в случае если ранее приложенные файлы нужны
          file            : [],
        }
         if (result.data.type === 'personal') this.getPersonalData();
      } else
        this.$store.commit('setMessage', {text: result.message, header: 'Возникла проблема!', type: 'error'});
      this.loading = false;
    },
    async getPersonalData() {
      this.loading = true;
      let result = await this.$store.dispatch('query', {url: '/api/vicarious/user/get-for-request', data: {}});
      if (result.status == 'success') {
        if (result.data.user.value){
          this.queryData.users = result.data.user.value;
          this.users = [];
          this.users.push(result.data.user);
        }
        this.queryData.company = result.data.company.value;
        this.company = [];
        this.company.push(result.data.company);
      }
      this.loading = false;
    },
    fileChange(file, fileList) {
      this.queryData.file.push(file.raw)
    },
    fileRemove(file) {
      this.queryData.file_save = this.queryData.file_save.filter(el => el.uid !== file.uid)
      this.queryData.file = this.queryData.file.filter(el => el.uid !== file.uid)
    },
    async saveForm() {
      if (this.$refs.upload.uploadFiles.length > 0)  this.queryData.isFile = true;
      else this.queryData.isFile = false;

      this.errors = await this.$store.dispatch('formIsValid', {queryData : this.queryData});
      if (Object.keys(this.errors).length === 0) {
          let result;
          this.loading = true;
          if (this.queryData.file.length) {
            let data = new FormData();
            data.append('type',         this.queryData.type);
            data.append('documentType', this.queryData.documentType);
            data.append('dateStart',    this.queryData.dateStart);
            data.append('dateFinal',    this.queryData.dateFinal);
            data.append('comment',      this.queryData.comment);
            data.append('company',      this.queryData.company);
            this.whoReceive === 'Пользователь' ? data.append('receiver', 'individual') : data.append('receiver', 'entity');

            for (let i = 0; i < this.queryData.file.length; i++) {
              data.append('file[' + i + ']', this.queryData.file[i]);
            }
            for (let i = 0; i < this.queryData.file_save.length; i++) {
              data.append('file_save[' + i + ']', this.queryData.file_save[i].id);
            }

            if (this.queryData.users instanceof Array) {
              for (let i = 0; i < this.queryData.users.length; i++) {
                data.append('users[' + i + ']', this.queryData.users[i]);
              }
            } else
              data.append('users['+0+']', this.queryData.users);
            for (let i = 0; i < this.queryData.functions.length; i++) {
              data.append('functions[' + i + ']', this.queryData.functions[i]);
            }
            result = await this.$store.dispatch('query', {
              url   : '/api/vicarious/request/add',
              data  : data,
              type  : 'file'
            });
          } else {
            this.queryData.file_save = this.queryData.file_save.map(el => el.id);
            this.whoReceive === 'Пользователь' ? this.queryData.receiver = 'individual' : this.queryData.receiver = 'entity';
            result = await this.$store.dispatch('query', {
              url   : '/api/vicarious/request/add',
              data  : this.queryData
            });
          }
          if (result.status == 'success') {
            this.$store.commit('setMessage', {text: result.message, header: 'Успешно!', type: 'success'});
          } else
            this.$store.commit('setMessage', {text: result.message, header: 'Возникла проблема!', type: 'error'});
          this.loading = false;
        this.$store.commit('setPage', 'request')
        this.$store.commit('setComponent','list');
      }//if isValid
    },
    queryTypeChange(value){
      if (value === 'complex' && this.queryData.documentType !== 'notarial') {
        this.queryData.users     = '';
        this.isMultipleUser      = false;
        this.usersSelected       = [];
        this.queryData.company   =  '';
      }
      if (value === 'complex' && this.queryData.documentType === 'notarial') {
        this.queryData.users     = '';
        setTimeout(() => {
          this.queryData.users   = [];
          this.isMultipleUser    = true
        }, 0);
        this.queryData.company = '';
      }
      if (value === 'personal') {
        this.whoReceive         = 'Пользователь';
        this.users              = [];
        this.usersSelected      = [];
        this.company            = [];
        this.queryData.users    = '';
        this.isMultipleUser     = false;
        this.getPersonalData();
      }
    },
    queryTypeDocumentChange(newValue){
      let oldValue=this.oldDocumentTypeValue;
      if (newValue === 'notarial' && this.queryData.type !== 'personal') {
        let old = this.queryData.users;
        this.queryData.users = '';
        setTimeout(() => {
          old ? this.queryData.users = [old] : this.queryData.users = [];
          this.isMultipleUser = true
        }, 0);
        old ? this.usersSelected = [old] : ''
      }
      if (oldValue === 'notarial' && this.queryData.type !== 'personal') {
        let old;
        this.queryData.users[0] ? old = this.queryData.users[0] : '';
        this.queryData.users    = [];
        setTimeout(() => {
          this.isMultipleUser   = false;
          this.queryData.users  = old;
        }, 0)
        this.usersSelected      = [old];
      }
    },
    whoReceiveChange(){
      this.queryData.users      = null;
      this.users                = [];
      this.usersSelected        = [];
      this.errors.functions     = null;
    },
  },
  created() {
    this.getSaveData();
  },
// при создании формы идет получение данных и меняются значения перменных и это приводит к ненужной сработке вотчеров.
// поэтому вместо вотчеров были использованы методы change у этих selectов.
  watch: {
    'queryData.documentType': function (oldValue) {
      this.oldDocumentTypeValue = oldValue; // старое значение нужно чтоб потом правильно принимать решение в методе change у этого selecta
      this.errors.documentType  = null;
    },
    'queryData.users': function (value) {
      this.errors.users = null;
      if (value instanceof Array) {
        // ниже чтоб добавить в userSelected то что выбрано в элементе ввода и проверить что их не было ранее добавлено
        this.users.forEach(el => {
          if (value.indexOf(el.value) >= 0) {
            let notExists = true;
            this.usersSelected.forEach(item => item.value === el.value ? notExists = false : '');
            notExists ? this.usersSelected.push(el) : '';
          }
        });
        //ниже чтоб убрать из userSelected тех кого удалили в элементе ввода
        let arr = [];
        this.usersSelected.forEach(el => value.indexOf(el.value) >= 0 ? arr.push(el) : '');
        this.usersSelected = arr;
      }
    },
    'queryData.company': function (value) {
      this.errors.company = null;
      value ? this.companySelected.push(value) : '';
    },
    'queryData.functions': function () {
      this.errors.functions = null;
    },
    'queryData.comment' : function(){
      this.errors.functions = null;
    },
    'queryData.dateStart': function () {
      this.errors.date      = null;
      this.errors.dateStart = null;
    },
    'queryData.dateFinal': function () {
      this.errors.date      = null;
      this.errors.dateFinal = null;
    },
  },
}
</script>
<style>
</style>
