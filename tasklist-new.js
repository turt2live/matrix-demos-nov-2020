let userId = null;
let widgetApi = null;
let currentTasks = [];
let isSaveEnabled = true; // default

try {
    const qs = parseFragment();
    const widgetId = assertParam(qs, 'widgetId');

    // Set up the widget API as soon as possible to avoid problems with the client
    widgetApi = new mxwidgets.WidgetApi(widgetId);

    widgetApi.on("ready", function() {
        checkLogin();
        checkSaveButton();
    });
    widgetApi.on("action:widget_config", function(e) {
        e.preventDefault();
        widgetApi.transport.reply(e.detail, {});
        currentTasks = e.detail.data.data.tasks;
        loadApp();
    });
    widgetApi.on("action:close_modal", function(e) {
        e.preventDefault();
        widgetApi.transport.reply(e.detail, {});
        console.log("@@ Got close", e.detail);
    });
    widgetApi.on("action:button_clicked", function(e) {
        e.preventDefault();
        widgetApi.transport.reply(e.detail, {});
        if (e.detail.data.id === "m.close") {
            return widgetApi.closeModalWidget({"m.exited": true});
        } else if (e.detail.data.id === "org.example.save") {
            return widgetApi.closeModalWidget({val: $("#taskName").val()});
        }
    });

    // Start the widget as soon as possible too, otherwise the client might time us out.
    widgetApi.start();
} catch (e) {
    handleError(e);
}

function loadApp() {
    let pageUrl = "/fragments/tasklist-input.html";
    if (!userId) {
        handleError("Login attempt failed");
        return;
    }
    fetch(pageUrl).then(f => f.text())
        .then(c => $("#container").html(c))
        .then(() => $("#userId").text(userId))
        .then(() => $("#taskCount").text(currentTasks.length));
}

function checkLogin() {
    if (localStorage.getItem("mxw_userId")) {
        userId = localStorage.getItem("mxw_userId");
    } else {
        userId = null;
    }
}

function checkSaveButton() {
    const hasVal = ($("#taskName").val() || "").trim().length > 0;
    if (hasVal !== isSaveEnabled) {
        isSaveEnabled = hasVal;
        widgetApi.setModalButtonEnabled("org.example.save", isSaveEnabled);
    }
}

function onNameUpdate() {
    checkSaveButton();
}
