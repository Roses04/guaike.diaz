/**
 * Utilidad de compresión y conversión de imágenes a WebP en el cliente.
 * 
 * Toma un objeto File, lo redimensiona si supera el ancho máximo
 * y lo convierte a formato image/webp con la calidad especificada.
 */
export const compressImageToWebP = (
  file: File,
  maxWidth: number = 1024,
  quality: number = 0.75
): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Si el navegador no soporta Canvas o FileReader, retornar el archivo original
    if (!window.CanvasRenderingContext2D || !window.FileReader) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Redimensionar proporcionalmente si supera el ancho máximo
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = img.height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(file);
        }

        // Dibujar imagen en el lienzo
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir lienzo a Blob en formato WebP
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }
            // Crear un nuevo objeto File a partir del Blob WebP
            const nameWithoutExtension = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
            const webpFile = new File([blob], `${nameWithoutExtension}.webp`, {
              type: "image/webp",
              lastModified: Date.now(),
            });
            resolve(webpFile);
          },
          "image/webp",
          quality
        );
      };
      img.onerror = (err) => {
        reject(err);
      };
    };
    reader.onerror = (err) => {
      reject(err);
    };
  });
};
