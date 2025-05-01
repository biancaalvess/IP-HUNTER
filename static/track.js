/**
 * IP Hunter - Script de Rastreamento Avançado
 * Este script coleta informações detalhadas do navegador e dispositivo
 * para fins educacionais. Use de forma ética e responsável.
 */

;(() => {
  // Configurações
  const config = {
    trackEvents: true,
    trackMovement: true,
    trackSession: true,
    sessionTimeout: 30 * 60 * 1000, // 30 minutos
  }

  // Armazenar dados da sessão
  const session = {
    id: generateUUID(),
    startTime: new Date().getTime(),
    pageViews: 1,
    lastActivity: new Date().getTime(),
    referrer: document.referrer,
    entryPage: window.location.href,
    interactions: 0,
    events: [],
  }

  // Gerar UUID para identificação da sessão
  function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  // Função para coletar dados do dispositivo
  function collectDeviceData() {
    const deviceData = {
      device: {
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        vendor: navigator.vendor,
        language: navigator.language,
        languages: Array.from(navigator.languages || []),
        doNotTrack: navigator.doNotTrack,
        cookiesEnabled: navigator.cookieEnabled,
        screen: {
          width: window.screen.width,
          height: window.screen.height,
          availWidth: window.screen.availWidth,
          availHeight: window.screen.availHeight,
          colorDepth: window.screen.colorDepth,
          pixelDepth: window.screen.pixelDepth,
          orientation: window.screen.orientation ? window.screen.orientation.type : "unknown",
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: new Date().getTimezoneOffset(),
        memory: navigator.deviceMemory || null,
        cores: navigator.hardwareConcurrency || null,
        maxTouchPoints: navigator.maxTouchPoints || 0,
        pdfViewerEnabled: navigator.pdfViewerEnabled || false,
      },
      browser: {
        cookies_enabled: navigator.cookieEnabled,
        java_enabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
        plugins: Array.from(navigator.plugins || []).map((p) => ({
          name: p.name,
          description: p.description,
        })),
        // Informações adicionais do navegador
        appName: navigator.appName,
        appCodeName: navigator.appCodeName,
        appVersion: navigator.appVersion,
        product: navigator.product,
        productSub: navigator.productSub,
        userAgentData: navigator.userAgentData
          ? {
              brands: navigator.userAgentData.brands,
              mobile: navigator.userAgentData.mobile,
              platform: navigator.userAgentData.platform,
            }
          : null,
      },
      network: {},
      features: {
        localStorage: !!window.localStorage,
        sessionStorage: !!window.sessionStorage,
        webSockets: "WebSocket" in window,
        webWorkers: "Worker" in window,
        geolocation: "geolocation" in navigator,
        webRTC: "RTCPeerConnection" in window,
        canvas: !!window.CanvasRenderingContext2D,
        webGL: !!window.WebGLRenderingContext,
        audioAPI: "AudioContext" in window || "webkitAudioContext" in window,
        battery: "getBattery" in navigator,
        touchScreen: "ontouchstart" in window,
        notifications: "Notification" in window,
        // Recursos adicionais
        webP: false, // Será testado abaixo
        bluetooth: "bluetooth" in navigator,
        credentials: "credentials" in navigator,
        mediaDevices: "mediaDevices" in navigator,
        permissions: "permissions" in navigator,
        serviceWorker: "serviceWorker" in navigator,
        speech: "SpeechRecognition" in window || "webkitSpeechRecognition" in window,
        payment: "PaymentRequest" in window,
        vibrate: "vibrate" in navigator,
        share: "share" in navigator,
        clipboard: "clipboard" in navigator,
      },
      fingerprint: {},
      session: session,
    }

    // Adicionar informações de conexão de rede se disponíveis
    if (navigator.connection) {
      deviceData.network = {
        downlink: navigator.connection.downlink,
        effectiveType: navigator.connection.effectiveType,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData,
        connection_type: navigator.connection.type,
      }
    }

    // Gerar fingerprint de canvas
    try {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      canvas.width = 200
      canvas.height = 50

      // Texto com diferentes estilos
      ctx.textBaseline = "top"
      ctx.font = "14px 'Arial'"
      ctx.textBaseline = "alphabetic"
      ctx.fillStyle = "#f60"
      ctx.fillRect(125, 1, 62, 20)
      ctx.fillStyle = "#069"
      ctx.fillText("IP Hunter", 2, 15)
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)"
      ctx.fillText("IP Hunter", 4, 17)

      // Converter para string de dados
      const dataURL = canvas.toDataURL()
      deviceData.fingerprint.canvas = dataURL.substr(-50) // Apenas parte do hash para reduzir tamanho
    } catch (e) {
      deviceData.fingerprint.canvas = "not_supported"
    }

    // Testar suporte a webP
    const webpTest = new Image()
    webpTest.onload = () => {
      deviceData.features.webP = true
    }
    webpTest.onerror = () => {
      deviceData.features.webP = false
    }
    webpTest.src = "data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA=="

    // Coletar fontes instaladas (amostra)
    const fontList = [
      "Arial",
      "Times New Roman",
      "Courier New",
      "Verdana",
      "Georgia",
      "Comic Sans MS",
      "Impact",
      "Tahoma",
      "Trebuchet MS",
      "Webdings",
      "Wingdings",
      "Helvetica",
    ]

    deviceData.fingerprint.fonts = detectFonts(fontList)

    return deviceData
  }


  // Detectar fontes instaladas
function detectFonts(fontList) {
  const baseFonts = ["monospace", "sans-serif", "serif"];
  const testString = "mmmmmmmmmmlli";
  const testSize = "72px";
  const h = document.getElementsByTagName("body")[0];

  // Criar elemento de teste
  const s = document.createElement("span");
  s.style.fontSize = testSize;
  s.innerHTML = testString;
  const defaultWidth = {};
  const defaultHeight = {};

  // Obter larguras padrão
  for (const index in baseFonts) {
    s.style.fontFamily = baseFonts[index];
    h.appendChild(s);
    defaultWidth[baseFonts[index]] = s.offsetWidth;
    defaultHeight[baseFonts[index]] = s.offsetHeight;
    h.removeChild(s);
  }

  // Inicializar a variável detected corretamente como um array
  const detected = [];
  
  // Testar cada fonte
  for (const font of fontList) {
    let fontDetected = false;  // Usar uma variável separada para verificar se a fonte foi detectada
    
    for (const baseFont of baseFonts) {
      s.style.fontFamily = font + "," + baseFont;
      h.appendChild(s);
      const matched = s.offsetWidth !== defaultWidth[baseFont] || s.offsetHeight !== defaultHeight[baseFont];
      h.removeChild(s);

      if (matched) {
        fontDetected = true;
        break;
      }
    }

    // Se a fonte for detectada, adicionar ao array detected
    if (fontDetected) {
      detected.push(font);
    }
  }

  return detected;  // Retornar a lista de fontes detectadas
}


  // Função para enviar dados para o servidor
  function sendDataToServer(data) {
    fetch("/collect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "same-origin",
    })
      .then((response) => response.json())
      .catch((error) => console.error("Erro ao enviar dados:", error))
  }

  // Rastrear eventos se configurado
  if (config.trackEvents) {
    // Rastrear cliques
    document.addEventListener("click", (e) => {
      const target = e.target.tagName
      const position = { x: e.clientX, y: e.clientY }
      const timestamp = new Date().getTime()

      session.events.push({
        type: "click",
        target: target,
        position: position,
        timestamp: timestamp,
      })

      session.interactions++
      session.lastActivity = timestamp

      // Enviar dados a cada 5 interações
      if (session.interactions % 5 === 0) {
        const data = collectDeviceData()
        sendDataToServer(data)
      }
    })

    // Rastrear rolagem da página
    let scrollTimeout
    document.addEventListener("scroll", () => {
      clearTimeout(scrollTimeout)
      const timestamp = new Date().getTime()
      session.lastActivity = timestamp

      scrollTimeout = setTimeout(() => {
        session.events.push({
          type: "scroll",
          position: {
            scrollX: window.scrollX,
            scrollY: window.scrollY,
            maxScroll: document.documentElement.scrollHeight - window.innerHeight,
          },
          timestamp: timestamp,
        })
      }, 500)
    })

    // Rastrear tempo na página
    setInterval(() => {
      const currentTime = new Date().getTime()
      const timeOnPage = Math.floor((currentTime - session.startTime) / 1000)

      // Atualizar a cada minuto
      if (timeOnPage % 60 === 0) {
        session.timeOnPage = timeOnPage

        // Verificar se a sessão expirou
        if (currentTime - session.lastActivity > config.sessionTimeout) {
          // Enviar dados finais da sessão
          const data = collectDeviceData()
          data.session.endReason = "timeout"
          sendDataToServer(data)

          // Reiniciar sessão
          session.id = generateUUID()
          session.startTime = currentTime
          session.lastActivity = currentTime
          session.interactions = 0
          session.events = []
        }
      }
    }, 1000)

    // Rastrear saída da página
    window.addEventListener("beforeunload", () => {
      const data = collectDeviceData()
      data.session.endReason = "navigation"
      data.session.endTime = new Date().getTime()
      data.session.duration = data.session.endTime - data.session.startTime

      // Usar sendBeacon para garantir que os dados sejam enviados
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/collect", JSON.stringify(data))
      } else {
        // Fallback para XMLHttpRequest síncrono
        const xhr = new XMLHttpRequest()
        xhr.open("POST", "/collect", false)
        xhr.setRequestHeader("Content-Type", "application/json")
        xhr.send(JSON.stringify(data))
      }
    })
  }

  // Coletar e enviar dados quando o documento estiver carregado
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      const data = collectDeviceData()
      sendDataToServer(data)
    })
  } else {
    const data = collectDeviceData()
    sendDataToServer(data)
  }

  // Adicionar um pixel de rastreamento invisível
  const img = document.createElement("img")
  img.src = "/pixel?t=" + new Date().getTime()
  img.style.position = "absolute"
  img.style.width = "1px"
  img.style.height = "1px"
  img.style.opacity = "0"
  document.body.appendChild(img)
})()
