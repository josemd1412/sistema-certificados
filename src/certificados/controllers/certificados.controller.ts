import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Body, 
  Param, 
  Query, 
  Res,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import * as json2csv from 'json2csv';
import { CertificadosService } from '../services/certificados.service';
import { CrearCertificadoDto } from '../dto/crear-certificado.dto';
import { FiltrosFiscaliaDto } from '../dto/filtros-fiscalizar.dto';
import { Certificado } from '../entities/certificados.entity';
import { ArchivoService } from 'src/common/archivo.service';
import { UbicacionesService } from '../services/ubicaciones.service';
import { NotFoundException } from '@nestjs/common'; 
import { Multer } from 'multer';

@Controller('certificados')
export class CertificadosController {
  constructor(
    private readonly certificadosService: CertificadosService,
    private readonly ubicacionesService: UbicacionesService,
    private readonly archivoService: ArchivoService
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('archivo'))
  async crear(
    @Body() datos: CrearCertificadoDto,
    @UploadedFile() archivo?: Multer.File
  ): Promise<{ certificado: Certificado; mensaje: string }> {
    
    const certificado = await this.certificadosService.crear(datos);

    if (archivo) {
      const archivoInfo = await this.archivoService.guardarCertificado(
        archivo.buffer,
        certificado.numeroCertificado,
        certificado.fechaEmision
      );

      await this.certificadosService.actualizarArchivoPdf(
        certificado.idCertificado,
        archivoInfo.path,
        archivoInfo.hash,
        archivoInfo.size
      );
    }

    return {
      certificado,
      mensaje: 'Certificado creado exitosamente'
    };
  }

  @Post('buscar')
  async buscarPorFiltros(@Body() filtros: FiltrosFiscaliaDto) {
    return await this.certificadosService.obtenerPorRangoFechas(filtros);
  }

  @Get('dni/:dni')
  async obtenerPorDni(
    @Param('dni') dni: string,
    @Query('incluir_anulados') incluirAnulados = false
  ) {
    return await this.certificadosService.obtenerPorDni(dni, incluirAnulados);
  }

  @Post('reporte-fiscalia')
  async generarReporteFiscalia(
    @Body() filtros: FiltrosFiscaliaDto,
    @Query('formato') formato: 'json' | 'csv' = 'json',
    @Res() res: Response
  ) {
    try {
      const datos = await this.certificadosService.generarReporteFiscalia(filtros);

      if (formato === 'csv') {
        const csv = json2csv.parse(datos, {
          delimiter: ';',
          encoding: 'utf8'
        });

        const nombreArchivo = `reporte_fiscalia_${filtros.fechaInicio}_${filtros.fechaFin}.csv`;
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
        res.send('\ufeff' + csv);
      } else {
        res.json({
          filtros,
          totalRegistros: datos.length,
          datos
        });
      }
    } catch (error) {
      throw new HttpException(
        'Error generando reporte de fiscalía',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('estadisticas/resumen')
  async obtenerEstadisticas(
    @Query('fecha_inicio') fechaInicio: string,
    @Query('fecha_fin') fechaFin: string
  ) {
    return await this.certificadosService.obtenerEstadisticas(fechaInicio, fechaFin);
  }

  @Get('verificar/:codigo')
  async verificarCertificadoPublico(@Param('codigo') codigo: string) {
    const certificado = await this.certificadosService.verificarCertificadoPublico(codigo);
    
    if (!certificado) {
      throw new NotFoundException('Certificado no encontrado');
    }

    return certificado;
  }

  @Put(':id/anular')
  async anular(
    @Param('id') id: string,
    @Body() datos: { motivo: string; usuario: string }
  ) {
    const certificado = await this.certificadosService.anularCertificado(
      id,
      datos.motivo,
      datos.usuario
    );

    return {
      certificado,
      mensaje: 'Certificado anulado exitosamente'
    };
  }

  @Get('ubicaciones')
  async obtenerUbicaciones() {
    return await this.ubicacionesService.obtenerTodas();
  }

  @Get('ubicaciones/departamento/:departamento')
  async obtenerUbicacionesPorDepartamento(@Param('departamento') departamento: string) {
    return await this.ubicacionesService.obtenerPorDepartamento(departamento);
  }
}