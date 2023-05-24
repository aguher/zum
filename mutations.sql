INSERT INTO `gesad`.`tt_articles_families` (
`id` ,
`familyname` ,
`id_company`
)
VALUES (
NULL , 'Cristaleria', '416'
);



CREATE TABLE IF NOT EXISTS `salonario_envios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_order` int(11) NOT NULL,
  `date_shipment` date NOT NULL,
  `method_shipment` varchar(255) NOT NULL,
  `contact_name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `postal_code` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `phone_number` varchar(255) NOT NULL,
  `observations` varchar(255) NOT NULL,
  `packages_number` int(11) NOT NULL,
  `date_return` date NOT NULL,
  `method_return` varchar(255) NOT NULL,
  `employee` varchar(255) NOT NULL,
  `made_by` varchar(255) NOT NULL,
  `incidents` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;