angular.module('studentGradeTable', ['focus-if', 'ngAnimate'])

    .controller('mainCtrl', function (dataService) {
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

        // Call service to get student data, then sync array and get grade average and update DOM
        dataService.get()
            .then(
                function (response) {
                    ctrl.student_array = response;
                    ctrl.avgGrade = getAvg(ctrl.student_array);
                });

        // Pass student object (from form inputs) to service to be added, then sync array, get grade average (updates DOM)
        ctrl.addStudent = function (student) {
            if (student !== undefined) {
                if (student.name && student.course && student.grade) {
                    dataService.add(student)
                        .then(
                            function (response) {
                                ctrl.student_array = response;
                                ctrl.avgGrade = getAvg(ctrl.student_array);
                            });
                    // Clear form inputs
                    ctrl.student = {};
                }
            }
        };

        // Pass student object to service to be deleted, then sync array and get grade average (updates DOM)
        ctrl.deleteStudent = function (student) {
            dataService.del(student)
                .then(
                    function (response) {
                        ctrl.student_array = response;
                        ctrl.avgGrade = getAvg(ctrl.student_array);
                    });
        };

        // Pass student object to service to be edited, then sync array and get grade average (updates DOM)
        ctrl.editStudent = function (student, prop, update) {
            // Check if the update is an empty string
            if (update === null || update === '') {
                update = prop === 'name' ? 'No name'
                    : prop === 'course' ? 'No course'
                    : 'No grade'
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
        }

    })

    .service('dataService', function ($http, $q) {

        // Initialize Firebase Database
        var config = {
            apiKey: "AIzaSyC-U6_tmCFDKu20Kmf3dzSaCn340Ze7kQ4",
            authDomain: "ng-sgt.firebaseapp.com",
            databaseURL: "https://ng-sgt.firebaseio.com",
            storageBucket: "ng-sgt.appspot.com",
            messagingSenderId: "552596427770"
        };
        firebase.initializeApp(config);
        // Create reference to Firebase
        var fb = firebase.database();

        var dataService = this;
        dataService.student_array = [];

        // Gets students array from Firebase and returns a promise
        dataService.get = function () {
            var defer = $q.defer();
            fb.ref('students').on('value', function (snapshot) {
                if (snapshot.val() !== null) {
                    // Syncs student_array with 'students' JSON object.
                    dataService.student_array = snapshot.val();
                    // Assigns each dynamically created key to new property 'id' on each object.
                    snapshot.forEach(function (keys) {
                        dataService.student_array[keys.key].id = keys.key;
                    });
                    // Converts JSON object to a numerically indexed array and resolves promise.
                    dataService.student_array = Object.values(dataService.student_array);
                    defer.resolve(dataService.student_array);
                } else {
                    defer.resolve(dataService.student_array);
                }
            });
            return defer.promise;
        };

        // Adds student object as a value of a unique key, generated based on timestamp
        // Pushes it to the last position on Firebase 'students' JSON object and then returns a promise to controller
        dataService.add = function (student) {
            var defer = $q.defer();
            fb.ref('students').push(student)
                .then(
                    function () {
                        defer.resolve(dataService.student_array);
                    });
            return defer.promise;
        };

        // Deletes student object from Firebase based on the object's key which is identical to its 'id' property and then returns a promise to controller
        dataService.del = function (student) {
            var defer = $q.defer();
            fb.ref('students/' + student.id).remove()
                .then(
                    function () {
                        // Clear student array if Firebase data is empty.
                        fb.ref('students').once('value', function (snapshot) {
                            if (snapshot.val() === null) {
                                dataService.student_array = [];
                            }
                        });
                        defer.resolve(dataService.student_array);
                    });
            return defer.promise;
        };

        // Updates student object in Firebase based on the object's key which is identical to its 'id' property and then returns a promise to controller
        dataService.edit = function (student) {
            var defer = $q.defer();
            // Delete $$hashKey property from student object before sending to Firebase
            var hashKeyProperty = ['$$hashKey'];
            delete student[hashKeyProperty];
            // Use updateObj to pass key reference to Firebase and avoid object property inception
            var updateObj = {};
            updateObj['students/' + student.id] = student;
            fb.ref().update(updateObj)
                .then(
                    function () {
                        defer.resolve(dataService.student_array);
                    });
            return defer.promise;
        };

    })

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
                $(element).click(function() {
                    // Check if any of the input values are empty
                    if ($(element["0"].offsetParent.children[2]["0"]).val().length === 0 ||
                        $(element["0"].offsetParent.children[2]["1"]).val().length === 0 ||
                        $(element["0"].offsetParent.children[2]["2"]).val().length === 0)
                    {
                        $(element).popover('show');
                        $timeout(function () {
                            $(element).popover('hide');
                        }, 3000);
                    }
                });
            }
        };

    });