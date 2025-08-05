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
import { Instructor } from './instructores.entity';
import { Institucion } from './instituciones.entity';
import { Ubicacion } from './ubicacion.entity';
import { Alumno } from './alumnos.entity';


@Entity('cursos')
export class Curso {
  @PrimaryGeneratedColumn()
  idCurso: number;

  @Column({ type: 'varchar', length: 200 })
  nombreCurso: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'date' })
  fInicio: Date;

  @Column({ type: 'date' })
  fFin: Date;

  @Column({ type: 'int' })
  idInstructor: number;

  @Column({ 
    type: 'varchar', 
    length: 20,
    enum: ['PRESENCIAL', 'VIRTUAL', 'HIBRIDO']
  })
  tipo: string;

  @Column({ type: 'int' })
  idInstitucion: number;

  @Column({ type: 'int' })
  idUbicacion: number;

  @Column({ type: 'int' })
  duracionHoras: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  modalidad: string;

  @Column({ type: 'int', nullable: true })
  capacidadMaxima: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  precioCurso: number;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    default: 'PLANIFICADO',
    enum: ['PLANIFICADO', 'EN_PROGRESO', 'FINALIZADO', 'CANCELADO']
  })
  estadoCurso: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => Instructor, instructor => instructor.cursos)
  @JoinColumn({ name: 'idInstructor' })
  instructor: Instructor;

  @ManyToOne(() => Institucion, institucion => institucion.cursos)
  @JoinColumn({ name: 'idInstitucion' })
  institucion: Institucion;

  @ManyToOne(() => Ubicacion, ubicacion => ubicacion.cursos)
  @JoinColumn({ name: 'idUbicacion' })
  ubicacion: Ubicacion;

  @OneToMany(() => Alumno, alumno => alumno.curso)
  alumnos: Alumno[];
}