const express = require('express');
const mongodb = require('mongodb');
// const cors = require('cors');
const cookieParser = require('cookie-parser');

const MongoClient = mongodb.MongoClient;
const app = express();

app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(cors());

let db;
let actividades;
let tematicas;
let ods;

MongoClient.connect('mongodb+srv://cocorugo:bbkBoo1camp@cluster0-06yeb.mongodb.net/idatis?retryWrites=true&w=majority', function (err, client) {
    if (err !== null) {
        console.log(err);
        return err;
    } else {
        db = client.db('idatis');
        actividades = db.collection('actividades');
        tematicas = db.collection('tematicas');
        ods = db.collection('ods');
    }
});

app.get('/prueba', function (req, res) {
    // leer datos del cookie que llegan con la peticion (req)
    let datosDelCookie;
    if (req.cookies.persona !== undefined) {
        datosDelCookie = req.cookies.persona;
        console.log(datosDelCookie.palabra);
    }

    // añadir datos al cookie que se envia en la respuesta (res)
    let preferencias = {
        palabra: 'volunting',
        provincia: 'kokorugo',
        tematica: 'libre'
    }
    res.cookie('persona', preferencias, { maxAge: 360000 });
    res.send('hola');
})

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

    //distinct descarta todos los datos duplicados
    actividades.distinct("provincia", function (err, provincias) {
        if (err !== null) {
            console.log(err);
            res.send(err);
        } else {
            console.log(provincias)
            res.send(provincias)
        }

    })
});

app.post('/buscador', function (req, res) {

    let palabra = req.body.palabra;
    let tematicasInt = req.body.tematicas;
    let provincia = req.body.provincia;
    console.log(palabra);
    console.log(tematicasInt);
    console.log(provincia);
    let datosDelCookie;
    if (req.cookies.usuario !== undefined && req.body.busquedaActiva === false) {
        if (req.body.palabra === '' && req.body.tematicas.length === 0 && req.body.provincia === '') {
            palabra = req.cookies.usuario.palabra;
            tematicasInt = req.cookies.usuario.tematica;
            provincia = req.cookies.usuario.provincia;
        } else if (req.body.palabra !== '' && req.body.tematicas.length !== 0 && req.body.provincia === '') {
            provincia = req.body.provincia;
        } else if (req.body.palabra !== '' && req.body.tematicas.length === 0 && req.body.provincia !== '') {
            tematicasInt = req.body.tematicas;
        } else if (req.body.palabra === '' && req.body.tematicas.length !== 0 && req.body.provincia !== '') {
            palabra = req.body.palabra;
        } else if (req.body.palabra !== '' && req.body.tematicas.length === 0 && req.body.provincia === '') {
            tematicasInt = req.body.tematicas;
            provincia = req.body.provincia;
        } else if (req.body.palabra === '' && req.body.tematicas.length !== 0 && req.body.provincia === '') {
            palabra = req.body.palabra;
            provincia = req.body.provincia;
        } else if (req.body.palabra === '' && req.body.tematicas.length === 0 && req.body.provincia !== '') {
            palabra = req.body.palabra;
            tematicasInt = req.body.tematicas;
        }
    };
    let preferencias = {
        palabra: palabra,
        provincia: provincia,
        tematica: tematicasInt
    }

    res.cookie('usuario', preferencias, { maxAge: 360000 });
    // res.send('hola');

    let filtroPorPalabra = [];
    let filtroPorProvincia = [];
    let tematicasConActividades = [];
    let actividadesConTemas = [];
    let actividadesConOtras = [];
    let actividadesJuntas = []
    let actividadesFinales = [];
    let actividadesconOds = [];



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
                        tematicasConActividades.push({ nombre: tematicasDb[m].nombre, palabrasClave: [], actividades: [], imagen: tematicasDb[m].imagen })
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
                                actividadesConTemas.push({ actividad: tematicasConActividades[t].actividades[u], tema: [tematicasConActividades[t].nombre], logotema: [tematicasConActividades[t].imagen] })

                            } else {
                                let actividadExiste = false;

                                for (let v = 0; v < actividadesConTemas.length; v++) {
                                    let datos = actividadesConTemas[v].actividad
                                    if (datos.titulo === tematicasConActividades[t].actividades[u].titulo && datos.ambito === tematicasConActividades[t].actividades[u].ambito && datos.descripcion === tematicasConActividades[t].actividades[u].descripcion && datos.extras === tematicasConActividades[t].actividades[u].extras && datos.municipio === tematicasConActividades[t].actividades[u].municipio && datos.fechaInicio === tematicasConActividades[t].actividades[u].fechaInicio && datos.fechaFin === tematicasConActividades[t].actividades[u].fechaFin && datos.fechaLimite === tematicasConActividades[t].actividades[u].fechaLimite) {
                                        actividadExiste = true;
                                        actividadesConTemas[v].tema.push(tematicasConActividades[t].nombre)
                                        actividadesConTemas[v].logotema.push(tematicasConActividades[t].imagen)
                                    }
                                }
                                if (actividadExiste === false) {
                                    actividadesConTemas.push({ actividad: tematicasConActividades[t].actividades[u], tema: [tematicasConActividades[t].nombre], logotema: [tematicasConActividades[t].imagen] })
                                }
                            }
                        }
                    }

                    // Vamos a añadir las actividades correspondientes a la categoría otras. Para ello comparamos el array de actividades con temas asignados con el array de filtro por provincia
                    for (let z = 0; z < filtroPorProvincia.length; z++) {
                        let actividadRepe = false
                        for (let x = 0; x < actividadesConTemas.length; x++) {

                            let datos = actividadesConTemas[x].actividad;

                            if (datos.titulo === filtroPorProvincia[z].titulo && datos.ambito === filtroPorProvincia[z].ambito && datos.descripcion === filtroPorProvincia[z].descripcion && datos.extras === filtroPorProvincia[z].extras && datos.municipio === filtroPorProvincia[z].municipio && datos.fechaInicio === filtroPorProvincia[z].fechaInicio && datos.fechaFin === filtroPorProvincia[z].fechaFin && datos.fechaLimite === filtroPorProvincia[z].fechaLimite) {
                                actividadRepe = true
                            }
                        }
                        if (actividadRepe === false) {
                            actividadesConOtras.push({ actividad: filtroPorProvincia[z], tema: ['Otras'], logotema: [] })
                        }



                    }

                    actividadesJuntas = actividadesConTemas.concat(actividadesConOtras)

                    // console.log("MIRAR AQUÍ----------------------")
                    // console.log(actividadesConTemas)
                    if (tematicasInt.length === 0 || tematicasInt.length === 12) {
                        actividadesFinales = actividadesJuntas;
                    } else {

                        for (let a = 0; a < tematicasInt.length; a++) {
                            for (let b = 0; b < actividadesJuntas.length; b++) {
                                for (let c = 0; c < actividadesJuntas[b].tema.length; c++) {
                                    if (tematicasInt[a] === actividadesJuntas[b].tema[c]) {

                                        if (actividadesFinales.length === 0) {
                                            actividadesFinales.push(actividadesJuntas[b])
                                        } else {
                                            let actividadRepetida = false;

                                            for (let d = 0; d < actividadesFinales.length; d++) {
                                                let datos = actividadesJuntas[b].actividad;
                                                let datosFinales = actividadesFinales[d].actividad;

                                                if (datos.titulo === datosFinales.titulo && datos.ambito === datosFinales.ambito && datos.descripcion === datosFinales.descripcion && datos.extras === datosFinales.extras && datos.municipio === datosFinales.municipio && datos.fechaInicio === datosFinales.fechaInicio && datos.fechaFin === datosFinales.fechaFin && datos.fechaLimite === datosFinales.fechaLimite) {
                                                    actividadRepetida = true;

                                                }

                                            }
                                            if (!actividadRepetida) {
                                                actividadesFinales.push(actividadesJuntas[b])
                                            }


                                        }
                                    }


                                }
                            }
                        }
                    }

                    ods.find().toArray(function (err, odsDb) {
                        if (err !== null) {
                            console.log(err);
                            res.send(err);
                        } else {

                            for (let q = 0; q < actividadesFinales.length; q++) {
                                actividadesconOds.push({
                                    actividad: actividadesFinales[q].actividad, tema: actividadesFinales[q].tema, logotema: actividadesFinales[q].logotema,
                                    ods: []
                                });
                            };

                            for (let f = 0; f < odsDb.length; f++) {
                                for (let e = 0; e < odsDb[f].palabrasClave.length; e++) {
                                    for (let g = 0; g < actividadesconOds.length; g++) {
                                        if (actividadesconOds[g].actividad.titulo.indexOf(odsDb[f].palabrasClave[e]) !== -1 || actividadesconOds[g].actividad.ambito.indexOf(odsDb[f].palabrasClave[e]) !== -1 || actividadesconOds[g].actividad.descripcion.indexOf(odsDb[f].palabrasClave[e]) !== -1 || actividadesconOds[g].actividad.extras.indexOf(odsDb[f].palabrasClave[e]) !== -1) {


                                            if (actividadesconOds[g].ods.length === 0) {

                                                actividadesconOds[g].ods.push({
                                                    nombre: odsDb[f].nombre,
                                                    logo: odsDb[f].imagen.url
                                                })

                                            } else {
                                                let odsExiste = false;
                                                for (let r = 0; r < actividadesconOds[g].ods.length; r++) {

                                                    if (actividadesconOds[g].ods[r].nombre === odsDb[f].nombre) {
                                                        odsExiste = true;
                                                    }
                                                }

                                                if (odsExiste === false) {
                                                    actividadesconOds[g].ods.push({
                                                        nombre: odsDb[f].nombre,
                                                        logo: odsDb[f].imagen.url
                                                    });
                                                }
                                            }
                                        }
                                    }
                                }

                            }

                            res.send(actividadesconOds);
                        }
                    });

                    console.log("MIRAR AQUÍ-----------------------------------------------------------------------------------")
                    console.log(actividadesConOtras.length)
                    console.log('Mirar aquí ---------------------------------')






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

    let valoresDivision = [];
    let valoresFiltrados = [];
    let valoresSumados = [];
    let valoresFinales = [];
    let tematicasOrdenadas = [];
    let actividadesElegidas = [];
    let actividadesFinales = [];
    let actividadesconOds = [];
    // Elegimos las tres primeras temáticas según el ranking
    let tematicasElegidas = [];
    let suma;

    tematicas.find().toArray(function (err, tematicasDb) {
        if (err !== null) {
            console.log(err);
            res.send(err)

        } else {

            // aqui funcionaba BORRAR ESTE COMENTARIO


            for (let i = 0; i < tematicasDb.length - 1; i++) {
                for (let j = 0; j < afinidadesInt.length; j++) {
                    valoresDivision.push(parseInt(afinidadesInt[j].valor) / parseInt(tematicasDb[i].afinidades[j].valor))
                }
            }

            // OJO!! CAMBIAR 4 POR NÚMERO DE SLIDERS
            for (let h = 0; h < valoresDivision.length; h = h + 8) {
                valoresFiltrados.push(valoresDivision.slice(h, h + 8))
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
                valoresFinales.push(Math.abs(8 - valoresSumados[l]))
            }

            for (let m = 0; m < tematicasDb.length; m++) {
                tematicasOrdenadas.push({ nombre: tematicasDb[m].nombre, puntuacion: valoresFinales[m], palabrasClave: [], actividades: [], imagen: tematicasDb[m].imagen })
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

            actividades.find().toArray(async function (err, allActivities) {

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

                    for (let t = 0; t < tematicasOrdenadas.length; t++) {
                        for (let u = 0; u < tematicasOrdenadas[t].actividades.length; u++) {

                            if (actividadesElegidas.length === 0) {
                                actividadesElegidas.push({ actividad: tematicasOrdenadas[t].actividades[u], tema: [tematicasOrdenadas[t].nombre], logotema: [tematicasOrdenadas[t].imagen] })

                            } else {
                                let actividadExiste = false;

                                for (let v = 0; v < actividadesElegidas.length; v++) {
                                    let datos = actividadesElegidas[v].actividad
                                    if (datos.titulo === tematicasOrdenadas[t].actividades[u].titulo && datos.ambito === tematicasOrdenadas[t].actividades[u].ambito && datos.descripcion === tematicasOrdenadas[t].actividades[u].descripcion && datos.extras === tematicasOrdenadas[t].actividades[u].extras) {
                                        actividadExiste = true;
                                        actividadesElegidas[v].tema.push(tematicasOrdenadas[t].nombre)
                                        actividadesElegidas[v].logotema.push(tematicasOrdenadas[t].imagen)
                                    }
                                }
                                if (actividadExiste === false) {
                                    actividadesElegidas.push({ actividad: tematicasOrdenadas[t].actividades[u], tema: [tematicasOrdenadas[t].nombre], logotema: [tematicasOrdenadas[t].imagen] })
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



                    let odsDb;
                    try {
                        odsDb = await ods.find().toArray();
                    } catch (e) {
                        console.log(e);
                        res.send(e);
                    }

                    for (let q = 0; q < actividadesFinales.length; q++) {
                        actividadesconOds.push({
                            actividad: actividadesFinales[q].actividad, tema: actividadesFinales[q].tema, logotema: actividadesFinales[q].logotema,
                            ods: []
                        });
                    };
                    //
                    for (let f = 0; f < odsDb.length; f++) {
                        for (let e = 0; e < odsDb[f].palabrasClave.length; e++) {
                            for (let g = 0; g < actividadesconOds.length; g++) {
                                if (actividadesconOds[g].actividad.titulo.indexOf(odsDb[f].palabrasClave[e]) !== -1 || actividadesconOds[g].actividad.ambito.indexOf(odsDb[f].palabrasClave[e]) !== -1 || actividadesconOds[g].actividad.descripcion.indexOf(odsDb[f].palabrasClave[e]) !== -1 || actividadesconOds[g].actividad.extras.indexOf(odsDb[f].palabrasClave[e]) !== -1) {


                                    if (actividadesconOds[g].ods.length === 0) {

                                        actividadesconOds[g].ods.push({
                                            nombre: odsDb[f].nombre,
                                            logo: odsDb[f].imagen.url
                                        })

                                    } else {
                                        let odsExiste = false;
                                        for (let r = 0; r < actividadesconOds[g].ods.length; r++) {

                                            if (actividadesconOds[g].ods[r].nombre === odsDb[f].nombre) {
                                                odsExiste = true;
                                            }
                                        }

                                        if (odsExiste === false) {
                                            actividadesconOds[g].ods.push({
                                                nombre: odsDb[f].nombre,
                                                logo: odsDb[f].imagen.url
                                            });
                                        }
                                    }
                                }
                            }
                        }

                    }
                    res.send(actividadesconOds);

                    // console.log(tematicasOrdenadas);
                    // console.log('Estas son las tematicas elegidas --------------------------------------')
                    // console.log(tematicasElegidas);
                    // console.log('Estass son las actividades elegidadadasdsdas----------------------------------------------------')
                    // // console.log(actividadesElegidas)
                    // console.log('Estas son las actividadesss finalessss----------------------------------------------------------')

                    // console.log(actividadesFinales)


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