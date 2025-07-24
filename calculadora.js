// Calculadora principal LEES Print
class CalculadoraLEESPrint {
  constructor() {
    this.config = CONFIG_LEES
    this.metodos = new MetodosLEES(this.config)

    // Estado de la aplicación
    this.exchangeRate = this.config.FALLBACK_EXCHANGE_RATE
    this.isLoadingExchangeRate = false
    this.currentCurrency = "PEN" // PEN, USD, BOTH

    // Datos de entrada
    this.cantidades = { TC: 0, MG: 0, RM: 0, RX: 0 }
    this.formatos = { ...this.config.FORMATOS_INICIALES }
    this.tipos = { ...this.config.TIPOS_INICIALES }

    this.initializeApp()
  }

  async initializeApp() {
    this.initializeElements()
    this.bindEvents()
    await this.loadExchangeRate()
    this.updateAllCalculations()
    this.hideLoadingOverlay()
  }

  initializeElements() {
    // Inputs de cantidad
    this.cantidadInputs = {
      TC: document.getElementById("cantidad-tc"),
      MG: document.getElementById("cantidad-mg"),
      RM: document.getElementById("cantidad-rm"),
      RX: document.getElementById("cantidad-rx"),
    }

    // Selectores de formato
    this.formatoSelects = {
      TC: document.getElementById("formato-tc"),
      MG: document.getElementById("formato-mg"),
      RM: document.getElementById("formato-rm"),
      RX: document.getElementById("formato-rx"),
    }

    // Selectores de tipo
    this.tipoSelects = {
      TC: document.getElementById("tipo-tc"),
      MG: document.getElementById("tipo-mg"),
      RM: document.getElementById("tipo-rm"),
      RX: document.getElementById("tipo-rx"),
    }

    // Elementos de salida de costos
    this.outputElements = {
      costoLees: {
        TC: document.getElementById("costo-lees-tc"),
        MG: document.getElementById("costo-lees-mg"),
        RM: document.getElementById("costo-lees-rm"),
        RX: document.getElementById("costo-lees-rx"),
      },
      costoPet: {
        TC: document.getElementById("costo-pet-tc"),
        MG: document.getElementById("costo-pet-mg"),
        RM: document.getElementById("costo-pet-rm"),
        RX: document.getElementById("costo-pet-rx"),
      },
      totalLees: {
        TC: document.getElementById("total-lees-tc"),
        MG: document.getElementById("total-lees-mg"),
        RM: document.getElementById("total-lees-rm"),
        RX: document.getElementById("total-lees-rx"),
      },
      totalPet: {
        TC: document.getElementById("total-pet-tc"),
        MG: document.getElementById("total-pet-mg"),
        RM: document.getElementById("total-pet-rm"),
        RX: document.getElementById("total-pet-rx"),
      },
      ahorroUnit: {
        TC: document.getElementById("ahorro-unit-tc"),
        MG: document.getElementById("ahorro-unit-mg"),
        RM: document.getElementById("ahorro-unit-rm"),
        RX: document.getElementById("ahorro-unit-rx"),
      },
      ahorroTotal: {
        TC: document.getElementById("ahorro-total-tc"),
        MG: document.getElementById("ahorro-total-mg"),
        RM: document.getElementById("ahorro-total-rm"),
        RX: document.getElementById("ahorro-total-rx"),
      },
      porcentaje: {
        TC: document.getElementById("porcentaje-tc"),
        MG: document.getElementById("porcentaje-mg"),
        RM: document.getElementById("porcentaje-rm"),
        RX: document.getElementById("porcentaje-rx"),
      },
    }

    // Elementos de resumen
    this.resumenElements = {
      leesTotal: document.getElementById("resumen-lees-total"),
      leesAnual: document.getElementById("resumen-lees-anual"),
      petTotal: document.getElementById("resumen-pet-total"),
      petAnual: document.getElementById("resumen-pet-anual"),
      ahorroMensual: document.getElementById("resumen-ahorro-mensual"),
      ahorroAnual: document.getElementById("resumen-ahorro-anual"),
      porcentajeTotal: document.getElementById("resumen-porcentaje-total"),
    }

    // Elementos de tinta
    this.tintaElements = {
      TC: {
        negro: document.getElementById("tinta-tc-negro"),
        gris: document.getElementById("tinta-tc-gris"),
        cyan: document.getElementById("tinta-tc-cyan"),
        amarillo: document.getElementById("tinta-tc-amarillo"),
        magenta: document.getElementById("tinta-tc-magenta"),
        black: document.getElementById("tinta-tc-black"),
        total: document.getElementById("tinta-tc-total"),
      },
      MG: {
        negro: document.getElementById("tinta-mg-negro"),
        gris: document.getElementById("tinta-mg-gris"),
        cyan: document.getElementById("tinta-mg-cyan"),
        amarillo: document.getElementById("tinta-mg-amarillo"),
        magenta: document.getElementById("tinta-mg-magenta"),
        black: document.getElementById("tinta-mg-black"),
        total: document.getElementById("tinta-mg-total"),
      },
      RM: {
        negro: document.getElementById("tinta-rm-negro"),
        gris: document.getElementById("tinta-rm-gris"),
        cyan: document.getElementById("tinta-rm-cyan"),
        amarillo: document.getElementById("tinta-rm-amarillo"),
        magenta: document.getElementById("tinta-rm-magenta"),
        black: document.getElementById("tinta-rm-black"),
        total: document.getElementById("tinta-rm-total"),
      },
      RX: {
        negro: document.getElementById("tinta-rx-negro"),
        gris: document.getElementById("tinta-rx-gris"),
        cyan: document.getElementById("tinta-rx-cyan"),
        amarillo: document.getElementById("tinta-rx-amarillo"),
        magenta: document.getElementById("tinta-rx-magenta"),
        black: document.getElementById("tinta-rx-black"),
        total: document.getElementById("tinta-rx-total"),
      },
      totales: {
        negro: document.getElementById("tinta-total-negro"),
        gris: document.getElementById("tinta-total-gris"),
        cyan: document.getElementById("tinta-total-cyan"),
        amarillo: document.getElementById("tinta-total-amarillo"),
        magenta: document.getElementById("tinta-total-magenta"),
        black: document.getElementById("tinta-total-black"),
        general: document.getElementById("tinta-total-general"),
      },
    }

    // Elementos de botellas
    this.botellasElements = {
      negro: document.getElementById("botellas-negro"),
      gris: document.getElementById("botellas-gris"),
      cyan: document.getElementById("botellas-cyan"),
      amarillo: document.getElementById("botellas-amarillo"),
      magenta: document.getElementById("botellas-magenta"),
      black: document.getElementById("botellas-black"),
      total: document.getElementById("total-botellas"),
      anual: document.getElementById("total-botellas-anual"),
    }

    // Otros elementos
    this.currencyToggle = document.getElementById("currency-toggle")
    this.exchangeRateDisplay = document.getElementById("exchange-rate-display")
    this.refreshRateBtn = document.getElementById("refresh-rate")
    this.resetBtn = document.getElementById("reset-btn")
    this.loadingOverlay = document.getElementById("loading-overlay")
    this.errorModal = document.getElementById("error-modal")
    this.errorMessage = document.getElementById("error-message")
  }

  bindEvents() {
    // Eventos de inputs de cantidad
    Object.keys(this.cantidadInputs).forEach((modalidad) => {
      this.cantidadInputs[modalidad].addEventListener("input", (e) => {
        this.updateCantidad(modalidad, e.target.value)
      })

      this.cantidadInputs[modalidad].addEventListener("blur", (e) => {
        this.metodos.validateInput(e.target)
      })
    })

    // Eventos de selectores de formato
    Object.keys(this.formatoSelects).forEach((modalidad) => {
      this.formatoSelects[modalidad].addEventListener("change", (e) => {
        this.updateFormato(modalidad, e.target.value)
      })
    })

    // Eventos de selectores de tipo
    Object.keys(this.tipoSelects).forEach((modalidad) => {
      this.tipoSelects[modalidad].addEventListener("change", (e) => {
        this.updateTipo(modalidad, e.target.value)
      })
    })

    // Evento para cambio de moneda
    this.currencyToggle.addEventListener("change", (e) => {
      this.updateCurrencyDisplay(e.target.value)
    })

    // Eventos de botones
    this.refreshRateBtn.addEventListener("click", () => {
      this.loadExchangeRate()
    })

    this.resetBtn.addEventListener("click", () => {
      this.resetCalculator()
    })

    // Evento para cerrar modal
    document.querySelector(".close").addEventListener("click", () => {
      this.errorModal.style.display = "none"
    })

    // Cerrar modal al hacer clic fuera
    window.addEventListener("click", (e) => {
      if (e.target === this.errorModal) {
        this.errorModal.style.display = "none"
      }
    })

    // Configurar validación de inputs
    this.metodos.configurarValidacionInputs(this.cantidadInputs)
  }

  async loadExchangeRate() {
    if (this.isLoadingExchangeRate) return

    this.isLoadingExchangeRate = true
    this.exchangeRateDisplay.textContent = "Actualizando..."
    this.refreshRateBtn.style.animation = "spin 1s linear infinite"

    try {
      this.exchangeRate = await this.metodos.obtenerTipoCambio(this.config.OPEN_EXCHANGE_RATES_API_KEY)
      this.exchangeRateDisplay.textContent = `1 USD = ${this.exchangeRate.toFixed(4)} PEN`
      this.updateAllCalculations()
    } catch (error) {
      this.handleExchangeRateError()
    } finally {
      this.isLoadingExchangeRate = false
      this.refreshRateBtn.style.animation = ""
    }
  }

  handleExchangeRateError() {
    this.exchangeRate = this.config.FALLBACK_EXCHANGE_RATE
    this.exchangeRateDisplay.textContent = `1 USD = ${this.exchangeRate} PEN (Respaldo)`

    this.errorMessage.textContent = `No se pudo obtener el tipo de cambio actual. Usando tipo de cambio de respaldo: 1 USD = ${this.config.FALLBACK_EXCHANGE_RATE} PEN`

    this.errorModal.style.display = "block"
    this.updateAllCalculations()
  }

  updateCantidad(modalidad, valor) {
    const numericValue = Number.parseInt(valor) || 0
    this.cantidades[modalidad] = Math.max(0, numericValue)
    this.updateCalculationsForModalidad(modalidad)
    this.updateResumen()
  }

  updateFormato(modalidad, formato) {
    this.formatos[modalidad] = formato
    this.updateCalculationsForModalidad(modalidad)
    this.updateResumen()
  }

  updateTipo(modalidad, tipo) {
    this.tipos[modalidad] = tipo
    this.updateCalculationsForModalidad(modalidad)
    this.updateResumen()
  }

  updateCurrencyDisplay(currency) {
    this.currentCurrency = currency
    this.updateAllCalculations()
  }

  updateCalculationsForModalidad(modalidad) {
    const cantidad = this.cantidades[modalidad]
    const formato = this.formatos[modalidad]
    const tipo = this.tipos[modalidad]

    // Obtener precios
    const precioLeesPEN = this.config.getPrecioLees(modalidad, formato, tipo)
    const precioPetPEN = this.config.getPrecioPet(modalidad, formato)

    const precioLeesUSD = precioLeesPEN / this.exchangeRate
    const precioPetUSD = precioPetPEN / this.exchangeRate

    // Calcular totales
    const totalLeesPEN = cantidad * precioLeesPEN
    const totalPetPEN = cantidad * precioPetPEN
    const totalLeesUSD = cantidad * precioLeesUSD
    const totalPetUSD = cantidad * precioPetUSD

    // Calcular ahorros
    const ahorroUnitPEN = precioPetPEN - precioLeesPEN
    const ahorroUnitUSD = precioPetUSD - precioLeesUSD
    const ahorroTotalPEN = totalPetPEN - totalLeesPEN
    const ahorroTotalUSD = totalPetUSD - totalLeesUSD

    // Calcular porcentaje de ahorro
    const porcentajeAhorro = precioPetPEN > 0 ? (ahorroUnitPEN / precioPetPEN) * 100 : 0

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
      ahorroUnitPEN,
      ahorroUnitUSD,
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
      ahorroUnitPEN,
      ahorroUnitUSD,
      ahorroTotalPEN,
      ahorroTotalUSD,
      porcentajeAhorro,
    } = valores

    switch (this.currentCurrency) {
      case "PEN":
        this.metodos.updateElementWithAnimation(
          this.outputElements.costoLees[modalidad],
          this.metodos.formatPEN(precioLeesPEN),
        )
        this.metodos.updateElementWithAnimation(
          this.outputElements.costoPet[modalidad],
          this.metodos.formatPEN(precioPetPEN),
        )
        this.metodos.updateElementWithAnimation(
          this.outputElements.totalLees[modalidad],
          this.metodos.formatPEN(totalLeesPEN),
        )
        this.metodos.updateElementWithAnimation(
          this.outputElements.totalPet[modalidad],
          this.metodos.formatPEN(totalPetPEN),
        )
        this.metodos.updateElementWithAnimation(
          this.outputElements.ahorroUnit[modalidad],
          this.metodos.formatPEN(ahorroUnitPEN),
        )
        this.metodos.updateElementWithAnimation(
          this.outputElements.ahorroTotal[modalidad],
          this.metodos.formatPEN(ahorroTotalPEN),
        )
        break

      case "USD":
        this.metodos.updateElementWithAnimation(
          this.outputElements.costoLees[modalidad],
          this.metodos.formatUSD(precioLeesUSD),
        )
        this.metodos.updateElementWithAnimation(
          this.outputElements.costoPet[modalidad],
          this.metodos.formatUSD(precioPetUSD),
        )
        this.metodos.updateElementWithAnimation(
          this.outputElements.totalLees[modalidad],
          this.metodos.formatUSD(totalLeesUSD),
        )
        this.metodos.updateElementWithAnimation(
          this.outputElements.totalPet[modalidad],
          this.metodos.formatUSD(totalPetUSD),
        )
        this.metodos.updateElementWithAnimation(
          this.outputElements.ahorroUnit[modalidad],
          this.metodos.formatUSD(ahorroUnitUSD),
        )
        this.metodos.updateElementWithAnimation(
          this.outputElements.ahorroTotal[modalidad],
          this.metodos.formatUSD(ahorroTotalUSD),
        )
        break

      case "BOTH":
        this.metodos.updateElementWithAnimation(
          this.outputElements.costoLees[modalidad],
          `${this.metodos.formatPEN(precioLeesPEN)} / ${this.metodos.formatUSD(precioLeesUSD)}`,
        )
        this.metodos.updateElementWithAnimation(
          this.outputElements.costoPet[modalidad],
          `${this.metodos.formatPEN(precioPetPEN)} / ${this.metodos.formatUSD(precioPetUSD)}`,
        )
        this.metodos.updateElementWithAnimation(
          this.outputElements.totalLees[modalidad],
          `${this.metodos.formatPEN(totalLeesPEN)} / ${this.metodos.formatUSD(totalLeesUSD)}`,
        )
        this.metodos.updateElementWithAnimation(
          this.outputElements.totalPet[modalidad],
          `${this.metodos.formatPEN(totalPetPEN)} / ${this.metodos.formatUSD(totalPetUSD)}`,
        )
        this.metodos.updateElementWithAnimation(
          this.outputElements.ahorroUnit[modalidad],
          `${this.metodos.formatPEN(ahorroUnitPEN)} / ${this.metodos.formatUSD(ahorroUnitUSD)}`,
        )
        this.metodos.updateElementWithAnimation(
          this.outputElements.ahorroTotal[modalidad],
          `${this.metodos.formatPEN(ahorroTotalPEN)} / ${this.metodos.formatUSD(ahorroTotalUSD)}`,
        )
        break
    }

    // Porcentaje siempre se muestra igual
    this.metodos.updateElementWithAnimation(
      this.outputElements.porcentaje[modalidad],
      `${porcentajeAhorro.toFixed(1)}%`,
    )
  }

  updateAllCalculations() {
    Object.keys(this.cantidades).forEach((modalidad) => {
      this.updateCalculationsForModalidad(modalidad)
    })
    this.updateResumen()
  }

  updateResumen() {
    let totalLeesPEN = 0
    let totalPetPEN = 0
    let totalLeesUSD = 0
    let totalPetUSD = 0

    // Totales de tinta por color
    const totalTinta = {
      NEGRO_PB: 0,
      GRIS: 0,
      CYAN: 0,
      AMARILLO: 0,
      MAGENTA: 0,
      BLACK: 0,
    }

    Object.keys(this.cantidades).forEach((modalidad) => {
      const cantidad = this.cantidades[modalidad]
      const formato = this.formatos[modalidad]
      const tipo = this.tipos[modalidad]

      const precioLeesPEN = this.config.getPrecioLees(modalidad, formato, tipo)
      const precioPetPEN = this.config.getPrecioPet(modalidad, formato)

      totalLeesPEN += cantidad * precioLeesPEN
      totalPetPEN += cantidad * precioPetPEN
      totalLeesUSD += cantidad * (precioLeesPEN / this.exchangeRate)
      totalPetUSD += cantidad * (precioPetPEN / this.exchangeRate)

      // Calcular consumo de tinta por modalidad
      const consumoModalidad = this.metodos.calcularConsumoTinta(modalidad, formato, tipo, cantidad)

      // Actualizar elementos de tinta por modalidad
      this.metodos.updateElementWithAnimation(
        this.tintaElements[modalidad].negro,
        `${consumoModalidad.NEGRO_PB.toFixed(3)} mm`,
      )
      this.metodos.updateElementWithAnimation(
        this.tintaElements[modalidad].gris,
        `${consumoModalidad.GRIS.toFixed(3)} mm`,
      )
      this.metodos.updateElementWithAnimation(
        this.tintaElements[modalidad].cyan,
        `${consumoModalidad.CYAN.toFixed(3)} mm`,
      )
      this.metodos.updateElementWithAnimation(
        this.tintaElements[modalidad].amarillo,
        `${consumoModalidad.AMARILLO.toFixed(3)} mm`,
      )
      this.metodos.updateElementWithAnimation(
        this.tintaElements[modalidad].magenta,
        `${consumoModalidad.MAGENTA.toFixed(3)} mm`,
      )
      this.metodos.updateElementWithAnimation(
        this.tintaElements[modalidad].black,
        `${consumoModalidad.BLACK.toFixed(3)} mm`,
      )

      const totalModalidad = Object.values(consumoModalidad).reduce((sum, val) => sum + val, 0)
      this.metodos.updateElementWithAnimation(this.tintaElements[modalidad].total, `${totalModalidad.toFixed(3)} mm`)

      // Sumar a totales generales
      Object.keys(totalTinta).forEach((color) => {
        totalTinta[color] += consumoModalidad[color]
      })
    })

    // Actualizar totales de tinta
    this.metodos.updateElementWithAnimation(this.tintaElements.totales.negro, `${totalTinta.NEGRO_PB.toFixed(3)} mm`)
    this.metodos.updateElementWithAnimation(this.tintaElements.totales.gris, `${totalTinta.GRIS.toFixed(3)} mm`)
    this.metodos.updateElementWithAnimation(this.tintaElements.totales.cyan, `${totalTinta.CYAN.toFixed(3)} mm`)
    this.metodos.updateElementWithAnimation(this.tintaElements.totales.amarillo, `${totalTinta.AMARILLO.toFixed(3)} mm`)
    this.metodos.updateElementWithAnimation(this.tintaElements.totales.magenta, `${totalTinta.MAGENTA.toFixed(3)} mm`)
    this.metodos.updateElementWithAnimation(this.tintaElements.totales.black, `${totalTinta.BLACK.toFixed(3)} mm`)
    this.metodos.updateElementWithAnimation(
      this.tintaElements.totales.general,
      `${Object.values(totalTinta)
        .reduce((sum, val) => sum + val, 0)
        .toFixed(3)} mm`,
    )

    // Calcular botellas necesarias MENSUALES (redondeando hacia arriba cada color)
    const botellasMensuales = {
      NEGRO_PB: this.config.calcularBotellasNecesarias(totalTinta.NEGRO_PB),
      GRIS: this.config.calcularBotellasNecesarias(totalTinta.GRIS),
      CYAN: this.config.calcularBotellasNecesarias(totalTinta.CYAN),
      AMARILLO: this.config.calcularBotellasNecesarias(totalTinta.AMARILLO),
      MAGENTA: this.config.calcularBotellasNecesarias(totalTinta.MAGENTA),
      BLACK: this.config.calcularBotellasNecesarias(totalTinta.BLACK),
    }

    const totalBotellasMensuales = Object.values(botellasMensuales).reduce((sum, val) => sum + val, 0)

    // Calcular botellas necesarias ANUALES (método correcto)
    // 1. Calcular consumo total mensual de TODAS las tintas (sin redondear)
    const consumoTotalMensual = Object.values(totalTinta).reduce((sum, val) => sum + val, 0)

    // 2. Multiplicar por 12 para obtener consumo anual total
    const consumoTotalAnual = consumoTotalMensual * 12

    // 3. Dividir entre capacidad de botella y redondear hacia arriba
    const totalBotellasAnuales = Math.ceil(consumoTotalAnual / 52.5)

    // Actualizar elementos de botellas
    this.metodos.updateElementWithAnimation(this.botellasElements.negro, botellasMensuales.NEGRO_PB.toString())
    this.metodos.updateElementWithAnimation(this.botellasElements.gris, botellasMensuales.GRIS.toString())
    this.metodos.updateElementWithAnimation(this.botellasElements.cyan, botellasMensuales.CYAN.toString())
    this.metodos.updateElementWithAnimation(this.botellasElements.amarillo, botellasMensuales.AMARILLO.toString())
    this.metodos.updateElementWithAnimation(this.botellasElements.magenta, botellasMensuales.MAGENTA.toString())
    this.metodos.updateElementWithAnimation(this.botellasElements.black, botellasMensuales.BLACK.toString())
    this.metodos.updateElementWithAnimation(this.botellasElements.total, `${totalBotellasMensuales} botellas`)
    this.metodos.updateElementWithAnimation(this.botellasElements.anual, `${totalBotellasAnuales} botellas`)

    // Continuar con el resumen original de costos
    const ahorroMensualPEN = totalPetPEN - totalLeesPEN
    const ahorroMensualUSD = totalPetUSD - totalLeesUSD
    const ahorroAnualPEN = ahorroMensualPEN * 12
    const ahorroAnualUSD = ahorroMensualUSD * 12

    const porcentajeTotalAhorro = totalPetPEN > 0 ? (ahorroMensualPEN / totalPetPEN) * 100 : 0

    // Actualizar elementos de resumen según la moneda
    this.updateResumenElements(
      totalLeesPEN,
      totalLeesUSD,
      totalPetPEN,
      totalPetUSD,
      ahorroMensualPEN,
      ahorroMensualUSD,
      ahorroAnualPEN,
      ahorroAnualUSD,
      porcentajeTotalAhorro,
    )
  }

  updateResumenElements(
    totalLeesPEN,
    totalLeesUSD,
    totalPetPEN,
    totalPetUSD,
    ahorroMensualPEN,
    ahorroMensualUSD,
    ahorroAnualPEN,
    ahorroAnualUSD,
    porcentajeTotalAhorro,
  ) {
    switch (this.currentCurrency) {
      case "PEN":
        this.metodos.updateElementWithAnimation(this.resumenElements.leesTotal, this.metodos.formatPEN(totalLeesPEN))
        this.metodos.updateElementWithAnimation(
          this.resumenElements.leesAnual,
          this.metodos.formatPEN(totalLeesPEN * 12),
        )
        this.metodos.updateElementWithAnimation(this.resumenElements.petTotal, this.metodos.formatPEN(totalPetPEN))
        this.metodos.updateElementWithAnimation(this.resumenElements.petAnual, this.metodos.formatPEN(totalPetPEN * 12))
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
        this.metodos.updateElementWithAnimation(this.resumenElements.leesTotal, this.metodos.formatUSD(totalLeesUSD))
        this.metodos.updateElementWithAnimation(
          this.resumenElements.leesAnual,
          this.metodos.formatUSD(totalLeesUSD * 12),
        )
        this.metodos.updateElementWithAnimation(this.resumenElements.petTotal, this.metodos.formatUSD(totalPetUSD))
        this.metodos.updateElementWithAnimation(this.resumenElements.petAnual, this.metodos.formatUSD(totalPetUSD * 12))
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
          this.resumenElements.leesTotal,
          `${this.metodos.formatPEN(totalLeesPEN)} / ${this.metodos.formatUSD(totalLeesUSD)}`,
        )
        this.metodos.updateElementWithAnimation(
          this.resumenElements.leesAnual,
          `${this.metodos.formatPEN(totalLeesPEN * 12)} / ${this.metodos.formatUSD(totalLeesUSD * 12)}`,
        )
        this.metodos.updateElementWithAnimation(
          this.resumenElements.petTotal,
          `${this.metodos.formatPEN(totalPetPEN)} / ${this.metodos.formatUSD(totalPetUSD)}`,
        )
        this.metodos.updateElementWithAnimation(
          this.resumenElements.petAnual,
          `${this.metodos.formatPEN(totalPetPEN * 12)} / ${this.metodos.formatUSD(totalPetUSD * 12)}`,
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

    this.metodos.updateElementWithAnimation(
      this.resumenElements.porcentajeTotal,
      `${porcentajeTotalAhorro.toFixed(1)}%`,
    )
  }

  resetCalculator() {
    if (confirm("¿Estás seguro de que quieres limpiar todos los campos?")) {
      // Limpiar inputs
      Object.values(this.cantidadInputs).forEach((input) => {
        input.value = ""
        input.style.borderColor = ""
        input.style.backgroundColor = ""
      })

      // Resetear selectores a valores por defecto
      this.formatoSelects.TC.value = "A3"
      this.formatoSelects.MG.value = "A3"
      this.formatoSelects.RM.value = "A3"
      this.formatoSelects.RX.value = "A4"

      this.tipoSelects.TC.value = "BN"
      this.tipoSelects.MG.value = "BN"
      this.tipoSelects.RM.value = "BN"
      this.tipoSelects.RX.value = "COLOR"

      // Resetear datos internos
      this.cantidades = { TC: 0, MG: 0, RM: 0, RX: 0 }
      this.formatos = { ...this.config.FORMATOS_INICIALES }
      this.tipos = { ...this.config.TIPOS_INICIALES }

      // Actualizar cálculos
      this.updateAllCalculations()

      this.metodos.mostrarMensaje("¡Calculadora reiniciada correctamente!", "info")
    }
  }

  hideLoadingOverlay() {
    this.loadingOverlay.classList.add("hidden")
  }
}

// Estilos para animaciones de mensajes
const style = document.createElement("style")
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`
document.head.appendChild(style)

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  new CalculadoraLEESPrint()
})
