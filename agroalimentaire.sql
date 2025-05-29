-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : lun. 12 déc. 2022 à 11:43
-- Version du serveur : 5.7.36
-- Version de PHP : 7.4.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `agroalimentaire`
--

-- --------------------------------------------------------

--
-- Structure de la table `commune`
--

DROP TABLE IF EXISTS `commune`;
CREATE TABLE IF NOT EXISTS `commune` (
  `idComm` int(11) NOT NULL AUTO_INCREMENT,
  `nomComm` varchar(255) DEFAULT NULL,
  `idDist` int(11) NOT NULL,
  PRIMARY KEY (`idComm`),
  KEY `fk_commune_district1_idx` (`idDist`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `district`
--

DROP TABLE IF EXISTS `district`;
CREATE TABLE IF NOT EXISTS `district` (
  `idDist` int(11) NOT NULL AUTO_INCREMENT,
  `nomDist` varchar(255) DEFAULT NULL,
  `idReg` int(11) NOT NULL,
  PRIMARY KEY (`idDist`),
  KEY `fk_district_region1_idx` (`idReg`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `fokotany`
--

DROP TABLE IF EXISTS `fokotany`;
CREATE TABLE IF NOT EXISTS `fokotany` (
  `idFkt` int(11) NOT NULL AUTO_INCREMENT,
  `nomFkt` varchar(255) DEFAULT NULL,
  `idComm` int(11) NOT NULL,
  PRIMARY KEY (`idFkt`),
  KEY `fk_fokotany_commune1_idx` (`idComm`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `groupe`
--

DROP TABLE IF EXISTS `groupe`;
CREATE TABLE IF NOT EXISTS `groupe` (
  `idGroupe` int(11) NOT NULL AUTO_INCREMENT,
  `nomGroupe` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idGroupe`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `organisation`
--

DROP TABLE IF EXISTS `organisation`;
CREATE TABLE IF NOT EXISTS `organisation` (
  `idProdr` int(11) NOT NULL,
  `numNIF` int(11) NOT NULL,
  `idTypeOrg` int(11) NOT NULL,
  PRIMARY KEY (`idProdr`),
  KEY `fk_organisation_producteur1_idx` (`idProdr`),
  KEY `fk_organisation_typeorganisation1_idx` (`idTypeOrg`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `particulier`
--

DROP TABLE IF EXISTS `particulier`;
CREATE TABLE IF NOT EXISTS `particulier` (
  `prenom` varchar(45) DEFAULT NULL,
  `dateNais` date DEFAULT NULL,
  `sexe` varchar(2) DEFAULT NULL,
  `idProdr` int(11) NOT NULL,
  PRIMARY KEY (`idProdr`),
  KEY `fk_particulier_producteur1_idx` (`idProdr`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `producteur`
--

DROP TABLE IF EXISTS `producteur`;
CREATE TABLE IF NOT EXISTS `producteur` (
  `idProdr` int(11) NOT NULL,
  `nom` varchar(45) DEFAULT NULL,
  `mail` varchar(255) DEFAULT NULL,
  `tel` varchar(10) DEFAULT NULL,
  `adresse` varchar(255) DEFAULT NULL,
  `idGroupe` int(11) NOT NULL,
  PRIMARY KEY (`idProdr`),
  KEY `fk_producteur_groupe1_idx` (`idGroupe`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `produire`
--

DROP TABLE IF EXISTS `produire`;
CREATE TABLE IF NOT EXISTS `produire` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idProd` int(11) NOT NULL,
  `idProdr` int(11) NOT NULL,
  `idFkt` int(11) NOT NULL,
  `unite` varchar(45) NOT NULL,
  `dateExp` date DEFAULT NULL,
  `qteProd` float DEFAULT NULL,
  `dateProd` date DEFAULT NULL,
  `pu` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_produit_has_producteur_producteur1_idx` (`idProdr`),
  KEY `fk_produit_has_producteur_produit1_idx` (`idProd`),
  KEY `fk_produit_has_producteur_fokotany1_idx` (`idFkt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `produit`
--

DROP TABLE IF EXISTS `produit`;
CREATE TABLE IF NOT EXISTS `produit` (
  `idProd` int(11) NOT NULL AUTO_INCREMENT,
  `designation` varchar(45) DEFAULT NULL,
  `idTypeProd` int(11) NOT NULL,
  PRIMARY KEY (`idProd`),
  KEY `fk_produit_typeproduit_idx` (`idTypeProd`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `region`
--

DROP TABLE IF EXISTS `region`;
CREATE TABLE IF NOT EXISTS `region` (
  `idReg` int(11) NOT NULL AUTO_INCREMENT,
  `nomReg` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idReg`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `typeorganisation`
--

DROP TABLE IF EXISTS `typeorganisation`;
CREATE TABLE IF NOT EXISTS `typeorganisation` (
  `idTypeOrg` int(11) NOT NULL AUTO_INCREMENT,
  `nomTypeOrg` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idTypeOrg`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `typeproduit`
--

DROP TABLE IF EXISTS `typeproduit`;
CREATE TABLE IF NOT EXISTS `typeproduit` (
  `idTypeProd` int(11) NOT NULL AUTO_INCREMENT,
  `classement` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idTypeProd`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `idU` int(11) NOT NULL AUTO_INCREMENT,
  `pseudo` varchar(45) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `admin` int(11) DEFAULT NULL,
  `mdp` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idU`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`idU`, `pseudo`, `email`, `admin`, `mdp`) VALUES
(1, 'admin', 'admin@gmail.com', 1, '$2b$08$x6VUUZAdoDCrqsaIXTCDuOMeW8klJlN.Ay1gun8VUGs147etEWFVW');

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `commune`
--
ALTER TABLE `commune`
  ADD CONSTRAINT `fk_commune_district1` FOREIGN KEY (`idDist`) REFERENCES `district` (`idDist`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Contraintes pour la table `district`
--
ALTER TABLE `district`
  ADD CONSTRAINT `fk_district_region1` FOREIGN KEY (`idReg`) REFERENCES `region` (`idReg`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Contraintes pour la table `fokotany`
--
ALTER TABLE `fokotany`
  ADD CONSTRAINT `fk_fokotany_commune1` FOREIGN KEY (`idComm`) REFERENCES `commune` (`idComm`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Contraintes pour la table `organisation`
--
ALTER TABLE `organisation`
  ADD CONSTRAINT `fk_organisation_producteur1` FOREIGN KEY (`idProdr`) REFERENCES `producteur` (`idProdr`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_organisation_typeorganisation1` FOREIGN KEY (`idTypeOrg`) REFERENCES `typeorganisation` (`idTypeOrg`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Contraintes pour la table `particulier`
--
ALTER TABLE `particulier`
  ADD CONSTRAINT `fk_particulier_producteur1` FOREIGN KEY (`idProdr`) REFERENCES `producteur` (`idProdr`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Contraintes pour la table `producteur`
--
ALTER TABLE `producteur`
  ADD CONSTRAINT `fk_producteur_groupe1` FOREIGN KEY (`idGroupe`) REFERENCES `groupe` (`idGroupe`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Contraintes pour la table `produire`
--
ALTER TABLE `produire`
  ADD CONSTRAINT `fk_produit_has_producteur_fokotany1` FOREIGN KEY (`idFkt`) REFERENCES `fokotany` (`idFkt`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_produit_has_producteur_producteur1` FOREIGN KEY (`idProdr`) REFERENCES `producteur` (`idProdr`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_produit_has_producteur_produit1` FOREIGN KEY (`idProd`) REFERENCES `produit` (`idProd`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Contraintes pour la table `produit`
--
ALTER TABLE `produit`
  ADD CONSTRAINT `fk_produit_typeproduit` FOREIGN KEY (`idTypeProd`) REFERENCES `typeproduit` (`idTypeProd`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
