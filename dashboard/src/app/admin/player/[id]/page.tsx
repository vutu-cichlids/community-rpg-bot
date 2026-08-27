import { notFound } from "next/navigation";
import Link from "next/link";
import { getPlayer } from "@/lib/data";
import { updatePlayer, resetCooldowns } from "../../actions";

export const dynamic = "force-dynamic";

const FIELDS = [
  { key: "level", label: "Level" },
  { key: "xp", label: "XP" },
  { key: "coin", label: "Coin" },
  { key: "power", label: "Power" },
  { key: "defense", label: "Defense" },
  { key: "maxHp", label: "Max HP" },
  { key: "hp", label: "HP hiện tại" },
] as const;

export default async function PlayerPage({ params }: { params: { id: string } }) {
  const player = await getPlayer(params.id);
  if (!player) notFound();

  const updateWithId = updatePlayer.bind(null, player.id);
  const resetWithId = resetCooldowns.bind(null, player.id);

  return (
    <main className="max-w-2xl mx-auto px-6 py-12 space-y-8">
      <Link href="/admin" className="text-sm underline">
        ← Quay lại tìm kiếm
      </Link>

      <header>
        <p className="text-xs uppercase tracking-widest text-gold dark:text-gold-dark mb-1">
          Server {player.guildId}
        </p>
        <h1 className="font-display text-2xl font-bold">
          {player.username} <span className="text-black/40 dark:text-white/40 text-base">({player.discordId})</span>
        </h1>
        <p className="text-sm text-black/50 dark:text-white/50 mt-1">
          Class: {player.classId ?? "Chưa chọn"} · Clan: {player.clan?.name ?? "Không có"} · {player.pets.length} pet ·{" "}
          {player.achievements.length} thành tựu
        </p>
      </header>

      <form action={updateWithId} className="grid grid-cols-2 gap-4">
        {FIELDS.map((f) => (
          <label key={f.key} className="text-sm">
            <span className="block mb-1 text-black/60 dark:text-white/60">{f.label}</span>
            <input
              type="number"
              name={f.key}
              defaultValue={(player as any)[f.key]}
              className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 num"
            />
          </label>
        ))}
        <div className="col-span-2">
          <button
            type="submit"
            className="rounded-md bg-gold dark:bg-gold-dark text-white dark:text-black text-sm px-4 py-2 font-medium"
          >
            Lưu thay đổi
          </button>
        </div>
      </form>

      <div className="border-t border-black/10 dark:border-white/10 pt-6">
        <h2 className="font-display text-lg font-semibold mb-2">Tiện ích</h2>
        <form action={resetWithId}>
          <button
            type="submit"
            className="rounded-md border border-black/15 dark:border-white/20 text-sm px-4 py-2"
          >
            Reset toàn bộ cooldown (daily/work/boss/raid/duel)
          </button>
        </form>
      </div>

      <div className="border-t border-black/10 dark:border-white/10 pt-6">
        <h2 className="font-display text-lg font-semibold mb-3">Túi đồ ({player.inventory.length})</h2>
        {player.inventory.length === 0 ? (
          <p className="text-sm text-black/50 dark:text-white/50">Trống.</p>
        ) : (
          <ul className="text-sm space-y-1">
            {player.inventory.map((i) => (
              <li key={i.id}>
                {i.itemId} × {i.quantity} {i.equipped && <span className="text-gold dark:text-gold-dark">(đang trang bị)</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-black/10 dark:border-white/10 pt-6">
        <h2 className="font-display text-lg font-semibold mb-3">Pet ({player.pets.length})</h2>
        {player.pets.length === 0 ? (
          <p className="text-sm text-black/50 dark:text-white/50">Chưa có pet.</p>
        ) : (
          <ul className="text-sm space-y-1">
            {player.pets.map((p) => (
              <li key={p.id}>
                {p.species} "{p.name}" — Lv.{p.level} ({p.rarity}), Power {p.power}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
