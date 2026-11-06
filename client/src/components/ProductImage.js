import Image from "next/image";

/** next/image wrapper that works for both local /products/* paths and Cloudinary URLs. */
export default function ProductImage({ src, alt, className = "", sizes = "(max-width: 768px) 50vw, 25vw", priority }) {
  if (!src) {
    return <div className={`flex items-center justify-center bg-sand text-xs text-muted ${className}`}>No image</div>;
  }
  return (
    <div className={`relative overflow-hidden bg-sand ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  );
}
