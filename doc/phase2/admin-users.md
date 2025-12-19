# Admin Users (CRUD)

## API
- `GET /api/admin/users` — list users (ADMIN only)
- `POST /api/admin/users` — create user (email, password, role, name optional)
- `PATCH /api/admin/users` — update role / isActive (id required)
- `DELETE /api/admin/users` — delete user (id required, cannot delete self)

## UI
- Page: `/admin/users`
  - Tabel users (name, email, role, status, created)
  - Actions: Activate/Disable, Delete
  - Form Create User (email, name, password, role)

## Akses
- Proteksi via `getServerSession(authOptions)` (role ADMIN). Non-admin diarahkan ke `/admin/login` melalui layout.

## Seed accounts
- admin@sekolix.test / Admin123!
- editor@sekolix.test / Editor123!

## Catatan
- Password dibutuhkan saat create user (bcrypt hashed).
- Delete diblok untuk user yang sedang login (self-delete guard di API).
- Revalidate: 0 (server fetch fresh) + `router.refresh()` setelah aksi client.
