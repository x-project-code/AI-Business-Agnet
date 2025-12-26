import ChatWall from "@/components/ChatWall";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="grid gap-6 rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-lg backdrop-blur md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
              AI Business Chat Wall
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900 md:text-4xl">
              ABC Mobile Shop
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              We sell mobile phones and accessories with friendly service. Ask
              about the latest smartphones, data plans, repairs, or available
              promotions. Our team is ready to help you choose the perfect
              device.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {[
                "Same-day pickup",
                "Accessories & cases",
                "Friendly experts",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-500"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500 text-xl font-semibold text-white shadow-md">
                ABC
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Open today</p>
                <p className="text-sm text-slate-500">
                  Mon - Sat · 10:00 AM - 8:00 PM
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
              Visit us at 123 Main Street or call (555) 123-4567 for quick
              support.
            </div>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <ChatWall />
          <aside className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-slate-900">About</h2>
            <p className="text-sm leading-relaxed text-slate-600">
              ABC Mobile Shop offers the latest smartphones, accessories, and
              dependable service. Chat with us for product availability, pricing
              guidance, and personalized recommendations.
            </p>
            <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">
              This chat is public and available to everyone. Replies are
              generated instantly to help you plan your visit.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
