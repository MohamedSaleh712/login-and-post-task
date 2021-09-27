angular.module('webApp', [
    'ngRoute',
    'login',  
    
  ]).
  config(['$routeProvider', function($routeProvider) {
  
    $routeProvider.otherwise({redirectTo: '/login'});
    
  }]);