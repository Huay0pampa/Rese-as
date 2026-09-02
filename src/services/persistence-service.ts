import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { NormalizedExportRecord, FileMetadata } from '@/types';

/**
 * Service managing persistence with Supabase.
 * Architecture shell prepared for future implementation (Phase 2+).
 */
export class PersistenceService {
  /**
   * Check connection status
   */
  static isAvailable(): boolean {
    return isSupabaseConfigured();
  }

  /**
   * Save uploaded dataset to Supabase DB (placeholder interface)
   */
  static async saveExportDataset(
    metadata: FileMetadata,
    records: NormalizedExportRecord[]
  ): Promise<{ success: boolean; datasetId?: string; error?: string }> {
    const client = getSupabaseClient();
    if (!client) {
      return {
        success: false,
        error: 'Supabase no está configurado en las variables de entorno.',
      };
    }
    console.log(`Saving dataset ${metadata.fileName} (${records.length} records) to Supabase`);
    // Prepared shell for DB table inserts
    return { success: true, datasetId: `ds-${Date.now()}` };
  }
}
