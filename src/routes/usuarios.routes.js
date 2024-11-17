import { Router } from "express";
import {
  crearUsuario,
  consUsuario,
  vincularAplicanteComoUsuario,
  editarUsuario,
  consUsuarios,
  habilitarEvaluReinduccion,
  generarExcelBaseDatosUsuarios,
  consultarUsuarioHabilitadoActualizacionDatos,
  actualizarFirmaUsuario,
  elimUsuario
} from "../controllers/usuarios.controllers.js";
import { resultadoValidacion } from "../../helpers/validateHelper.js";
import {
  validarHabilitarUsuario,
  validarEditarUsuario,
  validarElimUsuario,
} from "../../middlewares/validation/usuarios.js";

const router = Router();

router.get("/usuario/numeroDocumento/:numeroDocumento", consUsuario);
router.post("/usuario", crearUsuario);
router.put("/usuario/actualizarUsuario", actualizarFirmaUsuario);
router.post(
  "/usuario/habilitarEvaluReinduccion",
  validarHabilitarUsuario,
  resultadoValidacion,
  habilitarEvaluReinduccion
);
router.put(
  "/usuario",
  /* validarEditarUsuario, resultadoValidacion, */ vincularAplicanteComoUsuario
);
router.put(
  "/usuario/editarUsuario",
  validarEditarUsuario,
  resultadoValidacion,
  editarUsuario
);
router.get(
  "/usuarios/limiteRegistros/:limiteRegistros/ordenadoPor/:ordenadoPor/condicionOrdenado/:condicionOrdenado",
  consUsuarios
);
router.get(
  "/usuarios/generarBaseDatosExcel",
  generarExcelBaseDatosUsuarios
);
router.get(
  "/usuarios/consultarDatosUsuarioHabilitadoActualizacionDatos/numeroDocumento/:numeroDocumento/fechaExpedicionDocumento/:fechaExpedicionDocumento",
  consultarUsuarioHabilitadoActualizacionDatos
);
router.delete("/usuario/numeroDocumento/:numeroDocumento",elimUsuario);


export default router;