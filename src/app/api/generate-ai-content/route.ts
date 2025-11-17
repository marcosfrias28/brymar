import { generateText } from 'ai';

export async function POST(req: Request) {
  try {
    const { prompt, maxLength = 200 } = await req.json();

    const { text } = await generateText({
      model: 'openai/gpt-5-mini',
      prompt: `${prompt}\n\nIMPORTANTE: Responde ÚNICAMENTE con el contenido solicitado, sin explicaciones adicionales ni formato extra. Máximo ${maxLength} caracteres.`,
      maxOutputTokens: Math.ceil(maxLength * 1.5),
      temperature: 0.8,
    });

    return Response.json({ text: text.trim() });
  } catch (error) {
    console.error('Error generando contenido con IA:', error);
    return Response.json(
      { error: 'Error generando contenido' },
      { status: 500 }
    );
  }
}
