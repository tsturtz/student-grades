var app = angular.module('studentGradeTable', []);

app.controller('mainCtrl', function (dataService) {

    var ctrlSelf = this;

    ctrlSelf.student_array = [];
    console.log('student arr: ', ctrlSelf.student_array);
    //call service to get student data
    dataService.get()
        .then(
            function (response) {
                ctrlSelf.student_array = response;
            },
            function (response) {
                console.warn(response);
            });
    console.log('student arr: ', ctrlSelf.student_array);

    //add student object from form inputs
    this.addStudent = function () {
        console.log('add clicked');
        if (ctrlSelf.student.grade >= 0 && ctrlSelf.student.grade <= 100 && ctrlSelf.student.grade) {
            dataService.add(this.student)
                .then(
                    function (response) {
                        ctrlSelf.student_array = response;
                    },
                    function (response) {
                        console.warn(response);
                    });
            ctrlSelf.student = {};
        } else {
            // TODO: better form validation
            console.warn('please enter a number between 0 and 100');
        }
        ctrlSelf.student_array = dataService.student_array;
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
                    ctrlSelf.student_array = response;
                },
                function (response) {
                    console.warn(response);
                });
        ctrlSelf.student_array = dataService.student_array;
    };

});

app.service('dataService', function ($http, $q) {
    var dataServiceSelf = this;
    var student = {};

    dataServiceSelf.student_array = [];

    dataServiceSelf.get = function () {
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
                    dataServiceSelf.student_array = response.data.data;
                    console.log('student array', dataServiceSelf.student_array);
                    defer.resolve(dataServiceSelf.student_array);
                },
                function (response) {
                    console.log('failed to GET student data');
                    defer.reject('failed to GET student data');
                }
            );
        return defer.promise;
    };

    dataServiceSelf.add = function (student) {
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
                    dataServiceSelf.student_array.push(student); // push new student object into array
                    dataServiceSelf.update(); // returns student array to update view
                    defer.resolve(dataServiceSelf.student_array);
                },
                function (response) {
                    console.log('failed to ADD student data');
                    defer.reject('failed to ADD student data');
                }
            );
        return defer.promise;
    };

    dataServiceSelf.del = function (student) {
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
                    console.log(dataServiceSelf.student_array);
                    console.warn(dataServiceSelf.student_array.indexOf(student));
                    dataServiceSelf.student_array.splice(dataServiceSelf.student_array.indexOf(student), 1); // remove student object from array
                    dataServiceSelf.update(); // returns student array to update view
                    defer.resolve(dataServiceSelf.student_array);
                },
                function (response) {
                    console.log('failed to DELETE student data');
                    defer.reject('failed to DELETE student data');
                }
            );
        return defer.promise;
    };

    dataServiceSelf.update = function () {
        console.log('update', dataServiceSelf.student_array);
        return dataServiceSelf.student_array;
    }

});