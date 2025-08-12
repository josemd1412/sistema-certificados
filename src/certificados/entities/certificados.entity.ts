import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  ManyToOne,
  JoinColumn,
  Check
} from 'typeorm';
import { Alumno } from './alumnos.entity';

@Entity('certificados')
@Check(`estado IN ('ACTIVO', 'ANULADO', 'VENCIDO')`)
@Check(`
  (estado = 'ANULADO' AND motivo_anulacion IS NOT NULL AND f_anulacion IS NOT NULL AND usuario_anulacion IS NOT NULL)
  OR (estado != 'ANULADO' AND motivo_anulacion IS NULL AND f_anulacion IS NULL AND usuario_anulacion IS NULL)
`)
export class Certificado {
  @PrimaryGeneratedColumn('uuid', { name: 'id_certificado' })
  idCertificado: string;

  @Column({ name: 'numero_certificado', type: 'varchar', length: 50, unique: true })
  numeroCertificado: string;

  @Column({ name: 'id_alumno', type: 'integer' })
  idAlumno: number;

  @Column({ name: 'pdf_path', type: 'text', nullable: true })
  pdfPath: string;

  @Column({ name: 'pdf_hash', type: 'varchar', length: 64, nullable: true })
  pdfHash: string;

  @Column({ name: 'pdf_size', type: 'integer', nullable: true })
  pdfSize: number;

  @Column({ name: 'f_emision', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  fEmision: Date;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVO' })
  estado: string;

  @Column({ name: 'motivo_anulacion', type: 'text', nullable: true })
  motivoAnulacion: string;

  @Column({ name: 'f_anulacion', type: 'timestamp with time zone', nullable: true })
  fAnulacion: Date;

  @Column({ name: 'usuario_anulacion', type: 'varchar', length: 100, nullable: true })
  usuarioAnulacion: string;

  @Column({ name: 'codigo_verificacion', type: 'varchar', length: 50, unique: true })
  codigoVerificacion: string;

  // Relaciones
  @ManyToOne(() => Alumno, alumno => alumno.certificados)
  @JoinColumn({ name: 'id_alumno' })
  alumno: Alumno;
}