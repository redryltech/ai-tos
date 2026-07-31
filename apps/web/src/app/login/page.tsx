'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@ai-tos/ui';
import { Header } from '@/components/Header';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { register, handleSubmit, formState } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (values: LoginValues) => {
    // Phase 0: UI shell only. No auth logic implemented.
    console.log('login submitted (no-op in Phase 0)', values.email);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center p-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-sm rounded-md border border-white/10 bg-bg-surface p-6"
        >
          <h1 className="mb-4 text-lg font-semibold text-text-primary">Sign in</h1>
          <label className="mb-1 block text-sm text-text-muted">Email</label>
          <input
            {...register('email')}
            className="mb-3 w-full rounded-md border border-white/10 bg-bg-base px-3 py-2 text-text-primary"
            type="email"
          />
          <label className="mb-1 block text-sm text-text-muted">Password</label>
          <input
            {...register('password')}
            className="mb-4 w-full rounded-md border border-white/10 bg-bg-base px-3 py-2 text-text-primary"
            type="password"
          />
          {formState.errors.email ? (
            <p className="mb-2 text-xs text-bear">Enter a valid email</p>
          ) : null}
          <Button type="submit" className="w-full">
            Continue
          </Button>
          <p className="mt-3 text-xs text-text-muted">Foundation build — authentication coming in Phase 1.</p>
        </form>
      </main>
    </div>
  );
}
