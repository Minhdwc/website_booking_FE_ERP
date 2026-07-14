# TanStack Query Setup cho Dự Án Next.js Quy Mô Lớn

> Áp dụng cho dự án **Next.js + TypeScript + TanStack Query + Axios + NestJS**.

> **Đã áp dụng vào ERP** (`website/frontend/ERP`):
>
> - Queries: `stores/queries/{venue,booking,notification,field,payment,report}.query.ts`
> - UI store: `stores/ui/erp-ui.store.ts` (Zustand filters)
> - Defaults: `lib/query-client.ts` + `provider/query-provider.tsx`
> - Không còn Booking/Notification Context — dùng query hooks trực tiếp

---

# Mục tiêu

- Phân tách rõ ràng giữa API, Service và React Query.
- Dễ mở rộng khi dự án có hàng chục hoặc hàng trăm API.
- Dễ bảo trì, tái sử dụng và quản lý cache.
- Hỗ trợ tốt cho nhiều module (Auth, Venue, Booking, Payment, Dashboard,...).

---

# Kiến trúc đề xuất

```text
src/
├── app/
│
├── providers/
│   └── query-provider.tsx
│
├── lib/
│   ├── axios.ts
│   └── query-client.ts
│
├── stores/
│   ├── api/
│   │   ├── client.ts
│   │   ├── response.ts
│   │   └── types/
│   │
│   ├── service/
│   │   ├── auth.service.ts
│   │   ├── venue.service.ts
│   │   ├── booking.service.ts
│   │   └── ...
│   │
│   └── queries/
│       ├── auth.query.ts
│       ├── venue.query.ts
│       ├── booking.query.ts
│       └── ...
│
├── components/
│
└── types/
```

Luồng hoạt động:

```text
Component
      │
      ▼
React Query (Hooks)
      │
      ▼
Service
      │
      ▼
Axios Client
      │
      ▼
Backend API
```

---

# 1. Khởi tạo QueryClient

```ts
// lib/query-client.ts

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### Giải thích

| Option               | Ý nghĩa                                     |
| -------------------- | ------------------------------------------- |
| retry                | Retry khi request thất bại                  |
| staleTime            | Dữ liệu được xem là "fresh" trong 5 phút    |
| gcTime               | Xóa cache sau 30 phút nếu không còn sử dụng |
| refetchOnWindowFocus | Không tự fetch lại khi quay về tab          |

---

# 2. Tạo Query Provider

```tsx
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

Sử dụng trong `app/layout.tsx`

```tsx
<QueryProvider>{children}</QueryProvider>
```

---

# 3. Service Layer

Service chỉ có nhiệm vụ gọi API.

Không sử dụng React Query trong Service.

```ts
class VenueService {
  getList(params: GetVenueDto) {
    return api.get('/venues', { params });
  }

  getById(id: string) {
    return api.get(`/venues/${id}`);
  }

  create(data: CreateVenueDto) {
    return api.post('/venues', data);
  }

  update(id: string, data: UpdateVenueDto) {
    return api.patch(`/venues/${id}`, data);
  }

  delete(id: string) {
    return api.delete(`/venues/${id}`);
  }
}

export const venueService = new VenueService();
```

---

# 4. Query Keys

Mỗi module nên có một bộ Query Keys riêng.

```ts
export const venueKeys = {
  all: ['venues'],

  lists: () => [...venueKeys.all, 'list'],

  list: (params: VenueQuery) => [...venueKeys.lists(), params],

  detail: (id: string) => [...venueKeys.all, id],
};
```

Các module khác:

```text
authKeys
userKeys
venueKeys
fieldKeys
bookingKeys
paymentKeys
notificationKeys
dashboardKeys
```

Không nên gom toàn bộ Query Keys vào một file.

---

# 5. Query Hooks

Ví dụ lấy danh sách:

```ts
export function useVenues(params: VenueQuery) {
  return useQuery({
    queryKey: venueKeys.list(params),
    queryFn: () => venueService.getList(params),
  });
}
```

Lấy chi tiết:

```ts
export function useVenue(id: string) {
  return useQuery({
    queryKey: venueKeys.detail(id),
    queryFn: () => venueService.getById(id),
    enabled: !!id,
  });
}
```

---

# 6. Mutation Hooks

```ts
export function useCreateVenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: venueService.create,

    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: venueKeys.lists(),
      });
    },
  });
}
```

Update:

```ts
export function useUpdateVenue(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateVenueDto) => venueService.update(id, data),

    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: venueKeys.detail(id),
      });

      queryClient.invalidateQueries({
        queryKey: venueKeys.lists(),
      });
    },
  });
}
```

---

# 7. Optimistic Update

Không phải lúc nào cũng nên `invalidateQueries()`.

Đối với các thao tác như:

- Like
- Favorite
- Toggle Status
- Toggle Active
- Checkbox

nên dùng:

```ts
onMutate;
onError;
onSettled;
```

để cập nhật UI ngay lập tức.

---

# 8. Prefetch

Prefetch giúp giảm thời gian chờ khi người dùng chuyển trang hoặc mở dialog.

```ts
queryClient.prefetchQuery({
  queryKey: venueKeys.detail(id),
  queryFn: () => venueService.getById(id),
});
```

Nên dùng cho:

- Hover Card
- Dialog
- Detail Page
- Next Page
- Tab

---

# 9. Infinite Query

Sử dụng cho dữ liệu cuộn vô hạn.

```ts
useInfiniteQuery();
```

Ví dụ:

- Notification
- Booking History
- Activity Timeline
- Chat
- Comments

---

# 10. Query Defaults theo từng loại dữ liệu

Ví dụ Dashboard:

```ts
staleTime: 5 * 60 * 1000;
```

Notification:

```ts
staleTime: 0;
```

Profile:

```ts
staleTime: Infinity;
```

Không phải tất cả Query đều có cùng thời gian cache.

---

# 11. Không gọi Service trực tiếp trong Component

❌ Không nên

```tsx
const { data } = useQuery({
  queryFn: () => venueService.getList(),
});
```

✅ Nên

```tsx
const { data } = useVenues();
```

Lợi ích:

- Component sạch hơn
- Dễ tái sử dụng
- Dễ thay đổi Query Key
- Dễ test

---

# 12. Tổ chức file Query

Ví dụ:

```text
stores/
└── queries/
    ├── auth.query.ts
    ├── venue.query.ts
    ├── booking.query.ts
    ├── payment.query.ts
    ├── dashboard.query.ts
    └── ...
```

Mỗi file nên bao gồm:

```text
- Query Keys
- useQuery Hooks
- useMutation Hooks
- Helper Functions
```

Ví dụ:

```text
venue.query.ts

├── venueKeys
├── useVenues()
├── useVenue()
├── useCreateVenue()
├── useUpdateVenue()
├── useDeleteVenue()
```

---

# 13. Phân chia trách nhiệm với Zustand

| TanStack Query | Zustand         |
| -------------- | --------------- |
| Server State   | Client/UI State |
| Danh sách sân  | Sidebar         |
| Booking        | Dialog          |
| Profile từ API | Theme           |
| Dashboard      | Tab             |
| Notification   | Modal           |
| Pagination     | Filter UI       |

Nguyên tắc:

- **TanStack Query** quản lý dữ liệu từ Server.
- **Zustand** quản lý trạng thái giao diện và tương tác cục bộ.

---

# 14. Kiến trúc đề xuất cho dự án Booking Sân Thể Thao

```text
stores/
├── api/
│   ├── client.ts
│   ├── response.ts
│   └── types/
│
├── service/
│   ├── auth.service.ts
│   ├── venue.service.ts
│   ├── field.service.ts
│   ├── booking.service.ts
│   ├── payment.service.ts
│   ├── review.service.ts
│   └── notification.service.ts
│
└── queries/
    ├── auth.query.ts
    ├── venue.query.ts
    ├── field.query.ts
    ├── booking.query.ts
    ├── payment.query.ts
    ├── review.query.ts
    └── notification.query.ts
```

Mỗi module sẽ tự quản lý:

- Query Keys
- Query Hooks
- Mutation Hooks
- Cache Strategy
- Prefetch Logic

Nhờ đó dự án vẫn rõ ràng và dễ mở rộng ngay cả khi số lượng API tăng lên hàng trăm endpoint.

---

# Best Practices

- Chỉ gọi API trong Service.
- Không viết `useQuery()` trực tiếp trong Component.
- Mỗi module có Query Keys riêng.
- Luôn sử dụng `invalidateQueries()` hoặc `setQueryData()` sau Mutation.
- **Không** dùng `void` trước `queryClient.invalidateQueries` / `removeQueries` / `prefetch*`.
- Sử dụng `enabled` cho các Query phụ thuộc điều kiện.
- Tận dụng `prefetchQuery()` để cải thiện trải nghiệm người dùng.
- Áp dụng `useInfiniteQuery()` cho danh sách lớn.
- Chọn `staleTime` phù hợp với từng loại dữ liệu.
- Tách rõ **Server State (TanStack Query)** và **Client State (Zustand)**.
- Duy trì cấu trúc theo module (feature-based) để dễ mở rộng và bảo trì.
