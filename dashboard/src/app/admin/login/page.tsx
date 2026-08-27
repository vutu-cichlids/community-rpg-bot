import { login } from "../actions";

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <main className="max-w-sm mx-auto px-6 py-24">
      <p className="text-xs uppercase tracking-widest text-gold dark:text-gold-dark mb-1">Admin</p>
      <h1 className="font-display text-2xl font-bold mb-6">Đăng nhập quản trị</h1>
      <form action={login} className="space-y-4">
        <input
          type="password"
          name="password"
          placeholder="Mật khẩu admin"
          required
          autoFocus
          className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
        />
        {searchParams.error && (
          <p className="text-sm text-danger dark:text-danger-dark">Sai mật khẩu, thử lại.</p>
        )}
        <button
          type="submit"
          className="w-full rounded-md bg-gold dark:bg-gold-dark text-white dark:text-black font-medium py-2 text-sm"
        >
          Đăng nhập
        </button>
      </form>
    </main>
  );
}
