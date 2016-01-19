angular.module('mrddrs.creepypastas.com', ['angular-loading-bar'])
.controller('posts-CTRL', ['$http', function($http) {

  var mrddrs = this;
  mrddrs.posts = {
    envios:[],
    pendientes:[],
    cementerio:[],
    casitodos:[]
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

    if(posts_url === null)
      return;
    $http.get(posts_url)
    .then(function(res){
      mrddrs.posts[status] = res.data;
    });
  };

}]);
