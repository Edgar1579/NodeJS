import { formatoRta } from "../scripts/formatoRta.js";
import { obtenerFechaYHoraActual } from "../scripts/fechaHoraActual.js";
import fs from "fs";
import util from "util";
import dayjs from "dayjs";
import "dayjs/locale/es.js";
import { MongoLib } from "../../lib/mongo.js";
const readFile = util.promisify(fs.readFile);
const unlinkFile = util.promisify(fs.unlink);

////////////////////////////////
export const crearUsuario = async (req, res) => {
  const {
    nombre,
    numeroDocumento,
    tipoDocumento,
    fechaExpedicionDocumento,
    email,
    fechaRegistro,
    
    juegos,
  } = req.body;
  console.log("🚀 ~ crearUsuario ~ numeroDocumento:", numeroDocumento);
  obtenerFechaYHoraActual();
  const db = new MongoLib();

  try {
    // Conectarse a la base de datos
    const database = await db.connect();
    const collection = database.collection("usuarios");

    // Revisar si el usuario ya existe
    const usuarioExistente = await collection.findOne({ numeroDocumento });

    if (usuarioExistente) {
      return res
        .status(400)
        .json(
          formatoRta(
            "",
            "",
            `El usuario con documento ${numeroDocumento} ya está registrado.`
          )
        );
    }

    // Crear el nuevo usuario
    const nuevoUsuario = {
      nombre,
      numeroDocumento,
      tipoDocumento,
      fechaExpedicionDocumento,
      email,
      fechaRegistro: new Date(),
      
      juegos,
    };

    const resultado = await collection.insertOne(nuevoUsuario);

    if (resultado.insertedId) {
      res
        .status(201)
        .json(
          formatoRta(
            resultado.insertedId,
            "",
            "Usuario registrado exitosamente"
          )
        );
    } else {
      res
        .status(500)
        .json(
          formatoRta(
            "",
            "",
            "Error al registrar el usuario en la base de datos"
          )
        );
    }
  } catch (error) {
    console.error("Error en crearUsuario:", error);
    res
      .status(500)
      .json(
        formatoRta(
          "",
          "",
          "Ocurrió un error en el servidor. Por favor, inténtelo de nuevo."
        )
      );
  } finally {
    await db.close();
  }
};

export const consUsuario = async (req, res) => {
  let db = null;
  
  try {
    console.log("consUsuario, req.params =>", req.params);
    const { numeroDocumento } = req.params;

    // Validar que numeroDocumento existe
    if (!numeroDocumento) {
      return res.status(400).json(
        formatoRta(null, "Número de documento es requerido")
      );
    }

    db = new MongoLib();
    const database = await db.connect();
    const collection = database.collection("usuarios");

    // Debug: Verificar colecciones disponibles
    const collections = await database.listCollections().toArray();
    console.log("Colecciones disponibles:", collections.map(c => c.name));

    // Debug: Mostrar la consulta
    console.log("Buscando usuario con documento:", numeroDocumento);
    
    const usuario = await collection.findOne({ numeroDocumento: numeroDocumento });
    console.log("Resultado de la búsqueda:", usuario);

    if (usuario) {
      return res.status(200).json(usuario);
    } 

    return res.status(404).json(
      formatoRta(null, "Usuario no encontrado")
    );

  } catch (error) {
    console.error("Error en consUsuario:", error);
    return res.status(500).json(
      formatoRta(
        error.code,
        "Ocurrió un error en el servidor. Por favor, inténtelo de nuevo."
      )
    );
  } finally {
    if (db) {
      try {
        await db.close();
      } catch (error) {
        console.error("Error al cerrar la conexión:", error);
      }
    }
  }
};

export const vincularAplicanteComoUsuario = async (req, res) => {
  //return console.log("entrando a controlador vincularApliacnteComoUsuario");
  try {
    //console.log("datos recibidos", req.body)
    const {
      tipoVivienda,
      segundoNombre,
      lugarExpedicionDocumento,
      vehiculo,
      lugarNacimiento,
      fechaExpedicionDocumento,
      numeroDocumento,
      direccion,
      expectativasComentario,
      primerNombre,
      primerApellido,
      ciudadResidencia,
      anosExperienciaLaboral,
      ultimoCursoRealizado,
      tipoDocumento,
      referenciasPersonal1,
      sede,
      estadoCivil,
      genero,
      celular,
      barrio,
      numeroLibretaMilitar,
      nombreCompleto,
      aspiracionSalarial,
      ultimaEmpresaDondeTrabajo,
      segundoApellido,
      grupoSanguineo,
      nivelEducativo,
      familiarMasCercano,
      aptitudesTecnologicas,
      referenciasPersonal2,
      email,
      cargo,
      fechaNacimiento,
      firmaBase64,
      firmaAlto,
      firmaAncho,
    } = req.body;

    console.log(referenciasPersonal1);

    if (numeroDocumento === "") {
      res
        .status(500)
        .json(
          formatoRta(
            "",
            "",
            "No se recibió el numero de documento en el servidor"
          )
        );
      return;
    }
    if (primerNombre === "") {
      res
        .status(500)
        .json(
          formatoRta("", "", "No se recibió el primer nombre en el servidor")
        );
      return;
    }
    if (primerApellido === "") {
      res
        .status(500)
        .json(
          formatoRta("", "", "No se recibió el primer apellido en el servidor")
        );
      return;
    }

    let sql1 = `UPDATE usuarios SET tipoDocumento = ?,
        fechaExpedicionDocumento = ?,
        primerApellido = ?
        WHERE numeroDocumento = ?`;
    let datos = [tipoDocumento, fechaExpedicionDocumento, primerApellido];

    const [rta1] = await pool.query(sql1, datos);

    if (rta1.changedRows == 1) {
      res.status(200).json({ message: "usuario editado con exito" });
    } else {
      res.status(204).json();
    }
  } catch (e) {
    res.status(500).json(formatoRta(e.code, "", e.message));
    console.log("error", e.code, e.message);
  }
};

export const consUsuarios = async (req, res) => {
  const { limiteRegistros, ordenadoPor, condicionOrdenado } = req.params;
  console.log("params", req.params);

  try {
    const sqlConsUsuarios =
      "SELECT * FROM usuarios ORDER BY " +
      ordenadoPor +
      " " +
      condicionOrdenado +
      " LIMIT " +
      limiteRegistros +
      "";
    const rtaUsuarios = await pool.query(sqlConsUsuarios, []);

    if (rtaUsuarios.length > 0) {
      //formateo las fechas
      const usuariosFormateados = rtaUsuarios[0].map((usuario) => {
        //formateo fechaExpedicionDocumento
        const fechaExpedicionDocumentoFormateada =
          usuario.fechaExpedicionDocumento.toISOString().split("T")[0];

        //formateo fechaNacimiento
        const fechaExpedicionNacimientoFormateada = usuario.fechaNacimiento
          .toISOString()
          .split("T")[0];

        return {
          ...usuario,
          fechaExpedicionDocumento: fechaExpedicionDocumentoFormateada,
          fechaNacimiento: fechaExpedicionNacimientoFormateada,
        };
      });
      res.status(200).json(usuariosFormateados);
    } else {
      res.status(204).json();
    }
  } catch (e) {
    res
      .status(500)
      .json(
        formatoRta(
          e.code,
          "",
          "Favor avisar a sistemas, código error: " +
            e.code +
            ", mensaje del servidor " +
            e.message
        )
      );
  }
};

export const habilitarEvaluReinduccion = async (req, res) => {
  const { numeroDocumento } = req.body;
  console.log(
    "se habilitará para que presente la evaluación de reinduccion al usuario numero de documento " +
      numeroDocumento
  );
  /* try {
    const [rtaUsuario] = await pool.query(sqlTrabajdor, [numeroDocumento]);
    //console.log(rtaUsuario)
    if (rtaUsuario.length > 0) {
      //actualizar la fecha de habilitacion en la tabla usuarios
      try {
        let emailDestinatario = rtaUsuario[0].email;

        let cuerpoHtml = ``;

        const [insertHabilitado] = await pool.query(sqlInsertHabilitado, [
          numeroDocumento,
        ]);

        if (insertHabilitado.affectedRows === 1) {
          //
          try {
            let info = await sistemasTransporter.sendMail({
              from: "CORREO DE ORIGEN<correo@correo.com>", // sender address
              to: email, // list of receivers
              subject:
                "Se le ha habilitado el acceso para continuar en el proceso", // Subject line
              //text: "Nuevo concepto generado?", // plain text body
              html: cuerpoHtml, // html body
            });

            //console.log(info)

            if (info.response == "250 Message received") {
              res.status(200).json();
            }
          } catch (e) {
            //console.log("e", e)
            res.status(500).json(formatoRta(e.code, "", "" + e.response));
          }
        }
      } catch (e) {
        //aca mire como se maneja el error del entry key duplicado
        console.log("e", e.sqlMessage);
        return res.status(400).json(formatoRta(e.errno, "", e.sqlMessage));
      }
    }
  } catch (e) {
    res
      .status(500)
      .json(
        formatoRta(
          e.code,
          "",
          "Favor avisar a sistemas, código error: " +
            e.code +
            ", mensaje del servidor " +
            e.message
        )
      );
  } */
};

export const generarExcelBaseDatosUsuarios = async (req, res) => {
  let wb, datos;

  try {
    let sql = `WITH ContratosRecientes AS ( SELECT numeroDocumento, MAX(id) AS ultimoContratoId FROM contratos GROUP BY numeroDocumento)
        SELECT 
            t.id,
            t.tipoDocumento,
            t.numeroDocumento,
            t.fechaExpedicionDocumento,
            t.primerApellido,
            t.segundoApellido,
            t.primerNombre,
            t.segundoNombre,
            t.nombreCompleto,
            t.idEps,
            t.idFondoPensiones,
            t.idFondoCesantias,
            t.idCajaCompensacionFamiliar,
            t.cargo,
            t.direccion,
            t.barrio,
            t.celular,
            t.ciudadResidencia,
            t.email,
            t.estadoCivil,
            t.genero,
            t.grupoSanguineo,
            t.nivelEducativo,
            t.numeroLibretaMilitar,
            t.sede,
            t.vehiculo,
            t.ultimoCursoRealizado,
            t.tipoVivienda,
            t.lugarExpedicionDocumento,
            t.lugarNacimiento,
            t.expectativasComentario,
            t.anosExperienciaLaboral,
            t.referenciasPersonal1,
            t.referenciasPersonal2,
            t.aspiracionSalarial,
            t.ultimaEmpresaDondeTrabajo,
            t.familiarMasCercano,
            t.aptitudesTecnologicas,
            t.fechaNacimiento,
            c.id AS idUltimoContrato,
            c.estado AS estadoUltimoContrato,
            c.fechaInicio AS fechaInicioUltimoContrato,
            c.puesto AS puestoUltimoContrato,
            c.cliente AS clienteUltimoContrato
        FROM 
            usuarios t
        LEFT JOIN 
            ContratosRecientes cr ON t.numeroDocumento = cr.numeroDocumento
        LEFT JOIN 
            contratos c ON cr.ultimoContratoId = c.id;`;

    const [filas] = await pool.query(sql, []);
    console.log(filas);

    if (filas.length > 0) {
      // Crea un libro de trabajo
      wb = utils.book_new();

      datos = [
        [
          "TIPO DOC",
          "NUMERO DOC",
          "FECHA EXP DOC",
          "SEDE",
          "CARGO",
          "PRIMER APELLIDO",
          "SEGUNDO APELLIDO",
          "PRIMER NOMBRE",
          "SEGUNDO NOMBRE",
          "FECHA NACIMIENTO",
          "GENERO",
          "CELULAR",
          "DIRECCION",
          "BARRIO",
          "CIUDAD RESIDENCIA",
          "EMAIL",
          "GRUPO SANGUINEO",
          "NIVEL EDUCATIVO",
          "FAMILIAR MAS CERCANO",
          "VEHICULO",
          "VIVIENDA",
          "ESTADO ULTIMO CONTRATO",
          "FECHA INICIO ULTIMO CONTRATO",
          "ID ULTIMO CONTRATO",
          "PUESTO",
          "CLIENTE",
        ],
      ];

      filas.forEach((t) => {
        datos.push([
          t.tipoDocumento,
          t.numeroDocumento,
          t.fechaExpedicionDocumento,
          t.sede,
          t.cargo,
          t.primerApellido,
          t.segundoApellido,
          t.primerNombre,
          t.segundoNombre,
          t.fechaNacimiento,
          t.genero,
          t.celular,
          t.direccion,
          t.barrio,
          t.ciudadResidencia,
          t.email,
          t.grupoSanguineo,
          t.nivelEducativo,
          t.familiarMasCercano,
          t.vehiculo,
          t.tipoVivienda,
          t.estadoUltimoContrato,
          t.fechaInicioUltimoContrato,
          t.idUltimoContrato,
          t.puestoUltimoContrato,
          t.clienteUltimoContrato,
        ]);
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send(formatoRta("", "", error.sqlMessage));
  }

  //excel construido, se envia entonces
  try {
    // Convierte los datos a una hoja de trabajo
    const ws = utils.aoa_to_sheet(datos);

    // Añade la hoja de trabajo al libro con el nombre "Datos"
    utils.book_append_sheet(wb, ws, "Datos");

    // Escribe el libro de trabajo a un archivo
    let nombreExcel = "baseDatos.xlsx";
    writeFile(wb, nombreExcel);

    console.log("¡Excel generado con éxito!");
    // Leer el archivo
    const excelContent = await readFile(nombreExcel);
    // Enviar el archivo como respuesta
    res.contentType(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(excelContent);

    //Eliminar el archivo del servidor después de enviarlo
    await unlinkFile(nombreExcel);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send(formatoRta("", "", "Error al enviar el archivo."));
  }
};

export const consultarUsuarioHabilitadoActualizacionDatos = async (
  req,
  res
) => {
  const { numeroDocumento, fechaExpedicionDocumento } = req.params;

  //console.log('req.params recibidos', req.params)
  if (numeroDocumento == "") {
    res
      .status(500)
      .json(formatoRta("", "", "No se recibio el numero de documento"));
    return;
  }
  if (fechaExpedicionDocumento == "") {
    res
      .status(500)
      .json(formatoRta("", "", "No se recibio el numero de documento"));
    return;
  }

  const arrRta = await consRegistrosPor1CampoOrderByLimit(
    "habilitadosActualizacionDatos",
    "numeroDocumento",
    numeroDocumento,
    "id",
    "desc",
    1
  );

  if (arrRta.length === 1) {
    try {
      const sql1 = "SELECT * FROM usuarios WHERE numeroDocumento = ?";
      const [rtaMySql] = await pool.query(sql1, [numeroDocumento]);
      if (rtaMySql.length === 1) {
        let datosUsuario = rtaMySql[0];
        console.log(
          "datosUsuario antes de validar si concuerda con la fechaExpedicionDocumento",
          datosUsuario
        );

        if (
          fechaExpedicionDocumento ===
          dayjs(datosUsuario.fechaExpedicionDocumento).format("YYYY-MM-DD")
        ) {
          console.log(
            `fecha exp documento recibida ${fechaExpedicionDocumento} si concuerda con la actual del usuario ${datosUsuario.fechaExpedicionDocumento}`
          );
          res.status(200).json(rtaMySql[0]);
        } else {
          res
            .status(403)
            .json(
              formatoRta(
                "",
                "",
                "Usuario esta autorizado para actualizar los datos pero la fecha de expedición no pertenece al numero de documento digitado"
              )
            );
        }
      } else {
        res.status(404).json(formatoRta("", "", "Usuario no existe"));
      }
    } catch (e) {
      res
        .status(500)
        .json(
          formatoRta(
            e.code,
            "",
            "Favor avisar a sistemas, código error: " +
              e.code +
              ", mensaje del servidor " +
              e.message
          )
        );
    }
  } else {
    res
      .status(403)
      .json(
        formatoRta(
          "",
          "",
          "No está habilitado para realizar actualización de datos"
        )
      );
  }
};

export const actualizarFirmaUsuario = async (req, res) => {
  console.log(req.body);
  const {
    nombre,
    numeroDocumento,
    tipoDocumento,
    email,
    fechaRegistro,
    fechaExpedicionDocumento,
    juegos,
  } = req.body;
  obtenerFechaYHoraActual();

  const db = new MongoLib();

  try {
    // Conectar a la base de datos
    const database = await db.connect();
    const collection = database.collection("usuarios");
    const result = await collection.updateOne(
      { numeroDocumento }, //---> para validar el registro que se va a actualizar
      {
        $set: {
          nombre,
          tipoDocumento,
          email,
          fechaRegistro,
          fechaExpedicionDocumento,
          juegos,
        },
      }
    );
    console.log("🚀 ~ editarUsuario ~ result:", result);

    if (result.matchedCount === 1) {
      console.log("Usuario actualizado:", numeroDocumento);
      res
        .status(200)
        .json(
          formatoRta(
            "",
            "",
            `Usuario con documento ${numeroDocumento} actualizado con éxito`
          )
        );
    } else {
      console.log("Usuario no encontrado para actualizar");
      res.status(404).json(formatoRta("", "", "Usuario no encontrado"));
    }
  } catch (error) {
    console.error("Error en editUsuario:", error);
    res
      .status(500)
      .json(
        formatoRta(
          error.code,
          "",
          "Ocurrió un error en el servidor. Por favor, inténtelo de nuevo."
        )
      );
  } finally {
    await db.close();
  }
};

export const editarUsuario = async (req, res) => {
  console.log("editUsuario, req.body =>", req.body);
  const {
    nombre,
    numeroDocumento,
    tipoDocumento,
    email,
    fechaRegistro,
    fechaExpedicionDocumento,
    juegos,
  } = req.body;
  obtenerFechaYHoraActual();

  const db = new MongoLib();

  try {
    // Conectar a la base de datos
    const database = await db.connect();
    const collection = database.collection("usuarios");
    const result = await collection.updateOne(
      { numeroDocumento }, //---> para validar el registro que se va a actualizar
      {
        $set: {
          nombre,
          tipoDocumento,
          email,
          fechaRegistro,
          fechaExpedicionDocumento,
          juegos,
        },
      }
    );
    console.log("🚀 ~ editarUsuario ~ result:", result);

    if (result.matchedCount === 1) {
      console.log("Usuario actualizado:", numeroDocumento);
      res
        .status(200)
        .json(
          formatoRta(
            "",
            "",
            `Usuario con documento ${numeroDocumento} actualizado con éxito`
          )
        );
    } else {
      console.log("Usuario no encontrado para actualizar");
      res.status(404).json(formatoRta("", "", "Usuario no encontrado"));
    }
  } catch (error) {
    console.error("Error en editUsuario:", error);
    res
      .status(500)
      .json(
        formatoRta(
          error.code,
          "",
          "Ocurrió un error en el servidor. Por favor, inténtelo de nuevo."
        )
      );
  } finally {
    await db.close();
  }
};

export const elimUsuario = async (req, res) => {
  console.log("elimUsuario, req.params =>", req.params);
  obtenerFechaYHoraActual();

  const { numeroDocumento } = req.params;
  if (!numeroDocumento) {
    return res
      .status(400)
      .json(formatoRta("", "", "No se recibió el número de documento"));
  }
  const db = new MongoLib();
  try {
    // Conectarse a la base de datos
    const database = await db.connect();
    const collection = database.collection("usuarios");

    // Intentar eliminar el usuario por número de documento
    const result = await collection.deleteOne({ numeroDocumento });

    if (result.deletedCount === 1) {
      console.log("Usuario eliminado:", numeroDocumento);
      res
        .status(200)
        .json(
          formatoRta(
            "",
            "",
            `Usuario con documento ${numeroDocumento} eliminado exitosamente`
          )
        );
    } else {
      console.log("Usuario no encontrado para eliminación");
      res.status(404).json(formatoRta("", "", "Usuario no encontrado"));
    }
  } catch (error) {
    console.error("Error en elimUsuario:", error);
    res
      .status(500)
      .json(
        formatoRta(
          error.code,
          "",
          "Ocurrió un error en el servidor. Por favor, inténtelo de nuevo."
        )
      );
  } finally {
    await db.close();
  }
};