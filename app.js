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
    {name:'publish'},
    {name:'nuevo'},
    {name:'pending'},
    {name:'tumba'}
  ];

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
    switch(which){
      case 'edit-single-post':
        var dlg = dialogs.create('/dialogs/edit-single-post-status','editSinglePostStatusCtrl',data,{size:'lg',keyboard:true,backdrop:false});
        dlg.result.then(function(current_post){
          mrddrs.current_post = current_post;
        });
        break;
    }
  };

}])

.controller('editSinglePostStatusCtrl', ['$scope','$uibModalInstance','data',function($scope,$uibModalInstance,data){
  $scope.current_post = data;
  $scope.done = function(){
    $uibModalInstance.close($scope.current_post);
  }; // end done

  $scope.hitEnter = function(evt){
    if(angular.equals(evt.keyCode,13))
      $scope.done();
  };
}])

.run(['$templateCache',function($templateCache){
  $templateCache.put('/dialogs/edit-single-post-status','<div class="modal-header"><h4 class="modal-title"><span class="glyphicon glyphicon-star"></span> Modificar post individual</h4></div><div class="modal-body"><label class="control-label" for="customValue">ID:</label><input type="text" class="form-control" id="customValue" ng-model="current_post.ID" ng-keyup="hitEnter($event)"><span class="help-block">ID del post a modificar.</span></div><div class="modal-footer"><button type="button" class="btn btn-default" ng-click="done()">Volver</button></div>');
}]);
