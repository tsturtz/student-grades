angular.module('studentGradeTable')

// Create Bootstrap tooltip directive to be used on table cells
    .directive('tooltip', function () {
        return {
            restrict: 'A',
            link: function (scope, element) {
                $(element).tooltip({delay: {show: 1500, hide: 500}, animation: true});
            }
        };
    })

    // Bootstrap popover for form validation on name input
    .directive('popoverName', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                var addButton = element["0"].parentElement.offsetParent.children[2].lastElementChild.children["0"];
                $(addButton).click(createPopover);
                $(element).keypress(function (event) {
                    var keycode = (event.keyCode ? event.keyCode : event.which);
                    if (keycode === 13) {
                        $(addButton).trigger('click');
                    }
                });
                function createPopover() {
                    // Check if value is empty
                    if (element.val().length === 0) {
                        $(element).popover({trigger: 'manual', content: 'Please enter a name'});
                    }
                    $(element).popover('show');
                    $timeout(function () {
                        $(element).popover('destroy');
                    }, 2800);
                }
            }
        };
    })

    // Bootstrap popover for form validation on course input
    .directive('popoverCourse', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                var addButton = element["0"].parentElement.offsetParent.children[2].lastElementChild.children["0"];
                $(addButton).click(createPopover);
                $(element).keypress(function (event) {
                    var keycode = (event.keyCode ? event.keyCode : event.which);
                    if (keycode === 13) {
                        $(addButton).trigger('click');
                    }
                });
                function createPopover() {
                    // Check if value is empty
                    if (element.val().length === 0) {
                        $(element).popover({trigger: 'manual', content: 'Please enter a course'});
                    }
                    $(element).popover('show');
                    $timeout(function () {
                        $(element).popover('destroy');
                    }, 2900);
                }
            }
        };
    })

    // Bootstrap popover for form validation on grade input
    .directive('popoverGrade', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                var addButton = element["0"].parentElement.offsetParent.children[2].lastElementChild.children["0"];
                $(addButton).click(createPopover);
                $(element).keypress(function (event) {
                    var keycode = (event.keyCode ? event.keyCode : event.which);
                    if (keycode === 13) {
                        $(addButton).trigger('click');
                    }
                });
                function createPopover() {
                    // Check if value is empty or less than 0 or greater than 100
                    if (element.val().length === 0) {
                        $(element).popover({trigger: 'manual', content: 'Please enter a grade'});
                        $(element).popover('show');
                    } else if (element.val() < 0) {
                        $(element).popover({trigger: 'manual', content: 'Grade can\'t be less than 0'});
                        $(element).popover('show');
                    } else if (element.val() > 100) {
                        $(element).popover({trigger: 'manual', content: 'Grade can\'t be greater than 100'});
                        $(element).popover('show');
                    }
                    $timeout(function () {
                        $(element).popover('destroy');
                    }, 3000);
                }
            }
        };
    });
