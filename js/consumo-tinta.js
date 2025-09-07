class CalculadoraConsumoTinta {
  constructor() {
    this.config = CONFIG_LEES
    this.metodos = new MetodosLEES(this.config)
    this.initializeApp()
  }

  initializeApp() {
    this.initializeElements()
    this.bindEvents()
    this.updateAllCalculations()
  }

  initializeElements() {
    // Inputs de cantidad de exámenes
    this.cantidadInputs = {
      RX: document.getElementById("inputExamenesRx"),
      MG: document.getElementById("inputExamenesMg"),
      TC: document.getElementById("inputExamenesTc"),
      RM: document.getElementById("inputExamenesRm"),
    }

    this.cantidadPlacasInputs = {
      RX: document.getElementById("outputPlacasRx"),
      MG: document.getElementById("outputPlacasMg"),
      TC: document.getElementById("outputPlacasTc"),
      RM: document.getElementById("outputPlacasRm"),
    }

    // Elementos de salida de consumo de tinta por modalidad
    this.tintaElements = {
      TC: {
        negro: document.getElementById("tintaTcNegro"),
        gris: document.getElementById("tintaTcGris"),
        cyan: document.getElementById("tintaTcCyan"),
        amarillo: document.getElementById("tintaTcAmarillo"),
        magenta: document.getElementById("tintaTcMagenta"),
        black: document.getElementById("tintaTcBlack"),
        total: document.getElementById("tintaTcTotal"),
      },
      MG: {
        negro: document.getElementById("tintaMgNegro"),
        gris: document.getElementById("tintaMgGris"),
        cyan: document.getElementById("tintaMgCyan"),
        amarillo: document.getElementById("tintaMgAmarillo"),
        magenta: document.getElementById("tintaMgMagenta"),
        black: document.getElementById("tintaMgBlack"),
        total: document.getElementById("tintaMgTotal"),
      },
      RM: {
        negro: document.getElementById("tintaRmNegro"),
        gris: document.getElementById("tintaRmGris"),
        cyan: document.getElementById("tintaRmCyan"),
        amarillo: document.getElementById("tintaRmAmarillo"),
        magenta: document.getElementById("tintaRmMagenta"),
        black: document.getElementById("tintaRmBlack"),
        total: document.getElementById("tintaRmTotal"),
      },
      RX: {
        negro: document.getElementById("tintaRxNegro"),
        gris: document.getElementById("tintaRxGris"),
        cyan: document.getElementById("tintaRxCyan"),
        amarillo: document.getElementById("tintaRxAmarillo"),
        magenta: document.getElementById("tintaRxMagenta"),
        black: document.getElementById("tintaRxBlack"),
        total: document.getElementById("tintaRxTotal"),
      },
    }

    // Elementos de totales
    this.totalElements = {
      negro: document.getElementById("tintaTotalNegro"),
      gris: document.getElementById("tintaTotalGris"),
      cyan: document.getElementById("tintaTotalCyan"),
      amarillo: document.getElementById("tintaTotalAmarillo"),
      magenta: document.getElementById("tintaTotalMagenta"),
      black: document.getElementById("tintaTotalBlack"),
      general: document.getElementById("tintaTotalGeneral"),
    }

    // Elementos de botellas mensuales
    this.botellasMensualesElements = {
      negro: document.getElementById("botellasNegroMes"),
      gris: document.getElementById("botellasGrisMes"),
      cyan: document.getElementById("botellasCyanMes"),
      amarillo: document.getElementById("botellasAmarilloMes"),
      magenta: document.getElementById("botellasMagentaMes"),
      black: document.getElementById("botellasBlackMes"),
    }

    // Elementos de botellas anuales
    this.botellasAnualesElements = {
      negro: document.getElementById("botellasNegroAnual"),
      gris: document.getElementById("botellasGrisAnual"),
      cyan: document.getElementById("botellasCyanAnual"),
      amarillo: document.getElementById("botellasAmarilloAnual"),
      magenta: document.getElementById("botellasMagentaAnual"),
      black: document.getElementById("botellasBlackAnual"),
    }

    // Elementos de resumen de botellas
    this.totalBotellasMensual = document.getElementById("totalBotellasMes")
    this.totalBotellasAnual = document.getElementById("totalBotellasAnual")
  }

  bindEvents() {
    Object.keys(this.cantidadInputs).forEach((modalidad) => {
      if (this.cantidadInputs[modalidad]) {
        this.cantidadInputs[modalidad].addEventListener("input", () => {
          this.updateCalculationsFromExams(modalidad)
          this.updateTotales()
        })

        this.cantidadInputs[modalidad].addEventListener("blur", (e) => {
          this.metodos.validateInput(e.target)
        })
      }
    })

    Object.keys(this.cantidadPlacasInputs).forEach((modalidad) => {
      if (this.cantidadPlacasInputs[modalidad]) {
        this.cantidadPlacasInputs[modalidad].addEventListener("input", () => {
          this.updateCalculationsFromPlates(modalidad)
          this.updateTotales()
        })

        this.cantidadPlacasInputs[modalidad].addEventListener("blur", (e) => {
          this.metodos.validateInput(e.target)
        })
      }
    })
  }

  updateCalculationsFromExams(modalidad) {
    const cantidadExamenes = Number.parseInt(this.cantidadInputs[modalidad]?.value) || 0

    // Calculate plates using multipliers
    const multiplicador = this.config.MULTIPLICADORES_PLACAS[modalidad]
    const cantidadPlacas = Math.round(cantidadExamenes * multiplicador)

    // Update the plate input
    if (this.cantidadPlacasInputs[modalidad]) {
      this.cantidadPlacasInputs[modalidad].value = cantidadPlacas
    }

    this.calculateInkConsumption(modalidad, cantidadPlacas)
  }

  updateCalculationsFromPlates(modalidad) {
    const cantidadPlacas = Number.parseInt(this.cantidadPlacasInputs[modalidad]?.value) || 0

    // Clear the exam input since we're working with direct plates
    if (this.cantidadInputs[modalidad]) {
      this.cantidadInputs[modalidad].value = 0
    }

    this.calculateInkConsumption(modalidad, cantidadPlacas)
  }

  calculateInkConsumption(modalidad, cantidadPlacas) {
    const formato = this.config.FORMATOS_INICIALES[modalidad]
    const tipo = this.config.TIPOS_INICIALES[modalidad]

    // Calculate ink consumption
    const consumoTinta = this.metodos.calcularConsumoTinta(modalidad, formato, tipo, cantidadPlacas)

    // Calculate total for this modality
    let totalModalidad = 0
    Object.values(consumoTinta).forEach((valor) => {
      totalModalidad += valor
    })

    // Update ink consumption elements
    if (this.tintaElements[modalidad]) {
      const elementos = this.tintaElements[modalidad]
      if (elementos.negro) elementos.negro.textContent = `${consumoTinta.NEGRO_PB.toFixed(3)} ml`
      if (elementos.gris) elementos.gris.textContent = `${consumoTinta.GRIS.toFixed(3)} ml`
      if (elementos.cyan) elementos.cyan.textContent = `${consumoTinta.CYAN.toFixed(3)} ml`
      if (elementos.amarillo) elementos.amarillo.textContent = `${consumoTinta.AMARILLO.toFixed(3)} ml`
      if (elementos.magenta) elementos.magenta.textContent = `${consumoTinta.MAGENTA.toFixed(3)} ml`
      if (elementos.black) elementos.black.textContent = `${consumoTinta.BLACK.toFixed(3)} ml`
      if (elementos.total) elementos.total.textContent = `${totalModalidad.toFixed(3)} ml`
    }
  }

  updateTotales() {
    const totalTinta = {
      NEGRO_PB: 0,
      GRIS: 0,
      CYAN: 0,
      AMARILLO: 0,
      MAGENTA: 0,
      BLACK: 0,
    }

    Object.keys(this.cantidadPlacasInputs).forEach((modalidad) => {
      const cantidadPlacas = Number.parseInt(this.cantidadPlacasInputs[modalidad]?.value) || 0
      const formato = this.config.FORMATOS_INICIALES[modalidad]
      const tipo = this.config.TIPOS_INICIALES[modalidad]

      const consumoModalidad = this.metodos.calcularConsumoTinta(modalidad, formato, tipo, cantidadPlacas)
      Object.keys(totalTinta).forEach((color) => {
        totalTinta[color] += consumoModalidad[color]
      })
    })

    // Calcular total general
    let totalGeneral = 0
    Object.values(totalTinta).forEach((valor) => {
      totalGeneral += valor
    })

    // Actualizar elementos de totales
    if (this.totalElements.negro)
      this.totalElements.negro.innerHTML = `<strong>${totalTinta.NEGRO_PB.toFixed(3)} ml</strong>`
    if (this.totalElements.gris) this.totalElements.gris.innerHTML = `<strong>${totalTinta.GRIS.toFixed(3)} ml</strong>`
    if (this.totalElements.cyan) this.totalElements.cyan.innerHTML = `<strong>${totalTinta.CYAN.toFixed(3)} ml</strong>`
    if (this.totalElements.amarillo)
      this.totalElements.amarillo.innerHTML = `<strong>${totalTinta.AMARILLO.toFixed(3)} ml</strong>`
    if (this.totalElements.magenta)
      this.totalElements.magenta.innerHTML = `<strong>${totalTinta.MAGENTA.toFixed(3)} ml</strong>`
    if (this.totalElements.black)
      this.totalElements.black.innerHTML = `<strong>${totalTinta.BLACK.toFixed(3)} ml</strong>`
    if (this.totalElements.general)
      this.totalElements.general.innerHTML = `<strong>${totalGeneral.toFixed(3)} ml</strong>`

    // Calcular botellas necesarias (usando 70ml por botella como indica el HTML)
    const calcularBotellasNecesarias = (ml) => Math.ceil(ml / 70)

    const botellasMensuales = {
      NEGRO_PB: calcularBotellasNecesarias(totalTinta.NEGRO_PB),
      GRIS: calcularBotellasNecesarias(totalTinta.GRIS),
      CYAN: calcularBotellasNecesarias(totalTinta.CYAN),
      AMARILLO: calcularBotellasNecesarias(totalTinta.AMARILLO),
      MAGENTA: calcularBotellasNecesarias(totalTinta.MAGENTA),
      BLACK: calcularBotellasNecesarias(totalTinta.BLACK),
    }

    const botellasAnuales = {
      NEGRO_PB: calcularBotellasNecesarias(totalTinta.NEGRO_PB * 12),
      GRIS: calcularBotellasNecesarias(totalTinta.GRIS * 12),
      CYAN: calcularBotellasNecesarias(totalTinta.CYAN * 12),
      AMARILLO: calcularBotellasNecesarias(totalTinta.AMARILLO * 12),
      MAGENTA: calcularBotellasNecesarias(totalTinta.MAGENTA * 12),
      BLACK: calcularBotellasNecesarias(totalTinta.BLACK * 12),
    }

    // Actualizar elementos de botellas mensuales
    if (this.botellasMensualesElements.negro)
      this.botellasMensualesElements.negro.textContent = botellasMensuales.NEGRO_PB.toString()
    if (this.botellasMensualesElements.gris)
      this.botellasMensualesElements.gris.textContent = botellasMensuales.GRIS.toString()
    if (this.botellasMensualesElements.cyan)
      this.botellasMensualesElements.cyan.textContent = botellasMensuales.CYAN.toString()
    if (this.botellasMensualesElements.amarillo)
      this.botellasMensualesElements.amarillo.textContent = botellasMensuales.AMARILLO.toString()
    if (this.botellasMensualesElements.magenta)
      this.botellasMensualesElements.magenta.textContent = botellasMensuales.MAGENTA.toString()
    if (this.botellasMensualesElements.black)
      this.botellasMensualesElements.black.textContent = botellasMensuales.BLACK.toString()

    // Actualizar elementos de botellas anuales
    if (this.botellasAnualesElements.negro)
      this.botellasAnualesElements.negro.textContent = botellasAnuales.NEGRO_PB.toString()
    if (this.botellasAnualesElements.gris)
      this.botellasAnualesElements.gris.textContent = botellasAnuales.GRIS.toString()
    if (this.botellasAnualesElements.cyan)
      this.botellasAnualesElements.cyan.textContent = botellasAnuales.CYAN.toString()
    if (this.botellasAnualesElements.amarillo)
      this.botellasAnualesElements.amarillo.textContent = botellasAnuales.AMARILLO.toString()
    if (this.botellasAnualesElements.magenta)
      this.botellasAnualesElements.magenta.textContent = botellasAnuales.MAGENTA.toString()
    if (this.botellasAnualesElements.black)
      this.botellasAnualesElements.black.textContent = botellasAnuales.BLACK.toString()

    // Calcular totales de botellas
    const totalBotellasMensuales = Object.values(botellasMensuales).reduce((sum, val) => sum + val, 0)
    const totalBotellasAnuales = Object.values(botellasAnuales).reduce((sum, val) => sum + val, 0)

    if (this.totalBotellasMensual) this.totalBotellasMensual.textContent = `${totalBotellasMensuales} botellas`
    if (this.totalBotellasAnual) this.totalBotellasAnual.textContent = `${totalBotellasAnuales} botellas`
  }

  updateAllCalculations() {
    Object.keys(this.cantidadInputs).forEach((modalidad) => {
      this.updateCalculationsFromExams(modalidad)
    })
    this.updateTotales()
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  new CalculadoraConsumoTinta()
})
