organiza la idea del siguiente prompt y crea un promp optimo con el proceso claro integrado a la aplicacion. solo genera features ordenadas y consisas. no 
generes codigo ni tareas de desarrollo. solo especificaciones.

analiza el proceso de tutorias, y crea un plan para implementar la funcionalidad para produccion, la interface esta creada casi completa, 
- cualquier usuario puede ser alumno y tutor.
- se puede marcar la tutoria como favorita agregar filtro para mostrar favoritos del usuario usar tabla favorites. 
- en formulario de crear nueva tutoria el selector de materias sigue igual @selector de materias.html
- se deben filtrar por todas las materias configuradas.
- en formulario de crear nueva tutoria el tutor puede seleccionar los rangos en los que quiera dar las clases @selector de horarios tutor.html
- se debe editar la tutoria por el usuario que la creo.
- debe haber gestion completa de disponibilidad de horarios, existen slots predefinidos de 4 horas para todos los dias las 24 horas, el tutor puede configurar los slots
 que desee, los alumnos pueden seleccionar rangos de una hora dentro de los slots disponibles del tutor.
- otros usuarios pueden reservar una clase en los horarios que el tutor tiene disponibles y configurados, valida si existe el formulario 
de reservar o crealo. 
- el tutor debe aprobar la reserva
- tutor y alumno pueden ver las reserves y estados.
- alumnos pueden realizar una reseña del tutor y calificar (sistema de rating) luego de la clase presentada y agregar esta reseña a la publicacion. 
- se puede dejar mensajes al tutor en cualquier momento y el tutor dejar respuesta, agrega boton para ver los mensajes que dejaron otros usuarios solo los puede ver el usuario que publico la tutoria. 
- tablas existentes tutoring_bookings.sql y tutoring_sessions.sql
- toma en cuenta que la aplicacion es first movil capacitor. 
- compilar solucion constantemente para identificar errores a tiempo.