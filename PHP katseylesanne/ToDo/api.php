<?php

// DB connection parameters.
function db_connect() {
   $result = new mysqli('localhost', 'todouser', 'betterpassword', 'tododb');
   if (!$result) {
      return false;
   }
   return $result;
}

// Getting parameters from GET and POST globals.
$id = sanitizeString($_POST['id']);
$title = sanitizeString($_POST['title']);
$status = sanitizeString($_POST['status']);
$deadline = sanitizeString($_POST['deadline']);
$get_action = sanitizeString($_GET["action"]);

// Sanitazing method, returns cleared string.
function sanitizeString($var) {
    if (get_magic_quotes_gpc()) $var = stripslashes($var);
    $var = htmlentities($var);
    $var = strip_tags($var);
    return $var;
}

// Switching between actions.
switch($get_action) {
    case "create":
        createTask($title, $status, $deadline);
        break;
    case "show":
        showTask();
        break;
    case "delete":
        deleteTask($id);
        break;
    case "update":
        updateTask($id, $title, $status, $deadline);
        break;
    default:
        unknownAction();
        break;
}

// Creating new task.
function createTask($title, $status, $deadline) {
    $db = db_connect();
    if (mysqli_connect_errno($db)) {
        echo "Failed to connect to MySQL: " . mysqli_connect_error();
    }
    $query = "insert into tasks (title,status,deadline) values(?,?,?)";
    $stmt = $db->prepare($query);
    $stmt->bind_param("sss", $title, $status, $deadline);
    $stmt->execute();
    $taskid = $stmt->insert_id;
    $jsonReturn = array();
    if(insert_id != null) {
        $jsonReturn['result'] = "OK";
        $jsonReturn['taskid'] = $taskid;
        print json_encode($jsonReturn);
    } else {
       $jsonReturn['result'] = "NOT OK"; 
       print json_encode($jsonReturn);
    }
    $stmt->close();
}

// Showing all tasks.
function showTask() {
    $db = db_connect();
    $query = "select * from tasks order by taskid desc";
    if($result = mysqli_query($db, $query)) {
        while($obj = mysqli_fetch_object($result)) {
            $tasklist_array[] = $obj;
        }
        mysqli_free_result($result);
    }
    $jsonReturn = array();
    if(count($tasklist_array) > 0) {
        $jsonReturn['result'] = "OK";
        $jsonReturn['tasks'] = $tasklist_array;
        print json_encode($jsonReturn);
    } else {
       $jsonReturn['result'] = "NOT OK"; 
       print json_encode($jsonReturn);
    }
}

// Updating task.
function updateTask($id, $title, $status, $deadline) {
    $db = db_connect();
    if (mysqli_connect_errno($db)) {
        echo "Failed to connect to MySQL: " . mysqli_connect_error();
    }
    $query = "UPDATE tasks SET title = ?, status = ?, deadline = ? WHERE taskid = ?";
    $stmt = $db->prepare($query);
    $stmt->bind_param("sssd", $title, $status, $deadline, $id);
    $stmt->execute();
    $error = $stmt->error;
    $jsonReturn = array();
    if($error === "") {
        $jsonReturn['result'] = "OK";
        print json_encode($jsonReturn);
    } else {
       $jsonReturn['result'] = "NOT OK";
       $jsonReturn['error'] = $error;
       print json_encode($jsonReturn);
    }
    $stmt->close();
}

// Deleting task.
function deleteTask($id) {
    $db = db_connect();
    if (mysqli_connect_errno($db)) {
        echo "Failed to connect to MySQL: " . mysqli_connect_error();
    }
    $query = "DELETE FROM tasks WHERE taskid = ?";
    $stmt = $db->prepare($query);
    $stmt->bind_param("d", $id);
    $stmt->execute();
    $error = $stmt->error;
    $jsonReturn = array();
    if($error === "") {
        $jsonReturn['result'] = "OK";
        print json_encode($jsonReturn);
    } else {
       $jsonReturn['result'] = "NOT OK";
       $jsonReturn['error'] = $error;
       print json_encode($jsonReturn);
    }
    $stmt->close();
}

// In case of wrong request.
function unknownAction() {
    $jsonReturn = array();
    $jsonReturn['result'] = "NOT OK";
    $jsonReturn['error'] = "Unknown action";
    print json_encode($jsonReturn);
}

?>