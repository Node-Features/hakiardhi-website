/**
 * API Data Transformers
 * Converts API response data to local application format
 */

import { Publication } from '@/data/research';
import { APIPublication } from '@/types/api';

/**
 * Transform API publication data to local Publication interface
 *
 * Key transformations:
 * - authors: APIPublicationAuthor[] -> string[] (with affiliations)
 * - publication_date (snake_case) -> publicationDate (camelCase)
 * - topics (array) -> topic (array)
 * - download_url -> downloadUrl
 * - cover_image -> coverImage
 * - is_featured -> featured
 *
 * @param apiPub - Publication data from API
 * @returns Publication data in local format
 */
export function transformAPIPublicationToLocal(
  apiPub: APIPublication
): Publication {
  return {
    id: apiPub.id,
    title: apiPub.title,
    // Convert author objects to strings with affiliations in parentheses
    authors: apiPub.authors.map(a =>
      a.affiliation ? `${a.name} (${a.affiliation})` : a.name
    ),
    publicationDate: apiPub.publication_date,  // Rename to camelCase
    type: apiPub.type as Publication['type'],  // Type assertion for literal types
    topic: apiPub.topics,  // Rename topics -> topic
    abstract: apiPub.abstract,
    downloadUrl: apiPub.download_url,
    coverImage: apiPub.cover_image || undefined,  // Convert null to undefined
    downloads: apiPub.downloads,
    featured: apiPub.is_featured,
    pages: apiPub.pages,
  };
}

/**
 * Transform array of API publications to local format
 *
 * @param apiPublications - Array of publications from API
 * @returns Array of publications in local format
 */
export function transformAPIPublicationsToLocal(
  apiPublications: APIPublication[]
): Publication[] {
  return apiPublications.map(transformAPIPublicationToLocal);
}
