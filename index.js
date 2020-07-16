const express = require('express');
const mongodb = require('mongodb');
const cors = require('cors');

const MongoClient = mongodb.MongoClient;
const app = express();

app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(cors());

let db;
let actividades;
let tematicas;

MongoClient.connect('mongodb+srv://cocorugo:bbkBoo1camp@cluster0-06yeb.mongodb.net/idatis?retryWrites=true&w=majority', function (err, client) {
    if (err !== null) {
        console.log(err);
        return err;
    } else {
        db = client.db('idatis');
        actividades = db.collection('actividades');
        tematicas = db.collection('tematicas')

    }
});

// app.get('/buscador', function (req, res) {
//     db.collection('actividades').find().toArray(function (err, voluntario) {
//         if (err !== null) {
//             console.log(err);
//             res.send(err);
//         } else {
//             res.send(voluntario);
//             console.log("funciona");
//         }
//     })
// });

app.get('/cargarTematicas', function (req, res) {

    tematicas.find().toArray(function (err, temas) {
        if (err !== null) {
            console.log(err);
            res.send(err);
        } else {
            res.send(temas)
        }
    })
})


app.get('/cargarProvincias', function (req, res) {

    actividades.distinct("provincia", function (err, provincias) {
        if (err !== null) {
            console.log(err);
            res.send(err);
        } else {
            console.log(provincias)
            res.send(provincias)
        }

    })
})

app.post('/buscador', function (req, res) {

    let palabra = req.body.palabra;
    let tematicasInt = req.body.tematicas;
    let provincia = req.body.provincia;

    let filtroPorPalabra = [];
    let filtroPorProvincia = [];
    let tematicasConActividades = [];
    let actividadesConTemas = [];
    let actividadesFinales = [];


    actividades.find().toArray(function (err, actividadesDb) {
        if (err !== null) {
            console.log(err);
            res.send(err);
        } else {

            // console.log(tematicasDb)

            filtroPorPalabra = actividadesDb.filter(function (actividad) {
                {
                    if (actividad.titulo.toLowerCase().indexOf(palabra.toLowerCase()) !== -1 || actividad.provincia.toLowerCase().indexOf(palabra.toLowerCase()) !== -1 || actividad.ambito.toLowerCase().indexOf(palabra.toLowerCase()) !== -1 || actividad.ong.toLowerCase().indexOf(palabra.toLowerCase()) !== -1 || actividad.descripcion.toLowerCase().indexOf(palabra.toLowerCase()) !== -1 || actividad.extras.toLowerCase().indexOf(palabra.toLowerCase()) !== -1 || actividad.municipio.toLowerCase().indexOf(palabra.toLowerCase()) !== -1) {
                        return true;
                    }
                }
            })

            if (provincia !== "Seleccione una provincia") {
                filtroPorProvincia = filtroPorPalabra.filter(function (actividad) {
                    {
                        if (actividad.provincia.toLowerCase().indexOf(provincia.toLowerCase()) !== -1) {
                            return true;
                        }
                    }
                })
            } else {
                filtroPorProvincia = filtroPorPalabra;
            }


            tematicas.find().toArray(function (err, tematicasDb) {
                if (err !== null) {
                    console.log(err);
                    res.send(err);
                } else {
                    // console.log(tematicasDb)

                    for (let m = 0; m < tematicasDb.length; m++) {
                        tematicasConActividades.push({ nombre: tematicasDb[m].nombre, palabrasClave: [], actividades: [] })
                    }

                    for (let n = 0; n < tematicasDb.length; n++) {
                        for (let o = 0; o < tematicasConActividades.length; o++) {
                            if (tematicasDb[n].nombre === tematicasConActividades[o].nombre) {
                                tematicasConActividades[o].palabrasClave = tematicasDb[n].palabrasClave
                            }
                        }
                    }

                    for (let i = 0; i < tematicasConActividades.length; i++) {
                        for (let j = 0; j < tematicasConActividades[i].palabrasClave.length; j++) {
                            for (let k = 0; k < filtroPorProvincia.length; k++) {
                                if (filtroPorProvincia[k].titulo.indexOf(tematicasConActividades[i].palabrasClave[j]) !== -1 || filtroPorProvincia[k].ambito.indexOf(tematicasConActividades[i].palabrasClave[j]) !== -1 || filtroPorProvincia[k].descripcion.indexOf(tematicasConActividades[i].palabrasClave[j]) !== -1 || filtroPorProvincia[k].extras.indexOf(tematicasConActividades[i].palabrasClave[j]) !== -1) {


                                    if (tematicasConActividades[i].actividades.length === 0) {

                                        (tematicasConActividades[i].actividades).push(filtroPorProvincia[k])

                                    } else {
                                        let actividadExiste = false;
                                        for (let r = 0; r < tematicasConActividades[i].actividades.length; r++) {

                                            if (filtroPorProvincia[k].titulo === tematicasConActividades[i].actividades[r].titulo && filtroPorProvincia[k].ambito === tematicasConActividades[i].actividades[r].ambito && filtroPorProvincia[k].descripcion === tematicasConActividades[i].actividades[r].descripcion && filtroPorProvincia[k].extras === tematicasConActividades[i].actividades[r].extras) {
                                                actividadExiste = true;
                                            }
                                        }

                                        if (actividadExiste === false) {
                                            (tematicasConActividades[i].actividades).push(filtroPorProvincia[k])
                                        }
                                    }
                                }
                            }
                        }
                    }
                    // console.log("MIRAR AQUÍ----------------------")
                    // console.log(tematicasConActividades)

                    //Creamos el array actividadesConTemas y asignamos a cada actividad los temas correspondientes.

                    for (let t = 0; t < tematicasConActividades.length; t++) {
                        for (let u = 0; u < tematicasConActividades[t].actividades.length; u++) {

                            if (actividadesConTemas.length === 0) {
                                actividadesConTemas.push({ actividad: tematicasConActividades[t].actividades[u], tema: [tematicasConActividades[t].nombre] })

                            } else {
                                let actividadExiste = false;

                                for (let v = 0; v < actividadesConTemas.length; v++) {
                                    let datos = actividadesConTemas[v].actividad
                                    if (datos.titulo === tematicasConActividades[t].actividades[u].titulo && datos.ambito === tematicasConActividades[t].actividades[u].ambito && datos.descripcion === tematicasConActividades[t].actividades[u].descripcion && datos.extras === tematicasConActividades[t].actividades[u].extras && datos.municipio === tematicasConActividades[t].actividades[u].municipio && datos.fechaInicio === tematicasConActividades[t].actividades[u].fechaInicio && datos.fechaFin === tematicasConActividades[t].actividades[u].fechaFin && datos.fechaLimite === tematicasConActividades[t].actividades[u].fechaLimite)  {
                                        actividadExiste = true;
                                        actividadesConTemas[v].tema.push(tematicasConActividades[t].nombre)
                                    }
                                }
                                if (actividadExiste === false) {
                                    actividadesConTemas.push({ actividad: tematicasConActividades[t].actividades[u], tema: [tematicasConActividades[t].nombre] })
                                }
                            }
                        }
                    }




                    // console.log("MIRAR AQUÍ----------------------")
                    // console.log(actividadesConTemas)
                    if (tematicasInt.length === 0) {
                        actividadesFinales = actividadesConTemas;
                    } else {

                        for (let a = 0; a < tematicasInt.length; a++) {
                            for (let b = 0; b < actividadesConTemas.length; b++) {
                                for (let c = 0; c < actividadesConTemas[b].tema.length; c++) {
                                    if (tematicasInt[a] === actividadesConTemas[b].tema[c]) {

                                        if (actividadesFinales.length === 0) {
                                            actividadesFinales.push(actividadesConTemas[b])
                                        } else {
                                            let actividadRepetida = false;

                                            for (let d = 0; d < actividadesFinales.length; d++) {
                                                let datos = actividadesConTemas[b].actividad;
                                                let datosFinales = actividadesFinales[d].actividad;

                                                if (datos.titulo === datosFinales.titulo && datos.ambito === datosFinales.ambito && datos.descripcion === datosFinales.descripcion && datos.extras === datosFinales.extras) {
                                                    actividadRepetida = true;
                                                    
                                                }

                                            }
                                            if(!actividadRepetida) {
                                                actividadesFinales.push(actividadesConTemas[b])
                                            }

                                           
                                        }
                                    }


                                }
                            }
                        }
                    }

                    

                    console.log("MIRAR AQUÍ-----------------------------------------------------------------------------------")
                    console.log(actividadesFinales)
                    res.send(actividadesFinales)
                }
            })


        }

        // console.log("FILTRADO POR PALABRASSSSSSS-----------")
        // console.log(filtroPorPalabra)

        // console.log("FILTRADO POR PROVINCIA----------------------")
        // console.log(filtroPorProvincia)

        // console.log(actividadesDb)
        // res.send(actividadesDb)


    })

})


app.post('/resultadosAfinidades', function (req, res) {

    let afinidadesInt = req.body.afinidades;

    tematicas.find().toArray(function (err, tematicasDb) {
        if (err !== null) {
            console.log(err);
            res.send(err)

        } else {

            let valoresDivision = [];
            let valoresFiltrados = [];
            let valoresSumados = [];
            let valoresFinales = [];
            let tematicasOrdenadas = [];
            let actividadesElegidas = [];
            let actividadesFinales = []
            // Elegimos las tres primeras temáticas según el ranking
            let tematicasElegidas = [];
            let suma;

            for (let i = 0; i < tematicasDb.length; i++) {
                for (let j = 0; j < afinidadesInt.length; j++) {
                    valoresDivision.push(parseInt(afinidadesInt[j].valor) / parseInt(tematicasDb[i].afinidades[j].valor[0]))
                }
            }

            // OJO!! CAMBIAR 4 POR NÚMERO DE SLIDERS 
            for (let h = 0; h < valoresDivision.length; h = h + 4) {
                valoresFiltrados.push(valoresDivision.slice(h, h + 4))
            }

            let arrayGrande = [];
            for (let k = 0; k < valoresFiltrados.length; k++) {
                arrayGrande = valoresFiltrados[k]
                suma = 0;
                for (let l = 0; l < arrayGrande.length; l++) {
                    suma += arrayGrande[l]
                }
                valoresSumados.push(suma)
            }

            // For para obtener valores absolutos. OJO AQUÍ TAMBIÉN!!!

            for (let l = 0; l < valoresSumados.length; l++) {
                valoresFinales.push(Math.abs(4 - valoresSumados[l]))
            }

            for (let m = 0; m < tematicasDb.length; m++) {
                tematicasOrdenadas.push({ nombre: tematicasDb[m].nombre, puntuacion: valoresFinales[m], palabrasClave: [], actividades: [] })
            }

            // Ordenar resultados por puntuación

            tematicasOrdenadas.sort(function (a, b) { return a.puntuacion - b.puntuacion });

            // Incluimos las palabras clave en el array de temáticas ordenadas

            for (let n = 0; n < tematicasDb.length; n++) {
                for (let o = 0; o < tematicasOrdenadas.length; o++) {
                    if (tematicasDb[n].nombre === tematicasOrdenadas[o].nombre) {
                        tematicasOrdenadas[o].palabrasClave = tematicasDb[n].palabrasClave
                    }
                }
            }


            let actividadesFiltradas = [];
            let titulo;
            let ambito;
            let provincia;
            let descripcion;
            let extras;

            actividades.find().toArray(function (err, allActivities) {

                if (err !== null) {
                    console.log(err);
                    res.send(err)

                } else {
                    console.log(allActivities);





                    allActivities.filter(function (datos) {
                        titulo = datos.titulo;
                        ambito = datos.ambito;
                        provincia = datos.provincia;
                        descripcion = datos.descripcion;
                        extras = datos.extras;

                        for (let p = 0; p < tematicasOrdenadas.length; p++) {

                            for (let q = 0; q < tematicasOrdenadas[p].palabrasClave.length; q++) {

                                if (titulo.toLowerCase().indexOf(tematicasOrdenadas[p].palabrasClave[q]) !== -1 || ambito.toLowerCase().indexOf(tematicasOrdenadas[p].palabrasClave[q]) !== -1 || provincia.toLowerCase().indexOf(tematicasOrdenadas[p].palabrasClave[q]) !== -1 || descripcion.toLowerCase().indexOf(tematicasOrdenadas[p].palabrasClave[q]) !== -1 || extras.toLowerCase().indexOf(tematicasOrdenadas[p].palabrasClave[q]) !== -1) {


                                    if (tematicasOrdenadas[p].actividades.length === 0) {
                                        (tematicasOrdenadas[p].actividades).push(datos)

                                    } else {
                                        let actividadExiste = false;
                                        for (let r = 0; r < tematicasOrdenadas[p].actividades.length; r++) {

                                            if (datos.titulo === tematicasOrdenadas[p].actividades[r].titulo && datos.ambito === tematicasOrdenadas[p].actividades[r].ambito && datos.descripcion === tematicasOrdenadas[p].actividades[r].descripcion && datos.extras === tematicasOrdenadas[p].actividades[r].extras) {
                                                actividadExiste = true;
                                            }
                                        }

                                        if (actividadExiste === false) {
                                            (tematicasOrdenadas[p].actividades).push(datos)
                                        }
                                    }

                                }

                            }
                        }

                    });

                    for (let s = 0; s < 4; s++) {
                        tematicasElegidas.push(tematicasOrdenadas[s])

                    };




                    // actividades = [
                    //     {
                    //         actividad: actividad1, 
                    //         temas: [tema4, tema2]
                    //     }, 
                    //     {actividad: actividad5, temas: [tema4, tema1, ...]}
                    // ]

                    for (let t = 0; t < tematicasOrdenadas.length; t++) {
                        for (let u = 0; u < tematicasOrdenadas[t].actividades.length; u++) {

                            if (actividadesElegidas.length === 0) {
                                actividadesElegidas.push({ actividad: tematicasOrdenadas[t].actividades[u], tema: [tematicasOrdenadas[t].nombre] })

                            } else {
                                let actividadExiste = false;

                                for (let v = 0; v < actividadesElegidas.length; v++) {
                                    let datos = actividadesElegidas[v].actividad
                                    if (datos.titulo === tematicasOrdenadas[t].actividades[u].titulo && datos.ambito === tematicasOrdenadas[t].actividades[u].ambito && datos.descripcion === tematicasOrdenadas[t].actividades[u].descripcion && datos.extras === tematicasOrdenadas[t].actividades[u].extras) {
                                        actividadExiste = true;
                                        actividadesElegidas[v].tema.push(tematicasOrdenadas[t].nombre)
                                    }
                                }
                                if (actividadExiste === false) {
                                    actividadesElegidas.push({ actividad: tematicasOrdenadas[t].actividades[u], tema: [tematicasOrdenadas[t].nombre] })
                                }
                            }
                        }
                    }

                    // Esto nos da las actividades de las tres primeras posiciones del ranking y pertenecientes a distintas temáticas
                    for (let x = 0; x < tematicasElegidas.length; x++) {
                        for (let y = 0; y < actividadesElegidas.length; y++) {
                            if (actividadesElegidas[y].tema[0] === tematicasElegidas[x].nombre) {
                                actividadesFinales.push(actividadesElegidas[y])
                            }

                        }

                    }

                    console.log(tematicasOrdenadas);
                    console.log('Estas son las tematicas elegidas --------------------------------------')
                    console.log(tematicasElegidas);
                    console.log('Estass son las actividades elegidadadasdsdas----------------------------------------------------')
                    // console.log(actividadesElegidas)
                    console.log('Estas son las actividadesss finalessss----------------------------------------------------------')
                    console.log(actividadesFinales)

                    res.send(actividadesFinales)
                }
            })

            console.log(valoresFiltrados);
            console.log(valoresDivision);
            console.log(valoresSumados);
            console.log(valoresFinales);





        }

    })

})

app.post('/actividadesPorTematica', function (req, res) {

    let temasInt = req.body.temas;
    let tematicasNew = []
    let actividadesElegidas = [];

    // tematicas.find({ nombre: { $in: temasInt } }).toArray(function (err, tematicasElegidas) {

    //     if (err !== null) {
    //         console.log(err);
    //         res.send(err)

    //     } else {

    //         if (tematicasElegidas.length > 0) {

    //             console.log(tematicasElegidas)
    //             actividades.find().toArray(function (err, allActivities) {
    //                 if (err !== null) {
    //                     console.log(err);
    //                     res.send(err)

    //                 } else {

    tematicas.find().toArray(function (err, allTematicas) {

        if (err !== null) {
            console.log(err);
            res.send(err)
        } else {

            for (let i = 0; i < allTematicas.length; i++) {
                tematicasNew.push({ nombre: allTematicas[i].nombre, palabrasClave: allTematicas[i].palabrasClave, actividades: [] })
            }

            console.log(tematicasNew);

            actividades.find().toArray(function (err, allActivities) {
                if (err !== null) {
                    console.log(err);
                    res.send(err)
                } else {
                    allActivities.filter(function (datos) {
                        titulo = datos.titulo;
                        ambito = datos.ambito;
                        provincia = datos.provincia;
                        descripcion = datos.descripcion;
                        extras = datos.extras;

                        for (let p = 0; p < tematicasNew.length; p++) {

                            for (let q = 0; q < tematicasNew[p].palabrasClave.length; q++) {

                                if (titulo.toLowerCase().indexOf(tematicasNew[p].palabrasClave[q]) !== -1 || ambito.toLowerCase().indexOf(tematicasNew[p].palabrasClave[q]) !== -1 || provincia.toLowerCase().indexOf(tematicasNew[p].palabrasClave[q]) !== -1 || descripcion.toLowerCase().indexOf(tematicasNew[p].palabrasClave[q]) !== -1 || extras.toLowerCase().indexOf(tematicasNew[p].palabrasClave[q]) !== -1) {


                                    if (tematicasNew[p].actividades.length === 0) {
                                        (tematicasNew[p].actividades).push(datos)

                                    } else {
                                        let actividadExiste = false;
                                        for (let r = 0; r < tematicasNew[p].actividades.length; r++) {

                                            if (datos.titulo === tematicasNew[p].actividades[r].titulo && datos.ambito === tematicasNew[p].actividades[r].ambito && datos.descripcion === tematicasNew[p].actividades[r].descripcion && datos.extras === tematicasNew[p].actividades[r].extras) {
                                                actividadExiste = true;
                                            }
                                        }

                                        if (actividadExiste === false) {
                                            (tematicasNew[p].actividades).push(datos)
                                        }
                                    }

                                }

                            }
                        }

                    });


                }

            })


            console.log('Estas son las temáticas seleccionadas con sus actividades')
            console.log(tematicasNew)
        }
    })

})

app.post('/actividadesPorAfinidades', function (req, res) {

    let provinciaInt = req.body.provincias;

    // Dólar in compara en base de datos con el contenido de un array
    actividades.find({ provincia: { $in: provinciaInt } }).toArray(function (err, result) {

        if (err !== null) {
            console.log(err);
            res.send(err)

        } else {

            if (result.length > 0) {
                res.send(result)
                console.log(result)
            }

        }
    })





})







app.listen(3000)