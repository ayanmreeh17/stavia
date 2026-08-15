import Link from 'next/link';

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-sage-light flex flex-col items-center justify-center px-5 py-12">
      <Link href="/" className="font-display text-2xl text-forest mb-8">
        Stavia · סטאביה
      </Link>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-premium border border-forest/8 p-8">
        <h1 className="text-2xl font-display text-charcoal text-center">{title}</h1>
        {subtitle && <p className="text-sm text-charcoal/50 text-center mt-2">{subtitle}</p>}
        <div className="mt-7">{children}</div>
      </div>
    </div>
  );
}
