var myapp = angular.module('SFStatsApp', []);
myapp.controller('StatsController', function ($scope, $http, $filter) {

    setLabel();
    setListDates();    
    setDefaultValues();
    
    $scope.filter = {
        name_project: localStorage["name_project"],
        start_date: new Date(),
        end_date: new Date()
    };

    $scope.validateForm = function () {

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
            } else {
               findStats();
            }
        }
    };

    function findStats() {

        var link_json = 'http://sourceforge.net/projects/' + $scope.filter.name_project + '/files/stats/json?start_date='
            + $filter('date')($scope.filter.start_date, 'yyyy-MM-dd') + '&end_date=' + $filter('date')($scope.filter.end_date, 'yyyy-MM-dd');

        setDefaultValues();
        createSpinner();
        $scope.showSpinner = true;
        
        $http.get(link_json).success(function (data) {
            loadChart(data);
            $scope.showSpinner = false;
            $scope.stats = data;
            $scope.containsInfo = true;
            $scope.showChartDownloads = true;
            $scope.showForm = false;
            localStorage["name_project"] = $scope.filter.name_project;
        }).error(function (data, status, error, config) {
            $scope.showSpinner = false;
            setDefaultValues();
            $scope.error = {
                msg: chrome.i18n.getMessage('msg_error_load_json_i18n')
            };
        });
    };

    function setDefaultValues() {
        $scope.stats = null;
        $scope.error = null;
        $scope.containsInfo = false;
        $scope.showChartDownloads = false;
        $scope.showDatails = false;
        $scope.showForm = true;
    };

    function dateDiffInDays(a, b) {
        var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
        var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

        return Math.floor((utc2 - utc1) / ( 1000 * 60 * 60 * 24));
    };

});

function createSpinner() {
    var opts = {
        lines: 13, length: 20, width: 10, radius: 30, corners: 1, rotate: 0,
        direction: 1, color: '#000', speed: 1, trail: 60, shadow: false, hwaccel: false,
        className: 'spinner', zIndex: 2e9, top: '87%', left: '36%', scale: 0.2
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
    $('#btn_find').text(chrome.i18n.getMessage('btn_find_stats_i18n'));
    $('#btn_details').text(chrome.i18n.getMessage('btn_details_i18n'));
    $('#btn_new_filter').text(chrome.i18n.getMessage('btn_new_filter_i18n'));
    $('#btn_tab1').text(chrome.i18n.getMessage('btn_top_i18n'));
    $('#btn_tab2').text(chrome.i18n.getMessage('btn_os_i18n'));
    $('#btn_tab3').text(chrome.i18n.getMessage('btn_country_i18n'));
}

function setListDates() {
    var today = new Date();
    $('#today').val(convertDate(today));
    
    var sevenDays = new Date();
    sevenDays.setDate(today.getDate() - 7);
    $('#seven_days').val(convertDate(sevenDays));
    
    var month = new Date(today.getFullYear(), today.getMonth(), 1);
    $('#month').val(convertDate(month));
    
    var year = new Date(today.getFullYear(), 0, 1);
    $('#year').val(convertDate(year));
    
    var previousMonth = new Date();
    previousMonth.setMonth(today.getMonth() - 1);
    $('#previous_month').val(convertDate(previousMonth));
}

function convertDate(d) {
    function normalize(s) { return (s < 10) ? '0' + s : s; }
    return [d.getFullYear(), normalize(d.getMonth() + 1), normalize(d.getDate())].join('-');
}

function loadChart(stats) {
    var dateChart = ['x'], downloadsChart = [chrome.i18n.getMessage('txt_legend_chart_i18n')];

    for (var i = 0; i < stats.downloads.length; i++) {
        var dateLegend = new Date(stats.downloads[i][0]);
        dateChart.push(convertDate(dateLegend));
        downloadsChart.push(stats.downloads[i][1]);
    }
    
    var chartDownloads = c3.generate({
        bindto: '#chartDownloads',
        data: {
            x: 'x',
            columns: [
                dateChart,
                downloadsChart
            ]
        },
        axis: {
            x: {
                type: 'timeseries',
                tick: {
                    format: '%Y-%m-%d'
                }
            }
        }
    });

    var chartTopOS = c3.generate({
        bindto: '#chartTopOS',
        size: {
            width: 180,
            height: 180
        },
        data: {
            columns: stats.oses,
            type : 'pie'
        },
        legend: {
            hide: true
        }
    });

    var chartTopCountry = c3.generate({
        bindto: '#chartTopCountry',
        size: {
            width: 180,
            height: 180
        },
        data: {
            columns: stats.countries,
            type : 'pie'
        },
        legend: {
            hide: true
        }
    });
}