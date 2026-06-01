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
    `Coucou ${prenom} ! 👋 Tu as bien dormi ?`,
 
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
  let posX = null, posY = null;
  let tentatives = 0;

  // Initialiser la position du bouton
  function initPos() {
    const zr = zone.getBoundingClientRect();
    posX = zr.width - bouton.offsetWidth - 20;
    posY = zr.height - bouton.offsetHeight - 20;
    applPos();
  }

  function applPos() {
    bouton.style.left = posX + "px";
    bouton.style.top  = posY + "px";
    bouton.style.right = "auto";
    bouton.style.bottom = "auto";
  }

  window.addEventListener("load", initPos);
  setTimeout(initPos, 100);

  document.addEventListener("mousemove", (e) => {
    if (!posX) initPos();
    const rect = bouton.getBoundingClientRect();
    const zr   = zone.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = cx - e.clientX;
    const dy = cy - e.clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const seuil = 130 + tentatives * 8;

    if (dist < seuil) {
      tentatives++;
      const force = 60 + tentatives * 4;
      // Fuir dans la direction opposée à la souris
      let nx = posX + (dx / dist) * force;
      let ny = posY + (dy / dist) * force;

      // Rebondir dans les bords de la zone
      const maxX = zr.width  - bouton.offsetWidth;
      const maxY = zr.height - bouton.offsetHeight;
      nx = Math.max(0, Math.min(nx, maxX));
      ny = Math.max(0, Math.min(ny, maxY));

      // Si coincé dans un coin, téléporter
      if ((nx <= 0 || nx >= maxX) && (ny <= 0 || ny >= maxY)) {
        nx = Math.random() * maxX;
        ny = Math.random() * maxY;
      }

      posX = nx;
      posY = ny;
      applPos();

      // Changer le texte selon les tentatives
      if (tentatives === 3)  bouton.textContent = "Non 😅";
      if (tentatives === 6)  bouton.textContent = "Nan !";
      if (tentatives === 10) bouton.textContent = "🏃 Jamais !";
      if (tentatives === 15) {
        bouton.textContent = "Ok ok...";
        bouton.style.background = "#a29bfe";
        bouton.style.boxShadow = "0 4px 0 #6c5ce7";
        bouton.addEventListener("click", () => {
          const prenom = recupererPrenom();
          const params = new URLSearchParams({ prenom });
          window.location = "page3.html?" + params.toString();
        }, { once: true });
      }
    }
  });

  // Tactile : le bouton fuit au tap
  bouton.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (!posX) initPos();
    const zr = zone.getBoundingClientRect();
    posX = Math.random() * (zr.width  - bouton.offsetWidth);
    posY = Math.random() * (zr.height - bouton.offsetHeight);
    applPos();
    tentatives++;
    if (tentatives >= 5) bouton.textContent = "🏃 Rattrap-moi !";
  }, { passive: false });
});
