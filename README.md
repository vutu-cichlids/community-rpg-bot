# Community RPG Bot

Discord bot game hóa cộng đồng: nhân vật/class, XP từ chat & voice, kinh tế (coin/shop/inventory),
chiến đấu (boss/raid/PvP), pet, clan/guild, nhiệm vụ ngày, thành tựu, leaderboard, mini-game.

Stack: Node.js + TypeScript + discord.js v14 + Prisma + PostgreSQL.

## 1. Tạo Discord Application & Bot

1. Vào https://discord.com/developers/applications → **New Application**, đặt tên bot.
2. Vào tab **Bot** → **Reset Token** → copy token (giữ bí mật, không chia sẻ, không commit vào git).
3. Vẫn ở tab **Bot**: không cần bật bất kỳ Privileged Gateway Intent nào (bot này không dùng
   Message Content, Server Members hay Presence intent).
4. Vào tab **OAuth2 → URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Send Messages`, `Embed Links`, `Read Message History`, `View Channels`,
     `Connect` (để đọc voice state cho XP voice)
   - Copy URL được tạo, mở trong trình duyệt, chọn server và mời bot vào.
5. Ghi lại **Application ID** (Client ID) ở tab **General Information**.

## 2. Cấu hình biến môi trường

Copy `.env.example` thành `.env` và điền:

```
DISCORD_TOKEN=<bot token>
DISCORD_CLIENT_ID=<application id>
DISCORD_DEV_GUILD_ID=<id server test, optional>
DATABASE_URL=postgresql://user:pass@host:5432/db
```

## 3. Chạy local (tùy chọn, để test trước khi deploy)

```bash
npm install
npx prisma db push
npm run dev
```

## 4. Deploy lên Railway

### Bước 1 — Tạo project trên Railway
1. Đăng nhập https://railway.app bằng GitHub.
2. **New Project → Deploy from GitHub repo** → chọn repo chứa code này (repo cần được đẩy lên
   GitHub trước — xem hướng dẫn push ở dưới).

### Bước 2 — Thêm PostgreSQL
1. Trong project vừa tạo, bấm **New → Database → Add PostgreSQL**.
2. Railway tự tạo biến `DATABASE_URL` cho service Postgres đó.

### Bước 3 — Cấu hình biến môi trường cho service bot
Vào service bot (không phải service Postgres) → tab **Variables**, thêm:

| Key | Value |
|---|---|
| `DISCORD_TOKEN` | token bot của bạn |
| `DISCORD_CLIENT_ID` | application id của bot |
| `DATABASE_URL` | tham chiếu `${{Postgres.DATABASE_URL}}` (Railway gợi ý sẵn khi gõ `${{`) |

Không để `DISCORD_DEV_GUILD_ID` trên production để lệnh được đăng ký global cho mọi server.

### Bước 4 — Deploy
Railway tự nhận diện đây là Node.js project (qua `package.json`), chạy:
- Build: `npm install` (tự chạy `prisma generate` qua hook `postinstall`) rồi `npm run build`
- Start: `npm start` → tự `prisma db push` để đồng bộ schema rồi khởi động bot, đồng thời tự
  đăng ký slash command khi bot online.

Theo dõi tab **Deployments → Logs**; khi thấy dòng `Logged in as ...` và
`Registered N slash commands` nghĩa là bot đã chạy thành công. Slash command global có thể mất
tối đa ~1 giờ để hiện trên tất cả server (nếu dùng `DISCORD_DEV_GUILD_ID` khi test thì tức thời).

## 5. Danh sách lệnh

Dùng `/help` trong Discord để xem đầy đủ, tóm tắt:

- **Nhân vật**: `/profile`, `/class`
- **Kinh tế**: `/daily`, `/work`, `/shop`, `/buy`, `/inventory`, `/equip`, `/use`, `/gift`
- **Chiến đấu**: `/boss`, `/raid`, `/duel`
- **Vòng quay/Mini game**: `/chest open`, `/slot`, `/dice`
- **Pet**: `/pet adopt|list|info|feed|train`
- **Clan**: `/clan create|join|leave|info|leaderboard|deposit`
- **Tiến trình**: `/quest view|claim`, `/achievements`, `/leaderboard`

XP cũng tự động cộng khi chat (cooldown 1 phút/lần) và khi ở trong voice channel (mỗi 5 phút).

## Ghi chú bảo mật

- Không bao giờ commit `.env` hay bot token vào git (`.gitignore` đã loại trừ `.env`).
- Nếu lộ token, vào Developer Portal → Bot → Reset Token ngay lập tức.
