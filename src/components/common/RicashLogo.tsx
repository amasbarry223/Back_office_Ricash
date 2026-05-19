import Image from 'next/image';
import { cn } from '@/lib/utils';

const LOGO_SRC = '/ricash-logo.png';

const VARIANTS = {
  full: { width: 280, height: 142, className: 'h-auto w-[min(280px,85vw)]' },
  sidebar: { width: 168, height: 86, className: 'h-12 w-auto' },
  compact: { width: 44, height: 22, className: 'h-10 w-auto object-contain object-center' },
} as const;

type RicashLogoVariant = keyof typeof VARIANTS;

interface RicashLogoProps {
  variant?: RicashLogoVariant;
  className?: string;
  priority?: boolean;
}

export default function RicashLogo({
  variant = 'full',
  className,
  priority = false,
}: RicashLogoProps) {
  const { width, height, className: sizeClass } = VARIANTS[variant];

  return (
    <Image
      src={LOGO_SRC}
      alt="Ricash — Transfert d'argent"
      width={width}
      height={height}
      className={cn(sizeClass, className)}
      priority={priority}
    />
  );
}
