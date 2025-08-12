import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  OneToMany,
  Check
} from 'typeorm';
import { Curso } from './cursos.entity';

@Entity('instructores')
@Check(`dni ~ '^[0-9]{8}$'`)
export class Instructor {
  @PrimaryGeneratedColumn({ name: 'id_instructor' })
  idInstructor: number;

  @Column({ name: 'nombre_completos', type: 'varchar', length: 300 })
  nombreCompletos: string;

  @Column({ type: 'varchar', length: 8, nullable: true })
  dni: string;

  @Column({ type: 'text', nullable: true })
  especialidad: string;

  @Column({ name: 'grado_academico', type: 'varchar', length: 100, nullable: true })
  gradoAcademico: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  telefono: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  // Relaciones
  @OneToMany(() => Curso, curso => curso.instructor)
  cursos: Curso[];
}