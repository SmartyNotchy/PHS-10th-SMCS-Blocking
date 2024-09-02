var isMobile = navigator.userAgent.match(/Mobile/i) != null;
var schedule = null;
var blockX = true;

if (isMobile) {
    // TODO
}

// Fetch Schedule Data
fetch("https://smartynotchy.pythonanywhere.com/")
.then((response) => response.json())
.then((json) => {
    schedule = json.body;
    updateSchedule()
});

function formatDate(date) {
    return `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`;
}

function updateSchedule() {
    let date = new Date();
    let gotoNextDay = date.getHours() >= 16; // Past 4:00pm
    if (gotoNextDay) {
        date.setDate(date.getDate() + 1);
    }
    let weekday = date.getDay();

    if (weekday == 0 || weekday == 6) {
        // Weekend Case
        date.setDate(date.getDate() + 1);
        if (weekday == 6) {
            date.setDate(date.getDate() + 1);
            document.getElementById("d0_day").innerHTML = "(Tomorrow - Monday)"
        } else {
            document.getElementById("d0_day").innerHTML = "(Next Monday)"
        }
    } else {
        if (gotoNextDay) {
        document.getElementById("d0_day").innerHTML = `(Tomorrow - ${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][weekday-1]})`;
        } else {
        document.getElementById("d0_day").innerHTML = `(Today - ${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][weekday-1]})`;
        }
    }
    document.getElementById("d0_date").innerHTML = `${formatDate(date)}`

    if (weekday == 0 || weekday == 6) {
        weekday = 1;
    }


    // Update Schedules
    for (let i = 0; i <= 10; i++) {
        let scheduleNum = i;
        if (i == 0) {
            scheduleNum = weekday;
        }

        for (let j = 0; j < 4; j++) {
            document.getElementById(`d${i}_${j+2}`).innerText = schedule[scheduleNum][j][0 + (blockX ? 0 : 2)];
            document.getElementById(`d${i}_${j+2}n`).innerText = schedule[scheduleNum][j][1 + (blockX ? 0 : 2)];
        }

        let notes = schedule[scheduleNum][4];
        if (notes == "") {
            document.getElementById(`d${i}_notes`).innerText = "No Extra Notes";
        } else {
            document.getElementById(`d${i}_notes`).innerText = "Notes: " + schedule[scheduleNum][4];
        }
    }
}

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("serviceworker.js").then(
        (registration) => {
            console.log("Service worker registration successful:", registration);
        },
        (error) => {
            console.error(`Service worker registration failed: ${error}`);
        },
    );
} else {
    console.error("Service workers are not supported.");
}      