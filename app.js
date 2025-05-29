const express = require('express')
const bodyParser = require('body-parser')
const moment = require('moment')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const cors = require('cors')
require('dotenv').config()
const mysql = require("./src/modele/mysql.js")

const app = express()
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(cors({
    origin: '*'
}))
const port = 8081

app.get('/listeproduitexpire', (req,res) => {
    var sqlBd = `select designation,qteProd,unite,dateExp
    from produit,produire where produire.idProd=produit.idProd 
    AND date(now()) > dateExp AND timestampdiff(day,dateExp,date(now())) between 1 and 30 ORDER BY dateExp`
    mysql.query(sqlBd, (err,result,fields) => {
        if (err) console.log(err)
        res.json(result)
        return
    })
})

app.get('/listeproduitbientotexpire', (req,res) => {
    var sqlBd = `select designation,qteProd,unite,dateExp,timestampdiff(day,date(now()),dateExp) as reste
    from produit,produire where produire.idProd=produit.idProd 
    AND date(now()) < dateExp AND timestampdiff(day,date(now()),dateExp) between 1 and 30 ORDER BY dateExp`
    mysql.query(sqlBd, (err,result,fields) => {
        if (err) console.log(err)
        res.json(result)
        return
    })
})

app.get('/nombreOrg', (req,res) => {
    var sqlBd = `select count(*) as nb from organisation`
    mysql.query(sqlBd, (err,result,fields) => {
        if (err) console.log(err)
        res.json(result)
        return
    })
})

app.get('/nombreParti', (req,res) => {
    var sqlBd = `select count(*) as nb from particulier`
    mysql.query(sqlBd, (err,result,fields) => {
        if (err) console.log(err)
        res.json(result)
        return
    })
})

app.get('/nombreProdGroupe', (req,res) => {
    var sqlBd = `select count(*) as nb ,nomGroupe 
                from producteur,groupe
                where producteur.idGroupe=groupe.idGroupe group by producteur.idGroupe`
    mysql.query(sqlBd, (err,result,fields) => {
        if (err) console.log(err)
        res.json(result)
        return
    })
})


app.get('/listeDernierProd', (req,res) => {
    var sqlBd = `SELECT produit.designation as des, produire.qteProd as qte,unite
    FROM produire,produit
    WHERE produire.idProd=produit.idProd  ORDER BY produire.dateProd DESC limit 6`
    mysql.query(sqlBd, (err,result) => {
        if (err) console.log(err)
        res.json(result)
        return
    })
})

app.post('/listeProdMois', (req,res) => {
    var idProd = req.body.idProd
    var idFkt = req.body.idFkt
    var annee = req.body.annee
    var sqlBd = `select designation,sum(qteProd) as qte,month(dateProd) as mois,year(dateProd) as annee
    from produit,produire,fokotany
    where produit.idProd=produire.idProd AND produire.idFkt=fokotany.idFkt
    and produit.idProd=? and fokotany.idFkt=? and year(produire.dateProd)=?
    group by month(produire.dateProd)`
    mysql.query(sqlBd,[idProd,idFkt,annee], (err,result) => {
        if (err) console.log(err)
        res.json(result)
        console.log(idProd,idFkt,annee)
        return
    })
})

app.post('/listeProdDate', (req,res) => {
    var idProd = req.body.idProd
    var idFkt = req.body.idFkt
    var annee = req.body.annee
    var anneeFin = req.body.anneeFin
    var sqlBd = `select designation,qteProd,dateProd,unite
    from produit,produire,fokotany
    where produit.idProd=produire.idProd AND produire.idFkt=fokotany.idFkt
    and produit.idProd=? and fokotany.idFkt=? and produire.dateProd between ? and ?`
    mysql.query(sqlBd,[idProd,idFkt,annee,anneeFin], (err,result) => {
        if (err) console.log(err)
        res.json(result)
        console.log(idProd,idFkt,annee)
        return
    })
})
/*------------------------------------------------ REGION -------------------------------------------------*/
//Ajout region
app.post('/ajoutRegion',(req, res) => {
    const nomReg = captilize(req.body.nomReg)
    var sqlBd = "SELECT EXISTS (SELECT nomReg FROM region WHERE nomReg=?) as nomReg"
    mysql.query(sqlBd,[nomReg], (err,result) => {
        if (result[0].nomReg) {
            res.json({etat: true, msg: `La région <strong>${nomReg}</strong> est déjà enregistré !`})
        } else {
            var sql = "INSERT INTO region(nomReg) VALUES ?";
            var valeur = [[nomReg]];
            mysql.query(sql,[valeur],(err,result)=>{
                if(err) throw err;
                res.json({etat: false, msg: 'Ajout réussi !'})
            }); 
        }     
    })
    console.log(nomReg) 
})

app.get('/listeRegion',tokenAuthentification, (req,res) => {
    var sqlBd = "SELECT * FROM region"
    mysql.query(sqlBd, (err,result,fields) => {
        if (err) console.log(err)
        res.json(result)
        return
    })
})

app.get('/listeRegion/:idReg', (req,res) => {
    var idReg = req.params.idReg
    var sql = "SELECT * FROM region WHERE idReg=?"
    value = [[idReg]]
    mysql.query(sql,[value], (err,result,fields) => {
        if (err) console.log(err)
        res.json(result)
        return
    })
    console.log(idReg)
})

app.patch('/modifierRegion/:idReg',(req, res) => {
    const idReg = req.params.idReg
    const nomReg = captilize(req.body.nomReg)
        var sql = `UPDATE region SET nomReg=? WHERE idReg=?`
        mysql.query(sql,[nomReg,idReg],(err,result)=>{
            if(err) throw err;
            res.json({etat: true, msg: 'Modification réussie !'})
        });    
})

app.delete('/supprimerRegion/:idReg',(req, res) => {
    const idReg = req.params.idReg
    var sqlBd = "SELECT EXISTS (SELECT idReg FROM district WHERE idReg=?) as idReg"
    mysql.query(sqlBd,[idReg], (err,result) => {
        if (result[0].idReg) {
            res.json({etat: true, msg: `Impossible, cette région a déja un district !`})
        } else {
            var sql = `DELETE FROM region WHERE idReg=?`
            mysql.query(sql,[idReg],(err,result)=>{
                if(err) throw err;
                res.json({etat: false, msg: `Suppression succès !`})
            }); 
        }     
    })    
    console.log(idReg)
})

/*------------------------------------------------ DISTRICT -------------------------------------------------*/
//Ajout district
app.post('/ajoutDistrict',(req, res) => {
    const nomDist = captilize(req.body.nomDist)
    const idReg = req.body.idReg
    var sqlBd = "SELECT nomDist,idReg FROM district"
    mysql.query(sqlBd, (err,result,fields) => {
        for (var i = 0; i < result.length;i++) {
            if(nomDist === result[i].nomDist && idReg === result[i].idReg){
                res.json({etat: true, msg: `Ce district est déjà enregistré !`})
                return
            }    
        }
        var sql = "INSERT INTO district(nomDist,idReg) VALUES ?";
        var valeur = [[nomDist,idReg]];
        mysql.query(sql,[valeur],(err,result)=>{
            if(err) throw err;
            res.json({etat: false, msg: `Ajout succès !`})
        }); 
    })
    console.log(nomDist,idReg) 
})

app.get('/listeDistrict',tokenAuthentification, (req,res) => {
    var sqlBd = "SELECT idDist,nomDist,region.idReg as idReg,region.nomReg as nomReg FROM region,district WHERE region.idReg=district.idReg"
    mysql.query(sqlBd, (err,result,fields) => {
        if (err) console.log(err)
        res.json(result)
        return
    })
})

app.get('/listeDistrict/:idDist', (req,res) => {
    var idDist = req.params.idDist
    var sql = "SELECT * FROM district WHERE idDist=?"
    value = [[idDist]]
    mysql.query(sql,[value], (err,result,fields) => {
        if (err) console.log(err)
        res.json(result)
        return
    })
    console.log(idDist)
})

app.patch('/modifierDistrict/:idDist',(req, res) => {
    const idDist = req.params.idDist
    const nomDist = captilize(req.body.nomDist)
    const idReg = req.body.idReg
        var sql = `UPDATE district SET nomDist=?,idReg=? WHERE idDist=?`
        mysql.query(sql,[nomDist,idReg,idDist],(err,result)=>{
            if(err) throw err;
            res.json({etat: true, msg: 'Modification réussie !'})
        });    
})

app.delete('/supprimerDistrict/:idDist',(req, res) => {
    const idDist = req.params.idDist
    var sqlBd = "SELECT EXISTS (SELECT idDist FROM commune WHERE idDist=?) as idDist"
    mysql.query(sqlBd,[idDist], (err,result) => {
        if (result[0].idDist) {
            res.json({etat: true, msg: `Impossible, cette district a déja une commune !`})
        } else {
            var sql = `DELETE FROM district WHERE idDist=?`
            mysql.query(sql,[idDist],(err,result)=>{
                if(err) throw err;
                res.json({etat: false, msg: `Suppression succès !`})
            }); 
        }     
    })    
    console.log(idDist)
})

/*------------------------------------------------ COMMUNE -------------------------------------------------*/
//Ajout commune
app.post('/ajoutCommune',(req, res) => {
    const nomComm = captilize(req.body.nomComm)
    const idDist = req.body.idDist
    var sqlBd = "SELECT nomComm,idDist FROM commune"
    mysql.query(sqlBd, (err,result) => {
        for (var i = 0; i < result.length;i++) {
            if(nomComm === result[i].nomComm && idDist === result[i].idDist){
                res.json({etat: true, msg: `Cette commune est déjà enregistré !`})
                return
            }    
        }
        var sql = "INSERT INTO commune(nomComm,idDist) VALUES ?";
        var valeur = [[nomComm,idDist]];
        mysql.query(sql,[valeur],(err,result)=>{
            if(err) throw err;
            res.json({etat: false, msg: `Ajout succès !`})
        }); 
    })
    console.log(nomComm,idDist) 
})

app.get('/listeCommune',tokenAuthentification, (req,res) => {
    var sqlBd = "SELECT idComm,nomComm,district.idDist as idDist,district.nomDist as nomDist FROM commune,district WHERE commune.idDist=district.idDist ORDER BY nomComm"
    mysql.query(sqlBd, (err,result,fields) => {
        if (err) console.log(err)
        res.json(result)
        return
    })
})

app.get('/listeCommune/:idComm', (req,res) => {
    var idComm = req.params.idComm
    var sql = "SELECT * FROM commune WHERE idComm=?"
    value = [[idComm]]
    mysql.query(sql,[value], (err,result) => {
        if (err) console.log(err)
        res.json(result)
        return
    })
    console.log(idComm)
})

app.patch('/modifierCommune/:idComm',(req, res) => {
    const idComm = req.params.idComm
    const nomComm = captilize(req.body.nomComm)
    const idDist = req.body.idDist
        var sql = `UPDATE commune SET nomComm=?,idDist=? WHERE idComm=?`
        mysql.query(sql,[nomComm,idDist,idComm],(err,result)=>{
            if(err) throw err;
            res.json({etat: true, msg: 'Modification réussie !'})
        });    
})

app.delete('/supprimerCommune/:idComm',(req, res) => {
    const idComm = req.params.idComm
    var sqlBd = "SELECT EXISTS (SELECT idComm FROM fokotany WHERE idComm=?) as idComm"
    mysql.query(sqlBd,[idComm], (err,result) => {
        if (result[0].idComm) {
            res.json({etat: true, msg: `Impossible, cette commune a déja une fokotany !`})
        } else {
            var sql = `DELETE FROM commune WHERE idComm=?`
            mysql.query(sql,[idComm],(err,result)=>{
                if(err) throw err;
                res.json({etat: false, msg: `Suppression succès !`})
            }); 
        }     
    })    
    console.log(idComm)
})

/*------------------------------------------------ QUARTIER -------------------------------------------------*/
//Ajout quartier
app.post('/ajoutQuartier',(req, res) => {
    const nomFkt = captilize(req.body.nomFkt)
    const idComm = req.body.idComm
    var sqlBd = "SELECT nomFkt,idComm FROM fokotany"
    mysql.query(sqlBd, (err,result) => {
        for (var i = 0; i < result.length;i++) {
            if(nomFkt === result[i].nomFkt && idComm === result[i].idComm){
                res.json({etat: true, msg: `Cette quartier est déjà enregistré !`})
                return
            }    
        }
        var sql = "INSERT INTO fokotany(nomFkt,idComm) VALUES ?";
        var valeur = [[nomFkt,idComm]];
        mysql.query(sql,[valeur],(err,result)=>{
            if(err) throw err;
            res.json({etat: false, msg: `Ajout succès !`})
        }); 
    })
    console.log(nomFkt,idComm) 
})

app.get('/listeQuartier',tokenAuthentification, (req,res) => {
    var sqlBd = "SELECT idFkt,nomFkt,commune.idComm as idComm, commune.nomComm as nomComm FROM commune,fokotany WHERE fokotany.idComm=commune.idComm ORDER BY nomFkt"
    mysql.query(sqlBd, (err,result,fields) => {
        if (err) console.log(err)
        res.json(result)
        return
    })
})

app.get('/listeQuartier/:idFkt', (req,res) => {
    var idFkt = req.params.idFkt
    var sql = "SELECT * FROM fokotany WHERE idFkt=?"
    value = [[idFkt]]
    mysql.query(sql,[value], (err,result) => {
        if (err) console.log(err)
        res.json(result)
        return
    })
    console.log(idFkt)
})

app.patch('/modifierQuartier/:idFkt',(req, res) => {
    const idFkt = req.params.idFkt
    const nomFkt = captilize(req.body.nomFkt)
    const idComm = req.body.idComm
        var sql = `UPDATE fokotany SET nomFkt=?,idComm=? WHERE idFkt=?`
        mysql.query(sql,[nomFkt,idComm,idFkt],(err,result)=>{
            if(err) throw err;
            res.json({etat: true, msg: 'Modification réussie !'})
        });    
})

app.delete('/supprimerQuartier/:idFkt',(req, res) => {
    const idFkt = req.params.idFkt
    var sqlBd = "SELECT EXISTS (SELECT idFkt FROM produire WHERE idFkt=?) as idFkt"
    mysql.query(sqlBd,[idFkt], (err,result) => {
        if (result[0].idFkt) {
            res.json({etat: true, msg: `Impossible, cette Quartier est déja lié au produire !`})
        } else {
            var sql = `DELETE FROM fokotany WHERE idFkt=?`
            mysql.query(sql,[idFkt],(err,result)=>{
                if(err) throw err;
                res.json({etat: false, msg: `Suppression succès !`})
            }); 
        }     
    })    
    console.log(idFkt)
})

/*------------------------------------------------ REGION -------------------------------------------------*/
//Ajout region
app.post('/ajoutTypeProduit',(req, res) => {
    const classement = captilize(req.body.classement)
    var sqlBd = "SELECT EXISTS (SELECT classement FROM typeproduit WHERE classement=?) as classement"
    mysql.query(sqlBd,[classement], (err,result) => {
        if (result[0].classement) {
            res.json({etat: true, msg: `Le type de produit <strong>${classement}</strong> est déjà enregistré !`})
        } else {
            var sql = "INSERT INTO typeproduit(classement) VALUES ?";
            var valeur = [[classement]];
            mysql.query(sql,[valeur],(err,result)=>{
                if(err) throw err;
                res.json({etat: false, msg: 'Ajout réussi !'})
            }); 
        }     
    })
    console.log(classement) 
})

app.get('/listeTypeProduit',tokenAuthentification, (req,res) => {
    var sqlBd = "SELECT * FROM typeproduit"
    mysql.query(sqlBd, (err,result,fields) => {
        if (err) console.log(err)
        res.json(result)
        return
    })
})

app.get('/listeTypeProduit/:idTypeProd', (req,res) => {
    var idTypeProd = req.params.idTypeProd
    var sql = "SELECT * FROM typeproduit WHERE idTypeProd=?"
    value = [[idTypeProd]]
    mysql.query(sql,[value], (err,result,fields) => {
        if (err) console.log(err)
        res.json(result)
        return
    })
    console.log(idTypeProd)
})

app.patch('/modifierTypeProduit/:idTypeProd',(req, res) => {
    const idTypeProd = req.params.idTypeProd
    const classement = captilize(req.body.classement)
        var sql = `UPDATE typeproduit SET classement=? WHERE idTypeProd=?`
        mysql.query(sql,[classement,idTypeProd],(err,result)=>{
            if(err) throw err;
            res.json({etat: true, msg: 'Modification réussie !'})
        });    
})

app.delete('/supprimerTypeProduit/:idTypeProd',(req, res) => {
    const idTypeProd = req.params.idTypeProd
    var sqlBd = "SELECT EXISTS (SELECT idTypeProd FROM produit WHERE idTypeProd=?) as idTypeProd"
    mysql.query(sqlBd,[idTypeProd], (err,result) => {
        if (result[0].idTypeProd) {
            res.json({etat: true, msg: `Cette type de produit appartient déjà aux autres produits !`})
        } else {
            var sql = `DELETE FROM typeproduit WHERE idTypeProd=?`
            mysql.query(sql,[idTypeProd],(err,result)=>{
                if(err) throw err;
                res.json({etat: false, msg: `Suppression succès !`})
            }); 
        }     
    })    
    console.log(idTypeProd)
})


/*------------------------------------------------ COMMUNE -------------------------------------------------*/
//Ajout commune
app.post('/ajoutCommune',(req, res) => {
    const nomComm = captilize(req.body.nomComm)
    const idDist = req.body.idDist
    var sqlBd = "SELECT nomComm,idDist FROM commune"
    mysql.query(sqlBd, (err,result) => {
        for (var i = 0; i < result.length;i++) {
            if(nomComm === result[i].nomComm && idDist === result[i].idDist){
                res.json({etat: true, msg: `Cette commune est déjà enregistré !`})
                return
            }    
        }
        var sql = "INSERT INTO commune(nomComm,idDist) VALUES ?";
        var valeur = [[nomComm,idDist]];
        mysql.query(sql,[valeur],(err,result)=>{
            if(err) throw err;
            res.json({etat: false, msg: `Ajout succès !`})
        }); 
    })
    console.log(nomComm,idDist) 
})

app.get('/listeCommune',tokenAuthentification, (req,res) => {
    var sqlBd = "SELECT idComm,nomComm,district.idDist as idDist,district.nomDist as nomDist FROM commune,district WHERE commune.idDist=district.idDist ORDER BY nomComm"
    mysql.query(sqlBd, (err,result,fields) => {
        if (err) console.log(err)
        res.json(result)
        return
    })
})

app.get('/listeCommune/:idComm', (req,res) => {
    var idComm = req.params.idComm
    var sql = "SELECT * FROM commune WHERE idComm=?"
    value = [[idComm]]
    mysql.query(sql,[value], (err,result) => {
        if (err) console.log(err)
        res.json(result)
        return
    })
    console.log(idComm)
})

app.patch('/modifierCommune/:idComm',(req, res) => {
    const idComm = req.params.idComm
    const nomComm = captilize(req.body.nomComm)
    const idDist = req.body.idDist
        var sql = `UPDATE commune SET nomComm=?,idDist=? WHERE idComm=?`
        mysql.query(sql,[nomComm,idDist,idComm],(err,result)=>{
            if(err) throw err;
            res.json({etat: true, msg: 'Modification réussie !'})
        });    
})

app.delete('/supprimerCommune/:idComm',(req, res) => {
    const idComm = req.params.idComm
    var sqlBd = "SELECT EXISTS (SELECT idComm FROM fokotany WHERE idComm=?) as idComm"
    mysql.query(sqlBd,[idComm], (err,result) => {
        if (result[0].idComm) {
            res.json({etat: true, msg: `Impossible, cette commune a déja une fokotany !`})
        } else {
            var sql = `DELETE FROM commune WHERE idComm=?`
            mysql.query(sql,[idComm],(err,result)=>{
                if(err) throw err;
                res.json({etat: false, msg: `Suppression succès !`})
            }); 
        }     
    })    
    console.log(idComm)
})

/*------------------------------------------------ PRODUIT -------------------------------------------------*/
//Ajout produit
app.post('/ajoutProduit',(req, res) => {
    const designation = captilize(req.body.designation)
    // const pu = req.body.pu
    // const dateExp = req.body.dateExp
    const idTypeProd = req.body.idTypeProd
    var sqlBd = "SELECT designation,idTypeProd FROM produit"
    mysql.query(sqlBd, (err,result) => {
        for (var i = 0; i < result.length;i++) {
            if(designation === result[i].designation){
                res.json({etat: true, msg: `Ce produit est déjà enregistré !`})
                return
            }    
        }
        var sql = "INSERT INTO produit(designation,idTypeProd) VALUES ?";
        var valeur = [[designation,idTypeProd]];
        mysql.query(sql,[valeur],(err,result)=>{
            if(err) throw err;
            res.json({etat: false, msg: `Ajout succès !`})
        }); 
    })
})

app.get('/listeProduit',tokenAuthentification, (req,res) => {
    var sqlBd = "SELECT idProd,designation,typeproduit.idTypeProd as idTypeProd,classement FROM produit,typeproduit WHERE produit.idTypeProd=typeproduit.idTypeProd ORDER BY idProd"
    mysql.query(sqlBd, (err,result) => {
        if (err) console.log(err)
        res.json(result)
        return
    })
})

app.get('/listeProduit/:idProd', (req,res) => {
    var idProd = req.params.idProd
    var sql = "SELECT * FROM produit WHERE idProd=?"
    value = [[idProd]]
    mysql.query(sql,[value], (err,result) => {
        if (err) console.log(err)
        res.json(result)
        return
    })
})

app.patch('/modifierProduit/:idProd',(req, res) => {
    const idProd = req.params.idProd
    const designation = captilize(req.body.designation)
    // const pu = req.body.pu
    // const dateExp = req.body.dateExp
    const idTypeProd = req.body.idTypeProd
        var sql = `UPDATE produit SET designation=?,idTypeProd=? WHERE idProd=?`
        mysql.query(sql,[designation,idTypeProd,idProd],(err,result)=>{
            if(err) throw err;
            res.json({etat: true, msg: 'Modification réussie !'})
        });    
})

app.delete('/supprimerProduit/:idProd',(req, res) => {
    const idProd = req.params.idProd
    var sqlBd = "SELECT EXISTS (SELECT idProd FROM produire WHERE idProd=?) as idProd"
    mysql.query(sqlBd,[idProd], (err,result) => {
        if (result[0].idProd) {
            res.json({etat: true, msg: `Impossible, ce produit est déja lié au produire !`})
            return
        } else {
            var sql = `DELETE FROM produit WHERE idProd=?`
            mysql.query(sql,[idProd],(err,result)=>{
                if(err) throw err;
                res.json({etat: false, msg: `Suppression succès !`})
                return
            }); 
        }     
    })    
})

/*------------------------------------------------ GROUPE -------------------------------------------------*/
//Ajout GROUPE
app.post('/ajoutGroupe',(req, res) => {
    const nomGroupe = captilize(req.body.nomGroupe)
    var sqlBd = "SELECT EXISTS (SELECT nomGroupe FROM groupe WHERE nomGroupe=?) as nomGroupe"
    mysql.query(sqlBd,[nomGroupe], (err,result) => {
        if (result[0].nomGroupe) {
            res.json({etat: true, msg: `Le groupe <strong>${nomGroupe}</strong> est déjà enregistré !`})
        } else {
            var sql = "INSERT INTO groupe(nomGroupe) VALUES ?";
            var valeur = [[nomGroupe]];
            mysql.query(sql,[valeur],(err,result)=>{
                if(err) throw err;
                res.json({etat: false, msg: 'Ajout réussi !'})
            }); 
        }     
    })
    console.log(nomGroupe) 
})

app.get('/listeGroupe',tokenAuthentification, (req,res) => {
    var sqlBd = "SELECT * FROM groupe"
    mysql.query(sqlBd, (err,result,fields) => {
        if (err) console.log(err)
        res.json(result)
        return
    })
})

app.get('/listeGroupe/:idGroupe', (req,res) => {
    var idGroupe = req.params.idGroupe
    var sql = "SELECT * FROM groupe WHERE idGroupe=?"
    value = [[idGroupe]]
    mysql.query(sql,[value], (err,result,fields) => {
        if (err) console.log(err)
        res.json(result)
        return
    })
    console.log(idGroupe)
})

app.patch('/modifierGroupe/:idGroupe',(req, res) => {
    const idGroupe = req.params.idGroupe
    const nomGroupe = captilize(req.body.nomGroupe)
        var sql = `UPDATE groupe SET nomGroupe=? WHERE idGroupe=?`
        mysql.query(sql,[nomGroupe,idGroupe],(err,result)=>{
            if(err) throw err;
            res.json({etat: true, msg: 'Modification réussie !'})
        });    
})

app.delete('/supprimerGroupe/:idGroupe',(req, res) => {
    const idGroupe = req.params.idGroupe
    var sqlBd = "SELECT EXISTS (SELECT idGroupe FROM producteur WHERE idGroupe=?) as idGroupe"
    mysql.query(sqlBd,[idGroupe], (err,result) => {
        if (result[0].idGroupe) {
            res.json({etat: true, msg: `Impossible, cette région a déja un district !`})
        } else {
            var sql = `DELETE FROM groupe WHERE idGroupe=?`
            mysql.query(sql,[idGroupe],(err,result)=>{
                if(err) throw err;
                res.json({etat: false, msg: `Suppression succès !`})
            }); 
        }     
    })    
    console.log(idGroupe)
})

/*------------------------------------------------ ORGANISATION -------------------------------------------------*/
//Ajout TYPE ORGANISATION
app.post('/ajoutTypeOrganisation',(req, res) => {
    const nomTypeOrg = captilize(req.body.nomTypeOrg)
    var sqlBd = "SELECT EXISTS (SELECT nomTypeOrg FROM typeorganisation WHERE nomTypeOrg=?) as nomTypeOrg"
    mysql.query(sqlBd,[nomTypeOrg], (err,result) => {
        if (result[0].nomTypeOrg) {
            res.json({etat: true, msg: `Le type d'organisation <strong>${nomTypeOrg}</strong> est déjà enregistré !`})
        } else {
            var sql = "INSERT INTO typeorganisation(nomTypeOrg) VALUES ?";
            var valeur = [[nomTypeOrg]];
            mysql.query(sql,[valeur],(err,result)=>{
                if(err) throw err;
                res.json({etat: false, msg: 'Ajout succès !'})
            }); 
        }     
    })
    console.log(nomTypeOrg) 
})

app.get('/listeTypeOrganisation',tokenAuthentification, (req,res) => {
    var sqlBd = "SELECT * FROM typeorganisation"
    mysql.query(sqlBd, (err,result,fields) => {
        if (err) console.log(err)
        res.json(result)
        return
    })
})

app.get('/listeTypeOrganisation/:idTypeOrg', (req,res) => {
    var idTypeOrg = req.params.idTypeOrg
    var sql = "SELECT * FROM typeorganisation WHERE idTypeOrg=?"
    value = [[idTypeOrg]]
    mysql.query(sql,[value], (err,result) => {
        if (err) console.log(err)
        res.json(result)
        return
    })
    console.log(idTypeOrg)
})

app.patch('/modifierTypeOrganisation/:idTypeOrg',(req, res) => {
    const idTypeOrg = req.params.idTypeOrg
    const nomTypeOrg = captilize(req.body.nomTypeOrg)
        var sql = `UPDATE typeorganisation SET nomTypeOrg=? WHERE idTypeOrg=?`
        mysql.query(sql,[nomTypeOrg,idTypeOrg],(err,result)=>{
            if(err) throw err;
            res.json({etat: true, msg: 'Modification réussie !'})
        });    
})

app.delete('/supprimerTypeOrganisation/:idTypeOrg',(req, res) => {
    const idTypeOrg = req.params.idTypeOrg
    var sqlBd = "SELECT EXISTS (SELECT idTypeOrg FROM organisation WHERE idTypeOrg=?) as idTypeOrg"
    mysql.query(sqlBd,[idTypeOrg], (err,result) => {
        if (result[0].idTypeOrg) {
            res.json({etat: true, msg: `Impossible, cette type d'organisation associé a une organisation !`})
        } else {
            var sql = `DELETE FROM typeorganisation WHERE idTypeOrg=?`
            mysql.query(sql,[idTypeOrg],(err,result)=>{
                if(err) throw err;
                res.json({etat: false, msg: `Suppression succès !`})
            }); 
        }     
    })    
    console.log(idTypeOrg)
})


/*------------------------------------------------ ORGANISATION -------------------------------------------------*/
//Ajout ORGANISATION
app.post('/ajoutOrganisation',(req, res) => {
    const nom = req.body.nom.toUpperCase()
    const mail = req.body.mail
    const tel = req.body.tel
    const adresse = req.body.adresse
    const idGroupe = req.body.idGroupe
    const numNIF = req.body.numNIF
    const idTypeOrg = req.body.idTypeOrg
   
    var sqlBd = "SELECT max(idProdr) as max_id FROM producteur"
    mysql.query(sqlBd, (err,result) => {
       if (err) console.log(err)
       var id_max = result[0].max_id+1
        var sql = "INSERT INTO producteur(idProdr,nom,mail,tel,adresse,idGroupe) VALUES ?";
        var valeur = [[id_max,nom,mail,tel,adresse,idGroupe]];
        mysql.query(sql,[valeur],(err,result)=>{
            if(err) throw err;

            var sql = "INSERT INTO organisation(idProdr,numNIF,idTypeOrg) VALUES ?";
            var valeur = [[id_max,numNIF,idTypeOrg]];
            mysql.query(sql,[valeur],(err,resultO)=>{
                if(err) throw err;
                res.json({etat: false, msg: `Ajout succès !`})
            }); 

        }); 
    })
})

app.get('/listeOrganisation',tokenAuthentification, (req,res) => {
    var sqlBd = `SELECT producteur.idProdr as idProdr,nom,mail,tel,adresse,groupe.idGroupe as idGroupe,nomGroupe,numNIF,typeorganisation.idTypeOrg as idTypeOrg,nomTypeOrg 
    FROM producteur,organisation,typeorganisation,groupe 
    WHERE producteur.idGroupe=groupe.idGroupe 
    AND producteur.idProdr=organisation.idProdr 
    AND organisation.idTypeOrg=typeorganisation.idTypeOrg 
    ORDER BY idProdr`
    mysql.query(sqlBd, (err,result) => {
        if (err) console.log(err)
        res.json(result)
        return
    })
})

app.get('/listeOrganisation/:idProdr', (req,res) => {
    var idProdr = req.params.idProdr
    var sql = `SELECT producteur.idProdr as idProdr,nom,mail,tel,adresse,groupe.idGroupe as idGroupe,nomGroupe,numNIF,typeorganisation.idTypeOrg as idTypeOrg,nomTypeOrg 
    FROM producteur,organisation,typeorganisation,groupe 
    WHERE producteur.idGroupe=groupe.idGroupe 
    AND producteur.idProdr=organisation.idProdr 
    AND organisation.idTypeOrg=typeorganisation.idTypeOrg 
    AND producteur.idProdr=?`
    value = [[idProdr]]
    mysql.query(sql,[value], (err,result) => {
        if (err) console.log(err)
        res.json(result)
        return
    })
    console.log(idProdr)
})

app.patch('/modifierOrganisation/:idProdr',(req, res) => {
    const idProdr = req.params.idProdr
    const nom = req.body.nom.toUpperCase()
    const mail = req.body.mail
    const tel = req.body.tel
    const adresse = req.body.adresse
    const idGroupe = req.body.idGroupe
    const numNIF = req.body.numNIF
    const idTypeOrg = req.body.idTypeOrg
    var sql = `UPDATE producteur SET nom=?,mail=?,tel=?,adresse=?,idGroupe=? WHERE idProdr=?`
    mysql.query(sql,[nom,mail,tel,adresse,idGroupe,idProdr],(err,result)=>{
        if(err) throw err;
        var sql1 = `UPDATE organisation SET numNIF=?,idTypeOrg=? WHERE idProdr=?`
        mysql.query(sql1,[numNIF,idTypeOrg,idProdr],(err,result)=>{
            if(err) throw err;
            res.json({etat: true, msg: 'Modification réussie !'})
        }); 
    });  
    console.log(idProdr,nom,mail,tel,adresse,idGroupe,numNIF,idTypeOrg)  
})

app.delete('/supprimerOrganisation/:idProdr',(req, res) => {
    const idProdr = req.params.idProdr
    var sqlBd = "SELECT EXISTS (SELECT idProdr FROM produire WHERE idProdr=?) as idProdr"
    mysql.query(sqlBd,[idProdr], (err,result) => {
        if (result[0].idProdr) {
            res.json({etat: true, msg: `Impossible, ce producteur est déja lié au produire !`})
        } else {
            var sql = `DELETE FROM producteur WHERE idProdr=?`
            mysql.query(sql,[idProdr],(err,result)=>{
                if(err) throw err;
                res.json({etat: false, msg: `Suppression succès !`})
            }); 
        }     
    })    
    console.log(idProdr)
})


/*------------------------------------------------ PARTICULIER -------------------------------------------------*/
//Ajout PARTICULIER
app.post('/ajoutParticulier',(req, res) => {
    const nom = req.body.nom.toUpperCase()
    const prenom = req.body.prenom
    const dateNais = req.body.dateNais
    const sexe = req.body.sexe
    const mail = req.body.mail
    const tel = req.body.tel
    const adresse = req.body.adresse
    const idGroupe = req.body.idGroupe
   
    var sqlBd = "SELECT max(idProdr) as max_id FROM producteur"
    mysql.query(sqlBd, (err,result) => {
       if (err) console.log(err)
       var id_max = result[0].max_id+1
        var sql = "INSERT INTO producteur(idProdr,nom,mail,tel,adresse,idGroupe) VALUES ?";
        var valeur = [[id_max,nom,mail,tel,adresse,idGroupe]];
        mysql.query(sql,[valeur],(err,result)=>{
            if(err) throw err;

            var sql = "INSERT INTO particulier(idProdr,prenom,dateNais,sexe) VALUES ?";
            var valeur = [[id_max,prenom,dateNais,sexe]];
            mysql.query(sql,[valeur],(err,resultO)=>{
                if(err) throw err;
                res.json({etat: false, msg: `Ajout succès !`})
            }); 

        }); 
    })
})

app.get('/listeParticulier',tokenAuthentification, (req,res) => {
    var sqlBd = `SELECT producteur.idProdr as idProdr,nom,mail,tel,adresse,groupe.idGroupe as idGroupe,nomGroupe,prenom,dateNais,sexe
    FROM producteur,particulier,groupe 
    WHERE producteur.idGroupe=groupe.idGroupe 
    AND producteur.idProdr=particulier.idProdr 
    ORDER BY idProdr`
    mysql.query(sqlBd, (err,result) => {
        if (err) console.log(err)
        res.json(result)
        return
    })
})

app.get('/listeParticulier/:idProdr', (req,res) => {
    var idProdr = req.params.idProdr
    var sql = `SELECT producteur.idProdr as idProdr,nom,mail,tel,adresse,groupe.idGroupe as idGroupe,nomGroupe,prenom,dateNais,sexe
    FROM producteur,particulier,groupe 
    WHERE producteur.idGroupe=groupe.idGroupe 
    AND producteur.idProdr=particulier.idProdr 
    AND producteur.idProdr=?`
    value = [[idProdr]]
    mysql.query(sql,[value], (err,result) => {
        if (err) console.log(err)
        res.json(result)
        return
    })
    console.log(idProdr)
})

app.patch('/modifierParticulier/:idProdr',(req, res) => {
    const idProdr = req.params.idProdr
    const nom = req.body.nom.toUpperCase()
    const prenom = req.body.prenom
    const dateNais = req.body.dateNais
    const sexe = req.body.sexe
    const mail = req.body.mail
    const tel = req.body.tel
    const adresse = req.body.adresse
    const idGroupe = req.body.idGroupe
    var sql = `UPDATE producteur SET nom=?,mail=?,tel=?,adresse=?,idGroupe=? WHERE idProdr=?`
    mysql.query(sql,[nom,mail,tel,adresse,idGroupe,idProdr],(err,result)=>{
        if(err) throw err;
        var sql1 = `UPDATE particulier SET prenom=?,dateNais=?,sexe=? WHERE idProdr=?`
        mysql.query(sql1,[prenom,dateNais,sexe,idProdr],(err,result)=>{
            if(err) throw err;
            res.json({etat: true, msg: 'Modification réussie !'})
        }); 
    });  
    console.log(idProdr,nom,mail,tel,adresse,idGroupe)  
})

app.delete('/supprimerParticulier/:idProdr',(req, res) => {
    const idProdr = req.params.idProdr
    var sqlBd = "SELECT EXISTS (SELECT idProdr FROM produire WHERE idProdr=?) as idProdr"
    mysql.query(sqlBd,[idProdr], (err,result) => {
        if (result[0].idProdr) {
            res.json({etat: true, msg: `Impossible, ce producteur est déja lié au produire !`})
        } else {
            var sql = `DELETE FROM producteur WHERE idProdr=?`
            mysql.query(sql,[idProdr],(err,result)=>{
                if(err) throw err;
                res.json({etat: false, msg: `Suppression succès !`})
            }); 
        }     
    })    
    console.log(idProdr)
})

/*------------------------------------------------ Produire -------------------------------------------------*/
//Ajout Produire
app.post('/ajoutProduire',(req, res) => {
    const idProdr = req.body.idProdr
    const idProd = req.body.idProd
    const idFkt = req.body.idFkt
    const unite = req.body.unite
    const qteProd = req.body.qteProd
    const pu = req.body.pu
    const dateExp = req.body.dateExp
    const dateProd = req.body.dateProd
   
    var sql = "INSERT INTO produire(idProd,idProdr,idFkt,unite,qteProd,pu,dateProd,dateExp) VALUES ?";
    var valeur = [[idProd,idProdr,idFkt,unite,qteProd,pu,dateProd,dateExp]];
    mysql.query(sql,[valeur],(err,resultO)=>{
        if(err) throw err;
        res.json({etat: false, msg: `Ajout succès !`})
        return
    }); 

})

app.get('/listeProduire',tokenAuthentification, (req,res) => {
    var sqlBd = `SELECT produire.id as id,produire.idProd as idProd,designation,nomGroupe,produire.idProdr as idProdr,nom,produire.idFkt as idFkt,nomFkt,unite,qteProd,pu,dateProd,dateExp,nomComm
    FROM produire,produit,fokotany,commune,producteur,groupe
    WHERE produire.idProd=produit.idProd
    AND produire.idProdr=producteur.idProdr
    AND produire.idFkt=fokotany.idFkt
    AND groupe.idGroupe=producteur.idGroupe
    AND fokotany.idComm=commune.idComm ORDER BY produire.dateProd ASC`
    mysql.query(sqlBd, (err,result) => {
        if (err) console.log(err)
        res.json(result)
        return
    })
})

app.get('/listeProducteur', (req,res) => {
    var sql = `SELECT idProdr,nom,nomGroupe FROM producteur,groupe WHERE groupe.idGroupe=producteur.idGroupe`
    mysql.query(sql, (err,result) => {
        if (err) console.log(err)
        res.json(result)
        return
    })
})


app.delete('/supprimerProduire/:id',(req, res) => {
    const id = req.params.id
    
    var sql = `DELETE FROM produire WHERE id=?`
    mysql.query(sql,[id],(err,result)=>{
        if(err) throw err;
        res.json({etat: false, msg: `Suppression succès !`})
    })
})



/******************************************creer un compte d'un utilisteur *************** */*
app.post('/creerUtilisateur',(req, res) => {
    var pseudo = req.body.pseudo
    var email = req.body.email.toLowerCase()
    var mdp = req.body.mdp
    var admin = req.body.admin
    sqlEmail = 'SELECT EXISTS (SELECT email FROM users WHERE email=?) AS email'
    mysql.query(sqlEmail,[email],(err,resultEmail)=>{
        if(err) throw err
        if(resultEmail[0].email){
            return res.json({etat: false, msg: 'Email déjà existe !'})
        }
        else
        {
            bcrypt.hash(mdp, 8, function(err, hash) {
                if(err) {
                    console.log(err)
                }
                var sql = 'insert into users(pseudo,email,mdp,admin) VALUES ?'
                var value = [[pseudo, email, hash, admin]]
                mysql.query(sql,[value],(err,result)=>{
                    if(err) throw err
                    return res.json({etat: true, msg: 'Création d\'un compte success !'})
                })
            });
        }
    })
})

app.patch('/modifierUtilisateur/:idU',(req, res) => {
    const idU = req.params.idU
    const pseudo = req.body.pseudo
    const email = req.body.email
    sql = 'UPDATE users SET pseudo=?,email=? WHERE idU=?'
    mysql.query(sql,[pseudo,email,idU],(err,result)=>{
        if(err) throw err
        return res.json({etat: true, msg: 'Modification succès !'})
    })
})

app.patch('/modifierMotPasse/:idU',(req, res) => {
    const idU = req.params.idU
    const mdp = req.body.mdp
    var mdpN = req.body.mdpN
    sqlM = 'SELECT mdp FROM users WHERE idU=?'
    mysql.query(sqlM,[idU],(err,resultM)=>{
        if(err) throw err
        const match = bcrypt.compareSync(mdp,resultM[0].mdp)
        if(!match){
            return res.json({etat: false, msg: 'Votre ancien mot de passe est incorrecte !'})
        }
        else
        {
            bcrypt.hash(mdpN, 8, function(err, hash) {
                if(err) {
                    console.log(err)
                }
                var sql = 'update users SET mdp=? WHERE idU=?'
                mysql.query(sql,[hash,idU],(err,result)=>{
                    if(err) throw err
                    return res.json({etat: true, msg: 'Modification mot de passe succès !'})
                })
            });
        }
    })
})

// app.get('/listeUtilisateur', (req,res) => {
//     var sqlBd = "SELECT idU,pseudo,email,admin FROM utilisateur ORDER BY pseudo"
//     mysql.query(sqlBd, (err,result,fields) => {
//         if (err) console.log(err)
//         res.json(result)
//         return
//     })
// })



// app.delete('/supprimerUtilisateur/:idU',(req, res) => {
//     const idU = req.params.idU
//         var sql = `DELETE FROM utilisateur WHERE idU=?`
//         mysql.query(sql,[idU],(err,result)=>{
//             if(err) throw err;
//             res.json(result)
//         }); 
// })
/*****************************************generer un token********************************* */

app.post('/login', (req, res)=>{
    const email = req.body.email
    const mdp = req.body.mdp
    var sql = 'select * from users'
    mysql.query(sql,(err,result)=>{
        if (err) throw err
        var trouve = false
        for(var i=0 ; i<result.length; i++){
            if(result[i].email === email) {
                const match = bcrypt.compareSync(mdp,result[i].mdp)
                if(match){
                    const accessToken = generateAccessToken(result[i])
                    const refreshToken = generateRefreshToken(result[i])
                    res.json({accessToken, refreshToken, user: result[i], stat: true})
                    return
                }else{
                    res.status(401).send('Mot de passe incorrecte !')
                    return
                }
            }  
        }
        if(!trouve){
            res.status(401).send('Email n\'est pas existe !')
            return
        }
    })
})


app.post('/refreshToken',(req,res)=>{
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(!token)
    {
        return res.sendStatus(401)
    }
    jwt.verify(token,process.env.REFRESH_TOKEN_SECRET, (err,user)=>{
        if(err) {
            return res.sendStatus(401)
        }    
        delete user.iat
        delete user.exp
        
        const refreshToken = generateAccessToken(user)
        res.json({accessToken: refreshToken})
    }) 
})


function generateAccessToken(user){
    return jwt.sign(user,process.env.ACCESS_TOKEN_SECRET, {expiresIn: '60m'})
}

function generateRefreshToken(user){
    return jwt.sign(user,process.env.REFRESH_TOKEN_SECRET, {expiresIn: '1y'})
}

function tokenAuthentification(req,res,next){
    var authHeader = req.headers['authorization']
    var token = authHeader && authHeader.split(' ')[1]
    if(!token)
    {
        return res.sendStatus(401)
    }
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, (err,user)=>{
        if(err) {
            return res.sendStatus(401)
        } 
        req.user = user
        next()
    })
}


/***************************************Mot de passe oublie email *************************************** */

  app.post('/email',(req,res)=>{
    var email = req.body.email

    var sql = 'SELECT EXISTS (SELECT email from users where email=?) AS email'
    mysql.query(sql,[email],(err,result)=>{
        if(err) throw err
        if(result[0].email){
            var mdp = Math.floor(Math.random() * (999999-100000+1) + 100000)
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: process.env.EMAIL_USER,
                  pass: process.env.EMAIL_PASS
                }
              });
              
              var mailOptions = {
                from: 'francinerindra@gmail.com',
                to: email,
                subject: 'TAKALOU (Récuperation de mot de passe)',
                text: `T-${mdp} : votre code d'authentification`
              }
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  return res.json({etat: false, msg: ' Votre compte gmail n\'est pas encore existe  ou veuillez verfier votre connexion internet !'})
                } else {
                    bcrypt.hash(`${mdp}`, 8, function(err, hash) {
                        if(err) {
                            console.log(err)
                        }
                        var sql = 'update users SET mdp=? WHERE email=?'
                        mysql.query(sql,[hash,email],(err,result)=>{
                            if(err) throw err
                            return res.json({etat: true, msg: 'Succès, veuillez verifiez votre email !'})
                        })
                    })
                }
            })       
        } else {
            return res.json({etat: false, msg: 'Votre email n\'existe pas !'})
        }
    })

  })

app.listen(port,()=>console.log(`via: http://localhost:${port}`))

function captilize (donnee) {
    donnee = donnee.toLowerCase() ;
    return donnee.charAt(0).toUpperCase() + donnee.slice(1)
}

function dateParse (data) {
    return moment(data).format('YYYY-MM-DD')
}