import Link from 'next/link';
import { AuthCard } from '@/components/auth/AuthCard';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = { title: 'התחברות' };

export default function LoginPage() {
  return (
    <AuthCard title="ברוכים השבים" subtitle="התחברו כדי להמשיך לסטאביה">
      <LoginForm />
      <div className="flex items-center justify-between mt-5 text-sm">
        <Link href="/reset-password" className="text-forest hover:underline underline-offset-4">שכחתם סיסמה?</Link>
        <Link href="/register" className="text-forest font-medium hover:underline underline-offset-4">יצירת חשבון</Link>
      </div>
    </AuthCard>
  );
}
