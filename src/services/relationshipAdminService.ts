import { apiClient } from './apiClient';

export interface RelationshipEntity {
  id: string;
  name: string;
  entity_type: 'character' | 'organization';
  image: string;
}

export interface RelationshipDuplicateCheck {
  exists: boolean;
  context: string;
}

export interface CreateRelationshipPayload {
  source_id: string;
  target_id: string;
  relationship: string;
  type?: string;
  context?: string;
  inverse_relationship?: string;
  overwrite: boolean;
}

export const searchEntities = async (query: string): Promise<RelationshipEntity[]> => {
  if (!query || query.length < 2) return [];
  return apiClient.get('/admin/relationships/search-entities', { params: { q: query } });
};

export const checkRelationship = async (sourceId: string, targetId: string, relationship: string): Promise<RelationshipDuplicateCheck | null> => {
  if (!sourceId || !targetId || !relationship) return null;
  try {
    return apiClient.get('/admin/relationships/check', {
      params: { source_id: sourceId, target_id: targetId, relationship }
    });
  } catch (error) {
    console.error('Error checking relationship:', error);
    return null;
  }
};

export const createRelationship = async (payload: CreateRelationshipPayload): Promise<any> => {
  return apiClient.post('/admin/relationships', payload);
};

export const fetchRelationshipTypes = async (): Promise<string[]> => {
  try {
    return apiClient.get('/admin/relationships/types');
  } catch (error) {
    console.error('Error fetching relationship types:', error);
    return [];
  }
};

export const fetchCommonWords = async (): Promise<string[]> => {
  try {
    return apiClient.get('/admin/relationships/common-words');
  } catch (error) {
    console.error('Error fetching common words:', error);
    return [];
  }
};
