function verificarSerie(numero, corte) {
  const n = parseInt(numero);

  // Ejemplo de rangos (Estos varían según la información oficial del BCB)
  const rangosB = {
    10: [
      [28362001, 28383000],
      [29035001, 29053000],
    ],
    20: [[18541001, 18562000]],
    50: [[14352001, 14373000]],
  };

  const rangos = rangosB[corte];
  let observado = false;

  for (let rango of rangos) {
    if (n >= rango[0] && n <= rango[1]) {
      observado = true;
      break;
    }
  }

  return observado ? "OBSERVADO: No válido" : "NO OBSERVADO";
}
