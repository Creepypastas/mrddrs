angular.module('mrddrs.creepypastas.com', ['angular-loading-bar','ui.bootstrap','dialogs.main'])
.controller('posts-CTRL', ['$http','dialogs',function($http,dialogs) {

  var mrddrs = this;
  mrddrs.posts = {
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
      desc:'publicaciones de la portada',
      load:true
    },
    {
      name:'nuevo',
      desc:'envíos de los usuarios',
      load:true
    },
    {
      name:'pending',
      desc:'envíos pendientes',
      load:true
    },
    {
      name:'tumba',
      desc:'entradas del cementerio',
      load:false
    },
  ];

  mrddrs.search = {
    post_status: 'pending'
  };

  mrddrs.posts.loadByStatus = function(status){
    console.log('loadByStatus::' + status);
    switch (status) {
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
    $http.get(posts_url)
    .then(function success(res){
      mrddrs.posts[status] = res.data;
      mrddrs.loading[status] = {
        isLoading : false,
        error: false
      };
      mrddrs.updates[status] = Date(res.headers()['last-modified']);
    },function error(res){
      mrddrs.loading[status] = {
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

.controller('editSinglePostStatusCtrl', ['$scope','$http','$sce','$uibModalInstance','data',function($scope,$http,$sce,$uibModalInstance,data){
  $scope.current_post = data;
  $scope.done = function(){
    $uibModalInstance.close($scope.current_post);
  }; // end done

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

  $scope.getPost( $scope.current_post.ID );

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
