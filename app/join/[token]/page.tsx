import JoinClient from "./JoinClient";

export default function JoinPage({ params }: { params: { token: string } }) {
  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <header className="mb-6">
        <p className="font-serif italic text-court text-sm">You've been invited.</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight">Join the league.</h1>
      </header>
      <JoinClient token={params.token} />
    </main>
  );
}
