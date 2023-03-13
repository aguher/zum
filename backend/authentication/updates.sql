ALTER TABLE `tt_company_year` ADD `amortizacion` INT NOT NULL AFTER `tax`, ADD `financiero` INT NOT NULL AFTER `amortizacion`, ADD `extraordinario` INT NOT NULL AFTER `financiero`;
