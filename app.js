const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const scanBtn = document.getElementById("scan-btn");
const startBtn = document.getElementById("start-camera");
const detectedText = document.getElementById("detected-text");
const status = document.getElementById("status");

// 1. Activar la cámara
startBtn.addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    video.srcObject = stream;
    scanBtn.disabled = false;
    startBtn.style.display = "none";
    status.innerText = "Cámara lista";
  } catch (err) {
    alert("Error al acceder a la cámara: " + err);
  }
});

// 2. Capturar y Procesar con OCR
scanBtn.addEventListener("click", async () => {
  status.innerText = "Procesando...";
  scanBtn.disabled = true;

  // Dibujar el cuadro del video en el canvas
  const context = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Ejecutar Tesseract.js para leer el texto
  try {
    const {
      data: { text },
    } = await Tesseract.recognize(
      canvas,
      "eng", // El inglés funciona mejor para números y letras latinas
      { logger: (m) => console.log(m) },
    );

    // Limpiar el texto (quitar espacios y dejar solo caracteres de serie)
    const cleanText = text.replace(/[^A-Z0-9]/g, "").trim();

    if (cleanText.length > 3) {
      detectedText.innerText = cleanText;
      validarSerie(cleanText);
    } else {
      detectedText.innerText = "No detectado";
      status.innerText = "Intenta de nuevo";
    }
  } catch (error) {
    console.error(error);
    status.innerText = "Error en OCR";
  }

  scanBtn.disabled = false;
});

// 3. Lógica de validación (Ejemplo para Bolivia Serie B)
function validarSerie(serie) {
  // Ejemplo de lógica: si empieza con B y tiene longitud correcta
  if (serie.startsWith("B")) {
    status.innerHTML = "<b style='color:green'>Formato Serie B detectado</b>";
  } else {
    status.innerHTML = "<b style='color:orange'>Serie no reconocida como B</b>";
  }
}
