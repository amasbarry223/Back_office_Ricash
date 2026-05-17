'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  IdCard,
  User,
  ShieldCheck,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  ZoomIn,
  ZoomOut,
  Download,
  Clock,
  MessageSquare,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import StatusBadge from '@/components/common/StatusBadge';
import RoleGuard from '@/components/common/RoleGuard';
import PageHeader from '@/components/common/PageHeader';
import { useRouterStore, buildBreadcrumb } from '@/stores/router-store';
import { useAuthStore } from '@/stores/auth-store';
import { useKycStore } from '@/stores/kyc-store';
import {
  KYC_STATUS_LABELS,
  DOCUMENT_TYPE_LABELS,
  type KycLevel,
  type DocumentType,
} from '@/types';
import { toast } from 'sonner';

// Format date
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// KYC Level badge colors
const KYC_LEVEL_COLORS: Record<number, string> = {
  0: 'bg-gray-100 text-gray-600 border-gray-200',
  1: 'bg-sky-50 text-sky-700 border-sky-200',
  2: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  3: 'bg-violet-50 text-violet-700 border-violet-200',
};

export default function KycDetailView() {
  const params = useRouterStore((s) => s.params);
  const navigate = useRouterStore((s) => s.navigate);
  const goBack = useRouterStore((s) => s.goBack);
  const getRecordById = useKycStore((s) => s.getRecordById);
  const approveKyc = useKycStore((s) => s.approveKyc);
  const rejectKyc = useKycStore((s) => s.rejectKyc);
  const user = useAuthStore((s) => s.user);

  const [zoom, setZoom] = useState(1);
  const [rejectComment, setRejectComment] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const record = useMemo(() => {
    const id = params.id;
    return id ? getRecordById(id) : undefined;
  }, [params.id, getRecordById]);

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground text-lg">Dossier KYC introuvable</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('kyc')}>
          <ArrowLeft className="size-4 mr-2" />
          Retour à KYC
        </Button>
      </div>
    );
  }

  const handleApprove = async () => {
    if (!user) return;
    setIsApproving(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      approveKyc(record.id, user.id);
      toast.success('Dossier KYC approuvé avec succès');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!user) return;
    if (!rejectComment.trim()) {
      toast.error('Veuillez saisir un commentaire de rejet');
      return;
    }
    setIsRejecting(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      rejectKyc(record.id, user.id, rejectComment.trim());
      toast.error('Dossier KYC rejeté');
      setShowRejectForm(false);
      setRejectComment('');
    } finally {
      setIsRejecting(false);
    }
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleZoomReset = () => setZoom(1);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`Dossier KYC — ${record.clientName}`}
        breadcrumb={[
          {
            label: 'KYC & Conformité',
            onClick: () => navigate('kyc', {}, buildBreadcrumb([{ label: 'KYC & Conformité' }])),
          },
          { label: `Dossier ${record.clientName}` },
        ]}
      >
        <Button variant="outline" size="sm" onClick={goBack} className="gap-1.5">
          <ArrowLeft className="size-4" />
          Retour
        </Button>
      </PageHeader>

      {/* Two-column layout — 40/60 split */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column — 40% */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Info Card */}
          <Card className="ricash-card-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="size-4 text-[var(--ricash-primary)]" />
                Informations client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Nom</p>
                <p className="text-sm font-medium">{record.clientName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Téléphone</p>
                <p className="text-sm font-medium">{record.clientPhone}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ID Client</p>
                <p className="text-sm font-mono text-muted-foreground">{record.clientId}</p>
              </div>
              <Separator />
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Niveau KYC actuel</p>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium ${KYC_LEVEL_COLORS[record.currentLevel] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}
                  >
                    Niveau {record.currentLevel}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Statut KYC</p>
                  <StatusBadge status={record.status} type="kyc" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Card */}
          <Card className="ricash-card-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="size-4 text-[var(--ricash-accent)]" />
                Vérification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Type de document</p>
                <p className="text-sm font-medium">
                  {DOCUMENT_TYPE_LABELS[record.documentType] ?? record.documentType}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date de soumission</p>
                <p className="text-sm font-medium">{formatDate(record.submittedAt)}</p>
              </div>

              {record.smileIdentityResult && (
                <div>
                  <p className="text-xs text-muted-foreground">Résultat Smile Identity</p>
                  <span
                    className={`inline-flex items-center gap-1 text-sm font-medium ${record.smileIdentityResult === 'PASS' ? 'text-emerald-600' : 'text-red-600'}`}
                  >
                    {record.smileIdentityResult === 'PASS' ? (
                      <CheckCircle className="size-4" />
                    ) : (
                      <XCircle className="size-4" />
                    )}
                    {record.smileIdentityResult === 'PASS' ? 'Conforme' : 'Non conforme'}
                  </span>
                </div>
              )}

              {record.verifiedBy && (
                <div>
                  <p className="text-xs text-muted-foreground">Vérifié par</p>
                  <p className="text-sm font-medium">{record.verifiedBy}</p>
                </div>
              )}

              {record.verifiedAt && (
                <div>
                  <p className="text-xs text-muted-foreground">Date de vérification</p>
                  <p className="text-sm font-medium">{formatDateTime(record.verifiedAt)}</p>
                </div>
              )}

              {record.comment && (
                <div>
                  <p className="text-xs text-muted-foreground">Commentaire</p>
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-100">
                    {record.comment}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions Card */}
          {record.status === 'PENDING' && (
            <RoleGuard roles={['super_admin', 'admin']}>
              <Card className="ricash-card-shadow border-l-4 border-l-orange-400">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="size-4 text-orange-500" />
                    Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    size="sm"
                    className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleApprove}
                    disabled={isApproving}
                  >
                    {isApproving ? (
                      <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                    Approuver
                  </Button>

                  {!showRejectForm ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => setShowRejectForm(true)}
                    >
                      <XCircle className="size-4" />
                      Rejeter
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Commentaire de rejet…"
                        value={rejectComment}
                        onChange={(e) => setRejectComment(e.target.value)}
                        className="min-h-[80px] text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                          onClick={handleReject}
                          disabled={isRejecting || !rejectComment.trim()}
                        >
                          {isRejecting ? (
                            <div className="size-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <XCircle className="size-4 mr-1" />
                          )}
                          Confirmer le rejet
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowRejectForm(false);
                            setRejectComment('');
                          }}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </RoleGuard>
          )}
        </div>

        {/* Right column — 60% */}
        <div className="lg:col-span-3 space-y-6">
          {/* Document Card */}
          <Card className="ricash-card-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <IdCard className="size-4 text-[var(--ricash-primary)]" />
                Document
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Large document preview area */}
              <div
                className="relative flex items-center justify-center rounded-xl overflow-hidden border border-gray-200"
                style={{
                  minHeight: '400px',
                  backgroundColor: '#f5f5f5',
                }}
              >
                <div
                  className="flex flex-col items-center justify-center transition-transform duration-200"
                  style={{ transform: `scale(${zoom})` }}
                >
                  <IdCard className="size-24 text-gray-300 mb-3" />
                  <p className="text-gray-400 text-sm font-medium">Aperçu du document</p>
                  <p className="text-gray-300 text-xs mt-1">
                    {DOCUMENT_TYPE_LABELS[record.documentType] ?? record.documentType}
                  </p>
                </div>
              </div>

              {/* Zoom controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.5}
                    title="Zoom arrière"
                  >
                    <ZoomOut className="size-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground w-14 text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                    title="Zoom avant"
                  >
                    <ZoomIn className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={handleZoomReset}
                  >
                    Réinitialiser
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  disabled
                  title="Téléchargement non disponible en mode démo"
                >
                  <Download className="size-4" />
                  Télécharger
                </Button>
              </div>

              <Separator />

              {/* Document info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Type de document</p>
                  <p className="text-sm font-medium">
                    {DOCUMENT_TYPE_LABELS[record.documentType] ?? record.documentType}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Date de soumission</p>
                    <p className="text-sm font-medium">{formatDate(record.submittedAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
