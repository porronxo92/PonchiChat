import path from 'node:path'
import { fileURLToPath } from 'url'

/* ACTUALMENTE RECOMENDADO AHORA EN ESMODULES6 
ASI SE LEE/ESCRIBE EN ARCHIVOS LOCALES DEL PROYECTO*/
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const readJSON = (path) => require(path)
export const readPathPublic = () => path.join(__dirname, 'public')
export const joinPath = (...paths) => path.join(...paths)

export const getDateNow = (timestamp) => {
  // Crear un nuevo objeto Date utilizando el timestamp
  const date = new Date(timestamp)

  // Obtener los componentes de la hora
  const hours = String(date.getHours()).padStart(2, '0') // Agrega un cero a la izquierda si es necesario
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  // Formatear la hora en el formato hh:mm:ss
  const formattedTime = `${hours}:${minutes}:${seconds}`

  return formattedTime // Ejemplo de salida: 12:35:33
}
