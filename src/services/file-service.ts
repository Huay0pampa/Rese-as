import { processExportFile, ProcessedPipelineResult } from '@/lib/processing/processor';
import { ACCEPTED_FILE_EXTENSIONS } from '@/lib/constants/schema';

/**
 * Service managing file validation and execution of the data pipeline.
 */
export class FileService {
  /**
   * Check whether a file has an accepted extension (.xlsx, .xls, .csv)
   */
  static isFileTypeAccepted(file: File): boolean {
    const fileName = file.name.toLowerCase();
    return ACCEPTED_FILE_EXTENSIONS.some((ext) => fileName.endsWith(ext));
  }

  /**
   * Process uploaded Excel or CSV file
   */
  static async processFile(file: File): Promise<ProcessedPipelineResult> {
    if (!this.isFileTypeAccepted(file)) {
      throw new Error(
        `Formato no soportado. Por favor sube un archivo con extensión ${ACCEPTED_FILE_EXTENSIONS.join(
          ', '
        )}`
      );
    }
    return await processExportFile(file);
  }
}
