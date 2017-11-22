import { Image } from '@endal/img'

export interface Vision {
  hasText (image: Image): Promise<boolean>
}
