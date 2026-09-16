import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { SummaryMetrics, ActiveFilters } from '@/types';

export interface AnalysisHistoryItem {
  id: string;
  fileName: string;
  recordCount: number;
  qualityScore?: number;
  dimension: string;
  metric: string;
  operation: string;
  activeFilters?: ActiveFilters;
  summaryMetrics?: SummaryMetrics;
  createdAt: string;
}

const LOCAL_STORAGE_KEY = 'analizador_exportaciones_history_v1';

export class PersistenceService {
  /**
   * Check connection status
   */
  static isAvailable(): boolean {
    return isSupabaseConfigured();
  }

  /**
   * Save analysis snapshot to Supabase or localStorage fallback
   */
  static async saveAnalysisHistory(item: Omit<AnalysisHistoryItem, 'id' | 'createdAt'>): Promise<{ success: boolean; id?: string; error?: string }> {
    const client = getSupabaseClient();
    const createdAt = new Date().toISOString();

    // If Supabase is available and user is authenticated
    if (client) {
      try {
        const { data: { user } } = await client.auth.getUser();
        if (user) {
          const { data, error } = await client
            .from('analysis_history')
            .insert({
              user_id: user.id,
              file_name: item.fileName,
              record_count: item.recordCount,
              quality_score: item.qualityScore ?? 100,
              dimension: item.dimension,
              metric: item.metric,
              operation: item.operation,
              active_filters: item.activeFilters || {},
              summary_metrics: item.summaryMetrics || {},
            })
            .select('id')
            .single();

          if (error) {
            console.error('Error saving to Supabase history:', error);
            // Fallback to localStorage on error
          } else if (data) {
            return { success: true, id: data.id };
          }
        }
      } catch (err) {
        console.warn('Supabase DB error, using local fallback:', err);
      }
    }

    // Local Storage Fallback
    try {
      const localId = `local-${Date.now()}`;
      const newItem: AnalysisHistoryItem = { ...item, id: localId, createdAt };
      const existing = this.getLocalHistory();
      const updated = [newItem, ...existing].slice(0, 50); // limit to 50 items
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return { success: true, id: localId };
    } catch (err) {
      return { success: false, error: 'Error al guardar el análisis en almacenamiento local.' };
    }
  }

  /**
   * Get user analysis history from Supabase or localStorage
   */
  static async getAnalysisHistory(): Promise<AnalysisHistoryItem[]> {
    const client = getSupabaseClient();

    if (client) {
      try {
        const { data: { user } } = await client.auth.getUser();
        if (user) {
          const { data, error } = await client
            .from('analysis_history')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (!error && data) {
            return data.map((row) => ({
              id: row.id,
              fileName: row.file_name,
              recordCount: row.record_count,
              qualityScore: row.quality_score,
              dimension: row.dimension,
              metric: row.metric,
              operation: row.operation,
              activeFilters: row.active_filters,
              summaryMetrics: row.summary_metrics,
              createdAt: row.created_at,
            }));
          }
        }
      } catch (err) {
        console.warn('Error fetching Supabase history, using local fallback:', err);
      }
    }

    return this.getLocalHistory();
  }

  /**
   * Delete an analysis item from history
   */
  static async deleteAnalysisHistoryItem(id: string): Promise<boolean> {
    const client = getSupabaseClient();

    if (client && !id.startsWith('local-')) {
      try {
        const { error } = await client
          .from('analysis_history')
          .delete()
          .eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.error('Error deleting from Supabase:', err);
      }
    }

    // Remove from local storage
    try {
      const existing = this.getLocalHistory();
      const filtered = existing.filter((item) => item.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Private helper to read local storage history
   */
  private static getLocalHistory(): AnalysisHistoryItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      // Validate structure to prevent prototype pollution or invalid data
      const validItems: AnalysisHistoryItem[] = [];
      for (const item of parsed) {
        if (
          item &&
          typeof item === 'object' &&
          typeof item.id === 'string' &&
          typeof item.fileName === 'string' &&
          typeof item.recordCount === 'number' &&
          typeof item.dimension === 'string' &&
          typeof item.metric === 'string' &&
          typeof item.operation === 'string' &&
          typeof item.createdAt === 'string'
        ) {
          validItems.push(item as AnalysisHistoryItem);
        }
      }
      return validItems;
    } catch {
      return [];
    }
  }
}
