import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alumno } from '../entities/alumnos.entity';
import { Curso } from '../entities/cursos.entity';
import { CrearAlumnoDto } from '../dto/crear-alumno.dto';
import { ActualizarAlumnoDto } from '../dto/actualizar-alumno.dto';

@Injectable()
export class AlumnosService {
  constructor(
    @InjectRepository(Alumno)
    private alumnosRepository: Repository<Alumno>,
    @InjectRepository(Curso)
    private cursosRepository: Repository<Curso>,
  ) {}

  async crear(datos: CrearAlumnoDto): Promise<Alumno> {
    // Verificar que el curso existe
    const curso = await this.cursosRepository.findOne({
      where: { idCurso: datos.idCurso }
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }

    // Si se proporciona DNI, verificar que no exista otro alumno con el mismo DNI en el mismo curso
    if (datos.dni) {
      const existente = await this.alumnosRepository.findOne({
        where: { 
          idCurso: datos.idCurso,
          dni: datos.dni 
        }
      });

      if (existente) {
        throw new BadRequestException('Ya existe un alumno con ese DNI en este curso');
      }
    }

    const alumno = this.alumnosRepository.create({
      idCurso: datos.idCurso,
      nombreCompleto: datos.nombreCompleto,
      dni: datos.dni,
      telefono: datos.telefono,
      email: datos.email,
      fechaInscripcion: new Date(datos.fechaInscripcion),
      estado: 'INSCRITO',
      observaciones: datos.observaciones,
    });

    return await this.alumnosRepository.save(alumno);
  }

  async obtenerTodos(): Promise<Alumno[]> {
    return await this.alumnosRepository.find({
      relations: ['curso', 'curso.instructor', 'curso.institucion'],
      order: { fechaInscripcion: 'DESC' }
    });
  }

  async obtenerPorId(id: number): Promise<Alumno> {
    const alumno = await this.alumnosRepository.findOne({
      where: { idAlumno: id },
      relations: ['curso', 'curso.instructor', 'curso.institucion', 'certificados']
    });

    if (!alumno) {
      throw new NotFoundException(`Alumno con ID ${id} no encontrado`);
    }

    return alumno;
  }

  async obtenerPorCurso(idCurso: number): Promise<Alumno[]> {
    return await this.alumnosRepository.find({
      where: { idCurso },
      relations: ['curso'],
      order: { nombreCompleto: 'ASC' }
    });
  }

  async obtenerPorDni(dni: string): Promise<Alumno[]> {
    return await this.alumnosRepository.find({
      where: { dni },
      relations: ['curso', 'curso.instructor', 'curso.institucion', 'certificados'],
      order: { fechaInscripcion: 'DESC' }
    });
  }

  async obtenerPorEstado(estado: string): Promise<Alumno[]> {
    return await this.alumnosRepository.find({
      where: { estado },
      relations: ['curso', 'curso.instructor', 'curso.institucion'],
      order: { fechaInscripcion: 'DESC' }
    });
  }

  async obtenerAprobados(): Promise<Alumno[]> {
    return await this.obtenerPorEstado('APROBADO');
  }

  async obtenerPorRangoFechas(fechaInicio: string, fechaFin: string): Promise<Alumno[]> {
    return await this.alumnosRepository
      .createQueryBuilder('alumno')
      .leftJoinAndSelect('alumno.curso', 'curso')
      .leftJoinAndSelect('curso.instructor', 'instructor')
      .leftJoinAndSelect('curso.institucion', 'institucion')
      .where('DATE(alumno.fechaInscripcion) >= :fechaInicio', { fechaInicio })
      .andWhere('DATE(alumno.fechaInscripcion) <= :fechaFin', { fechaFin })
      .orderBy('alumno.fechaInscripcion', 'DESC')
      .getMany();
  }

  async buscarPorNombre(nombre: string): Promise<Alumno[]> {
    return await this.alumnosRepository
      .createQueryBuilder('alumno')
      .leftJoinAndSelect('alumno.curso', 'curso')
      .leftJoinAndSelect('curso.instructor', 'instructor')
      .leftJoinAndSelect('curso.institucion', 'institucion')
      .where('alumno.nombreCompleto ILIKE :nombre', { nombre: `%${nombre}%` })
      .orderBy('alumno.nombreCompleto', 'ASC')
      .getMany();
  }

  async actualizar(id: number, datos: ActualizarAlumnoDto): Promise<Alumno> {
    const alumno = await this.obtenerPorId(id);

    // Validaciones específicas según el estado
    if (datos.estado === 'APROBADO' && !datos.nota) {
      throw new BadRequestException('Se requiere una nota para aprobar al alumno');
    }

    if (datos.nota !== undefined && (datos.nota < 0 || datos.nota > 20)) {
      throw new BadRequestException('La nota debe estar entre 0 y 20');
    }

    if (datos.porcentajeAsistencia !== undefined && (datos.porcentajeAsistencia < 0 || datos.porcentajeAsistencia > 100)) {
      throw new BadRequestException('El porcentaje de asistencia debe estar entre 0 y 100');
    }

    Object.assign(alumno, datos);
    return await this.alumnosRepository.save(alumno);
  }

  async cambiarEstado(id: number, nuevoEstado: string): Promise<Alumno> {
    const estadosValidos = ['INSCRITO', 'ASISTENTE', 'APROBADO', 'REPROBADO', 'RETIRADO'];
    
    if (!estadosValidos.includes(nuevoEstado)) {
      throw new BadRequestException(`Estado inválido. Estados válidos: ${estadosValidos.join(', ')}`);
    }

    const alumno = await this.obtenerPorId(id);
    alumno.estado = nuevoEstado;
    return await this.alumnosRepository.save(alumno);
  }

  async calificar(id: number, nota: number, porcentajeAsistencia?: number): Promise<Alumno> {
    if (nota < 0 || nota > 20) {
      throw new BadRequestException('La nota debe estar entre 0 y 20');
    }

    if (porcentajeAsistencia !== undefined && (porcentajeAsistencia < 0 || porcentajeAsistencia > 100)) {
      throw new BadRequestException('El porcentaje de asistencia debe estar entre 0 y 100');
    }

    const alumno = await this.obtenerPorId(id);
    alumno.nota = nota;
    
    if (porcentajeAsistencia !== undefined) {
      alumno.porcentajeAsistencia = porcentajeAsistencia;
    }

    // Determinar estado basado en la nota (generalmente 11 es aprobado)
    alumno.estado = nota >= 11 ? 'APROBADO' : 'REPROBADO';

    return await this.alumnosRepository.save(alumno);
  }

  async eliminar(id: number): Promise<void> {
    const alumno = await this.obtenerPorId(id);
    
    // Verificar que no tenga certificados
    if (alumno.certificados && alumno.certificados.length > 0) {
      throw new BadRequestException('No se puede eliminar un alumno que tiene certificados generados');
    }

    await this.alumnosRepository.remove(alumno);
  }

  async obtenerEstadisticasPorCurso(idCurso: number): Promise<any> {
    const estadisticas = await this.alumnosRepository
      .createQueryBuilder('alumno')
      .select([
        'COUNT(*) as total',
        'COUNT(*) FILTER (WHERE estado = \'INSCRITO\') as inscritos',
        'COUNT(*) FILTER (WHERE estado = \'ASISTENTE\') as asistentes',
        'COUNT(*) FILTER (WHERE estado = \'APROBADO\') as aprobados',
        'COUNT(*) FILTER (WHERE estado = \'REPROBADO\') as reprobados',
        'COUNT(*) FILTER (WHERE estado = \'RETIRADO\') as retirados',
        'AVG(nota) as promedio_nota',
        'AVG(porcentaje_asistencia) as promedio_asistencia'
      ])
      .where('alumno.idCurso = :idCurso', { idCurso })
      .getRawOne();

    return {
      ...estadisticas,
      promedio_nota: parseFloat(estadisticas.promedio_nota) || 0,
      promedio_asistencia: parseFloat(estadisticas.promedio_asistencia) || 0
    };
  }
}