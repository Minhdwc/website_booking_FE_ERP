import Image from 'next/image';
import logoWide from '@/assets/logo/logo-16-9.png';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1fr_520px]">
      <div
        className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex"
        style={{ background: 'linear-gradient(150deg, #010f22 0%, #0e2f52 50%, #0a3d6e 100%)' }}
      >
        <div
          className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #1a4d7c 0%, transparent 65%)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-20 right-0 size-72 rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #5bae20 0%, transparent 65%)' }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative">
          <Image src={logoWide} alt="Minh Đức Booking Sport" className="h-20 w-auto " priority />
        </div>
        <div className="relative space-y-8">
          <div>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-white">
              Sân của bạn, bạn làm chủ
              <br />
              <span className="text-blue-200">dễ hơn bao giờ hết.</span>
            </h2>
          </div>
        </div>

        <p className="relative text-sm text-white/50">
          © 2025 Minh Đức Booking Sport · Phiên bản nội bộ
        </p>
      </div>
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-8">
        {children}
      </div>
    </div>
  );
}
