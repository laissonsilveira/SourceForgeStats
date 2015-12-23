var myapp = angular.module('SFStatsApp', []);
myapp.controller('StatsController', function ($scope, $http, $filter) {

    setLabel();
    $scope.stats = null;
    $scope.error = null;
    $scope.showDatails = false;
    $scope.containsInfo = false;
    $scope.showSpinner = false;
    $scope.filter = {
        name_project: localStorage["name_project"],
        start_date: new Date(),
        end_date: new Date()
    };

    $scope.findStats = function (filter) {

        if (!validate()) return;

        var link_json = 'http://sourceforge.net/projects/' + filter.name_project + '/files/stats/json?start_date='
            + $filter('date')(filter.start_date, 'yyyy-MM-dd') + '&end_date=' + $filter('date')(filter.end_date, 'yyyy-MM-dd');

        $scope.stats = null;
        createSpinner();
        $scope.showSpinner = true;

        $http.get(link_json).success(function (data) {
            $scope.showSpinner = false;
            $scope.stats = data;
            $scope.containsInfo = true;
            localStorage["name_project"] = $scope.filter.name_project;
        }).error(function (data, status, error, config) {
            $scope.showSpinner = false;
            $scope.error = {
                msg: chrome.i18n.getMessage('msg_error_load_json_i18n')
            };
        });
    };

    function validate() {
        $scope.error = null;


        if ($scope.filter.end_date == null) {
            $('.end-date').addClass('has-error has-feedback');
            $('.end-date input').focus();
            $scope.error = {
                msg: chrome.i18n.getMessage('msg_required_end_date_i18n')
            };
        } else {
            $('.end-date').removeClass('has-error has-feedback');
        }

        if ($scope.filter.start_date == null) {
            $('.start-date').addClass('has-error has-feedback');
            $('.start-date input').focus();
            $scope.error = {
                msg: chrome.i18n.getMessage('msg_required_start_date_i18n')
            };
        } else {
            $('.start-date').removeClass('has-error has-feedback');
        }

        if ($scope.filter.name_project == null || $scope.filter.name_project == '') {
            $('.name-project').addClass('has-error has-feedback');
            $('.name-project input').focus();
            $scope.error = {
                msg: chrome.i18n.getMessage('msg_required_project_name_i18n')
            };
        } else {
            $('.name-project').removeClass('has-error has-feedback');
        }

        if ($scope.error == null) {
            var total = dateDiffInDays($scope.filter.start_date, $scope.filter.end_date);
            if (total < 0) {
                $scope.error = {
                    msg: chrome.i18n.getMessage('msg_start_greater_end_i18n')
                };
            }
        }

        return $scope.error == null;
    }

    function dateDiffInDays(a, b) {
        var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
        var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

        return Math.floor((utc2 - utc1) / ( 1000 * 60 * 60 * 24));
    }

});

function createSpinner() {
    var opts = {
        lines: 13, length: 20, width: 10, radius: 30, corners: 1, rotate: 0,
        direction: 1, color: '#000', speed: 1, trail: 60, shadow: false, hwaccel: false,
        className: 'spinner', zIndex: 2e9, top: 'auto', left: 'auto', scale: 0.2
    };
    new Spinner(opts).spin($('#spinner')[0]);
}

function setLabel() {
    $('#version').text('v' + chrome.runtime.getManifest().version);
    $('.name-project label').text(chrome.i18n.getMessage('txt_project_name_i18n'));
    $('.name-project input').prop('placeholder', chrome.i18n.getMessage('txt_placeholder_project_name_i18n'));
    $('.start-date label').text(chrome.i18n.getMessage('txt_start_date_i18n'));
    $('.end-date label').text(chrome.i18n.getMessage('txt_end_date_i18n'));
    $('.downloads').text(chrome.i18n.getMessage('txt_download_i18n'));
    $('#operational_system').text(chrome.i18n.getMessage('txt_operational_system_i18n'));
    $('.countries').text(chrome.i18n.getMessage('txt_countries_i18n'));
    $('#top_country').text(chrome.i18n.getMessage('txt_top_country_i18n'));
    $('#top_os').text(chrome.i18n.getMessage('txt_top_os_i18n'));
    $('.percent').text(chrome.i18n.getMessage('txt_percent_download_i18n'));
    $('#filter button').text(chrome.i18n.getMessage('btn_find_stats_i18n'));
    $('#btn_details').text(chrome.i18n.getMessage('btn_details_i18n'));
    $('#btn_new_filter').text(chrome.i18n.getMessage('btn_new_filter_i18n'));
    $('#btn_tab1').text(chrome.i18n.getMessage('btn_os_i18n'));
    $('#btn_tab2').text(chrome.i18n.getMessage('btn_country_i18n'));
    $('#btn_tab3').text(chrome.i18n.getMessage('btn_top_i18n'));
}