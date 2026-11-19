const colorCache = new Map();

/**
 * Extracts the dominant/average color from an image URL using canvas.
 * Uses a caching mechanism to avoid re-extracting for the same URL.
 * 
 * @param {string} imageUrl The URL of the image
 * @returns {Promise<[number, number, number] | null>} [r, g, b] or null if failed
 */
export async function getDominantColor(imageUrl) {
  if (!imageUrl) return null;
  if (colorCache.has(imageUrl)) {
    return colorCache.get(imageUrl);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; 
    img.src = imageUrl + (imageUrl.includes('?') ? '&' : '?') + 'not-from-cache-please';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let r = 0, g = 0, b = 0, count = 0;
        
        // Sample pixels for performance (every 40th value = every 10th pixel)
        for (let i = 0; i < data.length; i += 40) {
          // ignore transparent pixels or pure black/white to get better colors
          if (data[i+3] > 0) {
            r += data[i];
            g += data[i+1];
            b += data[i+2];
            count++;
          }
        }
        
        if (count > 0) {
          r = Math.floor(r / count);
          g = Math.floor(g / count);
          b = Math.floor(b / count);
          const color = [r, g, b];
          colorCache.set(imageUrl, color);
          resolve(color);
        } else {
          resolve(null);
        }
      } catch (err) {
        console.error("Color extraction failed:", err);
        resolve(null);
      }
    };

    img.onerror = (err) => {
      console.error("Failed to load image for color extraction:", imageUrl);
      resolve(null);
    };
  });
}
