class CalculadoraLEESPrint {
  constructor() {
    // Configuración de la API
    this.OPEN_EXCHANGE_RATES_API_KEY = "e705d88667c84a10bd2597c1610649c3" // Reemplazar con tu API key
    this.FALLBACK_EXCHANGE_RATE = 3.7 // Tipo de cambio de respaldo

    // Precios LEES Print en soles (tinta + papel)
    this.PRECIOS_LEES = {
      TC: {
        A3: {
          BN: 1.98,
          COLOR: 2.8,
          MIXTO: 2.01,
        },
      },
      MG: {
        A3: {
          BN: 1.68,
        },
      },
      RM: {
        A3: {
          BN: 2.58,
          COLOR: 1.98,
          MIXTO: 2.45,
        },
      },
      RX: {
        A4: {
          COLOR: 0.93,
        },
        A3: {
          COLOR: 1.45,
        },
      },
    }

    // Precios PET tradicionales en soles (promedio de rangos dados)
    this.PRECIOS_PET = {
      TC: { A3: 7.3 }, // Promedio de 7.10-7.50
      MG: { A3: 7.3 }, // Promedio de 7.10-7.50
      RM: { A3: 7.3 }, // Promedio de 7.10-7.50
      RX: {
        A4: 3.625, // Promedio de 3.55-3.70
        A3: 7.25, // Promedio de 7.10-7.40
      },
    }

    // Estado de la aplicación
    this.exchangeRate = this.FALLBACK_EXCHANGE_RATE
    this.isLoadingExchangeRate = false
    this.currentCurrency = "PEN" // PEN, USD, BOTH

    // Datos de entrada
    this.cantidades = { TC: 0, MG: 0, RM: 0, RX: 0 }
    this.formatos = { TC: "A3", MG: "A3", RM: "A3", RX: "A4" }
    this.tipos = { TC: "BN", MG: "BN", RM: "BN", RX: "COLOR" }

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

    // Elementos de salida
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

    // Otros elementos
    this.currencyToggle = document.getElementById("currency-toggle")
    this.exchangeRateDisplay = document.getElementById("exchange-rate-display")
    this.refreshRateBtn = document.getElementById("refresh-rate")
    this.exportBtn = document.getElementById("export-btn")
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
        this.validateInput(e.target)
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

    this.exportBtn.addEventListener("click", () => {
      this.exportToSpreadsheet()
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

    // Prevenir valores negativos
    this.preventNegativeValues()
  }

  preventNegativeValues() {
    Object.values(this.cantidadInputs).forEach((input) => {
      input.addEventListener("keydown", (e) => {
        // Permitir teclas de control
        if (
          [46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
          (e.keyCode === 65 && e.ctrlKey === true) ||
          (e.keyCode >= 35 && e.keyCode <= 39)
        ) {
          return
        }

        // Asegurar que sea un número
        if ((e.shiftKey || e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
          e.preventDefault()
        }
      })
    })
  }

  async loadExchangeRate() {
    if (this.isLoadingExchangeRate) return

    this.isLoadingExchangeRate = true
    this.exchangeRateDisplay.textContent = "Actualizando..."
    this.refreshRateBtn.style.animation = "spin 1s linear infinite"

    try {
      const response = await fetch(
        `https://openexchangerates.org/api/latest.json?app_id=${this.OPEN_EXCHANGE_RATES_API_KEY}&symbols=PEN`,
      )

      if (!response.ok) {
        throw new Error("Error en la respuesta de la API")
      }

      const data = await response.json()

      if (data.rates && data.rates.PEN) {
        this.exchangeRate = data.rates.PEN
        this.exchangeRateDisplay.textContent = `1 USD = ${this.exchangeRate.toFixed(4)} PEN`
        this.updateAllCalculations()
      } else {
        throw new Error("Datos de tipo de cambio no válidos")
      }
    } catch (error) {
      console.error("Error al obtener tipo de cambio:", error)
      this.handleExchangeRateError()
    } finally {
      this.isLoadingExchangeRate = false
      this.refreshRateBtn.style.animation = ""
    }
  }

  handleExchangeRateError() {
    this.exchangeRate = this.FALLBACK_EXCHANGE_RATE
    this.exchangeRateDisplay.textContent = `1 USD = ${this.exchangeRate} PEN (Respaldo)`

    this.errorMessage.textContent = `No se pudo obtener el tipo de cambio actual. Usando tipo de cambio de respaldo: 1 USD = ${this.FALLBACK_EXCHANGE_RATE} PEN`

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
    const precioLeesPEN = this.PRECIOS_LEES[modalidad][formato][tipo]
    const precioPetPEN = this.PRECIOS_PET[modalidad][formato]

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
        this.updateElementWithAnimation(this.outputElements.costoLees[modalidad], this.formatPEN(precioLeesPEN))
        this.updateElementWithAnimation(this.outputElements.costoPet[modalidad], this.formatPEN(precioPetPEN))
        this.updateElementWithAnimation(this.outputElements.totalLees[modalidad], this.formatPEN(totalLeesPEN))
        this.updateElementWithAnimation(this.outputElements.totalPet[modalidad], this.formatPEN(totalPetPEN))
        this.updateElementWithAnimation(this.outputElements.ahorroUnit[modalidad], this.formatPEN(ahorroUnitPEN))
        this.updateElementWithAnimation(this.outputElements.ahorroTotal[modalidad], this.formatPEN(ahorroTotalPEN))
        break

      case "USD":
        this.updateElementWithAnimation(this.outputElements.costoLees[modalidad], this.formatUSD(precioLeesUSD))
        this.updateElementWithAnimation(this.outputElements.costoPet[modalidad], this.formatUSD(precioPetUSD))
        this.updateElementWithAnimation(this.outputElements.totalLees[modalidad], this.formatUSD(totalLeesUSD))
        this.updateElementWithAnimation(this.outputElements.totalPet[modalidad], this.formatUSD(totalPetUSD))
        this.updateElementWithAnimation(this.outputElements.ahorroUnit[modalidad], this.formatUSD(ahorroUnitUSD))
        this.updateElementWithAnimation(this.outputElements.ahorroTotal[modalidad], this.formatUSD(ahorroTotalUSD))
        break

      case "BOTH":
        this.updateElementWithAnimation(
          this.outputElements.costoLees[modalidad],
          `${this.formatPEN(precioLeesPEN)} / ${this.formatUSD(precioLeesUSD)}`,
        )
        this.updateElementWithAnimation(
          this.outputElements.costoPet[modalidad],
          `${this.formatPEN(precioPetPEN)} / ${this.formatUSD(precioPetUSD)}`,
        )
        this.updateElementWithAnimation(
          this.outputElements.totalLees[modalidad],
          `${this.formatPEN(totalLeesPEN)} / ${this.formatUSD(totalLeesUSD)}`,
        )
        this.updateElementWithAnimation(
          this.outputElements.totalPet[modalidad],
          `${this.formatPEN(totalPetPEN)} / ${this.formatUSD(totalPetUSD)}`,
        )
        this.updateElementWithAnimation(
          this.outputElements.ahorroUnit[modalidad],
          `${this.formatPEN(ahorroUnitPEN)} / ${this.formatUSD(ahorroUnitUSD)}`,
        )
        this.updateElementWithAnimation(
          this.outputElements.ahorroTotal[modalidad],
          `${this.formatPEN(ahorroTotalPEN)} / ${this.formatUSD(ahorroTotalUSD)}`,
        )
        break
    }

    // Porcentaje siempre se muestra igual
    this.updateElementWithAnimation(this.outputElements.porcentaje[modalidad], `${porcentajeAhorro.toFixed(1)}%`)
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

    Object.keys(this.cantidades).forEach((modalidad) => {
      const cantidad = this.cantidades[modalidad]
      const formato = this.formatos[modalidad]
      const tipo = this.tipos[modalidad]

      const precioLeesPEN = this.PRECIOS_LEES[modalidad][formato][tipo]
      const precioPetPEN = this.PRECIOS_PET[modalidad][formato]

      totalLeesPEN += cantidad * precioLeesPEN
      totalPetPEN += cantidad * precioPetPEN
      totalLeesUSD += cantidad * (precioLeesPEN / this.exchangeRate)
      totalPetUSD += cantidad * (precioPetPEN / this.exchangeRate)
    })

    const ahorroMensualPEN = totalPetPEN - totalLeesPEN
    const ahorroMensualUSD = totalPetUSD - totalLeesUSD
    const ahorroAnualPEN = ahorroMensualPEN * 12
    const ahorroAnualUSD = ahorroMensualUSD * 12

    const porcentajeTotalAhorro = totalPetPEN > 0 ? (ahorroMensualPEN / totalPetPEN) * 100 : 0

    // Actualizar elementos de resumen según la moneda
    switch (this.currentCurrency) {
      case "PEN":
        this.updateElementWithAnimation(this.resumenElements.leesTotal, this.formatPEN(totalLeesPEN))
        this.updateElementWithAnimation(this.resumenElements.leesAnual, this.formatPEN(totalLeesPEN * 12))
        this.updateElementWithAnimation(this.resumenElements.petTotal, this.formatPEN(totalPetPEN))
        this.updateElementWithAnimation(this.resumenElements.petAnual, this.formatPEN(totalPetPEN * 12))
        this.updateElementWithAnimation(this.resumenElements.ahorroMensual, this.formatPEN(ahorroMensualPEN))
        this.updateElementWithAnimation(this.resumenElements.ahorroAnual, this.formatPEN(ahorroAnualPEN))
        break

      case "USD":
        this.updateElementWithAnimation(this.resumenElements.leesTotal, this.formatUSD(totalLeesUSD))
        this.updateElementWithAnimation(this.resumenElements.leesAnual, this.formatUSD(totalLeesUSD * 12))
        this.updateElementWithAnimation(this.resumenElements.petTotal, this.formatUSD(totalPetUSD))
        this.updateElementWithAnimation(this.resumenElements.petAnual, this.formatUSD(totalPetUSD * 12))
        this.updateElementWithAnimation(this.resumenElements.ahorroMensual, this.formatUSD(ahorroMensualUSD))
        this.updateElementWithAnimation(this.resumenElements.ahorroAnual, this.formatUSD(ahorroAnualUSD))
        break

      case "BOTH":
        this.updateElementWithAnimation(
          this.resumenElements.leesTotal,
          `${this.formatPEN(totalLeesPEN)} / ${this.formatUSD(totalLeesUSD)}`,
        )
        this.updateElementWithAnimation(
          this.resumenElements.leesAnual,
          `${this.formatPEN(totalLeesPEN * 12)} / ${this.formatUSD(totalLeesUSD * 12)}`,
        )
        this.updateElementWithAnimation(
          this.resumenElements.petTotal,
          `${this.formatPEN(totalPetPEN)} / ${this.formatUSD(totalPetUSD)}`,
        )
        this.updateElementWithAnimation(
          this.resumenElements.petAnual,
          `${this.formatPEN(totalPetPEN * 12)} / ${this.formatUSD(totalPetUSD * 12)}`,
        )
        this.updateElementWithAnimation(
          this.resumenElements.ahorroMensual,
          `${this.formatPEN(ahorroMensualPEN)} / ${this.formatUSD(ahorroMensualUSD)}`,
        )
        this.updateElementWithAnimation(
          this.resumenElements.ahorroAnual,
          `${this.formatPEN(ahorroAnualPEN)} / ${this.formatUSD(ahorroAnualUSD)}`,
        )
        break
    }

    this.updateElementWithAnimation(this.resumenElements.porcentajeTotal, `${porcentajeTotalAhorro.toFixed(1)}%`)
  }

  updateElementWithAnimation(element, value) {
    element.textContent = value
    element.classList.add("updated")
    setTimeout(() => {
      element.classList.remove("updated")
    }, 500)
  }

  formatUSD(amount) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  formatPEN(amount) {
    return `S/ ${new Intl.NumberFormat("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`
  }

  validateInput(input) {
    const value = Number.parseInt(input.value)

    if (isNaN(value) || value < 0) {
      input.style.borderColor = "#e74c3c"
      input.style.backgroundColor = "#fdf2f2"
    } else {
      input.style.borderColor = "#27ae60"
      input.style.backgroundColor = "#f0f8f0"
    }

    setTimeout(() => {
      input.style.borderColor = ""
      input.style.backgroundColor = ""
    }, 2000)
  }

  exportToSpreadsheet() {
    const data = this.generateExportData()
    const csv = this.convertToCSV(data)
    this.downloadCSV(csv, "comparacion_lees_print_vs_pet.csv")
    this.showExportMessage()
  }

  generateExportData() {
    const data = []

    // Encabezados
    data.push(["LEES DICOM PRINT - Comparación de Costos"])
    data.push(["Fecha:", new Date().toLocaleDateString("es-PE")])
    data.push(["Tipo de Cambio:", `1 USD = ${this.exchangeRate.toFixed(4)} PEN`])
    data.push([])

    // Datos por modalidad
    data.push([
      "Modalidad",
      "Cantidad",
      "Formato",
      "Tipo",
      "Costo LEES (PEN)",
      "Costo PET (PEN)",
      "Ahorro Unitario (PEN)",
      "Ahorro Total (PEN)",
      "% Ahorro",
    ])

    Object.keys(this.cantidades).forEach((modalidad) => {
      const cantidad = this.cantidades[modalidad]
      const formato = this.formatos[modalidad]
      const tipo = this.tipos[modalidad]

      const precioLeesPEN = this.PRECIOS_LEES[modalidad][formato][tipo]
      const precioPetPEN = this.PRECIOS_PET[modalidad][formato]
      const ahorroUnitario = precioPetPEN - precioLeesPEN
      const ahorroTotal = cantidad * ahorroUnitario
      const porcentajeAhorro = precioPetPEN > 0 ? (ahorroUnitario / precioPetPEN) * 100 : 0

      data.push([
        modalidad,
        cantidad,
        formato,
        tipo,
        precioLeesPEN.toFixed(2),
        precioPetPEN.toFixed(2),
        ahorroUnitario.toFixed(2),
        ahorroTotal.toFixed(2),
        `${porcentajeAhorro.toFixed(1)}%`,
      ])
    })

    // Resumen total
    data.push([])
    data.push(["RESUMEN TOTAL"])

    let totalLeesPEN = 0
    let totalPetPEN = 0

    Object.keys(this.cantidades).forEach((modalidad) => {
      const cantidad = this.cantidades[modalidad]
      const formato = this.formatos[modalidad]
      const tipo = this.tipos[modalidad]

      const precioLeesPEN = this.PRECIOS_LEES[modalidad][formato][tipo]
      const precioPetPEN = this.PRECIOS_PET[modalidad][formato]

      totalLeesPEN += cantidad * precioLeesPEN
      totalPetPEN += cantidad * precioPetPEN
    })

    const ahorroTotalMensual = totalPetPEN - totalLeesPEN
    const ahorroTotalAnual = ahorroTotalMensual * 12
    const porcentajeTotalAhorro = totalPetPEN > 0 ? (ahorroTotalMensual / totalPetPEN) * 100 : 0

    data.push(["Costo Total Mensual LEES Print (PEN)", totalLeesPEN.toFixed(2)])
    data.push(["Costo Total Mensual PET (PEN)", totalPetPEN.toFixed(2)])
    data.push(["Ahorro Total Mensual (PEN)", ahorroTotalMensual.toFixed(2)])
    data.push(["Ahorro Total Anual (PEN)", ahorroTotalAnual.toFixed(2)])
    data.push(["Porcentaje Total de Ahorro", `${porcentajeTotalAhorro.toFixed(1)}%`])

    data.push([])
    data.push(["Beneficios de LEES DICOM PRINT:"])
    data.push(["- Ahorro del 83% al 86% en materiales"])
    data.push(["- Calidad superior en papel fotográfico"])
    data.push(["- Tecnología de inyección avanzada"])
    data.push(["- Reducción significativa de costos operativos"])

    return data
  }

  convertToCSV(data) {
    return data
      .map((row) => row.map((cell) => (typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell)).join(","))
      .join("\n")
  }

  downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", filename)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  showExportMessage() {
    const message = document.createElement("div")
    message.textContent = "¡Comparación exportada exitosamente!"
    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #27ae60;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      z-index: 1000;
      font-weight: 600;
      animation: slideIn 0.3s ease;
    `

    document.body.appendChild(message)

    setTimeout(() => {
      message.style.animation = "slideOut 0.3s ease"
      setTimeout(() => {
        if (document.body.contains(message)) {
          document.body.removeChild(message)
        }
      }, 300)
    }, 3000)
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
      this.formatos = { TC: "A3", MG: "A3", RM: "A3", RX: "A4" }
      this.tipos = { TC: "BN", MG: "BN", RM: "BN", RX: "COLOR" }

      // Actualizar cálculos
      this.updateAllCalculations()

      this.showResetMessage()
    }
  }

  showResetMessage() {
    const message = document.createElement("div")
    message.textContent = "¡Calculadora reiniciada correctamente!"
    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #3498db;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      z-index: 1000;
      font-weight: 600;
      animation: slideIn 0.3s ease;
    `

    document.body.appendChild(message)

    setTimeout(() => {
      message.style.animation = "slideOut 0.3s ease"
      setTimeout(() => {
        if (document.body.contains(message)) {
          document.body.removeChild(message)
        }
      }, 300)
    }, 3000)
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
