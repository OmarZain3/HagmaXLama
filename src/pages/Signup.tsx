import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

export function Signup() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !teamName.trim() || !password) {
      setError('Enter name, team name and password');
      return;
    }
    const result = await register(name.trim(), teamName.trim(), password);
    if (result.success) navigate('/dashboard');
    else setError(result.error ?? 'Registration failed');
  };

  return (
    <div className="bg-pattern-1 bg-pattern-overlay mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 font-poppins">
      <img src="/Asset 6.png" alt="Hagma X Lamma Fantasy" className="mx-auto mb-4 h-24 w-auto max-w-[200px] object-contain" />
      <h1 className="mb-2 text-center text-3xl font-extrabold text-[#F8ECA7] md:text-4xl lg:text-5xl">
        Welcome to Hagma X Lamma Fantasy
      </h1>
      <p className="mb-2 mt-6 text-left text-lg font-semibold text-[#EECC4E]">Create you own fantasy team</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          autoComplete="name"
        />
        <Input
          label="Team name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Your fantasy team name"
          autoComplete="off"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
        />
        {error && <p className="text-sm text-[#A71F26]">{error}</p>}
        <Button type="submit" fullWidth loading={loading}>
          Create account
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-[#F8ECA7]">
        Already have an account?{' '}
        <Link to="/login" className="text-[#EECC4E] underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
