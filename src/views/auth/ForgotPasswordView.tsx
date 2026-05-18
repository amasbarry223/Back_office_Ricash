'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, Lock, Mail, Shield } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import AnimateIn from '@/components/common/AnimateIn';

type Step = 'email' | 'reset' | 'done';

interface ForgotPasswordViewProps {
  initialEmail?: string;
  onBackToLogin: () => void;
}

export default function ForgotPasswordView({ initialEmail = '', onBackToLogin }: ForgotPasswordViewProps) {
  const requestPasswordReset = useAuthStore((s) => s.requestPasswordReset);
  const confirmPasswordReset = useAuthStore((s) => s.confirmPasswordReset);
  const clearForgotPasswordFlow = useAuthStore((s) => s.clearForgotPasswordFlow);
  const forgotPasswordLoading = useAuthStore((s) => s.forgotPasswordLoading);
  const forgotPasswordError = useAuthStore((s) => s.forgotPasswordError);
  const passwordReset = useAuthStore((s) => s.passwordReset);

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const devResetCode =
    process.env.NODE_ENV === 'development' ? passwordReset?.code : undefined;

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await requestPasswordReset(email);
    if (ok) setStep('reset');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      useAuthStore.setState({
        forgotPasswordError: 'Les mots de passe ne correspondent pas.',
      });
      return;
    }

    const ok = await confirmPasswordReset(email, code, newPassword);
    if (ok) setStep('done');
  };

  const handleBack = () => {
    clearForgotPasswordFlow();
    onBackToLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 ricash-login-bg">
      <AnimateIn as="div" className="w-full max-w-md">
        <Card className="shadow-lg" style={{ boxShadow: 'var(--ricash-shadow-lg)' }}>
          <CardHeader className="text-center pb-2">
            <div className="flex flex-col items-center gap-1">
              <div className="flex size-12 items-center justify-center rounded-full bg-ricash-brand-bg mb-1">
                {step === 'done' ? (
                  <CheckCircle2 className="size-6 text-ricash-success" />
                ) : (
                  <KeyRound className="size-6 text-ricash-brand" />
                )}
              </div>
              <CardTitle className="text-xl font-bold text-ricash-brand">
                {step === 'email' && 'Mot de passe oublié'}
                {step === 'reset' && 'Nouveau mot de passe'}
                {step === 'done' && 'Mot de passe réinitialisé'}
              </CardTitle>
              <CardDescription className="text-sm">
                {step === 'email' &&
                  'Saisissez votre adresse email professionnelle. Un code de vérification vous sera envoyé.'}
                {step === 'reset' &&
                  `Un code a été envoyé à ${passwordReset?.email ?? email}. Saisissez-le ci-dessous avec votre nouveau mot de passe.`}
                {step === 'done' &&
                  'Votre mot de passe a été mis à jour. Vous pouvez vous connecter avec vos nouveaux identifiants.'}
              </CardDescription>
              <div className="w-12 h-1 rounded-full mx-auto mt-2 bg-ricash-accent" />
            </div>
          </CardHeader>

          <CardContent>
            {forgotPasswordError && (
              <div className="rounded-md bg-ricash-danger-bg border border-ricash-danger-border px-4 py-3 text-sm text-ricash-danger mb-5">
                {forgotPasswordError}
              </div>
            )}

            {step === 'email' && (
              <form onSubmit={handleRequestCode} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="reset-email">Adresse email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="exemple@ricash.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (forgotPasswordError) useAuthStore.setState({ forgotPasswordError: null });
                    }}
                    iconLeft={<Mail />}
                    required
                    autoComplete="email"
                    disabled={forgotPasswordLoading}
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full" disabled={forgotPasswordLoading}>
                  {forgotPasswordLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    'Envoyer le code'
                  )}
                </Button>

                <Button type="button" variant="ghost" className="w-full" onClick={handleBack}>
                  <ArrowLeft className="size-4" />
                  Retour à la connexion
                </Button>
              </form>
            )}

            {step === 'reset' && (
              <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
                {process.env.NODE_ENV === 'development' && devResetCode && (
                  <div className="rounded-md bg-ricash-info-bg border border-ricash-info/30 px-4 py-3 text-sm text-ricash-info">
                    <p className="font-semibold mb-1">Mode démo — code de vérification</p>
                    <p className="font-mono text-base tracking-widest">{devResetCode}</p>
                    <p className="text-xs mt-1 opacity-80">Valide 15 minutes (simulation sans envoi d&apos;email réel).</p>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <Label htmlFor="reset-code">Code de vérification (6 chiffres)</Label>
                  <Input
                    id="reset-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="000000"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                      if (forgotPasswordError) useAuthStore.setState({ forgotPasswordError: null });
                    }}
                    iconLeft={<Shield />}
                    required
                    disabled={forgotPasswordLoading}
                    className="font-mono tracking-widest"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Minimum 8 caractères"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    iconLeft={<Lock />}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    disabled={forgotPasswordLoading}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Retapez le mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    iconLeft={<Lock />}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    disabled={forgotPasswordLoading}
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full" disabled={forgotPasswordLoading}>
                  {forgotPasswordLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Réinitialisation...
                    </>
                  ) : (
                    'Réinitialiser le mot de passe'
                  )}
                </Button>

                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={forgotPasswordLoading}
                    onClick={() => {
                      setStep('email');
                      setCode('');
                      setNewPassword('');
                      setConfirmPassword('');
                      clearForgotPasswordFlow();
                    }}
                  >
                    Renvoyer un code
                  </Button>
                  <Button type="button" variant="ghost" className="w-full" onClick={handleBack}>
                    <ArrowLeft className="size-4" />
                    Retour à la connexion
                  </Button>
                </div>
              </form>
            )}

            {step === 'done' && (
              <div className="flex flex-col gap-5">
                <Button variant="primary" className="w-full" onClick={handleBack}>
                  Se connecter
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </AnimateIn>
    </div>
  );
}
