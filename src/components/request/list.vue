<template>
  <div v-loading="loading">
    <Grid
        v-if="gridReady"
        name="request"
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
  name : 'requestList',
  data : function (){
    return {
      grid       : {
        filter      : {
          data         : {
            id              : {
              show : false,
              type : 'number',
              name : 'ID',
            },
            usersIndividual : {
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

              // ниже строчка которая нужна для грида в компаненте фильтрации в searchlist в методе search взамен  await this.value.query(query);
              // await this.value.query(query) ? this.value.option = await this.value.query(query) : '';

              // ниже код который был бы нужен если не менять в гриде
              // domain    : this.$store.getters.domain,
              // query     : async function(data){
              //    let query = await fetch(this.domain+'/api/vicarious/user/search', {
              //      method: 'post',
              //      headers: {'Content-Type' : 'application/json;charset=utf-8'},
              //      body: JSON.stringify({q : data, token : window.token})
              //    });
              //    let result = await query.json();
              //    if(result.status == 'success')
              //      this.option = result.data;
              // }
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
            type            : {
              show : false,
              type     : 'list',
              name     : 'Тип заявки',
              multiple : true,
              option   : this.$store.getters.queryType,
            },
            document_type   : {
              show : false,
              type     : 'list',
              name     : 'Тип доверенности',
              multiple : true,
              option   : this.$store.getters.queryTypeDocument,
            },
            needApprove     : {
              type     : 'list',
              name     : 'Согласование',
              multiple : false,
              option   : [{value : [1], label : 'Требует моего согласования'}, {value : [0], label : 'Не требует моего согласования'}],
            },
            needAction      : {
              type     : 'list',
              name     : 'Управление заявкой',
              multiple : false,
              option   : [{value : [1], label : 'Требует моего участия'}, {value : [0], label : 'Не требует моего участия'}],
            },
            creator         : {
              show      : false,
              type      : 'searchlist',
              name      : 'Заказчик',
              multiple  : true,
              query     : async function (data){
                let result = await this.$store.dispatch('query',{
                  url   : '/api/vicarious/user/search',
                  data  :  {q : data}
                });
                if(result.status == 'success') return result.data
              }.bind(this),
            },
            created_at      : {
              show : false,
              type : 'date',
              name : 'Дата создания заявки',
            },
            responsible     : {
              show : false,
              type      : 'searchlist',
              name      : 'Ответственный',
              multiple  : true,
              query     : async function (data){
                let result = await this.$store.dispatch('query',{
                  url   : '/api/vicarious/user/search',
                  data  :  {q : data}
                });
                if(result.status == 'success') return result.data
              }.bind(this),
            },
            responsible_date: {
              show : false,
              type : 'date',
              name : 'Дата обработки заявки',
            },
            status          : {
              type     : 'list',
              name     : 'Статус',
              multiple : true,
              option   : this.$store.getters.statusList,
            },
            signature          : {
              type     : 'list',
              name     : 'Заявка на подписании',
              multiple : true,
              option   : [
                { value : '0',     label : 'Заявки НЕ на подписании'},
                { value : '1',     label : 'Заявки на подписании'},
              ],
            },
            company_id      : {
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
            date_start      : {
              show : false,
              type : 'date',
              name : 'Дата начала действия документа',
            },
            date_final      : {
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
          },
          profiles     : [],
          showProfiles : true,
          filter       : function(data){
            this.filterData = data;
            this.$store.commit('setPaginationPage', 1);
            this.getData();
          }.bind(this),
          clear        : function(){
            this.filterData = {};
            this.getData();
          }.bind(this),
        },
        context     : [
          {
            name      : 'Открыть заявку',
            function  : row => {
              this.$store.commit('setRequestId', row.id[0].value)
              this.$store.commit('setComponent', 'detail');
            }
          },
          {
            name      : 'Копировать заявку',
            function  :  row => {
              this.$store.commit('setRequestId', row.id[0].value);
                this.$confirm(`Вы уверены, что хотите создать новую заявку на основе данных заявки с ID - ${row.id[0].value} ?`).then(() => {
                  this.$store.commit('setPage', 'request');
                  this.$store.commit('setComponent', 'addByExist');
                }).catch(() => {this.$store.commit('setRequestId', null);});

            }
          },
        ],
        pagination  : {
          show        : 'full',
          defaultSize : 10,
          page        : 1,
          sizes       : [10,20,50],
          changeSize : value => {
            this.$store.commit('setPaginationSize', value);
            this.$grid.commit('normalizePagination', {name : this.grid.name, data : {pagination : {defaultSize : value}}})
            this.getData();
          },
          changePage : value => {
            this.$store.commit('setPaginationPage', value);
            this.getData();
          },
        },
        header      : {
          id               : {
            name        : 'ID',
            child       : ['users'],
            width       : 100,
            contentSort : true,
          },
          users            : {
            name  : 'Доверенное лицо / организация',
            width : 300,
          },
          company          : {
            name  : 'Организация',
            width : 300,
          },
          functions        : {
            name  : 'Функционал документа',
            width : 300,
          },
          status           : {
            name        : 'Статус',
            width       : 150,
            contentSort : true,
          },
          date_start       : {
            name  : 'Дата начала действия документа',
            width : 300,
            contentSort : true,
          },
          date_final       : {
            name  : 'Дата окончания действия документа',
            width : 300,
            contentSort : true,
          },
          created_at       : {
            name  : 'Дата создания заявки',
            width : 200,
            contentSort : true,
          },
          responsible_date : {
            name  : 'Дата обработки заявки',
            width : 200,
            contentSort : true,
          },
          type             : {
            name  : 'Тип заявки',
            width : 200,
            contentSort : true,
          },
          document_type    : {
            name  : 'Тип доверенности',
            width : 200,
            contentSort : true,
          },
          creator          : {
            name  : 'Заказчик',
            width : 300,
          },
          responsible      : {
            name  : 'Ответственный',
            width : 300,
          },
          comment          : {
            name  : 'Комментарии',
            width : 700,
          },
          files            : {
            name  : 'Дополнительные файлы',
            width : 300,
          },
        },
        elements    : [],
        name        : 'request'
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

  },
  methods : {
    async getData(){
      this.loading = true;
      let filter = await this.$store.dispatch('normalizeFilterData', this.filterData);

      let charters = '';
      this.$store.getters.charters('showAll') ? charters = 'showAll' : charters = '';
      let result = await this.$store.dispatch('query',{
        url  : '/api/vicarious/request/list',
        data : {
          count    : this.$store.getters.paginationSize,
          page     : this.$store.getters.paginationPage,
          filter   : filter,
          charters : charters,
          sort     : this.sort,
        } });
      if(result.status == 'success') {
        this.$grid.commit('normalizeElement',{name : this.grid.name ,data : { elements : result.data } });
        this.$grid.commit('normalizePagination', {
          name : this.grid.name,
          data : {
            pagination : { page : this.$store.getters.paginationPage, ...result.pagination }
          }
        })
      }else
        this.$store.commit('setMessage',{text : 'Некорректный ответ сервера',header : 'Возникла проблема!', type: 'error'});
      this.loading=false;
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
      let setShowValue = data => {
        this.grid.header[data.key].show = data.show;
        if (this.grid.header[data.key].child instanceof Array) {
          this.grid.header[data.key].child.forEach((el, idx) => {
            let newData = {
              key  :  this.grid.header[data.key].child[idx],
              show :  data.show,
            }
          setShowValue(newData);
          }) // перебор массива child
        }//if
      };

      setShowValue(data); //так возможно если это стрелочная функция.
      //setShowValue.call(this, data);
      this.setHeaderParams();
    },

    saveWidthColumn(data){
      this.grid.header[data.key].width = data.width;
      this.setHeaderParams();
    },

    saveOrderColumn(data){
      data.data.forEach(el => {
        let key = el.key, sort = el.params.sort;
        this.grid.header[key].sort = sort;
      });
      this.setHeaderParams();
    },

    async setHeaderParams(){
      let keys = Object.keys(this.grid.header);
      let headerParams = keys.map((el,idx) => {
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

    async initGrid(){
      this.loading = true;
      //сначала загружаем настройки шапки таблицы
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


      // стартуем грид с полученными исходными данными
      this.$grid.dispatch('createGrid', {name : this.grid.name, data : this.grid});

      //получам содержимое таблицы
      await  this.getData();

      this.gridReady = true;

      this.loading = false;
    },
  },
  created(){
    window.vicariousLoadFile = async (id, fileName, type) => {
      // let el =  event.target.parentNode;
      // el.classList.add('loading');
      // event.preventDefault();
      try {
        let result = await this.$store.dispatch('query', {
          url             : '/api/vicarious/request/load-file',
          downloadRequest : true,
          data            : {id: id, type : type},
        });
        let blob      = await result.blob();
        let url       = URL.createObjectURL(blob);
        let link      = document.createElement('a');
        link.href     = url;
        link.download = fileName;
        //document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(link.href);
      }catch(e){
        this.$store.commit('setMessage',{text : 'Некорректный ответ сервера',header : 'Возникла проблема!', type: 'error'});
      }
     // el.classList.remove('loading');
     return false;
    };
    this.initGrid();
  },
}
</script>
<style>

</style>