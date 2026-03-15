interface AnalysisPageProps {
  params: { id: string };
}

export default function AnalysisPage({ params }: AnalysisPageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 px-4 dark:bg-zinc-900">
      <div className="w-full max-w-2xl space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Analysis {params.id}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Your competitive analysis has been generated. Full dashboard coming
          soon.
        </p>
        <a
          href="/"
          className="inline-block rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
