import { Module } from '@nestjs/common';
import { HttpProvider } from './rest-http-provider.service';

@Module({
  providers: [HttpProvider],
  exports: [HttpProvider],
})
export class HttpProviderModule {}