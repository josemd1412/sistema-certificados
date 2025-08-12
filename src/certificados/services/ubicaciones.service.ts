import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ubicacion } from '../entities/ubicaciones.entity';
import { CrearUbicacionDto } from '../dto/crear-ubicacion.dto';

@Injectable()
export class UbicacionesService {
  constructor(
    @InjectRepository(Ubicacion)
    private ubicacionesRepository: Repository<Ubicacion>,
  ) {}

  async crear(datos: CrearUbicacionDto): Promise<Ubicacion> {
    // Verificar si ya existe
    const existente = await this.ubicacionesRepository.findOne({
      where: {
        departamento: datos.departamento,
        provincia: datos.provincia,
        distrito: datos.distrito
      }
    });

    if (existente) {
      throw new BadRequestException('La ubicación ya existe');
    }

    const ubicacion = this.ubicacionesRepository.create({
      departamento: datos.departamento,
      provincia: datos.provincia,
      distrito: datos.distrito
    });

    return await this.ubicacionesRepository.save(ubicacion);
  }

  async obtenerTodas(): Promise<Ubicacion[]> {
    return await this.ubicacionesRepository.find({
      order: { departamento: 'ASC', provincia: 'ASC', distrito: 'ASC' }
    });
  }

  async obtenerPorDepartamento(departamento: string): Promise<Ubicacion[]> {
    return await this.ubicacionesRepository.find({
      where: { departamento },
      order: { provincia: 'ASC', distrito: 'ASC' }
    });
  }

  async obtenerPorId(id: number): Promise<Ubicacion> {
    const ubicacion = await this.ubicacionesRepository.findOne({
      where: { idUbicaciones: id }
    });

    if (!ubicacion) {
      throw new NotFoundException(`Ubicación con ID ${id} no encontrada`);
    }

    return ubicacion;
  }
}