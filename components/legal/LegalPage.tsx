import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream py-12 md:py-16">
        <div className="mx-auto max-w-2xl px-5">
          <h1 className="text-2xl md:text-3xl font-display mb-1">{title}</h1>
          <p className="text-sm text-charcoal/40 mb-8">עודכן לאחרונה: {updated}</p>
          <div className="prose prose-sm max-w-none text-charcoal/75 leading-relaxed space-y-4">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
