import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  ManyToOne,
  OneToMany,
  JoinColumn,
  Check
} from 'typeorm';
import { Ubicacion } from './ubicaciones.entity';
import { Curso } from './cursos.entity';

@Entity('instituciones')
@Check(`tipo IN ('EMPRESA', 'COLEGIO', 'UNIVERSIDAD', 'BASE_MILITAR', 'OTRO')`)
@Check(`ruc ~ '^[0-9]{11}$'`)
export class Institucion {
  @PrimaryGeneratedColumn({ name: 'id_institucion' })
  idInstitucion: number;

  @Column({ type: 'varchar', length: 300 })
  nombre: string;

  @Column({ type: 'varchar', length: 50 })
  tipo: string;

  @Column({ name: 'id_ubicacion', type: 'int' })
  idUbicacion: number;

  @Column({ type: 'text', nullable: true })
  direeccion: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  telefono: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  ruc: string;

  // Relaciones
  @ManyToOne(() => Ubicacion, ubicacion => ubicacion.instituciones)
  @JoinColumn({ name: 'id_ubicacion' })
  ubicacion: Ubicacion;

  @OneToMany(() => Curso, curso => curso.institucion)
  cursos: Curso[];
}