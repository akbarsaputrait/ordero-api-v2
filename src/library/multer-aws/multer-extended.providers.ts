import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { MULTER_EXTENDED_S3_MODULE_ID, MULTER_EXTENDED_S3_OPTIONS, MULTER_MODULE_OPTIONS } from './constants';
import { MulterExtendedS3Options } from './interfaces';
import { MulterConfigLoader } from './multer-config.loader';

export const createMulterOptionsFactory = {
  provide: MULTER_MODULE_OPTIONS,
  useFactory: async (loader: MulterConfigLoader) => await loader.createMulterOptions(),
  inject: [MulterConfigLoader],
};

export function createMulterExtendedProviders(options: MulterExtendedS3Options) {
  return [
    {
      provide: MULTER_EXTENDED_S3_OPTIONS,
      useValue: options,
    },
    {
      provide: MULTER_EXTENDED_S3_MODULE_ID,
      useValue: randomStringGenerator(),
    },
    createMulterOptionsFactory,
  ];
}
