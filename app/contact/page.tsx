import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Mail } from 'lucide-react';

export const metadata = { title: 'צור קשר' };

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-sage-light py-16 flex items-center justify-center px-5">
        <div className="bg-white rounded-3xl border border-forest/8 shadow-card p-10 max-w-md w-full text-center">
          <Mail size={28} className="text-brass mx-auto mb-4" />
          <h1 className="text-2xl font-display mb-3">צרו קשר</h1>
          <p className="text-charcoal/60 mb-6">
            יש לכם שאלה, בקשה לתמיכה, או רוצים לספר לנו על נכס? נשמח לשמוע מכם.
          </p>
          <a href="mailto:hello@stavia.co.il" className="text-forest font-medium underline underline-offset-4">
            hello@stavia.co.il
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
