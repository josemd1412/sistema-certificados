import { 
  Entity, 
  Column, 
  PrimaryColumn,
} from 'typeorm';

@Entity('secuencias_certificados')
export class SecuenciaCertificado {
  @PrimaryColumn({ type: 'integer' })
  year: number;

  @Column({ name: 'ultimo_numero', type: 'integer' })
  ultimoNumero: number;

  @Column({ type: 'varchar', length: 10, default: 'CERT' })
  prefijo: string;
}