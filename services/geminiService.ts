import { GoogleGenAI, Type, Schema } from '@google/genai'
import { Proposal } from '../types'

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY })

const proposalSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        proposals: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    type: {
                        type: Type.STRING,
                        enum: ['Formal', 'Corto', 'Valor'],
                    },
                    title: { type: Type.STRING },
                    content: { type: Type.STRING },
                },
                required: ['type', 'title', 'content'],
            },
        },
    },
    required: ['proposals'],
}

const sanitizeWorkanaContent = (text: string): string => {
    let clean = text

    // 1. Reemplazar palabras prohibidas específicas
    clean = clean.replace(/whatsapp/gi, 'mensajería de la plataforma')
    clean = clean.replace(/feedback/gi, 'retroalimentación')

    // 2. Reemplazar cualquier palabra que contenga "fee" (fees, coffee, feed)
    // OJO: Esto es agresivo, pero es lo que pide Workana.
    // Usamos una función de reemplazo para intentar salvar algunas palabras si es posible
    clean = clean.replace(/\b\w*fee\w*\b/gi, (match) => {
        const lower = match.toLowerCase()
        if (lower.includes('coffee')) return 'café'
        if (lower.includes('fee')) return 'tarifa'
        return '[término eliminado]' // Por seguridad si no sabemos qué es
    })

    // 3. Eliminar Emails
    clean = clean.replace(
        /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/g,
        '[Contacto externo eliminado]'
    )

    // 4. Eliminar menciones con @
    clean = clean.replace(/@\w+/g, '')

    // 5. Eliminar Dominios/Enlaces (.com, .es, .net, .js, etc)
    clean = clean.replace(/\b[\w-]+\.(com|es|net|js|org|io|co|ar|mx)\b/gi, '')

    // 6. Eliminar Números de teléfono (secuencias de más de 6 dígitos)
    // Borra "1234567" o "123 456 789"
    clean = clean.replace(/\b\d[\d\s-]{5,}\d\b/g, '[Teléfono eliminado]')

    return clean
}

export const generateProposals = async (
    jobDescription: string,
    userProfile: string,
    platform: string,
    clientName?: string
): Promise<Proposal[]> => {
    try {
        let platformInstructions = ''

        switch (platform) {
            case 'Freelancer':
                platformInstructions = `
          ALERTA DE LONGITUD CRÍTICA:
          - La plataforma Freelancer.com CORTA el texto si excede 1500 caracteres.
          - TU OBJETIVO: Escribir menos de 200 PALABRAS por propuesta.
          - Estilo: Venta agresiva pero educada. Ve directo a la solución.
          - Plan de acción: OBLIGATORIO incluirlo, pero debe ser RESUMIDO (puntos cortos y concisos).
          - NO introducciones largas. NO despedidas largas.
        `
                break
            case 'Workana':
                platformInstructions = `
                🔴 REGLAS DE SEGURIDAD EXTREMA (ANTI-BANEO):
          1. PROHIBIDO usar la palabra "WhatsApp". Usa "chat de la plataforma".
          2. PROHIBIDO usar la palabra "feedback". Usa "comentarios" o "retroalimentación".
          3. PROHIBIDO cualquier palabra con "fee" (ej: fees, coffee, feed). Usa "tarifas" o "café".
          4. PROHIBIDO enlaces (.com, .net), emails o teléfonos.
          5. PROHIBIDO símbolos @. Usa "correo electrónico" en su lugar.
          6. PROHIBIDO ofertas de descuento o precios especiales.
          7. PROHIBIDO mencionar mi perfil o experiencia tal cual. Integra mis habilidades en la narrativa.
          8. PROHIBIDO usar la palabra comisión o comisiones. Usa "tarifas de la plataforma".

            FORMATO Y ESTRUCTURA:
          - Estilo: Profesional, empático y estructurado.
          - Ofrece un plan de accion claro, especificando punto por punto como propongo realizar el proyecto y que se ajuste a lo que el cliente necesita para realizar su proyecto.
          - Formato: Usa párrafos cortos.
        `
                break
            case 'Upwork':
            case 'LinkedIn':
                platformInstructions = `
          - Estilo: "Cover Letter" conversacional y experta.
          - Estructura: Gancho inicial -> Solución al problema -> Cierre con llamada a la acción.
        `
                break
        }

        const greetingInstruction =
            clientName && clientName.trim() !== ''
                ? `El cliente se llama "${clientName}". Úsalo naturalmente.`
                : `NO uses "Estimado cliente". Empieza con "Hola," o directo al grano.`

        const prompt = `
      Actúa como un estratega de propuestas freelance experto.
      
      OBJETIVO PRINCIPAL:
      Leer la descripción del trabajo, detectar el dolor principal del cliente y explicar CÓMO mi perfil resuelve ese dolor específico.
      
      REGLAS DE PUNTUACIÓN Y FORMATO (CRÍTICO):
      1. JAMÁS escribas un bloque de texto pegado.
      2. Usa DOBLE SALTO DE LÍNEA (\\n\\n) para separar cada párrafo.
      3. Después de cada punto (.) o coma (,), DEBE haber un espacio.
         - MAL: "Hola.Soy ingeniero"
         - BIEN: "Hola. Soy ingeniero"
      4. Usa listas (bullet points) para enumerar pasos.

      REGLA DE ORO (ANTI-COPIA/PEGA):
      - NO listes mis habilidades ni mi experiencia tal cual aparecen en mi perfil.
      - NO digas frases como "Como puedes ver en mi perfil tengo habilidades en...".
      - EN SU LUGAR, integra mis habilidades en la narrativa. 
      - Ejemplo MALO: "Estimado Paul, Entiendo que su visión es establecer una tienda en línea completa y funcional, específicamente optimizada para capitalizar el tráfico proveniente de TikTok, con una atención crítica en la experiencia móvil y la implementación del sistema de Pago Contra Entrega (COD) como opción principal.Como ingeniero y desarrollador web con experiencia en diseño UI/UX, mi enfoque se centrará en una arquitectura de plataforma robusta y escalable. Utilizando mi dominio en Shopify o WordPress con WooCommerce, construiré una tienda que no solo cumpla con todas las funcionalidades estándar de e-commerce (gestión de catálogo, carrito, seguimiento de pedidos), sino que también garantice un rendimiento excepcional y una fluidez total en dispositivos móviles.Mi experiencia en diseño UI/UX, respaldada por herramientas como Figma y el uso de React/Bootstrap, me permite crear interfaces intuitivas y estéticamente atractivas que son cruciales para el público de TikTok, asegurando una alta tasa de compromiso y conversión. La integración del COD será ejecutada con precisión, priorizándola en el proceso de checkout para ofrecer la flexibilidad que sus clientes requieren.Además, desarrollaré un panel de administración intuitivo que simplificará la gestión de inventario y ventas, permitiéndole operar su negocio de manera eficiente. Estoy listo para discutir cómo mi experiencia puede transformar su proyecto en una plataforma de ventas exitosa y rentable."
      - Ejemplo BUENO: "Hola Miriam, ¿cómo estás? Estuve revisando tu proyecto y me interesa mucho colaborar contigo. Mi nombre es Víctor Castillo y trabajo como desarrollador web especializado en tiendas online. Tengo experiencia creando e-commerce funcionales, fáciles de administrar y listos para que el cliente solo tenga que enfocarse en vender. Por lo que comentas, mi perfil encaja bastante bien con lo que necesitas: una tienda clara, rápida, con buena experiencia de usuario y que además sea fácil de mantener y escalar. He trabajado con plataformas como Shopify, WooCommerce y configuraciones completas tipo “llave en mano”, desde el diseño hasta la integración de productos, pasarelas de pago y ajustes finales. Lo que propongo para tu proyecto 1. Revisión inicial y definición del estilo Conversamos brevemente sobre el tipo de productos, estilo visual y funcionalidades básicas (envíos, pago, categorías, etc.). Con eso defino una línea de diseño limpia, moderna y orientada a conversión. 2. Diseño y maquetación de la tienda Creo una estructura ordenada con un diseño atractivo, adaptable a móviles y que facilite la navegación. Esto incluye homepage, página de producto, carrito y checkout según la plataforma. 3. Configuración completa del sistema de ventas Integración de métodos de pago, logística básica, inventarios, variantes, cupones y todo lo necesario para que la tienda quede operativa. 4. Carga inicial de productos Subo los productos base (cantidad a definir contigo) con imágenes optimizadas y descripciones bien estructuradas. 5. Optimización y pruebas Reviso velocidad, usabilidad y realizo pruebas de compra para asegurar que todo funcione perfecto antes de la entrega. 6. Entrega “llave en mano” + soporte Te entrego la tienda lista para usar y te doy una pequeña guía de gestión para que puedas actualizar productos o realizar cambios sin complicaciones. Si te parece, puedo comenzar de inmediato. Cualquier detalle adicional que quieras incluir, estoy abierto a revisarlo contigo. Quedo atento, Miriam. Con gusto te ayudo a lanzar tu tienda. Saludos, Víctor."
      
      INSTRUCCIONES DE DISEÑO VISUAL (IMPORTANTE):
      - Usa formato Markdown para estructurar el texto.
      - Usa **negritas** para resaltar palabras clave, beneficios o tecnologías importantes.
      - Usa listas con viñetas (- punto 1) o números (1. paso 1) para enumerar pasos o beneficios.
      - Deja SALTO DE LÍNEA entre párrafos para que el texto respire.
      - despues de cada punto "." deja un espacio o salto de linea si es otro parrafo.

      CONTEXTO:
      1. Plataforma: ${platform}
      2. Lo que pide el cliente (Job Description): "${jobDescription}"
      3. Mi Perfil (Úsalo solo como base de datos de lo que sé hacer, no necesariamente tienes que expresar en la propuesta todas mis habilidades): "${userProfile}"
      
      INSTRUCCIONES DE IDIOMA (IMPORTANTE):
      Detecta el idioma de la "Descripción del Trabajo (Job Description)" y escribe las propuestas EN ESE MISMO IDIOMA.
      
      INSTRUCCIONES DE FORMATO:
      ${platformInstructions}
      ${greetingInstruction}

      Genera 3 variantes:
      1. Formal: Corporativa, seria, enfocada en garantías y seguridad.
      2. Corto: Para clientes ocupados. "Hola, entiendo que necesitas X. Yo hago X así. Hablemos."
      3. Valor: Enfocada en el beneficio (ROI, ahorro de tiempo, más ventas).
    `

        // Nota: Usamos gemini-1.5-flash que es más estable actualmente,
        // si tienes acceso a la 2.0 puedes cambiarlo.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: proposalSchema,
            },
        })

        const jsonText = response.text
        if (!jsonText) throw new Error('No response from AI')

        const parsed = JSON.parse(jsonText)
        let finalProposals = parsed.proposals

        if (platform === 'Workana') {
            finalProposals = parsed.proposals.map((p: Proposal) => ({
                ...p,
                content: sanitizeWorkanaContent(p.content),
            }))
        }
        return finalProposals
    } catch (error) {
        console.error('Error generating proposals:', error)
        throw error
    }
}
