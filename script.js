const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamDropdown = document.getElementById("teamSelect");
const attendeeCounter = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");

let count = 0;
const maxCount = 50;


form.addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form from submitting

    const name = nameInput.value;
    const team = teamDropdown.value;
    const teamName = teamDropdown.selectedOptions[0].text; // Get the text of the selected option
    console.log(name, teamName);

    count++;
    attendeeCounter.textContent = count;
    console.log("Total Check-Ins: " + count);

    const percentage = Math.round((count / maxCount) * 100) + "%";
    progressBar.style.width = percentage;
    console.log(`Check-In Percentage: ${percentage}`);

    const teamCounter = document.getElementById(team + "Count");
    const current = parseInt(teamCounter.textContent) + 1;
    teamCounter.textContent = current;
    const message = `Welcome ${name} from ${teamName}! You are attendee number ${current} for your team.`;
    console.log(message);

});