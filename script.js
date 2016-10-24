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

/**
 * applyClickHandlers - After document has loaded, add click handlers
 */

function applyClickHandlers() {
    /**
     * addClicked - Event Handler when user clicks the add button
     */
    $('.btn-success').click(addStudent);
    /**
     * cancelClicked - Event Handler when user clicks the cancel button, should clear out student form
     */
    $('.btn-default').click(clearAddStudentForm);
}

/**
 * addStudent - creates a student object based on input fields in the form and adds the object to global student array
 *
 * @return undefined
 */
function addStudent() {
    console.log('add student clicked');
    if ($('#studentName').val() == '' || $('#course').val() == '' || $('#studentGrade').val() == '') {
        alert('please enter all information');
    }
    else {
        var studentObject = {
            name: $('#studentName').val(),
            course: $('#course').val(),
            grade: Number($('#studentGrade').val())
        };
        console.log(studentObject);
        student_array.push(studentObject);
        console.log(student_array);
        updateData();
        clearAddStudentForm();
    }
}
/**
 * clearAddStudentForm - clears out the form values based on inputIds variable
 */
function clearAddStudentForm() {
    console.log('clear student clicked');
    $('#studentName').val('');
    $('#course').val('');
    $('#studentGrade').val('');
    console.log('cleared');
}
/**
 * calculateAverage - loop through the global student array and calculate average grade and return that value
 * @returns {number}
 */
function calculateAverage() {
    var totalGrades = 0;
    for (var i = 0; i < student_array.length; i++) {
        totalGrades += student_array[i].grade;
    }
    console.log(totalGrades);
    averageGrade = totalGrades / student_array.length;
    $('.avgGrade').text(averageGrade);
    return averageGrade;
}
/**
 * updateData - centralized function to update the average and call student list update
 */
function updateData() {
    calculateAverage();
    updateStudentList();
}
/**
 * updateStudentList - loops through global student array and appends each objects data into the student-list-container > list-body
 */
function updateStudentList() {
    for (var i = 0; i < student_array.length; i++) {
        addStudentToDom(student_array[i]);
    }
}
/**
 * addStudentToDom - take in a student object, create html elements from the values and then append the elements
 * into the .student_list tbody
 * @param studentObj
 */
function addStudentToDom(studentObj) {
    $('.list-body').append('<tr>');
    $('.list-body > tr:last').append('<td>');
    $('.list-body tr td:last').text(studentObj.name);
    $('.list-body > tr:last').append('<td>');
    $('.list-body tr td:last').text(studentObj.course);
    $('.list-body > tr:last').append('<td>');
    $('.list-body tr td:last').text(studentObj.grade);
    $('.list-body > tr:last').append('<button>');
    $('.list-body tr button').addClass('btn btn-danger').text('Delete');
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
});