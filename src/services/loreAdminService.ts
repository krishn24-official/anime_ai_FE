import { apiClient } from './apiClient';

export interface LoreUploadResult {
  series_id: string;
  chunks_created: number;
  source_file: string;
}

export interface LoreStatus {
  series_id: string;
  chunks_count: number;
  source_files: string[];
}

export interface LoreDeleteResult {
  series_id: string;
  chunks_deleted: number;
}

export async function uploadLorePdf(
  file: File,
  seriesId: string,
  characterIds?: string[]
): Promise<LoreUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('series_id', seriesId);
  if (characterIds && characterIds.length > 0) {
    formData.append('character_ids', JSON.stringify(characterIds));
  }
  return apiClient.post<LoreUploadResult>('/admin/lore/upload', formData);
}

export async function getLoreStatus(seriesId: string): Promise<LoreStatus> {
  return apiClient.get<LoreStatus>('/admin/lore/' + encodeURIComponent(seriesId) + '/status');
}

export async function deleteLore(seriesId: string): Promise<LoreDeleteResult> {
  return apiClient.delete<LoreDeleteResult>('/admin/lore/' + encodeURIComponent(seriesId));
}

export const loreAdminService = {
  uploadLorePdf,
  getLoreStatus,
  deleteLore,
};
