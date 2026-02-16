import Link from 'next/link';
import { Header } from '@/components/layout';
import { Footer } from '@/components/layout';

const features = [
  { icon: '🎮', title: 'Competitive Gaming', desc: 'Rankings, matchmaking, and real-time stats across multiple games.', accent: '#6C5CE7' },
  { icon: '🏆', title: 'Tournaments', desc: 'Create and join tournaments with brackets, leagues, and prizes.', accent: '#00CEC9' },
  { icon: '👥', title: 'Social Network', desc: 'Follow players, share highlights, and build your gaming community.', accent: '#007AFF' },
  { icon: '💬', title: 'Real-Time Chat', desc: 'Instant messaging, team channels, and tournament communication.', accent: '#00B894' },
  { icon: '📊', title: 'Player Stats', desc: 'Detailed analytics, match history, and performance tracking.', accent: '#FDCB6E' },
  { icon: '🛡️', title: 'Secure Platform', desc: 'Enterprise-grade security with JWT auth and role-based access.', accent: '#FF3B30' },
];

const stats = [
  { value: '10K+', label: 'Players' },
  { value: '500+', label: 'Tournaments' },
  { value: '50K+', label: 'Matches' },
  { value: '99.9%', label: 'Uptime' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Header />

      <section className="relative py-24 md:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-200px] left-[-100px] w-[600px] h-[600px] rounded-full bg-accent/8 blur-[120px]" />
          <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] rounded-full bg-accent-cyan/6 blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-bg-card border border-border px-4 py-2 text-xs mb-8">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-white/60">Platform Live — Season 1 Active</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            THE FUTURE OF{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-cyan">
              COMPETITIVE
            </span>{' '}
            GAMING
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
            One platform for tournaments, rankings, social networking, and real-time competition. Built for champions.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-4 rounded-md text-base transition-all duration-200">
              Start Competing
            </Link>
            <Link href="/tournaments" className="bg-bg-card hover:bg-bg-hover text-white font-medium px-8 py-4 rounded-md text-base border border-border transition-all duration-200">
              Browse Tournaments
            </Link>
          </div>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-cyan">
                  {stat.value}
                </div>
                <div className="text-xs text-white/40 mt-1 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Everything You{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-cyan">Need</span>
            </h2>
            <p className="mt-4 text-white/45 max-w-xl mx-auto">One platform, zero compromises.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="bg-bg-card rounded-lg border border-border p-7 hover:bg-bg-hover hover:border-border-solid transition-all duration-300 group">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl text-2xl mb-5" style={{ backgroundColor: `${f.accent}15` }}>
                  {f.icon}
                </div>
                <h3 className="font-display text-base font-bold tracking-wide group-hover:text-accent transition-colors duration-300">{f.title}</h3>
                <p className="mt-3 text-sm text-white/45 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Ready to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-cyan">Compete</span>?
          </h2>
          <p className="text-white/45 mb-10">Join thousands of players already competing on MATZON.</p>
          <Link href="/register" className="inline-block bg-accent hover:bg-accent-hover text-white font-semibold px-10 py-4 rounded-md text-base transition-all duration-200">
            Create Free Account
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
