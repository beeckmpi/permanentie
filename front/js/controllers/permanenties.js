angular.module('permanentie')
.controller('permanentieAddCtrlr', ['$scope', function ($scope) {
  $scope.panels = {'panel1a': true, 'panel2a': false, 'panel3a': false, 'panel4a': false, 'panel5a': false, 'panel6a': false, 'panel7a': false, 'panel8a': false};
  $scope.tabs = function(id){
    var panels = $scope.panels;
    var log = [];
    angular.forEach(panels, function(value, key){
      panels[key] = false;
    }, log);
    panels[id] = true;
    $scope.panels = panels;    
  };
}])
.controller('permanentieEditCtrlr', ['$scope', 'data', function ($scope, data) {
  $scope.tweets = data.tweets;
}])
.controller('permanentieListCtrlr', ['$scope',  function ($scope, data) {
  
}]);