var myapp = angular.module('SFStatsApp', []);
myapp.controller('StatsController',function($scope, $http, $filter){

    $scope.stats = null;
    $scope.filter = {
        name_project: 'passbrow-recover',
        start_date: new Date(),
        end_date: new Date()
    };

    $scope.findStats = function(filter) {
        var link_json = 'http://sourceforge.net/projects/' + filter.name_project + '/files/stats/json?start_date='
            + $filter('date')(filter.start_date, 'yyyy-MM-dd') + '&end_date='+ $filter('date')(filter.end_date, 'yyyy-MM-dd');
        
        $http.get(link_json).success(function(data) {
            $scope.stats = data;
        }).error(function(data,status,error,config){
            $scope.stats = {
                error:"ERROR: Could not load stats of Source Forge, verify your connection or your Project Name!"
            };
        });
    };

});