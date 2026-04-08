import { Proposal } from '@types';

export interface GeminiClient {
  generateProposals: (
    jobDescription: string,
    userProfile: string,
    platform: string,
    clientName?: string
  ) => Promise<Proposal[]>;
  analyzeDocument: (
    text: string,
    mode: 'resumen' | 'riesgos' | 'accion' | 'mejora'
  ) => Promise<string>;
  analyzeFinancialHealth: (
    transactions: Array<{
      date: string;
      type: 'income' | 'expense';
      status: 'paid' | 'pending';
      amount: number;
      description: string;
    }>,
    summary: { income: number; expense: number; balance: number },
    pending: { toCollect: number; toPay: number }
  ) => Promise<string>;
  chatWithAssistant: (
    message: string,
    history: { role: 'user' | 'model'; text: string }[],
    contextData: {
      finances: string;
      agenda: string;
      notes: string;
      history: string;
      portfolio: string;
      currentTime: string;
      currentDate: string;
    }
  ) => Promise<string>;
}

interface GeminiClientOptions {
  apiKey: string;
  modelName?: string;
}

const sanitizeWorkanaContent = (text: string): string => {
  let clean = text;
  clean = clean.replace(/whatsapp/gi, 'mensajería de la plataforma');
  clean = clean.replace(/feedback/gi, 'retroalimentación');
  clean = clean.replace(/\b\w*fee\w*\b/gi, (match) => {
    const lower = match.toLowerCase();
    if (lower.includes('coffee')) return 'café';
    if (lower.includes('fee')) return 'tarifa';
    return '[término eliminado]';
  });
  clean = clean.replace(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/g, '[Contacto externo eliminado]');
  clean = clean.replace(/@\w+/g, '');
  clean = clean.replace(/\b[\w-]+\.(com|es|net|js|org|io|co|ar|mx)\b/gi, '');
  clean = clean.replace(/\b\d[\d\s-]{5,}\d\b/g, '[Teléfono eliminado]');
  return clean;
};

export const createGeminiClient = ({
  apiKey,
  modelName = 'llama-3.3-70b-versatile',
}: GeminiClientOptions): GeminiClient => {
  if (!apiKey) {
    console.warn('VITE_GROQ_API_KEY no configurada. Funciones de IA deshabilitadas.');
  }

  const assertConfigured = () => {
    if (!apiKey) {
      throw new Error('Groq no está configurado. Define VITE_GROQ_API_KEY en tu .env');
    }
  };

  const groqFetch = async (messages: any[], jsonMode: boolean = false) => {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        temperature: 0.7,
        response_format: jsonMode ? { type: "json_object" } : undefined
      }),
    });
    if (!res.ok) {
      throw new Error(`Error de Groq: ${await res.text()}`);
    }
    const data = await res.json();
    return data.choices[0].message.content;
  };

  const generateProposals: GeminiClient['generateProposals'] = async (
    jobDescription,
    userProfile,
    platform,
    clientName
  ) => {
    assertConfigured();

    let platformInstructions = '';
    switch (platform) {
      case 'Freelancer':
        platformInstructions = `
          ALERTA DE LONGITUD CRÍTICA:
          - La plataforma Freelancer.com CORTA el texto si excede 1500 caracteres.
          - TU OBJETIVO: Escribir menos de 200 PALABRAS por propuesta.
          - Estilo: Venta agresiva pero educada. Ve directo a la solución.
          - Plan de acción: OBLIGATORIO incluirlo, pero debe ser RESUMIDO (puntos cortos y concisos).
          - NO introducciones largas. NO despedidas largas.
        `;
        break;
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
        `;
        break;
      case 'Upwork':
      case 'LinkedIn':
        platformInstructions = `
          - Estilo: "Cover Letter" conversacional y experta.
          - Estructura: Gancho inicial -> Solución al problema -> Cierre con llamada a la acción.
        `;
        break;
    }

    const greetingInstruction =
      clientName && clientName.trim() !== ''
        ? `El cliente se llama "${clientName}". Úsalo naturalmente.`
        : `NO uses "Estimado cliente". Empieza con "Hola," o directo al grano.`;

    const prompt = `
            Actúa como un estratega de propuestas freelance experto.
      
      OBJETIVO PRINCIPAL:
      Leer la descripción del trabajo, detectar el dolor principal del cliente y explicar CÓMO mi perfil resuelve ese dolor específico.
      
      REGLAS DE PUNTUACIÓN Y FORMATO (CRÍTICO):
      1. JAMÁS escribas un bloque de texto pegado.
      2. Usa DOBLE SALTO DE LÍNEA (\n\n) para separar cada párrafo.
      3. Después de cada punto (.) o coma (,), DEBE haber un espacio.
         - MAL: "Hola.Soy ingeniero"
         - BIEN: "Hola. Soy ingeniero"
      4. Usa listas (bullet points) para enumerar pasos.

      REGLA DE ORO (ANTI-COPIA/PEGA):
      - NO listes mis habilidades ni mi experiencia tal cual aparecen en mi perfil.
      - NO digas frases como "Como puedes ver en mi perfil tengo habilidades en...".
      - EN SU LUGAR, integra mis habilidades en la narrativa. 
      - Ejemplo MALO: "Estimado Paul, Entiendo que su visión es establecer una tienda en línea... Estoy listo para discutir cómo mi experiencia puede transformar su proyecto en una plataforma de ventas exitosa y rentable."
      - Ejemplo BUENO: "Hola Miriam, ¿cómo estás?\\n\\nEstuve revisando tu proyecto y me interesa mucho colaborar contigo. Mi nombre es Víctor Castillo y trabajo como desarrollador web experto en tiendas online.\\n\\nTengo experiencia creando e-commerce funcionales, fáciles de administrar y listos para vender. Por lo que comentas, mi perfil encaja bastante bien con lo que necesitas.\\n\\n**Lo que propongo para tu proyecto:**\\n\\n- **1. Revisión inicial:** Conversamos sobre el tipo de productos y definimos la línea visual.\\n- **2. Diseño de tienda:** Creo una estructura ordenada y adaptable a móviles.\\n- **3. Sistema de ventas:** Integración de métodos de pago y logística básica.\\n- **4. Optimización:** Reviso la velocidad y usabilidad antes de la entrega.\\n\\nSi te parece, podemos empezar de inmediato. Quedo atento a tus comentarios.\\n\\nSaludos, Víctor."
      
      INSTRUCCIONES DE DISEÑO VISUAL Y FORMATO (CRÍTICO PARA JSON):
      - **TODO salto de línea DEBE escribirse explícitamente como \\n\\n**. NUNCA generes un "Enter" o salto de línea real dentro del texto porque rompe el formato JSON.
      - Usa formato Markdown para estructurar el texto.
      - Usa **negritas** para resaltar palabras clave, beneficios o tecnologías importantes.
      - Usa listas con viñetas (- punto 1) o números (1. paso 1) para enumerar pasos o beneficios.
      - Deja \\n\\n entre párrafos para que el texto respire.
      -IMPORTANTE: cuida de que no haya ningun tipo de enlace a sitio web o correos.

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
            
            Genera un JSON con este schema:
            { "proposals": [ { "type": "Formal", "title": "...", "content": "..." }, ... ] }
        `;

    const messages = [
      { role: 'system', content: prompt }
    ];

    const resultText = await groqFetch(messages, true);
    
    const text = resultText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    const parsed = JSON.parse(text);
    let finalProposals = (parsed.proposals || parsed) as Proposal[];

    if (platform === 'Workana') {
      finalProposals = finalProposals.map((proposal) => ({
        ...proposal,
        content: sanitizeWorkanaContent(proposal.content),
      }));
    }
    return finalProposals;
  };

  const analyzeDocument: GeminiClient['analyzeDocument'] = async (text, mode) => {
    assertConfigured();
    const messages = [
        { role: 'system', content: `Tarea: ${mode.toUpperCase()}\nIdioma: Español.\nDocumento: "${text.substring(0, 30000)}"` }
    ];
    return await groqFetch(messages, false);
  };

  const analyzeFinancialHealth: GeminiClient['analyzeFinancialHealth'] = async (
    transactions,
    summary,
    pending
  ) => {
    assertConfigured();
    const today = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const dataStr = JSON.stringify(
      transactions.slice(0, 50).map((t) => ({
        fecha: t.date,
        tipo: t.type === 'income' ? 'INGRESO' : 'GASTO',
        estado: t.status === 'pending' ? 'PENDIENTE' : 'REAL',
        monto: t.amount,
        descripcion: t.description,
      }))
    );

    const prompt = `
            Actúa como asesor financiero.
            FECHA ACTUAL: ${today}
            
            REALIDAD: Balance $${summary.balance}.
            FUTURO: Por Cobrar $${pending.toCollect}, Por Pagar $${pending.toPay}.
            HISTORIAL: ${dataStr}

            Tarea: Diagnóstico de liquidez, estrategia de cobros y 3 consejos.
        `;

    const messages = [{ role: 'system', content: prompt }];
    return await groqFetch(messages, false);
  };

  const chatWithAssistant: GeminiClient['chatWithAssistant'] = async (
    message,
    history,
    contextData
  ) => {
    assertConfigured();

    const systemContext = `
        IDENTIDAD:
        Tu nombre es **Freency**. Eres la asistente virtual avanzada de ModoFreelanceOS.
        Personalidad: Entusiasta, profesional, eficiente y usas emojis.
        
        🔴 FECHA/HORA ACTUAL: ${contextData.currentDate} ${contextData.currentTime}

        TUS FUENTES DE DATOS (CONTEXTO):
        1. 📜 HISTORIAL: ${contextData.history}
        2. 💰 FINANZAS: ${contextData.finances}
        3. 📅 AGENDA: ${contextData.agenda}
        4. 📌 NOTAS: ${contextData.notes}
        5. 🌐 PORTAFOLIO: ${contextData.portfolio || 'No disponible'}

        🛑 REGLAS DE SEGURIDAD (SCOPE STRICTO):
        1. **SOLO** respondes sobre: Datos del usuario, funciones de la App y Negocios Freelance.
        2. **PROHIBIDO** responder sobre: Cultura general, Política, Religión, Recetas, Deportes, etc.
        3. SI PREGUNTAN ALGO FUERA DE CONTEXTO: Responde: "Lo siento, mi sistema está diseñado exclusivamente para ayudarte con tu negocio freelance y las herramientas de esta app. 🚀"

        🛠️ HERRAMIENTAS (JSON):
        Si el usuario pide una acción, NO respondas texto. Responde SOLO con el JSON exacto:

        - Crear Evento: { "action": "create_event", "title": "...", "date": "YYYY-MM-DD", "time": "HH:MM", "desc": "..." }
        - Crear Nota: { "action": "create_note", "title": "...", "content": "..." }
        - Generar Logo: { "action": "generate_logo", "name": "Marca", "style": "Estilo", "details": "Detalles" }
        - Buscar Trabajo: { "action": "search_jobs", "query": "termino" }
        - Crear Curso: { "action": "create_course", "topic": "Tema", "level": "Nivel" }
        `;

    const chatHistory = [
      { role: 'system', content: systemContext },
      { role: 'assistant', content: 'Entendido. Soy Freency, tengo acceso a tus datos y me limitaré a temas de negocio.' },
      ...history.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text,
      })),
      { role: 'user', content: message }
    ];

    try {
      const responseText = await groqFetch(chatHistory, false);
      return responseText || 'No pude generar una respuesta.';
    } catch (error) {
      console.error(error);
      return 'No pude generar una respuesta por un error de conectividad.';
    }
  };

  return {
    generateProposals,
    analyzeDocument,
    analyzeFinancialHealth,
    chatWithAssistant,
  };
};
