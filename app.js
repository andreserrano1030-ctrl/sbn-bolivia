let denominacionGlobal = 0;
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const status = document.getElementById("status");
const numberDisplay = document.getElementById("number-display");

// 1. Selección de billete y apertura de cámara
async function seleccionarBillete(valor) {
  denominacionGlobal = valor;

  // Marcar botón activo
  document
    .querySelectorAll(".btn-val")
    .forEach((b) => b.classList.remove("active"));
  event.target.classList.add("active");

  document.getElementById("scanner-section").style.display = "block";
  status.innerText = `Enfoca el número de serie del billete de Bs ${valor}`;

  if (!video.srcObject) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      video.srcObject = stream;
    } catch (err) {
      alert("Acceso a cámara denegado o no disponible.");
    }
  }
}

// 2. Proceso de Escaneo con Tesseract
document.getElementById("btn-scan").addEventListener("click", async () => {
  if (denominacionGlobal === 0) return alert("Elige primero un billete");

  status.innerText = "🔍 Analizando imagen...";
  const context = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  try {
    // Configuramos Tesseract para leer solo dígitos
    const result = await Tesseract.recognize(canvas, "eng", {
      tessedit_char_whitelist: "0123456789",
      logger: (m) =>
        console.log(m.status + ": " + Math.round(m.progress * 100) + "%"),
    });

    const numExtraido = result.data.text.replace(/\D/g, "").trim();

    if (numExtraido.length >= 6) {
      numberDisplay.innerText = numExtraido;
      validarBillete(parseInt(numExtraido));
    } else {
      status.innerText = "❌ No se leyó bien. Intenta de nuevo.";
    }
  } catch (e) {
    status.innerText = "Error en el sistema de lectura.";
  }
});

// 3. Validación Legal de la Serie B (Bolivia 2026)
function validarBillete(numero) {
  // Rangos oficiales (Ejemplo: debes ajustarlos con datos del BCB)
  const rangosSerieB = {
    10: { min: 10000000, max: 40000000 },
    20: { min: 40000001, max: 70000000 },
    50: { min: 70000001, max: 99999999 },
  };

  const limite = rangosSerieB[denominacionGlobal];

  if (numero >= limite.min && numero <= limite.max) {
    status.innerHTML = `<b style="color:green; font-size:1.5rem;">✅ BILLETE LEGAL</b><br>Serie B de Bs ${denominacionGlobal} confirmada.`;
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  } else {
    status.innerHTML = `<b style="color:red; font-size:1.5rem;">❌ POSIBLE FALSO</b><br>El número no corresponde a la emisión de Bs ${denominacionGlobal}.`;
    if (navigator.vibrate) navigator.vibrate(500);
  }

  document.getElementById("btn-reset").style.display = "block";
}
