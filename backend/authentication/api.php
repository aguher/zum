<?php
header("Content-Type: text/html;charset=utf-8");
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

error_reporting(E_ERROR);
//error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once("rest.php");
require_once("auth.php");
require_once("models.php");
require_once("shared.php");
require_once("handleErrors.php");
require_once("connection.php");
require_once 'vendor/autoload.php';
date_default_timezone_set('Etc/UTC');

class Api extends Rest {

	public $_conn = NULL;
	private $_metodo;
	private $_argumentos;
	public function __construct() {

		parent::__construct();
		$this->_conn = Connection::connectDB();
	}


	Public function SendMail($to,$subject,$body,$headers){
		if (mail($to, $subject, $body, $headers)) {
			return true;
		} else {
			return false;
		}
	}

	public function isValidSuperAdminToken($token) {

		if (empty($token)) {
			$this->mostrarRespuesta(HandleErrors::sendError(4), 200);
			return false;
		}

		$time = round(time() * 1000);
		$role = Auth::GetData($token)->data->role;
		if($time > Auth::GetData($token)->exp) {
			$respuesta['error'] = 'error';
			$respuesta['msg'] = 'La sesión ha caducado';
			$this->mostrarRespuesta($respuesta, 200);
			return false;
		}
		if($role > 5) {
			$respuesta['error'] = 'error';
			$respuesta['msg'] = 'Necesitas ser administrador para realizar esta operación';
			$this->mostrarRespuesta($respuesta, 200);
			return false;
		}
		return true;
	}

	public function test(){
		echo "entra en test";
	} 



	public function procesarLLamada() {

		if (isset($_REQUEST['url'])) {
			//si por ejemplo pasamos explode('/','////controller///method////args///') el resultado es un array con elem vacios;
			//Array ( [0] => [1] => [2] => [3] => [4] => controller [5] => [6] => [7] => method [8] => [9] => [10] => [11] => args [12] => [13] => [14] => )
			$url = explode('/', trim($_REQUEST['url']));
			//con array_filter() filtramos elementos de un array pasando función callback, que es opcional.
			//si no le pasamos función callback, los elementos false o vacios del array serán borrados
			//por lo tanto la entre la anterior función (explode) y esta eliminamos los '/' sobrantes de la URL
			$url = array_filter($url);

			$this->_metodo = strtolower(array_shift($url));
			$this->_argumentos = $url;
			$func = $this->_metodo;
			if ((int) method_exists($this, $func) > 0) {
				if (count($this->_argumentos) > 0) {
					call_user_func_array(array($this, $this->_metodo), $this->_argumentos);
				} else {//si no lo llamamos sin argumentos, al metodo del controlador
					call_user_func(array($this, $this->_metodo));
				}
			}
			else {
				$this->mostrarRespuesta(HandleErrors::sendError(0), 200);
			}
		}else{
			$this->mostrarRespuesta(HandleErrors::sendError(0), 200);
		}
	}

	private function login() {
     if ($_SERVER['REQUEST_METHOD'] != "POST") {
       $this->mostrarRespuesta(HandleErrors::sendError(1), 405);
     }
     if (isset($this->datosPeticion['pwd'], $this->datosPeticion['email'])) {

       $pwd = $this->datosPeticion['pwd'];
       $email = $this->datosPeticion['email'];
       if (!empty($pwd) and !empty($email)) {
    		 $query = $this->_conn->prepare("SELECT last_id_company_logged, last_id_fiscal_year_logged FROM `tt_user` WHERE password='".$pwd."' AND email='".$email."' AND status=1");
         $query->execute();
				 $data = $query->fetch(PDO::FETCH_ASSOC);

				 if($data['last_id_company_logged'] != 0 && $data['last_id_fiscal_year_logged'] != 0) {
					 $query = $this->_conn->prepare("SELECT user.id, nickname, email, password, id_role, user.id_company, company.name as company_name, id_team, last_id_company_logged, last_id_fiscal_year_logged,
						 company.address as address, company.address_bis as address_bis, company.logo as logo, company.cif as cif, company.phone as phone, company.credits as credits, company.rgpd as rgpd,
						  company.id as id_company, fiscal_year.id as id_fiscal_year, fiscal_year_bis.year as year
						 FROM
						 `tt_user` user
						 inner join `tt_company` company
						 on company.id = user.last_id_company_logged
						 inner join `tt_company_year` fiscal_year
						 on fiscal_year.id = user.last_id_fiscal_year_logged
						 inner join `tt_fiscal_year` fiscal_year_bis
						 on fiscal_year_bis.id = fiscal_year.id_fiscal_year
						 WHERE
	         		user.password='".$pwd."' AND user.email='".$email."' AND user.status=1");
			 $query->execute();
			;
	         if ($fila = $query->fetch(PDO::FETCH_ASSOC)) {
	           $respuesta['status'] = 'ok';
	           $respuesta['role'] = $fila['id_role'];
	           $respuesta['usuario']['nickname'] = $fila['nickname'];
	           $respuesta['usuario']['id_user'] = $fila['id'];
						 $respuesta['company']['id_company'] = $fila['id_company'];
						 $respuesta['company']['name'] = $fila['company_name'];
						 $respuesta['company']['address'] = $fila['address'];
						 $respuesta['company']['address_bis'] = $fila['address_bis'];
						 $respuesta['company']['cif'] = $fila['cif'];
						// $respuesta['company']['phone'] = $fila['phone'];
						 $respuesta['company']['credits'] = $fila['credits'];	
						 $respuesta['company']['rgpd'] = $fila['rgpd'];						 						 
						 $respuesta['company']['logo'] = $fila['logo'];
						 $respuesta['fiscal_year']['id'] = $fila['id_fiscal_year'];
						 $respuesta['fiscal_year']['year'] = $fila['year'];
						 $respuesta['fiscal_year']['name'] = $fila['year'];


	           $param = array('id' => $fila['id'],'nickname' => $fila['nickname'],'role' => $fila['id_role'],
						 								'id_user' => $fila['id'],'id_company' => $fila['id_company'], 'company_name' => $fila['name'], 'id_team' => $fila['id_team']);
	           $respuesta['token'] = Auth::SignIn($param);
						 $this->mostrarRespuesta($respuesta, 200);
	         }

				 } else {

					 $query = $this->_conn->prepare("SELECT user.id, nickname, email, password, id_role, id_company, company.name, id_team, last_id_company_logged, last_id_fiscal_year_logged FROM
						 `tt_user` user
						 inner join `tt_company` company
						 on company.id = user.id_company
						 WHERE
	         		user.password='".$pwd."' AND user.email='".$email."' AND user.status=1");
	         $query->execute();
	         if ($fila = $query->fetch(PDO::FETCH_ASSOC)) {
	           $respuesta['status'] = 'ok';
	           $respuesta['role'] = $fila['id_role'];
	           $respuesta['usuario']['nickname'] = $fila['nickname'];
	           $respuesta['usuario']['id_user'] = $fila['id'];
	           $param = array('id' => $fila['id'],'nickname' => $fila['nickname'],'role' => $fila['id_role'],
						 								'id_user' => $fila['id'],'id_company' => $fila['id_company'], 'company_name' => $fila['name'], 'id_team' => $fila['id_team']);
	           $respuesta['token'] = Auth::SignIn($param);
						 $this->mostrarRespuesta($respuesta, 200);
	         }
				 }
       }
     }
     //$this->mostrarRespuesta(HandleErrors::sendError(3), 401);

   }

   public function getCustomerAddresses(){
		if (isset($this->datosPeticion['id_company'], $this->datosPeticion['id_customer']) ) {

			$id_company = $this->datosPeticion['id_company'];
			$id_customer = $this->datosPeticion['id_customer'];

			$response = $this->operationApi("SELECT * FROM tt_customer_address where id_customer='".$id_customer."' order by id ASC", 'GET');
			if ( $response != false) {
				$jsonResponse['status'] = 'ok';
				$jsonResponse['items'] = $response;

				$this->mostrarRespuesta($jsonResponse, 200);
			}
			else {
				$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
			}
		} else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
   }

   public function getCountries(){
	if (isset($this->datosPeticion['id_company']) ) {

		$id_company = $this->datosPeticion['id_company'];


		$response = $this->operationApi("SELECT * FROM tt_countries order by id ASC", 'GET');
		if ( $response != false) {
			$jsonResponse['status'] = 'ok';
			$jsonResponse['items'] = $response;

			$this->mostrarRespuesta($jsonResponse, 200);
		}
		else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	} else {
		$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
	}
}

   public function getStadisticsBilling(){
	if ($_SERVER['REQUEST_METHOD'] != "GET") {
		$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
	}
	if (isset($this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year']) ) {
		$id_company = $this->datosPeticion['id_company'];
		$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
		

		$strQuery = "select sum(round(tax_base,2)) as importe, YEAR(issue_date) as anyo, MONTH(issue_date) as mes
					from `tt_billing`
					where id_company = '".$id_company."'
					and year(issue_date) >= YEAR(CURDATE()) - 2
					group by YEAR(issue_date), MONTH(issue_date)
					order by YEAR(issue_date), MONTH(issue_date)";

		$query = $this->_conn->prepare($strQuery);
		$query->execute();
		$mensual = $query->fetchAll(PDO::FETCH_ASSOC);
		$respuesta['mensual'] = $mensual;

		$strQuery = "select round(sum(round(tax_base,2)),2) as importe, customer_name
					from `tt_billing` billing, `tt_customer` customer, `tt_company_year` c_year, `tt_fiscal_year` f_year
					where billing.id_company = '".$id_company."'
					and c_year.id = '".$id_fiscal_year."'
					and c_year.id_fiscal_year = f_year.id
					and customer.id = billing.id_customer
					and year(issue_date) = f_year.year
					group by customer_name
					order by importe DESC";

		$query = $this->_conn->prepare($strQuery);
		$query->execute();
		$clientes = $query->fetchAll(PDO::FETCH_ASSOC);
		$respuesta['clientes'] = $clientes;

		$respuesta['status']='ok';
		$this->mostrarRespuesta($respuesta, 200);
	}
   }

   public function getStadisticsCampaigns(){
	if ($_SERVER['REQUEST_METHOD'] != "GET") {
		$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
	}
	if (isset($this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year']) ) {
		$id_company = $this->datosPeticion['id_company'];
		$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
		$estado = $this->datosPeticion['estado'];

		$body = ($estado == -1 ? '' : ' and tt_campaign.id_status = '.$estado);

		
		$strQuery = "select sum(round(amount*unit_budget*price*case when bdesestimado = 2 then 0 else 1 end,2)) as importe, YEAR(creation_date) as anyo, MONTH(creation_date) as mes
		from `tt_campaign` tt_campaign
		inner join tt_subconcepts_project on tt_subconcepts_project.id_project = tt_campaign.id
		where id_company = '".$id_company."'
		and year(creation_date) >= YEAR(CURDATE()) - 2 ".$body."
		group by YEAR(creation_date), MONTH(creation_date)
		order by YEAR(creation_date), MONTH(creation_date)";

		$query = $this->_conn->prepare($strQuery);
		$query->execute();
		$mensual = $query->fetchAll(PDO::FETCH_ASSOC);
		$respuesta['mensual'] = $mensual;

		$body = ($estado == -1 ? '' : ' and campaign.id_status = '.$estado);

		$strQuery = "select round(sum(round(amount*unit_budget*price*case when bdesestimado = 2 then 0 else 1 end,2)),2) as importe, customer_name
				from `tt_campaign` campaign, `tt_customer` customer, `tt_company_year` c_year, `tt_fiscal_year` f_year, `tt_subconcepts_project` subc
				where campaign.id_company = '".$id_company."' ".$body."
				and c_year.id = '".$id_fiscal_year."'
				and c_year.id_fiscal_year = f_year.id
				and customer.id = campaign.id_customer
				and year(creation_date) = f_year.year
				and subc.id_project = campaign.id
				group by customer_name
				order by importe DESC";

		$query = $this->_conn->prepare($strQuery);
		$query->execute();
		$clientes = $query->fetchAll(PDO::FETCH_ASSOC);
		$respuesta['clientes'] = $clientes;

		$respuesta['status']='ok';
		$this->mostrarRespuesta($respuesta, 200);
	}
   }

   public function getInfoBilling() {
	if ($_SERVER['REQUEST_METHOD'] != "GET") {
		$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
	}
	if (isset($this->datosPeticion['id_company'],$this->datosPeticion['id_fiscal_year'])) {
		$id_company = $this->datosPeticion['id_company'];
		$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
		$id = $this->datosPeticion['id'];

		$strQuery = "select serie FROM tt_company_year where id='".$id_fiscal_year."'";

		$query = $this->_conn->prepare($strQuery);
		$query->execute();
		$serie = $query->fetch(PDO::FETCH_ASSOC);
		$respuesta['serie'] = $serie;

		$strQuery = "select * FROM tt_customer_address where id_customer in (select id_customer from tt_billing where id ='".$id."')";

		$query = $this->_conn->prepare($strQuery);
		$query->execute();
		$address = $query->fetchAll(PDO::FETCH_ASSOC);
		$respuesta['address'] = $address;

		$query = "select billing.numbertext, billing.percent_tax,customer.id as id_customer, company.name as company_name, company.CIF as cifCompany, 
		company.address as address_company, company.address_bis as address_bisCompany, 
		company.logo as logoCompany, billing.id, billing.number, billing.description, 
		billing.issue_date, billing.due_date, billing.PO, customer.logo,
		customer.customer_name, customer.cif, customer.address, customer.address_bis, 
		customer.Postal_Code, customer.city, customer.country, campaign.ped_code, billing.id_address,
		billing.id_rect, case when billing.id_rect <> 0 then (select numbertext from tt_billing where id=billing.id_rect) else 0 end as numbertext_rect,
		billing.id_export,
		(select valuechar from tt_valuesbvsfields where idtable = campaign.id and freefieldsvscompanyid = 1) as numcampana							
		from tt_billing billing
		inner join `tt_customer` customer
		on billing.id_customer=customer.id
		inner join `tt_campaign` campaign
		on billing.id_project=campaign.id		
		inner join `tt_company` company
		on billing.id_company=company.id
  		where billing.id='".$id."' and billing.id_company='".$id_company."' and billing.id_fiscal_year='".$id_fiscal_year."'";

		$query = $this->_conn->prepare($query);
		$query->execute();
		$billing = $query->fetch(PDO::FETCH_ASSOC);
		$respuesta['status']='ok';
		$respuesta['bill'] = $billing;
		$this->mostrarRespuesta($respuesta, 200);
	}
}

	 public function getProjectsBudgets() {
		 if ($_SERVER['REQUEST_METHOD'] != "GET") {
			 $this->mostrarRespuesta(HandleErrors::sendError(1), 400);
		 }
		 $role = $this->getRoleFromToken($this->datosPeticion['token']);
		 $team = $this->getTeamFromToken($this->datosPeticion['token']);
		 $idUser = $this->getIdUserFromToken($this->datosPeticion['token']);

		 if (isset($this->datosPeticion['id_company'],$this->datosPeticion['id_company_year'])) {
			 $id_company = $this->datosPeticion['id_company'];
			 $id_fiscal_year = $this->datosPeticion['id_company_year'];

			 $budgetQuery = "select id, name FROM `tt_budget` where id_company='".$id_company."' and id_fiscal_year='".$id_fiscal_year."' order by name ASC";
			 $projectQuery = "select id, campaign_name FROM `tt_campaign` where id_company='".$id_company."' and id_fiscal_year='".$id_fiscal_year."' order by campaign_name ASC";

			 if($role == 6) { // si es supervisor, selecciono proyectos y presupuestos de mi equipo
				 $budgetQuery = "select id, name FROM `tt_budget` where id_company='".$id_company."' and id_fiscal_year='".$id_fiscal_year."' and id_team='".$team."' order by name ASC";
				 $projectQuery = "select id, campaign_name FROM `tt_campaign` where id_company='".$id_company."' and id_fiscal_year='".$id_fiscal_year."' and id_team='".$team."' order by campaign_name ASC";
			 }
			 elseif ($role == 7 || $role == 8) { // si es cuentas 1 o cuentas 2, seleccionamos los presupuestos que hayan creado ellos mismos y los proyectos de su equipo o seguridad baja
			 	$budgetQuery = "select id, name FROM `tt_budget` where id_company='".$id_company."' and id_fiscal_year='".$id_fiscal_year."' and id_user='".$idUser."' order by name ASC";
				$projectQuery = "select id, campaign_name FROM `tt_campaign` where id_company='".$id_company."' and id_fiscal_year='".$id_fiscal_year."' and id_team='".$team."'
				and (id_user='".$idUser."' or security_level='Bajo') order by campaign_name ASC";
			 }


			 $query = $this->_conn->prepare($budgetQuery);
			 $query->execute();
			 $budgets = $query->fetchAll(PDO::FETCH_ASSOC);

			 $query = $this->_conn->prepare($projectQuery);
			 $query->execute();
			 $projects = $query->fetchAll(PDO::FETCH_ASSOC);


			 $respuesta['budgets'] = $budgets;
			 $respuesta['projects'] = $projects;

			 $this->mostrarRespuesta($respuesta, 200);
		 }
		 $this->mostrarRespuesta(HandleErrors::sendError(3), 204);

	 }

	 public function getDataCombosStorage() {
		if ($_SERVER['REQUEST_METHOD'] != "GET") {
			$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
		}
		if (isset($this->datosPeticion['id_company'],$this->datosPeticion['id_fiscal_year'])) {
			$id_company = $this->datosPeticion['id_company'];
			$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];


/* 			$query = $this->_conn->prepare("select * FROM `tt_customer` where id_company='".$id_company."' order by customer_name ASC");
			$query->execute();
			$filas = $query->fetchAll(PDO::FETCH_ASSOC);

			$respuesta['customers'] = $filas; */

			$query = $this->_conn->prepare("select * FROM `tt_subconcepts_standards` where id_company=".$id_company);
			$query->execute();
			$filas = $query->fetchAll(PDO::FETCH_ASSOC);

			$respuesta['articles'] = $filas;

			$query = $this->_conn->prepare("select * FROM `tt_articles_envelopes` where id_company=".$id_company);
			$query->execute();
			$filas = $query->fetchAll(PDO::FETCH_ASSOC);

			$respuesta['envelopes'] = $filas;

			$query = $this->_conn->prepare("select * FROM `tt_articles_families` where id_company=".$id_company);
			$query->execute();
			$filas = $query->fetchAll(PDO::FETCH_ASSOC);

			$respuesta['families'] = $filas;

			$query = $this->_conn->prepare("select * FROM `tt_articles_state` where id_company=".$id_company);
			$query->execute();
			$filas = $query->fetchAll(PDO::FETCH_ASSOC);

			$respuesta['states'] = $filas;

			$query = $this->_conn->prepare("select * FROM `tt_warehouse` where id_company=".$id_company);
			$query->execute();
			$filas = $query->fetchAll(PDO::FETCH_ASSOC);

			$respuesta['warehouses'] = $filas;

			$query = $this->_conn->prepare("select * FROM `tt_customer` where id_company=".$id_company);
			$query->execute();
			$filas = $query->fetchAll(PDO::FETCH_ASSOC);

			$respuesta['customer'] = $filas;

			$this->mostrarRespuesta($respuesta, 200);
		}
		$this->mostrarRespuesta(HandleErrors::sendError(3), 204);


	}

	 /*** CAMPAIGNS ***/
	 	public function getDataCombos() {
			if ($_SERVER['REQUEST_METHOD'] != "GET") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if (isset($this->datosPeticion['id_company'],$this->datosPeticion['id_fiscal_year'])) {
				$id_company = $this->datosPeticion['id_company'];
				$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];


				$query = $this->_conn->prepare("select * FROM `tt_user` where id_company='".$id_company."' order by nickname ASC");
				$query->execute();
				$filas = $query->fetchAll(PDO::FETCH_ASSOC);

				$respuesta['users'] = $filas;

				$query = $this->_conn->prepare("select * FROM `tt_customer` where id_company='".$id_company."' order by customer_name ASC");
				$query->execute();
				$filas = $query->fetchAll(PDO::FETCH_ASSOC);

				$respuesta['customers'] = $filas;

				$query = $this->_conn->prepare("select * FROM `tt_team` where id_company='".$id_company."' order by team_name ASC");
				$query->execute();
				$filas = $query->fetchAll(PDO::FETCH_ASSOC);

				$respuesta['teams'] = $filas;

				$query = $this->_conn->prepare("select * FROM `tt_group` where id_company='".$id_company."' order by name ASC");
				$query->execute();
				$filas = $query->fetchAll(PDO::FETCH_ASSOC);

				$respuesta['groups'] = $filas;

				$query = $this->_conn->prepare("select * FROM `tt_subgroup` where id_company='".$id_company."' order by name ASC");
				$query->execute();
				$filas = $query->fetchAll(PDO::FETCH_ASSOC);

				$respuesta['subgroups'] = $filas;

				$query = $this->_conn->prepare("select * FROM `tt_status`");
				$query->execute();
				$filas = $query->fetchAll(PDO::FETCH_ASSOC);

				$respuesta['status'] = $filas;

				$query = $this->_conn->prepare("select -id as id, name, account_number FROM `tt_fixed_concept`where id_company = '".$id_company."' and id_fiscal_year = '".$id_fiscal_year."'
												union all
												select id, name, account_number FROM `tt_variable_concept`where id_company = '".$id_company."' and id_fiscal_year = '".$id_fiscal_year."'");

				$query->execute();
				$filas = $query->fetchAll(PDO::FETCH_ASSOC);

				$respuesta['all_concepts'] = $filas;

				$query = $this->_conn->prepare("select ped_code, campaign_name, id FROM `tt_campaign` where id_status=2 and id_company='".$id_company."' order by id DESC");
				$query->execute();
				$filas = $query->fetchAll(PDO::FETCH_ASSOC);

				$respuesta['pedidos'] = $filas;

				$query = $this->_conn->prepare("select id,customer_name, CIF, DescriptionProvider, default_variable_concept, default_fixed_concept FROM `tt_customer` where bprovider = 1 and id_company='".$id_company."' order by customer_name ASC");
				$query->execute();
				$filas = $query->fetchAll(PDO::FETCH_ASSOC);

				$respuesta['providers'] = $filas;

				$this->mostrarRespuesta($respuesta, 200);
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);


		}

		public function cloneData() {
			if ($_SERVER['REQUEST_METHOD'] != "GET") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if (isset($this->datosPeticion['id_company'],$this->datosPeticion['id_fiscal_year'])) {
				$id_company = $this->datosPeticion['id_company'];
				$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
				$id = $this->datosPeticion['id'];
				$source_id = $this->datosPeticion['source_id'];
				$source_type = 'id_'.$this->datosPeticion['source_type'];
				$type = 'id_'.$this->datosPeticion['type'];
				if ($this->datosPeticion['type']=='budget') {
					$table = 'tt_budget';
				} else if ($this->datosPeticion['type']=='project') {
					$table = 'tt_campaign';
				}
				if ($this->datosPeticion['source_type']=='budget') {
					$fromTable = 'tt_budget';
				} else if ($this->datosPeticion['source_type']=='project') {
					$fromTable = 'tt_campaign';
				}

				$query = $this->_conn->prepare("select * from tt_subconcepts_project where ".$type."=".$source_id);
				$query->execute();
				$num = $query->rowCount();
				if ($num>0) {
					$query = $this->_conn->prepare("DELETE from tt_subconcepts_project where ".$type."=".$source_id);
					$query->execute();
				}

				$query = $this->_conn->prepare("CREATE TEMPORARY TABLE tmp SELECT * from `tt_subconcepts_project` WHERE ".$source_type."=".$id);
				$query->execute();
    		$query = $this->_conn->prepare("ALTER TABLE tmp drop ID");
				$query->execute();

				if($type != $source_type) {
					$query = $this->_conn->prepare("UPDATE tmp set ".$type."=".$source_id.", ".$source_type."=0");
	    		$query->execute();
				} else {
					$query = $this->_conn->prepare("UPDATE tmp set ".$type."=".$source_id);
	    		$query->execute();
				}

    		$query = $this->_conn->prepare("INSERT INTO `tt_subconcepts_project` SELECT 0,tmp.* FROM tmp");
				$query->execute();
    		$query = $this->_conn->prepare("DROP TABLE tmp");
				$query->execute();

				$query = $this->_conn->prepare("select start_date_budget, end_date_budget, budget_validity from `".$fromTable."` where id=".$id);
				$query->execute();
				$data = $query->fetch(PDO::FETCH_ASSOC);


				$query = $this->_conn->prepare("UPDATE `".$table."` set start_date_budget='".$data['start_date_budget']."',end_date_budget='".$data['end_date_budget']."',budget_validity='".$data['budget_validity']."' where id=".$source_id);
				$query->execute();

				// clonar FEE de EMPRESA
				$query = $this->_conn->prepare("select * from tt_fee_company where ".$type."=".$source_id);
				$query->execute();
				$num = $query->rowCount();
				if ($num>0) {
					$query = $this->_conn->prepare("DELETE from tt_fee_company where ".$type."=".$source_id);
					$query->execute();
				}
				$query = $this->_conn->prepare("CREATE TEMPORARY TABLE tmp_fee SELECT * from `tt_fee_company` WHERE ".$source_type."=".$id);
				$query->execute();
    		$query = $this->_conn->prepare("ALTER TABLE tmp_fee drop ID");
				$query->execute();

				if($type != $source_type) {
					$query = $this->_conn->prepare("UPDATE tmp_fee set ".$type."=".$source_id.", ".$source_type."=0");
					$query->execute();
				} else {
					$query = $this->_conn->prepare("UPDATE tmp_fee set ".$type."=".$source_id);
					$query->execute();
				}

				$query = $this->_conn->prepare("INSERT INTO `tt_fee_company` SELECT 0,tmp_fee.* FROM tmp_fee");
				$query->execute();
    		$query = $this->_conn->prepare("DROP TABLE tmp_fee");
				$query->execute();



				$query = $this->_conn->prepare("DROP TABLE tmp");
				$query->execute();

		/*		$query = $this->_conn->prepare("select * from `tt_subconcepts_project` where ".$type."=".$id);
				$query->execute();
				$lines = $query->fetchAll(PDO::FETCH_ASSOC);*/

				$respuesta['status'] = 'ok';
				//$respuesta['lines'] = $lines;
				$this->mostrarRespuesta($respuesta, 200);
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);


		}

		public function getAccountFixed() {
			if ($_SERVER['REQUEST_METHOD'] != "GET") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if (isset($this->datosPeticion['id_company'], $this->datosPeticion['token'],$this->datosPeticion['id_fiscal_year'])) {
				$id_company = $this->datosPeticion['id_company'];
				$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
				$token = $this->datosPeticion['token'];

				if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
					return false;
				}

				$query = $this->_conn->prepare("select * from tt_fixed_concept where id_company='".$id_company."' and id_fiscal_year='".$id_fiscal_year."' and id_parent=0 order by name ASC");
				$query->execute();
				$num = $query->rowCount();
				if ($num>0) {
					$items = $query->fetchAll(PDO::FETCH_ASSOC);
					$query = $this->_conn->prepare("select amortizacion, financiero, extraordinario from tt_company_year where id='".$id_fiscal_year."'");
					$query->execute();
					$accounts = $query->fetch(PDO::FETCH_ASSOC);

					$respuesta['status'] = 'ok';
					$respuesta['items'] = $items;
					$respuesta['accounts'] = $accounts;
				} else {
					$respuesta['status'] = 'error';
				}

				$this->mostrarRespuesta($respuesta, 200);
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);

		}


		public function getBudgets() {
			if ($_SERVER['REQUEST_METHOD'] != "GET") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidUserToken($this->datosPeticion['token'])) {
				return false;
			}

			$role = $this->getRoleFromToken($this->datosPeticion['token']);
			$id_user = $this->getIdUserFromToken($this->datosPeticion['token']);
      $id_team = $this->getTeamFromToken($this->datosPeticion['token']);
			if (isset($this->datosPeticion['id_company'],$this->datosPeticion['id_fiscal_year'])) {
				$id_company = $this->datosPeticion['id_company'];
				$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
				$strQuery = "select budget.id, budget.name, user.nickname as user, user.id as id_user, customer.customer_name as customer, customer.id as id_customer, team.team_name as team,
				team.id as id_team, grupo.name as grupo, grupo.id as id_group, subgroup.name as subgroup, subgroup.id as id_subgroup
				FROM `tt_budget` budget
									inner join `tt_user` user
									on budget.id_user=user.id
									inner join `tt_customer` customer
									on budget.id_customer=customer.id
									inner join `tt_team` team
									on budget.id_team=team.id
									inner join `tt_group` grupo
									on budget.id_group=grupo.id
									inner join `tt_subgroup` subgroup
									on budget.id_subgroup=subgroup.id
									where budget.id_company='".$id_company."' and budget.id_fiscal_year='".$id_fiscal_year."'";

				if ($id_team == '0') {
					$strQuery = "select budget.id, budget.name, user.nickname as user, user.id as id_user, customer.customer_name as customer, customer.id as id_customer, grupo.name as grupo, grupo.id as id_group, subgroup.name as subgroup, subgroup.id as id_subgroup
					FROM `tt_budget` budget
										inner join `tt_user` user
										on budget.id_user=user.id
										inner join `tt_customer` customer
										on budget.id_customer=customer.id
										inner join `tt_group` grupo
										on budget.id_group=grupo.id
										inner join `tt_subgroup` subgroup
										on budget.id_subgroup=subgroup.id
										where budget.id_company='".$id_company."' and budget.id_fiscal_year='".$id_fiscal_year."'";
				}


				// Depende del rol, selecciona unos proyectos u otros.

				if ($role != 3) {
					$strQuery = $strQuery." and budget.id_team='".$id_team."'";
				}
				if ($role == 7 || $role == 8) {
					$strQuery = $strQuery." and budget.id_user='".$id_user."'";
				}

				$strQuery = $strQuery." order by budget.id ASC";

				$query = $this->_conn->prepare($strQuery);
				$query->execute();
				$filas = $query->fetchAll(PDO::FETCH_ASSOC);
				$filasActualizadas = $query->rowCount();

				if ($filasActualizadas>0) {
					$respuesta['status'] = 'ok';
					$respuesta['items'] = $filas;
					$this->mostrarRespuesta($respuesta, 200);
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'No hay ningun presupuesto en la empresa y año seleccionados';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}

		private function addBudget() {
			if ($_SERVER['REQUEST_METHOD'] != "POST") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if (isset($this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year'], $this->datosPeticion['name'], $this->datosPeticion['id_user'],
								$this->datosPeticion['id_customer'], $this->datosPeticion['id_team'], $this->datosPeticion['id_group'], $this->datosPeticion['id_subgroup'])) {
				$id_company = $this->datosPeticion['id_company'];
				$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
				$name = html_entity_decode($this->datosPeticion['name']);
				$id_user = $this->datosPeticion['id_user'];
				$id_customer = $this->datosPeticion['id_customer'];
				$id_team = $this->datosPeticion['id_team'];
				$id_group = $this->datosPeticion['id_group'];
				$id_subgroup = $this->datosPeticion['id_subgroup'];

				$query = $this->_conn->prepare("select * from tt_budget where id_fiscal_year='".$id_fiscal_year."' and id_company='".$id_company."' and (name='".$name."')");
				$filas = $query->execute();
				$filasActualizadas = $query->rowCount();

				if($filasActualizadas === 0) {

					$query = $this->_conn->prepare("insert into tt_budget(id_company, id_fiscal_year, name,id_user,id_customer,id_team,id_group,id_subgroup) values(
						'".$id_company."','".$id_fiscal_year."','".$name."', '".$id_user."','".$id_customer."','".$id_team."','".$id_group."','".$id_subgroup."')");
					$query->execute();
					$filasActualizadas = $query->rowCount();
					if ($filasActualizadas == 1) {
						$respuesta['status'] = 'ok';
						$queryBudgets = "select budget.id, budget.name, user.nickname as user, user.id as id_user, customer.customer_name as customer, customer.id as id_customer, team.team_name as team,
										team.id as id_team, grupo.name as grupo, grupo.id as id_group, subgroup.name as subgroup, subgroup.id as id_subgroup
										FROM `tt_budget` budget
										inner join `tt_user` user
										on budget.id_user=user.id
										inner join `tt_customer` customer
										on budget.id_customer=customer.id
										inner join `tt_team` team
										on budget.id_team=team.id
										inner join `tt_group` grupo
										on budget.id_group=grupo.id
										inner join `tt_subgroup` subgroup
										on budget.id_subgroup=subgroup.id
										where budget.id_company='".$id_company."' and budget.id_fiscal_year='".$id_fiscal_year."' and budget.id_team='".$id_team."'";
						if($id_team == '0') { //es superadmin, devolvemos todos los presupuestos
							$queryBudgets = "select budget.id, budget.name, user.nickname as user, user.id as id_user, customer.customer_name as customer, customer.id as id_customer,  grupo.name as grupo, grupo.id as id_group, subgroup.name as subgroup, subgroup.id as id_subgroup
											FROM `tt_budget` budget
											inner join `tt_user` user
											on budget.id_user=user.id
											inner join `tt_customer` customer
											on budget.id_customer=customer.id
											inner join `tt_group` grupo
											on budget.id_group=grupo.id
											inner join `tt_subgroup` subgroup
											on budget.id_subgroup=subgroup.id
											where budget.id_company='".$id_company."' and budget.id_fiscal_year='".$id_fiscal_year."'";
						}

						$query = $this->_conn->prepare($queryBudgets);
						$query->execute();
						$filas = $query->fetchAll(PDO::FETCH_ASSOC);
						$respuesta['items'] = $filas;
						$this->mostrarRespuesta($respuesta, 200);
					} else {
						$respuesta['status'] = 'error';
						$respuesta['msg'] = 'No se ha podido añadir el presupuesto';
						$this->mostrarRespuesta($respuesta, 200);
					}
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'Ya existe un presupuesto con ese nombre';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}

		private function updateBudget() {
			if ($_SERVER['REQUEST_METHOD'] != "PUT") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
				return false;
			}
			if (isset($this->datosPeticion['id'], $this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year'], $this->datosPeticion['name'], $this->datosPeticion['id_user'],
			$this->datosPeticion['id_customer'], $this->datosPeticion['id_team'], $this->datosPeticion['id_group'], $this->datosPeticion['id_subgroup'])) {
				$id = $this->datosPeticion['id'];
				$id_company = $this->datosPeticion['id_company'];
				$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
				$name = html_entity_decode($this->datosPeticion['name']);
				$id_user = $this->datosPeticion['id_user'];
				$id_customer = $this->datosPeticion['id_customer'];
				$id_team = $this->datosPeticion['id_team'];
				$id_group = $this->datosPeticion['id_group'];
				$id_subgroup = $this->datosPeticion['id_subgroup'];

				$query = $this->_conn->prepare("select * from tt_budget where id_fiscal_year='".$id_fiscal_year."' and id_company='".$id_company."' and id!='".$id."' and (name='".$name."')");
				$filas = $query->execute();
				$filasActualizadas = $query->rowCount();

				if($filasActualizadas === 0) {
						//consulta preparada ya hace mysqli_real_escape()
					$query = $this->_conn->prepare("UPDATE tt_budget set
						name='".$name."',
						id_user='".$id_user."',
						id_customer='".$id_customer."',
						id_team='".$id_team."',
						id_group='".$id_group."',
						id_subgroup='".$id_subgroup."'
						where id='".$id."'");
					$query->execute();
					$filasActualizadas = $query->rowCount();
					$insertId = $this->_conn->lastInsertId();
					if ($filasActualizadas == 1) {
						$respuesta['status'] = 'ok';
						$respuesta['idx'] = $this->datosPeticion['idx'];
						$query = $this->_conn->prepare("select budget.id, budget.name, user.nickname as user, user.id as id_user, customer.customer_name as customer, customer.id as id_customer, team.team_name as team,
						team.id as id_team, grupo.name as grupo, grupo.id as id_group, subgroup.name as subgroup, subgroup.id as id_subgroup
						FROM `tt_budget` budget
											inner join `tt_user` user
											on budget.id_user=user.id
											inner join `tt_customer` customer
											on budget.id_customer=customer.id
											inner join `tt_team` team
											on budget.id_team=team.id
											inner join `tt_group` grupo
											on budget.id_group=grupo.id
											inner join `tt_subgroup` subgroup
											on budget.id_subgroup=subgroup.id
											where budget.id='".$id."' order by budget.id ASC");
						$query->execute();
						$filas = $query->fetchAll(PDO::FETCH_ASSOC);
						$respuesta['item'] = $filas;
						$this->mostrarRespuesta($respuesta, 200);
					} else {
						$respuesta['status'] = 'error';
						$respuesta['msg'] = 'No se han podido actualizar los valores';
						$this->mostrarRespuesta($respuesta, 200);
					}
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'Ya existe un presupuesto con esos valores';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}

		private function deleteBudget() {
			$query = $this->_conn->prepare("select * FROM `tt_subconcepts_project`where id_budget='".$this->datosPeticion['id']."'");
			$query->execute();
			$filas = $query->fetchAll(PDO::FETCH_ASSOC);
			$filasActualizadas = $query->rowCount();
			if ($filasActualizadas > 0 ){
				$jsonResponse['status'] = 'ko';
				$jsonResponse['msg'] = 'El presupuesto contiene valores. No se puede eliminar.';
				$this->mostrarRespuesta($jsonResponse, 200);
				return false;
			}
			$response = $this->operationApi("DELETE FROM tt_budget WHERE id=".$this->datosPeticion['id'], 'DELETE', false);
			if ( $response != false) {
				$jsonResponse['status'] = 'ok';
				$this->mostrarRespuesta($jsonResponse, 200);
			}
			else {
				$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
			}
		}

		public function getMixEmployeesTrackerReal($employeesReal, $idCampaign,$year) {
			$costTracker = $this->getCostCampaign($idCampaign,$year);
			$parsed = [];
			$total = 0;
			for($i=0; $i < count($costTracker); $i++) {
				switch ((int)explode('-',$costTracker[$i]->date)[1]) {
					case 1:
						$value['id_month'] = 'january';
						break;
					case 2:
						$value['id_month'] = 'february';
						break;
					case 3:
						$value['id_month'] = 'march';
						break;
					case 4:
						$value['id_month'] = 'april';
						break;
					case 5:
						$value['id_month'] = 'may';
						break;
					case 6:
						$value['id_month'] = 'june';
						break;
					case 7:
						$value['id_month'] = 'july';
						break;
					case 8:
						$value['id_month'] = 'august';
						break;
					case 9:
						$value['id_month'] = 'september';
						break;
					case 10:
						$value['id_month'] = 'october';
						break;
					case 11:
						$value['id_month'] = 'november';
						break;
					case 12:
						$value['id_month'] = 'december';
						break;
				}

				$value['amount'] = $costTracker[$i]->cost;
				array_push($parsed, $value);
			}

			if(count($employeesReal)>0 && count($parsed) > 0){
				$total = 0;
				for($i=0; $i<count($employeesReal);$i++) {
					$total = $total + $employeesReal[$i]['amount'];
				}

				for($i=0; $i<count($parsed);$i++) {
					$value = ($parsed[$i]['amount']);
					$monthTracker = ($parsed[$i]['id_month']);

					$found = false;
					for($j=0; $j<count($employeesReal);$j++) {
						$monthA = ($employeesReal[$j]['id_month']);


						if($monthA == $monthTracker) {
							$found = true;

							$value = print_r($parsed[$j]->amount);

						}
					}
					if ($found == false) {
						$total = $total + $value;
					}

				}
			} else if(count($employeesReal)>0 && count($parsed) == 0){
					for($i=0; $i<count($employeesReal);$i++) {
						$total = $total + $employeesReal[$i]->amount;
					}
			} else if(count($employeesReal) == 0 && count($parsed) > 0){
					for($i=0; $i<count($parsed);$i++) {
						$total = $total + $parsed[$i]->amount;
					}
			}

			return $total;
		}

		public function getExcelData() {
			if ($_SERVER['REQUEST_METHOD'] != "GET") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidUserToken($this->datosPeticion['token'])) {
				return false;
			}

			$role = $this->getRoleFromToken($this->datosPeticion['token']);
			$id_user = $this->getIdUserFromToken($this->datosPeticion['token']);

			if (isset($this->datosPeticion['id_company'],$this->datosPeticion['id_fiscal_year'])) {
				$id_company = $this->datosPeticion['id_company'];
				$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
				$strQuery = "select
				 campaign.id, fiscal_year.year
				 from tt_campaign campaign
				 inner join `tt_company_year` year
				 on campaign.id_fiscal_year=year.id
				 inner join `tt_fiscal_year` fiscal_year
				 on year.id_fiscal_year=fiscal_year.id
				 where campaign.id_company=".$id_company." and campaign.id_fiscal_year=".$id_fiscal_year;
				$jsonResponse = [];
				foreach($this->_conn->query($strQuery) as $row) {

					$idCampaign = $row['id'];
					/* REAL */
					//$query = "select sum(amount) as total from tt_budget_income where id_campaign='".$idCampaign."' and type=1";
					$query = "SELECT sum(amount*unit_budget*price) as total from tt_subconcepts_billing, tt_billing where tt_billing.id=tt_subconcepts_billing.id_bill and tt_billing.id_project ='".$idCampaign."'";
					$query = $this->_conn->prepare($query);
					$query->execute();
					$incomesReal = $query->fetch(PDO::FETCH_ASSOC);
					$tmp[$idCampaign]['real']['incomes'] = (float)$incomesReal['total'];

					$query = "SELECT sum(amount) as total FROM `tt_budget_expenses` where id_campaign=".$idCampaign." and type=1";
					$query = $this->_conn->prepare($query);
					$query->execute();
					$expensesReal = $query->fetch(PDO::FETCH_ASSOC);
					$tmp[$idCampaign]['real']['expenses'] = (float)$expensesReal['total'];

					$query = "select id_month, amount from tt_real_employee_cost where id_campaign='".$idCampaign."'";
					$query = $this->_conn->prepare($query);
					$query->execute();
					$employeesReal = $query->fetchAll(PDO::FETCH_ASSOC);
					$totalEmployeesReal = $this->getMixEmployeesTrackerReal($employeesReal, $idCampaign,$row['year']);
					$tmp[$idCampaign]['real']['employees'] = (float)$totalEmployeesReal;

					$tmp[$idCampaign]['real']['profit'] = (float)$incomesReal['total'] - ((float)$expensesReal['total'] + (float)$totalEmployeesReal);

					/* ESTIMATED */
					$query = "select sum(amount*unit_budget*price) as total from tt_fee_company where id_project='".$idCampaign."'";
					$query = $this->_conn->prepare($query);
					$query->execute();
					$fee = $query->fetch(PDO::FETCH_ASSOC);

					$query = "select sum(amount*unit_budget*price) as total from tt_subconcepts_project where id_project='".$idCampaign."'";
					$query = $this->_conn->prepare($query);
					$query->execute();
					$incomesEstimated = $query->fetch(PDO::FETCH_ASSOC);
					$tmp[$idCampaign]['estimated']['incomes'] = (float)$incomesEstimated['total'] + (float)$fee['total'];

					$query = "select sum(amount*unit_budget*unit_real) as total from tt_subconcepts_project where id_project='".$idCampaign."'";
					$query = $this->_conn->prepare($query);
					$query->execute();
					$expensesEstimated = $query->fetch(PDO::FETCH_ASSOC);
					$tmp[$idCampaign]['estimated']['expenses'] = (float)$expensesEstimated['total'];




					$query = "select sum(amount) as total from tt_estimated_employee_cost where id_campaign='".$idCampaign."'";
					$query = $this->_conn->prepare($query);
					$query->execute();
					$totalEmployeesEstimated = $query->fetch(PDO::FETCH_ASSOC);
					$tmp[$idCampaign]['estimated']['employees'] = (float)$totalEmployeesEstimated['total'];

					$tmp[$idCampaign]['estimated']['profit'] = (float)$incomesEstimated['total'] + (float)$fee['total'] - ((float)$expensesEstimated['total'] + (float)$totalEmployeesEstimated['total']);

					$jsonResponse = $jsonResponse + $tmp;
				}
				$this->mostrarRespuesta($jsonResponse, 200);
			}

		}

		public function getExportationsBilling() {
			if ($_SERVER['REQUEST_METHOD'] != "GET") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidUserToken($this->datosPeticion['token'])) {
				return false;
			}

			$role = $this->getRoleFromToken($this->datosPeticion['token']);
			$id_user = $this->getIdUserFromToken($this->datosPeticion['token']);

			if (isset($this->datosPeticion['id_company'],$this->datosPeticion['id_fiscal_year'])) {
				$id_company = $this->datosPeticion['id_company'];
				$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];

				$strQuery = "select id, export_date, billings_date, file, billings_number 
								from tt_billing_export
									where id_company='".$id_company."' order by id DESC";

				$query = $this->_conn->prepare($strQuery);
				$query->execute();
				$filas = $query->fetchAll(PDO::FETCH_ASSOC);
				$filasActualizadas = $query->rowCount();

				if ($filasActualizadas>0) {
					$respuesta['status'] = 'ok';
					$respuesta['items'] = $filas;
					$this->mostrarRespuesta($respuesta, 200);
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'No hay ninguna exportación en la empresa';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}

		private function createExportationBilling() {
			if ($_SERVER['REQUEST_METHOD'] != "POST") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
				return false;
			}
			if (isset($this->datosPeticion['id_company'],$this->datosPeticion['fechafin'])) {
				$id_company = $this->datosPeticion['id_company'];		
				$fechafin = $this->datosPeticion['fechafin'];			
					

				$query = $this->_conn->prepare("select id from tt_billing where id_export = 0 and issue_date <='".$fechafin."' and id_company='".$id_company."'");
				$query->execute();
				$facturasExportar = $query->rowCount();

				if($facturasExportar !== 0) {

					$query = $this->_conn->prepare("insert into tt_billing_export(export_date, billings_date, file, billings_number, id_company) values(
						'".date("Y-m-d")."','".$fechafin."','','".$facturasExportar."','".$id_company."')");
					$query->execute();

					$query = $this->_conn->prepare("select MAX(id) as number from tt_billing_export");

					$filas = $query->execute();
					$filas = $query->fetch(PDO::FETCH_ASSOC);

					$number = $filas['number'];

					$query = $this->_conn->prepare("update tt_billing_export set file = 'FAC".$number.".xlsx' where id =".$number);
					$query->execute();

					$query = $this->_conn->prepare("UPDATE tt_billing set
						id_export ='".$number."'
						where id_company='".$id_company."' and issue_date <='".$fechafin."' and id_export = 0");
					$query->execute();

					$respuesta['status'] = 'ok';
					$respuesta['number'] = $number;
					

					$this->mostrarRespuesta($respuesta, 200);
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'No hay facturas para exportar';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}

		private function deleteExportationBilling() {

			// borramos todas las relaciones
			$query = $this->_conn->prepare("UPDATE `tt_billing` SET id_export = 0 where id_export=".$this->datosPeticion['id']);
			$query->execute();

			$query = $this->_conn->prepare("DELETE FROM tt_billing_export WHERE id=".$this->datosPeticion['id']);
			$query->execute();

			if ( $query != false) {
				$jsonResponse['status'] = 'ok';
				$this->mostrarRespuesta($jsonResponse, 200);
			}
			else {
				$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
			}
		}

		public function getExportationsExpenses() {
			if ($_SERVER['REQUEST_METHOD'] != "GET") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidUserToken($this->datosPeticion['token'])) {
				return false;
			}

			$role = $this->getRoleFromToken($this->datosPeticion['token']);
			$id_user = $this->getIdUserFromToken($this->datosPeticion['token']);

			if (isset($this->datosPeticion['id_company'],$this->datosPeticion['id_fiscal_year'])) {
				$id_company = $this->datosPeticion['id_company'];
				$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];

				$strQuery = "select id, export_date, expenses_date, file, expenses_number 
								from tt_expense_export
									where id_company='".$id_company."' order by id DESC";

				$query = $this->_conn->prepare($strQuery);
				$query->execute();
				$filas = $query->fetchAll(PDO::FETCH_ASSOC);
				$filasActualizadas = $query->rowCount();

				if ($filasActualizadas>0) {
					$respuesta['status'] = 'ok';
					$respuesta['items'] = $filas;
					$this->mostrarRespuesta($respuesta, 200);
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'No hay ninguna exportación en la empresa';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}

		private function createExportationExpenses() {
			if ($_SERVER['REQUEST_METHOD'] != "POST") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
				return false;
			}
			if (isset($this->datosPeticion['id_company'],$this->datosPeticion['fechafin'])) {
				$id_company = $this->datosPeticion['id_company'];		
				$fechafin = $this->datosPeticion['fechafin'];			
					

				$query = $this->_conn->prepare("select id from tt_budget_expenses where id_export = 0 and date <='".$fechafin."' and id_company='".$id_company."'");
				$query->execute();
				$facturasExportar = $query->rowCount();

				if($facturasExportar !== 0) {

					$query = $this->_conn->prepare("insert into tt_expense_export(export_date, expenses_date, file, expenses_number, id_company) values(
						'".date("Y-m-d")."','".$fechafin."','','".$facturasExportar."','".$id_company."')");
					$query->execute();

					$query = $this->_conn->prepare("select MAX(id) as number from tt_expense_export");

					$filas = $query->execute();
					$filas = $query->fetch(PDO::FETCH_ASSOC);

					$number = $filas['number'];

					$query = $this->_conn->prepare("update tt_expense_export set file = 'COM".$number.".xlsx' where id =".$number);
					$query->execute();

					$query = $this->_conn->prepare("UPDATE tt_budget_expenses set
						id_export ='".$number."'
						where id_company='".$id_company."' and date <='".$fechafin."' and id_export = 0");
					$query->execute();

					$respuesta['status'] = 'ok';
					$respuesta['number'] = $number;
					$respuesta['comprasexportadas'] = $facturasExportar;
					

					$this->mostrarRespuesta($respuesta, 200);
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'No hay compras para exportar';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}

		private function deleteExportationExpenses() {

			// borramos todas las relaciones
			$query = $this->_conn->prepare("UPDATE `tt_budget_expenses` SET id_export = 0 where id_export=".$this->datosPeticion['id']);
			$query->execute();

			$query = $this->_conn->prepare("DELETE FROM tt_expense_export WHERE id=".$this->datosPeticion['id']);
			$query->execute();

			if ( $query != false) {
				$jsonResponse['status'] = 'ok';
				$this->mostrarRespuesta($jsonResponse, 200);
			}
			else {
				$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
			}
		}

		public function getBills() {
			if ($_SERVER['REQUEST_METHOD'] != "GET") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidUserToken($this->datosPeticion['token'])) {
				return false;
			}

			$role = $this->getRoleFromToken($this->datosPeticion['token']);
			$id_user = $this->getIdUserFromToken($this->datosPeticion['token']);

			if (isset($this->datosPeticion['id_company'],$this->datosPeticion['id_fiscal_year'])) {
				$id_company = $this->datosPeticion['id_company'];
				$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
				$start_date = $this->datosPeticion['start_date'];
				$end_date = $this->datosPeticion['end_date'];
				

				$strQuery = "select billing.id, billing.id_export, billing.number, billing.numbertext, billing.description, customer.customer_name as customer, customer.id as id_customer, 
				billing.issue_date, billing.due_date, billing.PO, billing.tax_base, billing.percent_tax, billing.taxes, billing.total, billing.id_project, customer.account_numberc as customer_account,
				customer.postal_code, customer.city, customer.cif as customer_cif,
				billing.id_rect, 
				campaign.ped_code,
				case when charges.amount is null then 0 else charges.amount end as charge_amount,
				charges.date as charge_date ";
				if ($id_company === '385' || $id_company === '412'){
					$strQuery .= ",(select valuechar from tt_valuesbvsfields where idtable = campaign.id and freefieldsvscompanyid = 1) as numcampana ";
				}
				$strQuery .= " FROM `tt_billing` billing
									inner join `tt_customer` customer
									on billing.id_customer=customer.id
									inner join `tt_campaign` campaign
									on billing.id_project=campaign.id
									left join `tt_billing_charges` charges
									on billing.id = charges.id_billing
									where billing.id_company='".$id_company."' 
									and billing.id_fiscal_year='".$id_fiscal_year."' 
									and billing.issue_date >= '".$start_date."'
									and billing.issue_date <= '".$end_date."'									 
									order by billing.issue_date desc, billing.number DESC";								 


				$query = $this->_conn->prepare($strQuery);
				$query->execute();
				$filas = $query->fetchAll(PDO::FETCH_ASSOC);
				$filasActualizadas = $query->rowCount();

				if ($filasActualizadas>0) {
					$respuesta['status'] = 'ok';
					$respuesta['items'] = $filas;
					$this->mostrarRespuesta($respuesta, 200);
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'No hay ninguna factura en la empresa y año seleccionados';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}		

		public function getBills4Exportation() {
			if ($_SERVER['REQUEST_METHOD'] != "GET") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidUserToken($this->datosPeticion['token'])) {
				return false;
			}

			$role = $this->getRoleFromToken($this->datosPeticion['token']);
			$id_user = $this->getIdUserFromToken($this->datosPeticion['token']);

			if (isset($this->datosPeticion['id_company'],$this->datosPeticion['id_fiscal_year'])) {
				$id_company = $this->datosPeticion['id_company'];
				$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
				$start_date = $this->datosPeticion['start_date'];
				$end_date = $this->datosPeticion['end_date'];

				$strQuery = "select billing.id, billing.id_export, billing.number, billing.numbertext, billing.description, customer.customer_name as customer, customer.id as id_customer, team.team_name as team,
				team.id as id_team, billing.issue_date, billing.due_date, billing.PO, billing.tax_base, billing.percent_tax, billing.taxes, billing.total, billing.id_project, customer.account_numberc as customer_account,
				customer.postal_code, customer.city, customer.cif as customer_cif,
				billing.id_rect, 
				case when billing.id_rect <> 0 then (select number from tt_billing where id=billing.id_rect) else 0 end as number_rect,
				case when billing.id_rect <> 0 then (select tax_base from tt_billing where id=billing.id_rect) else 0 end as tax_base_rect,
				case when billing.id_rect <> 0 then (select taxes from tt_billing where id=billing.id_rect) else 0 end as taxes_rect,
				case when billing.id_rect <> 0 then (select issue_date from tt_billing where id=billing.id_rect) else 0 end as issue_date_rect,
				(select ped_code from `tt_campaign` campaign where campaign.id= billing.id_project) as ped_code,
				case when (select sum(amount) from `tt_billing_charges` charges where charges.id_billing = billing.id) is null then 0 else (select sum(amount) from `tt_billing_charges` charges where charges.id_billing = billing.id) end	as charge_amount,
				(select max(date) from `tt_billing_charges` charges where charges.id_billing = billing.id) as charge_date,
				(select min(account_contability) from tt_variable_concept, tt_subconcepts_billing where tt_variable_concept.id = tt_subconcepts_billing.id_variable_concept and tt_subconcepts_billing.id_bill = billing.id) as account_subconcept									
				     				FROM `tt_billing` billing
									inner join `tt_customer` customer
									on billing.id_customer=customer.id
									left join `tt_team` team
									on billing.id_team=team.id
									where billing.id_company='".$id_company."' 
									and billing.id_fiscal_year='".$id_fiscal_year."' 
									and billing.issue_date >= '".$start_date."'
									and billing.issue_date <= '".$end_date."'																		 
									order by billing.issue_date desc, billing.number DESC";

				$query = $this->_conn->prepare($strQuery);
				$query->execute();
				$filas = $query->fetchAll(PDO::FETCH_ASSOC);
				$filasActualizadas = $query->rowCount();

				if ($filasActualizadas>0) {
					$respuesta['status'] = 'ok';
					$respuesta['items'] = $filas;
					$this->mostrarRespuesta($respuesta, 200);
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'No hay ninguna factura en la empresa y año seleccionados';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}

		public function getArticlesLocation() {
			if ($_SERVER['REQUEST_METHOD'] != "GET") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidUserToken($this->datosPeticion['token'])) {
				return false;
			}

			$role = $this->getRoleFromToken($this->datosPeticion['token']);
			$id_user = $this->getIdUserFromToken($this->datosPeticion['token']);
			$filtro_cliente = "";

			if ($role == 11){
				$query = $this->_conn->prepare("SELECT id_company_products from tt_user where id =".$id_user);
				$query->execute();
				$filas = $query->fetch(PDO::FETCH_ASSOC);
				$filtro_cliente = " and tt_customer.id= ".$filas['id_company_products'];
			}

			if (isset($this->datosPeticion['id_company'])) {
				$id_company = $this->datosPeticion['id_company'];

				$strQuery = "SELECT tt_articlesvslocation.id, tt_warehouse.name as almacen,
				tt_articlesvslocation.location_rows as pasillo,
				tt_articlesvslocation.location_sections as seccion,
				tt_articlesvslocation.location_heights as altura,
				tt_subconcepts_standards.code as codigo,
				tt_subconcepts_standards.description as articulo,
				tt_articles_families.familyname as familia,
				tt_customer.customer_name as cliente,
				tt_articlesvslocation.dateexpiry as caducidad,
				tt_articles_envelopes.name as embalaje,
				tt_articlesvslocation.units as unidades,
				tt_subconcepts_standards.unitsperitem as unidadesxitem,
				(tt_articlesvslocation.units*tt_subconcepts_standards.unitsperitem) as total,
				tt_articles_state.state,
				tt_warehouse.id as idalmacen, tt_articles_state.id as idestado, tt_customer.id as idcliente,
				tt_subconcepts_standards.brand as marca, tt_subconcepts_standards.image,
                tt_subconcepts_standards.id as article_id
				from tt_articlesvslocation, tt_subconcepts_standards, 
				tt_warehouse, tt_articles_families,tt_articles_envelopes, tt_customer, tt_articles_state
				where article_id = tt_subconcepts_standards.id
				and tt_articlesvslocation.location_warehouse = tt_warehouse.id
				and tt_articles_families.id = tt_subconcepts_standards.id_family
				and tt_articles_envelopes.id = tt_subconcepts_standards.envelope_type
				and tt_customer.id = tt_articlesvslocation.owner_id
				and tt_articles_state.id = tt_articlesvslocation.state_id
				and tt_articlesvslocation.borrado = 0
				and tt_subconcepts_standards.id_company =".$id_company.$filtro_cliente." order by tt_articlesvslocation.dateexpiry, tt_articlesvslocation.date_mod desc,  tt_articlesvslocation.id desc";

				$query = $this->_conn->prepare($strQuery);
				$query->execute();
				$filas = $query->fetchAll(PDO::FETCH_ASSOC);
				$filasActualizadas = $query->rowCount();

				if ($filasActualizadas>0) {
					$respuesta['status'] = 'ok';
					$respuesta['items'] = $filas;
					$respuesta['query'] = $strQuery;
					$this->mostrarRespuesta($respuesta, 200);
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'No hay ninguna fila que mostrar';
					$respuesta['query'] = $strQuery;
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}

		public function getArticlesMovement() {
			if ($_SERVER['REQUEST_METHOD'] != "GET") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidUserToken($this->datosPeticion['token'])) {
				return false;
			}

			$role = $this->getRoleFromToken($this->datosPeticion['token']);
			$id_user = $this->getIdUserFromToken($this->datosPeticion['token']);

			if (isset($this->datosPeticion['id_company'])) {
				$id_company = $this->datosPeticion['id_company'];
				$start_date = $this->datosPeticion['start_date'];
				$end_date = $this->datosPeticion['end_date'];

				$strQuery = "SELECT date(mov.date) as date, mov.date as hora, typ.name, war.name as location_warehouse, 
				mov.location_row, mov.location_section, mov.location_height,
				art.code as article_id, art.description, mov.units, 
				(select ped_code from tt_campaign where mov.campaign_id = tt_campaign.id) as ped_code,
				usr.nickname, mov.observations
				from tt_articles_movement mov, tt_articlesvslocation loc, tt_articles_movements_type typ, 
				tt_user usr, tt_subconcepts_standards art, tt_warehouse war
				where mov.articlesvslocation_id = loc.id
				and mov.operation_id = typ.id
				and mov.user_id = usr.id
				and loc.article_id = art.id
				and mov.location_warehouse = war.id 
				and date(mov.date) >= '".$start_date."'
				and date(mov.date) <= '".$end_date."'	
				and art.id_company =".$id_company."
				order by hora desc";
				

				$query = $this->_conn->prepare($strQuery);
				$query->execute();
				$filas = $query->fetchAll(PDO::FETCH_ASSOC);
				$filasActualizadas = $query->rowCount();

				if ($filasActualizadas>0) {
					$respuesta['status'] = 'ok';
					$respuesta['items'] = $filas;
					$this->mostrarRespuesta($respuesta, 200);
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'No hay ninguna fila que mostrar';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}

		public function getArticlesStock() {
			if ($_SERVER['REQUEST_METHOD'] != "GET") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidUserToken($this->datosPeticion['token'])) {
				return false;
			}

			$role = $this->getRoleFromToken($this->datosPeticion['token']);
			$id_user = $this->getIdUserFromToken($this->datosPeticion['token']);

			if (isset($this->datosPeticion['id_company'])) {
				$id_company = $this->datosPeticion['id_company'];

				$strQuery = "select tt_status.status, units, 
				article_id,
				tt_subconcepts_standards.code,
				tt_subconcepts_standards.description,
				ped_code,
				tt_campaign.campaign_name,
				(select sum(alm.units) from tt_articlesvslocation alm where alm.borrado = 0 and alm.article_id = tt_articlesvslocation.article_id) as disponibles,
				tt_campaign.creation_date, tt_customer.customer_name, tt_subconcepts_standards.image, tt_campaign.btramite, tt_campaign.id as id_campaign,
				tt_articlesvslocation.id, tt_articlesvslocation.subconcept_project_id, tt_campaign.observ_cli, tt_campaign.observ_int,
				(select valuedate from tt_valuesbvsfields where idtable = tt_campaign.id and freefieldsvscompanyid = 2) as delivery_date
				from tt_articlesvslocation, tt_subconcepts_standards, tt_subconcepts_project,tt_campaign, tt_status, tt_customer
				where borrado = -1
				and tt_articlesvslocation.article_id = tt_subconcepts_standards.id
				and tt_articlesvslocation.subconcept_project_id = tt_subconcepts_project.id
				and tt_subconcepts_project.id_project = tt_campaign.id
				and tt_status.id = tt_campaign.id_status
				and tt_campaign.id_customer = tt_customer.id
				and tt_status.id = 2
				and units > 0
				and tt_subconcepts_standards.bstockable = 1
				and tt_campaign.id_company = ".$id_company." 
				order by tt_subconcepts_project.id_variable_concept, tt_subconcepts_project.id";
				

				$query = $this->_conn->prepare($strQuery);
				$query->execute();
				$filas = $query->fetchAll(PDO::FETCH_ASSOC);
				$filasActualizadas = $query->rowCount();

				if ($filasActualizadas>0) {
					$respuesta['status'] = 'ok';
					$respuesta['items'] = $filas;
					$this->mostrarRespuesta($respuesta, 200);
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'No hay ninguna fila que mostrar';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}

		public function getArticlesNewStock() {
			if ($_SERVER['REQUEST_METHOD'] != "GET") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidUserToken($this->datosPeticion['token'])) {
				return false;
			}

			$role = $this->getRoleFromToken($this->datosPeticion['token']);
			$id_user = $this->getIdUserFromToken($this->datosPeticion['token']);

			if (isset($this->datosPeticion['id_company'])) {
				$id_company = $this->datosPeticion['id_company'];

				$strQuery = "select id_campaign, delivery_date, ped_code, campaign_name, creation_date, customer_name, sum(units) as units,
				sum(case when disponibles is null then 0 when disponibles > units then units else disponibles end) as disponibles,
				observ_cli, observ_int, status, group_concat(observaciones,'\n') as observaciones, btramite
				from (
				select tt_campaign.id as id_campaign, (select valuedate from tt_valuesbvsfields where idtable = tt_campaign.id and freefieldsvscompanyid = 2) as delivery_date,
				tt_status.status, tt_campaign.ped_code, tt_campaign.campaign_name,
				tt_campaign.creation_date, tt_customer.customer_name, units,
				(select sum(alm.units) from tt_articlesvslocation alm where alm.borrado = 0 and alm.article_id = tt_articlesvslocation.article_id) as disponibles,
				case when (select sum(alm.units) from tt_articlesvslocation alm where alm.borrado = 0 and alm.article_id = tt_articlesvslocation.article_id) is null then concat('No hay existencias de ',tt_subconcepts_project.name) 
                when (select sum(alm.units) from tt_articlesvslocation alm where alm.borrado = 0 and alm.article_id = tt_articlesvslocation.article_id) < units then concat('No hay suficientes ', tt_subconcepts_project.name)  else null end as observaciones,
				tt_campaign.observ_cli, tt_campaign.observ_int, tt_campaign.btramite
				from tt_campaign, tt_status, tt_customer, tt_articlesvslocation, tt_subconcepts_standards, tt_subconcepts_project
				where tt_campaign.id_status = tt_status.id
				and tt_customer.id = tt_campaign.id_customer
				and tt_articlesvslocation.article_id = tt_subconcepts_standards.id
				and tt_articlesvslocation.subconcept_project_id = tt_subconcepts_project.id
				and tt_subconcepts_project.id_project = tt_campaign.id
				and tt_status.id = 2
				and tt_campaign.id_company = ".$id_company."
				and borrado = -1
				and units > 0
				and tt_subconcepts_standards.bstockable = 1) as a
				group by delivery_date, ped_code, campaign_name, creation_date, customer_name, observ_cli, observ_int, status, id_campaign, btramite
				order by delivery_date";
				

				$query = $this->_conn->prepare($strQuery);
				$query->execute();
				$filas = $query->fetchAll(PDO::FETCH_ASSOC);
				$filasActualizadas = $query->rowCount();

				if ($filasActualizadas>0) {
					$respuesta['status'] = 'ok';
					$respuesta['items'] = $filas;
					$this->mostrarRespuesta($respuesta, 200);
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'No hay ninguna fila que mostrar';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}

		private function tramitarpedido() {
			if ($_SERVER['REQUEST_METHOD'] != "POST") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidUserToken($this->datosPeticion['token'])) {
				return false;
			}
			if (isset($this->datosPeticion['tramite'], $this->datosPeticion['id_campaign'], $this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year'])){
				$tramite = $this->datosPeticion['tramite'];
				$id_campaign = $this->datosPeticion['id_campaign'];
				$id_company = $this->datosPeticion['id_company'];
				$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];

				$query = $this->_conn->prepare("UPDATE `tt_campaign` set btramite=".$tramite." where id=".$id_campaign);
				$query->execute();		

				$respuesta['status'] = 'ok';

				$this->mostrarRespuesta($respuesta, 200);

			} else {
				$respuesta['status'] = 'error';
				$respuesta['msg'] = 'No hay proyecto relacionado';
				$this->mostrarRespuesta($respuesta, 200);
			}

			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}

		public function getExpenses() {
			if ($_SERVER['REQUEST_METHOD'] != "GET") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidUserToken($this->datosPeticion['token'])) {
				return false;
			}

			$role = $this->getRoleFromToken($this->datosPeticion['token']);
			$id_user = $this->getIdUserFromToken($this->datosPeticion['token']);

			if (isset($this->datosPeticion['id_company'],$this->datosPeticion['id_fiscal_year'])) {
				$id_company = $this->datosPeticion['id_company'];
				$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];

				$strQuery = "select expenses.id, expenses.date, expenses.due_date, expenses.id_campaign, customer.CIF,
				case when expenses.id_campaign = -2 then '' else campaign.ped_code end as ped_code, 
				case when expenses.id_campaign = -2 then 'Gastos Generales' else campaign.campaign_name end as campaign_name,
				expenses.amount, tax.value, expenses.description,
				expenses.id_provider, customer.customer_name, expenses.id_tax,
				case when expenses.id_fixed_concept <> -1 then expenses.id_fixed_concept else expenses.id_variable_concept end as id_variable_concept, 
				case when expenses.id_fixed_concept <> -1 then fixed.name else concept.name end as concept_name,
				percent_retention, number, id_export,
				expenses.iva, expenses.total, expenses.retention
				from `tt_budget_expenses` expenses
				left join `tt_campaign` campaign
				on campaign.id = expenses.id_campaign
				inner join `tt_taxes_values` tax
				on tax.id = expenses.id_tax
				inner join `tt_customer` customer
				on customer.id = expenses.id_provider
				left join `tt_variable_concept` concept
				on concept.id = expenses.id_variable_concept
				left join `tt_fixed_concept` fixed
				on fixed.id = expenses.id_fixed_concept				
				where expenses.id_company='".$id_company."' and expenses.id_fiscal_year='".$id_fiscal_year."'  order by expenses.id DESC";

				$query = $this->_conn->prepare($strQuery);
				$query->execute();
				$filas = $query->fetchAll(PDO::FETCH_ASSOC);
				$filasActualizadas = $query->rowCount();

				if ($filasActualizadas>0) {
					$respuesta['status'] = 'ok';
					$respuesta['items'] = $filas;
					$this->mostrarRespuesta($respuesta, 200);
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'No hay ninguna compra en la empresa y año seleccionados';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}

		public function getExpenses4Exportation() {
			if ($_SERVER['REQUEST_METHOD'] != "GET") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidUserToken($this->datosPeticion['token'])) {
				return false;
			}

			$role = $this->getRoleFromToken($this->datosPeticion['token']);
			$id_user = $this->getIdUserFromToken($this->datosPeticion['token']);

			if (isset($this->datosPeticion['id_company'],$this->datosPeticion['id_fiscal_year'])) {
				$id_company = $this->datosPeticion['id_company'];
				$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];

				$strQuery = "select expenses.number, expenses.date, expenses.due_date,
				customer.account_numbers as customer_account, customer.CIF as customer_cif,
				case when expenses.id_variable_concept = -1 then fixed.account_number else concept.account_number end as concept_account,
				customer.Postal_Code, campaign.ped_code, expenses.id_export,
				expenses.amount, expenses.iva, expenses.total, customer.city, customer.customer_name
							from `tt_budget_expenses` expenses
							left join `tt_campaign` campaign
							on campaign.id = expenses.id_campaign
							inner join `tt_customer` customer
							on customer.id = expenses.id_provider
							left join `tt_variable_concept` concept
							on concept.id = expenses.id_variable_concept
							left join `tt_fixed_concept` fixed
							on fixed.id = expenses.id_fixed_concept		
				where expenses.id_company='".$id_company."' and expenses.id_fiscal_year='".$id_fiscal_year."' order by expenses.date, expenses.id";

				$query = $this->_conn->prepare($strQuery);
				$query->execute();
				$filas = $query->fetchAll(PDO::FETCH_ASSOC);
				$filasActualizadas = $query->rowCount();

				if ($filasActualizadas>0) {
					$respuesta['status'] = 'ok';
					$respuesta['items'] = $filas;
					$this->mostrarRespuesta($respuesta, 200);
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'No hay ninguna compra en la empresa y año seleccionados';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}


		private function addTax() {
			if ($_SERVER['REQUEST_METHOD'] != "POST") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
				return false;
			}
			if (isset($this->datosPeticion['value'])) {
				$value = $this->datosPeticion['value'];

				$query = $this->_conn->prepare("select value from tt_taxes_values where value='".$value."'");
				$query->execute();
				$filasActualizadas = $query->rowCount();

				if($filasActualizadas === 0) {
					$query = $this->_conn->prepare("insert into tt_taxes_values(value) values('".$value."')");
					$query->execute();
					$insertId = $this->_conn->lastInsertId();
					$respuesta['status'] = 'ok';
					$respuesta['id'] = $insertId;
					$respuesta['value'] = $value;

					$this->mostrarRespuesta($respuesta, 200);

				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'Ya existe el tipo de IVA';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}

		private function abonoBill() {
			if ($_SERVER['REQUEST_METHOD'] != "POST") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
				return false;
			}
			if (isset($this->datosPeticion['id_bill_origen'], $this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year'])){
				$id_bill_origen = $this->datosPeticion['id_bill_origen'];
				$id_company = $this->datosPeticion['id_company'];
				$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];

				$query = $this->_conn->prepare("select MAX(number) as number_bill from tt_billing where id_company='".$id_company."' and year(issue_date) = YEAR(CURDATE()) and tax_base < 0 and numbertext like 'AB%' and id_fiscal_year='".$id_fiscal_year."'");

				$filas = $query->execute();
				$filasActualizadas = $query->rowCount();

				if ($filasActualizadas === 1) {
						$filas = $query->fetch(PDO::FETCH_ASSOC);
						$number = $filas['number_bill'];
						$number = $number + 1;
				} else {
						$number = 1;
				}

/* 				$query = $this->_conn->prepare("insert into tt_billing(number, issue_date, description, id_team, id_customer, po, tax_base, taxes, total, id_company, id_fiscal_year, id_project, percent_tax) 
							select '".$number."','".date("Y-m-d")."',description,id_team,id_customer, po, -tax_base,-taxes,-total,id_company,id_fiscal_year,id_project,percent_tax from tt_billing where id=".$id_bill_origen);
				$query->execute(); */

				$query = $this->_conn->prepare("insert into tt_billing (number, numbertext, issue_date, description, id_team, id_customer, po, tax_base, taxes, total, id_company, id_fiscal_year, id_project, percent_tax, id_rect) 
								select ".$number.",'AB".date("Y")."/".$number."','".date("Y-m-d")."',description,id_team,id_customer, po, -tax_base,-taxes,-total,id_company,id_fiscal_year,id_project,percent_tax, id from tt_billing where id=".$id_bill_origen);
				$query->execute();

				$insertId = $this->_conn->lastInsertId();

				$query = $this->_conn->prepare("insert into tt_subconcepts_billing (id_variable_concept, amount, unit_budget, price, unit_real, id_bill, name) 
				select id_variable_concept, -amount, unit_budget, price, unit_real, ".$insertId.", name from tt_subconcepts_billing where id_bill=".$id_bill_origen);

				$query->execute();

				//doy ambas facturas por cobradas 
				$query = $this->_conn->prepare("INSERT into `tt_billing_charges` (amount,date,id_billing) select total, CURRENT_DATE, id from tt_billing where id ='".$id_bill_origen."'");
				$query->execute();
				$query = $this->_conn->prepare("INSERT into `tt_billing_charges` (amount,date,id_billing) select total, CURRENT_DATE, id from tt_billing where id ='".$insertId."'");
				$query->execute();
				


				$respuesta['status'] = 'ok';
				$respuesta['id_bill'] = $insertId;

				$this->mostrarRespuesta($respuesta, 200);


			} else {
				$respuesta['status'] = 'error';
				$respuesta['msg'] = 'No hay proyecto relacionado';
				$this->mostrarRespuesta($respuesta, 200);
			}

			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}

		private function createBill() {
			if ($_SERVER['REQUEST_METHOD'] != "POST") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
				return false;
			}
			if (isset($this->datosPeticion['id_project'], $this->datosPeticion['date_bill'], $this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year'])) {
				$id_project = $this->datosPeticion['id_project'];
				$id_company = $this->datosPeticion['id_company'];
				$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
				$date_bill = $this->datosPeticion['date_bill'];


				$query = $this->_conn->prepare("update tt_campaign set id_status = 2 where id='".$id_project."' and id_fiscal_year='".$id_fiscal_year."' and id_status = 1 and id_company='".$id_company."'");
				$query->execute();				

				$query = $this->_conn->prepare("select campaign_name, id_team, id_customer from tt_campaign where id='".$id_project."' and id_fiscal_year='".$id_fiscal_year."' and id_company='".$id_company."'");
				$query->execute();
				$filasActualizadas = $query->rowCount();

				if($filasActualizadas === 1) {
					$dataProject = $query->fetch(PDO::FETCH_ASSOC);

					$query = $this->_conn->prepare("select MAX(number) as number_bill from tt_billing where id_company='".$id_company."' and year(issue_date) = YEAR(CURDATE()) and numbertext like 'FR%' and id_fiscal_year='".$id_fiscal_year."'");

					$filas = $query->execute();
					$filasActualizadas = $query->rowCount();

					if ($filasActualizadas === 1) {
							$filas = $query->fetch(PDO::FETCH_ASSOC);
							$number = $filas['number_bill'];
							$number = $number + 1;
					} else {
							$number = 1;
					}
					//TAREA: CAMBIAR FECHA DE VENCIMIENTO AQUÍ, NO SÉ POR QUÉ NO FUNCIONÓ
					//date_add($$date_bill, date_interval_create_from_date_string('60 days'))
					$query = $this->_conn->prepare("insert into tt_billing(number, issue_date, due_date, description, id_team, id_customer, id_company, id_fiscal_year, id_project, numbertext) values(
						'".$number."','".$date_bill."','".date('Y-m-d', strtotime($Date. ' + 60 days'))."','".$dataProject['campaign_name']."','".$dataProject['id_team']."', '".$dataProject['id_customer']."','".$id_company."','".$id_fiscal_year."','".$id_project."','FR".date("Y")."/".$number."')");
					$query->execute();
					$filasActualizadas = $query->rowCount();
					if ($filasActualizadas == 1) {
						$insertId = $this->_conn->lastInsertId();
						// una vez creada la factura, creamos las lineas de subconceptos copiando las que tiene el proyecto de origen
						$strToSearch ="select * from tt_subconcepts_project where id_project='".$id_project."'";
						foreach($this->_conn->query($strToSearch) as $row) {
							$query = $this->_conn->prepare("insert into tt_subconcepts_billing(id_bill, id_variable_concept, amount, unit_budget, price, name) values(
								'".$insertId."','".$row['id_variable_concept']."','".$row['amount']."','".$row['unit_budget']."','".$row['price']."','".$row['name']."'
								)");
							$query->execute();
						}

						$tax_base = 0;
						$query = $this->_conn->prepare("select amount, unit_budget, price from tt_fee_company where id_project=".$id_project);
						$query->execute();
						$fee = $query->fetch(PDO::FETCH_ASSOC);
						$filasActualizadas = $query->rowCount();
						if($filasActualizadas>0) {
							$tax_base = $fee['amount']*$fee['unit_budget']*$fee['price'];
						}
						$query = $this->_conn->prepare("insert into tt_fee_company(id_bill, amount, unit_budget, price) values(
							'".$insertId."','".$fee['amount']."','".$fee['unit_budget']."','".$fee['price']."')");
						$query->execute();

						$strToSearch ="select amount, unit_budget, price from tt_subconcepts_billing where id_bill='".$insertId."'";
						foreach($this->_conn->query($strToSearch) as $row) {
							$tax_base = $tax_base + $row['amount']*$row['unit_budget']*$row['price'];
						}

						$taxes = round($tax_base*0.21,2);
						$total = $tax_base+$taxes;
						

 						$query = $this->_conn->prepare("UPDATE tt_billing set
							tax_base='".$tax_base."',
							percent_tax = 21,
							taxes ='".$taxes."',
							total='".$total."' where id='".$insertId."'");
/* 						$query = $this->_conn->prepare("UPDATE tt_billing set
							tax_base='".$tax_base."',
							percent_tax = 21,
                            taxes= round(".$tax_base."*0.21,2)
							total= round(".$tax_base."*1.21,2) where id='".$insertId."'"); */
						$query->execute();

						$respuesta['status'] = 'ok';
						$respuesta['id_bill'] = $insertId;

						$this->mostrarRespuesta($respuesta, 200);
					} else {
						$respuesta['status'] = 'error';
						$respuesta['msg'] = 'No se ha podido añadir la factura';
						$this->mostrarRespuesta($respuesta, 200);
					}
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'No hay proyecto relacionado';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);

		}

		private function deleteStorage() {

			if ($_SERVER['REQUEST_METHOD'] != "PUT") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidUserToken($this->datosPeticion['token'])) {
				return false;
			}

			if (isset($this->datosPeticion['id'],$this->datosPeticion['user_id'])) {


				$query = $this->_conn->prepare("UPDATE `tt_articlesvslocation` set borrado = 1 where id='".$this->datosPeticion['id']."'");
				$query->execute();

				$query = $this->_conn->prepare("INSERT INTO `tt_articles_movement`(`articlesvslocation_id`, `operation_id`, `date`, `user_id`, `location_row`, `location_height`, `location_section`, `observations`, `units`, `location_warehouse`) select 
					".$this->datosPeticion['id'].",2,CURRENT_TIMESTAMP,".$this->datosPeticion['user_id'].",location_rows, location_heights,location_sections,'Baja',-units,location_warehouse from tt_articlesvslocation where id=".$this->datosPeticion['id']);
				$query->execute();

				$jsonResponse['status'] = 'ok';
				$this->mostrarRespuesta($jsonResponse, 200);

			}

		}

		private function updateStorage() {
			if ($_SERVER['REQUEST_METHOD'] != "PUT") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidUserToken($this->datosPeticion['token'])) {
				return false;
			}

			if (isset($this->datosPeticion['id_company'],$this->datosPeticion['units'], $this->datosPeticion['warehouse'], $this->datosPeticion['row'], $this->datosPeticion['section'],
			$this->datosPeticion['height'], $this->datosPeticion['article_id'], $this->datosPeticion['user_id'])) {

				$id = $this->datosPeticion['id'];				
				$units= $this->datosPeticion['units'];
				$warehouse= $this->datosPeticion['warehouse'];
				$row=$this->datosPeticion['row'];
				$section=$this->datosPeticion['section'];
				$height=$this->datosPeticion['height'];
				$article_id=$this->datosPeticion['article_id'];
				$dateexpiry=$this->datosPeticion['dateexpiry'];
				$owner_id=$this->datosPeticion['owner_id'];
				$state_id=$this->datosPeticion['state_id'];
				$user_id=$this->datosPeticion['user_id'];
				$image=$this->datosPeticion['image'];
				$observations= html_entity_decode($this->datosPeticion['observations']);

				$query = $this->_conn->prepare("select id from tt_articlesvslocation where location_warehouse='".$warehouse."' and location_rows='".$row."' 
								and location_sections='".$section."' and location_heights='".$height."' and article_id='".$article_id."' 
								and borrado = 0 and dateexpiry='".$dateexpiry."' and owner_id='".$owner_id."' and state_id='".$state_id."' and id <> ".$id);
				$filas = $query->execute();
				$filas = $query->fetch(PDO::FETCH_ASSOC);
				$filasActualizadas = $query->rowCount();

				if($filasActualizadas === 0) {

					//movimiento para dar de baja fila antes del update
					$query = $this->_conn->prepare("INSERT INTO `tt_articles_movement`(`articlesvslocation_id`, `operation_id`, `date`, `user_id`, `location_row`, `location_height`, `location_section`, `observations`, `units`, `location_warehouse`) select 
					".$id.",2,CURRENT_TIMESTAMP,".$user_id.",location_rows, location_heights,location_sections,'Edición',-units,location_warehouse from tt_articlesvslocation where id=".$id);
					$query->execute();

					$query = $this->_conn->prepare("UPDATE `tt_articlesvslocation` SET date_mod=CURRENT_TIMESTAMP, 
													`units`='".$units."', 
													`location_warehouse`='".$warehouse."',
													`location_rows`='".$row."',
													`location_sections`='".$section."',
													`location_heights`='".$height."',
													`article_id`='".$article_id."',
													`dateexpiry`='".$dateexpiry."',
													`owner_id`='".$owner_id."',
													`state_id`='".$state_id."',
													`image`='".$image."'
													where id =".$id);
					$query->execute();
					$filasActualizadas = $query->rowCount();

					$insertId = $this->_conn->lastInsertId();

					$query = $this->_conn->prepare("INSERT INTO `tt_articles_movement`(`articlesvslocation_id`, `operation_id`, `date`, `user_id`, `location_row`, `location_height`, `location_section`, `observations`, `units`, `location_warehouse`) VALUES ( 
						'".$id."',1,CURRENT_TIMESTAMP,'".$user_id."','".$row."', '".$height."','".$section."','".$observations."','".$units."','".$warehouse."')");
					$query->execute();

				}else{
					$insertId = $filas['id'];

					//borro de la que procedía
					$query = $this->_conn->prepare("UPDATE `tt_articlesvslocation` SET date_mod=CURRENT_TIMESTAMP, borrado=1 where id =".$id);
					$query->execute();

					$query = $this->_conn->prepare("INSERT INTO `tt_articles_movement`(`articlesvslocation_id`, `operation_id`, `date`, `user_id`, `location_row`, `location_height`, `location_section`, `observations`, `units`, `location_warehouse`) select 
					".$id.",2,CURRENT_TIMESTAMP,".$user_id.",location_rows, location_heights,location_sections,'Edición',-units,location_warehouse from tt_articlesvslocation where id=".$id);
					$query->execute();

					//actualizo la fila encontrada igual
					$query = $this->_conn->prepare("UPDATE `tt_articlesvslocation` SET date_mod=CURRENT_TIMESTAMP, units = units +".$units."
						where id =".$insertId);
					$query->execute();

					$query = $this->_conn->prepare("INSERT INTO `tt_articles_movement`(`articlesvslocation_id`, `operation_id`, `date`, `user_id`, `location_row`, `location_height`, `location_section`, `observations`, `units`, `location_warehouse`) VALUES ( 
						'".$insertId."',1,CURRENT_TIMESTAMP,'".$user_id."','".$row."', '".$height."','".$section."','".$observations."','".$units."','".$warehouse."')");
					$query->execute();
						
				}

				$respuesta['status'] = 'ok';
				$respuesta['msg'] = 'Entrada de almacén actualizada';
				$this->mostrarRespuesta($respuesta, 200);

			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);

		}

		private function exitStorage() {
			if ($_SERVER['REQUEST_METHOD'] != "PUT") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidUserToken($this->datosPeticion['token'])) {
				return false;
			}

			if (isset($this->datosPeticion['id_company'],$this->datosPeticion['units'])) {

				$id = $this->datosPeticion['id'];				
				$units= $this->datosPeticion['units'];
				if (isset($this->datosPeticion['subconcept_project_id'])){
					$subconcept_project_id= $this->datosPeticion['subconcept_project_id'];
				}else {
					$subconcept_project_id = -1;
				}
				
				$unitsoriginal= $this->datosPeticion['unitsoriginal'];
				$observations= html_entity_decode($this->datosPeticion['observations']);
				$user_id=$this->datosPeticion['user_id'];

				$query = $this->_conn->prepare("select units from tt_articlesvslocation where id =".$id);
				$query->execute();
				$dataset = $query->fetch(PDO::FETCH_ASSOC);
				$unidadestest = $dataset['units'];

				if ($unidadestest === $unitsoriginal){

					if($units === $unitsoriginal) {


						$query = $this->_conn->prepare("UPDATE `tt_articlesvslocation` SET date_mod=CURRENT_TIMESTAMP, 
														borrado = 1 
														where id =".$id);
						$query->execute();
						
						//movimiento para dar de baja fila en movimientos
						$query = $this->_conn->prepare("INSERT INTO `tt_articles_movement`(`articlesvslocation_id`, `operation_id`, `date`, `user_id`, `location_row`, `location_height`, `location_section`, `observations`, `units`, `location_warehouse`, `subconcept_project_id`) select 
						".$id.",2,CURRENT_TIMESTAMP,".$user_id.",location_rows, location_heights,location_sections,'".$observations."',-units,location_warehouse,'".$subconcept_project_id."' from tt_articlesvslocation where id=".$id);
						$query->execute();

					}else{
						$insertId = $filas['id'];

						$unitsoriginal = $unitsoriginal-$units;

						//borro de la que procedía
						$query = $this->_conn->prepare("UPDATE `tt_articlesvslocation` SET date_mod=CURRENT_TIMESTAMP, units=".$unitsoriginal." where id =".$id);
						$query->execute();

						$units = -$units;

						$respuesta['subc'] = $subconcept_project_id;

						$respuesta['query'] = "INSERT INTO `tt_articles_movement`(`articlesvslocation_id`, `operation_id`, `date`, `user_id`, `location_row`, `location_height`, `location_section`, `observations`, `units`, `location_warehouse`,`subconcept_project_id`) select 
						".$id.",2,CURRENT_TIMESTAMP,".$user_id.",location_rows, location_heights,location_sections,'".$observations."',".$units.",location_warehouse,'".$subconcept_project_id."' from tt_articlesvslocation where id=".$id;


						//movimiento para dar de baja fila en movimientos
						$query = $this->_conn->prepare("INSERT INTO `tt_articles_movement`(`articlesvslocation_id`, `operation_id`, `date`, `user_id`, `location_row`, `location_height`, `location_section`, `observations`, `units`, `location_warehouse`,`subconcept_project_id`) select 
						".$id.",2,CURRENT_TIMESTAMP,".$user_id.",location_rows, location_heights,location_sections,'".$observations."',".$units.",location_warehouse,'".$subconcept_project_id."' from tt_articlesvslocation where id=".$id);
						$query->execute();
					
					}

					if (isset($this->datosPeticion['anularsalidaid'])){
						//damos de baja la petición
						$idsalida = $this->datosPeticion['anularsalidaid'];	
						$query = $this->_conn->prepare("DELETE FROM `tt_articlesvslocation` where id=".$idsalida);
						$query->execute();					
					}

					$respuesta['subc'] = $subconcept_project_id;
					$respuesta['status'] = 'ok';

					$this->mostrarRespuesta($respuesta, 200);
			} else {

				$respuesta['status'] = 'error';
				$respuesta['msg'] = 'Ya se realizó la operación previamente';
				$this->mostrarRespuesta($respuesta, 200);
			}
			}

		}


		private function updateBill() {
			if ($_SERVER['REQUEST_METHOD'] != "PUT") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
				return false;
			}
			if (isset($this->datosPeticion['id'],$this->datosPeticion['po'], $this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year'], $this->datosPeticion['description'], $this->datosPeticion['id_team'],
			$this->datosPeticion['id_customer'], $this->datosPeticion['due_date'])) {
				$id = $this->datosPeticion['id'];
				$id_company = $this->datosPeticion['id_company'];
				$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
				$description = html_entity_decode($this->datosPeticion['description']);
				$id_customer = $this->datosPeticion['id_customer'];
				$id_team = $this->datosPeticion['id_team'];
				$due_date = $this->datosPeticion['due_date'];
				$po = $this->datosPeticion['po'];

					//consulta preparada ya hace mysqli_real_escape()
				$query = $this->_conn->prepare("UPDATE tt_billing set
					description='".$description."',
					po='".$po."',
					id_customer='".$id_customer."',
					id_team='".$id_team."',
					due_date='".$due_date."' where id='".$id."'");
				$query->execute();
				$filasActualizadas = $query->rowCount();
				$insertId = $this->_conn->lastInsertId();
				if ($filasActualizadas == 1) {
					$respuesta['status'] = 'ok';
					$respuesta['idx'] = $this->datosPeticion['idx'];
					$query = $this->_conn->prepare("select billing.id, billing.description, customer.customer_name as customer, customer.id as id_customer, team.team_name as team,
					team.id as id_team, billing.po, billing.due_date
					FROM `tt_billing` billing
										inner join `tt_customer` customer
										on billing.id_customer=customer.id
										inner join `tt_team` team
										on billing.id_team=team.id
										where billing.id='".$id."'");
					$query->execute();
					$filas = $query->fetchAll(PDO::FETCH_ASSOC);
					$respuesta['item'] = $filas;
					$this->mostrarRespuesta($respuesta, 200);
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'No se han podido actualizar los valores';
					$this->mostrarRespuesta($respuesta, 200);
				}

			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}

		private function updateExpense() {
			if ($_SERVER['REQUEST_METHOD'] != "PUT") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidUserToken($this->datosPeticion['token'])) {
				return false;
			}
			if (isset($this->datosPeticion['id'], $this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year'], $this->datosPeticion['description'])) {
				$id = $this->datosPeticion['id'];
				$id_company = $this->datosPeticion['id_company'];
				$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
				$description = html_entity_decode($this->datosPeticion['description']);
				$id_provider = $this->datosPeticion['id_provider'];
				$id_tax = $this->datosPeticion['id_tax'];
				$date = $this->datosPeticion['date'];
				$amount = $this->datosPeticion['amount'];
				$id_variable_concept = $this->datosPeticion['id_variable_concept'];
				$id_fixed_concept = $this->datosPeticion['id_fixed_concept'];
				$id_campaign = $this->datosPeticion['id_campaign'];
				$percent_retention = $this->datosPeticion['percent_retention'];
				$number = html_entity_decode($this->datosPeticion['number']);
				$iva= $this->datosPeticion['iva'];
				$total= $this->datosPeticion['total'];
				$retention= $this->datosPeticion['retention'];
				$due_date= $this->datosPeticion['due_date'];

	
				//actualizo el concepto del proveedor para posteriores compras
				$query = $this->_conn->prepare("UPDATE tt_customer set 
					default_fixed_concept =".$id_fixed_concept.",
					default_variable_concept =".$id_variable_concept."
					where id = '".$id_provider."'
					and default_fixed_concept is null
					and default_variable_concept is null");
					$query->execute();

					//consulta preparada ya hace mysqli_real_escape()
				$query = $this->_conn->prepare("UPDATE tt_budget_expenses set
					description='".$description."',
					amount='".$amount."',
					id_tax='".$id_tax."',
					id_provider='".$id_provider."',
					id_variable_concept='".$id_variable_concept."',
					id_fixed_concept='".$id_fixed_concept."',
					id_campaign='".$id_campaign."',
					percent_retention='".$percent_retention."',
					number='".$number."',
					iva='".$iva."',
					total='".$total."',
					retention='".$retention."',
					date='".$date."',
					due_date='".$due_date."' 
					where id='".$id."'");
				$query->execute();
				$filasActualizadas = $query->rowCount();

				if ($filasActualizadas == 1) {
					$respuesta['status'] = 'ok';
					$respuesta['idx'] = $this->datosPeticion['idx'];
					$query = $this->_conn->prepare("select expenses.id, expenses.date, expenses.due_date, expenses.id_campaign, customer.CIF,
					case when expenses.id_campaign = -2 then '' else campaign.ped_code end as ped_code, 
					case when expenses.id_campaign = -2 then 'Gastos Generales' else campaign.campaign_name end as campaign_name,
					expenses.amount, tax.value, expenses.description,
					expenses.id_provider, customer.customer_name, expenses.id_tax,
					case when expenses.id_fixed_concept <> -1 then expenses.id_fixed_concept else expenses.id_variable_concept end as id_variable_concept, 
					case when expenses.id_fixed_concept <> -1 then fixed.name else concept.name end as concept_name,
					percent_retention, number, id_export,
					expenses.iva, expenses.total, expenses.retention
					from `tt_budget_expenses` expenses
					left join `tt_campaign` campaign
					on campaign.id = expenses.id_campaign
					inner join `tt_taxes_values` tax
					on tax.id = expenses.id_tax
					inner join `tt_customer` customer
					on customer.id = expenses.id_provider
					left join `tt_variable_concept` concept
					on concept.id = expenses.id_variable_concept
					left join `tt_fixed_concept` fixed
					on fixed.id = expenses.id_fixed_concept	
					where expenses.id_company='".$id_company."' and expenses.id_fiscal_year='".$id_fiscal_year."'  order by expenses.id DESC");
					$query->execute();
					$filas = $query->fetchAll(PDO::FETCH_ASSOC);
					$respuesta['items'] = $filas;
					$this->mostrarRespuesta($respuesta, 200);
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'No se han podido actualizar los valores';
					$this->mostrarRespuesta($respuesta, 200);
				}

			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}

		private function insertExpense() {
			if ($_SERVER['REQUEST_METHOD'] != "PUT") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidUserToken($this->datosPeticion['token'])) {
				return false;
			}
			if (isset( $this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year'], $this->datosPeticion['description'])) {
				$id_company = $this->datosPeticion['id_company'];
				$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
				$description = html_entity_decode($this->datosPeticion['description']);
				$id_provider = $this->datosPeticion['id_provider'];
				$id_tax = $this->datosPeticion['id_tax'];
				$date = $this->datosPeticion['date'];
				$amount = $this->datosPeticion['amount'];
				$id_variable_concept = $this->datosPeticion['id_variable_concept'];
				$id_fixed_concept = $this->datosPeticion['id_fixed_concept'];
				$id_campaign = $this->datosPeticion['id_campaign'];
				$percent_retention = $this->datosPeticion['percent_retention'];
				$number = html_entity_decode($this->datosPeticion['number']);
				$iva= $this->datosPeticion['iva'];
				$total= $this->datosPeticion['total'];
				$retention= $this->datosPeticion['retention'];
				$due_date = $this->datosPeticion['due_date'];


				//actualizo el concepto del proveedor para posteriores compras
				$query = $this->_conn->prepare("UPDATE tt_customer set 
				default_fixed_concept =".$id_fixed_concept.",
				default_variable_concept =".$id_variable_concept."
				where id = '".$id_provider."'
				and default_fixed_concept is null
				and default_variable_concept is null");
				$query->execute();


					//consulta preparada ya hace mysqli_real_escape()
				$query = $this->_conn->prepare("insert into tt_budget_expenses (description,amount,
						id_tax,id_provider,id_variable_concept,id_fixed_concept,id_campaign,date,type,id_company,id_fiscal_year,
						percent_retention, number,iva, total, retention, due_date) values (
					'".$description."','".$amount."','".$id_tax."','".$id_provider."',
					'".$id_variable_concept."','".$id_fixed_concept."','".$id_campaign."','".$date."',1,'".$id_company."','".$id_fiscal_year."', 
					'".$percent_retention."','".$number."','".$iva."','".$total."','".$retention."','".$due_date."')");
				$query->execute();
				$filasActualizadas = $query->rowCount();

				if ($filasActualizadas == 1) {
					$respuesta['status'] = 'ok';
					$respuesta['idx'] = $this->datosPeticion['idx'];
					$query = $this->_conn->prepare("select expenses.id, expenses.date, expenses.due_date, expenses.id_campaign, customer.CIF,
					case when expenses.id_campaign = -2 then '' else campaign.ped_code end as ped_code, 
					case when expenses.id_campaign = -2 then 'Gastos Generales' else campaign.campaign_name end as campaign_name,
					expenses.amount, tax.value, expenses.description,
					expenses.id_provider, customer.customer_name, expenses.id_tax,
					case when expenses.id_fixed_concept <> -1 then expenses.id_fixed_concept else expenses.id_variable_concept end as id_variable_concept, 
					case when expenses.id_fixed_concept <> -1 then fixed.name else concept.name end as concept_name,
					percent_retention, number, id_export,
					expenses.iva, expenses.total, expenses.retention
					from `tt_budget_expenses` expenses
					left join `tt_campaign` campaign
					on campaign.id = expenses.id_campaign
					inner join `tt_taxes_values` tax
					on tax.id = expenses.id_tax
					inner join `tt_customer` customer
					on customer.id = expenses.id_provider
					left join `tt_variable_concept` concept
					on concept.id = expenses.id_variable_concept
					left join `tt_fixed_concept` fixed
					on fixed.id = expenses.id_fixed_concept	
					where expenses.id_company='".$id_company."' and expenses.id_fiscal_year='".$id_fiscal_year."'  order by expenses.id DESC");
					$query->execute();
					$filas = $query->fetchAll(PDO::FETCH_ASSOC);
					$respuesta['items'] = $filas;
					$this->mostrarRespuesta($respuesta, 200);
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'No se ha podido insertar la compra';
					$this->mostrarRespuesta($respuesta, 200);
				}

			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}

		public function getCampaigns() {
			if ($_SERVER['REQUEST_METHOD'] != "GET") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidUserToken($this->datosPeticion['token'])) {
				return false;
			}

			$role = $this->getRoleFromToken($this->datosPeticion['token']);
			$id_user = $this->getIdUserFromToken($this->datosPeticion['token']);

			if (isset($this->datosPeticion['id_company'],$this->datosPeticion['id_fiscal_year'])) {
				$id_company = $this->datosPeticion['id_company'];
				$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
				$start_date = $this->datosPeticion['start_date'];
				$end_date = $this->datosPeticion['end_date'];
				

				$strQuery = "select id, campaign_code, ped_code, campaign_name, customer, id_customer, creation_date, end_date,
				budget_income, budget_expenses, real_income, real_expenses, numfacturas,
				desestimado, fechadesestimado, motivodesestimado, btramite, salidas, 
				case when id_company = 412 or id_company = 385 then 						
				case when real_income = budget_income and salidaspendientes = 0 then 5 when salidaspendientes = 0 and id_status = 2 then 4 when btramite = 1 or salidas <> 0 then 3 else id_status end else id_status end as id_status,
				case when id_company = 412 or id_company = 385 then 
				case when real_income = budget_income and salidaspendientes = 0 then 'Finalizado' when salidaspendientes = 0 and id_status = 2 then 'Procesado' when btramite = 1 or salidas <> 0 then 'En Proceso' else status end else status end as status,
				(select valuechar from tt_valuesbvsfields where idtable = t.id and freefieldsvscompanyid = 1) as project
				from(select campaign.id_company, campaign.id, campaign.campaign_code, campaign.ped_code, campaign.campaign_name, user.nickname as user, user.id as id_user, customer.customer_name as customer, customer.id as id_customer, team.team_name as team,
								team.id as id_team, grupo.name as grupo, grupo.id as id_group, subgroup.name as subgroup, subgroup.id as id_subgroup, status.id as id_status, status.status, campaign.creation_date, campaign.end_date, campaign.security_level,
								case when bdesestimado = 2 then 0 else (select sum(amount*unit_budget*price) as total from tt_subconcepts_project where id_project= campaign.id) end as budget_income,
								case when bdesestimado = 2 then 0 else (select sum(amount*unit_budget*unit_real) as total from tt_subconcepts_project where id_project= campaign.id) end as budget_expenses,
								(select case when sum(amount*unit_budget*price) is null then 0 else sum(amount*unit_budget*price) end as total from tt_subconcepts_billing, tt_billing where tt_billing.id=tt_subconcepts_billing.id_bill and tt_billing.id_project = campaign.id) as real_income,
								(SELECT sum(amount) as total FROM `tt_budget_expenses` where id_campaign=campaign.id and type=1) as real_expenses,
								(select count(*) from tt_billing where id_project = campaign.id) as numfacturas,
								case when bdesestimado = -1 then 'No' when bdesestimado = 2 then 'Anulado' else 'Sí' end as desestimado, fechadesestimado, motivodesestimado,
								campaign.btramite, 
								(select count(*) from tt_subconcepts_project, tt_articles_movement where tt_subconcepts_project.id_project = campaign.id and tt_articles_movement.subconcept_project_id = tt_subconcepts_project.id) as salidas,
								(select count(*) from tt_subconcepts_project, tt_articlesvslocation, tt_subconcepts_standards where tt_subconcepts_standards.bstockable = 1  and tt_subconcepts_standards.id = tt_articlesvslocation.article_id and tt_subconcepts_project.id_project = campaign.id and tt_articlesvslocation.subconcept_project_id = tt_subconcepts_project.id) as salidaspendientes 
								FROM `tt_campaign` campaign
													left join `tt_user` user
													on campaign.id_user=user.id
													inner join `tt_customer` customer
													on campaign.id_customer=customer.id
													left join `tt_team` team
													on campaign.id_team=team.id
													left join `tt_group` grupo
													on campaign.id_group=grupo.id
													  left join `tt_subgroup` subgroup
													on campaign.id_subgroup=subgroup.id
													inner join `tt_status` status
													on campaign.id_status=status.id 
													where campaign.id_company='".$id_company."' 
													and campaign.id_fiscal_year='".$id_fiscal_year."'
													and campaign.creation_date >= '".$start_date."'
													and campaign.creation_date <= '".$end_date."') as t";

				// Depende del rol, selecciona unos proyectos u otros.
				if($role == 6 || $role == 7 || $role == 8) {
					$query = $this->_conn->prepare("select id_team from tt_user where id=".$id_user);
					$query->execute();
					$team = $query->fetch(PDO::FETCH_ASSOC);
					$id_team = $team['id_team'];
				}
				if($role == 7 || $role == 8) {
					$strQuery = $strQuery." and (campaign.id_user='".$id_user."' or security_level='Bajo')";
					$strQuery = $strQuery." and campaign.id_team='".$id_team."'";
				}
				if ($role == 6) {
					$strQuery = $strQuery." and campaign.id_team='".$id_team."'";
				}

/* 				$strQuery = $strQuery." order by campaign.campaign_code ASC"; */
				$strQuery = $strQuery." order by id DESC";

				$query = $this->_conn->prepare($strQuery);
				$query->execute();
				$filas = $query->fetchAll(PDO::FETCH_ASSOC);
				$filasActualizadas = $query->rowCount();

				if ($filasActualizadas>0) {
					$respuesta['status'] = 'ok';
					$respuesta['items'] = $filas;
					$this->mostrarRespuesta($respuesta, 200);
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'No hay ningun proyecto en la empresa y año seleccionados';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}

		public function clonarPresupuesto() {

			if ($_SERVER['REQUEST_METHOD'] != "POST") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if (isset($this->datosPeticion['origen'],$this->datosPeticion['destino'])) {

				$origen = $this->datosPeticion['origen'];
				$destino = $this->datosPeticion['destino'];

				$query = $this->_conn->prepare("INSERT INTO `tt_subconcepts_project` (id_variable_concept, amount, unit_budget, price, unit_real, id_project, name) SELECT id_variable_concept, amount, unit_budget, price, unit_real, ".$destino.", name FROM `tt_subconcepts_project` where id_project=".$origen);
				$query->execute();

				$respuesta['status'] = 'ok';
				$this->mostrarRespuesta($respuesta, 200);
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);

		}

		private function addCampaign() {
			if ($_SERVER['REQUEST_METHOD'] != "POST") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidUserToken($this->datosPeticion['token'])) {
				return false;
			}
			if (isset($this->datosPeticion['campaign_code'], $this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year'], $this->datosPeticion['campaign_name'], $this->datosPeticion['id_user'],
								$this->datosPeticion['id_customer'], $this->datosPeticion['id_team'], $this->datosPeticion['id_group'], $this->datosPeticion['id_subgroup'], $this->datosPeticion['id_status'],$this->datosPeticion['id_security'],
								$this->datosPeticion['creation_date'], $this->datosPeticion['end_date'],
								$this->datosPeticion['filters_start_date'], $this->datosPeticion['filters_end_date'])) {

				$campaign_code = $this->datosPeticion['campaign_code'];
				$id_company = $this->datosPeticion['id_company'];
				$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
				$campaign_name = html_entity_decode($this->datosPeticion['campaign_name']);
				$id_user = $this->datosPeticion['id_user'];
				$id_customer = $this->datosPeticion['id_customer'];
				$id_team = $this->datosPeticion['id_team'];
				$id_group = $this->datosPeticion['id_group'];
				$id_subgroup = $this->datosPeticion['id_subgroup'];
				$id_status = $this->datosPeticion['id_status'];
				$creation_date = $this->datosPeticion['creation_date'];
				$end_date = $this->datosPeticion['end_date'];
				$id_security = $this->datosPeticion['id_security'];
				$auto_number = $this->datosPeticion['auto_number'];
				$filters_start_date = $this->datosPeticion['filters_start_date'];
				$filters_end_date = $this->datosPeticion['filters_end_date'];
				$btramite = 0;

				//if ($auto_number === true){suponemos que todos son autonumber
					 $query = $this->_conn->prepare("select max(campaign_code)+1 as cod from tt_campaign where id_company='".$id_company."'");// and id_status='".$id_status."'
					 $query->execute();
					 $filas = $query->fetch(PDO::FETCH_ASSOC);

 					if($filas['cod'] === NULL) {
						$campaign_code = 1;
					} else {
                        $campaign_code = $filas['cod'];
					}  
				//}

				$query = $this->_conn->prepare("select * from tt_campaign where id_fiscal_year='".$id_fiscal_year."' and id_company='".$id_company."' and ( campaign_code='".$campaign_code."')");//quito validación campaign_name
				$filas = $query->execute();
				$filasActualizadas = $query->rowCount();

				if($filasActualizadas === 0) {
					$ped_code = NULL;
					if ($id_status === '2'){				
							$query = $this->_conn->prepare("select number, concat(replace(prefix,'yyyy',YEAR(CURDATE())),number) as prefix from tt_numbers where type = 1 and id_company='".$id_company."'");// and id_status='".$id_status."'
							$query->execute();
							$filas = $query->fetch(PDO::FETCH_ASSOC);
	
						if($filas['number'] === NULL) {
							$ped_code = 1;
						} else {
							$ped_code = $filas['prefix'];
							$filas['number'] = $filas['number'] + 1;
							$query = $this->_conn->prepare("update tt_numbers set number = ".$filas['number']." where type = 1 and id_company='".$id_company."'");// and id_status='".$id_status."'
							$query->execute();
						} 

						
						if ($id_company === '385' || $id_company === '412'  ){
							$btramite = 1;
						}
						
						$query = $this->_conn->prepare("SELECT email 
						FROM gesad.tt_user 
						where b_mailchangestatus = 1
						and id_company =".$id_company);

						$query->execute();
						$mails = $query->fetchAll(PDO::FETCH_ASSOC);
						$respuesta['mails'] = $mails;

						foreach($mails as $direccion) {
							//SendMail($direccion["email"],"prueba","probando correo","From: zum@zumweb.es");
							mail($direccion["email"], "Nuevo Pedido ".$ped_code, "Se ha creado el Pedido ".$ped_code.": ".$campaign_name, "From: zum@zumweb.es");
						}
					}

					$query = $this->_conn->prepare("insert into tt_campaign(id_company,id_fiscal_year,campaign_code,ped_code, campaign_name,id_user,id_customer,id_team,id_group,id_subgroup,id_status,creation_date, end_date, security_level,btramite) values(
						'".$id_company."','".$id_fiscal_year."','".$campaign_code."','".$ped_code."','".$campaign_name."', '".$id_user."','".$id_customer."','".$id_team."','".$id_group."','".$id_subgroup."','".$id_status."','".$creation_date."','".$end_date."','".$id_security."','".$btramite."')");
					$query->execute();
					$filasActualizadas = $query->rowCount();
					if ($filasActualizadas == 1) {
						$respuesta['status'] = 'ok';
						$query = $this->_conn->prepare("select id, campaign_code, ped_code, campaign_name, customer, id_customer, creation_date, end_date,
						budget_income, budget_expenses, real_income, real_expenses, numfacturas,
						desestimado, fechadesestimado, motivodesestimado, btramite, salidas, 
						case when id_company = 412 or id_company = 385 then 						
						case when real_income = budget_income and salidaspendientes = 0 then 5 when salidaspendientes = 0 and id_status = 2 then 4 when btramite = 1 or salidas <> 0 then 3 else id_status end else id_status end as id_status,
						case when id_company = 412 or id_company = 385 then 
						case when real_income = budget_income and salidaspendientes = 0 then 'Finalizado' when salidaspendientes = 0 and id_status = 2 then 'Procesado' when btramite = 1 or salidas <> 0 then 'En Proceso' else status end else status end as status 
						from(
						select campaign.id_company, campaign.id, campaign.campaign_code, campaign.ped_code, campaign.campaign_name, user.nickname as user, user.id as id_user, customer.customer_name as customer, customer.id as id_customer, team.team_name as team,
										team.id as id_team, grupo.name as grupo, grupo.id as id_group, subgroup.name as subgroup, subgroup.id as id_subgroup, status.id as id_status, status.status, campaign.creation_date, campaign.end_date, campaign.security_level,
										case when bdesestimado = 2 then 0 else (select sum(amount*unit_budget*price) as total from tt_subconcepts_project where id_project= campaign.id) end as budget_income,
										case when bdesestimado = 2 then 0 else (select sum(amount*unit_budget*unit_real) as total from tt_subconcepts_project where id_project= campaign.id) end as budget_expenses,
										(select case when sum(amount*unit_budget*price) is null then 0 else sum(amount*unit_budget*price) end as total from tt_subconcepts_billing, tt_billing where tt_billing.id=tt_subconcepts_billing.id_bill and tt_billing.id_project = campaign.id) as real_income,
										(SELECT sum(amount) as total FROM `tt_budget_expenses` where id_campaign=campaign.id and type=1) as real_expenses,
										(select count(*) from tt_billing where id_project = campaign.id) as numfacturas,
										case when bdesestimado = -1 then 'No' when bdesestimado = 2 then 'Anulado' else 'Sí' end as desestimado, fechadesestimado, motivodesestimado,
										campaign.btramite, 
										(select count(*) from tt_subconcepts_project, tt_articles_movement where tt_subconcepts_project.id_project = campaign.id and tt_articles_movement.subconcept_project_id = tt_subconcepts_project.id) as salidas,
										(select count(*) from tt_subconcepts_project, tt_articlesvslocation, tt_subconcepts_standards where tt_subconcepts_standards.bstockable = 1  and tt_subconcepts_standards.id = tt_articlesvslocation.article_id and tt_subconcepts_project.id_project = campaign.id and tt_articlesvslocation.subconcept_project_id = tt_subconcepts_project.id) as salidaspendientes 
										FROM `tt_campaign` campaign
															left join `tt_user` user
															on campaign.id_user=user.id
															inner join `tt_customer` customer
															on campaign.id_customer=customer.id
															left join `tt_team` team
															on campaign.id_team=team.id
															left join `tt_group` grupo
															on campaign.id_group=grupo.id
															  left join `tt_subgroup` subgroup
															on campaign.id_subgroup=subgroup.id
															inner join `tt_status` status
															on campaign.id_status=status.id 
															where campaign.id_company='".$id_company."' 
															and campaign.id_fiscal_year='".$id_fiscal_year."' 
															and campaign.creation_date >= '".$filters_start_date."'
															and campaign.creation_date <= '".$filters_end_date."'
															) as t order by id desc");

						$query->execute();
						$filas = $query->fetchAll(PDO::FETCH_ASSOC);
						$respuesta['items'] = $filas;
						$respuesta['query'] = $query;
						$this->mostrarRespuesta($respuesta, 200);
					} else {
						$respuesta['status'] = 'error';
						$respuesta['msg'] = 'No se ha podido añadir el presupuesto';
						$this->mostrarRespuesta($respuesta, 200);
					}
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'Ya existe un presupuesto o pedido con esos valores';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}

		private function addStorage() {
			if ($_SERVER['REQUEST_METHOD'] != "POST") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidUserToken($this->datosPeticion['token'])) {
				return false;
			}


			if (isset($this->datosPeticion['id_company'],$this->datosPeticion['units'], $this->datosPeticion['warehouse'], $this->datosPeticion['row'], $this->datosPeticion['section'],
								$this->datosPeticion['height'], $this->datosPeticion['article_id'], $this->datosPeticion['user_id'])) {

				$id_company = $this->datosPeticion['id_company'];				
				$units= $this->datosPeticion['units'];
				$warehouse= $this->datosPeticion['warehouse'];
				$row=$this->datosPeticion['row'];
				$section=$this->datosPeticion['section'];
				$height=$this->datosPeticion['height'];
				$article_id=$this->datosPeticion['article_id'];
				$dateexpiry=$this->datosPeticion['dateexpiry'];
				$owner_id=$this->datosPeticion['owner_id'];
				$state_id=$this->datosPeticion['state_id'];
				$user_id=$this->datosPeticion['user_id'];
				$image=$this->datosPeticion['image'];
				$observations= html_entity_decode($this->datosPeticion['observations']);

				$query = $this->_conn->prepare("select id from tt_articlesvslocation where location_warehouse='".$warehouse."' and location_rows='".$row."' 
									and location_sections='".$section."' and location_heights='".$height."' and article_id='".$article_id."' 
									and borrado = 0 and dateexpiry='".$dateexpiry."' and owner_id='".$owner_id."' and state_id='".$state_id."'");
				$filas = $query->execute();
				$filas = $query->fetch(PDO::FETCH_ASSOC);
				$filasActualizadas = $query->rowCount();

				if($filasActualizadas === 0) {

					$query = $this->_conn->prepare("INSERT INTO `tt_articlesvslocation`(`units`, `location_warehouse`, `location_rows`, `location_sections`, `location_heights`, `article_id`, `dateexpiry`, `owner_id`, `state_id`,`date_mod`,`image`) VALUES (
							'".$units."','".$warehouse."','".$row."','".$section."','".$height."', '".$article_id."','".$dateexpiry."','".$owner_id."','".$state_id."',CURRENT_TIMESTAMP,'".$image."')");
					$query->execute();
					$filasActualizadas = $query->rowCount();

					$insertId = $this->_conn->lastInsertId();

				}else{
					$insertId = $filas['id'];

					$query = $this->_conn->prepare("UPDATE `tt_articlesvslocation` SET date_mod=CURRENT_TIMESTAMP, units = units +".$units."
						where id =".$insertId);
					$query->execute();
				}

				$query = $this->_conn->prepare("INSERT INTO `tt_articles_movement`(`articlesvslocation_id`, `operation_id`, `date`, `user_id`, `location_row`, `location_height`, `location_section`, `observations`, `units`, `location_warehouse`) VALUES ( 
					'".$insertId."',1,CURRENT_TIMESTAMP,'".$user_id."','".$row."', '".$height."','".$section."','".$observations."','".$units."','".$warehouse."')");
				$query->execute();

					if ($filasActualizadas == 1) {
						$respuesta['status'] = 'ok';
						$query = $this->_conn->prepare("SELECT tt_articlesvslocation.id, tt_warehouse.name as almacen,
						tt_articlesvslocation.location_rows as pasillo,
						tt_articlesvslocation.location_sections as seccion,
						tt_articlesvslocation.location_heights as altura,
						tt_subconcepts_standards.code as codigo,
						tt_subconcepts_standards.description as articulo,
						tt_articles_families.familyname as familia,
						tt_customer.customer_name as cliente,
						tt_articlesvslocation.dateexpiry as caducidad,
						tt_articles_envelopes.name as embalaje,
						tt_articlesvslocation.units as unidades,
						tt_subconcepts_standards.unitsperitem as unidadesxitem,
						(tt_articlesvslocation.units*tt_subconcepts_standards.unitsperitem) as total,
						tt_articles_state.state, 
						tt_warehouse.id as idalmacen, tt_articles_state.id as idestado, tt_customer.id as idcliente,
						tt_subconcepts_standards.brand as marca, tt_articlesvslocation.image
						from tt_articlesvslocation, tt_subconcepts_standards, 
						tt_warehouse, tt_articles_families,tt_articles_envelopes, tt_customer, tt_articles_state
						where article_id = tt_subconcepts_standards.id
						and tt_articlesvslocation.location_warehouse = tt_warehouse.id
						and tt_articles_families.id = tt_subconcepts_standards.id_family
						and tt_articles_envelopes.id = tt_subconcepts_standards.envelope_type
						and tt_customer.id = tt_articlesvslocation.owner_id
						and tt_articles_state.id = tt_articlesvslocation.state_id
						and tt_articlesvslocation.borrado = 0
						and tt_subconcepts_standards.id_company =".$id_company." order by tt_articlesvslocation.date_mod desc, tt_articlesvslocation.id desc");

						$query->execute();
						$filas = $query->fetchAll(PDO::FETCH_ASSOC);
						$respuesta['items'] = $filas;
						$this->mostrarRespuesta($respuesta, 200);
					} else {
						$respuesta['status'] = 'error';
						$respuesta['msg'] = 'No se ha podido añadir la línea';
						$this->mostrarRespuesta($respuesta, 200);
					}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}

		private function updatePresupuesto2Pedido() {
			if ($_SERVER['REQUEST_METHOD'] != "PUT") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidUserToken($this->datosPeticion['token'])) {
				return false;
			}
			if (isset($this->datosPeticion['id'],$this->datosPeticion['id_company'])) {
				$id = $this->datosPeticion['id'];
				$id_company = $this->datosPeticion['id_company'];


				$query = $this->_conn->prepare("select number, concat(replace(prefix,'yyyy',YEAR(CURDATE())),number) as prefix from tt_numbers where type = 1 and id_company='".$id_company."'");// and id_status='".$id_status."'
				$query->execute();
				$filas = $query->fetch(PDO::FETCH_ASSOC);
	
				if($filas['number'] === NULL) {
					$ped_code = 1;
				} else {
					$ped_code = $filas['prefix'];
					$filas['number'] = $filas['number'] + 1;
					$query = $this->_conn->prepare("update tt_numbers set number = ".$filas['number']." where type = 1 and id_company='".$id_company."'");// and id_status='".$id_status."'
					$query->execute();
				} 

							$query = $this->_conn->prepare("update tt_campaign set btramite = 1 where id = '".$id."' and id_company in (385,412)");
		  				$query->execute();

							$query = $this->_conn->prepare("UPDATE tt_campaign set
							ped_code ='".$ped_code."',
							id_status='2'
							where id='".$id."'");
							$query->execute();

							$query = $this->_conn->prepare("SELECT email 
							FROM gesad.tt_user 
							where b_mailchangestatus = 1
							and id_company =".$id_company);

							$query->execute();
							$mails = $query->fetchAll(PDO::FETCH_ASSOC);
							$respuesta['mails'] = $mails;

							foreach($mails as $direccion) {
								//SendMail($direccion["email"],"prueba","probando correo","From: zum@zumweb.es");
								mail($direccion["email"], "Nuevo Pedido ".$ped_code, "Se ha creado el Pedido ".$ped_code.": ".$campaign_name, "From: zum@zumweb.es");
								$respuesta['prueba'] = $direccion["email"];
							} 
							$respuesta['status'] = "ok";
							$this->mostrarRespuesta($respuesta, 200);
		}
	}

		private function updateCampaign() {
			if ($_SERVER['REQUEST_METHOD'] != "PUT") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidUserToken($this->datosPeticion['token'])) {
				return false;
			}
			if (isset($this->datosPeticion['id'],$this->datosPeticion['campaign_code'], $this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year'], $this->datosPeticion['campaign_name'], $this->datosPeticion['id_user'],
			$this->datosPeticion['id_customer'], $this->datosPeticion['id_team'], $this->datosPeticion['id_group'], $this->datosPeticion['id_subgroup'], $this->datosPeticion['id_status'], $this->datosPeticion['creation_date'],
			$this->datosPeticion['end_date'], $this->datosPeticion['id_security'])) {
				$id = $this->datosPeticion['id'];
				$campaign_code = $this->datosPeticion['campaign_code'];
				$id_company = $this->datosPeticion['id_company'];
				$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
				$campaign_name = html_entity_decode($this->datosPeticion['campaign_name']);
				$id_user = $this->datosPeticion['id_user'];
				$id_customer = $this->datosPeticion['id_customer'];
				$id_team = $this->datosPeticion['id_team'];
				$id_group = $this->datosPeticion['id_group'];
				$id_subgroup = $this->datosPeticion['id_subgroup'];
				$id_status = $this->datosPeticion['id_status'];
				$creation_date = $this->datosPeticion['creation_date'];
				$end_date = $this->datosPeticion['end_date'];
				$id_security = $this->datosPeticion['id_security'];

				$query = $this->_conn->prepare("select * from tt_campaign where id_fiscal_year='".$id_fiscal_year."' and id_company='".$id_company."' and id!='".$id."' and (campaign_code='".$campaign_code."')");//campaign_name='".$campaign_name."' or
				$filas = $query->execute();
				$filasActualizadas = $query->rowCount();

				if($filasActualizadas === 0) {
						//consulta preparada ya hace mysqli_real_escape()
					$query = $this->_conn->prepare("UPDATE tt_campaign set
						campaign_code='".$campaign_code."',
						campaign_name='".$campaign_name."',
						id_user='".$id_user."',
						id_customer='".$id_customer."',
						id_team='".$id_team."',
						id_group='".$id_group."',
						id_subgroup='".$id_subgroup."',
						id_status='".$id_status."',
						security_level='".$id_security."',
						creation_date='".$creation_date."',
						end_date='".$end_date."' where id='".$id."'");
					$query->execute();
					$filasActualizadas = $query->rowCount();
					$insertId = $this->_conn->lastInsertId();
					if ($filasActualizadas == 1) {
						$respuesta['status'] = 'ok';
						$respuesta['idx'] = $this->datosPeticion['idx'];

						//actualizo el número de pedido si es el caso
						if ($id_status === '1'){
							$query = $this->_conn->prepare("UPDATE tt_campaign set
							ped_code = 0,
							btramite = 0
							where id='".$id."'");
							$query->execute();
						}
 						if ($id_status === '2'){

							$query = $this->_conn->prepare("select number, concat(replace(prefix,'yyyy',YEAR(CURDATE())),number) as prefix from tt_numbers where type = 1 and id_company='".$id_company."'");// and id_status='".$id_status."'
							$query->execute();
							$filas = $query->fetch(PDO::FETCH_ASSOC);
	
							if($filas['number'] === NULL) {
								$ped_code = 1;
							} else {
								$ped_code = $filas['prefix'];
								$filas['number'] = $filas['number'] + 1;
								$query = $this->_conn->prepare("update tt_numbers set number = ".$filas['number']." where type = 1 and id_company='".$id_company."'");// and id_status='".$id_status."'
								$query->execute();
							} 

							$query = $this->_conn->prepare("update tt_campaign set btramite = 1 where id = '".$id."' and id_company in (385,412)");
		  				$query->execute();

							$query = $this->_conn->prepare("UPDATE tt_campaign set
							ped_code ='".$ped_code."'
							where id='".$id."'");
							$query->execute();

							$query = $this->_conn->prepare("SELECT email 
							FROM gesad.tt_user 
							where b_mailchangestatus = 1
							and id_company =".$id_company);

							$query->execute();
							$mails = $query->fetchAll(PDO::FETCH_ASSOC);
							$respuesta['mails'] = $mails;

							foreach($mails as $direccion) {
								//SendMail($direccion["email"],"prueba","probando correo","From: zum@zumweb.es");
								mail($direccion["email"], "Nuevo Pedido ".$ped_code, "Se ha creado el Pedido ".$ped_code.": ".$campaign_name, "From: zum@zumweb.es");
								$respuesta['prueba'] = $direccion["email"];
							} 

						} 

						$query = $this->_conn->prepare("select id, campaign_code, ped_code, campaign_name, customer, id_customer, creation_date, end_date,
						budget_income, budget_expenses, real_income, real_expenses, numfacturas,
						desestimado, fechadesestimado, motivodesestimado, btramite, salidas, 
						case when id_company = 412 or id_company = 385 then 						
						case when real_income = budget_income and salidaspendientes = 0 then 5 when salidaspendientes = 0 and id_status = 2 then 4 when btramite = 1 or salidas <> 0 then 3 else id_status end else id_status end as id_status,
						case when id_company = 412 or id_company = 385 then 
						case when real_income = budget_income and salidaspendientes = 0 then 'Finalizado' when salidaspendientes = 0 and id_status = 2 then 'Procesado' when btramite = 1 or salidas <> 0 then 'En Proceso' else status end else status end as status 
						from(
						select campaign.id_company, campaign.id, campaign.campaign_code, campaign.ped_code, campaign.campaign_name, user.nickname as user, user.id as id_user, customer.customer_name as customer, customer.id as id_customer, team.team_name as team,
										team.id as id_team, grupo.name as grupo, grupo.id as id_group, subgroup.name as subgroup, subgroup.id as id_subgroup, status.id as id_status, status.status, campaign.creation_date, campaign.end_date, campaign.security_level,
										case when bdesestimado = 2 then 0 else (select sum(amount*unit_budget*price) as total from tt_subconcepts_project where id_project= campaign.id) end as budget_income,
										case when bdesestimado = 2 then 0 else (select sum(amount*unit_budget*unit_real) as total from tt_subconcepts_project where id_project= campaign.id) end as budget_expenses,
										(select case when sum(amount*unit_budget*price) is null then 0 else sum(amount*unit_budget*price) end as total from tt_subconcepts_billing, tt_billing where tt_billing.id=tt_subconcepts_billing.id_bill and tt_billing.id_project = campaign.id) as real_income,
										(SELECT sum(amount) as total FROM `tt_budget_expenses` where id_campaign=campaign.id and type=1) as real_expenses,
										(select count(*) from tt_billing where id_project = campaign.id) as numfacturas,
										case when bdesestimado = -1 then 'No' when bdesestimado = 2 then 'Anulado' else 'Sí' end as desestimado, fechadesestimado, motivodesestimado,
										campaign.btramite, 
										(select count(*) from tt_subconcepts_project, tt_articles_movement where tt_subconcepts_project.id_project = campaign.id and tt_articles_movement.subconcept_project_id = tt_subconcepts_project.id) as salidas,
										(select count(*) from tt_subconcepts_project, tt_articlesvslocation, tt_subconcepts_standards where tt_subconcepts_standards.bstockable = 1  and tt_subconcepts_standards.id = tt_articlesvslocation.article_id and tt_subconcepts_project.id_project = campaign.id and tt_articlesvslocation.subconcept_project_id = tt_subconcepts_project.id) as salidaspendientes 
										FROM `tt_campaign` campaign
															left join `tt_user` user
															on campaign.id_user=user.id
															inner join `tt_customer` customer
															on campaign.id_customer=customer.id
															left join `tt_team` team
															on campaign.id_team=team.id
															left join `tt_group` grupo
															on campaign.id_group=grupo.id
															  left join `tt_subgroup` subgroup
															on campaign.id_subgroup=subgroup.id
															inner join `tt_status` status
															on campaign.id_status=status.id 
															where campaign.id='".$id."' 
															) as t");
						$query->execute();
						$filas = $query->fetchAll(PDO::FETCH_ASSOC);
						$respuesta['item'] = $filas;
						$this->mostrarRespuesta($respuesta, 200);
					} else {
						$respuesta['status'] = 'error';
						$respuesta['msg'] = 'No se han podido actualizar los valores';
						$this->mostrarRespuesta($respuesta, 200);
					}
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'Ya existe un proyecto con esos valores';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}

		private function updatePassword() {
			if ($_SERVER['REQUEST_METHOD'] != "PUT") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidUserToken($this->datosPeticion['token'])) {
				return false;
			}
			if (isset($this->datosPeticion['id_user'],$this->datosPeticion['password'])) {
				$id_user = $this->datosPeticion['id_user'];
				$password = $this->datosPeticion['password'];

						//consulta preparada ya hace mysqli_real_escape()
					$query = $this->_conn->prepare("UPDATE tt_user set
						password='".$password."'
						where id='".$id_user."'");

					$query->execute();
					$filasActualizadas = $query->rowCount();

					if ($filasActualizadas == 1) {
						$respuesta['status'] = 'ok';
						$respuesta['msg'] = 'Se ha actualizado la contraseña';
						$this->mostrarRespuesta($respuesta, 200);
					} else {
						$respuesta['status'] = 'error';
						$respuesta['msg'] = 'No se ha podido modificar la contraseña';
						$this->mostrarRespuesta($respuesta, 200);
					}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}

		private function updatePresupuestoDesestimado() {
			if ($_SERVER['REQUEST_METHOD'] != "PUT") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidUserToken($this->datosPeticion['token'])) {
				return false;
			}
			if (isset($this->datosPeticion['id'],$this->datosPeticion['bdesestimado'])) {
				$id = $this->datosPeticion['id'];
				$bdesestimado = $this->datosPeticion['bdesestimado'];
				$motivodesestimado = $this->datosPeticion['motivodesestimado'];

						//consulta preparada ya hace mysqli_real_escape()
					$query = $this->_conn->prepare("UPDATE tt_campaign set
						bdesestimado='".$bdesestimado."',
						motivodesestimado='".$motivodesestimado."',
						fechadesestimado= CURRENT_TIMESTAMP
						where id='".$id."'");

					$query->execute();
					$filasActualizadas = $query->rowCount();
					$insertId = $this->_conn->lastInsertId();
					if ($filasActualizadas == 1) {
						$respuesta['status'] = 'ok';
						$respuesta['query'] = $query;
						$this->mostrarRespuesta($respuesta, 200);
					} else {
						$respuesta['status'] = 'error';
						$respuesta['msg'] = 'No se han podido actualizar los valores';
						$this->mostrarRespuesta($respuesta, 200);
					}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}

		private function deleteCampaign() {
			$query = $this->_conn->prepare("select id FROM `tt_lines_subconcept`where amount>0 and id_project='".$this->datosPeticion['id']."'");
			$query->execute();
			$filas = $query->fetchAll(PDO::FETCH_ASSOC);

			$filasActualizadas = $query->rowCount();
			if ($filasActualizadas > 0 ){
				$jsonResponse['status'] = 'ko';
				$jsonResponse['msg'] = 'El proyecto contiene ingresos presupuestados. No se puede eliminar.';
				$this->mostrarRespuesta($jsonResponse, 200);
				return false;
			}
			$query = $this->_conn->prepare("select id_campaign FROM `tt_budget_expenses`where amount>0 and id_campaign='".$this->datosPeticion['id']."'");
			$query->execute();
			$filas = $query->fetchAll(PDO::FETCH_ASSOC);
			$filasActualizadas = $query->rowCount();

			if ($filasActualizadas > 0 ){
				$jsonResponse['status'] = 'ko';
				$jsonResponse['msg'] = 'El proyecto contiene gastos presupuestados. No se puede eliminar.';
				$this->mostrarRespuesta($jsonResponse, 200);
				return false;
			}
			$query = $this->_conn->prepare("select id_campaign FROM `tt_estimated_employee_cost` where amount>0 and id_campaign='".$this->datosPeticion['id']."'");
			$query->execute();
			$filas = $query->fetchAll(PDO::FETCH_ASSOC);
			$filasActualizadas = $query->rowCount();

			if ($filasActualizadas > 0 ){
				$jsonResponse['status'] = 'ko';
				$jsonResponse['msg'] = 'El proyecto contiene gastos presupuestados de personal. No se puede eliminar.';
				$this->mostrarRespuesta($jsonResponse, 200);
				return false;
			}
			$query = $this->_conn->prepare("select id_campaign FROM `tt_real_employee_cost` where amount>0 and id_campaign='".$this->datosPeticion['id']."'");
			$query->execute();
			$filas = $query->fetchAll(PDO::FETCH_ASSOC);
			$filasActualizadas = $query->rowCount();

			if ($filasActualizadas > 0 ){
				$jsonResponse['status'] = 'ko';
				$jsonResponse['msg'] = 'El proyecto contiene gastos reales de personal. No se puede eliminar.';
				$this->mostrarRespuesta($jsonResponse, 200);
				return false;
			}

			$query = $this->_conn->prepare("select id_campaign FROM `tt_user_hours` where id_campaign='".$this->datosPeticion['id']."'");
			$query->execute();
			$filas = $query->fetchAll(PDO::FETCH_ASSOC);
			$filasActualizadas = $query->rowCount();

			if ($filasActualizadas > 0 ){
				$jsonResponse['status'] = 'ko';
				$jsonResponse['msg'] = 'El proyecto contiene gastos de personal. No se puede eliminar.';
				$this->mostrarRespuesta($jsonResponse, 200);
				return false;
			}

			// borramos todas las relaciones
			$query = $this->_conn->prepare("DELETE FROM `tt_lines_subconcept`where id_project='".$this->datosPeticion['id']."'");
			$query->execute();
			$query = $this->_conn->prepare("DELETE FROM `tt_budget_expenses`where id_campaign='".$this->datosPeticion['id']."'");
			$query->execute();
			$query = $this->_conn->prepare("DELETE FROM `tt_estimated_employee_cost` where id_campaign='".$this->datosPeticion['id']."'");
			$query->execute();
			$query = $this->_conn->prepare("DELETE FROM `tt_real_employee_cost` where id_campaign='".$this->datosPeticion['id']."'");
			$query->execute();

			$response = $this->operationApi("DELETE FROM tt_campaign WHERE id=".$this->datosPeticion['id'], 'DELETE', false);
			if ( $response != false) {
				$jsonResponse['status'] = 'ok';
				$this->mostrarRespuesta($jsonResponse, 200);
			}
			else {
				$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
			}
		}

		private function cobrarBill(){
			$numero = $this->datosPeticion['numero'];

			if ($numero == 1){
				$query = $this->_conn->prepare("INSERT into `tt_billing_charges` (amount,date,id_billing) select total, '".$this->datosPeticion['fecha_cobro']."', id from tt_billing where id ='".$this->datosPeticion['id']."'");
				//" where id ='".$id_bill_origen."'"
			}else{
				$query = $this->_conn->prepare("DELETE from `tt_billing_charges` where id_billing ='".$this->datosPeticion['id']."'");
			}
			$query->execute();

			$jsonResponse['status'] = 'ok';
			$this->mostrarRespuesta($jsonResponse, 200);
		}

		private function deleteBill() {

			// borramos todas las relaciones
			$query = $this->_conn->prepare("DELETE FROM `tt_subconcepts_billing`where id_bill='".$this->datosPeticion['id']."'");
			$query->execute();

			$response = $this->operationApiSuperAdmin("DELETE FROM tt_billing WHERE id=".$this->datosPeticion['id'], 'DELETE', false);
			if ( $response != false) {
				$jsonResponse['status'] = 'ok';
				$this->mostrarRespuesta($jsonResponse, 200);
			}
			else {
				$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
			}
		}

		private function deleteExpense() {

			// borramos todas las relaciones
			$query = $this->_conn->prepare("DELETE FROM `tt_budget_expenses`where id='".$this->datosPeticion['id']."'");
			$query->execute();

			$respuesta['status'] = 'ok';

			$this->mostrarRespuesta($respuesta, 200);

		}


	 /*** END CAMPAIGNS **/

	 /*** FIXED COST ***/
		public function getExpensesFixed() {
			if ($_SERVER['REQUEST_METHOD'] != "GET") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
				return false;
			}
			if (isset($this->datosPeticion['id_company'],$this->datosPeticion['id_fiscal_year'], $this->datosPeticion['type'])) {
				$id_company = $this->datosPeticion['id_company'];
				$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
				$type = $this->datosPeticion['type'];

				$query = $this->_conn->prepare("select * from tt_expenses_fixed_concept gas, tt_fixed_concept con where gas.id_fixed_concept = con.id and gas.id_company='".$id_company."' and gas.id_fiscal_year='".$id_fiscal_year."' and gas.type='".$type."'");
				$query->execute();
				$filas = $query->fetchAll(PDO::FETCH_ASSOC);
				$filasActualizadas = $query->rowCount();

				if ($filasActualizadas>0) {
					$respuesta['status'] = 'ok';
					$respuesta['items'] = $filas;
					$this->mostrarRespuesta($respuesta, 200);
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'No hay almacenados costes fijos';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}
		private function updateFixedCost() {
			if ($_SERVER['REQUEST_METHOD'] != "PUT") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
				return false;
			}
			if (isset($this->datosPeticion['id_fixed_concept'],$this->datosPeticion['id_month'], $this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year'], $this->datosPeticion['amount'], $this->datosPeticion['type'])) {
				$id_fixed_concept = $this->datosPeticion['id_fixed_concept'];
				$id_month = $this->datosPeticion['id_month'];
				$id_company = $this->datosPeticion['id_company'];
				$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
				$amount = $this->datosPeticion['amount'];
				$type = $this->datosPeticion['type'];

				$query = $this->_conn->prepare("select * from tt_expenses_fixed_concept where id_fiscal_year='".$id_fiscal_year."' and id_company='".$id_company."' and id_fixed_concept='".$id_fixed_concept."' and id_month='".$id_month."' and type='".$type."'");
				$query->execute();
				$filas = $query->fetch(PDO::FETCH_ASSOC);
				$filasActualizadas = $query->rowCount();

				if($filasActualizadas === 0) {
						$query = $this->_conn->prepare("INSERT INTO tt_expenses_fixed_concept(id_fixed_concept,id_month,id_fiscal_year,amount,type,id_company)values(:id_fixed_concept, :id_month,:id_fiscal_year,:amount,:type,:id_company)");
						$query->bindValue(":id_fixed_concept", $id_fixed_concept);
						$query->bindValue(":id_month", $id_month);
						$query->bindValue(":id_fiscal_year", $id_fiscal_year);
						$query->bindValue(":amount", $amount);
						$query->bindValue(":type", $type);
						$query->bindValue(":id_company", $id_company);
						$query->execute();
						$filasActualizadas = $query->rowCount();
						$insertId = $this->_conn->lastInsertId();
						if ($filasActualizadas == 1) {
							$respuesta['status'] = 'ok';
							$respuesta['id'] = $insertId;
							$this->mostrarRespuesta($respuesta, 200);
						}
				}else {
					//consulta preparada ya hace mysqli_real_escape()
					$query = $this->_conn->prepare("UPDATE tt_expenses_fixed_concept set amount='".$amount."' where id='".$filas['id']."'");
					$query->execute();
					$filasActualizadas = $query->rowCount();
					$insertId = $this->_conn->lastInsertId();
					if ($filasActualizadas == 1) {
						$respuesta['status'] = 'ok';
						$this->mostrarRespuesta($respuesta, 200);
					} else {
						$respuesta['status'] = 'error';
						$respuesta['msg'] = 'No se han podido actualizar los valores';
						$this->mostrarRespuesta($respuesta, 200);
					}
				}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}

	 /*** END FIXED COST **/

	 /*** VARIABLE INCOME ***/
	 public function getIncomeVariable() {
		if ($_SERVER['REQUEST_METHOD'] != "GET") {
			$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
		}
		if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
			return false;
		}
		if (isset($this->datosPeticion['id_company'],$this->datosPeticion['id_fiscal_year'], $this->datosPeticion['type'])) {
			$id_company = $this->datosPeticion['id_company'];
			$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
			$type = $this->datosPeticion['type'];

		 $query = $this->_conn->prepare("SELECT *
		 FROM `tt_budget_income` inner join `tt_variable_concept` on tt_variable_concept.id=tt_budget_income.id_variable_concept
		 where tt_budget_income.id_fiscal_year='".$id_fiscal_year."' ORDER BY `id_variable_concept` ASC");
		 $query->execute();
		 $filas = $query->fetchAll(PDO::FETCH_ASSOC);
		 $filasActualizadas = $query->rowCount();

			if ($filasActualizadas>0) {
				$respuesta['status'] = 'ok';
				$respuesta['items'] = $filas;
				$this->mostrarRespuesta($respuesta, 200);
			} else {
				$respuesta['status'] = 'error';
				$respuesta['msg'] = 'No hay almacenados costes variables';
				$this->mostrarRespuesta($respuesta, 200);
			}
		}
		$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
	}	 

	private function updateVariableIncome() {
		if ($_SERVER['REQUEST_METHOD'] != "PUT") {
			$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
		}
		if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
			return false;
		}
		if (isset($this->datosPeticion['id_variable_concept'],$this->datosPeticion['id_month'], $this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year'], $this->datosPeticion['amount'], $this->datosPeticion['type'])) {
			$id_variable_concept = $this->datosPeticion['id_variable_concept'];
			$id_month = $this->datosPeticion['id_month'];
			$id_company = $this->datosPeticion['id_company'];
			$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
			$amount = $this->datosPeticion['amount'];
			$type = $this->datosPeticion['type'];

			$query = $this->_conn->prepare("select * from tt_budget_income where id_fiscal_year='".$id_fiscal_year."' and id_company='".$id_company."' and id_variable_concept='".$id_variable_concept."' and id_month='".$id_month."' and type='".$type."'");
			$query->execute();
			$filas = $query->fetch(PDO::FETCH_ASSOC);
			$filasActualizadas = $query->rowCount();

			if($filasActualizadas === 0) {
					$query = $this->_conn->prepare("INSERT INTO tt_budget_income(id_variable_concept,id_month,id_fiscal_year,amount,type,id_company)values(:id_variable_concept, :id_month,:id_fiscal_year,:amount,:type,:id_company)");
					$query->bindValue(":id_variable_concept", $id_variable_concept);
					$query->bindValue(":id_month", $id_month);
					$query->bindValue(":id_fiscal_year", $id_fiscal_year);
					$query->bindValue(":amount", $amount);
					$query->bindValue(":type", $type);
					$query->bindValue(":id_company", $id_company);
					$query->execute();
					$filasActualizadas = $query->rowCount();
					$insertId = $this->_conn->lastInsertId();
					if ($filasActualizadas == 1) {
						$respuesta['status'] = 'ok';
						$respuesta['id'] = $insertId;
						$this->mostrarRespuesta($respuesta, 200);
					}
			}else {
				//consulta preparada ya hace mysqli_real_escape()
				$query = $this->_conn->prepare("UPDATE tt_budget_income set amount='".$amount."' where id='".$filas['id']."'");
				$query->execute();
				$filasActualizadas = $query->rowCount();
				$insertId = $this->_conn->lastInsertId();
				if ($filasActualizadas == 1) {
					$respuesta['status'] = 'ok';
					$this->mostrarRespuesta($respuesta, 200);
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'No se han podido actualizar los valores';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
		}
		$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
	}


	/*** END VARIABLE INCOME ***/


	 /*** VARIABLE COST ***/
		public function getExpensesVariable() {
			if ($_SERVER['REQUEST_METHOD'] != "GET") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
				return false;
			}
			if (isset($this->datosPeticion['id_company'],$this->datosPeticion['id_fiscal_year'], $this->datosPeticion['type'])) {
				$id_company = $this->datosPeticion['id_company'];
				$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
				$type = $this->datosPeticion['type'];

			 $query = $this->_conn->prepare("SELECT *
			 FROM `tt_budget_expenses` inner join `tt_variable_concept` on tt_variable_concept.id=tt_budget_expenses.id_variable_concept
			 where tt_budget_expenses.id_fiscal_year='".$id_fiscal_year."' ORDER BY `id_variable_concept` ASC");
			 $query->execute();
			 $filas = $query->fetchAll(PDO::FETCH_ASSOC);
			 $filasActualizadas = $query->rowCount();

				if ($filasActualizadas>0) {
					$respuesta['status'] = 'ok';
					$respuesta['items'] = $filas;
					$this->mostrarRespuesta($respuesta, 200);
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'No hay almacenados costes variables';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}

		private function updateVariableExpenses() {
			if ($_SERVER['REQUEST_METHOD'] != "PUT") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
				return false;
			}
			if (isset($this->datosPeticion['id_variable_concept'],$this->datosPeticion['id_month'], $this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year'], $this->datosPeticion['amount'], $this->datosPeticion['type'])) {
				$id_variable_concept = $this->datosPeticion['id_variable_concept'];
				$id_month = $this->datosPeticion['id_month'];
				$id_company = $this->datosPeticion['id_company'];
				$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
				$amount = $this->datosPeticion['amount'];
				$type = $this->datosPeticion['type'];
	
				$query = $this->_conn->prepare("select * from tt_budget_expenses where id_fiscal_year='".$id_fiscal_year."' and id_company='".$id_company."' and id_variable_concept='".$id_variable_concept."' and id_month='".$id_month."' and type='".$type."'");
				$query->execute();
				$filas = $query->fetch(PDO::FETCH_ASSOC);
				$filasActualizadas = $query->rowCount();
	
				if($filasActualizadas === 0) {
						$query = $this->_conn->prepare("INSERT INTO tt_budget_expenses(id_variable_concept,id_month,id_fiscal_year,amount,type,id_company)values(:id_variable_concept, :id_month,:id_fiscal_year,:amount,:type,:id_company)");
						$query->bindValue(":id_variable_concept", $id_variable_concept);
						$query->bindValue(":id_month", $id_month);
						$query->bindValue(":id_fiscal_year", $id_fiscal_year);
						$query->bindValue(":amount", $amount);
						$query->bindValue(":type", $type);
						$query->bindValue(":id_company", $id_company);
						$query->execute();
						$filasActualizadas = $query->rowCount();
						$insertId = $this->_conn->lastInsertId();
						if ($filasActualizadas == 1) {
							$respuesta['status'] = 'ok';
							$respuesta['id'] = $insertId;
							$this->mostrarRespuesta($respuesta, 200);
						}
				}else {
					//consulta preparada ya hace mysqli_real_escape()
					$query = $this->_conn->prepare("UPDATE tt_budget_expenses set amount='".$amount."' where id='".$filas['id']."'");
					$query->execute();
					$filasActualizadas = $query->rowCount();
					$insertId = $this->_conn->lastInsertId();
					if ($filasActualizadas == 1) {
						$respuesta['status'] = 'ok';
						$this->mostrarRespuesta($respuesta, 200);
					} else {
						$respuesta['status'] = 'error';
						$respuesta['msg'] = 'No se han podido actualizar los valores';
						$this->mostrarRespuesta($respuesta, 200);
					}
				}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}


/***END VARIABLE COST **/

   	/*** SETTING  ***/

		private function importErp() {
			if ($_SERVER['REQUEST_METHOD'] != "POST") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}

			if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
				return false;
			}

			if (isset($this->datosPeticion['dataVariables'],$this->datosPeticion['dataFixed'])) {
				$dataVariables = $this->datosPeticion['dataVariables'];
				$dataFixed = $this->datosPeticion['dataFixed'];
				$arrayFixed = json_decode(stripslashes($_POST['dataFixed']));
				$arrayVariables = json_decode(stripslashes($_POST['dataVariables']));

				$strInsertFixed = '';
				$strInsertVariables = '';
				foreach($arrayFixed as $row) {
					$strInsertFixed = 'INSERT INTO tt_expenses_fixed_concept(id_fixed_concept, id_month,id_fiscal_year,amount,type,id_company)
					VALUES("'.$row->id_fixed_concept.'","'.$row->id_month.'","'.$row->id_fiscal_year.'",'.$row->amount.',"1","'.$row->id_company.'");';

					$query = $this->_conn->prepare($strInsertFixed);
					$query->execute();
					$numFixed++;

				}

				foreach($arrayVariables as $row) {
					$strInsertVariables = 'INSERT INTO tt_budget_expenses(id_campaign, amount, id_month, type, id_variable_concept)
					VALUES("'.$row->id_campaign.'",'.$row->amount.',"'.$row->id_month.'","1","'.$row->id_variable_concept.'");';

					$query = $this->_conn->prepare($strInsertVariables);
					$query->execute();
					$numVariables++;

				}

				$respuesta['updatedFixed'] = $numFixed;
				$respuesta['updatedVariables'] = $numVariables;
				$this->mostrarRespuesta($respuesta, 200);

			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}

		private function getInfoImportERP() {
			if ($_SERVER['REQUEST_METHOD'] != "GET") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}

			if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
				return false;
			}
			if (isset($this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year'])) {
				$idCompany = $this->datosPeticion['id_company'];
				$idFiscalYear = $this->datosPeticion['id_fiscal_year'];

				$query = $this->_conn->query("select * from tt_campaign where id_company='".$idCompany."' and id_fiscal_year='".$idFiscalYear."'");
				$filas = $query->fetchAll(PDO::FETCH_ASSOC);

				$query = $this->_conn->query("select account_number,id from tt_variable_concept where id_company='".$idCompany."' and id_fiscal_year='".$idFiscalYear."'");
				$variables = $query->fetchAll(PDO::FETCH_ASSOC);

				$query = $this->_conn->query("select account_number,id from tt_fixed_concept where id_company='".$idCompany."' and id_fiscal_year='".$idFiscalYear."'");
				$fixed = $query->fetchAll(PDO::FETCH_ASSOC);

				$respuesta['status'] = 'ok';
				$respuesta['projects'] = $filas;
				$respuesta['variables'] = $variables;
				$respuesta['fixed'] = $fixed;
				$this->mostrarRespuesta($respuesta, 200);
			}
		}

		private function addCompany() {
			if ($_SERVER['REQUEST_METHOD'] != "POST") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}

			if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
				return false;
			}
			if (isset($this->datosPeticion['company_name'])) {
				$company_name = html_entity_decode($this->datosPeticion['company_name']);
				$id_company = $this->datosPeticion['id_company'];
				$logo = $this->datosPeticion['logo'];
				$cif = $this->datosPeticion['CIF'];
				$address = $this->datosPeticion['address'];
				$address_bis = $this->datosPeticion['address_bis'];

				if (!empty($company_name)) {
					$query = $this->_conn->prepare("select * from tt_company where name='".$company_name."'");
					$query->execute();
					$filasActualizadas = $query->rowCount();
					if($filasActualizadas === 0) {
						//consulta preparada ya hace mysqli_real_escape()
						$query = $this->_conn->prepare("INSERT INTO tt_company(name, logo, CIF, address, address_bis)values(:company_name, :logo, :cif, :address, :address_bis)");
						$query->bindValue(":company_name", $company_name);
						$query->bindValue(":logo", $logo);
						$query->bindValue(":cif", $cif);
						$query->bindValue(":address", $address);
						$query->bindValue(":address_bis", $address_bis);

						$query->execute();
						$filasActualizadas = $query->rowCount();
						$insertId = $this->_conn->lastInsertId();
						$query = $this->_conn->prepare("INSERT INTO tt_budget_cost(id_company)values(:id_company)");
						$query->bindValue(":id_company", $insertId);
						$query->execute();
						if ($filasActualizadas == 1) {
							$query = $this->_conn->query("select * from tt_company where id='".$insertId."'");
							$company = $query->fetch(PDO::FETCH_ASSOC);
							$respuesta['status'] = 'ok';
							$respuesta['id'] = $insertId;
							$respuesta['company'] = $company;
							$this->mostrarRespuesta($respuesta, 200);
						}
					} else {
						$respuesta['status'] = 'error';
						$respuesta['msg'] = 'Ya existe una empresa con ese nombre.';
						$this->mostrarRespuesta($respuesta, 200);
					}
				}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}

		private function getBudgetCost() {
			if ($_SERVER['REQUEST_METHOD'] != "GET") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
				return false;
			}
			if (isset($this->datosPeticion['id_company'])) {
				$id_company = $this->datosPeticion['id_company'];

				$query = $this->_conn->prepare("select * from tt_budget_cost where id_company='".$id_company."'");
				$query->execute();
				$filas = $query->fetch(PDO::FETCH_ASSOC);
				$filasActualizadas = $query->rowCount();

				if ($filasActualizadas>0) {
					$respuesta['status'] = 'ok';
					$respuesta['items'] = $filas;
					$this->mostrarRespuesta($respuesta, 200);
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'No hay porcentaje optimista/pesimista en esta empresa';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}

		private function updateBudgetCost() {
			if ($_SERVER['REQUEST_METHOD'] != "PUT") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
				return false;
			}
			if (isset($this->datosPeticion['pesimist'],$this->datosPeticion['optimist'], $this->datosPeticion['id_company'])) {
				$pesimist = $this->datosPeticion['pesimist'];
				$optimist = $this->datosPeticion['optimist'];
				$id_company = $this->datosPeticion['id_company'];
				if (is_numeric($pesimist) && is_numeric($optimist)) {
					//consulta preparada ya hace mysqli_real_escape()
					$query = $this->_conn->prepare("UPDATE tt_budget_cost set pesimist='".$pesimist."', optimist='".$optimist."' where id_company='".$id_company."'");
					$query->execute();
					$filasActualizadas = $query->rowCount();
					$insertId = $this->_conn->lastInsertId();
					if ($filasActualizadas == 1) {
						$respuesta['status'] = 'ok';
						$this->mostrarRespuesta($respuesta, 200);
					} else {
						$respuesta['status'] = 'error';
						$respuesta['msg'] = 'No se han podido actualizar los porcentajes';
						$this->mostrarRespuesta($respuesta, 200);
					}
				}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}

		private function updateAccountsCompany() {
			if ($_SERVER['REQUEST_METHOD'] != "PUT") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
				return false;
			}
			if (isset($this->datosPeticion['id_fiscal_year'])) {
				$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
				$updates = '';
				if(isset($this->datosPeticion['amortizacion'])) {
					$amortizacion = $this->datosPeticion['amortizacion'];
					$updates .= "amortizacion='".$amortizacion."',";
				}
				if(isset($this->datosPeticion['financiero'])) {
					$financiero = $this->datosPeticion['financiero'];
					$updates .= "financiero='".$financiero."',";
				}
				if(isset($this->datosPeticion['extraordinario'])) {
					$extraordinario = $this->datosPeticion['extraordinario'];
					$updates .= "extraordinario='".$extraordinario."',";
				}

				$updates = substr($updates, 0, -1);

				if ($updates != '') {
					$query = $this->_conn->prepare("UPDATE tt_company_year set ".$updates." where id='".$id_fiscal_year."'");
					$query->execute();
				}
				$respuesta['status'] = 'ok';
				$this->mostrarRespuesta($respuesta, 200);
			}
			$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		}

		private function updateCompany() {
			if ($_SERVER['REQUEST_METHOD'] != "POST") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}

			if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
				return false;
			}
			if (isset($this->datosPeticion['company_name']) && isset($this->datosPeticion['id_company'])) {
				$company_name = html_entity_decode($this->datosPeticion['company_name']);
				$id_company = $this->datosPeticion['id_company'];
				$logo = $this->datosPeticion['logo'];
				$cif = $this->datosPeticion['CIF'];
				$address = $this->datosPeticion['address'];
				$address_bis = $this->datosPeticion['address_bis'];

				if (!empty($company_name)) {
					$query = $this->_conn->prepare("select * from tt_company where name='".$company_name."' and id!=".$id_company);
					$query->execute();
					$filasActualizadas = $query->rowCount();
					if($filasActualizadas === 0) {
						//consulta preparada ya hace mysqli_real_escape()
						$body =  " name='".$company_name."'";
						$body .= ($cif != '' ? ',CIF="'.$cif.'"': '');
						$body .= ($logo != '' ? ',logo="'.$logo.'"': '');
						$body .= ($address != '' ? ',address="'.$address.'"': '');
						$body .= ($address_bis != '' ? ',address_bis="'.$address_bis.'"': '');
						//consulta preparada ya hace mysqli_real_escape()
						$query = $this->_conn->prepare("UPDATE tt_company set ".$body." where id=".$id_company);

						$query->execute();
						$filasActualizadas = $query->rowCount();
						$insertId = $this->_conn->lastInsertId();

						if ($filasActualizadas == 1) {
							$query = $this->_conn->prepare("select * from tt_company where id=".$id_company);
							$query->execute();
							$filas = $query->fetch(PDO::FETCH_ASSOC);
							$respuesta['status'] = 'ok';
							$respuesta['company'] = $filas;
							$this->mostrarRespuesta($respuesta, 200);
						} else {
							$respuesta['status'] = 'no_updated';
							$this->mostrarRespuesta($respuesta, 200);
						}
					} else {
						$respuesta['status'] = 'error';
						$respuesta['msg'] = 'Ya existe una empresa con ese nombre.';
						$this->mostrarRespuesta($respuesta, 200);
					}
				}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(7), 200);
		}

		private function addFiscalYear() {
			if ($_SERVER['REQUEST_METHOD'] != "POST") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
				return false;
			}

			if (isset($this->datosPeticion['id_fiscal_year']) && isset($this->datosPeticion['id_company']) &&
					isset($this->datosPeticion['tax'])) {
				$id_company = $this->datosPeticion['id_company'];
				$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
				$tax = $this->datosPeticion['tax'];

				$query = $this->_conn->query("select id from tt_fiscal_year where year='".$id_fiscal_year."'");
				$filas = $query->fetch(PDO::FETCH_ASSOC);
				$id_year = $filas['id'];

				if (!empty($id_company) && !empty($id_fiscal_year) && is_numeric($tax)) {
					$query = $this->_conn->query("select * from tt_company_year where id_company=".$id_company." and id_fiscal_year=".$id_year);
					$filas = $query->fetchAll(PDO::FETCH_ASSOC);

					if(sizeof($filas) == 0) {
						//consulta preparada ya hace mysqli_real_escape()
						$query = $this->_conn->prepare("INSERT INTO tt_company_year(id_company,id_fiscal_year, tax) values('".$id_company."','".$id_year."', '".$tax."')");
						$query->execute();
						$filasActualizadas = $query->rowCount();
						$insertId = $this->_conn->lastInsertId();

						if ($filasActualizadas == 1) {
							$respuesta['status'] = 'ok';
							$respuesta['id'] = $insertId;
							$this->mostrarRespuesta($respuesta, 200);
						}
					} else {
						$respuesta['status'] = 'error';
						$respuesta['msg'] = 'Ya existe un ejercicio en esta empresa.';
						$this->mostrarRespuesta($respuesta, 200);
					}
				}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(6), 204);
		}

		private function updateFiscalYear() {
			if ($_SERVER['REQUEST_METHOD'] != "POST") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}
			if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
				return false;
			}

			if (isset($this->datosPeticion['id']) && isset($this->datosPeticion['year']) &&
					isset($this->datosPeticion['tax']) && isset($this->datosPeticion['id_company'])) {
				$id_company_year = $this->datosPeticion['id'];
				$id_company = $this->datosPeticion['id_company'];
				$year = $this->datosPeticion['year'];
				$tax = $this->datosPeticion['tax'];

				$query = $this->_conn->query("select id from tt_fiscal_year where year='".$year."'");
				$filas = $query->fetch(PDO::FETCH_ASSOC);
				$id_fiscal_year = $filas['id'];


				if (!empty($id_company_year) && !empty($id_fiscal_year) && is_numeric($tax)) {
					$query = $this->_conn->prepare("SELECT * FROM tt_company_year WHERE id_fiscal_year ='".$id_fiscal_year."'
								and id !='".$id_company_year."' and id_company='".$id_company."'");
					$query->execute();
					$filasActualizadas = $query->rowCount();
					if($filasActualizadas === 0) {
						//consulta preparada ya hace mysqli_real_escape()
						$query = $this->_conn->prepare("UPDATE tt_company_year set tax='".$tax."', id_fiscal_year='".$id_fiscal_year."' where id=".$id_company_year);
						$query->execute();
						$filasActualizadas = $query->rowCount();
						$insertId = $this->_conn->lastInsertId();
						if ($filasActualizadas == 1) {
							$respuesta['status'] = 'ok';
							$this->mostrarRespuesta($respuesta, 200);
						} else {
							$respuesta['status'] = 'error';
							$respuesta['msg'] = 'Ha habido un error al modificar el ejercicio.';
							$this->mostrarRespuesta($respuesta, 200);
						}
					} else {
						$respuesta['status'] = 'error';
						$respuesta['msg'] = 'Ya existe un ejercicio en esta empresa.';
						$this->mostrarRespuesta($respuesta, 200);
					}
				}
			}
			$this->mostrarRespuesta(HandleErrors::sendError(6), 204);
		}

		private function deleteFiscalYear() {
			$response = $this->operationApiSuperAdmin("DELETE FROM tt_company_year WHERE id=".$this->datosPeticion['id'], 'DELETE', false);
			if ( $response != false) {
				$jsonResponse['status'] = 'ok';
				$this->mostrarRespuesta($jsonResponse, 200);
			}
			else {
				$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
			}
		}

		private function deleteCompany() {
			$query = $this->_conn->prepare("select * from tt_campaign where id_company=".$this->datosPeticion['id']);
			$query->execute();
			$filasActualizadas = $query->rowCount();
			if ($filasActualizadas > 0) {
				$jsonResponse['status'] = 'error';
				$jsonResponse['msg'] = 'La empresa no se puede eliminar, tiene '.$filasActualizadas.' proyectos asignados.';
				$this->mostrarRespuesta($jsonResponse, 200);
			} else {
				$response = $this->operationApiSuperAdmin("DELETE FROM tt_company WHERE id=".$this->datosPeticion['id'], 'DELETE', false);
				if ( $response != false) {
					$response = $this->operationApiSuperAdmin("DELETE FROM tt_company_year WHERE id_company=".$this->datosPeticion['id'], 'DELETE', false);
					if($response != false) {
						$jsonResponse['status'] = 'ok';
						$this->mostrarRespuesta($jsonResponse, 200);
					}
					else {
						$this->mostrarRespuesta(HandleErrors::sendError(5), 204);
					}
				}
				else {
					$this->mostrarRespuesta(HandleErrors::sendError(5), 204);
				}
			}
		}


		private function getCompanies() {
			$response = $this->operationApi("SELECT * FROM tt_company", 'GET');
			if(count($response) == 0 ) {
				$jsonResponse['status'] = 'ok';
				$jsonResponse['items'] = [];
				$this->mostrarRespuesta($jsonResponse, 200);
			}
			else if ($response != false) {
				$jsonResponse['status'] = 'ok';
				$jsonResponse['items'] = [];
				foreach($response as $row) {
					$tmp['company']['id'] = $row['id'];
					$tmp['company']['name'] = $row['name'];
					$tmp['company']['address'] = $row['address'];
					$tmp['company']['address_bis'] = $row['address_bis'];
					$tmp['company']['cif'] = $row['CIF'];
					$tmp['company']['logo'] = $row['logo'];
					$tmp['company']['phone'] = $row['phone'];
					$tmp['company']['credits'] = $row['credits'];
					$tmp['company']['rgpd'] = $row['rgpd'];					
					$tmp['company']['removable'] = $row['removable'];
					$query = $this->_conn->query("
						select com_year.id AS id, fiscal.year, com_year.id_company, com_year.tax, com_year.id_fiscal_year from tt_company_year com_year
						inner join tt_fiscal_year fiscal
						on com_year.id_fiscal_year=fiscal.id and com_year.id_company='".$row['id']."' order by fiscal.id DESC");
					$filas = $query->fetchAll(PDO::FETCH_ASSOC);
					$tmp['company']['years'] = $filas;
					$tmp['company']['edit'] = false;
					$tmp['company']['editYear'] = false;
					$tmp['company']['new'] = false;
					$tmp['company']['visible'] = true; // para que cuando se pulse en editar de una compañia, este campo se pone a false en el resto, para no mostrar los botones de editar
					array_push($jsonResponse['items'], $tmp);
				}

				$this->mostrarRespuesta($jsonResponse, 200);
			}
			else {
				$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
			}
		}
		private function getFiscalYears() {
			$response = $this->operationApiSuperAdmin("SELECT id, year as label, year as value FROM tt_fiscal_year", 'GET');
			if ($response != false) {
				$jsonResponse['status'] = 'ok';
				$jsonResponse['items'] = $response;
				$this->mostrarRespuesta($jsonResponse, 200);
			}
			else {
				$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
			}
		}

		private function resetValuesFixedVariables() {
			if ($_SERVER['REQUEST_METHOD'] != "PUT") {
				$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
			}

			if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
				return false;
			}
			if (isset($this->datosPeticion['id_company'],$this->datosPeticion['id_fiscal_year'], $this->datosPeticion['ids_projects'])) {
				$ids_projects = $this->datosPeticion['ids_projects'];
				$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
				$id_company = $this->datosPeticion['id_company'];
				$ids = explode(',',$ids_projects);

				foreach($ids as $row) {
					$query = $this->_conn->prepare("DELETE FROM tt_budget_expenses where id_campaign='".$row."' and type=1");
					$query->execute();
				}
				$response = $this->operationApiSuperAdmin("DELETE FROM tt_expenses_fixed_concept where id_company='".$id_company."' and id_fiscal_year='".$id_fiscal_year."' and type=1", 'PUT', false);

				if ($response != false) {
						$respuesta['status'] = 'ok';
						$this->mostrarRespuesta($respuesta, 200);
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'No se han podido eliminar los valores anteriores de ERP';
					$this->mostrarRespuesta($respuesta, 200);
				}
			} else {
				$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
			}
		}


	/*** END SETTING **/

	/*** GROUPS  ***/
	private function getGroups() {
		if (isset($this->datosPeticion['id_company']) ) {
			$id_company = $this->datosPeticion['id_company'];
			$response = $this->operationApiSuperAdmin("SELECT grupo.id, grupo.name as group_name, customer.id as id_customer, customer.customer_name FROM tt_group grupo inner join tt_customer customer on grupo.id_customer=customer.id where grupo.id_company='".$id_company."' order by grupo.name ASC", 'GET');
			if ( $response != false) {
				$jsonResponse['status'] = 'ok';
				$jsonResponse['items'] = $response;
				$this->mostrarRespuesta($jsonResponse, 200);
			}
			else {
				$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
			}
		} else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}

	private function addGroup() {
		if ($_SERVER['REQUEST_METHOD'] != "POST") {
			$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
		}

		if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
			return false;
		}
		if (isset($this->datosPeticion['group_name'],$this->datosPeticion['id_company'],$this->datosPeticion['id_customer'])) {
			$group_name = html_entity_decode($this->datosPeticion['group_name']);
			$id_company = $this->datosPeticion['id_company'];
			$id_customer = $this->datosPeticion['id_customer'];
			if (!empty($group_name) && !empty($id_company) && !empty($id_customer)) {
				$query = $this->_conn->prepare("select * from tt_group where name='".$group_name."' and id_customer='".$id_customer."'");
				$query->execute();
				$filasActualizadas = $query->rowCount();
				if($filasActualizadas === 0) {
					//consulta preparada ya hace mysqli_real_escape()
					$query = $this->_conn->prepare("INSERT INTO tt_group(name, id_company, id_customer)values(:group_name, :id_company, :id_customer)");
					$query->bindValue(":group_name", $group_name);
					$query->bindValue(":id_company", $id_company);
					$query->bindValue(":id_customer", $id_customer);

					$query->execute();
					$filasActualizadas = $query->rowCount();
					$insertId = $this->_conn->lastInsertId();
					if ($filasActualizadas == 1) {
						$stmt = $this->_conn->query('SELECT grupo.id, grupo.name as group_name, customer.id as id_customer,customer.customer_name FROM tt_group grupo inner join tt_customer customer on grupo.id_customer=customer.id where grupo.id='.$insertId);
						$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
						if(sizeof($results) > 0) {
							$respuesta['status'] = 'ok';
							$respuesta['items'] = $results;
							$this->mostrarRespuesta($respuesta, 200);
						}
					}
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'Ya existe un grupo con ese nombre y cliente.';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
		}
		$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
	}

	private function deleteGroup() {
		$query = $this->_conn->prepare("select * from tt_campaign where id_group=".$this->datosPeticion['id']);
		$query->execute();
		$filasActualizadas = $query->rowCount();
		if ($filasActualizadas > 0) {
			$jsonResponse['status'] = 'error';
			$jsonResponse['msg'] = 'El grupo no se puede eliminar, tiene '.$filasActualizadas.' proyectos asignados.';
			$this->mostrarRespuesta($jsonResponse, 200);
		} else {
			$response = $this->operationApiSuperAdmin("DELETE FROM tt_group WHERE id=".$this->datosPeticion['id'], 'DELETE', false);
			if ( $response != false) {
				$jsonResponse['status'] = 'ok';
				$this->mostrarRespuesta($jsonResponse, 200);
			}
			else {
				$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
			}
		}
	}

	private function updateGroup() {
		if ($_SERVER['REQUEST_METHOD'] != "PUT") {
			$this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}

		if (isset($this->datosPeticion['id'],$this->datosPeticion['group_name'], $this->datosPeticion['id_customer'], $this->datosPeticion['id_company'])) {
			$group_name = html_entity_decode($this->datosPeticion['group_name']);
			$id = (int) $this->datosPeticion['id'];
			$id_company = (int) $this->datosPeticion['id_company'];
			$id_customer = (int) $this->datosPeticion['id_customer'];

			if (!empty($group_name) and !empty($id) and !empty($id_customer)) {
				$query = $this->_conn->prepare("select name from tt_group where name=:group_name and id!=:id and id_customer=:id_customer and id_company=:id_company");
				$query->bindValue(":group_name", $group_name);
				$query->bindValue(":id_company", $id_company);
				$query->bindValue(":id_customer", $id_customer);
				$query->bindValue(":id", $id);

				$query->execute();
				$filas = $query->rowCount();
				if($filas === 0) {
					$query = $this->_conn->prepare("update tt_group
						set name=:group_name,id_customer=:id_customer WHERE id =:id");
					$query->bindValue(":group_name", $group_name);
					$query->bindValue(":id", $id);
					$query->bindValue(":id_customer", $id_customer);
					$query->execute();
					$filasActualizadas = $query->rowCount();
					if ($filasActualizadas == 1) {
						$query = $this->_conn->query("SELECT grupo.id, grupo.name as group_name, customer.id as id_customer,customer.customer_name FROM tt_group grupo inner join tt_customer customer on grupo.id_customer=customer.id where grupo.id='".$id."'");
						$fila = $query->fetchAll(PDO::FETCH_ASSOC);
						$resp = array('status' => "ok", "msg" => "Grupo actualizado correctamente.", "item" => $fila);
						$this->mostrarRespuesta($resp, 200);
					} else {
						$query = $this->_conn->query("SELECT grupo.id, grupo.name as group_name, customer.id as id_customer,customer.customer_name FROM tt_group grupo inner join tt_customer customer on grupo.id_customer=customer.id where grupo.id_company='".$id_company."'");
						$filas = $query->fetchAll(PDO::FETCH_ASSOC);

						$resp = array('status' => "error", "msg" => "El Grupo no se ha actualizado correctamente.", "items" => $filas);
						$this->mostrarRespuesta($resp, 200);
					}
				} else {
					$query = $this->_conn->query("SELECT grupo.id, grupo.name as group_name, customer.id as id_customer,customer.customer_name FROM tt_group grupo inner join tt_customer customer on grupo.id_customer=customer.id where grupo.id_company='".$id_company."'");
					$filas = $query->fetchAll(PDO::FETCH_ASSOC);

					$resp = array('status' => "error", "msg" => "Ya hay un grupo con el mismo nombre", "items" => $filas);
					$this->mostrarRespuesta($resp, 200);
				}

			}
		}
		$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
	}

	/*** END GROUPS  ***/


	/*** SUBGROUPS  ***/
	private function getSubgroups() {
		if (isset($this->datosPeticion['id_company']) ) {
			$id_company = $this->datosPeticion['id_company'];
			$response = $this->operationApiSuperAdmin("SELECT subgrupo.id, subgrupo.name as subgroup_name, grupo.id as id_group, grupo.name as group_name FROM tt_subgroup subgrupo inner join tt_group grupo on subgrupo.id_group=grupo.id where subgrupo.id_company='".$id_company."' order by subgrupo.name ASC", 'GET');
			if ( $response != false) {
				$jsonResponse['status'] = 'ok';
				$jsonResponse['items'] = $response;
				$this->mostrarRespuesta($jsonResponse, 200);
			}
			else {
				$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
			}
		} else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}
	private function addSubconceptStandard() {
		if ($_SERVER['REQUEST_METHOD'] != "POST") {
			$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
		}

		if(!$this->isValidUserToken($this->datosPeticion['token'])) {
			return false;
		}

		if (isset($this->datosPeticion['description'],$this->datosPeticion['id_company'],$this->datosPeticion['code'])) {
			$code = $this->datosPeticion['code'];
			$subconcept_name = html_entity_decode($this->datosPeticion['description']);
			$unit_price = $this->datosPeticion['unit_price'];
			$unitsperitem = $this->datosPeticion['unitsperitem'];
			$id_family = $this->datosPeticion['id_family'];
			$envelope_type = $this->datosPeticion['envelope_type'];
			$id_company = $this->datosPeticion['id_company'];
			$bperishable = $this->datosPeticion['bperishable'];
			$bstockable = $this->datosPeticion['bstockable'];
			$brand = html_entity_decode($this->datosPeticion['brand']);
			$customer = $this->datosPeticion['customer'];
			$image = $this->datosPeticion['image'];
			$contact = html_entity_decode($this->datosPeticion['contact']);

			if ($id_company == 414){
				$ref_provider = $this->datosPeticion['ref_provider'];
				$descrip_provider = $this->datosPeticion['descrip_provider'];
				$tipo_torno = $this->datosPeticion['tipo_torno'];
			}else {
				$ref_provider = "";
				$descrip_provider = "";
				$tipo_torno = "";
			}



			if (!empty($subconcept_name) && !empty($id_company) && !empty($code)) {

				//tengo que ver si el código ya existe, en tal caso no dejo guardarlo

				$query = $this->_conn->prepare("select * from tt_subconcepts_standards where id_company='".$id_company."' and ( code='".$code."')");
				$filas = $query->execute();
				$filasActualizadas = $query->rowCount();

				if($filasActualizadas === 0) {


				//consulta preparada ya hace mysqli_real_escape()

				$query = $this->_conn->prepare("INSERT INTO tt_subconcepts_standards(description, code, id_company, unitsperitem,unit_price,id_family,envelope_type,bperishable,bstockable,brand,id_customer,contact,image,ref_provider,descrip_provider,tipo_torno)
				 values ('".$subconcept_name."','".$code."',".$id_company.",".$unitsperitem.",".$unit_price.",".$id_family.",".$envelope_type.",'".$bperishable."','".$bstockable."','".$brand."','".$customer."','".$contact."','".$image."','".$ref_provider."','".$descrip_provider."','".$tipo_torno."')");

				$query->execute();
				$filasActualizadas = $query->rowCount();

				$insertId = $this->_conn->lastInsertId();
				if ($filasActualizadas == 1) {

					$stmt = $this->_conn->query('SELECT art.id, art.code, art.description,
					art.unit_price, art.unitsperitem, art.envelope_type, env.name as envelope, 
					art.id_family, fam.familyname, art.brand, art.bperishable,
					case when art.bperishable = 1 then "Sí" else "No" end as perishable,
					art.bstockable,
					case when art.bstockable = 1 then "Sí" else "No" end as stockable,
					art.id_customer, customer_name, contact, art.image, art.ref_provider, art.descrip_provider, art.tipo_torno
					FROM gesad.tt_subconcepts_standards art
					left join tt_articles_envelopes env
					on env.id = art.envelope_type
					left join tt_articles_families fam
					on fam.id = art.id_family
					left join tt_customer cum
					on cum.id = art.id_customer
					where art.id='.$insertId);

					$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
					if(sizeof($results) > 0) {
						$respuesta['status'] = 'ok';
						$respuesta['items'] = $results;
						$this->mostrarRespuesta($respuesta, 200);
						}
					}
				}else{
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'Ya existe un artículo con el código '.$code;
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
		}
		$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
	}


	private function addSubgroup() {
		if ($_SERVER['REQUEST_METHOD'] != "POST") {
			$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
		}

		if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
			return false;
		}

		if (isset($this->datosPeticion['subgroup_name'],$this->datosPeticion['id_company'],$this->datosPeticion['id_group'])) {
			$subgroup_name = html_entity_decode($this->datosPeticion['subgroup_name']);
			$id_company = $this->datosPeticion['id_company'];
			$id_group = $this->datosPeticion['id_group'];

			if (!empty($subgroup_name) && !empty($id_company) && !empty($id_group)) {

				$query = $this->_conn->prepare("select * from tt_subgroup where name='".$subgroup_name."' and id_group='".$id_group."'");
				$query->execute();
				$filasActualizadas = $query->rowCount();

				if($filasActualizadas === 0) {
					//consulta preparada ya hace mysqli_real_escape()

					$query = $this->_conn->prepare("INSERT INTO tt_subgroup(name, id_company, id_group)values(:subgroup_name, :id_company, :id_group)");
					$query->bindValue(":subgroup_name", $subgroup_name);
					$query->bindValue(":id_company", $id_company);
					$query->bindValue(":id_group", $id_group);

					$query->execute();
					$filasActualizadas = $query->rowCount();

					$insertId = $this->_conn->lastInsertId();
					if ($filasActualizadas == 1) {
						$stmt = $this->_conn->query('SELECT subgrupo.id, subgrupo.name as subgroup_name, grupo.id as id_group, grupo.name as group_name FROM tt_subgroup subgrupo inner join tt_group grupo on subgrupo.id_group=grupo.id where subgrupo.id='.$insertId);
						$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
						if(sizeof($results) > 0) {
							$respuesta['status'] = 'ok';
							$respuesta['items'] = $results;
							$this->mostrarRespuesta($respuesta, 200);
						}
					}
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'Ya existe un subgrupo con ese nombre y grupo.';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
		}
		$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
	}

	private function deleteSubconceptStandard() {
		$response = $this->operationApi("DELETE FROM tt_subconcepts_standards WHERE id=".$this->datosPeticion['id'], 'DELETE', false);
		if ( $response != false) {
			$jsonResponse['status'] = 'ok';
			$this->mostrarRespuesta($jsonResponse, 200);
		}
		else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}

	}

	private function deleteSubgroup() {
		$query = $this->_conn->prepare("select * from tt_campaign where id_subgroup=".$this->datosPeticion['id']);
		$query->execute();
		$filasActualizadas = $query->rowCount();
		if ($filasActualizadas > 0) {
			$jsonResponse['status'] = 'error';
			$jsonResponse['msg'] = 'El subgrupo no se puede eliminar, tiene '.$filasActualizadas.' proyectos asignados.';
			$this->mostrarRespuesta($jsonResponse, 200);
		} else {
			$response = $this->operationApiSuperAdmin("DELETE FROM tt_subgroup WHERE id=".$this->datosPeticion['id'], 'DELETE', false);
			if ( $response != false) {
				$jsonResponse['status'] = 'ok';
				$this->mostrarRespuesta($jsonResponse, 200);
			}
			else {
				$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
			}
		}
	}

	private function updateSubgroup() {
		if ($_SERVER['REQUEST_METHOD'] != "PUT") {
			$this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}

		if (isset($this->datosPeticion['id'],$this->datosPeticion['subgroup_name'], $this->datosPeticion['id_group'], $this->datosPeticion['id_company'])) {
			$subgroup_name = html_entity_decode($this->datosPeticion['subgroup_name']);
			$id = (int) $this->datosPeticion['id'];
			$id_company = (int) $this->datosPeticion['id_company'];
			$id_group = (int) $this->datosPeticion['id_group'];

			if (!empty($subgroup_name) and !empty($id) and !empty($id_group)) {
				$query = $this->_conn->prepare("select name from tt_subgroup where name=:subgroup_name and id!=:id and id_group=:id_group and id_company=:id_company");
				$query->bindValue(":subgroup_name", $subgroup_name);
				$query->bindValue(":id_company", $id_company);
				$query->bindValue(":id_group", $id_group);
				$query->bindValue(":id", $id);

				$query->execute();
				$filas = $query->rowCount();
				if($filas === 0) {
					$query = $this->_conn->prepare("update tt_subgroup
						set name=:subgroup_name,id_group=:id_group WHERE id =:id");
					$query->bindValue(":subgroup_name", $subgroup_name);
					$query->bindValue(":id", $id);
					$query->bindValue(":id_group", $id_group);
					$query->execute();
					$filasActualizadas = $query->rowCount();
					if ($filasActualizadas == 1) {
						$query = $this->_conn->query("SELECT subgrupo.id, subgrupo.name as subgroup_name, grupo.id as id_group, grupo.name as group_name FROM tt_subgroup subgrupo inner join tt_group grupo on subgrupo.id_group=grupo.id where subgrupo.id='".$id."'");
						$fila = $query->fetchAll(PDO::FETCH_ASSOC);
						$resp = array('status' => "ok", "msg" => "Subgrupo actualizado correctamente.", "item" => $fila);
						$this->mostrarRespuesta($resp, 200);
					} else {
						$query = $this->_conn->query("SELECT subgrupo.id, subgrupo.name as subgroup_name, grupo.id as id_group, grupo.name as group_name FROM tt_subgroup subgrupo inner join tt_group grupo on subgrupo.id_group=grupo.id where subgrupo.id_company='".$id_company."'");
						$filas = $query->fetchAll(PDO::FETCH_ASSOC);

						$resp = array('status' => "error", "msg" => "El Subgrupo no se ha actualizado correctamente.", "items" => $filas);
						$this->mostrarRespuesta($resp, 200);
					}
				} else {
					$query = $this->_conn->query("SELECT subgrupo.id, subgrupo.name as subgroup_name, grupo.id as id_group, grupo.name as group_name FROM tt_subgroup subgrupo inner join tt_group grupo on subgrupo.id_group=grupo.id where subgrupo.id_company='".$id_company."'");
					$filas = $query->fetchAll(PDO::FETCH_ASSOC);

					$resp = array('status' => "error", "msg" => "Ya hay un subgrupo con el mismo nombre", "items" => $filas);
					$this->mostrarRespuesta($resp, 200);
				}

			}
		}
		$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
	}

	/*** END SUBGROUPS  ***/

	/*** TEAMS  ***/
	private function getTeams() {
		if (isset($this->datosPeticion['id_company']) ) {
			$id_company = $this->datosPeticion['id_company'];
			$response = $this->operationApiSuperAdmin("SELECT id, team_name FROM tt_team where id_company='".$id_company."' order by team_name ASC", 'GET');
			if ( $response != false) {
				$jsonResponse['status'] = 'ok';
				$jsonResponse['items'] = $response;
				$this->mostrarRespuesta($jsonResponse, 200);
			}
			else {
				$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
			}
		} else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}

	private function addTeam() {
		if ($_SERVER['REQUEST_METHOD'] != "POST") {
			$this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}

		if (isset($this->datosPeticion['team_name']) && isset($this->datosPeticion['id_company'])) {
			$query = $this->_conn->prepare("select * from tt_team where team_name='".$this->datosPeticion['team_name']."' and id_company='".$this->datosPeticion['id_company']."'");
			$query->execute();
			$filasActualizadas = $query->rowCount();

			if($filasActualizadas == 0) {
				$team_name = html_entity_decode($this->datosPeticion['team_name']);
				$id_company = $this->datosPeticion['id_company'];
				if (!empty($team_name) && !empty($id_company)) {
					//consulta preparada ya hace mysqli_real_escape()
					$query = $this->_conn->prepare("INSERT INTO tt_team(team_name, id_company)values(:team_name, :id_company)");
					$query->bindValue(":team_name", $team_name);
					$query->bindValue(":id_company", $id_company);

					$query->execute();
					$filasActualizadas = $query->rowCount();
					$insertId = $this->_conn->lastInsertId();
					if ($filasActualizadas == 1) {
						$stmt = $this->_conn->query('SELECT * FROM tt_team where id='.$insertId.' order by team_name ASC');
						$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
						if(sizeof($results) > 0) {
							$respuesta['status'] = 'ok';
							$respuesta['items'] = $results;
							$this->mostrarRespuesta($respuesta, 200);
						}
					}
				}
			} else {
				$respuesta['status'] = 'error';
				$respuesta['msg'] = 'Ya hay un equipo con el mismo nombre';
				$this->mostrarRespuesta($respuesta, 200);
			}


		}
		$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
	}

	private function deleteTeam() {
		$query = $this->_conn->prepare("select * from tt_campaign where id_team=".$this->datosPeticion['id']);
		$query->execute();
		$filasActualizadas = $query->rowCount();
		if ($filasActualizadas > 0) {
			$jsonResponse['status'] = 'error';
			$jsonResponse['msg'] = 'El equipo no se puede eliminar, tiene '.$filasActualizadas.' proyectos asignados.';
			$this->mostrarRespuesta($jsonResponse, 200);
		} else {
			$response = $this->operationApiSuperAdmin("DELETE FROM tt_team WHERE id=".$this->datosPeticion['id'], 'DELETE', false);
			if ( $response != false) {
				$jsonResponse['status'] = 'ok';
				$this->mostrarRespuesta($jsonResponse, 200);
			}
			else {
				$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
			}
		}
	}

	private function updateTeam() {
		if ($_SERVER['REQUEST_METHOD'] != "PUT") {
			$this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}

		if (isset($this->datosPeticion['id'],$this->datosPeticion['team_name'], $this->datosPeticion['id_company'])) {
			$team = html_entity_decode($this->datosPeticion['team_name']);
			$id = (int) $this->datosPeticion['id'];
			$id_company = (int) $this->datosPeticion['id_company'];

			if (!empty($team) and !empty($id)) {
				$query = $this->_conn->prepare("select team_name from tt_team where team_name=:team_name and id!=:id");
				$query->bindValue(":team_name", $team);
				$query->bindValue(":id", $id);

				$query->execute();
				$filas = $query->rowCount();
				if($filas === 0) {
					$query = $this->_conn->prepare("update tt_team
						set team_name=:team_name WHERE id =:id");
					$query->bindValue(":team_name", $team);
					$query->bindValue(":id", $id);
					$query->execute();
					$filasActualizadas = $query->rowCount();
					if ($filasActualizadas == 1) {
						$resp = array('status' => "ok", "msg" => "Equipo actualizado correctamente.");
						$this->mostrarRespuesta($resp, 200);
					} else {
						$query = $this->_conn->query("SELECT id, team_name FROM tt_team where id_company='".$id_company."'");
						$filas = $query->fetchAll(PDO::FETCH_ASSOC);

						$resp = array('status' => "error", "msg" => "El Equipo no se ha actualizado correctamente.", "items" => $filas);
						$this->mostrarRespuesta($resp, 200);
					}
				} else {
					$query = $this->_conn->query("SELECT id, team_name FROM tt_team where id_company='".$id_company."'");
					$filas = $query->fetchAll(PDO::FETCH_ASSOC);

					$resp = array('status' => "error", "msg" => "Ya hay un equipo con el mismo nombre", "items" => $filas);
					$this->mostrarRespuesta($resp, 200);
				}

			}
		}
		$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
	}

	/*** END TEAMS  ***/


	/*** USERS  ***/
	private function getUsers() {
		if (isset($this->datosPeticion['id_company']) ) {
			$id_company = $this->datosPeticion['id_company'];
			$response = $this->operationApiSuperAdmin("SELECT user.id, role.id as id_role, team.id as id_team, user.nickname, user.email,user.password,user.status,user.id_company, team.team_name, role.role FROM tt_user user inner join tt_team team on user.id_team=team.id inner join tt_role role on user.id_role=role.id where user.id_company='".$id_company."' order by user.nickname ASC", 'GET');
			if ( $response != false) {
				$jsonResponse['status'] = 'ok';
				$jsonResponse['items'] = $response;
				$this->mostrarRespuesta($jsonResponse, 200);
			}
			else {
				$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
			}
		} else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}

	private function addUsers() {
		if ($_SERVER['REQUEST_METHOD'] != "POST") {
			$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
		}

		if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
			return false;
		}
		if (isset($this->datosPeticion['id_company'], $this->datosPeticion['nickname'], $this->datosPeticion['email'],
				$this->datosPeticion['password'], $this->datosPeticion['id_role'], $this->datosPeticion['id_team'])) {

			$nickname = html_entity_decode($this->datosPeticion['nickname']);
			$id_company = $this->datosPeticion['id_company'];
			$email = html_entity_decode($this->datosPeticion['email']);
			$password = $this->datosPeticion['password'];
			$id_role = $this->datosPeticion['id_role'];
			$id_team = $this->datosPeticion['id_team'];

			if (!empty($nickname) && !empty($id_company) && !empty($email) && !empty($password) && !empty($id_role) && !empty($id_team)) {
				$query = $this->_conn->prepare("select * from tt_user where email='".$email."' and id_company='".$id_company."'");
				$query->execute();
				$filasActualizadas = $query->rowCount();
				if($filasActualizadas === 0) {
					//consulta preparada ya hace mysqli_real_escape()

					$query = $this->_conn->prepare("INSERT INTO tt_user(nickname, email, password, id_role, status, id_company, id_team) values ('".$nickname."','".$email."','".$password."',".$id_role.",1,".$id_company.",".$id_team.")");

/*  					$query = $this->_conn->prepare("INSERT INTO tt_user(nickname, email, password, id_role, status, id_company, id_team)values
					(:nickname, :email, :password, :id_role, 1, :id_company, :id_team)");
					$query->bindValue(":nickname", $nickname);
					$query->bindValue(":email", $email);
					$query->bindValue(":password", $password);
					$query->bindValue(":id_role", $id_role);
					$query->bindValue(":id_company", $id_company);
					$query->bindValue(":id_team", $id_team); */

					$mess = $query;
					$query->execute();
					

					$filasActualizadas = $query->rowCount();
					$insertId = $this->_conn->lastInsertId();
					$query = $this->_conn->query("SELECT * FROM tt_user user inner join tt_team team on user.id_team=team.id inner join tt_role role on user.id_role=role.id where user.id='".$insertId."'");
					$filas = $query->fetchAll(PDO::FETCH_ASSOC);

					if ($filasActualizadas == 1) {
						$respuesta['status'] = 'ok';
						$respuesta['item'] = $filas;
						$respuesta['mess'] = $mess;
						$this->mostrarRespuesta($respuesta, 200);
					}
				} else {
					$respuesta['status'] = 'error';
					$respuesta['mess'] = $mess;
					$respuesta['msg'] = 'Ya existe una usuario con ese email.';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
		}
		$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
	}

	private function deleteUser() {
		$query = $this->_conn->prepare("select * from tt_campaign where id_user=".$this->datosPeticion['id']);
		$query->execute();
		$filasActualizadas = $query->rowCount();
		if ($filasActualizadas > 0) {
			$jsonResponse['status'] = 'error';
			$jsonResponse['msg'] = 'El usuario no se puede eliminar, tiene '.$filasActualizadas.' proyectos asignados.';
			$this->mostrarRespuesta($jsonResponse, 200);
		} else {
			$response = $this->operationApiSuperAdmin("DELETE FROM tt_user WHERE id=".$this->datosPeticion['id'], 'DELETE', false);
			if ( $response != false) {
				$jsonResponse['status'] = 'ok';
				$this->mostrarRespuesta($jsonResponse, 200);
			}
			else {
				$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
			}
		}
	}

	private function getRolesTeams() {
		if ($_SERVER['REQUEST_METHOD'] != "GET") {
			$this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}

		if (isset($this->datosPeticion['id_company'])) {
			$id_company = $this->datosPeticion['id_company'];

			if (!empty($id_company)) {
				$query = $this->_conn->query("SELECT * FROM tt_role where visibility=1 order by id ASC");
				$filas = $query->fetchAll(PDO::FETCH_ASSOC);

				$respuesta['roles'] = $filas;

				$query = $this->_conn->query("SELECT * FROM tt_team where id_company='".$id_company."' order by team_name ASC");
				$filas = $query->fetchAll(PDO::FETCH_ASSOC);

				$respuesta['teams'] = $filas;
				$respuesta['status'] = 'ok';
				$this->mostrarRespuesta($respuesta, 200);
			}
		}
		$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
	}

	private function updateUser() {
		if ($_SERVER['REQUEST_METHOD'] != "PUT") {
			$this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}

		if (isset($this->datosPeticion['id_company'],$this->datosPeticion['id'], $this->datosPeticion['nickname'], $this->datosPeticion['email'],
				$this->datosPeticion['password'], $this->datosPeticion['id_role'], $this->datosPeticion['id_team'])) {
			$id = $this->datosPeticion['id'];
			$nickname = html_entity_decode($this->datosPeticion['nickname']);
			$id_company = $this->datosPeticion['id_company'];
			$email = html_entity_decode($this->datosPeticion['email']);
			$password = $this->datosPeticion['password'];
			$id_role = $this->datosPeticion['id_role'];
			$id_team = $this->datosPeticion['id_team'];

			if (!empty($nickname) && !empty($id) && !empty($id_company) && !empty($email) && !empty($password) && !empty($id_role) && !empty($id_team)) {
				$query = $this->_conn->prepare("select id from tt_user where id!=".$id." and email='".$email."'");

				$query->execute();
				$filas = $query->rowCount();
				if($filas === 0) {
					$query = $this->_conn->prepare("update tt_user
						set nickname=:nickname,email=:email, password=:password,id_role=:id_role,id_team=:id_team, id_company=:id_company WHERE id =:id");
					$query->bindValue(":nickname", $nickname);
					$query->bindValue(":email", $email);
					$query->bindValue(":password", $password);
					$query->bindValue(":id_role", $id_role);
					$query->bindValue(":id_company", $id_company);
					$query->bindValue(":id_team", $id_team);
					$query->bindValue(":id", $id);
					$query->execute();
					$filasActualizadas = $query->rowCount();
					if ($filasActualizadas == 1) {
						$query = $this->_conn->query("SELECT user.id, role.id as id_role, team.id as id_team, user.nickname, user.email,user.password,user.status,user.id_company, team.team_name, role.role FROM tt_user user inner join tt_team team on user.id_team=team.id inner join tt_role role on user.id_role=role.id where user.id='".$id."'");
						$fila = $query->fetchAll(PDO::FETCH_ASSOC);

						$resp = array('status' => "ok", "msg" => "Usuario actualizado correctamente.", "item" => $fila);
						$this->mostrarRespuesta($resp, 200);
					} else {
						$query = $this->_conn->query("SELECT * FROM tt_user where id='".$id."'");
						$filas = $query->fetchAll(PDO::FETCH_ASSOC);

						$resp = array('status' => "error", "msg" => "Ya hay un usuario con el mismo nombre", "items" => $filas);
						$this->mostrarRespuesta($resp, 200);
					}
				} else {
					$query = $this->_conn->query("SELECT * FROM tt_user where id='".$id."'");
					$filas = $query->fetchAll(PDO::FETCH_ASSOC);

					$resp = array('status' => "error", "msg" => "Ya hay un usuario con el mismo nombre", "items" => $filas);
					$this->mostrarRespuesta($resp, 200);
				}

			}
		}
		$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
	}

	/*** END USERS  ***/

	/*** CUSTOMER PRICES  ***/
	
	private function addCustomerPrice() {
		if ($_SERVER['REQUEST_METHOD'] != "POST") {
			$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
		}


		if (isset($this->datosPeticion['id_company'], $this->datosPeticion['id_customer'], $this->datosPeticion['id_article'],
				$this->datosPeticion['price'])) {

			$id_company = $this->datosPeticion['id_company'];
			$id_customer = $this->datosPeticion['id_customer'];
			$id_article = $this->datosPeticion['id_article'];
			$price = $this->datosPeticion['price'];

			if (!empty($id_company) && !empty($id_customer) && !empty($id_article) && !empty($price)) {
				$query = $this->_conn->prepare("select * from tt_subconcepts_std_vs_client where id_subconcept='".$id_article."' and id_customer='".$id_customer."' and id_company='".$id_company."'");
				$query->execute();
				$filasActualizadas = $query->rowCount();
				if($filasActualizadas === 0) {
					//consulta preparada ya hace mysqli_real_escape()

					$query = $this->_conn->prepare("INSERT INTO tt_subconcepts_std_vs_client(id_subconcept,id_customer,id_company,unit_price) values ('".$id_article."','".$id_customer."','".$id_company."','".$price."')");

					$mess = $query;
					$query->execute();				

					$filasActualizadas = $query->rowCount();
					$insertId = $this->_conn->lastInsertId();

					if ($filasActualizadas == 1) {
						$respuesta['status'] = 'ok';
						$respuesta['mess'] = $mess;
						$this->mostrarRespuesta($respuesta, 200);
					}
				} else {
					$respuesta['status'] = 'error';
					$respuesta['mess'] = $mess;
					$respuesta['msg'] = 'Ya existe una usuario con ese email.';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
		}
		$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
	}


	private function deleteCustomerPrice() {

		if ($_SERVER['REQUEST_METHOD'] != "POST") {
			$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
		}

		if (isset($this->datosPeticion['id'])) {
			$id = $this->datosPeticion['id'];

			if (!empty($id)) {
				$query = $this->_conn->prepare("DELETE FROM tt_subconcepts_std_vs_client where id='".$id."'");

				$query->execute();

				$filasActualizadas = $query->rowCount();

				if ($filasActualizadas == 1) {
					$respuesta['status'] = 'ok';
					$respuesta['msg'] = 'El precio ha sido eliminado.';
					$this->mostrarRespuesta($respuesta, 200);
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'Ha habido un error al eliminar el precio.';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
		}
		$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
		
	}

	private function getCustomerPrices() {


		if (isset($this->datosPeticion['id_company'], $this->datosPeticion['id_article']) ) {
			$id_company = $this->datosPeticion['id_company'];
			$id_article = $this->datosPeticion['id_article'];

			$response = $this->operationApi("SELECT * from `tt_subconcepts_std_vs_client` where id_company='".$id_company."' and id_subconcept='".$id_article."'   order by id ASC", 'GET');


			if ( $response != false) {
				$jsonResponse['status'] = 'ok';
				$jsonResponse['items'] = $response;
				$this->mostrarRespuesta($jsonResponse, 200);
			}
			else {
				$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
			}
		} else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}

	private function updateCustomerPrice() {
		if ($_SERVER['REQUEST_METHOD'] != "PUT") {
			$this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}

		
		if (isset($this->datosPeticion['id'], $this->datosPeticion['id_customer'], $this->datosPeticion['price'], $this->datosPeticion['id_article'])) {

			$id = $this->datosPeticion['id'];
			$unit_price = $this->datosPeticion['price'];
			$id_customer = $this->datosPeticion['id_customer'];
			$id_subconcept = $this->datosPeticion['id_article'];


			if (!empty($id) && !empty($unit_price) && !empty($id_customer) && !empty($id_subconcept)) {
				$query = $this->_conn->prepare("select id from tt_subconcepts_std_vs_client where id!=".$id." and id_customer ='".$id_customer." id_subconcept='".$id_subconcept."'");

				$query->execute();
				$filas = $query->rowCount();
				if($filas === 0) {
					$query = $this->_conn->prepare("update tt_subconcepts_std_vs_client
						set unit_price=:unit_price,id_customer=:id_customer WHERE id =:id");
					$query->bindValue(":unit_price", $unit_price);
					$query->bindValue(":id_customer", $id_customer);
					$query->bindValue(":id", $id);
					$query->execute();
					$filasActualizadas = $query->rowCount();

					if ($filasActualizadas == 1) {
						$query = $this->_conn->query("SELECT * FROM tt_subconcepts_std_vs_client where id='".$id."'");
						$fila = $query->fetchAll(PDO::FETCH_ASSOC);

						$resp = array('status' => "ok", "msg" => "Precio actualizado correctamente.", "item" => $fila);
						$this->mostrarRespuesta($resp, 200);
					} else {
						$query = $this->_conn->query("SELECT * FROM tt_subconcepts_std_vs_client where id='".$id."'");
						$filas = $query->fetchAll(PDO::FETCH_ASSOC);

						$resp = array('status' => "error", "msg" => "Ya hay un precio para el mismo cliente", "items" => $filas);
						$this->mostrarRespuesta($resp, 200);
					}
				} else {
					$query = $this->_conn->query("SELECT * FROM tt_subconcepts_std_vs_client where id='".$id."'");
					$filas = $query->fetchAll(PDO::FETCH_ASSOC);

					$resp = array('status' => "error", "msg" => "Ya hay un precio para el mismo cliente", "items" => $filas);
					$this->mostrarRespuesta($resp, 200);
				}

			}
		}
		$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
	}

	/*** END CUSTOMER PRICES  ***/

	/*** FIXED CONCEPT  ***/
	private function getParentAccount() {
		if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
			return false;
		}

		if (isset($this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year']) ) {

			$id_company = $this->datosPeticion['id_company'];
			$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];

			$response = $this->operationApiSuperAdmin("SELECT * FROM tt_fixed_concept where id_company='".$id_company."' and id_fiscal_year='".$id_fiscal_year."' and (id_parent='' || id_parent='0') order by account_number ASC", 'GET');

			if ( $response != false || count($response)==0) {
				$jsonResponse['status'] = 'ok';
				$jsonResponse['items'] = $response;
				$this->mostrarRespuesta($jsonResponse, 200);
			}
			else {
				$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
			}
		} else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}
	private function getFixedConcept() {
		if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
			return false;
		}
		if (isset($this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year']) ) {
			$id_company = $this->datosPeticion['id_company'];
			$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
			$response = $this->operationApiSuperAdmin("SELECT id, name, account_number, id_company, id_fiscal_year, id_parent, case when id_parent = 0 then id else id_parent end as orden FROM tt_fixed_concept where id_company='".$id_company."' and id_fiscal_year='".$id_fiscal_year."' order by orden, id_parent, name ASC", 'GET');
			if ( $response != false) {
				$jsonResponse['status'] = 'ok';
				$jsonResponse['items'] = $response;
				$this->mostrarRespuesta($jsonResponse, 200);
			}
			else {
				$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
			}
		} else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}

	private function addFixedConcept() {
		if ($_SERVER['REQUEST_METHOD'] != "POST") {
			$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
		}

		if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
			return false;
		}

		if (isset($this->datosPeticion['fixed_concept_name'],$this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year'],$this->datosPeticion['account_number'])) {
			$fixed_concept_name = html_entity_decode($this->datosPeticion['fixed_concept_name']);
			$id_company = $this->datosPeticion['id_company'];
			$id_parent = $this->datosPeticion['id_parent'];
			$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
			$account_number = $this->datosPeticion['account_number'];
			if (!empty($fixed_concept_name) && !empty($id_company) && !empty($id_fiscal_year) && !empty($account_number)) {
				$query = $this->_conn->prepare("select * from tt_fixed_concept where name='".$fixed_concept_name."' and id_company='".$id_company."' and id_fiscal_year='".$id_fiscal_year."'");
				$query->execute();
				$filasActualizadas = $query->rowCount();
				if($filasActualizadas === 0) {
					//consulta preparada ya hace mysqli_real_escape()
					$query = $this->_conn->prepare("INSERT INTO tt_fixed_concept(name, account_number, id_company, id_fiscal_year, id_parent)values(:name, :account,:id_company,:id_fiscal_year, :id_parent)");
					$query->bindValue(":name", $fixed_concept_name);
					$query->bindValue(":account", $account_number);
					$query->bindValue(":id_company", $id_company);
					$query->bindValue(":id_fiscal_year", $id_fiscal_year);
					$query->bindValue(":id_parent", $id_parent);
					$query->execute();

					$filasActualizadas = $query->rowCount();
					$insertId = $this->_conn->lastInsertId();

					if ($filasActualizadas == 1) {
						$query = $this->_conn->query("SELECT * FROM tt_fixed_concept where id_company='".$id_company."' and id_fiscal_year='".$id_fiscal_year."' order by account_number ASC");
						$filas = $query->fetchAll(PDO::FETCH_ASSOC);
						$respuesta['status'] = 'ok';
						$respuesta['items'] = $filas;
						$this->mostrarRespuesta($respuesta, 200);
					}
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'Ya existe un concepto fijo con ese nombre en la empresa y ejercicio seleccionado.';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
		}
		$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
	}

	private function deleteFixedConcept() {
		$response = $this->operationApiSuperAdmin("DELETE FROM tt_fixed_concept WHERE id=".$this->datosPeticion['id'], 'DELETE', false);
		if ( $response != false) {
			$jsonResponse['status'] = 'ok';
			$this->mostrarRespuesta($jsonResponse, 200);
		}
		else {
			$jsonResponse['status'] = 'error';
			$jsonResponse['msg'] = 'No se ha podido eliminar el concepto fijo';
			$this->mostrarRespuesta($jsonResponse, 200);
		}
	}

	private function deleteParentFixedConcept() {
		if ($_SERVER['REQUEST_METHOD'] != "DELETE") {
			$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
		}

		if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
			return false;
		}

		if (isset($this->datosPeticion['id_parent'],$this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year'])) {
			$id_company = $this->datosPeticion['id_company'];
			$id_parent = $this->datosPeticion['id_parent'];
			$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
			$query = $this->_conn->prepare("select id_parent from tt_fixed_concept where id_parent='".$id_parent."' and id_company='".$id_company."' and id_fiscal_year='".$id_fiscal_year."'");
			$query->execute();
			$filasActualizadas = $query->rowCount();
			if($filasActualizadas === 0) {
				$response = $this->operationApiSuperAdmin("DELETE FROM tt_fixed_concept WHERE id=".$id_parent, 'DELETE', false);
				if ( $response != false) {
					$jsonResponse['status'] = 'ok';
					$this->mostrarRespuesta($jsonResponse, 200);
				}
				else {
					$jsonResponse['status'] = 'error';
					$jsonResponse['msg'] = 'Ha habido un error al eliminar el concepto';
					$this->mostrarRespuesta($jsonResponse, 200);
				}
			} else{
				$jsonResponse['status'] = 'error';
				$jsonResponse['msg'] = 'El concepto tiene hijos, no puede ser eliminado';
				$this->mostrarRespuesta($jsonResponse, 200);
			}
		}
		else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}

	}

	private function updateFixedConcept() {
		if ($_SERVER['REQUEST_METHOD'] != "PUT") {
			$this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}

		if (isset($this->datosPeticion['id'],$this->datosPeticion['account_number'], $this->datosPeticion['fixed_concept_name'], $this->datosPeticion['id_company'],
	 						$this->datosPeticion['id_fiscal_year'], $this->datosPeticion['id_parent'])) {

			$fixed_concept_name = html_entity_decode($this->datosPeticion['fixed_concept_name']);
			$id = (int) $this->datosPeticion['id'];
			$account_number = $this->datosPeticion['account_number'];
			$id_company = (int)$this->datosPeticion['id_company'];
			$id_fiscal_year = (int)$this->datosPeticion['id_fiscal_year'];
			$id_parent = (int)$this->datosPeticion['id_parent'];

			if (!empty($fixed_concept_name) and is_numeric($id) and !empty($account_number) and is_numeric($id_company) and is_numeric($id_fiscal_year) and is_numeric($id_parent)) {
				$query = $this->_conn->prepare("select * from tt_fixed_concept where (name='".$fixed_concept_name."' or account_number='".$account_number."') and id!=".$id." and id_company=".$id_company." and id_fiscal_year=".$id_fiscal_year);
				$query->execute();

				$filas = $query->rowCount();
				if($filas === 0) {
					$query = $this->_conn->prepare("update tt_fixed_concept set name='".$fixed_concept_name."', account_number='".$account_number."', id_parent=".$id_parent." WHERE id=".$id);
					$query->bindValue(":fixed_concept_name", $fixed_concept_name);
					$query->bindValue(":id", $id);
					$query->bindValue(":account_number", $account_number);
					$query->bindValue(":id_parent", $id_parent);
					$query->execute();
					$filasActualizadas = $query->rowCount();


					$query = $this->_conn->query("SELECT * FROM tt_fixed_concept where id_company='".$id_company."' and id_fiscal_year='".$id_fiscal_year."'");
					$filas = $query->fetchAll(PDO::FETCH_ASSOC);

					if ($filasActualizadas == 1) {
						$resp = array('status' => "ok", "msg" => "Concepto fijo actualizado correctamente.", "items" => $filas);
						$this->mostrarRespuesta($resp, 200);
					} else {
						$resp = array('status' => "error", "msg" => "El Concepto Fijo no se ha actualizado correctamente.", "items" => $filas);
						$this->mostrarRespuesta($resp, 200);
					}
				} else {
					$query = $this->_conn->query("SELECT * FROM tt_fixed_concept where id_company='".$id_company."' and id_fiscal_year='".$id_fiscal_year."'");
					$filas = $query->fetchAll(PDO::FETCH_ASSOC);

					$resp = array('status' => "error", "msg" => "Ya hay un concepto fijo con el mismo nombre/número de cuenta", "items" => $filas);
					$this->mostrarRespuesta($resp, 200);
				}
			}
		}
		$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
	}

	/*** END FIXED CONCEPT  ***/

	private function removeAddress() {
		if ($_SERVER['REQUEST_METHOD'] != "POST") {
			$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
		}

		if(!$this->isValidUserToken($this->datosPeticion['token'])) {
			return false;
		}
		if (isset($this->datosPeticion['id'])) {
			$id = $this->datosPeticion['id'];

			if (!empty($id)) {
				$query = $this->_conn->prepare("DELETE FROM tt_customer_address where id='".$id."'");

				$query->execute();

				$filasActualizadas = $query->rowCount();

				if ($filasActualizadas == 1) {
					$respuesta['status'] = 'ok';
					$respuesta['msg'] = 'La dirección ha sido eliminada.';
					$this->mostrarRespuesta($respuesta, 200);
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'Ha habido un error al eliminar la dirección.';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
		}
		$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
	}

	private function updateAddressCustomer() {
		if ($_SERVER['REQUEST_METHOD'] != "POST") {
			$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
		}

		if(!$this->isValidUserToken($this->datosPeticion['token'])) {
			return false;
		}
		if (isset($this->datosPeticion['id'])) {

			$id = $this->datosPeticion['id'];
			$postal_code = html_entity_decode($this->datosPeticion['postal_code']);
			$city = html_entity_decode($this->datosPeticion['city']);
			$address = html_entity_decode($this->datosPeticion['address']);
			$phone = $this->datosPeticion['phone'];
			$nombre = html_entity_decode($this->datosPeticion['name']);
			

 				$query = $this->_conn->prepare("UPDATE tt_customer_address SET 
				 								city= '".$city."', 
												postal_code= '".$postal_code."', 
												address= '".$address."',
												telefono= '".$phone."',
												nombre= '".$nombre."'
												where id = ".$id);

				$query->execute();

				$filasActualizadas = $query->rowCount();

				if ($filasActualizadas == 1) { 

					$respuesta['status'] = 'ok';
					$respuesta['items'] = $filas;
					$this->mostrarRespuesta($respuesta, 200);
 				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'Ha habido un error al actualizar la dirección.';
					$this->mostrarRespuesta($respuesta, 200);
				} 
		}
		$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
	}	

	private function addAddressCustomer() {
		if ($_SERVER['REQUEST_METHOD'] != "POST") {
			$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
		}

		if(!$this->isValidUserToken($this->datosPeticion['token'])) {
			return false;
		}
		if (isset($this->datosPeticion['id_customer'])) {

			$id_customer = $this->datosPeticion['id_customer'];
			$postal_code = html_entity_decode($this->datosPeticion['postal_code']);
			$city = html_entity_decode($this->datosPeticion['city']);
			$address = html_entity_decode($this->datosPeticion['address']);
			$phone = $this->datosPeticion['phone'];
			$nombre = html_entity_decode($this->datosPeticion['name']);
			

 				$query = $this->_conn->prepare("INSERT INTO tt_customer_address(id_customer, city, postal_code, address,id_country,telefono,nombre)values('".$id_customer."','".$city."','".$postal_code."','".$address."',1,'".$phone."','".$nombre."')");

				$query->execute();

				$filasActualizadas = $query->rowCount();
				$insertId = $this->_conn->lastInsertId();

				if ($filasActualizadas == 1) { 
					$query = $this->_conn->query("SELECT * FROM tt_customer_address where id='".$insertId."'");
					$filas = $query->fetch(PDO::FETCH_ASSOC);
					$respuesta['status'] = 'ok';
					$respuesta['items'] = $filas;
					$this->mostrarRespuesta($respuesta, 200);
 				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'Ha habido un error al insertar la dirección.';
					$this->mostrarRespuesta($respuesta, 200);
				} 
		}
		$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
	}

	/*** VARIABLE CONCEPT  ***/
	private function getVariableConcept() {
		if (isset($this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year']) ) {
			$id_company = $this->datosPeticion['id_company'];
			$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
			$response = $this->operationApiSuperAdmin("SELECT * FROM tt_variable_concept where id_company='".$id_company."' and id_fiscal_year='".$id_fiscal_year."' order by name ASC", 'GET');
			if ( $response != false) {
				$jsonResponse['status'] = 'ok';
				$jsonResponse['items'] = $response;
				$this->mostrarRespuesta($jsonResponse, 200);
			}
			else {
				$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
			}
		} else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}

	private function removeSubconcept() {
		if ($_SERVER['REQUEST_METHOD'] != "POST") {
			$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
		}

		if(!$this->isValidUserToken($this->datosPeticion['token'])) {
			return false;
		}
		if (isset($this->datosPeticion['id'])) {
			$id = $this->datosPeticion['id'];

			if (!empty($id)) {
				$query = $this->_conn->prepare("DELETE FROM tt_subconcepts_project where id='".$id."'");

				$query->execute();

				$filasActualizadas = $query->rowCount();

				if ($filasActualizadas == 1) {
					$respuesta['status'] = 'ok';
					$respuesta['msg'] = 'El subconcepto ha sido eliminado.';
					$query = $this->_conn->prepare("DELETE FROM tt_lines_subconcept where id_subconcept='".$id."'");
					$query->execute();
					$this->mostrarRespuesta($respuesta, 200);
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'Ha habido un error al eliminar el subconcepto.';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
		}
		$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
	}

	private function removeSubconceptBilling() {
		if ($_SERVER['REQUEST_METHOD'] != "POST") {
			$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
		}

		if(!$this->isValidUserToken($this->datosPeticion['token'])) {
			return false;
		}
		if (isset($this->datosPeticion['id'])) {
			$id = $this->datosPeticion['id'];

			if (!empty($id)) {

				//recupero el número de factura
				$query = $this->_conn->prepare("select id_bill from tt_subconcepts_billing where id='".$id."'");
				$query->execute();
				$idBill = $query->fetch(PDO::FETCH_ASSOC);

				$query = $this->_conn->prepare("DELETE FROM tt_subconcepts_billing where id='".$id."'");

				$query->execute();

				$filasActualizadas = $query->rowCount();

				if ($filasActualizadas == 1) {
					$tax_base=0;
					$strToSearch ="select amount, unit_budget, price from tt_subconcepts_billing where id_bill='".$idBill['id_bill']."'";
					foreach($this->_conn->query($strToSearch) as $row) {
						$tax_base = $tax_base + $row['amount']*$row['unit_budget']*$row['price'];
					}

					//cogemos el % de iva de la factura
					$query = $this->_conn->prepare("select percent_tax from tt_billing where id=".$idBill['id_bill']);
					$query->execute();
					$percent = $query->fetch(PDO::FETCH_ASSOC);
					if($percent['percent_tax'] == 0) {
						$total = $tax_base;
					} else {
						$total = ($tax_base) * (1 + (($percent['percent_tax'])/100));
					}

					$taxes = $tax_base * (floatval($percent['percent_tax'])/100);

					$query = $this->_conn->prepare("update tt_billing set taxes='".$taxes."', tax_base='".$tax_base."', total='".$total."' where id='".$idBill['id_bill']."'");
					$query->execute();

					$respuesta['status'] = 'ok';
					$respuesta['factura'] = $idBill;
					$respuesta['query'] = $query;


					$respuesta['msg'] = 'El subconcepto ha sido eliminado.';

					$this->mostrarRespuesta($respuesta, 200);
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'Ha habido un error al eliminar el subconcepto.';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
		}
		$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
	}

	private function addSubconceptBilling() {
		if ($_SERVER['REQUEST_METHOD'] != "POST") {
			$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
		}

		if(!$this->isValidUserToken($this->datosPeticion['token'])) {
			return false;
		}
		if (isset($this->datosPeticion['id_variable_concept'])) {

			$id_bill = $this->datosPeticion['id_bill'];
			$id_variable_concept = $this->datosPeticion['id_variable_concept'];

			if (!empty($id_bill)) {
				$query = $this->_conn->prepare("INSERT INTO tt_subconcepts_billing(id_bill, id_variable_concept)values('".$id_bill."','".$id_variable_concept."')");

				$query->execute();

				$filasActualizadas = $query->rowCount();
				$insertId = $this->_conn->lastInsertId();

				if ($filasActualizadas == 1) {
					$query = $this->_conn->query("SELECT * FROM tt_subconcepts_billing where id='".$insertId."'");
					$filas = $query->fetch(PDO::FETCH_ASSOC);
					$respuesta['status'] = 'ok';
					$respuesta['items'] = $filas;
					$this->mostrarRespuesta($respuesta, 200);
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'Ha habido un error al insertar el subconcepto.';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
		}
		$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
	}

	private function addSubconcept() {
		if ($_SERVER['REQUEST_METHOD'] != "POST") {
			$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
		}

		if(!$this->isValidUserToken($this->datosPeticion['token'])) {
			return false;
		}
		if (isset($this->datosPeticion['id_variable_concept'])) {
			$id_project = null;
			$id_budget = null;

			if (isset($this->datosPeticion['id_project'])) {
				$id = "id_project='".$this->datosPeticion['id_project']."'";
				$id_value = $this->datosPeticion['id_project'];
				$valueId = 'id_project';
			} else if (isset($this->datosPeticion['id_budget'])) {
				$id = "id_budget='".$this->datosPeticion['id_budget']."'";
				$id_value = $this->datosPeticion['id_budget'];
				$valueId = 'id_budget';
			}

			$id_variable_concept = $this->datosPeticion['id_variable_concept'];

			if (!empty($id_value)) {
				$query = $this->_conn->prepare("INSERT INTO tt_subconcepts_project(".$valueId.", id_variable_concept)values(:id_value, :id_variable_concept)");
				$query->bindValue(":id_value", $id_value);
				$query->bindValue(":id_variable_concept", $id_variable_concept);

				$query->execute();

				$filasActualizadas = $query->rowCount();
				$insertId = $this->_conn->lastInsertId();

				if ($filasActualizadas == 1) {
					$query = $this->_conn->query("SELECT * FROM tt_subconcepts_project where id='".$insertId."'");
					$filas = $query->fetch(PDO::FETCH_ASSOC);
					$respuesta['status'] = 'ok';
					$respuesta['items'] = $filas;
					$this->mostrarRespuesta($respuesta, 200);
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'Ha habido un error al insertar el subconcepto.';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
		}
		$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
	}

	private function updateSubconceptBilling() {
		if ($_SERVER['REQUEST_METHOD'] != "PUT") {
			$this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}
		if (isset($this->datosPeticion['id'],$this->datosPeticion['field'], $this->datosPeticion['value'])) {

			$id = (int) $this->datosPeticion['id'];
			$idBill = (int) $this->datosPeticion['id_bill'];
			$field = $this->datosPeticion['field'];
			$price = $this->datosPeticion['price'];

			if($price) {
				$tmp = ",price=".$price;
			}
			$value = html_entity_decode($this->datosPeticion['value']);
			if ($value === '') {
				$value = 0;
			}

			if (!empty($id) and !empty($field)) {

				$query = $this->_conn->prepare("update tt_subconcepts_billing set ".$field."='".$value."'".$tmp." where id='".$id."'");
				$query->execute();
				$filasActualizadas = $query->rowCount();
				if ($filasActualizadas == 1) {
					// calculamos totales de la factura
					$tax_base = 0;
					$query = $this->_conn->prepare("select amount, unit_budget, price from tt_fee_company where id_bill=".$idBill);
					$query->execute();
					$fee = $query->fetch(PDO::FETCH_ASSOC);
					$filasActualizadas = $query->rowCount();
					if($filasActualizadas>0) {
						$tax_base = $fee['amount']*$fee['unit_budget']*$fee['price'];
					}

					$strToSearch ="select amount, unit_budget, price from tt_subconcepts_billing where id_bill='".$idBill."'";
					foreach($this->_conn->query($strToSearch) as $row) {
						$tax_base = $tax_base + $row['amount']*$row['unit_budget']*$row['price'];
					}


					//cogemos el % de iva de la factura
					$query = $this->_conn->prepare("select percent_tax from tt_billing where id=".$idBill);
					$query->execute();
					$percent = $query->fetch(PDO::FETCH_ASSOC);
					if($percent['percent_tax'] == 0) {
						$total = $tax_base;
					} else {
						$total = ($tax_base) * (1 + (($percent['percent_tax'])/100));
					}

					$taxes = $tax_base * (floatval($percent['percent_tax'])/100);

					$query = $this->_conn->prepare("update tt_billing set taxes='".$taxes."', tax_base='".$tax_base."', total='".$total."' where id='".$idBill."'");

					$query->execute();

					//modifico el total si la factura ha sido cobrada (necesario para abonos parciales)
					$query = $this->_conn->prepare("update tt_billing_charges set amount = (select total from tt_billing where id = '".$idBill."') where id_billing = '".$idBill."'");
					$query->execute();

					$resp = array('status' => "ok", "msg" => "Subconcepto actualizado correctamente.");
					$this->mostrarRespuesta($resp, 200);
				}
			}
		}
		$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
	}

	private function updateFee() {
		if ($_SERVER['REQUEST_METHOD'] != "PUT") {
			$this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}
		if (isset($this->datosPeticion['id_value'], $this->datosPeticion['type'], $this->datosPeticion['field'], $this->datosPeticion['value'])) {
			$id = $this->datosPeticion['id'];
			$field = $this->datosPeticion['field'];
			$value = $this->datosPeticion['value'];
			$type = 'id_'.$this->datosPeticion['type'];
			$id_value = (int)$this->datosPeticion['id_value'];

			if ($id === 'null') {
				// Create new one
				$query = $this->_conn->prepare("INSERT INTO tt_fee_company(".$type.", ".$field.")values('".$id_value."', '".$value."')");
				$query->execute();
				$insertId = $this->_conn->lastInsertId();
				$filasActualizadas = $query->rowCount();
				if ($filasActualizadas == 1) {
					$jsonResponse['status'] = 'ok';
					$jsonResponse['msg'] = 'Fee insertado correctamente.';
					$jsonResponse['value_id'] = $insertId;

					// calculamos totales de la factura
					$tax_base = 0;
					$query = $this->_conn->prepare("select amount, unit_budget, price from tt_fee_company where id_bill=".$id_value);
					$query->execute();
					$fee = $query->fetch(PDO::FETCH_ASSOC);
					$filasActualizadas = $query->rowCount();
					if($filasActualizadas>0) {
						$tax_base = $fee['amount']*$fee['unit_budget']*$fee['price'];
					}

					$strToSearch ="select amount, unit_budget, price from tt_subconcepts_billing where id_bill='".$id_value."'";
					foreach($this->_conn->query($strToSearch) as $row) {
						$tax_base = $tax_base + $row['amount']*$row['unit_budget']*$row['price'];
					}
					$total = $tax_base;
					//cogemos el % de iva de la factura
					$query = $this->_conn->prepare("select percent_tax from tt_billing where id=".$id_value);
					$query->execute();
					$percent = $query->fetch(PDO::FETCH_ASSOC);
					if($percent['percent_tax'] == 0) {
						$total = $tax_base;
					} else {
						$total = floatval($total) * (1 + (floatval($percent['percent_tax'])/100));
					}

					$taxes = $tax_base * (floatval($percent['percent_tax'])/100);

					$query = $this->_conn->prepare("update tt_billing set taxes='".$taxes."', tax_base='".$tax_base."', total='".$total."' where id='".$idBill."'");
					$query->execute();

					$this->mostrarRespuesta($jsonResponse, 200);
				}

			} else {
				// Update field
				if (!empty($id) and !empty($field)) {
					$query = $this->_conn->prepare("update tt_fee_company set ".$field."='".$value."' where id=".$id);
					$query->execute();
					$filasActualizadas = $query->rowCount();
					if ($filasActualizadas == 1) {
						$jsonResponse['status'] = 'ok';
						$jsonResponse['msg'] = 'Fee actualizado correctamente.';
						// calculamos totales de la factura

						$tax_base = 0;
						$query = $this->_conn->prepare("select amount, unit_budget, price from tt_fee_company where id_bill=".$id_value);
						$query->execute();
						$fee = $query->fetch(PDO::FETCH_ASSOC);
						$filasActualizadas = $query->rowCount();
						if($filasActualizadas>0) {
							$tax_base = $fee['amount']*$fee['unit_budget']*$fee['price'];
						}

						$strToSearch ="select amount, unit_budget, price from tt_subconcepts_billing where id_bill='".$id_value."'";
						foreach($this->_conn->query($strToSearch) as $row) {
							$tax_base = $tax_base + $row['amount']*$row['unit_budget']*$row['price'];
						}
						$total = $tax_base;
						//cogemos el % de iva de la factura
						$query = $this->_conn->prepare("select percent_tax from tt_billing where id=".$id_value);
						$query->execute();
						$percent = $query->fetch(PDO::FETCH_ASSOC);
						if($percent['percent_tax'] == 0) {
							$total = $tax_base;
						} else {
							$total = floatval($total) * (1 + (floatval($percent['percent_tax'])/100));
						}

						$taxes = $tax_base * (floatval($percent['percent_tax'])/100);
						$query = $this->_conn->prepare("update tt_billing set taxes='".$taxes."', tax_base='".$tax_base."', total='".$total."' where id='".$id_value."'");
						$query->execute();
						$this->mostrarRespuesta($jsonResponse, 200);
					}
				}
			}

		}
		$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
	}
	private function updateTaxBilling() {
		if ($_SERVER['REQUEST_METHOD'] != "PUT") {
			$this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}
		if (isset($this->datosPeticion['id_bill'])) {
			$idBill = $this->datosPeticion['id_bill'];
			$value = $this->datosPeticion['value'];

			$query = "update tt_billing set percent_tax='".$value."' where id='".$idBill."'";
			if (!empty($idBill)) {

				$query = $this->_conn->prepare($query);

				$query->execute();
				$filasActualizadas = $query->rowCount();
				if ($filasActualizadas == 1) {
					// calculamos totales de la factura
					$tax_base = 0;
					$query = $this->_conn->prepare("select amount, unit_budget, price from tt_fee_company where id_bill=".$idBill);
					$query->execute();
					$fee = $query->fetch(PDO::FETCH_ASSOC);
					$filasActualizadas = $query->rowCount();
					if($filasActualizadas>0) {
						$tax_base = $fee['amount']*$fee['unit_budget']*$fee['price'];
					}

					$strToSearch ="select amount, unit_budget, price from tt_subconcepts_billing where id_bill='".$idBill."'";
					foreach($this->_conn->query($strToSearch) as $row) {
						$tax_base = $tax_base + $row['amount']*$row['unit_budget']*$row['price'];
					}
					$total = $tax_base;
					//cogemos el % de iva de la factura
					$query = $this->_conn->prepare("select percent_tax from tt_billing where id=".$idBill);
					$query->execute();
					$percent = $query->fetch(PDO::FETCH_ASSOC);
/* 					if($percent['percent_tax'] == 0) {
						$total = $tax_base;
					} else {
						$total = floatval($total) * (1 + (floatval($percent['percent_tax'])/100));
					}
					$taxes = $tax_base * (floatval($percent['percent_tax'])/100); */
					$taxes = round($tax_base*$percent['percent_tax']/100,2);
					$total = round($tax_base*(100+$percent['percent_tax'])/100,2);

					$query = $this->_conn->prepare("update tt_billing set taxes='".$taxes."', tax_base='".$tax_base."', total='".$total."' where id='".$idBill."'");
					$query->execute();

					$resp = array('status' => "ok", "msg" => "Datos actualizados correctamente.");
					$this->mostrarRespuesta($resp, 200);
				}
			}
		}
		$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
	}

	private function updateAddressBilling() {
		if ($_SERVER['REQUEST_METHOD'] != "PUT") {
			$this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}
		if (isset($this->datosPeticion['id_bill'])) {
			$idBill = $this->datosPeticion['id_bill'];
			$value = $this->datosPeticion['value'];

			$query = "update tt_billing set id_address='".$value."' where id='".$idBill."'";
			if (!empty($idBill)) {

				$query = $this->_conn->prepare($query);

				$query->execute();
				$filasActualizadas = $query->rowCount();
				if ($filasActualizadas == 1) {
					// calculamos totales de la factura
					$resp = array('status' => "ok", "msg" => "Datos actualizados correctamente.");
					$this->mostrarRespuesta($resp, 200);
				}
			}
		}
		$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
	}

	private function updateAddressCampaign() {
		if ($_SERVER['REQUEST_METHOD'] != "PUT") {
			$this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}
		if (isset($this->datosPeticion['id_campaign'])) {
			$idCampaign = $this->datosPeticion['id_campaign'];
			$value = $this->datosPeticion['value'];

			$query = "update tt_campaign set id_address='".$value."' where id='".$idCampaign."'";
			if (!empty($idCampaign)) {

				$query = $this->_conn->prepare($query);

				$query->execute();
				$filasActualizadas = $query->rowCount();
				if ($filasActualizadas == 1) {
					// calculamos totales de la factura
					$resp = array('status' => "ok", "msg" => "Datos actualizados correctamente.");
					$this->mostrarRespuesta($resp, 200);
				}
			}
		}
		$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
	}
	
	private function updateInfoBill() {
		if ($_SERVER['REQUEST_METHOD'] != "PUT") {
			$this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}
		if (isset($this->datosPeticion['field'], $this->datosPeticion['value'])) {
			$field = $this->datosPeticion['field'];
			$value = html_entity_decode($this->datosPeticion['value']);
			

			$id = $this->datosPeticion['id'];
			$query = "update tt_billing set ".$field."='".$value."' where id='".$id."'";

			if (!empty($id) and !empty($field)) {

				$query = $this->_conn->prepare($query);

				$query->execute();
				$filasActualizadas = $query->rowCount();
				if ($filasActualizadas == 1) {
					$resp = array('status' => "ok", "msg" => "Datos actualizados correctamente.");
					$this->mostrarRespuesta($resp, 200);
				}
			}
		}
		$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
	}

	private function updateInfoBudget() {
		if ($_SERVER['REQUEST_METHOD'] != "PUT") {
			$this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}
		if (isset($this->datosPeticion['field'], $this->datosPeticion['value'])) {
			$field = $this->datosPeticion['field'];
			$value = html_entity_decode($this->datosPeticion['value']);

			if (isset($this->datosPeticion['id_project'])) {
				$id = $this->datosPeticion['id_project'];
				$query = "update tt_campaign set ".$field."='".$value."' where id='".$id."'";
			} else if (isset($this->datosPeticion['id_budget'])) {
				$id = $this->datosPeticion['id_budget'];
				$query = "update tt_budget set ".$field."='".$value."' where id='".$id."'";
			}

			if (!empty($id) and !empty($field)) {

				$query = $this->_conn->prepare($query);

				$query->execute();
				$filasActualizadas = $query->rowCount();
				if ($filasActualizadas == 1) {
					$resp = array('status' => "ok", "msg" => "Datos actualizados correctamente.");
					$this->mostrarRespuesta($resp, 200);
				}
			}
		}
		$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
	}

	private function updateInfoPersonalFieldBudget() {
		if ($_SERVER['REQUEST_METHOD'] != "PUT") {
			$this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}
		if (isset($this->datosPeticion['field'], $this->datosPeticion['value'])) {
			$field = $this->datosPeticion['field'];
			$value = html_entity_decode($this->datosPeticion['value']);

			if (isset($this->datosPeticion['id_project'])) {
 				$id = $this->datosPeticion['id_project'];
				$tipocampo = $this->datosPeticion['tipocampo'];
				//primero borro lo que haya
				$query = "delete from tt_valuesbvsfields where idtable=".$id." and freefieldsvscompanyid=".$field;
				$query = $this->_conn->prepare($query);
				$query->execute();

				if ($tipocampo == 1){
					$query = "insert into tt_valuesbvsfields (freefieldsvscompanyid, valuechar, idtable) values (".$field.",'".$value."',".$id.")";
				}else if ($tipocampo == 2){
					$query = "insert into tt_valuesbvsfields (freefieldsvscompanyid, valuedate, idtable) values (".$field.",'".$value."',".$id.")";
				} 

			} 

			if (!empty($id) and !empty($field)) {

				$query = $this->_conn->prepare($query);

				$query->execute();
				$filasActualizadas = $query->rowCount();
				if ($filasActualizadas == 1) {
					$resp = array('status' => "ok", "msg" => "Datos actualizados correctamente.");
					$this->mostrarRespuesta($resp, 200);
				}
			}
		}
		$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
	}

	private function updateSubconceptStandard() {
		if ($_SERVER['REQUEST_METHOD'] != "PUT") {
			$this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}
		if (isset($this->datosPeticion['token'])) {
			$id = (int) $this->datosPeticion['id'];
			$code = $this->datosPeticion['code'];
			$subconcept_name = html_entity_decode($this->datosPeticion['description']);
			$unit_price = $this->datosPeticion['unit_price'];
			$unitsperitem = $this->datosPeticion['unitsperitem'];
			$id_family = $this->datosPeticion['id_family'];
			$envelope_type = $this->datosPeticion['envelope_type'];
			$bperishable = $this->datosPeticion['bperishable'];
			$bstockable = $this->datosPeticion['bstockable'];
			$brand = html_entity_decode($this->datosPeticion['brand']);
			$customer = $this->datosPeticion['customer'];
			$image = $this->datosPeticion['image'];
			$contact = html_entity_decode($this->datosPeticion['contact']);
			$id_company = $this->datosPeticion['id_company'];

			if ($id_company == 414){
				$ref_provider = $this->datosPeticion['ref_provider'];
				$descrip_provider = $this->datosPeticion['descrip_provider'];
				$tipo_torno = $this->datosPeticion['tipo_torno'];
			}else {
				$ref_provider = "";
				$descrip_provider = "";
				$tipo_torno = "";
			}			


			//tengo que ver si el código ya existe, en tal caso no dejo guardarlo
			$query = $this->_conn->prepare("select * from tt_subconcepts_standards where id !=".$id." and id_company='".$id_company."' and ( code='".$code."')");
			$filas = $query->execute();
			$filasActualizadas = $query->rowCount();

			if($filasActualizadas === 0) {

			$query = $this->_conn->prepare("update tt_subconcepts_standards set code='".$code."', description='".$subconcept_name."',
			unit_price=".$unit_price.", unitsperitem='".$unitsperitem."', id_family=".$id_family.", envelope_type=".$envelope_type.",
			bperishable=".$bperishable.", bstockable=".$bstockable.", brand='".$brand."',id_customer=".$customer.", image='".$image."', 
			contact='".$contact."', ref_provider='".$ref_provider."', descrip_provider='".$descrip_provider."', tipo_torno='".$tipo_torno."'
			where id=".$id);

			$query->execute();

			$response = $this->operationApi("SELECT art.id, art.code, art.description,
			art.unit_price, art.unitsperitem, art.envelope_type, env.name as envelope, 
			art.id_family, fam.familyname, art.brand, art.bperishable,
			case when art.bperishable = 1 then 'Sí' else 'No' end as perishable,
			art.bstockable,
			case when art.bstockable = 1 then 'Sí' else 'No' end as stockable,
			art.id_customer, customer_name, contact, art.image, 
			art.ref_provider, art.descrip_provider, art.tipo_torno
			FROM gesad.tt_subconcepts_standards art
			left join tt_articles_envelopes env
			on env.id = art.envelope_type
			left join tt_articles_families fam
			on fam.id = art.id_family
			left join tt_customer cum
			on cum.id = art.id_customer
			where art.id =".$id , 'PUT');

			$respuesta['status'] = 'ok';
			$respuesta['msg'] = 'Artículo actualizado correctamente.';
			$respuesta['items'] = $response;

			$this->mostrarRespuesta($respuesta, 200);
			}else{
				$respuesta['status'] = 'error';
				$respuesta['msg'] = 'Ya existe un artículo con el código '.$code;
				$this->mostrarRespuesta($respuesta, 200);
			}

		}
		$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
	}

	private function updateSubconcept() {
		if ($_SERVER['REQUEST_METHOD'] != "PUT") {
			$this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}
		if (isset($this->datosPeticion['id'],$this->datosPeticion['field'], $this->datosPeticion['value'])) {

			$id = (int) $this->datosPeticion['id'];
			$idCompany = $this->datosPeticion['id_company'];
			$field = $this->datosPeticion['field'];
			$price = $this->datosPeticion['price'];
			$name = html_entity_decode($this->datosPeticion['name']);
			$code = html_entity_decode($this->datosPeticion['code']);


			if($price) {
				$tmp = ",price=".$price;
			}
 			if($name) {
				$tmp = $tmp.",name='".$name."'";
			} 
			if($code) {
				$tmp = $tmp.",code='".$code."'";
			} 

			$value = html_entity_decode($this->datosPeticion['value']);
			if ($value === '') {
				$value = 0;
			}

			if (!empty($id) and !empty($field)) {


				$query = $this->_conn->prepare("update tt_subconcepts_project set ".$field."='".$value."'".$tmp." where id='".$id."'");
				$query->execute();
				$filasActualizadas = $query->rowCount();
				
				if ($filasActualizadas == 1) {

					//borro la posible fila de petición que hubiera asociada a este subconcepto
					$query = $this->_conn->prepare("delete from tt_articlesvslocation where subconcept_project_id=".$id);
					$query->execute();

					//me meto aquí para actualizar la petición de storage
					$query = $this->_conn->prepare("select tt_subconcepts_project.id as linea, tt_subconcepts_standards.id as id_article, amount, tt_campaign.id as id_campaign,
					tt_warehouse.id as id_almacen, tt_campaign.campaign_code,
					tt_campaign.id_customer, tt_subconcepts_standards.image
					from tt_subconcepts_project, tt_campaign, tt_warehouse, tt_subconcepts_standards
					where tt_subconcepts_project.id_project = tt_campaign.id
					and tt_warehouse.id_company = tt_campaign.id_company
					and tt_subconcepts_standards.id_company = tt_campaign.id_company
					and tt_subconcepts_standards.code = tt_subconcepts_project.code
					and tt_warehouse.bdefault = 1
					and amount <> 0
					and tt_subconcepts_standards.bstockable = 1
					and tt_subconcepts_project.id = ".$id);

					$query->execute();
					$numfilas = $query->rowCount();

					if ($numfilas == 1) {
						
						$filas = $query->fetch(PDO::FETCH_ASSOC);		
						
						if ($filas['amount'] > 0){
							$query = $this->_conn->prepare("INSERT INTO `tt_articlesvslocation`(`borrado`,`units`, `location_warehouse`, `location_rows`, `location_sections`, `location_heights`, `article_id`, `owner_id`, `state_id`,`date_mod`,`image`,`subconcept_project_id`) VALUES (
								-1,'".$filas['amount']."','".$filas['id_almacen']."','0','0','0', '".$filas['id_article']."','".$filas['id_customer']."',5,CURRENT_TIMESTAMP,'".$filas['image']."','".$id."')");
							$query->execute();

							//compruebo que tengo disponibles en el almacén
							$queryWithFamilies = "select tt_articles_families.familyname as family, tt_subconcepts_standards.id_family, tt_subconcepts_standards.id, tt_subconcepts_standards.description, tt_subconcepts_standards.bstockable
							from tt_subconcepts_project, tt_subconcepts_standards
							INNER JOIN tt_articles_families ON tt_subconcepts_standards.id_family = tt_articles_families.id
							where tt_subconcepts_project.id = ".$id."
							and tt_subconcepts_project.code = tt_subconcepts_standards.code";
							$queryWithoutFamilies = "select tt_subconcepts_standards.id, tt_subconcepts_standards.description, tt_subconcepts_standards.bstockable
							from tt_subconcepts_project, tt_subconcepts_standards
							where tt_subconcepts_project.id = ".$id."
							and tt_subconcepts_project.code = tt_subconcepts_standards.code";
							if($idCompany == "416") {
								$query = $this->_conn->prepare($queryWithFamilies);
							} else {
								$query = $this->_conn->prepare($queryWithoutFamilies);

							}

							$query->execute();
							$filas = $query->fetch(PDO::FETCH_ASSOC);


							if (isset($filas['id'])){

								$query = $this->_conn->prepare("select sum(units) as solicitadas,
									(select sum(units) from tt_articlesvslocation where article_id = ".$filas['id']." and borrado = 0) as disponibles,
									(select amount from tt_subconcepts_project where id =".$id.") as pedidasaqui
									from tt_articlesvslocation, tt_subconcepts_project, tt_campaign
									where article_id = ".$filas['id']."
									and borrado =-1
									and tt_subconcepts_project.id <> ".$id."
									and tt_articlesvslocation.subconcept_project_id = tt_subconcepts_project.id
									and tt_subconcepts_project.id_project = tt_campaign.id");

								$query->execute();
								$stock = $query->fetch(PDO::FETCH_ASSOC);

							}

						}else{
							//si la cifra que pone es negativa, metemos en el almacén existencias

						}

					}
					if($idCompany == "416") {
						$description = $filas['family'].'-'.$filas['description'];

					}else {
						$description = $filas['description'];

					}
					

					$resp = array('status' => "ok", "msg" => "Subconcepto actualizado correctamente.", "solicitadas" => $stock['solicitadas'], "disponibles" => $stock['disponibles'], "pedidasaqui" => $stock['pedidasaqui'], "descripcion" =>$description, "bstockable" => $filas['bstockable']);
					$this->mostrarRespuesta($resp, 200);
				}
			}
		}
		$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
	}

	private function updateObservations() {
		if ($_SERVER['REQUEST_METHOD'] != "PUT") {
			$this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}
		if (isset($this->datosPeticion['id'],$this->datosPeticion['observ_cli'], $this->datosPeticion['observ_int'])) {

			$id = (int) $this->datosPeticion['id'];
			$observ_cli = html_entity_decode($this->datosPeticion['observ_cli']);
			$observ_int = html_entity_decode($this->datosPeticion['observ_int']);


			if (!empty($id)) {

				$query = $this->_conn->prepare("update tt_campaign set observ_cli='".$observ_cli."', observ_int='".$observ_int."' where id='".$id."'");

				$query->execute();
				$filasActualizadas = $query->rowCount();
				if ($filasActualizadas == 1) {
					$resp = array('status' => "ok", "msg" => "Observaciones actualizadas correctamente.");
					$this->mostrarRespuesta($resp, 200);
				}
			}
		}
		$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
	}	

	private function getSubconceptStandard() {
		if (isset($this->datosPeticion['token']) ) {

			$id_team = $this->getTeamFromToken($this->datosPeticion['token']);
			$id_company = $this->datosPeticion['id_company'];
/* 			$response = $this->operationApi("SELECT subconcept.id, description as subconcept_name, customer.id as id_customer, customer.customer_name as customer_name, unit_price FROM tt_subconcepts_standards subconcept inner join tt_customer customer on subconcept.id_customer=customer.id where id_team='".$id_team."' order by id_customer ASC, description ASC", 'GET');
 */

			$filtro_cliente = "";
			$role = $this->getRoleFromToken($this->datosPeticion['token']);
			$id_user = $this->getIdUserFromToken($this->datosPeticion['token']);

			if ($role == 11){
				$query = $this->_conn->prepare("SELECT id_company_products from tt_user where id =".$id_user);// and id_status='".$id_status."'
				$query->execute();
				$filas = $query->fetch(PDO::FETCH_ASSOC);
				$filtro_cliente = " and cum.id= ".$filas['id_company_products'];
			}

			$response = $this->operationApi("SELECT art.id, art.code, art.description,
			art.unit_price, art.unitsperitem, art.envelope_type, env.name as envelope, 
			art.id_family, fam.familyname, art.brand, art.bperishable,
			case when art.bperishable = 1 then 'Sí' else 'No' end as perishable,
			art.bstockable,
			case when art.bstockable = 1 then 'Sí' else 'No' end as stockable,
			art.id_customer, customer_name, contact, art.image, 
			art.ref_provider, art.descrip_provider, art.tipo_torno
			FROM gesad.tt_subconcepts_standards art
			left join tt_articles_envelopes env
			on env.id = art.envelope_type
			left join tt_articles_families fam
			on fam.id = art.id_family
			left join tt_customer cum
			on cum.id = art.id_customer
			where art.id_company =".$id_company.$filtro_cliente."
			ORDER BY art.id DESC" , 'GET');

			if ( $response != false) {
				$jsonResponse['status'] = 'ok';
				$jsonResponse['items'] = $response;


				$this->mostrarRespuesta($jsonResponse, 200);
			}
			else {
				$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
			}
		} else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}

	private function getSubconceptsStandards() {
		if (isset($this->datosPeticion['id_company'], $this->datosPeticion['token']) ) {
			$id_team = $this->getTeamFromToken($this->datosPeticion['token']);

			$id_company = $this->datosPeticion['id_company'];
			$text = $this->datosPeticion['text'];
			$id_customer = $this->datosPeticion['id_customer'];

			//$response = $this->operationApi("SELECT description as name,s_s.brand as family, s_v.unit_price FROM tt_subconcepts_standards s_s, tt_subconcepts_std_vs_client s_v where s_s.id = s_v.id_subconcept and s_s.id_company='".$id_company."' and s_s.description LIKE '%".$text."%' union  ALL SELECT description as name, unit_price FROM tt_subconcepts_standards where id_company='".$id_company."' and description LIKE '%".$text."%' order by name ASC", 'GET');//
			$response = $this->operationApi("SELECT code, brand as family,  description as name, CASE WHEN (SELECT s_v.unit_price FROM tt_subconcepts_std_vs_client s_v where tt_subconcepts_standards.id = s_v.id_subconcept and s_v.id_customer ='".$id_customer."') IS NULL THEN unit_price ELSE (SELECT s_v.unit_price FROM tt_subconcepts_std_vs_client s_v where tt_subconcepts_standards.id = s_v.id_subconcept and s_v.id_customer ='".$id_customer."') END AS unit_price FROM tt_subconcepts_standards where id_company='".$id_company."' and description LIKE '%".$text."%' order by name", 'GET');
			
			$jsonResponse['data'] = $response;
			$this->mostrarRespuesta($jsonResponse, 200);

		} else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}

	private function getCodesStandards() {
		if (isset($this->datosPeticion['id_company'], $this->datosPeticion['token']) ) {
			$id_team = $this->getTeamFromToken($this->datosPeticion['token']);

			$id_company = $this->datosPeticion['id_company'];
			$id_customer = $this->datosPeticion['id_customer'];
			$text = $this->datosPeticion['text'];


			$response = $this->operationApi("SELECT code as name, CASE WHEN (SELECT s_v.unit_price FROM tt_subconcepts_std_vs_client s_v where tt_subconcepts_standards.id = s_v.id_subconcept and s_v.id_customer ='".$id_customer."') IS NULL THEN unit_price ELSE (SELECT s_v.unit_price FROM tt_subconcepts_std_vs_client s_v where tt_subconcepts_standards.id = s_v.id_subconcept and s_v.id_customer ='".$id_customer."') END AS unit_price, description FROM tt_subconcepts_standards where code <> '' and id_company='".$id_company."' and code LIKE '%".$text."%' order by code asc", 'GET');

			$jsonResponse['data'] = $response;

			$this->mostrarRespuesta($jsonResponse, 200);

		} else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}	

	private function getTaxesValue() {
		$query = $this->_conn->query("SELECT * FROM tt_taxes_values order by value ASC");
		$filas = $query->fetchAll(PDO::FETCH_ASSOC);

		$jsonResponse['status'] = 'ok';
		$jsonResponse['data'] = $filas;

		$this->mostrarRespuesta($jsonResponse, 200);
	}
	private function getSubconceptsBillings() {
		if (isset($this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year']) ) {

			$idBill = $this->datosPeticion['idBill'];
			$id_company = $this->datosPeticion['id_company'];
			$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];

			$response = $this->operationApi("SELECT * FROM tt_variable_concept where id_company='".$id_company."' and id_fiscal_year='".$id_fiscal_year."' order by name ASC", 'GET');
			if ( $response != false) {
				$jsonResponse['status'] = 'ok';
				$jsonResponse['items'] = $response;

				$response = $this->operationApi("SELECT * FROM tt_subconcepts_billing where id_bill='".$idBill."'", 'GET');
				if ($response!=false) {
					$jsonResponse['subconcepts'] = $response;
				}
				$response = $this->operationApi("SELECT * FROM tt_billing where id='".$idBill."'", 'GET');
				if($response!=false) {
					$jsonResponse['info_billing'] = $response;
				}
/* 				$response = $this->operationApi("SELECT * FROM tt_fee_company where id_bill='".$idBill."'", 'GET');

				if($response!=false) {
					$jsonResponse['fee'] = $response;
				} */
				$this->mostrarRespuesta($jsonResponse, 200);
			}
			else {
				$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
			}
		} else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}

	private function getSubconcept() {
		if (isset($this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year']) ) {
			$id_project = null;
			$id_budget = null;
			if (isset($this->datosPeticion['id_project'])) {
				$id = "id_project='".$this->datosPeticion['id_project']."'";
				$id_project = $this->datosPeticion['id_project'];
			} else if (isset($this->datosPeticion['id_budget'])) {
				$id = "id_budget='".$this->datosPeticion['id_budget']."'";
				$id_budget = $this->datosPeticion['id_budget'];
			}

			$id_project = $this->datosPeticion['id_project'];
			$id_budget = $this->datosPeticion['id_budget'];
			$id_company = $this->datosPeticion['id_company'];
			$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];

			$response = $this->operationApi("SELECT * FROM tt_variable_concept where id_company='".$id_company."' and id_fiscal_year='".$id_fiscal_year."' order by name ASC", 'GET');
			if ( $response != false) {
				$jsonResponse['status'] = 'ok';
				$jsonResponse['items'] = $response;

				$response = $this->operationApi("select id, id_variable_concept, amount, 
				unit_budget, price, unit_real, id_project, name, id_budget, code,
				(select max(bstockable) from tt_subconcepts_standards where tt_subconcepts_standards.code = tt_subconcepts_project.code and id_company = ".$id_company.") as bstockable
				from tt_subconcepts_project
				where ".$id, 'GET');
				if ($response!=false) {
					$jsonResponse['subconcepts'] = $response;
				}

				if ($id_project) {
					$response = $this->operationApi("SELECT start_date_budget, end_date_budget, budget_validity, campaign_code, campaign_name FROM tt_campaign where id='".$id_project."'", 'GET');
					if($response!=false) {
						$jsonResponse['info_project'] = $response;
					}

					$response = $this->operationApi("SELECT * FROM tt_fee_company where id_project='".$id_project."'", 'GET');
					if($response!=false) {
						$jsonResponse['fee'] = $response;
					}

				} else {
					$response = $this->operationApi("SELECT start_date_budget, end_date_budget, budget_validity, id, name FROM tt_budget where id='".$id_budget."'", 'GET');
					$jsonResponse['info_project'] = $response;

					$response = $this->operationApi("SELECT * FROM tt_fee_company where id_budget='".$id_budget."'", 'GET');
					$jsonResponse['fee'] = $response;
				}

				$this->mostrarRespuesta($jsonResponse, 200);
			}
			else {
				$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
			}
		} else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}

	private function getLinesSubconcept() {
		if ($_SERVER['REQUEST_METHOD'] != "GET") {
			$this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}
		if (isset($this->datosPeticion['id_project']) ) {
			$id_project = $this->datosPeticion['id_project'];
			$response = $this->operationApi("SELECT * FROM tt_lines_subconcept where id_project='".$id_project."'", 'GET');

			if ( $response != false) {
				$jsonResponse['status'] = 'ok';
				$jsonResponse['lines'] = $response;

				$this->mostrarRespuesta($jsonResponse, 200);
			}
			else {
				$this->mostrarRespuesta(HandleErrors::sendError(8), 200);
			}
		} else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}

	private function checkLinesSubconcept() {
		if ($_SERVER['REQUEST_METHOD'] != "GET") {
			$this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}
		if (isset($this->datosPeticion['start_date'], $this->datosPeticion['end_date']) ) {

			if (isset($this->datosPeticion['id_project'])) {
				$id_value = $this->datosPeticion['id_project'];
			} else if (isset($this->datosPeticion['id_budget'])) {
				$id_value = $this->datosPeticion['id_budget'];
			}

			$start_date = $this->datosPeticion['start_date'];
			$end_date = $this->datosPeticion['end_date'];
			$response = $this->operationApi("SELECT * FROM tt_lines_subconcept where ".$id_value, 'GET');

			if ( $response != false) {
				$jsonResponse['status'] = 'ok';
				$jsonResponse['lines'] = $response;

				$this->mostrarRespuesta($jsonResponse, 200);
			}
			else {
				$this->mostrarRespuesta(HandleErrors::sendError(8), 200);
			}
		} else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}

	private function addVariableConcept() {
		if ($_SERVER['REQUEST_METHOD'] != "POST") {
			$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
		}

		if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
			return false;
		}
		if (isset($this->datosPeticion['variable_concept_name'],$this->datosPeticion['id_company'],$this->datosPeticion['id_fiscal_year'],$this->datosPeticion['account_number'])) {
			$variable_concept_name = html_entity_decode($this->datosPeticion['variable_concept_name']);
			$id_company = $this->datosPeticion['id_company'];
			$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
			$account_number = $this->datosPeticion['account_number'];

			if (!empty($variable_concept_name) && !empty($id_company) && !empty($id_fiscal_year) && !empty($account_number)) {
				$query = $this->_conn->prepare("select * from tt_variable_concept where account_number='".$account_number."' and id_company='".$id_company."' and id_fiscal_year='".$id_fiscal_year."'");
				$query->execute();
				$filasActualizadas = $query->rowCount();
				if($filasActualizadas === 0) {
					//consulta preparada ya hace mysqli_real_escape()
					$query = $this->_conn->prepare("INSERT INTO tt_variable_concept(name, account_number, id_company, id_fiscal_year)values(:name, :account,:id_company,:id_fiscal_year)");
					$query->bindValue(":name", $variable_concept_name);
					$query->bindValue(":account", $account_number);
					$query->bindValue(":id_company", $id_company);
					$query->bindValue(":id_fiscal_year", $id_fiscal_year);
					$query->execute();

					$filasActualizadas = $query->rowCount();
					$insertId = $this->_conn->lastInsertId();

					if ($filasActualizadas == 1) {
						$query = $this->_conn->query("SELECT * FROM tt_variable_concept where id='".$insertId."'");
						$filas = $query->fetchAll(PDO::FETCH_ASSOC);
						$respuesta['status'] = 'ok';
						$respuesta['items'] = $filas;
						$this->mostrarRespuesta($respuesta, 200);
					}
				} else {
					$respuesta['status'] = 'error';
					$respuesta['msg'] = 'Ya existe un concepto variable con ese número de cuenta en la empresa y ejercicio seleccionado.';
					$this->mostrarRespuesta($respuesta, 200);
				}
			}
		}
		$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
	}

	private function deleteDatesLines() {
		if ($_SERVER['REQUEST_METHOD'] != "GET") {
			$this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}
		if (isset($this->datosPeticion['ids'])) {
			$ids = $this->datosPeticion['ids'];

			$query = $this->_conn->prepare("DELETE FROM tt_lines_subconcept WHERE id IN (".$ids.")");

			$query->execute();

			$jsonResponse['status'] = 'ok';
			$this->mostrarRespuesta($jsonResponse, 200);
		}
	}

	private function deleteVariableConcept() {
		$query = $this->_conn->prepare("select * from tt_budget_expenses where id_variable_concept='".$this->datosPeticion['id']."'");
		$query->execute();
		$filas = $query->rowCount();
		if($filas === 0) {
			$response = $this->operationApiSuperAdmin("DELETE FROM tt_variable_concept WHERE id=".$this->datosPeticion['id'], 'DELETE', false);
			if ( $response != false) {
				$jsonResponse['status'] = 'ok';
				$this->mostrarRespuesta($jsonResponse, 200);
			}
			else {
				$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
			}
		} else {
			$jsonResponse['status'] = 'error';
			$jsonResponse['msg'] = 'El concepto variable esta relacionado con un proyecto';
			$this->mostrarRespuesta($jsonResponse, 200);
		}
	}

	private function updateVariableConcept() {
		if ($_SERVER['REQUEST_METHOD'] != "PUT") {
			$this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}

		if (isset($this->datosPeticion['id'],$this->datosPeticion['id_fiscal_year'],$this->datosPeticion['account_number'], $this->datosPeticion['variable_concept_name'], $this->datosPeticion['id_company'])) {
			$variable_concept_name = html_entity_decode($this->datosPeticion['variable_concept_name']);
			$id = (int) $this->datosPeticion['id'];
			$account_number = $this->datosPeticion['account_number'];
			$id_company = $this->datosPeticion['id_company'];
			$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];

			if (!empty($variable_concept_name) and is_numeric($id) and !empty($account_number)) {
				$query = $this->_conn->prepare("select * from tt_variable_concept where id!='".$id."' and account_number='".$account_number."' and id_company='".$id_company."' and id_fiscal_year='".$id_fiscal_year."'");
				$query->execute();

				$filas = $query->rowCount();
				if($filas === 0) {
					$query = $this->_conn->prepare("update tt_variable_concept set name='".$variable_concept_name."', account_number='".$account_number."' WHERE id =".$id);

					$query->execute();
					$filasActualizadas = $query->rowCount();

					if ($filasActualizadas == 1) {
						$resp = array('status' => "ok", "msg" => "Concepto variable actualizado correctamente.");
						$this->mostrarRespuesta($resp, 200);
					} else {
						$query = $this->_conn->query("SELECT * FROM tt_variable_concept where id_company='".$id_company."'");
						$filas = $query->fetchAll(PDO::FETCH_ASSOC);

						$resp = array('status' => "error", "msg" => "El Concepto Variable no se ha actualizado correctamente.", "items" => $filas);
						$this->mostrarRespuesta($resp, 200);
					}
				} else {
					$query = $this->_conn->query("SELECT * FROM tt_variable_concept where id_company='".$id_company."'");
					$filas = $query->fetchAll(PDO::FETCH_ASSOC);

					$resp = array('status' => "error", "msg" => "Ya hay un concepto variable con el mismo número de cuenta", "items" => $filas);
					$this->mostrarRespuesta($resp, 200);
				}
			}
		}
		$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
	}

	/*** END VARIABLE CONCEPT  ***/

	/*** CONTACTS ***/
	private function getContacts() {
		if (isset($this->datosPeticion['id_company']) ) {
			$id_company = $this->datosPeticion['id_company'];
			$response = $this->operationApi("select name, surname, phone, email, 
						customer_name, tt_contacts.id, 
						tt_customer.id as id_customer
						from tt_contacts, tt_customer, tt_customervscontacts
						where tt_contacts.id = tt_customervscontacts.id_contact
						and tt_customer.id = tt_customervscontacts.id_customer", 'GET');
			if ( $response != false) {
				$jsonResponse['status'] = 'ok';
				$jsonResponse['items'] = $response;
				$this->mostrarRespuesta($jsonResponse, 200);
			}
			else {
				$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
			}
		} else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}

	}

	/*** CUSTOMERS  ***/
	private function getCustomers() {
		if (isset($this->datosPeticion['id_company']) ) {
			$id_company = $this->datosPeticion['id_company'];
			$response = $this->operationApi("SELECT tt_customer.id, customer_name, CIF, concat(address,concat(' ',address_bis)) as address, postal_code, city, tt_countries.country, logo, account_numberc, account_numbers, email, phone FROM tt_customer left join tt_countries on tt_countries.id = tt_customer.country where id_company='".$id_company."' order by customer_name ASC", 'GET');
			if ( $response != false) {
				$jsonResponse['status'] = 'ok';
				$jsonResponse['items'] = $response;
				$this->mostrarRespuesta($jsonResponse, 200);
			}
			else {
				$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
			}
		} else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}

	}

	private function addCustomer() {
 		if ($_SERVER['REQUEST_METHOD'] != "POST") {
			$this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		} 

		if (isset($this->datosPeticion['customer_name']) && isset($this->datosPeticion['id_company'])) {

			$query = $this->_conn->prepare("select * from tt_customer where customer_name='".$this->datosPeticion['customer_name']."' and id_company='".$this->datosPeticion['id_company']."'");
			$query->execute();
			$filasActualizadas = $query->rowCount();
			if ($filasActualizadas == 0) {
				$customer_name = html_entity_decode($this->datosPeticion['customer_name']);
				$cif = html_entity_decode($this->datosPeticion['cif']);
				$address = html_entity_decode($this->datosPeticion['address']);
				$city = html_entity_decode($this->datosPeticion['city']);
				$postal_code = html_entity_decode($this->datosPeticion['postal_code']);
				$id_company = $this->datosPeticion['id_company'];
				$account_numberc = $this->datosPeticion['account_numberc'];
				$account_numbers = $this->datosPeticion['account_numbers'];
				$email = $this->datosPeticion['email'];
				$phone = $this->datosPeticion['phone'];				

				if (!empty($customer_name) && !empty($id_company)) {
					//consulta preparada ya hace mysqli_real_escape()
 					$query = $this->_conn->prepare("INSERT INTO tt_customer(customer_name, id_company, cif, address, city, postal_code, account_numberc, account_numbers, email, phone)values(:customer_name, :id_company, :cif, :address, :city, :postal_code, :account_numberc, :account_numbers, :email, :phone )");
					$query->bindValue(":customer_name", $customer_name);
					$query->bindValue(":id_company", $id_company);
					$query->bindValue(":cif", $cif);
					$query->bindValue(":address", $address);
					$query->bindValue(":city", $city);
					$query->bindValue(":postal_code", $postal_code);
					$query->bindValue(":account_numberc", $account_numberc);
					$query->bindValue(":account_numbers", $account_numbers);
					$query->bindValue(":email", $email);
					$query->bindValue(":phone", $phone);										

					$query->execute();
					$filasActualizadas = $query->rowCount();
					$insertId = $this->_conn->lastInsertId();
					if ($filasActualizadas == 1) {
						$stmt = $this->_conn->query('SELECT * FROM tt_customer where id='.$insertId.' order by customer_name ASC');
						$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
						if(sizeof($results) > 0) { 
							$respuesta['status'] = 'ok';
							$respuesta['items'] = $results;
							$this->mostrarRespuesta($respuesta, 200);
 						}
					}
				}
			} else {
				$respuesta['status'] = 'error';
				$respuesta['msg'] = 'Ya hay un cliente con el nombre '.$this->datosPeticion['customer_name'];
				$this->mostrarRespuesta($respuesta, 200);
			} 
		}
		$this->mostrarRespuesta(HandleErrors::sendError(3), 204);
	}

 	private function deleteCustomer() {
		$query = $this->_conn->prepare("select * from tt_campaign where id_customer=".$this->datosPeticion['id']);
		$query->execute();
		$filasActualizadas = $query->rowCount();
		if ($filasActualizadas > 0) {
			$jsonResponse['status'] = 'error';
			$jsonResponse['msg'] = 'El cliente no se puede eliminar, tiene '.$filasActualizadas.' proyectos asignados.';
			$this->mostrarRespuesta($jsonResponse, 200);
		} else {
			$response = $this->operationApiSuperAdmin("DELETE FROM tt_customer WHERE id=".$this->datosPeticion['id'], 'DELETE', false);
			if ( $response != false) {
				$jsonResponse['status'] = 'ok';
				$this->mostrarRespuesta($jsonResponse, 200);
			}
			else {
				$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
			}
   		}
	} 

	private function updateCustomer() {
		if ($_SERVER['REQUEST_METHOD'] != "PUT") {
			$this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}

		if (isset($this->datosPeticion['id'],$this->datosPeticion['customer_name'],$this->datosPeticion['id_company'])) {
			$customer = html_entity_decode($this->datosPeticion['customer_name']);
			$id = (int) $this->datosPeticion['id'];
			$id_company = (int) $this->datosPeticion['id_company'];
			$cif = $this->datosPeticion['cif'];
			$address = html_entity_decode($this->datosPeticion['address']);
			$city = html_entity_decode($this->datosPeticion['city']);
			$postal_code = $this->datosPeticion['postal_code'];
			$account_numberc = $this->datosPeticion['account_numberc'];
			$account_numbers = $this->datosPeticion['account_numbers'];
			$email = $this->datosPeticion['email'];
			$phone = $this->datosPeticion['phone'];			
			$address_bis = "";

			
			
			//$country = $this->html_entity_decode(datosPeticion['country']);
			//$logo = $this->datosPeticion['logo'];

			if (!empty($customer) and !empty($id)) {
				$query = $this->_conn->prepare("select customer_name from tt_customer where id_company=:id_company customer_name=:customer_name and id!=:id");
				$query->bindValue(":customer_name", $customer);
				$query->bindValue(":id", $id);
				$query->bindValue(":id_company", $id_company);


				$query->execute();
				$filas = $query->rowCount();
				if($filas === 0) {

					$query = $this->_conn->prepare("update tt_customer
					set customer_name=:customer_name,
						CIF=:cif,
						address=:address,
						address_bis=:address_bis,
						city=:city,
						postal_code=:postal_code,						
						account_numberc=:account_numberc,
						account_numbers=:account_numbers,
						email=:email,
						phone=:phone						
					WHERE id =:id");
					$query->bindValue(":customer_name", $customer);
					$query->bindValue(":id", $id);
					$query->bindValue(":cif", $cif);
					$query->bindValue(":address", $address);
					$query->bindValue(":address_bis", $address_bis);
					$query->bindValue(":city", $city);
					$query->bindValue(":postal_code", $postal_code);
					$query->bindValue(":account_numberc", $account_numberc);
					$query->bindValue(":account_numbers", $account_numbers);
					$query->bindValue(":email", $email);
					$query->bindValue(":phone", $phone);										
					//$query->bindValue(":country", $country);					
					//$query->bindValue(":logo", $logo);
					$query->execute();
					$filasActualizadas = $query->rowCount();
					if ($filasActualizadas == 1) {
						$resp = array('status' => "ok", "msg" => "Cliente actualizado correctamente.");
						$this->mostrarRespuesta($resp, 200);
					} else {
						$query = $this->_conn->query("SELECT * FROM tt_customer where id_company='".$id_company."'");
						$filas = $query->fetchAll(PDO::FETCH_ASSOC);

						$resp = array('status' => "error", "msg" => "El Cliente no se ha actualizado correctamente.", "items" => $filas);
						$this->mostrarRespuesta($resp, 200);
					}
				} else {
					$query = $this->_conn->query("SELECT * FROM tt_customer where id_company='".$id_company."'");
					$filas = $query->fetchAll(PDO::FETCH_ASSOC);

					$resp = array('status' => "error", "msg" => "Ya hay un cliente con el mismo nombre", "items" => $filas);
					$this->mostrarRespuesta($resp, 200);
				}
			}


		}
		$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
	}

	/*** END TEAMS  ***/

	/** BREAKDOWN CAMPAIGNS **/
	public function updateLineSubconcept() {
		if ($_SERVER['REQUEST_METHOD'] != "PUT") {
		 $this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}

		if (isset($this->datosPeticion['id_project'], $this->datosPeticion['id_month'], $this->datosPeticion['id_variable_concept'],$this->datosPeticion['id_subconcept'],
							$this->datosPeticion['amount'] )) {
			$idProject = (int) $this->datosPeticion['id_project'];
			$idMonth =  $this->datosPeticion['id_month'];
			$amount =  $this->datosPeticion['amount'];
			$id_variable_concept = (int) $this->datosPeticion['id_variable_concept'];
			$id_subconcept = (int) $this->datosPeticion['id_subconcept'];

			if($amount == '') {
				$amount = 0;
			}

			$query = $this->_conn->prepare("select * from tt_lines_subconcept where id_project='".$idProject."' and id_month='".$idMonth."' and id_subconcept='".$id_subconcept."'");
			$query->execute();
			$values = $query->fetch(PDO::FETCH_ASSOC);
			$filasActualizadas = $query->rowCount();

			if ($filasActualizadas >= 1) {
				//update
				$query = $this->_conn->prepare("UPDATE tt_lines_subconcept set amount='".$amount."' where id='".$values['id']."'");

				$query->execute();
				$filasActualizadas = $query->rowCount();
				if($filasActualizadas == 1) {
						$jsonResponse['status'] = 'ok';
				} else {
					$jsonResponse['status'] = 'error';
				}

			} else {
				//insert
				$query = $this->_conn->prepare("INSERT INTO tt_lines_subconcept(id_month, amount, id_subconcept, id_project, id_variable_concept) values(
				'".$idMonth."','".$amount."','".$id_subconcept."','".$idProject."','".$id_variable_concept."')");
				$query->execute();
				$filasActualizadas = $query->rowCount();
				if($filasActualizadas == 1) {
						$jsonResponse['status'] = 'ok';
				} else {
					$jsonResponse['status'] = 'error';
				}
			}
			$this->mostrarRespuesta($jsonResponse, 200);
		}
		else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}
	public function updateEstimatedIncomes() {
		if ($_SERVER['REQUEST_METHOD'] != "PUT") {
		 $this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}

		if (isset($this->datosPeticion['id_campaign'], $this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year'],$this->datosPeticion['type'],
							$this->datosPeticion['amount'],$this->datosPeticion['id_month'] )) {
			$idCampaign = (int) $this->datosPeticion['id_campaign'];
			$idCompany = (int) $this->datosPeticion['id_company'];
			$idFiscalYear = (int) $this->datosPeticion['id_fiscal_year'];
			$idMonth =  $this->datosPeticion['id_month'];
			$amount =  $this->datosPeticion['amount'];
			$type = (int) $this->datosPeticion['type'];

			if($amount == '') {
				$amount = 0;
			}
			$query = $this->_conn->prepare("select * from tt_budget_income where id_campaign='".$idCampaign."' and id_month='".$idMonth."' and type='".$type."'");
			$query->execute();
			$values = $query->fetch(PDO::FETCH_ASSOC);
			$filasActualizadas = $query->rowCount();

			if ($filasActualizadas >= 1) {
				//update
				$query = $this->_conn->prepare("UPDATE tt_budget_income set amount='".$amount."' where id='".$values['id']."'");
				$query->execute();
				$filasActualizadas = $query->rowCount();
				if($filasActualizadas == 1) {
						$jsonResponse['status'] = 'ok';
				} else {
					$jsonResponse['status'] = 'error';
				}

			} else {
				//insert
				$query = $this->_conn->prepare("INSERT INTO tt_budget_income(id_campaign, type, amount, id_month) values(
				'".$idCampaign."','".$type."','".$amount."','".$idMonth."')");
				$query->execute();
				$filasActualizadas = $query->rowCount();
				if($filasActualizadas == 1) {
						$jsonResponse['status'] = 'ok';
				} else {
					$jsonResponse['status'] = 'error';
				}
			}
			$this->mostrarRespuesta($jsonResponse, 200);
		}
		else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}

	public function updateVariableCost() {
		if ($_SERVER['REQUEST_METHOD'] != "PUT") {
		 $this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}

		if (isset($this->datosPeticion['id_campaign'], $this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year'],
							$this->datosPeticion['amount'],$this->datosPeticion['id_month'],$this->datosPeticion['type'],$this->datosPeticion['id_variable_concept'] )) {
			$idCampaign = (int) $this->datosPeticion['id_campaign'];
			$idCompany = (int) $this->datosPeticion['id_company'];
			$idFiscalYear = (int) $this->datosPeticion['id_fiscal_year'];
			$idMonth =  $this->datosPeticion['id_month'];
			$amount =  $this->datosPeticion['amount'];
			$type =  $this->datosPeticion['type'];
			$id_variable_concept =  $this->datosPeticion['id_variable_concept'];

			$query = $this->_conn->prepare("select * from tt_budget_expenses where id_campaign='".$idCampaign."' and id_month='".$idMonth."' and id_variable_concept='".$id_variable_concept."' and type='".$type."'");
			$query->execute();
			$values = $query->fetch(PDO::FETCH_ASSOC);
			$filasActualizadas = $query->rowCount();
			if ($filasActualizadas == 1) {
					//update
				$query = $this->_conn->prepare("UPDATE tt_budget_expenses set amount='".$amount."' where id_campaign='".$idCampaign."' and id_month='".$idMonth."' and id_variable_concept='".$id_variable_concept."' and type='".$type."'");
				$query->execute();
				$filasActualizadas = $query->rowCount();
				if($filasActualizadas == 1) {
						$jsonResponse['status'] = 'ok';
				} else {
					$jsonResponse['status'] = 'error';
				}

			} else {
				//insert
				$query = $this->_conn->prepare("INSERT INTO tt_budget_expenses(id_campaign, amount, id_month, type, id_variable_concept) values(
				'".$idCampaign."','".$amount."','".$idMonth."','".$type."', '".$id_variable_concept."')");
				$query->execute();
				$filasActualizadas = $query->rowCount();
				if($filasActualizadas == 1) {
						$jsonResponse['status'] = 'ok';
				} else {
					$jsonResponse['status'] = 'error';
				}
			}
			$this->mostrarRespuesta($jsonResponse, 200);
		}
		else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}

	public function isAutoNumbered() {
		if ($_SERVER['REQUEST_METHOD'] != "GET") {
		 $this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}

		if (isset($this->datosPeticion['id_company'])) {

			$id_company =  $this->datosPeticion['id_company'];

			$query = $this->_conn->prepare("select auto_number from tt_company where id='".$id_company."'");
			$query->execute();
			$values = $query->fetch(PDO::FETCH_ASSOC);

			$jsonResponse['status'] = 'ok';
			$jsonResponse['autoNumbered'] = $values['auto_number'];

			$this->mostrarRespuesta($jsonResponse, 200);
		}
		else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}


	public function updateFeeLine() {
		if ($_SERVER['REQUEST_METHOD'] != "GET") {
		 $this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}

		if (isset($this->datosPeticion['id_project'], $this->datosPeticion['amount'],$this->datosPeticion['id_month'] )) {
			$idProject = (int) $this->datosPeticion['id_project'];
			$idMonth =  $this->datosPeticion['id_month'];
			$amount =  $this->datosPeticion['amount'];

			$query = $this->_conn->prepare("select * from tt_lines_fee_company where id_project='".$idProject."' and id_month='".$idMonth."'");
			$query->execute();
			$values = $query->fetch(PDO::FETCH_ASSOC);
			$filasActualizadas = $query->rowCount();
			if ($filasActualizadas == 1) {
				if($amount == '') {
					//update
					$query = $this->_conn->prepare("delete from tt_lines_fee_company where id='".$values['id']."'");
					$query->execute();
					$filasActualizadas = $query->rowCount();
					if($filasActualizadas == 1) {
							$jsonResponse['status'] = 'ok';
					} else {
						$jsonResponse['status'] = 'error';
					}
				} else{
					//update
					$query = $this->_conn->prepare("UPDATE tt_lines_fee_company set amount='".$amount."' where id='".$values['id']."'");
					$query->execute();
					$filasActualizadas = $query->rowCount();
					if($filasActualizadas == 1) {
							$jsonResponse['status'] = 'ok';
					} else {
						$jsonResponse['status'] = 'error';
					}
				}


			} else {
				//insert
				$query = $this->_conn->prepare("INSERT INTO tt_lines_fee_company(id_project, amount, id_month) values(
				'".$idProject."','".$amount."','".$idMonth."')");
				$query->execute();
				$filasActualizadas = $query->rowCount();
				if($filasActualizadas == 1) {
						$jsonResponse['status'] = 'ok';
				} else {
					$jsonResponse['status'] = 'error';
				}
			}
			$this->mostrarRespuesta($jsonResponse, 200);
		}
		else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}

	public function updateEstimatedEmployeeCost() {
		if ($_SERVER['REQUEST_METHOD'] != "GET") {
		 $this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}

		if (isset($this->datosPeticion['id_campaign'], $this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year'],
							$this->datosPeticion['amount'],$this->datosPeticion['id_month'] )) {
			$idCampaign = (int) $this->datosPeticion['id_campaign'];
			$idCompany = (int) $this->datosPeticion['id_company'];
			$idFiscalYear = (int) $this->datosPeticion['id_fiscal_year'];
			$idMonth =  $this->datosPeticion['id_month'];
			$amount =  $this->datosPeticion['amount'];

			$query = $this->_conn->prepare("select * from tt_estimated_employee_cost where id_campaign='".$idCampaign."' and id_month='".$idMonth."'");
			$query->execute();
			$values = $query->fetch(PDO::FETCH_ASSOC);
			$filasActualizadas = $query->rowCount();
			if ($filasActualizadas == 1) {
				if($amount == '') {
					//update
					$query = $this->_conn->prepare("delete from tt_estimated_employee_cost where id='".$values['id']."'");
					$query->execute();
					$filasActualizadas = $query->rowCount();
					if($filasActualizadas == 1) {
							$jsonResponse['status'] = 'ok';
					} else {
						$jsonResponse['status'] = 'error';
					}
				} else{
					//update
					$query = $this->_conn->prepare("UPDATE tt_estimated_employee_cost set amount='".$amount."' where id='".$values['id']."'");
					$query->execute();
					$filasActualizadas = $query->rowCount();
					if($filasActualizadas == 1) {
							$jsonResponse['status'] = 'ok';
					} else {
						$jsonResponse['status'] = 'error';
					}
				}


			} else {
				//insert
				$query = $this->_conn->prepare("INSERT INTO tt_estimated_employee_cost(id_campaign, amount, id_month) values(
				'".$idCampaign."','".$amount."','".$idMonth."')");
				$query->execute();
				$filasActualizadas = $query->rowCount();
				if($filasActualizadas == 1) {
						$jsonResponse['status'] = 'ok';
				} else {
					$jsonResponse['status'] = 'error';
				}
			}
			$this->mostrarRespuesta($jsonResponse, 200);
		}
		else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}

	public function updateRealEmployeeCost() {
		if ($_SERVER['REQUEST_METHOD'] != "GET") {
		 $this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}

		if (isset($this->datosPeticion['id_campaign'], $this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year'],
							$this->datosPeticion['amount'],$this->datosPeticion['id_month'] )) {
			$idCampaign = (int) $this->datosPeticion['id_campaign'];
			$idCompany = (int) $this->datosPeticion['id_company'];
			$idFiscalYear = (int) $this->datosPeticion['id_fiscal_year'];
			$idMonth =  $this->datosPeticion['id_month'];
			$amount =  $this->datosPeticion['amount'];

			$query = $this->_conn->prepare("select * from tt_real_employee_cost where id_campaign='".$idCampaign."' and id_month='".$idMonth."'");
			$query->execute();
			$values = $query->fetch(PDO::FETCH_ASSOC);
			$filasActualizadas = $query->rowCount();
			if ($filasActualizadas == 1) {
				if($amount == '-1') {
					//update
					$query = $this->_conn->prepare("delete from tt_real_employee_cost where id='".$values['id']."'");
					$query->execute();
					$filasActualizadas = $query->rowCount();
					if($filasActualizadas == 1) {
							$jsonResponse['status'] = 'ok';
					} else {
						$jsonResponse['status'] = 'error';
					}
				} else{
					//update
					$query = $this->_conn->prepare("UPDATE tt_real_employee_cost set amount='".$amount."' where id='".$values['id']."'");
					$query->execute();
					$filasActualizadas = $query->rowCount();
					if($filasActualizadas == 1) {
							$jsonResponse['status'] = 'ok';
					} else {
						$jsonResponse['status'] = 'error';
					}
				}


			} else {
				//insert
				$query = $this->_conn->prepare("INSERT INTO tt_real_employee_cost(id_campaign, amount, id_month) values(
				'".$idCampaign."','".$amount."','".$idMonth."')");
				$query->execute();
				$filasActualizadas = $query->rowCount();
				if($filasActualizadas == 1) {
						$jsonResponse['status'] = 'ok';
				} else {
					$jsonResponse['status'] = 'error';
				}
			}
			$this->mostrarRespuesta($jsonResponse, 200);
		}
		else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}

	public function getInfoCampaign() {
		if ($_SERVER['REQUEST_METHOD'] != "GET") {
	 	 $this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
	  }

	  if (isset($this->datosPeticion['id'], $this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year'])) {
			$idCampaign = (int) $this->datosPeticion['id'];
			$idCompany = (int) $this->datosPeticion['id_company'];
			$idFiscalYear = (int) $this->datosPeticion['id_fiscal_year'];

			$query = $this->_conn->prepare("select campaign.id, campaign.campaign_code, campaign.ped_code, campaign.observ_cli, campaign.observ_int, campaign.campaign_name, user.nickname as user, user.id as id_user, customer.customer_name as customer, customer.id as id_customer, team.team_name as team,
			team.id as id_team, grupo.name as grupo, grupo.id as id_group, subgroup.name as subgroup, subgroup.id as id_subgroup, status.status as status, status.id as id_status, campaign.creation_date, campaign.end_date, fiscal_year.year,
			customer.logo as customer_logo,customer.cif as customer_cif,customer.address as customer_address,customer.address_bis as customer_address_bis, customer.postal_code as customer_postal_code, customer.city as customer_city,
			(select sum(amount*unit_budget*price) as total from tt_subconcepts_billing, tt_billing where tt_billing.id=tt_subconcepts_billing.id_bill and tt_billing.id_project = campaign.id) as real_income, 
			campaign.id_address, campaign.contact,
			(select valuechar from tt_valuesbvsfields where idtable = campaign.id and freefieldsvscompanyid = 1) as project,
			(select valuedate from tt_valuesbvsfields where idtable = campaign.id and freefieldsvscompanyid = 2) as delivery_date,
			(select valuechar from tt_valuesbvsfields where idtable = campaign.id and freefieldsvscompanyid = 3) as phone, 
			(select valuechar from tt_valuesbvsfields where idtable = campaign.id and freefieldsvscompanyid = 4) as solicitant_data, 
			customer.phone as phone2, customer.email,
			(select count(*) from tt_billing where id_project = campaign.id) as numfacturas,
			campaign.btramite, 
			(select count(*) from tt_subconcepts_project, tt_articles_movement where tt_subconcepts_project.id_project = campaign.id and tt_articles_movement.subconcept_project_id = tt_subconcepts_project.id) as salidas,
			(select count(*) from tt_subconcepts_project, tt_articlesvslocation, tt_subconcepts_standards where tt_subconcepts_standards.bstockable = 1  and tt_subconcepts_standards.id = tt_articlesvslocation.article_id and tt_subconcepts_project.id_project = campaign.id and tt_articlesvslocation.subconcept_project_id = tt_subconcepts_project.id) as salidasptes
			FROM `tt_campaign` campaign
								left join `tt_user` user
								on campaign.id_user=user.id
								inner join `tt_customer` customer
								on campaign.id_customer=customer.id
								left join `tt_team` team
								on campaign.id_team=team.id
								left join `tt_group` grupo
								on campaign.id_group=grupo.id
								left join `tt_subgroup` subgroup
								on campaign.id_subgroup=subgroup.id
								inner join `tt_status` status
								on campaign.id_status=status.id
								inner join `tt_company_year` year
								on campaign.id_fiscal_year=year.id
								inner join `tt_fiscal_year` fiscal_year
								on year.id_fiscal_year=fiscal_year.id
								 where campaign.id='".$idCampaign."'");
			$query->execute();
			$info = $query->fetch(PDO::FETCH_ASSOC);

			$cost = $this->getCostCampaign($idCampaign,$info['year']);

			$query = $this->_conn->prepare("select * FROM `tt_estimated_employee_cost` where id_campaign='".$idCampaign."'");
			$query->execute();
			$employeeEstimatedCost = $query->fetchAll(PDO::FETCH_ASSOC);

			$query = $this->_conn->prepare("select * FROM `tt_real_employee_cost` where id_campaign='".$idCampaign."'");
			$query->execute();
			$employeeRealCost = $query->fetchAll(PDO::FETCH_ASSOC);

			$query = $this->_conn->prepare("select * from tt_budget_income where id_campaign='".$idCampaign."'");
			$query->execute();
			$incomes = $query->fetchAll(PDO::FETCH_ASSOC);

			$query = $this->_conn->prepare("select * from tt_lines_fee_company where id_project='".$idCampaign."'");
			$query->execute();
			$fee = $query->fetchAll(PDO::FETCH_ASSOC);

			$idx = 0;
			$arrayVariables = [];
			$strToSearch ="select * from tt_variable_concept where id_company=".$idCompany." and id_fiscal_year=".$idFiscalYear." order by  name ASC";
			foreach($this->_conn->query($strToSearch) as $row) {

				$arrayVariables[$idx]->id_variable_concept = $row['id'];
				$arrayVariables[$idx]->name_variable_concept = $row['name'];
				$arrayVariables[$idx]->account_number = $row['account_number'];

				$query = $this->_conn->prepare("select id_month, amount from tt_budget_expenses where id_variable_concept=".$row['id']." and id_campaign=".$idCampaign." and type=0");
				$query->execute();
				$expensesEstimated = $query->fetchAll(PDO::FETCH_ASSOC);
				$arrayVariables[$idx]->estimated_expenses = $expensesEstimated;

				$query = $this->_conn->prepare("select id_month, amount from tt_budget_expenses where id_variable_concept=".$row['id']." and id_campaign=".$idCampaign." and type=1");
				$query->execute();
				$expensesReal = $query->fetchAll(PDO::FETCH_ASSOC);
				$arrayVariables[$idx]->real_expenses = $expensesReal;
				$idx++;
			}

			$jsonResponse['status'] = 'ok';
			$jsonResponse['info'] = $info;
			$jsonResponse['customer'] = $info;
			$jsonResponse['expenses'] = $arrayVariables;
			$jsonResponse['employees_cost_estimated'] = $employeeEstimatedCost;
			$jsonResponse['employees_cost_real'] = $employeeRealCost;
			$jsonResponse['employees_cost_no_filtered'] = $cost;
			$jsonResponse['incomes_no_filtered'] = $incomes;
			$jsonResponse['fee_lines'] = $fee;
			$this->mostrarRespuesta($jsonResponse, 200);
		}
		else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}

	public function getInfoAlbaran() {
		if ($_SERVER['REQUEST_METHOD'] != "GET") {
	 	 $this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
	  }

	  if (isset($this->datosPeticion['id'], $this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year'])) {
			$idCampaign = (int) $this->datosPeticion['id'];
			$idCompany = (int) $this->datosPeticion['id_company'];
			$idFiscalYear = (int) $this->datosPeticion['id_fiscal_year'];

			$query = $this->_conn->prepare("select campaign.id, campaign.campaign_code, campaign.ped_code, campaign.observ_cli, campaign.observ_int, campaign.campaign_name, user.nickname as user, user.id as id_user, customer.customer_name as customer, customer.id as id_customer, team.team_name as team,
			team.id as id_team, grupo.name as grupo, grupo.id as id_group, subgroup.name as subgroup, subgroup.id as id_subgroup, status.status as status, status.id as id_status, campaign.creation_date, campaign.end_date, fiscal_year.year,
			customer.logo as customer_logo,customer.cif as customer_cif,customer.address as customer_address,customer.address_bis as customer_address_bis, customer.postal_code as customer_postal_code, customer.city as customer_city,
			(select sum(amount*unit_budget*price) as total from tt_subconcepts_billing, tt_billing where tt_billing.id=tt_subconcepts_billing.id_bill and tt_billing.id_project = campaign.id) as real_income, 
			campaign.id_address, campaign.contact,
			(select valuechar from tt_valuesbvsfields where idtable = campaign.id and freefieldsvscompanyid = 1) as project,
			(select valuedate from tt_valuesbvsfields where idtable = campaign.id and freefieldsvscompanyid = 2) as delivery_date,
			(select valuechar from tt_valuesbvsfields where idtable = campaign.id and freefieldsvscompanyid = 3) as phone, 
			(select valuechar from tt_valuesbvsfields where idtable = campaign.id and freefieldsvscompanyid = 4) as solicitant_data, 
			customer.phone as phone2, customer.email,
			(select count(*) from tt_billing where id_project = campaign.id) as numfacturas,
			campaign.btramite, 
			(select count(*) from tt_subconcepts_project, tt_articles_movement where tt_subconcepts_project.id_project = campaign.id and tt_articles_movement.subconcept_project_id = tt_subconcepts_project.id) as salidas
			FROM `tt_campaign` campaign
								left join `tt_user` user
								on campaign.id_user=user.id
								inner join `tt_customer` customer
								on campaign.id_customer=customer.id
								left join `tt_team` team
								on campaign.id_team=team.id
								left join `tt_group` grupo
								on campaign.id_group=grupo.id
								left join `tt_subgroup` subgroup
								on campaign.id_subgroup=subgroup.id
								inner join `tt_status` status
								on campaign.id_status=status.id
								inner join `tt_company_year` year
								on campaign.id_fiscal_year=year.id
								inner join `tt_fiscal_year` fiscal_year
								on year.id_fiscal_year=fiscal_year.id
								 where campaign.id='".$idCampaign."'");
			$query->execute();
			$info = $query->fetch(PDO::FETCH_ASSOC);

			$query = $this->_conn->prepare("select tt_subconcepts_project.*, case when (select max(bstockable) from tt_subconcepts_standards where tt_subconcepts_standards.code = tt_subconcepts_project.code) is null then 0 
			else (select max(bstockable) from tt_subconcepts_standards where tt_subconcepts_standards.code = tt_subconcepts_project.code) end as bstockable
											from tt_subconcepts_project
											where id_project = ".$idCampaign."
								order by id_variable_concept, id");

			$query->execute();
			$lines = $query->fetchAll(PDO::FETCH_ASSOC);								

			$jsonResponse['status'] = 'ok';
			$jsonResponse['info'] = $info;
			$jsonResponse['lines'] = $lines;

			$this->mostrarRespuesta($jsonResponse, 200);
		}
		else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}

	public function getInfoBudget() {
		if ($_SERVER['REQUEST_METHOD'] != "GET") {
	 	 $this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
	  }

	  if (isset($this->datosPeticion['id'], $this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year'])) {
			$idBudget = (int) $this->datosPeticion['id'];
			$idCompany = (int) $this->datosPeticion['id_company'];
			$idFiscalYear = (int) $this->datosPeticion['id_fiscal_year'];
			$id_team = $this->getTeamFromToken($this->datosPeticion['token']);

			$queryStr = "select budget.id, budget.name, user.nickname as user, user.id as id_user, customer.customer_name as customer, customer.id as id_customer, team.team_name as team,
			team.id as id_team, grupo.name as grupo, grupo.id as id_group, subgroup.name as subgroup, subgroup.id as id_subgroup, fiscal_year.year,
			customer.logo as customer_logo,customer.cif as customer_cif,customer.address as customer_address,customer.address_bis as customer_address_bis
			FROM `tt_budget` budget
								inner join `tt_user` user
								on budget.id_user=user.id
								inner join `tt_customer` customer
								on budget.id_customer=customer.id
								inner join `tt_team` team
								on budget.id_team=team.id
								inner join `tt_group` grupo
								on budget.id_group=grupo.id
								inner join `tt_subgroup` subgroup
								on budget.id_subgroup=subgroup.id
								inner join `tt_company_year` year
								on budget.id_fiscal_year=year.id
								inner join `tt_fiscal_year` fiscal_year
								on year.id_fiscal_year=fiscal_year.id
								where budget.id='".$idBudget."'";

			if ($id_team == 0) {
				$queryStr = "select budget.id, budget.name, user.nickname as user, user.id as id_user, customer.customer_name as customer, customer.id as id_customer,
				grupo.name as grupo, grupo.id as id_group, subgroup.name as subgroup, subgroup.id as id_subgroup, fiscal_year.year,
				customer.logo as customer_logo,customer.cif as customer_cif,customer.address as customer_address,customer.address_bis as customer_address_bis
				FROM `tt_budget` budget
									inner join `tt_user` user
									on budget.id_user=user.id
									inner join `tt_customer` customer
									on budget.id_customer=customer.id
									inner join `tt_group` grupo
									on budget.id_group=grupo.id
									inner join `tt_subgroup` subgroup
									on budget.id_subgroup=subgroup.id
									inner join `tt_company_year` year
									on budget.id_fiscal_year=year.id
									inner join `tt_fiscal_year` fiscal_year
									on year.id_fiscal_year=fiscal_year.id
									where budget.id='".$idBudget."'";
			}
			$query = $this->_conn->prepare($queryStr);
			$query->execute();
			$info = $query->fetch(PDO::FETCH_ASSOC);

			$cost = $this->getCostCampaign($idBudget,$info['year']);

			$query = $this->_conn->prepare("select * FROM `tt_estimated_employee_cost` where id_campaign='".$idBudget."'");
			$query->execute();
			$employeeEstimatedCost = $query->fetchAll(PDO::FETCH_ASSOC);

			$query = $this->_conn->prepare("select * FROM `tt_real_employee_cost` where id_campaign='".$idBudget."'");
			$query->execute();
			$employeeRealCost = $query->fetchAll(PDO::FETCH_ASSOC);

			$query = $this->_conn->prepare("select * from tt_budget_income where id_campaign='".$idBudget."'");
			$query->execute();
			$incomes = $query->fetchAll(PDO::FETCH_ASSOC);

			$query = $this->_conn->prepare("select * from tt_lines_fee_company where id_project='".$idBudget."'");
			$query->execute();
			$fee = $query->fetchAll(PDO::FETCH_ASSOC);

			$idx = 0;
			$arrayVariables = [];
			$strToSearch ="select * from tt_variable_concept where id_company=".$idCompany." and id_fiscal_year=".$idFiscalYear." order by  name ASC";
			foreach($this->_conn->query($strToSearch) as $row) {

				$arrayVariables[$idx]->id_variable_concept = $row['id'];
				$arrayVariables[$idx]->name_variable_concept = $row['name'];
				$arrayVariables[$idx]->account_number = $row['account_number'];

				$query = $this->_conn->prepare("select id_month, amount from tt_budget_expenses where id_variable_concept=".$row['id']." and id_campaign=".$idBudget." and type=0");
				$query->execute();
				$expensesEstimated = $query->fetchAll(PDO::FETCH_ASSOC);
				$arrayVariables[$idx]->estimated_expenses = $expensesEstimated;

				$query = $this->_conn->prepare("select id_month, amount from tt_budget_expenses where id_variable_concept=".$row['id']." and id_campaign=".$idBudget." and type=1");
				$query->execute();
				$expensesReal = $query->fetchAll(PDO::FETCH_ASSOC);
				$arrayVariables[$idx]->real_expenses = $expensesReal;
				$idx++;
			}

			$jsonResponse['status'] = 'ok';
			$jsonResponse['info'] = $info;
			$jsonResponse['customer'] = $info;
			$jsonResponse['expenses'] = $arrayVariables;
			$jsonResponse['employees_cost_estimated'] = $employeeEstimatedCost;
			$jsonResponse['employees_cost_real'] = $employeeRealCost;
			$jsonResponse['employees_cost_no_filtered'] = $cost;
			$jsonResponse['incomes_no_filtered'] = $incomes;
			$jsonResponse['fee_lines'] = $fee;
			$this->mostrarRespuesta($jsonResponse, 200);
		}
		else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}
	/**
	 * Obtiene el coste de personal para una campaña en concreto
	 */
	public function getCostCampaign($idCampaign, $fiscalYear) {

		if($idCampaign){
			$whereClause = " and date>='".$fiscalYear."-01-01' and date<='".$fiscalYear."-12-31'";

			$strToSearch = "select id_user, sum_hours, date from tt_user_hours where id_campaign='".$idCampaign."'".$whereClause;
			$costUser = 0;
			$arrayHours = [];
			$idx = 0;
			foreach($this->_conn->query($strToSearch) as $row) {
				$costUser = $this->getCostUser($row['id_user'], $row['date'], $row['sum_hours']/60);

				$arrayHours[$idx]->date = $row['date'];
				$arrayHours[$idx]->cost = $costUser;
				$idx++;
			}

			return $arrayHours;
		} else {
			return false;
		}
	}

	/**
	 * Obtiene el coste de personal para unas campañas en concreto
	 */
	public function getEmployeeCostCampaigns($idCampaigns, $idFiscalYear) {

		if($idCampaigns){
			$QfiscalYear = "Select year from `tt_company_year` company_year inner join `tt_fiscal_year` fiscal_year where company_year.id_fiscal_year=fiscal_year.id and company_year.id='".$idFiscalYear."'";
			$query = $this->_conn->query($QfiscalYear);
			$fiscalYear = $query->fetch(PDO::FETCH_ASSOC);

			$whereClause = " and date>='".$fiscalYear['year']."-01-01' and date<='".$fiscalYear['year']."-12-31'";

			$strToSearch = "select id_user, sum_hours, date from tt_user_hours where id_campaign IN ".$idCampaigns."".$whereClause;

			$costUser = 0;
			$arrayHours = [];
			$idx = 0;
			foreach($this->_conn->query($strToSearch) as $row) {
				$costUser = $this->getCostUser($row['id_user'], $row['date'], $row['sum_hours']/60);

				$arrayHours[$idx]->date = $row['date'];
				$arrayHours[$idx]->cost = $costUser;
				$idx++;
			}

			return $arrayHours;
		} else {
			return false;
		}
	}

	/**
	 * Obtiene el coste de personal para compañia y año, mensualizado
	 */
	public function getCostEmployeeCompanyYear($idCompany, $fiscalYear) {
		$strToSearch = "select id from tt_campaign where id_company='".$idCompany."' and id_fiscal_year='".$fiscalYear."'";
		$idsCampaigns = '';
		foreach($this->_conn->query($strToSearch) as $row) {
			$idsCampaigns .= $row['id'].",";
		}
		$idsCampaigns = "(".substr($idsCampaigns, 0, -1).")";

		$value = $this->getEmployeeCostCampaigns($idsCampaigns, $fiscalYear);

		return $value;
	}

	public function getCostEmployeeByCampaings($idsCampaigns, $fiscalYear) {
		$idsCampaigns = $idsCampaigns;

		$value = $this->getEmployeeCostCampaigns($idsCampaigns, $fiscalYear);

		return $value;
	}

	public function getCostUser($idUser, $date, $time) {
		$query = $this->_conn->query("select hours from tt_hours");
		$rows = $query->fetch(PDO::FETCH_ASSOC);
		$hoursAtYear =$rows['hours'];

		$salaryCost = "Select cost, registration_date from tt_salary_history where id_user='".$idUser."' and registration_date<='".$date."' order by registration_date DESC LIMIT 1";
		$query = $this->_conn->query($salaryCost);
		$users = $query->fetch(PDO::FETCH_ASSOC);

		$costAnual = $users['cost'];

		$costByHour =  $costAnual/$hoursAtYear;

		return $costByHour * $time;
	}

	/** END BREAKDOWN CAMPAIGN **/

	/** MONTH REPORT **/

	public function getMonthReport() {
		if ($_SERVER['REQUEST_METHOD'] != "GET") {
	 	 $this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
	  }

	  if (isset($this->datosPeticion['customer'], $this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year'], $this->datosPeticion['team'],
							$this->datosPeticion['group'], $this->datosPeticion['subgroup'])) {
			$idCompany = (int) $this->datosPeticion['id_company'];
			$idFiscalYear = (int) $this->datosPeticion['id_fiscal_year'];
			$customer = $this->datosPeticion['customer'];
			$team = $this->datosPeticion['team'];
			$group = $this->datosPeticion['group'];
			$subgroup = $this->datosPeticion['subgroup'];

			$strToSearch = "select id from tt_campaign where id_company='".$idCompany."' and id_fiscal_year='".$idFiscalYear."' ";

			if ($customer != '' && $customer != 'null') {
				$strToSearch = $strToSearch." and id_customer='".$customer."'";
			}
			if ($team != '' && $team != 'null') {
				$strToSearch = $strToSearch." and id_team='".$team."'";
			}
			if ($group != '' && $group != 'null') {
				$strToSearch = $strToSearch." and id_group='".$group."'";
			}
			if ($subgroup != '' && $subgroup != 'null') {
				$strToSearch = $strToSearch." and id_subgroup='".$subgroup."'";
			}
			// Seleccionamos los id de campaña que cumplan con los filtros
			$idsCampaigns = '';
			$lenProjects = 0;
			foreach($this->_conn->query($strToSearch) as $row) {
				$idsCampaigns .= $row['id'].",";
				$lenProjects = $lenProjects + 1;
			}
			$jsonResponse['len_projects'] = $lenProjects;
			if ($idsCampaigns == '' ){
				$incomesMonthEstimated = new monthModel();
				$incomesMonthReal = new monthModel();
				$incomesMonthDifferences = new monthModel();
				$jsonResponse['info']->real = ($incomesMonthReal);
				$jsonResponse['incomes']->real = ($incomesMonthReal);
				$jsonResponse['incomes']->estimated = ($incomesMonthEstimated);
				$jsonResponse['incomes']->differences = ($incomesMonthDifferences);

				$expensesMonthEstimated = new monthModel();
				$expensesMonthReal = new monthModel();
				$expensesMonthDifferences = new monthModel();
				$jsonResponse['expenses']->real = $expensesMonthReal;
				$jsonResponse['expenses']->estimated = $expensesMonthEstimated;
				$jsonResponse['expenses']->differences = $expensesMonthDifferences;

				$benefitMonthEstimated = new monthModel();
				$benefitMonthReal = new monthModel();
				$benefitMonthDifferences = new monthModel();
				$jsonResponse['benefit']->real = $benefitMonthReal;
				$jsonResponse['benefit']->estimated = $benefitMonthEstimated;
				$jsonResponse['benefit']->differences = $benefitMonthDifferences;

				$this->mostrarRespuesta($jsonResponse, 200);

			} else {
				$idsCampaigns = '('.substr($idsCampaigns, 0, -1).')';
				// Seleccionamos los ingresos de las campañas seleccionadas para ESTIMADAS
				$strToSearch = "Select id_month, sum(amount) as amount from tt_budget_income where id_campaign IN ".$idsCampaigns." and type=0 group by type,id_month order by id_campaign";
				$query = $this->_conn->prepare($strToSearch);
				$query->execute();
				$incomesEstimated = $query->fetchAll(PDO::FETCH_ASSOC);
				// Seleccionamos los ingresos de las campañas seleccionadas para REALES
				$strToSearch = "Select id_month, sum(amount) as amount from tt_budget_income where id_campaign IN ".$idsCampaigns." and type=1 group by type,id_month order by id_campaign";
				$query = $this->_conn->prepare($strToSearch);
				$query->execute();
				$incomesReal = $query->fetchAll(PDO::FETCH_ASSOC);

				$incomesMonthEstimated = new monthModel();
				$incomesMonthReal = new monthModel();
				$incomesMonthDifferences = new monthModel();
				/**
				* INGRESOS
				*/
				// Ingreso estimados totales
				foreach ($incomesEstimated as $item) {
					$key = $item['id_month'];
					$value = $item['amount'];
					$incomesMonthEstimated->$key =  number_format((float) $value, 2);
				}
				// Ingreso reales totales
				foreach ($incomesReal as $item) {
					$key = $item['id_month'];
					$value = $item['amount'];
					$incomesMonthReal->$key =  number_format((float) $value, 2);
				}
				// Diferencia Ingresos totales
				$incomesMonthDifferences->january = number_format((float)$incomesMonthReal->january - $incomesMonthEstimated->january,2);
				$incomesMonthDifferences->february = number_format((float)$incomesMonthReal->february - $incomesMonthEstimated->february,2);
				$incomesMonthDifferences->march = number_format((float)$incomesMonthReal->march - $incomesMonthEstimated->march,2);
				$incomesMonthDifferences->april = number_format((float)$incomesMonthReal->april - $incomesMonthEstimated->april,2);
				$incomesMonthDifferences->may = number_format((float)$incomesMonthReal->may - $incomesMonthEstimated->may,2);
				$incomesMonthDifferences->june = number_format((float)$incomesMonthReal->june - $incomesMonthEstimated->june,2);
				$incomesMonthDifferences->july = number_format((float)$incomesMonthReal->july - $incomesMonthEstimated->july,2);
				$incomesMonthDifferences->august = number_format((float)$incomesMonthReal->august - $incomesMonthEstimated->august,2);
				$incomesMonthDifferences->september = number_format((float)$incomesMonthReal->september - $incomesMonthEstimated->september,2);
				$incomesMonthDifferences->october = number_format((float)$incomesMonthReal->october - $incomesMonthEstimated->october,2);
				$incomesMonthDifferences->november = number_format((float)$incomesMonthReal->november - $incomesMonthEstimated->november,2);
				$incomesMonthDifferences->december = number_format((float)$incomesMonthReal->december - $incomesMonthEstimated->december,2);



				$jsonResponse['status'] = 'ok';
				$jsonResponse['incomes']->real = ($incomesMonthReal);
				$jsonResponse['incomes']->estimated = ($incomesMonthEstimated);
				$jsonResponse['incomes']->differences = ($incomesMonthDifferences);

				/**
				* GASTOS
				*/
				$expensesMonthEstimated = new monthModel();
				$expensesMonthReal = new monthModel();
				$expensesMonthDifferences = new monthModel();

				$costEmployeeTracker = $this->getEmployeeCostCampaigns($idsCampaigns,$idFiscalYear);

				// Añadimos los gastos del personal de TRACKER a los gastos reales
				foreach ($costEmployeeTracker as $item) {
					$date = $item->date;
					$cost = $item->cost;
					$splitted = explode('-',(String) $date);
					switch ($splitted[1]) {
						case '01':
							$expensesMonthReal->january = number_format((float)($expensesMonthReal->january + $cost),2);
							break;
						case '02':
							$expensesMonthReal->february = number_format((float)($expensesMonthReal->february + $cost),2);
							break;
						case '03':
							$expensesMonthReal->march = number_format((float)($expensesMonthReal->march + $cost),2);
							break;
						case '04':
							$expensesMonthReal->april = number_format((float)($expensesMonthReal->april + $cost),2);
							break;
						case '05':
							$expensesMonthReal->may = number_format((float)($expensesMonthReal->may + $cost),2);
							break;
						case '06':
							$expensesMonthReal->june = number_format((float)($expensesMonthReal->june + $cost),2);
							break;
						case '07':
							$expensesMonthReal->july = number_format((float)($expensesMonthReal->july + $cost),2);
							break;
						case '08':
							$expensesMonthReal->august = number_format((float)($expensesMonthReal->august + $cost),2);
							break;
						case '09':
							$expensesMonthReal->september = number_format((float)($expensesMonthReal->september + $cost),2);
							break;
						case '10':
							$expensesMonthReal->october = number_format((float)($expensesMonthReal->october + $cost),2);
							break;
						case '11':
							$expensesMonthReal->november = number_format((float)($expensesMonthReal->november + $cost),2);
							break;
						case '12':
							$expensesMonthReal->december = number_format((float)($expensesMonthReal->december + $cost),2);
							break;
					}
				}
				// Añadimos a los gastos reales, los de los gastos de empleados añadidos desde Gesad
				$strToSearch = "select id_month, amount FROM `tt_real_employee_cost` where id_campaign IN ".$idsCampaigns;
				$query = $this->_conn->prepare($strToSearch);
				$query->execute();
				$expensesEmployeesReal = $query->fetchAll(PDO::FETCH_ASSOC);

				foreach ($expensesEmployeesReal as $item) {
					$key = $item['id_month'];
					$value = $item['amount'];
					$expensesMonthReal->$key =  number_format((float)($expensesMonthReal->$key + (float)$value),2);
				}
				// Añadimos a los gastos estimados, los de los gastos de empleados añadidos desde Gesad
				$strToSearch = "select id_month, amount FROM `tt_estimated_employee_cost` where id_campaign IN ".$idsCampaigns;
				$query = $this->_conn->prepare($strToSearch);
				$query->execute();
				$expensesEmployeesEstimated = $query->fetchAll(PDO::FETCH_ASSOC);

				foreach ($expensesEmployeesEstimated as $item) {
					$key = $item['id_month'];
					$value = $item['amount'];
					$expensesMonthEstimated->$key =  number_format((float)($expensesMonthEstimated->$key + (float)$value),2);
				}

				// Añadimos a los gastos, el valor de los conceptos variables
				$idx = 0;
				$arrayVariables = [];
				$strToSearch ="select id from tt_variable_concept where id_company=".$idCompany." and id_fiscal_year=".$idFiscalYear;
				foreach($this->_conn->query($strToSearch) as $row) {

					$query = $this->_conn->prepare("select id_month, amount from tt_budget_expenses where id_campaign IN ".$idsCampaigns." and id_variable_concept=".$row['id']." and type=0");
					$query->execute();
					$expensesEstimated = $query->fetchAll(PDO::FETCH_ASSOC);
					$arrayVariables[$idx]->estimated_expenses = $expensesEstimated;

					$query = $this->_conn->prepare("select id_month, amount from tt_budget_expenses where id_campaign IN ".$idsCampaigns."  and id_variable_concept=".$row['id']." and type=1");
					$query->execute();
					$expensesReal = $query->fetchAll(PDO::FETCH_ASSOC);
					$arrayVariables[$idx]->real_expenses = $expensesReal;
					$idx++;
				}
				foreach ($arrayVariables as $item) {
					foreach ($item->estimated_expenses as $inner) {
						$key = $inner['id_month'];
						$value = $inner['amount'];
						$expensesMonthEstimated->$key =  number_format((float)($expensesMonthEstimated->$key + (float)$value),2);
					}
					foreach ($item->real_expenses as $inner) {
						$key = $inner['id_month'];
						$value = $inner['amount'];
						$expensesMonthReal->$key =  number_format((float)($expensesMonthReal->$key + (float)$value),2);
					}
				}

				// Diferencia Gastos totales
				$expensesMonthDifferences->january = number_format((float)$expensesMonthReal->january - $expensesMonthEstimated->january,2);
				$expensesMonthDifferences->february = number_format((float)$expensesMonthReal->february - $expensesMonthEstimated->february,2);
				$expensesMonthDifferences->march = number_format((float)$expensesMonthReal->march - $expensesMonthEstimated->march,2);
				$expensesMonthDifferences->april = number_format((float)$expensesMonthReal->april - $expensesMonthEstimated->april,2);
				$expensesMonthDifferences->may = number_format((float)$expensesMonthReal->may - $expensesMonthEstimated->may,2);
				$expensesMonthDifferences->june = number_format((float)$expensesMonthReal->june - $expensesMonthEstimated->june,2);
				$expensesMonthDifferences->july = number_format((float)$expensesMonthReal->july - $expensesMonthEstimated->july,2);
				$expensesMonthDifferences->august = number_format((float)$expensesMonthReal->august - $expensesMonthEstimated->august,2);
				$expensesMonthDifferences->september = number_format((float)$expensesMonthReal->september - $expensesMonthEstimated->september,2);
				$expensesMonthDifferences->october = number_format((float)$expensesMonthReal->october - $expensesMonthEstimated->october,2);
				$expensesMonthDifferences->november = number_format((float)$expensesMonthReal->november - $expensesMonthEstimated->november,2);
				$expensesMonthDifferences->december = number_format((float)$expensesMonthReal->december - $expensesMonthEstimated->december,2);

				$jsonResponse['expenses']->real = $expensesMonthReal;
				$jsonResponse['expenses']->estimated = $expensesMonthEstimated;
				$jsonResponse['expenses']->differences = $expensesMonthDifferences;

				/**
				* BENEFICIOS
				*/
				$benefitMonthEstimated = new monthModel();
				$benefitMonthReal = new monthModel();
				$benefitMonthDifferences = new monthModel();

				$benefitMonthEstimated->january = number_format((float)$incomesMonthEstimated->january - $expensesMonthEstimated->january,2);
				$benefitMonthEstimated->february = number_format((float)$incomesMonthEstimated->february - $expensesMonthEstimated->february,2);
				$benefitMonthEstimated->march = number_format((float)$incomesMonthEstimated->march - $expensesMonthEstimated->march,2);
				$benefitMonthEstimated->april = number_format((float)$incomesMonthEstimated->april - $expensesMonthEstimated->april,2);
				$benefitMonthEstimated->may = number_format((float)$incomesMonthEstimated->may - $expensesMonthEstimated->may,2);
				$benefitMonthEstimated->june = number_format((float)$incomesMonthEstimated->june - $expensesMonthEstimated->june,2);
				$benefitMonthEstimated->july = number_format((float)$incomesMonthEstimated->july - $expensesMonthEstimated->july,2);
				$benefitMonthEstimated->august = number_format((float)$incomesMonthEstimated->august - $expensesMonthEstimated->august,2);
				$benefitMonthEstimated->september = number_format((float)$incomesMonthEstimated->september - $expensesMonthEstimated->september,2);
				$benefitMonthEstimated->october = number_format((float)$incomesMonthEstimated->october - $expensesMonthEstimated->october,2);
				$benefitMonthEstimated->november = number_format((float)$incomesMonthEstimated->november - $expensesMonthEstimated->november,2);
				$benefitMonthEstimated->december = number_format((float)$incomesMonthEstimated->december - $expensesMonthEstimated->december,2);

				$benefitMonthReal->january = number_format((float)$incomesMonthReal->january - $expensesMonthReal->january,2);
				$benefitMonthReal->february = number_format((float)$incomesMonthReal->february - $expensesMonthReal->february,2);
				$benefitMonthReal->march = number_format((float)$incomesMonthReal->march - $expensesMonthReal->march,2);
				$benefitMonthReal->april = number_format((float)$incomesMonthReal->april - $expensesMonthReal->april,2);
				$benefitMonthReal->may = number_format((float)$incomesMonthReal->may - $expensesMonthReal->may,2);
				$benefitMonthReal->june = number_format((float)$incomesMonthReal->june - $expensesMonthReal->june,2);
				$benefitMonthReal->july = number_format((float)$incomesMonthReal->july - $expensesMonthReal->july,2);
				$benefitMonthReal->august = number_format((float)$incomesMonthReal->august - $expensesMonthReal->august,2);
				$benefitMonthReal->september = number_format((float)$incomesMonthReal->september - $expensesMonthReal->september,2);
				$benefitMonthReal->october = number_format((float)$incomesMonthReal->october - $expensesMonthReal->october,2);
				$benefitMonthReal->november = number_format((float)$incomesMonthReal->november - $expensesMonthReal->november,2);
				$benefitMonthReal->december = number_format((float)$incomesMonthReal->december - $expensesMonthReal->december,2);

				$benefitMonthDifferences->january = number_format((float)$incomesMonthDifferences->january - $expensesMonthDifferences->january,2);
				$benefitMonthDifferences->february = number_format((float)$incomesMonthDifferences->february - $expensesMonthDifferences->february,2);
				$benefitMonthDifferences->march = number_format((float)$incomesMonthDifferences->march - $expensesMonthDifferences->march,2);
				$benefitMonthDifferences->april = number_format((float)$incomesMonthDifferences->april - $expensesMonthDifferences->april,2);
				$benefitMonthDifferences->may = number_format((float)$incomesMonthDifferences->may - $expensesMonthDifferences->may,2);
				$benefitMonthDifferences->june = number_format((float)$incomesMonthDifferences->june - $expensesMonthDifferences->june,2);
				$benefitMonthDifferences->july = number_format((float)$incomesMonthDifferences->july - $expensesMonthDifferences->july,2);
				$benefitMonthDifferences->august = number_format((float)$incomesMonthDifferences->august - $expensesMonthDifferences->august,2);
				$benefitMonthDifferences->september = number_format((float)$incomesMonthDifferences->september - $expensesMonthDifferences->september,2);
				$benefitMonthDifferences->october = number_format((float)$incomesMonthDifferences->october - $expensesMonthDifferences->october,2);
				$benefitMonthDifferences->november = number_format((float)$incomesMonthDifferences->november - $expensesMonthDifferences->november,2);
				$benefitMonthDifferences->december = number_format((float)$incomesMonthDifferences->december - $expensesMonthDifferences->december,2);

				$jsonResponse['benefit']->real = $benefitMonthReal;
				$jsonResponse['benefit']->estimated = $benefitMonthEstimated;
				$jsonResponse['benefit']->differences = $benefitMonthDifferences;

				$this->mostrarRespuesta($jsonResponse, 200);

			}

		}
		else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}

	public function getInfoMonthReport() {
		if (isset($this->datosPeticion['id_company']) ) {
			$idCompany = $this->datosPeticion['id_company'];
			$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];

			$response = $this->operationApi("SELECT id, campaign_name FROM tt_campaign where id_company='".$idCompany."' and id_fiscal_year='".$id_fiscal_year."' order by campaign_name ASC", 'GET');
			if ( $response != false) {
				$jsonResponse['projects'] = $response;
			}

			$response = $this->operationApi("SELECT id, team_name FROM tt_team where id_company='".$idCompany."' order by team_name ASC", 'GET');
			if ( $response != false) {
				$jsonResponse['teams'] = $response;
			}
			$response = $this->operationApi("SELECT id, name, id_customer FROM tt_group where id_company='".$idCompany."'  order by name ASC", 'GET');
			if ( $response != false) {
				$jsonResponse['groups'] = $response;
			}
			$response = $this->operationApi("SELECT id, name, id_group FROM tt_subgroup where id_company='".$idCompany."' order by name ASC", 'GET');
			if ( $response != false) {
				$jsonResponse['subgroups'] = $response;
			}
			$response = $this->operationApi("SELECT id, customer_name FROM tt_customer where id_company='".$idCompany."' order by customer_name ASC", 'GET');
			if ( $response != false) {
				$jsonResponse['customers'] = $response;
			}

			$this->mostrarRespuesta($jsonResponse, 200);
		}
		else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}
	/** END MONTH REPORT **/

	/** PROJECTS REPORT **/

	private function updateLastLogin() {
		if ($_SERVER['REQUEST_METHOD'] != "PUT") {
			$this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}
		if (isset($this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year'], $this->datosPeticion['token'])) {
			$id_company = $this->datosPeticion['id_company'];
			$id_fiscal_year = $this->datosPeticion['id_fiscal_year'];
			$id_user = $this->getIdUserFromToken($this->datosPeticion['token']);

			$query = "update tt_user set last_id_company_logged=".$id_company.", last_id_fiscal_year_logged=".$id_fiscal_year." where id='".$id_user."'";
			$query = $this->_conn->prepare($query);
			$query->execute();
		}
		$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
	}

	public function getProjectsReport() {
		if ($_SERVER['REQUEST_METHOD'] != "GET") {
		 $this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}
		if(!$this->isValidUserToken($this->datosPeticion['token'])) {
			return false;
		}
		$role = $this->getRoleFromToken($this->datosPeticion['token']);
		$id_user = $this->getIdUserFromToken($this->datosPeticion['token']);
		if (isset($this->datosPeticion['customer'], $this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year'], $this->datosPeticion['team'],
							$this->datosPeticion['group'], $this->datosPeticion['subgroup'], $this->datosPeticion['start_date'], $this->datosPeticion['end_date'])) {

			$idCompany = (int) $this->datosPeticion['id_company'];
			$idFiscalYear = (int) $this->datosPeticion['id_fiscal_year'];
			$customer = $this->datosPeticion['customer'];
			$team = $this->datosPeticion['team'];
			$group = $this->datosPeticion['group'];
			$subgroup = $this->datosPeticion['subgroup'];
			$start_date = $this->datosPeticion['start_date'];
			$end_date = $this->datosPeticion['end_date'];

			$yearSelected = "SELECT y.year FROM  `tt_company_year` cy INNER JOIN  `tt_fiscal_year` y ON cy.id_fiscal_year = y.id WHERE cy.id =".$idFiscalYear;
			$query = $this->_conn->prepare($yearSelected);
			$query->execute();
			$year = $query->fetch(PDO::FETCH_ASSOC);

			$strToSearch = "select campaign.id as id_campaign, campaign.campaign_code, campaign.ped_code, campaign.campaign_name, user.nickname as user, user.id as id_user, customer.customer_name as customer, customer.id as id_customer, team.team_name as team,
				team.id as id_team, grupo.name as grupo, grupo.id as id_group, subgroup.name as subgroup, subgroup.id as id_subgroup, status.status as status, status.id as id_status, campaign.creation_date, campaign.end_date, fiscal_year.year
				FROM `tt_campaign` campaign
							inner join `tt_user` user
							on campaign.id_user=user.id
							inner join `tt_customer` customer
							on campaign.id_customer=customer.id
							inner join `tt_team` team
							on campaign.id_team=team.id
							inner join `tt_group` grupo
							on campaign.id_group=grupo.id
							inner join `tt_subgroup` subgroup
							on campaign.id_subgroup=subgroup.id
							inner join `tt_status` status
							on campaign.id_status=status.id
							inner join `tt_company_year` year
							on campaign.id_fiscal_year=year.id
							inner join `tt_fiscal_year` fiscal_year
							on year.id_fiscal_year=fiscal_year.id
							WHERE campaign.id_company='".$idCompany."' and campaign.id_fiscal_year='".$idFiscalYear."'";

			if ($customer != '' && $customer != 'null') {
				$strToSearch = $strToSearch." and campaign.id_customer='".$customer."'";
			}
			if ($team != '' && $team != 'null') {
				$strToSearch = $strToSearch." and campaign.id_team='".$team."'";
			}
			if ($group != '' && $group != 'null') {
				$strToSearch = $strToSearch." and campaign.id_group='".$group."'";
			}
			if ($subgroup != '' && $subgroup != 'null') {
				$strToSearch = $strToSearch." and campaign.id_subgroup='".$subgroup."'";
			}
			if($role == 7 || $role == 6) {
				$query = $this->_conn->prepare("select id_team from tt_user where id=".$id_user);
				$query->execute();
				$team = $query->fetch(PDO::FETCH_ASSOC);
				$id_team = $team['id_team'];
				$strToSearch = $strToSearch." and campaign.id_team='".$id_team."'";
			}
			if($role == 7) {
				$strToSearch = $strToSearch." and (campaign.id_user='".$id_user."' or campaign.security_level='Bajo')";
			}

			if ($start_date != '' && $start_date != 'null') {
				$strToSearch = $strToSearch." and campaign.creation_date >='".$year['year']."-".$start_date."-01'";
			}
			if ($end_date != '' && $end_date != 'null') {
				$strToSearch = $strToSearch." and campaign.creation_date <='".$year['year']."-".$end_date."-01'";
			}

			$strToSearch = $strToSearch.' order by campaign.campaign_code ASC';

			// Seleccionamos los id de campaña que cumplan con los filtros
			$idsCampaigns = '';
			$lenProjects = 0;

			$jsonResponse['report']->budget = [];
			$jsonResponse['report']->approved = [];
			$jsonResponse['report']->finished = [];

			foreach($this->_conn->query($strToSearch) as $row) {
				$idCampaignSelected = $row['id_campaign'];
				$yearSelected = $row['year'];
				$idsCampaigns .= $row['id_campaign'].",";
				$lenProjects = $lenProjects + 1;

				if ($idsCampaigns == '' ){
					$types = new typesModel();
					$types->info = new infoProjectModel();
					$types->real = new reportProjectModel();
					$types->estimated = new reportProjectModel();
					$types->differences = new reportProjectModel();
					array_push($jsonResponse['report']->budget, $types);
					array_push($jsonResponse['report']->approved, $types);
					array_push($jsonResponse['report']->finished, $types);

					$this->mostrarRespuesta($jsonResponse, 200);

				} else {

					$types = new typesModel();
					$types->info = new infoProjectModel();
					$types->info->customer = $row['customer'];
					$types->info->team = $row['team'];
					$types->info->group = $row['grupo'];
					$types->info->subgroup = $row['subgroup'];
					$types->info->projectName = $row['campaign_name'];
					$types->info->projectCode = $row['campaign_code'];
					$types->real = new reportProjectModel();
					$types->estimated = new reportProjectModel();
					$types->differences = new reportProjectModel();

					// Seleccionamos los ingresos de las campañas seleccionadas para ESTIMADAS
					$strToSearch = "Select id_month, sum(amount) as amount from tt_budget_income where id_campaign=".$idCampaignSelected." and type=0 group by type,id_month order by id_campaign";
					$query = $this->_conn->prepare($strToSearch);
					$query->execute();
					$incomesEstimated = $query->fetchAll(PDO::FETCH_ASSOC);

					// Seleccionamos los ingresos de las campañas seleccionadas para REALES
					$strToSearch = "Select id_month, sum(amount) as amount from tt_budget_income where id_campaign=".$idCampaignSelected." and type=1 group by type,id_month order by id_campaign";
					$query = $this->_conn->prepare($strToSearch);
					$query->execute();
					$incomesReal = $query->fetchAll(PDO::FETCH_ASSOC);

					$incomesE = 0;
					$incomesR = 0;
					$incomesD = 0;
					/**
					* INGRESOS
					*/
					// Ingreso estimados totales
					foreach ($incomesEstimated as $item) {
						$value = $item['amount'];
						$incomesE = $incomesE + (float) $value;
					}
					// Ingreso reales totales
					foreach ($incomesReal as $item) {
						$value = $item['amount'];
						$incomesR = $incomesR + (float) $value;
					}
					// Diferencia Ingresos totales
					$incomesD = (float)$incomesR - $incomesE;
					$incomesR = (float) $incomesR;
					$incomesE = (float) $incomesE;

					/**
					* GASTOS
					*/
					$expensesMonthEstimated = 0;
					$expensesMonthReal = 0;
					$expensesMonthDifferences = 0;

					$expensesTotalEmployeesEstimated = 0;
					$expensesTotalEmployeesReal = 0;
					$expensesTotalEmployeesDifferences = 0;

					$costEmployeeTracker = $this->getCostCampaign($idCampaignSelected,$yearSelected);
					// Añadimos los gastos del personal de TRACKER a los gastos reales
					foreach ($costEmployeeTracker as $item) {
						$cost = $item->cost;
						$expensesTotalEmployeesReal = $expensesTotalEmployeesReal + (float)$cost;
					}
					// Gastos de personal reales(si hay alguno, directamente se sustituye por lo de TRACKER), los de los gastos de empleados añadidos desde Gesad
					$strToSearch = "select id_month, amount FROM `tt_real_employee_cost` where id_campaign = ".$idCampaignSelected;
					$query = $this->_conn->prepare($strToSearch);
					$query->execute();
					$expensesEmployeesReal = $query->fetchAll(PDO::FETCH_ASSOC);
					if (count($expensesEmployeesReal)>0) {
						$expensesTotalEmployeesReal = 0;
						foreach ($expensesEmployeesReal as $item) {
							$value = $item['amount'];
							$expensesTotalEmployeesReal =  (float)($expensesTotalEmployeesReal + (float)$value);
						}
					} else {
						$expensesTotalEmployeesReal =  (float)($expensesTotalEmployeesReal);
					}
					//  Gastos de personal estimados, los de los gastos de empleados añadidos desde Gesad
					$strToSearch = "select id_month, amount FROM `tt_estimated_employee_cost` where id_campaign = ".$idCampaignSelected;
					$query = $this->_conn->prepare($strToSearch);
					$query->execute();
					$expensesEmployeesEstimated = $query->fetchAll(PDO::FETCH_ASSOC);

					foreach ($expensesEmployeesEstimated as $item) {
						$value = $item['amount'];
						$expensesTotalEmployeesEstimated =  (float)($expensesTotalEmployeesEstimated + (float)$value);
					}

					$expensesTotalEmployeesDifferences = (float)$expensesTotalEmployeesReal - (float)$expensesTotalEmployeesEstimated;

					// Añadimos a los gastos, el valor de los conceptos variables
					$idx = 0;
					$arrayVariables = [];
					$strToSearch ="select id from tt_variable_concept where id_company=".$idCompany." and id_fiscal_year=".$idFiscalYear;
					foreach($this->_conn->query($strToSearch) as $rowInner) {

						$query = $this->_conn->prepare("select id_month, amount from tt_budget_expenses where id_campaign=".$idCampaignSelected." and id_variable_concept=".$rowInner['id']." and type=0");
						$query->execute();
						$expensesEstimated = $query->fetchAll(PDO::FETCH_ASSOC);
						$arrayVariables[$idx]->estimated_expenses = $expensesEstimated;

						$query = $this->_conn->prepare("select id_month, amount from tt_budget_expenses where id_campaign=".$idCampaignSelected." and id_variable_concept=".$rowInner['id']." and type=1");
						$query->execute();
						$expensesReal = $query->fetchAll(PDO::FETCH_ASSOC);
						$arrayVariables[$idx]->real_expenses = $expensesReal;
						$idx++;
					}
					foreach ($arrayVariables as $item) {
						foreach ($item->estimated_expenses as $inner) {
							$value = $inner['amount'];
							$expensesMonthEstimated =  (float)($expensesMonthEstimated + (float)$value);
						}
						foreach ($item->real_expenses as $inner) {
							$value = $inner['amount'];
							$expensesMonthReal =  (float)($expensesMonthReal + (float)$value);
						}
					}

					// Diferencia Gastos totales
					$expensesMonthDifferences = (float)$expensesMonthReal - (float)$expensesMonthEstimated;


					$types->estimated->incomes = $incomesE;
					$types->estimated->expenses = $expensesMonthEstimated;
					$types->estimated->employees = $expensesTotalEmployeesEstimated;
					$types->estimated->benefits = (float)$incomesE - (float)$expensesMonthEstimated - (float)$expensesTotalEmployeesEstimated;
					$types->estimated->margin = Shared::calculateMargins($incomesE, ($expensesMonthEstimated + $expensesTotalEmployeesEstimated));

					$types->real->incomes = $incomesR;
					$types->real->expenses = $expensesMonthReal;
					$types->real->employees = $expensesTotalEmployeesReal;
					$types->real->benefits = (float)$incomesR - (float)$expensesMonthReal - (float)$expensesTotalEmployeesReal;
					$types->real->margin = Shared::calculateMargins($incomesR, ($expensesMonthReal + $expensesTotalEmployeesReal));

					$types->differences->incomes = $incomesD;
					$types->differences->expenses = $expensesMonthDifferences;
					$types->differences->employees = $expensesTotalEmployeesDifferences;
					$types->differences->benefits = (float)$incomesD - (float)$expensesMonthDifferences - (float)$expensesTotalEmployeesDifferences;
					$types->differences->margin = Shared::calculateMargins($incomesD, ($expensesMonthDifferences + $expensesTotalEmployeesDifferences));

					switch ($row['id_status']) {
						case 1:
							array_push($jsonResponse['report']->budget, $types);
							break;
						case 2:
							array_push($jsonResponse['report']->approved, $types);
							break;
						case 3:
							array_push($jsonResponse['report']->finished, $types);
							break;
					}

				}
			}

			$jsonResponse['len_projects'] = $lenProjects;

			$this->mostrarRespuesta($jsonResponse, 200);

		}
		else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}

	/** END PROJECTS REPORT **/

	/** REPORT COMPANY **/

	public function updateCompanyReport() {
		if ($_SERVER['REQUEST_METHOD'] != "GET") {
		 $this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}

		if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
			return false;
		}

		if (isset($this->datosPeticion['id_company_year'], $this->datosPeticion['amortizacion'], $this->datosPeticion['extraordinario'],
			$this->datosPeticion['financiero'])) {
			$idCompanyYear = (int) $this->datosPeticion['id_company_year'];
			$amortizacion = $this->datosPeticion['amortizacion'];
			$extraordinario = $this->datosPeticion['extraordinario'];
			$financiero = $this->datosPeticion['financiero'];

			$query = $this->_conn->prepare("select * from tt_company_report where id_company_year=".$idCompanyYear);
			$query->execute();
			$filas = $query->fetch(PDO::FETCH_ASSOC);
			$items = $query->rowCount();
			if ($items > 0) {
				// update
				$query = $this->_conn->prepare("UPDATE tt_company_report set
					amortizacion='".$amortizacion."',
					gasto_financiero='".$financiero."',
					gasto_extraordinario='".$extraordinario."' where id='".$filas['id']."'");
				$query->execute();
				$jsonResponse['status'] = 'ok';
				$this->mostrarRespuesta($jsonResponse, 200);
			}	else{
				//insert
				$query = $this->_conn->prepare("INSERT INTO tt_company_report(id_company_year, amortizacion, gasto_financiero, gasto_extraordinario)
				values(".$idCompanyYear.", ".$amortizacion.", ".$financiero.",".$extraordinario.")");
				$query->execute();
				$filasActualizadas = $query->rowCount();
				if($filasActualizadas == 1) {
					$jsonResponse['status'] = 'ok';
					$this->mostrarRespuesta($jsonResponse, 200);
				}
			}
		}
		else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}

	public function getIncomeBudget() {
		if ($_SERVER['REQUEST_METHOD'] != "GET") {
		 $this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}

		if(!$this->isValidUserToken($this->datosPeticion['token'])) {
			return false;
		}
		if (isset($this->datosPeticion['id_project'])) {
			$idProject = (int) $this->datosPeticion['id_project'];

			$strToSearch = "Select * from tt_budget_income where id_campaign =".$idProject." and type=0";

			$query = $this->_conn->prepare($strToSearch);
			$query->execute();
			$incomesEstimated = $query->fetchAll(PDO::FETCH_ASSOC);
			$jsonResponse['incomes'] = $incomesEstimated;
			$jsonResponse['status'] = 'ok';

			$this->mostrarRespuesta($jsonResponse, 200);
		}
	}
	public function getCompanyReportStatistic() {
		if ($_SERVER['REQUEST_METHOD'] != "GET") {
		 $this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}

		if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
			return false;
		}

		if (isset($this->datosPeticion['id_company_year'], $this->datosPeticion['id_company'])) {
			$idCompany = (int) $this->datosPeticion['id_company'];
			$idCompanyYear = (int) $this->datosPeticion['id_company_year'];

			$query = $this->_conn->prepare("select tax from tt_company_year where id=".$idCompanyYear);
			$query->execute();
			$taxes = $query->fetch(PDO::FETCH_ASSOC);
			$jsonResponse['tax'] = $taxes['tax'];

			$query = $this->_conn->prepare("select  pesimist, optimist from tt_budget_cost where id_company=".$idCompany);
			$query->execute();
			$percents = $query->fetch(PDO::FETCH_ASSOC);
			$jsonResponse['percents']->pessimist = $percents['pesimist'];
			$jsonResponse['percents']->optimist = $percents['optimist'];

			$strToSearch = "select id from tt_campaign where id_fiscal_year='".$idCompanyYear."' ";

			$idsCampaigns = '';
			$lenProjects = 0;
			foreach($this->_conn->query($strToSearch) as $row) {
				$idsCampaigns .= $row['id'].",";
				$lenProjects = $lenProjects + 1;
			}
			$jsonResponse['len_projects'] = $lenProjects;

			$jsonResponse['report']->incomes = 0;
			$jsonResponse['report']->expenses = 0;
			$jsonResponse['report']->employees = 0;
			$jsonResponse['report']->margin = 0;
			$jsonResponse['report']->fixed_cost = 0;
			$jsonResponse['report']->amortizacion = 0;
			$jsonResponse['report']->financiero = 0;
			$jsonResponse['report']->extraordinario = 0;

			if ($idsCampaigns != '') {
				$idsCampaigns = '('.substr($idsCampaigns, 0, -1).')';
				// INGRESOS
				$strToSearch = "Select sum(amount) as amount from tt_budget_income where id_campaign IN ".$idsCampaigns." and type=0";
				$query = $this->_conn->prepare($strToSearch);
				$query->execute();
				$incomesEstimated = $query->fetch(PDO::FETCH_ASSOC);
				$jsonResponse['report']->incomes = $incomesEstimated['amount'];

				// COSTE DE PERSONAL
				$strToSearch = "SELECT SUM( amount ) AS amount FROM  `tt_estimated_employee_cost` WHERE id_campaign IN ".$idsCampaigns;
				$query = $this->_conn->prepare($strToSearch);
				$query->execute();
				$expensesEmployeesEstimated = $query->fetch(PDO::FETCH_ASSOC);
				$jsonResponse['report']->employees = number_format((float) $expensesEmployeesEstimated['amount'], 2);

				// GASTOS (CONCEPTOS VARIABLES)
				$idx = 0;
				$arrayVariables = [];
				$strToSearch ="select id from tt_variable_concept where id_fiscal_year=".$idCompanyYear." order by name ASC";
				$expensesMonthEstimated = 0;
				foreach($this->_conn->query($strToSearch) as $rowInner) {
					//echo "select sum(amount) as total, id_month from tt_lines_subconcept where id_project IN ".$idsCampaigns." and id_variable_concept=".$rowInner['id']." group by id_month";
					$query = $this->_conn->prepare("select sum(amount) as total from tt_lines_subconcept where id_project IN ".$idsCampaigns." and id_variable_concept=".$rowInner['id']);
					//$query = $this->_conn->prepare("select sum(amount) as total from tt_budget_expenses where id_campaign IN ".$idsCampaigns." and id_variable_concept=".$rowInner['id']." and type=0");
					$query->execute();
					$expensesEstimated = $query->fetch(PDO::FETCH_ASSOC);

					$arrayVariables[$idx]->estimated_expenses = (float)$expensesEstimated['total'];
					$expensesMonthEstimated =  (float)($expensesMonthEstimated + (float)$expensesEstimated['total']);

					$idx++;
				}
				$jsonResponse['report']->expenses = $expensesMonthEstimated;

				// Seleccionamos las cuentas a excluir que vienen de la configuracion
				$query = $this->_conn->prepare("select amortizacion, extraordinario, financiero from tt_company_year where id=".$idCompanyYear);
				$query->execute();
				$accounts_setting = $query->fetch(PDO::FETCH_ASSOC);
				$ids_to_exclude = $accounts_setting['amortizacion'].",".$accounts_setting['financiero'].",".$accounts_setting['extraordinario'];

				// COSTES FIJOS: a excepcion de los que vengan por la configuracion

				$query = $this->_conn->prepare("select fixed_concept_parent.name as parent_name, fixed_concept.name as children_name,id_fixed_concept, sum(amount) as total, fixed_concept.id_parent
						from `tt_expenses_fixed_concept` expenses
						inner join `tt_fixed_concept` fixed_concept on expenses.id_fixed_concept=fixed_concept.id
						inner join `tt_fixed_concept` fixed_concept_parent on fixed_concept.id_parent=fixed_concept_parent.id
						where expenses.id_fiscal_year='".$idCompanyYear."' and expenses.type='0' and fixed_concept_parent.id NOT IN (".$ids_to_exclude.")
						group by id_fixed_concept
						order by fixed_concept_parent.name ASC");
				$query->execute();
				$fixedCosts = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->fixed_cost = $fixedCosts;

				// COSTES FIJOS: provienen de las cuentas que hay marcadas en la configuracion para amortizacion, extraordinario y financiero
				/* AMORTIZACION */
				$query = $this->_conn->prepare("select fixed_concept_parent.name as parent_name, fixed_concept.name as children_name,id_fixed_concept, sum(amount) as total, fixed_concept.id_parent
						from `tt_expenses_fixed_concept` expenses
						inner join `tt_fixed_concept` fixed_concept on expenses.id_fixed_concept=fixed_concept.id
						inner join `tt_fixed_concept` fixed_concept_parent on fixed_concept.id_parent=fixed_concept_parent.id
						where expenses.id_fiscal_year='".$idCompanyYear."' and expenses.type='0' and fixed_concept_parent.id=".$accounts_setting['amortizacion']."
						group by id_fixed_concept
						order by fixed_concept_parent.name ASC");
				$query->execute();
				$amortizacion = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->amortizacion = $amortizacion;
				/* FINANCIERO */
				$query = $this->_conn->prepare("select fixed_concept_parent.name as parent_name, fixed_concept.name as children_name,id_fixed_concept, sum(amount) as total, fixed_concept.id_parent
						from `tt_expenses_fixed_concept` expenses
						inner join `tt_fixed_concept` fixed_concept on expenses.id_fixed_concept=fixed_concept.id
						inner join `tt_fixed_concept` fixed_concept_parent on fixed_concept.id_parent=fixed_concept_parent.id
						where expenses.id_fiscal_year='".$idCompanyYear."' and expenses.type='0' and fixed_concept_parent.id=".$accounts_setting['financiero']."
						group by id_fixed_concept
						order by fixed_concept_parent.name ASC");
				$query->execute();
				$financiero = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->financiero = $financiero;
				/* EXTRAORDINARIO */
				$query = $this->_conn->prepare("select fixed_concept_parent.name as parent_name, fixed_concept.name as children_name,id_fixed_concept, sum(amount) as total, fixed_concept.id_parent
						from `tt_expenses_fixed_concept` expenses
						inner join `tt_fixed_concept` fixed_concept on expenses.id_fixed_concept=fixed_concept.id
						inner join `tt_fixed_concept` fixed_concept_parent on fixed_concept.id_parent=fixed_concept_parent.id
						where expenses.id_fiscal_year='".$idCompanyYear."' and expenses.type='0' and fixed_concept_parent.id=".$accounts_setting['extraordinario']."
						group by id_fixed_concept
						order by fixed_concept_parent.name ASC");
				$query->execute();
				$extraordinario = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->extraordinario = $extraordinario;
			}

			$margin = (float)$incomesEstimated['amount'] - (float)$expensesEmployeesEstimated['amount'];

			$margin = $margin - (float)$expensesMonthEstimated;
			$jsonResponse['report']->margin = number_format((float)$margin ,2);

			$this->mostrarRespuesta($jsonResponse, 200);

		}
		else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}

	public function getCompanyReportNew() {
		if ($_SERVER['REQUEST_METHOD'] != "GET") {
		 $this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}

		if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
			return false;
		}

		if (isset($this->datosPeticion['id_company_year'], $this->datosPeticion['id_company'])) {
			$idCompany = (int) $this->datosPeticion['id_company'];
			$idCompanyYear = (int) $this->datosPeticion['id_company_year'];
			$anyo = (int) $this->datosPeticion['anyo'];


			$query = $this->_conn->prepare("select tax from tt_company_year where id=".$idCompanyYear);
			$query->execute();
			$taxes = $query->fetch(PDO::FETCH_ASSOC);
			$jsonResponse['tax'] = $taxes['tax'];

			$strToSearch = "select id from tt_campaign where id_fiscal_year='".$idCompanyYear."' ";

			$idsCampaigns = '';
			$lenProjects = 0;
			foreach($this->_conn->query($strToSearch) as $row) {
				$idsCampaigns .= $row['id'].",";
				$lenProjects = $lenProjects + 1;
			}
			$jsonResponse['len_projects'] = $lenProjects;

			$jsonResponse['report']->incomes_budget = 0;
			$jsonResponse['report']->incomes_real = 0;

			$jsonResponse['report']->employees_budget = [];
			$jsonResponse['report']->employees_real = [];

			$jsonResponse['report']->margin = 0;
			$jsonResponse['report']->fixed_cost = 0;

			if ($idsCampaigns != '') {
				$idsCampaigns = '('.substr($idsCampaigns, 0, -1).')';
				// INGRESOS
				$strToSearch = "Select sum(amount) as total, id_month from tt_budget_income where id_campaign IN ".$idsCampaigns." and type=0 group by id_month";
				$query = $this->_conn->prepare($strToSearch);
				$query->execute();
				$incomesEstimated = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->incomes_budget = $incomesEstimated;
				$strToSearch = "Select sum(amount) as total, id_month from tt_budget_income where id_campaign IN ".$idsCampaigns." and type=1 group by id_month";
				$query = $this->_conn->prepare($strToSearch);
				$query->execute();
				$incomesReal = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->incomes_real = $incomesReal;

				// COSTE DE PERSONAL
				$strToSearch = "SELECT SUM( amount ) AS amount, id_month FROM  `tt_estimated_employee_cost` WHERE id_campaign IN ".$idsCampaigns." group by id_month";
				$query = $this->_conn->prepare($strToSearch);
				$query->execute();
				$expensesEmployeesEstimated = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->employees_budget = $expensesEmployeesEstimated;

				$costEmployeeTracker = $this->getCostEmployeeCompanyYear($idCompany,$idCompanyYear);
				$jsonResponse['report']->employees_real = $costEmployeeTracker;
				$strToSearch = "SELECT SUM( amount ) AS amount, id_month FROM  `tt_real_employee_cost` WHERE id_campaign IN ".$idsCampaigns." group by id_month";
				$query = $this->_conn->prepare($strToSearch);
				$query->execute();
				$expensesEmployeesReal = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->employees_real_gesad = $expensesEmployeesReal;

				// GASTOS (CONCEPTOS VARIABLES)
				$idx = 0;
				$arrayVariables = [];
				$idsVariableConcept = '';
				$strToSearch ="select id from tt_variable_concept where id_fiscal_year=".$idCompanyYear." order by name ASC";
				foreach($this->_conn->query($strToSearch) as $rowInner) {
					$idsVariableConcept .= $rowInner['id'].",";
				}
				$idsVariableConcept = substr($idsVariableConcept, 0, -1);
				$query = $this->_conn->prepare("select sum(amount) as total, id_month from tt_lines_subconcept where id_project IN ".$idsCampaigns." and id_variable_concept IN (".$idsVariableConcept.") group by id_month");
				$query->execute();
				$expenses = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->expenses_budget = $expenses;

				$query = $this->_conn->prepare("select sum(amount) as total, id_month from tt_budget_expenses where id_campaign IN ".$idsCampaigns." and id_variable_concept IN (".$idsVariableConcept.") and type=1 group by id_month");
				$query->execute();
				$expenses = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->expenses_real = $expenses;

				// COSTES FIJOS
				// Seleccionamos las cuentas a excluir que vienen de la configuracion
				$query = $this->_conn->prepare("select amortizacion, extraordinario, financiero from tt_company_year where id=".$idCompanyYear);
				$query->execute();
				$accounts_setting = $query->fetch(PDO::FETCH_ASSOC);
				$ids_to_exclude = '('.$accounts_setting['amortizacion'].",".$accounts_setting['financiero'].",".$accounts_setting['extraordinario'].')';

				// COSTES FIJOS: a excepcion de los que vengan por la configuracion
				$query = $this->_conn->prepare("SELECT expenses.id_fixed_concept, fixed_concept.id_parent,fixed_concept.name as children_name, fixed_concept_parent.name as parent_name, expenses.id_month, sum(expenses.amount) as total
				FROM `tt_expenses_fixed_concept` expenses inner join `tt_fixed_concept` fixed_concept on fixed_concept.id=expenses.id_fixed_concept inner join `tt_fixed_concept` fixed_concept_parent on fixed_concept.id_parent=fixed_concept_parent.id
				where expenses.type='0' and expenses.id_fiscal_year='".$idCompanyYear."' and fixed_concept_parent.id NOT IN ".$ids_to_exclude." group by expenses.id_fixed_concept,expenses.id_month ORDER BY `id_fixed_concept` ASC");
				$query->execute();
				$fixedCosts = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->fixed_cost_budget = $fixedCosts;

				//COSTES VARIABLES PRESUPUESTADOS

				$query = $this->_conn->prepare("SELECT name, amount, month(date) as id_month, tt_variable_concept.id
				FROM `tt_budget_expenses` inner join `tt_variable_concept` on tt_variable_concept.id=tt_budget_expenses.id_variable_concept
				where tt_budget_expenses.type = 0 and tt_budget_expenses.id_fiscal_year='".$idCompanyYear."' and YEAR(date)=".$anyo."
					union all
				SELECT tt_variable_concept.name, round(amount*unit_real,2), month(creation_date) as id_month, tt_variable_concept.id
				FROM `tt_subconcepts_project` inner join `tt_variable_concept` on tt_variable_concept.id=tt_subconcepts_project.id_variable_concept
				inner join `tt_campaign` tt_project on tt_project.id = tt_subconcepts_project.id_project
				where tt_project.id_fiscal_year='".$idCompanyYear."'
				and YEAR(creation_date)=".$anyo."
				ORDER BY name ASC");

				$query->execute();
				$variablesCosts = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->costes_variales_estimados = $variablesCosts;

				//COSTES VARIABLES REALES

				$query = $this->_conn->prepare("SELECT name, amount, month(date) as id_month, tt_variable_concept.id
				FROM `tt_budget_expenses` inner join `tt_variable_concept` on tt_variable_concept.id=tt_budget_expenses.id_variable_concept
				where tt_budget_expenses.type = 1 and tt_budget_expenses.id_fiscal_year='".$idCompanyYear."' and YEAR(date)=".$anyo." ORDER BY tt_variable_concept.name ASC");


				$query->execute();
				$variablesCostsReal = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->costes_variales_reales = $variablesCostsReal;

				//INGRESOS VARIABLES PRESUPUESTADOS
				$query = $this->_conn->prepare("SELECT name, amount, id_month, tt_variable_concept.id
				FROM `tt_budget_income` inner join `tt_variable_concept` on tt_variable_concept.id=tt_budget_income.id_variable_concept
                union all
				SELECT tt_variable_concept.name, round(amount*unit_budget*price,2), month(creation_date) as id_month, tt_variable_concept.id
				FROM `tt_subconcepts_project` inner join `tt_variable_concept` on tt_variable_concept.id=tt_subconcepts_project.id_variable_concept
				inner join `tt_campaign` tt_project on tt_project.id = tt_subconcepts_project.id_project
				where tt_project.id_fiscal_year='".$idCompanyYear."' and YEAR(creation_date)=".$anyo."
				ORDER BY `id` ASC");
				$query->execute();
				$variablesIncome = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->ingresos_variales_estimados = $variablesIncome;

				//INGRESOS VARIABLES REALES (FACTURAS)
				$query = $this->_conn->prepare("SELECT tt_variable_concept.name, round(amount*unit_budget*price,2) as amount, month(issue_date) as id_month, tt_variable_concept.id
				FROM `tt_subconcepts_billing` inner join `tt_variable_concept` on tt_variable_concept.id=tt_subconcepts_billing.id_variable_concept
				inner join `tt_billing` tt_billing on tt_billing.id = tt_subconcepts_billing.id_bill
				where tt_billing.id_fiscal_year='".$idCompanyYear."'
				and YEAR(issue_date)=".$anyo."
				ORDER BY `id` ASC");
				$query->execute();
				$variablesIncomeReal = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->ingresos_variales_reales = $variablesIncomeReal;

				// AMORTIZACION
				$query = $this->_conn->prepare("SELECT expenses.id_fixed_concept, fixed_concept.id_parent,fixed_concept.name as children_name, fixed_concept_parent.name as parent_name, expenses.id_month, sum(expenses.amount) as total
				FROM `tt_expenses_fixed_concept` expenses inner join `tt_fixed_concept` fixed_concept on fixed_concept.id=expenses.id_fixed_concept inner join `tt_fixed_concept` fixed_concept_parent on fixed_concept.id_parent=fixed_concept_parent.id
				where expenses.type='0' and expenses.id_fiscal_year='".$idCompanyYear."' and fixed_concept_parent.id ='".$accounts_setting['amortizacion']."' group by expenses.id_month ORDER BY `id_fixed_concept` ASC");
				$query->execute();
				$fixedCosts = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->amortizacion_budget = $fixedCosts;
				$query = $this->_conn->prepare("SELECT expenses.id_fixed_concept, fixed_concept.id_parent,fixed_concept.name as children_name, fixed_concept_parent.name as parent_name, expenses.id_month, sum(expenses.amount) as total
				FROM `tt_expenses_fixed_concept` expenses inner join `tt_fixed_concept` fixed_concept on fixed_concept.id=expenses.id_fixed_concept inner join `tt_fixed_concept` fixed_concept_parent on fixed_concept.id_parent=fixed_concept_parent.id
				where expenses.type='1' and expenses.id_fiscal_year='".$idCompanyYear."' and fixed_concept_parent.id ='".$accounts_setting['amortizacion']."' group by expenses.id_month ORDER BY `id_fixed_concept` ASC");
				$query->execute();
				$fixedCosts = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->amortizacion_real = $fixedCosts;

				//FINANCIERO
				$query = $this->_conn->prepare("SELECT expenses.id_fixed_concept, fixed_concept.id_parent,fixed_concept.name as children_name, fixed_concept_parent.name as parent_name, expenses.id_month, sum(expenses.amount) as total
				FROM `tt_expenses_fixed_concept` expenses inner join `tt_fixed_concept` fixed_concept on fixed_concept.id=expenses.id_fixed_concept inner join `tt_fixed_concept` fixed_concept_parent on fixed_concept.id_parent=fixed_concept_parent.id
				where expenses.type='0' and expenses.id_fiscal_year='".$idCompanyYear."' and fixed_concept_parent.id='".$accounts_setting['financiero']."' group by expenses.id_month ORDER BY `id_fixed_concept` ASC");
				$query->execute();
				$fixedCosts = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->financiero_budget = $fixedCosts;
				$query = $this->_conn->prepare("SELECT expenses.id_fixed_concept, fixed_concept.id_parent,fixed_concept.name as children_name, fixed_concept_parent.name as parent_name, expenses.id_month, sum(expenses.amount) as total
				FROM `tt_expenses_fixed_concept` expenses inner join `tt_fixed_concept` fixed_concept on fixed_concept.id=expenses.id_fixed_concept inner join `tt_fixed_concept` fixed_concept_parent on fixed_concept.id_parent=fixed_concept_parent.id
				where expenses.type='1' and expenses.id_fiscal_year='".$idCompanyYear."' and fixed_concept_parent.id='".$accounts_setting['financiero']."' group by expenses.id_month ORDER BY `id_fixed_concept` ASC");
				$query->execute();
				$fixedCosts = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->financiero_real = $fixedCosts;

				//EXTRAORDINARIO
				$query = $this->_conn->prepare("SELECT expenses.id_fixed_concept, fixed_concept.id_parent,fixed_concept.name as children_name, fixed_concept_parent.name as parent_name, expenses.id_month, sum(expenses.amount) as total
				FROM `tt_expenses_fixed_concept` expenses inner join `tt_fixed_concept` fixed_concept on fixed_concept.id=expenses.id_fixed_concept inner join `tt_fixed_concept` fixed_concept_parent on fixed_concept.id_parent=fixed_concept_parent.id
				where expenses.type='0' and expenses.id_fiscal_year='".$idCompanyYear."' and fixed_concept_parent.id='".$accounts_setting['extraordinario']."' group by expenses.id_month ORDER BY `id_fixed_concept` ASC");
				$query->execute();
				$fixedCosts = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->extraordinario_budget = $fixedCosts;
				$query = $this->_conn->prepare("SELECT expenses.id_fixed_concept, fixed_concept.id_parent,fixed_concept.name as children_name, fixed_concept_parent.name as parent_name, expenses.id_month, sum(expenses.amount) as total
				FROM `tt_expenses_fixed_concept` expenses inner join `tt_fixed_concept` fixed_concept on fixed_concept.id=expenses.id_fixed_concept inner join `tt_fixed_concept` fixed_concept_parent on fixed_concept.id_parent=fixed_concept_parent.id
				where expenses.type='1' and expenses.id_fiscal_year='".$idCompanyYear."' and fixed_concept_parent.id='".$accounts_setting['extraordinario']."' group by expenses.id_month ORDER BY `id_fixed_concept` ASC");
				$query->execute();
				$fixedCosts = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->extraordinario_real = $fixedCosts;

				// FEE DE EMPRESA
				$query = $this->_conn->prepare("SELECT id_month, sum(amount) as amount FROM `tt_lines_fee_company` WHERE id_project IN ".$idsCampaigns." group by id_month");
				$query->execute();
				$fixedCosts = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->fee_budget = $fixedCosts;

				$jsonResponse['report']->fee_real = [];
			}

			$this->mostrarRespuesta($jsonResponse, 200);

		}
		else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}


	public function getCompanyReport() {
		if ($_SERVER['REQUEST_METHOD'] != "GET") {
		 $this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}

		if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
			return false;
		}

		if (isset($this->datosPeticion['id_company_year'], $this->datosPeticion['id_company'])) {
			$idCompany = (int) $this->datosPeticion['id_company'];
			$idCompanyYear = (int) $this->datosPeticion['id_company_year'];

			$query = $this->_conn->prepare("select tax from tt_company_year where id=".$idCompanyYear);
			$query->execute();
			$taxes = $query->fetch(PDO::FETCH_ASSOC);
			$jsonResponse['tax'] = $taxes['tax'];

			$strToSearch = "select id from tt_campaign where id_fiscal_year='".$idCompanyYear."' ";

			$idsCampaigns = '';
			$lenProjects = 0;
			foreach($this->_conn->query($strToSearch) as $row) {
				$idsCampaigns .= $row['id'].",";
				$lenProjects = $lenProjects + 1;
			}
			$jsonResponse['len_projects'] = $lenProjects;

			$jsonResponse['report']->incomes_budget = 0;
			$jsonResponse['report']->incomes_real = 0;

			$jsonResponse['report']->employees_budget = [];
			$jsonResponse['report']->employees_real = [];

			$jsonResponse['report']->margin = 0;
			$jsonResponse['report']->fixed_cost = 0;

			if ($idsCampaigns != '') {
				$idsCampaigns = '('.substr($idsCampaigns, 0, -1).')';
				// INGRESOS
				$strToSearch = "Select sum(amount) as total, id_month from tt_budget_income where id_campaign IN ".$idsCampaigns." and type=0 group by id_month";
				$query = $this->_conn->prepare($strToSearch);
				$query->execute();
				$incomesEstimated = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->incomes_budget = $incomesEstimated;
				$strToSearch = "Select sum(amount) as total, id_month from tt_budget_income where id_campaign IN ".$idsCampaigns." and type=1 group by id_month";
				$query = $this->_conn->prepare($strToSearch);
				$query->execute();
				$incomesReal = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->incomes_real = $incomesReal;

				// COSTE DE PERSONAL
				$strToSearch = "SELECT SUM( amount ) AS amount, id_month FROM  `tt_estimated_employee_cost` WHERE id_campaign IN ".$idsCampaigns." group by id_month";
				$query = $this->_conn->prepare($strToSearch);
				$query->execute();
				$expensesEmployeesEstimated = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->employees_budget = $expensesEmployeesEstimated;

				$costEmployeeTracker = $this->getCostEmployeeCompanyYear($idCompany,$idCompanyYear);
				$jsonResponse['report']->employees_real = $costEmployeeTracker;
				$strToSearch = "SELECT SUM( amount ) AS amount, id_month FROM  `tt_real_employee_cost` WHERE id_campaign IN ".$idsCampaigns." group by id_month";
				$query = $this->_conn->prepare($strToSearch);
				$query->execute();
				$expensesEmployeesReal = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->employees_real_gesad = $expensesEmployeesReal;

				// GASTOS (CONCEPTOS VARIABLES)
				$idx = 0;
				$arrayVariables = [];
				$idsVariableConcept = '';
				$strToSearch ="select id from tt_variable_concept where id_fiscal_year=".$idCompanyYear." order by name ASC";
				foreach($this->_conn->query($strToSearch) as $rowInner) {
					$idsVariableConcept .= $rowInner['id'].",";
				}
				$idsVariableConcept = substr($idsVariableConcept, 0, -1);
				$query = $this->_conn->prepare("select sum(amount) as total, id_month from tt_lines_subconcept where id_project IN ".$idsCampaigns." and id_variable_concept IN (".$idsVariableConcept.") group by id_month");
				$query->execute();
				$expenses = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->expenses_budget = $expenses;

				$query = $this->_conn->prepare("select sum(amount) as total, id_month from tt_budget_expenses where id_campaign IN ".$idsCampaigns." and id_variable_concept IN (".$idsVariableConcept.") and type=1 group by id_month");
				$query->execute();
				$expenses = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->expenses_real = $expenses;

				// COSTES FIJOS
				// Seleccionamos las cuentas a excluir que vienen de la configuracion
				$query = $this->_conn->prepare("select amortizacion, extraordinario, financiero from tt_company_year where id=".$idCompanyYear);
				$query->execute();
				$accounts_setting = $query->fetch(PDO::FETCH_ASSOC);
				$ids_to_exclude = '('.$accounts_setting['amortizacion'].",".$accounts_setting['financiero'].",".$accounts_setting['extraordinario'].')';

				// COSTES FIJOS: a excepcion de los que vengan por la configuracion
				$query = $this->_conn->prepare("SELECT expenses.id_fixed_concept, fixed_concept.id_parent,fixed_concept.name as children_name, fixed_concept_parent.name as parent_name, expenses.id_month, sum(expenses.amount) as total
				FROM `tt_expenses_fixed_concept` expenses inner join `tt_fixed_concept` fixed_concept on fixed_concept.id=expenses.id_fixed_concept inner join `tt_fixed_concept` fixed_concept_parent on fixed_concept.id_parent=fixed_concept_parent.id
				where expenses.type='0' and expenses.id_fiscal_year='".$idCompanyYear."' and fixed_concept_parent.id NOT IN ".$ids_to_exclude." group by expenses.id_fixed_concept,expenses.id_month ORDER BY `id_fixed_concept` ASC");
				$query->execute();
				$fixedCosts = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->fixed_cost_budget = $fixedCosts;

				$query = $this->_conn->prepare("SELECT expenses.id_fixed_concept, fixed_concept.id_parent,fixed_concept.name as children_name, fixed_concept_parent.name as parent_name, expenses.id_month, sum(expenses.amount) as total
				FROM `tt_expenses_fixed_concept` expenses inner join `tt_fixed_concept` fixed_concept on fixed_concept.id=expenses.id_fixed_concept inner join `tt_fixed_concept` fixed_concept_parent on fixed_concept.id_parent=fixed_concept_parent.id
				where expenses.type='1' and expenses.id_fiscal_year='".$idCompanyYear."' and fixed_concept_parent.id NOT IN ".$ids_to_exclude." group by expenses.id_fixed_concept,expenses.id_month ORDER BY `id_fixed_concept` ASC");
				$query->execute();
				$fixedCosts = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->fixed_cost_real = $fixedCosts;

				// AMORTIZACION
				$query = $this->_conn->prepare("SELECT expenses.id_fixed_concept, fixed_concept.id_parent,fixed_concept.name as children_name, fixed_concept_parent.name as parent_name, expenses.id_month, sum(expenses.amount) as total
				FROM `tt_expenses_fixed_concept` expenses inner join `tt_fixed_concept` fixed_concept on fixed_concept.id=expenses.id_fixed_concept inner join `tt_fixed_concept` fixed_concept_parent on fixed_concept.id_parent=fixed_concept_parent.id
				where expenses.type='0' and expenses.id_fiscal_year='".$idCompanyYear."' and fixed_concept_parent.id ='".$accounts_setting['amortizacion']."' group by expenses.id_month ORDER BY `id_fixed_concept` ASC");
				$query->execute();
				$fixedCosts = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->amortizacion_budget = $fixedCosts;
				$query = $this->_conn->prepare("SELECT expenses.id_fixed_concept, fixed_concept.id_parent,fixed_concept.name as children_name, fixed_concept_parent.name as parent_name, expenses.id_month, sum(expenses.amount) as total
				FROM `tt_expenses_fixed_concept` expenses inner join `tt_fixed_concept` fixed_concept on fixed_concept.id=expenses.id_fixed_concept inner join `tt_fixed_concept` fixed_concept_parent on fixed_concept.id_parent=fixed_concept_parent.id
				where expenses.type='1' and expenses.id_fiscal_year='".$idCompanyYear."' and fixed_concept_parent.id ='".$accounts_setting['amortizacion']."' group by expenses.id_month ORDER BY `id_fixed_concept` ASC");
				$query->execute();
				$fixedCosts = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->amortizacion_real = $fixedCosts;

				//FINANCIERO
				$query = $this->_conn->prepare("SELECT expenses.id_fixed_concept, fixed_concept.id_parent,fixed_concept.name as children_name, fixed_concept_parent.name as parent_name, expenses.id_month, sum(expenses.amount) as total
				FROM `tt_expenses_fixed_concept` expenses inner join `tt_fixed_concept` fixed_concept on fixed_concept.id=expenses.id_fixed_concept inner join `tt_fixed_concept` fixed_concept_parent on fixed_concept.id_parent=fixed_concept_parent.id
				where expenses.type='0' and expenses.id_fiscal_year='".$idCompanyYear."' and fixed_concept_parent.id='".$accounts_setting['financiero']."' group by expenses.id_month ORDER BY `id_fixed_concept` ASC");
				$query->execute();
				$fixedCosts = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->financiero_budget = $fixedCosts;
				$query = $this->_conn->prepare("SELECT expenses.id_fixed_concept, fixed_concept.id_parent,fixed_concept.name as children_name, fixed_concept_parent.name as parent_name, expenses.id_month, sum(expenses.amount) as total
				FROM `tt_expenses_fixed_concept` expenses inner join `tt_fixed_concept` fixed_concept on fixed_concept.id=expenses.id_fixed_concept inner join `tt_fixed_concept` fixed_concept_parent on fixed_concept.id_parent=fixed_concept_parent.id
				where expenses.type='1' and expenses.id_fiscal_year='".$idCompanyYear."' and fixed_concept_parent.id='".$accounts_setting['financiero']."' group by expenses.id_month ORDER BY `id_fixed_concept` ASC");
				$query->execute();
				$fixedCosts = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->financiero_real = $fixedCosts;

				//EXTRAORDINARIO
				$query = $this->_conn->prepare("SELECT expenses.id_fixed_concept, fixed_concept.id_parent,fixed_concept.name as children_name, fixed_concept_parent.name as parent_name, expenses.id_month, sum(expenses.amount) as total
				FROM `tt_expenses_fixed_concept` expenses inner join `tt_fixed_concept` fixed_concept on fixed_concept.id=expenses.id_fixed_concept inner join `tt_fixed_concept` fixed_concept_parent on fixed_concept.id_parent=fixed_concept_parent.id
				where expenses.type='0' and expenses.id_fiscal_year='".$idCompanyYear."' and fixed_concept_parent.id='".$accounts_setting['extraordinario']."' group by expenses.id_month ORDER BY `id_fixed_concept` ASC");
				$query->execute();
				$fixedCosts = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->extraordinario_budget = $fixedCosts;
				$query = $this->_conn->prepare("SELECT expenses.id_fixed_concept, fixed_concept.id_parent,fixed_concept.name as children_name, fixed_concept_parent.name as parent_name, expenses.id_month, sum(expenses.amount) as total
				FROM `tt_expenses_fixed_concept` expenses inner join `tt_fixed_concept` fixed_concept on fixed_concept.id=expenses.id_fixed_concept inner join `tt_fixed_concept` fixed_concept_parent on fixed_concept.id_parent=fixed_concept_parent.id
				where expenses.type='1' and expenses.id_fiscal_year='".$idCompanyYear."' and fixed_concept_parent.id='".$accounts_setting['extraordinario']."' group by expenses.id_month ORDER BY `id_fixed_concept` ASC");
				$query->execute();
				$fixedCosts = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->extraordinario_real = $fixedCosts;

				// FEE DE EMPRESA
				$query = $this->_conn->prepare("SELECT id_month, sum(amount) as amount FROM `tt_lines_fee_company` WHERE id_project IN ".$idsCampaigns." group by id_month");
				$query->execute();
				$fixedCosts = $query->fetchAll(PDO::FETCH_ASSOC);
				$jsonResponse['report']->fee_budget = $fixedCosts;

				$jsonResponse['report']->fee_real = [];
			}

			$this->mostrarRespuesta($jsonResponse, 200);

		}
		else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}

	public function getAllProjectsReport() {
		if ($_SERVER['REQUEST_METHOD'] != "GET") {
		 $this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		}
		if(!$this->isValidUserToken($this->datosPeticion['token'])) {
			return false;
		}
		$role = $this->getRoleFromToken($this->datosPeticion['token']);
		$id_user = $this->getIdUserFromToken($this->datosPeticion['token']);
		if (isset($this->datosPeticion['customer'], $this->datosPeticion['id_company'], $this->datosPeticion['id_fiscal_year'], $this->datosPeticion['team'],
							$this->datosPeticion['group'], $this->datosPeticion['subgroup'], $this->datosPeticion['start_date'], $this->datosPeticion['end_date'])) {

			$idCompany = (int) $this->datosPeticion['id_company'];
			$idFiscalYear = (int) $this->datosPeticion['id_fiscal_year'];
			$customer = $this->datosPeticion['customer'];
			$team = $this->datosPeticion['team'];
			$group = $this->datosPeticion['group'];
			$subgroup = $this->datosPeticion['subgroup'];
			$start_date = $this->datosPeticion['start_date'];
			$end_date = $this->datosPeticion['end_date'];
			$id_project = $this->datosPeticion['id_project'];

			$yearSelected = "SELECT y.year FROM  `tt_company_year` cy INNER JOIN  `tt_fiscal_year` y ON cy.id_fiscal_year = y.id WHERE cy.id =".$idFiscalYear;
			$query = $this->_conn->prepare($yearSelected);
			$query->execute();
			$year = $query->fetch(PDO::FETCH_ASSOC);

			$strToSearch = "select campaign.id as id_campaign, campaign.campaign_code, campaign.campaign_name, user.nickname as user, user.id as id_user, customer.customer_name as customer, customer.id as id_customer, team.team_name as team,
				team.id as id_team, grupo.name as grupo, grupo.id as id_group, subgroup.name as subgroup, subgroup.id as id_subgroup, status.status as status, status.id as id_status, campaign.creation_date, campaign.end_date, fiscal_year.year
				FROM `tt_campaign` campaign
							inner join `tt_user` user
							on campaign.id_user=user.id
							inner join `tt_customer` customer
							on campaign.id_customer=customer.id
							inner join `tt_team` team
							on campaign.id_team=team.id
							inner join `tt_group` grupo
							on campaign.id_group=grupo.id
							inner join `tt_subgroup` subgroup
							on campaign.id_subgroup=subgroup.id
							inner join `tt_status` status
							on campaign.id_status=status.id
							inner join `tt_company_year` year
							on campaign.id_fiscal_year=year.id
							inner join `tt_fiscal_year` fiscal_year
							on year.id_fiscal_year=fiscal_year.id
							WHERE campaign.id_company='".$idCompany."' and campaign.id_fiscal_year='".$idFiscalYear."'";

			if ($id_project != '' && $id_project != 'null') {
				$strToSearch = $strToSearch." and campaign.id='".$id_project."'";
			}
			if ($customer != '' && $customer != 'null') {
				$strToSearch = $strToSearch." and campaign.id_customer='".$customer."'";
			}
			if ($team != '' && $team != 'null') {
				$strToSearch = $strToSearch." and campaign.id_team='".$team."'";
			}
			if ($group != '' && $group != 'null') {
				$strToSearch = $strToSearch." and campaign.id_group='".$group."'";
			}
			if ($subgroup != '' && $subgroup != 'null') {
				$strToSearch = $strToSearch." and campaign.id_subgroup='".$subgroup."'";
			}
			if($role == 7 || $role == 6) {
				$query = $this->_conn->prepare("select id_team from tt_user where id=".$id_user);
				$query->execute();
				$team = $query->fetch(PDO::FETCH_ASSOC);
				$id_team = $team['id_team'];
				$strToSearch = $strToSearch." and campaign.id_team='".$id_team."'";
			}
			if($role == 7) {
				$strToSearch = $strToSearch." and (campaign.id_user='".$id_user."' or campaign.security_level='Bajo')";
			}

		/*	if ($start_date != '' && $start_date != 'null') {
				$strToSearch = $strToSearch." and campaign.creation_date >='".$year['year']."-".$start_date."-01'";
			}
			if ($end_date != '' && $end_date != 'null') {
				$strToSearch = $strToSearch." and campaign.creation_date <='".$year['year']."-".$end_date."-01'";
			}
*/
			$strToSearch = $strToSearch.' order by campaign.campaign_code ASC';

			// Seleccionamos los id de campaña que cumplan con los filtros
			$idsCampaigns = '';
			$lenProjects = 0;
			foreach($this->_conn->query($strToSearch) as $row) {
				$idsCampaigns .= $row['id_campaign'].",";
				$lenProjects = $lenProjects + 1;
			}
			$idsCampaigns = '('.substr($idsCampaigns, 0, -1).')';

			$jsonResponse['len_projects'] = $lenProjects;
			$jsonResponse['report']->incomes_budget = 0;
			$jsonResponse['report']->incomes_real = 0;
			$jsonResponse['report']->fee_budget = 0;
			$jsonResponse['report']->fee_real = 0;
			$jsonResponse['report']->employees_budget = 0;
			$jsonResponse['report']->employees_real = 0;
			$jsonResponse['report']->employees_real_gesad = 0;
			$jsonResponse['report']->variables_budget = 0;
			$jsonResponse['report']->variables_real = 0;


			// INCOMES
			$query = $this->_conn->prepare("select sum(amount) as total, id_month from tt_budget_income where type=0 and id_campaign IN ".$idsCampaigns." group by id_month");
			$query->execute();
			$incomes = $query->fetchAll(PDO::FETCH_ASSOC);
			$jsonResponse['report']->incomes_budget = $incomes;

			$query = $this->_conn->prepare("select sum(amount) as total, id_month from tt_budget_income where type=1 and id_campaign IN ".$idsCampaigns." group by id_month");
			$query->execute();
			$incomes = $query->fetchAll(PDO::FETCH_ASSOC);
			$jsonResponse['report']->incomes_real = $incomes;

			// Fee
			$query = $this->_conn->prepare("select sum(amount) as total, id_month from tt_lines_fee_company where id_project IN ".$idsCampaigns." group by id_month");
			$query->execute();
			$fee = $query->fetchAll(PDO::FETCH_ASSOC);
			$jsonResponse['report']->fee_budget = $fee;

			$jsonResponse['report']->fee_real = [];

			// Employees
			$query = $this->_conn->prepare("select sum(amount) as total, id_month from tt_estimated_employee_cost where id_campaign IN ".$idsCampaigns." group by id_month");
			$query->execute();
			$employees = $query->fetchAll(PDO::FETCH_ASSOC);
			$jsonResponse['report']->employees_budget = $employees;

			$costEmployeeTracker = $this->getCostEmployeeByCampaings($idsCampaigns, $idFiscalYear);
			$jsonResponse['report']->employees_real = $costEmployeeTracker;

			$strToSearch = "SELECT SUM( amount ) AS amount, id_month FROM  `tt_real_employee_cost` WHERE id_campaign IN ".$idsCampaigns." group by id_month";
			$query = $this->_conn->prepare($strToSearch);
			$query->execute();
			$expensesEmployeesReal = $query->fetchAll(PDO::FETCH_ASSOC);
			$jsonResponse['report']->employees_real_gesad = $expensesEmployeesReal;

			// Conceptos VARIABLES
			$strToSearch = "SELECT subconcept.name as name_parent,subconcept_project.name as name_child,  line.id as id_variable_concept, SUM( line.amount ) AS total, id_month, line.id_variable_concept as id_parent, line.id_subconcept as id_children
											FROM  `tt_lines_subconcept` line
								      inner JOIN `tt_variable_concept` subconcept on subconcept.id = line.id_variable_concept
								      inner JOIN `tt_subconcepts_project` subconcept_project on subconcept_project.id = line.id_subconcept
								      WHERE line.id_project IN ".$idsCampaigns." group by id_month, id_subconcept";

			$query = $this->_conn->prepare($strToSearch);
			$query->execute();
			$variablesCost = $query->fetchAll(PDO::FETCH_ASSOC);
			$jsonResponse['report']->variables_budget = $variablesCost;

			$strToSearch = "SELECT subconcept.name as name_parent, SUM( amount ) AS total, id_month, line.id_variable_concept as id_parent FROM  `tt_budget_expenses` line inner JOIN
			`tt_variable_concept` subconcept on subconcept.id = line.id_variable_concept  WHERE line.type='1' and line.id_campaign IN ".$idsCampaigns."  group by id_month, id_variable_concept  ";

			$query = $this->_conn->prepare($strToSearch);
			$query->execute();
			$variablesCost = $query->fetchAll(PDO::FETCH_ASSOC);
			$jsonResponse['report']->variables_real = $variablesCost;

			$this->mostrarRespuesta($jsonResponse, 200);

		}
		else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
		}
	}

	/** END REPORT COMPANY **/

	private function remember() {
		if ($_SERVER['REQUEST_METHOD'] != "POST") {
		       $this->mostrarRespuesta($this->convertirJson($this->devolverError(1)), 405);
		     }

		     if (isset($this->datosPeticion['email'])) {

		    //el constructor del padre ya se encarga de sanear los datos de entrada
		       //$email = $this->datosPeticion['email'];
		       $email = html_entity_decode($this->datosPeticion['email']);

		       if (!empty($email)) {
		         //consulta preparada ya hace mysqli_real_escape()
		         $query = $this->_conn->prepare("SELECT id, nickname, email, password, id_role FROM tt_user WHERE
		         email=:email");

		         $query->bindValue(":email", $email);
		         $query->execute();
		         if ($fila = $query->fetch(PDO::FETCH_ASSOC)) {
		           $respuesta['ok'] = 'correcto';
		           $respuesta['role'] = $fila['id_role'];
		           $respuesta['usuario']['nickname'] = $fila['nickname'];

		           //Email information
		           $to = $fila['email'];
		           $subject = 'Recordatorio: Datos de registro' ;
		           $body = "Hola ". $fila['nickname']. "\r\nTus datos de acceso son: \r\n";
		           $body .= "Email: ". $fila['email']. "\r\n";
		           $body .= "Contrase&ntile;a: ". $fila['password']. "\r\n";
		           $body .= "\r\nDir&iacute;gete a la p&aacute;gina de inicio e inicia sesi&oacute;n.\r\n";
		           $body = '
		           <html><body>
		           <!-- <style> -->
		    <table class="body" data-made-with-foundation="" style="border-spacing: 0;border-collapse: collapse;padding: 0;vertical-align: top;text-align: left;background: #f3f3f3 !important;">
		      <tr style="padding: 0;vertical-align: top;text-align: left;">
		        <td class="float-center" align="center" valign="top" style="word-wrap: break-word;-webkit-hyphens: auto;-moz-hyphens: auto;hyphens: auto;padding: 0;vertical-align: top;text-align: left;border-collapse: collapse !important;">
		          <center data-parsed="" style="width: 100%;min-width: 580px;">
		            <table class="spacer float-center" style="border-spacing: 0;border-collapse: collapse;padding: 0;vertical-align: top;text-align: left;">
		              <tbody>
		                <tr style="padding: 0;vertical-align: top;text-align: left;">
		                  <td height="16px" style="font-size: 16px;line-height: 16px;word-wrap: break-word;-webkit-hyphens: auto;-moz-hyphens: auto;hyphens: auto;padding: 0;vertical-align: top;text-align: left;border-collapse: collapse !important;">&#xA0;</td>
		                </tr>
		              </tbody>
		            </table>
		            <table align="center" class="container float-center" style="border-spacing: 0;border-collapse: collapse;padding: 0;vertical-align: top;text-align: left;">
		              <tbody>
		                <tr style="padding: 0;vertical-align: top;text-align: left;">
		                  <td style="word-wrap: break-word;-webkit-hyphens: auto;-moz-hyphens: auto;hyphens: auto;padding: 0;vertical-align: top;text-align: left;border-collapse: collapse !important;">
		                    <table class="row header" style="border-spacing: 0;border-collapse: collapse;padding: 0;vertical-align: top;text-align: left;background: #f3f3f3;">
		                      <tbody>
		                        <tr style="padding: 0;vertical-align: top;text-align: left;">
		                          <th class="small-12 large-12 columns first last">
		                            <table style="border-spacing: 0;border-collapse: collapse;padding: 0;vertical-align: top;text-align: left;">
		                              <tr style="padding: 0;vertical-align: top;text-align: left;">
		                                <th>
		                                  <table class="spacer" style="border-spacing: 0;border-collapse: collapse;padding: 0;vertical-align: top;text-align: left;">
		                                    <tbody>
		                                      <tr style="padding: 0;vertical-align: top;text-align: left;">
		                                        <td height="16px" style="font-size: 16px;line-height: 16px;word-wrap: break-word;-webkit-hyphens: auto;-moz-hyphens: auto;hyphens: auto;padding: 0;vertical-align: top;text-align: left;border-collapse: collapse !important;">&#xA0;</td>
		                                      </tr>
		                                    </tbody>
		                                  </table>
		                                  <h4 class="text-center">GesAd</h4> </th>
		                                <th class="expander"></th>
		                              </tr>
		                            </table>
		                          </th>
		                        </tr>
		                      </tbody>
		                    </table>
		                    <table class="row" style="border-spacing: 0;border-collapse: collapse;padding: 0;vertical-align: top;text-align: left;">
		                      <tbody>
		                        <tr style="padding: 0;vertical-align: top;text-align: left;">
		                          <th class="small-12 large-12 columns first last">
		                            <table style="border-spacing: 0;border-collapse: collapse;padding: 0;vertical-align: top;text-align: left;">
		                              <tr style="padding: 0;vertical-align: top;text-align: left;">
		                                <th>
		                                  <table class="spacer" style="border-spacing: 0;border-collapse: collapse;padding: 0;vertical-align: top;text-align: left;">
		                                    <tbody>
		                                      <tr style="padding: 0;vertical-align: top;text-align: left;">
		                                        <td height="32px" style="font-size: 32px;line-height: 32px;word-wrap: break-word;-webkit-hyphens: auto;-moz-hyphens: auto;hyphens: auto;padding: 0;vertical-align: top;text-align: left;border-collapse: collapse !important;">&#xA0;</td>
		                                      </tr>
		                                    </tbody>
		                                  </table>

		                                  <table class="spacer" style="border-spacing: 0;border-collapse: collapse;padding: 0;vertical-align: top;text-align: left;">
		                                    <tbody>
		                                      <tr style="padding: 0;vertical-align: top;text-align: left;">
		                                        <td height="16px" style="font-size: 16px;line-height: 16px;word-wrap: break-word;-webkit-hyphens: auto;-moz-hyphens: auto;hyphens: auto;padding: 0;vertical-align: top;text-align: left;border-collapse: collapse !important;">&#xA0;</td>
		                                      </tr>
		                                    </tbody>
		                                  </table>
		                                  <h1 class="text-center">&iquest;Olvidaste tus datos de acceso?</h1>
		                                  <table class="spacer" style="border-spacing: 0;border-collapse: collapse;padding: 0;vertical-align: top;text-align: left;">
		                                    <tbody>
		                                      <tr style="padding: 0;vertical-align: top;text-align: left;">
		                                        <td height="16px" style="font-size: 16px;line-height: 16px;word-wrap: break-word;-webkit-hyphens: auto;-moz-hyphens: auto;hyphens: auto;padding: 0;vertical-align: top;text-align: left;border-collapse: collapse !important;">&#xA0;</td>
		                                      </tr>
		                                    </tbody>
		                                  </table>
		                                  <p class="text-center" style="text-align:center;margin: 0 0 0 10px;">Suele ocurrir. Aqu&iacute; debajo los tienes</p>

		                                  <h3 class="text-center">Correo electr&oacute;nico</h3>
		                                  <h4 class="text-center">'.$fila['email'].'</h4>
		                                  <hr>
		                                  <h3 class="text-center">Contrase&ntilde;a</h3>
		                                  <h4 class="text-center">'.$fila['password'].'</h4>
		                                  <hr>
		                                  <p style="margin: 0 0 0 10px;text-align:right;"><small>GesAd 2017.</small></p>
		                                </th>
		                                <th class="expander"></th>
		                              </tr>
		                            </table>
		                          </th>
		                        </tr>
		                      </tbody>
		                    </table>
		                    <table class="spacer" style="border-spacing: 0;border-collapse: collapse;padding: 0;vertical-align: top;text-align: left;">
		                      <tbody>
		                        <tr style="padding: 0;vertical-align: top;text-align: left;">
		                          <td height="16px" style="font-size: 16px;line-height: 16px;word-wrap: break-word;-webkit-hyphens: auto;-moz-hyphens: auto;hyphens: auto;padding: 0;vertical-align: top;text-align: left;border-collapse: collapse !important;">&#xA0;</td>
		                        </tr>
		                      </tbody>
		                    </table>
		                  </td>
		                </tr>
		              </tbody>
		            </table>
		          </center>
		        </td>
		      </tr>
		    </table>
		    </body>
		    </html>
		           ';

					//Create a new PHPMailer instance
					$mail = new PHPMailer;
					//Tell PHPMailer to use SMTP
					$mail->isSMTP();
					//Enable SMTP debugging
					// 0 = off (for production use)
					// 1 = client messages
					// 2 = client and server messages
					$mail->SMTPDebug = 0;
					//Set the hostname of the mail server
					$mail->Host = 'smtp.1and1.es';
					//Set the SMTP port number - likely to be 25, 465 or 587
					$mail->Port = 587;
					//Whether to use SMTP authentication
					$mail->SMTPAuth = true;
					//Username to use for SMTP authentication
					$mail->Username = 'alfonso.vicens@sicarconsultores.es';
					//Password to use for SMTP authentication
					$mail->Password = 'jSzp899#';
					//Set who the message is to be sent from
					$mail->setFrom('alfonso.vicens@agenciatango.es', 'Recordatorio - Gesad');
					//Set an alternative reply-to address
					//$mail->addReplyTo('alfonso.vicens@sicarconsultores.es');
					//Set who the message is to be sent to
					$mail->addAddress($to);
					//Set the subject line
					$mail->Subject = $subject;
					//Read an HTML message body from an external file, convert referenced images to embedded,
					//convert HTML into a basic plain-text alternative body
					$mail->msgHTML($body);
					//Replace the plain text body with one created manually
					//$mail->AltBody = 'This is a plain-text message body';

					//send the message, check for errors
					if ($mail->send()) {
						$this->mostrarRespuesta($this->convertirJson($respuesta), 200);
					} else {
						$this->mostrarRespuesta(HandleErrors::sendError(2), 200);
					}


				 }

		       }
		     }
		     $this->mostrarRespuesta(HandleErrors::sendError(2), 200);
	}

	private function backup_tables($host,$user,$pass,$name,$tables = '*')	{

		$link = mysql_connect($host,$user,$pass);
		mysql_select_db($name,$link);

		//get all of the tables
		if($tables == '*')
		{
			$tables = array();
			$result = mysql_query('SHOW TABLES');
			while($row = mysql_fetch_row($result))
			{
				$tables[] = $row[0];
			}
		}
		else
		{
			$tables = is_array($tables) ? $tables : explode(',',$tables);
		}
		$return = '';
		//cycle through
		foreach($tables as $table)
		{
			$result = mysql_query('SELECT * FROM '.$table);
			$num_fields = mysql_num_fields($result);

			$return.= 'DROP TABLE '.$table.';';
			$row2 = mysql_fetch_row(mysql_query('SHOW CREATE TABLE '.$table));
			$return.= "\n\n".$row2[1].";\n\n";

			for ($i = 0; $i < $num_fields; $i++)
			{
				while($row = mysql_fetch_row($result))
				{
					$return.= 'INSERT INTO '.$table.' VALUES(';
					for($j=0; $j < $num_fields; $j++)
					{
						$row[$j] = addslashes($row[$j]);
					//	$row[$j] = preg_replace("/\n/","/\\n/",$row[$j]);
						if (isset($row[$j])) { $return.= '"'.$row[$j].'"' ; } else { $return.= '""'; }
						if ($j < ($num_fields-1)) { $return.= ','; }
					}
					$return.= ");\n";
				}
			}
			$return.="\n\n\n";
		}

		//save file
		$fileName = 'backup/db-backup-'.time().'-'.(md5(implode(',',$tables))).'.sql';
		$link = 'http://gesad.sicarconsultores.es/authentication/'.$fileName;

		$handle = fopen($fileName,'w+');
		if(!fwrite($handle,$return)) {
			$jsonResponse['status'] = 'KO';
			$this->mostrarRespuesta($jsonResponse, 200);
		} else {
			$jsonResponse['status'] = 'OK';
			$jsonResponse['file'] = $link;
			$this->mostrarRespuesta($jsonResponse, 200);
		}
		fclose($handle);
	}

	private function generateBackup() {
		$this->backup_tables('localhost','nitsuga','11863082','gesad');
	}

	private function restoreDB() {
		if ($_SERVER['REQUEST_METHOD'] != "POST") {
			$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
		}
		if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
			return false;
		}
		if (isset($this->datosPeticion['filename'])) {
			$file = $this->datosPeticion['filename'];
			if (Connection::restoreDB($file)) {
				$jsonResponse['status'] = 'OK';
				$this->mostrarRespuesta($jsonResponse, 200);
			}
		}
		else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 400);
		}
	}

	public function subscritionUser() {
		if ($_SERVER['REQUEST_METHOD'] != "PUT") {
			$this->mostrarRespuesta(HandleErrors::sendError(1), 400);
		}
		if(!$this->isValidSuperAdminToken($this->datosPeticion['token'])) {
			return false;
		}
		if (isset($this->datosPeticion['status'], $this->datosPeticion['id_company'])) {
			$idCompany = (int) $this->datosPeticion['id_company'];
			$idUser = (int) $this->datosPeticion['id_user'];
			$status = (int) $this->datosPeticion['status'];

			$query = $this->_conn->prepare("UPDATE tt_user set
				status='".$status."' where id='".$idUser."' and id_company='".$idCompany."'");
			$query->execute();
			$filasActualizadas = $query->rowCount();
			if ($filasActualizadas == 1) {
				$jsonResponse['status'] = 'OK';
				$jsonResponse['new_status'] = $status;
				$this->mostrarRespuesta($jsonResponse, 200);
			} else {
				$jsonResponse['status'] = 'error';
				$this->mostrarRespuesta($jsonResponse, 200);
			}
		}
		else {
			$this->mostrarRespuesta(HandleErrors::sendError(2), 400);
		}
	}

}
$api = new Api();
$api->procesarLLamada();
?>
