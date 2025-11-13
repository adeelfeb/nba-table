import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import styles from '../../styles/UserOverviewTable.module.css';

ModuleRegistry.registerModules([AllCommunityModule]);

const AgGridReact = dynamic(
  () => import('ag-grid-react').then((mod) => mod.AgGridReact),
  { ssr: false }
);

const DATE_FORMAT_OPTIONS = {
  dateStyle: 'medium',
  timeStyle: 'short',
};

function formatDateCell(value, formatter) {
  if (!value) return '—';
  try {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return formatter.format(date);
  } catch {
    return '—';
  }
}

function ActionCellRenderer() {
  const handleClick = useCallback((event) => {
    event?.stopPropagation();
  }, []);

  return (
    <div className={styles.actionButtons}>
      <button
        type="button"
        className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
        onClick={handleClick}
        disabled
      >
        Edit
      </button>
      <button
        type="button"
        className={`${styles.actionButton} ${styles.actionButtonDanger}`}
        onClick={handleClick}
        disabled
      >
        Delete
      </button>
    </div>
  );
}

const COMPACT_TABLE_BREAKPOINT = 960;

export default function UserOverviewTable() {
  const [rowData, setRowData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCompact, setIsCompact] = useState(false);

  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(undefined, DATE_FORMAT_OPTIONS), []);

  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Name',
        field: 'name',
        minWidth: 180,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Email',
        field: 'email',
        minWidth: 200,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Role',
        field: 'role',
        minWidth: 130,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value?.replace(/_/g, ' ') || '—',
      },
      {
        headerName: 'Created At',
        field: 'createdAt',
        minWidth: 150,
        valueFormatter: (params) => formatDateCell(params.value, dateFormatter),
      },
      {
        headerName: 'Updated At',
        field: 'updatedAt',
        minWidth: 150,
        valueFormatter: (params) => formatDateCell(params.value, dateFormatter),
      },
      {
        headerName: 'Actions',
        field: 'id',
        minWidth: 150,
        maxWidth: 180,
        sortable: false,
        filter: false,
        cellRenderer: ActionCellRenderer,
        suppressMenu: true,
      },
    ],
    [dateFormatter]
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
    }),
    []
  );

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function fetchUsers() {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch('/api/users/list', {
          method: 'GET',
          credentials: 'include',
          signal: controller.signal,
        });
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          throw new Error('Unexpected server response');
        }
        const payload = await response.json();
        if (!response.ok || payload.success === false) {
          const message = payload?.message || 'Unable to fetch users';
          throw new Error(message);
        }
        const data = Array.isArray(payload.data) ? payload.data : [];
        if (isMounted) {
          setRowData(
            data.map((user) => ({
              ...user,
              id: user.id || user._id || user.email,
            }))
          );
        }
      } catch (err) {
        if (isMounted && err.name !== 'AbortError') {
          setError(err.message || 'Failed to load users');
          setRowData([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchUsers();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return () => {};
    }

    const evaluateViewport = () => {
      setIsCompact(window.innerWidth < COMPACT_TABLE_BREAKPOINT);
    };

    evaluateViewport();
    window.addEventListener('resize', evaluateViewport);

    return () => {
      window.removeEventListener('resize', evaluateViewport);
    };
  }, []);

  const isEmpty = !isLoading && !error && rowData.length === 0;

  return (
    <div className={styles.container}>
      {error && <div className={`${styles.feedback} ${styles.feedbackError}`}>{error}</div>}
      {!error && isLoading && (
        <div className={`${styles.feedback} ${styles.feedbackInfo}`}>Loading users…</div>
      )}
      {isEmpty && <div className={`${styles.feedback} ${styles.feedbackInfo}`}>No users found yet.</div>}

      {isCompact ? (
        <div className={styles.cardListWrapper} aria-live="polite">
          {!isEmpty && (
            <ul className={styles.cardList}>
              {rowData.map((user) => (
                <li key={user.id} className={styles.cardItem}>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Name</span>
                    <span className={styles.cardValue}>{user.name || '—'}</span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Email</span>
                    <span className={styles.cardValue}>{user.email || '—'}</span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Role</span>
                    <span className={styles.cardValue}>
                      {user.role?.replace(/_/g, ' ') || '—'}
                    </span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Created</span>
                    <span className={styles.cardValue}>
                      {formatDateCell(user.createdAt, dateFormatter)}
                    </span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Updated</span>
                    <span className={styles.cardValue}>
                      {formatDateCell(user.updatedAt, dateFormatter)}
                    </span>
                  </div>
                  <div className={`${styles.cardRow} ${styles.cardActions}`}>
                    <span className={styles.cardLabel}>Actions</span>
                    <div className={styles.actionButtons}>
                      <button
                        type="button"
                        className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
                        disabled
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className={`${styles.actionButton} ${styles.actionButtonDanger}`}
                        disabled
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className={styles.gridWrapper}>
          <div className={`ag-theme-quartz ${styles.grid}`}>
            {typeof window !== 'undefined' && (
              <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                enableCellTextSelection
                animateRows
                headerHeight={64}
                rowHeight={70}
                domLayout="autoHeight"
                pagination
                paginationPageSize={10}
                suppressPaginationPanel={false}
                suppressRowClickSelection
                stopEditingWhenCellsLoseFocus
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

