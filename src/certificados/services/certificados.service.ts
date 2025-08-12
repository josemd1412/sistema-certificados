import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Certificado } from '../entities/certificados.entity';
import { Alumno } from '../entities/alumnos.entity';
import { CrearCertificadoDto } from '../dto/crear-certificado.dto';
import { FiltrosFiscalizarDto } from '../dto/filtros-fiscalizar.dto';

@Injectable()
export class CertificadosService {
  constructor(
    @InjectRepository(Certificado)
    private certificadosRepository: Repository<Certificado>,
    @InjectRepository(Alumno)
    private alumnosRepository: Repository<Alumno>,
    private dataSource: DataSource,
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

    if (alumno.estado !== 'APROBADO') {
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

    // Crear certificado - los triggers de la BD generarán número y código automáticamente
    const certificado = this.certificadosRepository.create({
      numeroCertificado: datos.numeroCertificado,
      idAlumno: datos.idAlumno,
      pdfPath: datos.pdfPath,
      pdfHash: datos.pdfHash,
      pdfSize: datos.pdfSize,
      codigoVerificacion: datos.codigoVerificacion,
    });

    return await this.certificadosRepository.save(certificado);
  }

  // Ya no necesitamos estos métodos, los triggers de la BD se encargan
  // de generar números y códigos automáticamente

  async obtenerPorRangoFechas(filtros: FiltrosFiscalizarDto): Promise<any[]> {
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

  async generarReporteFiscalia(filtros: FiltrosFiscalizarDto): Promise<any[]> {
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

  async verificarCertificadoPorCodigo(codigo: string): Promise<any> {
    const certificado = await this.certificadosRepository.findOne({
      where: { codigoVerificacion: codigo },
      relations: ['alumno', 'alumno.curso', 'alumno.curso.instructor', 'alumno.curso.institucion']
    });

    if (!certificado) {
      throw new NotFoundException('Certificado no encontrado');
    }

    return certificado;
  }

  async buscarPorNumero(numero: string): Promise<Certificado> {
    const certificado = await this.certificadosRepository.findOne({
      where: { numeroCertificado: numero },
      relations: ['alumno']
    });

    if (!certificado) {
      throw new NotFoundException('Certificado no encontrado');
    }

    return certificado;
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