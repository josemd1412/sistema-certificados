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
import { Curso } from './cursos.entity';
import { Certificado } from './certificados.entity';

@Entity('alumnos')
@Unique(['idCurso', 'dni'])
export class Alumno {
  @PrimaryGeneratedColumn()
  idAlumno: number;

  @Column({ type: 'int' })
  idCurso: number;

  @Column({ type: 'varchar', length: 200 })
  nombreCompletos: string;

  @Column({ type: 'varchar', length: 8 })
  dni: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  cargoEmpresa: string;

  @Column({ type: 'int', nullable: true })
  anosExperiencia: number;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  fechaInscripcion: Date;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    default: 'INSCRITO',
    enum: ['INSCRITO', 'ASISTENTE', 'APROBADO', 'REPROBADO', 'RETIRADO']
  })
  estadoAlumno: string;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  notaFinal: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  porcentajeAsistencia: number;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => Curso, curso => curso.alumnos)
  @JoinColumn({ name: 'idCurso' })
  curso: Curso;

  @OneToMany(() => Certificado, certificado => certificado.alumno)
  certificados: Certificado[];
}