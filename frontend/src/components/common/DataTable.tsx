// File: frontend/src/components/Common/DataTable.tsx
// -------------------------------------------------
import React, { useState } from 'react';
import {
  Table,
  Paper,
  Group,
  TextInput,
  Button,
  Checkbox,
  ActionIcon,
  Text,
  Stack,
  Pagination,
  Select,
  Badge,
  Tooltip,
  LoadingOverlay,
  Center,
  Box,
} from '@mantine/core';
import {
  IconSearch,
  IconEdit,
  IconTrash,
  IconPlus,
  IconRefresh,
} from '@tabler/icons-react';

interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (item: T) => React.ReactNode;
  width?: number;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  selectable?: boolean;
  selectedItems?: T[];
  onSelectionChange?: (items: T[]) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onBulkDelete?: (items: T[]) => void;
  onCreate?: () => void;
  onRefresh?: () => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  title?: string;
  emptyMessage?: string;
  itemKey?: keyof T;
  actions?: (item: T) => React.ReactNode;
}

export function DataTable<T extends { id: number }>({
  data,
  columns,
  loading = false,
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  onEdit,
  onDelete,
  onBulkDelete,
  onCreate,
  onRefresh,
  searchable = true,
  searchPlaceholder = 'Search...',
  title,
  emptyMessage = 'No data available',
  itemKey = 'id' as keyof T,
  actions,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter data based on search query
  const filteredData = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    if (!searchQuery) return data;

    return data.filter((item) =>
      columns.some((column) => {
        const value = item[column.key as keyof T];
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchQuery.toLowerCase());
      })
    );
  }, [data, searchQuery, columns]);

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!filteredData || !Array.isArray(filteredData)) return [];
    if (!sortColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn as keyof T];
      const bValue = b[sortColumn as keyof T];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      const comparison = String(aValue).localeCompare(String(bValue));
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Paginate data
  const paginatedData = React.useMemo(() => {
    if (!sortedData || !Array.isArray(sortedData)) return [];
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil((sortedData?.length || 0) / pageSize);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    onSelectionChange(checked ? paginatedData : []);
  };

  const handleSelectItem = (item: T, checked: boolean) => {
    if (!onSelectionChange) return;

    const itemId = item[itemKey];
    if (checked) {
      onSelectionChange([...selectedItems, item]);
    } else {
      onSelectionChange(selectedItems.filter(selected => selected[itemKey] !== itemId));
    }
  };

  const isSelected = (item: T) => {
    const itemId = item[itemKey];
    return selectedItems.some(selected => selected[itemKey] === itemId);
  };

  const allSelected = paginatedData.length > 0 && paginatedData.every(item => isSelected(item));
  const someSelected = paginatedData.some(item => isSelected(item));

  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between">
          <Group>
            {title && <Text size="lg" fw="bold">{title}</Text>}
            <Badge variant="light" color="blue">
              {sortedData.length} items
            </Badge>
          </Group>

          <Group>
            {selectedItems.length > 0 && onBulkDelete && (
              <Button
                variant="outline"
                color="red"
                size="sm"
                leftSection={<IconTrash size={16} />}
                onClick={() => onBulkDelete(selectedItems)}
              >
                Delete Selected ({selectedItems.length})
              </Button>
            )}

            {onCreate && (
              <Button
                size="sm"
                leftSection={<IconPlus size={16} />}
                onClick={onCreate}
              >
                Create New
              </Button>
            )}

            {onRefresh && (
              <ActionIcon
                variant="outline"
                size="lg"
                onClick={onRefresh}
                loading={loading}
              >
                <IconRefresh size={16} />
              </ActionIcon>
            )}
          </Group>
        </Group>

        {/* Search and Filters */}
        {searchable && (
          <Group>
            <TextInput
              placeholder={searchPlaceholder}
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.currentTarget.value)}
              style={{ flex: 1 }}
            />
            <Select
              placeholder="Page size"
              value={pageSize.toString()}
              onChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}
              data={[
                { value: '5', label: '5 per page' },
                { value: '10', label: '10 per page' },
                { value: '25', label: '25 per page' },
                { value: '50', label: '50 per page' },
              ]}
              w={120}
            />
          </Group>
        )}

        {/* Table */}
        <Box pos="relative">
          <LoadingOverlay visible={loading} />

          {paginatedData.length === 0 ? (
            <Center py="xl">
              <Text c="dimmed">{emptyMessage}</Text>
            </Center>
          ) : (
            <Table highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  {selectable && (
                    <Table.Th w={40}>
                      <Checkbox
                        checked={allSelected}
                        indeterminate={someSelected && !allSelected}
                        onChange={(event) => handleSelectAll(event.currentTarget.checked)}
                      />
                    </Table.Th>
                  )}

                  {columns.map((column) => (
                    <Table.Th
                      key={String(column.key)}
                      w={column.width}
                      style={{
                        cursor: column.sortable ? 'pointer' : 'default',
                        userSelect: 'none',
                      }}
                      onClick={() => column.sortable && handleSort(String(column.key))}
                    >
                      <Group gap="xs" wrap="nowrap">
                        <Text size="sm" fw="bold">
                          {column.label}
                        </Text>
                        {column.sortable && sortColumn === String(column.key) && (
                          <Text size="xs" c="dimmed">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </Text>
                        )}
                      </Group>
                    </Table.Th>
                  ))}

                  {(onEdit || onDelete || actions) && (
                    <Table.Th w={100}>Actions</Table.Th>
                  )}
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {paginatedData.map((item) => (
                  <Table.Tr key={String(item[itemKey])}>
                    {selectable && (
                      <Table.Td>
                        <Checkbox
                          checked={isSelected(item)}
                          onChange={(event) => handleSelectItem(item, event.currentTarget.checked)}
                        />
                      </Table.Td>
                    )}

                    {columns.map((column) => (
                      <Table.Td key={String(column.key)}>
                        {column.render
                          ? column.render(item)
                          : String(item[column.key as keyof T] || '')
                        }
                      </Table.Td>
                    ))}

                    {(onEdit || onDelete || actions) && (
                      <Table.Td>
                        <Group gap="xs" wrap="nowrap">
                          {onEdit && (
                            <Tooltip label="Edit">
                              <ActionIcon
                                variant="subtle"
                                color="blue"
                                size="sm"
                                onClick={() => onEdit(item)}
                              >
                                <IconEdit size={16} />
                              </ActionIcon>
                            </Tooltip>
                          )}

                          {onDelete && (
                            <Tooltip label="Delete">
                              <ActionIcon
                                variant="subtle"
                                color="red"
                                size="sm"
                                onClick={() => onDelete(item)}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Tooltip>
                          )}

                          {actions && actions(item)}
                        </Group>
                      </Table.Td>
                    )}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Box>

        {/* Pagination */}
        {totalPages > 1 && (
          <Group justify="center">
            <Pagination
              value={currentPage}
              onChange={setCurrentPage}
              total={totalPages}
              size="sm"
            />
          </Group>
        )}
      </Stack>
    </Paper>
  );
}