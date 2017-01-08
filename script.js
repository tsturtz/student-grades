angular.module('studentGradeTable', ['focus-if', 'ngAnimate'])

    .controller('mainCtrl', function (dataService) {
        var ctrl = this;

        // Set initial and calculate grade average
        ctrl.avgGrade = 0.00;
        function getAvg(arr) {
            var total = 0;
            var countOfNaNs = 0;
            if (arr.length === 0) {
                return 0.00;
            } else {
                for (var i = 0; i < arr.length; i++) {
                    if (isNaN(arr[i].grade)) {
                        countOfNaNs++;
                        console.log('student removed from grade average calculation because of NaN grade property: ', arr[i].name)
                    } else {
                        total += arr[i].grade;
                    }
                }
                var result = total / (arr.length - countOfNaNs);
                // Set color scale for grade average: 0 is grey, < 70 is red, < 85 is orange, >= 85 is green
                ctrl.avgGradeColor = result >= 90 ? 'label-success'
                    : result >= 80 ? 'label-info'
                    : result >= 70 ? 'label-warning'
                    : result >= 1 ? 'label-danger'
                    : 'label-default';
                return result;
            }
        }

        // Set initial sort order and logic for orderBy param clicked
        ctrl.order = '-grade';
        ctrl.orderItems = function (orderBy) {
            ctrl.order = orderBy === ctrl.ordered ? '-' + orderBy : orderBy;
            ctrl.ordered = ctrl.order;
        };

        // Call service to get student data, then sync array and get grade average (updates DOM).
        dataService.get()
            .then(
                function (response) {
                    ctrl.student_array = response;
                    ctrl.avgGrade = getAvg(ctrl.student_array);
                },
                function (err) {
                    // TODO: better error handling
                    console.warn(err);
                });

        // Pass student object (from form inputs) to service to be added, then sync array and get grade average (updates DOM).
        ctrl.addStudent = function () {
            if (ctrl.student.grade === 0 || ctrl.student.grade > 0 && ctrl.student.grade <= 100 && ctrl.student.grade) {
                dataService.add(ctrl.student)
                    .then(
                        function (response) {
                            ctrl.student_array = response;
                            ctrl.avgGrade = getAvg(ctrl.student_array);
                        },
                        function (err) {
                            // TODO: better error handling
                            console.warn(err);
                        });
                // Clear form inputs
                ctrl.student = {};
            } else {
                // TODO: better form validation
                console.warn('you entered ' + '"' + ctrl.student.grade + '"' + ' -- please enter a number between 0 and 100, inclusive');
            }
        };

        // Pass student object to service to be deleted, then sync array and get grade average (updates DOM).
        ctrl.deleteStudent = function (student) {
            dataService.del(student)
                .then(
                    function (response) {
                        ctrl.student_array = response;
                        ctrl.avgGrade = getAvg(ctrl.student_array);
                    },
                    function (err) {
                        // TODO: better error handling
                        console.warn(err);
                    });
        };

        ctrl.editStudent = function (student, prop, update) {
            console.log('Student Object: ', student);
            console.log('property being updated: ', prop);
            console.log('updating with: ', update);
            if (update === null || update === undefined) {
                update = prop === 'name' ? 'No name'
                    : prop === 'course' ? 'No course'
                    : 'No grade'
            }
            student[prop] = update;
            console.info('Student Object: ', student);
            dataService.edit(student)
                .then(
                    function (response) {
                        ctrl.student_array = response;
                        ctrl.avgGrade = getAvg(ctrl.student_array);
                    },
                    function (err) {
                        // TODO: better error handling
                        console.warn(err);
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
        var fb = firebase.database();

        var dataService = this;
        dataService.student_array = [];

        // Gets students array from Firebase and returns a promise.
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

        // Adds student object as a value of a unique key, generated based on timestamp. Pushes it to the last position on Firebase 'students' JSON object and then returns a promise to controller.
        dataService.add = function (student) {
            var defer = $q.defer();
            fb.ref('students').push(student)
                .then(
                    function () {
                        defer.resolve(dataService.student_array);
                    },
                    function () {
                        // TODO: better error handling
                        console.log('failed to ADD student data');
                        defer.reject('failed to ADD student data');
                    });
            return defer.promise;
        };

        // Deletes student object from Firebase based on the object's key which is identical to its 'id' property and then returns a promise to controller.
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
                    },
                    function () {
                        // TODO: better error handling
                        console.log('failed to DEL student data');
                        defer.reject('failed to DEL student data');
                    });
            return defer.promise;
        };

        // Updates student object in Firebase based on the object's key which is identical to its 'id' property and then returns a promise to controller.
        dataService.edit = function (student) {
            var defer = $q.defer();
            // Delete $$hashKey property from student object before sending to Firebase.
            var hashKeyProperty = ['$$hashKey'];
            delete student[hashKeyProperty];
            // Use updateObj to pass key reference to Firebase and avoid object property inception.
            var updateObj = {};
            updateObj['students/' + student.id] = student;
            fb.ref().update(updateObj)
                .then(
                    function () {
                        defer.resolve(dataService.student_array);
                    },
                    function () {
                        // TODO: better error handling
                        console.log('failed to EDIT student data');
                        defer.reject('failed to EDIT student data');
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
    });