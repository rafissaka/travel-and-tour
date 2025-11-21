export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  // Check if it's a Cloudinary URL
  if (src.includes('res.cloudinary.com')) {
    // Extract the Cloudinary URL parts
    const params = [`w_${width}`, `q_${quality || 75}`, 'f_auto'];
    const paramsString = params.join(',');

    // Insert transformation parameters into the Cloudinary URL
    return src.replace('/upload/', `/upload/${paramsString}/`);
  }

  // For non-Cloudinary URLs, return as-is
  return src;
}
