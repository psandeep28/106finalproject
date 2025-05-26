let selectedProfile = null;
let allCSVData = [];

d3.csv("data/mindscope_profiles_cleaned.csv", d3.autoType).then(data => {
  allCSVData = data;
});

function goTo(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.getElementById(pageId).classList.remove("hidden");
}

function selectProfile(name) {
  selectedProfile = name;
  const stats = processProfileData(allCSVData, name);

  document.getElementById("profileTitle").textContent = `${name} Profile`;
  document.getElementById("sleepLabel").textContent = `Most Common Sleep Duration: ${stats.sleep}`;

  renderBarChart(stats);
  renderCGPA(stats);
  renderDonut(stats);

  goTo("profileStatsPage");
}

function confirmProfile() {
  alert(`You selected the ${selectedProfile} profile. Let's begin your journey!`);
  // Replace this with the next phase navigation
}

  