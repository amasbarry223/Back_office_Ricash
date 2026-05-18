'use client';

import React, { useState, useMemo } from 'react';
import {
  User,
  Shield,
  Bell,
  Palette,
  Server,
  Settings2,
  Users,
  SlidersHorizontal,
  Save,
  Loader2,
  Pencil,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Info,
  DollarSign,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PageHeader from '@/components/common/PageHeader';
import RoleGuard from '@/components/common/RoleGuard';
import { useRouterStore } from '@/stores/router-store';
import { useAuthStore } from '@/stores/auth-store';
import { useSettingsStore } from '@/stores/settings-store';
import { useConfigStore } from '@/stores/config-store';
import {
  TRANSACTION_TYPE_LABELS,
  COUNTRY_LABELS,
  OPERATOR_LABELS,
  type SettingsTab,
  type FeeConfig,
  type KycLimitConfig,
  type Operator,
} from '@/types';

// ---------------------------------------------------------------------------
// Tab definitions per role
// ---------------------------------------------------------------------------

interface SettingsTabDef {
  id: SettingsTab;
  label: string;
  icon: React.ElementType;
  roles: Array<'super_admin' | 'admin'>;
}

const SETTINGS_TABS: SettingsTabDef[] = [
  { id: 'profil', label: 'Mon profil', icon: User, roles: ['super_admin', 'admin'] },
  { id: 'securite', label: 'Sécurité', icon: Shield, roles: ['super_admin', 'admin'] },
  { id: 'notifications-prefs', label: 'Notifications', icon: Bell, roles: ['super_admin', 'admin'] },
  { id: 'apparence', label: 'Apparence', icon: Palette, roles: ['super_admin', 'admin'] },
  { id: 'systeme', label: 'Système', icon: Server, roles: ['super_admin'] },
  { id: 'configuration', label: 'Configuration', icon: Settings2, roles: ['super_admin'] },
  { id: 'mes-agents', label: 'Mes agents', icon: Users, roles: ['admin'] },
  { id: 'mes-limites', label: 'Mes limites', icon: SlidersHorizontal, roles: ['admin'] },
];

// ---------------------------------------------------------------------------
// SettingsView
// ---------------------------------------------------------------------------

export default function SettingsView() {
  const navigate = useRouterStore((s) => s.navigate);
  const user = useAuthStore((s) => s.user);
  const userRole = useAuthStore((s) => s.user?.role);

  const notificationsPrefs = useSettingsStore((s) => s.notifications);
  const updateNotifications = useSettingsStore((s) => s.updateNotifications);
  const appearance = useSettingsStore((s) => s.appearance);
  const updateAppearance = useSettingsStore((s) => s.updateAppearance);
  const system = useSettingsStore((s) => s.system);
  const updateSystem = useSettingsStore((s) => s.updateSystem);
  const adminAgent = useSettingsStore((s) => s.adminAgent);
  const updateAdminAgent = useSettingsStore((s) => s.updateAdminAgent);
  const adminLimits = useSettingsStore((s) => s.adminLimits);
  const updateAdminLimits = useSettingsStore((s) => s.updateAdminLimits);

  const fees = useConfigStore((s) => s.fees);
  const kycLimits = useConfigStore((s) => s.kycLimits);
  const general = useConfigStore((s) => s.general);
  const updateFee = useConfigStore((s) => s.updateFee);
  const updateKycLimit = useConfigStore((s) => s.updateKycLimit);
  const updateGeneral = useConfigStore((s) => s.updateGeneral);

  const [activeTab, setActiveTab] = useState<SettingsTab>('profil');

  // Profile editing
  const [profileEdits, setProfileEdits] = useState({ name: user?.name ?? '', email: user?.email ?? '', phone: '' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Security editing
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // System settings saving
  const [savingSystem, setSavingSystem] = useState(false);

  // Admin agent settings saving
  const [savingAdminAgent, setSavingAdminAgent] = useState(false);

  // Admin limits saving
  const [savingAdminLimits, setSavingAdminLimits] = useState(false);

  // General config overrides
  const [generalOverrides, setGeneralOverrides] = useState<{
    activeCountries: string[] | null;
    activeOperators: Operator[] | null;
  }>({ activeCountries: null, activeOperators: null });

  const generalEdits = useMemo(() => ({
    activeCountries: generalOverrides.activeCountries ?? [...general.activeCountries],
    activeOperators: generalOverrides.activeOperators ?? [...general.activeOperators],
  }), [generalOverrides, general.activeCountries, general.activeOperators]);

  // Fee editing
  const [editingFeeId, setEditingFeeId] = useState<string | null>(null);
  const [feeEdits, setFeeEdits] = useState<Partial<FeeConfig>>({});
  const [savingFeeId, setSavingFeeId] = useState<string | null>(null);

  // KYC limit editing
  const [editingKycLevel, setEditingKycLevel] = useState<number | null>(null);
  const [kycEdits, setKycEdits] = useState<Partial<KycLimitConfig>>({});
  const [savingKycLevel, setSavingKycLevel] = useState<number | null>(null);

  const [savingGeneral, setSavingGeneral] = useState(false);

  // Filter tabs by role
  const visibleTabs = useMemo(
    () => SETTINGS_TABS.filter((t) => userRole && t.roles.includes(userRole)),
    [userRole],
  );

  const formatNumber = (n: number) => n.toLocaleString('fr-FR');

  // ---- Handlers ----

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    await new Promise((r) => setTimeout(r, 800));
    setSavingProfile(false);
    setIsEditingProfile(false);
    toast.success('Profil mis à jour avec succès');
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (passwords.new.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    setSavingPassword(true);
    await new Promise((r) => setTimeout(r, 800));
    setSavingPassword(false);
    setPasswords({ current: '', new: '', confirm: '' });
    toast.success('Mot de passe modifié avec succès');
  };

  const handleSaveSystem = async () => {
    setSavingSystem(true);
    await new Promise((r) => setTimeout(r, 800));
    setSavingSystem(false);
    toast.success('Paramètres système mis à jour avec succès');
  };

  const handleSaveAdminAgent = async () => {
    setSavingAdminAgent(true);
    await new Promise((r) => setTimeout(r, 800));
    setSavingAdminAgent(false);
    toast.success('Paramètres agents mis à jour avec succès');
  };

  const handleSaveAdminLimits = async () => {
    setSavingAdminLimits(true);
    await new Promise((r) => setTimeout(r, 800));
    setSavingAdminLimits(false);
    toast.success('Limites mises à jour avec succès');
  };

  // Fee handlers
  const startEditFee = (fee: FeeConfig) => {
    setEditingFeeId(fee.id);
    setFeeEdits({ minAmount: fee.minAmount, maxAmount: fee.maxAmount, feePercent: fee.feePercent, fixedFee: fee.fixedFee });
  };
  const cancelEditFee = () => { setEditingFeeId(null); setFeeEdits({}); };
  const saveFee = async (feeId: string) => {
    setSavingFeeId(feeId);
    await new Promise((r) => setTimeout(r, 800));
    updateFee(feeId, feeEdits);
    setSavingFeeId(null);
    setEditingFeeId(null);
    setFeeEdits({});
    toast.success('Frais de service mis à jour');
  };

  // KYC handlers
  const startEditKyc = (limit: KycLimitConfig) => {
    setEditingKycLevel(limit.level);
    setKycEdits({ dailyLimit: limit.dailyLimit, monthlyLimit: limit.monthlyLimit, maxBalance: limit.maxBalance });
  };
  const cancelEditKyc = () => { setEditingKycLevel(null); setKycEdits({}); };
  const saveKyc = async (level: number) => {
    setSavingKycLevel(level);
    await new Promise((r) => setTimeout(r, 800));
    updateKycLimit(level, kycEdits);
    setSavingKycLevel(null);
    setEditingKycLevel(null);
    setKycEdits({});
    toast.success('Plafonds KYC mis à jour');
  };

  // General config handlers
  const toggleCountry = (code: string) => {
    const current = generalEdits.activeCountries;
    const updated = current.includes(code) ? current.filter((c) => c !== code) : [...current, code];
    setGeneralOverrides((prev) => ({ ...prev, activeCountries: updated }));
  };
  const toggleOperator = (op: Operator) => {
    const current = generalEdits.activeOperators;
    const updated = current.includes(op) ? current.filter((o) => o !== op) : [...current, op];
    setGeneralOverrides((prev) => ({ ...prev, activeOperators: updated }));
  };
  const saveGeneral = async () => {
    setSavingGeneral(true);
    await new Promise((r) => setTimeout(r, 800));
    updateGeneral({ activeCountries: generalEdits.activeCountries, activeOperators: generalEdits.activeOperators });
    setGeneralOverrides({ activeCountries: null, activeOperators: null });
    setSavingGeneral(false);
    toast.success('Paramètres généraux mis à jour');
  };

  // ---- Tab content renderer ----
  const renderTabContent = () => {
    switch (activeTab) {
      // ===================== PROFIL =====================
      case 'profil':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Informations personnelles</CardTitle>
                    <CardDescription>Gérer vos informations de profil</CardDescription>
                  </div>
                  {!isEditingProfile ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
                      <Pencil className="size-3.5 mr-1.5" /> Modifier
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-[var(--ricash-primary)] hover:bg-[var(--ricash-primary)]/90 text-white" disabled={savingProfile} onClick={handleSaveProfile}>
                        {savingProfile ? <Loader2 className="size-3.5 mr-1 animate-spin" /> : <Save className="size-3.5 mr-1" />}
                        Sauvegarder
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingProfile(false)} disabled={savingProfile}>
                        Annuler
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="profile-name">Nom complet</Label>
                    {isEditingProfile ? (
                      <Input id="profile-name" value={profileEdits.name} onChange={(e) => setProfileEdits((p) => ({ ...p, name: e.target.value }))} />
                    ) : (
                      <p className="text-sm font-medium py-2 px-3 rounded-md bg-muted/50">{user?.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-email">Adresse email</Label>
                    {isEditingProfile ? (
                      <Input id="profile-email" type="email" value={profileEdits.email} onChange={(e) => setProfileEdits((p) => ({ ...p, email: e.target.value }))} />
                    ) : (
                      <p className="text-sm font-medium py-2 px-3 rounded-md bg-muted/50">{user?.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-phone">Téléphone</Label>
                    {isEditingProfile ? (
                      <Input id="profile-phone" value={profileEdits.phone} onChange={(e) => setProfileEdits((p) => ({ ...p, phone: e.target.value }))} placeholder="+223 XX XX XX XX" />
                    ) : (
                      <p className="text-sm font-medium py-2 px-3 rounded-md bg-muted/50">{profileEdits.phone || 'Non renseigné'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Rôle</Label>
                    <div className="flex items-center gap-2 py-2">
                      <Badge className={userRole === 'super_admin' ? 'bg-[var(--ricash-primary)] text-white' : 'bg-[var(--ricash-accent)] text-white'}>
                        {userRole === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info banner */}
            <div className="flex items-start gap-3 p-4 rounded-lg border border-blue-200 bg-blue-50">
              <Info className="size-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Informations sur votre compte</p>
                <p className="text-xs text-blue-700 mt-1">
                  Votre identifiant : <span className="font-mono font-semibold">{user?.id}</span> · 
                  Connecté en tant que <span className="font-semibold">{userRole === 'super_admin' ? 'Super Admin' : 'Admin'}</span>
                </p>
              </div>
            </div>
          </div>
        );

      // ===================== SÉCURITÉ =====================
      case 'securite':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Changer le mot de passe</CardTitle>
                <CardDescription>Mettez à jour votre mot de passe pour sécuriser votre compte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-pwd">Mot de passe actuel</Label>
                  <div className="relative">
                    <Input
                      id="current-pwd"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwords.current}
                      onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                      placeholder="Entrez votre mot de passe actuel"
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                      {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="new-pwd">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="new-pwd"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwords.new}
                      onChange={(e) => setPasswords((p) => ({ ...p, new: e.target.value }))}
                      placeholder="Minimum 8 caractères"
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowNewPassword(!showNewPassword)}>
                      {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-pwd">Confirmer le nouveau mot de passe</Label>
                  <Input
                    id="confirm-pwd"
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                    placeholder="Retapez le nouveau mot de passe"
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <Button
                    className="bg-[var(--ricash-primary)] hover:bg-[var(--ricash-primary)]/90 text-white"
                    disabled={savingPassword || !passwords.current || !passwords.new || !passwords.confirm}
                    onClick={handleChangePassword}
                  >
                    {savingPassword ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Shield className="size-4 mr-1.5" />}
                    Changer le mot de passe
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Authentification à deux facteurs</CardTitle>
                    <CardDescription>Ajoutez une couche de sécurité supplémentaire à votre compte</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">Bientôt disponible</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-10 rounded-lg bg-[var(--ricash-primary)]/10">
                      <Shield className="size-5 text-[var(--ricash-primary)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">2FA via application</p>
                      <p className="text-xs text-muted-foreground">Utilisez Google Authenticator ou Authy</p>
                    </div>
                  </div>
                  <Switch disabled checked={false} />
                </div>
              </CardContent>
            </Card>

            {/* Role-specific security info */}
            <RoleGuard roles={['super_admin']}>
              <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50">
                <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Accès Super Admin</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Votre compte dispose d&apos;un accès complet à la plateforme. Toute modification de vos paramètres de sécurité est enregistrée dans le journal d&apos;audit.
                  </p>
                </div>
              </div>
            </RoleGuard>
          </div>
        );

      // ===================== NOTIFICATIONS =====================
      case 'notifications-prefs':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Canaux de notification</CardTitle>
                <CardDescription>Choisissez comment vous souhaitez recevoir les notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'emailNotifications' as const, label: 'Notifications par email', desc: 'Recevez les alertes par email' },
                  { key: 'pushNotifications' as const, label: 'Notifications push', desc: 'Notifications dans le navigateur' },
                  { key: 'inAppNotifications' as const, label: 'Notifications in-app', desc: 'Alertes dans l\'application' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-lg border bg-white">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={notificationsPrefs[item.key]}
                      onCheckedChange={(checked) => updateNotifications({ [item.key]: checked })}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Types d&apos;alertes</CardTitle>
                <CardDescription>Sélectionnez les types d&apos;alertes que vous souhaitez recevoir</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'fraudAlerts' as const, label: 'Alertes fraude', desc: 'Activités suspectes détectées', icon: AlertTriangle, color: 'text-red-500' },
                  { key: 'lowFloatAlerts' as const, label: 'Alertes float bas', desc: 'Quand le float d\'un agent est faible', icon: Info, color: 'text-orange-500' },
                  { key: 'kycExpiryAlerts' as const, label: 'Expiration KYC', desc: 'Documents KYC arrivant à expiration', icon: Shield, color: 'text-amber-500' },
                  { key: 'transactionAlerts' as const, label: 'Alertes transactions', desc: 'Transactions importantes ou inhabituelles', icon: Bell, color: 'text-[var(--ricash-primary)]' },
                  { key: 'systemAlerts' as const, label: 'Alertes système', desc: 'Maintenance, mises à jour et incidents', icon: Server, color: 'text-muted-foreground' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-lg border bg-white">
                      <div className="flex items-center gap-3">
                        <Icon className={`size-5 ${item.color}`} />
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                      <Switch
                        checked={notificationsPrefs[item.key]}
                        onCheckedChange={(checked) => updateNotifications({ [item.key]: checked })}
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        );

      // ===================== APPARENCE =====================
      case 'apparence':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Thème</CardTitle>
                <CardDescription>Choisissez l&apos;apparence de l&apos;interface</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { value: 'light' as const, label: 'Clair', desc: 'Thème lumineux par défaut' },
                    { value: 'dark' as const, label: 'Sombre', desc: 'Réduit la fatigue oculaire' },
                    { value: 'system' as const, label: 'Système', desc: 'S\'adapte aux paramètres système' },
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      type="button"
                      onClick={() => updateAppearance({ theme: theme.value })}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        appearance.theme === theme.value
                          ? 'border-[var(--ricash-primary)] bg-[var(--ricash-primary)]/5'
                          : 'border-border hover:border-[var(--ricash-primary)]/40'
                      }`}
                    >
                      <p className="text-sm font-semibold">{theme.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{theme.desc}</p>
                      {appearance.theme === theme.value && (
                        <CheckCircle2 className="size-4 text-[var(--ricash-primary)] mt-2" />
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Langue</CardTitle>
                <CardDescription>Langue de l&apos;interface</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={appearance.language} onValueChange={(v) => updateAppearance({ language: v as 'fr' | 'en' })}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mode d&apos;affichage</CardTitle>
                <CardDescription>Ajustez la densité de l&apos;affichage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-lg border bg-white">
                  <div>
                    <p className="text-sm font-medium">Mode compact</p>
                    <p className="text-xs text-muted-foreground">Réduit les espaces pour afficher plus de contenu</p>
                  </div>
                  <Switch
                    checked={appearance.compactMode}
                    onCheckedChange={(checked) => updateAppearance({ compactMode: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      // ===================== SYSTÈME (super_admin only) =====================
      case 'systeme':
        return (
          <div className="space-y-6">
            <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50">
              <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Zone Super Admin</p>
                <p className="text-xs text-amber-700 mt-1">
                  Ces paramètres affectent l&apos;ensemble de la plateforme. Toute modification est enregistrée dans le journal d&apos;audit.
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mode maintenance</CardTitle>
                <CardDescription>Activez le mode maintenance pour suspendre temporairement l&apos;accès à la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-lg border bg-white">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center size-10 rounded-lg ${system.maintenanceMode ? 'bg-red-100' : 'bg-green-100'}`}>
                      <Server className={`size-5 ${system.maintenanceMode ? 'text-red-600' : 'text-green-600'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {system.maintenanceMode ? 'Maintenance activée' : 'Plateforme active'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {system.maintenanceMode
                          ? 'Les utilisateurs ne peuvent pas accéder à la plateforme'
                          : 'La plateforme est accessible normalement'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={system.maintenanceMode}
                    onCheckedChange={(checked) => updateSystem({ maintenanceMode: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Paramètres de session</CardTitle>
                <CardDescription>Configurez les paramètres de connexion et de session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Durée de session (minutes)</Label>
                    <Input
                      type="number"
                      value={system.sessionTimeoutMinutes}
                      onChange={(e) => updateSystem({ sessionTimeoutMinutes: Number(e.target.value) })}
                      min={5}
                      max={120}
                    />
                    <p className="text-xs text-muted-foreground">Durée avant expiration de la session (5-120 min)</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Déconnexion automatique (minutes)</Label>
                    <Input
                      type="number"
                      value={system.autoLogoutMinutes}
                      onChange={(e) => updateSystem({ autoLogoutMinutes: Number(e.target.value) })}
                      min={5}
                      max={60}
                    />
                    <p className="text-xs text-muted-foreground">Inactivité avant déconnexion auto (5-60 min)</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Tentatives de connexion max</Label>
                    <Input
                      type="number"
                      value={system.maxLoginAttempts}
                      onChange={(e) => updateSystem({ maxLoginAttempts: Number(e.target.value) })}
                      min={3}
                      max={10}
                    />
                    <p className="text-xs text-muted-foreground">Verrouillage après X tentatives échouées</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Journal d&apos;audit</CardTitle>
                <CardDescription>Configuration du suivi des activités</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-white">
                  <div>
                    <p className="text-sm font-medium">Activer le journal d&apos;audit</p>
                    <p className="text-xs text-muted-foreground">Enregistrer toutes les actions dans le journal</p>
                  </div>
                  <Switch
                    checked={system.auditLogEnabled}
                    onCheckedChange={(checked) => updateSystem({ auditLogEnabled: checked })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rétention des journaux (jours)</Label>
                  <Input
                    type="number"
                    value={system.auditLogRetentionDays}
                    onChange={(e) => updateSystem({ auditLogRetentionDays: Number(e.target.value) })}
                    min={30}
                    max={365}
                  />
                  <p className="text-xs text-muted-foreground">Les entrées plus anciennes seront supprimées automatiquement (30-365 jours)</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                className="bg-[var(--ricash-primary)] hover:bg-[var(--ricash-primary)]/90 text-white"
                disabled={savingSystem}
                onClick={handleSaveSystem}
              >
                {savingSystem ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Save className="size-4 mr-1.5" />}
                Sauvegarder les paramètres système
              </Button>
            </div>
          </div>
        );

      // ===================== CONFIGURATION (super_admin only) =====================
      case 'configuration':
        return (
          <div className="space-y-6">
            <div className="flex items-start gap-3 p-4 rounded-lg border border-blue-200 bg-blue-50">
              <Info className="size-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Configuration plateforme</p>
                <p className="text-xs text-blue-700 mt-1">
                  Ces paramètres définissent les règles de fonctionnement de la plateforme Ricash. Ils s&apos;appliquent à tous les utilisateurs et agents.
                </p>
              </div>
            </div>

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
                                <Input type="number" value={feeEdits.minAmount ?? fee.minAmount} onChange={(e) => setFeeEdits((p) => ({ ...p, minAmount: Number(e.target.value) }))} className="h-8 w-28 text-right text-sm ml-auto" />
                              ) : formatNumber(fee.minAmount) + ' XOF'}
                            </TableCell>
                            <TableCell className="text-right">
                              {isEditing ? (
                                <Input type="number" value={feeEdits.maxAmount ?? fee.maxAmount} onChange={(e) => setFeeEdits((p) => ({ ...p, maxAmount: Number(e.target.value) }))} className="h-8 w-28 text-right text-sm ml-auto" />
                              ) : fee.maxAmount > 0 ? formatNumber(fee.maxAmount) + ' XOF' : '—'}
                            </TableCell>
                            <TableCell className="text-right">
                              {isEditing ? (
                                <Input type="number" step="0.1" value={feeEdits.feePercent ?? fee.feePercent} onChange={(e) => setFeeEdits((p) => ({ ...p, feePercent: Number(e.target.value) }))} className="h-8 w-20 text-right text-sm ml-auto" />
                              ) : `${fee.feePercent}%`}
                            </TableCell>
                            <TableCell className="text-right">
                              {isEditing ? (
                                <Input type="number" value={feeEdits.fixedFee ?? fee.fixedFee} onChange={(e) => setFeeEdits((p) => ({ ...p, fixedFee: Number(e.target.value) }))} className="h-8 w-24 text-right text-sm ml-auto" />
                              ) : fee.fixedFee > 0 ? formatNumber(fee.fixedFee) + ' XOF' : '—'}
                            </TableCell>
                            <TableCell className="text-right">
                              {isEditing ? (
                                <div className="flex items-center justify-end gap-1">
                                  <Button size="sm" className="h-7 text-xs bg-[var(--ricash-primary)] hover:bg-[var(--ricash-primary)]/90 text-white" disabled={isSaving} onClick={() => saveFee(fee.id)}>
                                    {isSaving ? <Loader2 className="size-3.5 mr-1 animate-spin" /> : <Save className="size-3.5 mr-1" />} Sauvegarder
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={cancelEditFee} disabled={isSaving}>Annuler</Button>
                                </div>
                              ) : (
                                <Button size="sm" variant="ghost" className="h-7 text-xs text-[var(--ricash-primary)] hover:text-[var(--ricash-primary)]/80" onClick={() => startEditFee(fee)}>
                                  <Pencil className="size-3.5 mr-1" /> Modifier
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
                            <TableCell><span className="font-semibold text-sm">Niveau {limit.level}</span></TableCell>
                            <TableCell className="text-sm text-muted-foreground">{limit.label}</TableCell>
                            <TableCell className="text-right">
                              {isEditing ? (
                                <Input type="number" value={kycEdits.dailyLimit ?? limit.dailyLimit} onChange={(e) => setKycEdits((p) => ({ ...p, dailyLimit: Number(e.target.value) }))} className="h-8 w-32 text-right text-sm ml-auto" />
                              ) : limit.dailyLimit > 0 ? formatNumber(limit.dailyLimit) + ' XOF' : '—'}
                            </TableCell>
                            <TableCell className="text-right">
                              {isEditing ? (
                                <Input type="number" value={kycEdits.monthlyLimit ?? limit.monthlyLimit} onChange={(e) => setKycEdits((p) => ({ ...p, monthlyLimit: Number(e.target.value) }))} className="h-8 w-32 text-right text-sm ml-auto" />
                              ) : limit.monthlyLimit > 0 ? formatNumber(limit.monthlyLimit) + ' XOF' : '—'}
                            </TableCell>
                            <TableCell className="text-right">
                              {isEditing ? (
                                <Input type="number" value={kycEdits.maxBalance ?? limit.maxBalance} onChange={(e) => setKycEdits((p) => ({ ...p, maxBalance: Number(e.target.value) }))} className="h-8 w-32 text-right text-sm ml-auto" />
                              ) : limit.maxBalance > 0 ? formatNumber(limit.maxBalance) + ' XOF' : '—'}
                            </TableCell>
                            <TableCell className="text-right">
                              {isEditing ? (
                                <div className="flex items-center justify-end gap-1">
                                  <Button size="sm" className="h-7 text-xs bg-[var(--ricash-primary)] hover:bg-[var(--ricash-primary)]/90 text-white" disabled={isSaving} onClick={() => saveKyc(limit.level)}>
                                    {isSaving ? <Loader2 className="size-3.5 mr-1 animate-spin" /> : <Save className="size-3.5 mr-1" />} Sauvegarder
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={cancelEditKyc} disabled={isSaving}>Annuler</Button>
                                </div>
                              ) : (
                                <Button size="sm" variant="ghost" className="h-7 text-xs text-[var(--ricash-primary)] hover:text-[var(--ricash-primary)]/80" onClick={() => startEditKyc(limit)}>
                                  <Pencil className="size-3.5 mr-1" /> Modifier
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
                    <Settings2 className="size-4 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Paramètres généraux</CardTitle>
                    <CardDescription>Configuration globale de la plateforme</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Label className="text-sm font-medium min-w-[140px]">Devise</Label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted text-sm font-medium">XOF</div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-3 block">Pays actifs</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {Object.entries(COUNTRY_LABELS).map(([code, label]) => (
                      <div key={code} className="flex items-center gap-2">
                        <Checkbox id={`country-${code}`} checked={generalEdits.activeCountries.includes(code)} onCheckedChange={() => toggleCountry(code)} />
                        <Label htmlFor={`country-${code}`} className="text-sm font-normal cursor-pointer">{label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-3 block">Opérateurs actifs</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {(Object.entries(OPERATOR_LABELS) as [Operator, string][]).map(([op, label]) => (
                      <div key={op} className="flex items-center gap-2">
                        <Checkbox id={`operator-${op}`} checked={generalEdits.activeOperators.includes(op)} onCheckedChange={() => toggleOperator(op)} />
                        <Label htmlFor={`operator-${op}`} className="text-sm font-normal cursor-pointer">{label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button className="bg-[var(--ricash-primary)] hover:bg-[var(--ricash-primary)]/90 text-white" disabled={savingGeneral} onClick={saveGeneral}>
                    {savingGeneral ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Save className="size-4 mr-1.5" />} Sauvegarder
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      // ===================== MES AGENTS (admin only) =====================
      case 'mes-agents':
        return (
          <div className="space-y-6">
            <div className="flex items-start gap-3 p-4 rounded-lg border border-blue-200 bg-blue-50">
              <Info className="size-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Paramètres agents</p>
                <p className="text-xs text-blue-700 mt-1">
                  Configurez vos préférences pour la gestion des agents sous votre responsabilité. Ces paramètres s&apos;appliquent uniquement à votre compte admin.
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Commission par défaut</CardTitle>
                <CardDescription>Taux de commission appliqué aux nouveaux agents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Taux de commission (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={adminAgent.defaultCommissionRate}
                    onChange={(e) => updateAdminAgent({ defaultCommissionRate: Number(e.target.value) })}
                    className="w-40"
                  />
                  <p className="text-xs text-muted-foreground">Ce taux sera proposé par défaut lors de la création d&apos;un nouvel agent</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Approvisionnement float</CardTitle>
                <CardDescription>Configuration de l&apos;approbation automatique des demandes de float</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-white">
                  <div>
                    <p className="text-sm font-medium">Approbation automatique</p>
                    <p className="text-xs text-muted-foreground">Approuver automatiquement les demandes de float en dessous du seuil</p>
                  </div>
                  <Switch
                    checked={adminAgent.autoApproveFloat}
                    onCheckedChange={(checked) => updateAdminAgent({ autoApproveFloat: checked })}
                  />
                </div>
                {adminAgent.autoApproveFloat && (
                  <div className="space-y-2">
                    <Label>Montant max d&apos;approbation auto (XOF)</Label>
                    <Input
                      type="number"
                      value={adminAgent.autoApproveMaxAmount}
                      onChange={(e) => updateAdminAgent({ autoApproveMaxAmount: Number(e.target.value) })}
                      className="w-48"
                    />
                    <p className="text-xs text-muted-foreground">Les demandes au-dessus de ce montant nécessiteront une approbation manuelle</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Seuil d&apos;alerte float bas (XOF)</Label>
                  <Input
                    type="number"
                    value={adminAgent.floatAlertThreshold}
                    onChange={(e) => updateAdminAgent({ floatAlertThreshold: Number(e.target.value) })}
                    className="w-48"
                  />
                  <p className="text-xs text-muted-foreground">Soyez alerté quand le float d&apos;un agent descend sous ce seuil</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notifications agents</CardTitle>
                <CardDescription>Alertes liées aux agents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-lg border bg-white">
                  <div>
                    <p className="text-sm font-medium">Notification nouveau agent</p>
                    <p className="text-xs text-muted-foreground">Recevoir une alerte quand un nouvel agent s&apos;inscrit</p>
                  </div>
                  <Switch
                    checked={adminAgent.notifyNewAgent}
                    onCheckedChange={(checked) => updateAdminAgent({ notifyNewAgent: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                className="bg-[var(--ricash-primary)] hover:bg-[var(--ricash-primary)]/90 text-white"
                disabled={savingAdminAgent}
                onClick={handleSaveAdminAgent}
              >
                {savingAdminAgent ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Save className="size-4 mr-1.5" />}
                Sauvegarder les paramètres agents
              </Button>
            </div>
          </div>
        );

      // ===================== MES LIMITES (admin only) =====================
      case 'mes-limites':
        return (
          <div className="space-y-6">
            <div className="flex items-start gap-3 p-4 rounded-lg border border-blue-200 bg-blue-50">
              <Info className="size-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Limites de transaction</p>
                <p className="text-xs text-blue-700 mt-1">
                  Configurez les montants maximum que vous pouvez approuver. Ces limites sont définies par le Super Admin et ne peuvent pas être dépassées.
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Limites d&apos;approbation</CardTitle>
                <CardDescription>Montants maximums pour vos approbations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Montant max par transaction (XOF)</Label>
                    <Input
                      type="number"
                      value={adminLimits.maxTransactionApproval}
                      onChange={(e) => updateAdminLimits({ maxTransactionApproval: Number(e.target.value) })}
                    />
                    <p className="text-xs text-muted-foreground">Montant maximum que vous pouvez approuver pour une seule transaction</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Plafond journalier d&apos;approbation (XOF)</Label>
                    <Input
                      type="number"
                      value={adminLimits.maxDailyApproval}
                      onChange={(e) => updateAdminLimits({ maxDailyApproval: Number(e.target.value) })}
                    />
                    <p className="text-xs text-muted-foreground">Montant total maximum que vous pouvez approuver par jour</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Montant max approbation float (XOF)</Label>
                    <Input
                      type="number"
                      value={adminLimits.maxFloatApproval}
                      onChange={(e) => updateAdminLimits({ maxFloatApproval: Number(e.target.value) })}
                    />
                    <p className="text-xs text-muted-foreground">Montant maximum pour l&apos;approbation de demandes de float</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Double approbation</CardTitle>
                <CardDescription>Exiger une seconde approbation pour les montants élevés</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-white">
                  <div>
                    <p className="text-sm font-medium">Exiger une double approbation</p>
                    <p className="text-xs text-muted-foreground">Demander une validation supplémentaire pour les montants importants</p>
                  </div>
                  <Switch
                    checked={adminLimits.requireSecondApproval}
                    onCheckedChange={(checked) => updateAdminLimits({ requireSecondApproval: checked })}
                  />
                </div>
                {adminLimits.requireSecondApproval && (
                  <div className="space-y-2">
                    <Label>Seuil de double approbation (XOF)</Label>
                    <Input
                      type="number"
                      value={adminLimits.secondApprovalThreshold}
                      onChange={(e) => updateAdminLimits({ secondApprovalThreshold: Number(e.target.value) })}
                      className="w-48"
                    />
                    <p className="text-xs text-muted-foreground">Au-dessus de ce montant, une seconde approbation sera requise</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current limits summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Résumé de vos limites</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-[var(--ricash-primary)]/5 border border-[var(--ricash-primary)]/20">
                    <p className="text-xs text-muted-foreground">Transaction max</p>
                    <p className="text-lg font-bold text-[var(--ricash-primary)]">{formatNumber(adminLimits.maxTransactionApproval)} XOF</p>
                  </div>
                  <div className="p-4 rounded-lg bg-[var(--ricash-accent)]/5 border border-[var(--ricash-accent)]/20">
                    <p className="text-xs text-muted-foreground">Plafond journalier</p>
                    <p className="text-lg font-bold text-[var(--ricash-accent)]">{formatNumber(adminLimits.maxDailyApproval)} XOF</p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-xs text-muted-foreground">Float max</p>
                    <p className="text-lg font-bold text-green-700">{formatNumber(adminLimits.maxFloatApproval)} XOF</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                className="bg-[var(--ricash-primary)] hover:bg-[var(--ricash-primary)]/90 text-white"
                disabled={savingAdminLimits}
                onClick={handleSaveAdminLimits}
              >
                {savingAdminLimits ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Save className="size-4 mr-1.5" />}
                Sauvegarder mes limites
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paramètres"
        subtitle={`Gérer vos préférences${userRole === 'super_admin' ? ' et la configuration plateforme' : ' et vos paramètres d\'agent'}`}
        breadcrumb={[
          { label: 'Tableau de bord', onClick: () => navigate('dashboard') },
          { label: 'Paramètres' },
        ]}
      />

      {/* Role badge */}
      <div className="flex items-center gap-2">
        <Badge className={userRole === 'super_admin' ? 'bg-[var(--ricash-primary)] text-white' : 'bg-[var(--ricash-accent)] text-white'}>
          {userRole === 'super_admin' ? 'Super Admin' : 'Admin'}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {userRole === 'super_admin'
            ? 'Accès complet à tous les paramètres'
            : 'Paramètres limités à votre périmètre'}
        </span>
      </div>

      {/* Layout: sidebar tabs + content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab sidebar */}
        <nav className="lg:w-56 shrink-0">
          <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[var(--ricash-primary)] text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <ChevronRight className="size-3.5 ml-auto hidden lg:block" />
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
