import { asc, eq, getTableColumns, inArray } from 'drizzle-orm'
import { database } from '../../client'
import { datasets, workspaces } from '../../schema'
import { Workspace } from '../../browser'
import {
  migrateWorkspaceDatasetsToV2,
  type MigratedWorkspaceDatasetsToV2Result,
} from './utils/migrateWorkspaceDatasetsToV2'

const tt = getTableColumns(workspaces)
function findWorkspacesWithDatasetsQuery(db = database) {
  return db
    .select(tt)
    .from(workspaces)
    .innerJoin(datasets, eq(workspaces.id, datasets.workspaceId))
    .groupBy(workspaces.id)
    .orderBy(asc(workspaces.id))
}

export async function migrateDatasetsV1ToV2({
  targetWorkspaces,
  workspaceMigrator = migrateWorkspaceDatasetsToV2,
}: {
  targetWorkspaces: number[] | 'all'
  workspaceMigrator?: typeof migrateWorkspaceDatasetsToV2
}) {
  const query = findWorkspacesWithDatasetsQuery()
  let selectedWorkspaces: Workspace[] = []

  if (Array.isArray(targetWorkspaces)) {
    selectedWorkspaces = await query.where(
      inArray(workspaces.id, targetWorkspaces),
    )
  } else {
    selectedWorkspaces = await query
  }

  let results: MigratedWorkspaceDatasetsToV2Result[] = []

  for (const workspace of selectedWorkspaces) {
    const result = await workspaceMigrator({
      workspace: workspace as Workspace,
    })
    results.push(result)
  }

  return results
}
