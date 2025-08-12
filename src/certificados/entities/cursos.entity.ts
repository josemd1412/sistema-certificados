import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  ManyToOne,
  OneToMany,
  JoinColumn,
  Check
} from 'typeorm';
import { Instructor } from './instructores.entity';
import { Institucion } from './instituciones.entity';
import { Ubicacion } from './ubicaciones.entity';
import { Alumno } from './alumnos.entity';

@Entity('cursos')
@Check(`tipo IN ('PRESENCIAL', 'VIRTUAL', 'HÍBRIDO')`)
@Check(`modalidad IN ('MAÑANA', 'TARDE', 'NOCHE', 'FIN_DE_SEMANA')`)
@Check(`duracion_horas > 0`)
@Check(`f_fin >= f_inicio`)
export class Curso {
  @PrimaryGeneratedColumn({ name: 'id_curso' })
  idCurso: number;

  @Column({ name: 'nombre_curso', type: 'varchar', length: 300 })
  nombreCurso: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ name: 'f_inicio', type: 'date' })
  fInicio: Date;

  @Column({ name: 'f_fin', type: 'date' })
  fFin: Date;

  @Column({ name: 'id_instructor', type: 'integer' })
  idInstructor: number;

  @Column({ type: 'varchar', length: 50 })
  tipo: string;

  @Column({ name: 'id_institucion', type: 'integer' })
  idInstitucion: number;

  @Column({ name: 'id_ubicacion', type: 'integer' })
  idUbicacion: number;

  @Column({ name: 'duracion_horas', type: 'integer' })
  duracionHoras: number;

  @Column({ type: 'varchar', length: 50 })
  modalidad: string;

  // Relaciones
  @ManyToOne(() => Instructor, instructor => instructor.cursos)
  @JoinColumn({ name: 'id_instructor' })
  instructor: Instructor;

  @ManyToOne(() => Institucion, institucion => institucion.cursos)
  @JoinColumn({ name: 'id_institucion' })
  institucion: Institucion;

  @ManyToOne(() => Ubicacion, ubicacion => ubicacion.cursos)
  @JoinColumn({ name: 'id_ubicacion' })
  ubicacion: Ubicacion;

  @OneToMany(() => Alumno, alumno => alumno.curso)
  alumnos: Alumno[];
}