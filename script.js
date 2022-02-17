// 'setTimeout' container
let timeoutContainer;


$(document).ready(function()
{
    $("#queryById").on("click", async function(event) 
    {
        $("#ledgerIdContainer").slideDown();
        $("#inputContainer, #followingTick, #followingTick+label").slideUp();

        $("#queryById").css("background-color", "#06c3fd");
        $("#queryByParams").css("background-color", "#757575");

        $("#queryByParams").attr("enabled", "false");
        $("#queryById").attr("enabled", "true");
    });

    
    $("#queryByParams").on("click", async function(event) 
    {
        $("#ledgerIdContainer").slideUp();
        $("#inputContainer, #followingTick, #followingTick+label").slideDown();

        $("#queryById").css("background-color", "#757575");
        $("#queryByParams").css("background-color", "#06c3fd");

        $("#queryByParams").attr("enabled", "true");
        $("#queryById").attr("enabled", "false");
    });


    $("#sendQueryBtn").on("click", async function(event) 
    {  
        event.preventDefault(); 

        let database = "mychannel_fateh";

        // values of inputs
        let ledgerId = $('#ledgerId').val();

        let queryParams = {
            rdrname: $('#rdrname').val().trim(),
            lat: $('#lat').val().trim(),
            lon: $('#lon').val().trim(),
            alt: $('#alt').val().trim(),
            id: $('#targetId').val().trim(),
            speed: $('#speed').val().trim(),
            time: $('#time').val().trim(),
            type: $('#type').val().trim(),
        }

        let following = $("#followingTick").prop("checked");
        let intervalGap = 5000;    // update table ny this interval
    

        // if the query is by 'Ledger ID'
        if ($("#queryById").attr("enabled") === "true") 
        {
            if (!ledgerId.trim()) {
                return alert("The Ledger ID MUST have value.")
            }

            queryById(database, ledgerId);
        }

        // if the query is by other params
        else if ($("#queryByParams").attr("enabled") === "true") 
        {
            if (!queryParams.rdrname && !queryParams.lat && !queryParams.lon && !queryParams.alt 
            && !queryParams.id && !queryParams.speed && !queryParams.time && !queryParams.type) {
                return alert("At least one field MUST be filled.");
            }

            // remove empty fields from the queryParams object
            for (let key in queryParams) {
                if (!queryParams[key]) {
                    delete queryParams[key];
                }
            }

            queryByParams(database, queryParams, following, intervalGap);
        }
    });


    $("#abortBtn").on("click", async function(event) {
        event.preventDefault(); 
        clearTimeout(timeoutContainer);
        showHideLoading("abort")
    });
});



// **************************************************************************************************
//                                              functions
// **************************************************************************************************

function queryById(database, ledgerId) 
{  
    $.ajax(
        {
        method: "GET",
        url: `http://127.0.0.1:3000/queryById/${database}/${ledgerId}`,

        beforeSend: function() {
            showHideLoading("loading");
            $('#tableBody tr:nth-child(1n+1)').remove();
        },

        success: function(data) {
            showHideLoading("doneById");
            addDataToTable([data.data]);
        },

        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
            alert("An error occurred in query process.\nSee the console for more info.");
            showHideLoading("doneById");
        }
    });
}


function queryByParams(database, queryParams, following, intervalGap) 
{  
    $.ajax(
        {
        method: "POST",
        url: "http://127.0.0.1:3000/queryByParams",

        data: {
            database,
            queryParams
        },

        beforeSend: function() {
            showHideLoading("loading");
            $('#tableBody tr:nth-child(1n+1)').remove();
        },

        success: function(data) 
        {
            if (following) showHideLoading("doneByParams_f");
            else showHideLoading("doneByParams");

            addDataToTable(data.data.docs);

            if (following) {
                timeoutContainer = setTimeout(()=> {
                    queryByParams(database, queryParams, following, intervalGap) 
                }, intervalGap);
            }
        },

        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
            alert("An error occurred in query process.\nSee the console for more info.");
            showHideLoading("doneByParams");
        }
    });
}


function addDataToTable(data) 
{  
    let tableBody = $('#tableBody');

    for (let i = 0; i < data.length; i++)
    {    
        // 'td's of the row
        let rowNum = `<td>${i+1}</td>`;
        let id = `<td>${data[i]._id}</td>`;
        let rdrname = `<td>${data[i].rdrname}</td>`;
        let lat = `<td>${data[i].lat}</td>`;
        let lon = `<td>${data[i].lon}</td>`;
        let alt = `<td>${data[i].alt}</td>`;
        let targetId = `<td>${data[i].id}</td>`;
        let speed = `<td>${data[i].speed}</td>`;
        let time = `<td>${data[i].time}</td>`;
        let type = `<td>${data[i].type}</td>`;
    
        // glue the 'td's together
        let gluedElems = rowNum + id + rdrname + lat + lon + alt + targetId + speed + time + type;
    
        // put data in a 'tr'
        let markup = `<tr id="${id}">${gluedElems}</tr>`;
    
        tableBody.append(markup);
    }
}


// convert timestamp to time(hh:mm:ss)
function convetTimestampToTime(ts) 
{  
    let date = new Date(ts);

    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();
    
    let time = hour + ":" + minute + ":" + second;
    return time;
}


function showHideLoading(status) 
{  
    if (status === "loading") {
        $("#sendQueryBtn").css("display", "none");
        $("#abortBtn").css("display", "none");
        $("#loading").css("display", "block");

        $("#followingTick, #followingTick+label").slideUp();
    }
    
    else if (status === "doneById") {
        $("#loading").css("display", "none");
        $("#sendQueryBtn").css("display", "block");
    }

    else if (status === "doneByParams") {
        $("#sendQueryBtn").css("display", "block");
        $("#abortBtn").css("display", "none");
        $("#loading").css("display", "none");

        $("#followingTick, #followingTick+label").slideDown();
    }

    // '_f' means 'following' option is enabled
    else if (status === "doneByParams_f") {
        $("#sendQueryBtn").css("display", "none");
        $("#abortBtn").css("display", "block");
        $("#loading").css("display", "none");
    }

    else if (status === "abort") {
        $("#sendQueryBtn").css("display", "block");
        $("#abortBtn").css("display", "none");
        $("#loading").css("display", "none");

        $("#followingTick, #followingTick+label").slideDown();
    }
}