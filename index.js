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



                                    // Cómo comprobar si existe en el array el objeto que queremos introducir???? Hacer comparación con todos los atributos (no sólamente por el título)
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
                    for (let x = 0; x < tematicasElegidas.length; x++){
                            for (let y=0;y<actividadesElegidas.length;y++){
                                if (actividadesElegidas[y].tema[0] === tematicasElegidas[x].nombre){
                                    actividadesFinales.push(actividadesElegidas[y])
                                }

                            }

                    }

                    console.log(tematicasOrdenadas);
                    console.log('Estas son las tematicas elegidas --------------------------------------')
                    console.log(tematicasElegidas);
                    console.log('Estass son las actividades elegidadadasdsdas----------------------------------------------------')
                    // console.log(actividadesElegidas)
                    // console.log('Estas son las actividadesss finalessss----------------------------------------------------------')
                    // console.log(actividadesFinales)

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