class CalculadoraResumidaLEES {
  constructor() {
    this.config = CONFIG_LEES
    this.metodos = new MetodosLEES(this.config)

    // Estado de la aplicación
    this.exchangeRate = this.config.FALLBACK_EXCHANGE_RATE
    this.currentCurrency = "PEN"

    // Datos de entrada (orden: RX, MG, TC, RM) - INICIALIZAR CON VALORES POR DEFECTO
    this.cantidadExamenes = { RX: 0, MG: 0, TC: 0, RM: 0 }
    this.cantidadPlacas = { RX: 0, MG: 0, TC: 0, RM: 0 }
    this.formatos = { ...this.config.FORMATOS_INICIALES }
    this.tipos = { ...this.config.TIPOS_INICIALES }

    this.initializeApp()
  }

  async initializeApp() {
    this.initializeElements()
    this.bindEvents()
    await this.loadExchangeRate()
    // CALCULAR INMEDIATAMENTE AL CARGAR
    this.updateAllCalculations()
    this.hideLoadingOverlay()
  }

  initializeElements() {
    // Inputs de cantidad de exámenes (orden: RX, MG, TC, RM)
    this.examenesInputs = {
      RX: document.getElementById("examenes-rx"),
      MG: document.getElementById("examenes-mg"),
      TC: document.getElementById("examenes-tc"),
      RM: document.getElementById("examenes-rm"),
    }

    // Inputs de cantidad de placas (orden: RX, MG, TC, RM)
    this.placasInputs = {
      RX: document.getElementById("placas-rx"),
      MG: document.getElementById("placas-mg"),
      TC: document.getElementById("placas-tc"),
      RM: document.getElementById("placas-rm"),
    }

    // Elementos de salida de costos unitarios
    this.costosUnitarios = {
      pet: {
        RX: document.getElementById("costo-pet-rx"),
        MG: document.getElementById("costo-pet-mg"),
        TC: document.getElementById("costo-pet-tc"),
        RM: document.getElementById("costo-pet-rm"),
      },
      lees: {
        RX: document.getElementById("costo-lees-rx"),
        MG: document.getElementById("costo-lees-mg"),
        TC: document.getElementById("costo-lees-tc"),
        RM: document.getElementById("costo-lees-rm"),
      },
    }

    // Elementos de totales mensuales
    this.totalesMensuales = {
      pet: {
        RX: document.getElementById("total-pet-rx"),
        MG: document.getElementById("total-pet-mg"),
        TC: document.getElementById("total-pet-tc"),
        RM: document.getElementById("total-pet-rm"),
      },
      lees: {
        RX: document.getElementById("total-lees-rx"),
        MG: document.getElementById("total-lees-mg"),
        TC: document.getElementById("total-lees-tc"),
        RM: document.getElementById("total-lees-rm"),
      },
    }

    // Elementos de ahorros
    this.ahorros = {
      RX: document.getElementById("ahorro-rx"),
      MG: document.getElementById("ahorro-mg"),
      TC: document.getElementById("ahorro-tc"),
      RM: document.getElementById("ahorro-rm"),
    }

    // Elementos de porcentajes
    this.porcentajes = {
      RX: document.getElementById("porcentaje-rx"),
      MG: document.getElementById("porcentaje-mg"),
      TC: document.getElementById("porcentaje-tc"),
      RM: document.getElementById("porcentaje-rm"),
    }

    // Elementos de resumen
    this.resumenElements = {
      petMensual: document.getElementById("resumen-pet-mensual"),
      petAnual: document.getElementById("resumen-pet-anual"),
      leesMensual: document.getElementById("resumen-lees-mensual"),
      leesAnual: document.getElementById("resumen-lees-anual"),
      ahorroMensual: document.getElementById("resumen-ahorro-mensual"),
      ahorroAnual: document.getElementById("resumen-ahorro-anual"),
      porcentajeTotal: document.getElementById("resumen-porcentaje-total"),
    }

    // Controles - ELIMINAR REFERENCIAS A BOTONES
    this.currencySelect = document.getElementById("currency-select")
    this.loadingOverlay = document.getElementById("loading-overlay")
  }

  bindEvents() {
    // Eventos de inputs de placas
    Object.keys(this.placasInputs).forEach((modalidad) => {
      this.placasInputs[modalidad].addEventListener("input", (e) => {
        this.updateCantidadPlacas(modalidad, e.target.value)
      })

      this.placasInputs[modalidad].addEventListener("blur", (e) => {
        this.metodos.validateInput(e.target)
      })
    })

    // Eventos de inputs de exámenes
    Object.keys(this.examenesInputs).forEach((modalidad) => {
      this.examenesInputs[modalidad].addEventListener("input", (e) => {
        this.updateCantidadExamenes(modalidad, e.target.value)
      })

      this.examenesInputs[modalidad].addEventListener("blur", (e) => {
        this.metodos.validateInput(e.target)
      })
    })

    // Evento para cambio de moneda
    this.currencySelect.addEventListener("change", (e) => {
      this.updateCurrencyDisplay(e.target.value)
    })

    // Configurar validación de inputs
    this.metodos.configurarValidacionInputs({ ...this.placasInputs, ...this.examenesInputs })
  }

  async loadExchangeRate() {
    try {
      this.exchangeRate = await this.metodos.obtenerTipoCambio(this.config.OPEN_EXCHANGE_RATES_API_KEY)
      this.updateAllCalculations()
    } catch (error) {
      this.exchangeRate = this.config.FALLBACK_EXCHANGE_RATE
      this.metodos.mostrarMensaje("Usando tipo de cambio de respaldo", "warning")
    }
  }

  updateCantidadPlacas(modalidad, valor) {
    const numericValue = Number.parseInt(valor) || 0
    this.cantidadPlacas[modalidad] = Math.max(0, numericValue)
    this.updateCalculationsForModalidad(modalidad)
    this.updateResumen()
  }

  updateCantidadExamenes(modalidad, valor) {
    const numericValue = Number.parseInt(valor) || 0
    this.cantidadExamenes[modalidad] = Math.max(0, numericValue)

    // Calcular automáticamente las placas usando multiplicadores de la configuración
    const multiplicador = this.config.MULTIPLICADORES_PLACAS[modalidad]
    const placasCalculadas = Math.round(numericValue * multiplicador)
    this.cantidadPlacas[modalidad] = placasCalculadas
    this.placasInputs[modalidad].value = placasCalculadas

    this.updateCalculationsForModalidad(modalidad)
    this.updateResumen()
  }

  updateCurrencyDisplay(currency) {
    this.currentCurrency = currency
    this.updateAllCalculations()
  }

  updateCalculationsForModalidad(modalidad) {
    const cantidad = this.cantidadPlacas[modalidad]
    const formato = this.formatos[modalidad]
    const tipo = this.tipos[modalidad]

    // Obtener precios y redondear INMEDIATAMENTE
    const precioLeesPEN = this.metodos.redondear(this.config.getPrecioLees(modalidad, formato, tipo))
    const precioPetUSD = this.metodos.redondear(this.config.getPrecioPet(modalidad, formato))

    // Calcular conversiones y redondear
    const precioLeesUSD = this.metodos.redondear(precioLeesPEN / this.exchangeRate)
    const precioPetPEN = this.metodos.redondear(precioPetUSD * this.exchangeRate)

    // Calcular totales y redondear CADA OPERACIÓN
    const totalLeesPEN = this.metodos.redondear(cantidad * precioLeesPEN)
    const totalPetPEN = this.metodos.redondear(cantidad * precioPetPEN)
    const totalLeesUSD = this.metodos.redondear(cantidad * precioLeesUSD)
    const totalPetUSD = this.metodos.redondear(cantidad * precioPetUSD)

    // Calcular ahorros y redondear
    const ahorroTotalPEN = this.metodos.redondear(totalPetPEN - totalLeesPEN)
    const ahorroTotalUSD = this.metodos.redondear(totalPetUSD - totalLeesUSD)

    // Calcular porcentaje de ahorro y redondear
    const porcentajeAhorro = totalPetPEN > 0 ? this.metodos.redondear((ahorroTotalPEN / totalPetPEN) * 100) : 0

    // Actualizar elementos según la moneda seleccionada
    this.updateCurrencyElements(modalidad, {
      precioLeesPEN,
      precioLeesUSD,
      precioPetPEN,
      precioPetUSD,
      totalLeesPEN,
      totalLeesUSD,
      totalPetPEN,
      totalPetUSD,
      ahorroTotalPEN,
      ahorroTotalUSD,
      porcentajeAhorro,
    })
  }

  updateCurrencyElements(modalidad, valores) {
    const {
      precioLeesPEN,
      precioLeesUSD,
      precioPetPEN,
      precioPetUSD,
      totalLeesPEN,
      totalLeesUSD,
      totalPetPEN,
      totalPetUSD,
      ahorroTotalPEN,
      ahorroTotalUSD,
      porcentajeAhorro,
    } = valores

    switch (this.currentCurrency) {
      case "PEN":
        this.metodos.updateElementWithAnimation(
          this.costosUnitarios.pet[modalidad],
          this.metodos.formatPEN(precioPetPEN),
        )
        this.metodos.updateElementWithAnimation(
          this.costosUnitarios.lees[modalidad],
          this.metodos.formatPEN(precioLeesPEN),
        )
        this.metodos.updateElementWithAnimation(
          this.totalesMensuales.pet[modalidad],
          this.metodos.formatPEN(totalPetPEN),
        )
        this.metodos.updateElementWithAnimation(
          this.totalesMensuales.lees[modalidad],
          this.metodos.formatPEN(totalLeesPEN),
        )
        this.metodos.updateElementWithAnimation(this.ahorros[modalidad], this.metodos.formatPEN(ahorroTotalPEN))
        break

      case "USD":
        this.metodos.updateElementWithAnimation(
          this.costosUnitarios.pet[modalidad],
          this.metodos.formatUSD(precioPetUSD),
        )
        this.metodos.updateElementWithAnimation(
          this.costosUnitarios.lees[modalidad],
          this.metodos.formatUSD(precioLeesUSD),
        )
        this.metodos.updateElementWithAnimation(
          this.totalesMensuales.pet[modalidad],
          this.metodos.formatUSD(totalPetUSD),
        )
        this.metodos.updateElementWithAnimation(
          this.totalesMensuales.lees[modalidad],
          this.metodos.formatUSD(totalLeesUSD),
        )
        this.metodos.updateElementWithAnimation(this.ahorros[modalidad], this.metodos.formatUSD(ahorroTotalUSD))
        break

      case "BOTH":
        this.metodos.updateElementWithAnimation(
          this.costosUnitarios.pet[modalidad],
          `${this.metodos.formatPEN(precioPetPEN)} / ${this.metodos.formatUSD(precioPetUSD)}`,
        )
        this.metodos.updateElementWithAnimation(
          this.costosUnitarios.lees[modalidad],
          `${this.metodos.formatPEN(precioLeesPEN)} / ${this.metodos.formatUSD(precioLeesUSD)}`,
        )
        this.metodos.updateElementWithAnimation(
          this.totalesMensuales.pet[modalidad],
          `${this.metodos.formatPEN(totalPetPEN)} / ${this.metodos.formatUSD(totalPetUSD)}`,
        )
        this.metodos.updateElementWithAnimation(
          this.totalesMensuales.lees[modalidad],
          `${this.metodos.formatPEN(totalLeesPEN)} / ${this.metodos.formatUSD(totalLeesUSD)}`,
        )
        this.metodos.updateElementWithAnimation(
          this.ahorros[modalidad],
          `${this.metodos.formatPEN(ahorroTotalPEN)} / ${this.metodos.formatUSD(ahorroTotalUSD)}`,
        )
        break
    }

    // Porcentaje siempre se muestra igual - REDONDEAR A 1 DECIMAL
    this.metodos.updateElementWithAnimation(this.porcentajes[modalidad], `${porcentajeAhorro.toFixed(1)}%`)
  }

  updateAllCalculations() {
    // Calcular para todas las modalidades, incluso con valores 0
    Object.keys(this.cantidadPlacas).forEach((modalidad) => {
      this.updateCalculationsForModalidad(modalidad)
    })
    this.updateResumen()
  }

  updateResumen() {
    let totalPetPEN = 0,
      totalPetUSD = 0,
      totalLeesPEN = 0,
      totalLeesUSD = 0

    // Calcular totales generales - REDONDEAR CADA SUMA PARCIAL
    ;["RX", "MG", "TC", "RM"].forEach((modalidad) => {
      const cantidad = this.cantidadPlacas[modalidad]
      const formato = this.formatos[modalidad]
      const tipo = this.tipos[modalidad]

      // Obtener precios base y redondear
      const precioLeesPEN = this.metodos.redondear(this.config.getPrecioLees(modalidad, formato, tipo))
      const precioPetUSD = this.metodos.redondear(this.config.getPrecioPet(modalidad, formato))

      // Calcular conversiones y redondear
      const precioPetPEN = this.metodos.redondear(precioPetUSD * this.exchangeRate)
      const precioLeesUSD = this.metodos.redondear(precioLeesPEN / this.exchangeRate)

      // Calcular totales por modalidad y redondear
      const totalModalidadPetPEN = this.metodos.redondear(cantidad * precioPetPEN)
      const totalModalidadPetUSD = this.metodos.redondear(cantidad * precioPetUSD)
      const totalModalidadLeesPEN = this.metodos.redondear(cantidad * precioLeesPEN)
      const totalModalidadLeesUSD = this.metodos.redondear(cantidad * precioLeesUSD)

      // Sumar a los totales generales
      totalPetPEN += totalModalidadPetPEN
      totalPetUSD += totalModalidadPetUSD
      totalLeesPEN += totalModalidadLeesPEN
      totalLeesUSD += totalModalidadLeesUSD
    })

    // Redondear totales finales
    totalPetPEN = this.metodos.redondear(totalPetPEN)
    totalPetUSD = this.metodos.redondear(totalPetUSD)
    totalLeesPEN = this.metodos.redondear(totalLeesPEN)
    totalLeesUSD = this.metodos.redondear(totalLeesUSD)

    // Calcular ahorros mensuales y redondear
    const ahorroMensualPEN = this.metodos.redondear(totalPetPEN - totalLeesPEN)
    const ahorroMensualUSD = this.metodos.redondear(totalPetUSD - totalLeesUSD)

    // Calcular ahorros anuales y redondear (multiplicación por 12)
    const ahorroAnualPEN = this.metodos.redondear(ahorroMensualPEN * 12)
    const ahorroAnualUSD = this.metodos.redondear(ahorroMensualUSD * 12)

    // Calcular totales anuales y redondear
    const totalAnualPetPEN = this.metodos.redondear(totalPetPEN * 12)
    const totalAnualPetUSD = this.metodos.redondear(totalPetUSD * 12)
    const totalAnualLeesPEN = this.metodos.redondear(totalLeesPEN * 12)
    const totalAnualLeesUSD = this.metodos.redondear(totalLeesUSD * 12)

    // Calcular porcentaje total evitando NaN y redondear
    const porcentajeTotalAhorro = totalPetPEN > 0 ? this.metodos.redondear((ahorroMensualPEN / totalPetPEN) * 100) : 0

    // Actualizar elementos de resumen con valores ya redondeados
    this.updateResumenElements(
      totalPetPEN,
      totalPetUSD,
      totalLeesPEN,
      totalLeesUSD,
      totalAnualPetPEN,
      totalAnualPetUSD,
      totalAnualLeesPEN,
      totalAnualLeesUSD,
      ahorroMensualPEN,
      ahorroMensualUSD,
      ahorroAnualPEN,
      ahorroAnualUSD,
      porcentajeTotalAhorro,
    )
  }

  updateResumenElements(
    totalPetPEN,
    totalPetUSD,
    totalLeesPEN,
    totalLeesUSD,
    totalAnualPetPEN,
    totalAnualPetUSD,
    totalAnualLeesPEN,
    totalAnualLeesUSD,
    ahorroMensualPEN,
    ahorroMensualUSD,
    ahorroAnualPEN,
    ahorroAnualUSD,
    porcentajeTotalAhorro,
  ) {
    switch (this.currentCurrency) {
      case "PEN":
        this.metodos.updateElementWithAnimation(this.resumenElements.petMensual, this.metodos.formatPEN(totalPetPEN))
        this.metodos.updateElementWithAnimation(this.resumenElements.petAnual, this.metodos.formatPEN(totalAnualPetPEN))
        this.metodos.updateElementWithAnimation(this.resumenElements.leesMensual, this.metodos.formatPEN(totalLeesPEN))
        this.metodos.updateElementWithAnimation(
          this.resumenElements.leesAnual,
          this.metodos.formatPEN(totalAnualLeesPEN),
        )
        this.metodos.updateElementWithAnimation(
          this.resumenElements.ahorroMensual,
          this.metodos.formatPEN(ahorroMensualPEN),
        )
        this.metodos.updateElementWithAnimation(
          this.resumenElements.ahorroAnual,
          this.metodos.formatPEN(ahorroAnualPEN),
        )
        break

      case "USD":
        this.metodos.updateElementWithAnimation(this.resumenElements.petMensual, this.metodos.formatUSD(totalPetUSD))
        this.metodos.updateElementWithAnimation(this.resumenElements.petAnual, this.metodos.formatUSD(totalAnualPetUSD))
        this.metodos.updateElementWithAnimation(this.resumenElements.leesMensual, this.metodos.formatUSD(totalLeesUSD))
        this.metodos.updateElementWithAnimation(
          this.resumenElements.leesAnual,
          this.metodos.formatUSD(totalAnualLeesUSD),
        )
        this.metodos.updateElementWithAnimation(
          this.resumenElements.ahorroMensual,
          this.metodos.formatUSD(ahorroMensualUSD),
        )
        this.metodos.updateElementWithAnimation(
          this.resumenElements.ahorroAnual,
          this.metodos.formatUSD(ahorroAnualUSD),
        )
        break

      case "BOTH":
        this.metodos.updateElementWithAnimation(
          this.resumenElements.petMensual,
          `${this.metodos.formatPEN(totalPetPEN)} / ${this.metodos.formatUSD(totalPetUSD)}`,
        )
        this.metodos.updateElementWithAnimation(
          this.resumenElements.petAnual,
          `${this.metodos.formatPEN(totalAnualPetPEN)} / ${this.metodos.formatUSD(totalAnualPetUSD)}`,
        )
        this.metodos.updateElementWithAnimation(
          this.resumenElements.leesMensual,
          `${this.metodos.formatPEN(totalLeesPEN)} / ${this.metodos.formatUSD(totalLeesUSD)}`,
        )
        this.metodos.updateElementWithAnimation(
          this.resumenElements.leesAnual,
          `${this.metodos.formatPEN(totalAnualLeesPEN)} / ${this.metodos.formatUSD(totalAnualLeesUSD)}`,
        )
        this.metodos.updateElementWithAnimation(
          this.resumenElements.ahorroMensual,
          `${this.metodos.formatPEN(ahorroMensualPEN)} / ${this.metodos.formatUSD(ahorroMensualUSD)}`,
        )
        this.metodos.updateElementWithAnimation(
          this.resumenElements.ahorroAnual,
          `${this.metodos.formatPEN(ahorroAnualPEN)} / ${this.metodos.formatUSD(ahorroAnualUSD)}`,
        )
        break
    }

    // Porcentaje total - redondear a 1 decimal
    this.metodos.updateElementWithAnimation(
      this.resumenElements.porcentajeTotal,
      `${porcentajeTotalAhorro.toFixed(1)}%`,
    )
  }

  hideLoadingOverlay() {
    this.loadingOverlay.classList.add("hidden")
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  new CalculadoraResumidaLEES()
})
