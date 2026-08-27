import Link from "next/link";
import { listGuildIds, searchPlayers } from "@/lib/data";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminHome({ searchParams }: { searchParams: { guild?: string; q?: string } }) {
  const guilds = await listGuildIds();
  const guildId = searchParams.guild && guilds.includes(searchParams.guild) ? searchParams.guild : guilds[0];
  const query = searchParams.q ?? "";
  const results = guildId && query ? await searchPlayers(guildId, query) : [];

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-gold dark:text-gold-dark mb-1">Admin</p>
          <h1 className="font-display text-2xl font-bold">Quản lý người chơi</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm underline">
            ← Dashboard công khai
          </Link>
          <form action={logout}>
            <button className="text-sm rounded-md border border-black/10 dark:border-white/15 px-3 py-1.5">
              Đăng xuất
            </button>
          </form>
        </div>
      </header>

      {!guildId ? (
        <p className="text-black/60 dark:text-white/60">Chưa có dữ liệu người chơi nào.</p>
      ) : (
        <>
          <form className="flex gap-2">
            <input type="hidden" name="guild" value={guildId} />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Tìm theo username hoặc Discord ID..."
              className="flex-1 rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded-md bg-gold dark:bg-gold-dark text-white dark:text-black text-sm px-4 py-2 font-medium">
              Tìm
            </button>
          </form>

          {guilds.length > 1 && (
            <p className="text-xs text-black/50 dark:text-white/50">
              Đang tìm trong Server {guildId} —{" "}
              <Link href={`/admin?guild=${guilds.find((g) => g !== guildId) ?? guildId}`} className="underline">
                đổi server
              </Link>
            </p>
          )}

          <div className="space-y-2">
            {query && results.length === 0 && (
              <p className="text-black/50 dark:text-white/50 text-sm">Không tìm thấy người chơi nào khớp "{query}".</p>
            )}
            {results.map((r) => (
              <Link
                key={r.id}
                href={`/admin/player/${r.id}`}
                className="flex items-center justify-between rounded-md border border-black/10 dark:border-white/10 px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 text-sm"
              >
                <span>
                  {r.username} <span className="text-black/40 dark:text-white/40">({r.discordId})</span>
                </span>
                <span className="num text-black/60 dark:text-white/60">
                  Lv.{r.level} · 💰{r.coin.toLocaleString("vi-VN")}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
