import { Image } from '@alfa/img'

export interface Vision {
  hasText (image: Image): Promise<boolean>
}
