import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Circle } from '@phosphor-icons/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useLabels } from '@/shared/hooks/useLabels';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLabels();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [, setFailCount] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => {
      setCooldown(c => {
        const next = c - 1;
        if (next <= 0) setFailCount(0);
        return next;
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;
    setError(null);
    setLoading(true);
    try {
      await login(password);
      navigate('/', { replace: true });
    } catch {
      setFailCount(prev => {
        const next = prev + 1;
        if (next >= 3) setCooldown(60);
        return next;
      });
      setError(t('auth.error.wrong_password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
            <Lock size={28} className="text-primary" />
          </div>
          <CardTitle className="text-white text-xl">{t('auth.title')}</CardTitle>
          <CardDescription className="text-white/60">
            {t('auth.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-white/80">
                {t('auth.password.label')}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
            </div>
            {cooldown > 0 && (
              <p role="alert" className="text-sm text-amber-400 bg-amber-500/10 rounded-md px-3 py-2">
                {t('auth.error.too_many_attempts')} {cooldown}s
              </p>
            )}
            {error && cooldown === 0 && (
              <p role="alert" className="text-sm text-red-400 bg-red-500/10 rounded-md px-3 py-2">
                {error}
              </p>
            )}
            <Button type="submit" disabled={loading || password.length === 0 || cooldown > 0} aria-busy={loading} className="w-full focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">
              {loading && <Circle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {loading ? t('auth.submit.loading') : t('auth.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
