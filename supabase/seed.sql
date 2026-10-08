-- Seed: stock inicial del Circo Gran Fantasía (10 ítems, 626,90 kg vivos)

insert into public.inventario_items (codigo, nombre, categoria, cantidad, peso_kg, estado, ubicacion, notas) values
('UTL-001','Trapecio mayor','acrobacia',1,45.00,'operativo','carpa / vagón 2','Cuerdas y mosquetones revisados el 01/10/2026'),
('UTL-002','Colchonetas de acrobacia','acrobacia',6,14.00,'operativo','bodega / estantería norte','Fundas lavadas el 03/10/2026; dos con costura reforzada'),
('UTL-003','Bolas de malabares (caucho)','utilería',12,0.30,'operativo','vagón 1 / arcón de malabares','Se pierde una cada gira; contar antes y después de cada función'),
('UTL-004','Trajes de Arlequín (escena 3)','disfraz',4,1.20,'operativo','vagón 1 / arcón de disfraces','Planchar la noche anterior; el del número 2 tiene un botón de repuesto cosido'),
('UTL-005','Amplificador de escenario 500 W','sonido',2,28.00,'operativo','carpa / control de sonido','Cable de alimentación del nº1 con cinta aisladora; vigilar en cada montaje'),
('UTL-006','Focos PAR 64','iluminación',10,6.50,'operativo','carpa / torre de iluminación','Llevados 3 bombillas de repuesto en la caja ámbar'),
('UTL-007','Lona principal de la carpa','carpa',1,180.00,'operativo','bodega / contenedor','Impermeabilizada el 25/09/2026; secar bien antes de volver al contenedor'),
('UTL-008','Mástiles y puntales de la carpa','carpa',8,22.00,'operativo','bodega / contenedor','Dos puntales con óxido superficial; lijar y pintar en la próxima parada'),
('UTL-009','Arnés acrobático homologado','seguridad',5,2.50,'operativo','bodega / taller del utilero','Costuras rehechas y reforzadas; revisión y prueba de carga firmadas por Don Barnaby el 08/10/2026'),
('UTL-010','Taburete de equilibrista (madera vieja)','utilería',0,3.50,'dado_de_baja','bodega / rincón de chatarra','Resquebrajado en la gira de agosto 2026; se conserva el registro, no se reutiliza');
