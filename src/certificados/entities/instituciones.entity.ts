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
import { Ubicacion } from './ubicacion.entity';
import { Curso } from './cursos.entity';


@Entity('instituciones')
export class Institucion {
  @PrimaryGeneratedColumn()
  idInstitucion: number;

  @Column({ type: 'varchar', length: 300 })
  nombre: string;

  @Column({ 
    type: 'varchar', 
    length: 20,
    enum: ['EMPRESA', 'COLEGIO', 'UNIVERSIDAD', 'BASE_MILITAR', 'OTRO']
  })
  tipo: string;

  @Column({ type: 'varchar', length: 11, nullable: true })
  ruc: string;

  @Column({ type: 'int' })
  idUbicacion: number;

  @Column({ type: 'text', nullable: true })
  direccionCompleta: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  contactoPrincipal: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => Ubicacion, ubicacion => ubicacion.instituciones)
  @JoinColumn({ name: 'idUbicacion' })
  ubicacion: Ubicacion;

  @OneToMany(() => Curso, curso => curso.institucion)
  cursos: Curso[];
}