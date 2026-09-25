# Guía editorial de WhatsApp

Base incorporada el 25 de septiembre de 2026 a partir de los textos y capturas proporcionados por GDC. No modifica el catálogo público ni crea productos, precios o enlaces de pago.

## Comportamiento

- **Hola / buenos días:** conserva el saludo editable del panel.
- **Qué ofrecen / menú / programas:** muestra las once propuestas, incluidos los dos libros y las cartas, con el enlace del dominio configurado. No necesita una llamada a OpenAI.
- **Me interesa [nombre] / qué es [nombre]:** explicación específica (situación, propuesta, práctica y pregunta final), sin enviar otra vez todo el catálogo. Tampoco depende de OpenAI.
- **Preguntas concretas y seguimientos:** OpenAI recibe los últimos 18 mensajes, la base editorial y el catálogo actual. “¿Y cuánto cuesta?” y “más información” mantienen el tema. “Menú” permite explorar otras opciones.
- **Atención humana, baja, crisis o IA desactivada:** conservan las protecciones anteriores; las respuestas editoriales no las saltan.

## Fuentes y límites

`lib/whatsapp-knowledge.ts` contiene las descripciones, alias y reglas de correspondencia comercial. Para explicar estos contenidos prevalece sobre los resúmenes antiguos del catálogo. Las instrucciones del panel siguen personalizando tono y operación; no anulan la veracidad, la separación entre productos ni el menú editorial.

Los precios y las URLs provienen del catálogo dinámico, no de los textos comerciales. Se exige coincidencia de nombre/alias y tipo de producto. En particular:

- El libro **Transforma tu Biocomputadora** no hereda el pago del curso homónimo.
- El programa integral **Super Cerebro** no hereda el pago de la Master Class.
- **Neuroconstelaciones Holográficas Express** no hereda el pago del taller ni del programa sin Express.

Si no existe una correspondencia inequívoca, el asistente explica la propuesta y ofrece consultar disponibilidad con el equipo. No debe afirmar que ya contactó al equipo sin una derivación real.

Los conceptos de BIO-COMPUTADORA, campo morfogenético, doble cuántico, leyes del Universo y otros marcos se atribuyen al enfoque del GDC; no se presentan como evidencia científica, diagnósticos, tratamientos ni resultados garantizados.

## Verificación antes de publicar

Ejecutar `npm test`, `npm run typecheck`, `npm run lint` y `npm run build`. Las pruebas de WhatsApp aíslan base de datos, proveedor y OpenAI: no envían mensajes reales ni consumen la API.

Después de desplegar, usar la prueba del asistente en administración con: “Hola”, “¿Qué ofrecen?”, “Me interesa Neurofitness Active”, “Quiero información sobre las cartas Neurofitness Active”, “Transforma tu Biocomputadora” y “Neuroconstelaciones Holográficas Express”. Para comprobar continuidad, usar una conversación de prueba y seguir con “¿Y cuánto cuesta?” y “Quiero más información”. Verificar que la sesión vinculada siga conectada; este cambio no modifica credenciales, QR ni configuración de sesión.
