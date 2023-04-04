ALTER TABLE `tt_campaign` ADD `shipping_method` VARCHAR( 100 ) NOT NULL
ALTER TABLE `tt_campaign` ADD `shipping_method_return` VARCHAR( 100 ) NOT NULL
ALTER TABLE `tt_campaign` ADD `start_date_event` DATE NOT NULL ,
ADD `end_date_event` DATE NOT NULL

ALTER TABLE `tt_subconcepts_project` ADD `start_date_event` DATE NOT NULL ,
ADD `end_date_event` DATE NOT NULL

ALTER TABLE `tt_subconcepts_project` CHANGE `amount` `amount` DOUBLE NOT NULL DEFAULT '0'
ALTER TABLE `tt_subconcepts_project` CHANGE `unit_budget` `unit_budget` DOUBLE NOT NULL DEFAULT '0'



CREATE TABLE IF NOT EXISTS `article_reservation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customer_id` int(11) NOT NULL,
  `start_date_reservation` datetime NOT NULL,
  `end_date_reservation` date NOT NULL,
  `amount` float NOT NULL COMMENT 'cantidad de articulo a reservar',
  `article_id` varchar(11) COLLATE utf8_spanish_ci NOT NULL,
  `subconcept_project_id` int(11) NOT NULL COMMENT 'Se relaciona esta reserva con una linea de pedido, de modo que si se modifica la linea, no se cree una nueva entrada de reserva',
  `company_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci COMMENT='Contiene las reservas de articulo por cliente y fecha' AUTO_INCREMENT=13 ;
