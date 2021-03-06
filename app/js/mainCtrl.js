angular.module('studentGradeTable')

    .controller('mainCtrl', function (dataService, $timeout) {
        var ctrl = this;

        // Calculate grade average
        ctrl.avgGrade = 0.00;
        function getAvg(arr) {
            var total = 0;
            var countOfNaNs = 0;
            // Check if there is anything to calculate an average on
            if (arr.length === 0) {
                return 0.00;
            } else {
                for (var i = 0; i < arr.length; i++) {
                    // Check if grade is NaN to omit it from grade average calculation
                    if (isNaN(arr[i].grade)) {
                        countOfNaNs++;
                    } else {
                        total += arr[i].grade;
                    }
                }
                var result = total / (arr.length - countOfNaNs);
                // Assign color-scale classes based on grade average calculation result
                // Less than 70 is red, 70-80 is orange, 80-90 is blue, over 90 is green.
                ctrl.avgGradeColor = result === 'No grade' ? 'emptyClass'
                    : result >= 90 ? 'label-success'
                    : result >= 80 ? 'label-info'
                    : result >= 70 ? 'label-warning'
                    : result >= 1 ? 'label-danger'
                    : 'label-default';
                return result;
            }
        }

        // Set color scale for students' grades
        // Less than 70 is red, 70-80 is orange, 80-90 is blue, over 90 is green.
        ctrl.getGradeColor = function (grade) {
            ctrl.gradeColor = grade === 'No grade' ? 'emptyClass'
                : grade >= 90 ? 'label-success'
                : grade >= 80 ? 'label-info'
                : grade >= 70 ? 'label-warning'
                : grade >= 1 ? 'label-danger'
                : 'label-default';
            return ctrl.gradeColor;
        };

        // Set initial sort order and logic for orderBy param clicked to sort by Name, Course, or Grade
        ctrl.order = '-grade';
        ctrl.orderItems = function (orderBy) {
            ctrl.order = orderBy === ctrl.ordered ? '-' + orderBy : orderBy;
            ctrl.ordered = ctrl.order;
        };

        ctrl.spinActive = true;
        // Call service to get student data, then sync array and get grade average and update DOM
        dataService.get()
            .then(
                function (response) {
                    ctrl.student_array = response;
                    ctrl.avgGrade = getAvg(ctrl.student_array);
                    ctrl.spinActive = false;
                });

        // Pass student object (from form inputs) to service to be added, then sync array, get grade average (updates DOM), alert user
        ctrl.addStudent = function (student) {
            if (student !== undefined) {
                if (student.name && student.course && (student.grade === 0 || student.grade) && student.grade >= 0 && student.grade <= 100) {
                    dataService.add(student)
                        .then(
                            function (response) {
                                ctrl.student_array = response;
                                ctrl.avgGrade = getAvg(ctrl.student_array);
                                bootbox.alert({
                                    size: 'small',
                                    message: ('<strong>' + student.name + '</strong> was added!'),
                                    backdrop: true
                                });
                            });
                    // Clear form inputs
                    ctrl.student = {};
                }
            }
        };

        // Pass student object to service to be deleted, then sync array and get grade average (updates DOM)
        ctrl.deleteStudent = function (student) {
            // Confirm delete - if unconfirmed, do nothing
            bootbox.confirm({
                title: 'Are you sure?',
                message: ('Do you really want to delete student: <strong class="text-danger">' + student.name + '</strong> ? This cannot be undone.'),
                buttons: {
                    cancel: {
                        label: '<i class="fa fa-times"></i> Cancel'
                    },
                    confirm: {
                        label: '<i class="fa fa-trash-o"></i> Delete',
                        className: 'btn-danger'
                    }
                },
                callback: function (result) {
                    // If confirmed, delete student from database
                    if (result) {
                        dataService.del(student)
                            .then(
                                function (response) {
                                    ctrl.student_array = response;
                                    ctrl.avgGrade = getAvg(ctrl.student_array);
                                    // Alert user that student was deleted
                                    $timeout(function () {
                                        bootbox.alert({
                                            size: 'small',
                                            message: ('<strong class="text-danger">' + student.name + '</strong> was deleted.'),
                                            backdrop: true
                                        });
                                    }, 500);
                                }
                            );
                    }
                }
            });
        };

        // Pass student object to service to be edited, then sync array and get grade average (updates DOM)
        ctrl.editStudent = function (student, prop, update) {
            // Check if the update is an empty string
            if (update === null || update === '') {
                update = prop === 'name' ? 'No name'
                    : prop === 'course' ? 'No course'
                    : 'No grade';
            }
            // Check if there is actually an update, if not, exit the function
            if (update === undefined) {
                return;
            }
            // Rewrite the edited property with the updated value
            student[prop] = update;
            dataService.edit(student)
                .then(
                    function (response) {
                        ctrl.student_array = response;
                        ctrl.avgGrade = getAvg(ctrl.student_array);
                    });
        };

        // Mouse hover IN apply editing icon
        ctrl.hoverIn = function (student, prop) {
            student[prop + 'Hovering'] = true;
        };
        // Mouse hover OUT remove editing icon
        ctrl.hoverOut = function (student, prop) {
            student[prop + 'Hovering'] = false;
        };

    });
