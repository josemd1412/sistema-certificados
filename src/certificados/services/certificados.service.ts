import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificado } from '../entities/certificados.entity';
import { Alumno } from '../entities/alumnos.entity';
import { CrearCertificadoDto } from '../dto/crear-certificado.dto';
import { FiltrosFiscaliaDto } from '../dto/filtros-fiscalizar.dto';

@Injectable()
export class CertificadosService {
  constructor(
    @InjectRepository(Certificado)
    private certificadosRepository: Repository<Certificado>,
    @InjectRepository(Alumno)
    private alumnosRepository: Repository<Alumno>,
  ) {}

  async crear(datos: CrearCertificadoDto): Promise<Certificado> {
    // Verificar que el alumno existe y está aprobado
    const alumno = await this.alumnosRepository.findOne({
      where: { idAlumno: datos.idAlumno },
      relations: ['curso']
    });

    if (!alumno) {
      throw new NotFoundException('Alumno no encontrado');
    }

    if (alumno.estadoAlumno !== 'APROBADO') {
      throw new BadRequestException('Solo se pueden generar certificados para alumnos aprobados');
    }

    // Verificar si ya tiene certificado activo
    const certificadoExistente = await this.certificadosRepository.findOne({
      where: { 
        idAlumno: datos.idAlumno,
        estado: 'ACTIVO'
      }
    });

    if (certificadoExistente) {
      throw new BadRequestException('El alumno ya tiene un certificado activo');
    }

    // Generar número de certificado único
    const numeroCertificado = await this.generarNumeroCertificado();
    const codigoVerificacion = this.generarCodigoVerificacion();

    const certificado = this.certificadosRepository.create({
      numeroCertificado,
      codigoVerificacion,
      idAlumno: datos.idAlumno,
      fechaEmision: datos.fechaEmision ? new Date(datos.fechaEmision) : new Date(),
    });

    return await this.certificadosRepository.save(certificado);
  }

  private async generarNumeroCertificado(): Promise<string> {
    const año = new Date().getFullYear();
    const ultimoCertificado = await this.certificadosRepository
      .createQueryBuilder('certificado')
      .where('EXTRACT(YEAR FROM certificado.fechaEmision) = :año', { año })
      .orderBy('certificado.createdAt', 'DESC')
      .getOne();

    let numero = 1;
    if (ultimoCertificado) {
      const partes = ultimoCertificado.numeroCertificado.split('-');
      numero = parseInt(partes[1]) + 1;
    }

    return `${año}-${numero.toString().padStart(6, '0')}`;
  }

  private generarCodigoVerificacion(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  async obtenerPorRangoFechas(filtros: FiltrosFiscaliaDto): Promise<any[]> {
    const query = `
      SELECT * FROM obtener_certificados_por_fechas($1, $2, $3, $4, $5)
    `;

    return await this.certificadosRepository.query(query, [
      filtros.fechaInicio,
      filtros.fechaFin,
      filtros.incluirAnulados || false,
      filtros.departamento || null,
      filtros.institucion || null
    ]);
  }

  async obtenerPorDni(dni: string, incluirAnulados = false): Promise<any[]> {
    const query = `
      SELECT * FROM obtener_certificados_por_dni($1, $2)
    `;

    return await this.certificadosRepository.query(query, [
      dni,
      incluirAnulados
    ]);
  }

  async generarReporteFiscalia(filtros: FiltrosFiscaliaDto): Promise<any[]> {
    const query = `
      SELECT * FROM reporte_fiscalia_completo($1, $2, $3)
    `;

    return await this.certificadosRepository.query(query, [
      filtros.fechaInicio,
      filtros.fechaFin,
      filtros.departamento || null
    ]);
  }

  async obtenerEstadisticas(fechaInicio: string, fechaFin: string): Promise<any> {
    const query = `
      SELECT * FROM estadisticas_certificados($1, $2)
    `;

    const resultado = await this.certificadosRepository.query(query, [
      fechaInicio,
      fechaFin
    ]);

    return resultado[0];
  }

  async anularCertificado(
    id: string, 
    motivo: string, 
    usuario: string
  ): Promise<Certificado> {
    const certificado = await this.certificadosRepository.findOne({
      where: { idCertificado: id }
    });

    if (!certificado) {
      throw new NotFoundException('Certificado no encontrado');
    }

    if (certificado.estado !== 'ACTIVO') {
      throw new BadRequestException('Solo se pueden anular certificados activos');
    }

    certificado.estado = 'ANULADO';
    certificado.motivoAnulacion = motivo;
    certificado.fAnulacion = new Date();
    certificado.usuarioAnulacion = usuario;

    return await this.certificadosRepository.save(certificado);
  }

  async verificarCertificadoPublico(codigo: string): Promise<any> {
    const query = `
      SELECT * FROM verificar_certificado_publico($1)
    `;

    const resultado = await this.certificadosRepository.query(query, [codigo]);
    return resultado[0] || null;
  }

  async actualizarArchivoPdf(
    certificadoId: string,
    rutaArchivo: string,
    hash: string,
    tamaño: number
  ): Promise<void> {
    await this.certificadosRepository.update(certificadoId, {
      pdfPath: rutaArchivo,
      pdfHash: hash,
      pdfSize: tamaño
    });
  }
}