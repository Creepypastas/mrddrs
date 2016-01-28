angular.module('mrddrs.creepypastas.com', ['angular-loading-bar','ui.bootstrap','dialogs.main','ngStorage'])

.config(['$localStorageProvider',
function ($localStorageProvider) {
  var current_user = $localStorageProvider.get('current_user');
  if( !current_user ){
    $localStorageProvider.set('current_user', { username: 'invitado', p: 'invitado' });
  }
}])

.controller('posts-CTRL', ['$http','dialogs','$localStorage',function($http,dialogs,$localStorage) {

  var mrddrs = this;

  mrddrs.$storage = $localStorage;
  mrddrs.posts = {
    portada:[],
    envios:[],
    pendientes:[],
    cementerio:[],
    casitodos:[]
  };
  mrddrs.updates = {};
  mrddrs.loading = {};
  mrddrs.statusList = [
    {
      name:'publish',
      altn:'portada',
      desc:'publicaciones de la portada',
      load:false
    },
    {
      name:'nuevo',
      altn:'envios',
      desc:'envíos de los usuarios',
      load:false
    },
    {
      name:'pending',
      altn:'pendientes',
      desc:'envíos pendientes',
      load:true
    },
    {
      name:'tumba',
      altn:'cementerio',
      desc:'entradas del cementerio',
      load:false
    },
  ];

  mrddrs.search = {
  };

  mrddrs.posts.loadByStatusList = function(){
    console.log('loadByStatusList::');
    mrddrs.posts.casitodos = [];
    for (var s_i=0, l=mrddrs.statusList.length; s_i<l; s_i++ ) {
      if(mrddrs.statusList[s_i].load){
        mrddrs.posts.loadByStatus(mrddrs.statusList[s_i].altn);
      }
    }
  };

  mrddrs.posts.loadByStatus = function(status){
    console.log('loadByStatus::' + status);
    switch (status) {
      case 'portada':
        posts_url = 'https://creepypastas.com/wdgts/mrddrs.creepypastas.com/publish.json';
        break;
      case 'cementerio':
        posts_url = 'https://creepypastas.com/wdgts/mrddrs.creepypastas.com/tumba.json';
        break;
      case 'envios':
        posts_url = 'https://creepypastas.com/wdgts/mrddrs.creepypastas.com/nuevo.json';
        break;
      case 'pendientes':
        posts_url = 'https://creepypastas.com/wdgts/mrddrs.creepypastas.com/pending.json';
        break;
      case 'casitodos':
        posts_url = 'https://creepypastas.com/wdgts/mrddrs.creepypastas.com/casitodos.json';
        break;
      default:
      posts_url = null;
    }

    if(posts_url === null){
      return;
    }
    mrddrs.loading[status] = {isLoading : true};
    mrddrs.loading.casitodos = {isLoading : true};
    $http.get(posts_url)
    .then(function success(res){
      Array.prototype.push.apply(mrddrs.posts.casitodos, res.data);

      mrddrs.posts[status] = res.data;
      mrddrs.loading[status] = {
        isLoading : false,
        error: false
      };
      mrddrs.loading.casitodos = {
        isLoading : false,
        error: false
      };
      mrddrs.updates[status] = Date(res.headers()['last-modified']);
    },function error(res){
      mrddrs.loading[status] = {
        isLoading : false,
        error: true
      };
      mrddrs.loading.casitodos = {
        isLoading : false,
        error: true
      };
    });
  };

  mrddrs.predicate = 'ID';
  mrddrs.reverse = true;
  mrddrs.order = function(predicate) {
    console.log('order:' + predicate);
    mrddrs.reverse = (mrddrs.predicate === predicate) ? !mrddrs.reverse : false;
    mrddrs.predicate = predicate;
  };

  mrddrs.statusClass = function(post_status, list_status){
    if( 0 === post_status.localeCompare(list_status) ){
      return "it-is";
    }
    return "it-is-not";
  };

  mrddrs.launch = function(which, data){
    var dlg = null;
    switch(which){
      case 'edit-single-post':
        dlg = dialogs.create('/dialogs/edit-single-post-status.html','editSinglePostStatusCtrl',data,{size:'lg',keyboard:true,backdrop:false});
        dlg.result.then(function(current_post){
          mrddrs.current_post = current_post;
        });
        break;
      case 'read-single-post':
        dlg = dialogs.create('/dialogs/read-single-post.html','readSinglePostCtrl',data,{size:'lg',keyboard:true,backdrop:true});
        break;
    }
  };

}])

.controller('editSinglePostStatusCtrl', ['$scope','$http','$sce','$uibModalInstance','data','$localStorage',function($scope,$http,$sce,$uibModalInstance,data,$localStorage){
  $scope.current_post = data;
  $scope.current_user = $localStorage.current_user;
  /*
  TODO:
      de-duplicar esta lista con la de mrddrs.statusList
  */
  $scope.statusList = [
    {
      name:'publish',
      altn:'portada',
      desc:'publicaciones de la portada',
      load:false
    },
    {
      name:'decorum',
      altn:'Decorum',
      desc:'Decorum',
      load:false
    },
    {
      name:'future',
      altn:'Futuro',
      desc:'Publicaciones programadas',
      load:false
    },
    {
      name:'nuevo',
      altn:'envios',
      desc:'envíos de los usuarios',
      load:false
    },
    {
      name:'pending',
      altn:'pendientes',
      desc:'envíos pendientes',
      load:true
    },
    {
      name:'tumba',
      altn:'cementerio',
      desc:'entradas del cementerio',
      load:false
    },
    {
      name:'rejected',
      altn:'Rechazadas',
      desc:'entradas del cementerio',
      load:false
    },
    {
      name:'draft',
      altn:'borrador',
      desc:'borradores',
      load:false
    }
  ];

  $scope.current_post_status =         {
        name:'publish',
        altn:'portada',
        desc:'publicaciones de la portada',
        load:false
      };



  $scope.terms = {
    categories : [],
    post_tags: []
  };

  $scope.loading = {
    updating:{
      isLoading:false,
      error:false
    }
  };


  $scope.save = function(){
    $scope.updatePost();
  }; // end save

  $scope.back = function(){
    $uibModalInstance.close({msg:'back'});
  };

  $scope.hitEnter = function(evt){
    if(angular.equals(evt.keyCode,13))
      $scope.done();
  };

  $scope.updatePost = function(){
    $scope.loading.updating = {
      isLoading : true,
      error: false
    };

    $http({
      url: 'https://creepypastas.com/comand',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: {
        user:$scope.current_user,
        post:$scope.current_post,
        command:'updatePost'
      }
    })
    .then(function success(res){
      console.log("updatePost::response");
      console.log(res.data);
      $scope.updateresult = res.data;
      $scope.loading.updating = {
        isLoading : false,
        error: false
      };
    },function error(res){
      console.error("updatePost::response");
      console.error(res.data);
      $scope.updateresult = res.data;

      $scope.loading.updating = {
        isLoading : false,
        error: true
      };
    });

  };


  $scope.getPost = function(ID){
    globalURL = 'https://cli.creepypastas.com/single-post.cgi?post_id=';
    posts_url = globalURL + ID;

    $http.get(posts_url)
    .then(function success(res){
      $scope.current_post = res.data;
      $scope.current_post.post_content = $sce.trustAsHtml($scope.current_post.post_content);
      $scope.loading = {
        isLoading : false,
        error: false
      };
    },function error(res){
        $scope.loading = {
        isLoading : false,
        error: true
      };
    });
  };

  $scope.getPostTermsByTaxonomy = function(taxonomy){
    var globalURL = 'https://json.creepypastas.com/creepypastas.com/terms/';
    var taxonomyPlural = '';
    var taxonomyFileName = '';

    switch (taxonomy) {
      case 'category':
      case 'categories':
        taxonomyFileName = 'categories.json';
        taxonomyPlural = 'categories';
        break;
      case 'tag':
      case 'post_tag':
      case 'post_tags':
        taxonomyFileName = 'post_tags.json';
        taxonomyPlural = 'post_tags';
        break;
      default:
        taxonomyFileName = null;
        break;
    }

    if(taxonomyFileName === null){
      return;
    }
    taxonomyURL = globalURL + taxonomyFileName;
    $http.get(taxonomyURL)
    .then(function success(res){
      console.log(taxonomyPlural + '::' + res.data.length + ' found');
      $scope.terms[taxonomyPlural] = res.data;
    });
  };

  $scope.getPost( $scope.current_post.ID );
  $scope.getPostTermsByTaxonomy('post_tags');
  $scope.getPostTermsByTaxonomy('categories');

}])
.controller('readSinglePostCtrl', ['$scope','$http','$sce','$uibModalInstance','data',function($scope,$http,$sce,$uibModalInstance,data){
  $scope.current_post = data;
  $scope.done = function(){
    $uibModalInstance.close($scope.current_post);
  };

  $scope.hitEnter = function(evt){
    if(angular.equals(evt.keyCode,13))
      $scope.done();
  };

  $scope.getPost = function(ID){
    globalURL = 'https://cli.creepypastas.com/single-post.cgi?post_id=';
    posts_url = globalURL + ID;

    $http.get(posts_url)
    .then(function success(res){
      $scope.current_post = res.data;
      post_content_br = nl2br($scope.current_post.post_content);
      $scope.current_post.post_content = $sce.trustAsHtml(post_content_br);
      $scope.loading = {
        isLoading : false,
        error: false
      };
    },function error(res){
        $scope.loading = {
        isLoading : false,
        error: true
      };
    });
  };

  $scope.getPost( $scope.current_post.ID );

}]);


var nl2br = function (str) {
  //  discuss at: http://phpjs.org/functions/nl2br/
  // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: Philip Peterson
  // improved by: Onno Marsman
  // improved by: Atli Þór
  // improved by: Brett Zamir (http://brett-zamir.me)
  // improved by: Maximusya
  // bugfixed by: Onno Marsman
  // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  //    input by: Brett Zamir (http://brett-zamir.me)

  var breakTag = '<br>';
  return (str + '')
    .replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
};
