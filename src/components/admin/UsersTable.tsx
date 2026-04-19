import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShieldOff, ShieldCheck } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/axiosConfig';
import Spinner from '../ui/Spinner';

interface User {
  pk: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'USER' | 'RESEARCHER' | 'ADMIN';
  is_active: boolean;
}

interface PaginatedUsers {
  count: number;
  results: User[];
}

const roleStyles: Record<string, string> = {
  USER:       'bg-gray-100 text-gray-600',
  RESEARCHER: 'bg-teal-100 text-teal-700',
  ADMIN:      'bg-purple-100 text-purple-700',
};

function RowActions({ user }: { user: User }) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.post(`/users/${user.pk}/toggle-active/`).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  return (
    <div className="flex gap-2 justify-center">
      <button
        onClick={() => mutate()}
        disabled={isPending}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 ${
          user.is_active
            ? 'text-red-500 bg-red-300/30 hover:bg-red-500/40'
            : 'text-teal-600 bg-teal-500/30 hover:bg-teal-500/40'
        }`}
      >
        {user.is_active ? <><ShieldOff size={14} /> Ban</> : <><ShieldCheck size={14} /> Unban</>}
      </button>
    </div>
  );
}

const colHelper = createColumnHelper<User>();

const cols = [
  colHelper.accessor('username', {
    header: 'Username',
    cell: info => (
      <div>
        <p className="font-semibold text-gray-900">@{info.getValue()}</p>
        <p className="text-xs text-gray-400">{info.row.original.first_name} {info.row.original.last_name}</p>
      </div>
    ),
  }),
  colHelper.accessor('email', {
    header: 'Email',
    cell: info => <span className="text-gray-700">{info.getValue()}</span>,
  }),
  colHelper.accessor('role', {
    header: 'Role',
    cell: info => (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${roleStyles[info.getValue()]}`}>
        {info.getValue()}
      </span>
    ),
  }),
  colHelper.accessor('is_active', {
    header: 'Status',
    cell: info => (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${info.getValue() ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
        {info.getValue() ? 'Active' : 'Banned'}
      </span>
    ),
  }),
  colHelper.display({
    header: 'Actions',
    cell: ({ row }) => <RowActions user={row.original} />,
  }),
];

export default function UsersTable() {
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'RESEARCHER' | 'ADMIN'>('ALL');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [roleFilter, debouncedSearch]);

  const { data, isLoading } = useQuery<PaginatedUsers>({
    queryKey: ['admin-users', roleFilter, debouncedSearch, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (roleFilter !== 'ALL') params.set('role', roleFilter);
      if (debouncedSearch) params.set('username', debouncedSearch);
      params.set('page', String(page));
      return api.get(`/users/?${params}`).then(r => r.data);
    },
  });

  const pageCount = Math.max(1, Math.ceil((data?.count ?? 0) / 10));

  const table = useReactTable({
    data: data?.results ?? [],
    columns: cols,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
  });

  if (isLoading && !data) return <Spinner />;

  return (
    <div className="p-2 flex flex-col justify-between flex-1 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl p-2 mb-2">
        <div className="flex gap-2">
          {(['ALL', 'USER', 'RESEARCHER', 'ADMIN'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                roleFilter === r ? 'bg-teal-600 text-white' : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search username..."
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400 bg-white w-56"
        />
      </div>

      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map(hg => (
            <tr key={hg.id} className="border-b border-gray-200">
              {hg.headers.map(h => (
                <th key={h.id} className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className={isLoading ? 'opacity-50' : ''}>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={cols.length} className="text-center py-12 text-gray-400 text-sm">
                No users found.
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-100">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-3 text-sm text-gray-800">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="flex justify-between mt-1 p-2">
        <p className="text-sm p-1 border-gray-300 border rounded-md">
          Page: {page} of {pageCount}
          {data?.count != null && <span className="text-gray-400 ml-2">({data.count} total)</span>}
        </p>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="border border-gray-300 rounded-md disabled:opacity-40"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            disabled={page >= pageCount}
            onClick={() => setPage(p => p + 1)}
            className="border border-gray-300 rounded-md disabled:opacity-40"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
