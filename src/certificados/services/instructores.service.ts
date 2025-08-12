import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Instructor } from '../entities/instructores.entity';
import { CrearInstructorDto } from '../dto/crear-instructor.dto';

@Injectable()
export class InstructoresService {
  constructor(
    @InjectRepository(Instructor)
    private instructoresRepository: Repository<Instructor>,
  ) {}

  async crear(datos: CrearInstructorDto): Promise<Instructor> {
    // Si se proporciona DNI, verificar que no exista otro instructor con el mismo DNI
    if (datos.dni) {
      const existente = await this.instructoresRepository.findOne({
        where: { dni: datos.dni }
      });

      if (existente) {
        throw new BadRequestException('Ya existe un instructor con ese DNI');
      }
    }

    const instructor = this.instructoresRepository.create({
      nombreCompletos: datos.nombreCompletos,
      dni: datos.dni,
      especialidad: datos.especialidad,
      gradoAcademico: datos.gradoAcademico,
      telefono: datos.telefono,
      email: datos.email,
      activo: true,
    });

    return await this.instructoresRepository.save(instructor);
  }

  async obtenerTodos(): Promise<Instructor[]> {
    return await this.instructoresRepository.find({
      where: { activo: true },
      order: { nombreCompletos: 'ASC' }
    });
  }

  async obtenerPorId(id: number): Promise<Instructor> {
    const instructor = await this.instructoresRepository.findOne({
      where: { idInstructor: id },
      relations: ['cursos']
    });

    if (!instructor) {
      throw new NotFoundException(`Instructor con ID ${id} no encontrado`);
    }

    return instructor;
  }

  async obtenerPorDni(dni: string): Promise<Instructor> {
    const instructor = await this.instructoresRepository.findOne({
      where: { dni },
      relations: ['cursos']
    });

    if (!instructor) {
      throw new NotFoundException(`Instructor con DNI ${dni} no encontrado`);
    }

    return instructor;
  }

  async obtenerPorEspecialidad(especialidad: string): Promise<Instructor[]> {
    return await this.instructoresRepository
      .createQueryBuilder('instructor')
      .where('instructor.especialidad ILIKE :especialidad', { especialidad: `%${especialidad}%` })
      .andWhere('instructor.activo = true')
      .orderBy('instructor.nombreCompletos', 'ASC')
      .getMany();
  }

  async obtenerActivos(): Promise<Instructor[]> {
    return await this.instructoresRepository.find({
      where: { activo: true },
      order: { nombreCompletos: 'ASC' }
    });
  }

  async actualizar(id: number, datos: Partial<CrearInstructorDto>): Promise<Instructor> {
    const instructor = await this.obtenerPorId(id);

    // Si se cambia el DNI, verificar que no exista otro instructor con el mismo DNI
    if (datos.dni && datos.dni !== instructor.dni) {
      const existente = await this.instructoresRepository.findOne({
        where: { dni: datos.dni }
      });

      if (existente) {
        throw new BadRequestException('Ya existe un instructor con ese DNI');
      }
    }

    Object.assign(instructor, datos);
    return await this.instructoresRepository.save(instructor);
  }

  async desactivar(id: number): Promise<Instructor> {
    const instructor = await this.obtenerPorId(id);
    instructor.activo = false;
    return await this.instructoresRepository.save(instructor);
  }

  async activar(id: number): Promise<Instructor> {
    const instructor = await this.obtenerPorId(id);
    instructor.activo = true;
    return await this.instructoresRepository.save(instructor);
  }

  async eliminar(id: number): Promise<void> {
    const instructor = await this.obtenerPorId(id);
    await this.instructoresRepository.remove(instructor);
  }
}