DROP TABLE tt_budget_cost;

CREATE TABLE `tt_budget_cost` (
  `pesimist` int(11) NOT NULL DEFAULT '0',
  `optimist` int(11) NOT NULL DEFAULT '0',
  `id_company` varchar(50) COLLATE latin1_german1_ci NOT NULL,
  PRIMARY KEY (`pesimist`,`optimist`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

INSERT INTO tt_budget_cost VALUES("15","20","385");
INSERT INTO tt_budget_cost VALUES("0","2","400");
INSERT INTO tt_budget_cost VALUES("0","0","401");



DROP TABLE tt_budget_expenses;

CREATE TABLE `tt_budget_expenses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_campaign` int(11) NOT NULL,
  `amount` float NOT NULL,
  `id_month` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `type` int(2) NOT NULL COMMENT '0:estimated; 1:real',
  `id_variable_concept` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO tt_budget_expenses VALUES("1","3","101","january","0","388");
INSERT INTO tt_budget_expenses VALUES("2","3","11","february","1","388");
INSERT INTO tt_budget_expenses VALUES("3","3","3","january","0","386");
INSERT INTO tt_budget_expenses VALUES("4","3","0","february","0","386");
INSERT INTO tt_budget_expenses VALUES("5","3","0","march","0","388");
INSERT INTO tt_budget_expenses VALUES("6","3","0","march","0","386");
INSERT INTO tt_budget_expenses VALUES("7","3","0","february","0","388");
INSERT INTO tt_budget_expenses VALUES("8","3","0","april","0","386");
INSERT INTO tt_budget_expenses VALUES("9","386","2","january","0","387");
INSERT INTO tt_budget_expenses VALUES("10","386","4","january","1","387");
INSERT INTO tt_budget_expenses VALUES("11","396","1","january","0","387");
INSERT INTO tt_budget_expenses VALUES("12","396","1","january","0","386");
INSERT INTO tt_budget_expenses VALUES("13","396","1","january","0","388");
INSERT INTO tt_budget_expenses VALUES("14","389","0","february","0","386");
INSERT INTO tt_budget_expenses VALUES("15","389","8","february","0","388");
INSERT INTO tt_budget_expenses VALUES("16","390","4","january","0","387");
INSERT INTO tt_budget_expenses VALUES("17","389","0","february","0","387");
INSERT INTO tt_budget_expenses VALUES("18","389","3","january","0","387");
INSERT INTO tt_budget_expenses VALUES("19","396","2","january","1","387");
INSERT INTO tt_budget_expenses VALUES("20","396","2","january","1","386");
INSERT INTO tt_budget_expenses VALUES("21","396","2","january","1","388");
INSERT INTO tt_budget_expenses VALUES("22","386","2","january","0","386");
INSERT INTO tt_budget_expenses VALUES("23","386","0","january","0","388");
INSERT INTO tt_budget_expenses VALUES("24","386","4","january","1","386");
INSERT INTO tt_budget_expenses VALUES("25","386","0","january","1","388");
INSERT INTO tt_budget_expenses VALUES("26","389","3","january","0","386");
INSERT INTO tt_budget_expenses VALUES("27","389","3","january","0","388");
INSERT INTO tt_budget_expenses VALUES("28","389","6","january","1","387");
INSERT INTO tt_budget_expenses VALUES("29","389","6","january","1","386");
INSERT INTO tt_budget_expenses VALUES("30","389","6","january","1","388");
INSERT INTO tt_budget_expenses VALUES("31","390","4","january","0","386");
INSERT INTO tt_budget_expenses VALUES("32","390","4","january","0","388");
INSERT INTO tt_budget_expenses VALUES("33","390","8","january","1","387");
INSERT INTO tt_budget_expenses VALUES("34","390","8","january","1","386");
INSERT INTO tt_budget_expenses VALUES("35","390","8","january","1","388");
INSERT INTO tt_budget_expenses VALUES("36","393","10","january","0","387");
INSERT INTO tt_budget_expenses VALUES("37","399","1","january","0","389");
INSERT INTO tt_budget_expenses VALUES("38","389","1","january","0","390");
INSERT INTO tt_budget_expenses VALUES("39","389","9","march","0","388");
INSERT INTO tt_budget_expenses VALUES("40","389","7","february","1","388");
INSERT INTO tt_budget_expenses VALUES("41","389","5","january","0","391");
INSERT INTO tt_budget_expenses VALUES("42","389","10","february","0","391");
INSERT INTO tt_budget_expenses VALUES("43","389","15","march","0","391");
INSERT INTO tt_budget_expenses VALUES("44","389","15","april","0","391");
INSERT INTO tt_budget_expenses VALUES("45","389","5","april","0","388");
INSERT INTO tt_budget_expenses VALUES("46","398","14","august","0","388");
INSERT INTO tt_budget_expenses VALUES("47","398","2","february","0","393");
INSERT INTO tt_budget_expenses VALUES("48","398","5","november","0","388");
INSERT INTO tt_budget_expenses VALUES("49","398","4","april","1","388");
INSERT INTO tt_budget_expenses VALUES("50","398","3","march","1","393");
INSERT INTO tt_budget_expenses VALUES("51","404","2","april","0","390");
INSERT INTO tt_budget_expenses VALUES("52","404","5","february","1","388");



DROP TABLE tt_budget_income;

CREATE TABLE `tt_budget_income` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `amount` varchar(100) CHARACTER SET latin1 COLLATE latin1_spanish_ci NOT NULL,
  `id_campaign` int(50) NOT NULL,
  `type` int(50) NOT NULL COMMENT '0: estimated; 1:real',
  `id_month` varchar(50) COLLATE latin1_german1_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=442 DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

INSERT INTO tt_budget_income VALUES("385","12","3","0","february");
INSERT INTO tt_budget_income VALUES("386","2","3","0","january");
INSERT INTO tt_budget_income VALUES("387","11","3","0","march");
INSERT INTO tt_budget_income VALUES("388","100.1","3","0","april");
INSERT INTO tt_budget_income VALUES("390","6","3","0","may");
INSERT INTO tt_budget_income VALUES("391","3","3","0","june");
INSERT INTO tt_budget_income VALUES("392","0.5","3","0","july");
INSERT INTO tt_budget_income VALUES("393","40","3","0","august");
INSERT INTO tt_budget_income VALUES("394","0","3","0","september");
INSERT INTO tt_budget_income VALUES("395","0","3","0","october");
INSERT INTO tt_budget_income VALUES("415","0","393","0","january");
INSERT INTO tt_budget_income VALUES("397","0","386","0","february");
INSERT INTO tt_budget_income VALUES("398","0","386","1","april");
INSERT INTO tt_budget_income VALUES("399","0","386","0","may");
INSERT INTO tt_budget_income VALUES("400","0","386","0","june");
INSERT INTO tt_budget_income VALUES("416","0","396","0","february");
INSERT INTO tt_budget_income VALUES("402","20","389","0","january");
INSERT INTO tt_budget_income VALUES("403","21","389","0","february");
INSERT INTO tt_budget_income VALUES("404","22","389","0","march");
INSERT INTO tt_budget_income VALUES("405","20","396","1","january");
INSERT INTO tt_budget_income VALUES("406","0","386","0","january");
INSERT INTO tt_budget_income VALUES("417","100","402","0","january");
INSERT INTO tt_budget_income VALUES("408","0","396","0","january");
INSERT INTO tt_budget_income VALUES("409","24","389","1","january");
INSERT INTO tt_budget_income VALUES("410","0","390","0","january");
INSERT INTO tt_budget_income VALUES("411","26","390","1","january");
INSERT INTO tt_budget_income VALUES("414","0","386","1","january");
INSERT INTO tt_budget_income VALUES("418","23","389","0","april");
INSERT INTO tt_budget_income VALUES("419","24","389","0","may");
INSERT INTO tt_budget_income VALUES("420","25","389","0","june");
INSERT INTO tt_budget_income VALUES("421","25","389","1","february");
INSERT INTO tt_budget_income VALUES("422","26","389","1","march");
INSERT INTO tt_budget_income VALUES("423","27","389","1","april");
INSERT INTO tt_budget_income VALUES("424","26","389","0","july");
INSERT INTO tt_budget_income VALUES("425","28","389","1","may");
INSERT INTO tt_budget_income VALUES("426","29","389","1","june");
INSERT INTO tt_budget_income VALUES("427","1","402","1","january");
INSERT INTO tt_budget_income VALUES("428","3","402","1","february");
INSERT INTO tt_budget_income VALUES("429","1","402","1","march");
INSERT INTO tt_budget_income VALUES("430","4","402","1","april");
INSERT INTO tt_budget_income VALUES("431","1","402","1","may");
INSERT INTO tt_budget_income VALUES("432","12","402","1","june");
INSERT INTO tt_budget_income VALUES("433","2","402","1","july");
INSERT INTO tt_budget_income VALUES("434","26","389","1","july");
INSERT INTO tt_budget_income VALUES("435","10","398","0","may");
INSERT INTO tt_budget_income VALUES("436","5","398","0","june");
INSERT INTO tt_budget_income VALUES("437","50","398","1","february");
INSERT INTO tt_budget_income VALUES("438","20","398","1","april");
INSERT INTO tt_budget_income VALUES("439","1","404","0","january");
INSERT INTO tt_budget_income VALUES("440","5","404","0","april");
INSERT INTO tt_budget_income VALUES("441","20","404","1","february");



DROP TABLE tt_campaign;

CREATE TABLE `tt_campaign` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign_code` varchar(50) COLLATE latin1_german1_ci NOT NULL,
  `campaign_name` varchar(100) CHARACTER SET latin1 COLLATE latin1_spanish_ci NOT NULL,
  `campaign_parsed` varchar(80) CHARACTER SET latin1 COLLATE latin1_spanish_ci NOT NULL,
  `id_team` int(11) NOT NULL,
  `id_group` int(11) DEFAULT NULL,
  `id_subgroup` int(11) NOT NULL,
  `id_user` int(11) DEFAULT NULL,
  `id_company` int(11) DEFAULT NULL,
  `id_fiscal_year` int(11) DEFAULT NULL,
  `id_customer` int(11) NOT NULL,
  `id_status` int(11) NOT NULL,
  `creation_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `sum_minutes` int(11) NOT NULL,
  `security_level` varchar(11) COLLATE latin1_german1_ci DEFAULT 'Alto',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=405 DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

INSERT INTO tt_campaign VALUES("386","12345","campaña","","25","386","2","27","385","406","45","1","2017-06-14","2017-06-23","0","Bajo");
INSERT INTO tt_campaign VALUES("398","09999","Proyecto 11","","2","390","10","41","385","406","5","1","2016-09-06","2017-09-22","0","Alto");
INSERT INTO tt_campaign VALUES("15","16052","Eventos presentación Royal Bliss","16052 - Eventos presentación Royal Bliss","1","0","0","0","0","0","26","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("102","17001","Fee de Mapfre 2017","17001-Fee de Mapfre 2017","2","0","0","0","0","0","13","2","2017-01-02","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("20","16073","Shows On Demand 2016","16073 - Shows On Demand 2016","3","0","0","0","0","0","16","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("11","16033","Bolsita Botellas+limpieza uniformes","16033 - Bolsita Botellas+limpieza uniformes","1","0","0","0","0","0","26","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("18","16067","Plataforma Sampling","16067 - Plataforma Sampling","3","0","0","0","0","0","11","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("21","16084","Alimarket 2016","16084 - Alimarket 2016","1","0","0","0","0","0","26","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("22","16085","Eventos Espejo","16085 - Eventos Espejo","1","0","0","0","0","0","26","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("129","17025","DBA Afterwork Madrid_CBG","17025-DBA Afterwork Madrid_CBG","1","0","0","0","0","0","26","2","2017-01-12","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("6","16019","Almacenaje Mobiliario","16019 - Almacenaje Mobiliario","3","0","0","0","0","0","11","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("7","16020","Almacenaje Jaulas y Neveras","16020 - Almacenaje Jaulas y Neveras","3","0","0","0","0","0","11","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("8","16021","Fee Cristina Ramiro","16021 - Fee Cristina Ramiro","2","0","0","0","0","0","12","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("9","16022","Gastos Caja Cristina Ramiro","16022 - Gastos Caja Cristina Ramiro","2","0","0","0","0","0","12","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("10","16024","Fee Anual Asesoria Tango","16024 - Fee Anual Asesoria Tango","2","0","0","0","0","0","7","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("104","17002","Royal Bliss 2017","17002-Royal Bliss 2017","1","0","0","0","0","0","26","2","2017-01-09","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("23","16086","Previsión eventos caca","16086 - Previsión eventos caca","1","0","0","0","0","0","26","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("108","17007","Ruta Bartenders enero RB 2017","17007-Ruta Bartenders enero RB 2017","1","0","0","0","0","0","26","2","2017-01-10","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("26","16106","Graffitis ","16106 - Graffitis ","3","0","0","0","0","0","11","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("28","16123","Extras Coca-Cola Mix","16123 - Extras Coca-Cola Mix","1","0","0","0","0","0","26","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("29","16136","Barcelona Ron Congress","16136 - Barcelona Ron Congress","1","0","0","0","0","0","26","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("30","16141","Convencion Avon","16141 - Convencion Avon","3","0","0","0","0","0","4","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("31","16142","Formaciones Granada BA","16142 - Formaciones Granada BA","1","0","0","0","0","0","26","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("33","16145","Supermercados. Extras Zona Centro","16145 - Supermercados. Extras Zona Centro","1","0","0","0","0","0","26","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("34","16153","Entrega de Premios Lázaro","16153 - Entrega de Premios Lázaro","1","0","0","0","0","0","26","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("35","16158","Imprevistos Logística Coca-Cola Mix","16158 - Imprevistos Logística Coca-Cola Mix","1","0","0","0","0","0","26","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("36","16159","Alimentacion Moderna_Supermercados","16159 - Alimentacion Moderna_Supermercados","1","0","0","0","0","0","26","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("130","17026","Accenture – Ecards compra imágenes","17026-Accenture – Ecards compra imágenes","2","0","0","0","0","0","2","2","2017-01-12","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("38","16174","Heineken VR","16174 - Heineken VR","3","0","0","0","0","0","11","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("131","17027","Cumpleaños Miguel Mula","17027-Cumpleaños Miguel Mula","1","0","0","0","0","0","26","2","2017-01-12","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("41","16197","Evento Terraza Reina Sof","16197 - Evento Terraza Reina Sof","1","0","0","0","0","0","26","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("43","16205","Videoclip Managers DSP","16205 - Videoclip Managers DSP","3","0","0","0","0","0","11","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("44","16206","Video Motivación Valencia","16206 - Video Motivación Valencia","3","0","0","0","0","0","11","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("94","16279","Degustación Royal Bliss Orense","16279 - Degustación Royal Bliss Orense","1","0","0","0","0","0","26","2","2017-01-02","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("48","16216","Cierres Ibiza ","16216 - Cierres Ibiza ","2","0","0","0","0","0","7","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("50","16225","Activación Samsara","16225 - Activación Samsara","1","0","0","0","0","0","26","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("106","17004","Parking Bus mensual DSP","17004-Parking Bus mensual DSP","3","0","0","0","0","0","11","2","2017-01-10","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("53","16229","JTI Vídeo corporativo","16229-JTI Vídeo corporativo","2","0","0","0","0","0","29","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("54","16232","Evento Pincho & Tapa_CBG","16232 - Evento Pincho & Tapa_CBG","1","0","0","0","0","0","26","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("55","16233","Formación Cinesa Proyecciones","16233 - Formación Cinesa Proyecciones","1","0","0","0","0","0","26","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("56","16234","Synchro Skin","16234 - Synchro Skin","2","0","0","0","0","0","15","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("57","16235","Luxury Granada ","16235 - Luxury Granada ","1","0","0","0","0","0","26","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("58","16237","ACB Copa del Rey","16237 - ACB Copa del Rey","2","0","0","0","0","0","3","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("59","16238","Locos por la música CBG","16238 - Locos por la música CBG","1","0","0","0","0","0","26","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("60","16239","Palacio Cibeles grupo Adolfo","16239 - Palacio Cibeles grupo Adolfo","1","0","0","0","0","0","26","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("61","16241","Horse Week 2016 ","16241 - Horse Week 2016 ","1","0","0","0","0","0","26","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("62","16242","Activación Naturbier-Santa Ana","16242 - Activación Naturbier-Santa Ana","1","0","0","0","0","0","26","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("63","16243","Nochevieja Universitaria Salamanca","16243 - Nochevieja Universitaria Salamanca","1","0","0","0","0","0","26","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("64","16244","Venta Magullo","16244 - Venta Magullo","1","0","0","0","0","0","26","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("65","16246","Mixability Feria 12 Diciembre ","16246 - Mixability Feria 12 Diciembre ","1","0","0","0","0","0","26","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("66","16247","Producción ConcertsClub Zgz","16247 - Producción ConcertsClub Zgz","2","0","0","0","0","0","7","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("67","16248","Activación La Flaca","16248 - Activación La Flaca","1","0","0","0","0","0","26","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("70","16253","FEHR Toledo","16253 - FEHR Toledo","1","0","0","0","0","0","7","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("71","16254","Digital HUB","16254 - Digital HUB","2","0","0","0","0","0","2","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("92","16277","Extras Enero y Febrero
","16277 - Extras Enero y Febrero
","1","0","0","0","0","0","26","2","2017-01-02","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("90","16276","Video Interno Peru","16276 - Video Interno Peru","2","0","0","0","0","0","13","2","2017-01-02","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("73","16256","Finca Muñoz","16256-Finca Muñoz","1","0","0","0","0","0","5","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("74","16259","Fiesta empleados AC La Finca - 22 de diciembre","16259 - Fiesta empleados AC La Finca - 22 de diciembre","1","0","0","0","0","0","26","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("75","16260","Mercadillo navideño","16260-Mercadillo navideño","2","0","0","0","0","0","7","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("76","16261","Volcado Imagenes Webu","16261 - Volcado Imagenes Webu","2","0","0","0","0","0","7","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("77","16262","Volapié 15 Dic","16262-Volapié 15 Dic","1","0","0","0","0","0","26","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("78","16264","Bartender nuevo producto","16264 - Bartender nuevo producto","1","0","0","0","0","0","26","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("80","16266","Extras Espejo","16266 - Extras Espejo","1","0","0","0","0","0","26","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("82","16268","Desmontando mi belleza","16268 - Desmontando mi belleza","2","0","0","0","0","0","9","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("83","16269","Ribera del Loira Palladium","16269 - Ribera del Loira Palladium","2","0","0","0","0","0","26","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("84","16270","Business Plan CCMix/RB","16270 - Business Plan CCMix/RB","2","0","0","0","0","0","26","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("134","17030","Almacenaje Monster","17030-Almacenaje Monster","1","0","0","0","0","0","26","2","2017-01-17","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("87","16273","Nuevos visuales y dossier","16273 - Nuevos visuales y dossier","3","0","0","0","0","0","11","2","2016-12-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("133","17029","Formigal 2017","17029-Formigal 2017","2","0","0","0","0","0","5","2","2017-01-13","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("101","16286","Planificacion Estratégica Royal Bliss 
","16286 - Planificacion Estratégica Royal Bliss 
","1","0","0","0","0","0","26","2","2017-01-02","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("128","17024","Gastos Extras Personal CCME","17024-Gastos Extras Personal CCME","2","0","0","0","0","0","7","2","2017-01-11","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("105","17003","Producción Materiales FIB Salamanca","17003-Producción Materiales FIB Salamanca","2","0","0","0","0","0","12","2","2017-01-09","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("100","16285","Casas Verdes Heineken","16285-Casas Verdes Heineken","3","0","0","0","0","0","11","2","2017-01-02","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("99","16284","Extras mercadillo navideño
","16284 - Extras mercadillo navideño","2","0","0","0","0","0","7","2","2017-01-02","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("107","17005","Visita Internacional Feria CC","17005-Visita Internacional Feria CC","1","0","0","0","0","0","26","2","2017-01-10","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("98","16283","Envios Royal Bliss
","16283 - Envios Royal Bliss
","1","0","0","0","0","0","26","2","2017-01-02","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("97","16282","Merchandising ACB
","16282 - Merchandising ACB
","2","0","0","0","0","0","3","2","2017-01-02","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("95","16280","Eventos varios CCMIX
","16280 - Eventos varios CCMIX
","1","0","0","0","0","0","26","2","2017-01-02","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("93","16278","Gastos formación Bartenders
","16278 - Gastos formación Bartenders
","1","0","0","0","0","0","26","2","2017-01-02","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("109","17006","Bolsa Gastos","17006-Bolsa Gastos","1","0","0","0","0","0","26","2","2017-01-10","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("127","17023","CCME Fee","17023-CCME Fee","2","0","0","0","0","0","7","2","2017-01-11","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("132","17028","Presentación Royal Castilla y Madrid","17028-Presentación Royal Castilla y Madrid","1","0","0","0","0","0","26","2","2017-01-12","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("110","17008","Extra Ruta BT Enero RB 2017","17008-Extra Ruta BT Enero RB 2017","1","0","0","0","0","0","26","2","2017-01-10","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("111","17009","Casas verdes trade","17009-Casas verdes trade","3","0","0","0","0","0","11","2","2017-01-10","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("112","17010","Fee anual DSP","17010-Fee anual DSP","3","0","0","0","0","0","11","2","2017-01-10","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("113","17011","Desperados Flare","17011-Desperados Flare","3","0","0","0","0","0","11","2","2017-01-10","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("114","17012","Hormiguero 2017","17012-Hormiguero 2017","3","0","0","0","0","0","11","2","2017-01-10","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("115","17013","Video Motivación Encuentros","17013-Video Motivación Encuentros","3","0","0","0","0","0","11","2","2017-01-10","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("116","17014","Flare Navidad","17014-Flare Navidad","3","0","0","0","0","0","11","2","2017-01-10","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("117","17015","Guión Just Dance","17015-Guión Just Dance","3","0","0","0","0","0","28","2","2017-01-10","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("118","17016","Miniglus Ecovidrio","17016-Miniglus Ecovidrio","3","0","0","0","0","0","8","2","2017-01-10","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("119","17017","Solo Loewe","17017-Solo Loewe","3","0","0","0","0","0","14","2","2017-01-10","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("120","17018","Concurso YR","17018-Concurso YR","3","0","0","0","0","0","10","2","2017-01-10","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("121","0","Vacaciones","00000-Vacaciones","9","0","0","0","0","0","1","2","2017-01-01","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("122","17019","Extras BA fin de activaciones 2016","17019-Extras BA fin de activaciones 2016","1","0","0","0","0","0","26","2","2017-01-10","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("123","17020","Planificación Estratégica Royal Bliss","17020-Planificación Estratégica Royal Bliss","1","0","0","0","0","0","26","2","2017-01-10","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("124","17021","Degustación Royal Bliss Orense","17021-Degustación Royal Bliss Orense","1","0","0","0","0","0","26","2","2017-01-11","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("125","17022","Mixability 2016","17022-Mixability 2016","1","0","0","0","0","0","26","2","2017-01-11","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("126","17901","Present. LG PRISA SOD","17901-Present. LG PRISA SOD","3","0","0","0","0","0","32","2","2017-01-11","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("135","17031","Vídeo alimentación Valencia","17031-Vídeo alimentación Valencia","3","0","0","0","0","0","11","2","2017-01-17","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("136","17032","Gala Gigantes de Baloncesto","17032-Gala Gigantes de Baloncesto","1","0","0","0","0","0","26","2","2017-01-17","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("137","17034","Cruzcampo WOW","17034-Cruzcampo WOW","3","0","0","0","0","0","11","2","2017-01-17","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("138","17035","Heineken WOW","17035-Heineken WOW","3","0","0","0","0","0","11","2","2017-01-18","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("139","17036","Desperados WOW","17036-Desperados WOW","3","0","0","0","0","0","11","2","2017-01-18","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("140","17037","Desmontando mi belleza","17037-Desmontando mi belleza","2","0","0","0","0","0","9","2","2017-01-18","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("149","17038","Transporte Royal Bliss","17038-Transporte Royal Bliss","1","0","0","0","0","0","5","2","2017-01-23","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("150","17039","Eventos Presentación Victor Fdez","17039-Eventos Presentación Victor Fdez","1","0","0","0","0","0","26","2","2017-01-23","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("151","17040","Recogidas varias RB","17040-Recogidas varias RB","1","0","0","0","0","0","26","2","2017-01-23","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("152","17041","BP Granada","17041-BP Granada","1","0","0","0","0","0","26","2","2017-01-23","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("153","17042","Fin de Año Coca Cola","17042-Fin de Año Coca Cola","1","0","0","0","0","0","26","2","2017-01-23","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("158","17043","BP Sevilla","17043-BP Sevilla","1","0","0","0","0","0","26","2","2017-01-23","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("155","17044","Viajes formación PLAN BA","17044-Viajes formación PLAN BA","1","0","0","0","0","0","26","2","2017-01-23","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("156","17902","Present Beach House Ibiza","17902-Present Beach House Ibiza","3","0","0","0","0","0","26","2","2017-01-23","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("157","17903","Present Train Trax","17903-Present Train Trax","3","0","0","0","0","0","11","2","2017-01-23","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("159","17045","Shiseido - Synchro Skin","17045-Shiseido - Synchro Skin","2","0","0","0","0","0","27","2","2017-01-24","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("160","17046","ACB – Almacenaje stand","17046-ACB – Almacenaje stand","2","0","0","0","0","0","3","2","2017-01-26","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("161","17047","Festivales 2017","17047-Festivales 2017","1","0","0","0","0","0","26","2","2017-01-26","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("162","17048","Evento Dia 30 BCN RB Bravo","17048-Evento Dia 30 BCN RB Bravo","1","0","0","0","0","0","26","2","2017-01-26","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("163","17049","2016_Business Plan CCmix/RB","17049-2016_Business Plan CCmix/RB","1","0","0","0","0","0","26","2","2017-01-26","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("164","17050","Presentación Lagos RB","17050-Presentación Lagos RB","1","0","0","0","0","0","26","2","2017-01-26","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("165","17051","2016_Supermercados","17051-2016_Supermercados","1","0","0","0","0","0","26","2","2017-01-26","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("166","17904","Formaciones DSP digital","17904-Formaciones DSP digital","3","0","0","0","0","0","11","2","2017-01-31","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("167","17053","Almacen anual DSP Trade","17053-Almacen anual DSP Trade","3","0","0","0","0","0","11","2","2017-01-31","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("168","17054","Almacen mobiliario, jaulas y neveras","17054-Almacen mobiliario, jaulas y neveras","3","0","0","0","0","0","11","2","2017-01-31","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("169","17052","Cuñas CCME Tony Aguilar","17052-Cuñas CCME Tony Aguilar","2","0","0","0","0","0","7","2","2017-01-31","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("170","17055","Evento Empleados Pilar Invarato","17055-Evento Empleados Pilar Invarato","1","0","0","0","0","0","26","2","2017-02-01","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("171","17056","Formaciones Andalucía Resu Febrero","17056-Formaciones Andalucía Resu Febrero","1","0","0","0","0","0","26","2","2017-02-01","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("172","17058","Fibes Sevilla 19 Febrero","17058-Fibes Sevilla 19 Febrero","1","0","0","0","0","0","26","2","2017-02-01","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("173","17059","Abades Hotel Triana","17059-Abades Hotel Triana","1","0","0","0","0","0","26","2","2017-02-01","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("174","17060","Áreas inauguración","17060-Áreas inauguración","1","0","0","0","0","0","26","2","2017-02-01","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("175","17061","AECOC 2017","17061-AECOC 2017","1","0","0","0","0","0","26","2","2017-02-01","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("176","17062","Restalia 2017","17062-Restalia 2017","1","0","0","0","0","0","26","2","2017-02-01","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("177","17057","Presentación Coca-cola BK","17057-Presentación Coca-cola BK","3","0","0","0","0","0","26","2","2017-02-01","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("178","17063","Maridaje NH","17063-Maridaje NH","1","0","0","0","0","0","26","2","2017-02-01","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("180","17905","Concurso Samsung con Pablo Alborán","17905-Concurso Samsung con Pablo Alborán","3","0","0","0","0","0","33","2","2017-02-06","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("181","17906","Concurso Royal Bliss Only You (USHUAIA)","17906-Concurso Royal Bliss Only You (USHUAIA)","1","0","0","0","0","0","26","2","2017-02-06","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("182","17907","Shiseido Lanzamiento Waso","17907-Shiseido Lanzamiento Waso","2","0","0","0","0","0","27","2","2017-02-06","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("183","17908","Shiseido Lanzamiento Ultimune","17908-Shiseido Lanzamiento Ultimune","2","0","0","0","0","0","27","2","2017-02-06","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("184","17909","Template Coca Cola y Burger King","17909-Template Coca Cola y Burger King","3","0","0","0","0","0","26","2","2017-02-06","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("185","17910","Concurso Maxxium (Jim Bean y Cutty Sark)","17910-Concurso Maxxium (Jim Bean y Cutty Sark)","3","0","0","0","0","0","31","2","2017-02-06","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("186","17064","Uniformes Royal Bliss","17064-Uniformes Royal Bliss","1","0","0","0","0","0","26","2","2017-02-07","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("187","17065","Fee Whatsred 2017","17065-Fee Whatsred 2017","2","0","0","0","0","0","12","2","2017-02-07","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("188","17066","ACB - Creatividades web","17066-ACB - Creatividades web","2","0","0","0","0","0","3","2","2017-02-07","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("189","17067","ACB - Diseño fundas maletas","17067-ACB - Diseño fundas maletas","2","0","0","0","0","0","3","2","2017-02-07","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("190","17068","ACB - Inserción revista","17068-ACB - Inserción revista","2","0","0","0","0","0","3","2","2017-02-07","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("191","17069","Escenario SanSan 2017","17069-Escenario SanSan 2017","3","0","0","0","0","0","11","2","2017-02-07","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("192","17070","AAFF Caja Desperados","17070-AAFF Caja Desperados","3","0","0","0","0","0","11","2","2017-02-07","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("193","17071","Pendientes WR","17071-Pendientes WR","2","0","0","0","0","0","12","2","2017-02-07","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("194","17072","Fee Marketing Creatividad Jim Beam","17072-Fee Marketing Creatividad Jim Beam","1","0","0","0","0","0","31","2","2017-04-28","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("195","17073","Procedures (ecard   ppt)","17073-Procedures (ecard   ppt)","2","0","0","0","0","0","2","2","2017-02-08","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("196","17074","Compra vídeos getty tren","17074-Compra vídeos getty tren","2","0","0","0","0","0","2","2","2017-02-08","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("197","17075","Top employer","17075-Top employer","2","0","0","0","0","0","29","2","2017-02-08","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("198","17076","Mr. Calm","17076-Mr. Calm","2","0","0","0","0","0","13","2","2017-02-08","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("199","17080","Logística Tango","17080-Logística Tango","1","0","0","0","0","0","26","2","2017-02-09","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("200","17077","Recogida copas","17077-Recogida copas","1","0","0","0","0","0","26","2","2017-02-09","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("201","17078","Royal Bliss Talavera","17078-Royal Bliss Talavera","1","0","0","0","0","0","26","2","2017-02-09","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("202","17079","2016_ Espejo 2016","17079-2016_ Espejo 2016","1","0","0","0","0","0","26","2","2017-02-09","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("203","17081","Normas (ecard ppt)","17081-Normas (ecard ppt)","2","0","0","0","0","0","2","2","2017-02-09","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("204","17082","Activación FOX","17082-Activación FOX","1","0","0","0","0","0","26","2","2017-02-13","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("205","17083","HIP 19 al 21 FEB porfa","17083-HIP 19 al 21 FEB porfa","1","0","0","0","0","0","26","2","2017-02-13","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("206","17084","Collar Botella RB","17084-Collar Botella RB","1","0","0","0","0","0","26","2","2017-02-13","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("207","17085","Cena Diageo 19 Feb","17085-Cena Diageo 19 Feb","1","0","0","0","0","0","26","2","2017-02-13","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("208","17086","Entrega premiso Casino 20 FEB","17086-Entrega premiso Casino 20 FEB","1","0","0","0","0","0","26","2","2017-02-13","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("209","17087","Basque Culinary 22 FEB","17087-Basque Culinary 22 FEB","1","0","0","0","0","0","26","2","2017-02-13","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("210","17088","GRX Winter Fest Granada","17088-GRX Winter Fest Granada","2","0","0","0","0","0","7","2","2017-02-13","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("211","17089","2016_Nochevieja Universitaria","17089-2016_Nochevieja Universitaria","1","0","0","0","0","0","26","2","2017-02-13","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("212","17090","2016_Extras Espejo","17090-2016_Extras Espejo","1","0","0","0","0","0","26","2","2017-02-13","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("213","17091","2016_Gastos Formación Bartenders","17091-2016_Gastos Formación Bartenders","1","0","0","0","0","0","26","2","2017-02-13","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("214","17092","Accenture: Proyectos (ecard ppt)","17092-Accenture: Proyectos (ecard ppt)","2","0","0","0","0","0","2","2","2017-02-13","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("215","17911","Concurso Línea Directa – Evento","17911-Concurso Línea Directa – Evento","2","0","0","0","0","0","30","2","2017-02-13","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("216","17093","Varios Evento 22 Feb","17093-Varios Evento 22 Feb","2","0","0","0","0","0","2","2","2017-02-14","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("217","17094","Video Referéndum Cruzcampo","17094-Video Referéndum Cruzcampo","3","0","0","0","0","0","11","2","2017-02-15","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("218","17095","Regalo Tomás y Nacho","17095-Regalo Tomás y Nacho","3","0","0","0","0","0","11","2","2017-02-15","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("219","17096","Maridaje Barceló Canarias","17096-Maridaje Barceló Canarias","1","0","0","0","0","0","26","2","2017-02-16","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("220","17097","Maridaje Paradores Nacionales","17097-Maridaje Paradores Nacionales","1","0","0","0","0","0","26","2","2017-02-16","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("221","17098","Inauguración Autocine","17098-Inauguración Autocine","1","0","0","0","0","0","26","2","2017-02-20","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("222","17099","Cena Casino de Madrid","17099-Cena Casino de Madrid","1","0","0","0","0","0","26","2","2017-02-20","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("223","17100","Creatividades y Artes Finales","17100-Creatividades y Artes Finales","1","0","0","0","0","0","26","2","2017-02-20","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("224","17101","Compra vasos Royal Bliss","17101-Compra vasos Royal Bliss","1","0","0","0","0","0","26","2","2017-02-20","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("225","17102","Pago Lucas presentación Royal","17102-Pago Lucas presentación Royal","1","0","0","0","0","0","26","2","2017-02-20","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("226","17912","Presentación BMW","17912-Presentación BMW","3","0","0","0","0","0","34","2","2017-02-21","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("227","17913","Presentación Stoli","17913-Presentación Stoli","3","0","0","0","0","0","35","2","2017-02-21","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("228","17106","Graffitis","17106-Graffitis","3","0","0","0","0","0","11","2","2017-02-21","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("229","17107","DSP Bassdrop 2016","17107-DSP Bassdrop 2016","3","0","0","0","0","0","11","2","2017-02-21","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("230","17103","Copa del Rey","17103-Copa del Rey","2","0","0","0","0","0","3","2","2017-02-21","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("231","17104","Parador Baiona","17104-Parador Baiona","1","0","0","0","0","0","26","2","2017-02-21","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("232","17105","Logística Holanda","17105-Logística Holanda","1","0","0","0","0","0","36","2","2017-02-21","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("233","17108","Producciones DSP digital","17108-Producciones DSP digital","3","0","0","0","0","0","11","2","2017-02-27","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("234","17109","Premios Morningstar Villa Magna","17109-Premios Morningstar Villa Magna","1","0","0","0","0","0","26","2","2017-02-27","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("235","17110","Coca-Cola nuevos formatos","17110-Coca-Cola nuevos formatos","1","0","0","0","0","0","26","2","2017-02-27","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("236","17111","Extras FIBES Sevilla 19 Febrero171","17111-Extras FIBES Sevilla 19 Febrero171","1","0","0","0","0","0","26","2","2017-02-27","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("237","17112","Adaptación de ecard decálogo","17112-Adaptación de ecard decálogo","2","0","0","0","0","0","2","2","2017-02-27","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("238","17113","Videocard mutua madrileña","17113-Videocard mutua madrileña","2","0","0","0","0","0","2","2","2017-02-27","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("239","17114","Convención Anual Burger King","17114-Convención Anual Burger King","1","0","0","0","0","0","26","2","2017-02-27","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("240","17115","Verti monstruos","17115-Verti monstruos","2","0","0","0","0","0","13","2","2017-02-27","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("241","17116","LG A toda pantalla","17116-LG A toda pantalla","2","0","0","0","0","0","32","2","2017-02-27","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("263","17117","Barrika Bilbao","17117-Barrika Bilbao","1","0","0","0","0","0","26","2","2017-02-27","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("264","17914","Presentación Alimentación moderna","17914-Presentación Alimentación moderna","1","0","0","0","0","0","26","2","2017-02-28","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("265","17118","GALA 16F","17118-GALA 16F","1","0","0","0","0","0","26","2","2017-03-03","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("266","17119","Plaza Mayor Málaga","17119-Plaza Mayor Málaga","1","0","0","0","0","0","26","2","2017-03-03","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("267","17120","CENA PILAR INVARATO CARRITO READY","17120-CENA PILAR INVARATO CARRITO READY","1","0","0","0","0","0","26","2","2017-03-03","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("268","17121","Kuche","17121-Kuche","1","0","0","0","0","0","26","2","2017-03-03","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("269","17122","Miss Sushi","17122-Miss Sushi","1","0","0","0","0","0","26","2","2017-03-03","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("270","17123","Ibiza 2017","17123-Ibiza 2017","1","0","0","0","0","0","26","2","2017-03-03","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("271","17124","La Floración","17124-La Floración","1","0","0","0","0","0","26","2","2017-03-03","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("272","17125","Rest La Cabra 6 comidas","17125-Rest La Cabra 6 comidas","1","0","0","0","0","0","26","2","2017-03-03","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("273","17126","BCN Consejo CCEP","17126-BCN Consejo CCEP","1","0","0","0","0","0","26","2","2017-03-03","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("278","17130","Formaciones Staff RB","17130-Formaciones Staff RB","1","0","0","0","0","0","26","2","2017-03-06","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("275","17127","Pre-Concierto 90´s","17127-Pre-Concierto 90´s","1","0","0","0","0","0","26","2","2017-03-03","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("348","17918","Presentación Cutt_Mixopolis","17918-Presentación Cutt_Mixopolis","1","0","0","0","0","0","31","2","2017-04-27","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("276","17128","Videocard El Corte Inglés","17128-Videocard El Corte Inglés","2","0","0","0","0","0","2","2","2017-03-03","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("277","17129","Videocard Liberbank","17129-Videocard Liberbank","2","0","0","0","0","0","2","2","2017-03-03","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("279","17131","JimBeam_TDMK_2017","17131-JimBeam_TDMK_2017","1","0","0","0","0","0","31","2","2017-03-06","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("280","17132","Fee equipo 2017","17132-Fee equipo 2017","3","0","0","0","0","0","11","2","2017-03-06","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("281","17915","Presentación Stand Ubisoft","17915-Presentación Stand Ubisoft","3","0","0","0","0","0","28","2","2017-03-06","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("282","17133","Formación Chicote","17133-Formación Chicote","1","0","0","0","0","0","26","2","2017-03-07","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("283","17134","Promoción Bartender en casa","17134-Promoción Bartender en casa","1","0","0","0","0","0","26","2","2017-03-09","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("284","17135","Videocards Iberia y Ministro","17135-Videocards Iberia y Ministro","2","0","0","0","0","0","2","2","2017-03-09","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("285","17136","Miss Shusi Santa Ana","17136-Miss Shusi Santa Ana","1","0","0","0","0","0","26","2","2017-03-09","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("286","17137","Carrito RB cena Pilar Invarato 27","17137-Carrito RB cena Pilar Invarato 27","1","0","0","0","0","0","36","2","2017-03-10","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("287","17138","Train Trax","17138-Train Trax","3","0","0","0","0","0","11","2","2017-03-13","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("288","17139","Local Topspin","17139-Local Topspin","3","0","0","0","0","0","11","2","2017-03-13","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("289","17140","Evento Casino Gran Vía 16/03","17140-Evento Casino Gran Vía 16/03","1","0","0","0","0","0","26","2","2017-03-15","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("290","17141","Miss Sushi Pozuelo","17141-Miss Sushi Pozuelo","1","0","0","0","0","0","26","2","2017-03-15","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("291","17142","Transporte Sevilla Carrito RB   Roll Up","17142-Transporte Sevilla Carrito RB   Roll Up","1","0","0","0","0","0","26","2","2017-03-15","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("292","17143","Accenture Rodrigo","17143-Accenture Rodrigo","2","0","0","0","0","0","2","2","2017-03-15","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("293","17144","Royal Bliss  Sierra Nevada (Cliquot)","17144-Royal Bliss  Sierra Nevada (Cliquot)","1","0","0","0","0","0","26","2","2017-03-15","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("294","17145","Cnon Sevilla","17145-Cnon Sevilla","1","0","0","0","0","0","26","2","2017-03-16","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("295","17146","Videocard Garrigues","17146-Videocard Garrigues","2","0","0","0","0","0","2","2","2017-03-16","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("296","17147","Videocard Mercadona y Sabadell","17147-Videocard Mercadona y Sabadell","2","0","0","0","0","0","2","2","2017-03-16","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("297","17148","Almacenaje Estefanía Sánchez","17148-Almacenaje Estefanía Sánchez","1","0","0","0","0","0","26","2","2017-03-16","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("298","17149","Ecard innovación Cocktail","17149-Ecard innovación Cocktail","2","0","0","0","0","0","2","2","2017-03-16","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("299","17150","Alimarket 2017","17150-Alimarket 2017","1","0","0","0","0","0","26","2","2017-03-17","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("300","17152","Restaurante Mafia","17152-Restaurante Mafia","1","0","0","0","0","0","26","2","2017-03-17","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("301","17151","Accenture – Ecard Cocktails","17151-Accenture – Ecard Cocktails","2","0","0","0","0","0","2","2","2017-03-21","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("302","17153","CCME VARIOS PRODUCCIÓN","17153-CCME VARIOS PRODUCCIÓN","2","0","0","0","0","0","7","2","2017-03-21","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("303","17154","Pause","17154-Pause","1","0","0","0","0","0","26","2","2017-03-21","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("304","17155","BARTALENT TALKS A CORUÑA 28 de Marzo","17155-BARTALENT TALKS A CORUÑA 28 de Marzo","1","0","0","0","0","0","26","2","2017-03-21","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("305","17156","Alimarket 03/2017","17156-Alimarket 03/2017","1","0","0","0","0","0","26","2","2017-03-22","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("306","17157","Covirán Jarama","17157-Covirán Jarama","1","0","0","0","0","0","26","2","2017-03-22","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("307","17916","Concurso Summer Alimentación Moderna","17916-Concurso Summer Alimentación Moderna","1","0","0","0","0","0","26","2","2017-03-23","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("308","17158","Socuellamos","17158-Socuellamos","1","0","0","0","0","0","26","2","2017-03-23","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("309","17159","Video case Cruzcampo Global","17159-Video case Cruzcampo Global","3","0","0","0","0","0","11","2","2017-03-24","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("310","17160","Heineken Manifiesto","17160-Heineken Manifiesto","3","0","0","0","0","0","11","2","2017-03-24","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("311","17161","Evento TGB","17161-Evento TGB","1","0","0","0","0","0","26","2","2017-03-27","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("312","17162","Evento Urgente 28/03","17162-Evento Urgente 28/03","1","0","0","0","0","0","26","2","2017-03-28","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("313","17163","Evento Casino Gran Madrid","17163-Evento Casino Gran Madrid","1","0","0","0","0","0","26","2","2017-03-28","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("314","17164","Gambrinus Arganda","17164-Gambrinus Arganda","1","0","0","0","0","0","26","2","2017-03-28","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("315","17165","II Jornadas Gastronómicas Baza","17165-II Jornadas Gastronómicas Baza","1","0","0","0","0","0","26","2","2017-03-28","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("316","17166","Shooting","17166-Shooting","1","0","0","0","0","0","31","2","2017-03-29","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("317","17167","Evento piloto","17167-Evento piloto","1","0","0","0","0","0","31","2","2017-03-29","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("318","17168","Formaciones marzo Resu","17168-Formaciones marzo Resu","1","0","0","0","0","0","26","2","2017-03-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("319","17169","Curso de formación RB Osuna","17169-Curso de formación RB Osuna","1","0","0","0","0","0","26","2","2017-03-30","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("320","17170","Shiseido TeamBuilding Future Solution","17170-Shiseido TeamBuilding Future Solution","2","0","0","0","0","0","15","2","2017-03-31","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("321","17171","Hípica Segovia y Casa Claudio","17171-Hípica Segovia y Casa Claudio","1","0","0","0","0","0","26","2","2017-04-03","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("322","17172","Sales Folder Trade","17172-Sales Folder Trade","3","0","0","0","0","0","11","2","2017-04-03","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("323","17173","Botellas Cruzcampo","17173-Botellas Cruzcampo","3","0","0","0","0","0","11","2","2017-04-03","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("324","17174","Ecard GTA Animales Conjuntos","17174-Ecard GTA Animales Conjuntos","2","0","0","0","0","0","2","2","2017-04-04","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("325","17175","Ecard Startup You Apadrina","17175-Ecard Startup You Apadrina","2","0","0","0","0","0","2","2","2017-04-04","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("326","17176","Ecard Evento Externo","17176-Ecard Evento Externo","2","0","0","0","0","0","2","2","2017-04-04","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("327","17177","Ecard 4 Puntos","17177-Ecard 4 Puntos","2","0","0","0","0","0","2","2","2017-04-04","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("328","17178","Template","17178-Template","2","0","0","0","0","0","2","2","2017-04-04","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("329","17179","Ecard Inauguración Interna","17179-Ecard Inauguración Interna","2","0","0","0","0","0","2","2","2017-04-04","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("330","17180","Vídeo Evento Inauguración","17180-Vídeo Evento Inauguración","2","0","0","0","0","0","2","2","2017-04-04","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("331","17181","Ecard Desayunos Creativos","17181-Ecard Desayunos Creativos","2","0","0","0","0","0","2","2","2017-04-04","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("332","17182","Market Place","17182-Market Place","1","0","0","0","0","0","31","2","2017-04-04","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("333","17183","Video Interno Perú","17183-Video Interno Perú","2","0","0","0","0","0","13","2","2017-04-06","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("334","17184","OOH 2017","17184-OOH 2017","3","0","0","0","0","0","11","2","2017-04-06","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("335","17185","Formación Huelva Apoyo Formador","17185-Formación Huelva Apoyo Formador","1","0","0","0","0","0","26","2","2017-04-06","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("336","17187","Digital Hub 2016","17187-Digital Hub 2016","2","0","0","0","0","0","2","2","2017-04-07","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("337","17188","Ecard Lanzamiento Startup","17188-Ecard Lanzamiento Startup","2","0","0","0","0","0","2","2","2017-04-07","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("338","17189","Videocard mutua madrileña","17189-Videocard mutua madrileña","2","0","0","0","0","0","2","2","2017-04-07","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("339","17186","Video Commerce awards","17186-Video Commerce awards","3","0","0","0","0","0","11","2","2017-04-07","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("340","17190","Vídeocard Garrigues","17190-Vídeocard Garrigues","2","0","0","0","0","0","2","2","2017-04-07","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("341","17191","Vídeo Accenture Mapfre 2025","17191-Vídeo Accenture Mapfre 2025","2","0","0","0","0","0","2","2","2017-04-07","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("342","17192","Ecard Invitación Evento","17192-Ecard Invitación Evento","2","0","0","0","0","0","2","2","2017-04-07","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("343","17193","Diseño Ecard Startup You Apadrina","17193-Diseño Ecard Startup You Apadrina","2","0","0","0","0","0","2","2","2017-04-07","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("344","17194","Accenture Video Employee","17194-Accenture Video Employee","2","0","0","0","0","0","2","2","2017-04-07","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("345","17195","Club Financiero Génova","17195-Club Financiero Génova","1","0","0","0","0","0","26","2","2017-04-10","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("346","17196","Ecard GTA ganadores","17196-Ecard GTA ganadores","2","0","0","0","0","0","2","2","2017-04-10","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("347","17197","Sesiones Formación La Palma","17197-Sesiones Formación La Palma","1","0","0","0","0","0","26","2","2017-04-10","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("349","17198","Almacenaje Víctor Blanque","17198-Almacenaje Víctor Blanque","1","0","0","0","0","0","26","2","2017-04-27","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("350","17199","Rueda Prensa 11 Mayo Pilar Invarato","17199-Rueda Prensa 11 Mayo Pilar Invarato","1","0","0","0","0","0","5","2","2017-04-28","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("351","17200","Extras Jim Beam","17200-Extras Jim Beam","1","0","0","0","0","0","31","2","2017-05-03","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("352","17201","Almacenaje Carmen Arzac","17201-Almacenaje Carmen Arzac","1","0","0","0","0","0","26","2","2017-05-04","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("353","17202","Almacenaje Jorge Rocafort","17202-Almacenaje Jorge Rocafort","1","0","0","0","0","0","26","2","2017-05-04","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("354","17203","Jorge Mktg CIA","17203-Jorge Mktg CIA","1","0","0","0","0","0","37","2","2017-05-04","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("355","17204","Convención Gerentes M’cdonalds","17204-Convención Gerentes M’cdonalds","1","0","0","0","0","0","26","2","2017-05-04","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("356","17205","Evento La Roda","17205-Evento La Roda","1","0","0","0","0","0","26","2","2017-05-04","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("357","17206","Extras","17206-Extras","1","0","0","0","0","0","31","2","2017-05-05","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("358","17207","Ciudad de la Raqueta","17207-Ciudad de la Raqueta","1","0","0","0","0","0","26","2","2017-05-08","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("359","17208","Producciones Prisa","17208-Producciones Prisa","2","0","0","0","0","0","38","2","2017-05-09","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("360","17209","CCME Varios Producción","17209-CCME Varios Producción","2","0","0","0","0","0","7","2","2017-05-09","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("361","17210","Experiencia RB Ibiza","17210-Experiencia RB Ibiza","1","0","0","0","0","0","26","2","2017-05-10","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("362","17212","Producción Hummer Salamanca","17212-Producción Hummer Salamanca","2","0","0","0","0","0","5","2","2017-05-11","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("363","17212","Producción Hummer Salamanca","17212-Producción Hummer Salamanca","2","0","0","0","0","0","5","2","2017-05-11","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("364","17213","Producción Hummer Salamanca","17213-Producción Hummer Salamanca","2","0","0","0","0","0","12","2","2017-05-11","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("365","17214","Formación RB Restaurante Rast Madrid","17214-Formación RB Restaurante Rast Madrid","1","0","0","0","0","0","26","2","2017-05-12","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("366","17215","Actividad Barco","17215-Actividad Barco","1","0","0","0","0","0","26","2","2017-05-12","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("367","17216","CCA Madrid 17 Mayo","17216-CCA Madrid 17 Mayo","1","0","0","0","0","0","26","2","2017-05-12","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("368","17217","Materiales RB Pilar Invarato","17217-Materiales RB Pilar Invarato","1","0","0","0","0","0","26","2","2017-05-12","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("369","17218","Invirpa Horeca","17218-Invirpa Horeca","1","0","0","0","0","0","26","2","2017-05-12","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("370","17219","Primavera Sound DSP 2017","17219-Primavera Sound DSP 2017","3","0","0","0","0","0","11","2","2017-05-16","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("371","17220","Formación Meliá","17220-Formación Meliá","1","0","0","0","0","0","26","2","2017-05-17","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("372","17221","Premios de Marcas de Restauración 28 Junio","17221-Premios de Marcas de Restauración 28 Junio","1","0","0","0","0","0","26","2","2017-05-17","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("373","17222","Club Hípica Madrid 19,20,21 Mayo","17222-Club Hípica Madrid 19,20,21 Mayo","1","0","0","0","0","0","26","2","2017-05-17","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("374","17223","Presentación Interna de Royal Bliss en Portugal 22","17223-Presentación Interna de Royal Bliss en Portugal 22","1","0","0","0","0","0","26","2","2017-05-17","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("375","17224","BA Extra Lander Rola_Aaron Lozano","17224-BA Extra Lander Rola_Aaron Lozano","1","0","0","0","0","0","26","2","2017-05-17","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("376","17225","Coca-Cola Festivales 2017","17225-Coca-Cola Festivales 2017","2","0","0","0","0","0","7","2","2017-05-18","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("377","17226","Adaptación Infografías Coca-Cola (otras marcas)","17226-Adaptación Infografías Coca-Cola (otras marcas)","2","0","0","0","0","0","7","2","2017-05-18","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("378","17227","Final Copa del Rey","17227-Final Copa del Rey","1","0","0","0","0","0","26","2","2017-05-18","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("379","17228","Laboratorio ECI 2017","17228-Laboratorio ECI 2017","1","0","0","0","0","0","26","2","2017-05-18","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("380","17229","Pizarras Slowdown","17229-Pizarras Slowdown","2","0","0","0","0","0","13","2","2017-05-19","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("381","17230","Barman Bolera Bohemios","17230-Barman Bolera Bohemios","1","0","0","0","0","0","26","2","2017-05-22","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("382","17232","AECOC 05/2017","17232-AECOC 05/2017","1","0","0","0","0","0","26","2","2017-05-22","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("383","17231","Video The Crew 2017","17231-Video The Crew 2017","1","0","0","0","0","0","26","2","2017-05-22","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("384","17233","Cineeropa 2017","17233-Cineeropa 2017","1","0","0","0","0","0","26","2","2017-05-23","0000-00-00","0","Alto");
INSERT INTO tt_campaign VALUES("388","23423","dsfasdfasdf","","25","386","2","32","385","406","44","1","2017-08-01","2017-08-03","0","Alto");
INSERT INTO tt_campaign VALUES("389","12346","Proyecto 1","","2","389","5","40","385","406","5","1","2017-08-24","2017-09-08","0","Bajo");
INSERT INTO tt_campaign VALUES("390","12347","Proyecto 2","","2","389","6","41","385","406","5","3","2017-08-24","2017-08-25","0","Alto");
INSERT INTO tt_campaign VALUES("391","12348","Proyecto 3","","2","388","11","41","385","406","44","1","2017-08-08","2017-08-24","0","Bajo");
INSERT INTO tt_campaign VALUES("392","12349","Proyecto 4","","2","388","11","40","385","406","44","1","2017-08-08","2017-08-16","0","Alto");
INSERT INTO tt_campaign VALUES("393","12356","Proyecto 5","","2","388","11","42","385","406","44","1","2017-08-14","2017-08-16","0","Alto");
INSERT INTO tt_campaign VALUES("394","12357","Proyecto 6","","2","388","11","42","385","406","44","2","2017-08-03","2017-08-11","0","Bajo");
INSERT INTO tt_campaign VALUES("396","11111","Prueba","","25","389","5","27","385","406","5","2","2017-08-02","2017-08-10","0","Bajo");
INSERT INTO tt_campaign VALUES("399","9991","Proyecto 12","","25","388","11","32","385","406","44","1","2017-09-08","2017-09-08","0","Alto");
INSERT INTO tt_campaign VALUES("402","09991","Proyect","","29","390","9","44","385","406","5","1","2017-09-09","2017-09-15","0","Alto");
INSERT INTO tt_campaign VALUES("403","11122","Proyec","","25","389","6","27","385","406","5","1","2017-09-01","2017-09-14","0","Bajo");
INSERT INTO tt_campaign VALUES("404","11163","dg","","25","389","6","32","385","406","5","1","2017-09-16","2017-09-17","0","Alto");



DROP TABLE tt_company;

CREATE TABLE `tt_company` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET latin1 COLLATE latin1_spanish_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=404 DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

INSERT INTO tt_company VALUES("385","Tango");
INSERT INTO tt_company VALUES("399","Show on demands");



DROP TABLE tt_company_report;

CREATE TABLE `tt_company_report` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_company_year` int(11) NOT NULL,
  `amortizacion` float NOT NULL,
  `gasto_financiero` float NOT NULL,
  `gasto_extraordinario` float NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO tt_company_report VALUES("1","406","10","1.5","1.5");



DROP TABLE tt_company_year;

CREATE TABLE `tt_company_year` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_company` int(11) NOT NULL,
  `id_fiscal_year` int(11) NOT NULL DEFAULT '0',
  `tax` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`,`id_company`,`id_fiscal_year`)
) ENGINE=MyISAM AUTO_INCREMENT=411 DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

INSERT INTO tt_company_year VALUES("403","399","3","10");
INSERT INTO tt_company_year VALUES("406","385","2","25");
INSERT INTO tt_company_year VALUES("405","399","2","22");
INSERT INTO tt_company_year VALUES("404","399","1","10");



DROP TABLE tt_customer;

CREATE TABLE `tt_customer` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(50) COLLATE utf8_spanish_ci NOT NULL,
  `id_company` varchar(50) COLLATE utf8_spanish_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=53 DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

INSERT INTO tt_customer VALUES("5","CIA Servicios Bebidas Refrescantes","385");
INSERT INTO tt_customer VALUES("1","Tango","");
INSERT INTO tt_customer VALUES("2","Accenture, S.L.U.","");
INSERT INTO tt_customer VALUES("3","ACEB, S.A.U.","");
INSERT INTO tt_customer VALUES("4","Avon cosmeticos, S.A.U.","");
INSERT INTO tt_customer VALUES("27","Beaute Prestige International, S.L.P.","");
INSERT INTO tt_customer VALUES("7","Coca Cola Services","");
INSERT INTO tt_customer VALUES("8","Ecovidrio","");
INSERT INTO tt_customer VALUES("9","Fundación Pablo Horstmann","");
INSERT INTO tt_customer VALUES("10","Global Premium Brands","");
INSERT INTO tt_customer VALUES("11","Heineken España, S.A.","");
INSERT INTO tt_customer VALUES("12","Jabilbera, S.L.","");
INSERT INTO tt_customer VALUES("13","MAPFRE, S.A.","");
INSERT INTO tt_customer VALUES("14","Perfumes Loewe","");
INSERT INTO tt_customer VALUES("15","Shiseido España, S.A.","");
INSERT INTO tt_customer VALUES("16","Shows on Demand, S.L.","");
INSERT INTO tt_customer VALUES("17","Tecmedia Servicios y consultoria, S.L.","");
INSERT INTO tt_customer VALUES("18","Wrigley Co, S.L. ","");
INSERT INTO tt_customer VALUES("26","Coca Cola European Partners Iberia","");
INSERT INTO tt_customer VALUES("28","Ubisoft, S.A.","");
INSERT INTO tt_customer VALUES("29","JT International Iberia, S.L.","");
INSERT INTO tt_customer VALUES("30","Linea Directa","");
INSERT INTO tt_customer VALUES("31","Maxxium","");
INSERT INTO tt_customer VALUES("32","LG","");
INSERT INTO tt_customer VALUES("33","Samsung","");
INSERT INTO tt_customer VALUES("34","BMW","");
INSERT INTO tt_customer VALUES("35","Stoli","");
INSERT INTO tt_customer VALUES("36","Layd Alcomex, S.L.","");
INSERT INTO tt_customer VALUES("37","Poterscope Iberia SA","");
INSERT INTO tt_customer VALUES("38","Arena Media Comuniactions España","");
INSERT INTO tt_customer VALUES("44","gggg2","385");
INSERT INTO tt_customer VALUES("45","endesa","385");
INSERT INTO tt_customer VALUES("46","Cliente 12","385");
INSERT INTO tt_customer VALUES("47","Cliente 2","385");
INSERT INTO tt_customer VALUES("48","Cliente 3","385");
INSERT INTO tt_customer VALUES("49","Cliente4","385");
INSERT INTO tt_customer VALUES("50","Cliente5","385");
INSERT INTO tt_customer VALUES("52","Cliente 1","385");



DROP TABLE tt_estimated_employee_cost;

CREATE TABLE `tt_estimated_employee_cost` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_campaign` int(11) NOT NULL,
  `id_month` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `amount` float NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO tt_estimated_employee_cost VALUES("8","3","june","0");
INSERT INTO tt_estimated_employee_cost VALUES("16","3","may","0");
INSERT INTO tt_estimated_employee_cost VALUES("17","3","february","12.1");
INSERT INTO tt_estimated_employee_cost VALUES("18","3","january","2");
INSERT INTO tt_estimated_employee_cost VALUES("19","3","march","2");
INSERT INTO tt_estimated_employee_cost VALUES("20","386","january","0");
INSERT INTO tt_estimated_employee_cost VALUES("21","386","february","0");
INSERT INTO tt_estimated_employee_cost VALUES("22","396","january","1");
INSERT INTO tt_estimated_employee_cost VALUES("23","396","february","0");
INSERT INTO tt_estimated_employee_cost VALUES("24","389","january","3");
INSERT INTO tt_estimated_employee_cost VALUES("25","389","february","0");
INSERT INTO tt_estimated_employee_cost VALUES("26","390","february","0");
INSERT INTO tt_estimated_employee_cost VALUES("27","390","march","0");
INSERT INTO tt_estimated_employee_cost VALUES("28","389","march","10");
INSERT INTO tt_estimated_employee_cost VALUES("29","389","april","5");
INSERT INTO tt_estimated_employee_cost VALUES("30","389","may","0");
INSERT INTO tt_estimated_employee_cost VALUES("31","390","january","4");



DROP TABLE tt_expenses_fixed_concept;

CREATE TABLE `tt_expenses_fixed_concept` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_fixed_concept` int(50) NOT NULL,
  `id_month` varchar(50) COLLATE latin1_german1_ci NOT NULL,
  `id_fiscal_year` int(50) NOT NULL,
  `amount` varchar(100) CHARACTER SET latin1 COLLATE latin1_spanish_ci NOT NULL,
  `type` int(50) NOT NULL COMMENT '0: estimated; 1:real',
  `id_company` int(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=677 DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

INSERT INTO tt_expenses_fixed_concept VALUES("406","391","april","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("571","400","december","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("565","400","june","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("564","400","may","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("558","407","august","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("401","397","february","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("557","407","july","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("563","400","march","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("554","407","march","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("408","397","april","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("568","400","september","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("567","400","august","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("414","396","march","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("572","391","may","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("555","407","may","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("562","407","december","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("419","396","may","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("420","391","february","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("421","397","december","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("556","407","june","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("552","406","december","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("553","407","february","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("551","406","november","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("550","406","october","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("432","408","february","406","2","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("433","407","march","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("548","406","august","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("547","406","july","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("546","406","june","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("545","406","may","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("544","406","april","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("541","409","december","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("543","406","march","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("526","408","august","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("527","408","september","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("528","408","october","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("529","408","november","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("530","408","december","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("531","409","february","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("521","408","february","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("522","408","april","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("523","408","may","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("524","408","june","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("525","408","july","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("540","409","november","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("539","409","october","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("536","409","july","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("537","409","august","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("538","409","september","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("467","408","march","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("534","409","may","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("533","409","april","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("512","408","january","406","1","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("513","391","january","406","1","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("514","409","february","406","2","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("515","406","february","406","2","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("516","407","february","406","2","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("478","407","april","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("532","409","march","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("481","400","february","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("482","400","april","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("570","400","november","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("484","391","march","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("485","391","june","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("486","396","february","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("566","400","july","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("488","396","april","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("559","407","september","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("491","397","march","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("561","407","november","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("560","407","october","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("535","409","june","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("495","409","january","406","1","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("496","406","january","406","1","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("497","407","january","406","1","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("498","400","january","406","1","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("569","400","october","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("500","396","january","406","1","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("501","397","january","406","1","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("549","406","september","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("519","396","february","406","2","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("520","397","february","406","2","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("506","408","january","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("542","406","february","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("517","400","february","406","2","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("518","391","february","406","2","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("511","408","october","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("573","391","july","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("574","391","august","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("575","391","september","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("576","391","october","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("577","391","november","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("578","391","december","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("579","396","june","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("580","396","july","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("581","396","august","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("582","396","september","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("583","396","october","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("584","396","november","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("585","396","december","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("586","397","may","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("587","397","june","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("588","397","july","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("589","397","august","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("590","397","september","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("591","397","october","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("592","397","november","406","0","0","385");
INSERT INTO tt_expenses_fixed_concept VALUES("593","408","march","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("594","408","april","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("595","408","may","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("596","408","june","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("597","408","july","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("598","408","august","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("599","408","september","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("600","408","november","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("601","408","december","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("602","409","january","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("603","409","march","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("604","409","april","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("605","409","may","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("606","409","june","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("607","409","july","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("608","409","august","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("609","409","september","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("610","409","october","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("611","409","november","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("612","409","december","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("613","406","january","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("614","406","march","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("615","406","april","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("616","406","may","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("617","406","june","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("618","406","july","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("619","406","august","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("620","406","september","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("621","406","october","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("622","406","november","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("623","406","december","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("624","407","january","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("625","407","april","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("626","407","may","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("627","407","june","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("628","407","july","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("629","407","august","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("630","407","september","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("631","407","october","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("632","407","november","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("633","407","december","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("634","400","january","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("635","400","march","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("636","400","april","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("637","400","may","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("638","400","june","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("639","400","july","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("640","400","august","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("641","400","september","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("642","400","october","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("643","400","november","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("644","400","december","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("645","391","january","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("646","391","march","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("647","391","april","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("648","391","may","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("649","391","june","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("650","391","july","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("651","391","august","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("652","391","september","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("653","391","october","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("654","391","november","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("655","391","december","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("656","396","january","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("657","396","march","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("658","396","april","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("659","396","may","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("660","396","june","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("661","396","july","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("662","396","august","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("663","396","september","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("664","396","october","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("665","396","november","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("666","396","december","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("667","397","january","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("668","397","march","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("669","397","april","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("670","397","may","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("671","397","june","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("672","397","july","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("673","397","august","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("674","397","september","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("675","397","october","406","0","1","385");
INSERT INTO tt_expenses_fixed_concept VALUES("676","397","november","406","0","1","385");



DROP TABLE tt_fiscal_year;

CREATE TABLE `tt_fiscal_year` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `year` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=395 DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

INSERT INTO tt_fiscal_year VALUES("1","2016");
INSERT INTO tt_fiscal_year VALUES("2","2017");
INSERT INTO tt_fiscal_year VALUES("3","2018");
INSERT INTO tt_fiscal_year VALUES("4","2019");
INSERT INTO tt_fiscal_year VALUES("5","2020");
INSERT INTO tt_fiscal_year VALUES("6","2021");
INSERT INTO tt_fiscal_year VALUES("7","2022");
INSERT INTO tt_fiscal_year VALUES("8","2023");
INSERT INTO tt_fiscal_year VALUES("9","2024");
INSERT INTO tt_fiscal_year VALUES("10","2025");



DROP TABLE tt_fixed_concept;

CREATE TABLE `tt_fixed_concept` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET latin1 COLLATE latin1_spanish_ci NOT NULL,
  `account_number` varchar(50) CHARACTER SET latin1 COLLATE latin1_spanish_ci NOT NULL,
  `id_company` varchar(50) COLLATE latin1_german1_ci NOT NULL,
  `id_fiscal_year` varchar(50) COLLATE latin1_german1_ci NOT NULL,
  `id_parent` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=410 DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

INSERT INTO tt_fixed_concept VALUES("390","personal3","600000","385","406","0");
INSERT INTO tt_fixed_concept VALUES("391","salario3","600001","385","406","390");
INSERT INTO tt_fixed_concept VALUES("392","mantenimiento","640000","385","406","0");
INSERT INTO tt_fixed_concept VALUES("396","salario 4","600002","385","406","390");
INSERT INTO tt_fixed_concept VALUES("397","salario 5","600005","385","406","390");
INSERT INTO tt_fixed_concept VALUES("398","padre","100000","385","406","0");
INSERT INTO tt_fixed_concept VALUES("399","ijijiji","500000","385","406","0");
INSERT INTO tt_fixed_concept VALUES("400","iuhiuhi","500001","385","406","399");
INSERT INTO tt_fixed_concept VALUES("401","adsf","234234","385","406","0");
INSERT INTO tt_fixed_concept VALUES("402","adsfaf","234234","385","406","0");
INSERT INTO tt_fixed_concept VALUES("403","sdgfsdgdsg","232342","385","406","0");
INSERT INTO tt_fixed_concept VALUES("404","sdgsdgfsdgf","234234","385","406","0");
INSERT INTO tt_fixed_concept VALUES("405","sdfgsdfgsdf","234543","385","406","0");
INSERT INTO tt_fixed_concept VALUES("406","1111111","111111","385","406","398");
INSERT INTO tt_fixed_concept VALUES("407","22222","222222","385","406","398");
INSERT INTO tt_fixed_concept VALUES("408","333333333","100001","385","406","398");
INSERT INTO tt_fixed_concept VALUES("409","33344444","100002","385","406","398");



DROP TABLE tt_group;

CREATE TABLE `tt_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_customer` int(11) NOT NULL,
  `name` varchar(100) CHARACTER SET latin1 COLLATE latin1_spanish_ci NOT NULL,
  `id_company` varchar(50) COLLATE latin1_german1_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=396 DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

INSERT INTO tt_group VALUES("386","44","zgrupo 1","385");
INSERT INTO tt_group VALUES("388","44","grupo 2","385");
INSERT INTO tt_group VALUES("389","5","Coca Cola 1","385");
INSERT INTO tt_group VALUES("390","5","Coca Cola 2","385");
INSERT INTO tt_group VALUES("391","46","Grupo1","385");
INSERT INTO tt_group VALUES("392","47","Grupo2","385");
INSERT INTO tt_group VALUES("393","46","Grupo3","385");
INSERT INTO tt_group VALUES("394","47","Grupo4","385");
INSERT INTO tt_group VALUES("395","46","grupo2","385");



DROP TABLE tt_hours;

CREATE TABLE `tt_hours` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hours` int(4) NOT NULL,
  `update_date` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

INSERT INTO tt_hours VALUES("1","1800","2017-03-09 19:18:35");



DROP TABLE tt_real_employee_cost;

CREATE TABLE `tt_real_employee_cost` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_campaign` int(11) NOT NULL,
  `id_month` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `amount` float NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO tt_real_employee_cost VALUES("1","386","january","0");
INSERT INTO tt_real_employee_cost VALUES("2","386","february","0");
INSERT INTO tt_real_employee_cost VALUES("3","396","january","2");
INSERT INTO tt_real_employee_cost VALUES("4","389","january","6");
INSERT INTO tt_real_employee_cost VALUES("5","390","january","8");
INSERT INTO tt_real_employee_cost VALUES("6","389","february","7");
INSERT INTO tt_real_employee_cost VALUES("7","389","march","8");
INSERT INTO tt_real_employee_cost VALUES("8","389","april","9");



DROP TABLE tt_role;

CREATE TABLE `tt_role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role` varchar(50) COLLATE latin1_german1_ci NOT NULL,
  `visibility` int(11) NOT NULL DEFAULT '1' COMMENT '1: visible en aplicacion gestion',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

INSERT INTO tt_role VALUES("1","admin","0");
INSERT INTO tt_role VALUES("2","Creativos","1");
INSERT INTO tt_role VALUES("3","Super Administrador","1");
INSERT INTO tt_role VALUES("4","Dirección","1");
INSERT INTO tt_role VALUES("5","Administración","1");
INSERT INTO tt_role VALUES("6","Supervisor","1");
INSERT INTO tt_role VALUES("7","Cuentas 1","1");
INSERT INTO tt_role VALUES("8","Cuentas 2","1");



DROP TABLE tt_salary_history;

CREATE TABLE `tt_salary_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` int(11) NOT NULL,
  `cost` double NOT NULL,
  `registration_date` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=22 DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

INSERT INTO tt_salary_history VALUES("20","15","15000","2017-03-01 00:00:00");
INSERT INTO tt_salary_history VALUES("19","15","30000","2017-01-01 00:00:00");
INSERT INTO tt_salary_history VALUES("18","5","25000","2017-02-01 00:00:00");
INSERT INTO tt_salary_history VALUES("16","2","20000","2017-01-01 00:00:00");
INSERT INTO tt_salary_history VALUES("15","11","25000","2017-01-01 00:00:00");



DROP TABLE tt_status;

CREATE TABLE `tt_status` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `status` varchar(50) COLLATE latin1_german1_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

INSERT INTO tt_status VALUES("1","Presupuestado");
INSERT INTO tt_status VALUES("2","Aprobado");
INSERT INTO tt_status VALUES("3","Finalizado");



DROP TABLE tt_subgroup;

CREATE TABLE `tt_subgroup` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_group` int(11) NOT NULL,
  `name` varchar(100) CHARACTER SET latin1 COLLATE latin1_spanish_ci NOT NULL,
  `id_company` varchar(50) COLLATE latin1_german1_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=13 DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

INSERT INTO tt_subgroup VALUES("2","386","subgrupo 1","385");
INSERT INTO tt_subgroup VALUES("4","386","subgrupo 2","385");
INSERT INTO tt_subgroup VALUES("5","389","Subgrupo CC1","385");
INSERT INTO tt_subgroup VALUES("6","389","Subgrupo CC2","385");
INSERT INTO tt_subgroup VALUES("7","389","Subgrupo CC3","385");
INSERT INTO tt_subgroup VALUES("8","389","Subgrupo1","385");
INSERT INTO tt_subgroup VALUES("9","390","Subgrupo2","385");
INSERT INTO tt_subgroup VALUES("10","390","Subgrupo3","385");
INSERT INTO tt_subgroup VALUES("11","388","a","385");
INSERT INTO tt_subgroup VALUES("12","395","b","385");



DROP TABLE tt_team;

CREATE TABLE `tt_team` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_company` varchar(20) COLLATE latin1_german1_ci NOT NULL,
  `team_name` varchar(50) COLLATE latin1_german1_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=48 DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

INSERT INTO tt_team VALUES("1","","Virginia");
INSERT INTO tt_team VALUES("2","385","Lucia");
INSERT INTO tt_team VALUES("3","","Terry");
INSERT INTO tt_team VALUES("12","","nombre123");
INSERT INTO tt_team VALUES("17","","222");
INSERT INTO tt_team VALUES("18","","administracion");
INSERT INTO tt_team VALUES("19","","1");
INSERT INTO tt_team VALUES("20","","2");
INSERT INTO tt_team VALUES("21","","3");
INSERT INTO tt_team VALUES("22","","4");
INSERT INTO tt_team VALUES("23","","5");
INSERT INTO tt_team VALUES("24","","6");
INSERT INTO tt_team VALUES("25","385","Agus");
INSERT INTO tt_team VALUES("29","385","Administración 1");
INSERT INTO tt_team VALUES("27","399","sssssasasda");
INSERT INTO tt_team VALUES("28","399","dsads");
INSERT INTO tt_team VALUES("30","385","equipo 2");
INSERT INTO tt_team VALUES("31","385","Equipo 3");
INSERT INTO tt_team VALUES("32","385","Equipo 4");
INSERT INTO tt_team VALUES("33","385","Equipo 6");
INSERT INTO tt_team VALUES("34","385","Equipo 5");
INSERT INTO tt_team VALUES("36","385","Equipo 7");
INSERT INTO tt_team VALUES("37","385","Equipo 8");
INSERT INTO tt_team VALUES("38","385","Equipo 9");
INSERT INTO tt_team VALUES("40","385","Equipo 11");
INSERT INTO tt_team VALUES("41","385","Equipo 12");
INSERT INTO tt_team VALUES("42","385","Equipo 13");



DROP TABLE tt_timetable;

CREATE TABLE `tt_timetable` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `day` varchar(15) COLLATE latin1_german1_ci NOT NULL,
  `hours_day` double NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

INSERT INTO tt_timetable VALUES("1","Lunes","8");
INSERT INTO tt_timetable VALUES("2","Martes","8");
INSERT INTO tt_timetable VALUES("3","Miércoles","8");
INSERT INTO tt_timetable VALUES("4","Jueves","8");
INSERT INTO tt_timetable VALUES("5","Viernes","5.5");



DROP TABLE tt_user;

CREATE TABLE `tt_user` (
  `id` tinyint(4) NOT NULL AUTO_INCREMENT,
  `nickname` varchar(50) CHARACTER SET latin1 COLLATE latin1_spanish_ci NOT NULL,
  `email` varchar(200) CHARACTER SET latin1 COLLATE latin1_spanish_ci NOT NULL,
  `password` varchar(50) CHARACTER SET latin1 COLLATE latin1_spanish_ci NOT NULL,
  `id_role` int(1) NOT NULL DEFAULT '2',
  `update_date` datetime NOT NULL,
  `status` int(11) NOT NULL DEFAULT '1' COMMENT '0: baja; 1:alta',
  `id_company` int(1) NOT NULL,
  `id_team` int(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=48 DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

INSERT INTO tt_user VALUES("1","Cristina Sanchez","cristina.sanchez@agenciatango.es","Tracker","1","0000-00-00 00:00:00","1","385","0");
INSERT INTO tt_user VALUES("3","Mariam Cuesta","mariam.cuesta@agenciatango.es","arte17","2","0000-00-00 00:00:00","1","385","0");
INSERT INTO tt_user VALUES("4","Enar Areces","enar.areces@agenciatango.es","tango17","2","0000-00-00 00:00:00","0","385","0");
INSERT INTO tt_user VALUES("5","Nazaret Perez","nazaret.perez@agenciatango.es","creativos17","2","0000-00-00 00:00:00","1","385","0");
INSERT INTO tt_user VALUES("6","Eduardo Sanchez","eduardo.sanchez@agenciatango.es","arte17","2","0000-00-00 00:00:00","1","385","0");
INSERT INTO tt_user VALUES("8","Reyes Rodriguez","reyes.rodriguez@agenciatango.es","creativos17","2","0000-00-00 00:00:00","0","385","0");
INSERT INTO tt_user VALUES("9","Pablo Castellano","pablo.castellano@agenciatango.es","arte17","2","0000-00-00 00:00:00","1","385","0");
INSERT INTO tt_user VALUES("10","Clara Hernandez","clara.hernandez@agenciatango.es","tango17","2","0000-00-00 00:00:00","1","385","0");
INSERT INTO tt_user VALUES("11","Sara Martin","sara.martin@agenciatango.es","creativos17","2","0000-00-00 00:00:00","1","385","0");
INSERT INTO tt_user VALUES("23","Sebastian Galeano","sebastian.galeano@agenciatango.es","tango17","2","2017-03-21 12:38:41","1","385","0");
INSERT INTO tt_user VALUES("13","super Admin","nitsuga1986@gmail.com","1111","3","0000-00-00 00:00:00","1","385","0");
INSERT INTO tt_user VALUES("15","Laura Santiago","laur4sc@gmail.com","1234","2","2017-01-02 00:00:00","0","385","0");
INSERT INTO tt_user VALUES("19","Jotha Julia","jotha@agenciatango.es","tango17","2","2017-01-24 18:19:55","1","385","0");
INSERT INTO tt_user VALUES("20","Beatriz Jaurata","beatriz.jaurata@agenciatango.es","arte17","2","2017-01-24 18:20:19","0","385","0");
INSERT INTO tt_user VALUES("24","Antonio Baeza","antonio.baeza@agenciatango.es","arte17","2","2017-03-21 12:39:05","1","385","0");
INSERT INTO tt_user VALUES("25","Sara Palacios","sara.palacios@agenciatango.es","tango17","2","2017-05-12 10:58:09","1","385","0");
INSERT INTO tt_user VALUES("26","Javier Bidezabal","javier.bidezabal@agenciatango.es","arte17","2","2017-05-12 11:01:28","1","385","0");
INSERT INTO tt_user VALUES("27","Elisa Lucia","elisa.lucia@agenciatango.es","tango17","2","2017-05-12 11:01:55","1","385","25");
INSERT INTO tt_user VALUES("43","Administración","adm@a.es","1234","5","0000-00-00 00:00:00","1","385","29");
INSERT INTO tt_user VALUES("40","Cuentas 1","c1@a.es","1234","7","0000-00-00 00:00:00","1","385","2");
INSERT INTO tt_user VALUES("32","12343","c3@a.es","1234","2","0000-00-00 00:00:00","1","385","25");
INSERT INTO tt_user VALUES("41","Cuentas 2","c2@a.es","1234","8","0000-00-00 00:00:00","1","385","2");
INSERT INTO tt_user VALUES("37","33323223232323","sdfsdfsd","3","7","0000-00-00 00:00:00","1","399","28");
INSERT INTO tt_user VALUES("44","Directivo","directivo@a.es","1234","4","0000-00-00 00:00:00","1","385","29");
INSERT INTO tt_user VALUES("42","Supervisor","s@a.es","1234","6","0000-00-00 00:00:00","1","385","2");
INSERT INTO tt_user VALUES("45","Laura","laur4sc@gmail.com","1234","3","0000-00-00 00:00:00","1","385","25");
INSERT INTO tt_user VALUES("46","asdv","admn@a.es","1234","4","0000-00-00 00:00:00","1","385","29");
INSERT INTO tt_user VALUES("47","asf","admin@a.es","2165","4","0000-00-00 00:00:00","1","385","25");



DROP TABLE tt_user_hours;

CREATE TABLE `tt_user_hours` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` int(11) NOT NULL,
  `date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `id_campaign` int(11) NOT NULL,
  `update_date` datetime NOT NULL,
  `sum_hours` int(11) NOT NULL COMMENT 'suma de los minutos de hora inicio y fin',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=769 DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

INSERT INTO tt_user_hours VALUES("200","6","2017-01-30","15:00:00","19:00:00","185","2017-02-06 19:20:15","240");
INSERT INTO tt_user_hours VALUES("203","7","2017-01-31","11:30:00","19:00:00","185","2017-02-07 18:23:58","450");
INSERT INTO tt_user_hours VALUES("202","6","2017-01-31","12:00:00","14:00:00","185","2017-02-07 00:00:00","120");
INSERT INTO tt_user_hours VALUES("201","6","2017-01-30","11:00:00","12:00:00","130","2017-02-06 19:22:12","60");
INSERT INTO tt_user_hours VALUES("157","2","2017-01-13","14:00:00","14:30:00","104","2017-01-13 14:34:20","30");
INSERT INTO tt_user_hours VALUES("156","2","2017-01-13","13:00:00","13:30:00","119","2017-01-13 14:33:54","30");
INSERT INTO tt_user_hours VALUES("155","2","2017-01-13","10:31:00","12:17:00","119","2017-01-13 12:17:50","106");
INSERT INTO tt_user_hours VALUES("154","2","2017-01-13","09:15:00","10:30:00","112","2017-01-13 10:31:18","75");
INSERT INTO tt_user_hours VALUES("153","2","2017-01-12","15:00:00","18:15:00","112","2017-01-12 18:50:47","195");
INSERT INTO tt_user_hours VALUES("152","2","2017-01-12","09:15:00","14:00:00","112","2017-01-12 15:29:26","285");
INSERT INTO tt_user_hours VALUES("151","2","2017-01-11","15:00:00","18:15:00","112","2017-01-12 09:16:30","195");
INSERT INTO tt_user_hours VALUES("150","2","2017-01-11","09:15:00","14:00:00","112","2017-01-12 09:16:03","285");
INSERT INTO tt_user_hours VALUES("149","2","2017-01-10","15:45:00","19:00:00","112","2017-01-11 10:11:20","195");
INSERT INTO tt_user_hours VALUES("148","2","2017-01-10","11:00:00","14:00:00","119","2017-01-11 00:00:00","180");
INSERT INTO tt_user_hours VALUES("147","2","2017-01-10","09:15:00","11:00:00","104","2017-01-11 10:09:26","105");
INSERT INTO tt_user_hours VALUES("146","2","2017-01-09","15:00:00","18:15:00","104","2017-01-11 10:08:53","195");
INSERT INTO tt_user_hours VALUES("145","2","2017-01-09","09:15:00","14:00:00","104","2017-01-11 10:08:02","285");
INSERT INTO tt_user_hours VALUES("143","3","2017-01-04","15:30:00","18:30:00","111","2017-01-05 09:25:32","180");
INSERT INTO tt_user_hours VALUES("142","3","2017-01-04","09:23:00","14:00:00","111","2017-01-05 09:23:43","277");
INSERT INTO tt_user_hours VALUES("141","3","2017-01-03","15:30:00","19:00:00","111","2017-01-05 00:00:00","210");
INSERT INTO tt_user_hours VALUES("140","3","2017-01-03","13:00:00","14:00:00","82","2017-01-05 09:18:44","60");
INSERT INTO tt_user_hours VALUES("139","3","2017-01-03","09:30:00","12:30:00","4","2017-01-05 09:17:11","180");
INSERT INTO tt_user_hours VALUES("138","3","2017-01-02","15:30:00","18:30:00","111","2017-01-05 09:15:57","180");
INSERT INTO tt_user_hours VALUES("137","3","2017-01-02","11:00:00","14:00:00","111","2017-01-05 09:13:04","180");
INSERT INTO tt_user_hours VALUES("136","3","2017-01-02","09:11:00","11:00:00","82","2017-01-05 09:12:17","109");
INSERT INTO tt_user_hours VALUES("134","2","2017-01-04","09:15:00","14:00:00","98","2017-01-04 17:08:38","285");
INSERT INTO tt_user_hours VALUES("135","2","2017-01-04","15:00:00","18:15:00","98","2017-01-04 19:09:22","195");
INSERT INTO tt_user_hours VALUES("124","6","2017-01-03","13:00:00","14:00:00","100","2017-01-03 00:00:00","60");
INSERT INTO tt_user_hours VALUES("125","6","2017-01-03","15:00:00","16:00:00","100","2017-01-03 16:52:49","60");
INSERT INTO tt_user_hours VALUES("122","6","2017-01-02","09:15:00","12:00:00","71","2017-01-03 16:48:34","165");
INSERT INTO tt_user_hours VALUES("121","11","2017-01-02","09:15:00","14:00:00","3","2017-01-03 16:44:35","285");
INSERT INTO tt_user_hours VALUES("120","6","2017-01-02","16:00:00","18:45:00","100","2017-01-03 16:41:51","165");
INSERT INTO tt_user_hours VALUES("111","2","2017-01-02","15:00:00","16:44:00","3","2017-01-02 16:44:36","104");
INSERT INTO tt_user_hours VALUES("110","2","2017-01-02","09:15:00","14:00:00","3","2017-01-02 16:43:59","285");
INSERT INTO tt_user_hours VALUES("109","4","2017-01-02","09:30:00","14:00:00","82","2017-01-02 16:36:37","270");
INSERT INTO tt_user_hours VALUES("119","2","2017-01-03","09:15:00","13:00:00","15","2017-01-03 13:11:15","225");
INSERT INTO tt_user_hours VALUES("198","6","2017-02-06","15:00:00","18:15:00","130","2017-02-06 19:14:40","195");
INSERT INTO tt_user_hours VALUES("197","6","2017-02-02","15:00:00","17:00:00","102","2017-02-06 17:30:46","120");
INSERT INTO tt_user_hours VALUES("196","6","2017-02-02","12:00:00","14:00:00","102","2017-02-06 17:29:29","120");
INSERT INTO tt_user_hours VALUES("199","6","2017-01-30","12:00:00","14:00:00","185","2017-02-06 19:19:23","120");
INSERT INTO tt_user_hours VALUES("206","7","2017-02-07","09:30:00","14:00:00","102","2017-02-07 18:26:06","270");
INSERT INTO tt_user_hours VALUES("204","6","2017-01-31","09:30:00","12:00:00","130","2017-02-07 00:00:00","150");
INSERT INTO tt_user_hours VALUES("205","7","2017-01-31","09:30:00","10:00:00","130","2017-02-07 18:25:28","30");
INSERT INTO tt_user_hours VALUES("195","6","2017-02-06","09:15:00","14:00:00","130","2017-02-06 00:00:00","285");
INSERT INTO tt_user_hours VALUES("177","7","2017-01-17","09:15:00","14:00:00","102","2017-01-24 12:29:46","285");
INSERT INTO tt_user_hours VALUES("178","7","2017-01-17","15:00:00","18:15:00","102","2017-01-24 12:30:50","195");
INSERT INTO tt_user_hours VALUES("180","7","2017-01-18","09:30:00","12:30:00","130","2017-01-24 12:45:30","180");
INSERT INTO tt_user_hours VALUES("181","7","2017-01-18","12:30:00","14:00:00","102","2017-01-24 12:47:13","90");
INSERT INTO tt_user_hours VALUES("182","7","2017-01-18","15:00:00","18:30:00","102","2017-01-24 12:48:06","210");
INSERT INTO tt_user_hours VALUES("183","7","2017-01-19","09:30:00","14:00:00","102","2017-01-24 12:57:22","270");
INSERT INTO tt_user_hours VALUES("184","7","2017-01-19","15:00:00","18:30:00","102","2017-01-24 12:57:46","210");
INSERT INTO tt_user_hours VALUES("185","7","2017-01-20","09:30:00","15:00:00","102","2017-01-24 12:58:37","330");
INSERT INTO tt_user_hours VALUES("186","8","2017-01-24","12:00:00","16:00:00","86","2017-01-24 15:53:26","240");
INSERT INTO tt_user_hours VALUES("187","8","2017-01-24","09:15:00","12:00:00","24","2017-01-24 15:54:16","165");
INSERT INTO tt_user_hours VALUES("188","2","2017-01-24","10:00:00","14:00:00","104","2017-01-24 00:00:00","240");
INSERT INTO tt_user_hours VALUES("189","2","2017-01-24","15:00:00","17:53:00","104","2017-01-24 17:53:23","173");
INSERT INTO tt_user_hours VALUES("191","2","2017-01-25","09:15:00","17:00:00","104","2017-01-26 00:00:00","465");
INSERT INTO tt_user_hours VALUES("192","2","2017-01-26","09:15:00","11:00:00","112","2017-01-26 18:54:35","105");
INSERT INTO tt_user_hours VALUES("193","2","2017-01-26","11:00:00","17:15:00","104","2017-01-26 00:00:00","375");
INSERT INTO tt_user_hours VALUES("207","7","2017-02-07","15:00:00","15:30:00","130","2017-02-07 18:26:36","30");
INSERT INTO tt_user_hours VALUES("208","7","2017-02-07","15:30:00","18:30:00","102","2017-02-07 18:26:57","180");
INSERT INTO tt_user_hours VALUES("209","7","2017-02-01","09:30:00","14:00:00","185","2017-02-07 18:28:42","270");
INSERT INTO tt_user_hours VALUES("210","6","2017-01-31","15:00:00","18:30:00","130","2017-02-07 18:28:53","210");
INSERT INTO tt_user_hours VALUES("211","7","2017-02-01","15:00:00","16:00:00","185","2017-02-07 18:29:18","60");
INSERT INTO tt_user_hours VALUES("212","7","2017-02-01","16:00:00","17:00:00","130","2017-02-07 18:29:45","60");
INSERT INTO tt_user_hours VALUES("213","7","2017-02-01","17:00:00","18:30:00","185","2017-02-07 18:30:05","90");
INSERT INTO tt_user_hours VALUES("214","7","2017-02-02","09:30:00","13:00:00","102","2017-02-07 18:31:28","210");
INSERT INTO tt_user_hours VALUES("215","7","2017-02-02","13:00:00","14:00:00","130","2017-02-07 18:31:45","60");
INSERT INTO tt_user_hours VALUES("216","6","2017-02-07","09:30:00","16:00:00","130","2017-02-07 18:31:56","390");
INSERT INTO tt_user_hours VALUES("217","7","2017-02-02","15:00:00","18:30:00","185","2017-02-07 18:32:01","210");
INSERT INTO tt_user_hours VALUES("220","7","2017-02-03","09:30:00","15:00:00","121","2017-02-07 18:33:55","330");
INSERT INTO tt_user_hours VALUES("219","6","2017-02-07","17:00:00","18:30:00","130","2017-02-07 18:33:41","90");
INSERT INTO tt_user_hours VALUES("221","8","2017-02-06","09:30:00","14:00:00","157","2017-02-07 18:50:12","270");
INSERT INTO tt_user_hours VALUES("222","8","2017-02-06","15:00:00","18:30:00","157","2017-02-07 18:51:04","210");
INSERT INTO tt_user_hours VALUES("223","8","2017-02-07","09:30:00","16:30:00","157","2017-02-07 18:51:33","420");
INSERT INTO tt_user_hours VALUES("224","8","2017-02-07","17:00:00","18:00:00","189","2017-02-07 18:52:10","60");
INSERT INTO tt_user_hours VALUES("225","4","2017-02-07","09:30:00","14:00:00","140","2017-02-07 18:53:23","270");
INSERT INTO tt_user_hours VALUES("229","6","2017-02-01","15:00:00","16:30:00","130","2017-02-07 18:58:56","90");
INSERT INTO tt_user_hours VALUES("228","6","2017-02-01","09:30:00","14:00:00","185","2017-02-07 18:56:49","270");
INSERT INTO tt_user_hours VALUES("232","6","2017-02-01","16:30:00","18:30:00","185","2017-02-07 19:00:26","120");
INSERT INTO tt_user_hours VALUES("231","4","2017-02-07","15:30:00","18:45:00","127","2017-02-07 18:58:56","195");
INSERT INTO tt_user_hours VALUES("233","2","2017-02-07","09:15:00","14:15:00","104","2017-02-08 11:23:33","300");
INSERT INTO tt_user_hours VALUES("234","2","2017-02-07","15:00:00","17:00:00","104","2017-02-08 11:24:04","120");
INSERT INTO tt_user_hours VALUES("235","2","2017-02-07","17:00:00","17:30:00","112","2017-02-08 11:24:41","30");
INSERT INTO tt_user_hours VALUES("236","2","2017-02-07","17:30:00","18:00:00","104","2017-02-08 00:00:00","30");
INSERT INTO tt_user_hours VALUES("237","2","2017-02-08","10:00:00","11:00:00","185","2017-02-08 11:26:05","60");
INSERT INTO tt_user_hours VALUES("238","2","2017-02-08","09:30:00","10:00:00","104","2017-02-08 11:26:22","30");
INSERT INTO tt_user_hours VALUES("239","2","2017-02-08","11:00:00","11:40:00","104","2017-02-08 11:39:43","40");
INSERT INTO tt_user_hours VALUES("240","2","2017-02-08","11:40:00","12:20:00","104","2017-02-08 12:20:40","40");
INSERT INTO tt_user_hours VALUES("241","4","2017-02-08","09:30:00","13:30:00","127","2017-02-08 15:30:55","240");
INSERT INTO tt_user_hours VALUES("242","8","2017-02-08","10:00:00","13:00:00","157","2017-02-08 18:48:19","180");
INSERT INTO tt_user_hours VALUES("243","4","2017-02-08","15:00:00","17:00:00","197","2017-02-09 09:35:23","120");
INSERT INTO tt_user_hours VALUES("266","2","2017-02-08","15:00:00","18:30:00","185","2017-02-09 00:00:00","210");
INSERT INTO tt_user_hours VALUES("245","4","2017-02-06","09:30:00","14:00:00","127","2017-02-09 11:05:26","270");
INSERT INTO tt_user_hours VALUES("246","3","2017-02-02","11:00:00","13:30:00","177","2017-02-09 11:05:52","150");
INSERT INTO tt_user_hours VALUES("247","4","2017-02-06","17:30:00","18:45:00","127","2017-02-09 11:06:02","75");
INSERT INTO tt_user_hours VALUES("248","4","2017-02-06","15:00:00","16:30:00","140","2017-02-09 11:06:27","90");
INSERT INTO tt_user_hours VALUES("249","3","2017-02-02","10:00:00","11:00:00","20","2017-02-09 11:07:52","60");
INSERT INTO tt_user_hours VALUES("253","3","2017-02-03","10:00:00","12:00:00","177","2017-02-09 11:14:15","120");
INSERT INTO tt_user_hours VALUES("252","3","2017-02-02","15:00:00","19:00:00","127","2017-02-09 11:13:42","240");
INSERT INTO tt_user_hours VALUES("254","3","2017-02-03","12:00:00","14:00:00","127","2017-02-09 11:14:38","120");
INSERT INTO tt_user_hours VALUES("255","3","2017-02-03","14:10:00","15:00:00","20","2017-02-09 11:15:34","50");
INSERT INTO tt_user_hours VALUES("256","3","2017-02-06","09:30:00","14:00:00","177","2017-02-09 11:16:27","270");
INSERT INTO tt_user_hours VALUES("257","3","2017-02-06","15:00:00","16:00:00","127","2017-02-09 11:17:10","60");
INSERT INTO tt_user_hours VALUES("258","3","2017-02-06","17:00:00","19:00:00","177","2017-02-09 11:17:33","120");
INSERT INTO tt_user_hours VALUES("259","3","2017-02-07","09:30:00","14:00:00","177","2017-02-09 11:18:04","270");
INSERT INTO tt_user_hours VALUES("260","3","2017-02-07","15:00:00","18:30:00","177","2017-02-09 11:18:46","210");
INSERT INTO tt_user_hours VALUES("261","3","2017-02-08","09:30:00","14:00:00","177","2017-02-09 11:19:26","270");
INSERT INTO tt_user_hours VALUES("262","3","2017-02-08","17:00:00","18:30:00","177","2017-02-09 11:19:45","90");
INSERT INTO tt_user_hours VALUES("263","3","2017-02-08","15:00:00","17:00:00","127","2017-02-09 11:20:05","120");
INSERT INTO tt_user_hours VALUES("264","3","2017-02-09","09:30:00","14:00:00","127","2017-02-09 11:20:39","270");
INSERT INTO tt_user_hours VALUES("265","2","2017-02-08","12:30:00","14:00:00","185","2017-02-09 16:11:12","90");
INSERT INTO tt_user_hours VALUES("267","4","2017-02-08","17:15:00","18:45:00","127","2017-02-09 16:12:03","90");
INSERT INTO tt_user_hours VALUES("268","2","2017-02-09","09:15:00","14:00:00","185","2017-02-09 16:13:20","285");
INSERT INTO tt_user_hours VALUES("269","4","2017-02-09","09:30:00","14:00:00","90","2017-02-09 16:23:27","270");
INSERT INTO tt_user_hours VALUES("270","7","2017-02-08","09:30:00","14:00:00","183","2017-02-10 09:48:57","270");
INSERT INTO tt_user_hours VALUES("271","7","2017-02-08","15:00:00","17:00:00","130","2017-02-10 09:49:13","120");
INSERT INTO tt_user_hours VALUES("272","7","2017-02-08","17:00:00","18:30:00","198","2017-02-10 09:52:48","90");
INSERT INTO tt_user_hours VALUES("273","7","2017-02-09","09:30:00","14:00:00","185","2017-02-10 09:53:24","270");
INSERT INTO tt_user_hours VALUES("274","7","2017-02-09","15:00:00","16:30:00","198","2017-02-10 09:53:41","90");
INSERT INTO tt_user_hours VALUES("275","7","2017-02-09","16:30:00","18:30:00","185","2017-02-10 09:54:01","120");
INSERT INTO tt_user_hours VALUES("276","4","2017-02-09","15:30:00","18:45:00","127","2017-02-10 14:37:24","195");
INSERT INTO tt_user_hours VALUES("277","4","2017-02-10","09:30:00","10:30:00","90","2017-02-10 14:37:56","60");
INSERT INTO tt_user_hours VALUES("278","4","2017-02-10","12:00:00","13:45:00","177","2017-02-10 14:42:06","105");
INSERT INTO tt_user_hours VALUES("279","4","2017-02-10","13:45:00","15:00:00","140","2017-02-10 15:09:18","75");
INSERT INTO tt_user_hours VALUES("280","8","2017-02-08","15:00:00","16:45:00","197","2017-02-10 15:34:06","105");
INSERT INTO tt_user_hours VALUES("281","8","2017-02-08","13:00:00","14:00:00","53","2017-02-10 00:00:00","60");
INSERT INTO tt_user_hours VALUES("282","8","2017-02-09","15:00:00","18:45:00","197","2017-02-10 15:35:19","225");
INSERT INTO tt_user_hours VALUES("283","8","2017-02-09","13:00:00","14:00:00","130","2017-02-10 15:36:23","60");
INSERT INTO tt_user_hours VALUES("284","8","2017-02-09","11:00:00","13:00:00","130","2017-02-10 15:37:33","120");
INSERT INTO tt_user_hours VALUES("285","8","2017-02-09","10:00:00","11:00:00","157","2017-02-10 15:38:27","60");
INSERT INTO tt_user_hours VALUES("286","8","2017-02-10","09:15:00","14:00:00","130","2017-02-10 15:39:13","285");
INSERT INTO tt_user_hours VALUES("287","6","2017-02-08","09:30:00","14:00:00","130","2017-02-10 15:43:07","270");
INSERT INTO tt_user_hours VALUES("288","6","2017-02-08","15:00:00","18:30:00","183","2017-02-10 15:43:54","210");
INSERT INTO tt_user_hours VALUES("289","20","2017-02-13","09:30:00","14:00:00","157","2017-02-13 18:12:42","270");
INSERT INTO tt_user_hours VALUES("290","20","2017-02-13","15:00:00","18:30:00","197","2017-02-13 18:15:42","210");
INSERT INTO tt_user_hours VALUES("291","3","2017-02-13","17:00:00","17:30:00","184","2017-02-14 10:37:27","30");
INSERT INTO tt_user_hours VALUES("292","3","2017-02-13","10:00:00","14:00:00","127","2017-02-14 10:42:06","240");
INSERT INTO tt_user_hours VALUES("293","3","2017-02-13","18:00:00","19:00:00","20","2017-02-14 10:42:57","60");
INSERT INTO tt_user_hours VALUES("294","3","2017-02-13","15:30:00","17:00:00","210","2017-02-14 10:43:58","90");
INSERT INTO tt_user_hours VALUES("295","8","2017-02-13","15:00:00","18:45:00","197","2017-02-14 11:42:58","225");
INSERT INTO tt_user_hours VALUES("296","8","2017-02-13","09:20:00","11:00:00","58","2017-02-14 00:00:00","100");
INSERT INTO tt_user_hours VALUES("297","8","2017-02-13","11:00:00","13:30:00","157","2017-02-14 11:44:32","150");
INSERT INTO tt_user_hours VALUES("298","8","2017-02-14","09:20:00","11:40:00","197","2017-02-14 11:44:58","140");
INSERT INTO tt_user_hours VALUES("299","20","2017-02-14","09:30:00","10:30:00","53","2017-02-14 11:50:37","60");
INSERT INTO tt_user_hours VALUES("300","20","2017-02-14","10:30:00","14:00:00","157","2017-02-14 13:14:16","210");
INSERT INTO tt_user_hours VALUES("301","20","2017-02-10","09:30:00","15:00:00","157","2017-02-14 13:15:12","330");
INSERT INTO tt_user_hours VALUES("302","20","2017-02-09","09:15:00","14:00:00","53","2017-02-14 16:02:01","285");
INSERT INTO tt_user_hours VALUES("303","20","2017-02-09","15:00:00","18:00:00","53","2017-02-14 16:02:38","180");
INSERT INTO tt_user_hours VALUES("304","4","2017-02-14","09:30:00","13:30:00","127","2017-02-14 16:50:35","240");
INSERT INTO tt_user_hours VALUES("305","4","2017-02-14","13:30:00","14:00:00","203","2017-02-14 16:52:52","30");
INSERT INTO tt_user_hours VALUES("306","4","2017-02-14","15:00:00","16:00:00","203","2017-02-14 16:53:05","60");
INSERT INTO tt_user_hours VALUES("307","20","2017-02-14","15:00:00","18:30:00","183","2017-02-14 16:58:38","210");
INSERT INTO tt_user_hours VALUES("308","4","2017-02-14","16:00:00","16:30:00","177","2017-02-14 17:06:28","30");
INSERT INTO tt_user_hours VALUES("309","4","2017-02-14","16:30:00","17:30:00","127","2017-02-14 18:19:50","60");
INSERT INTO tt_user_hours VALUES("310","4","2017-02-14","17:30:00","18:30:00","140","2017-02-14 18:20:21","60");
INSERT INTO tt_user_hours VALUES("311","2","2017-02-09","15:00:00","18:15:00","185","2017-02-15 10:38:58","195");
INSERT INTO tt_user_hours VALUES("312","2","2017-02-10","09:15:00","14:30:00","185","2017-02-15 10:39:59","315");
INSERT INTO tt_user_hours VALUES("313","2","2017-02-13","09:15:00","17:00:00","185","2017-02-15 00:00:00","465");
INSERT INTO tt_user_hours VALUES("314","2","2017-02-14","09:15:00","14:00:00","185","2017-02-15 00:00:00","285");
INSERT INTO tt_user_hours VALUES("315","8","2017-02-15","09:30:00","12:00:00","177","2017-02-15 18:09:33","150");
INSERT INTO tt_user_hours VALUES("316","8","2017-02-15","12:30:00","14:00:00","183","2017-02-15 18:10:12","90");
INSERT INTO tt_user_hours VALUES("317","8","2017-02-15","15:30:00","18:45:00","184","2017-02-15 18:10:36","195");
INSERT INTO tt_user_hours VALUES("318","4","2017-02-15","10:00:00","12:00:00","177","2017-02-15 19:02:09","120");
INSERT INTO tt_user_hours VALUES("319","4","2017-02-15","12:00:00","14:00:00","127","2017-02-15 19:02:21","120");
INSERT INTO tt_user_hours VALUES("320","4","2017-02-15","15:00:00","16:30:00","203","2017-02-15 19:02:45","90");
INSERT INTO tt_user_hours VALUES("322","4","2017-02-15","16:30:00","18:45:00","177","2017-02-15 19:04:05","135");
INSERT INTO tt_user_hours VALUES("323","3","2017-02-14","15:00:00","18:30:00","212","2017-02-16 13:11:57","210");
INSERT INTO tt_user_hours VALUES("324","3","2017-02-14","09:30:00","12:00:00","210","2017-02-16 13:12:21","150");
INSERT INTO tt_user_hours VALUES("325","3","2017-02-14","12:00:00","14:00:00","20","2017-02-16 13:13:02","120");
INSERT INTO tt_user_hours VALUES("326","3","2017-02-15","15:00:00","18:30:00","214","2017-02-16 13:13:45","210");
INSERT INTO tt_user_hours VALUES("327","3","2017-02-15","09:30:00","12:30:00","127","2017-02-16 13:14:06","180");
INSERT INTO tt_user_hours VALUES("328","3","2017-02-15","12:30:00","14:00:00","20","2017-02-16 13:14:28","90");
INSERT INTO tt_user_hours VALUES("329","6","2017-02-09","09:30:00","14:00:00","130","2017-02-16 18:12:30","270");
INSERT INTO tt_user_hours VALUES("330","6","2017-02-09","15:00:00","18:30:00","185","2017-02-16 00:00:00","210");
INSERT INTO tt_user_hours VALUES("331","6","2017-02-16","09:15:00","14:00:00","130","2017-02-16 00:00:00","285");
INSERT INTO tt_user_hours VALUES("332","6","2017-02-16","15:00:00","18:15:00","102","2017-02-16 18:21:21","195");
INSERT INTO tt_user_hours VALUES("333","6","2017-02-10","09:30:00","15:00:00","185","2017-02-16 00:00:00","330");
INSERT INTO tt_user_hours VALUES("334","4","2017-02-16","09:30:00","11:00:00","177","2017-02-17 12:52:25","90");
INSERT INTO tt_user_hours VALUES("335","4","2017-02-16","11:00:00","14:00:00","127","2017-02-17 12:52:41","180");
INSERT INTO tt_user_hours VALUES("336","4","2017-02-16","15:00:00","16:30:00","127","2017-02-17 12:53:17","90");
INSERT INTO tt_user_hours VALUES("338","4","2017-02-16","16:30:00","17:15:00","197","2017-02-17 12:55:00","45");
INSERT INTO tt_user_hours VALUES("339","4","2017-02-16","17:30:00","18:45:00","140","2017-02-17 00:00:00","75");
INSERT INTO tt_user_hours VALUES("340","4","2017-02-17","09:30:00","11:30:00","140","2017-02-17 12:56:42","120");
INSERT INTO tt_user_hours VALUES("341","4","2017-02-17","11:30:00","14:00:00","127","2017-02-17 14:08:40","150");
INSERT INTO tt_user_hours VALUES("344","6","2017-02-13","10:00:00","14:00:00","183","2017-02-17 15:38:26","240");
INSERT INTO tt_user_hours VALUES("345","6","2017-02-13","15:00:00","19:00:00","214","2017-02-17 15:41:22","240");
INSERT INTO tt_user_hours VALUES("346","3","2017-02-16","15:00:00","18:30:00","214","2017-02-20 15:33:21","210");
INSERT INTO tt_user_hours VALUES("347","3","2017-02-16","09:30:00","14:00:00","210","2017-02-20 15:34:58","270");
INSERT INTO tt_user_hours VALUES("348","3","2017-02-17","09:30:00","15:00:00","214","2017-02-20 15:35:41","330");
INSERT INTO tt_user_hours VALUES("350","3","2017-02-20","09:30:00","14:00:00","214","2017-02-23 09:37:15","270");
INSERT INTO tt_user_hours VALUES("351","3","2017-02-20","15:30:00","16:30:00","127","2017-02-23 09:38:02","60");
INSERT INTO tt_user_hours VALUES("352","3","2017-02-20","16:30:00","17:30:00","183","2017-02-23 09:38:23","60");
INSERT INTO tt_user_hours VALUES("353","4","2017-02-20","09:30:00","10:30:00","197","2017-02-23 09:53:48","60");
INSERT INTO tt_user_hours VALUES("354","4","2017-02-20","12:30:00","14:00:00","127","2017-02-23 09:56:52","90");
INSERT INTO tt_user_hours VALUES("355","4","2017-02-20","16:00:00","17:30:00","183","2017-02-23 09:57:32","90");
INSERT INTO tt_user_hours VALUES("357","4","2017-02-21","09:30:00","10:30:00","127","2017-02-23 10:07:45","60");
INSERT INTO tt_user_hours VALUES("358","4","2017-02-21","15:00:00","17:30:00","183","2017-02-23 10:10:25","150");
INSERT INTO tt_user_hours VALUES("360","15","2017-02-13","10:00:00","17:00:00","227","2017-02-23 00:00:00","420");
INSERT INTO tt_user_hours VALUES("361","15","2017-02-14","10:00:00","13:00:00","227","2017-02-23 12:09:29","180");
INSERT INTO tt_user_hours VALUES("363","15","2017-02-01","10:00:00","18:00:00","227","2017-02-23 19:22:21","480");
INSERT INTO tt_user_hours VALUES("364","15","2017-02-02","10:00:00","12:00:00","227","2017-02-23 19:22:42","120");
INSERT INTO tt_user_hours VALUES("481","5","2017-03-07","09:30:00","14:00:00","187","2017-03-10 15:15:22","270");
INSERT INTO tt_user_hours VALUES("480","5","2017-03-06","15:00:00","18:30:00","187","2017-03-10 15:15:05","210");
INSERT INTO tt_user_hours VALUES("478","11","2017-03-10","14:30:00","15:00:00","104","2017-03-10 14:55:13","30");
INSERT INTO tt_user_hours VALUES("479","5","2017-03-06","09:30:00","14:00:00","187","2017-03-10 15:14:37","270");
INSERT INTO tt_user_hours VALUES("477","11","2017-03-10","09:30:00","14:30:00","187","2017-03-10 14:54:32","300");
INSERT INTO tt_user_hours VALUES("475","11","2017-03-09","09:30:00","14:00:00","187","2017-03-10 14:53:14","270");
INSERT INTO tt_user_hours VALUES("476","11","2017-03-09","15:00:00","18:30:00","187","2017-03-10 14:53:27","210");
INSERT INTO tt_user_hours VALUES("474","11","2017-03-08","15:00:00","18:30:00","187","2017-03-10 14:52:40","210");
INSERT INTO tt_user_hours VALUES("473","11","2017-03-08","09:30:00","14:00:00","187","2017-03-10 14:52:22","270");
INSERT INTO tt_user_hours VALUES("482","5","2017-03-07","15:00:00","18:30:00","187","2017-03-10 15:15:41","210");
INSERT INTO tt_user_hours VALUES("471","11","2017-03-07","09:30:00","14:00:00","187","2017-03-10 14:51:27","270");
INSERT INTO tt_user_hours VALUES("470","11","2017-03-06","15:00:00","18:30:00","187","2017-03-10 14:50:56","210");
INSERT INTO tt_user_hours VALUES("472","11","2017-03-07","15:00:00","18:30:00","187","2017-03-10 14:51:58","210");
INSERT INTO tt_user_hours VALUES("468","11","2017-03-06","09:30:00","14:00:00","187","2017-03-10 14:49:50","270");
INSERT INTO tt_user_hours VALUES("379","15","2017-02-21","10:00:00","11:00:00","227","2017-02-23 19:41:32","60");
INSERT INTO tt_user_hours VALUES("380","15","2017-02-21","11:00:00","12:00:00","227","2017-02-23 19:41:40","60");
INSERT INTO tt_user_hours VALUES("381","15","2017-02-21","12:00:00","13:00:00","227","2017-02-23 19:41:49","60");
INSERT INTO tt_user_hours VALUES("382","15","2017-02-21","13:00:00","14:00:00","227","2017-02-23 19:41:58","60");
INSERT INTO tt_user_hours VALUES("383","15","2017-02-21","14:00:00","15:00:00","227","2017-02-23 19:42:06","60");
INSERT INTO tt_user_hours VALUES("385","4","2017-02-22","09:30:00","12:30:00","127","2017-02-24 10:41:25","180");
INSERT INTO tt_user_hours VALUES("386","4","2017-02-22","15:00:00","16:30:00","183","2017-02-24 10:49:00","90");
INSERT INTO tt_user_hours VALUES("387","4","2017-02-22","16:30:00","17:30:00","127","2017-02-24 10:50:36","60");
INSERT INTO tt_user_hours VALUES("388","4","2017-02-23","09:30:00","13:00:00","127","2017-02-24 10:51:53","210");
INSERT INTO tt_user_hours VALUES("389","4","2017-02-23","13:00:00","14:00:00","183","2017-02-24 00:00:00","60");
INSERT INTO tt_user_hours VALUES("390","4","2017-02-23","16:00:00","18:00:00","127","2017-02-24 10:52:41","120");
INSERT INTO tt_user_hours VALUES("391","4","2017-02-23","18:00:00","18:45:00","187","2017-02-24 10:53:24","45");
INSERT INTO tt_user_hours VALUES("392","4","2017-02-22","12:30:00","14:00:00","187","2017-02-24 10:56:03","90");
INSERT INTO tt_user_hours VALUES("393","3","2017-02-21","09:30:00","09:40:00","184","2017-02-24 11:23:29","10");
INSERT INTO tt_user_hours VALUES("394","3","2017-02-21","09:45:00","13:30:00","210","2017-02-24 11:24:43","225");
INSERT INTO tt_user_hours VALUES("395","3","2017-02-21","15:00:00","16:30:00","127","2017-02-24 11:25:23","90");
INSERT INTO tt_user_hours VALUES("396","3","2017-02-21","13:30:00","14:00:00","104","2017-02-24 11:26:53","30");
INSERT INTO tt_user_hours VALUES("397","3","2017-02-21","16:30:00","18:30:00","183","2017-02-24 11:28:13","120");
INSERT INTO tt_user_hours VALUES("398","3","2017-02-22","09:30:00","10:00:00","184","2017-02-24 11:28:48","30");
INSERT INTO tt_user_hours VALUES("399","3","2017-02-22","10:00:00","10:30:00","53","2017-02-24 11:29:09","30");
INSERT INTO tt_user_hours VALUES("400","3","2017-02-22","10:30:00","14:00:00","210","2017-02-24 11:29:37","210");
INSERT INTO tt_user_hours VALUES("401","3","2017-02-22","15:00:00","16:00:00","183","2017-02-24 11:30:04","60");
INSERT INTO tt_user_hours VALUES("402","3","2017-02-23","09:30:00","11:00:00","183","2017-02-24 11:31:30","90");
INSERT INTO tt_user_hours VALUES("403","3","2017-02-23","11:00:00","14:00:00","210","2017-02-24 11:31:54","180");
INSERT INTO tt_user_hours VALUES("404","3","2017-02-23","16:00:00","19:00:00","127","2017-02-24 11:32:27","180");
INSERT INTO tt_user_hours VALUES("405","9","2017-02-22","09:15:00","14:00:00","185","2017-03-01 10:54:05","285");
INSERT INTO tt_user_hours VALUES("406","9","2017-02-23","15:00:00","18:45:00","241","2017-03-01 00:00:00","225");
INSERT INTO tt_user_hours VALUES("407","9","2017-03-23","09:15:00","14:00:00","185","2017-03-01 10:55:47","285");
INSERT INTO tt_user_hours VALUES("408","9","2017-02-24","09:15:00","14:00:00","241","2017-03-01 10:57:36","285");
INSERT INTO tt_user_hours VALUES("409","9","2017-03-24","09:15:00","14:00:00","241","2017-03-01 10:58:42","285");
INSERT INTO tt_user_hours VALUES("410","9","2017-03-23","15:30:00","18:45:00","241","2017-03-01 10:59:11","195");
INSERT INTO tt_user_hours VALUES("411","4","2017-02-27","09:30:00","14:00:00","127","2017-03-02 00:00:00","270");
INSERT INTO tt_user_hours VALUES("412","4","2017-02-27","15:00:00","18:30:00","127","2017-03-02 20:00:58","210");
INSERT INTO tt_user_hours VALUES("413","4","2017-02-28","09:30:00","14:00:00","127","2017-03-02 20:01:44","270");
INSERT INTO tt_user_hours VALUES("414","4","2017-02-28","15:00:00","16:30:00","183","2017-03-03 00:00:00","90");
INSERT INTO tt_user_hours VALUES("415","4","2017-02-28","16:30:00","17:00:00","127","2017-03-02 20:03:23","30");
INSERT INTO tt_user_hours VALUES("416","4","2017-02-28","17:00:00","18:30:00","183","2017-03-02 20:03:44","90");
INSERT INTO tt_user_hours VALUES("417","4","2017-03-01","09:30:00","13:30:00","183","2017-03-02 20:04:17","240");
INSERT INTO tt_user_hours VALUES("418","4","2017-03-01","15:30:00","18:30:00","127","2017-03-02 20:06:58","180");
INSERT INTO tt_user_hours VALUES("419","4","2017-03-02","09:30:00","14:00:00","127","2017-03-02 20:07:25","270");
INSERT INTO tt_user_hours VALUES("420","4","2017-03-02","15:00:00","16:00:00","183","2017-03-02 20:10:16","60");
INSERT INTO tt_user_hours VALUES("421","2","2017-02-27","09:30:00","14:00:00","112","2017-03-03 00:00:00","270");
INSERT INTO tt_user_hours VALUES("422","2","2017-02-27","15:00:00","16:00:00","120","2017-03-03 13:24:54","60");
INSERT INTO tt_user_hours VALUES("423","2","2017-02-27","16:00:00","18:00:00","112","2017-03-03 00:00:00","120");
INSERT INTO tt_user_hours VALUES("424","2","2017-02-28","09:00:00","09:30:00","104","2017-03-03 13:27:45","30");
INSERT INTO tt_user_hours VALUES("425","2","2017-02-28","09:30:00","14:00:00","185","2017-03-03 13:28:32","270");
INSERT INTO tt_user_hours VALUES("426","2","2017-02-28","15:00:00","15:30:00","233","2017-03-03 00:00:00","30");
INSERT INTO tt_user_hours VALUES("427","2","2017-02-28","15:30:00","18:00:00","112","2017-03-03 13:30:34","150");
INSERT INTO tt_user_hours VALUES("428","2","2017-03-01","09:15:00","12:00:00","112","2017-03-03 13:31:42","165");
INSERT INTO tt_user_hours VALUES("429","2","2017-03-02","09:15:00","17:00:00","112","2017-03-03 00:00:00","465");
INSERT INTO tt_user_hours VALUES("430","2","2017-03-03","09:15:00","10:15:00","117","2017-03-03 00:00:00","60");
INSERT INTO tt_user_hours VALUES("431","4","2017-03-03","09:30:00","11:30:00","197","2017-03-03 15:08:12","120");
INSERT INTO tt_user_hours VALUES("432","4","2017-03-03","11:30:00","12:30:00","183","2017-03-03 15:08:32","60");
INSERT INTO tt_user_hours VALUES("433","4","2017-03-03","12:30:00","15:00:00","127","2017-03-03 15:08:51","150");
INSERT INTO tt_user_hours VALUES("447","3","2017-03-02","09:30:00","14:00:00","127","2017-03-03 15:19:17","270");
INSERT INTO tt_user_hours VALUES("435","3","2017-02-28","09:30:00","11:30:00","183","2017-03-03 00:00:00","120");
INSERT INTO tt_user_hours VALUES("436","3","2017-02-28","11:30:00","14:00:00","127","2017-03-03 15:12:35","150");
INSERT INTO tt_user_hours VALUES("439","3","2017-02-28","15:30:00","18:30:00","127","2017-03-03 15:15:16","180");
INSERT INTO tt_user_hours VALUES("450","11","2017-02-27","09:30:00","14:00:00","187","2017-03-03 15:20:08","270");
INSERT INTO tt_user_hours VALUES("442","3","2017-02-27","09:30:00","11:00:00","183","2017-03-03 15:15:45","90");
INSERT INTO tt_user_hours VALUES("443","3","2017-03-08","09:30:00","14:00:00","127","2017-03-10 00:00:00","270");
INSERT INTO tt_user_hours VALUES("444","3","2017-03-01","11:30:00","14:00:00","183","2017-03-03 15:17:09","150");
INSERT INTO tt_user_hours VALUES("445","3","2017-03-01","17:00:00","18:30:00","183","2017-03-03 15:17:40","90");
INSERT INTO tt_user_hours VALUES("446","3","2017-03-01","15:00:00","17:00:00","197","2017-03-03 15:18:38","120");
INSERT INTO tt_user_hours VALUES("449","3","2017-03-03","10:00:00","15:00:00","183","2017-03-03 15:19:37","300");
INSERT INTO tt_user_hours VALUES("451","5","2017-03-03","09:30:00","15:00:00","187","2017-03-03 15:20:23","330");
INSERT INTO tt_user_hours VALUES("452","11","2017-02-27","15:00:00","18:30:00","187","2017-03-03 15:20:34","210");
INSERT INTO tt_user_hours VALUES("453","11","2017-02-28","09:30:00","14:00:00","187","2017-03-03 15:20:54","270");
INSERT INTO tt_user_hours VALUES("454","5","2017-02-27","09:30:00","14:00:00","187","2017-03-03 00:00:00","270");
INSERT INTO tt_user_hours VALUES("455","11","2017-02-28","15:00:00","18:30:00","187","2017-03-03 15:21:15","210");
INSERT INTO tt_user_hours VALUES("456","11","2017-03-01","09:30:00","15:00:00","187","2017-03-03 15:21:49","330");
INSERT INTO tt_user_hours VALUES("457","11","2017-03-01","16:00:00","18:30:00","187","2017-03-03 15:22:25","150");
INSERT INTO tt_user_hours VALUES("458","11","2017-03-02","09:00:00","14:00:00","187","2017-03-03 15:22:55","300");
INSERT INTO tt_user_hours VALUES("459","5","2017-02-27","15:00:00","18:30:00","187","2017-03-03 15:23:00","210");
INSERT INTO tt_user_hours VALUES("460","5","2017-02-28","09:30:00","14:00:00","187","2017-03-03 00:00:00","270");
INSERT INTO tt_user_hours VALUES("461","11","2017-03-02","15:00:00","18:00:00","187","2017-03-03 15:23:25","180");
INSERT INTO tt_user_hours VALUES("462","11","2017-03-03","09:30:00","15:00:00","187","2017-03-03 15:24:03","330");
INSERT INTO tt_user_hours VALUES("463","5","2017-02-28","15:00:00","18:30:00","187","2017-03-03 00:00:00","210");
INSERT INTO tt_user_hours VALUES("464","5","2017-03-01","09:30:00","14:00:00","187","2017-03-03 15:25:51","270");
INSERT INTO tt_user_hours VALUES("465","5","2017-03-01","15:00:00","18:30:00","187","2017-03-03 15:26:06","210");
INSERT INTO tt_user_hours VALUES("466","5","2017-03-02","09:30:00","14:00:00","187","2017-03-03 15:26:31","270");
INSERT INTO tt_user_hours VALUES("467","5","2017-03-02","15:00:00","18:30:00","187","2017-03-03 15:26:53","210");
INSERT INTO tt_user_hours VALUES("483","5","2017-03-08","09:30:00","14:00:00","187","2017-03-10 15:15:59","270");
INSERT INTO tt_user_hours VALUES("484","5","2017-03-08","15:00:00","18:30:00","187","2017-03-10 15:16:20","210");
INSERT INTO tt_user_hours VALUES("485","5","2017-03-09","09:30:00","14:00:00","187","2017-03-10 15:16:50","270");
INSERT INTO tt_user_hours VALUES("486","5","2017-03-09","15:00:00","18:30:00","187","2017-03-10 15:17:19","210");
INSERT INTO tt_user_hours VALUES("487","5","2017-03-10","09:30:00","15:00:00","187","2017-03-10 15:17:57","330");
INSERT INTO tt_user_hours VALUES("488","4","2017-03-06","09:30:00","14:00:00","183","2017-03-10 15:44:36","270");
INSERT INTO tt_user_hours VALUES("489","4","2017-03-06","15:00:00","18:30:00","127","2017-03-10 00:00:00","210");
INSERT INTO tt_user_hours VALUES("490","4","2017-03-07","09:30:00","14:00:00","127","2017-03-10 15:47:08","270");
INSERT INTO tt_user_hours VALUES("491","4","2017-03-07","15:00:00","17:00:00","127","2017-03-10 15:47:54","120");
INSERT INTO tt_user_hours VALUES("492","4","2017-03-07","17:00:00","18:30:00","177","2017-03-10 15:48:16","90");
INSERT INTO tt_user_hours VALUES("493","4","2017-03-08","09:30:00","14:00:00","127","2017-03-10 15:48:44","270");
INSERT INTO tt_user_hours VALUES("494","4","2017-03-08","15:00:00","16:30:00","264","2017-03-10 15:49:21","90");
INSERT INTO tt_user_hours VALUES("495","4","2017-03-08","16:30:00","18:30:00","127","2017-03-10 00:00:00","120");
INSERT INTO tt_user_hours VALUES("496","4","2017-03-09","09:30:00","14:00:00","127","2017-03-10 15:50:17","270");
INSERT INTO tt_user_hours VALUES("497","4","2017-03-09","15:00:00","15:30:00","197","2017-03-10 15:50:36","30");
INSERT INTO tt_user_hours VALUES("498","4","2017-03-09","15:30:00","18:30:00","127","2017-03-10 15:51:05","180");
INSERT INTO tt_user_hours VALUES("499","4","2017-03-10","09:30:00","15:00:00","127","2017-03-10 15:51:26","330");
INSERT INTO tt_user_hours VALUES("500","3","2017-03-06","09:30:00","14:00:00","183","2017-03-10 00:00:00","270");
INSERT INTO tt_user_hours VALUES("501","3","2017-03-06","15:00:00","18:30:00","127","2017-03-10 16:15:13","210");
INSERT INTO tt_user_hours VALUES("502","3","2017-03-07","09:30:00","14:00:00","127","2017-03-10 16:15:55","270");
INSERT INTO tt_user_hours VALUES("503","3","2017-03-07","15:00:00","18:30:00","127","2017-03-10 16:16:16","210");
INSERT INTO tt_user_hours VALUES("504","3","2017-03-08","15:00:00","18:30:00","127","2017-03-10 16:16:56","210");
INSERT INTO tt_user_hours VALUES("505","3","2017-03-09","09:30:00","11:30:00","197","2017-03-10 16:17:27","120");
INSERT INTO tt_user_hours VALUES("506","3","2017-03-09","11:30:00","14:00:00","127","2017-03-10 16:17:39","150");
INSERT INTO tt_user_hours VALUES("507","3","2017-03-09","15:00:00","18:30:00","127","2017-03-10 16:17:53","210");
INSERT INTO tt_user_hours VALUES("508","3","2017-03-10","09:30:00","15:00:00","127","2017-03-10 16:18:30","330");
INSERT INTO tt_user_hours VALUES("509","2","2017-03-07","10:00:00","11:00:00","112","2017-03-14 15:46:18","60");
INSERT INTO tt_user_hours VALUES("510","3","2017-03-13","09:30:00","14:00:00","127","2017-03-17 12:08:09","270");
INSERT INTO tt_user_hours VALUES("511","3","2017-03-13","15:00:00","18:30:00","127","2017-03-17 12:08:32","210");
INSERT INTO tt_user_hours VALUES("512","3","2017-03-14","09:30:00","14:00:00","127","2017-03-17 12:08:49","270");
INSERT INTO tt_user_hours VALUES("513","3","2017-03-14","15:00:00","18:30:00","127","2017-03-17 12:09:11","210");
INSERT INTO tt_user_hours VALUES("514","3","2017-03-15","09:30:00","14:00:00","127","2017-03-17 12:09:24","270");
INSERT INTO tt_user_hours VALUES("515","3","2017-03-15","15:00:00","18:30:00","127","2017-03-17 12:09:39","210");
INSERT INTO tt_user_hours VALUES("516","3","2017-03-16","09:30:00","14:00:00","127","2017-03-17 12:09:55","270");
INSERT INTO tt_user_hours VALUES("517","3","2017-03-16","15:00:00","16:00:00","127","2017-03-17 12:10:15","60");
INSERT INTO tt_user_hours VALUES("518","3","2017-03-16","16:00:00","18:30:00","235","2017-03-17 00:00:00","150");
INSERT INTO tt_user_hours VALUES("519","3","2017-03-17","09:30:00","15:00:00","127","2017-03-17 12:11:48","330");
INSERT INTO tt_user_hours VALUES("520","4","2017-03-13","09:30:00","14:00:00","127","2017-03-17 00:00:00","270");
INSERT INTO tt_user_hours VALUES("521","4","2017-03-13","15:00:00","18:30:00","127","2017-03-17 00:00:00","210");
INSERT INTO tt_user_hours VALUES("522","4","2017-03-14","09:30:00","14:00:00","127","2017-03-17 00:00:00","270");
INSERT INTO tt_user_hours VALUES("523","4","2017-03-14","15:00:00","18:30:00","127","2017-03-17 00:00:00","210");
INSERT INTO tt_user_hours VALUES("524","4","2017-03-15","09:30:00","14:00:00","127","2017-03-17 00:00:00","270");
INSERT INTO tt_user_hours VALUES("525","4","2017-03-15","15:00:00","18:30:00","127","2017-03-17 12:29:29","210");
INSERT INTO tt_user_hours VALUES("526","4","2017-03-16","09:30:00","14:00:00","127","2017-03-17 12:29:49","270");
INSERT INTO tt_user_hours VALUES("527","4","2017-03-16","15:00:00","18:30:00","235","2017-03-17 12:31:13","210");
INSERT INTO tt_user_hours VALUES("528","4","2017-03-17","09:30:00","15:00:00","127","2017-03-17 12:31:25","330");
INSERT INTO tt_user_hours VALUES("529","11","2017-03-13","09:30:00","14:00:00","187","2017-03-17 14:15:19","270");
INSERT INTO tt_user_hours VALUES("530","11","2017-03-13","15:00:00","18:30:00","187","2017-03-17 14:16:09","210");
INSERT INTO tt_user_hours VALUES("531","11","2017-03-14","09:30:00","14:00:00","187","2017-03-17 14:17:18","270");
INSERT INTO tt_user_hours VALUES("532","11","2017-03-14","15:00:00","18:30:00","187","2017-03-17 14:17:37","210");
INSERT INTO tt_user_hours VALUES("533","11","2017-03-15","09:30:00","14:00:00","187","2017-03-17 14:18:04","270");
INSERT INTO tt_user_hours VALUES("534","11","2017-03-15","15:00:00","18:30:00","187","2017-03-17 14:18:36","210");
INSERT INTO tt_user_hours VALUES("535","11","2017-03-16","09:30:00","14:00:00","187","2017-03-17 14:18:58","270");
INSERT INTO tt_user_hours VALUES("536","11","2017-03-16","15:00:00","18:30:00","187","2017-03-17 14:19:23","210");
INSERT INTO tt_user_hours VALUES("537","11","2017-03-17","09:30:00","14:00:00","187","2017-03-17 14:22:02","270");
INSERT INTO tt_user_hours VALUES("538","11","2017-03-17","14:00:00","15:00:00","104","2017-03-17 14:32:57","60");
INSERT INTO tt_user_hours VALUES("539","5","2017-03-13","09:30:00","14:00:00","187","2017-03-17 14:34:58","270");
INSERT INTO tt_user_hours VALUES("540","5","2017-03-13","15:00:00","18:30:00","187","2017-03-17 14:35:59","210");
INSERT INTO tt_user_hours VALUES("541","5","2017-03-14","09:30:00","14:00:00","187","2017-03-17 14:36:41","270");
INSERT INTO tt_user_hours VALUES("542","5","2017-03-14","15:00:00","18:30:00","187","2017-03-17 14:37:27","210");
INSERT INTO tt_user_hours VALUES("543","5","2017-03-15","09:30:00","14:00:00","187","2017-03-17 14:38:01","270");
INSERT INTO tt_user_hours VALUES("544","5","2017-03-15","15:00:00","18:30:00","187","2017-03-17 14:38:34","210");
INSERT INTO tt_user_hours VALUES("545","5","2017-03-16","09:30:00","14:00:00","187","2017-03-17 14:39:04","270");
INSERT INTO tt_user_hours VALUES("546","5","2017-03-16","15:00:00","18:30:00","187","2017-03-17 14:39:28","210");
INSERT INTO tt_user_hours VALUES("547","5","2017-03-17","09:30:00","15:00:00","187","2017-03-17 14:39:55","330");
INSERT INTO tt_user_hours VALUES("548","2","2017-03-14","09:15:00","17:00:00","112","2017-03-21 11:14:41","465");
INSERT INTO tt_user_hours VALUES("549","2","2017-03-15","09:15:00","17:00:00","112","2017-03-21 11:15:12","465");
INSERT INTO tt_user_hours VALUES("550","2","2017-03-16","09:15:00","17:15:00","112","2017-03-21 11:15:42","480");
INSERT INTO tt_user_hours VALUES("551","2","2017-03-17","09:15:00","14:30:00","112","2017-03-21 11:16:59","315");
INSERT INTO tt_user_hours VALUES("552","5","2017-03-20","09:30:00","14:00:00","187","2017-03-24 10:30:38","270");
INSERT INTO tt_user_hours VALUES("553","5","2017-03-20","15:00:00","18:30:00","187","2017-03-24 10:30:58","210");
INSERT INTO tt_user_hours VALUES("554","5","2017-03-21","09:30:00","14:00:00","187","2017-03-24 10:31:34","270");
INSERT INTO tt_user_hours VALUES("555","5","2017-03-21","15:00:00","18:30:00","187","2017-03-24 10:32:02","210");
INSERT INTO tt_user_hours VALUES("556","5","2017-03-22","09:30:00","14:00:00","187","2017-03-24 00:00:00","270");
INSERT INTO tt_user_hours VALUES("557","5","2017-03-22","15:00:00","18:30:00","187","2017-03-24 10:33:23","210");
INSERT INTO tt_user_hours VALUES("558","5","2017-03-23","09:30:00","14:00:00","187","2017-03-24 10:33:50","270");
INSERT INTO tt_user_hours VALUES("559","5","2017-03-23","15:00:00","18:30:00","187","2017-03-24 10:34:10","210");
INSERT INTO tt_user_hours VALUES("560","5","2017-03-24","09:30:00","15:00:00","187","2017-03-24 10:34:28","330");
INSERT INTO tt_user_hours VALUES("561","11","2017-03-20","09:30:00","14:00:00","187","2017-03-24 14:41:29","270");
INSERT INTO tt_user_hours VALUES("562","11","2017-03-20","15:00:00","18:30:00","187","2017-03-24 14:41:43","210");
INSERT INTO tt_user_hours VALUES("563","11","2017-03-21","09:30:00","14:00:00","187","2017-03-24 14:41:59","270");
INSERT INTO tt_user_hours VALUES("564","11","2017-03-21","15:00:00","18:30:00","187","2017-03-24 14:42:17","210");
INSERT INTO tt_user_hours VALUES("565","11","2017-03-22","09:30:00","14:00:00","187","2017-03-24 14:42:55","270");
INSERT INTO tt_user_hours VALUES("566","11","2017-03-22","15:00:00","18:30:00","187","2017-03-24 14:44:33","210");
INSERT INTO tt_user_hours VALUES("567","11","2017-03-23","09:30:00","14:00:00","187","2017-03-24 14:45:47","270");
INSERT INTO tt_user_hours VALUES("568","11","2017-03-23","15:00:00","18:30:00","187","2017-03-24 14:46:03","210");
INSERT INTO tt_user_hours VALUES("569","11","2017-03-24","09:30:00","13:00:00","187","2017-03-24 14:46:41","210");
INSERT INTO tt_user_hours VALUES("570","11","2017-03-24","13:00:00","15:00:00","104","2017-03-24 14:47:08","120");
INSERT INTO tt_user_hours VALUES("571","23","2017-03-22","09:30:00","14:00:00","279","2017-03-24 15:01:11","270");
INSERT INTO tt_user_hours VALUES("572","23","2017-03-22","15:00:00","18:30:00","279","2017-03-24 00:00:00","210");
INSERT INTO tt_user_hours VALUES("573","23","2017-03-17","09:30:00","15:00:00","279","2017-03-24 15:02:59","330");
INSERT INTO tt_user_hours VALUES("574","23","2017-03-21","09:30:00","14:00:00","104","2017-03-24 15:10:52","270");
INSERT INTO tt_user_hours VALUES("576","23","2017-03-21","15:00:00","18:30:00","104","2017-03-24 15:11:18","210");
INSERT INTO tt_user_hours VALUES("577","4","2017-03-21","09:30:00","14:00:00","127","2017-03-24 15:11:58","270");
INSERT INTO tt_user_hours VALUES("578","4","2017-03-21","15:00:00","18:30:00","127","2017-03-24 15:12:26","210");
INSERT INTO tt_user_hours VALUES("579","4","2017-03-22","09:30:00","14:00:00","127","2017-03-24 15:12:55","270");
INSERT INTO tt_user_hours VALUES("580","4","2017-03-22","15:00:00","18:30:00","127","2017-03-24 15:13:14","210");
INSERT INTO tt_user_hours VALUES("581","4","2017-03-23","09:30:00","14:00:00","127","2017-03-24 15:13:53","270");
INSERT INTO tt_user_hours VALUES("582","23","2017-03-23","09:30:00","14:00:00","104","2017-03-24 15:14:15","270");
INSERT INTO tt_user_hours VALUES("583","4","2017-03-23","15:00:00","18:30:00","127","2017-03-24 15:14:21","210");
INSERT INTO tt_user_hours VALUES("584","23","2017-03-23","15:00:00","18:30:00","104","2017-03-24 15:14:33","210");
INSERT INTO tt_user_hours VALUES("585","4","2017-03-24","09:30:00","15:00:00","127","2017-03-24 15:14:44","330");
INSERT INTO tt_user_hours VALUES("586","23","2017-03-24","09:30:00","12:00:00","104","2017-03-24 15:15:17","150");
INSERT INTO tt_user_hours VALUES("587","23","2017-03-24","12:00:00","15:00:00","279","2017-03-24 15:15:43","180");
INSERT INTO tt_user_hours VALUES("588","24","2017-03-21","09:30:00","14:00:00","104","2017-03-24 15:19:04","270");
INSERT INTO tt_user_hours VALUES("589","24","2017-03-21","15:00:00","18:30:00","104","2017-03-24 15:20:00","210");
INSERT INTO tt_user_hours VALUES("590","24","2017-03-22","09:30:00","14:00:00","104","2017-03-24 15:21:06","270");
INSERT INTO tt_user_hours VALUES("591","24","2017-03-23","09:30:00","14:00:00","104","2017-03-24 15:21:50","270");
INSERT INTO tt_user_hours VALUES("592","24","2017-03-23","15:00:00","18:30:00","104","2017-03-24 15:22:14","210");
INSERT INTO tt_user_hours VALUES("593","24","2017-03-22","15:00:00","18:30:00","104","2017-03-24 15:22:41","210");
INSERT INTO tt_user_hours VALUES("594","24","2017-03-24","09:30:00","15:00:00","104","2017-03-24 15:23:19","330");
INSERT INTO tt_user_hours VALUES("596","24","2017-03-17","09:30:00","15:00:00","104","2017-03-24 15:24:23","330");
INSERT INTO tt_user_hours VALUES("597","3","2017-03-27","09:30:00","14:00:00","127","2017-03-29 16:00:32","270");
INSERT INTO tt_user_hours VALUES("598","3","2017-03-22","11:00:00","14:00:00","279","2017-03-29 16:21:14","180");
INSERT INTO tt_user_hours VALUES("599","3","2017-03-22","15:30:00","18:30:00","279","2017-03-29 16:21:37","180");
INSERT INTO tt_user_hours VALUES("600","3","2017-03-23","09:30:00","14:00:00","127","2017-03-29 16:21:56","270");
INSERT INTO tt_user_hours VALUES("601","3","2017-03-23","15:30:00","18:30:00","127","2017-03-29 16:22:58","180");
INSERT INTO tt_user_hours VALUES("602","3","2017-03-24","09:30:00","13:00:00","127","2017-03-29 16:23:13","210");
INSERT INTO tt_user_hours VALUES("603","3","2017-03-24","13:00:00","15:00:00","279","2017-03-29 16:23:30","120");
INSERT INTO tt_user_hours VALUES("604","3","2017-03-27","15:30:00","18:30:00","279","2017-03-29 16:24:12","180");
INSERT INTO tt_user_hours VALUES("605","3","2017-03-28","09:30:00","14:00:00","127","2017-03-29 16:24:31","270");
INSERT INTO tt_user_hours VALUES("606","3","2017-03-28","15:00:00","18:30:00","279","2017-03-29 00:00:00","210");
INSERT INTO tt_user_hours VALUES("607","11","2017-03-27","09:30:00","14:00:00","187","2017-03-31 14:00:45","270");
INSERT INTO tt_user_hours VALUES("608","11","2017-03-27","15:00:00","18:30:00","187","2017-03-31 14:01:04","210");
INSERT INTO tt_user_hours VALUES("609","11","2017-03-28","09:30:00","14:00:00","187","2017-03-31 14:01:45","270");
INSERT INTO tt_user_hours VALUES("610","11","2017-03-28","15:00:00","18:30:00","187","2017-03-31 14:02:02","210");
INSERT INTO tt_user_hours VALUES("611","11","2017-03-29","09:30:00","14:00:00","187","2017-03-31 14:02:21","270");
INSERT INTO tt_user_hours VALUES("612","11","2017-03-29","15:00:00","18:30:00","187","2017-03-31 14:02:43","210");
INSERT INTO tt_user_hours VALUES("613","11","2017-03-30","09:30:00","14:00:00","187","2017-03-31 14:03:10","270");
INSERT INTO tt_user_hours VALUES("614","11","2017-03-30","15:00:00","18:30:00","187","2017-03-31 14:03:36","210");
INSERT INTO tt_user_hours VALUES("615","24","2017-03-27","09:30:00","14:00:00","104","2017-03-31 14:09:27","270");
INSERT INTO tt_user_hours VALUES("616","24","2017-03-27","15:00:00","18:30:00","104","2017-03-31 14:14:52","210");
INSERT INTO tt_user_hours VALUES("617","24","2017-03-28","09:30:00","14:00:00","104","2017-03-31 14:15:12","270");
INSERT INTO tt_user_hours VALUES("618","24","2017-03-29","09:30:00","14:00:00","104","2017-03-31 14:15:36","270");
INSERT INTO tt_user_hours VALUES("619","24","2017-03-29","15:00:00","18:30:00","104","2017-03-31 14:16:01","210");
INSERT INTO tt_user_hours VALUES("620","24","2017-03-28","15:00:00","18:30:00","104","2017-03-31 14:16:49","210");
INSERT INTO tt_user_hours VALUES("621","24","2017-03-30","09:30:00","14:00:00","104","2017-03-31 14:17:29","270");
INSERT INTO tt_user_hours VALUES("622","24","2017-03-30","15:00:00","18:30:00","104","2017-03-31 14:17:45","210");
INSERT INTO tt_user_hours VALUES("623","24","2017-03-31","09:30:00","15:00:00","104","2017-03-31 14:18:18","330");
INSERT INTO tt_user_hours VALUES("624","23","2017-03-27","09:30:00","14:00:00","104","2017-03-31 14:21:34","270");
INSERT INTO tt_user_hours VALUES("625","23","2017-03-27","15:00:00","18:30:00","104","2017-03-31 14:22:09","210");
INSERT INTO tt_user_hours VALUES("626","23","2017-03-28","09:30:00","14:00:00","104","2017-03-31 14:22:41","270");
INSERT INTO tt_user_hours VALUES("627","23","2017-03-28","15:00:00","18:30:00","104","2017-03-31 14:23:32","210");
INSERT INTO tt_user_hours VALUES("628","23","2017-03-29","09:30:00","14:00:00","104","2017-03-31 14:23:54","270");
INSERT INTO tt_user_hours VALUES("629","23","2017-03-29","15:00:00","18:30:00","104","2017-03-31 14:25:23","210");
INSERT INTO tt_user_hours VALUES("630","11","2017-03-31","09:30:00","13:00:00","187","2017-03-31 14:25:27","210");
INSERT INTO tt_user_hours VALUES("631","23","2017-03-30","09:30:00","14:00:00","104","2017-03-31 14:25:48","270");
INSERT INTO tt_user_hours VALUES("632","11","2017-03-31","13:00:00","14:00:00","104","2017-03-31 14:26:08","60");
INSERT INTO tt_user_hours VALUES("633","23","2017-03-30","15:00:00","18:30:00","104","2017-03-31 14:26:20","210");
INSERT INTO tt_user_hours VALUES("634","23","2017-03-31","09:30:00","15:00:00","104","2017-03-31 00:00:00","330");
INSERT INTO tt_user_hours VALUES("635","4","2017-03-27","09:30:00","14:00:00","127","2017-03-31 14:28:07","270");
INSERT INTO tt_user_hours VALUES("636","3","2017-03-29","09:30:00","14:00:00","127","2017-03-31 14:28:20","270");
INSERT INTO tt_user_hours VALUES("637","4","2017-03-27","15:00:00","18:30:00","127","2017-03-31 14:28:25","210");
INSERT INTO tt_user_hours VALUES("638","3","2017-03-29","15:00:00","18:30:00","127","2017-03-31 14:28:35","210");
INSERT INTO tt_user_hours VALUES("639","4","2017-03-28","09:30:00","14:00:00","127","2017-03-31 14:28:40","270");
INSERT INTO tt_user_hours VALUES("640","3","2017-03-30","09:30:00","14:00:00","127","2017-03-31 14:28:55","270");
INSERT INTO tt_user_hours VALUES("641","4","2017-03-28","15:00:00","18:30:00","127","2017-03-31 14:28:57","210");
INSERT INTO tt_user_hours VALUES("642","3","2017-03-30","15:00:00","15:30:00","301","2017-03-31 14:29:13","30");
INSERT INTO tt_user_hours VALUES("643","3","2017-03-30","15:30:00","18:30:00","127","2017-03-31 14:29:30","180");
INSERT INTO tt_user_hours VALUES("644","4","2017-03-29","09:30:00","14:00:00","127","2017-03-31 14:29:31","270");
INSERT INTO tt_user_hours VALUES("645","4","2017-03-29","15:00:00","18:30:00","127","2017-03-31 14:29:51","210");
INSERT INTO tt_user_hours VALUES("646","3","2017-03-31","09:30:00","11:30:00","127","2017-03-31 14:29:51","120");
INSERT INTO tt_user_hours VALUES("647","3","2017-03-31","11:30:00","13:00:00","183","2017-03-31 14:30:05","90");
INSERT INTO tt_user_hours VALUES("648","11","2017-03-31","14:00:00","14:30:00","187","2017-03-31 14:30:06","30");
INSERT INTO tt_user_hours VALUES("649","3","2017-03-31","13:00:00","15:00:00","279","2017-03-31 14:30:22","120");
INSERT INTO tt_user_hours VALUES("650","4","2017-03-30","09:30:00","10:30:00","90","2017-03-31 14:31:13","60");
INSERT INTO tt_user_hours VALUES("651","4","2017-03-30","10:30:00","11:00:00","190","2017-03-31 14:31:39","30");
INSERT INTO tt_user_hours VALUES("652","4","2017-03-30","11:00:00","14:00:00","127","2017-03-31 14:31:59","180");
INSERT INTO tt_user_hours VALUES("653","4","2017-03-30","15:00:00","18:30:00","127","2017-03-31 14:32:16","210");
INSERT INTO tt_user_hours VALUES("654","4","2017-03-31","09:30:00","14:00:00","127","2017-03-31 14:32:38","270");
INSERT INTO tt_user_hours VALUES("655","11","2017-03-31","14:30:00","15:00:00","187","2017-03-31 14:34:37","30");
INSERT INTO tt_user_hours VALUES("656","24","2017-04-04","09:30:00","14:00:00","104","2017-04-07 13:05:21","270");
INSERT INTO tt_user_hours VALUES("657","24","2017-04-04","15:00:00","18:30:00","104","2017-04-07 13:05:46","210");
INSERT INTO tt_user_hours VALUES("658","24","2017-04-05","09:30:00","14:00:00","104","2017-04-07 13:06:39","270");
INSERT INTO tt_user_hours VALUES("659","24","2017-04-05","15:00:00","18:30:00","104","2017-04-07 13:07:47","210");
INSERT INTO tt_user_hours VALUES("660","24","2017-04-06","09:30:00","14:00:00","104","2017-04-07 13:08:05","270");
INSERT INTO tt_user_hours VALUES("661","24","2017-04-06","15:00:00","18:30:00","104","2017-04-07 13:08:27","210");
INSERT INTO tt_user_hours VALUES("662","24","2017-04-07","09:30:00","15:00:00","104","2017-04-07 13:09:18","330");
INSERT INTO tt_user_hours VALUES("663","23","2017-04-03","09:30:00","11:30:00","279","2017-04-07 13:09:55","120");
INSERT INTO tt_user_hours VALUES("664","23","2017-04-03","11:30:00","14:00:00","104","2017-04-07 13:10:58","150");
INSERT INTO tt_user_hours VALUES("665","23","2017-04-03","15:00:00","18:30:00","104","2017-04-07 13:11:24","210");
INSERT INTO tt_user_hours VALUES("666","23","2017-04-04","09:30:00","14:00:00","104","2017-04-07 13:12:07","270");
INSERT INTO tt_user_hours VALUES("667","23","2017-04-04","15:00:00","18:30:00","104","2017-04-07 13:13:09","210");
INSERT INTO tt_user_hours VALUES("668","23","2017-04-05","09:30:00","14:00:00","104","2017-04-07 13:13:28","270");
INSERT INTO tt_user_hours VALUES("669","23","2017-04-05","15:00:00","18:30:00","104","2017-04-07 13:13:51","210");
INSERT INTO tt_user_hours VALUES("670","23","2017-04-06","09:30:00","14:00:00","104","2017-04-07 13:14:31","270");
INSERT INTO tt_user_hours VALUES("671","23","2017-04-06","15:00:00","18:30:00","104","2017-04-07 13:14:48","210");
INSERT INTO tt_user_hours VALUES("672","23","2017-04-07","09:30:00","15:00:00","104","2017-04-07 13:20:32","330");
INSERT INTO tt_user_hours VALUES("673","4","2017-04-03","09:30:00","11:00:00","127","2017-04-07 14:19:12","90");
INSERT INTO tt_user_hours VALUES("674","11","2017-04-03","09:30:00","14:00:00","187","2017-04-07 14:37:01","270");
INSERT INTO tt_user_hours VALUES("675","11","2017-04-03","15:00:00","18:30:00","187","2017-04-07 14:37:41","210");
INSERT INTO tt_user_hours VALUES("676","11","2017-04-04","09:30:00","14:00:00","187","2017-04-07 14:38:21","270");
INSERT INTO tt_user_hours VALUES("677","11","2017-04-04","15:00:00","18:30:00","187","2017-04-07 14:38:55","210");
INSERT INTO tt_user_hours VALUES("678","11","2017-04-05","09:30:00","14:00:00","187","2017-04-07 14:39:30","270");
INSERT INTO tt_user_hours VALUES("679","11","2017-04-05","15:00:00","18:30:00","187","2017-04-07 14:40:00","210");
INSERT INTO tt_user_hours VALUES("680","11","2017-04-06","09:30:00","14:00:00","187","2017-04-07 14:40:40","270");
INSERT INTO tt_user_hours VALUES("681","11","2017-04-06","15:00:00","18:30:00","187","2017-04-07 14:41:10","210");
INSERT INTO tt_user_hours VALUES("682","11","2017-04-07","09:30:00","15:00:00","187","2017-04-07 14:41:58","330");
INSERT INTO tt_user_hours VALUES("683","5","2017-04-03","09:30:00","12:30:00","3","2017-04-07 14:51:29","180");
INSERT INTO tt_user_hours VALUES("684","5","2017-04-03","12:30:00","14:00:00","187","2017-04-07 14:52:03","90");
INSERT INTO tt_user_hours VALUES("685","5","2017-04-03","15:00:00","18:30:00","187","2017-04-07 14:52:29","210");
INSERT INTO tt_user_hours VALUES("686","5","2017-04-04","09:30:00","12:30:00","327","2017-04-07 14:53:02","180");
INSERT INTO tt_user_hours VALUES("687","5","2017-04-04","12:30:00","14:00:00","187","2017-04-07 14:53:17","90");
INSERT INTO tt_user_hours VALUES("688","5","2017-04-04","15:00:00","18:30:00","187","2017-04-07 14:53:39","210");
INSERT INTO tt_user_hours VALUES("689","5","2017-04-05","09:30:00","12:30:00","327","2017-04-07 14:54:02","180");
INSERT INTO tt_user_hours VALUES("690","5","2017-04-05","12:30:00","14:00:00","187","2017-04-07 14:54:19","90");
INSERT INTO tt_user_hours VALUES("691","5","2017-04-05","15:00:00","18:30:00","187","2017-04-07 14:54:40","210");
INSERT INTO tt_user_hours VALUES("692","4","2017-04-03","11:00:00","13:00:00","327","2017-04-07 14:55:10","120");
INSERT INTO tt_user_hours VALUES("693","5","2017-04-06","09:30:00","12:30:00","330","2017-04-07 14:55:14","180");
INSERT INTO tt_user_hours VALUES("694","5","2017-04-06","12:30:00","14:00:00","187","2017-04-07 14:55:31","90");
INSERT INTO tt_user_hours VALUES("695","4","2017-04-03","13:00:00","14:00:00","127","2017-04-07 14:55:32","60");
INSERT INTO tt_user_hours VALUES("696","5","2017-04-06","15:00:00","18:30:00","187","2017-04-07 14:55:48","210");
INSERT INTO tt_user_hours VALUES("697","5","2017-04-07","09:30:00","15:00:00","187","2017-04-07 14:56:10","330");
INSERT INTO tt_user_hours VALUES("698","4","2017-04-03","15:00:00","18:30:00","127","2017-04-07 14:56:12","210");
INSERT INTO tt_user_hours VALUES("699","4","2017-04-04","09:30:00","14:00:00","127","2017-04-07 14:56:29","270");
INSERT INTO tt_user_hours VALUES("700","4","2017-04-04","15:00:00","18:30:00","127","2017-04-07 14:56:54","210");
INSERT INTO tt_user_hours VALUES("701","4","2017-04-05","09:30:00","14:00:00","127","2017-04-07 14:57:28","270");
INSERT INTO tt_user_hours VALUES("702","4","2017-04-05","15:00:00","18:30:00","127","2017-04-07 00:00:00","210");
INSERT INTO tt_user_hours VALUES("703","4","2017-04-06","09:30:00","14:00:00","127","2017-04-07 14:59:09","270");
INSERT INTO tt_user_hours VALUES("704","4","2017-04-06","15:00:00","16:00:00","127","2017-04-07 15:00:25","60");
INSERT INTO tt_user_hours VALUES("705","4","2017-04-07","16:00:00","18:30:00","327","2017-04-07 15:01:13","150");
INSERT INTO tt_user_hours VALUES("706","3","2017-04-03","09:30:00","14:00:00","127","2017-04-10 16:54:01","270");
INSERT INTO tt_user_hours VALUES("707","3","2017-04-03","15:00:00","18:30:00","127","2017-04-10 16:54:27","210");
INSERT INTO tt_user_hours VALUES("708","3","2017-04-04","09:30:00","14:00:00","127","2017-04-10 16:55:20","270");
INSERT INTO tt_user_hours VALUES("709","3","2017-04-04","15:00:00","18:30:00","127","2017-04-10 16:55:41","210");
INSERT INTO tt_user_hours VALUES("710","3","2017-04-05","09:30:00","14:00:00","127","2017-04-10 16:56:12","270");
INSERT INTO tt_user_hours VALUES("711","3","2017-04-05","15:00:00","18:30:00","127","2017-04-10 16:56:27","210");
INSERT INTO tt_user_hours VALUES("712","3","2017-04-06","09:30:00","14:00:00","127","2017-04-10 16:56:57","270");
INSERT INTO tt_user_hours VALUES("713","3","2017-04-06","15:00:00","18:30:00","327","2017-04-10 00:00:00","210");
INSERT INTO tt_user_hours VALUES("714","3","2017-04-07","09:30:00","15:00:00","127","2017-04-10 16:58:10","330");
INSERT INTO tt_user_hours VALUES("715","5","2017-04-10","09:30:00","14:00:00","187","2017-04-12 09:36:56","270");
INSERT INTO tt_user_hours VALUES("716","5","2017-04-10","15:00:00","18:30:00","187","2017-04-12 09:37:18","210");
INSERT INTO tt_user_hours VALUES("717","5","2017-04-11","09:30:00","14:00:00","187","2017-04-12 09:37:38","270");
INSERT INTO tt_user_hours VALUES("718","5","2017-04-11","15:00:00","18:30:00","187","2017-04-12 09:38:06","210");
INSERT INTO tt_user_hours VALUES("719","5","2017-04-12","09:30:00","14:00:00","187","2017-04-12 09:38:27","270");
INSERT INTO tt_user_hours VALUES("720","5","2017-04-12","15:00:00","18:30:00","187","2017-04-12 09:38:47","210");
INSERT INTO tt_user_hours VALUES("721","24","2017-04-10","09:30:00","14:00:00","104","2017-04-17 11:59:08","270");
INSERT INTO tt_user_hours VALUES("722","24","2017-04-10","15:00:00","18:30:00","104","2017-04-17 11:59:45","210");
INSERT INTO tt_user_hours VALUES("723","24","2017-04-11","09:30:00","14:00:00","104","2017-04-17 12:01:44","270");
INSERT INTO tt_user_hours VALUES("724","24","2017-04-11","15:00:00","18:30:00","104","2017-04-17 12:02:04","210");
INSERT INTO tt_user_hours VALUES("725","24","2017-04-17","09:30:00","14:00:00","104","2017-04-17 12:02:39","270");
INSERT INTO tt_user_hours VALUES("726","11","2017-04-17","09:30:00","14:00:00","187","2017-04-21 14:29:45","270");
INSERT INTO tt_user_hours VALUES("727","11","2017-04-17","15:00:00","18:30:00","187","2017-04-21 14:30:13","210");
INSERT INTO tt_user_hours VALUES("728","11","2017-04-18","09:30:00","14:00:00","187","2017-04-21 14:30:52","270");
INSERT INTO tt_user_hours VALUES("729","5","2017-04-17","09:30:00","14:00:00","187","2017-04-21 14:31:07","270");
INSERT INTO tt_user_hours VALUES("730","11","2017-04-18","15:00:00","18:30:00","187","2017-04-21 14:31:12","210");
INSERT INTO tt_user_hours VALUES("731","5","2017-04-17","15:00:00","18:30:00","187","2017-04-21 14:31:28","210");
INSERT INTO tt_user_hours VALUES("732","5","2017-04-18","09:30:00","14:00:00","187","2017-04-21 14:31:49","270");
INSERT INTO tt_user_hours VALUES("733","11","2017-04-19","09:30:00","14:00:00","187","2017-04-21 14:32:00","270");
INSERT INTO tt_user_hours VALUES("734","5","2017-04-18","15:00:00","18:30:00","187","2017-04-21 14:32:14","210");
INSERT INTO tt_user_hours VALUES("735","5","2017-04-19","09:30:00","14:00:00","187","2017-04-21 14:32:40","270");
INSERT INTO tt_user_hours VALUES("736","11","2017-04-19","15:00:00","18:30:00","187","2017-04-21 14:32:47","210");
INSERT INTO tt_user_hours VALUES("737","5","2017-04-19","15:00:00","18:30:00","187","2017-04-21 14:33:00","210");
INSERT INTO tt_user_hours VALUES("738","5","2017-04-20","09:30:00","14:00:00","187","2017-04-21 14:33:25","270");
INSERT INTO tt_user_hours VALUES("739","5","2017-04-20","15:00:00","18:30:00","187","2017-04-21 14:33:53","210");
INSERT INTO tt_user_hours VALUES("740","11","2017-04-20","09:30:00","14:00:00","187","2017-04-21 14:34:10","270");
INSERT INTO tt_user_hours VALUES("741","5","2017-04-21","09:30:00","15:00:00","187","2017-04-21 14:34:15","330");
INSERT INTO tt_user_hours VALUES("742","11","2017-04-20","15:00:00","18:30:00","187","2017-04-21 14:34:45","210");
INSERT INTO tt_user_hours VALUES("743","11","2017-04-21","09:30:00","13:00:00","187","2017-04-21 14:36:28","210");
INSERT INTO tt_user_hours VALUES("744","11","2017-04-21","13:00:00","15:00:00","127","2017-04-21 14:41:32","120");
INSERT INTO tt_user_hours VALUES("745","24","2017-04-17","15:00:00","18:30:00","104","2017-04-21 14:48:08","210");
INSERT INTO tt_user_hours VALUES("746","24","2017-04-18","09:30:00","14:00:00","104","2017-04-21 14:48:33","270");
INSERT INTO tt_user_hours VALUES("747","24","2017-04-18","15:00:00","18:30:00","104","2017-04-21 14:48:52","210");
INSERT INTO tt_user_hours VALUES("748","24","2017-04-19","09:30:00","14:00:00","104","2017-04-21 14:49:11","270");
INSERT INTO tt_user_hours VALUES("749","24","2017-04-19","15:00:00","18:30:00","104","2017-04-21 14:49:30","210");
INSERT INTO tt_user_hours VALUES("750","24","2017-04-20","09:30:00","14:00:00","104","2017-04-21 14:49:56","270");
INSERT INTO tt_user_hours VALUES("751","24","2017-04-20","15:00:00","18:30:00","104","2017-04-21 14:50:14","210");
INSERT INTO tt_user_hours VALUES("752","23","2017-05-03","09:30:00","14:00:00","279","2017-05-08 10:57:10","270");
INSERT INTO tt_user_hours VALUES("755","23","2017-05-04","09:30:00","14:00:00","104","2017-05-08 10:59:31","270");
INSERT INTO tt_user_hours VALUES("754","23","2017-05-03","15:00:00","18:30:00","279","2017-05-08 10:57:45","210");
INSERT INTO tt_user_hours VALUES("756","23","2017-05-04","15:00:00","18:30:00","279","2017-05-08 10:59:54","210");
INSERT INTO tt_user_hours VALUES("757","23","2017-05-05","09:30:00","12:00:00","279","2017-05-08 11:00:47","150");
INSERT INTO tt_user_hours VALUES("758","23","2017-05-05","13:00:00","15:00:00","104","2017-05-08 11:01:19","120");
INSERT INTO tt_user_hours VALUES("759","24","2017-05-03","09:30:00","14:00:00","104","2017-05-08 11:08:14","270");
INSERT INTO tt_user_hours VALUES("760","24","2017-05-03","15:00:00","18:30:00","104","2017-05-08 11:09:02","210");
INSERT INTO tt_user_hours VALUES("761","23","2017-05-09","09:30:00","14:00:00","104","2017-05-16 10:27:37","270");
INSERT INTO tt_user_hours VALUES("762","23","2017-05-09","15:00:00","18:30:00","104","2017-05-16 10:27:58","210");
INSERT INTO tt_user_hours VALUES("763","23","2017-05-10","09:30:00","14:00:00","104","2017-05-16 10:28:40","270");
INSERT INTO tt_user_hours VALUES("764","23","2017-05-10","15:00:00","18:30:00","104","2017-05-16 10:29:17","210");
INSERT INTO tt_user_hours VALUES("765","23","2017-05-11","09:30:00","14:00:00","104","2017-05-16 10:31:06","270");
INSERT INTO tt_user_hours VALUES("766","23","2017-05-11","15:00:00","18:30:00","279","2017-05-16 10:31:20","210");
INSERT INTO tt_user_hours VALUES("767","23","2017-05-12","09:30:00","12:00:00","104","2017-05-16 10:31:47","150");
INSERT INTO tt_user_hours VALUES("768","23","2017-05-12","12:00:00","15:00:00","279","2017-05-16 10:32:22","180");



DROP TABLE tt_variable_concept;

CREATE TABLE `tt_variable_concept` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET latin1 COLLATE latin1_spanish_ci NOT NULL,
  `account_number` varchar(50) CHARACTER SET latin1 COLLATE latin1_spanish_ci NOT NULL,
  `id_company` varchar(50) COLLATE latin1_german1_ci NOT NULL,
  `id_fiscal_year` varchar(50) COLLATE latin1_german1_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=395 DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci ROW_FORMAT=DYNAMIC;

INSERT INTO tt_variable_concept VALUES("388","CV1","6220000","385","406");
INSERT INTO tt_variable_concept VALUES("390","CV2","6200001","385","406");
INSERT INTO tt_variable_concept VALUES("391","CV3","6210001","385","406");
INSERT INTO tt_variable_concept VALUES("393","CV5","6001000","385","406");



