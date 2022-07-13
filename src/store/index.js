import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
export default new Vuex.Store({
    //ctx это контекст
    // s это  state
    // v это value
    actions : {
        async query (ctx, params){
            if(!('type' in params)) params.type = 'json'

            let body, header = {};

            if(params.type == 'json'){
                body = {
                    token : window.token,
                    ...params.data
                }
                header['Content-Type'] = 'application/json;charset=utf-8';
            }else{
                    body = params.data;
                    body.append('token',window.token);
                 }
            try {
                  let url = params.url;

                  // исключительно для режима разработки в модуле. API  у нас подставляется.
                  // if (process.env.NODE_ENV === 'development') url = url.slice(4);

                  let query = await fetch(ctx.getters.domain + url, {
                    method: 'post',
                    headers: header,
                    body: params.type == 'json' ? JSON.stringify(body) : body
                  });
                  let result = null;

                  params.downloadRequest ? result = query :  result = await query.json();

                  return result;
            }catch(e){
                  return {'status' : 'error','message' : 'Некорректный ответ сервера'};
            }
        },

        normalizeFilterData(ctx, data){
            let normalFilter = {};
            for (let key in data){
                if ((data[key].type === 'number' || data[key].type === 'date')         && data[key].min)                normalFilter[key] = data[key];
                if ((data[key].type === 'list'   || data[key].type === 'searchlist')   && data[key].value.length > 0 )  normalFilter[key] = data[key];
            }
            return normalFilter;
        },

        formIsValid(ctx, data){
            let errors = {};
            if (!data.queryData.documentType)                                               errors.documentType = 'Необходимо выбрать тип доверенности!' ;
            if (!data.queryData.company)                                                    errors.company      = 'Необходимо выбрать организацию!';
            if (data.queryData.users instanceof Array && data.queryData.users.length <= 0)  errors.users        = 'Необходимо выбрать получателя!'
                else  if (!data.queryData.users)                                            errors.users        = 'Необходимо выбрать получателя!';

            if (data.queryData.functions.length <= 0 && !data.queryData.comment && !data.queryData.isFile)
                errors.functions    = 'Необходимо выбрать функционал или указать комментарий или прикрепить файл!';

            if(!data.queryData.dateStart)                                                   errors.dateStart    = 'Необходимо указать начало действия документа!';
            if(!data.queryData.dateFinal)                                                   errors.dateFinal    = 'Необходимо указать окончание действия документа!';
            if (data.queryData.dateStart && data.queryData.dateFinal) {
                if (Number(data.queryData.dateFinal.split('.').reverse().join('')) - Number(data.queryData.dateStart.split('.').reverse().join('')) < 0) {
                    errors.date = 'Дата начала действия документа не может быть позже даты окончания действия документа!'
                }
            }
            return errors;
        },
    },
    mutations : {
        setLoading(s,v){
             s.loading = v;
        },
        setPage(s,v){
            s.previousPage = s.page;
            s.page         = v;
            s.component    = '';
        }, // тут же сохраняется предыдущая страница
        setComponent(s,v){
            s.component = v;
        },
        setComponentParams(s,v){
            s.componentParams = v;
        },
        setMessage(s,v){
            s.message = v;
            setTimeout(() => {s.message = {}},7000);
        },
        setPaginationPage(s,v){
            s.paginationPage = v;
        },
        setPaginationSize(s,v){
            s.paginationSize = v;
        },
        setUserId(s,v){
            s.userId = v;
        },
        setCreatorId(s,v){
            s.creatorId = v;
        },
        setResponsibleId(s,v){
            s.responsibleId = v;
        },
        setCharters(s,v){
            s.charters = v;
        },
        setIndividuals(s,v){
            s.individuals =v;
        },
        setDocumentId(s,v){
            s.documentId = v;
        },
        setDocumentName(s,v){
            s.documentName = v;
        },
        setGenDocument(s,v){
            v === 1 ?  s.genDocument = true : s.genDocument = false;
        },
        document_project(s,v){
            s.document_project = v;
        },
        projectFile(s,v){
            s.projectFile = v;
        },
        setSignature(s,v){
            v === 1 ?  s.signature = true : s.signature = false;
        },
        setDocumentStorage(s,v){
            s.documentStorage = v;
        },
        setRequestId(s,v){
            s.requestId = v;
        },
        setExchangeId(s,v){
            s.exchangeId = v;
        },
        setRequestState(s,v){
            s.requestState = v;
        },
    },
    state : {
        userId              : null,
        creatorId           : null,
        responsibleId       : null,

        componentParams     : {},

        documentId          : null,
        genDocument         : false,
        document_project    : false,
        projectFile         : '',
        signature           : false,
        documentName        : null,
        documentStorage     : null,

        requestId           : null,
        requestState        : {},

        exchangeId          : {},

        loading             : false,
        charters            : [],
        individuals         : [],

        //domain              : 'https://vc.bsi.local',
        //domain              : 'https://bitrix.bsi.local',
        domain              :  process.env.NODE_ENV === 'production' ? window.location.origin : 'https://vc.bsi.local',

        page                : 'request',
        previousPage        : '',
        component           : 'list',

        message             : {},
        paginationPage      : 1,
        paginationSize      : 10,

        function_type       : [
            {key : 'in',        value : 'in',       label : 'Входящая'},
            {key : 'out',       value : 'out',      label : 'Исходящая'},
            {key : 'int',       value : 'int',      label : 'Внутренняя'}
        ],
        queryType           : [
            {value : 'personal', label : 'Персональная'},
            {value : 'complex',  label : 'По требованию'}
        ],
        queryTypeDocument   : [
            {value : 'special',   label : 'Специальная'},
            //{value : 'only',      label : 'Разовая'},
            {value : 'notarial',  label : 'Нотариальная'}
        ],
        queryStatusDocument : [
            {value : 'for_signature',   label : 'Подготовка, на подписании'},
            {value : 'active',          label : 'Действующий'},
            {value : 'cancel',          label : 'Аннулирован'},
            {value : 'terminated',      label : 'Действие прекращено досрочно'},
            {value : 'expiration_date', label : 'Действие прекращено по сроку'},
        ],
        statusList          : [
            {value : 'created',       label : 'Заявка создана'},
            {value : 'performed',     label : 'Принята в работу'},
            {value : 'rejected',      label : 'Заявка отклонена'},
            {value : 'pending_agree', label : 'На согласовании'},
            {value : 'agree',         label : 'Согласовна'},
            {value : 'completed',     label : 'Выполнена'},
            {value : 'deleted',       label : 'Удалена'},
        ],
    },
    getters : {
        loading             : s => s.loading,
        domain              : s => s.domain,
        page                : s => s.page,
        previousPage        : s => s.previousPage,
        component           : s => s.component,
        message             : s => s.message,

        function_type       : s => s.function_type,
        queryType           : s => s.queryType,
        queryTypeDocument   : s => s.queryTypeDocument,
        queryStatusDocument : s => s.queryStatusDocument,
        statusList          : s => s.statusList,

        paginationPage      : s => s.paginationPage,
        paginationSize      : s => s.paginationSize,

        componentParams    : s=> s .componentParams,

        documentId          : s => s.documentId,
        documentStorage     : s => s.documentStorage,
        documentName        : s => s.documentName,
        document_project    : s => s.document_project,
        projectFile         : s => s.projectFile,
        genDocument         : s => s.genDocument,
        signature           : s => s.signature,

        requestId           : s => s.requestId,
        requestState        : s => s.requestState,

        exchangeId          : s => s.exchangeId,

        userId              : s => s.userId,

        charters            : s => char => { return s.charters.indexOf(char) >= 0 ? true : false },

        individuals         : s => s.individuals,

        isCreator           : s =>         { return s.userId === s.creatorId      ? true : false },
        isResponsible       : s =>         { return s.userId === s.responsibleId  ? true : false },
    },
});
// elements: function(s){
//     return function(name){ return s.grid[name].elements }
// }
//
