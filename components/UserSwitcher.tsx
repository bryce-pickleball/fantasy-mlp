"use client";

import { useRouter } from "next/navigation";

type Props = {
  current: { id: string; name: string };
  users: { id: string; name: string }[];
};

export default function UserSwitcher({ current, users }: Props) {
  const router = useRouter();
  async function pick(userId: string) {
    if (userId === current.id) return;
    await fetch("/api/identity", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    router.refresh();
  }
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-ink/50 font-serif italic">You are</span>
      <select
        value={current.id}
        onChange={(e) => pick(e.target.value)}
        className="px-2 py-1 rounded border border-line bg-white font-semibold"
      >
        {users.map((u) => (
          <option key={u.id} value={u.id}>{u.name}</option>
        ))}
      </select>
    </label>
  );
}
