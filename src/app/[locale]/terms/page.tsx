import Link from 'next/link';

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale = 'en' } = await params;

  return (
    <main className="min-h-screen bg-[#0a1628] text-white px-4 py-12">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl sm:p-10">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">Kurdamuz</p>
        <h1 className="mb-4 text-3xl font-bold">Terms of Service</h1>
        <p className="mb-8 text-slate-300">
          These terms explain the expected use of Kurdamuz learning tools, courses, dashboards, and community features.
        </p>

        <div className="space-y-6 text-slate-300">
          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">Account responsibilities</h2>
            <p>Use accurate account information, keep your password secure, and contact support if you believe your account has been compromised.</p>
          </section>
          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">Learning content</h2>
            <p>Course materials are provided for personal learning. Do not redistribute paid or private content without permission.</p>
          </section>
          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">Payments</h2>
            <p>Manual bank transfer purchases are activated after the owner team verifies the submitted transfer details.</p>
          </section>
          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">Community conduct</h2>
            <p>Be respectful, avoid spam, and do not post harmful, illegal, or abusive content.</p>
          </section>
        </div>

        <Link href={`/${locale}/signup`} className="mt-8 inline-flex rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white transition hover:bg-emerald-400">
          Back to signup
        </Link>
      </div>
    </main>
  );
}
