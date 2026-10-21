/**
 * Turns a Google Drive share link into a direct image URL the <img> tag can display.
 * Works with:  https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 *              https://drive.google.com/open?id=FILE_ID
 *              https://drive.google.com/uc?export=view&id=FILE_ID
 * Any other URL is returned unchanged. The Drive file must be shared as
 * "Anyone with the link can view".
 */
export function toDriveImageUrl(url: string | null | undefined, width = 1000): string {
  if (!url) return '';
  if (!/^https?:\/\/(drive|docs)\.google\.com\//.test(url)) return url;
  const match = url.match(/\/d\/([\w-]+)/) || url.match(/[?&]id=([\w-]+)/);
  return match ? `https://lh3.googleusercontent.com/d/${match[1]}=w${width}` : url;
}
