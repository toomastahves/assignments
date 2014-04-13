// Location of server.
var show_request = 'api.php?action=show';
var create_request = 'api.php?action=create';
var update_request = 'api.php?action=update';
var delete_request = 'api.php?action=delete';

// Add datepickers to form fields.
$("#deadline,#deadline_update").datepicker({    
    dateFormat: 'yy-mm-dd',
    showAnim: 'slideDown'
});
$("#deadline,#deadline_update").attr('readOnly', 'true');

// Escape html entities.
var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
};
function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
        return entityMap[s];
    });
}

// Filtering table.
function filter(selector, query) {
    query = $.trim(query); //trim white space
    query = query.replace(/ /gi, '|'); //add OR for regex query
    $(selector).each(function () {(
                $(this).text().search(new RegExp(query, "i")) < 0) ? $(this).hide().removeClass('visible') : $(this).show().addClass('visible');
    });
}
$('tbody tr').addClass('visible');
$('#filter').keyup(function (event) {
    if (event.keyCode === 27 || $(this).val() === '') {
        $(this).val('');
        $('tbody tr').removeClass('visible').show().addClass('visible');
    } else {
        filter('tbody tr', $(this).val());
    }
});

// Make insert form visible.
$(document).on('click', '#show_insert_form_button', function () {
    $(this).css("visibility", "hidden").effect("slide", 500);
    $("#show_insert_form").css("visibility", "visible").effect("slide", 500);
    // Set current date into form.
    var newdate = $.datepicker.formatDate('yy-mm-dd', new Date());
    $('#deadline').val(newdate);
});

// Counts each status occurrences.
function count_statuses() {
    var open = $('tr.success').length;
    var inprogress = $('tr.warning').length;
    var closed = $('tr.danger').length;
    var totalCount = open + inprogress + closed;
    $('#count_results').html("<p>Total: " + totalCount + "; Open: " + open + "; In progress: " + inprogress + "; Closed: " + closed + "</p>");
    if (totalCount === 0) {
        console.log("Counting statuses after all tasks loaded: No data available.");
        $('tbody').prepend("<tr id=\"nodata\"><td colspan=\"5\">No data available.</td></tr>");
    }
    return totalCount;
}

// Adding CSS classes to make things cool.
function apply_stripes_according_to_status(status) {
    var color;
    if (status === 'Open') {
        color = "success";
    }
    if (status === 'In progress') {
        color = "warning";
    }
    if (status === 'Closed') {
        color = "danger";
    }
    return color;
}

// action=show - Loads all tasks into table.
function loadAllTasks() {
    $.getJSON(show_request,
    function (json) {
        if (json.result === "OK") {
            var jsonTasks = json.tasks;
            console.log("Loading tasks, total count: " + jsonTasks.length);
            var i;
            var tasktable;
            for (i = 0; i < jsonTasks.length; i++) {
                // Creating table with data.
                tasktable = $('<tr class=\"' + apply_stripes_according_to_status(jsonTasks[i].status) + '\">');
                tasktable.append("<td class=\"id\" style=\"display:none;\">" + jsonTasks[i].taskid + "</td>");
                tasktable.append("<td class=\"title\">" + jsonTasks[i].title + "</td>");
                tasktable.append("<td class=\"statusT\">" + jsonTasks[i].status + "</td>");
                tasktable.append("<td class=\"deadlineT\">" + jsonTasks[i].deadline + "</td>");
                tasktable.append("<td><button class=\"btn btn-info\" id=\"btn_update\"><span class=\"glyphicon glyphicon-pencil\"></span> Update</button></td>");
                tasktable.append("<td><button class=\"btn btn-warning\" id=\"btn_delete\"><span class=\"glyphicon glyphicon-trash\"></span> Delete</button></td>");
                tasktable.append("</tr>");
                $('tbody').append(tasktable);
            }
            console.log("Counting statuses after all tasks loaded: " + count_statuses());
        } else {
            // Message if no data available.
            count_statuses();
        }
    });
}

// Loading existing tasks from server to table.
loadAllTasks();

// action=create - Send new task to server.
$("#insert_task").submit(function () {
    var title = escapeHtml($('#title').val());
    var status = escapeHtml($('#status').val());
    var deadline = escapeHtml($('#deadline').val());
    console.log("Inserting values: " + title + " - " + status + " - " + deadline);
    $.ajax({
        type: 'post',
        url: create_request,
        data: $('#insert_task').serialize(),
        success: function (response) {
            console.log("Serializing insert form: " + $('#insert_task').serialize());
            var parseResult = $.parseJSON(response);
            if(parseResult.result === "OK") {
                console.log("Inserted task ID: " + parseResult.taskid);
                $("tr").remove('#nodata'); // Removing "No data available" message if exists.
                document.getElementById("insert_task").reset(); // Clearing form.
                $("#show_insert_form_button").css("visibility", "visible").effect("slide", 500);
                $("#show_insert_form").css("visibility", "hidden").effect("slide", 500);
                // Making row.
                $('tbody').prepend("<tr class=\"" + apply_stripes_according_to_status(status) + "\"><td class=\"id\" style=\"display:none;\">" + parseResult.taskid + "</td><td class=\"title\">" + title + "</td><td class=\"statusT\">" + status + "</td><td class=\"deadlineT\">" + deadline + "</td><td><button class=\"btn btn-info\" id=\"btn_update\"><span class=\"glyphicon glyphicon-pencil\"></span> Update</button><td><button  class=\"btn btn-warning\" id=\"btn_delete\"><span class=\"glyphicon glyphicon-trash\"></span> Delete</button></td></tr>");
                $("#deadline").datepicker("refresh"); // hack
                console.log("Counting statuses after inserting new task: " + count_statuses());
            } else {
                alert("Problem with server. Try again later.");
            }
        },
        error: function() {
            alert("Problem with server. Try again later.");
        }
    });
    return false; // avoid actual submit
});

// Finds values and fills update form with values.
$("tbody").on("click", "#btn_update", function () {
    $("#show_update_form").css("visibility", "visible").effect("slide", 500);
    var findParent = $(this).parent().parent(); // Getting parent in tree.
    var taskId = findParent.find('.id').text(); // find id
    var taskTitle = findParent.find('.title').text(); // find title
    var taskStatus = findParent.find('.statusT').text(); // find status
    var taskDeadline = findParent.find('.deadlineT').text(); // find deadline
    console.log("Filling update form: " + taskId + " - " + taskTitle + " - " + taskStatus + " - " + taskDeadline);
    $('#id_update').val(taskId);
    $('#title_update').val(taskTitle);
    $('#status_update').val(taskStatus);
    $('#deadline_update').val(taskDeadline);
});

// action=update - Sends update task form to server.
$("#update_task").submit(function () {
    $("#show_update_form").css("visibility", "hidden").effect("slide", 500);
    var taskId = $('#id_update').val();
    console.log("Updating task ID: " + taskId);
    $.ajax({
        type: 'post',
        url: update_request,
        data: $('#update_task').serialize(),
        success: function (response) {
            console.log("Serializing update form: " + $('#update_task').serialize());
            var parseResponse = $.parseJSON(response);
            if (parseResponse.result === "OK") {
                $(".id").each(function () {
                    // Finds right field by task ID and updates values.
                    var findParent = $(this).parent();
                    if(findParent.find('.id').text() === taskId) {
                        findParent.find('.title').text($('#title_update').val()); // updating title
                        findParent.find('.statusT').text($('#status_update').val()); // updating status
                        findParent.find('.deadlineT').text($('#deadline_update').val()); // updating deadline
                        // Removing CSS classes and applying new depending on new status.
                        $(this).parent().removeClass('success warning danger').addClass(apply_stripes_according_to_status($('#status_update').val()));
                        $("#deadline_update").datepicker("refresh"); // hack
                        console.log("Successfully updated task ID: " + taskId);
                        return false; // Breaking cycle.
                    }
                });
                console.log("Counting statuses after updating task: " + count_statuses());
            } else {
                alert("Problem with updating task. Try again later.");
            }
        },
        error: function () {
            alert("Problem with server. Try again later.");
        }
    });
    return false; // avoid actual submit
});

// action=delete - Deletes selected task.
$("tbody").on("click", "#btn_delete", function () {
    var taskId = $(this).parent().parent().children().first().text(); // find id
    var removeTableRow = $(this).parent().parent();
    console.log("Preparing to delete task ID: " + taskId);
    $.ajax({
        type: 'post',
        url: delete_request,
        data: 'id=' + taskId,
        success: function (response) {
            var parseResponse = $.parseJSON(response);
            if (parseResponse.result === "OK") {
                removeTableRow.remove(); // remove table row
                console.log("Counting statuses after deleting task: " + count_statuses());
            } else {
                alert("Problem with deleting task. Try again later.");
            }
            console.log("Deleted task ID: " + taskId);
        },
        error: function () {
            alert("Problem with server. Try again later.");
        }
    });
});
