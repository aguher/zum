<?php
header("Content-Type: text/html;charset=utf-8");

class Connection
{
    public function connectDB()
    {

        define("servidor","localhost");//"db659023894.db.1and1.com";//
        define("usuario_db","root");//"dbo659023894";
        define("pwd_db","");//"Tango2017$";
        define("nombre_db","prueba");//db659023894";
/*
        define("servidor","localhost");//"db659023894.db.1and1.com";//
        define("usuario_db","nitsuga");//"dbo659023894";
        define("pwd_db","11863082");//"Tango2017$";
        define("nombre_db","gesad");//db659023894";
*/
        $dsn = 'mysql:dbname=' . nombre_db . ';host=' . servidor.';charset=utf8';
        try {
            return new PDO($dsn, usuario_db, pwd_db);
        } catch (PDOException $e) {
            echo 'Falló la conexión: ' . $e->getMessage();
        }
    }

    public function restoreDB($file) {
      ini_set('memory_limit','128M'); // set memory limit here
      $db = mysql_connect ( 'localhost', 'nitsuga', '11863082' ) or die('not connected');
      mysql_select_db( 'gesad', $db) or die('Not found');
      $fp = fopen ( 'uploads/'.$file, 'r', 1 );

      $fetchData = fread ( $fp, filesize ( 'uploads/'.$file) );

      $sqlInfo = explode ( ";\n", $fetchData); // explode dump sql as a array data
      foreach ($sqlInfo as $sqlData )
      {
        if(isset($sqlData) && ctype_space($sqlData)!= 1) {
          mysql_query ( $sqlData );
        }
      }

      return true;
    }

}
