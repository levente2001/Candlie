import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/api/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setStatus('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setStatus(err?.message || 'Sikertelen bejelentkezés.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--candlie-bg)] text-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-black/10 rounded-2xl p-6">
        <h1 className="text-2xl font-semibold mb-2">Admin bejelentkezés</h1>
        <p className="text-sm text-black/60 mb-6">Firebase email + jelszó.</p>

        <form onSubmit={submit} className="space-y-4">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-xl"
            placeholder="email@example.com"
            required
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 rounded-xl"
            placeholder="Jelszó"
            required
          />
          {status && <div className="text-sm text-red-600">{status}</div>}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[var(--candlie-pink-secondary)] hover:bg-[var(--candlie-pink-primary)] text-white font-semibold rounded-xl"
          >
            {loading ? 'Bejelentkezés...' : 'Bejelentkezés'}
          </Button>
        </form>
      </div>
    </div>
  );
}
