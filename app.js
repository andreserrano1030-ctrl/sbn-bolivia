let valorElegido = 0;
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const statusText = document.getElementById("status-text");
const numberOutput = document.getElementById("number-output");
const focusFrame = document.getElementById("focus-frame");
const laser = document.getElementById("laser");
const btnScan = document.getElementById("btn-scan");

// 1. Activar Cámara
document
  .getElementById("btn-activate-cam")
  .addEventListener("click", async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      video.srcObject = stream;
      document.getElementById("card-cam").style.display = "none";
      document.getElementById("card-amount").style.display = "block";
      statusText.innerText = "Cámara lista. Selecciona un monto.";
    } catch (err) {
      alert("Error: Debes permitir el acceso a la cámara.");
    }
  });

// 2. Selección de Billete y activación de láser
function seleccionarBillete(monto) {
  valorElegido = monto;

  // UI: Resaltar botón seleccionado
  document
    .querySelectorAll(".btn-amt")
    .forEach((b) => b.classList.remove("selected"));
  event.target.classList.add("selected");

  // Mostrar escáner y activar animación láser
  document.getElementById("scanner-view").style.display = "block";
  const colores = { 10: "#0056b3", 20: "#e67e22", 50: "#8e44ad" };
  const colorActivo = colores[monto];

  // Personalizar marco y láser con el color del billete
  focusFrame.style.borderColor = colorActivo;
  laser.style.backgroundColor = colorActivo;
  laser.style.boxShadow = `0 0 15px ${colorActivo}`;
  laser.style.display = "block";

  // Configurar botón de acción
  btnScan.disabled = false;
  btnScan.style.background = colorActivo;
  btnScan.innerText = `ESCANEAR SERIE DE Bs ${monto}`;

  statusText.innerText = `Apunta al número de serie del billete de Bs ${monto}`;
  limpiarPanel();
}

// 3. Proceso de Lectura OCR
btnScan.addEventListener("click", async () => {
  statusText.innerText = "⏳ Procesando... Mantén la mano firme";
  btnScan.disabled = true;

  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  try {
    const {
      data: { text },
    } = await Tesseract.recognize(canvas, "eng", {
      tessedit_char_whitelist: "0123456789",
    });

    const serie = text.replace(/\D/g, "").trim();

    if (serie.length >= 6) {
      numberOutput.innerText = serie;
      validarSerie(parseInt(serie));
    } else {
      statusText.innerText = "❌ No se leyó bien. Acércate más.";
      btnScan.disabled = false;
    }
  } catch (e) {
    statusText.innerText = "Error en el sensor óptico.";
    btnScan.disabled = false;
  }
});

// 4. Lógica de Verificación Legal
function validarSerie(numero) {
  // Rangos oficiales hipotéticos Serie B 2026
  const rangos = {
    10: { min: 10000000, max: 40000000 },
    20: { min: 40000001, max: 70000000 },
    50: { min: 70000001, max: 99999999 },
  };

  const r = rangos[valorElegido];
  const resultsPanel = document.getElementById("results-panel");

  if (numero >= r.min && numero <= r.max) {
    statusText.innerHTML = `<b style="color:#27ae60">✅ SERIE LEGAL CONFIRMADA</b><br>Billete de Bs ${valorElegido} válido`;
    resultsPanel.className = "legal";
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
  } else {
    statusText.innerHTML = `<b style="color:#e74c3c">❌ SERIE SOSPECHOSA</b><br>Fuera del rango de Bs ${valorElegido}`;
    resultsPanel.className = "fake";
    if (navigator.vibrate) navigator.vibrate(500);
  }

  btnScan.style.display = "none";
  laser.style.display = "none"; // Detener láser tras lectura
  document.getElementById("btn-reset").style.display = "block";
}

function limpiarPanel() {
  numberOutput.innerText = "--------";
  document.getElementById("results-panel").className = "";
  document.getElementById("btn-reset").style.display = "none";
  btnScan.style.display = "block";
}
