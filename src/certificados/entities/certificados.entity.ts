import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Alumno } from './alumnos.entity';

@Entity('certificados')
export class Certificado {
  @PrimaryGeneratedColumn('uuid')
  idCertificado: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  numeroCertificado: string;

  @Column({ type: 'int' })
  idAlumno: number;

  @Column({ type: 'text', nullable: true })
  pdfPath: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  pdfHash: string;

  @Column({ type: 'int', nullable: true })
  pdfSize: number;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  fechaEmision: Date;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    default: 'ACTIVO',
    enum: ['ACTIVO', 'ANULADO', 'VENCIDO']
  })
  estado: string;

  @Column({ type: 'text', nullable: true })
  motivoAnulacion: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  fAnulacion: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  usuarioAnulacion: string;

  @Column({ type: 'varchar', length: 32, unique: true, nullable: true })
  codigoVerificacion: string;

  // Relaciones
  @ManyToOne(() => Alumno, alumno => alumno.certificados)
  @JoinColumn({ name: 'idAlumno' })
  alumno: Alumno;
}