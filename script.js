angular.module('studentGradeTable', [])

    .controller('mainCtrl', function (dataService, $scope) {
        var ctrl = this;
        var fb = firebase.database();

        ctrl.student_array = dataService.student_array;
        ctrl.avgGrade = 0.00;
        function getAvg(arr) {
            var total = 0;
            for (var i = 0; i < arr.length; i++) {
                total += arr[i].grade;
            }
            return total / arr.length;
        }

        //call service to get student data
        dataService.get()
            .then(
                function (response) {
                    ctrl.student_array = response;
                    ctrl.avgGrade = getAvg(ctrl.student_array);
                },
                function (response) {
                    // TODO: better error handling
                    console.warn(response);
                });

        //add student object from form inputs
        this.addStudent = function () {
            if (ctrl.student.grade >= 0 && ctrl.student.grade <= 100 && ctrl.student.grade) {
                dataService.add(ctrl.student)
                    .then(
                        function (response) {
                            console.log(response);
                            ctrl.student_array = response;
                            ctrl.avgGrade = getAvg(ctrl.student_array);
                        },
                        function (response) {
                            // TODO: better error handling
                            console.warn(response);
                        });
                ctrl.student = {};
            } else {
                // TODO: better form validation
                console.warn('please enter a number between 0 and 100');
            }
            ctrl.student_array = dataService.student_array;
        };

        //delete student object
        this.deleteStudent = function (student) {
            console.log(student);
            dataService.del(student)
                .then(
                    function (response) {
                        ctrl.student_array = response;
                        ctrl.avgGrade = getAvg(ctrl.student_array);
                    },
                    function (response) {
                        // TODO: better error handling
                        console.warn(response);
                    });
            ctrl.student_array = dataService.student_array;
        };

    })

    .service('dataService', function ($http, $q) {

        var fb = firebase.database();

        var dataService = this;
        dataService.student_array = [];

        dataService.get = function () {
            var defer = $q.defer();
            fb.ref('students').on('value', function (snapshot) {
                dataService.student_array = snapshot.val();
                snapshot.forEach(function (childSnapshot) {
                    dataService.student_array[childSnapshot.key].id = childSnapshot.key;
                });
                dataService.student_array = Object.values(dataService.student_array); // Convert JSON object to array
                console.info(dataService.student_array);
                defer.resolve(dataService.student_array);
            });
            return defer.promise;
        };

        dataService.add = function (student) {
            var defer = $q.defer();

            fb.ref('students').push(student)
                .then(
                    function (response) {
                        //student.id = response.data.new_id; // set id property returned from server to student id property
                        defer.resolve(dataService.student_array);
                    },
                    function (err) {
                        // TODO: better error handling
                        console.log('failed to ADD student data', err);
                        defer.reject('failed to ADD student data', err);
                    });

            /*var addData = {
             api_key: 'BmjoMo3MLu',
             name: student.name,
             course: student.course,
             grade: student.grade
             };
             $http({
             data: $.param(addData),
             headers: {'Content-Type': 'application/x-www-form-urlencoded'},
             dataType: 'json',
             method: 'post',
             url: 'https://s-apis.learningfuze.com/sgt/create',
             cache: false
             })
             .then(
             function (response) {
             student.id = response.data.new_id; // set id property returned from server to student id property
             dataService.student_array.push(student); // push new student object into array
             defer.resolve(dataService.student_array);
             },
             function (response) {
             // TODO: better error handling
             console.log('failed to ADD student data');
             defer.reject('failed to ADD student data');
             }
             );*/
            return defer.promise;
        };

        dataService.del = function (student) {
            var defer = $q.defer();

            fb.ref('students/' + student.id).remove()
                .then(
                    function (response) {
                        //student.id = response.data.new_id; // set id property returned from server to student id property
                        defer.resolve(dataService.student_array);
                    },
                    function (err) {
                        // TODO: better error handling
                        console.log('failed to DEL student data', err);
                        defer.reject('failed to DEL student data', err);
                    });

            /*$http({
             data: $.param({api_key: 'BmjoMo3MLu', student_id: student.id}),
             headers: {'Content-Type': 'application/x-www-form-urlencoded'},
             dataType: 'json',
             method: 'post',
             url: 'https://s-apis.learningfuze.com/sgt/delete',
             cache: false
             })
             .then(
             function (response) {
             dataService.student_array.splice(dataService.student_array.indexOf(student), 1); // remove student object from array
             defer.resolve(dataService.student_array);
             },
             function (response) {
             // TODO: better error handling
             console.log('failed to DELETE student data');
             defer.reject('failed to DELETE student data');
             }
             );*/
            return defer.promise;
        };

    });