let valorElegido = 0;
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const statusText = document.getElementById("status-text");
const numberOutput = document.getElementById("number-output");
const focusFrame = document.getElementById("focus-frame");
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

// 2. Selección de Billete
function seleccionarBillete(monto) {
  valorElegido = monto;

  // UI: Cambiar botones
  document
    .querySelectorAll(".btn-amt")
    .forEach((b) => b.classList.remove("selected"));
  event.target.classList.add("selected");

  // UI: Mostrar escáner y cambiar color de marco
  document.getElementById("scanner-view").style.display = "block";
  const colores = { 10: "#0056b3", 20: "#e67e22", 50: "#8e44ad" };
  focusFrame.style.borderColor = colores[monto];

  // Habilitar botón de escaneo con el color respectivo
  btnScan.disabled = false;
  btnScan.style.background = colores[monto];
  btnScan.innerText = `ESCANEAR SERIE DE Bs ${monto}`;

  statusText.innerText = `Enfoca los números en el recuadro.`;
}

// 3. Proceso de Escaneo
btnScan.addEventListener("click", async () => {
  statusText.innerText = "⏳ Leyendo... mantén la cámara fija.";
  btnScan.disabled = true;

  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  try {
    // Ejecutar OCR (solo números)
    const {
      data: { text },
    } = await Tesseract.recognize(canvas, "eng", {
      tessedit_char_whitelist: "0123456789",
    });

    const serieLimpia = text.replace(/\D/g, "").trim();

    if (serieLimpia.length >= 6) {
      numberOutput.innerText = serieLimpia;
      validarSerie(parseInt(serieLimpia));
    } else {
      statusText.innerText = "❌ No se pudo leer bien. Intenta de nuevo.";
      btnScan.disabled = false;
    }
  } catch (e) {
    statusText.innerText = "Error en el reconocimiento.";
    btnScan.disabled = false;
  }
});

// 4. Validación de Legalidad (Rangos Serie B Bolivia)
function validarSerie(numero) {
  // Rangos oficiales estimulados para Serie B
  const rangos = {
    10: { min: 10000000, max: 40000000 },
    20: { min: 40000001, max: 70000000 },
    50: { min: 70000001, max: 99999999 },
  };

  const r = rangos[valorElegido];
  const resultsPanel = document.getElementById("results-panel");

  if (numero >= r.min && numero <= r.max) {
    statusText.innerHTML = `<b style="color:green">✅ BILLETE LEGAL</b><br>Pertenece a la Serie B de Bs ${valorElegido}`;
    resultsPanel.className = "legal";
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
  } else {
    statusText.innerHTML = `<b style="color:red">❌ SERIE NO VÁLIDA</b><br>El número no coincide con el rango de Bs ${valorElegido}`;
    resultsPanel.className = "fake";
    if (navigator.vibrate) navigator.vibrate(500);
  }

  btnScan.style.display = "none";
  document.getElementById("btn-reset").style.display = "block";
}
