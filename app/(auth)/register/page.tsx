import Link from 'next/link';
import { AuthCard } from '@/components/auth/AuthCard';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata = { title: 'הרשמה' };

export default function RegisterPage() {
  return (
    <AuthCard title="יצירת חשבון" subtitle="הצטרפו לסטאביה כדי לשמור מועדפים ולפרסם נכסים">
      <RegisterForm />
      <p className="text-center text-sm text-charcoal/60 mt-6">
        כבר יש לכם חשבון?{' '}
        <Link href="/login" className="text-forest font-medium underline underline-offset-4">
          התחברות
        </Link>
      </p>
    </AuthCard>
  );
}
