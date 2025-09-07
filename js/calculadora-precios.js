// Calculadora principal LEES Print
class CalculadoraLEESPrint {
  constructor() {
    this.config = CONFIG_LEES
    this.metodos = new MetodosLEES(this.config)

    // Estado de la aplicación
    this.exchangeRate = this.config.FALLBACK_EXCHANGE_RATE
    this.currentCurrency = "PEN"

    // Datos de entrada
    this.cantidades = { RX: 0, MG: 0, TC: 0, RM: 0 }
    this.cantidadPlacas = { RX: 0, MG: 0, TC: 0, RM: 0 }
    this.formatos = { ...this.config.FORMATOS_INICIALES }
    this.tipos = { ...this.config.TIPOS_INICIALES }

    this.initializeApp()
  }

  async initializeApp() {
    this.initializeElements()
    this.bindEvents()
    await this.loadExchangeRate()
    this.showDefaultSavingsPercentages()
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

    // Inputs de cantidad de placas
    this.cantidadPlacasInputs = {
      RX: document.getElementById("inputPlacasRx"),
      MG: document.getElementById("inputPlacasMg"),
      TC: document.getElementById("inputPlacasTc"),
      RM: document.getElementById("inputPlacasRm"),
    }

    // Elementos de salida de costos
    this.outputElements = {
      costoLees: {
        RX: document.getElementById("outputCostoLeesRx"),
        MG: document.getElementById("outputCostoLeesMg"),
        TC: document.getElementById("outputCostoLeesTc"),
        RM: document.getElementById("outputCostoLeesRm"),
      },
      costoPet: {
        RX: document.getElementById("outputCostoPetRx"),
        MG: document.getElementById("outputCostoPetMg"),
        TC: document.getElementById("outputCostoPetTc"),
        RM: document.getElementById("outputCostoPetRm"),
      },
      totalLees: {
        RX: document.getElementById("outputTotalLeesRx"),
        MG: document.getElementById("outputTotalLeesMg"),
        TC: document.getElementById("outputTotalLeesTc"),
        RM: document.getElementById("outputTotalLeesRm"),
      },
      totalPet: {
        RX: document.getElementById("outputTotalPetRx"),
        MG: document.getElementById("outputTotalPetMg"),
        TC: document.getElementById("outputTotalPetTc"),
        RM: document.getElementById("outputTotalPetRm"),
      },
      ahorroTotal: {
        RX: document.getElementById("outputAhorroRx"),
        MG: document.getElementById("outputAhorroMg"),
        TC: document.getElementById("outputAhorroTc"),
        RM: document.getElementById("outputAhorroRm"),
      },
      porcentaje: {
        RX: document.getElementById("outputPorcentajeRx"),
        MG: document.getElementById("outputPorcentajeMg"),
        TC: document.getElementById("outputPorcentajeTc"),
        RM: document.getElementById("outputPorcentajeRm"),
      },
    }

    // Elementos de resumen
    this.resumenElements = {
      leesTotal: document.getElementById("resumenLeesMensual"),
      leesAnual: document.getElementById("resumenLeesAnual"),
      petTotal: document.getElementById("resumenPetMensual"),
      petAnual: document.getElementById("resumenPetAnual"),
      ahorroMensual: document.getElementById("resumenAhorroMensual"),
      ahorroAnual: document.getElementById("resumenAhorroAnual"),
      porcentajeTotal: document.getElementById("resumenPorcentajeTotal"),
    }

    // Elementos de control de moneda
    this.currencySelect = document.getElementById("currencySelect")
  }

  bindEvents() {
    // Eventos de inputs de cantidad de exámenes
    Object.keys(this.cantidadInputs).forEach((modalidad) => {
      if (this.cantidadInputs[modalidad]) {
        this.cantidadInputs[modalidad].addEventListener("keydown", (e) => {
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

        this.cantidadInputs[modalidad].addEventListener("input", (e) => {
          this.metodos.validateInput(e.target)
          this.updateCantidad(modalidad, e.target.value)
        })

        this.cantidadInputs[modalidad].addEventListener("blur", (e) => {
          this.metodos.validateInput(e.target)
        })
      }
    })

    // Eventos de inputs de cantidad de placas
    Object.keys(this.cantidadPlacasInputs).forEach((modalidad) => {
      if (this.cantidadPlacasInputs[modalidad]) {
        this.cantidadPlacasInputs[modalidad].addEventListener("keydown", (e) => {
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

        this.cantidadPlacasInputs[modalidad].addEventListener("input", (e) => {
          this.metodos.validateInput(e.target)
          this.updateCantidadPlacas(modalidad, e.target.value)
        })

        this.cantidadPlacasInputs[modalidad].addEventListener("blur", (e) => {
          this.metodos.validateInput(e.target)
        })
      }
    })

    // Evento para cambio de moneda
    if (this.currencySelect) {
      this.currencySelect.addEventListener("change", (e) => {
        this.currentCurrency = e.target.value
        this.updateAllCalculations()
      })
    }
  }

  async loadExchangeRate() {
    try {
      const exchangeRate = await this.metodos.obtenerTipoCambio()
      this.exchangeRate = exchangeRate
      console.log(`Tipo de cambio cargado: ${this.exchangeRate} PEN por USD`)
    } catch (error) {
      console.error("Error al obtener tipo de cambio:", error)
      this.exchangeRate = this.config.FALLBACK_EXCHANGE_RATE
      console.log(`Usando tipo de cambio de respaldo: ${this.exchangeRate} PEN por USD`)
    }
  }

  showDefaultSavingsPercentages() {
    const modalidades = ["RX", "MG", "TC", "RM"]
    modalidades.forEach((modalidad) => {
      const formato = this.config.FORMATOS_INICIALES[modalidad]
      const tipo = this.config.TIPOS_INICIALES[modalidad]

      const precioLeesPEN = this.config.getPrecioLees(modalidad, formato, tipo)
      const precioPetUSD = this.config.getPrecioPetUSD(modalidad, formato)
      const precioPetPEN = precioPetUSD * this.exchangeRate

      const ahorroUnitario = precioPetPEN - precioLeesPEN
      const porcentajeAhorro = precioPetPEN > 0 ? (ahorroUnitario / precioPetPEN) * 100 : 0

      if (this.outputElements.porcentaje[modalidad]) {
        this.metodos.updateElementWithAnimation(
          this.outputElements.porcentaje[modalidad],
          `${porcentajeAhorro.toFixed(2)}%`,
        )
      }
    })
  }

  updateCantidad(modalidad, valor) {
    const numericValue = Number.parseInt(valor) || 0
    this.cantidades[modalidad] = Math.max(0, numericValue)

    const multiplicador = this.config.MULTIPLICADORES_PLACAS[modalidad]
    const cantidadPlacasCalculada = Math.round(numericValue * multiplicador)
    this.cantidadPlacas[modalidad] = cantidadPlacasCalculada
    if (this.cantidadPlacasInputs[modalidad]) {
      this.cantidadPlacasInputs[modalidad].value = cantidadPlacasCalculada
    }

    this.updateCalculationsForModalidad(modalidad)
    this.updateResumen()
  }

  updateCantidadPlacas(modalidad, valor) {
    const numericValue = Number.parseInt(valor) || 0
    this.cantidadPlacas[modalidad] = Math.max(0, numericValue)
    this.updateCalculationsForModalidad(modalidad)
    this.updateResumen()
  }

  getFormattedValue(amount) {
    switch (this.currentCurrency) {
      case "PEN":
        return this.metodos.formatPEN(amount)
      case "USD":
        const amountInUSD = amount / this.exchangeRate
        return this.metodos.formatUSD(amountInUSD)
      case "BOTH":
        const amountInUSDForBoth = amount / this.exchangeRate
        return `${this.metodos.formatPEN(amount)}<br>(${this.metodos.formatUSD(amountInUSDForBoth)})`
      default:
        return this.metodos.formatPEN(amount)
    }
  }

  updateCalculationsForModalidad(modalidad) {
    const cantidad = this.cantidadPlacas[modalidad]
    const formato = this.config.FORMATOS_INICIALES[modalidad]
    const tipo = this.config.TIPOS_INICIALES[modalidad]

    // Obtener precios base
    const precioLeesPEN = this.metodos.redondear(this.config.getPrecioLees(modalidad, formato, tipo))
    const precioPetUSD = this.metodos.redondear(this.config.getPrecioPetUSD(modalidad, formato))

    const precioPetPEN = this.metodos.redondear(precioPetUSD * this.exchangeRate)

    // Calcular totales en Soles (para cálculos internos)
    const totalLeesPEN = this.metodos.redondear(cantidad * precioLeesPEN)
    const totalPetPEN = this.metodos.redondear(cantidad * precioPetPEN)
    const ahorroTotalPEN = this.metodos.redondear(totalPetPEN - totalLeesPEN)

    // Calcular porcentaje de ahorro
    const porcentajeAhorro = totalPetPEN > 0 ? this.metodos.redondear((ahorroTotalPEN / totalPetPEN) * 100) : 0

    // Actualizar elementos con el formato de moneda seleccionado
    if (this.outputElements.costoLees[modalidad])
      this.metodos.updateElementWithAnimation(
        this.outputElements.costoLees[modalidad],
        this.getFormattedValue(precioLeesPEN),
      )
    if (this.outputElements.costoPet[modalidad])
      this.metodos.updateElementWithAnimation(
        this.outputElements.costoPet[modalidad],
        this.getFormattedValue(precioPetPEN),
      )
    if (this.outputElements.totalLees[modalidad])
      this.metodos.updateElementWithAnimation(
        this.outputElements.totalLees[modalidad],
        this.getFormattedValue(totalLeesPEN),
      )
    if (this.outputElements.totalPet[modalidad])
      this.metodos.updateElementWithAnimation(
        this.outputElements.totalPet[modalidad],
        this.getFormattedValue(totalPetPEN),
      )
    if (this.outputElements.ahorroTotal[modalidad])
      this.metodos.updateElementWithAnimation(
        this.outputElements.ahorroTotal[modalidad],
        this.getFormattedValue(ahorroTotalPEN),
      )
    if (this.outputElements.porcentaje[modalidad])
      this.metodos.updateElementWithAnimation(
        this.outputElements.porcentaje[modalidad],
        `${porcentajeAhorro.toFixed(2)}%`,
      )
  }

  updateAllCalculations() {
    Object.keys(this.cantidades).forEach((modalidad) => {
      this.updateCalculationsForModalidad(modalidad)
    })
    this.updateResumen()
  }

  updateResumen() {
    // Lógica para el cálculo de botellas
    const totalTinta = {
      NEGRO_PB: 0,
      GRIS: 0,
      CYAN: 0,
      AMARILLO: 0,
      MAGENTA: 0,
      BLACK: 0,
    }
    Object.keys(this.cantidadPlacas).forEach((modalidad) => {
      const cantidad = this.cantidadPlacas[modalidad]
      const formato = this.config.FORMATOS_INICIALES[modalidad]
      const tipo = this.config.TIPOS_INICIALES[modalidad]
      const consumoModalidad = this.metodos.calcularConsumoTinta(modalidad, formato, tipo, cantidad)
      Object.keys(totalTinta).forEach((color) => {
        totalTinta[color] += consumoModalidad[color]
      })
    })

    let leesTotalPEN = 0,
      petTotalPEN = 0
    const modalidades = ["RX", "MG", "TC", "RM"]
    modalidades.forEach((modalidad) => {
      const cantidad = this.cantidadPlacas[modalidad]
      const formato = this.config.FORMATOS_INICIALES[modalidad]
      const tipo = this.config.TIPOS_INICIALES[modalidad]
      const precioLeesPEN = this.metodos.redondear(this.config.getPrecioLees(modalidad, formato, tipo))
      const precioPetUSD = this.metodos.redondear(this.config.getPrecioPetUSD(modalidad, formato))
      const totalLeesPEN = this.metodos.redondear(cantidad * precioLeesPEN)
      const totalPetPEN = this.metodos.redondear(cantidad * (precioPetUSD * this.exchangeRate))
      leesTotalPEN += totalLeesPEN
      petTotalPEN += totalPetPEN
    })

    const ahorroMensualPEN = this.metodos.redondear(petTotalPEN - leesTotalPEN)
    const ahorroAnualPEN = this.metodos.redondear(ahorroMensualPEN * 12)
    const porcentajeTotalAhorro = petTotalPEN > 0 ? this.metodos.redondear((ahorroMensualPEN / petTotalPEN) * 100) : 0

    // Actualizar elementos de resumen
    if (this.resumenElements.leesTotal)
      this.metodos.updateElementWithAnimation(this.resumenElements.leesTotal, this.getFormattedValue(leesTotalPEN))
    if (this.resumenElements.leesAnual)
      this.metodos.updateElementWithAnimation(this.resumenElements.leesAnual, this.getFormattedValue(leesTotalPEN * 12))
    if (this.resumenElements.petTotal)
      this.metodos.updateElementWithAnimation(this.resumenElements.petTotal, this.getFormattedValue(petTotalPEN))
    if (this.resumenElements.petAnual)
      this.metodos.updateElementWithAnimation(this.resumenElements.petAnual, this.getFormattedValue(petTotalPEN * 12))
    if (this.resumenElements.ahorroMensual)
      this.metodos.updateElementWithAnimation(
        this.resumenElements.ahorroMensual,
        this.getFormattedValue(ahorroMensualPEN),
      )
    if (this.resumenElements.ahorroAnual)
      this.metodos.updateElementWithAnimation(this.resumenElements.ahorroAnual, this.getFormattedValue(ahorroAnualPEN))
    if (this.resumenElements.porcentajeTotal)
      this.metodos.updateElementWithAnimation(
        this.resumenElements.porcentajeTotal,
        `${porcentajeTotalAhorro.toFixed(2)}%`,
      )
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  new CalculadoraLEESPrint()
})
