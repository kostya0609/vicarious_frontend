<template>
  <div v-loading="loading">
    <Grid name="access"/>
  </div>
</template>
<script>
export default {
  name : 'accessList',
  data : function (){
    return {
      grid : {
        filter      : {
          data     : {
            id              : {
              show : false,
              type : 'number',
              name : 'ID',
            },
            name            : {
              type     : 'list',
              name     : 'Название',
              multiple : true,
              option   : [],
            },
            created_at      : {
              type : 'date',
              name : 'Дата создания',
            },
          },
          filter   : function(data){
            this.filterData = data;
            this.getData();
          }.bind(this),
          clear    : function(){
            this.filterData = {};
            this.getData();
          }.bind(this),
        },
        context     : [
          {
            name : 'Удалить',
            function : function(row){
              this.$confirm(`Вы уверены, что хотите удалить привелегию - ${row.label[0].value} ?`).then(async() => {
                this.deleteCharter(row);
              }).catch(() => {});

            }.bind(this),
          },
        ],
        pagination  : {
          show : 'none'
        },
        header      : {
          id         : {
            name  : 'ID',
          },
          name       : {
            name  : 'Название',
            width : 200,
          },
          label      : {
            name  : 'Дополнение',
            width : 200,
          },
          note       : {
            name  : 'Примечания',
            width : 400,
          },
          created_at : {
            name  : 'Дата создания',
            width : 150,
          },
        },
        elements    : [],
      },
      filterData : {},
    };
  },
computed:{
  loading : {
    get : function(){
      return this.$store.getters.loading;
    },
    set : function(value){
      this.$store.commit('setLoading',value);
    }
  },
},
  methods : {
    async getData(){
      this.loading = true;
      this.grid.filter.data.name.option = [];
      let filter = await this.$store.dispatch('normalizeFilterData', this.filterData);

      let charter = await this.$store.dispatch('query',{ url : '/api/vicarious/charter/list' });
      if (charter.status == 'success') {
        this.grid.filter.data.name.option = charter.data.map(el => {
          return {value : el.name[0].value, label : el.label[0].value};
        })
      }

      //права на просмотр
      let charters = '';
      this.$store.getters.charters('root') ? charters = 'root' : charters = '';

      let result = await this.$store.dispatch('query',{
        url      : '/api/vicarious/charter/list',
        data     : {
          filter   : filter,
          charters : charters,
        },
      });
        if(result.status == 'success') {
        this.$grid.commit('normalizeElement',{name : 'access',data : {elements : result.data}});
            //ниже добавляются исходнные права которые нужны для работы программы (в случае если при первом запуске таблица прав пустая)
            if( Object.keys(filter).length == 0 && result.data.length == 0 ){
              let mokCharter = [
                {name : 'showAll',        note : 'Просмотр всех заявок и документов', label : 'showAll'},
                {name : 'showDocument',   note : 'Просмотр всех документов', label : 'showDocument'},
                {name : 'manageRequest',  note : 'Администрирование заявок', label : 'manageRequest'},
                {name : 'manageFunction', note : 'Администрирование функций', label : 'manageFunction'},
                {name : 'deleteRejected', note : 'Удаление отклоненных заявок', label : 'deleteRejected'},
                {name : 'root',           note : 'Администрирование групп пользователей и прав доступа', label : 'root'}
              ];
              for (let i = 0; i < mokCharter.length; i++ ) {
                await this.$store.dispatch('query',{url : '/api/vicarious/charter/add',data : mokCharter[i]});
              }
              result = await this.$store.dispatch('query',{
                url     : '/api/vicarious/charter/list',
                data    : { filter  : filter },
              });
              this.$grid.commit('normalizeElement',{name : 'access',data : {elements : result.data}});
            }
      } else
           this.$store.commit('setMessage',{text : 'Некорректный ответ сервера',header : 'Возникла проблема!',type: 'error'});
      this.loading = false;
    },
    async deleteCharter(row){

      let notDelete = ['showAll', 'showDocument', 'manageRequest', 'manageFunction', 'deleteRejected', 'root'];
      let charter = row.name[0].value
      if (notDelete.indexOf(charter) >= 0) {
        this.$store.commit('setMessage',{text : `Привелегию - ${charter} удалять запрещено!`,type : 'error'});
        return;
      }

      this.loading = true;
      let result = await this.$store.dispatch('query',{
        url : '/api/vicarious/charter/delete',
        data : {charter_id : row.id[0].value}
      });
      if(result.status == 'success') {
        this.getData();
        this.$store.commit('setMessage', {text: result.message, type: 'success'});
      }else
        this.$store.commit('setMessage',{text : result.message,type : 'error'});
      this.loading = false;
    },
  },
  created : function(){
    this.$grid.dispatch('createGrid', {name : 'access',data : this.grid});
    this.getData();
  },
}
</script>