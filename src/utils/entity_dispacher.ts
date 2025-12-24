import { supabase } from '@/lib/database/supabase_client';
import { redisService } from '@/lib/services/redis.service';

export type FileEntityType = 'activity' | 'stage' | 'incident';

export interface FileRecordInput {
  file_url: string;
  file_name: string;
  file_type?: string;
  size?: number;
  description?: string;
  status?: 'pending' | 'processing' | 'processed' | 'failed';
}

export interface FileDispatcherOptions {
  entityType: FileEntityType;
  entityId: string; // activity_id, case_id, or incident_id
  stageId?: string; // only required for stage_attachments
  project_id?: string; // required for activity_files
  files: FileRecordInput[];
}

/**
 * Dispatch processed files to their respective entity tables
 */
export async function dispatchFiles({
  entityType,
  entityId,
  stageId,
  project_id,
  files,
}: FileDispatcherOptions) {

  const db = supabase(false);

  // Prepare records based on entity type
  let tableName: string;
  const records: any[] = files.map((f) => ({
    file_url: f.file_url,
    file_name: f.file_name,
    file_type: f.file_type || 'image',
    size: f.size || 0,
    description: f.description || null,
    status: f.status || 'processed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  switch (entityType) {
    case 'activity':
      tableName = 'activity_files';
      records.forEach((r) => {
        r.activity_id = entityId;
        if (project_id) r.project_id = project_id;
      });
      break;
    case 'stage':
      tableName = 'stage_attachments';
      records.forEach((r) => {
        r.case_id = entityId;
        r.stage_id = stageId;
      });
      break;
    case 'incident':
      tableName = 'incident_files';
      records.forEach((r) => (r.incident_id = entityId));
      break;
    default:
      throw new Error(`Unknown entity type: ${entityType}`);
  }

  // Insert records into DB
  const { data, error } = await db.from(tableName).insert(records);

  if (error) {
    console.error(`Failed to insert files into ${tableName}:`, error);
    throw error;
  }

  // Cache result in Redis for monitoring
  const cacheKey = `files:${entityType}:${entityId}`;
  await redisService.getClient().setex(cacheKey, 3600, JSON.stringify(data));

  return data;
}