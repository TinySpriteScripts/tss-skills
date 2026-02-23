let Open = false;

function openMenu(levelData) {
  const skillWrap = document.getElementById("skills-wrap");
  const skillsList = document.getElementById("skills-list");
  skillsList.innerHTML = "";

  for (const [key, skill] of Object.entries(levelData)) {
    const currentXP = skill.CurrentXP || 0;

    let currentRank = { Label: "Unranked", XPNeeded: 0 };
    let nextRank = null;

    const sortedRanks = Object.entries(skill.Ranks || {})
      .map(([rankNum, data]) => ({ rank: parseInt(rankNum, 10), ...data }))
      .sort((a, b) => a.rank - b.rank);

    for (let i = 0; i < sortedRanks.length; i++) {
      if (currentXP >= sortedRanks[i].XPNeeded) {
        currentRank = sortedRanks[i];
        nextRank = sortedRanks[i + 1] || null;
      } else break;
    }

    let progressPercent = nextRank
      ? ((currentXP - currentRank.XPNeeded) / (nextRank.XPNeeded - currentRank.XPNeeded)) * 100
      : 100;

    progressPercent = Math.min(progressPercent, 100).toFixed(1);

    const xpMax = nextRank ? nextRank.XPNeeded : currentRank.XPNeeded;
    const nextLabel = nextRank ? `(Next: ${nextRank.Label})` : "(Max Rank)";

    const skillEntry = document.createElement("div");
    skillEntry.classList.add("skill-entry");

    const label = skill.Label || key.toUpperCase();
    const rankLabel = currentRank.Label || "Unranked";

    skillEntry.innerHTML = `
      <div class="skill-title">
        <h3>${label}</h3>
        <div class="skill-rank">${rankLabel}</div>
      </div>

      <p class="skill-xp">
        XP: ${currentXP} / ${xpMax} <span class="muted">${nextLabel}</span>
      </p>

      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progressPercent}%"></div>
      </div>
    `;

    skillsList.appendChild(skillEntry);
  }

  skillWrap.classList.remove("hidden");
  Open = true;
}

function closeMenu() {
  document.getElementById("skills-wrap").classList.add("hidden");
  Open = false;
  sendToLua("close-skills", {});
}

function sendToLua(endpoint, payload) {
  return fetch(`https://tss-skills/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(() => {});
}

document.addEventListener("keyup", function(press) {
  if (press.key === "Escape" && Open) closeMenu();
});

window.addEventListener('message', (event) => {
  if (event.data.action === 'open-skills-menu') {
    openMenu(event.data.levelData);
  }
});
