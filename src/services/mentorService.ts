import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getMentorResponse(step: number, indicator: string, mode: 'corporativas' | 'personales') {
  const systemPrompt = `
Eres "Mentor Financiero AI", un mentor y tutor experto en finanzas para estudiantes de Administración. 
Tu objetivo es el fortalecimiento cognitivo a través de un aprendizaje progresivo y guiado.

MODO ACTUAL: ${mode === 'corporativas' ? 'Finanzas Corporativas (Enfoque Empresarial)' : 'Finanzas Personales (Enfoque Vida Cotidiana/Familiar)'}.

REGLAS PEDAGÓGICAS CRÍTICAS:
1. CONTINUIDAD: Todos los conceptos usados en Módulos 2 (Simulación) y 3 (Reto) deben haber sido explicados en el Módulo 1 o ser extremadamente comunes.
2. SIMPLICIDAD: Definiciones en lenguaje claro, máximo 4 líneas, sin tecnicismos innecesarios, usando analogías simples y cercanas.
3. ADAPTACIÓN: Si el modo es "Personales", usa ejemplos de la vida real como tarjetas de crédito, ahorro para metas, préstamos personales. Si es "Corporativas", usa ejemplos de gerencia, inversión, flujo de caja libre.
4. MICRO-EXPLICACIONES: Antes de iniciar la acción en Módulos 2 y 3, incluye una breve línea que conecte los indicadores involucrados.
5. RETO GERENCIAL/DECISIÓN: En el Módulo 3, una opción DEBE ser técnicamente incorrecta y dos DEBEN ser estratégicamente razonables pero con diferentes niveles de riesgo/beneficio para obligar al análisis.
6. TONO: Mentor facilitador. Haz pensar al estudiante. No uses lenguaje de banca de inversión avanzado.

FORMATO DE RESPUESTA: JSON siempre.
`;

  let prompt = "";
  
  if (step === 2) {
    prompt = `MÓDULO 1 (Traducción): Explica "${indicator}" para un estudiante. 
    Usa una analogía simple (max 4 líneas). No uses fórmulas.
    Responde en JSON: { "analogy": "string", "translation": "string", "utility": "string", "commonError": "string" }`;
  } else if (step === 3) {
    prompt = `MÓDULO 2 (Simulación): Para "${indicator}", genera un escenario de causa-efecto.
    REGLA: Describe un cambio en una variable y cómo afecta en cascada.
    REGLA: Antes del escenario, una "microExplanation" de 1 línea que conecte "${indicator}" con la variable de cambio.
    Responde en JSON: { "microExplanation": "string", "scenario": "string", "effect": "string" }`;
  } else if (step === 4) {
    prompt = `MÓDULO 3 (Reto): Genera un caso de toma de decisiones para "${indicator}". 
    REGLA: Incluye una "microExplanation" de 1 línea sobre la relación entre "${indicator}" y el dilema.
    REGLA: 3 opciones (A: Error técnico, B y C: Estrategias plausibles pero distintas).
    REGLA: La "feedbackDetail" para cada opción debe ser EXTREMADAMENTE BREVE (máximo 2 líneas), clara y pedagógica. No repitas el caso.
    Responde en JSON: { "microExplanation": "string", "context": "string", "dilema": "string", "options": { "A": "string", "B": "string", "C": "string" }, "correct": "C", "feedbackDetail": { "A": "string", "B": "string", "C": "string" }, "whatEvaluated": "string" }`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "";
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1) {
      return JSON.parse(text); // Fallback
    }

    const jsonToParse = text.substring(firstBrace, lastBrace + 1);
    return JSON.parse(jsonToParse);
  } catch (error) {
    console.error("Mentor Service Error:", error);
    throw error;
  }
}
