var app = angular.module('studentGradeTable', []);

app.controller('mainCtrl', function (dataService) {
    var ctrl = this;
    ctrl.student_array = [];
    ctrl.avgGrade = 0.00;
    function getAvg(arr) {
        var total = 0;
        for (var i=0; i<arr.length; i++) {
            total += arr[i].grade;
        }
        return total / arr.length;
    }
    console.log('student arr: ', ctrl.student_array);

    //call service to get student data
    dataService.get()
        .then(
            function (response) {
                ctrl.student_array = response;
                ctrl.avgGrade = getAvg(ctrl.student_array);
            },
            function (response) {
                console.warn(response);
            });
    console.log('student arr: ', ctrl.student_array);

    //add student object from form inputs
    this.addStudent = function () {
        console.log('add clicked');
        if (ctrl.student.grade >= 0 && ctrl.student.grade <= 100 && ctrl.student.grade) {
            dataService.add(this.student)
                .then(
                    function (response) {
                        ctrl.student_array = response;
                        ctrl.avgGrade = getAvg(ctrl.student_array);
                    },
                    function (response) {
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
        console.log('delete clicked');
        console.info(student);
        dataService.del(student, function (response) {
            var responseData = response.data;
        })
            .then(
                function (response) {
                    ctrl.student_array = response;
                    ctrl.avgGrade = getAvg(ctrl.student_array);
                },
                function (response) {
                    console.warn(response);
                });
        ctrl.student_array = dataService.student_array;
    };

});

app.service('dataService', function ($http, $q) {
    var dataService = this;
    var student = {};
    dataService.student_array = [];

    dataService.get = function () {
        var defer = $q.defer();
        $http({
            data: $.param({api_key: 'BmjoMo3MLu'}),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            dataType: 'json',
            method: 'post',
            url: 'https://s-apis.learningfuze.com/sgt/get',
            cache: false
        })
            .then(
                function (response) {
                    console.log('got student data');
                    dataService.student_array = response.data.data;
                    console.log('student array', dataService.student_array);
                    defer.resolve(dataService.student_array);
                },
                function (response) {
                    console.log('failed to GET student data');
                    defer.reject('failed to GET student data');
                }
            );
        return defer.promise;
    };

    dataService.add = function (student) {
        console.log('student passed to service is: ', student);
        var defer = $q.defer();
        var addData = {
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
                    console.log('response received');
                    var responseData = response.data;
                    console.log('response data: ', responseData);
                    student.id = responseData.new_id; // set id property returned from server to student id property
                    dataService.student_array.push(student); // push new student object into array
                    defer.resolve(dataService.student_array);
                },
                function (response) {
                    console.log('failed to ADD student data');
                    defer.reject('failed to ADD student data');
                }
            );
        return defer.promise;
    };

    dataService.del = function (student) {
        var defer = $q.defer();
        $http({
            data: $.param({api_key: 'BmjoMo3MLu', student_id: student.id}),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            dataType: 'json',
            method: 'post',
            url: 'https://s-apis.learningfuze.com/sgt/delete',
            cache: false
        })
            .then(
                function (response) {
                    var responseData = response.data;
                    console.log('response received: ', responseData);
                    console.log(dataService.student_array);
                    console.warn(dataService.student_array.indexOf(student));
                    dataService.student_array.splice(dataService.student_array.indexOf(student), 1); // remove student object from array
                    defer.resolve(dataService.student_array);
                },
                function (response) {
                    console.log('failed to DELETE student data');
                    defer.reject('failed to DELETE student data');
                }
            );
        return defer.promise;
    };

    dataService.update = function () {
        console.log('update', dataService.student_array);
        return dataService.student_array;
    }

});