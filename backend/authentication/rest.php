<?php
header("Content-Type: text/html;charset=utf-8");

class Rest {
	public $tipo = "application/json";
	public $datosPeticion = array();
	private $_codEstado = 200;
	public function __construct() {
		$this->tratarEntrada();
	}

	public function mostrarRespuesta($data, $estado) {
		$parsedJson = $this->convertirJson($data);
		$this->_codEstado = ($estado) ? $estado : 200;//si no se envía $estado por defecto será 200
		$this->setCabecera();
		echo $parsedJson;
		exit;
	}

	private function setCabecera() {
		header("HTTP/1.1 " . $this->_codEstado . " " . $this->getCodEstado());
		header("Content-Type:" . $this->tipo . ';charset=utf-8');
	}

	private function limpiarEntrada($data) {
		$entrada = array();
		if (is_array($data)) {
			foreach ($data as $key => $value) {
				$entrada[$key] = $this->limpiarEntrada($value);
			}
		} else {
			if (get_magic_quotes_gpc()) {
				//Quitamos las barras de un string con comillas escapadas
				//Aunque actualmente se desaconseja su uso, muchos servidores tienen activada la extensión magic_quotes_gpc.
				//Cuando esta extensión está activada, PHP añade automáticamente caracteres de escape (\) delante de las comillas que se escriban en un campo de formulario.
				$data = trim(stripslashes($data));
			}
			//eliminamos etiquetas html y php
			$data = strip_tags($data);
			//Conviertimos todos los caracteres aplicables a entidades HTML
			$data = htmlentities($data);
			$entrada = trim($data);
		}
		return $entrada;
	}

	private function tratarEntrada() {
		$metodo = $_SERVER['REQUEST_METHOD'];
		switch ($metodo) {
			case "GET":
				$this->datosPeticion = $this->limpiarEntrada($_GET);
				break;
			case "POST":
				$this->datosPeticion = $this->limpiarEntrada($_POST);
				break;
			case "DELETE"://"falling though". Se ejecutará el case siguiente
			case "PUT":
				//php no tiene un método propiamente dicho para leer una petición PUT o DELETE por lo que se usa un "truco":
				//leer el stream de entrada file_get_contents("php://input") que transfiere un fichero a una cadena.
				//Con ello obtenemos una cadena de pares clave valor de variables (variable1=dato1&variable2=data2...)
				//que evidentemente tendremos que transformarla a un array asociativo.
				//Con parse_str meteremos la cadena en un array donde cada par de elementos es un componente del array.
				parse_str(file_get_contents("php://input"), $this->datosPeticion);
				$this->datosPeticion = $this->limpiarEntrada($this->datosPeticion);
				break;
			default:
				$this->response('', 404);
				break;
		}
	}

	private function getCodEstado() {
		$estado = array(
		200 => 'OK',
		201 => 'Created',
		202 => 'Accepted',
		204 => 'No Content',
		301 => 'Moved Permanently',
		302 => 'Found',
		303 => 'See Other',
		304 => 'Not Modified',
		400 => 'Bad Request',
		401 => 'Unauthorized',
		403 => 'Forbidden',
		404 => 'Not Found',
		405 => 'Method Not Allowed',
		500 => 'Internal Server Error');

		$respuesta = ($estado[$this->_codEstado]) ? $estado[$this->_codEstado] : $estado[500];
		return $respuesta;
	}

	public function convertirJson($data) {
		return json_encode($data);
	}

	public function isValidUserToken($token) {

		if (empty($token)) {
			$this->mostrarRespuesta(HandleErrors::sendError(18), 200);
			return false;
		}
		$time = round(time() * 1000);
		if($time > Auth::GetData($token)->exp) {
			$respuesta['error'] = 'error';
			$respuesta['msg'] = 'La sesión ha caducado';
			$this->mostrarRespuesta($respuesta, 200);
			return false;
		}
		return true;
	}

	public function isValidAdminToken($token) {
		$role = Auth::GetData($token)->data->role;
		if($role && $role != 1 && $this->isValidUserToken($token)) {
			$respuesta['error'] = 'error';
			$respuesta['msg'] = 'Necesitas ser administrador para realizar esta operación';
			$this->mostrarRespuesta($respuesta, 200);
			return false;
		} else if (!role && !$this->isValidUserToken($token)) {
			$respuesta['error'] = 'error';
			$respuesta['msg'] = 'El usuario no esta autenticado';
			$this->mostrarRespuesta($respuesta, 200);
			return false;
		}
		return true;
	}

	public function getRoleFromToken($token) {
		return Auth::GetData($token)->data->role;
	}
	public function getTeamFromToken($token) {
		return Auth::GetData($token)->data->id_team;
	}
	public function getIdUserFromToken($token) {
		return Auth::GetData($token)->data->id_user;
	}

	public function operationApiSuperAdmin($sqlQuery, $verb, $noAnswer = true) {
		//$noAnswer es para ser usado en consultas que no devuelva datos(delete,update, insert)

		if ($verb != $_SERVER['REQUEST_METHOD']) {
			$this->mostrarRespuesta(HandleErrors::sendError(1), 405);
		}

		if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
			return false;
		}
		$query = $this->_conn->query($sqlQuery);
		$filas = $query->fetchAll(PDO::FETCH_ASSOC);
		$num = count($filas);

		if ($noAnswer && $num >= 0) {
			return $filas;
		} else if($noAnswer == false) {
			return true;
		}
		return false;
	}

	public function operationApi($sqlQuery, $verb, $noAnswer = true) {
		//$noAnswer es para ser usado en consultas que no devuelva datos(delete,update, insert)

		if ($verb != $_SERVER['REQUEST_METHOD']) {
			$this->mostrarRespuesta(HandleErrors::sendError(1), 405);
		}

		if(!$this->isValidUserToken($this->datosPeticion['token'])) {
			return false;
		}
		$query = $this->_conn->query($sqlQuery);

		$filas = $query->fetchAll(PDO::FETCH_ASSOC);
		$num = count($filas);

		if ($noAnswer && $num >= 0) {
			return $filas;
		} else if($noAnswer == false) {
			return true;
		}
		return false;
	}
}
