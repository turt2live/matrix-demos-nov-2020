let isSticky = false;
let userId = null;
let widgetApi = null;
let paramUserId = null;

try {
    const qs = parseFragment();
    const widgetId = assertParam(qs, 'widgetId');
    paramUserId = assertParam(qs, 'userId');

    // Set up the widget API as soon as possible to avoid problems with the client
    widgetApi = new mxwidgets.WidgetApi(widgetId);
    widgetApi.requestCapability(mxwidgets.MatrixCapabilities.AlwaysOnScreen);

    widgetApi.on("ready", function() {
        // Update the UI and ensure that we end up not sticky to start
        sendStickyState();

        checkLogin();
        loadApp();
    });

    // Start the widget as soon as possible too, otherwise the client might time us out.
    widgetApi.start();
} catch (e) {
    handleError(e);
}

function loadApp() {
    let pageUrl = "/fragments/tasklist-signin.html";
    if (userId) {
        pageUrl = "/fragments/tasklist-app.html";
    }
    fetch(pageUrl).then(f => f.text())
        .then(c => $("#container").html(c))
        .then(() => {
            $("#userId").text(userId);
            renderTasks();
        });
}

function renderTasks() {
    let taskHtml = "";
    if (!localStorage.getItem("mxw_tasks")) {
        taskHtml = "🎉 No tasks to complete!";
    } else {
        const tasks = JSON.parse(localStorage.getItem("mxw_tasks"));
        for (const task of tasks) {
            const taskId = tasks.indexOf(task);
            const checked = task.completed ? "checked" : "";
            taskHtml += `<label id='task'><input type='checkbox' onclick='toggleTask("task-${taskId}")' ${checked} /> ${task.name}</label>`;
        }
    }
    taskHtml += "<button onclick='addTask()' id='add'>+ Add task</button>";
    $("#tasks").html(taskHtml);
}

function toggleSticky() {
    // called by the button when clicked - toggle the sticky state
    isSticky = !isSticky;
    sendStickyState();
}

function toggleTask(taskElementId) {
    const taskId = Number(taskElementId.split('-')[1]);
    const tasks = JSON.parse(localStorage.getItem("mxw_tasks"));
    tasks[taskId].completed = !tasks[taskId].completed;
    localStorage.setItem("mxw_tasks", JSON.stringify(tasks));
}

function sendStickyState() {
    widgetApi.setAlwaysOnScreen(isSticky).then(function(r) {
        console.log("[Widget] Client responded with: ", r);
    }).catch(function(e) {
        handleError(e);
    });
}

function checkLogin() {
    if (localStorage.getItem("mxw_userId")) {
        userId = localStorage.getItem("mxw_userId");
    } else {
        userId = null;
    }
}

function onSignIn() {
    widgetApi.requestOpenIDConnectToken().then(token => {
        console.log("Discarding token. Received: ", token);
        localStorage.setItem("mxw_userId", paramUserId);
        localStorage.setItem("mxw_tasks", JSON.stringify([
            {completed: true, name: "Create a demo room"},
            {completed: false, name: "Prepare for the demo"},
            {completed: false, name: "Fix bugs before launch"},
        ]));
        checkLogin();
        loadApp();
    }).catch(err => {
        console.error(err);
        $("#error").text("Please approve my request to verify your identity to sign in.");
    });
}

function addTask() {
    const parsedUrl = new URL(window.location.href);
    parsedUrl.pathname = '/tasklist-new.html';
    parsedUrl.search = '';
    parsedUrl.hash = '';
    const modalUrl = parsedUrl.href + "#/?widgetId=$matrix_widget_id";
    widgetApi.once("action:close_modal", ev => {
        ev.preventDefault();
        widgetApi.transport.reply(ev.detail, {});
        const data = ev.detail.data;
        if (data['m.exited'] || !data['val']) {
            return; // nothing to do - user cancelled
        }

        const tasks = JSON.parse(localStorage.getItem("mxw_tasks"));
        tasks.push({completed: false, name: data['val']});
        localStorage.setItem("mxw_tasks", JSON.stringify(tasks));
        renderTasks();
    });
    widgetApi.openModalWidget(modalUrl, "New task", [
        {id: "org.example.save", label: "Add", kind: "m.primary"},
        {id: "m.close", label: "Close", kind: "m.secondary"},
    ], {tasks: JSON.parse(localStorage.getItem("mxw_tasks"))});
}
