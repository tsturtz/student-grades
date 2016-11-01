/**
 * Define all global variables here
 */

var averageGrade = 0;

/**
 * student_array - global array to hold student objects
 * @type {Array}
 */

var student_array = [];

/**
 * inputIds - id's of the elements that are used to add students
 * @type {string[]}
 */

student_vars = ['#studentName', '#course', '#studentGrade'];

/**
 * applyClickHandlers - After document has loaded, add click handlers
 */

function applyClickHandlers() {
    /**
     * addClicked - Event Handler when user clicks the add button
     */
    $('.add-btn').click(addStudent);
    /**
     * cancelClicked - Event Handler when user clicks the cancel button, should clear out student form
     */
    $('.cancel-btn').click(clearAddStudentForm);
    /**
     * getDataClicked - Event Handler when user clicks the get server data button
     */
    //$('.getdata-btn').click(getServerData);
    /**
     * deleteClicked - Event Handler when user clicks the delete button
     */
    $('.list-body').on('click', '.delete-btn', function () {
        var delete_id = $(this).attr('id'); // index of the row item associated with the student array
        console.log(delete_id);
        removeStudent(delete_id);
    });
}

/**
 * addStudent - creates a student object based on input fields in the form and adds the object to global student array
 *
 * @return undefined
 */
function addStudent() {
    if ($(student_vars[0]).val() == '' || $(student_vars[1]).val() == '' || $(student_vars[2]).val() == '') {
    alert('please enter all information');
    }
    else if ($(student_vars[2]).val() < 0 || $(student_vars[2]).val() > 100 || isNaN($(student_vars[2]).val()) == true) {
    alert('please enter a number between 0 and 100');
    }
    else {
        var data_object = {
            api_key: 'BmjoMo3MLu',
            name: $(student_vars[0]).val(),
            course: $(student_vars[1]).val(),
            grade: ($(student_vars[2]).val())
        };
        $.ajax({
            data: data_object,
            dataType: 'json',
            method: 'post',
            url: 'https://s-apis.learningfuze.com/sgt/create',
            success: function (response) {
                var studentObject = {
                    name: $(student_vars[0]).val(),
                    course: $(student_vars[1]).val(),
                    grade: ($(student_vars[2]).val()),
                    id: response.new_id
                };
                student_array.push(studentObject);
                console.log(student_array);
                updateData();
                clearAddStudentForm();
            }
        });
    }
    /*if ($(student_vars[0]).val() == '' || $(student_vars[1]).val() == '' || $(student_vars[2]).val() == '') {
        alert('please enter all information');
    }
    else if ($(student_vars[2]).val() < 0 || $(student_vars[2]).val() > 100 || isNaN($(student_vars[2]).val()) == true) {
        alert('please enter a number between 0 and 100');
    }
    else {
        var studentObject = {
            name: $(student_vars[0]).val(),
            course: $(student_vars[1]).val(),
            grade: Number($(student_vars[2]).val()),
            id: student_array.length
        };
        console.log(studentObject);
        student_array.push(studentObject);
        console.log(student_array);
        updateData();
        clearAddStudentForm();
    }*/
}
/**
 * clearAddStudentForm - clears out the form values based on inputIds variable
 */
function clearAddStudentForm() {
    console.log('clear student clicked');
    $(student_vars[0]).val('');
    $(student_vars[1]).val('');
    $(student_vars[2]).val('');
    console.log('cleared');
}

/**
 * removeStudent - removes the student which the user has clicked the delete button
 */

function removeStudent(delete_id) {
    var data_object = {
        api_key: 'BmjoMo3MLu',
        student_id: delete_id
    };
    console.log('data obj is :', data_object);
    $.ajax({
        data: data_object,
        dataType: 'json',
        method: 'post',
        url: 'https://s-apis.learningfuze.com/sgt/delete',
        success: function (response) {
            console.log(student_array);
            updateData();
            student_array.splice(delete_id, 1); // remove from student_array
            console.log(student_array);
            if (student_array.length === 0) {
                $('.clear-after-entry').show();
            }
        }
    });
}

/**
 * getServerData - get and parse data from server
 */

function getServerData() {
    console.log('getserverdata clicked');
    var data_object = {
        api_key: 'BmjoMo3MLu'
    };
    $.ajax({
        data: data_object,
        dataType: 'json',
        method: 'post',
        url: 'https://s-apis.learningfuze.com/sgt/get',
        success: function (response) {
            console.log('response received: ', response);
            var responseData = response.data;
            console.log(responseData);
            for (var i = 0; i < responseData.length; i++) {
                var studentObject = {
                    name: responseData[i].name,
                    course: responseData[i].course,
                    grade: responseData[i].grade,
                    id: responseData[i].id
                };
                student_array.push(studentObject);
                console.log(student_array);
                updateData();
                clearAddStudentForm();
            }
        }
    });
}

/**
 * calculateAverage - loop through the global student array and calculate average grade and return that value
 * @returns {number}
 */
function calculateAverage() {
    var totalGrades = 0;
    var averageGrade = 0;
    var appendGrade = $('.avgGrade').text(averageGrade);
    if (student_array.length === 0) {
        averageGrade = 0;
        $(appendGrade).text(averageGrade.toFixed(2));
        return averageGrade.toFixed(2);
    }
    else {
        for (var i = 0; i < student_array.length; i++) {
            totalGrades += student_array[i].grade;
        }
        averageGrade = totalGrades / student_array.length;
        $(appendGrade).text(averageGrade.toFixed(2));
        return averageGrade.toFixed(2);
    }
}
/**
 * updateData - centralized function to update the average and call student list update
 */
function updateData() {
    updateStudentList();
    calculateAverage();
}
/**
 * updateStudentList - loops through global student array and appends each objects data into the student-list-container > list-body
 */
function updateStudentList() {
    // If empty, clear the <h2>: 'User Info Unavailable' AND do the same stuff that's in the else statement
    if (student_array.length === 1) {
        $('.clear-after-entry').hide();
        $('.list-body').empty(); // Empty the tbody DOM elements before re-adding everything in the student array
    }
    $('.list-body').empty(); // Empty the tbody DOM elements before re-adding everything in the student array
    for (var i = 0; i < student_array.length; i++) {
        //student_array[i].id = i;
        addStudentToDom(student_array[i]);
    }
}
/**
 * addStudentToDom - take in a student object, create html elements from the values and then append the elements
 * into the .student_list tbody
 * @param studentObj
 */
function addStudentToDom(studentObj) {
    var s_row = $('<tr>');
    var s_name = $('<td>').text(studentObj.name);
    var s_course = $('<td>').text(studentObj.course);
    var s_grade = $('<td>').text(studentObj.grade);
    var s_button = $('<button>').addClass('btn btn-danger delete-btn').text('Delete').attr('id', studentObj.id);
    var s_button_td = $('<td>').append(s_button);
    $('.list-body').append(s_row);
    $('.list-body > tr:last').append(s_name).append(s_course).append(s_grade).append(s_button_td);
}
/**
 * reset - resets the application to initial state. Global variables reset, DOM get reset to initial load state
 */
function reset() {
    student_array = [];
    averageGrade = 0;
    $('.list-body').empty();
    clearAddStudentForm();
    $('.avgGrade').text('0');
}
/**
 * Listen for the document to load and reset the data to the initial state
 */
$(document).ready(function () {
    applyClickHandlers();
    getServerData();
});