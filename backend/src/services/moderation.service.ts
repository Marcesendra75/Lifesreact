// ── Clasificación automática de contenido con OpenAI Moderation ──
// Gratis, rápido, y sirve para pre-priorizar reportes antes de que
// exista un panel de moderación humano. No toma ninguna acción por sí
// sola — solo etiqueta, la decisión siempre la termina tomando una persona.

interface ModerationResult {
  flagged: boolean;
  categories: string[];
  score: number;
}

const RESULTADO_VACIO: ModerationResult = { flagged: false, categories: [], score: 0 };

export async function classifyText(texto: string): Promise<ModerationResult> {
  if (!texto?.trim() || !process.env.OPENAI_API_KEY) return RESULTADO_VACIO;

  try {
    const res = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model: 'omni-moderation-latest', input: texto }),
    });

    if (!res.ok) return RESULTADO_VACIO;

    const data = await res.json();
    return extraerResultado(data);
  } catch {
    // si falla la clasificación, no bloqueamos el reporte por eso —
    // simplemente queda sin pre-etiquetar, para que lo vea un humano igual
    return RESULTADO_VACIO;
  }
}

export async function classifyImage(imageUrl: string): Promise<ModerationResult> {
  if (!imageUrl || !process.env.OPENAI_API_KEY) return RESULTADO_VACIO;

  try {
    const res = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'omni-moderation-latest',
        input: [{ type: 'image_url', image_url: { url: imageUrl } }],
      }),
    });

    if (!res.ok) return RESULTADO_VACIO;

    const data = await res.json();
    return extraerResultado(data);
  } catch {
    return RESULTADO_VACIO;
  }
}

function extraerResultado(data: any): ModerationResult {
  const resultado = data?.results?.[0];
  if (!resultado) return RESULTADO_VACIO;

  const categories = Object.entries(resultado.categories || {})
    .filter(([, marcado]) => marcado)
    .map(([nombre]) => nombre);

  const score = Math.max(0, ...Object.values(resultado.category_scores || {}) as number[]);

  return { flagged: !!resultado.flagged, categories, score };
}