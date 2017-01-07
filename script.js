angular.module('studentGradeTable', [])

    .controller('mainCtrl', function (dataService) {
        var ctrl = this;

        //ctrl.student_array = dataService.student_array;

        // Set initial and calculate grade average
        ctrl.avgGrade = 0.00;
        function getAvg(arr) {
            var total = 0;
            if (arr.length === 0) {
                return 0.00;
            } else {
                for (var i = 0; i < arr.length; i++) {
                    total += arr[i].grade;
                }
                return total / arr.length;
            }
        }

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
        this.addStudent = function () {
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
        this.deleteStudent = function (student) {
            console.log(student);
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

    });