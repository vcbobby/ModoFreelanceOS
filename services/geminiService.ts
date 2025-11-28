import { GoogleGenAI, Type, Schema } from '@google/genai'
import { Proposal } from '../types'


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
          - Estilo: Directo, agresivo en ventas pero educado.
          - Longitud mínima: 100 caracteres.
          - Enfoque: Qué voy a hacer por ti AHORA mismo.
        `
                break
            case 'Workana':
                platformInstructions = `
          - Estilo: Profesional, empático y estructurado.
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
      
      REGLA DE ORO (ANTI-COPIA/PEGA):
      - NO listes mis habilidades ni mi experiencia tal cual aparecen en mi perfil.
      - NO digas frases como "Como puedes ver en mi perfil tengo habilidades en...".
      - EN SU LUGAR, integra mis habilidades en la narrativa. 
      - Ejemplo MALO: "Tengo experiencia en React y Node."
      - Ejemplo BUENO: "Puedo construir la plataforma que necesitas utilizando React para asegurar una carga rápida..."
      
      CONTEXTO:
      1. Plataforma: ${platform}
      2. Lo que pide el cliente (Job Description): "${jobDescription}"
      3. Mi Perfil (Úsalo solo como base de datos de lo que sé hacer): "${userProfile}"
      
      INSTRUCCIONES DE IDIOMA:
      Detecta el idioma de la "Descripción del Cliente" y escribe las propuestas EN ESE MISMO IDIOMA.
      
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
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: proposalSchema,
            },
        })

        const jsonText = response.text
        if (!jsonText) throw new Error('No response from AI')

        const parsed = JSON.parse(jsonText)
        return parsed.proposals
    } catch (error) {
        console.error('Error generating proposals:', error)
        throw error
    }
}
