// Configuración de impresoras para consumo energético
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
    },
  ],
  PRECIO_ENERGIA_KWH: 0.66,
}

// Clase para manejar la calculadora de consumo energético
class CalculadoraConsumoEnergia {
  constructor() {
    this.config = CONFIG_ENERGIA
    this.initializeElements()
    this.bindEvents()
    this.actualizarCalculadora()
  }

  initializeElements() {
    // Inputs
    this.hoursInput = document.getElementById("hoursInput")
    this.a4Input = document.getElementById("a4Input")
    this.a3Input = document.getElementById("a3Input")

    // Tabla elementos
    this.tecnologiaPromedio = document.getElementById("tecnologiaPromedio")
    this.tecnologiaEpson = document.getElementById("tecnologiaEpson")
    this.consumoDiarioPromedio = document.getElementById("consumoDiarioPromedio")
    this.consumoDiarioEpson = document.getElementById("consumoDiarioEpson")
    this.consumoMensualPromedio = document.getElementById("consumoMensualPromedio")
    this.consumoMensualEpson = document.getElementById("consumoMensualEpson")
    this.precioMesPromedio = document.getElementById("precioMesPromedio")
    this.precioMesEpson = document.getElementById("precioMesEpson")
    this.precioAnualPromedio = document.getElementById("precioAnualPromedio")
    this.precioAnualEpson = document.getElementById("precioAnualEpson")

    // Resumen elementos
    this.descuentoMesOutput = document.getElementById("descuentoMes")
    this.descuentoAnualOutput = document.getElementById("descuentoAnual")
    this.beneficioOutput = document.getElementById("beneficio")
  }

  validateInput(input) {
    let value = input.value

    // Remove any non-numeric characters
    value = value.replace(/[^0-9]/g, "")

    // Convert to integer
    const numValue = Number.parseInt(value)

    // If invalid or negative, clear the input and show visual feedback
    if (isNaN(numValue) || numValue < 0) {
      input.value = ""
      input.style.borderColor = "#e74c3c"
      input.style.backgroundColor = "rgba(231, 76, 60, 0.1)"
    } else {
      // Set the cleaned value
      input.value = numValue.toString()
      input.style.borderColor = "#27ae60"
      input.style.backgroundColor = "rgba(39, 174, 96, 0.1)"
    }

    // Reset styles after 2 seconds
    setTimeout(() => {
      input.style.borderColor = ""
      input.style.backgroundColor = ""
    }, 2000)
  }

  bindEvents() {
    const inputs = [this.hoursInput, this.a4Input, this.a3Input]

    inputs.forEach((input) => {
      if (input) {
        input.addEventListener("keydown", (e) => {
          // Allow control keys (backspace, delete, tab, escape, enter, arrows)
          if (
            [46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
            (e.keyCode === 65 && e.ctrlKey === true) ||
            (e.keyCode >= 35 && e.keyCode <= 39)
          ) {
            return
          }

          // Prevent non-numeric keys (including decimals and minus)
          if ((e.shiftKey || e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault()
          }
        })

        input.addEventListener("input", (e) => {
          this.validateInput(e.target)
          this.actualizarCalculadora()
        })

        input.addEventListener("blur", (e) => {
          this.validateInput(e.target)
        })
      }
    })
  }

  // Calcular valores numéricos para una impresora
  calcularValoresNumerico(impresora, horas, a4, a3) {
    const tiempoTotalActivo = a4 * impresora.tiempo_impresion_A4_s + a3 * impresora.tiempo_impresion_A3_s
    const tiempoTotalStandby = Math.max(horas * 3600 - tiempoTotalActivo, 0)

    const consumoDiario =
      (impresora.consumo_activo_W * tiempoTotalActivo) / 3600 +
      (impresora.consumo_standby_W * tiempoTotalStandby) / 3600
    const consumoMensual_kwh = (consumoDiario * 30) / 1000
    const precioMes = consumoMensual_kwh * this.config.PRECIO_ENERGIA_KWH
    const precioAnual = precioMes * 12

    return {
      consumoDiarioRaw: consumoDiario,
      consumoMensualKwhRaw: consumoMensual_kwh,
      precioMesRaw: precioMes,
      precioAnualRaw: precioAnual,
    }
  }

  // Actualizar todos los cálculos
  actualizarCalculadora() {
    const horas = Number.parseFloat(this.hoursInput?.value) || 0
    const a4 = Number.parseFloat(this.a4Input?.value) || 0
    const a3 = Number.parseFloat(this.a3Input?.value) || 0

    const impresorasParaPromedio = this.config.impresoras.filter((p) => p.nombre !== "EPSON L8180")
    const epson = this.config.impresoras.find((p) => p.nombre === "EPSON L8180")

    if (!epson) {
      console.error("No se encontró la impresora EPSON L8180")
      return
    }

    // Calcular promedio
    const consumosDiariosArray = impresorasParaPromedio.map(
      (p) => this.calcularValoresNumerico(p, horas, a4, a3).consumoDiarioRaw,
    )
    const sumaConsumos = consumosDiariosArray.reduce((s, x) => s + x, 0)
    const consumoDiarioPromedioRaw = consumosDiariosArray.length ? sumaConsumos / consumosDiariosArray.length : 0

    // Calcular Epson
    const resultadosEpsonNum = this.calcularValoresNumerico(epson, horas, a4, a3)

    // Mostrar resultados promedio
    if (this.tecnologiaPromedio) this.tecnologiaPromedio.textContent = "Seca"
    if (this.consumoDiarioPromedio) this.consumoDiarioPromedio.textContent = `${consumoDiarioPromedioRaw.toFixed(2)} Wh`
    if (this.consumoMensualPromedio)
      this.consumoMensualPromedio.textContent = `${((consumoDiarioPromedioRaw * 30) / 1000).toFixed(2)} kWh`

    const precioPromedioMes = ((consumoDiarioPromedioRaw * 30) / 1000) * this.config.PRECIO_ENERGIA_KWH
    if (this.precioMesPromedio) this.precioMesPromedio.textContent = `S/. ${precioPromedioMes.toFixed(2)}`
    if (this.precioAnualPromedio) this.precioAnualPromedio.textContent = `S/. ${(precioPromedioMes * 12).toFixed(2)}`

    // Mostrar resultados Epson
    if (this.tecnologiaEpson) this.tecnologiaEpson.textContent = epson.tecnologia
    if (this.consumoDiarioEpson)
      this.consumoDiarioEpson.textContent = `${resultadosEpsonNum.consumoDiarioRaw.toFixed(2)} Wh`
    if (this.consumoMensualEpson)
      this.consumoMensualEpson.textContent = `${resultadosEpsonNum.consumoMensualKwhRaw.toFixed(2)} kWh`
    if (this.precioMesEpson) this.precioMesEpson.textContent = `S/. ${resultadosEpsonNum.precioMesRaw.toFixed(2)}`
    if (this.precioAnualEpson) this.precioAnualEpson.textContent = `S/. ${resultadosEpsonNum.precioAnualRaw.toFixed(2)}`

    // Calcular y mostrar resumen de ahorro
    const descuentoMes = precioPromedioMes - resultadosEpsonNum.precioMesRaw
    const descuentoAnual = descuentoMes * 12
    const beneficio = precioPromedioMes > 0 ? (descuentoMes / precioPromedioMes) * 100 : 0

    if (this.descuentoMesOutput) this.descuentoMesOutput.textContent = `S/. ${descuentoMes.toFixed(2)}`
    if (this.descuentoAnualOutput) this.descuentoAnualOutput.textContent = `S/. ${descuentoAnual.toFixed(2)}`
    if (this.beneficioOutput) this.beneficioOutput.textContent = `${beneficio.toFixed(2)} %`
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  new CalculadoraConsumoEnergia()
})
