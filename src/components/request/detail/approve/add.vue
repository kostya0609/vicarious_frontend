<template>
  <div v-loading="loading">
    <div >
      <h3>Согласование заявки</h3>

<!--      <el-row :gutter="24" class="mb15">-->
<!--        <el-col :span="6" ref="uploadCol">-->
<!--          <label>Дополнительные файлы</label>-->
<!--          <el-upload action="" ref="upload" :auto-upload="false" >-->
<!--            <el-button size="medium" icon="el-icon-download" :class="'fluid-button'" type="info"> Добавить файл</el-button>-->
<!--          </el-upload>-->
<!--        </el-col>-->
<!--        <el-col :span="18" ref="commentCol">-->
<!--          <label>Комментарий</label>-->
<!--          <el-input type="textarea" rows="4" v-model="queryData.comment" ></el-input>-->
<!--        </el-col>-->
<!--      </el-row>-->

      <b><label>Добавление согласующих:</label></b>
      <el-select
          v-model="approver"
          filterable
          remote
          reserve-keyword
          :placeholder="'Укажите согласующего'"
          :remote-method="searchApprover"
          :loading="loading"
          @change="addApprover"
      >
        <el-option
            v-for="item in approverFromSearch"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        >
        </el-option>
      </el-select>

      <el-table
          :data="showTable"
          style="width: 100%; margin-bottom: 15px">
        <el-table-column
            prop="label">
        </el-table-column>
        <el-table-column align="right">
          <template #default="scope">
            <el-button
                size="medium"
                type="danger"
                icon="el-icon-remove"
                @click="removeApprover(scope.$index)">Удалить</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div align="right">
        <el-button
            class="body-button"
            v-if="showTable.length > 0"
            @click="sendToApprove"
            icon="el-icon-check"
            type="info" >
          Отправить на согласование
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "requestDetailBusinessApproveAdd",
  data: function () {
    return {
      approver: {},
      approverFromSearch: [],
      showTable: [],
      queryData: {
        approver: [],
        comment: '',
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
    requestId() {
      return this.$store.getters.requestId
    },
  },
  methods: {
    addApprover() {
      if (this.queryData.approver.indexOf(this.approver) < 0) {
        this.queryData.approver.push(this.approver)
        this.approverFromSearch.forEach(el => {
          el.value === this.approver ? this.showTable.push({'label': el.label}) : ''
        })
      } else this.$store.commit('setMessage', {text: 'Выбранный согласующий был добавлен ранее! ', type: 'warning'});
      this.approver = '';
      this.approverFromSearch = [];
    },
    async searchApprover(query) {
      let url = '/api/vicarious/user/search';
      let result = await this.$store.dispatch('query', {url: url, data: {q: query}});
      if (result.status == 'success') {
        this.approverFromSearch = result.data;
      }
    },
    removeApprover(index) {
      this.showTable.splice(index, 1);
      this.queryData.approver.splice(index, 1);
    },
    async sendToApprove() {
      this.loading = true;
      let data = new FormData();
      data.append('request_id', this.requestId);
      data.append('coordinator_id', this.queryData.approver,);
      data.append('commment', this.queryData.comment,);
      // data.append('name', this.$store.getters.documentName + '_' + new Date().toLocaleDateString().split('.').join('_'));
      data.append('file[0]', this.$refs.upload.uploadFiles[0].raw);

      let result = await this.$store.dispatch('query', {
        url: '/api/vicarious/request/coordination-add',
        data: data,
        type: 'file'
      });

      if (result.status == 'success') {
        this.$store.commit('setMessage', {text: result.message, type: 'success'});
        this.$store.commit('setRequestState', {status: 'pending_agree', value: 'На согласовании'});
        this.$refs.upload.clearFiles();
      } else
        this.$store.commit('setMessage', {text: result.message, type: 'error'});
      this.loading = false;

    },
  },
}
</script>
