angular.module('studentGradeTable')

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

    });