// Shared publication types

export type PublicationStatus = 'draft' | 'review' | 'published' | 'archived' | 'withdrawn';

export type PublicationLanguage = 'english' | 'swahili';

export type AccessLevel = 'public' | 'restricted' | 'internal';

export interface BasePublication {
  id: string;
  title: string;
  title_alternate?: string; // Alternate language title
  description: string;
  slug: string;
  status: PublicationStatus;
  language: PublicationLanguage;
  access_level: AccessLevel;
  file_url: string;
  file_url_low_data?: string;
  file_size_bytes: number;
  file_size_low_data_bytes?: number;
  thumbnail_url?: string;
  version: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  published_at?: Date;
  published_by?: string;
}

export interface Version {
  id: string;
  publication_id: string;
  resource_type: string;
  version_number: string;
  version_notes: string;
  version_type: 'major' | 'minor';
  file_url: string;
  file_hash: string;
  created_by: string;
  archived: boolean;
  created_at: Date;
  updated_at?: Date;
  metadata?: Record<string, any>;
}

export interface VersionDiff {
  version1: string;
  version2: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  fileChanged: boolean;
  metadataChanged: boolean;
}

export interface IndexableContent {
  id: string;
  type: string;
  title: string;
  content: string;
  language: PublicationLanguage;
  metadata: Record<string, any>;
}

export interface SearchOptions {
  query: string;
  types?: string[];
  language?: PublicationLanguage;
  filters?: Record<string, any>;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  excerpt: string;
  url: string;
  relevanceScore: number;
  matchedKeywords: string[];
  metadata: Record<string, any>;
}

export interface SearchResults {
  query: string;
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  facets?: Record<string, any>;
}

export interface Facets {
  types: { type: string; count: number }[];
  languages: { language: string; count: number }[];
  years?: { year: number; count: number }[];
  [key: string]: any;
}
