'use client';

import React, { useState } from 'react';
import { Save, Pencil, Loader2, DollarSign, ShieldCheck, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import PageHeader from '@/components/common/PageHeader';
import RoleGuard from '@/components/common/RoleGuard';
import { useRouterStore } from '@/stores/router-store';
import { useConfigStore } from '@/stores/config-store';
import {
  TRANSACTION_TYPE_LABELS,
  COUNTRY_LABELS,
  OPERATOR_LABELS,
  type FeeConfig,
  type KycLimitConfig,
  type Operator,
} from '@/types';

export default function ConfigView() {
  const { navigate } = useRouterStore();
  const { fees, kycLimits, general, updateFee, updateKycLimit, updateGeneral } = useConfigStore();

  // --- Fees editing state ---
  const [editingFeeId, setEditingFeeId] = useState<string | null>(null);
  const [feeEdits, setFeeEdits] = useState<Partial<FeeConfig>>({});
  const [savingFeeId, setSavingFeeId] = useState<string | null>(null);

  // --- KYC limits editing state ---
  const [editingKycLevel, setEditingKycLevel] = useState<number | null>(null);
  const [kycEdits, setKycEdits] = useState<Partial<KycLimitConfig>>({});
  const [savingKycLevel, setSavingKycLevel] = useState<number | null>(null);

  // --- General config state ---
  const [generalEdits, setGeneralEdits] = useState<{
    activeCountries: string[];
    activeOperators: Operator[];
  }>({
    activeCountries: [...general.activeCountries],
    activeOperators: [...general.activeOperators],
  });
  const [savingGeneral, setSavingGeneral] = useState(false);

  // === Fee handlers ===
  const startEditFee = (fee: FeeConfig) => {
    setEditingFeeId(fee.id);
    setFeeEdits({
      minAmount: fee.minAmount,
      maxAmount: fee.maxAmount,
      feePercent: fee.feePercent,
      fixedFee: fee.fixedFee,
    });
  };

  const cancelEditFee = () => {
    setEditingFeeId(null);
    setFeeEdits({});
  };

  const saveFee = async (feeId: string) => {
    setSavingFeeId(feeId);
    await new Promise((resolve) => setTimeout(resolve, 800));
    updateFee(feeId, feeEdits);
    setSavingFeeId(null);
    setEditingFeeId(null);
    setFeeEdits({});
    toast.success('Frais de service mis à jour avec succès');
  };

  // === KYC limit handlers ===
  const startEditKyc = (limit: KycLimitConfig) => {
    setEditingKycLevel(limit.level);
    setKycEdits({
      dailyLimit: limit.dailyLimit,
      monthlyLimit: limit.monthlyLimit,
      maxBalance: limit.maxBalance,
    });
  };

  const cancelEditKyc = () => {
    setEditingKycLevel(null);
    setKycEdits({});
  };

  const saveKyc = async (level: number) => {
    setSavingKycLevel(level);
    await new Promise((resolve) => setTimeout(resolve, 800));
    updateKycLimit(level, kycEdits);
    setSavingKycLevel(null);
    setEditingKycLevel(null);
    setKycEdits({});
    toast.success('Plafonds KYC mis à jour avec succès');
  };

  // === General config handlers ===
  const toggleCountry = (code: string) => {
    setGeneralEdits((prev) => {
      const countries = prev.activeCountries.includes(code)
        ? prev.activeCountries.filter((c) => c !== code)
        : [...prev.activeCountries, code];
      return { ...prev, activeCountries: countries };
    });
  };

  const toggleOperator = (op: Operator) => {
    setGeneralEdits((prev) => {
      const operators = prev.activeOperators.includes(op)
        ? prev.activeOperators.filter((o) => o !== op)
        : [...prev.activeOperators, op];
      return { ...prev, activeOperators: operators };
    });
  };

  const saveGeneral = async () => {
    setSavingGeneral(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    updateGeneral({
      activeCountries: generalEdits.activeCountries,
      activeOperators: generalEdits.activeOperators,
    });
    setSavingGeneral(false);
    toast.success('Paramètres généraux mis à jour avec succès');
  };

  const formatNumber = (n: number) => n.toLocaleString('fr-FR');

  return (
    <RoleGuard
      roles={['super_admin']}
      fallback={
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Accès non autorisé</p>
        </div>
      }
    >
      <div className="space-y-6">
        <PageHeader
          title="Configuration"
          subtitle="Paramètres de la plateforme Ricash"
          breadcrumb={[
            { label: 'Tableau de bord', onClick: () => navigate('dashboard') },
            { label: 'Configuration' },
          ]}
        />

        {/* Section 1 — Frais de service */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-8 rounded-lg bg-[var(--ricash-accent)]/10">
                <DollarSign className="size-4 text-[var(--ricash-accent)]" />
              </div>
              <div>
                <CardTitle className="text-lg">Frais de service</CardTitle>
                <CardDescription>Configurer les frais appliqués aux opérations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead>Type d&apos;opération</TableHead>
                    <TableHead className="text-right">Montant min</TableHead>
                    <TableHead className="text-right">Montant max</TableHead>
                    <TableHead className="text-right">% frais</TableHead>
                    <TableHead className="text-right">Frais fixe</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fees.map((fee) => {
                    const isEditing = editingFeeId === fee.id;
                    const isSaving = savingFeeId === fee.id;

                    return (
                      <TableRow key={fee.id}>
                        <TableCell className="font-medium text-sm">
                          {TRANSACTION_TYPE_LABELS[fee.operationType] ?? fee.operationType}
                        </TableCell>
                        <TableCell className="text-right">
                          {isEditing ? (
                            <Input
                              type="number"
                              value={feeEdits.minAmount ?? fee.minAmount}
                              onChange={(e) =>
                                setFeeEdits((prev) => ({
                                  ...prev,
                                  minAmount: Number(e.target.value),
                                }))
                              }
                              className="h-8 w-28 text-right text-sm ml-auto"
                            />
                          ) : (
                            formatNumber(fee.minAmount) + ' XOF'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isEditing ? (
                            <Input
                              type="number"
                              value={feeEdits.maxAmount ?? fee.maxAmount}
                              onChange={(e) =>
                                setFeeEdits((prev) => ({
                                  ...prev,
                                  maxAmount: Number(e.target.value),
                                }))
                              }
                              className="h-8 w-28 text-right text-sm ml-auto"
                            />
                          ) : (
                            fee.maxAmount > 0 ? formatNumber(fee.maxAmount) + ' XOF' : '—'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isEditing ? (
                            <Input
                              type="number"
                              step="0.1"
                              value={feeEdits.feePercent ?? fee.feePercent}
                              onChange={(e) =>
                                setFeeEdits((prev) => ({
                                  ...prev,
                                  feePercent: Number(e.target.value),
                                }))
                              }
                              className="h-8 w-20 text-right text-sm ml-auto"
                            />
                          ) : (
                            `${fee.feePercent}%`
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isEditing ? (
                            <Input
                              type="number"
                              value={feeEdits.fixedFee ?? fee.fixedFee}
                              onChange={(e) =>
                                setFeeEdits((prev) => ({
                                  ...prev,
                                  fixedFee: Number(e.target.value),
                                }))
                              }
                              className="h-8 w-24 text-right text-sm ml-auto"
                            />
                          ) : (
                            fee.fixedFee > 0 ? formatNumber(fee.fixedFee) + ' XOF' : '—'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                className="h-7 text-xs bg-[var(--ricash-primary)] hover:bg-[var(--ricash-primary)]/90 text-white"
                                disabled={isSaving}
                                onClick={() => saveFee(fee.id)}
                              >
                                {isSaving ? (
                                  <Loader2 className="size-3.5 mr-1 animate-spin" />
                                ) : (
                                  <Save className="size-3.5 mr-1" />
                                )}
                                Sauvegarder
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs"
                                onClick={cancelEditFee}
                                disabled={isSaving}
                              >
                                Annuler
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-[var(--ricash-primary)] hover:text-[var(--ricash-primary)]/80"
                              onClick={() => startEditFee(fee)}
                            >
                              <Pencil className="size-3.5 mr-1" />
                              Modifier
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Section 2 — Plafonds KYC */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-8 rounded-lg bg-[var(--ricash-primary)]/10">
                <ShieldCheck className="size-4 text-[var(--ricash-primary)]" />
              </div>
              <div>
                <CardTitle className="text-lg">Plafonds KYC</CardTitle>
                <CardDescription>Configurer les limites par niveau de vérification</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead>Niveau</TableHead>
                    <TableHead>Libellé</TableHead>
                    <TableHead className="text-right">Limite journalière</TableHead>
                    <TableHead className="text-right">Limite mensuelle</TableHead>
                    <TableHead className="text-right">Solde max</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kycLimits.map((limit) => {
                    const isEditing = editingKycLevel === limit.level;
                    const isSaving = savingKycLevel === limit.level;

                    return (
                      <TableRow key={limit.level}>
                        <TableCell>
                          <span className="font-semibold text-sm">Niveau {limit.level}</span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {limit.label}
                        </TableCell>
                        <TableCell className="text-right">
                          {isEditing ? (
                            <Input
                              type="number"
                              value={kycEdits.dailyLimit ?? limit.dailyLimit}
                              onChange={(e) =>
                                setKycEdits((prev) => ({
                                  ...prev,
                                  dailyLimit: Number(e.target.value),
                                }))
                              }
                              className="h-8 w-32 text-right text-sm ml-auto"
                            />
                          ) : (
                            limit.dailyLimit > 0
                              ? formatNumber(limit.dailyLimit) + ' XOF'
                              : '—'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isEditing ? (
                            <Input
                              type="number"
                              value={kycEdits.monthlyLimit ?? limit.monthlyLimit}
                              onChange={(e) =>
                                setKycEdits((prev) => ({
                                  ...prev,
                                  monthlyLimit: Number(e.target.value),
                                }))
                              }
                              className="h-8 w-32 text-right text-sm ml-auto"
                            />
                          ) : (
                            limit.monthlyLimit > 0
                              ? formatNumber(limit.monthlyLimit) + ' XOF'
                              : '—'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isEditing ? (
                            <Input
                              type="number"
                              value={kycEdits.maxBalance ?? limit.maxBalance}
                              onChange={(e) =>
                                setKycEdits((prev) => ({
                                  ...prev,
                                  maxBalance: Number(e.target.value),
                                }))
                              }
                              className="h-8 w-32 text-right text-sm ml-auto"
                            />
                          ) : (
                            limit.maxBalance > 0
                              ? formatNumber(limit.maxBalance) + ' XOF'
                              : '—'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                className="h-7 text-xs bg-[var(--ricash-primary)] hover:bg-[var(--ricash-primary)]/90 text-white"
                                disabled={isSaving}
                                onClick={() => saveKyc(limit.level)}
                              >
                                {isSaving ? (
                                  <Loader2 className="size-3.5 mr-1 animate-spin" />
                                ) : (
                                  <Save className="size-3.5 mr-1" />
                                )}
                                Sauvegarder
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs"
                                onClick={cancelEditKyc}
                                disabled={isSaving}
                              >
                                Annuler
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-[var(--ricash-primary)] hover:text-[var(--ricash-primary)]/80"
                              onClick={() => startEditKyc(limit)}
                            >
                              <Pencil className="size-3.5 mr-1" />
                              Modifier
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Section 3 — Paramètres généraux */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-8 rounded-lg bg-amber-100">
                <Settings className="size-4 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Paramètres généraux</CardTitle>
                <CardDescription>Configuration globale de la plateforme</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Devise */}
            <div className="flex items-center gap-4">
              <Label className="text-sm font-medium min-w-[140px]">Devise</Label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted text-sm font-medium">
                XOF
              </div>
            </div>

            {/* Pays actifs */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Pays actifs</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Object.entries(COUNTRY_LABELS).map(([code, label]) => (
                  <div key={code} className="flex items-center gap-2">
                    <Checkbox
                      id={`country-${code}`}
                      checked={generalEdits.activeCountries.includes(code)}
                      onCheckedChange={() => toggleCountry(code)}
                    />
                    <Label
                      htmlFor={`country-${code}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Opérateurs actifs */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Opérateurs actifs</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {(Object.entries(OPERATOR_LABELS) as [Operator, string][]).map(
                  ([op, label]) => (
                    <div key={op} className="flex items-center gap-2">
                      <Checkbox
                        id={`operator-${op}`}
                        checked={generalEdits.activeOperators.includes(op)}
                        onCheckedChange={() => toggleOperator(op)}
                      />
                      <Label
                        htmlFor={`operator-${op}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {label}
                      </Label>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Save button */}
            <div className="flex justify-end pt-2">
              <Button
                className="bg-[var(--ricash-primary)] hover:bg-[var(--ricash-primary)]/90 text-white"
                disabled={savingGeneral}
                onClick={saveGeneral}
              >
                {savingGeneral ? (
                  <Loader2 className="size-4 mr-1.5 animate-spin" />
                ) : (
                  <Save className="size-4 mr-1.5" />
                )}
                Sauvegarder
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
