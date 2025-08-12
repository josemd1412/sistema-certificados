import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Institucion } from '../entities/instituciones.entity';
import { Ubicacion } from '../entities/ubicaciones.entity';
import { CrearInstitucionDto } from '../dto/crear-institucion.dto';

@Injectable()
export class InstitucionesService {
  constructor(
    @InjectRepository(Institucion)
    private institucionesRepository: Repository<Institucion>,
    @InjectRepository(Ubicacion)
    private ubicacionesRepository: Repository<Ubicacion>,
  ) {}

  async crear(datos: CrearInstitucionDto): Promise<Institucion> {
    // Verificar que la ubicación existe
    const ubicacion = await this.ubicacionesRepository.findOne({
      where: { idUbicaciones: datos.idUbicacion }
    });

    if (!ubicacion) {
      throw new NotFoundException('Ubicación no encontrada');
    }

    // Verificar si ya existe una institución con el mismo nombre
    const existente = await this.institucionesRepository.findOne({
      where: { nombre: datos.nombre }
    });

    if (existente) {
      throw new BadRequestException('Ya existe una institución con ese nombre');
    }

    const institucion = this.institucionesRepository.create({
      nombre: datos.nombre,
      tipo: datos.tipo,
      idUbicacion: datos.idUbicacion,
      direeccion: datos.direeccion,
      telefono: datos.telefono,
      email: datos.email,
      ruc: datos.ruc,
    });

    return await this.institucionesRepository.save(institucion);
  }

  async obtenerTodas(): Promise<Institucion[]> {
    return await this.institucionesRepository.find({
      relations: ['ubicacion'],
      order: { nombre: 'ASC' }
    });
  }

  async obtenerPorId(id: number): Promise<Institucion> {
    const institucion = await this.institucionesRepository.findOne({
      where: { idInstitucion: id },
      relations: ['ubicacion', 'cursos']
    });

    if (!institucion) {
      throw new NotFoundException(`Institución con ID ${id} no encontrada`);
    }

    return institucion;
  }

  async obtenerPorTipo(tipo: string): Promise<Institucion[]> {
    return await this.institucionesRepository.find({
      where: { tipo },
      relations: ['ubicacion'],
      order: { nombre: 'ASC' }
    });
  }

  async obtenerPorUbicacion(idUbicacion: number): Promise<Institucion[]> {
    return await this.institucionesRepository.find({
      where: { idUbicacion },
      relations: ['ubicacion'],
      order: { nombre: 'ASC' }
    });
  }

  async actualizar(id: number, datos: Partial<CrearInstitucionDto>): Promise<Institucion> {
    const institucion = await this.obtenerPorId(id);

    // Si se cambia la ubicación, verificar que existe
    if (datos.idUbicacion && datos.idUbicacion !== institucion.idUbicacion) {
      const ubicacion = await this.ubicacionesRepository.findOne({
        where: { idUbicaciones: datos.idUbicacion }
      });

      if (!ubicacion) {
        throw new NotFoundException('Nueva ubicación no encontrada');
      }
    }

    Object.assign(institucion, datos);
    return await this.institucionesRepository.save(institucion);
  }

  async eliminar(id: number): Promise<void> {
    const institucion = await this.obtenerPorId(id);
    await this.institucionesRepository.remove(institucion);
  }
}