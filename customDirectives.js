angular.module('studentGradeTable')

    // Create Bootstrap tooltip directive to be used on table cells
    .directive('tooltip', function () {
        return {
            restrict: 'A',
            link: function (scope, element) {
                $(element).tooltip({delay: {show: 1000, hide: 500}, animation: true});
            }
        };
    })

    // Create Bootstrap popover directive for form validation
    .directive('popover', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                $(element).click(function () {
                    // Check if any of the input values are empty
                    if ($(element["0"].offsetParent.children[2]["0"]).val().length === 0 ||
                        $(element["0"].offsetParent.children[2]["1"]).val().length === 0 ||
                        $(element["0"].offsetParent.children[2]["2"]).val().length === 0) {
                        $(element).popover('show');
                        $timeout(function () {
                            $(element).popover('hide');
                        }, 2000);
                    }
                });
            }
        };

    });