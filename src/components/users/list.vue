<template>
  <div v-loading="loading">
    <Grid
        v-if="gridReady"
        name="users"
        v-event-bus:saveVisibleColumn="saveVisibleColumn"
        v-event-bus:saveOrderColumn="saveOrderColumn"
        v-event-bus:saveWidthColumn="saveWidthColumn"
        v-event-bus:onSort="onSort"
        />
  </div>
</template>
<script>
export default {
  name : 'usersList',
  data : function (){
    return {

      grid : {
        filter     : {
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
            users           : {
              type      : 'searchlist',
              name      : 'Пользователи',
              multiple  : true,
              query     : async function (data){
                let result = await this.$store.dispatch('query',{
                  url   : '/api/vicarious/user/search',
                  data  :  {q : data}
                });
                if(result.status == 'success') return result.data
              }.bind(this),
            },
            charter         : {
              type     : 'list',
              name     : 'Права',
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
        context    : [
          {
            name : 'Редактировать',
            function : function(row){
              this.$store.commit('setComponent','connect');
              this.$store.commit('setComponentParams',row);
            }.bind(this),
          },
          {
            name : 'Удалить',
            function : function(row){
              this.$confirm(`Вы уверены, что хотите удалить группу - ${row.name[0].value} ?`).then(async() => {
                this.deleteRole(row);
              }).catch(() => {});
            }.bind(this),
          },
        ],
        pagination : {
          show : 'false'
        },
        header     : {
          id      : {
            name        : 'ID',
            width       : 100,
            contentSort : true,
          },
          name    : {
            name  : 'Название',
            width : 200,
            child : ['users']
          },
          users   : {
            name  : 'Пользователи',
            width : 300
          },
          charter : {
            name  : 'Права',
            width : 300,
          },
          note    : {
            name  : 'Примечания',
            width : 300,
          },
          created_at : {
            name        : 'Дата создания',
            width       : 300,
            contentSort : true,
          },

        },
        elements   : [],
        name       : 'users',
      },

      filterData    : {},
      sort          : {
        name : 'id',
        order : 'asc',
      },
      gridReady     : false,
    };
  },
  computed:{
    loading : {
      get : function(){
        return this.$store.getters.loading;
      },
      set : function(value){
        this.$store.commit('setLoading',value)
      }
    },
  },
  methods : {
    async getData(){
      this.loading = true;
      this.grid.filter.data.name.option    = [];
      this.grid.filter.data.charter.option = [];

      let filter = await this.$store.dispatch('normalizeFilterData', this.filterData);

      let charter = await this.$store.dispatch('query',{ url : '/api/vicarious/charter/list' });
      if (charter.status == 'success') {
        this.grid.filter.data.charter.option = charter.data.map(el => {
           return {value : el.id[0].value, label : el.name[0].value};
          })
      }
      //права на просмотр
      let charters = '';
      this.$store.getters.charters('root') ? charters = 'root' : charters = '';

      let result = await this.$store.dispatch('query',{
        url      : '/api/vicarious/role/list',
        data     : {
          filter   : filter,
          sort     : this.sort,
          charters : charters,
        },
      });

      if(result.status == 'success') {
        this.grid.filter.data.name.option = result.data.map(el => {
           return {value : el.name[0].value, label : el.name[0].value};
        })
        this.$grid.commit('normalizeElement',{name : 'users',data : {elements : result.data}});

        //ниже добавляются исходнные роли которые нужны для работы программы (в случае если при первом запуске таблица ролей пустая)
        if( Object.keys(filter).length == 0 && result.data.length == 0 ){
          let mokRole = [
            {name : 'superUser',            note : 'Полный доступ'},
            {name : 'requestResponsible',   note : 'Ответственные за заявки'},
            {name : 'functionManager',      note : 'Управление функциями'},
            {name : 'rejectRemover',        note : 'Удаление отклоненных заявок'},
            {name : 'showDocument',         note : 'Просмотр всех документов'}
          ];
          for (let i = 0; i < mokRole.length; i++ ) {
            await this.$store.dispatch('query',{url : '/api/vicarious/role/add',data : mokRole[i]});
          }
          result = await this.$store.dispatch('query',{
            url     : '/api/vicarious/role/list',
            data    : { filter  : filter},
          });
          this.$grid.commit('normalizeElement',{name : this.grid.name, data : {elements : result.data}});
        }
      } else
        this.$store.commit('setMessage',{text : 'Некорректный ответ сервера',header : 'Возникла проблема!',type: 'error'});
      /////////////// конец добавления исходных данных //////////////
      this.loading = false;
    },
    async deleteRole(row){

      let notDelete = ['superUser', 'requestResponsible', 'functionManager', 'rejectRemover','showDocument'];
      let role = row.name[0].value
      if (notDelete.indexOf(role) >= 0) {
        this.$store.commit('setMessage',{text : `Группу - ${role} удалять запрещено!`,type : 'error'});
        return;
      }

      this.loading = true;
      let result = await this.$store.dispatch('query',{
        url : '/api/vicarious/role/delete',
        data : {role_id : row.id[0].value}
      });
      if(result.status == 'success') {
        this.getData();
        this.$store.commit('setMessage', {text: result.message, type: 'success'});
      }else
        this.$store.commit('setMessage',{text : result.message,type : 'error'});
      this.loading = false;
    },

    onSort(data){
      this.sort.name = data.key;
      if (this.sort.name === data.key)
        this.sort.order === 'asc' ? this.sort.order = 'desc' : this.sort.order = 'asc';
      else
        this.sort.order = 'desc';
      this.getData();
    },

    saveVisibleColumn(data){
      this.grid.header[data.key].show = data.show;
      this.setHeaderParams();
    },

    saveWidthColumn(data){
      this.grid.header[data.key].width = data.width;
      this.setHeaderParams();
    },

    saveOrderColumn(data){
      data.data.forEach(el => {
        let key = el.key, sort=el.params.sort;
        this.grid.header[key].sort = sort;
      });
      this.setHeaderParams();
    },

    async setHeaderParams(){
      let keys = Object.keys(this.grid.header);
      let headerParams = keys.map(el => {
        let show;
        ('show' in this.grid.header[el]) ? show = this.grid.header[el].show : show = true;
        return {key : el, width : this.grid.header[el].width , show : show, sort : this.grid.header[el].sort}
      })
      let result = await this.$store.dispatch('query',{
        url  : '/api/vicarious/setting',
        data : {
          grid    : this.grid.name,
          params  : JSON.stringify(headerParams),
          type    : 'set',
        }
      });
      if(result.status == 'success')
        this.$store.commit('setMessage',{text: result.message, type : 'success'})
      else
        this.$store.commit('setMessage',{text : 'Некорректный ответ сервера', header : 'Возникла проблема!', type: 'error'});
    },

    async initGrid(){
      this.loading = true;
      let result = await this.$store.dispatch('query',{
        url  : '/api/vicarious/setting',
        data : {
          grid    : this.grid.name,
          type    : 'get',
        }
      });
      if(result.status == 'success' && result.data.length>0) {
        let headerParams = JSON.parse(result.data[0]);
        headerParams.forEach(el => {
          if ( el.key in this.grid.header) {
            this.grid.header[el.key].show = el.show;
            this.grid.header[el.key].width = el.width;
            this.grid.header[el.key].sort = el.sort;
          }
        });
      }
      if(result.status !== 'success')
        this.$store.commit('setMessage',{text : 'Некорректный ответ сервера', header : 'Возникла проблема!', type: 'error'});

      this.$grid.dispatch('createGrid', {name : this.grid.name, data : this.grid});

      await  this.getData();

      this.gridReady = true;

      this.loading = false;
    },

  },
  created(){
    this.initGrid();
  },
}
</script>
