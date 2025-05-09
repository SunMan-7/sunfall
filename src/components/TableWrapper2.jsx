import {memo, useState, useEffect} from "react";
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Stack from "react-bootstrap/Stack";
import Card from 'react-bootstrap/Card';
// import styles from '../styles/components/Input.module.css';
import {
  ChevronDoubleLeftIcon, ChevronDoubleRightIcon,
  ChevronLeftIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { Link } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,  
  // filterFns  
} from "@tanstack/react-table"

import { rankItem,} from "@tanstack/match-sorter-utils"

const fuzzyFilter = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

const TableWrapper = ({data, columns, page = '', insertBtnType = '', fontSize='14px'}) => {
  // console.log('twrapper');
  
  // const [columnFilters, setColumnFilters] = React.useState([])
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  // const [columnVisibility, setColumnVisibility] = React.useState({})
  
  // const refreshData = () => setData(defaultData)

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      sorting,
      // columnFilters,
      globalFilter,
      // columnVisibility
    },
    onSortingChange: setSorting,
    // onColumnFiltersChange: setColumnFilters,
    // onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // getRowId: rowId,
    debugTable: true,
    debugHeaders: true,
    debugColumns: false
  })  

  return (
    <Card className="p-3 shadow" style={{display: 'inline-block', fontSize: fontSize }}>
      <Stack direction="horizontal">        
        <DebouncedInput
          value={globalFilter ?? ""}
          onChange={value => setGlobalFilter(String(value))}
          className="p-2 border"
          style={{ borderRadius: '25px'}}
          placeholder="Search..."
        />       
        {insertBtnType === 'link' 
          ? <Button as={Link} to={page} variant="primary" className="ms-auto" >Insert</Button> 
          : insertBtnType === 'modal'
          ? <Button onClick={page} variant="primary" className="ms-auto" >Insert</Button>
          : null
        }        
      </Stack>
      <div className="p-2" />
      
      <Table responsive bordered hover className="pt-2" >
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} colSpan={header.colSpan} style={{width: header.getSize(), textAlign: 'center'}}>
                  {header.isPlaceholder ? null : (
                    <div style={header.column.getCanSort() ? {cursor: 'pointer'}: null}
                      {...{
                        onClick: header.column.getToggleSortingHandler(),
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted()] ?? null}
                    </div>
                  )}
                </th>
              ))}              
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => {
            return (
              <tr key={row.id} >
                {row.getVisibleCells().map(cell => {
                  return (
                    <td key={cell.id} style={{width: cell.column.getSize(), textAlign: 'center'} }>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </Table>      
      <div style={{fontSize: '14px'}}>
        # of rows: {table.getPaginationRowModel().rows.length} 
      </div>

      <Stack direction="horizontal">
        <Stack direction="horizontal" gap={3} style={{ fontSize: '14px' }}>
          <div>
            Page {" "}
            <span>
              {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
          </div>
          
          <div >
            Go to page: {""}
            <input
              type="number"
              defaultValue={table.getState().pagination.pageIndex + 1}
              onChange={e => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0
                table.setPageIndex(page)
              }}
              className="border p-1 rounded"
              style={{width: '60px'}}
                           
            />
          </div>
          <div>
            Rows per page: {' '}
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => {
              table.setPageSize(Number(e.target.value))
            }}
            className="border p-1 rounded"
          >
            
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
          </div>
        </Stack>

        <div className="ms-auto">
          <button
            className="border rounded p-1"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            style={{ width: '50px'}}
          >
            {table.getCanPreviousPage() ?
            <ChevronDoubleLeftIcon style={{width: '20px', height: '20px'}}/> :
            <ChevronDoubleLeftIcon style={{width: '20px', height: '20px', color: 'grey'}}/>}
          </button>
          <button
            className="border rounded p-1 mx-1"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            style={{ width: '50px'}}
          >
            {table.getCanPreviousPage() ?
            <ChevronLeftIcon style={{width: '20px', height: '20px'}}/> :
            <ChevronLeftIcon style={{width: '20px', height: '20px', color: 'grey'}}/>}
          </button>
          <button
            className="border rounded p-1"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            style={{ width: '50px'}}
          >
            {table.getCanNextPage() ?
            <ChevronRightIcon style={{width: '20px', height: '20px'}}/> :
            <ChevronRightIcon style={{width: '20px', height: '20px', color: 'grey'}}/>}
          </button>
          <button
            className="border rounded p-1 mx-1"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            style={{ width: '50px'}}
          >
            {table.getCanNextPage() ?
            <ChevronDoubleRightIcon style={{width: '20px', height: '20px'}}/> :
            <ChevronDoubleRightIcon style={{width: '20px', height: '20px', color: 'grey'}}/>}
          </button>
        </div>        
        </Stack>   
      
      {/* <div>
        <button onClick={() => rerender()}>Force Rerender</button>
      </div> */}
      {/* <div>
        <button onClick={() => refreshData()}>Refresh Data</button>
      </div> */}      
    </Card>
  )
}

// A debounced input react component
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value, debounce, onChange]) //might need to remove debounce and onChange

  return (
    <input {...props} value={value} onChange={e => setValue(e.target.value)} />
  )
}

export default memo(TableWrapper);
