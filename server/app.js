const express = require('express');
const app = express();

const NodeCouchDb = require('node-couchdb');  


app.use(express.json());  // parse application/json
app.use(express.json({type: 'application/vnd.api+json'}));  // parse application/vnd.api+json as json
app.use(express.urlencoded({ extended: true }));  // parse application/x-www-form-urlencoded

// Enabling CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});



// node-couchdb instance talking to external service
const couch = new NodeCouchDb({
    host: '185.235.43.55',
    protocol: 'http',
    port: 5984
});


app.get('/queryById/:db/:assetID', async (req, res) =>
{
    let assetID = req.params.assetID;
    let database = req.params.db;

    if (!database) {
        return res.status(400).send("No database name received for queryById.")
    }
    else if (!assetID) {
        return res.status(400).send("No ID received for queryById.")
    }


    await couch.get(database, assetID).then(({data, headers, status}) => {
        return res.send({data, headers, status});
    }, err => {
        // either request error occured
        // ...or err.code=EDOCMISSING if document is missing
        // ...or err.code=EUNKNOWN if statusCode is unexpected
        console.log(err);
        return res.status(400).send(err);
    });
});


app.post('/queryByParams', async (req, res) =>
{
    let database = req.body.database;
    let queryParams = req.body.queryParams;

    if (!database) {
        return res.status(400).send("No database name received for queryByParams.")
    }
    else if (!queryParams) {
        return res.status(400).send("No parameter received for queryByParams.")
    }


    const mangoQuery = {
        selector: queryParams,
        limit: 100
    };
    const parameters = {};
    
    couch.mango(database, mangoQuery, parameters).then(({data, headers, status}) => {
        return res.send({data, headers, status});
    }, err => {
        // either request error occured
        // ...or err.code=EDOCMISSING if document is missing
        // ...or err.code=EUNKNOWN if statusCode is unexpected
        console.log(err);
        return res.status(400).send(err);
    });


    // const startKey = ["Ann"];
    // // const endKey = ["George"];
    // const viewUrl = "mychannel_fateh";
    
    // const queryOptions = {
    //     descending: true
    // };
    
    // couch.get(database, viewUrl, queryOptions).then(({data, headers, status}) => {
    //     return res.send({data, headers, status});
    // }, err => {
    //     console.log(err);
    //     return res.status(400).send(err);
    // });
});




// couch.listDatabases().then(dbs => dbs.map(...), err => {
//     // request error occured
// });

// couch.listDatabases().then(function(dbs){  
//     console.log(dbs);  
// }); 


// couch.get("mychannel_fateh", "T_ME").then(({data, headers, status}) => 
// {
//     console.log(data);
// }, err => {
//     // either request error occured
//     // ...or err.code=EDOCMISSING if document is missing
//     // ...or err.code=EUNKNOWN if statusCode is unexpected
//     throw err;
// });


// let carId = "T_ME";
    
// data: {
//     fcn: "createCar",
//     peers: ["peer0.org1.example.com","peer0.org2.example.com"],
//     chaincodeName: "fateh",
//     channelName: "mychannel",
//     args: [`${carId}`, "R50", "50.000000", "30.000000", "6000", "199", "17:20", "Unkonown", "fateh"]
// }


// const dbName = "mychannel_fateh";
// const mangoQuery = {
//     selector: {
//         // $gte: {speed: '199'},
//         // $lt: {firstname: 'George'}
//         // lat: '50.000000'
//         speed: '199'
//     }
// };
// const parameters = {};
 
// couch.mango(dbName, mangoQuery, parameters).then(({data, headers, status}) => {
//     // data is json response
//     // headers is an object with all response headers
//     // status is statusCode number
//     console.log(data);
// }, err => {
//     // either request error occured
//     // ...or err.code=EDOCMISSING if document is missing
//     // ...or err.code=EUNKNOWN if statusCode is unexpected
//     console.log(err);
// });




app.listen(3000, 
    console.log(`\n**************************************************\n\n<--- Server started listening on Port 3000 --->\n\n**************************************************\n`)
);