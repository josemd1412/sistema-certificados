import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificadosController } from './controllers/certificados.controller';

// services
import { CertificadosService } from './services/certificados.service';
import { UbicacionesService } from './services/ubicaciones.service';
import { ArchivoService } from 'src/common/archivo.service';
import { InstitucionesService } from './services/instituciones.service';
import { InstructoresService} from './services/instructores.service';
import { AlumnosService } from './services/alumnos.service';
import { CursosService } from './services/cursos.service';

// Entities
import { Certificado } from './entities/certificados.entity';
import { Ubicacion } from './entities/ubicaciones.entity';
import { Institucion } from './entities/instituciones.entity';
import { Instructor } from './entities/instructores.entity';
import { Curso } from './entities/cursos.entity';
import { Alumno } from './entities/alumnos.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ubicacion,
      Institucion,
      Instructor,
      Curso,
      Alumno,
      Certificado
    ]),
  ],
  controllers: [CertificadosController],
  providers: [
    CertificadosService, 
    UbicacionesService,
    ArchivoService,
    InstructoresService,
    InstitucionesService,
    CursosService,
    AlumnosService,
  ],
  exports: [CertificadosService, UbicacionesService, ArchivoService, InstructoresService, CursosService, AlumnosService]
})
export class CertificadosModule {}