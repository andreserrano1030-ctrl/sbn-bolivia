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

    if (cleanText.leconst video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const scanBtn = document.getElementById('scan-btn');
const startBtn = document.getElementById('start-camera');
const detectedText = document.getElementById('detected-text');
const statusMsg = document.getElementById('status');

// 1. Iniciar cámara trasera
startBtn.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" } 
        });
        video.srcObject = stream;
        scanBtn.disabled = false;
        startBtn.style.display = 'none';
        statusMsg.innerText = "Cámara lista. Enfoca los números.";
    } catch (err) {
        alert("Error de cámara: " + err);
    }
});

// 2. Procesar imagen buscando solo números
scanBtn.addEventListener('click', async () => {
    statusMsg.innerText = "Escaneando números...";
    scanBtn.disabled = true;

    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
        // Configuramos Tesseract para que solo busque dígitos (0-9)
        const { data: { text } } = await Tesseract.recognize(
            canvas,
            'eng', 
            { 
                tessedit_char_whitelist: '0123456789', // ESTO FILTRA SOLO NÚMEROS
                logger: m => console.log(m.progress) 
            }
        );

        // Limpiamos el texto de espacios o saltos de línea
        const soloNumeros = text.replace(/\D/g, '').trim();
        
        if (soloNumeros.length >= 7) {
            detectedText.innerText = "Nº: " + soloNumeros;
            validarLegalidad(parseInt(soloNumeros));
        } else {
            detectedText.innerText = "Error de lectura";
            statusMsg.innerText = "Asegúrate de que haya buena luz.";
        }
    } catch (error) {
        statusMsg.innerText = "Error en el escaneo.";
    }
    
    scanBtn.disabled = false;
});

// 3. Lógica de validación (Rangos Serie B Bolivia)
function validarLegalidad(numero) {
    // Rangos aproximados Serie B (Ejemplos basados en BCB)
    const rangos = [
        {denominacion: "Bs 10", min: 10000000, max: 45000000},
        {denominacion: "Bs 20", min: 45000001, max: 80000000},
        {denominacion: "Bs 50", min: 80000001, max: 99999999}
    ];

    let esValido = false;
    let billeteTipo = "";

    for (let rango of rangos) {
        if (numero >= rango.min && numero <= rango.max) {
            esValido = true;
            billeteTipo = rango.denominacion;
            break;
        }
    }

    if (esValido) {
        statusMsg.innerHTML = `<b style="color:green">✅ SERIE LEGAL (${billeteTipo})</b><br>Rango verificado en BCB.`;
    } else {
        statusMsg.innerHTML = `<b style="color:red">❌ SERIE NO REGISTRADA</b><br>Posible billete falso o fuera de rango.`;
    }
}ngth > 3) {
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
