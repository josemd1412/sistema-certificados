import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class ArchivoService {
  private readonly baseUploadPath = process.env.CERTIFICADOS_PATH || './uploads/certificados';

  async guardarCertificado(
    archivo: Buffer, 
    numeroCertificado: string,
    fechaEmision: Date
  ): Promise<{ path: string; hash: string; size: number }> {
    
    const año = fechaEmision.getFullYear();
    const mes = (fechaEmision.getMonth() + 1).toString().padStart(2, '0');
    
    // Crear directorio si no existe
    const directorioDestino = path.join(this.baseUploadPath, año.toString(), mes);
    await fs.ensureDir(directorioDestino);
    
    // Generar hash para integridad
    const hash = crypto.createHash('sha256').update(archivo).digest('hex');
    
    // Ruta del archivo
    const nombreArchivo = `${numeroCertificado}.pdf`;
    const rutaCompleta = path.join(directorioDestino, nombreArchivo);
    
    // Guardar archivo
    await fs.writeFile(rutaCompleta, archivo);
    
    return {
      path: rutaCompleta.replace(/\\/g, '/'), // Normalizar path para BD
      hash: hash,
      size: archivo.length
    };
  }

  async obtenerCertificado(rutaArchivo: string): Promise<Buffer> {
    const rutaCompleta = path.resolve(rutaArchivo);
    
    if (!await fs.pathExists(rutaCompleta)) {
      throw new NotFoundException('Archivo PDF no encontrado');
    }
    
    return await fs.readFile(rutaCompleta);
  }

  async verificarIntegridad(rutaArchivo: string, hashEsperado: string): Promise<boolean> {
    try {
      const archivo = await fs.readFile(rutaArchivo);
      const hashActual = crypto.createHash('sha256').update(archivo).digest('hex');
      return hashActual === hashEsperado;
    } catch {
      return false;
    }
  }

  async eliminarArchivo(rutaArchivo: string): Promise<boolean> {
    try {
      await fs.remove(rutaArchivo);
      return true;
    } catch {
      return false;
    }
  }
}