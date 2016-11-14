var app = angular.module('studentGradeTable', []);

app.controller('mainCtrl', function (dataService) {

    this.getStudents = function () {
        dataService.get(function (response) {
            var responseData = response.data;
            console.log('response received: ', responseData);
            for (var i = 0; i < responseData.length; i++) {
                var student = {
                    name: responseData[i].name,
                    course: responseData[i].course,
                    grade: responseData[i].grade,
                    id: responseData[i].id
                };
                student_array.push(student);
                console.log('student array', student_array);
            }
            student = {};
        });
    };

    this.addStudent = function () {
        console.log('add clicked');
        dataService.add(this.student);
        student = {};
    };

    this.deleteStudent = function () {
        console.log('delete clicked');
        dataService.delete(this.student, function (response) {
            var responseData = response.data;
            student_array.splice(student);
        });
    };

});

app.service('dataService', function ($http) {
    var dataServiceSelf = this;

    var student = {};
    var student_array = [];

    this.get = function () {
        $http({
            data: {api_key: 'BmjoMo3MLu'},
            dataType: 'json',
            method: 'post',
            url: 'https://s-apis.learningfuze.com/sgt/get',
            cache: false
        })
            .then(
                function (callback) {
                    console.log('got student data');
                },
                function (response) {
                    console.log('failed to GET student data');
                }
            );
    };

    this.add = function (student) {
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
                    student = {
                        name: student.name,
                        course: student.course,
                        grade: student.grade,
                        id: responseData.new_id
                    };
                    console.log('student array: ', student_array);
                    student_array.push(student);
                    console.log('student array: ', student_array);
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
                function (callback) {
                    var responseData = response.data;
                    console.log('response received: ', responseData);
                },
                function (response) {
                    console.log('failed to DELETE student data');
                }
            );
    };

});

//this.student_array.push(this.student);
//this.student = {};