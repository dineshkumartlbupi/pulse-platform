import { Feed } from '@/components/Feed';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-zinc-100 selection:bg-purple-500/30">
      <Feed />
    </main>
  );
}
