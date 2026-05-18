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
        <div className="flex items-center justify-center rounded-full p-6 bg-ricash-brand-bg">
          <FileQuestion className="size-16 text-ricash-brand" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-ricash-brand">
          Page introuvable
        </h1>

        {/* Description */}
        <p className="text-muted-foreground text-sm leading-relaxed">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>

        {/* Back to dashboard button */}
        <Button
          variant="primary" className="mt-2"
          onClick={() => navigate('dashboard')}
        >
          Retour au tableau de bord
        </Button>
      </div>
    </div>
  );
}
