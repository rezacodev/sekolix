"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import { ChevronDown, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  filterConfig?: {
    column: string;
    title: string;
    options: { label: string; value: string }[];
  }[];
  enableRowOrdering?: boolean;
  onReorder?: (data: TData[]) => void;
  getRowId?: (originalRow: TData, index: number) => string;
  // Server-side mode
  serverSide?: boolean;
  totalCount?: number;
  pageIndex?: number;
  pageSize?: number;
  onPageChange?: (pageIndex: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSearchChange?: (value: string) => void;
  onFilterChange?: (column: string, value?: string) => void;
  externalFilters?: Record<string, string | undefined>;
  // Optional controlled search value from parent (keeps input text in sync)
  searchValue?: string;
  // Optional controlled row selection
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: (
    updater: Record<string, boolean> | ((old: Record<string, boolean>) => Record<string, boolean>)
  ) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  filterConfig,
  enableRowOrdering = false,
  onReorder,
  getRowId,
  serverSide = false,
  totalCount,
  pageIndex = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onFilterChange,
  externalFilters,
  searchValue,
  rowSelection: controlledRowSelection,
  onRowSelectionChange: controlledOnRowSelectionChange
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [localSearch, setLocalSearch] = React.useState("");

  // Use controlled rowSelection if provided, otherwise use internal state
  const actualRowSelection = controlledRowSelection ?? rowSelection;
  const actualOnRowSelectionChange = controlledOnRowSelectionChange ?? setRowSelection;

  // Keep localSearch in sync with parent-controlled `searchValue` when provided.
  React.useEffect(() => {
    if (typeof searchValue === "string") setLocalSearch(searchValue);
  }, [searchValue]);

  // Trigger search only when user explicitly requests it (Enter key or search button).
  const triggerSearch = React.useCallback(() => {
    if (serverSide) {
      onSearchChange?.(localSearch);
    }
  }, [localSearch, onSearchChange, serverSide]);
  // Memoize columns and data to provide stable references to the table instance
  const memoColumns = React.useMemo(() => columns, [columns]);
  const memoData = React.useMemo(() => data, [data]);
  // Provide a stable getRowId callback. If `getRowId` isn't provided, fall back to index-based id.
  const memoGetRowId = React.useCallback(
    (originalRow: TData, index: number) => {
      return getRowId ? getRowId(originalRow, index) : String(index);
    },
    [getRowId]
  );

  // `useReactTable` returns non-memoizable functions — disable the incompatible-library
  // lint rule here because we've stabilized inputs (data/columns) and avoid memoizing the table itself.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: memoData,
    columns: memoColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: actualOnRowSelectionChange,
    getRowId: memoGetRowId,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection: actualRowSelection,
      pagination: { pageIndex, pageSize }
    },
    manualPagination: serverSide,
    pageCount: serverSide && totalCount ? Math.ceil(totalCount / pageSize) : undefined
    // Do not provide onPaginationChange here for server-side mode to avoid
    // conflicts between internal table pagination and external pagination props.
  });

  const moveItem = React.useCallback((list: TData[], from: number, to: number) => {
    const updated = [...list];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    return updated;
  }, []);

  const handleReorder = React.useCallback(
    (sourceRowId: string, targetRowId: string) => {
      if (!onReorder || !enableRowOrdering) return;
      const rows = table.getRowModel().rows;
      const from = rows.findIndex(r => r.id === sourceRowId);
      const to = rows.findIndex(r => r.id === targetRowId);
      if (from === -1 || to === -1 || from === to) return;
      const updated = moveItem(
        rows.map(r => r.original),
        from,
        to
      );
      onReorder(updated);
    },
    [onReorder, enableRowOrdering, table, moveItem]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {searchKey && (
          <div className="relative flex-1 max-w-sm flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={
                  serverSide
                    ? localSearch
                    : ((table.getColumn(searchKey)?.getFilterValue() as string) ?? "")
                }
                onChange={event => {
                  const v = event.target.value;
                  if (serverSide) {
                    setLocalSearch(v);
                  } else {
                    table.getColumn(searchKey)?.setFilterValue(v);
                  }
                }}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    if (serverSide) {
                      triggerSearch();
                    }
                  }
                }}
                className="pl-8"
              />
            </div>
            {serverSide ? (
              <Button variant="outline" size="sm" onClick={triggerSearch}>
                <Search className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        )}
        {filterConfig?.map(filter => {
          const column = table.getColumn(filter.column);
          const selectedValue = (externalFilters?.[filter.column] ??
            (column?.getFilterValue() as string)) as string | undefined;

          return (
            <div key={filter.column} className="flex items-center gap-2">
              <Select
                value={selectedValue ?? "all"}
                onValueChange={value => {
                  // Update internal column filter for client-side mode
                  if (!serverSide) {
                    column?.setFilterValue(value === "all" ? undefined : value);
                  }
                  // Notify parent for server-side filtering or to react to filter changes
                  onFilterChange?.(filter.column, value === "all" ? undefined : value);
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={`Semua ${filter.title}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua {filter.title}</SelectItem>
                  {filter.options.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        })}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter(column => column.getCanHide())
              .map(column => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={value => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* search debounce handled in useEffect above */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  draggable={enableRowOrdering}
                  data-state={row.getIsSelected() && "selected"}
                  onDragStart={e => {
                    if (!enableRowOrdering) return;
                    e.dataTransfer.setData("text/plain", row.id);
                  }}
                  onDragOver={e => {
                    if (!enableRowOrdering) return;
                    e.preventDefault();
                  }}
                  onDrop={e => {
                    if (!enableRowOrdering) return;
                    e.preventDefault();
                    const sourceId = e.dataTransfer.getData("text/plain");
                    handleReorder(sourceId, row.id);
                  }}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {serverSide ? (
            <div className="space-y-1">
              <div>
                Total {totalCount ?? 0} data
              </div>
              {table.getFilteredSelectedRowModel().rows.length > 0 && (
                <div>
                  {table.getFilteredSelectedRowModel().rows.length} row(s) selected
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <div>
                Total {table.getFilteredRowModel().rows.length} data
              </div>
              {table.getFilteredSelectedRowModel().rows.length > 0 && (
                <div>
                  {table.getFilteredSelectedRowModel().rows.length} of{" "}
                  {table.getFilteredRowModel().rows.length} row(s) selected
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <select
              value={serverSide ? pageSize : table.getState().pagination.pageSize}
              onChange={e => {
                const newSize = Number(e.target.value);
                if (serverSide) {
                  onPageSizeChange?.(newSize);
                } else {
                  table.setPageSize(newSize);
                }
              }}
              className="h-8 w-[70px] rounded-md border border-input bg-background px-2 py-1 text-sm"
            >
              {[10, 20, 30, 40, 50].map(ps => (
                <option key={ps} value={ps}>
                  {ps}
                </option>
              ))}
            </select>
          </div>

          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            {serverSide ? (
              <span>
                Page {pageIndex + 1} of{" "}
                {totalCount ? Math.max(1, Math.ceil(totalCount / pageSize)) : 1}
              </span>
            ) : (
              <span>
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (serverSide) {
                  const next = Math.max(0, (pageIndex ?? 0) - 1);
                  onPageChange?.(next);
                } else {
                  table.previousPage();
                }
              }}
              disabled={serverSide ? (pageIndex ?? 0) <= 0 : !table.getCanPreviousPage()}
            >
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (serverSide) {
                  const maxPage = totalCount
                    ? Math.max(0, Math.ceil((totalCount ?? 0) / (pageSize ?? 10)) - 1)
                    : undefined;
                  const next =
                    typeof maxPage === "number"
                      ? Math.min((pageIndex ?? 0) + 1, maxPage)
                      : (pageIndex ?? 0) + 1;
                  onPageChange?.(next);
                } else {
                  table.nextPage();
                }
              }}
              disabled={
                serverSide
                  ? typeof totalCount === "number"
                    ? (pageIndex ?? 0) >=
                      Math.max(0, Math.ceil((totalCount ?? 0) / (pageSize ?? 10)) - 1)
                    : false
                  : !table.getCanNextPage()
              }
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
