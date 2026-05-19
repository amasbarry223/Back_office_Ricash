'use client';

import React from 'react';
import {
  Banknote,
  Check,
  Globe2,
  Loader2,
  MapPin,
  Radio,
  Save,
  Smartphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { COUNTRY_LABELS, OPERATOR_LABELS, type Operator } from '@/types';

function countryFlag(isoCode: string): string {
  return isoCode
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
}

const OPERATOR_STYLES: Record<
  Operator,
  { accent: string; ring: string; bg: string; initial: string }
> = {
  ORANGE_MONEY: {
    accent: 'text-orange-600',
    ring: 'ring-orange-500/40',
    bg: 'bg-orange-50',
    initial: 'OM',
  },
  MOOV: {
    accent: 'text-blue-600',
    ring: 'ring-blue-500/40',
    bg: 'bg-blue-50',
    initial: 'MV',
  },
  MTN: {
    accent: 'text-yellow-700',
    ring: 'ring-yellow-500/40',
    bg: 'bg-yellow-50',
    initial: 'MT',
  },
  WAVE: {
    accent: 'text-violet-600',
    ring: 'ring-violet-500/40',
    bg: 'bg-violet-50',
    initial: 'WV',
  },
  FREE_MONEY: {
    accent: 'text-rose-600',
    ring: 'ring-rose-500/40',
    bg: 'bg-rose-50',
    initial: 'FM',
  },
};

export interface GeneralPlatformSettingsProps {
  activeCountries: string[];
  activeOperators: Operator[];
  onToggleCountry: (code: string) => void;
  onToggleOperator: (op: Operator) => void;
  onSetCountries: (codes: string[]) => void;
  onSetOperators: (ops: Operator[]) => void;
  onSave: () => void;
  saving?: boolean;
  hasChanges?: boolean;
}

export default function GeneralPlatformSettings({
  activeCountries,
  activeOperators,
  onToggleCountry,
  onToggleOperator,
  onSetCountries,
  onSetOperators,
  onSave,
  saving = false,
  hasChanges = false,
}: GeneralPlatformSettingsProps) {
  const countryEntries = Object.entries(COUNTRY_LABELS);
  const operatorEntries = Object.entries(OPERATOR_LABELS) as [Operator, string][];
  const allCountryCodes = countryEntries.map(([code]) => code);
  const allOperators = operatorEntries.map(([op]) => op);

  const countriesCount = activeCountries.length;
  const operatorsCount = activeOperators.length;
  const allCountriesSelected = countriesCount === allCountryCodes.length;
  const allOperatorsSelected = operatorsCount === allOperators.length;

  return (
    <Card className="overflow-hidden border-border/80 shadow-sm">
      <CardHeader className="border-b bg-muted/20 pb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-ricash-brand/10 ring-1 ring-ricash-brand/20">
              <Globe2 className="size-5 text-ricash-brand" />
            </div>
            <div>
              <CardTitle className="text-lg">Paramètres généraux</CardTitle>
              <CardDescription className="mt-1 max-w-xl">
                Définissez la devise, les marchés et les opérateurs mobile money actifs sur la plateforme.
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Badge variant="outline" className="gap-1.5 bg-background">
              <MapPin className="size-3.5 text-ricash-brand" />
              {countriesCount} pays
            </Badge>
            <Badge variant="outline" className="gap-1.5 bg-background">
              <Radio className="size-3.5 text-ricash-accent" />
              {operatorsCount} opérateurs
            </Badge>
            {hasChanges && (
              <Badge variant="warning" className="animate-pulse">
                Modifications non enregistrées
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8 p-6">
        {/* Devise */}
        <section aria-labelledby="general-currency-heading">
          <div className="mb-3 flex items-center gap-2">
            <Banknote className="size-4 text-muted-foreground" />
            <h3 id="general-currency-heading" className="text-sm font-semibold text-foreground">
              Devise de référence
            </h3>
          </div>
          <div className="flex flex-col gap-3 rounded-xl border bg-gradient-to-br from-ricash-brand/5 via-background to-ricash-accent/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-ricash-brand text-lg font-bold text-white shadow-md shadow-ricash-brand/25">
                XOF
              </div>
              <div>
                <p className="font-semibold text-foreground">Franc CFA (BCEAO)</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Devise unique pour l&apos;ensemble de la zone UEMOA couverte par Ricash.
                </p>
              </div>
            </div>
            <Badge variant="outline" className="w-fit shrink-0 border-ricash-brand/30 text-ricash-brand">
              Verrouillée
            </Badge>
          </div>
        </section>

        <Separator />

        {/* Pays actifs */}
        <section aria-labelledby="general-countries-heading">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-ricash-brand" />
                <h3 id="general-countries-heading" className="text-sm font-semibold text-foreground">
                  Pays actifs
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Les utilisateurs et agents de ces pays peuvent utiliser la plateforme.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                disabled={allCountriesSelected}
                onClick={() => onSetCountries(allCountryCodes)}
              >
                Tout sélectionner
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                disabled={countriesCount === 0}
                onClick={() => onSetCountries([])}
              >
                Tout désélectionner
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {countryEntries.map(([code, label]) => {
              const selected = activeCountries.includes(code);
              return (
                <button
                  key={code}
                  type="button"
                  role="checkbox"
                  aria-checked={selected}
                  onClick={() => onToggleCountry(code)}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl border p-3 text-left transition-all',
                    'hover:border-ricash-brand/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ricash-brand/30',
                    selected
                      ? 'border-ricash-brand/50 bg-ricash-brand/5 shadow-sm ring-1 ring-ricash-brand/20'
                      : 'border-border bg-card hover:bg-muted/30',
                  )}
                >
                  <span className="text-2xl leading-none" aria-hidden>
                    {countryFlag(code)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{label}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">{code}</p>
                  </div>
                  <span
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                      selected
                        ? 'border-ricash-brand bg-ricash-brand text-white'
                        : 'border-muted-foreground/30 bg-background group-hover:border-ricash-brand/50',
                    )}
                  >
                    {selected && <Check className="size-3" strokeWidth={3} />}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <Separator />

        {/* Opérateurs actifs */}
        <section aria-labelledby="general-operators-heading">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Smartphone className="size-4 text-ricash-accent" />
                <h3 id="general-operators-heading" className="text-sm font-semibold text-foreground">
                  Opérateurs actifs
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Opérateurs mobile money disponibles pour les transactions sur la plateforme.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                disabled={allOperatorsSelected}
                onClick={() => onSetOperators(allOperators)}
              >
                Tout sélectionner
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                disabled={operatorsCount === 0}
                onClick={() => onSetOperators([])}
              >
                Tout désélectionner
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {operatorEntries.map(([op, label]) => {
              const selected = activeOperators.includes(op);
              const style = OPERATOR_STYLES[op];
              return (
                <button
                  key={op}
                  type="button"
                  role="checkbox"
                  aria-checked={selected}
                  onClick={() => onToggleOperator(op)}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl border p-4 text-left transition-all',
                    'hover:shadow-sm focus-visible:outline-none focus-visible:ring-2',
                    selected
                      ? cn('border-transparent shadow-sm ring-2', style.ring, style.bg)
                      : 'border-border bg-card hover:bg-muted/30 hover:border-border',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                      selected ? cn(style.bg, style.accent, 'ring-1 ring-inset', style.ring) : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {style.initial}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {selected ? 'Activé sur la plateforme' : 'Désactivé'}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                      selected
                        ? 'border-ricash-brand bg-ricash-brand text-white'
                        : 'border-muted-foreground/30 bg-background',
                    )}
                  >
                    {selected && <Check className="size-3" strokeWidth={3} />}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Barre d'actions */}
        <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {hasChanges
              ? 'Vous avez des modifications en attente. Enregistrez pour les appliquer à toute la plateforme.'
              : 'Tous les paramètres sont synchronisés avec la configuration active.'}
          </p>
          <Button variant="primary" disabled={saving || !hasChanges} onClick={onSave} className="shrink-0">
            {saving ? (
              <Loader2 className="size-4 mr-1.5 animate-spin" />
            ) : (
              <Save className="size-4 mr-1.5" />
            )}
            Enregistrer les paramètres
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
