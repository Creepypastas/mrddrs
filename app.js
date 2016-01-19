angular.module('mrddrs.creepypastas.com', [])
.controller('posts-CTRL', ['$http', function($http) {

  var mrddrs = this;
  mrddrs.posts = {};
  mrddrs.posts.get = function(){
    mrddrs.posts.nuevos = [
      {
        ID:99231,
        post_title:'Nakhiri te persigue.',
        post_author:'',
        url:'https://creepypastas.com/nakhiri-te-persigue.html',
        post_status:'nuevo'
      }
    ];

    $http.get('https://creepypastas.com/wdgts/mrddrs.creepypastas.com/nuevo.json')
    .then(function(res){
      mrddrs.posts.nuevos = res.data;
    });

  };

  mrddrs.posts.get();
}]);
