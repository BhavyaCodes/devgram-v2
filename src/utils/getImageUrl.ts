import { z } from 'zod';

/**
 *
 * @param url url or imageId
 * @returns url
 */
export const getImageUrl = (url: string | undefined): string => {
  if (!url) {
    return '';
  }

  if (z.string().url().safeParse(url).success) {
    return url;
  }

  return `${process.env.NEXT_PUBLIC_CLOUDINARY_DELIVERY_URL}/${url}`;
};
