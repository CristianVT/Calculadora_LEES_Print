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

    // Precios PET tradicionales en USD
    this.PRECIOS_PET = {
      TC: { A3: 2.0 },
      MG: { A3: 2.0 },
      RM: { A3: 2.0 },
      RX: {
        A4: 1.0,
        A3: 2.0,
      },
    }

    // Multiplicadores por defecto para cantidad de placas
    this.MULTIPLICADORES_PLACAS = {
      TC: 2,
      MG: 1,
      RM: 3,
      RX: 1.2,
    }

    // Configuración inicial de la aplicación
    this.MODALIDADES = ["RX", "MG", "TC", "RM"]
    this.FORMATOS_INICIALES = { TC: "A3", MG: "A3", RM: "A3", RX: "A4" }
    this.TIPOS_INICIALES = { TC: "BN", MG: "BN", RM: "BN", RX: "COLOR" }
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
}

// Exportar configuración global
const CONFIG_LEES = new ConfiguracionLEES()
