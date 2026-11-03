import { profile } from "./profile"

/**
 * Flat route map for `dimahS3`. Add a group under `routes/<group>/`,
 * then spread it here.
 */
export const routes = {
  ...profile,
}

export {
  imageRoutes,
  toCallerScope,
  toProfileScope,
  type ImageRoute,
} from "./profile"
