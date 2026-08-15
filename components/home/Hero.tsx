import { SearchBar } from './SearchBar';

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Signature backdrop: layered horizon gradients evoking coastline/hills —
          avoids relying on a single hardcoded stock photo, and stays crisp
          until real approved property photography starts populating the site. */}
      <div className="absolute inset-0 bg-gradient-to-b from-forest-800 via-forest-700 to-forest" />
      <div
        className="absolute inset-x-0 bottom-0 h-1/2 opacity-[0.15]"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 20% 100%, #B8935F 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, #84A98C 0%, transparent 50%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8 pt-20 pb-32 md:pt-28 md:pb-40 text-center">
        <span className="eyebrow text-brass-light">נופש בוטיק בישראל ובעולם</span>
        <h1 className="mt-4 font-display text-4xl md:text-6xl leading-[1.15] text-cream max-w-3xl mx-auto">
          החופשה הבאה שלכם,<br className="hidden md:block" /> נבחרת בקפידה
        </h1>
        <p className="mt-5 text-cream/70 text-base md:text-lg max-w-xl mx-auto">
          וילות, צימרים ובתי נופש ייחודיים — כל נכס נבדק ומאושר ידנית לפני שהוא עולה לאתר.
        </p>
      </div>

      <div className="relative mx-auto max-w-5xl px-5 md:px-8 -mt-20 md:-mt-24 pb-16">
        <SearchBar />
      </div>
    </section>
  );
}
