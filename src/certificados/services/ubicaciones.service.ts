import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entidad Ubicacion (simplificada para tus tablas)
export class Ubicacion {
  id_ubicaciones: number;
  departamento: string;
  provincia: string;
  distrito: string;
}

@Injectable()
export class UbicacionesService {
  constructor(
    @InjectRepository(Ubicacion)
    private ubicacionesRepository: Repository<Ubicacion>,
  ) {}

  async crear(datos: {
    departamento: string;
    provincia: string;
    distrito: string;
  }): Promise<Ubicacion> {
    // Verificar si ya existe
    const existente = await this.ubicacionesRepository.findOne({
      where: {
        departamento: datos.departamento.toUpperCase(),
        provincia: datos.provincia.toUpperCase(),
        distrito: datos.distrito.toUpperCase()
      }
    });

    if (existente) {
      throw new BadRequestException('La ubicación ya existe');
    }

    const ubicacion = this.ubicacionesRepository.create({
      departamento: datos.departamento.toUpperCase(),
      provincia: datos.provincia.toUpperCase(),
      distrito: datos.distrito.toUpperCase()
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
      where: { departamento: departamento.toUpperCase() },
      order: { provincia: 'ASC', distrito: 'ASC' }
    });
  }

  async obtenerPorId(id: number): Promise<Ubicacion> {
    const ubicacion = await this.ubicacionesRepository.findOne({
      where: { id_ubicaciones: id }
    });

    if (!ubicacion) {
      throw new NotFoundException(`Ubicación con ID ${id} no encontrada`);
    }

    return ubicacion;
  }
}