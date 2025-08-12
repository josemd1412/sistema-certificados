import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Curso } from '../entities/cursos.entity';
import { Instructor } from '../entities/instructores.entity';
import { Institucion } from '../entities/instituciones.entity';
import { Ubicacion } from '../entities/ubicaciones.entity';
import { CrearCursoDto } from '../dto/crear-curso.dto';

@Injectable()
export class CursosService {
  constructor(
    @InjectRepository(Curso)
    private cursosRepository: Repository<Curso>,
    @InjectRepository(Instructor)
    private instructoresRepository: Repository<Instructor>,
    @InjectRepository(Institucion)
    private institucionesRepository: Repository<Institucion>,
    @InjectRepository(Ubicacion)
    private ubicacionesRepository: Repository<Ubicacion>,
  ) {}

  async crear(datos: CrearCursoDto): Promise<Curso> {
    // Verificar que el instructor existe y está activo
    const instructor = await this.instructoresRepository.findOne({
      where: { idInstructor: datos.idInstructor, activo: true }
    });

    if (!instructor) {
      throw new NotFoundException('Instructor no encontrado o inactivo');
    }

    // Verificar que la institución existe
    const institucion = await this.institucionesRepository.findOne({
      where: { idInstitucion: datos.idInstitucion }
    });

    if (!institucion) {
      throw new NotFoundException('Institución no encontrada');
    }

    // Verificar que la ubicación existe
    const ubicacion = await this.ubicacionesRepository.findOne({
      where: { idUbicaciones: datos.idUbicacion }
    });

    if (!ubicacion) {
      throw new NotFoundException('Ubicación no encontrada');
    }

    // Validar que la fecha de fin sea mayor que la fecha de inicio
    const fechaInicio = new Date(datos.fInicio);
    const fechaFin = new Date(datos.fFin);

    if (fechaFin <= fechaInicio) {
      throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    const curso = this.cursosRepository.create({
      nombreCurso: datos.nombreCurso,
      descripcion: datos.descripcion,
      fInicio: fechaInicio,
      fFin: fechaFin,
      idInstructor: datos.idInstructor,
      tipo: datos.tipo,
      idInstitucion: datos.idInstitucion,
      idUbicacion: datos.idUbicacion,
      duracionHoras: datos.duracionHoras,
      modalidad: datos.modalidad,
    });

    return await this.cursosRepository.save(curso);
  }

  async obtenerTodos(): Promise<Curso[]> {
    return await this.cursosRepository.find({
      relations: ['instructor', 'institucion', 'ubicacion'],
      order: { fInicio: 'DESC' }
    });
  }

  async obtenerPorId(id: number): Promise<Curso> {
    const curso = await this.cursosRepository.findOne({
      where: { idCurso: id },
      relations: ['instructor', 'institucion', 'ubicacion', 'alumnos']
    });

    if (!curso) {
      throw new NotFoundException(`Curso con ID ${id} no encontrado`);
    }

    return curso;
  }

  async obtenerPorInstructor(idInstructor: number): Promise<Curso[]> {
    return await this.cursosRepository.find({
      where: { idInstructor },
      relations: ['instructor', 'institucion', 'ubicacion'],
      order: { fInicio: 'DESC' }
    });
  }

  async obtenerPorInstitucion(idInstitucion: number): Promise<Curso[]> {
    return await this.cursosRepository.find({
      where: { idInstitucion },
      relations: ['instructor', 'institucion', 'ubicacion'],
      order: { fInicio: 'DESC' }
    });
  }

  async obtenerPorUbicacion(idUbicacion: number): Promise<Curso[]> {
    return await this.cursosRepository.find({
      where: { idUbicacion },
      relations: ['instructor', 'institucion', 'ubicacion'],
      order: { fInicio: 'DESC' }
    });
  }

  async obtenerPorRangoFechas(fechaInicio: string, fechaFin: string): Promise<Curso[]> {
    return await this.cursosRepository
      .createQueryBuilder('curso')
      .leftJoinAndSelect('curso.instructor', 'instructor')
      .leftJoinAndSelect('curso.institucion', 'institucion')
      .leftJoinAndSelect('curso.ubicacion', 'ubicacion')
      .where('curso.fInicio >= :fechaInicio', { fechaInicio })
      .andWhere('curso.fFin <= :fechaFin', { fechaFin })
      .orderBy('curso.fInicio', 'ASC')
      .getMany();
  }

  async obtenerPorTipo(tipo: string): Promise<Curso[]> {
    return await this.cursosRepository.find({
      where: { tipo },
      relations: ['instructor', 'institucion', 'ubicacion'],
      order: { fInicio: 'DESC' }
    });
  }

  async obtenerPorModalidad(modalidad: string): Promise<Curso[]> {
    return await this.cursosRepository.find({
      where: { modalidad },
      relations: ['instructor', 'institucion', 'ubicacion'],
      order: { fInicio: 'DESC' }
    });
  }

  async actualizar(id: number, datos: Partial<CrearCursoDto>): Promise<Curso> {
    const curso = await this.obtenerPorId(id);

    // Validar referencias si se cambian
    if (datos.idInstructor && datos.idInstructor !== curso.idInstructor) {
      const instructor = await this.instructoresRepository.findOne({
        where: { idInstructor: datos.idInstructor, activo: true }
      });

      if (!instructor) {
        throw new NotFoundException('Nuevo instructor no encontrado o inactivo');
      }
    }

    if (datos.idInstitucion && datos.idInstitucion !== curso.idInstitucion) {
      const institucion = await this.institucionesRepository.findOne({
        where: { idInstitucion: datos.idInstitucion }
      });

      if (!institucion) {
        throw new NotFoundException('Nueva institución no encontrada');
      }
    }

    if (datos.idUbicacion && datos.idUbicacion !== curso.idUbicacion) {
      const ubicacion = await this.ubicacionesRepository.findOne({
        where: { idUbicaciones: datos.idUbicacion }
      });

      if (!ubicacion) {
        throw new NotFoundException('Nueva ubicación no encontrada');
      }
    }

    // Validar fechas si se cambian
    if (datos.fInicio || datos.fFin) {
      const fechaInicio = datos.fInicio ? new Date(datos.fInicio) : curso.fInicio;
      const fechaFin = datos.fFin ? new Date(datos.fFin) : curso.fFin;

      if (fechaFin <= fechaInicio) {
        throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
      }

      if (datos.fInicio) datos.fInicio = fechaInicio.toISOString();
      if (datos.fFin) datos.fFin = fechaFin.toISOString();
    }

    Object.assign(curso, datos);
    return await this.cursosRepository.save(curso);
  }

  async eliminar(id: number): Promise<void> {
    const curso = await this.obtenerPorId(id);
    await this.cursosRepository.remove(curso);
  }

  async buscarPorNombre(nombre: string): Promise<Curso[]> {
    return await this.cursosRepository
      .createQueryBuilder('curso')
      .leftJoinAndSelect('curso.instructor', 'instructor')
      .leftJoinAndSelect('curso.institucion', 'institucion')
      .leftJoinAndSelect('curso.ubicacion', 'ubicacion')
      .where('curso.nombreCurso ILIKE :nombre', { nombre: `%${nombre}%` })
      .orderBy('curso.fInicio', 'DESC')
      .getMany();
  }
}