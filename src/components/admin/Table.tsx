import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type PaginationState,
} from '@tanstack/react-table'
import { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, X} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/axiosConfig';
import Spinner from '../ui/Spinner';

interface ResearcherApplication {                                                                                                                                                                                         
    id: number;                                                                                                                                                                                                             
    full_name: string;                                                                                                                                                                                                      
    username: string;                                                                                                                                                                                                       
    institute: string;                                                                                                                                                                                                      
    credentials: string;                                                                                                                                                                                                    
    application_status: 'PENDING' | 'APPROVED' | 'REJECTED';                                                                                                                                                                
}


const RowActions = ({application }: {application: ResearcherApplication}) => {
    const queryClient = useQueryClient();
    const { mutate } = useMutation({
        mutationFn: (newStatus: string) => 
            api.patch(`admin/applications/${application.id}/review/`, {
                application_status: newStatus
            }).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['researchers']});
            queryClient.invalidateQueries({queryKey: ['admin-stats']});
        }
    });

    if (application.application_status !== 'PENDING') return null;  

    return(
    <div className='flex gap-2 justify-center'>
        <button className=' text-teal-600 bg-teal-500/30 rounded-xl p-2 text-sm font-bold flex gap-1 justify-center items-center hover:bg-teal-500/40 transition-colors'
        onClick={() => {mutate('APPROVED')}}
        > <Check /> Approve</button>
        <button className=' text-red-500 bg-red-300/30 rounded-xl p-2 text-sm font-bold flex gap-1 justify-center items-center hover:bg-red-500/40 transition-colors'
        onClick={() => {mutate('REJECTED')}}> <X/> Reject</button>
    </div>);
}

const colHelper = createColumnHelper<ResearcherApplication>();

const cols = [
    colHelper.accessor('username', {
        cell: info => <div>@{info.getValue()}</div>,
        header: "Username"
    }),
    colHelper.accessor('full_name', {
        cell: info => <div>{info.getValue()}</div>,
        header: "Full Name"
    }),
    colHelper.accessor('credentials', {
        cell: (info) => <a
        className='mx-auto text-amber-600 w-15 bg-amber-300/30 rounded-xl p-2 text-sm font-bold flex gap-1 justify-center items-center hover:bg-amber-500/40 transition-colors'
        href={info.getValue()}                                                                                                                                                                                            
        target="_blank"                                                                                                                                                                                                   
        rel="noopener noreferrer"  
        >view</a>,
        header: "Credentials"
    }),
    colHelper.accessor('institute', {
        cell: info => <div>{info.getValue()}</div>,
        header: "Institute"
    }),
    colHelper.display({
        header: "Actions",
        cell: ({ row }) => <RowActions application={row.original}/>
    }),
];


export default function Table() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageSize: 10,
    pageIndex: 0
  });
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED'| 'REJECTED'>('PENDING')
  const {data, isLoading} = useQuery({
    queryKey: ['researchers', statusFilter],
    queryFn: () => api.get(`/admin/applications/?status=${statusFilter}`).then(r =>
      (Array.isArray(r.data) ? r.data : r.data.results ?? []) as ResearcherApplication[]
    )
  });


  
  const table = useReactTable({
    data: data ?? [],
    columns: cols,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: 'onChange',
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    }
  });

  if(isLoading) {
    return <Spinner />
  }

  return (
    <div className="p-2 flex flex-col justify-between flex-1 rounded-2xl border border-gray-100 shadow-sm">
      <div className='flex gap-2 bg-gray-50 rounded-xl p-2 mb-2'>
        {(['PENDING', 'APPROVED', 'REJECTED'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === s ? 'bg-teal-600 text-white' : 'text-gray-500 hover:bg-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <table className='w-full'>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} className='border-b border-gray-200'>
              {headerGroup.headers.map(header => (
                <th key={header.id} className='px-4 py-3 text-sm font-bold text-gray-400 uppercase tracking-wider' style={{ width: header.column.getSize() }}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} 
              className='border-b border-gray-200  hover:bg-gray-100 '> 
              {row.getVisibleCells().map(cell => (
                
                <td key={cell.id} 
                  className='p-3 text-md text-center text-gray-800'>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className=' flex justify-between mt-1 p-2'>
        <p className=' text-sm p-1 border-gray-300  border rounded-md'>
          Page: {pagination.pageIndex + 1} of {table.getPageCount()}
        </p>
        <div className='flex gap-2'>
          <button 
            disabled={!table.getCanPreviousPage()} 
            onClick={() => { table.previousPage() }}
            className=' border border-gray-300 rounded-md'
          >

            <ChevronLeft size={22} />
          </button>
          <button 
            disabled={!table.getCanNextPage()} 
            onClick={() => { table.nextPage()}}
            className=' border border-gray-300 rounded-md'
          >

            <ChevronRight size={22}/>
          </button>
        </div>
      </div>
    </div>
  )
}
