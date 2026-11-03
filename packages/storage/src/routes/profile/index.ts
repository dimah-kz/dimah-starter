import { avatar } from "./avatar"
import { logo } from "./logo"

/** Profile images: the signed-in user and the active organization. */
export const profile = {
  avatar,
  logo,
}

export {
  imageRoutes,
  toCallerScope,
  toProfileScope,
  type ImageRoute,
} from "./scope"
