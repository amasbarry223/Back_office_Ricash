'use client';

import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouterStore } from '@/stores/router-store';

export default function NotFoundView() {
  const navigate = useRouterStore((s) => s.navigate);

  return (
    <div className="py-20 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-md">
        {/* Icon */}
        <div
          className="flex items-center justify-center rounded-full p-6"
          style={{ backgroundColor: 'rgba(26, 60, 110, 0.1)' }}
        >
          <FileQuestion
            className="size-16"
            style={{ color: 'var(--ricash-primary)' }}
          />
        </div>

        {/* Title */}
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--ricash-primary)' }}
        >
          Page introuvable
        </h1>

        {/* Description */}
        <p className="text-muted-foreground text-sm leading-relaxed">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>

        {/* Back to dashboard button */}
        <Button
          className="mt-2 text-white font-semibold"
          style={{ backgroundColor: 'var(--ricash-primary)' }}
          onClick={() => navigate('dashboard')}
        >
          Retour au tableau de bord
        </Button>
      </div>
    </div>
  );
}
