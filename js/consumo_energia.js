const CONFIG_ENERGIA = {
  impresoras: [
    {
      nombre: "Carestream DV5700",
      tecnologia: "Seca",
      consumo_activo_W: 1000,
      consumo_standby_W: 70,
      tiempo_impresion_A4_s: 152,
      tiempo_impresion_A3_s: 190,
    },
    {
      nombre: "Carestream DV5950",
      tecnologia: "Seca",
      consumo_activo_W: 1000,
      consumo_standby_W: 70,
      tiempo_impresion_A4_s: 133,
      tiempo_impresion_A3_s: 152,
    },
    {
      nombre: "Carestream DV6950",
      tecnologia: "Seca",
      consumo_activo_W: 1000,
      consumo_standby_W: 70,
      tiempo_impresion_A4_s: 73,
      tiempo_impresion_A3_s: 82,
    },
    {
      nombre: "AGFA DryStar AXYS",
      tecnologia: "Seca",
      consumo_activo_W: 390,
      consumo_standby_W: 70,
      tiempo_impresion_A4_s: 73,
      tiempo_impresion_A3_s: 113,
    },
    {
      nombre: "AGFA DryStar 5301",
      tecnologia: "Seca",
      consumo_activo_W: 390,
      consumo_standby_W: 70,
      tiempo_impresion_A4_s: 86,
      tiempo_impresion_A3_s: 125,
    },
    {
      nombre: "AGFA DryStar 5503",
      tecnologia: "Seca",
      consumo_activo_W: 450,
      consumo_standby_W: 200,
      tiempo_impresion_A4_s: 23,
      tiempo_impresion_A3_s: 36,
    },
    {
      nombre: "Kodak DryView 5850",
      tecnologia: "Seca",
      consumo_activo_W: 1540,
      consumo_standby_W: 70,
      tiempo_impresion_A4_s: 83,
      tiempo_impresion_A3_s: 128,
    },
    {
      nombre: "FUJIFILM DryPix 5000",
      tecnologia: "Seca",
      consumo_activo_W: 1000,
      consumo_standby_W: 70,
      tiempo_impresion_A4_s: 63,
      tiempo_impresion_A3_s: 85,
    },
    {
      nombre: "EPSON L8180",
      tecnologia: "Inyección",
      consumo_activo_W: 17,
      consumo_standby_W: 2.3,
      tiempo_impresion_A4_s: 66,
      tiempo_impresion_A3_s: 360,
    }
  ]
};

// Inputs
const hoursInput = document.getElementById('hoursInput');
const a4Input = document.getElementById('a4Input');
const a3Input = document.getElementById('a3Input');

// Tabla
const tecnologiaPromedio = document.getElementById('tecnologiaPromedio');
const tecnologiaEpson = document.getElementById('tecnologiaEpson');
const consumoDiarioPromedio = document.getElementById('consumoDiarioPromedio');
const consumoDiarioEpson = document.getElementById('consumoDiarioEpson');
const consumoMensualPromedio = document.getElementById('consumoMensualPromedio');
const consumoMensualEpson = document.getElementById('consumoMensualEpson');
const precioMesPromedio = document.getElementById('precioMesPromedio');
const precioMesEpson = document.getElementById('precioMesEpson');
const precioAnualPromedio = document.getElementById('precioAnualPromedio');
const precioAnualEpson = document.getElementById('precioAnualEpson');

// Resumen
const descuentoMesOutput = document.getElementById('descuentoMes');
const descuentoAnualOutput = document.getElementById('descuentoAnual');
const beneficioOutput = document.getElementById('beneficio');

// Calcular valores
function calcularValoresNumerico(impresora, horas, a4, a3) {
  const tiempoTotalActivo = (a4 * impresora.tiempo_impresion_A4_s) + (a3 * impresora.tiempo_impresion_A3_s);
  const tiempoTotalStandby = Math.max((horas * 3600) - tiempoTotalActivo, 0);

  const consumoDiario = ((impresora.consumo_activo_W * tiempoTotalActivo) / 3600)
                      + ((impresora.consumo_standby_W * tiempoTotalStandby) / 3600);
  const consumoMensual_kwh = (consumoDiario * 30) / 1000;
  const precioMes = consumoMensual_kwh * 0.66;
  const precioAnual = precioMes * 12;

  return {
    consumoDiarioRaw: consumoDiario,
    consumoMensualKwhRaw: consumoMensual_kwh,
    precioMesRaw: precioMes,
    precioAnualRaw: precioAnual
  };
}

// Actualizar calculadora
function actualizarCalculadora() {
  const horas = parseFloat(hoursInput.value) || 0;
  const a4 = parseFloat(a4Input.value) || 0;
  const a3 = parseFloat(a3Input.value) || 0;

  const impresorasParaPromedio = CONFIG_ENERGIA.impresoras.filter(p => p.nombre !== "EPSON L8180");
  const epson = CONFIG_ENERGIA.impresoras.find(p => p.nombre === "EPSON L8180");

  // Promedio
  const consumosDiariosArray = impresorasParaPromedio.map(p => calcularValoresNumerico(p, horas, a4, a3).consumoDiarioRaw);
  const sumaConsumos = consumosDiariosArray.reduce((s, x) => s + x, 0);
  const consumoDiarioPromedioRaw = consumosDiariosArray.length ? (sumaConsumos / consumosDiariosArray.length) : 0;

  // Epson
  const resultadosEpsonNum = calcularValoresNumerico(epson, horas, a4, a3);

  // Mostrar Promedio
  tecnologiaPromedio.textContent = "Seca";
  consumoDiarioPromedio.textContent = `${consumoDiarioPromedioRaw.toFixed(2)} Wh`;
  consumoMensualPromedio.textContent = `${((consumoDiarioPromedioRaw * 30) / 1000).toFixed(2)} kWh`;
  const precioPromedioMes = ((consumoDiarioPromedioRaw * 30) / 1000) * 0.66;
  precioMesPromedio.textContent = `S/. ${precioPromedioMes.toFixed(2)}`;
  precioAnualPromedio.textContent = `S/. ${(precioPromedioMes * 12).toFixed(2)}`;

  // Mostrar Epson
  tecnologiaEpson.textContent = epson.tecnologia;
  consumoDiarioEpson.textContent = `${resultadosEpsonNum.consumoDiarioRaw.toFixed(2)} Wh`;
  consumoMensualEpson.textContent = `${resultadosEpsonNum.consumoMensualKwhRaw.toFixed(2)} kWh`;
  precioMesEpson.textContent = `S/. ${resultadosEpsonNum.precioMesRaw.toFixed(2)}`;
  precioAnualEpson.textContent = `S/. ${resultadosEpsonNum.precioAnualRaw.toFixed(2)}`;

  // Resumen ahorro
  const descuentoMes = precioPromedioMes - resultadosEpsonNum.precioMesRaw;
  const descuentoAnual = descuentoMes * 12;
  const beneficio = precioPromedioMes > 0 ? (descuentoMes / precioPromedioMes) * 100 : 0;

  descuentoMesOutput.textContent = `S/. ${descuentoMes.toFixed(2)}`;
  descuentoAnualOutput.textContent = `S/. ${descuentoAnual.toFixed(2)}`;
  beneficioOutput.textContent = `${beneficio.toFixed(2)} %`;
}

// Eventos
hoursInput.addEventListener('input', actualizarCalculadora);
a4Input.addEventListener('input', actualizarCalculadora);
a3Input.addEventListener('input', actualizarCalculadora);

// Inicial
window.onload = actualizarCalculadora;


