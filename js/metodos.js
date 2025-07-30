// Métodos y utilidades para la calculadora LEES Print
class MetodosLEES {
  constructor(config) {
    this.config = config
  }

  // Formateo de monedas
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

  // Validación de inputs
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

  // Animaciones de elementos
  updateElementWithAnimation(element, value) {
    element.textContent = value
    element.classList.add("updated")
    setTimeout(() => {
      element.classList.remove("updated")
    }, 500)
  }

  // Cálculos de consumo de tinta (convertido a ml)
  calcularConsumoTinta(modalidad, formato, tipo, cantidad) {
    const consumoPorImpresion = this.config.getConsumoImpresion(modalidad, formato, tipo)
    if (!consumoPorImpresion) {
      return {
        NEGRO_PB: 0,
        GRIS: 0,
        CYAN: 0,
        AMARILLO: 0,
        MAGENTA: 0,
        BLACK: 0,
      }
    }

    const consumoTotal = {}
    this.config.COLORES_TINTA.forEach((color) => {
      // Convertir de mm a ml usando el factor de conversión
      const consumoMm = (consumoPorImpresion[color] || 0) * cantidad
      consumoTotal[color] = consumoMm * this.config.CONVERSION_MM_TO_ML
    })

    return consumoTotal
  }

  // Cálculos de botellas necesarias
  calcularBotellasModalidad(modalidad, formato, tipo, cantidad) {
    const consumoTotal = this.calcularConsumoTinta(modalidad, formato, tipo, cantidad)
    const botellas = {}

    this.config.COLORES_TINTA.forEach((color) => {
      botellas[color] = this.config.calcularBotellasNecesarias(consumoTotal[color])
    })

    return botellas
  }

  // Cálculos de rendimiento
  calcularRendimientoModalidad(modalidad, formato, tipo) {
    const consumoPorImpresion = this.config.getConsumoImpresion(modalidad, formato, tipo)
    if (!consumoPorImpresion) return {}

    const rendimiento = {}
    this.config.COLORES_TINTA.forEach((color) => {
      const consumoMl = (consumoPorImpresion[color] || 0) * this.config.CONVERSION_MM_TO_ML
      rendimiento[color] = this.config.calcularRendimientoBotella(consumoMl)
    })

    return rendimiento
  }

  // Manejo de API de tipo de cambio
  async obtenerTipoCambio(apiKey) {
    try {
      const response = await fetch(`https://openexchangerates.org/api/latest.json?app_id=${apiKey}&symbols=PEN`)

      if (!response.ok) {
        throw new Error("Error en la respuesta de la API")
      }

      const data = await response.json()

      if (data.rates && data.rates.PEN) {
        return data.rates.PEN
      } else {
        throw new Error("Datos de tipo de cambio no válidos")
      }
    } catch (error) {
      console.error("Error al obtener tipo de cambio:", error)
      throw error
    }
  }

  // Mostrar mensajes de notificación
  mostrarMensaje(texto, tipo = "success") {
    const colores = {
      success: "#27ae60",
      info: "#3498db",
      warning: "#f39c12",
      error: "#e74c3c",
    }

    const message = document.createElement("div")
    message.textContent = texto
    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colores[tipo]};
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

  // Prevenir valores negativos en inputs
  configurarValidacionInputs(inputs) {
    Object.values(inputs).forEach((input) => {
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
}
