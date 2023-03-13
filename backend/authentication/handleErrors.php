<?php
header("Content-Type: text/html;charset=utf-8");

class HandleErrors
{
    public function sendError($index)
    {
        $errores = array(
          array('idx' => 0, 'estado' => "error", "msg" => "petición no encontrada"),
          array('idx' => 1, 'estado' => "error", "msg" => "petición no aceptada"),
          array('idx' => 2, 'estado' => "error", "msg" => "petición sin contenido"),
          array('idx' => 3, 'estado' => "error", "msg" => "No ha añadido nombre al equipo"),
          array('idx' => 4, 'estado' => "error", "msg" => "usuario no autenticado"),
          array('idx' => 5, 'estado' => "error", "msg" => "no se ha podido eliminar la empresa"),
          array('idx' => 6, 'estado' => "error", "msg" => "no se han añadido los datos del ejercicio"),
		      array('idx' => 7, 'estado' => "error", "msg" => "no se ha actualizado los datos"),
          array('idx' => 8, 'estado' => "error", "msg" => "no hay desglose mensual en el proyecto seleccionado")
        );
        return $errores[$index];
    }

}
