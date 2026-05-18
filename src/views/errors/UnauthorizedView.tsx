'use client';

import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouterStore } from '@/stores/router-store';

export default function UnauthorizedView() {
  const navigate = useRouterStore((s) => s.navigate);

  return (
    <div className="py-20 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-md">
        {/* Icon */}
        <div className="flex items-center justify-center rounded-full p-6 bg-ricash-danger-bg">
          <ShieldX className="size-16 text-ricash-danger" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-ricash-brand">
          Accès non autorisé
        </h1>

        {/* Description */}
        <p className="text-muted-foreground text-sm leading-relaxed">
          Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
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
