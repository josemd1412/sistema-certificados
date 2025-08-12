import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  OneToMany,
  Unique
} from 'typeorm';
import { Institucion } from './instituciones.entity';
import { Curso } from './cursos.entity';

@Entity('ubicaciones')
@Unique(['departamento', 'provincia', 'distrito'])
export class Ubicacion {
  @PrimaryGeneratedColumn({ name: 'id_ubicaciones' })
  idUbicaciones: number;

  @Column({ type: 'varchar', length: 50 })
  departamento: string;

  @Column({ type: 'varchar', length: 50 })
  provincia: string;

  @Column({ type: 'varchar', length: 50 })
  distrito: string;

  // Relaciones
  @OneToMany(() => Institucion, institucion => institucion.ubicacion)
  instituciones: Institucion[];

  @OneToMany(() => Curso, curso => curso.ubicacion)
  cursos: Curso[];
}