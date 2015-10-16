var dataLoaderRunner = [
  'dataLoader',
  function (dataLoader) {
    return dataLoader();
  }
];
angular.module('permanentie', ['ngRoute'])
.factory('authInterceptor', function ($rootScope, $q, $window, $location) {
  return {
    request: function (config) {
      config.headers = config.headers || {};
      if ($window.sessionStorage.token) {
        config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
      }
      if ($window.localStorage.getItem('user')) {
        var user = $window.localStorage.getItem('user');
        $rootScope.user = JSON.parse(user);
      } else {
        $location.path('/login');
      }
      return config;
    },
    responseError: function (response) {
      if (response.status === 401) {
        // $location.path('/login');
        
      }
      console.log(response);
      return response || $q.when(response);
    }
  };
})
.config(function ($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
})
.run(function($rootScope, $location, $window, $http){
  $rootScope.help = '';
  $rootScope.go = function ( path ) {
    $location.path( path );
  };
  $rootScope.setHelp = function (name) {
    if ($rootScope.help == undefined) {
      $rootScope.help = new Array();
    }
    $rootScope.help[name] = true;
    $http.put('/api/users/help?help='+name, {user: $rootScope.user.id}).success(function(data, status, headers, config){
         
    });
  };
  $rootScope.tabs = function(number){
    var pages = document.getElementById('tabForm');
    pages.selected = number;
  };
  $rootScope.today = new Date();  
})
.controller("MainController", ['$scope', '$rootScope', '$http', '$window', function($scope, $rootScope, $http, $window) {
    $rootScope.LoggedOut = true;  
    // This flag we use to show or hide the button in our HTML.   
    $rootScope.signedIn = false; 
    // Here we do the authentication processing and error handling.
    // Note that authResult is a JSON object.   
    $scope.userRole = $window.sessionStorage.userRole;
    $rootScope.onteigeningen = true; 
    $scope.sendTo = function(url) {
      window.location.href="/#/"+url;
    };  
    $scope.cancelDossier = function(){
      var addDossier = document.getElementById('addDossier');
      addDossier.toggle();
    };    
}])
.controller("LoginController", ['$scope', '$rootScope', '$http', '$window', function($scope, $rootScope, $http, $window){
  $scope.processAuth = function(authResult) {
    // Do a check if authentication has been successful.       
    $scope.authResult = authResult; 
    if(authResult['access_token']) {             
      // Successful sign in.
      $scope.signedIn = true;
      $http.post('/authenticate', {
        authResult: authResult['code']
      }).success(function(data, status, headers, config){
        $rootScope.signedIn = false;  
        $rootScope.LoggedOut = false;              
        $rootScope.user = data.response.google;
        $rootScope.token = data.token;                
        $window.sessionStorage.token = data.token;
        $window.sessionStorage.userRole = data.response.userRole;
        $window.localStorage.setItem('user', JSON.stringify(data.response.google));               
      });
    } else if(authResult['error']) {
      // Error while signing in.
      $scope.signedIn = false;   
      // Report error. 
    }        
  };  
  $scope.signInCallback = function(authResult) {        
    $scope.processAuth(authResult);        
  };
  $scope.renderSignInButton = function() {    
        gapi.signin.render('signInButton',
            {
                'callback': $scope.signInCallback, // Function handling the callback.
                'clientid': '989616082940-v3e5a9l98udlm4cllv7t0v99nu28huq6.apps.googleusercontent.com', // CLIENT_ID from developer console which has been explained earlier.
                'requestvisibleactions': 'http://schemas.google.com/AddActivity', // Visible actions, scope and cookie policy wont be described now,                                                                                  // as their explanation is available in Google+ API Documentation.
                'scope': 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email',
                'cookiepolicy': 'single_host_origin',
                'redirecturi': "postmessage",
                'accesstype': 'offline'
            }
        );
    };  
    // Start function in this example only renders the sign in button.
    $scope.start = function() {
        $scope.renderSignInButton();
    }; 
    // Call start function on load.
    $scope.start();   
}])
.controller("UserController", ['$scope', '$rootScope', '$http', '$window', function($scope, $rootScope, $http, $window){
  $http({url: '/api/users/'+$rootScope.user.id, method: 'GET'}).success(function(data, status, headers, config){
    $rootScope.signedIn = false;  
    $rootScope.LoggedOut = true;              
    $rootScope.user = data.user.google;    
    $rootScope.help = data.user.help;
    $rootScope.page = ''; 
  });
  $scope.userRole = $window.sessionStorage.userRole;
}])
.controller("ListController", ['$scope', '$rootScope', '$http', '$window', '$location', function($scope, $rootScope, $http, $window, $location){
  $http({url: '/api/users/'+$rootScope.user.id, method: 'GET'}).success(function(data, status, headers, config){
    $rootScope.signedIn = false;  
    $rootScope.LoggedOut = false;              
    $rootScope.user = data.user.google;
    $rootScope.help = data.user.help;
    var hoofdmenu = document.getElementById('hoofdmenu');
    hoofdmenu.selected = '';
  });
}])
.controller("AdminController", ['$scope', '$rootScope', '$http', '$window', function($scope, $rootScope, $http, $window){
  $http({url: '/api/users/', method: 'GET'}).success(function(data, status, headers, config){
    $rootScope.signedIn = false;  
    $rootScope.LoggedOut = true;              
    $scope.users = data;    
  });    
}])
.config(function ($routeProvider, $locationProvider) {
  $routeProvider
  .when('/',{templateUrl: 'html/permanenties/list.html', controller: 'permanentieListCtrlr'})
  .when('/permanenties/list',{templateUrl: 'html/permanenties/list.html', controller: 'permanentieListCtrlr', resolve: {data: dataLoaderRunner}})
  .when('/permanenties/add', {templateUrl: '/html/permanenties/add.html', controller: 'permanentieAddCtrlr', resolve: {data: dataLoaderRunner}})
  .when('/permanenties/edit', {templateUrl: '/html/permanenties/edit.html', controller: 'permanentieEditCtrlr', resolve: {data: dataLoaderRunner}})
  .when('/user/:id', {templateUrl: 'html/user/profile.html', controller: 'UserController', resolve: {data: dataLoaderRunner}})
  .when('/admin/users/', {templateUrl: 'html/admin/users.html', controller: 'AdminController', resolve: {data: dataLoaderRunner}})
  .when('/login', {templateUrl: 'html/login.html', controller: 'LoginController'})
  .otherwise({
    redirectTo: '/'
  });
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: true
  });
})
.service('dataLoader', function ($location, $http) {
  return function () {
    return $http.get( '/api' + $location.path() ).then(function (res) {
      return res.data;
    });
  };
});

function time_calc(currentTime)
{
  var data = new Object;
  var dagarray = new Array('Zondag','Maandag','Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag');
  var maandarray = new Array('januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december');
  data.dagnr = currentTime.getDate(); 
  data.dag = currentTime.getDay();  
  data.maand = currentTime.getMonth();
  data.jaar = currentTime.getFullYear();
  data.currentHours = currentTime.getHours();
  data.currentMinutes = currentTime.getMinutes();
  data.currentSeconds = currentTime.getSeconds();
  // Pad the minutes and seconds with leading zeros, if required
  data.maand = ( data.maand < 9 ? "0" : "" ) + (data.maand+1);  
    data.currentMinutes = (data.currentMinutes < 10 ? "0" : "" ) + data.currentMinutes;
  data.currentSeconds = (data.currentSeconds < 10 ? "0" : "" ) + data.currentSeconds;
  data.datumTijd = data.dagnr+'/'+data.maand+'/'+data.jaar+' '+data.currentHours + ":" + data.currentMinutes + ":" + data.currentSeconds; 
  return data;
}
function ObjectLength( object ) {
    var length = 0;
    for( var key in object ) {
        if( object.hasOwnProperty(key) ) {
            ++length;
        }
    }
    return length;
};
