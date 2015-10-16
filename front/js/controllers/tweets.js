angular.module('permanentie')
.controller('tweetsController', function ($scope, data) {
  $scope.tweets = data.tweets;
});
