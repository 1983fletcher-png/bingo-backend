/**
 * Dynamic Image Ingestion Pipeline — public API
 *
 * Master sources, validation, fetcher, and figure pipeline.
 * Use runFigurePipeline or runPipelineFromConfig for end-to-end ingest.
 */

export {
  MASTER_SOURCES,
  IMAGE_CATEGORIES,
  LICENSE_TYPES,
  ALLOWED_LICENSES_DISPLAY,
  getSourceById,
  getSourceForUrl,
} from './sources.js';

export {
  validateLicense,
  validateDimensions,
  validateSourceUrl,
  validateConcept,
  validateCandidate,
  contentHash,
  DEFAULT_MIN_WIDTH,
  DEFAULT_MIN_HEIGHT,
} from './validate.js';

export { searchCommons, searchNasa, fetchByKeywords, fetchImageBuffer } from './fetcher.js';

export {
  runFigurePipeline,
  runPipelineFromConfig,
  slugifyFigureName,
  FIGURES_PREFIX,
} from './figurePipeline.js';
