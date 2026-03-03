/**
 * Type definitions for Legal Guides system
 * Provides TypeScript interfaces and types for managing legal guide content
 */

/**
 * Guide categories used throughout the application
 */
export type GuideCategory =
  | 'base-legal'
  | 'procedimentos'
  | 'modelos'
  | 'jurisprudencia'
  | 'expansao-regional';

/**
 * Metadata for individual legal guides
 * Contains all essential information about a guide
 */
export interface GuideMetadata {
  /** Unique identifier for the guide */
  id: string;
  /** URL-friendly identifier for the guide */
  slug: string;
  /** Display title of the guide */
  title: string;
  /** Brief description of the guide content */
  description: string;
  /** Category classification of the guide */
  category: GuideCategory;
  /** Order for sorting guides within a category */
  order: number;
  /** Path to the content file */
  contentFile: string;
  /** Estimated reading time in minutes */
  estimatedReadTime: number;
  /** ISO timestamp of last update */
  lastUpdated: string;
  /** Tags for categorization and search */
  tags: string[];
}

/**
 * Category information for organizing guides
 * Contains metadata and associated guides for each category
 */
export interface GuideCategoryInfo {
  /** Category identifier */
  id: GuideCategory;
  /** Display label for the category */
  label: string;
  /** Description of what guides in this category cover */
  description: string;
  /** Icon identifier for UI representation */
  icon: string;
  /** Order for sorting categories */
  order: number;
  /** Array of guides in this category */
  guides: GuideMetadata[];
}
