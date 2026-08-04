# ERP — Minh Đức Booking Sport

Dashboard vận hành cho **chủ cơ sở (owner)** và **quản trị viên (admin)**: quản lý sân, lịch đặt, doanh thu, khách hàng, chat, báo cáo.

| | |
|---|---|
| **Repo** | [Minhdwc/website_booking_FE_ERP](https://github.com/Minhdwc/website_booking_FE_ERP) |
| **Port dev** | `3002` |
| **Backend** | `http://localhost:3001/api/v1` |

## Tech stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS 4**, shadcn/Radix UI, **MUI** (date pickers)
- **TanStack Query**, **Zustand**, **Axios**
- **Socket.io** (chat realtime)
- **Recharts** (biểu đồ), **MapLibre GL** (bản đồ)
- **react-hook-form** + **Zod**

## Yêu cầu

- Node.js 20+
- Backend API đang chạy
- Tài khoản role `owner` hoặc `admin` (role `user` không truy cập được ERP)

## Cài đặt & chạy local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Mở [http://localhost:3002](http://localhost:3002).

## Biến môi trường

File `.env.example`:

```env
BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

| Biến | Mô tả |
|------|--------|
| `BACKEND_URL` | Base URL API + target rewrite `/api/v1/*` |
| `NEXT_PUBLIC_API_BASE_URL` | Host cho Socket.io realtime |

## Scripts

| Lệnh | Mô tả |
|------|--------|
| `npm run dev` | Dev server port 3002 (Turbopack) |
| `npm run build` | Build production |
| `npm run start` | Chạy bản build |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run type-check` | Kiểm tra TypeScript |
| `npm run format` | Prettier |

## Phân quyền & routes

### Owner — vận hành cơ sở

| Route | Tính năng |
|-------|-----------|
| `/dashboard` | Tổng quan đặt sân & doanh thu |
| `/calendar` | Lịch sân theo tuần |
| `/bookings` | Quản lý booking (giữ/chốt) |
| `/courts`, `/courts/[id]` | CRUD sân |
| `/venues`, `/venues/[id]` | Quản lý cơ sở |
| `/customers` | Danh sách khách |
| `/reviews` | Đánh giá |
| `/chat` | Chat với khách |
| `/reports` | Báo cáo doanh thu |
| `/sports`, `/payment-method` | Cấu hình môn thể thao & thanh toán |
| `/account/*` | Hồ sơ tài khoản |

### Admin — quản trị nền tảng

| Route | Tính năng |
|-------|-----------|
| `/admin/dashboard` | Tổng quan hệ thống |
| `/admin/reports` | Thống kê toàn nền tảng |
| `/admin/tickets` | Ticket hỗ trợ |
| `/users` | Quản lý người dùng |
| `/analytics` | Phân tích xu hướng |

> Một số trang onboarding owner (`/owner/register`, `/owner/pending`, `/admin/owners`) đang ở dạng stub.

## Cấu trúc thư mục

```
app/
  (auth)/               # Login, register
  (erp)/                # Trang ERP (AuthGuard + RoleGuard)
components/
  features/             # UI theo domain
  layout/               # Sidebar, header, guards
  ui/                   # shadcn primitives
stores/
  api/                  # Axios client
  service/              # API services
  queries/              # React Query hooks
lib/                    # Auth session, utils
provider/               # Session, query, socket providers
```

## Hệ sinh thái

| Repo | Vai trò | Port |
|------|---------|------|
| [public-user-booking-FE](https://github.com/Minhdwc/public-user-booking-FE) | Web người dùng | 3000 |
| **website_booking_FE_ERP** (repo này) | Dashboard owner/admin | 3002 |
| [BE-booking-sport](https://github.com/Minhdwc/BE-booking-sport) | API NestJS | 3001 |
| Mobile (Expo) | App iOS/Android | — |

## Docker

Repo có `Dockerfile` để build image production. Cấu hình deploy tùy môi trường hosting.
