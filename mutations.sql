ALTER TABLE `tt_campaign` ADD `shipping_method` VARCHAR( 100 ) NOT NULL
ALTER TABLE `tt_campaign` ADD `shipping_method_return` VARCHAR( 100 ) NOT NULL
ALTER TABLE `tt_campaign` ADD `start_date_event` DATE NOT NULL ,
ADD `end_date_event` DATE NOT NULL

ALTER TABLE `tt_subconcepts_project` ADD `start_date_event` DATE NOT NULL ,
ADD `end_date_event` DATE NOT NULL

ALTER TABLE `tt_subconcepts_project` CHANGE `amount` `amount` DOUBLE NOT NULL DEFAULT '0'
ALTER TABLE `tt_subconcepts_project` CHANGE `unit_budget` `unit_budget` DOUBLE NOT NULL DEFAULT '0'