var myapp = angular.module('SFStatsApp', []);
myapp.controller('StatsController', function ($scope, $http, $filter) {

    $scope.stats = null;
    $scope.showDatails = false;
    $scope.containsInfo = false;
    $scope.showSpinner = false;
    $scope.filter = {
        name_project: 'passbrow-recover',
        start_date: new Date(),
        end_date: new Date()
    };

    $scope.findStats = function (filter) {

        if (!validateFind()) return;

        var link_json = 'http://sourceforge.net/projects/' + filter.name_project + '/files/stats/json?start_date='
            + $filter('date')(filter.start_date, 'yyyy-MM-dd') + '&end_date=' + $filter('date')(filter.end_date, 'yyyy-MM-dd');

        $scope.stats = null;
        createSpinner();
        $scope.showSpinner = true;

        $http.get(link_json).success(function (data) {
            $scope.showSpinner = false;
            $scope.stats = data;
            $scope.containsInfo = true;
        }).error(function (data, status, error, config) {
            $scope.showSpinner = false;
            $scope.stats = {
                error: "ERROR: Could not load stats of Source Forge, verify your connection or your Project Name!"
            };
        });
    };

    function validateFind() {
        if ($scope.filter.name_project == '') {
            $('.name-project').addClass('has-error has-feedback');
            $('#name-project').focus();
            return false;
        } else {
            $('.name-project').removeClass('has-error has-feedback');
            return true;
        }
    }

    function createSpinner() {
        var opts = {
            lines: 13, length: 20, width: 10, radius: 30, corners: 1, rotate: 0,
            direction: 1, color: '#000', speed: 1, trail: 60, shadow: false, hwaccel: false,
            className: 'spinner', zIndex: 2e9, top: 'auto', left: 'auto', scale: 0.2
        };
        new Spinner(opts).spin($('#spinner')[0]);
    }

});