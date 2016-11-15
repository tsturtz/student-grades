var app = angular.module('studentGradeTable', []);

app.controller('mainCtrl', function (dataService) {

    var ctrlSelf = this;

    this.student_array = [];
    console.log('student arr: ', this.student_array);
    dataService.get()
        .then(
            function (response) {
                ctrlSelf.student_array = response;
            },
            function (response) {
                console.warn(response);
            }); // call get service to populate grade table
    console.log('student arr: ', this.student_array);

    this.addStudent = function () {
        console.log('add clicked');
        if (this.student.grade >= 0 && this.student.grade <= 100) {
            dataService.add(this.student);
        } else {
            console.warn('please enter a number');
        }
        this.student = {};
        this.student_array = dataService.student_array;
    };

    this.deleteStudent = function () {
        console.log('delete clicked');
        dataService.delete(this.student, function (response) {
            var responseData = response.data;
            student_array.splice(student);
        });
    };

});

app.service('dataService', function ($http, $q) {
    var dataServiceSelf = this;
    var student = {};

    this.student_array = [];

    this.get = function () {
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

    this.add = function (student) {
        console.log('student passed to service is: ', student);
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
                    console.log('student array: ', student_array);
                    console.log('response received');
                    var responseData = response.data;
                    console.log('response data: ', responseData);
                    student.id = responseData.new_id; // set id property returned from server to student id property
                    console.log('student array: ', student_array);
                    dataServiceSelf.student_array.push(student); // push new student object into array
                    console.log('student array: ', student_array);
                    dataServiceSelf.update(); // returns student array to update view
                },
                function (response) {
                    console.log('failed to ADD student data');
                }
            );
    };

    this.del = function (student) {
        $http({
            data: {api_key: 'BmjoMo3MLu', student_id: student.id},
            dataType: 'json',
            method: 'post',
            url: 'https://s-apis.learningfuze.com/sgt/delete',
            cache: false
        })
            .then(
                function (response) {
                    var responseData = response.data;
                    console.log('response received: ', responseData);
                },
                function (response) {
                    console.log('failed to DELETE student data');
                }
            );
    };

    this.update = function () {
        console.log('update', dataServiceSelf.student_array);
        return dataServiceSelf.student_array;
    }

});