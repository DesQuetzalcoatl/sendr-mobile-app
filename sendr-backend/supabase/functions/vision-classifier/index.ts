import "@supabase/functions-js/edge-runtime.d.ts";

export default async function handler(req: Request): Promise<Response> {
  try {
    const { image_base64 } = await req.json();

    if (!image_base64) {
      return Response.json(
        { error: "Missing base64 image" },
        { status: 400 }
      );
    }

    const HF_API_KEY = Deno.env.get("HF_API_KEY");
    if (!HF_API_KEY) {
      return Response.json(
        { error: "Missing HuggingFace API key" },
        { status: 500 }
      );
    }

    // Call the ResNet‑18 model (very lightweight)
    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/resnet-18",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: image_base64
        }),
      }
    );

    const predictions = await hfResponse.json();

    // ResNet returns: [ { label, score }, ... ]
    if (!Array.isArray(predictions)) {
      return Response.json(
        { error: "Unexpected model response", raw: predictions },
        { status: 500 }
      );
    }

    const top = predictions[0];
    const label = top.label.toLowerCase();
    const confidence = top.score;

    // Map ResNet label → condition code
    const conditionMap: Record<string, string> = {
      "damaged": "C01",
      "cracked": "C01",
      "torn": "C01",
      "dented": "C01",

      "wrong_item": "C02",
      "mismatched": "C02",

      "color_mismatch": "C03",
      "style_mismatch": "C03",
      "cosmetic_issue": "C03",

      "intact": "C04",
      "undamaged": "C04",
      "good_condition": "C04",
    };

    const condition_code = conditionMap[label] ?? "C05";

    const reason_code =
      confidence >= 0.6 ? "CONFIDENT" : "LOW_CONFIDENCE";

    return Response.json({
      condition_code,
      confidence,
      reason_code,
      raw_label: label,
    });
  } catch (err) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}