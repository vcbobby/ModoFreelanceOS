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
          REGLA PARA FREELANCER:
          - La propuesta debe ser redactada en lenguaje natural que no se note que esta redactada con ia, donde detallas que el perfil se adapta a las necesidades que busca el cliente o empresa y un plan de acción que se propone para realizar dicho proyecto.
          - La propuesta debe tener una longitud MÍNIMA de 100 caracteres.
          - Sé directo pero profesional, evitando relleno innecesario.
        `
                break
            case 'Workana':
                platformInstructions = `
          REGLA PARA WORKANA:
          - La propuesta debe ser redactada en lenguaje natural que no se note que esta redactada con ia, donde detallas que el perfil se adapta a las necesidades que busca el cliente o empresa y un plan de acción que se propone para realizar dicho proyecto.
          - Usa listas (bullet points) si hay varios requerimientos.
          - Deja espacios claros entre párrafos.
        `
                break
            case 'Upwork':
            case 'LinkedIn':
                platformInstructions = `
          REGLA PARA ${platform.toUpperCase()}:
          - La cover letter debe ser redactada en lenguaje natural que no se note que esta redactada con ia, donde detallas que el perfil se adapta a las necesidades que busca el cliente o empresa.
          - Estructura la respuesta como una "Cover Letter" profesional.
          - Debe tener un cuerpo argumentativo sólido y cierre (Call to Action).
        `
                break
        }

        const greetingInstruction =
            clientName && clientName.trim() !== ''
                ? `El cliente se llama "${clientName}". Úsalo naturalmente en el saludo.`
                : `NO se conoce el nombre del cliente. IMPORTANTE: NO uses saludos robóticos como "Estimado contratante" o "Estimado cliente". Empieza con un simple "Hola," o ve directo al punto de forma natural.`

        const prompt = `
      Actúa como un redactor experto en copywriting para freelancers en la plataforma: ${platform}.
      
      OBJETIVO:
      Detecta el idioma en el que está escrita la "Descripción del Cliente" (Español, Inglés, Portugués, etc.) y genera las propuestas EN ESE MISMO IDIOMA.
      
      Datos del Trabajo:
      - Plataforma Objetivo: ${platform}
      - Descripción del Cliente: "${jobDescription}"
      
      Mi Perfil:
      "${userProfile}"
      
      INSTRUCCIONES DE FORMATO:
      ${platformInstructions}

      INSTRUCCIONES DE SALUDO:
      ${greetingInstruction}

      Genera 3 variantes de propuesta:
      1. Formal: Profesional y corporativa.
      2. Corto: Directo al grano.
      3. Valor: Enfocada en beneficios/ROI.
      
      Asegúrate de que suenen humanas y persuasivas.
    `

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: proposalSchema,
                systemInstruction:
                    'Eres un asistente experto para freelancers. Tu prioridad es adaptarte al idioma del proyecto y al formato de la plataforma.',
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
