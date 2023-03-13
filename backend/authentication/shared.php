<?php
header("Content-Type: text/html;charset=utf-8");

class Shared
{
    public function formatTime($minBD)
    {
      if($minBD == NULL) {
        $minBD = 0;
      }
      $min = intVal($minBD);
  		$min = $min / 60;
  		$hours = intVal($min);
  		$minutes = ceil($minBD - $hours * 60);
  		if ($minBD > 1 && $minBD < 60) {
  			return $minBD.' minutos';
  		} else if ($minBD == 1) {
  			return $minBD.' minuto';
  		} else if ($minBD == 0) {
  			return $minBD.' minutos';
  		}
  		if ($minutes === 0) {
  			if ($hours == 1) {
  				return $hours.' hora';
  			} else {
  				return $hours.' horas';
  			}
  		} else {
        if ($minutes < 9) {
          $minutes = '0'.$minutes;
        }
  			return $hours.':'.$minutes;
  		}
    }

    public function formatHour($minBD)
    {
      $min = intVal($minBD);
  		$min = $min / 60;
  		$hours = intVal($min);
  		$minutes = $minBD - $hours * 60;
  		if ($minutes === 0) {
        $minutes = '00';
      } else if($minutes>0 && $minutes < 10) {
  			$minutes = $minutes + '0';
  		}
      if($hours < 1) {
        $hours = '0';
      }
  		return $hours.':'.$minutes;
    }

		public function convertirJson($data) {
			return json_encode($data);
		}

    public function calculateMargins($income, $expense) {
  		if ($income !== 0) {
  				return ((float)($income - $expense)/(float)$income)*100;
      } else {
          return 0;
      }
  	}
}
