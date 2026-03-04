let selectedValue = 0;
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const btnScan = document.getElementById("btnScan");
const statusText = document.getElementById("status");
const serialText = document.getElementById("serial");

// Iniciar cámara automáticamente
navigator.mediaDevices
  .getUserMedia({ video: { facingMode: "environment" } })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((err) => {
    alert("Error al acceder a la cámara");
  });

function selectDenom(val) {
  selectedValue = val;
  document
    .querySelectorAll(".btn-amt")
    .forEach((b) => b.classList.remove("active"));
  event.target.classList.add("active");
  btnScan.disabled = false;
  btnScan.classList.add("ready");
  statusText.innerText = `Enfoca la serie de Bs ${val} en el recuadro`;
}

btnScan.onclick = async () => {
  statusText.innerText = "🔍 ANALIZANDO...";
  const ctx = canvas.getContext("2d");

  // CALCULAR RECORTE DE PRECISIÓN
  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;
  const rect = document.getElementById("scanWindow").getBoundingClientRect();
  const videoRect = video.getBoundingClientRect();

  // Proporciones entre el video real y lo que se ve en pantalla
  const scaleX = videoWidth / videoRect.width;
  const scaleY = videoHeight / videoRect.height;

  const sx = (rect.left - videoRect.left) * scaleX;
  const sy = (rect.top - videoRect.top) * scaleY;
  const sw = rect.width * scaleX;
  const sh = rect.height * scaleY;

  // Ajustar canvas al tamaño del recorte
  canvas.width = sw;
  canvas.height = sh;

  // Dibujar solo el área del rectángulo en el canvas
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);

  // Ejecutar OCR solo sobre el recorte
  try {
    const result = await Tesseract.recognize(canvas, "eng", {
      tessedit_char_whitelist: "0123456789",
    });

    const serie = result.data.text.replace(/\D/g, "");

    if (serie.length >= 6) {
      serialText.innerText = serie;
      validar(parseInt(serie));
    } else {
      statusText.innerText = "❌ No detectado. Ajusta la posición.";
    }
  } catch (e) {
    statusText.innerText = "Error en el escáner.";
  }
};

function validar(num) {
  const rangos = {
    10: { min: 10000000, max: 40000000 },
    20: { min: 40000001, max: 70000000 },
    50: { min: 70000001, max: 99999999 },
  };

  const r = rangos[selectedValue];
  if (num >= r.min && num <= r.max) {
    statusText.innerHTML =
      "<b style='color:#2ecc71; font-size:1.2rem;'>✅ BILLETE LEGAL</b>";
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
  } else {
    statusText.innerHTML =
      "<b style='color:#e74c3c; font-size:1.2rem;'>❌ SERIE NO VÁLIDA</b>";
    if (navigator.vibrate) navigator.vibrate(500);
  }
}
