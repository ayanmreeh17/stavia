import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';

export const metadata = { title: 'שינוי סיסמה' };

export default function ChangePasswordPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-sage-light flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-premium border border-forest/8 p-8">
          <h1 className="text-2xl font-display text-center mb-6">שינוי סיסמה</h1>
          <ChangePasswordForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
