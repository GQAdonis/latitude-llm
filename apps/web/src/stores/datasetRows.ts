import type { DatasetRow, DatasetV2 } from '@latitude-data/core/browser'
import useFetcher from '$/hooks/useFetcher'
import { compact } from 'lodash-es'
import { ROUTES } from '$/services/routes'
import useSWR, { SWRConfiguration } from 'swr'
import { compactObject } from '@latitude-data/core/lib/compactObject'
import { DatasetRowData } from '@latitude-data/core/schema'

export type ClientDatasetRow = DatasetRow & {
  cells: DatasetRowData[keyof DatasetRowData][]
}
export function buildDatasetRowKey({
  datasetId,
  page,
  pageSize,
}: {
  datasetId: number | undefined
  page?: string | null | undefined
  pageSize?: string | null
}) {
  return compact([
    'datasetRows',
    datasetId,
    page ? +page : undefined,
    pageSize ? +pageSize : undefined,
  ])
}

export default function useDatasetRows(
  {
    dataset,
    page,
    pageSize,
    onFetched,
    enabled = true,
  }: {
    dataset?: DatasetV2
    page?: string | null | undefined
    pageSize?: string | null
    onFetched?: (datasets: ClientDatasetRow[]) => void
    enabled?: boolean
  },
  opts?: SWRConfiguration,
) {
  const isEnabled = dataset && enabled
  console.log('FETCH_ROWS_ENABLED', isEnabled)
  const fetcher = useFetcher(
    isEnabled ? ROUTES.api.datasetsRows.root : undefined,
    {
      serializer: dataset ? serializeRows(dataset.columns) : undefined,
      searchParams: compactObject({
        datasetId: dataset?.id,
        page: page ? String(page) : undefined,
        pageSize: pageSize ? String(pageSize) : undefined,
      }) as Record<string, string>,
    },
  )
  const {
    data = [],
    mutate,
    ...rest
  } = useSWR<ClientDatasetRow[]>(
    isEnabled
      ? buildDatasetRowKey({ datasetId: dataset.id, page, pageSize })
      : undefined,
    fetcher,
    {
      ...opts,
      fallbackData: opts?.fallbackData
        ? dataset
          ? serializeRows(dataset.columns)(opts.fallbackData)
          : undefined
        : undefined,
      onSuccess: (data) => {
        onFetched?.(data)
      },
    },
  )

  return {
    data,
    mutate,
    ...rest,
  }
}

export const serializeRows =
  (columns: DatasetV2['columns']) =>
  (rows: DatasetRow[]): ClientDatasetRow[] => {
    return rows.map((item) => {
      return {
        ...item,
        cells: columns.map(
          ({ identifier }) => item.rowData[identifier] ?? null,
        ),
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      }
    })
  }
