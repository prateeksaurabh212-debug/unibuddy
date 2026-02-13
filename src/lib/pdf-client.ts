"use client";

// pdfjs-dist is loaded only when this function runs (in the browser), to avoid
// pulling DOM-only APIs into the server bundle.
export async function extractTextFromPdfFile(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  if (typeof window !== "undefined") {
    // Use local worker from public/ to avoid CDN fetch failures (CORS, network, etc.)
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const parts: string[] = [];
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const strings = textContent.items
      .filter((item) => "str" in item)
      .map((item) => (item as { str: string }).str);
    parts.push(strings.join(" "));
  }
  return parts.join("\n");
}
