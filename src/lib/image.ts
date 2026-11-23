export async function compressImage(file: File, maxW = 900): Promise<{ blob: Blob; ext: string }> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxW / bmp.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const toBlob = (type: string) =>
    new Promise<Blob | null>((r) => canvas.toBlob(r, type, 0.8));
  const webp = await toBlob("image/webp");
  if (webp && webp.type === "image/webp") return { blob: webp, ext: "webp" };
  const jpg = await toBlob("image/jpeg");
  if (!jpg) throw new Error("Não foi possível processar a imagem");
  return { blob: jpg, ext: "jpg" };
}
