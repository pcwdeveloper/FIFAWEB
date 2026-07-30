import { environment } from '../../../environments/environment';

/**
 * Resolves a backend-relative asset path (e.g. a venue thumbnail's `/uploads/venues/xxx.jpg`)
 * into an absolute URL, using the API origin rather than `apiBaseUrl` itself (which may include
 * an `/api` suffix that must not be duplicated in front of a static resource path).
 */
export function resolveAssetUrl(path: string | null | undefined): string | null {
  if (!path) {
    return null;
  }
  const origin = environment.apiBaseUrl.replace(/\/api\/?$/, '');
  return `${origin}${path}`;
}

/**
 * The DB/API only stores a venue thumbnail's bare file name — this rebuilds the
 * `/uploads/venues/<file>` path the backend's static resource handler actually serves.
 */
export function resolveVenueThumbnailUrl(fileName: string | null | undefined): string | null {
  if (!fileName) {
    return null;
  }
  return resolveAssetUrl(`/uploads/venues/${fileName}`);
}
