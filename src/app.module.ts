import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificatosModulo } from './certificados/certificados.module';
@Module({
  imports: [TypeOrmModule.forRoot(), CertificatosModulo],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
