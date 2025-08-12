import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  ManyToOne,
  OneToMany,
  JoinColumn,
  Check
} from 'typeorm';
import { Curso } from './cursos.entity';
import { Certificado } from './certificados.entity';

@Entity('alumnos')
@Check(`dni ~ '^[0-9]{8}$'`)
@Check(`nota >= 0 AND nota <= 20`)
@Check(`porcentaje_asistencia >= 0 AND porcentaje_asistencia <= 100`)
@Check(`estado IN ('INSCRITO','ASISTENTE','APROBADO', 'REPROBADO', 'RETIRADO')`)
export class Alumno {
  @PrimaryGeneratedColumn({ name: 'id_alumno' })
  idAlumno: number;

  @Column({ name: 'id_curso', type: 'integer' })
  idCurso: number;

  @Column({ name: 'nombre_completo', type: 'varchar', length: 300 })
  nombreCompleto: string;

  @Column({ type: 'varchar', length: 8, nullable: true })
  dni: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  telefono: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ name: 'fecha_inscripcion', type: 'date' })
  fechaInscripcion: Date;

  @Column({ type: 'varchar', length: 50, default: 'INSCRITO' })
  estado: string;

  @Column({ type: 'numeric', nullable: true })
  nota: number;

  @Column({ name: 'porcentaje_asistencia', type: 'numeric', nullable: true })
  porcentajeAsistencia: number;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  // Relaciones
  @ManyToOne(() => Curso, curso => curso.alumnos)
  @JoinColumn({ name: 'id_curso' })
  curso: Curso;

  @OneToMany(() => Certificado, certificado => certificado.alumno)
  certificados: Certificado[];
}