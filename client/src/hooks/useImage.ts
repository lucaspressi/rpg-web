import { useState, useEffect } from 'react';

/**
 * Hook to load an image and return it when ready
 * @param src - Image source URL
 * @returns HTMLImageElement | null (null while loading)
 */
export function useImage(src: string): HTMLImageElement | null {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImage(img);
    };

    img.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      setImage(null);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return image;
}

/**
 * Hook to load multiple images and return them when all are ready
 * @param sources - Object with image keys and their source URLs
 * @returns Object with same keys containing HTMLImageElement | null
 */
export function useImages<T extends Record<string, string>>(
  sources: T
): Record<keyof T, HTMLImageElement | null> {
  const [images, setImages] = useState<Record<keyof T, HTMLImageElement | null>>(() => {
    const initial: any = {};
    Object.keys(sources).forEach(key => {
      initial[key] = null;
    });
    return initial;
  });

  useEffect(() => {
    const loadedImages: Record<string, HTMLImageElement> = {};
    let loadedCount = 0;
    const totalCount = Object.keys(sources).length;

    Object.entries(sources).forEach(([key, src]) => {
      const img = new Image();
      img.src = src as string;

      img.onload = () => {
        loadedImages[key] = img;
        loadedCount++;

        if (loadedCount === totalCount) {
          setImages(loadedImages as any);
        }
      };

      img.onerror = () => {
        console.error(`Failed to load image: ${key} (${src})`);
        loadedCount++;

        if (loadedCount === totalCount) {
          setImages(prev => ({ ...prev, [key]: null }));
        }
      };
    });
  }, [JSON.stringify(sources)]);

  return images;
}
