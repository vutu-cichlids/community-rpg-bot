import Link from "next/link";
import { getLeaderboards, getOverview, listGuildIds } from "@/lib/data";

export const dynamic = "force-dynamic";

const CLASS_LABELS: Record<string, string> = {
  warrior: "⚔️ Warrior",
  archer: "🏹 Archer",
  mage: "🧙 Mage",
  assassin: "🗡️ Assassin",
  tank: "🛡️ Tank",
  support: "❤️ Support",
};

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-black/10 dark:border-white/10 px-4 py-3 min-w-[140px]">
      <div className="text-2xl font-semibold num text-gold dark:text-gold-dark">{value}</div>
      <div className="text-xs uppercase tracking-wide text-black/50 dark:text-white/50 mt-1">{label}</div>
    </div>
  );
}

function ClassBars({ distribution, total }: { distribution: { classId: string; count: number }[]; total: number }) {
  const max = Math.max(1, ...distribution.map((d) => d.count));
  return (
    <div className="space-y-3">
      {distribution.map((d) => {
        const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
        const widthPct = Math.round((d.count / max) * 100);
        return (
          <div key={d.classId} className="grid grid-cols-[120px_1fr_60px] items-center gap-3 text-sm">
            <span>{CLASS_LABELS[d.classId] ?? d.classId}</span>
            <div className="h-2.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gold dark:bg-gold-dark"
                style={{ width: `${widthPct}%` }}
              />
            </div>
            <span className="num text-right text-black/60 dark:text-white/60">
              {d.count} ({pct}%)
            </span>
          </div>
        );
      })}
    </div>
  );
}

function LeaderTable({
  title,
  rows,
  valueLabel,
  value,
}: {
  title: string;
  rows: { username: string; level: number }[];
  valueLabel: string;
  value: (row: any) => string;
}) {
  return (
    <div>
      <h3 className="font-display text-lg font-semibold mb-3">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-black/50 dark:text-white/50 border-b border-black/10 dark:border-white/10">
              <th className="pb-2 pr-3">#</th>
              <th className="pb-2 pr-3">Người chơi</th>
              <th className="pb-2 text-right">{valueLabel}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="py-4 text-black/50 dark:text-white/50">
                  Chưa có dữ liệu.
                </td>
              </tr>
            )}
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-black/5 dark:border-white/5">
                <td className="py-2 pr-3 num text-black/50 dark:text-white/50">{i + 1}</td>
                <td className="py-2 pr-3">{r.username}</td>
                <td className="py-2 text-right num">{value(r)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function OverviewPage({ searchParams }: { searchParams: { guild?: string } }) {
  const guilds = await listGuildIds();
  const guildId = searchParams.guild && guilds.includes(searchParams.guild) ? searchParams.guild : guilds[0];

  if (!guildId) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="font-display text-3xl font-bold mb-4">Community RPG Dashboard</h1>
        <p className="text-black/60 dark:text-white/60">
          Chưa có dữ liệu người chơi nào trong database. Hãy chờ có người dùng lệnh trong Discord trước.
        </p>
      </main>
    );
  }

  const [overview, leaderboards] = await Promise.all([getOverview(guildId), getLeaderboards(guildId)]);

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-widest text-gold dark:text-gold-dark mb-1">Live Dashboard</p>
          <h1 className="font-display text-3xl font-bold">Community RPG</h1>
        </div>
        <div className="flex items-center gap-3">
          {guilds.length > 1 && (
            <form>
              <select
                name="guild"
                defaultValue={guildId}
                className="text-sm rounded-md border border-black/10 dark:border-white/15 bg-transparent px-2 py-1.5"
              >
                {guilds.map((g) => (
                  <option key={g} value={g}>
                    Server {g}
                  </option>
                ))}
              </select>
            </form>
          )}
          <Link
            href="/admin"
            className="text-sm rounded-md border border-black/10 dark:border-white/15 px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/10"
          >
            Admin →
          </Link>
        </div>
      </header>

      <section className="flex flex-wrap gap-3">
        <StatChip label="Người chơi" value={overview.totalPlayers.toLocaleString("vi-VN")} />
        <StatChip label="Tổng Coin" value={overview.totalCoin.toLocaleString("vi-VN")} />
        <StatChip label="Level TB" value={overview.avgLevel.toFixed(1)} />
        <StatChip label="Pet" value={overview.totalPets.toLocaleString("vi-VN")} />
        <StatChip label="Clan" value={overview.totalClans.toLocaleString("vi-VN")} />
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4">Phân bố Class</h2>
        <ClassBars distribution={overview.classDistribution} total={overview.totalPlayers} />
      </section>

      <section className="grid md:grid-cols-2 gap-x-10 gap-y-10">
        <LeaderTable title="🏆 Top Level" rows={leaderboards.topLevel} valueLabel="Level" value={(r) => `${r.level}`} />
        <LeaderTable title="⚔️ Top Power" rows={leaderboards.topPower} valueLabel="Power" value={(r) => `${r.power}`} />
        <LeaderTable
          title="💰 Top Coin"
          rows={leaderboards.topCoin}
          valueLabel="Coin"
          value={(r) => r.coin.toLocaleString("vi-VN")}
        />
        <div>
          <h3 className="font-display text-lg font-semibold mb-3">🏰 Top Clan</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-black/50 dark:text-white/50 border-b border-black/10 dark:border-white/10">
                  <th className="pb-2 pr-3">#</th>
                  <th className="pb-2 pr-3">Clan</th>
                  <th className="pb-2 text-right">Level</th>
                </tr>
              </thead>
              <tbody>
                {leaderboards.topClans.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-black/50 dark:text-white/50">
                      Chưa có clan nào.
                    </td>
                  </tr>
                )}
                {leaderboards.topClans.map((c, i) => (
                  <tr key={c.id} className="border-b border-black/5 dark:border-white/5">
                    <td className="py-2 pr-3 num text-black/50 dark:text-white/50">{i + 1}</td>
                    <td className="py-2 pr-3">{c.name}</td>
                    <td className="py-2 text-right num">{c.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <footer className="text-xs text-black/40 dark:text-white/40 pt-6 border-t border-black/10 dark:border-white/10">
        Dữ liệu live từ database — làm mới trang để cập nhật.
      </footer>
    </main>
  );
}
