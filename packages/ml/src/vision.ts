import { Image } from '../img'

export interface Vision {
  hasText (image: Image): Promise<boolean>
}
