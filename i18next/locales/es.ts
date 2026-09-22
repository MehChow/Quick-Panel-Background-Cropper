import type { Translations } from "./en";

const es: Translations = {
  translation: {
    common: {
      preparingImage: "Preparando imagen...",
      cancel: "Cancelar",
      close: "Cerrar",
      confirm: "Confirmar",
    },
    home: {
      title: "Recortador de fondos del Panel rápido",
      subtitle:
        "Divide una imagen de forma continua en el área de Controles del Panel rápido",
    },
    releaseAnnouncement: {
      v1_3_1: {
        title: "Novedades de la v1.3.1 🌟\n",
        body: "• Nuevo: modo avanzado Controles + Botones.\n• Gestión de caché optimizada.",
        gotIt: "Entendido",
        mediaAccessibilityLabel:
          "Controles y Botones avanzados con una sola imagen continua",
      },
      v1_3_3: {
        title: "Novedades de la v1.3.3 🌟\n",
        body: "• Nuevo: control deslizante de intensidad de ajuste.\n• Mejora: el ajuste ahora es más fácil y preciso.",
        gotIt: "Entendido",
        mediaAccessibilityLabel:
          "Control de intensidad de ajuste y ajuste mejorado",
      },
      v1_4_0: {
        title: "Novedades de la v1.4.0 🌟\n",
        body: "• Nuevo: elige si los identificadores de los Botones muestran icono y texto, solo el icono o nada.",
        gotIt: "Entendido",
        mediaAccessibilityLabel:
          "Opciones de visualización de identificadores de Botones en Personalizar",
      },
      v1_5_0: {
        title: "Novedades de la v1.5.0 🌟\n",
        body: "• Nuevo: las etiquetas personalizadas de Botones ahora tienen 24 iconos disponibles, en lugar de 8.",
        gotIt: "Entendido",
      },
      v1_6_0: {
        title: "Novedades de la v1.6.0 🌟\n",
        body: "• Nuevo: añade iconos predefinidos a las etiquetas personalizadas de Botones.\n• Mejora: muestra el icono junto a la etiqueta para que sea más fácil de identificar.",
        gotIt: "Entendido",
        mediaAccessibilityLabel:
          "Selección de iconos predefinidos para una etiqueta personalizada de Botón",
      },
      v1_7_0: {
        title: "Novedades de la v1.7.0 🌟\n",
        body: "• Nuevo: localización al español.\n• Corrección: se han solucionado algunos problemas de visualización del texto.",
        gotIt: "Entendido",
      },
    },
    landing: {
      startCustomizing: "Empezar a personalizar",
      calibrated: "Calibrado.",
      recalibrate: "¿Quieres volver a calibrar?",
      calibration: "Calibración",
      calibrationRequired:
        "Calibra una vez antes de usar la aplicación; podrás ajustarlo de nuevo más adelante",
      example: "Ejemplo",
    },
    mode: {
      title: "Seleccionar modo",
      subtitle: "Elige el diseño del Panel rápido que coincida con el tuyo",
      default: "Predeterminado",
      defaultDescription:
        "Para el diseño estándar de Controles:\nCuadro de Botones > Brillo > Volumen > Reproductor multimedia",
      advanced: "Avanzado",
      advancedDescription:
        "Para diseños personalizados de Controles, Botones seleccionados del Panel rápido o una imagen en ambos. Después de elegir Avanzado, selecciona Solo Controles, Solo Botones o Controles + Botones.",
      advancedTargetTitle: "Objetivo avanzado",
      advancedTargetSubtitle:
        "Elige un objetivo para esta exportación avanzada.",
      advancedControlsOnly: "Solo Controles",
      advancedControlsOnlyDescription:
        "Cuadro de Botones, brillo, volumen y reproductor multimedia.",
      advancedButtonsOnly: "Solo Botones",
      advancedButtonsOnlyDescription:
        "Botones seleccionados del Panel rápido de tu captura de pantalla.",
      advancedCombined: "Controles + Botones",
      advancedCombinedDescription:
        "Una imagen para los Controles y Botones seleccionados del Panel rápido.",
      helpTitle: "¿Qué modo debo elegir?",
      helpSubtitle:
        "Elige el que coincida con el diseño de tu Panel rápido y con lo que quieras exportar.",
    },
    calibration: {
      title: "Calibración",
      subtitle: "Adapta el diseño a tu dispositivo",
      greenBoxLabel: "cuadro verde",
      layoutBoundaryLabel: "borde del panel",
      instruction:
        "Arrastra cualquier borde o esquina para ajustar el cuadro verde alrededor de todo el panel de control personalizable, incluidos el cuadro de Botones, Brillo, Volumen y Reproductor multimedia.",
      bestResultTitle: "Para obtener el mejor resultado",
      bestResultGood:
        "Mantén el cuadro verde justo por fuera del borde del panel para conseguir el recorte más preciso.",
      bestResultBad:
        "No dejes que el borde del cuadro verde se superponga al borde del panel.",
      helpButton: "Abrir ayuda de calibración",
      helpTitle: "Cómo calibrar",
      likeThis: "Así",
      importTitle: "Importar captura del Panel rápido",
      importSubtitle: "Usa un Panel rápido totalmente expandido",
      chooseFromAlbum: "Elegir del álbum",
      reImport: "Volver a importar",
      looksGood: "Confirmar",
    },
    customize: {
      title: "Personalizar",
      subtitle: "Elige una imagen y ajusta su posición",
      imagePlacementHelpButton: "Abrir ayuda de colocación de imagen",
      imagePlacementHelpTitle: "Por qué el movimiento de la imagen tiene límites",
      imagePlacementHelpBody:
        "QuickStar aplica una imagen cuadrada a cada panel. Los paneles anchos solo muestran la parte central de ese cuadrado, por lo que el área oculta también debe permanecer cubierta. Amplía la imagen para tener más espacio al moverla.",
      imagePlacementBoundaryHelp:
        "Si no puedes mover la imagen lo suficiente hacia arriba o abajo, puede que no haya bastante espacio alrededor del área que quieres mostrar. Prueba a ampliar la imagen e inténtalo de nuevo.",
      optimizingImage: "Optimizando imagen...",
      pickerTitle: "Elegir imagen de fondo",
      pickerSubtitle: "Se admiten PNG, JPG y WEBP.",
      layoutPreview: "Vista previa del diseño actual",
      buttonPanelOpacity: "Intensidad de imagen del Botón",
      buttonAdjustmentImageTab: "Imagen",
      buttonAdjustmentHorizontalTab: "Horiz.",
      buttonAdjustmentVerticalTab: "Vert.",
      buttonIdentifierContentTitle: "Mostrar etiquetas",
      buttonIdentifierContentBoth: "Ambos",
      buttonIdentifierContentIcon: "Icono",
      buttonIdentifierContentNone: "Ninguno",
      buttonIdentifierContentBothAccessibility: "Mostrar icono y texto",
      buttonIdentifierContentIconAccessibility: "Mostrar solo el icono",
      buttonIdentifierContentNoneAccessibility: "Ocultar icono y texto",
      buttonIdentifierOpacity: "Intensidad de etiqueta",
      horizontalIdentifierPosition: "Posición horizontal de etiqueta",
      verticalIdentifierPosition: "Posición vertical de etiqueta",
      buttonIdentifiersOn: "Activado",
      buttonIdentifiersOff: "Desactivado",
      buttonIdentifierAppearance: "Aspecto de etiqueta",
      chooseButtonIdentifierColor:
        "Elegir color de etiqueta, color actual {{color}}",
      buttonIdentifierBrightness: "Brillo",
      buttonIdentifierIntensity: "Intensidad",
      buttonIdentifierHex: "Color HEX",
      buttonIdentifierBackgroundLight: "Claro",
      buttonIdentifierBackgroundDark: "Oscuro",
      buttonIdentifierBackgroundThemeChoice:
        "Fondo del icono, opción actual {{theme}}",
      toggleButtonIdentifierBackgroundTheme:
        "Cambiar entre fondos claros y oscuros para los iconos",
      invalidButtonIdentifierHex:
        "Introduce un color HEX válido de seis dígitos.",
      buttonIdentifierColorWheel: "Rueda de color de etiqueta",
      cancelButtonIdentifierAppearance:
        "Cancelar cambios de aspecto de etiqueta",
      buttonAppearancePosition: "{{label}} · {{current}} de {{total}}",
      buttonAppearancePreview: "Vista previa del aspecto de {{label}}",
      buttonAppearanceOverallPreview: "Vista previa del diseño completo",
      buttonAppearanceOverallPreviewHint:
        "Toca para abrir la vista previa del diseño completo. Toca el fondo atenuado para cerrarla.",
      buttonAppearanceOverallPreviewClose:
        "Cerrar vista previa del diseño completo",
      buttonAppearancePrevious: "Botón anterior",
      buttonAppearanceNext: "Botón siguiente",
      buttonAppearanceUnavailable:
        "La vista previa del Botón no está disponible.",
      chooseAnotherImage: "Elegir otra imagen",
      resetPosition: "Restablecer posición",
      exportPngs: "Exportar PNG",
      defaultCalibrated: "Diseño predeterminado calibrado.",
      advancedCalibrated: "Diseño avanzado calibrado.",
      recalibrate: "¿Quieres volver a calibrar?",
    },
    advancedCalibration: {
      title: "Calibración avanzada",
      outerSubtitle: "Rodea toda la región que quieras calibrar",
      combinedOuterSubtitle:
        "Rodea todos los Controles y Botones que quieras calibrar",
      combinedControlSelectionSubtitle:
        "Elige los Controles de esta región",
      combinedButtonSelectionSubtitle:
        "Elige los Botones del Panel rápido de esta región",
      combinedGridSubtitle:
        "Configura una cuadrícula para todos los Controles y Botones seleccionados",
      combinedConfirmSubtitle:
        "Revisa todos los cuadros de Controles y Botones antes de guardar",
      panelSelectionSubtitle:
        "Desactiva los paneles que no quieras y que falten en esta región",
      buttonSelectionSubtitle:
        "Elige los Botones del Panel rápido de esta región",
      gridSubtitle:
        "Configura la cuadrícula antes de alinear los cuadros de paneles activados",
      buttonGridSubtitle:
        "Configura la cuadrícula antes de alinear los cuadros de Botones seleccionados",
      panelSubtitle: "Arrastra y ajusta el área de {{panel}}",
      confirmSubtitle:
        "Revisa los cuadros de paneles activados antes de guardar",
      buttonConfirmSubtitle:
        "Revisa los cuadros de Botones seleccionados antes de guardar",
      panelHelpTitle: "Cómo alinear esta área",
      panelHelpBody:
        "Arrastra y ajusta el cuadro morado para colocarlo exactamente sobre los bordes de esta área. Los puntos de la cuadrícula deben quedar en los espacios que la rodean, no bajo el borde morado. Cuando el cuadro esté bien alineado, estos puntos te ayudarán a evaluar el espaciado y mantener un diseño uniforme y preciso.",
      panelHelpGood:
        "Ajusta el cuadro morado a los bordes del área para que los puntos de la cuadrícula queden en los espacios.",
      panelHelpBad:
        "No coloques el borde morado sobre los puntos de la cuadrícula ni en el espacio alrededor del área.",
      buttonPanelHelpBody:
        "Arrastra y ajusta el cuadro azul para colocarlo exactamente sobre los bordes de este Botón. Los puntos de la cuadrícula deben quedar en los espacios que lo rodean, no bajo el borde azul. Cuando el cuadro esté bien alineado, estos puntos te ayudarán a evaluar el espaciado y mantener un diseño uniforme y preciso.",
      buttonPanelHelpGood:
        "Ajusta el cuadro azul a los bordes del Botón para que los puntos de la cuadrícula queden en los espacios.",
      buttonPanelHelpBad:
        "No coloques el borde azul sobre los puntos de la cuadrícula ni en el espacio alrededor del Botón.",
      reviewHelpTitle: "Cómo revisar la calibración",
      reviewHelpBody:
        "Antes de guardar, comprueba que cada cuadro naranja encaje bien en los bordes de su panel y que los espacios entre paneles sean uniformes. Una revisión precisa ayudará a que los recortes exportados se alineen correctamente en Good Lock.",
      leaveTitle: "¿Salir de la calibración avanzada?",
      leaveBody:
        "Los cambios actuales de la calibración avanzada no se guardarán.",
      leaveConfirm: "Salir",
      columns: "Columnas",
      rows: "Filas",
      back: "Atrás",
      next: "Siguiente",
      gridHelpButton: "Ayuda de cuadrícula",
      gridControlsTitle: "Configurar cuadrícula de ajuste",
      snapStrengthTitle: "Intensidad de ajuste",
      snapStrengthLow: "Baja",
      snapStrengthBalanced: "Equilibrada",
      snapStrengthStrong: "Alta",
      panelSelectionTitle: "¿Qué paneles hay en esta región?",
      panelSelectionBody:
        "Desactiva cualquier panel de Controles que no quieras y que falte en esta región. Los paneles desactivados no se alinearán ni se exportarán.",
      panelEnabled: "Activado",
      panelDisabled: "Desactivado",
      gridSheetTitle: "Cómo configurar la cuadrícula",
      gridSheetSubtitle:
        "Elige el número de filas y columnas que coloque los puntos de la cuadrícula en los espacios entre tus Controles. Usa los ejemplos siguientes para decidir qué cuadrícula se ajusta mejor a tu captura de pantalla.",
      buttonGridSheetSubtitle:
        "Elige el número de filas y columnas que coloque los puntos de la cuadrícula en los espacios entre tus Botones. Usa los ejemplos siguientes para decidir qué cuadrícula se ajusta mejor a tu captura de pantalla.",
      combinedGridSheetSubtitle:
        "Elige el número de filas y columnas que coloque los puntos de la cuadrícula en los espacios alrededor de los Controles y Botones.",
      buttonSearchPlaceholder: "Buscar o crear etiqueta",
      selectedButtons: "Seleccionados: {{count}}",
      noButtonsSelected: "Toca las etiquetas de abajo para añadirlas.",
      addCustomButtonLabel: 'Añadir "{{label}}"',
      customIconDialogTitle: "Elegir un icono de Botón",
      customIconDialogBody: 'Elige un icono para "{{label}}".',
      customIconPresetTab: "Botones predefinidos",
      customIconOtherTab: "Otros iconos",
      customIconStar: "Estrella",
      customIconZap: "Rayo",
      customIconSparkles: "Destellos",
      customIconCircle: "Círculo",
      customIconMusic: "Música",
      customIconGamepad: "Mando de juego",
      customIconGlobe: "Globo",
      customIconSliders: "Controles deslizantes",
      customIconHeart: "Corazón",
      customIconBell: "Campana",
      customIconBookmark: "Marcador",
      customIconBriefcase: "Maletín",
      customIconCalendar: "Calendario",
      customIconCar: "Coche",
      customIconCloud: "Nube",
      customIconCoffee: "Café",
      customIconGift: "Regalo",
      customIconKey: "Llave",
      customIconLightbulb: "Bombilla",
      customIconPalette: "Paleta",
      customIconRocket: "Cohete",
      customIconFlag: "Bandera",
      customIconShoppingBag: "Bolsa de compras",
      customIconTimer: "Temporizador",
      moveUp: "Subir",
      moveDown: "Bajar",
      remove: "Eliminar",
    },
    export: {
      successTitle: "Exportación completada",
      successSubtitle: "Aplícalos en QuickStar en el orden indicado",
      openGoodLock: "Abrir Good Lock",
      openingGoodLock: "Abriendo Good Lock",
      goodLockUnavailableTitle: "No se puede abrir Good Lock",
      goodLockUnavailableDescription:
        "Puede que Good Lock no esté instalado o no se pueda abrir desde aquí. ¿Quieres abrir Galaxy Store para instalarlo?",
      openSamsungStore: "Abrir Galaxy Store",
      openingSamsungStore: "Abriendo Galaxy Store",
      backHome: "Volver al inicio",
      albumName: "Exportaciones del Panel rápido",
    },
    preset: {
      defaultLabel: "Galaxy S25+ / One UI 8.5 predeterminado",
      calibratedLabel: "{{label}} calibrado",
      advancedLabel: "Diseño avanzado personalizado de One UI 8.5",
      combinedLabel:
        "Diseño combinado de Controles y Botones de One UI 8.5",
    },
    panels: {
      buttonBox: "Cuadro de Botones",
      brightness: "Brillo",
      volume: "Volumen",
      mediaPlayer: "Reproductor multimedia",
    },
    buttonLabels: {
      "wi-fi": "Wi-Fi",
      bluetooth: "Bluetooth",
      "auto-rotate": "Giro automático",
      flashlight: "Linterna",
      sound: "Sonido",
      "flight-mode": "Modo avión",
      location: "Ubicación",
      "mobile-data": "Datos móviles",
      "mobile-hotspot": "Punto de acceso móvil",
      "power-saving": "Ahorro de energía",
      "smart-view": "Smart View",
      "nearby-devices": "Dispositivos cercanos",
      "eye-comfort-shield": "Protector de la vista",
      "do-not-disturb": "No molestar",
      "link-to-windows": "Conexión a Windows",
      "quick-share": "Quick Share",
      nfc: "NFC",
      "wireless-powershare": "Wireless PowerShare",
      "screen-recorder": "Grabadora de pantalla",
      "take-screenshot": "Captura de pantalla",
      modes: "Modos",
      "device-control": "Control de dispositivos",
      "music-share": "Music Share",
      "dolby-atmos": "Dolby Atmos",
      "extra-dim": "Atenuación extra",
      "secure-folder": "Carpeta segura",
      "always-on-display": "Always On Display",
      sync: "Sincronizar",
      kids: "Kids",
      "qr-code-scanner": "Escáner de códigos QR",
      "video-call-effects": "Efectos de videollamada",
      "live-caption": "Subtítulos instantáneos",
      "call-caption": "Subtítulos de llamadas",
      "microphone-mode": "Modo de micrófono",
      "performance-profile": "Perfil de rendimiento",
      "battery-protect": "Protección de la batería",
      "bluetooth-tethering": "Anclaje a red Bluetooth",
      "ultra-wideband": "Banda ultraancha",
      "data-saver": "Ahorro de datos",
      vpn: "VPN",
      "focus-mode": "Modo Concentración",
      "bedtime-mode": "Modo Hora de acostarse",
      "screen-cast": "Transmitir pantalla",
      "wireless-dex": "DeX inalámbrico",
      smartthings: "SmartThings",
      "one-handed-mode": "Modo Una mano",
      "touch-sensitivity": "Sensibilidad táctil",
      "color-inversion": "Inversión de colores",
      "color-correction": "Corrección de color",
      "reduce-brightness": "Reducir brillo",
      accessibility: "Accesibilidad",
      "camera-access": "Acceso a la cámara",
      "microphone-access": "Acceso al micrófono",
      "privacy-display": "Pantalla de privacidad",
      "private-share": "Private Share",
      "nearby-share": "Nearby Share",
      "work-profile": "Perfil de trabajo",
      "usb-tethering": "Anclaje a red USB",
      storage: "Almacenamiento",
      "hotspot-2-0": "Hotspot 2.0",
    },
    errors: {
      mustCalibrate:
        "Calibra el área del Panel rápido antes de personalizarla.",
      importScreenshotFirst:
        "Importa primero una captura de pantalla del Panel rápido.",
      mediaLibraryPermission:
        "Se necesita permiso para acceder a la biblioteca multimedia y guardar las exportaciones.",
      exportSurfaceMissing:
        "La vista previa de exportación de {{panel}} no está disponible.",
      imageTooLarge:
        "Esta imagen es demasiado grande para procesarla con fluidez. Elige una imagen más pequeña.",
      unableToOpenImagePicker: "No se puede abrir el selector de imágenes.",
      imagePickerRestartRequired:
        "Android ha detectado cambios en los ajustes del sistema. Reinicia la aplicación e inténtalo de nuevo.",
      unableToProcessImage: "No se puede procesar esta imagen.",
      unableToExport: "No se pueden exportar las imágenes.",
      confirmOuterFirst:
        "Confirma primero el área exterior de personalización.",
      invalidAdvancedPanels:
        "Mantén los cuadros de paneles seleccionados dentro del área exterior y sin superponerlos.",
      selectAdvancedPanel: "Selecciona al menos un panel para continuar.",
      selectAdvancedButton: "Selecciona al menos un Botón para continuar.",
      selectCombinedControl:
        "Selecciona al menos un Control para continuar.",
      selectCombinedButton:
        "Selecciona al menos un Botón para continuar.",
      combinedPanelOverlap:
        "Mueve o ajusta el cuadro actual para que no se superponga a un cuadro completado.",
      invalidCombinedPanels:
        "Comprueba todos los cuadros de Controles y Botones seleccionados antes de guardar.",
    },
  },
};

export default es;
