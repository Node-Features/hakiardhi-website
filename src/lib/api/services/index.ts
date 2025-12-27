/**
 * Central export for all API services
 * Import services from this file for cleaner imports
 *
 * Example usage:
 * import { projectsService, activitiesService } from '@/lib/api/services';
 */

export { authService } from './auth';
export { projectsService } from './projects';
export { activitiesService } from './activities';
export { legalAidService } from './legal-aid';
export { casesService } from './cases';
export { incidentsService } from './incidents';
export { beneficiariesService } from './beneficiaries';
export { usersService } from './users';
export { rolesService } from './roles';
export { permissionsService } from './permissions';
export { uploadsService } from './uploads';
export {
  settingsService,
  locationsService,
  contentService,
  navigationService,
  analyticsService,
} from './settings';
