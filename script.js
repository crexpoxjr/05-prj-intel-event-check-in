const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamDropdown = document.getElementById("teamSelect");
const attendeeCounter = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const attendeeList = document.getElementById("attendeeList");
const greeting = document.getElementById("greeting");
const celebrationMessage = document.getElementById("celebrationMessage");

const teamLabels = {
  water: "Team Water Wise",
  zero: "Team Net Zero",
  power: "Team Renewables",
};

const teamCards = {
  water: document.querySelector(".team-card.water"),
  zero: document.querySelector(".team-card.zero"),
  power: document.querySelector(".team-card.power"),
};

const STORAGE_KEY = "intel-sustainability-checkin";

let count = 0;
const maxCount = 50;

function saveState() {
  const state = {
    count,
    progressWidth: progressBar.style.width || "0%",
    greetingText: greeting.textContent || "",
    greetingVisible: greeting.style.display === "block",
    celebrationText: celebrationMessage.hidden ? "" : celebrationMessage.textContent || "",
    attendees: Array.from(attendeeList.querySelectorAll(".attendee-item")).map(
      (item) => ({
        name: item.dataset.name || "",
        team: item.dataset.team || "",
        teamName: item.dataset.teamName || "",
      })
    ),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");

    if (!savedState) {
      return;
    }

    count = Number(savedState.count) || 0;
    attendeeCounter.textContent = count;
    progressBar.style.width = savedState.progressWidth || "0%";

    if (savedState.attendees && Array.isArray(savedState.attendees)) {
      attendeeList.innerHTML = "";
      savedState.attendees.forEach((attendee) => {
        const attendeeItem = document.createElement("li");
        attendeeItem.className = "attendee-item";
        attendeeItem.dataset.name = attendee.name;
        attendeeItem.dataset.team = attendee.team;
        attendeeItem.dataset.teamName = attendee.teamName;
        attendeeItem.innerHTML = `
          <span class="attendee-name">${attendee.name}</span>
          <span class="attendee-team">${attendee.teamName}</span>
        `;
        attendeeList.appendChild(attendeeItem);
      });
    }

    Object.keys(teamLabels).forEach((team) => {
      const counter = document.getElementById(`${team}Count`);
      const savedCount = savedState.attendees
        ? savedState.attendees.filter((attendee) => attendee.team === team).length
        : 0;
      counter.textContent = savedCount;
    });

    if (savedState.greetingVisible && savedState.greetingText) {
      greeting.textContent = savedState.greetingText;
      greeting.className = "success-message";
      greeting.style.display = "block";
    } else {
      greeting.textContent = "";
      greeting.style.display = "none";
      greeting.className = "";
    }

    if (savedState.celebrationText) {
      celebrationMessage.textContent = savedState.celebrationText;
      celebrationMessage.hidden = false;
    } else {
      celebrationMessage.textContent = "";
      celebrationMessage.hidden = true;
    }
  } catch (error) {
    console.warn("Unable to load saved check-in state:", error);
  }
}

function updateCelebration() {
  const counts = {
    water: parseInt(document.getElementById("waterCount").textContent) || 0,
    zero: parseInt(document.getElementById("zeroCount").textContent) || 0,
    power: parseInt(document.getElementById("powerCount").textContent) || 0,
  };

  Object.values(teamCards).forEach((card) => {
    card.classList.remove("leader");
  });

  const highestCount = Math.max(...Object.values(counts));
  const leaders = Object.entries(counts)
    .filter(([, count]) => count === highestCount)
    .map(([team]) => team);

  if (highestCount === 0) {
    celebrationMessage.hidden = true;
    celebrationMessage.textContent = "";
    saveState();
    return;
  }

  if (leaders.length === 1) {
    const winningTeam = leaders[0];
    teamCards[winningTeam].classList.add("leader");
    celebrationMessage.textContent = `🎉 ${teamLabels[winningTeam]} is leading with ${highestCount} attendee${highestCount === 1 ? "" : "s"}!`;
  } else {
    const tiedTeams = leaders
      .map((team) => teamLabels[team])
      .join(" and ");
    celebrationMessage.textContent = `🎉 It's a tie at ${highestCount} attendee${highestCount === 1 ? "" : "s"} for ${tiedTeams}!`;
  }

  celebrationMessage.hidden = false;
  saveState();
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = nameInput.value.trim();
  const team = teamDropdown.value;
  const teamName = teamDropdown.selectedOptions[0].text;

  if (!name || !team) {
    return;
  }

  count++;
  attendeeCounter.textContent = count;

  const percentage = Math.round((count / maxCount) * 100) + "%";
  progressBar.style.width = percentage;

  const teamCounter = document.getElementById(team + "Count");
  const current = parseInt(teamCounter.textContent) + 1;
  teamCounter.textContent = current;

  const attendeeItem = document.createElement("li");
  attendeeItem.className = "attendee-item";
  attendeeItem.dataset.name = name;
  attendeeItem.dataset.team = team;
  attendeeItem.dataset.teamName = teamName;
  attendeeItem.innerHTML = `
    <span class="attendee-name">${name}</span>
    <span class="attendee-team">${teamName}</span>
  `;
  attendeeList.appendChild(attendeeItem);

  greeting.textContent = `Welcome ${name} from ${teamName}! You are attendee number ${current} for your team.`;
  greeting.className = "success-message";
  greeting.style.display = "block";

  updateCelebration();
  form.reset();
});

loadState();
updateCelebration();