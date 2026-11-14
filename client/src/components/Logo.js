import Link from "next/link";
import Image from "next/image";

// Horizontal lockup (monogram beside the wordmark) for headers; stacked for
// standalone spots like the footer, login and 404 pages. `light` swaps the
// grey ink for linen so it reads on the dark espresso footer.
const LOGOS = {
  horizontal: { src: "/brand/logo.png", width: 845, height: 120, className: "h-8 w-auto sm:h-10" },
  stacked: { src: "/brand/logo-stacked.png", width: 900, height: 388, className: "h-auto w-52" },
};

export default function Logo({ light = false, variant = "horizontal", className, priority = false }) {
  const logo = LOGOS[variant];
  const src = light ? logo.src.replace(".png", "-light.png") : logo.src;
  return (
    <Link href="/" className="inline-flex shrink-0" aria-label="Galela Okuhle Collection home">
      <Image
        src={src}
        alt="Galela Okuhle Collection"
        width={logo.width}
        height={logo.height}
        priority={priority}
        className={className || logo.className}
      />
    </Link>
  );
}
