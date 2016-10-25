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
stud_vars = ['#studentName', '#course', '#studentGrade'];
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
    if ($(stud_vars[0]).val() == '' || $(stud_vars[1]).val() == '' || $(stud_vars[2]).val() == '') {
        alert('please enter all information');
    }
    else {
        var studentObject = {
            name: $(stud_vars[0]).val(),
            course: $(stud_vars[1]).val(),
            grade: Number($(stud_vars[2]).val())
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
    $(stud_vars[0]).val('');
    $(stud_vars[1]).val('');
    $(stud_vars[2]).val('');
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
    // If empty, clear the <h2>: 'User Info Unavailable' AND do the same stuff that's in the else statement
    if (student_array.length === 1){
        $('.clear-after-entry').hide();
        $('.list-body').empty(); // Empty the tbody DOM elements before re-adding everything in the student array
        for (var i = 0; i < student_array.length; i++) {
            addStudentToDom(student_array[i]);
        }
    } else {
        $('.list-body').empty(); // Empty the tbody DOM elements before re-adding everything in the student array
        for (var i = 0; i < student_array.length; i++) {
            addStudentToDom(student_array[i]);
        }
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
    var s_button = $('<button>').addClass('btn btn-danger').text('Delete');
    $('.list-body').append(s_row);
    $('.list-body > tr:last').append(s_name).append(s_course).append(s_grade).append(s_button);
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