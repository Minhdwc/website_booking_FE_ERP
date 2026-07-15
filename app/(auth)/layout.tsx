import Image from 'next/image';
import logoWide from '@/assets/logo/logo-16-9.png';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <aside className="relative hidden overflow-hidden bg-[#021735] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.45) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="pointer-events-none absolute -top-24 -left-16 size-[28rem] rounded-full bg-[#4c90d3]/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-10 size-[22rem] rounded-full bg-[#5bae20]/30 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#021735] to-transparent" />

        <div className="relative animate-in fade-in duration-700">
          <Image
            src={logoWide}
            alt="Minh Đức Booking Sport"
            className="h-16 w-auto rounded-sm"
            priority
          />
        </div>

        <div className="relative max-w-xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-sm font-semibold tracking-[0.2em] text-[#8dcc2a] uppercase">
            Minh Đức Booking Sport
          </p>
          <h2 className="text-4xl leading-tight font-bold tracking-tight xl:text-5xl">
            Sân của bạn,
            <br />
            bạn làm chủ dễ hơn bao giờ hết.
          </h2>
          <p className="max-w-md text-base leading-relaxed text-white/70">
            ERP nội bộ giúp quản lý cơ sở, sân, lịch đặt và thanh toán trên một bảng điều khiển.
          </p>
        </div>

        <p className="relative text-sm text-white/45">
          © 2026 Minh Đức Booking Sport · Phiên bản nội bộ
        </p>
      </aside>

      <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#f4f7fb] px-6 py-10 sm:px-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(91,174,32,0.12), transparent 35%), radial-gradient(circle at 80% 0%, rgba(14,47,82,0.1), transparent 40%)',
          }}
        />
        <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-right-4 duration-500">
          {children}
        </div>
      </div>
    </div>
  );
}
