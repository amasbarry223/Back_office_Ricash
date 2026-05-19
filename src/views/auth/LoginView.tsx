'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, Mail } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import AnimateIn from '@/components/common/AnimateIn';
import RicashLogo from '@/components/common/RicashLogo';
import ForgotPasswordView from '@/views/auth/ForgotPasswordView';

export default function LoginView() {
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Clear error when user types
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (error) clearError();
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  if (showForgotPassword) {
    return (
      <ForgotPasswordView
        initialEmail={email}
        onBackToLogin={() => setShowForgotPassword(false)}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 ricash-login-bg">
      <AnimateIn as="div" className="w-full max-w-md">
      <Card className="shadow-lg" style={{ boxShadow: 'var(--ricash-shadow-lg)' }}>
        <CardHeader className="text-center pb-2">
          <div className="flex flex-col items-center gap-2">
            <RicashLogo variant="full" priority />
            <p className="text-sm text-muted-foreground font-medium">
              Back-Office v4.0
            </p>
            <div className="w-12 h-1 rounded-full mx-auto mt-1 bg-ricash-accent" />
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Error message */}
            {error && (
              <div className="rounded-md bg-ricash-danger-bg border border-ricash-danger-border px-4 py-3 text-sm text-ricash-danger">
                {error}
              </div>
            )}

            {/* Email field */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemple@ricash.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                iconLeft={<Mail />}
                required
                autoComplete="email"
                disabled={isLoading}
              />
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                iconLeft={<Lock />}
                required
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs text-ricash-brand hover:underline font-medium"
                onClick={() => setShowForgotPassword(true)}
                disabled={isLoading}
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Login button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>

          {/* Demo accounts — only shown in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 pt-5 border-t">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Comptes de démonstration
              </p>
              <div className="flex flex-col gap-2">
                <div className="rounded-md bg-ricash-brand-bg px-3 py-2">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-ricash-brand">
                      Super Admin
                    </span>
                    <br />
                    superadmin@ricash.com / ricash2025
                  </p>
                </div>
                <div className="rounded-md bg-ricash-brand-bg px-3 py-2">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-ricash-brand">
                      Admin
                    </span>
                    <br />
                    admin@ricash.com / ricash2025
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </AnimateIn>
    </div>
  );
}
