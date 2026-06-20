import Link from 'next/link';

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale = 'en' } = await params;

  return (
    <main className="min-h-screen bg-[#0a1628] text-white px-4 py-12">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl sm:p-10">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">Kurdamuz</p>
        <h1 className="mb-4 text-3xl font-bold">Privacy Policy</h1>
        <p className="mb-8 text-slate-300">
          This policy summarizes how Kurdamuz handles account, learning, upload, and purchase information.
        </p>

        <div className="space-y-6 text-slate-300">
          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">Information we collect</h2>
            <p>We collect the minimum information needed to create your account, track learning progress, process course access, and store user-uploaded learning assets.</p>
          </section>
          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">How information is used</h2>
            <p>Your data powers authentication, dashboard analytics, streaks, course enrollment, support, and platform security.</p>
          </section>
          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">Storage and security</h2>
            <p>Authentication and storage providers are used to protect sessions and uploaded files. Access is limited to the features that need it.</p>
          </section>
          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">Your choices</h2>
            <p>You can request account assistance, data corrections, or deletion through the Kurdamuz owner/support team.</p>
          </section>
        </div>

        <Link href={`/${locale}/signup`} className="mt-8 inline-flex rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white transition hover:bg-emerald-400">
          Back to signup
        </Link>
      </div>
    </main>
  );
}
