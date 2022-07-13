<template>
  <div v-loading="loading">
    <Grid
        v-if="gridReady"
        name="function"
        v-event-bus:saveVisibleColumn="saveVisibleColumn"
        v-event-bus:saveOrderColumn="saveOrderColumn"
        v-event-bus:saveWidthColumn="saveWidthColumn"
        v-event-bus:onSort="onSort"
        v-event-bus:changeFilterProfile="changeFilterProfile"
    />
  </div>
</template>
<script>
export default {
  name : 'functionList',
  data : function (){
    return {
      grid       : {
        filter     : {
          data         : {
            id              : {
              show : false,
              type : 'number',
              name : 'ID',
            },
            name            : {
              type      : 'searchlist',
              name      : 'Название',
              multiple  : true,
              query     : async function (data){
                let result = await this.$store.dispatch('query',{
                  url   : '/api/vicarious/function/list',
                  data  :  {q : data}
                });
                if(result.status == 'success') {
                  let functions = result.data.map(el => {
                    return {value : el.id[0].value, label : el.name[0].value};
                  })
                  return functions
                }
              }.bind(this),
            },
            function        : {
              type     : 'list',
              name     : 'Тип функции',
              multiple : true,
              option   : this.$store.getters.function_type,
            },
            active          : {
              type     : 'list',
              name     : 'Активность',
              multiple : false,
              option   : [{value : [1], label : 'Активна'}, {value : [0], label : 'Не активна'}],
            },
            created_at      : {
              type : 'date',
              name : 'Дата создания',
            },
          },
          profiles     : [],
          showProfiles : true,
          filter       : function(data){
            this.filterData = data;
            this.$store.commit('setPaginationPage', 1)
            this.getData();
          }.bind(this),
          clear        : function(){
            this.filterData = {};
            this.getData();
          }.bind(this),
        },
        context    : [
          {
            name     : 'Редактировать',
            function : function(row){
              this.$store.commit('setComponent','edit');
              this.$store.commit('setComponentParams',row);
            }.bind(this),
          },
        ],
        pagination : {
          show        : 'full',
          page        : 1,
          defaultSize : 10,
          sizes       : [10,20,50],
          changeSize : function(value){
            this.$store.commit('setPaginationSize', value);
            this.$grid.commit('normalizePagination', {name : 'function', data : {pagination : {defaultSize : value}}})
            this.getData();
          }.bind(this),
          changePage : function(value){
            this.$store.commit('setPaginationPage', value);
            this.getData();
          }.bind(this)
        },
        header     : {
          id         : {
            name        : 'ID',
            width       : 100,
            contentSort : true,
          },
          sort       : {
            name        : 'Сортировка',
            width       : 100,
            contentSort : true,
          },
          name       : {
            name        : 'Название',
            width       : 450,
            contentSort : true,
          },
          text       : {
            name        : 'Текст в документе',
            width       : 600,
          },
          function   : {
            name        : 'Тип функции',
            width       : 250,
            contentSort : true,
          },
          active     : {
            name        : 'Активность',
            width       : 200,
            contentSort : true,
          },
          created_at : {
            name        : 'Дата создания',
            width       : 300,
            contentSort : true,
          },
          note       : {
            name  : 'Примечания',
            width : 600,
          },
        },
        elements   : [],
        name       : 'function',
      },
      filterData : {},
      sort       : {
        name : 'id',
        order : 'asc',
      },
      gridReady  : false,
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
      let filter = await this.$store.dispatch('normalizeFilterData', this.filterData);
      let result = await this.$store.dispatch('query',{
        url     : '/api/vicarious/function/list',
        data    : {
          count   : this.$store.getters.paginationSize,
          page    : this.$store.getters.paginationPage,
          filter  : filter,
          sort    : this.sort,
        }
      });
      if(result.status == 'success') {
        this.$grid.commit('normalizeElement',{name : this.grid.name,data : {elements : result.data}});
        this.$grid.commit('normalizePagination', {
          name : this.grid.name,
          data : {
            pagination : { page : this.$store.getters.paginationPage, ...result.pagination }
          }
        })
      }else
        this.$store.commit('setMessage',{text : 'Некорректный ответ сервера',header : 'Возникла проблема!',type: 'error'});
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

    async changeFilterProfile(data){
      this.loading = true;

      if (data.action === 'add') {
        let profilesToSave = [];
        this.grid.filter.profiles.push({name: data.name, data: data.data, id : data.id})

        this.grid.filter.profiles.forEach((el, idx) => {
          if (idx > 0) profilesToSave.push(el)
        })

        let result =  await this.$store.dispatch('query',{
          url  : '/api/vicarious/filter-preset',
          data : {
            grid   : data.grid,
            params : JSON.stringify(profilesToSave) ? JSON.stringify(profilesToSave) : '[]',
            type   : 'set',
          }
        });
        if(result.status == 'success')
          this.$store.commit('setMessage',{text: result.message, type : 'success'})
        else
          this.$store.commit('setMessage',{text : 'Некорректный ответ сервера', header : 'Возникла проблема!', type: 'error'});
      }

      if (data.action === 'remove') {
        let profilesToSave = [];
        this.grid.filter.profiles.splice(data.idx + 1, 1);

        this.grid.filter.profiles.forEach((el, idx) => {
          if (idx > 0) profilesToSave.push(el)
        })

        let result =  await this.$store.dispatch('query',{
          url  : '/api/vicarious/filter-preset',
          data : {
            grid   : data.grid,
            params : JSON.stringify(profilesToSave) ? JSON.stringify(profilesToSave) : '[]',
            type   : 'set',
          }
        });
        if(result.status == 'success')
          this.$store.commit('setMessage',{text: result.message, type : 'success'})
        else
          this.$store.commit('setMessage',{text : 'Некорректный ответ сервера', header : 'Возникла проблема!', type: 'error'});

      };

      if (data.action === 'change') {

        if (data.id === 0){
          this.grid.filter.data = Object.assign({}, this.grid.filter.profiles[0].data);
        } else {
          let needProfile = Object.assign({}, this.grid.filter.profiles.find(el => el.id === data.id)); // нашли нужный профиль который выбрал пользователь
          let needKey = Object.keys(needProfile.data) // список полей которые надо оставить у дефолтового фильтра и обновить сохраненными данными
          if (Object.keys(needProfile)){
            for (let key in this.grid.filter.data){
              if (needKey.includes(key) > 0){
                this.grid.filter.data[key] = {
                  ... this.grid.filter.data[key],
                  ... Object.assign({}, needProfile.data[key])
                }
              } else {
                this.grid.filter.data[key].show = false;
              }
            }// перебор нужного профиля и изменение дефолтового профиля под настройки выбранного профиля
          } // если результат поиска нужного профиля не undefined
        };

        this.$grid.commit('normalizeFilter', {name : this.grid.name, data :{ filter : this.grid.filter} });
      };

      this.loading = false;
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

      // загружаем профили фильтров
      this.grid.filter.profiles.push(
          {
            id   : 0,
            name : 'По умолчанию',
            data : Object.assign({}, this.grid.filter.data)
          }
      )

      result = await this.$store.dispatch('query',{
        url  : '/api/vicarious/filter-preset',
        data : {
          grid    : this.grid.name,
          type    : 'get',
        }
      });

      if(result.status === 'success' && result.data.length > 0) {
        let profiles = JSON.parse(result.data);
        profiles.forEach(el => {this.grid.filter.profiles.push(el)});
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