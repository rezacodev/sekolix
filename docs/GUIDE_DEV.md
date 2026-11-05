**Breadcrumbs**

- Centralize simple crumbs in `app/admin/AdminLayoutClient.tsx` via the `BREADCRUMB_MAP` object.
	- Add module roots (e.g. `/admin/website-landing`, `/admin/penerimaan-siswa`, `/admin/manajemen-akademik`) so the breadcrumb label can link to a module dashboard.
	- For dynamic edit routes detect `pathname.match(...)` in `AdminLayoutClient` and build an array that begins with the module root crumb.

- Layouts that provide tabs or page-specific context should set breadcrumbs themselves (use `useBreadcrumb()`), but avoid overwriting children on every render. Use `usePathname()` and only set the module-level crumb when `pathname === '/admin/<module>'`.

- Example files:
	- Mapping: `app/admin/AdminLayoutClient.tsx`
	- Module root/dashboard: `app/admin/<module>/page.tsx`
	- Per-section tabs: `app/admin/manajemen-akademik/tahun-ajaran/layout.tsx`

**DataTable (shared component)**

- Primary props to use:
	- `columns`, `data` — table data and column definitions
	- `searchKey` — which column the search input targets
	- `serverSide`, `totalCount`, `pageIndex`, `pageSize`, `onPageChange`, `onPageSizeChange` — server pagination
	- `filterConfig` — array of filters rendered in the header: `{ column, title, options[] }`

- External/controlled filters:
	- Parent passes `externalFilters?: Record<string,string|undefined>` and `onFilterChange?: (column, value) => void`.
	- Inside `DataTable`, prefer `externalFilters[column]` when present so selects reflect parent-controlled state.

- Server wiring:
	- Parent component (e.g. `ArticleActions`) listens for `onSearchChange`, `onPageChange`, and `onFilterChange`, updates its state, and fetches `/api/...` with matching query params.
	- Keep filter param names consistent between `filterConfig` and API query params.

**Gotchas & Tips**

- If breadcrumbs appear correct only after a hard reload, the parent layout is likely overwriting child breadcrumbs on client navigation — fix by conditioning `setBreadcrumbs` on `pathname`.
- Keep static crumbs in `BREADCRUMB_MAP` to avoid duplicating `setBreadcrumbs` logic across many layouts.
- When moving header filters into `DataTable`, remove duplicated header controls and have the DataTable expose hooks/props for parent control.

Example: Wiring `filterConfig` to an API endpoint

Parent component (client):

```tsx
const [filters, setFilters] = useState<Record<string,string|undefined>>({});
const [pageIndex, setPageIndex] = useState(0);
const [pageSize, setPageSize] = useState(10);
const [search, setSearch] = useState("");

const onFilterChange = (column: string, value?: string) => {
	setFilters((prev) => ({ ...prev, [column]: value }));
	// re-fetch or reset pageIndex as needed
	fetchData(0, pageSize, search, { ...filters, [column]: value });
};

<DataTable
	columns={columns}
	data={data}
	searchKey="title"
	filterConfig={filterConfig}
	externalFilters={filters}
	onFilterChange={onFilterChange}
	serverSide
	totalCount={totalCount}
	pageIndex={pageIndex}
	pageSize={pageSize}
	onPageChange={(p) => setPageIndex(p)}
	onPageSizeChange={(ps) => setPageSize(ps)}
/>
```

Server-side fetch helper (parent):

```ts
const fetchData = async (p:number, ps:number, s:string, f:Record<string,string|undefined>) => {
	const q = new URLSearchParams({ page: String(p), pageSize: String(ps) });
	if (s) q.set('search', s);
	Object.entries(f || {}).forEach(([k, v]) => { if (v) q.set(k, v); });
	const res = await fetch(`/api/admin/your-endpoint?${q.toString()}`);
	// handle response
};
```

Server endpoint should read the same query params (`category`, `isPublished`, etc.) and apply them to the DB query.
 
**Form Design (shadcn + react-hook-form)**

- Use `react-hook-form` + `zod` for validation and `shadcn` primitives for consistent UI:
	- `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` from the `shadcn` form wrapper.
	- Inputs: `Input`, `Textarea`, `Select`, `Switch`, `DatePicker` (or a custom wrapper), `File` upload via `Input` + server endpoint.

- Recommended pattern (see examples in `app/admin/manajemen-akademik/gtk/new` and `app/admin/website-landing/posts/articles/new`):
	1. Define a `zod` schema for the form. Use `zodResolver` with `useForm`.
	2. Create a client component for the form UI. Keep data fetching and submission in the client component (or call a server action / API route).
	3. Use `FormField` render prop to connect `react-hook-form` fields to `FormControl` + `Input`/`Select`.
	4. On edit pages pass `initialData` (normalize dates to ISO `YYYY-MM-DD`, stringify JSON fields) and call `reset(initialValues)` so fields prefill correctly.
	5. Show loading and submitting states via button `isLoading` or `disabled` attributes and optimistic UI when appropriate.

- Submit handler:
	- Use `fetch('/api/admin/<module>/<resource>', { method: 'POST'|'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })`.
	- Handle validation errors (400) and show feedback via `toast` or `FormMessage` where applicable.

- File uploads:
	- Use a dedicated `/api/admin/.../media` endpoint (multipart/form-data). After upload, set the returned URL into the form field.

- Accessibility & UX:
	- Keep label + helper text concise. Use `FormMessage` to show field errors.
	- Use `Dialog` for create/edit modals, or dedicated `/new` pages for full-page forms.

- Small checklist before merging a form change:
	- `zod` schema covers required/format rules.
	- `initialData` normalization for edit flows.
	- Loading/submitting states handled.
	- Server API uses the same field names as the form.


