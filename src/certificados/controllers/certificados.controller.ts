import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete,
  Body, 
  Param, 
  Query, 
  Res,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  Logger,
  ParseIntPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import * as json2csv from 'json2csv';
import { ApiOperation, ApiResponse, ApiTags, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Multer } from 'multer';

// Services
import { CertificadosService } from '../services/certificados.service';
import { UbicacionesService } from '../services/ubicaciones.service';
import { InstitucionesService } from '../services/instituciones.service';
import { InstructoresService } from '../services/instructores.service';
import { CursosService } from '../services/cursos.service';
import { AlumnosService } from '../services/alumnos.service';

// DTOs
import { CrearCertificadoDto } from '../dto/crear-certificado.dto';
import { FiltrosFiscalizarDto } from '../dto/filtros-fiscalizar.dto';
import { CrearUbicacionDto } from '../dto/crear-ubicacion.dto';
import { CrearInstitucionDto } from '../dto/crear-institucion.dto';
import { CrearInstructorDto } from '../dto/crear-instructor.dto';
import { CrearCursoDto } from '../dto/crear-curso.dto';
import { CrearAlumnoDto } from '../dto/crear-alumno.dto';
import { ActualizarAlumnoDto } from '../dto/actualizar-alumno.dto';
import { CrearSecuenciaCertificadoDto, ActualizarSecuenciaCertificadoDto } from '../dto/secuencia-certificado.dto';

// Entities
import { Certificado } from '../entities/certificados.entity';
import { Ubicacion } from '../entities/ubicaciones.entity';
import { Institucion } from '../entities/instituciones.entity';
import { Instructor } from '../entities/instructores.entity';
import { Curso } from '../entities/cursos.entity';
import { Alumno } from '../entities/alumnos.entity';
// Common services
import { ArchivoService } from 'src/common/archivo.service';

@ApiTags('Sistema de Certificados')
@Controller('certificados')
export class CertificadosController {

  private readonly logger = new Logger(CertificadosController.name);
  
  constructor(
    private readonly certificadosService: CertificadosService,
    private readonly ubicacionesService: UbicacionesService,
    private readonly institucionesService: InstitucionesService,
    private readonly instructoresService: InstructoresService,
    private readonly cursosService: CursosService,
    private readonly alumnosService: AlumnosService,
    private readonly archivoService: ArchivoService
  ) {}

  // ===================================================================
  // ENDPOINTS DE CERTIFICADOS
  // ===================================================================

  @ApiOperation({ summary: 'Crear un nuevo certificado' })
  @ApiResponse({ status: 201, description: 'Certificado creado exitosamente.', type: Certificado })
  @ApiResponse({ status: 400, description: 'Solicitud inválida.' })
  @ApiBody({ type: CrearCertificadoDto })
  @Post()
  @UseInterceptors(FileInterceptor('archivo'))
  async crearCertificado(
    @Body() datos: CrearCertificadoDto,
    @UploadedFile() archivo?: Multer.File
  ): Promise<{ certificado: Certificado; mensaje: string }> {
    
    const certificado = await this.certificadosService.crear(datos);
    this.logger.log(`Certificado creado con ID: ${certificado.idCertificado}`);
    
    if (archivo) {
      const archivoInfo = await this.archivoService.guardarCertificado(
        archivo.buffer,
        certificado.numeroCertificado,
        certificado.fEmision
      );

      await this.certificadosService.actualizarArchivoPdf(
        certificado.idCertificado,
        archivoInfo.path,
        archivoInfo.hash,
        archivoInfo.size
      );
    }

    return {
      certificado,
      mensaje: 'Certificado creado exitosamente'
    };
  }

  @ApiOperation({ summary: 'Buscar certificados por filtros' })
  @ApiResponse({ status: 200, description: 'Lista de certificados encontrados.' })
  @ApiBody({ type: FiltrosFiscalizarDto })
  @Post('buscar')
  async buscarCertificados(@Body() filtros: FiltrosFiscalizarDto) {
    return await this.certificadosService.obtenerPorRangoFechas(filtros);
  }

  @ApiOperation({ summary: 'Obtener certificados por DNI del alumno' })
  @ApiResponse({ status: 200, description: 'Certificados encontrados.' })
  @ApiParam({ name: 'dni', description: 'DNI del alumno' })
  @ApiQuery({ name: 'incluir_anulados', required: false, type: Boolean })
  @Get('dni/:dni')
  async obtenerCertificadosPorDni(
    @Param('dni') dni: string,
    @Query('incluir_anulados') incluirAnulados = false
  ) {
    return await this.certificadosService.obtenerPorDni(dni, incluirAnulados);
  }

  @ApiOperation({ summary: 'Verificar certificado por código' })
  @ApiResponse({ status: 200, description: 'Certificado encontrado.', type: Certificado })
  @ApiParam({ name: 'codigo', description: 'Código de verificación del certificado' })
  @Get('verificar/:codigo')
  async verificarCertificado(@Param('codigo') codigo: string) {
    return await this.certificadosService.verificarCertificadoPorCodigo(codigo);
  }

  @ApiOperation({ summary: 'Buscar certificado por número' })
  @ApiResponse({ status: 200, description: 'Certificado encontrado.', type: Certificado })
  @ApiParam({ name: 'numero', description: 'Número del certificado' })
  @Get('numero/:numero')
  async buscarPorNumero(@Param('numero') numero: string) {
    return await this.certificadosService.buscarPorNumero(numero);
  }

  @ApiOperation({ summary: 'Anular certificado' })
  @ApiResponse({ status: 200, description: 'Certificado anulado exitosamente.' })
  @ApiParam({ name: 'id', description: 'ID del certificado' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        motivo: { type: 'string', description: 'Motivo de la anulación' },
        usuario: { type: 'string', description: 'Usuario que anula' }
      },
      required: ['motivo', 'usuario']
    }
  })
  @Put(':id/anular')
  async anularCertificado(
    @Param('id') id: string,
    @Body() datos: { motivo: string; usuario: string }
  ) {
    const certificado = await this.certificadosService.anularCertificado(
      id,
      datos.motivo,
      datos.usuario
    );

    return {
      certificado,
      mensaje: 'Certificado anulado exitosamente'
    };
  }

  @ApiOperation({ summary: 'Generar reporte para fiscalía' })
  @ApiResponse({ status: 200, description: 'Reporte generado exitosamente.' })
  @ApiBody({ type: FiltrosFiscalizarDto })
  @ApiQuery({ name: 'formato', enum: ['json', 'csv'], required: false })
  @Post('reporte-fiscalia')
  async generarReporteFiscalia(
    @Body() filtros: FiltrosFiscalizarDto,
    @Query('formato') formato: 'json' | 'csv' = 'json',
    @Res() res: Response
  ) {
    try {
      const datos = await this.certificadosService.generarReporteFiscalia(filtros);

      if (formato === 'csv') {
        const csv = json2csv.parse(datos, {
          delimiter: ';',
          encoding: 'utf8'
        });

        const nombreArchivo = `reporte_fiscalia_${filtros.fechaInicio}_${filtros.fechaFin}.csv`;
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
        res.send('\ufeff' + csv);
      } else {
        res.json({
          filtros,
          totalRegistros: datos.length,
          datos
        });
      }
    } catch (error) {
      throw new HttpException(
        'Error generando reporte de fiscalía',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @ApiOperation({ summary: 'Obtener estadísticas de certificados' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente.' })
  @ApiQuery({ name: 'fecha_inicio', description: 'Fecha de inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fecha_fin', description: 'Fecha de fin (YYYY-MM-DD)' })
  @Get('estadisticas')
  async obtenerEstadisticas(
    @Query('fecha_inicio') fechaInicio: string,
    @Query('fecha_fin') fechaFin: string
  ) {
    return await this.certificadosService.obtenerEstadisticas(fechaInicio, fechaFin);
  }

  // ===================================================================
  // ENDPOINTS DE UBICACIONES
  // ===================================================================

  @ApiOperation({ summary: 'Crear nueva ubicación' })
  @ApiResponse({ status: 201, description: 'Ubicación creada exitosamente.', type: Ubicacion })
  @ApiBody({ type: CrearUbicacionDto })
  @Post('ubicaciones')
  async crearUbicacion(@Body() datos: CrearUbicacionDto): Promise<Ubicacion> {
    return await this.ubicacionesService.crear(datos);
  }

  @ApiOperation({ summary: 'Obtener todas las ubicaciones' })
  @ApiResponse({ status: 200, description: 'Lista de ubicaciones.', type: [Ubicacion] })
  @Get('ubicaciones')
  async obtenerUbicaciones(): Promise<Ubicacion[]> {
    return await this.ubicacionesService.obtenerTodas();
  }

  @ApiOperation({ summary: 'Obtener ubicación por ID' })
  @ApiResponse({ status: 200, description: 'Ubicación encontrada.', type: Ubicacion })
  @ApiParam({ name: 'id', description: 'ID de la ubicación' })
  @Get('ubicaciones/:id')
  async obtenerUbicacionPorId(@Param('id', ParseIntPipe) id: number): Promise<Ubicacion> {
    return await this.ubicacionesService.obtenerPorId(id);
  }

  @ApiOperation({ summary: 'Obtener ubicaciones por departamento' })
  @ApiResponse({ status: 200, description: 'Ubicaciones del departamento.', type: [Ubicacion] })
  @ApiParam({ name: 'departamento', description: 'Nombre del departamento' })
  @Get('ubicaciones/departamento/:departamento')
  async obtenerUbicacionesPorDepartamento(@Param('departamento') departamento: string): Promise<Ubicacion[]> {
    return await this.ubicacionesService.obtenerPorDepartamento(departamento);
  }

  // ===================================================================
  // ENDPOINTS DE INSTITUCIONES
  // ===================================================================

  @ApiOperation({ summary: 'Crear nueva institución' })
  @ApiResponse({ status: 201, description: 'Institución creada exitosamente.', type: Institucion })
  @ApiBody({ type: CrearInstitucionDto })
  @Post('instituciones')
  async crearInstitucion(@Body() datos: CrearInstitucionDto): Promise<Institucion> {
    return await this.institucionesService.crear(datos);
  }

  @ApiOperation({ summary: 'Obtener todas las instituciones' })
  @ApiResponse({ status: 200, description: 'Lista de instituciones.', type: [Institucion] })
  @Get('instituciones')
  async obtenerInstituciones(): Promise<Institucion[]> {
    return await this.institucionesService.obtenerTodas();
  }

  @ApiOperation({ summary: 'Obtener institución por ID' })
  @ApiResponse({ status: 200, description: 'Institución encontrada.', type: Institucion })
  @ApiParam({ name: 'id', description: 'ID de la institución' })
  @Get('instituciones/:id')
  async obtenerInstitucionPorId(@Param('id', ParseIntPipe) id: number): Promise<Institucion> {
    return await this.institucionesService.obtenerPorId(id);
  }

  @ApiOperation({ summary: 'Obtener instituciones por tipo' })
  @ApiResponse({ status: 200, description: 'Instituciones del tipo especificado.', type: [Institucion] })
  @ApiParam({ name: 'tipo', description: 'Tipo de institución' })
  @Get('instituciones/tipo/:tipo')
  async obtenerInstitucionesPorTipo(@Param('tipo') tipo: string): Promise<Institucion[]> {
    return await this.institucionesService.obtenerPorTipo(tipo);
  }

  @ApiOperation({ summary: 'Actualizar institución' })
  @ApiResponse({ status: 200, description: 'Institución actualizada exitosamente.', type: Institucion })
  @ApiParam({ name: 'id', description: 'ID de la institución' })
  @ApiBody({ type: CrearInstitucionDto })
  @Put('instituciones/:id')
  async actualizarInstitucion(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: Partial<CrearInstitucionDto>
  ): Promise<Institucion> {
    return await this.institucionesService.actualizar(id, datos);
  }

  @ApiOperation({ summary: 'Eliminar institución' })
  @ApiResponse({ status: 200, description: 'Institución eliminada exitosamente.' })
  @ApiParam({ name: 'id', description: 'ID de la institución' })
  @Delete('instituciones/:id')
  async eliminarInstitucion(@Param('id', ParseIntPipe) id: number): Promise<{ mensaje: string }> {
    await this.institucionesService.eliminar(id);
    return { mensaje: 'Institución eliminada exitosamente' };
  }

  // ===================================================================
  // ENDPOINTS DE INSTRUCTORES
  // ===================================================================

  @ApiOperation({ summary: 'Crear nuevo instructor' })
  @ApiResponse({ status: 201, description: 'Instructor creado exitosamente.', type: Instructor })
  @ApiBody({ type: CrearInstructorDto })
  @Post('instructores')
  async crearInstructor(@Body() datos: CrearInstructorDto): Promise<Instructor> {
    return await this.instructoresService.crear(datos);
  }

  @ApiOperation({ summary: 'Obtener todos los instructores activos' })
  @ApiResponse({ status: 200, description: 'Lista de instructores.', type: [Instructor] })
  @Get('instructores')
  async obtenerInstructores(): Promise<Instructor[]> {
    return await this.instructoresService.obtenerTodos();
  }

  @ApiOperation({ summary: 'Obtener instructor por ID' })
  @ApiResponse({ status: 200, description: 'Instructor encontrado.', type: Instructor })
  @ApiParam({ name: 'id', description: 'ID del instructor' })
  @Get('instructores/:id')
  async obtenerInstructorPorId(@Param('id', ParseIntPipe) id: number): Promise<Instructor> {
    return await this.instructoresService.obtenerPorId(id);
  }

  @ApiOperation({ summary: 'Obtener instructor por DNI' })
  @ApiResponse({ status: 200, description: 'Instructor encontrado.', type: Instructor })
  @ApiParam({ name: 'dni', description: 'DNI del instructor' })
  @Get('instructores/dni/:dni')
  async obtenerInstructorPorDni(@Param('dni') dni: string): Promise<Instructor> {
    return await this.instructoresService.obtenerPorDni(dni);
  }

  @ApiOperation({ summary: 'Buscar instructores por especialidad' })
  @ApiResponse({ status: 200, description: 'Instructores encontrados.', type: [Instructor] })
  @ApiParam({ name: 'especialidad', description: 'Especialidad a buscar' })
  @Get('instructores/especialidad/:especialidad')
  async buscarInstructoresPorEspecialidad(@Param('especialidad') especialidad: string): Promise<Instructor[]> {
    return await this.instructoresService.obtenerPorEspecialidad(especialidad);
  }

  @ApiOperation({ summary: 'Actualizar instructor' })
  @ApiResponse({ status: 200, description: 'Instructor actualizado exitosamente.', type: Instructor })
  @ApiParam({ name: 'id', description: 'ID del instructor' })
  @ApiBody({ type: CrearInstructorDto })
  @Put('instructores/:id')
  async actualizarInstructor(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: Partial<CrearInstructorDto>
  ): Promise<Instructor> {
    return await this.instructoresService.actualizar(id, datos);
  }

  @ApiOperation({ summary: 'Desactivar instructor' })
  @ApiResponse({ status: 200, description: 'Instructor desactivado exitosamente.', type: Instructor })
  @ApiParam({ name: 'id', description: 'ID del instructor' })
  @Put('instructores/:id/desactivar')
  async desactivarInstructor(@Param('id', ParseIntPipe) id: number): Promise<Instructor> {
    return await this.instructoresService.desactivar(id);
  }

  // ===================================================================
  // ENDPOINTS DE CURSOS
  // ===================================================================

  @ApiOperation({ summary: 'Crear nuevo curso' })
  @ApiResponse({ status: 201, description: 'Curso creado exitosamente.', type: Curso })
  @ApiBody({ type: CrearCursoDto })
  @Post('cursos')
  async crearCurso(@Body() datos: CrearCursoDto): Promise<Curso> {
    return await this.cursosService.crear(datos);
  }

  @ApiOperation({ summary: 'Obtener todos los cursos' })
  @ApiResponse({ status: 200, description: 'Lista de cursos.', type: [Curso] })
  @Get('cursos')
  async obtenerCursos(): Promise<Curso[]> {
    return await this.cursosService.obtenerTodos();
  }

  @ApiOperation({ summary: 'Obtener curso por ID' })
  @ApiResponse({ status: 200, description: 'Curso encontrado.', type: Curso })
  @ApiParam({ name: 'id', description: 'ID del curso' })
  @Get('cursos/:id')
  async obtenerCursoPorId(@Param('id', ParseIntPipe) id: number): Promise<Curso> {
    return await this.cursosService.obtenerPorId(id);
  }

  @ApiOperation({ summary: 'Obtener cursos por instructor' })
  @ApiResponse({ status: 200, description: 'Cursos del instructor.', type: [Curso] })
  @ApiParam({ name: 'instructorId', description: 'ID del instructor' })
  @Get('cursos/instructor/:instructorId')
  async obtenerCursosPorInstructor(@Param('instructorId', ParseIntPipe) instructorId: number): Promise<Curso[]> {
    return await this.cursosService.obtenerPorInstructor(instructorId);
  }

  @ApiOperation({ summary: 'Buscar cursos por nombre' })
  @ApiResponse({ status: 200, description: 'Cursos encontrados.', type: [Curso] })
  @ApiQuery({ name: 'nombre', description: 'Nombre del curso a buscar' })
  @Get('cursos/buscar')
  async buscarCursosPorNombre(@Query('nombre') nombre: string): Promise<Curso[]> {
    return await this.cursosService.buscarPorNombre(nombre);
  }

  @ApiOperation({ summary: 'Actualizar curso' })
  @ApiResponse({ status: 200, description: 'Curso actualizado exitosamente.', type: Curso })
  @ApiParam({ name: 'id', description: 'ID del curso' })
  @ApiBody({ type: CrearCursoDto })
  @Put('cursos/:id')
  async actualizarCurso(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: Partial<CrearCursoDto>
  ): Promise<Curso> {
    return await this.cursosService.actualizar(id, datos);
  }

  // ===================================================================
  // ENDPOINTS DE ALUMNOS
  // ===================================================================

  @ApiOperation({ summary: 'Inscribir nuevo alumno' })
  @ApiResponse({ status: 201, description: 'Alumno inscrito exitosamente.', type: Alumno })
  @ApiBody({ type: CrearAlumnoDto })
  @Post('alumnos')
  async inscribirAlumno(@Body() datos: CrearAlumnoDto): Promise<Alumno> {
    return await this.alumnosService.crear(datos);
  }

  @ApiOperation({ summary: 'Obtener todos los alumnos' })
  @ApiResponse({ status: 200, description: 'Lista de alumnos.', type: [Alumno] })
  @Get('alumnos')
  async obtenerAlumnos(): Promise<Alumno[]> {
    return await this.alumnosService.obtenerTodos();
  }

  @ApiOperation({ summary: 'Obtener alumno por ID' })
  @ApiResponse({ status: 200, description: 'Alumno encontrado.', type: Alumno })
  @ApiParam({ name: 'id', description: 'ID del alumno' })
  @Get('alumnos/:id')
  async obtenerAlumnoPorId(@Param('id', ParseIntPipe) id: number): Promise<Alumno> {
    return await this.alumnosService.obtenerPorId(id);
  }

  @ApiOperation({ summary: 'Obtener alumnos por curso' })
  @ApiResponse({ status: 200, description: 'Alumnos del curso.', type: [Alumno] })
  @ApiParam({ name: 'cursoId', description: 'ID del curso' })
  @Get('alumnos/curso/:cursoId')
  async obtenerAlumnosPorCurso(@Param('cursoId', ParseIntPipe) cursoId: number): Promise<Alumno[]> {
    return await this.alumnosService.obtenerPorCurso(cursoId);
  }

  @ApiOperation({ summary: 'Obtener alumnos por DNI' })
  @ApiResponse({ status: 200, description: 'Historial del alumno.', type: [Alumno] })
  @ApiParam({ name: 'dni', description: 'DNI del alumno' })
  @Get('alumnos/dni/:dni')
  async obtenerAlumnosPorDni(@Param('dni') dni: string): Promise<Alumno[]> {
    return await this.alumnosService.obtenerPorDni(dni);
  }

  @ApiOperation({ summary: 'Obtener alumnos aprobados' })
  @ApiResponse({ status: 200, description: 'Lista de alumnos aprobados.', type: [Alumno] })
  @Get('alumnos/aprobados')
  async obtenerAlumnosAprobados(): Promise<Alumno[]> {
    return await this.alumnosService.obtenerAprobados();
  }

  @ApiOperation({ summary: 'Actualizar datos del alumno' })
  @ApiResponse({ status: 200, description: 'Alumno actualizado exitosamente.', type: Alumno })
  @ApiParam({ name: 'id', description: 'ID del alumno' })
  @ApiBody({ type: ActualizarAlumnoDto })
  @Put('alumnos/:id')
  async actualizarAlumno(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: ActualizarAlumnoDto
  ): Promise<Alumno> {
    return await this.alumnosService.actualizar(id, datos);
  }

  @ApiOperation({ summary: 'Calificar alumno' })
  @ApiResponse({ status: 200, description: 'Alumno calificado exitosamente.', type: Alumno })
  @ApiParam({ name: 'id', description: 'ID del alumno' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nota: { type: 'number', minimum: 0, maximum: 20 },
        porcentajeAsistencia: { type: 'number', minimum: 0, maximum: 100 }
      },
      required: ['nota']
    }
  })
  @Put('alumnos/:id/calificar')
  async calificarAlumno(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: { nota: number; porcentajeAsistencia?: number }
  ): Promise<Alumno> {
    return await this.alumnosService.calificar(id, datos.nota, datos.porcentajeAsistencia);
  }

  @ApiOperation({ summary: 'Obtener estadísticas de alumnos por curso' })
  @ApiResponse({ status: 200, description: 'Estadísticas del curso.' })
  @ApiParam({ name: 'cursoId', description: 'ID del curso' })
  @Get('alumnos/curso/:cursoId/estadisticas')
  async obtenerEstadisticasAlumnosPorCurso(@Param('cursoId', ParseIntPipe) cursoId: number) {
    return await this.alumnosService.obtenerEstadisticasPorCurso(cursoId);
  }

}