// ===== Stockage du prénom (sans localStorage pour compatibilité) =====
// On utilise sessionStorage en fallback, avec gestion d'erreur
function sauvegarderPrenom(prenom) {
  try { sessionStorage.setItem("prenom", prenom); } catch(e) {}
  // Aussi via URL param pour fiabilité inter-pages
  return prenom;
}
function recupererPrenom() {
  try {
    const sp = sessionStorage.getItem("prenom");
    if (sp) return sp;
  } catch(e) {}
  // Fallback : paramètre URL
  const params = new URLSearchParams(window.location.search);
  return params.get("prenom") || "ami";
}

// ===== Page 1 =====
function choisir() {
  const prenom = document.getElementById("prenom")?.value?.trim();
  const message = document.getElementById("message");
  if (!message) return;
  if (!prenom) {
    message.value = "✏️ Écris ton prénom d'abord !";
    document.getElementById("prenom").focus();
    return;
  }
  const salutations = [
    `Coucou ${prenom} ! 👋 tu as bien dormi?`,
  
  ];
  message.value = salutations[Math.floor(Math.random() * salutations.length)];
  message.style.color = "#ff6b6b";
}

function continuer() {
  const prenom = document.getElementById("prenom")?.value?.trim();
  if (!prenom) {
    document.getElementById("message").value = "✏️ Écris ton prénom pour continuer !";
    document.getElementById("prenom").focus();
    document.getElementById("prenom").style.borderColor = "#ff6b6b";
    return;
  }
  sauvegarderPrenom(prenom);
  const params = new URLSearchParams({ prenom });
  window.location = "page2.html?" + params.toString();
}

// ===== Page 2 — bouton "Non" qui fuit =====
document.addEventListener("DOMContentLoaded", () => {

  // Afficher le prénom dans la question si dispo
  const questionEl = document.getElementById("question");
  if (questionEl) {
    const prenom = recupererPrenom();
    questionEl.value = `Alors ${prenom}...\ntu as revée de moi ? 😏`;
  }

  // Bouton OUI → transmet le prénom
  const ouiBtn = document.getElementById("oui");
  if (ouiBtn) {
    ouiBtn.addEventListener("click", () => {
      const prenom = recupererPrenom();
      const params = new URLSearchParams({ prenom });
      window.location = "page3.html?" + params.toString();
    });
  }

  // Bouton NON qui fuit
  const bouton = document.getElementById("non");
  if (!bouton) return;

  const zone = document.querySelector(".zone-boutons");
  let tentatives = 0;
  let bloque = false; // true quand le bouton a capitulé

  // Coordonnées courantes du bouton DANS la zone (relatives)
  let posX, posY;

  function initPos() {
    const zr = zone.getBoundingClientRect();
    const bw = bouton.offsetWidth  || 120;
    const bh = bouton.offsetHeight || 50;
    // Position initiale : coin bas-droit
    posX = zr.width  - bw - 20;
    posY = zr.height - bh - 20;
    appliquer();
  }

  function appliquer() {
    bouton.style.left   = posX + "px";
    bouton.style.top    = posY + "px";
    bouton.style.right  = "auto";
    bouton.style.bottom = "auto";
  }

  // Init après rendu
  requestAnimationFrame(() => { requestAnimationFrame(initPos); });

  // ---- SOURIS ----
  document.addEventListener("mousemove", (e) => {
    if (bloque) return;
    if (posX === undefined) initPos();

    const zr  = zone.getBoundingClientRect();
    const bw  = bouton.offsetWidth;
    const bh  = bouton.offsetHeight;

    // Centre du bouton en coordonnées ÉCRAN
    const cx = zr.left + posX + bw / 2;
    const cy = zr.top  + posY + bh / 2;

    const dx   = cx - e.clientX;
    const dy   = cy - e.clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const seuil = 140 + tentatives * 5;

    if (dist < seuil && dist > 0) {
      tentatives++;
      const force = 70 + tentatives * 3;

      // Nouvelle position en coordonnées zone (relatives)
      let nx = posX + (dx / dist) * force;
      let ny = posY + (dy / dist) * force;

      const maxX = zr.width  - bw;
      const maxY = zr.height - bh;
      nx = Math.max(0, Math.min(nx, maxX));
      ny = Math.max(0, Math.min(ny, maxY));

      // Coincé dans un coin → téléportation
      const coinX = nx <= 1 || nx >= maxX - 1;
      const coinY = ny <= 1 || ny >= maxY - 1;
      if (coinX && coinY) {
        nx = Math.random() * maxX;
        ny = Math.random() * maxY;
      }

      posX = nx; posY = ny;
      appliquer();
      mettreAJourTexte();
    }
  });

  // ---- TACTILE : fuit à chaque touchstart, JAMAIS de navigation ----
  bouton.addEventListener("touchstart", (e) => {
    e.preventDefault();   // empêche le clic fantôme
    e.stopPropagation();
    if (bloque) return;
    if (posX === undefined) initPos();

    const zr  = zone.getBoundingClientRect();
    const bw  = bouton.offsetWidth;
    const bh  = bouton.offsetHeight;
    const maxX = zr.width  - bw;
    const maxY = zr.height - bh;

    // Téléportation aléatoire loin du doigt
    const touch = e.touches[0];
    const fingerX = touch.clientX - zr.left;
    const fingerY = touch.clientY - zr.top;
    let nx, ny, essais = 0;
    do {
      nx = Math.random() * maxX;
      ny = Math.random() * maxY;
      essais++;
    } while (Math.abs(nx - fingerX) < 80 && Math.abs(ny - fingerY) < 80 && essais < 20);

    posX = nx; posY = ny;
    appliquer();
    tentatives++;
    mettreAJourTexte();
  }, { passive: false });

  // Bloquer aussi le click normal tant qu'il n'a pas capitulé
  bouton.addEventListener("click", (e) => {
    if (!bloque) e.preventDefault();
  });

  function mettreAJourTexte() {
    if (tentatives === 3)  { bouton.textContent = "Non 😅"; }
    if (tentatives === 6)  { bouton.textContent = "Nan !!! 😤"; }
    if (tentatives === 10) { bouton.textContent = "🏃 Jamais !"; }
    if (tentatives === 15) {
      bloque = true;
      bouton.textContent = "Ok ok... 😩";
      bouton.style.background = "#a29bfe";
      bouton.style.boxShadow  = "0 4px 0 #6c5ce7";
      // Maintenant le clic redirige vers page3
      bouton.addEventListener("click", () => {
        const prenom = recupererPrenom();
        window.location = "page3.html?" + new URLSearchParams({ prenom }).toString();
      }, { once: true });
      bouton.addEventListener("touchend", (e) => {
        e.preventDefault();
        const prenom = recupererPrenom();
        window.location = "page3.html?" + new URLSearchParams({ prenom }).toString();
      }, { once: true });
    }
  }
});