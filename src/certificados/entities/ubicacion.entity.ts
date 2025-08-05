import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique
} from 'typeorm';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsString, IsNumber, IsOptional, IsDateString, IsEnum, IsEmail, Min, Max } from 'class-validator';
import { Institucion } from './instituciones.entity';
import { Curso } from './cursos.entity';

@Entity('ubicaciones')
@Unique(['departamento', 'provincia', 'distrito'])
export class Ubicacion {
  @PrimaryGeneratedColumn()
  idUbicacion: number;

  @Column({ type: 'varchar', length: 50 })
  departamento: string;

  @Column({ type: 'varchar', length: 50 })
  provincia: string;

  @Column({ type: 'varchar', length: 50 })
  distrito: string;

  @Column({ type: 'varchar', length: 6, nullable: true })
  codigoUbigeo: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  // Relaciones
  @OneToMany(() => Institucion, institucion => institucion.ubicacion)
  instituciones: Institucion[];

  @OneToMany(() => Curso, curso => curso.ubicacion)
  cursos: Curso[];
}