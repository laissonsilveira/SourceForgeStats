var myapp = angular.module("SFStatsApp", []);
myapp.controller("StatsController", function ($scope, $http, $filter) {

    function initLocalStorage() {
        var projects = new Array();
        var savedProject = localStorage.getItem("nameProject");
        
        if (savedProject != null) {
            projects = new Array(savedProject);
            localStorage.setItem("projects", JSON.stringify(projects));
            $scope.projects = projects;
        }

        localStorage.removeItem("nameProject");
        localStorage.removeItem("name_project");

        var savedProjects = localStorage.getItem("projects");
        if (savedProjects == null) {
            projects = new Array();
            localStorage.setItem("projects", JSON.stringify(projects));
        }
    }

    function createSpinner() {
        var opts = {
            lines: 13, length: 20, width: 10, radius: 30, corners: 1, rotate: 0,
            direction: 1, color: "#000", speed: 1, trail: 60, shadow: false, hwaccel: false,
            className: "spinner", zIndex: 2e9, top: "87%", left: "36%", scale: 0.2
        };
        new Spinner(opts).spin($("#spinner")[0]);
    }

    function setLabel() {
        $("#version").text("v" + chrome.runtime.getManifest().version);
        $(".name-project label").text(chrome.i18n.getMessage("txt_project_name_i18n"));
        $(".name-project input").prop("placeholder", chrome.i18n.getMessage("txt_placeholder_project_name_i18n"));
        $(".name-project button").prop("title", chrome.i18n.getMessage("btn_remove_project_i18n"));
        $(".start-date label").text(chrome.i18n.getMessage("txt_start_date_i18n"));
        $(".end-date label").text(chrome.i18n.getMessage("txt_end_date_i18n"));
        $("#today").prop("label", chrome.i18n.getMessage("txt_today_i18n"));
        $("#seven_days").prop("label", chrome.i18n.getMessage("txt_seven_days_i18n"));
        $("#month").prop("label", chrome.i18n.getMessage("txt_month_i18n"));
        $("#year").prop("label", chrome.i18n.getMessage("txt_year_i18n"));
        $("#previous_month").prop("label", chrome.i18n.getMessage("txt_previous_month_i18n"));
        $(".downloads").text(chrome.i18n.getMessage("txt_download_i18n"));
        $(".operational_system").text(chrome.i18n.getMessage("txt_operational_system_i18n"));
        $(".countries").text(chrome.i18n.getMessage("txt_countries_i18n"));
        $("#top_country").text(chrome.i18n.getMessage("txt_top_country_i18n"));
        $("#top_os").text(chrome.i18n.getMessage("txt_top_os_i18n"));
        $(".percent").text(chrome.i18n.getMessage("txt_percent_download_i18n"));
        $("#btn_find").text(chrome.i18n.getMessage("btn_find_stats_i18n"));
        $("#btn_details").text(chrome.i18n.getMessage("btn_details_i18n"));
        $("#btn_new_filter").text(chrome.i18n.getMessage("btn_new_filter_i18n"));
        $("#btn_tab1").text(chrome.i18n.getMessage("btn_top_i18n"));
        $("#btn_tab2").text(chrome.i18n.getMessage("btn_os_i18n"));
        $("#btn_tab3").text(chrome.i18n.getMessage("btn_country_i18n"));
        $("#btn_tab4").text(chrome.i18n.getMessage("btn_os_by_country_i18n"));
    }

    function convertDate(d) {
        function normalize(s) { return (s < 10) ? "0" + s : s; }
        return [d.getFullYear(), normalize(d.getMonth() + 1), normalize(d.getDate())].join("-");
    }

    function setListDates() {
        var today = new Date();
        $("#today").val(convertDate(today));

        var sevenDays = new Date();
        sevenDays.setDate(today.getDate() - 7);
        $("#seven_days").val(convertDate(sevenDays));

        var month = new Date(today.getFullYear(), today.getMonth(), 1);
        $("#month").val(convertDate(month));

        var year = new Date(today.getFullYear(), 0, 1);
        $("#year").val(convertDate(year));

        var previousMonth = new Date();
        previousMonth.setMonth(today.getMonth() - 1);
        $("#previous_month").val(convertDate(previousMonth));
    }

    function loadChart(stats) {
        var dateChart = ["x"], downloadsChart = [chrome.i18n.getMessage("txt_legend_chart_i18n")];

        for (var i = 0; i < stats.downloads.length; i++) {
            var dateLegend = new Date(stats.downloads[i][0]);
            dateChart.push(convertDate(dateLegend));
            downloadsChart.push(stats.downloads[i][1]);
        }

        c3.generate({
            bindto: "#chartDownloads",
            data: {
                x: "x",
                columns: [
                    dateChart,
                    downloadsChart
                ]
            },
            axis: {
                x: {
                    type: "timeseries",
                    tick: {
                        format: "%Y-%m-%d"
                    }
                },
                y: {
                    tick: {
                        format: d3.format("d")
                    }
                }
            }
        });

        c3.generate({
            bindto: "#chartTopOS",
            size: {
                width: 180,
                height: 180
            },
            data: {
                columns: stats.oses,
                type : "pie"
            },
            legend: {
                hide: true
            }
        });

        c3.generate({
            bindto: "#chartTopCountry",
            size: {
                width: 180,
                height: 180
            },
            data: {
                columns: stats.countries,
                type : "pie"
            },
            legend: {
                hide: true
            }
        });
    }

    function dateDiffInDays(a, b) {
        var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
        var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

        return Math.floor((utc2 - utc1) / ( 1000 * 60 * 60 * 24));
    }

    function setDefaultValues() {
        $scope.stats = null;
        $scope.error = null;
        $scope.containsInfo = false;
        $scope.showChartDownloads = false;
        $scope.showDatails = false;
        $scope.showForm = true;
    }

    function findStats() {

        var linkJson = "https://sourceforge.net/projects/" + $scope.filter.nameProject + "/files/stats/json?start_date="
            + $filter("date")($scope.filter.startDate, "yyyy-MM-dd") + "&end_date=" + $filter("date")($scope.filter.endDate, "yyyy-MM-dd");

        setDefaultValues();
        createSpinner();
        $scope.showSpinner = true;

        $http.get(linkJson).success(function (data) {
            loadChart(data);
            $scope.showSpinner = false;
            $scope.stats = data;
            $scope.containsInfo = true;
            $scope.showChartDownloads = true;
            $scope.showForm = false;

            var projectsLS = JSON.parse(localStorage.getItem("projects"));
            if ($.inArray($scope.filter.nameProject, projectsLS) === -1) {
                projectsLS.push($scope.filter.nameProject);
                localStorage.setItem("projects", JSON.stringify(projectsLS));
                $scope.projects = projectsLS;
                $scope.onChangeNameProject();
            }
        }).error(function () {
            $scope.showSpinner = false;
            setDefaultValues();
            $scope.error = {
                msg: chrome.i18n.getMessage("msg_error_load_json_i18n")
            };
        });
    }

    function validate(clazz, field, msgError) {

        clazz = clazz.concat(" input");
        var el = $(clazz);
        el.removeClass("has-error has-feedback");

        if (field === null || field === "" || field === undefined) {
            el.addClass("has-error has-feedback");
            el.focus();
            $scope.error = {
                msg: msgError
            };
        }
    }

    $scope.removeProject = function () {
        var index = $scope.projects.indexOf($scope.filter.nameProject);
        $scope.projects.splice(index, 1);
        $scope.onChangeNameProject();
        localStorage.setItem("projects", JSON.stringify($scope.projects));
        $scope.filter.nameProject = "";
        $(".name-project input").focus();
    };

    $scope.onChangeNameProject = function () {
        $scope.isProjectValid = $.inArray($scope.filter.nameProject, $scope.projects) === -1;
    };
    
    $scope.validateForm = function () {

        $scope.error = null;

        validate(".end-date", $scope.filter.endDate, chrome.i18n.getMessage("msg_required_end_date_i18n"));
        validate(".start-date", $scope.filter.startDate, chrome.i18n.getMessage("msg_required_start_date_i18n"));
        validate(".name-project", $scope.filter.nameProject, chrome.i18n.getMessage("msg_required_project_name_i18n"));

        if ($scope.error === null) {
            if (dateDiffInDays($scope.filter.startDate, $scope.filter.endDate) < 0) {
                $scope.error = {
                    msg: chrome.i18n.getMessage("msg_start_greater_end_i18n")
                };
                $(".start-date input").focus();
            } else {
               findStats();
            }
        }
    };

    $scope.filter = {
        nameProject: "",
        startDate: new Date(),
        endDate: new Date()
    };

    $scope.projects = JSON.parse(localStorage.getItem("projects"));
    $scope.isProjectValid = true;

    initLocalStorage();
    setLabel();
    setListDates();
    setDefaultValues();
});