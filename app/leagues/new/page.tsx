import NewLeagueForm from "./NewLeagueForm";

export default function NewLeaguePage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <header className="mb-6">
        <p className="font-serif italic text-court text-sm">Start a private league.</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight">Name your league.</h1>
      </header>
      <NewLeagueForm />
    </main>
  );
}
