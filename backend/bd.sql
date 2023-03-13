-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 04, 2018 at 11:23 AM
-- Server version: 10.1.30-MariaDB
-- PHP Version: 7.2.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `prueba`
--

-- --------------------------------------------------------

--
-- Table structure for table `tt_billing`
--

CREATE TABLE `tt_billing` (
  `id` int(11) NOT NULL,
  `number` varchar(20) COLLATE utf8_spanish_ci NOT NULL,
  `issue_date` date NOT NULL,
  `description` varchar(300) COLLATE utf8_spanish_ci NOT NULL,
  `id_team` int(11) NOT NULL,
  `id_customer` int(11) NOT NULL,
  `PO` varchar(50) COLLATE utf8_spanish_ci NOT NULL,
  `due_date` date NOT NULL,
  `tax_base` float NOT NULL,
  `taxes` float NOT NULL,
  `total` float NOT NULL,
  `id_company` int(11) NOT NULL,
  `id_fiscal_year` int(11) NOT NULL,
  `id_project` int(11) NOT NULL,
  `percent_tax` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Dumping data for table `tt_billing`
--

INSERT INTO `tt_billing` (`id`, `number`, `issue_date`, `description`, `id_team`, `id_customer`, `PO`, `due_date`, `tax_base`, `taxes`, `total`, `id_company`, `id_fiscal_year`, `id_project`, `percent_tax`) VALUES
(23, '1', '2018-01-30', 'Royal Bliss 2018', 1, 62, '', '0000-00-00', 42, 4.2, 46.2, 385, 411, 412, 10);

-- --------------------------------------------------------

--
-- Table structure for table `tt_budget`
--

CREATE TABLE `tt_budget` (
  `id` int(11) NOT NULL,
  `code` varchar(50) COLLATE utf8_spanish_ci NOT NULL,
  `name` varchar(150) COLLATE utf8_spanish_ci NOT NULL,
  `id_team` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `id_customer` int(11) NOT NULL,
  `id_group` int(11) NOT NULL,
  `id_subgroup` int(11) NOT NULL,
  `id_company` int(11) NOT NULL,
  `id_fiscal_year` int(11) NOT NULL,
  `start_date_budget` date NOT NULL,
  `end_date_budget` date NOT NULL,
  `budget_validity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Dumping data for table `tt_budget`
--

INSERT INTO `tt_budget` (`id`, `code`, `name`, `id_team`, `id_user`, `id_customer`, `id_group`, `id_subgroup`, `id_company`, `id_fiscal_year`, `start_date_budget`, `end_date_budget`, `budget_validity`) VALUES
(11, '', 'Prueba 1', 57, 67, 62, 412, 24, 385, 411, '0000-00-00', '0000-00-00', 0),
(12, '', 'HOTELES ROYAL BLISS 2018', 57, 65, 59, 418, 37, 385, 411, '2018-01-04', '2018-01-13', 0),
(13, '', 'adsfsdf', 2, 72, 66, 419, 45, 385, 411, '0000-00-00', '0000-00-00', 0);

-- --------------------------------------------------------

--
-- Table structure for table `tt_budget_cost`
--

CREATE TABLE `tt_budget_cost` (
  `pesimist` int(11) NOT NULL DEFAULT '0',
  `optimist` int(11) NOT NULL DEFAULT '0',
  `id_company` varchar(50) COLLATE latin1_german1_ci NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

--
-- Dumping data for table `tt_budget_cost`
--

INSERT INTO `tt_budget_cost` (`pesimist`, `optimist`, `id_company`) VALUES
(0, 0, '0');

-- --------------------------------------------------------

--
-- Table structure for table `tt_budget_expenses`
--

CREATE TABLE `tt_budget_expenses` (
  `id` int(11) NOT NULL,
  `id_campaign` int(11) NOT NULL,
  `amount` float NOT NULL,
  `id_month` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `type` int(2) NOT NULL COMMENT '0:estimated; 1:real',
  `id_variable_concept` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `tt_budget_expenses`
--

INSERT INTO `tt_budget_expenses` (`id`, `id_campaign`, `amount`, `id_month`, `type`, `id_variable_concept`) VALUES
(31, 412, 1458, 'june', 1, 416),
(32, 412, 10, 'may', 1, 416);

-- --------------------------------------------------------

--
-- Table structure for table `tt_budget_income`
--

CREATE TABLE `tt_budget_income` (
  `id` int(11) NOT NULL,
  `amount` varchar(100) CHARACTER SET latin1 COLLATE latin1_spanish_ci NOT NULL,
  `id_campaign` int(50) NOT NULL,
  `type` int(50) NOT NULL COMMENT '0: estimated; 1:real',
  `id_month` varchar(50) COLLATE latin1_german1_ci NOT NULL,
  `id_variable_concept` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

--
-- Dumping data for table `tt_budget_income`
--

INSERT INTO `tt_budget_income` (`id`, `amount`, `id_campaign`, `type`, `id_month`, `id_variable_concept`) VALUES
(486, '2', 412, 0, 'january', 422),
(485, '22', 412, 0, 'march', 422),
(484, '10', 412, 0, 'february', 422),
(480, '1', 412, 0, 'january', 416),
(482, '1', 412, 0, 'march', 416),
(483, '2', 412, 0, 'april', 416),
(481, '0', 412, 0, 'february', 416),
(478, '1', 412, 1, 'january', 416),
(477, '2', 412, 1, 'april', 416),
(476, '20', 412, 1, 'may', 416);

-- --------------------------------------------------------

--
-- Table structure for table `tt_campaign`
--

CREATE TABLE `tt_campaign` (
  `id` int(11) NOT NULL,
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
  `start_date_budget` date NOT NULL,
  `end_date_budget` date NOT NULL,
  `budget_validity` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

--
-- Dumping data for table `tt_campaign`
--

INSERT INTO `tt_campaign` (`id`, `campaign_code`, `campaign_name`, `campaign_parsed`, `id_team`, `id_group`, `id_subgroup`, `id_user`, `id_company`, `id_fiscal_year`, `id_customer`, `id_status`, `creation_date`, `end_date`, `sum_minutes`, `security_level`, `start_date_budget`, `end_date_budget`, `budget_validity`) VALUES
(411, '18011', 'Mapfre Fee', '', 1, 410, 38, 59, 385, 411, 63, 1, '2018-01-01', '2018-12-31', 0, 'Bajo', '2018-01-13', '2018-03-17', 30),
(412, '18010', 'Royal Bliss 2018', '', 1, 412, 24, 56, 385, 411, 62, 1, '2018-01-01', '2018-12-31', 0, '', '2018-01-01', '2018-05-24', 0),
(413, '18012', 'Bolsa Noviembre-Diciembre', '', 57, 416, 41, 67, 385, 411, 59, 1, '2018-01-01', '2018-12-31', 0, 'Bajo', '0000-00-00', '0000-00-00', 0),
(414, '18013', 'Bolsa Gastos Extras activaciones BA', '', 57, 416, 41, 67, 385, 411, 59, 2, '2018-01-01', '2018-12-31', 0, 'Bajo', '0000-00-00', '0000-00-00', 0),
(415, '18014', 'Bolsa Gestión y coordinación BA y Activaciones', '', 57, 416, 41, 67, 385, 411, 59, 2, '2018-01-01', '2018-12-31', 0, 'Bajo', '0000-00-00', '0000-00-00', 0),
(416, '18015', 'LUX', '', 57, 414, 16, 67, 385, 411, 59, 2, '2018-01-01', '2018-12-31', 0, 'Bajo', '0000-00-00', '0000-00-00', 0),
(417, '18016', 'Activaciones de Navidad', '', 57, 416, 41, 67, 385, 411, 59, 2, '2018-01-01', '2018-12-31', 0, 'Bajo', '0000-00-00', '0000-00-00', 0),
(418, '18017', 'Formaciones Coca-Cola Mix', '', 57, 414, 17, 67, 385, 411, 59, 2, '2018-01-01', '2018-12-31', 0, 'Bajo', '0000-00-00', '0000-00-00', 0),
(419, '18018', 'EVENTOS Meliá y H10', '', 57, 414, 17, 67, 385, 411, 59, 2, '2018-01-01', '2018-12-31', 0, 'Bajo', '0000-00-00', '0000-00-00', 0),
(420, '18019', 'Activaciones Hoteles', '', 57, 414, 17, 67, 385, 411, 59, 2, '2018-01-01', '2018-12-31', 0, 'Bajo', '0000-00-00', '0000-00-00', 0),
(421, '18020', 'Madrid Fusion (Jorge Fernández)', '', 57, 414, 17, 67, 385, 411, 59, 2, '2018-01-01', '2018-12-31', 0, 'Bajo', '0000-00-00', '0000-00-00', 0),
(422, '18021', 'OP Hotel Barceló Eventos CCMIX', '', 57, 414, 17, 67, 385, 411, 59, 2, '2018-01-01', '2018-12-31', 0, 'Bajo', '0000-00-00', '0000-00-00', 0),
(423, '18022', 'OP Hotel Barceló Formaciones', '', 57, 414, 17, 67, 385, 411, 59, 2, '2018-01-01', '2018-12-31', 0, 'Bajo', '0000-00-00', '0000-00-00', 0),
(424, '18023', 'Bolsa Maria', '', 57, 414, 18, 67, 385, 411, 59, 2, '2018-01-01', '2018-12-31', 0, 'Bajo', '0000-00-00', '0000-00-00', 0),
(425, '18024', 'Larios Café', '', 57, 414, 23, 67, 385, 411, 59, 2, '2018-01-01', '2018-12-31', 0, 'Bajo', '0000-00-00', '0000-00-00', 0),
(426, '18025', 'Gigantes y Pintxos', '', 57, 414, 23, 67, 385, 411, 59, 2, '2018-01-01', '2018-12-31', 0, 'Bajo', '0000-00-00', '0000-00-00', 0),
(427, '18027', 'Extras WASO enero', '', 2, 420, 47, 57, 385, 411, 65, 1, '2018-01-01', '2018-12-31', 0, 'Bajo', '0000-00-00', '0000-00-00', 0);

-- --------------------------------------------------------

--
-- Table structure for table `tt_company`
--

CREATE TABLE `tt_company` (
  `id` int(11) NOT NULL,
  `name` varchar(100) CHARACTER SET latin1 COLLATE latin1_spanish_ci NOT NULL,
  `removable` tinyint(1) NOT NULL DEFAULT '1',
  `CIF` varchar(100) COLLATE latin1_german1_ci NOT NULL,
  `address` varchar(150) COLLATE latin1_german1_ci NOT NULL,
  `logo` varchar(100) COLLATE latin1_german1_ci NOT NULL,
  `address_bis` varchar(100) COLLATE latin1_german1_ci NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

--
-- Dumping data for table `tt_company`
--

INSERT INTO `tt_company` (`id`, `name`, `removable`, `CIF`, `address`, `logo`, `address_bis`) VALUES
(385, 'Tango', 0, 'B86833522', 'Cl Balbina Valverde 15', 'aa3a875f8b7ecdfd2d5c89d3b3f032fe.jpg', '28002  Madrid'),
(406, 'Mele', 1, 'B87905295', 'C/ Balbina Valverde 15', 'f0c182dfb0f0e80b6a98bba1a9263620.JPG', '28002 Madrid');

-- --------------------------------------------------------

--
-- Table structure for table `tt_company_report`
--

CREATE TABLE `tt_company_report` (
  `id` int(11) NOT NULL,
  `id_company_year` int(11) NOT NULL,
  `amortizacion` float NOT NULL,
  `gasto_financiero` float NOT NULL,
  `gasto_extraordinario` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tt_company_year`
--

CREATE TABLE `tt_company_year` (
  `id` int(11) NOT NULL,
  `id_company` int(11) NOT NULL,
  `id_fiscal_year` int(11) NOT NULL DEFAULT '0',
  `tax` int(11) DEFAULT NULL,
  `amortizacion` int(11) NOT NULL,
  `financiero` int(11) NOT NULL,
  `extraordinario` int(11) NOT NULL,
  `serie` varchar(20) COLLATE latin1_german1_ci NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

--
-- Dumping data for table `tt_company_year`
--

INSERT INTO `tt_company_year` (`id`, `id_company`, `id_fiscal_year`, `tax`, `amortizacion`, `financiero`, `extraordinario`, `serie`) VALUES
(411, 385, 3, 25, 0, 0, 0, 'A'),
(415, 406, 3, 0, 0, 0, 0, '');

-- --------------------------------------------------------

--
-- Table structure for table `tt_customer`
--

CREATE TABLE `tt_customer` (
  `id` int(11) NOT NULL,
  `customer_name` varchar(50) COLLATE utf8_spanish_ci NOT NULL,
  `id_company` varchar(50) COLLATE utf8_spanish_ci NOT NULL,
  `logo` varchar(200) COLLATE utf8_spanish_ci NOT NULL,
  `CIF` varchar(20) COLLATE utf8_spanish_ci NOT NULL,
  `address` varchar(100) COLLATE utf8_spanish_ci NOT NULL,
  `address_bis` varchar(100) COLLATE utf8_spanish_ci NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Dumping data for table `tt_customer`
--

INSERT INTO `tt_customer` (`id`, `customer_name`, `id_company`, `logo`, `CIF`, `address`, `address_bis`) VALUES
(56, 'HEINEKEN ESPAÑA SA', '385', 'undefined', 'A28006013', 'Avenida de Andalucia', '41007 Sevilla'),
(58, 'COCA COLA SERVICES S.A.', '385', 'undefined', '0462525791', 'Chaussee de Mons', 'Bruselas'),
(59, 'COCA COLA IBERIAN PARTNERS SA', '385', '564f56baead11e7de6666c803777f714.jpg', 'A86561412', 'Paseo de la Castellana', 'Madrid'),
(60, 'JABLEBERA SL', '385', 'undefined', 'B86927829', 'Calle Principe de Vergara', 'Madrid'),
(61, 'SHISEIDO ESPAÑA SA', '385', 'undefined', 'A82106253', 'Calle Procion', 'Madrid'),
(62, 'ACCENTURE S.L.U.', '385', 'undefined', 'B79217790', 'Pablo Ruis Picasso', 'Madrid'),
(63, 'MAPFRE SA', '385', '9fa0f701ab145e3e457e88c1416239fb.jpg', 'A08055741', 'Pozuelo', 'Majadahonda'),
(64, 'MAXXIUM ESPAÑA, S.L.', '385', 'undefined', 'B08194359', 'Mahonia', 'Madrid'),
(65, 'BEATU PRESTIGE INTERNATIONAL SAU', '385', 'undefined', 'A81803553', 'Paseo de la Castellana 280', '28046 Madrid'),
(66, 'ACEB SAU', '385', 'undefined', 'A58022864', 'CL. Iradier, 37', '08017 Barcelona');

-- --------------------------------------------------------

--
-- Table structure for table `tt_estimated_employee_cost`
--

CREATE TABLE `tt_estimated_employee_cost` (
  `id` int(11) NOT NULL,
  `id_campaign` int(11) NOT NULL,
  `id_month` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `amount` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tt_expenses_fixed_concept`
--

CREATE TABLE `tt_expenses_fixed_concept` (
  `id` int(11) NOT NULL,
  `id_fixed_concept` int(50) NOT NULL,
  `id_month` varchar(50) COLLATE latin1_german1_ci NOT NULL,
  `id_fiscal_year` int(50) NOT NULL,
  `amount` varchar(100) CHARACTER SET latin1 COLLATE latin1_spanish_ci NOT NULL,
  `type` int(50) NOT NULL COMMENT '0: estimated; 1:real',
  `id_company` int(50) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

--
-- Dumping data for table `tt_expenses_fixed_concept`
--

INSERT INTO `tt_expenses_fixed_concept` (`id`, `id_fixed_concept`, `id_month`, `id_fiscal_year`, `amount`, `type`, `id_company`) VALUES
(822, 437, 'january', 411, '2', 0, 385);

-- --------------------------------------------------------

--
-- Table structure for table `tt_fee_company`
--

CREATE TABLE `tt_fee_company` (
  `id` int(11) NOT NULL,
  `id_project` int(11) NOT NULL,
  `amount` float NOT NULL,
  `unit_budget` float NOT NULL,
  `price` float NOT NULL,
  `unit_real` float NOT NULL,
  `id_budget` int(11) NOT NULL,
  `id_bill` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `tt_fee_company`
--

INSERT INTO `tt_fee_company` (`id`, `id_project`, `amount`, `unit_budget`, `price`, `unit_real`, `id_budget`, `id_bill`) VALUES
(4, 0, 3, 4, 2, 0, 0, 13),
(5, 0, 2, 3, 4, 0, 0, 16),
(6, 0, 2, 3, 4, 0, 0, 17),
(11, 412, 2, 3, 1, 0, 0, 0),
(12, 0, 2, 3, 4, 0, 0, 18),
(13, 0, 2, 3, 4, 0, 0, 19),
(14, 0, 2, 3, 4, 0, 0, 20),
(15, 0, 2, 3, 1, 0, 0, 21),
(16, 0, 2, 3, 1, 0, 0, 22),
(17, 0, 2, 3, 1, 0, 0, 23);

-- --------------------------------------------------------

--
-- Table structure for table `tt_fiscal_year`
--

CREATE TABLE `tt_fiscal_year` (
  `id` int(11) NOT NULL,
  `year` int(11) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

--
-- Dumping data for table `tt_fiscal_year`
--

INSERT INTO `tt_fiscal_year` (`id`, `year`) VALUES
(1, 2016),
(2, 2017),
(3, 2018),
(4, 2019),
(5, 2020),
(6, 2021),
(7, 2022),
(8, 2023),
(9, 2024),
(10, 2025);

-- --------------------------------------------------------

--
-- Table structure for table `tt_fixed_concept`
--

CREATE TABLE `tt_fixed_concept` (
  `id` int(11) NOT NULL,
  `name` varchar(100) CHARACTER SET latin1 COLLATE latin1_spanish_ci NOT NULL,
  `account_number` varchar(50) CHARACTER SET latin1 COLLATE latin1_spanish_ci NOT NULL,
  `id_company` varchar(50) COLLATE latin1_german1_ci NOT NULL,
  `id_fiscal_year` varchar(50) COLLATE latin1_german1_ci NOT NULL,
  `id_parent` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

--
-- Dumping data for table `tt_fixed_concept`
--

INSERT INTO `tt_fixed_concept` (`id`, `name`, `account_number`, `id_company`, `id_fiscal_year`, `id_parent`) VALUES
(434, 'Alquileres', '6210000', '385', '411', 0),
(435, 'Gatos de mantenimiento', '6220000', '385', '411', 0),
(436, 'asdfasdfa', '1111111', '385', '411', 0),
(437, '2222222222', '2222222', '385', '411', 436);

-- --------------------------------------------------------

--
-- Table structure for table `tt_group`
--

CREATE TABLE `tt_group` (
  `id` int(11) NOT NULL,
  `id_customer` int(11) NOT NULL,
  `name` varchar(100) CHARACTER SET latin1 COLLATE latin1_spanish_ci NOT NULL,
  `id_company` varchar(50) COLLATE latin1_german1_ci NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

--
-- Dumping data for table `tt_group`
--

INSERT INTO `tt_group` (`id`, `id_customer`, `name`, `id_company`) VALUES
(406, 56, 'Heineken Experience', '385'),
(405, 56, 'Heineken Plan Digital', '385'),
(404, 56, 'Heineken Plan Salas', '385'),
(403, 56, 'Desperados Trade', '385'),
(402, 56, 'Desperados FEE', '385'),
(401, 56, 'Desperados Producción', '385'),
(407, 56, 'Heineken Otros', '385'),
(408, 58, 'CCME Producción', '385'),
(409, 58, 'CCME Fee', '385'),
(410, 63, 'Mapfre Fee', '385'),
(411, 63, 'Mapfre Producción', '385'),
(412, 62, 'Accenture Producción', '385'),
(414, 59, 'Eventos especiales Coca-cola', '385'),
(415, 59, 'Coca- cola Mix', '385'),
(416, 59, 'Activaciones Coca-cola', '385'),
(417, 59, 'Logistica', '385'),
(418, 59, 'Lux Coca-cola', '385'),
(419, 66, 'Eventos ACEB', '385'),
(420, 65, 'Shiseido', '385');

-- --------------------------------------------------------

--
-- Table structure for table `tt_hours`
--

CREATE TABLE `tt_hours` (
  `id` int(11) NOT NULL,
  `hours` int(4) NOT NULL,
  `update_date` datetime NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tt_incomes_lines_variable_concept`
--

CREATE TABLE `tt_incomes_lines_variable_concept` (
  `id` int(11) NOT NULL,
  `id_project` int(11) NOT NULL,
  `id_variable_concept` int(11) NOT NULL,
  `id_month` varchar(50) NOT NULL,
  `value` float NOT NULL,
  `type` int(11) NOT NULL COMMENT '0:presupuestado,1:real'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tt_incomes_lines_variable_concept`
--

INSERT INTO `tt_incomes_lines_variable_concept` (`id`, `id_project`, `id_variable_concept`, `id_month`, `value`, `type`) VALUES
(9, 412, 416, 'january', 3, 0),
(13, 412, 416, 'february', 2.2, 0),
(14, 412, 422, 'january', 2, 0),
(15, 412, 422, 'february', 4, 0),
(16, 412, 416, 'march', 12, 0),
(17, 412, 416, 'april', 12, 0),
(18, 412, 416, 'january', 15, 1),
(19, 412, 416, 'february', 12, 1);

-- --------------------------------------------------------

--
-- Table structure for table `tt_lines_fee_company`
--

CREATE TABLE `tt_lines_fee_company` (
  `id` int(11) NOT NULL,
  `id_month` varchar(50) COLLATE utf8_spanish_ci NOT NULL,
  `id_project` int(11) NOT NULL,
  `amount` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tt_lines_subconcept`
--

CREATE TABLE `tt_lines_subconcept` (
  `id` int(11) NOT NULL,
  `id_month` varchar(50) COLLATE utf8_spanish_ci NOT NULL,
  `amount` float NOT NULL,
  `id_subconcept` int(11) NOT NULL,
  `id_project` int(11) NOT NULL,
  `id_variable_concept` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Dumping data for table `tt_lines_subconcept`
--

INSERT INTO `tt_lines_subconcept` (`id`, `id_month`, `amount`, `id_subconcept`, `id_project`, `id_variable_concept`) VALUES
(1, 'january', 2, 294, 412, 416),
(2, 'february', 4, 294, 412, 416),
(3, 'march', 4, 294, 412, 416),
(4, 'april', 5, 294, 412, 416),
(5, 'january', 1, 301, 412, 416),
(6, 'february', 2, 301, 412, 416),
(7, 'march', 3, 301, 412, 416);

-- --------------------------------------------------------

--
-- Table structure for table `tt_real_employee_cost`
--

CREATE TABLE `tt_real_employee_cost` (
  `id` int(11) NOT NULL,
  `id_campaign` int(11) NOT NULL,
  `id_month` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `amount` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tt_role`
--

CREATE TABLE `tt_role` (
  `id` int(11) NOT NULL,
  `role` varchar(50) COLLATE latin1_german1_ci NOT NULL,
  `visibility` int(11) NOT NULL DEFAULT '1' COMMENT '1: visible en aplicacion gestion'
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

--
-- Dumping data for table `tt_role`
--

INSERT INTO `tt_role` (`id`, `role`, `visibility`) VALUES
(1, 'admin', 0),
(2, 'Creativos', 1),
(3, 'Super Administrador', 1),
(4, 'Dirección', 1),
(5, 'Administración', 1),
(6, 'Supervisor', 1),
(7, 'Cuentas 1', 1),
(8, 'Cuentas 2', 1);

-- --------------------------------------------------------

--
-- Table structure for table `tt_salary_history`
--

CREATE TABLE `tt_salary_history` (
  `id` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `cost` double NOT NULL,
  `registration_date` datetime NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

--
-- Dumping data for table `tt_salary_history`
--

INSERT INTO `tt_salary_history` (`id`, `id_user`, `cost`, `registration_date`) VALUES
(20, 15, 15000, '2017-03-01 00:00:00'),
(19, 15, 30000, '2017-01-01 00:00:00'),
(18, 5, 25000, '2017-02-01 00:00:00'),
(16, 2, 20000, '2017-01-01 00:00:00'),
(15, 11, 25000, '2017-01-01 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `tt_status`
--

CREATE TABLE `tt_status` (
  `id` int(11) NOT NULL,
  `status` varchar(50) COLLATE latin1_german1_ci NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

--
-- Dumping data for table `tt_status`
--

INSERT INTO `tt_status` (`id`, `status`) VALUES
(1, 'Presupuestado'),
(2, 'Aprobado'),
(3, 'Finalizado');

-- --------------------------------------------------------

--
-- Table structure for table `tt_subconcepts_billing`
--

CREATE TABLE `tt_subconcepts_billing` (
  `id` int(11) NOT NULL,
  `id_variable_concept` int(11) NOT NULL,
  `amount` float NOT NULL,
  `unit_budget` float NOT NULL,
  `price` float NOT NULL,
  `unit_real` float NOT NULL,
  `id_bill` int(11) NOT NULL,
  `name` varchar(300) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `tt_subconcepts_billing`
--

INSERT INTO `tt_subconcepts_billing` (`id`, `id_variable_concept`, `amount`, `unit_budget`, `price`, `unit_real`, `id_bill`, `name`) VALUES
(1, 416, 1, 2, 3, 0, 13, 'ssss'),
(2, 416, 1, 1, 4, 0, 13, 'Cuando necesitamos buscar filas Mysql que “contengan” determinada información, sin necesidad de coincidir exactamente, utilizamos el operador like con ayuda del operador “%”'),
(3, 416, 2, 3, 4, 0, 13, 'gimnasio'),
(4, 416, 1, 2, 2, 0, 14, 'aasdfaf'),
(5, 416, 1, 1, 4, 0, 14, 'Cuando necesitamos buscar filas Mysql que “contengan” determinada información, sin necesidad de coincidir exactamente, utilizamos el operador like con ayuda del operador “%”'),
(6, 416, 2, 3, 4, 0, 14, 'gimnasio'),
(7, 416, 1, 2, 2, 0, 15, 'aasdfaf'),
(8, 416, 1, 1, 4, 0, 15, 'Cuando necesitamos buscar filas Mysql que “contengan” determinada información, sin necesidad de coincidir exactamente, utilizamos el operador like con ayuda del operador “%”'),
(9, 416, 2, 3, 4, 0, 15, 'gimnasio'),
(10, 416, 1, 2, 2, 0, 16, 'aasdfaf'),
(11, 416, 1, 1, 4, 0, 16, 'Cuando necesitamos buscar filas Mysql que “contengan” determinada información, sin necesidad de coincidir exactamente, utilizamos el operador like con ayuda del operador “%”'),
(12, 416, 2, 3, 4, 0, 16, 'gimnasio'),
(13, 416, 1, 2, 2, 0, 17, 'aasdfaf'),
(14, 416, 1, 1, 4, 0, 17, 'Cuando necesitamos buscar filas Mysql que “contengan” determinada información, sin necesidad de coincidir exactamente, utilizamos el operador like con ayuda del operador “%”'),
(15, 416, 2, 3, 4, 0, 17, 'gimnasio'),
(16, 416, 1, 5, 4, 0, 18, 'aasdfaf'),
(17, 416, 1, 1, 4, 0, 18, 'Cuando necesitamos buscar filas Mysql que “contengan” determinada información, sin necesidad de coincidir exactamente, utilizamos el operador like con ayuda del operador “%”'),
(18, 416, 2, 3, 4, 0, 18, 'gimnasio'),
(19, 416, 1, 2, 2, 0, 19, 'aasdfaf'),
(20, 416, 1, 1, 4, 0, 19, 'Cuando necesitamos buscar filas Mysql que “contengan” determinada información, sin necesidad de coincidir exactamente, utilizamos el operador like con ayuda del operador “%”'),
(21, 416, 2, 3, 4, 0, 19, 'gimnasio'),
(22, 416, 1, 2, 2, 0, 20, 'aasdfaf'),
(23, 416, 1, 1, 4, 0, 20, 'Cuando necesitamos buscar filas Mysql que “contengan” determinada información, sin necesidad de coincidir exactamente, utilizamos el operador like con ayuda del operador “%”'),
(24, 416, 2, 3, 4, 0, 20, 'gimnasio'),
(25, 416, 1, 2, 2, 0, 21, 'aasdfaf'),
(26, 416, 1, 1, 4, 0, 21, 'Cuando necesitamos buscar filas Mysql que “contengan” determinada información, sin necesidad de coincidir exactamente, utilizamos el operador like con ayuda del operador “%”'),
(27, 416, 2, 3, 4, 0, 21, 'gimnasio'),
(28, 416, 2, 2, 3, 0, 22, 'aasdfaf'),
(29, 416, 1, 1, 4, 0, 22, 'Cuando necesitamos buscar filas Mysql que “contengan” determinada información, sin necesidad de coincidir exactamente, utilizamos el operador like con ayuda del operador “%”'),
(30, 416, 2, 3, 4, 0, 22, 'gimnasio'),
(31, 416, 2, 2, 2, 0, 23, 'aasdfaf'),
(32, 416, 1, 1, 4, 0, 23, 'Cuando necesitamos buscar filas Mysql que “contengan” determinada información, sin necesidad de coincidir exactamente, utilizamos el operador like con ayuda del operador “%”'),
(33, 416, 2, 3, 4, 0, 23, 'gimnasio');

-- --------------------------------------------------------

--
-- Table structure for table `tt_subconcepts_project`
--

CREATE TABLE `tt_subconcepts_project` (
  `id` int(11) NOT NULL,
  `id_variable_concept` int(11) NOT NULL,
  `amount` float NOT NULL,
  `unit_budget` float NOT NULL,
  `price` float NOT NULL,
  `unit_real` float NOT NULL,
  `id_project` int(11) NOT NULL,
  `name` varchar(300) COLLATE utf8_unicode_ci NOT NULL,
  `id_budget` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `tt_subconcepts_project`
--

INSERT INTO `tt_subconcepts_project` (`id`, `id_variable_concept`, `amount`, `unit_budget`, `price`, `unit_real`, `id_project`, `name`, `id_budget`) VALUES
(294, 416, 1, 2, 2, 10, 412, 'aasdfaf', 0),
(301, 416, 1, 1, 4, 15, 412, 'Cuando necesitamos buscar filas Mysql que “contengan” determinada información, sin necesidad de coincidir exactamente, utilizamos el operador like con ayuda del operador “%”', 0),
(307, 416, 2, 3, 4, 20, 412, 'gimnasio', 0),
(308, 416, 0, 0, 2.54, 0, 0, 'gimnasio', 11),
(309, 422, 0, 0, 0, 0, 412, 'ejemlo', 0);

-- --------------------------------------------------------

--
-- Table structure for table `tt_subconcepts_standards`
--

CREATE TABLE `tt_subconcepts_standards` (
  `id` int(11) NOT NULL,
  `description` varchar(300) COLLATE utf8_spanish_ci NOT NULL,
  `id_team` int(11) NOT NULL,
  `id_customer` int(11) NOT NULL,
  `unit_price` float NOT NULL,
  `id_company` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Dumping data for table `tt_subconcepts_standards`
--

INSERT INTO `tt_subconcepts_standards` (`id`, `description`, `id_team`, `id_customer`, `unit_price`, `id_company`) VALUES
(2, 'Cuando necesitamos buscar filas Mysql que “contengan” determinada información, sin necesidad de coincidir exactamente, utilizamos el operador like con ayuda del operador “%”', 54, 62, 4, 385),
(3, 'azafatos', 54, 62, 2, 385),
(4, 'gimnasio', 54, 62, 2.54, 385);

-- --------------------------------------------------------

--
-- Table structure for table `tt_subgroup`
--

CREATE TABLE `tt_subgroup` (
  `id` int(11) NOT NULL,
  `id_group` int(11) NOT NULL,
  `name` varchar(100) CHARACTER SET latin1 COLLATE latin1_spanish_ci NOT NULL,
  `id_company` varchar(50) COLLATE latin1_german1_ci NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

--
-- Dumping data for table `tt_subgroup`
--

INSERT INTO `tt_subgroup` (`id`, `id_group`, `name`, `id_company`) VALUES
(25, 416, 'Activaciones', '385'),
(24, 412, 'Producción', '385'),
(23, 414, 'Victor', '385'),
(22, 414, 'Jorge', '385'),
(21, 414, 'Javier', '385'),
(20, 414, 'Chema', '385'),
(19, 414, 'Resurección', '385'),
(18, 414, 'Maria', '385'),
(17, 414, 'Estefania', '385'),
(16, 414, 'Sara', '385'),
(26, 409, 'Fee', '385'),
(27, 408, 'Producción', '385'),
(28, 415, 'Mix', '385'),
(29, 402, 'Fee', '385'),
(30, 401, 'Producción', '385'),
(31, 403, 'Trade', '385'),
(32, 406, 'Experience', '385'),
(33, 407, 'Otros', '385'),
(34, 405, 'Plan DIgital', '385'),
(35, 404, 'Plan Salas', '385'),
(36, 417, 'Logistica', '385'),
(37, 418, 'Lux', '385'),
(38, 410, 'Fee', '385'),
(39, 411, 'Producción', '385'),
(40, 413, 'Varios', '385'),
(41, 416, 'Sara', '385'),
(42, 416, 'Estefania', '385'),
(43, 416, 'Maria', '385'),
(44, 416, 'Victor', '385'),
(45, 419, 'Eventos', '385'),
(46, 413, 'Shiseido', '385'),
(47, 420, 'Shiseido', '385');

-- --------------------------------------------------------

--
-- Table structure for table `tt_taxes_values`
--

CREATE TABLE `tt_taxes_values` (
  `id` int(11) NOT NULL,
  `value` float NOT NULL,
  `name` varchar(50) COLLATE utf8_spanish_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Dumping data for table `tt_taxes_values`
--

INSERT INTO `tt_taxes_values` (`id`, `value`, `name`) VALUES
(2, 10, 'reducido'),
(4, 4, '');

-- --------------------------------------------------------

--
-- Table structure for table `tt_team`
--

CREATE TABLE `tt_team` (
  `id` int(11) NOT NULL,
  `id_company` varchar(20) COLLATE latin1_german1_ci NOT NULL,
  `team_name` varchar(50) COLLATE latin1_german1_ci NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

--
-- Dumping data for table `tt_team`
--

INSERT INTO `tt_team` (`id`, `id_company`, `team_name`) VALUES
(1, '385', 'Equipo Admon'),
(2, '385', '2 Equipo Lucia'),
(57, '385', '1 Equipo Virginia'),
(56, '385', '3 Equipo Amaya'),
(58, '406', 'Alvaro');

-- --------------------------------------------------------

--
-- Table structure for table `tt_timetable`
--

CREATE TABLE `tt_timetable` (
  `id` int(11) NOT NULL,
  `day` varchar(15) COLLATE latin1_german1_ci NOT NULL,
  `hours_day` double NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

--
-- Dumping data for table `tt_timetable`
--

INSERT INTO `tt_timetable` (`id`, `day`, `hours_day`) VALUES
(1, 'Lunes', 8),
(2, 'Martes', 8),
(3, 'Miércoles', 8),
(4, 'Jueves', 8),
(5, 'Viernes', 5.5);

-- --------------------------------------------------------

--
-- Table structure for table `tt_user`
--

CREATE TABLE `tt_user` (
  `id` tinyint(4) NOT NULL,
  `nickname` varchar(50) CHARACTER SET latin1 COLLATE latin1_spanish_ci NOT NULL,
  `email` varchar(200) CHARACTER SET latin1 COLLATE latin1_spanish_ci NOT NULL,
  `password` varchar(50) CHARACTER SET latin1 COLLATE latin1_spanish_ci NOT NULL,
  `id_role` int(1) NOT NULL DEFAULT '2',
  `update_date` datetime NOT NULL,
  `status` int(11) NOT NULL DEFAULT '1' COMMENT '0: baja; 1:alta',
  `id_company` int(1) NOT NULL,
  `id_team` int(1) DEFAULT NULL,
  `last_id_company_logged` int(11) NOT NULL,
  `last_id_fiscal_year_logged` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

--
-- Dumping data for table `tt_user`
--

INSERT INTO `tt_user` (`id`, `nickname`, `email`, `password`, `id_role`, `update_date`, `status`, `id_company`, `id_team`, `last_id_company_logged`, `last_id_fiscal_year_logged`) VALUES
(1, 'Cristina Sanchez', 'cristina.sanchez@agenciatango.es', 'Tracker', 1, '0000-00-00 00:00:00', 1, 385, 54, 0, 0),
(3, 'Mariam Cuesta', 'mariam.cuesta@agenciatango.es', 'arte17', 2, '0000-00-00 00:00:00', 1, 385, 54, 0, 0),
(4, 'Enar Areces', 'enar.areces@agenciatango.es', 'tango17', 2, '0000-00-00 00:00:00', 0, 385, 54, 0, 0),
(5, 'Nazaret Perez', 'nazaret.perez@agenciatango.es', 'creativos17', 2, '0000-00-00 00:00:00', 1, 385, 54, 0, 0),
(6, 'Eduardo Sanchez', 'eduardo.sanchez@agenciatango.es', 'arte17', 2, '0000-00-00 00:00:00', 1, 385, 54, 0, 0),
(8, 'Reyes Rodriguez', 'reyes.rodriguez@agenciatango.es', 'creativos17', 2, '0000-00-00 00:00:00', 0, 385, 54, 0, 0),
(9, 'Pablo Castellano', 'pablo.castellano@agenciatango.es', 'arte17', 2, '0000-00-00 00:00:00', 1, 385, 54, 0, 0),
(10, 'Clara Hernandez', 'clara.hernandez@agenciatango.es', 'tango17', 2, '0000-00-00 00:00:00', 1, 385, 54, 0, 0),
(11, 'Sara Martin', 'sara.martin@agenciatango.es', 'creativos17', 2, '0000-00-00 00:00:00', 1, 385, 54, 0, 0),
(23, 'Sebastian Galeano', 'sebastian.galeano@agenciatango.es', 'tango17', 2, '2017-03-21 12:38:41', 1, 385, 54, 0, 0),
(13, 'super Admin', 'nitsuga1986@gmail.com', '1111', 3, '0000-00-00 00:00:00', 1, 385, 54, 385, 411),
(15, 'Laura Santiago', 'laur4sc@gmail.com', '1234', 2, '2017-01-02 00:00:00', 0, 385, 54, 0, 0),
(19, 'Jotha Julia', 'jotha@agenciatango.es', 'tango17', 2, '2017-01-24 18:19:55', 1, 385, 54, 0, 0),
(20, 'Beatriz Jaurata', 'beatriz.jaurata@agenciatango.es', 'arte17', 2, '2017-01-24 18:20:19', 0, 385, 54, 0, 0),
(24, 'Antonio Baeza', 'antonio.baeza@agenciatango.es', 'arte17', 2, '2017-03-21 12:39:05', 1, 385, 54, 0, 0),
(25, 'Sara Palacios', 'sara.palacios@agenciatango.es', 'tango17', 2, '2017-05-12 10:58:09', 1, 385, 54, 0, 0),
(26, 'Javier Bidezabal', 'javier.bidezabal@agenciatango.es', 'arte17', 2, '2017-05-12 11:01:28', 1, 385, 54, 0, 0),
(43, 'Administración', 'adm@a.es', '1234', 5, '0000-00-00 00:00:00', 1, 385, 55, 385, 406),
(62, 'Belen Galan', 'belen.galan@agenciatango.es', 'Claudia15', 4, '0000-00-00 00:00:00', 1, 385, 1, 385, 411),
(65, 'Noelma Martingil', 'noelma.martingil@agenciatango.es', 'Poza7602', 6, '0000-00-00 00:00:00', 1, 385, 57, 385, 411),
(61, 'Alvaro de Vicente', 'alvaro.devicente@agenciatango.es', 'Wada4310', 4, '0000-00-00 00:00:00', 1, 385, 1, 0, 0),
(44, 'Directivo', 'directivo@a.es', '1234', 4, '0000-00-00 00:00:00', 1, 385, 55, 385, 406),
(60, 'Amaya Benito', 'amaya.benito@agenciatango.es', 'Rozo1979', 6, '0000-00-00 00:00:00', 1, 385, 56, 0, 0),
(48, 'Super Admin', 'super@a.es', '1234', 3, '0000-00-00 00:00:00', 1, 385, 55, 385, 411),
(56, 'Alfonso Vicens', 'alfonso.vicens@agenciatango.es', '1234', 3, '0000-00-00 00:00:00', 1, 385, 1, 385, 411),
(58, 'Carmen Diaz', 'carmen.diaz@agenciatango.es', 'Quda0793', 4, '0000-00-00 00:00:00', 1, 385, 1, 0, 0),
(57, 'Andrea Balarin', 'andrea.bailarin@agenciatango.es', 'Baile1620', 6, '0000-00-00 00:00:00', 1, 385, 2, 385, 411),
(59, 'Aihnoa Ruiz', 'ainhoa.ruiz@agenciatango.es', 'Tango2017', 6, '0000-00-00 00:00:00', 1, 385, 1, 385, 411),
(64, 'Virginia Mena', 'virginia.mena@agenciatango.es', 'Jujo3170', 6, '0000-00-00 00:00:00', 1, 385, 57, 0, 0),
(63, 'Carmen Pina', 'carmen.pina@agenciatango.es', 'Qafu1772', 6, '0000-00-00 00:00:00', 1, 385, 57, 0, 0),
(66, 'Natalia Vara', 'natalia.vara@agenciatango.es', 'Juso2145', 6, '0000-00-00 00:00:00', 1, 385, 57, 385, 411),
(67, 'Rebeca Paradelo', 'rebeca.paradelo@agenciatango.es', 'Tango2016', 6, '0000-00-00 00:00:00', 1, 385, 57, 385, 411),
(68, 'Elena Wu', 'elena.wu@agenciatango.es', 'Casa7563', 6, '0000-00-00 00:00:00', 1, 385, 57, 0, 0),
(69, 'Maria Santos', 'maria.santos@agenciatango.es', 'Temporal1', 6, '0000-00-00 00:00:00', 1, 385, 57, 0, 0),
(70, 'Elena Sicilia', 'elena.sicilia@agenciatango.es', 'Vuyu7143', 6, '0000-00-00 00:00:00', 1, 385, 57, 385, 411),
(71, 'Alvaro de Azcarate', 'alvarodeazcarate@showsondemand.es', 'Alvaro2020', 4, '0000-00-00 00:00:00', 1, 406, 58, 406, 415),
(72, 'Lucia Gomez', 'lucia.gomez@agenciatango.es', 'Zawu2541', 6, '0000-00-00 00:00:00', 1, 385, 2, 385, 411);

-- --------------------------------------------------------

--
-- Table structure for table `tt_user_hours`
--

CREATE TABLE `tt_user_hours` (
  `id` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `id_campaign` int(11) NOT NULL,
  `update_date` datetime NOT NULL,
  `sum_hours` int(11) NOT NULL COMMENT 'suma de los minutos de hora inicio y fin'
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

--
-- Dumping data for table `tt_user_hours`
--

INSERT INTO `tt_user_hours` (`id`, `id_user`, `date`, `start_time`, `end_time`, `id_campaign`, `update_date`, `sum_hours`) VALUES
(200, 6, '2017-01-30', '15:00:00', '19:00:00', 185, '2017-02-06 19:20:15', 240),
(203, 7, '2017-01-31', '11:30:00', '19:00:00', 185, '2017-02-07 18:23:58', 450),
(202, 6, '2017-01-31', '12:00:00', '14:00:00', 185, '2017-02-07 00:00:00', 120),
(201, 6, '2017-01-30', '11:00:00', '12:00:00', 130, '2017-02-06 19:22:12', 60),
(157, 2, '2017-01-13', '14:00:00', '14:30:00', 104, '2017-01-13 14:34:20', 30),
(156, 2, '2017-01-13', '13:00:00', '13:30:00', 119, '2017-01-13 14:33:54', 30),
(155, 2, '2017-01-13', '10:31:00', '12:17:00', 119, '2017-01-13 12:17:50', 106),
(154, 2, '2017-01-13', '09:15:00', '10:30:00', 112, '2017-01-13 10:31:18', 75),
(153, 2, '2017-01-12', '15:00:00', '18:15:00', 112, '2017-01-12 18:50:47', 195),
(152, 2, '2017-01-12', '09:15:00', '14:00:00', 112, '2017-01-12 15:29:26', 285),
(151, 2, '2017-01-11', '15:00:00', '18:15:00', 112, '2017-01-12 09:16:30', 195),
(150, 2, '2017-01-11', '09:15:00', '14:00:00', 112, '2017-01-12 09:16:03', 285),
(149, 2, '2017-01-10', '15:45:00', '19:00:00', 112, '2017-01-11 10:11:20', 195),
(148, 2, '2017-01-10', '11:00:00', '14:00:00', 119, '2017-01-11 00:00:00', 180),
(147, 2, '2017-01-10', '09:15:00', '11:00:00', 104, '2017-01-11 10:09:26', 105),
(146, 2, '2017-01-09', '15:00:00', '18:15:00', 104, '2017-01-11 10:08:53', 195),
(145, 2, '2017-01-09', '09:15:00', '14:00:00', 104, '2017-01-11 10:08:02', 285),
(143, 3, '2017-01-04', '15:30:00', '18:30:00', 111, '2017-01-05 09:25:32', 180),
(142, 3, '2017-01-04', '09:23:00', '14:00:00', 111, '2017-01-05 09:23:43', 277),
(141, 3, '2017-01-03', '15:30:00', '19:00:00', 111, '2017-01-05 00:00:00', 210),
(140, 3, '2017-01-03', '13:00:00', '14:00:00', 82, '2017-01-05 09:18:44', 60),
(139, 3, '2017-01-03', '09:30:00', '12:30:00', 4, '2017-01-05 09:17:11', 180),
(138, 3, '2017-01-02', '15:30:00', '18:30:00', 111, '2017-01-05 09:15:57', 180),
(137, 3, '2017-01-02', '11:00:00', '14:00:00', 111, '2017-01-05 09:13:04', 180),
(136, 3, '2017-01-02', '09:11:00', '11:00:00', 82, '2017-01-05 09:12:17', 109),
(134, 2, '2017-01-04', '09:15:00', '14:00:00', 98, '2017-01-04 17:08:38', 285),
(135, 2, '2017-01-04', '15:00:00', '18:15:00', 98, '2017-01-04 19:09:22', 195),
(124, 6, '2017-01-03', '13:00:00', '14:00:00', 100, '2017-01-03 00:00:00', 60),
(125, 6, '2017-01-03', '15:00:00', '16:00:00', 100, '2017-01-03 16:52:49', 60),
(122, 6, '2017-01-02', '09:15:00', '12:00:00', 71, '2017-01-03 16:48:34', 165),
(121, 11, '2017-01-02', '09:15:00', '14:00:00', 3, '2017-01-03 16:44:35', 285),
(120, 6, '2017-01-02', '16:00:00', '18:45:00', 100, '2017-01-03 16:41:51', 165),
(111, 2, '2017-01-02', '15:00:00', '16:44:00', 3, '2017-01-02 16:44:36', 104),
(110, 2, '2017-01-02', '09:15:00', '14:00:00', 3, '2017-01-02 16:43:59', 285),
(109, 4, '2017-01-02', '09:30:00', '14:00:00', 82, '2017-01-02 16:36:37', 270),
(119, 2, '2017-01-03', '09:15:00', '13:00:00', 15, '2017-01-03 13:11:15', 225),
(198, 6, '2017-02-06', '15:00:00', '18:15:00', 130, '2017-02-06 19:14:40', 195),
(197, 6, '2017-02-02', '15:00:00', '17:00:00', 102, '2017-02-06 17:30:46', 120),
(196, 6, '2017-02-02', '12:00:00', '14:00:00', 102, '2017-02-06 17:29:29', 120),
(199, 6, '2017-01-30', '12:00:00', '14:00:00', 185, '2017-02-06 19:19:23', 120),
(206, 7, '2017-02-07', '09:30:00', '14:00:00', 102, '2017-02-07 18:26:06', 270),
(204, 6, '2017-01-31', '09:30:00', '12:00:00', 130, '2017-02-07 00:00:00', 150),
(205, 7, '2017-01-31', '09:30:00', '10:00:00', 130, '2017-02-07 18:25:28', 30),
(195, 6, '2017-02-06', '09:15:00', '14:00:00', 130, '2017-02-06 00:00:00', 285),
(177, 7, '2017-01-17', '09:15:00', '14:00:00', 102, '2017-01-24 12:29:46', 285),
(178, 7, '2017-01-17', '15:00:00', '18:15:00', 102, '2017-01-24 12:30:50', 195),
(180, 7, '2017-01-18', '09:30:00', '12:30:00', 130, '2017-01-24 12:45:30', 180),
(181, 7, '2017-01-18', '12:30:00', '14:00:00', 102, '2017-01-24 12:47:13', 90),
(182, 7, '2017-01-18', '15:00:00', '18:30:00', 102, '2017-01-24 12:48:06', 210),
(183, 7, '2017-01-19', '09:30:00', '14:00:00', 102, '2017-01-24 12:57:22', 270),
(184, 7, '2017-01-19', '15:00:00', '18:30:00', 102, '2017-01-24 12:57:46', 210),
(185, 7, '2017-01-20', '09:30:00', '15:00:00', 102, '2017-01-24 12:58:37', 330),
(186, 8, '2017-01-24', '12:00:00', '16:00:00', 86, '2017-01-24 15:53:26', 240),
(187, 8, '2017-01-24', '09:15:00', '12:00:00', 24, '2017-01-24 15:54:16', 165),
(188, 2, '2017-01-24', '10:00:00', '14:00:00', 104, '2017-01-24 00:00:00', 240),
(189, 2, '2017-01-24', '15:00:00', '17:53:00', 104, '2017-01-24 17:53:23', 173),
(191, 2, '2017-01-25', '09:15:00', '17:00:00', 104, '2017-01-26 00:00:00', 465),
(192, 2, '2017-01-26', '09:15:00', '11:00:00', 112, '2017-01-26 18:54:35', 105),
(193, 2, '2017-01-26', '11:00:00', '17:15:00', 104, '2017-01-26 00:00:00', 375),
(207, 7, '2017-02-07', '15:00:00', '15:30:00', 130, '2017-02-07 18:26:36', 30),
(208, 7, '2017-02-07', '15:30:00', '18:30:00', 102, '2017-02-07 18:26:57', 180),
(209, 7, '2017-02-01', '09:30:00', '14:00:00', 185, '2017-02-07 18:28:42', 270),
(210, 6, '2017-01-31', '15:00:00', '18:30:00', 130, '2017-02-07 18:28:53', 210),
(211, 7, '2017-02-01', '15:00:00', '16:00:00', 185, '2017-02-07 18:29:18', 60),
(212, 7, '2017-02-01', '16:00:00', '17:00:00', 130, '2017-02-07 18:29:45', 60),
(213, 7, '2017-02-01', '17:00:00', '18:30:00', 185, '2017-02-07 18:30:05', 90),
(214, 7, '2017-02-02', '09:30:00', '13:00:00', 102, '2017-02-07 18:31:28', 210),
(215, 7, '2017-02-02', '13:00:00', '14:00:00', 130, '2017-02-07 18:31:45', 60),
(216, 6, '2017-02-07', '09:30:00', '16:00:00', 130, '2017-02-07 18:31:56', 390),
(217, 7, '2017-02-02', '15:00:00', '18:30:00', 185, '2017-02-07 18:32:01', 210),
(220, 7, '2017-02-03', '09:30:00', '15:00:00', 121, '2017-02-07 18:33:55', 330),
(219, 6, '2017-02-07', '17:00:00', '18:30:00', 130, '2017-02-07 18:33:41', 90),
(221, 8, '2017-02-06', '09:30:00', '14:00:00', 157, '2017-02-07 18:50:12', 270),
(222, 8, '2017-02-06', '15:00:00', '18:30:00', 157, '2017-02-07 18:51:04', 210),
(223, 8, '2017-02-07', '09:30:00', '16:30:00', 157, '2017-02-07 18:51:33', 420),
(224, 8, '2017-02-07', '17:00:00', '18:00:00', 189, '2017-02-07 18:52:10', 60),
(225, 4, '2017-02-07', '09:30:00', '14:00:00', 140, '2017-02-07 18:53:23', 270),
(229, 6, '2017-02-01', '15:00:00', '16:30:00', 130, '2017-02-07 18:58:56', 90),
(228, 6, '2017-02-01', '09:30:00', '14:00:00', 185, '2017-02-07 18:56:49', 270),
(232, 6, '2017-02-01', '16:30:00', '18:30:00', 185, '2017-02-07 19:00:26', 120),
(231, 4, '2017-02-07', '15:30:00', '18:45:00', 127, '2017-02-07 18:58:56', 195),
(233, 2, '2017-02-07', '09:15:00', '14:15:00', 104, '2017-02-08 11:23:33', 300),
(234, 2, '2017-02-07', '15:00:00', '17:00:00', 104, '2017-02-08 11:24:04', 120),
(235, 2, '2017-02-07', '17:00:00', '17:30:00', 112, '2017-02-08 11:24:41', 30),
(236, 2, '2017-02-07', '17:30:00', '18:00:00', 104, '2017-02-08 00:00:00', 30),
(237, 2, '2017-02-08', '10:00:00', '11:00:00', 185, '2017-02-08 11:26:05', 60),
(238, 2, '2017-02-08', '09:30:00', '10:00:00', 104, '2017-02-08 11:26:22', 30),
(239, 2, '2017-02-08', '11:00:00', '11:40:00', 104, '2017-02-08 11:39:43', 40),
(240, 2, '2017-02-08', '11:40:00', '12:20:00', 104, '2017-02-08 12:20:40', 40),
(241, 4, '2017-02-08', '09:30:00', '13:30:00', 127, '2017-02-08 15:30:55', 240),
(242, 8, '2017-02-08', '10:00:00', '13:00:00', 157, '2017-02-08 18:48:19', 180),
(243, 4, '2017-02-08', '15:00:00', '17:00:00', 197, '2017-02-09 09:35:23', 120),
(266, 2, '2017-02-08', '15:00:00', '18:30:00', 185, '2017-02-09 00:00:00', 210),
(245, 4, '2017-02-06', '09:30:00', '14:00:00', 127, '2017-02-09 11:05:26', 270),
(246, 3, '2017-02-02', '11:00:00', '13:30:00', 177, '2017-02-09 11:05:52', 150),
(247, 4, '2017-02-06', '17:30:00', '18:45:00', 127, '2017-02-09 11:06:02', 75),
(248, 4, '2017-02-06', '15:00:00', '16:30:00', 140, '2017-02-09 11:06:27', 90),
(249, 3, '2017-02-02', '10:00:00', '11:00:00', 20, '2017-02-09 11:07:52', 60),
(253, 3, '2017-02-03', '10:00:00', '12:00:00', 177, '2017-02-09 11:14:15', 120),
(252, 3, '2017-02-02', '15:00:00', '19:00:00', 127, '2017-02-09 11:13:42', 240),
(254, 3, '2017-02-03', '12:00:00', '14:00:00', 127, '2017-02-09 11:14:38', 120),
(255, 3, '2017-02-03', '14:10:00', '15:00:00', 20, '2017-02-09 11:15:34', 50),
(256, 3, '2017-02-06', '09:30:00', '14:00:00', 177, '2017-02-09 11:16:27', 270),
(257, 3, '2017-02-06', '15:00:00', '16:00:00', 127, '2017-02-09 11:17:10', 60),
(258, 3, '2017-02-06', '17:00:00', '19:00:00', 177, '2017-02-09 11:17:33', 120),
(259, 3, '2017-02-07', '09:30:00', '14:00:00', 177, '2017-02-09 11:18:04', 270),
(260, 3, '2017-02-07', '15:00:00', '18:30:00', 177, '2017-02-09 11:18:46', 210),
(261, 3, '2017-02-08', '09:30:00', '14:00:00', 177, '2017-02-09 11:19:26', 270),
(262, 3, '2017-02-08', '17:00:00', '18:30:00', 177, '2017-02-09 11:19:45', 90),
(263, 3, '2017-02-08', '15:00:00', '17:00:00', 127, '2017-02-09 11:20:05', 120),
(264, 3, '2017-02-09', '09:30:00', '14:00:00', 127, '2017-02-09 11:20:39', 270),
(265, 2, '2017-02-08', '12:30:00', '14:00:00', 185, '2017-02-09 16:11:12', 90),
(267, 4, '2017-02-08', '17:15:00', '18:45:00', 127, '2017-02-09 16:12:03', 90),
(268, 2, '2017-02-09', '09:15:00', '14:00:00', 185, '2017-02-09 16:13:20', 285),
(269, 4, '2017-02-09', '09:30:00', '14:00:00', 90, '2017-02-09 16:23:27', 270),
(270, 7, '2017-02-08', '09:30:00', '14:00:00', 183, '2017-02-10 09:48:57', 270),
(271, 7, '2017-02-08', '15:00:00', '17:00:00', 130, '2017-02-10 09:49:13', 120),
(272, 7, '2017-02-08', '17:00:00', '18:30:00', 198, '2017-02-10 09:52:48', 90),
(273, 7, '2017-02-09', '09:30:00', '14:00:00', 185, '2017-02-10 09:53:24', 270),
(274, 7, '2017-02-09', '15:00:00', '16:30:00', 198, '2017-02-10 09:53:41', 90),
(275, 7, '2017-02-09', '16:30:00', '18:30:00', 185, '2017-02-10 09:54:01', 120),
(276, 4, '2017-02-09', '15:30:00', '18:45:00', 127, '2017-02-10 14:37:24', 195),
(277, 4, '2017-02-10', '09:30:00', '10:30:00', 90, '2017-02-10 14:37:56', 60),
(278, 4, '2017-02-10', '12:00:00', '13:45:00', 177, '2017-02-10 14:42:06', 105),
(279, 4, '2017-02-10', '13:45:00', '15:00:00', 140, '2017-02-10 15:09:18', 75),
(280, 8, '2017-02-08', '15:00:00', '16:45:00', 197, '2017-02-10 15:34:06', 105),
(281, 8, '2017-02-08', '13:00:00', '14:00:00', 53, '2017-02-10 00:00:00', 60),
(282, 8, '2017-02-09', '15:00:00', '18:45:00', 197, '2017-02-10 15:35:19', 225),
(283, 8, '2017-02-09', '13:00:00', '14:00:00', 130, '2017-02-10 15:36:23', 60),
(284, 8, '2017-02-09', '11:00:00', '13:00:00', 130, '2017-02-10 15:37:33', 120),
(285, 8, '2017-02-09', '10:00:00', '11:00:00', 157, '2017-02-10 15:38:27', 60),
(286, 8, '2017-02-10', '09:15:00', '14:00:00', 130, '2017-02-10 15:39:13', 285),
(287, 6, '2017-02-08', '09:30:00', '14:00:00', 130, '2017-02-10 15:43:07', 270),
(288, 6, '2017-02-08', '15:00:00', '18:30:00', 183, '2017-02-10 15:43:54', 210),
(289, 20, '2017-02-13', '09:30:00', '14:00:00', 157, '2017-02-13 18:12:42', 270),
(290, 20, '2017-02-13', '15:00:00', '18:30:00', 197, '2017-02-13 18:15:42', 210),
(291, 3, '2017-02-13', '17:00:00', '17:30:00', 184, '2017-02-14 10:37:27', 30),
(292, 3, '2017-02-13', '10:00:00', '14:00:00', 127, '2017-02-14 10:42:06', 240),
(293, 3, '2017-02-13', '18:00:00', '19:00:00', 20, '2017-02-14 10:42:57', 60),
(294, 3, '2017-02-13', '15:30:00', '17:00:00', 210, '2017-02-14 10:43:58', 90),
(295, 8, '2017-02-13', '15:00:00', '18:45:00', 197, '2017-02-14 11:42:58', 225),
(296, 8, '2017-02-13', '09:20:00', '11:00:00', 58, '2017-02-14 00:00:00', 100),
(297, 8, '2017-02-13', '11:00:00', '13:30:00', 157, '2017-02-14 11:44:32', 150),
(298, 8, '2017-02-14', '09:20:00', '11:40:00', 197, '2017-02-14 11:44:58', 140),
(299, 20, '2017-02-14', '09:30:00', '10:30:00', 53, '2017-02-14 11:50:37', 60),
(300, 20, '2017-02-14', '10:30:00', '14:00:00', 157, '2017-02-14 13:14:16', 210),
(301, 20, '2017-02-10', '09:30:00', '15:00:00', 157, '2017-02-14 13:15:12', 330),
(302, 20, '2017-02-09', '09:15:00', '14:00:00', 53, '2017-02-14 16:02:01', 285),
(303, 20, '2017-02-09', '15:00:00', '18:00:00', 53, '2017-02-14 16:02:38', 180),
(304, 4, '2017-02-14', '09:30:00', '13:30:00', 127, '2017-02-14 16:50:35', 240),
(305, 4, '2017-02-14', '13:30:00', '14:00:00', 203, '2017-02-14 16:52:52', 30),
(306, 4, '2017-02-14', '15:00:00', '16:00:00', 203, '2017-02-14 16:53:05', 60),
(307, 20, '2017-02-14', '15:00:00', '18:30:00', 183, '2017-02-14 16:58:38', 210),
(308, 4, '2017-02-14', '16:00:00', '16:30:00', 177, '2017-02-14 17:06:28', 30),
(309, 4, '2017-02-14', '16:30:00', '17:30:00', 127, '2017-02-14 18:19:50', 60),
(310, 4, '2017-02-14', '17:30:00', '18:30:00', 140, '2017-02-14 18:20:21', 60),
(311, 2, '2017-02-09', '15:00:00', '18:15:00', 185, '2017-02-15 10:38:58', 195),
(312, 2, '2017-02-10', '09:15:00', '14:30:00', 185, '2017-02-15 10:39:59', 315),
(313, 2, '2017-02-13', '09:15:00', '17:00:00', 185, '2017-02-15 00:00:00', 465),
(314, 2, '2017-02-14', '09:15:00', '14:00:00', 185, '2017-02-15 00:00:00', 285),
(315, 8, '2017-02-15', '09:30:00', '12:00:00', 177, '2017-02-15 18:09:33', 150),
(316, 8, '2017-02-15', '12:30:00', '14:00:00', 183, '2017-02-15 18:10:12', 90),
(317, 8, '2017-02-15', '15:30:00', '18:45:00', 184, '2017-02-15 18:10:36', 195),
(318, 4, '2017-02-15', '10:00:00', '12:00:00', 177, '2017-02-15 19:02:09', 120),
(319, 4, '2017-02-15', '12:00:00', '14:00:00', 127, '2017-02-15 19:02:21', 120),
(320, 4, '2017-02-15', '15:00:00', '16:30:00', 203, '2017-02-15 19:02:45', 90),
(322, 4, '2017-02-15', '16:30:00', '18:45:00', 177, '2017-02-15 19:04:05', 135),
(323, 3, '2017-02-14', '15:00:00', '18:30:00', 212, '2017-02-16 13:11:57', 210),
(324, 3, '2017-02-14', '09:30:00', '12:00:00', 210, '2017-02-16 13:12:21', 150),
(325, 3, '2017-02-14', '12:00:00', '14:00:00', 20, '2017-02-16 13:13:02', 120),
(326, 3, '2017-02-15', '15:00:00', '18:30:00', 214, '2017-02-16 13:13:45', 210),
(327, 3, '2017-02-15', '09:30:00', '12:30:00', 127, '2017-02-16 13:14:06', 180),
(328, 3, '2017-02-15', '12:30:00', '14:00:00', 20, '2017-02-16 13:14:28', 90),
(329, 6, '2017-02-09', '09:30:00', '14:00:00', 130, '2017-02-16 18:12:30', 270),
(330, 6, '2017-02-09', '15:00:00', '18:30:00', 185, '2017-02-16 00:00:00', 210),
(331, 6, '2017-02-16', '09:15:00', '14:00:00', 130, '2017-02-16 00:00:00', 285),
(332, 6, '2017-02-16', '15:00:00', '18:15:00', 102, '2017-02-16 18:21:21', 195),
(333, 6, '2017-02-10', '09:30:00', '15:00:00', 185, '2017-02-16 00:00:00', 330),
(334, 4, '2017-02-16', '09:30:00', '11:00:00', 177, '2017-02-17 12:52:25', 90),
(335, 4, '2017-02-16', '11:00:00', '14:00:00', 127, '2017-02-17 12:52:41', 180),
(336, 4, '2017-02-16', '15:00:00', '16:30:00', 127, '2017-02-17 12:53:17', 90),
(338, 4, '2017-02-16', '16:30:00', '17:15:00', 197, '2017-02-17 12:55:00', 45),
(339, 4, '2017-02-16', '17:30:00', '18:45:00', 140, '2017-02-17 00:00:00', 75),
(340, 4, '2017-02-17', '09:30:00', '11:30:00', 140, '2017-02-17 12:56:42', 120),
(341, 4, '2017-02-17', '11:30:00', '14:00:00', 127, '2017-02-17 14:08:40', 150),
(344, 6, '2017-02-13', '10:00:00', '14:00:00', 183, '2017-02-17 15:38:26', 240),
(345, 6, '2017-02-13', '15:00:00', '19:00:00', 214, '2017-02-17 15:41:22', 240),
(346, 3, '2017-02-16', '15:00:00', '18:30:00', 214, '2017-02-20 15:33:21', 210),
(347, 3, '2017-02-16', '09:30:00', '14:00:00', 210, '2017-02-20 15:34:58', 270),
(348, 3, '2017-02-17', '09:30:00', '15:00:00', 214, '2017-02-20 15:35:41', 330),
(350, 3, '2017-02-20', '09:30:00', '14:00:00', 214, '2017-02-23 09:37:15', 270),
(351, 3, '2017-02-20', '15:30:00', '16:30:00', 127, '2017-02-23 09:38:02', 60),
(352, 3, '2017-02-20', '16:30:00', '17:30:00', 183, '2017-02-23 09:38:23', 60),
(353, 4, '2017-02-20', '09:30:00', '10:30:00', 197, '2017-02-23 09:53:48', 60),
(354, 4, '2017-02-20', '12:30:00', '14:00:00', 127, '2017-02-23 09:56:52', 90),
(355, 4, '2017-02-20', '16:00:00', '17:30:00', 183, '2017-02-23 09:57:32', 90),
(357, 4, '2017-02-21', '09:30:00', '10:30:00', 127, '2017-02-23 10:07:45', 60),
(358, 4, '2017-02-21', '15:00:00', '17:30:00', 183, '2017-02-23 10:10:25', 150),
(360, 15, '2017-02-13', '10:00:00', '17:00:00', 227, '2017-02-23 00:00:00', 420),
(361, 15, '2017-02-14', '10:00:00', '13:00:00', 227, '2017-02-23 12:09:29', 180),
(363, 15, '2017-02-01', '10:00:00', '18:00:00', 227, '2017-02-23 19:22:21', 480),
(364, 15, '2017-02-02', '10:00:00', '12:00:00', 227, '2017-02-23 19:22:42', 120),
(481, 5, '2017-03-07', '09:30:00', '14:00:00', 187, '2017-03-10 15:15:22', 270),
(480, 5, '2017-03-06', '15:00:00', '18:30:00', 187, '2017-03-10 15:15:05', 210),
(478, 11, '2017-03-10', '14:30:00', '15:00:00', 104, '2017-03-10 14:55:13', 30),
(479, 5, '2017-03-06', '09:30:00', '14:00:00', 187, '2017-03-10 15:14:37', 270),
(477, 11, '2017-03-10', '09:30:00', '14:30:00', 187, '2017-03-10 14:54:32', 300),
(475, 11, '2017-03-09', '09:30:00', '14:00:00', 187, '2017-03-10 14:53:14', 270),
(476, 11, '2017-03-09', '15:00:00', '18:30:00', 187, '2017-03-10 14:53:27', 210),
(474, 11, '2017-03-08', '15:00:00', '18:30:00', 187, '2017-03-10 14:52:40', 210),
(473, 11, '2017-03-08', '09:30:00', '14:00:00', 187, '2017-03-10 14:52:22', 270),
(482, 5, '2017-03-07', '15:00:00', '18:30:00', 187, '2017-03-10 15:15:41', 210),
(471, 11, '2017-03-07', '09:30:00', '14:00:00', 187, '2017-03-10 14:51:27', 270),
(470, 11, '2017-03-06', '15:00:00', '18:30:00', 187, '2017-03-10 14:50:56', 210),
(472, 11, '2017-03-07', '15:00:00', '18:30:00', 187, '2017-03-10 14:51:58', 210),
(468, 11, '2017-03-06', '09:30:00', '14:00:00', 187, '2017-03-10 14:49:50', 270),
(379, 15, '2017-02-21', '10:00:00', '11:00:00', 227, '2017-02-23 19:41:32', 60),
(380, 15, '2017-02-21', '11:00:00', '12:00:00', 227, '2017-02-23 19:41:40', 60),
(381, 15, '2017-02-21', '12:00:00', '13:00:00', 227, '2017-02-23 19:41:49', 60),
(382, 15, '2017-02-21', '13:00:00', '14:00:00', 227, '2017-02-23 19:41:58', 60),
(383, 15, '2017-02-21', '14:00:00', '15:00:00', 227, '2017-02-23 19:42:06', 60),
(385, 4, '2017-02-22', '09:30:00', '12:30:00', 127, '2017-02-24 10:41:25', 180),
(386, 4, '2017-02-22', '15:00:00', '16:30:00', 183, '2017-02-24 10:49:00', 90),
(387, 4, '2017-02-22', '16:30:00', '17:30:00', 127, '2017-02-24 10:50:36', 60),
(388, 4, '2017-02-23', '09:30:00', '13:00:00', 127, '2017-02-24 10:51:53', 210),
(389, 4, '2017-02-23', '13:00:00', '14:00:00', 183, '2017-02-24 00:00:00', 60),
(390, 4, '2017-02-23', '16:00:00', '18:00:00', 127, '2017-02-24 10:52:41', 120),
(391, 4, '2017-02-23', '18:00:00', '18:45:00', 187, '2017-02-24 10:53:24', 45),
(392, 4, '2017-02-22', '12:30:00', '14:00:00', 187, '2017-02-24 10:56:03', 90),
(393, 3, '2017-02-21', '09:30:00', '09:40:00', 184, '2017-02-24 11:23:29', 10),
(394, 3, '2017-02-21', '09:45:00', '13:30:00', 210, '2017-02-24 11:24:43', 225),
(395, 3, '2017-02-21', '15:00:00', '16:30:00', 127, '2017-02-24 11:25:23', 90),
(396, 3, '2017-02-21', '13:30:00', '14:00:00', 104, '2017-02-24 11:26:53', 30),
(397, 3, '2017-02-21', '16:30:00', '18:30:00', 183, '2017-02-24 11:28:13', 120),
(398, 3, '2017-02-22', '09:30:00', '10:00:00', 184, '2017-02-24 11:28:48', 30),
(399, 3, '2017-02-22', '10:00:00', '10:30:00', 53, '2017-02-24 11:29:09', 30),
(400, 3, '2017-02-22', '10:30:00', '14:00:00', 210, '2017-02-24 11:29:37', 210),
(401, 3, '2017-02-22', '15:00:00', '16:00:00', 183, '2017-02-24 11:30:04', 60),
(402, 3, '2017-02-23', '09:30:00', '11:00:00', 183, '2017-02-24 11:31:30', 90),
(403, 3, '2017-02-23', '11:00:00', '14:00:00', 210, '2017-02-24 11:31:54', 180),
(404, 3, '2017-02-23', '16:00:00', '19:00:00', 127, '2017-02-24 11:32:27', 180),
(405, 9, '2017-02-22', '09:15:00', '14:00:00', 185, '2017-03-01 10:54:05', 285),
(406, 9, '2017-02-23', '15:00:00', '18:45:00', 241, '2017-03-01 00:00:00', 225),
(407, 9, '2017-03-23', '09:15:00', '14:00:00', 185, '2017-03-01 10:55:47', 285),
(408, 9, '2017-02-24', '09:15:00', '14:00:00', 241, '2017-03-01 10:57:36', 285),
(409, 9, '2017-03-24', '09:15:00', '14:00:00', 241, '2017-03-01 10:58:42', 285),
(410, 9, '2017-03-23', '15:30:00', '18:45:00', 241, '2017-03-01 10:59:11', 195),
(411, 4, '2017-02-27', '09:30:00', '14:00:00', 127, '2017-03-02 00:00:00', 270),
(412, 4, '2017-02-27', '15:00:00', '18:30:00', 127, '2017-03-02 20:00:58', 210),
(413, 4, '2017-02-28', '09:30:00', '14:00:00', 127, '2017-03-02 20:01:44', 270),
(414, 4, '2017-02-28', '15:00:00', '16:30:00', 183, '2017-03-03 00:00:00', 90),
(415, 4, '2017-02-28', '16:30:00', '17:00:00', 127, '2017-03-02 20:03:23', 30),
(416, 4, '2017-02-28', '17:00:00', '18:30:00', 183, '2017-03-02 20:03:44', 90),
(417, 4, '2017-03-01', '09:30:00', '13:30:00', 183, '2017-03-02 20:04:17', 240),
(418, 4, '2017-03-01', '15:30:00', '18:30:00', 127, '2017-03-02 20:06:58', 180),
(419, 4, '2017-03-02', '09:30:00', '14:00:00', 127, '2017-03-02 20:07:25', 270),
(420, 4, '2017-03-02', '15:00:00', '16:00:00', 183, '2017-03-02 20:10:16', 60),
(421, 2, '2017-02-27', '09:30:00', '14:00:00', 112, '2017-03-03 00:00:00', 270),
(422, 2, '2017-02-27', '15:00:00', '16:00:00', 120, '2017-03-03 13:24:54', 60),
(423, 2, '2017-02-27', '16:00:00', '18:00:00', 112, '2017-03-03 00:00:00', 120),
(424, 2, '2017-02-28', '09:00:00', '09:30:00', 104, '2017-03-03 13:27:45', 30),
(425, 2, '2017-02-28', '09:30:00', '14:00:00', 185, '2017-03-03 13:28:32', 270),
(426, 2, '2017-02-28', '15:00:00', '15:30:00', 233, '2017-03-03 00:00:00', 30),
(427, 2, '2017-02-28', '15:30:00', '18:00:00', 112, '2017-03-03 13:30:34', 150),
(428, 2, '2017-03-01', '09:15:00', '12:00:00', 112, '2017-03-03 13:31:42', 165),
(429, 2, '2017-03-02', '09:15:00', '17:00:00', 112, '2017-03-03 00:00:00', 465),
(430, 2, '2017-03-03', '09:15:00', '10:15:00', 117, '2017-03-03 00:00:00', 60),
(431, 4, '2017-03-03', '09:30:00', '11:30:00', 197, '2017-03-03 15:08:12', 120),
(432, 4, '2017-03-03', '11:30:00', '12:30:00', 183, '2017-03-03 15:08:32', 60),
(433, 4, '2017-03-03', '12:30:00', '15:00:00', 127, '2017-03-03 15:08:51', 150),
(447, 3, '2017-03-02', '09:30:00', '14:00:00', 127, '2017-03-03 15:19:17', 270),
(435, 3, '2017-02-28', '09:30:00', '11:30:00', 183, '2017-03-03 00:00:00', 120),
(436, 3, '2017-02-28', '11:30:00', '14:00:00', 127, '2017-03-03 15:12:35', 150),
(439, 3, '2017-02-28', '15:30:00', '18:30:00', 127, '2017-03-03 15:15:16', 180),
(450, 11, '2017-02-27', '09:30:00', '14:00:00', 187, '2017-03-03 15:20:08', 270),
(442, 3, '2017-02-27', '09:30:00', '11:00:00', 183, '2017-03-03 15:15:45', 90),
(443, 3, '2017-03-08', '09:30:00', '14:00:00', 127, '2017-03-10 00:00:00', 270),
(444, 3, '2017-03-01', '11:30:00', '14:00:00', 183, '2017-03-03 15:17:09', 150),
(445, 3, '2017-03-01', '17:00:00', '18:30:00', 183, '2017-03-03 15:17:40', 90),
(446, 3, '2017-03-01', '15:00:00', '17:00:00', 197, '2017-03-03 15:18:38', 120),
(449, 3, '2017-03-03', '10:00:00', '15:00:00', 183, '2017-03-03 15:19:37', 300),
(451, 5, '2017-03-03', '09:30:00', '15:00:00', 187, '2017-03-03 15:20:23', 330),
(452, 11, '2017-02-27', '15:00:00', '18:30:00', 187, '2017-03-03 15:20:34', 210),
(453, 11, '2017-02-28', '09:30:00', '14:00:00', 187, '2017-03-03 15:20:54', 270),
(454, 5, '2017-02-27', '09:30:00', '14:00:00', 187, '2017-03-03 00:00:00', 270),
(455, 11, '2017-02-28', '15:00:00', '18:30:00', 187, '2017-03-03 15:21:15', 210),
(456, 11, '2017-03-01', '09:30:00', '15:00:00', 187, '2017-03-03 15:21:49', 330),
(457, 11, '2017-03-01', '16:00:00', '18:30:00', 187, '2017-03-03 15:22:25', 150),
(458, 11, '2017-03-02', '09:00:00', '14:00:00', 187, '2017-03-03 15:22:55', 300),
(459, 5, '2017-02-27', '15:00:00', '18:30:00', 187, '2017-03-03 15:23:00', 210),
(460, 5, '2017-02-28', '09:30:00', '14:00:00', 187, '2017-03-03 00:00:00', 270),
(461, 11, '2017-03-02', '15:00:00', '18:00:00', 187, '2017-03-03 15:23:25', 180),
(462, 11, '2017-03-03', '09:30:00', '15:00:00', 187, '2017-03-03 15:24:03', 330),
(463, 5, '2017-02-28', '15:00:00', '18:30:00', 187, '2017-03-03 00:00:00', 210),
(464, 5, '2017-03-01', '09:30:00', '14:00:00', 187, '2017-03-03 15:25:51', 270),
(465, 5, '2017-03-01', '15:00:00', '18:30:00', 187, '2017-03-03 15:26:06', 210),
(466, 5, '2017-03-02', '09:30:00', '14:00:00', 187, '2017-03-03 15:26:31', 270),
(467, 5, '2017-03-02', '15:00:00', '18:30:00', 187, '2017-03-03 15:26:53', 210),
(483, 5, '2017-03-08', '09:30:00', '14:00:00', 187, '2017-03-10 15:15:59', 270),
(484, 5, '2017-03-08', '15:00:00', '18:30:00', 187, '2017-03-10 15:16:20', 210),
(485, 5, '2017-03-09', '09:30:00', '14:00:00', 187, '2017-03-10 15:16:50', 270),
(486, 5, '2017-03-09', '15:00:00', '18:30:00', 187, '2017-03-10 15:17:19', 210),
(487, 5, '2017-03-10', '09:30:00', '15:00:00', 187, '2017-03-10 15:17:57', 330),
(488, 4, '2017-03-06', '09:30:00', '14:00:00', 183, '2017-03-10 15:44:36', 270),
(489, 4, '2017-03-06', '15:00:00', '18:30:00', 127, '2017-03-10 00:00:00', 210),
(490, 4, '2017-03-07', '09:30:00', '14:00:00', 127, '2017-03-10 15:47:08', 270),
(491, 4, '2017-03-07', '15:00:00', '17:00:00', 127, '2017-03-10 15:47:54', 120),
(492, 4, '2017-03-07', '17:00:00', '18:30:00', 177, '2017-03-10 15:48:16', 90),
(493, 4, '2017-03-08', '09:30:00', '14:00:00', 127, '2017-03-10 15:48:44', 270),
(494, 4, '2017-03-08', '15:00:00', '16:30:00', 264, '2017-03-10 15:49:21', 90),
(495, 4, '2017-03-08', '16:30:00', '18:30:00', 127, '2017-03-10 00:00:00', 120),
(496, 4, '2017-03-09', '09:30:00', '14:00:00', 127, '2017-03-10 15:50:17', 270),
(497, 4, '2017-03-09', '15:00:00', '15:30:00', 197, '2017-03-10 15:50:36', 30),
(498, 4, '2017-03-09', '15:30:00', '18:30:00', 127, '2017-03-10 15:51:05', 180),
(499, 4, '2017-03-10', '09:30:00', '15:00:00', 127, '2017-03-10 15:51:26', 330),
(500, 3, '2017-03-06', '09:30:00', '14:00:00', 183, '2017-03-10 00:00:00', 270),
(501, 3, '2017-03-06', '15:00:00', '18:30:00', 127, '2017-03-10 16:15:13', 210),
(502, 3, '2017-03-07', '09:30:00', '14:00:00', 127, '2017-03-10 16:15:55', 270),
(503, 3, '2017-03-07', '15:00:00', '18:30:00', 127, '2017-03-10 16:16:16', 210),
(504, 3, '2017-03-08', '15:00:00', '18:30:00', 127, '2017-03-10 16:16:56', 210),
(505, 3, '2017-03-09', '09:30:00', '11:30:00', 197, '2017-03-10 16:17:27', 120),
(506, 3, '2017-03-09', '11:30:00', '14:00:00', 127, '2017-03-10 16:17:39', 150),
(507, 3, '2017-03-09', '15:00:00', '18:30:00', 127, '2017-03-10 16:17:53', 210),
(508, 3, '2017-03-10', '09:30:00', '15:00:00', 127, '2017-03-10 16:18:30', 330),
(509, 2, '2017-03-07', '10:00:00', '11:00:00', 112, '2017-03-14 15:46:18', 60),
(510, 3, '2017-03-13', '09:30:00', '14:00:00', 127, '2017-03-17 12:08:09', 270),
(511, 3, '2017-03-13', '15:00:00', '18:30:00', 127, '2017-03-17 12:08:32', 210),
(512, 3, '2017-03-14', '09:30:00', '14:00:00', 127, '2017-03-17 12:08:49', 270),
(513, 3, '2017-03-14', '15:00:00', '18:30:00', 127, '2017-03-17 12:09:11', 210),
(514, 3, '2017-03-15', '09:30:00', '14:00:00', 127, '2017-03-17 12:09:24', 270),
(515, 3, '2017-03-15', '15:00:00', '18:30:00', 127, '2017-03-17 12:09:39', 210),
(516, 3, '2017-03-16', '09:30:00', '14:00:00', 127, '2017-03-17 12:09:55', 270),
(517, 3, '2017-03-16', '15:00:00', '16:00:00', 127, '2017-03-17 12:10:15', 60),
(518, 3, '2017-03-16', '16:00:00', '18:30:00', 235, '2017-03-17 00:00:00', 150),
(519, 3, '2017-03-17', '09:30:00', '15:00:00', 127, '2017-03-17 12:11:48', 330),
(520, 4, '2017-03-13', '09:30:00', '14:00:00', 127, '2017-03-17 00:00:00', 270),
(521, 4, '2017-03-13', '15:00:00', '18:30:00', 127, '2017-03-17 00:00:00', 210),
(522, 4, '2017-03-14', '09:30:00', '14:00:00', 127, '2017-03-17 00:00:00', 270),
(523, 4, '2017-03-14', '15:00:00', '18:30:00', 127, '2017-03-17 00:00:00', 210),
(524, 4, '2017-03-15', '09:30:00', '14:00:00', 127, '2017-03-17 00:00:00', 270),
(525, 4, '2017-03-15', '15:00:00', '18:30:00', 127, '2017-03-17 12:29:29', 210),
(526, 4, '2017-03-16', '09:30:00', '14:00:00', 127, '2017-03-17 12:29:49', 270),
(527, 4, '2017-03-16', '15:00:00', '18:30:00', 235, '2017-03-17 12:31:13', 210),
(528, 4, '2017-03-17', '09:30:00', '15:00:00', 127, '2017-03-17 12:31:25', 330),
(529, 11, '2017-03-13', '09:30:00', '14:00:00', 187, '2017-03-17 14:15:19', 270),
(530, 11, '2017-03-13', '15:00:00', '18:30:00', 187, '2017-03-17 14:16:09', 210),
(531, 11, '2017-03-14', '09:30:00', '14:00:00', 187, '2017-03-17 14:17:18', 270),
(532, 11, '2017-03-14', '15:00:00', '18:30:00', 187, '2017-03-17 14:17:37', 210),
(533, 11, '2017-03-15', '09:30:00', '14:00:00', 187, '2017-03-17 14:18:04', 270),
(534, 11, '2017-03-15', '15:00:00', '18:30:00', 187, '2017-03-17 14:18:36', 210),
(535, 11, '2017-03-16', '09:30:00', '14:00:00', 187, '2017-03-17 14:18:58', 270),
(536, 11, '2017-03-16', '15:00:00', '18:30:00', 187, '2017-03-17 14:19:23', 210),
(537, 11, '2017-03-17', '09:30:00', '14:00:00', 187, '2017-03-17 14:22:02', 270),
(538, 11, '2017-03-17', '14:00:00', '15:00:00', 104, '2017-03-17 14:32:57', 60),
(539, 5, '2017-03-13', '09:30:00', '14:00:00', 187, '2017-03-17 14:34:58', 270),
(540, 5, '2017-03-13', '15:00:00', '18:30:00', 187, '2017-03-17 14:35:59', 210),
(541, 5, '2017-03-14', '09:30:00', '14:00:00', 187, '2017-03-17 14:36:41', 270),
(542, 5, '2017-03-14', '15:00:00', '18:30:00', 187, '2017-03-17 14:37:27', 210),
(543, 5, '2017-03-15', '09:30:00', '14:00:00', 187, '2017-03-17 14:38:01', 270),
(544, 5, '2017-03-15', '15:00:00', '18:30:00', 187, '2017-03-17 14:38:34', 210),
(545, 5, '2017-03-16', '09:30:00', '14:00:00', 187, '2017-03-17 14:39:04', 270),
(546, 5, '2017-03-16', '15:00:00', '18:30:00', 187, '2017-03-17 14:39:28', 210),
(547, 5, '2017-03-17', '09:30:00', '15:00:00', 187, '2017-03-17 14:39:55', 330),
(548, 2, '2017-03-14', '09:15:00', '17:00:00', 112, '2017-03-21 11:14:41', 465),
(549, 2, '2017-03-15', '09:15:00', '17:00:00', 112, '2017-03-21 11:15:12', 465),
(550, 2, '2017-03-16', '09:15:00', '17:15:00', 112, '2017-03-21 11:15:42', 480),
(551, 2, '2017-03-17', '09:15:00', '14:30:00', 112, '2017-03-21 11:16:59', 315),
(552, 5, '2017-03-20', '09:30:00', '14:00:00', 187, '2017-03-24 10:30:38', 270),
(553, 5, '2017-03-20', '15:00:00', '18:30:00', 187, '2017-03-24 10:30:58', 210),
(554, 5, '2017-03-21', '09:30:00', '14:00:00', 187, '2017-03-24 10:31:34', 270),
(555, 5, '2017-03-21', '15:00:00', '18:30:00', 187, '2017-03-24 10:32:02', 210),
(556, 5, '2017-03-22', '09:30:00', '14:00:00', 187, '2017-03-24 00:00:00', 270),
(557, 5, '2017-03-22', '15:00:00', '18:30:00', 187, '2017-03-24 10:33:23', 210),
(558, 5, '2017-03-23', '09:30:00', '14:00:00', 187, '2017-03-24 10:33:50', 270),
(559, 5, '2017-03-23', '15:00:00', '18:30:00', 187, '2017-03-24 10:34:10', 210),
(560, 5, '2017-03-24', '09:30:00', '15:00:00', 187, '2017-03-24 10:34:28', 330),
(561, 11, '2017-03-20', '09:30:00', '14:00:00', 187, '2017-03-24 14:41:29', 270),
(562, 11, '2017-03-20', '15:00:00', '18:30:00', 187, '2017-03-24 14:41:43', 210),
(563, 11, '2017-03-21', '09:30:00', '14:00:00', 187, '2017-03-24 14:41:59', 270),
(564, 11, '2017-03-21', '15:00:00', '18:30:00', 187, '2017-03-24 14:42:17', 210),
(565, 11, '2017-03-22', '09:30:00', '14:00:00', 187, '2017-03-24 14:42:55', 270),
(566, 11, '2017-03-22', '15:00:00', '18:30:00', 187, '2017-03-24 14:44:33', 210),
(567, 11, '2017-03-23', '09:30:00', '14:00:00', 187, '2017-03-24 14:45:47', 270),
(568, 11, '2017-03-23', '15:00:00', '18:30:00', 187, '2017-03-24 14:46:03', 210),
(569, 11, '2017-03-24', '09:30:00', '13:00:00', 187, '2017-03-24 14:46:41', 210),
(570, 11, '2017-03-24', '13:00:00', '15:00:00', 104, '2017-03-24 14:47:08', 120),
(571, 23, '2017-03-22', '09:30:00', '14:00:00', 279, '2017-03-24 15:01:11', 270),
(572, 23, '2017-03-22', '15:00:00', '18:30:00', 279, '2017-03-24 00:00:00', 210),
(573, 23, '2017-03-17', '09:30:00', '15:00:00', 279, '2017-03-24 15:02:59', 330),
(574, 23, '2017-03-21', '09:30:00', '14:00:00', 104, '2017-03-24 15:10:52', 270),
(576, 23, '2017-03-21', '15:00:00', '18:30:00', 104, '2017-03-24 15:11:18', 210),
(577, 4, '2017-03-21', '09:30:00', '14:00:00', 127, '2017-03-24 15:11:58', 270),
(578, 4, '2017-03-21', '15:00:00', '18:30:00', 127, '2017-03-24 15:12:26', 210),
(579, 4, '2017-03-22', '09:30:00', '14:00:00', 127, '2017-03-24 15:12:55', 270),
(580, 4, '2017-03-22', '15:00:00', '18:30:00', 127, '2017-03-24 15:13:14', 210),
(581, 4, '2017-03-23', '09:30:00', '14:00:00', 127, '2017-03-24 15:13:53', 270),
(582, 23, '2017-03-23', '09:30:00', '14:00:00', 104, '2017-03-24 15:14:15', 270),
(583, 4, '2017-03-23', '15:00:00', '18:30:00', 127, '2017-03-24 15:14:21', 210),
(584, 23, '2017-03-23', '15:00:00', '18:30:00', 104, '2017-03-24 15:14:33', 210),
(585, 4, '2017-03-24', '09:30:00', '15:00:00', 127, '2017-03-24 15:14:44', 330),
(586, 23, '2017-03-24', '09:30:00', '12:00:00', 104, '2017-03-24 15:15:17', 150),
(587, 23, '2017-03-24', '12:00:00', '15:00:00', 279, '2017-03-24 15:15:43', 180),
(588, 24, '2017-03-21', '09:30:00', '14:00:00', 104, '2017-03-24 15:19:04', 270),
(589, 24, '2017-03-21', '15:00:00', '18:30:00', 104, '2017-03-24 15:20:00', 210),
(590, 24, '2017-03-22', '09:30:00', '14:00:00', 104, '2017-03-24 15:21:06', 270),
(591, 24, '2017-03-23', '09:30:00', '14:00:00', 104, '2017-03-24 15:21:50', 270),
(592, 24, '2017-03-23', '15:00:00', '18:30:00', 104, '2017-03-24 15:22:14', 210),
(593, 24, '2017-03-22', '15:00:00', '18:30:00', 104, '2017-03-24 15:22:41', 210),
(594, 24, '2017-03-24', '09:30:00', '15:00:00', 104, '2017-03-24 15:23:19', 330),
(596, 24, '2017-03-17', '09:30:00', '15:00:00', 104, '2017-03-24 15:24:23', 330),
(597, 3, '2017-03-27', '09:30:00', '14:00:00', 127, '2017-03-29 16:00:32', 270),
(598, 3, '2017-03-22', '11:00:00', '14:00:00', 279, '2017-03-29 16:21:14', 180),
(599, 3, '2017-03-22', '15:30:00', '18:30:00', 279, '2017-03-29 16:21:37', 180),
(600, 3, '2017-03-23', '09:30:00', '14:00:00', 127, '2017-03-29 16:21:56', 270),
(601, 3, '2017-03-23', '15:30:00', '18:30:00', 127, '2017-03-29 16:22:58', 180),
(602, 3, '2017-03-24', '09:30:00', '13:00:00', 127, '2017-03-29 16:23:13', 210),
(603, 3, '2017-03-24', '13:00:00', '15:00:00', 279, '2017-03-29 16:23:30', 120),
(604, 3, '2017-03-27', '15:30:00', '18:30:00', 279, '2017-03-29 16:24:12', 180),
(605, 3, '2017-03-28', '09:30:00', '14:00:00', 127, '2017-03-29 16:24:31', 270),
(606, 3, '2017-03-28', '15:00:00', '18:30:00', 279, '2017-03-29 00:00:00', 210),
(607, 11, '2017-03-27', '09:30:00', '14:00:00', 187, '2017-03-31 14:00:45', 270),
(608, 11, '2017-03-27', '15:00:00', '18:30:00', 187, '2017-03-31 14:01:04', 210),
(609, 11, '2017-03-28', '09:30:00', '14:00:00', 187, '2017-03-31 14:01:45', 270),
(610, 11, '2017-03-28', '15:00:00', '18:30:00', 187, '2017-03-31 14:02:02', 210),
(611, 11, '2017-03-29', '09:30:00', '14:00:00', 187, '2017-03-31 14:02:21', 270),
(612, 11, '2017-03-29', '15:00:00', '18:30:00', 187, '2017-03-31 14:02:43', 210),
(613, 11, '2017-03-30', '09:30:00', '14:00:00', 187, '2017-03-31 14:03:10', 270),
(614, 11, '2017-03-30', '15:00:00', '18:30:00', 187, '2017-03-31 14:03:36', 210),
(615, 24, '2017-03-27', '09:30:00', '14:00:00', 104, '2017-03-31 14:09:27', 270),
(616, 24, '2017-03-27', '15:00:00', '18:30:00', 104, '2017-03-31 14:14:52', 210),
(617, 24, '2017-03-28', '09:30:00', '14:00:00', 104, '2017-03-31 14:15:12', 270),
(618, 24, '2017-03-29', '09:30:00', '14:00:00', 104, '2017-03-31 14:15:36', 270),
(619, 24, '2017-03-29', '15:00:00', '18:30:00', 104, '2017-03-31 14:16:01', 210),
(620, 24, '2017-03-28', '15:00:00', '18:30:00', 104, '2017-03-31 14:16:49', 210),
(621, 24, '2017-03-30', '09:30:00', '14:00:00', 104, '2017-03-31 14:17:29', 270),
(622, 24, '2017-03-30', '15:00:00', '18:30:00', 104, '2017-03-31 14:17:45', 210),
(623, 24, '2017-03-31', '09:30:00', '15:00:00', 104, '2017-03-31 14:18:18', 330),
(624, 23, '2017-03-27', '09:30:00', '14:00:00', 104, '2017-03-31 14:21:34', 270),
(625, 23, '2017-03-27', '15:00:00', '18:30:00', 104, '2017-03-31 14:22:09', 210),
(626, 23, '2017-03-28', '09:30:00', '14:00:00', 104, '2017-03-31 14:22:41', 270),
(627, 23, '2017-03-28', '15:00:00', '18:30:00', 104, '2017-03-31 14:23:32', 210),
(628, 23, '2017-03-29', '09:30:00', '14:00:00', 104, '2017-03-31 14:23:54', 270),
(629, 23, '2017-03-29', '15:00:00', '18:30:00', 104, '2017-03-31 14:25:23', 210),
(630, 11, '2017-03-31', '09:30:00', '13:00:00', 187, '2017-03-31 14:25:27', 210),
(631, 23, '2017-03-30', '09:30:00', '14:00:00', 104, '2017-03-31 14:25:48', 270),
(632, 11, '2017-03-31', '13:00:00', '14:00:00', 104, '2017-03-31 14:26:08', 60),
(633, 23, '2017-03-30', '15:00:00', '18:30:00', 104, '2017-03-31 14:26:20', 210),
(634, 23, '2017-03-31', '09:30:00', '15:00:00', 104, '2017-03-31 00:00:00', 330),
(635, 4, '2017-03-27', '09:30:00', '14:00:00', 127, '2017-03-31 14:28:07', 270),
(636, 3, '2017-03-29', '09:30:00', '14:00:00', 127, '2017-03-31 14:28:20', 270),
(637, 4, '2017-03-27', '15:00:00', '18:30:00', 127, '2017-03-31 14:28:25', 210),
(638, 3, '2017-03-29', '15:00:00', '18:30:00', 127, '2017-03-31 14:28:35', 210),
(639, 4, '2017-03-28', '09:30:00', '14:00:00', 127, '2017-03-31 14:28:40', 270),
(640, 3, '2017-03-30', '09:30:00', '14:00:00', 127, '2017-03-31 14:28:55', 270),
(641, 4, '2017-03-28', '15:00:00', '18:30:00', 127, '2017-03-31 14:28:57', 210),
(642, 3, '2017-03-30', '15:00:00', '15:30:00', 301, '2017-03-31 14:29:13', 30),
(643, 3, '2017-03-30', '15:30:00', '18:30:00', 127, '2017-03-31 14:29:30', 180),
(644, 4, '2017-03-29', '09:30:00', '14:00:00', 127, '2017-03-31 14:29:31', 270),
(645, 4, '2017-03-29', '15:00:00', '18:30:00', 127, '2017-03-31 14:29:51', 210),
(646, 3, '2017-03-31', '09:30:00', '11:30:00', 127, '2017-03-31 14:29:51', 120),
(647, 3, '2017-03-31', '11:30:00', '13:00:00', 183, '2017-03-31 14:30:05', 90),
(648, 11, '2017-03-31', '14:00:00', '14:30:00', 187, '2017-03-31 14:30:06', 30),
(649, 3, '2017-03-31', '13:00:00', '15:00:00', 279, '2017-03-31 14:30:22', 120),
(650, 4, '2017-03-30', '09:30:00', '10:30:00', 90, '2017-03-31 14:31:13', 60),
(651, 4, '2017-03-30', '10:30:00', '11:00:00', 190, '2017-03-31 14:31:39', 30),
(652, 4, '2017-03-30', '11:00:00', '14:00:00', 127, '2017-03-31 14:31:59', 180),
(653, 4, '2017-03-30', '15:00:00', '18:30:00', 127, '2017-03-31 14:32:16', 210),
(654, 4, '2017-03-31', '09:30:00', '14:00:00', 127, '2017-03-31 14:32:38', 270),
(655, 11, '2017-03-31', '14:30:00', '15:00:00', 187, '2017-03-31 14:34:37', 30),
(656, 24, '2017-04-04', '09:30:00', '14:00:00', 104, '2017-04-07 13:05:21', 270),
(657, 24, '2017-04-04', '15:00:00', '18:30:00', 104, '2017-04-07 13:05:46', 210),
(658, 24, '2017-04-05', '09:30:00', '14:00:00', 104, '2017-04-07 13:06:39', 270),
(659, 24, '2017-04-05', '15:00:00', '18:30:00', 104, '2017-04-07 13:07:47', 210),
(660, 24, '2017-04-06', '09:30:00', '14:00:00', 104, '2017-04-07 13:08:05', 270),
(661, 24, '2017-04-06', '15:00:00', '18:30:00', 104, '2017-04-07 13:08:27', 210),
(662, 24, '2017-04-07', '09:30:00', '15:00:00', 104, '2017-04-07 13:09:18', 330),
(663, 23, '2017-04-03', '09:30:00', '11:30:00', 279, '2017-04-07 13:09:55', 120),
(664, 23, '2017-04-03', '11:30:00', '14:00:00', 104, '2017-04-07 13:10:58', 150),
(665, 23, '2017-04-03', '15:00:00', '18:30:00', 104, '2017-04-07 13:11:24', 210),
(666, 23, '2017-04-04', '09:30:00', '14:00:00', 104, '2017-04-07 13:12:07', 270),
(667, 23, '2017-04-04', '15:00:00', '18:30:00', 104, '2017-04-07 13:13:09', 210),
(668, 23, '2017-04-05', '09:30:00', '14:00:00', 104, '2017-04-07 13:13:28', 270),
(669, 23, '2017-04-05', '15:00:00', '18:30:00', 104, '2017-04-07 13:13:51', 210),
(670, 23, '2017-04-06', '09:30:00', '14:00:00', 104, '2017-04-07 13:14:31', 270),
(671, 23, '2017-04-06', '15:00:00', '18:30:00', 104, '2017-04-07 13:14:48', 210),
(672, 23, '2017-04-07', '09:30:00', '15:00:00', 104, '2017-04-07 13:20:32', 330),
(673, 4, '2017-04-03', '09:30:00', '11:00:00', 127, '2017-04-07 14:19:12', 90),
(674, 11, '2017-04-03', '09:30:00', '14:00:00', 187, '2017-04-07 14:37:01', 270),
(675, 11, '2017-04-03', '15:00:00', '18:30:00', 187, '2017-04-07 14:37:41', 210),
(676, 11, '2017-04-04', '09:30:00', '14:00:00', 187, '2017-04-07 14:38:21', 270),
(677, 11, '2017-04-04', '15:00:00', '18:30:00', 187, '2017-04-07 14:38:55', 210),
(678, 11, '2017-04-05', '09:30:00', '14:00:00', 187, '2017-04-07 14:39:30', 270),
(679, 11, '2017-04-05', '15:00:00', '18:30:00', 187, '2017-04-07 14:40:00', 210),
(680, 11, '2017-04-06', '09:30:00', '14:00:00', 187, '2017-04-07 14:40:40', 270),
(681, 11, '2017-04-06', '15:00:00', '18:30:00', 187, '2017-04-07 14:41:10', 210),
(682, 11, '2017-04-07', '09:30:00', '15:00:00', 187, '2017-04-07 14:41:58', 330),
(683, 5, '2017-04-03', '09:30:00', '12:30:00', 3, '2017-04-07 14:51:29', 180),
(684, 5, '2017-04-03', '12:30:00', '14:00:00', 187, '2017-04-07 14:52:03', 90),
(685, 5, '2017-04-03', '15:00:00', '18:30:00', 187, '2017-04-07 14:52:29', 210),
(686, 5, '2017-04-04', '09:30:00', '12:30:00', 327, '2017-04-07 14:53:02', 180),
(687, 5, '2017-04-04', '12:30:00', '14:00:00', 187, '2017-04-07 14:53:17', 90),
(688, 5, '2017-04-04', '15:00:00', '18:30:00', 187, '2017-04-07 14:53:39', 210),
(689, 5, '2017-04-05', '09:30:00', '12:30:00', 327, '2017-04-07 14:54:02', 180),
(690, 5, '2017-04-05', '12:30:00', '14:00:00', 187, '2017-04-07 14:54:19', 90),
(691, 5, '2017-04-05', '15:00:00', '18:30:00', 187, '2017-04-07 14:54:40', 210),
(692, 4, '2017-04-03', '11:00:00', '13:00:00', 327, '2017-04-07 14:55:10', 120),
(693, 5, '2017-04-06', '09:30:00', '12:30:00', 330, '2017-04-07 14:55:14', 180),
(694, 5, '2017-04-06', '12:30:00', '14:00:00', 187, '2017-04-07 14:55:31', 90),
(695, 4, '2017-04-03', '13:00:00', '14:00:00', 127, '2017-04-07 14:55:32', 60),
(696, 5, '2017-04-06', '15:00:00', '18:30:00', 187, '2017-04-07 14:55:48', 210),
(697, 5, '2017-04-07', '09:30:00', '15:00:00', 187, '2017-04-07 14:56:10', 330),
(698, 4, '2017-04-03', '15:00:00', '18:30:00', 127, '2017-04-07 14:56:12', 210),
(699, 4, '2017-04-04', '09:30:00', '14:00:00', 127, '2017-04-07 14:56:29', 270),
(700, 4, '2017-04-04', '15:00:00', '18:30:00', 127, '2017-04-07 14:56:54', 210),
(701, 4, '2017-04-05', '09:30:00', '14:00:00', 127, '2017-04-07 14:57:28', 270),
(702, 4, '2017-04-05', '15:00:00', '18:30:00', 127, '2017-04-07 00:00:00', 210),
(703, 4, '2017-04-06', '09:30:00', '14:00:00', 127, '2017-04-07 14:59:09', 270),
(704, 4, '2017-04-06', '15:00:00', '16:00:00', 127, '2017-04-07 15:00:25', 60),
(705, 4, '2017-04-07', '16:00:00', '18:30:00', 327, '2017-04-07 15:01:13', 150),
(706, 3, '2017-04-03', '09:30:00', '14:00:00', 127, '2017-04-10 16:54:01', 270),
(707, 3, '2017-04-03', '15:00:00', '18:30:00', 127, '2017-04-10 16:54:27', 210),
(708, 3, '2017-04-04', '09:30:00', '14:00:00', 127, '2017-04-10 16:55:20', 270),
(709, 3, '2017-04-04', '15:00:00', '18:30:00', 127, '2017-04-10 16:55:41', 210),
(710, 3, '2017-04-05', '09:30:00', '14:00:00', 127, '2017-04-10 16:56:12', 270),
(711, 3, '2017-04-05', '15:00:00', '18:30:00', 127, '2017-04-10 16:56:27', 210),
(712, 3, '2017-04-06', '09:30:00', '14:00:00', 127, '2017-04-10 16:56:57', 270),
(713, 3, '2017-04-06', '15:00:00', '18:30:00', 327, '2017-04-10 00:00:00', 210),
(714, 3, '2017-04-07', '09:30:00', '15:00:00', 127, '2017-04-10 16:58:10', 330),
(715, 5, '2017-04-10', '09:30:00', '14:00:00', 187, '2017-04-12 09:36:56', 270),
(716, 5, '2017-04-10', '15:00:00', '18:30:00', 187, '2017-04-12 09:37:18', 210),
(717, 5, '2017-04-11', '09:30:00', '14:00:00', 187, '2017-04-12 09:37:38', 270),
(718, 5, '2017-04-11', '15:00:00', '18:30:00', 187, '2017-04-12 09:38:06', 210),
(719, 5, '2017-04-12', '09:30:00', '14:00:00', 187, '2017-04-12 09:38:27', 270),
(720, 5, '2017-04-12', '15:00:00', '18:30:00', 187, '2017-04-12 09:38:47', 210),
(721, 24, '2017-04-10', '09:30:00', '14:00:00', 104, '2017-04-17 11:59:08', 270),
(722, 24, '2017-04-10', '15:00:00', '18:30:00', 104, '2017-04-17 11:59:45', 210),
(723, 24, '2017-04-11', '09:30:00', '14:00:00', 104, '2017-04-17 12:01:44', 270),
(724, 24, '2017-04-11', '15:00:00', '18:30:00', 104, '2017-04-17 12:02:04', 210),
(725, 24, '2017-04-17', '09:30:00', '14:00:00', 104, '2017-04-17 12:02:39', 270),
(726, 11, '2017-04-17', '09:30:00', '14:00:00', 187, '2017-04-21 14:29:45', 270),
(727, 11, '2017-04-17', '15:00:00', '18:30:00', 187, '2017-04-21 14:30:13', 210),
(728, 11, '2017-04-18', '09:30:00', '14:00:00', 187, '2017-04-21 14:30:52', 270),
(729, 5, '2017-04-17', '09:30:00', '14:00:00', 187, '2017-04-21 14:31:07', 270),
(730, 11, '2017-04-18', '15:00:00', '18:30:00', 187, '2017-04-21 14:31:12', 210),
(731, 5, '2017-04-17', '15:00:00', '18:30:00', 187, '2017-04-21 14:31:28', 210),
(732, 5, '2017-04-18', '09:30:00', '14:00:00', 187, '2017-04-21 14:31:49', 270),
(733, 11, '2017-04-19', '09:30:00', '14:00:00', 187, '2017-04-21 14:32:00', 270),
(734, 5, '2017-04-18', '15:00:00', '18:30:00', 187, '2017-04-21 14:32:14', 210),
(735, 5, '2017-04-19', '09:30:00', '14:00:00', 187, '2017-04-21 14:32:40', 270),
(736, 11, '2017-04-19', '15:00:00', '18:30:00', 187, '2017-04-21 14:32:47', 210),
(737, 5, '2017-04-19', '15:00:00', '18:30:00', 187, '2017-04-21 14:33:00', 210),
(738, 5, '2017-04-20', '09:30:00', '14:00:00', 187, '2017-04-21 14:33:25', 270),
(739, 5, '2017-04-20', '15:00:00', '18:30:00', 187, '2017-04-21 14:33:53', 210),
(740, 11, '2017-04-20', '09:30:00', '14:00:00', 187, '2017-04-21 14:34:10', 270),
(741, 5, '2017-04-21', '09:30:00', '15:00:00', 187, '2017-04-21 14:34:15', 330),
(742, 11, '2017-04-20', '15:00:00', '18:30:00', 187, '2017-04-21 14:34:45', 210),
(743, 11, '2017-04-21', '09:30:00', '13:00:00', 187, '2017-04-21 14:36:28', 210),
(744, 11, '2017-04-21', '13:00:00', '15:00:00', 127, '2017-04-21 14:41:32', 120),
(745, 24, '2017-04-17', '15:00:00', '18:30:00', 104, '2017-04-21 14:48:08', 210),
(746, 24, '2017-04-18', '09:30:00', '14:00:00', 104, '2017-04-21 14:48:33', 270),
(747, 24, '2017-04-18', '15:00:00', '18:30:00', 104, '2017-04-21 14:48:52', 210),
(748, 24, '2017-04-19', '09:30:00', '14:00:00', 104, '2017-04-21 14:49:11', 270),
(749, 24, '2017-04-19', '15:00:00', '18:30:00', 104, '2017-04-21 14:49:30', 210),
(750, 24, '2017-04-20', '09:30:00', '14:00:00', 104, '2017-04-21 14:49:56', 270),
(751, 24, '2017-04-20', '15:00:00', '18:30:00', 104, '2017-04-21 14:50:14', 210),
(752, 23, '2017-05-03', '09:30:00', '14:00:00', 279, '2017-05-08 10:57:10', 270),
(755, 23, '2017-05-04', '09:30:00', '14:00:00', 104, '2017-05-08 10:59:31', 270),
(754, 23, '2017-05-03', '15:00:00', '18:30:00', 279, '2017-05-08 10:57:45', 210),
(756, 23, '2017-05-04', '15:00:00', '18:30:00', 279, '2017-05-08 10:59:54', 210),
(757, 23, '2017-05-05', '09:30:00', '12:00:00', 279, '2017-05-08 11:00:47', 150),
(758, 23, '2017-05-05', '13:00:00', '15:00:00', 104, '2017-05-08 11:01:19', 120),
(759, 24, '2017-05-03', '09:30:00', '14:00:00', 104, '2017-05-08 11:08:14', 270),
(760, 24, '2017-05-03', '15:00:00', '18:30:00', 104, '2017-05-08 11:09:02', 210),
(761, 23, '2017-05-09', '09:30:00', '14:00:00', 104, '2017-05-16 10:27:37', 270),
(762, 23, '2017-05-09', '15:00:00', '18:30:00', 104, '2017-05-16 10:27:58', 210),
(763, 23, '2017-05-10', '09:30:00', '14:00:00', 104, '2017-05-16 10:28:40', 270),
(764, 23, '2017-05-10', '15:00:00', '18:30:00', 104, '2017-05-16 10:29:17', 210),
(765, 23, '2017-05-11', '09:30:00', '14:00:00', 104, '2017-05-16 10:31:06', 270),
(766, 23, '2017-05-11', '15:00:00', '18:30:00', 279, '2017-05-16 10:31:20', 210),
(767, 23, '2017-05-12', '09:30:00', '12:00:00', 104, '2017-05-16 10:31:47', 150),
(768, 23, '2017-05-12', '12:00:00', '15:00:00', 279, '2017-05-16 10:32:22', 180);

-- --------------------------------------------------------

--
-- Table structure for table `tt_variable_concept`
--

CREATE TABLE `tt_variable_concept` (
  `id` int(11) NOT NULL,
  `name` varchar(300) CHARACTER SET latin1 COLLATE latin1_spanish_ci NOT NULL,
  `account_number` varchar(50) CHARACTER SET latin1 COLLATE latin1_spanish_ci NOT NULL,
  `id_company` varchar(50) COLLATE latin1_german1_ci NOT NULL,
  `id_fiscal_year` varchar(50) COLLATE latin1_german1_ci NOT NULL,
  `account_contability` varchar(50) COLLATE latin1_german1_ci NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `tt_variable_concept`
--

INSERT INTO `tt_variable_concept` (`id`, `name`, `account_number`, `id_company`, `id_fiscal_year`, `account_contability`) VALUES
(423, 'Costes varios', '6070009', '385', '411', ''),
(422, 'Costes de gestión de proyecto', '6070008', '385', '411', ''),
(420, 'Hay muchas variaciones de los pasajes de Lorem Ipsum disponibles, pero la mayoría sufrió alteraciones en alguna manera, ya sea porque se le agregó humor, o palabras aleatorias que no parecen ni un poco creíbles. Si vas a utilizar un pasaje de Lorem Ipsum, necesitás estar seguro de que no hay nada av', '6070006', '385', '411', ''),
(419, 'Costes de servicios profesionales subcontratados', '6070005', '385', '411', ''),
(418, 'Costes de logísticas, mensajerías y almacen', '6070004', '385', '411', ''),
(417, 'Costes de Viajes, desplazamientos y dietas', '6070003', '385', '411', ''),
(416, 'Costes de Equipo Humano', '6070002', '385', '411', '7777777'),
(415, 'Costes de Producción', '6070001', '385', '411', '');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tt_billing`
--
ALTER TABLE `tt_billing`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tt_budget`
--
ALTER TABLE `tt_budget`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tt_budget_cost`
--
ALTER TABLE `tt_budget_cost`
  ADD PRIMARY KEY (`pesimist`,`optimist`);

--
-- Indexes for table `tt_budget_expenses`
--
ALTER TABLE `tt_budget_expenses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tt_budget_income`
--
ALTER TABLE `tt_budget_income`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tt_campaign`
--
ALTER TABLE `tt_campaign`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tt_company`
--
ALTER TABLE `tt_company`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tt_company_report`
--
ALTER TABLE `tt_company_report`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tt_company_year`
--
ALTER TABLE `tt_company_year`
  ADD PRIMARY KEY (`id`,`id_company`,`id_fiscal_year`);

--
-- Indexes for table `tt_customer`
--
ALTER TABLE `tt_customer`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tt_estimated_employee_cost`
--
ALTER TABLE `tt_estimated_employee_cost`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tt_expenses_fixed_concept`
--
ALTER TABLE `tt_expenses_fixed_concept`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tt_fee_company`
--
ALTER TABLE `tt_fee_company`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tt_fiscal_year`
--
ALTER TABLE `tt_fiscal_year`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tt_fixed_concept`
--
ALTER TABLE `tt_fixed_concept`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tt_group`
--
ALTER TABLE `tt_group`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tt_hours`
--
ALTER TABLE `tt_hours`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tt_incomes_lines_variable_concept`
--
ALTER TABLE `tt_incomes_lines_variable_concept`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tt_lines_fee_company`
--
ALTER TABLE `tt_lines_fee_company`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tt_lines_subconcept`
--
ALTER TABLE `tt_lines_subconcept`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tt_real_employee_cost`
--
ALTER TABLE `tt_real_employee_cost`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tt_role`
--
ALTER TABLE `tt_role`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tt_salary_history`
--
ALTER TABLE `tt_salary_history`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tt_status`
--
ALTER TABLE `tt_status`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tt_subconcepts_billing`
--
ALTER TABLE `tt_subconcepts_billing`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tt_subconcepts_project`
--
ALTER TABLE `tt_subconcepts_project`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tt_subconcepts_standards`
--
ALTER TABLE `tt_subconcepts_standards`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tt_subgroup`
--
ALTER TABLE `tt_subgroup`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tt_taxes_values`
--
ALTER TABLE `tt_taxes_values`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tt_team`
--
ALTER TABLE `tt_team`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tt_timetable`
--
ALTER TABLE `tt_timetable`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tt_user`
--
ALTER TABLE `tt_user`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tt_user_hours`
--
ALTER TABLE `tt_user_hours`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tt_variable_concept`
--
ALTER TABLE `tt_variable_concept`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tt_billing`
--
ALTER TABLE `tt_billing`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `tt_budget`
--
ALTER TABLE `tt_budget`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `tt_budget_expenses`
--
ALTER TABLE `tt_budget_expenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `tt_budget_income`
--
ALTER TABLE `tt_budget_income`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=487;

--
-- AUTO_INCREMENT for table `tt_campaign`
--
ALTER TABLE `tt_campaign`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=428;

--
-- AUTO_INCREMENT for table `tt_company`
--
ALTER TABLE `tt_company`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=407;

--
-- AUTO_INCREMENT for table `tt_company_report`
--
ALTER TABLE `tt_company_report`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tt_company_year`
--
ALTER TABLE `tt_company_year`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=416;

--
-- AUTO_INCREMENT for table `tt_customer`
--
ALTER TABLE `tt_customer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT for table `tt_estimated_employee_cost`
--
ALTER TABLE `tt_estimated_employee_cost`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tt_expenses_fixed_concept`
--
ALTER TABLE `tt_expenses_fixed_concept`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=824;

--
-- AUTO_INCREMENT for table `tt_fee_company`
--
ALTER TABLE `tt_fee_company`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `tt_fiscal_year`
--
ALTER TABLE `tt_fiscal_year`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=395;

--
-- AUTO_INCREMENT for table `tt_fixed_concept`
--
ALTER TABLE `tt_fixed_concept`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=438;

--
-- AUTO_INCREMENT for table `tt_group`
--
ALTER TABLE `tt_group`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=421;

--
-- AUTO_INCREMENT for table `tt_hours`
--
ALTER TABLE `tt_hours`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tt_incomes_lines_variable_concept`
--
ALTER TABLE `tt_incomes_lines_variable_concept`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `tt_lines_fee_company`
--
ALTER TABLE `tt_lines_fee_company`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tt_lines_subconcept`
--
ALTER TABLE `tt_lines_subconcept`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `tt_real_employee_cost`
--
ALTER TABLE `tt_real_employee_cost`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tt_role`
--
ALTER TABLE `tt_role`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `tt_salary_history`
--
ALTER TABLE `tt_salary_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `tt_status`
--
ALTER TABLE `tt_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tt_subconcepts_billing`
--
ALTER TABLE `tt_subconcepts_billing`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `tt_subconcepts_project`
--
ALTER TABLE `tt_subconcepts_project`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=310;

--
-- AUTO_INCREMENT for table `tt_subconcepts_standards`
--
ALTER TABLE `tt_subconcepts_standards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tt_subgroup`
--
ALTER TABLE `tt_subgroup`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `tt_taxes_values`
--
ALTER TABLE `tt_taxes_values`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tt_team`
--
ALTER TABLE `tt_team`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `tt_timetable`
--
ALTER TABLE `tt_timetable`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tt_user`
--
ALTER TABLE `tt_user`
  MODIFY `id` tinyint(4) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT for table `tt_user_hours`
--
ALTER TABLE `tt_user_hours`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=769;

--
-- AUTO_INCREMENT for table `tt_variable_concept`
--
ALTER TABLE `tt_variable_concept`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=425;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
