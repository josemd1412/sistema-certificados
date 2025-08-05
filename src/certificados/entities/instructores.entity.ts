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

@Entity('instructores')
export class Instructor {
  @PrimaryGeneratedColumn()
  idInstructor: number;

  @Column({ type: 'varchar', length: 200 })
  nombreCompletos: string;

  @Column({ type: 'varchar', length: 8, unique: true })
  dni: string;

  @Column({ type: 'text', nullable: true })
  especialidad: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  numeroColegiatura: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  gradoAcademico: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @OneToMany(() => Curso, curso => curso.instructor)
  cursos: Curso[];
}