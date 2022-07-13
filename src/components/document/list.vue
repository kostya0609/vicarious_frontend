<template>
  <div v-loading="loading">
    <Grid
        v-if="gridReady"
        name="document"
        v-event-bus:saveVisibleColumn="saveVisibleColumn"
        v-event-bus:saveOrderColumn="saveOrderColumn"
        v-event-bus:saveWidthColumn="saveWidthColumn"
        v-event-bus:onSort="onSort"
        v-event-bus:changeFilterProfile="changeFilterProfile"
    />
  </div>
</template>
<script>

import  MJ  from "/src/test.js";
var MyJSON = new MJ();
export default {
  name : 'documentList',
  data : function (){
    return {
      grid : {
        filter     : {
          data         : {
            id              : {
              show : false,
              type : 'number',
              name : 'ID документа',
            },
            request_id      : {
              show : false,
              type : 'number',
              name : 'ID заявки',
            },
            usersIndividual : {
              show      : true,
              type      : 'searchlist',
              name      : 'Доверенное лицо',
              multiple  : true,
              query     : async function (data){
                let result = await this.$store.dispatch('query',{
                  url   : '/api/vicarious/user/search',
                  data  :  {q : data}
                });
                if(result.status == 'success') return result.data
              }.bind(this),
            },
            usersEntity     : {
              show      : false,
              type      : 'searchlist',
              name      : 'Доверенная организация',
              multiple  : true,
              query     : async function (data){
                let result = await this.$store.dispatch('query',{
                  url   : '/api/vicarious/company/search',
                  data  :  {q : data}
                });
                if(result.status == 'success') return result.data
              }.bind(this),
            },
            company_id      : {
              show      : true,
              type      : 'searchlist',
              name      : 'Организация',
              multiple  : true,
              query     : async function (data){
                let result = await this.$store.dispatch('query',{
                  url   : '/api/vicarious/company/search',
                  data  :  {q : data}
                });
                if(result.status == 'success') return result.data
              }.bind(this),
            },
            name            : {
              show      : true,
              type      : 'searchlist',
              name      : 'Номер документа',
              multiple  : true,
              query     : async function (data){
                let result = await this.$store.dispatch('query',{
                  url   : '/api/vicarious/request/document-search',
                  data  :  {q : data}
                });
                if(result.status == 'success') return result.data
              }.bind(this),
            },
            document_type   : {
              show     : true,
              type     : 'list',
              name     : 'Тип доверенности',
              multiple : true,
              option   : this.$store.getters.queryTypeDocument,
            },
            status          : {
              show     : true,
              type     : 'list',
              name     : 'Статус',
              multiple : true,
              option   : this.$store.getters.queryStatusDocument,
            },
            created_at      : {
              show : false,
              type : 'date',
              name : 'Дата создания',
            },
            document_start  : {
              show : false,
              type : 'date',
              name : 'Дата начала действия документа',
            },
            document_final  : {
              show : false,
              type : 'date',
              name : 'Дата окончания действия документа',
            },
            functions       : {
              show      : false,
              type      : 'searchlist',
              name      : 'Функционал документа',
              multiple  : true,
              query     : async function (data){
                let result = await this.$store.dispatch('query',{
                  url   : '/api/vicarious/function/search',
                  data  :  {q : data}
                });
                if(result.status == 'success') {
                  let functions = result.data.map(el => {
                    return {value : el.value, label : el.label};
                  })
                  return functions
                }
              }.bind(this),
              focus     : async function (){
                let result = await this.$store.dispatch('query',{
                  url   : '/api/vicarious/function/list',
                  data  :  {sort: {name: "sort", order: "asc"}}
                });
                if(result.status == 'success') {
                  let functions = result.data.map(el => {
                    return {value : el.id[0].value, label : el.name[0].value};
                  })
                  return functions
                }
              }.bind(this),

            },
            storage_id      : {
              type     : 'list',
              name     : 'Хранение оригинала',
              multiple : true,
              show     : false,
              option   : [],
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
            name      : 'Открыть документ',
            function  : function (row) {
              this.$store.commit('setDocumentId', row.id[0].value)
              this.$store.commit('setRequestId',  row.request_id[0].value)
              this.$store.commit('setComponent', 'detail');
            }.bind(this)
          },
          {
            name      : 'Копировать данные в новую заявку',
            function  :  function (row) {
              this.$store.commit('setDocumentId', row.id[0].value)
              this.$store.commit('setRequestId',  row.request_id[0].value)
                this.$confirm(`Вы уверены, что хотите создать новую заявку на основе данных заявки с ID - ${this.requestId} ?`).then(() => {
                  this.$store.commit('setPage', 'request');
                  this.$store.commit('setComponent', 'addByExist');
                }).catch( () => {} );
            }.bind(this)
          },
        ],
        pagination : {
          show        : 'full',
          page        : 1,
          defaultSize : 10,
          sizes       : [10,20,50],
          changeSize : function(value){
            this.$store.commit('setPaginationSize', value);
            this.$grid.commit('normalizePagination', {name : 'document', data : {pagination : {defaultSize : value}}})
            this.getData();
          }.bind(this),
          changePage : function(value){
            this.$store.commit('setPaginationPage', value);
            this.getData();
          }.bind(this)
        },
        header     : {
          id              : {
            name   : 'ID документа',
            width  : 150,
            contentSort : true,
          },
          name              : {
            name   : 'Номер документа',
            width  : 200,
            contentSort : true,
          },
          request_id      : {
            name   : 'ID заявки',
            width  : 150,
            contentSort : true,
          },
          users            : {
            name  : 'Пользователи документа',
            width : 300,
          },
          company         : {
            name   : 'Организация',
            width  : 200,
          },
          document_type   : {
            name   : 'Тип доверенности ',
            width  : 200,
            contentSort : true,
          },
          status          : {
            name   : 'Статус',
            width  : 150,
            contentSort : true,
          },
          created_at      : {
            name  : 'Дата создания',
            width : 200,
            contentSort : true,
          },
          document_start  : {
            name  : 'Начало действия документа',
            width : 250,
            contentSort : true,
          },
          document_final  : {
            name  : 'Окончание действия документа',
            width : 300,
            contentSort : true,
          },
          file            : {
            name  : 'Сканы документов',
            width : 250,
          },
          functions        : {
            name  : 'Функционал документа',
            width : 300,
          },
          storage_id      : {
            name  : 'Хранение оригинала',
            width : 250,
            contentSort : true,
          },
        },
        elements   : [],
        name       : 'document',
      },

      filterData : {},
      sort       : {
        name : 'id',
        order : 'desc',
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
    requestId(){
      return this.$store.getters.requestId;
    },
  },
  methods : {
    async getData(){
      this.loading = true;
      this.grid.filter.data.storage_id.option = [];

      let filter = await this.$store.dispatch('normalizeFilterData', this.filterData);

      // ниже получаем список всех возможных мест хранения оригинала для фильтра
      let result = await this.$store.dispatch('query',{ url : '/api/vicarious/storage/list' });
      if (result.status == 'success') {
        this.grid.filter.data.storage_id.option = result.data.map(el => {
          return {value : el.id, label : el.name};
        })
      }

      let charters = {
        showAll          : '',
        showDocument     : '',
        user             : [],
        company          : [],
        department       : [],
        department_child : [],
      };
      this.$store.getters.charters('showAll') ? charters.showAll = 'showAll' : charters.showAll = '';
      this.$store.getters.charters('showDocument') ? charters.showDocument = 'showDocument' : charters.showDocument = '';

      let individuals = this.$store.getters.individuals;
      individuals.forEach( el => {
        if (el.name && el.detail) charters[el.name].push(el.detail)
      })

      result = await this.$store.dispatch('query',{
        url  : '/api/vicarious/request/document-list',
        data : {
          count    : this.$store.getters.paginationSize,
          page     : this.$store.getters.paginationPage,
          filter   : filter,
          charters : charters,
          sort     : this.sort,
        }
      });

      if(result.status == 'success') {
        this.$grid.commit('normalizeElement',{name : this.grid.name, data : {elements : result.data}});
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
      function setShowValue(data){
        this.grid.header[data.key].show = data.show;
        if (this.grid.header[data.key].child instanceof Array) {
          this.grid.header[data.key].child.forEach((el, idx) => {
            let newData = {
              key  :  this.grid.header[data.key].child[idx],
              show :  data.show,
            }
            setShowValue.call(this, newData);
          }) // перебор массива child
        }//if
      };

      setShowValue.call(this, data);

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
      if(result.status == 'success' && result.data.length > 0) {
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
  created : function(){
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
    this.initGrid();
  },
}
</script>