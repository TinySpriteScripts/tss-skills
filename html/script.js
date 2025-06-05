let Open = false;

function openMenu(levelData) {
  const skillsMenu = document.getElementById("skills-menu");
  const skillsList = document.getElementById("skills-list");
  skillsList.innerHTML = "";

  for (const [key, skill] of Object.entries(levelData)) {
    const currentXP = skill.CurrentXP || 0;
    let currentRankIndex = 0;
    let currentRank = { Label: "Unranked", XPNeeded: 0 };
    let nextRank = null;

    // Convert ranks to a sorted array
    const sortedRanks = Object.entries(skill.Ranks)
      .map(([rankNum, data]) => ({ rank: parseInt(rankNum), ...data }))
      .sort((a, b) => a.rank - b.rank);

    for (let i = 0; i < sortedRanks.length; i++) {
      if (currentXP >= sortedRanks[i].XPNeeded) {
        currentRankIndex = sortedRanks[i].rank;
        currentRank = sortedRanks[i];
        nextRank = sortedRanks[i + 1] || null;
      } else {
        break;
      }
    }

    // let xpToNext = nextRank ? nextRank.XPNeeded : currentRank.XPNeeded;
    let progressPercent = nextRank
      ? ((currentXP - currentRank.XPNeeded) / (nextRank.XPNeeded - currentRank.XPNeeded)) * 100
      : 100;

    progressPercent = Math.min(progressPercent, 100).toFixed(1);

    const skillEntry = document.createElement("div");
    skillEntry.classList.add("skill-entry");

    skillEntry.innerHTML = `
      <h3>${skill.Label} - ${currentRank.Label}</h3>
      <p>XP: ${currentXP} / ${nextRank ? nextRank.XPNeeded : currentRank.XPNeeded} ${
      nextRank ? `(Next: ${nextRank.Label})` : "(Max Rank)"
    }</p>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progressPercent}%"></div>
      </div>
    `;

    skillsList.appendChild(skillEntry);
  }

  skillsMenu.classList.remove("hidden");
  Open = true;
}



function closeMenu() {
  document.getElementById("skills-menu").classList.add("hidden");
  Open = false;
  sendToLua("close-skills", {}); // Notify Lua if needed
}

function sendToLua(endpoint, payload) {
  return fetch(`https://tss-levels/${endpoint}`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
  }).catch(error => console.error(`Fetch Error (${endpoint}):`, error));
}

function retrieveFromLua(endpoint, payload) {
  return fetch(`https://tss-levels/${endpoint}`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
  })
  .then(response => {
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json(); 
  })
  .catch(error => {
      console.error(`Fetch Error (${endpoint}):`, error);
      throw error; 
  });
}

document.addEventListener("keyup", function(press) {
    let key_pressed = press.key;
    let valid_keys = ['Escape'];
  
    if (valid_keys.includes(key_pressed) && Open) {
        switch (key_pressed) {
            case 'Escape':
                closeMenu()
                break;
        }
    }
});

// levelData consists of a lua table that looks like this:
// LevelKeys = {
//         ['fishing'] = {
//             Label = "Fishing",
//             Ranks = {
//                 [1] = { Label = "Novice",       CurrentXP = 1,      NextRankXP = 100 },
//                 [2] = { Label = "Apprentice",   CurrentXP = 1,      NextRankXP = 250 },
//                 [3] = { Label = "Skilled",      CurrentXP = 1,      NextRankXP = 500 },
//                 [4] = { Label = "Expert",       CurrentXP = 1,      NextRankXP = 1000 },
//                 [5] = { Label = "Master",       CurrentXP = 1,      NextRankXP = 2000 },
//             },
//         },
//     },
window.addEventListener('message', (event) => {
    if (event.data.action === 'open-skills-menu') {
        openMenu(event.data.levelData);
    } 
});