import express from 'express';
import {
  globalSearch,
  getSearchSuggestions,
  getTrendingSearches,
  getSearchFilters
} from '../controllers/searchController';
import { validatePagination, validateSearch } from '../utils/validation';

const router = express.Router();

// Public search routes
router.get('/', validatePagination, validateSearch, globalSearch as any);
router.get('/suggestions', getSearchSuggestions as any);
router.get('/trending', getTrendingSearches as any);
router.get('/filters', getSearchFilters as any);

export default router;
