'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, Mail } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

export default function LoginView() {
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 ricash-login-bg">
      <Card className="w-full max-w-md shadow-lg" style={{ boxShadow: 'var(--ricash-shadow-lg)' }}>
        <CardHeader className="text-center pb-2">
          {/* Ricash Logo */}
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-4xl font-bold tracking-wider text-ricash-brand">
              RICASH
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              Back-Office v4.0
            </p>
            <div className="w-12 h-1 rounded-full mx-auto mt-2 bg-ricash-accent" />
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
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@ricash.com"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className="pl-9"
                  required
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="pl-9"
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Forgot password link */}
            <div className="flex justify-end">
              <span className="text-xs text-muted-foreground cursor-not-allowed select-none">
                Mot de passe oublié ?
              </span>
            </div>

            {/* Login button */}
            <Button
              type="submit"
              className="w-full h-10 text-white font-semibold bg-ricash-brand hover:bg-ricash-brand/90"
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
    </div>
  );
}
