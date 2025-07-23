// Configuración y datos de la aplicación LEES Print
class ConfiguracionLEES {
  constructor() {
    // Configuración de la API
    this.OPEN_EXCHANGE_RATES_API_KEY = "e705d88667c84a10bd2597c1610649c3"
    this.FALLBACK_EXCHANGE_RATE = 3.5 // Tasa de cambio de respaldo

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
          BN: 1.25,
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

    // Consumo de tinta por impresión en mm (datos exactos de la tabla)
    this.CONSUMO_POR_IMPRESION = {
      MG: {
        A3: {
          BN: {
            NEGRO_PB: 0.227027,
            GRIS: 0.2,
            CYAN: 0.019459,
            AMARILLO: 0.019459,
            MAGENTA: 0.020135,
            BLACK: 0.004054,
          },
        },
      },
      RM: {
        A3: {
          BN: {
            NEGRO_PB: 0.27451,
            GRIS: 0.331373,
            CYAN: 0.039216,
            AMARILLO: 0.04549,
            MAGENTA: 0.049412,
            BLACK: 0.005882,
          },
          COLOR: {
            NEGRO_PB: 0.273913,
            GRIS: 0.002174,
            CYAN: 0.202174,
            AMARILLO: 0.034783,
            MAGENTA: 0.11087,
            BLACK: 0.002174,
          },
        },
      },
      TC: {
        A3: {
          BN: {
            NEGRO_PB: 0.275556,
            GRIS: 0.202222,
            CYAN: 0.048889,
            AMARILLO: 0.037333,
            MAGENTA: 0.046222,
            BLACK: 0.004444,
          },
          COLOR: {
            NEGRO_PB: 0.85,
            GRIS: 0,
            CYAN: 0.04,
            AMARILLO: 0.02,
            MAGENTA: 0.08,
            BLACK: 0.004,
          },
        },
      },
      RX: {
        A3: {
          BN: {
            NEGRO_PB: 0.172131,
            GRIS: 0.171311,
            CYAN: 0.004098,
            AMARILLO: 0.004098,
            MAGENTA: 0.004098,
            BLACK: 0.003279,
          },
        },
        A4: {
          COLOR: {
            NEGRO_PB: 0.098592,
            GRIS: 0.077465,
            CYAN: 0.002347,
            AMARILLO: 0.002347,
            MAGENTA: 0.002347,
            BLACK: 0.001878,
          },
        },
      },
    }

    this.CAPACIDAD_BOTELLA = 52.5
    this.COLORES_TINTA = ["NEGRO_PB", "GRIS", "CYAN", "AMARILLO", "MAGENTA", "BLACK"]

    // Configuración inicial de la aplicación
    this.MODALIDADES = ["TC", "MG", "RM", "RX"]
    this.FORMATOS_INICIALES = { TC: "A3", MG: "A3", RM: "A3", RX: "A4" }
    this.TIPOS_INICIALES = { TC: "BN", MG: "BN", RM: "BN", RX: "COLOR" }
  }

  // Método para obtener el consumo por impresión de una modalidad específica
  getConsumoImpresion(modalidad, formato, tipo) {
    if (
      this.CONSUMO_POR_IMPRESION[modalidad] &&
      this.CONSUMO_POR_IMPRESION[modalidad][formato] &&
      this.CONSUMO_POR_IMPRESION[modalidad][formato][tipo]
    ) {
      return this.CONSUMO_POR_IMPRESION[modalidad][formato][tipo]
    }
    return null
  }

  // Método para obtener precio LEES
  getPrecioLees(modalidad, formato, tipo) {
    if (
      this.PRECIOS_LEES[modalidad] &&
      this.PRECIOS_LEES[modalidad][formato] &&
      this.PRECIOS_LEES[modalidad][formato][tipo]
    ) {
      return this.PRECIOS_LEES[modalidad][formato][tipo]
    }
    return 0
  }

  // Método para obtener precio PET
  getPrecioPet(modalidad, formato) {
    if (this.PRECIOS_PET[modalidad] && this.PRECIOS_PET[modalidad][formato]) {
      return this.PRECIOS_PET[modalidad][formato]
    }
    return 0
  }

  // Método para calcular botellas necesarias por tinta
  calcularBotellasNecesarias(consumoMensual) {
    return Math.floor(consumoMensual / this.CAPACIDAD_BOTELLA)
  }

  // Método para calcular rendimiento de una botella
  calcularRendimientoBotella(consumoPorImpresion) {
    if (consumoPorImpresion === 0) return 0
    return Math.floor(this.CAPACIDAD_BOTELLA / consumoPorImpresion)
  }
}

// Exportar configuración global
const CONFIG_LEES = new ConfiguracionLEES()
