const DEFAULT_MAX_DIMENSION = 1200;
const WEBP_QUALITY = 0.82;
const JPEG_QUALITY = 0.85;

type LoadedImage = {
  source: CanvasImageSource;
  width: number;
  height: number;
  cleanup: () => void;
};

async function loadImage(file: File): Promise<LoadedImage> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    return {
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      cleanup: () => bitmap.close(),
    };
  }

  return new Promise<LoadedImage>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({
        source: img,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        cleanup: () => URL.revokeObjectURL(url),
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível carregar a imagem"));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

function replaceExtension(filename: string, ext: string): string {
  const cleanName = filename.trim() || "imagem";
  const dotIndex = cleanName.lastIndexOf(".");
  const base = dotIndex > 0 ? cleanName.slice(0, dotIndex) : cleanName;
  return `${base}.${ext}`;
}

/**
 * Redimensiona proporcionalmente (máx. 1200px no maior lado, sem ampliar fotos menores)
 * e comprime para WebP (0.82) com fallback automático para JPEG (0.85).
 * Em caso de qualquer erro, devolve o arquivo original para não travar o upload.
 */
export async function compressImage(file: File, maxDimension = DEFAULT_MAX_DIMENSION): Promise<File> {
  if (typeof window === "undefined" || !file.type.startsWith("image/")) {
    return file;
  }

  let loaded: LoadedImage | undefined;
  try {
    loaded = await loadImage(file);
    const { source, width, height } = loaded;
    if (!width || !height) return file;

    const largestSide = Math.max(width, height);
    const scale = largestSide > maxDimension ? maxDimension / largestSide : 1;
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(source, 0, 0, targetWidth, targetHeight);

    const webpBlob = await canvasToBlob(canvas, "image/webp", WEBP_QUALITY);
    if (webpBlob && webpBlob.type === "image/webp") {
      return new File([webpBlob], replaceExtension(file.name, "webp"), {
        type: "image/webp",
        lastModified: Date.now(),
      });
    }

    const jpegBlob = await canvasToBlob(canvas, "image/jpeg", JPEG_QUALITY);
    if (jpegBlob) {
      return new File([jpegBlob], replaceExtension(file.name, "jpg"), {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
    }

    return file;
  } catch {
    return file;
  } finally {
    loaded?.cleanup();
  }
}
