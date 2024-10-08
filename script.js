/* Cookie Helpers */
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1, cookie.length);
        }
        if (cookie.indexOf(nameEQ) == 0) {
            return cookie.substring(nameEQ.length, cookie.length);
        }
    }
    return undefined;
}

/* Rendering Schedules */
var schedule = null;
var blockX = undefined;
function formatDate(date) {
    return `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`;
}

function updateSchedule() {
    // Select the schedule to display on the main page
    let date = new Date();
    let gotoNextDay = date.getHours() >= 16; // Past 4:00pm
    if (gotoNextDay) {
        date.setDate(date.getDate() + 1);
    }

    // Which day # is the one selected on the main page?
    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    let weekday = date.getDay();

    if (weekday == 0 || weekday == 6) {
        // The current day # is a Weekend
        date.setDate(date.getDate() + 1);
        if (weekday == 6) {
            // Skip ahead 2 days if current day # is Saturday
            date.setDate(date.getDate() + 1);
            document.getElementById("d0_day").innerHTML = "(Next Monday)"
        } else {
            // Skip ahead 1 day if current day # is Sunday
            document.getElementById("d0_day").innerHTML = "(Tomorrow - Monday)"
        }
    } else {
        // The current day # is a Weekday
        if (gotoNextDay) {
            document.getElementById("d0_day").innerHTML = `(Tomorrow - ${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][weekday-1]})`;
        } else {
            document.getElementById("d0_day").innerHTML = `(Today - ${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][weekday-1]})`;
        }
    }
    document.getElementById("d0_date").innerHTML = `${formatDate(date)}`

    // Update Schedules
    let startingDay = new Date();
    let todaysDayNum = startingDay.getDay();
    startingDay.setDate(startingDay.getDate() - (todaysDayNum == 0 ? 7 : todaysDayNum) + 7);

    for (let i = 0; i <= 10; i++) {
        let scheduleNum = i;
        if (i == 0) {
            // Use the chosen day # for the main page
            if (weekday == 0 || weekday == 1 && gotoNextDay || weekday == 6) {
                // 1: It's currently a Sunday (< 4 PM)
                // 2: It's currently a Sunday (> 4 PM)
                // 3: The next-selected day was a Saturday
                
                if (weekday == 6 && gotoNextDay) { // Friday Night
                    scheduleNum = 6; // Monday W2
                } else {
                    scheduleNum = 1; // Monday W1
                }
            } else {
                scheduleNum = weekday;
            }
        }

        for (let j = 0; j < 4; j++) {
            document.getElementById(`d${i}_${j+2}`).innerText = schedule[scheduleNum][j][0 + (blockX ? 0 : 2)];
            document.getElementById(`d${i}_${j+2}n`).innerText = schedule[scheduleNum][j][1 + (blockX ? 0 : 2)];
            if (document.getElementById(`d${i}_${j+2}n`).innerText.trim() == "") {
                document.getElementById(`d${i}_${j+2}n`).style.display = "none";
            } else {
                document.getElementById(`d${i}_${j+2}n`).style.display = "block";
            }
        }

        let notes = schedule[scheduleNum][4];
        if (notes == "") {
            document.getElementById(`d${i}_notes`).innerText = "No Extra Notes";
        } else {
            document.getElementById(`d${i}_notes`).innerText = "Notes: " + schedule[scheduleNum][4];
        }

        if (i != 0) {
            startingDay.setDate(startingDay.getDate() + 1);
            if (i == 6) {
                startingDay.setDate(startingDay.getDate() + 2);
            }
            document.getElementById(`d${i}_date`).innerText = `${formatDate(startingDay)} (W${Math.floor((i - 1) / 5 + 1)} ${["Mon", "Tue", "Wed", "Thu", "Fri"][(i-1) % 5]})`;
        }
    }
}

var blockX;
function toggleBlock() {
    blockX = !blockX;
    setCookie("block", blockX, 365);
    document.getElementById(`block_select_${blockX ? "x" : "y"}`).setAttribute("disabled", true);
    document.getElementById(`block_select_${blockX ? "y" : "x"}`).removeAttribute("disabled");
    updateSchedule();
}



/* Onload */
document.body.onload = function() {
    /* Mobile Check */
    if (window.innerWidth < 800 || navigator.userAgent.match(/Mobile/i) != null) {
        document.getElementById("block_select_x").innerText = "X";
        document.getElementById("block_select_y").innerText = "Y";
    }

    /* Get Block */
    blockX = getCookie("block");
    if (blockX == undefined) {
        blockX = true;
        setCookie("block", true, 365);
    }
    document.getElementById(`block_select_${blockX ? "x" : "y"}`).setAttribute("disabled", true);
    document.getElementById("block_select_x").onclick = toggleBlock;
    document.getElementById("block_select_y").onclick = toggleBlock;

    /* Fetch & Render Schedules */
    fetch("https://smartynotchy.pythonanywhere.com/")
    .then((response) => response.json())
    .then((json) => {
        schedule = json.body;
        updateSchedule()
    });

    /* Register PWA ServiceWorker */
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
}