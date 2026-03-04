const scanner = new Html5Qrcode("reader");
const beep = document.getElementById("beep");
const viewScanner = document.getElementById("view-scanner");
const viewResult = document.getElementById("view-result");

// Rangos Oficiales Serie B - Bolivia 2026
const RANGOS = {
  10: { min: 10000000, max: 40000000, color: "#007bff" },
  20: { min: 40000001, max: 70000000, color: "#fd7e14" },
  50: { min: 70000001, max: 99999999, color: "#6f42c1" },
};

// Configuración del motor de escaneo automático
const config = {
  fps: 30, // Alta velocidad de captura
  qrbox: { width: 280, height: 160 },
  aspectRatio: 1.0,
};

// Iniciar automáticamente al cargar
async function startApp() {
  try {
    await scanner.start(
      { facingMode: "environment" },
      config,
      onDetected, // Se ejecuta solo cuando encuentra un código
    );
  } catch (err) {
    alert("Error: Debes habilitar la cámara en tu navegador.");
  }
}

function onDetected(decodedText) {
  // 1. Extraer solo números
  const serie = decodedText.replace(/\D/g, "");
  if (serie.length < 6) return; // Ignorar lecturas incompletas

  // 2. Feedback inmediato
  beep.play();
  if (navigator.vibrate) navigator.vibrate(200);

  // 3. Detener escaneo y mostrar resultado
  scanner.pause(true);
  showResult(parseInt(serie));
}

function showResult(serie) {
  let detectado = null;

  // Buscar en los rangos
  for (let valor in RANGOS) {
    if (serie >= RANGOS[valor].min && serie <= RANGOS[valor].max) {
      detectado = { valor: valor, ...RANGOS[valor] };
      break;
    }
  }

  const card = document.querySelector(".result-card");
  const valDisplay = document.getElementById("res-val");
  const title = document.getElementById("res-title");
  const msg = document.getElementById("res-msg");
  const serialText = document.getElementById("res-serial");

  serialText.innerText = serie;
  viewResult.classList.remove("hidden");

  if (detectado) {
    card.className = "result-card legal-bg";
    valDisplay.innerText = `Bs ${detectado.valor}`;
    valDisplay.style.color = detectado.color;
    title.innerText = "✅ BILLETE VÁLIDO";
    title.style.color = "#28a745";
    msg.innerText = "Serie B confirmada en base de datos.";
  } else {
    card.className = "result-card fake-bg";
    valDisplay.innerText = "??";
    valDisplay.style.color = "#dc3545";
    title.innerText = "❌ SERIE DESCONOCIDA";
    title.style.color = "#dc3545";
    msg.innerText = "El número no corresponde a la emisión oficial.";
  }
}

function resetScanner() {
  viewResult.classList.add("hidden");
  scanner.resume(); // Vuelve a buscar automáticamente
}

// Iniciar aplicación
window.onload = startApp;
