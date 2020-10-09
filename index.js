const express = require('express');
const request = require('request');
const moment = require('moment');

const app = express();

app.use(express.json());

//Routes
app.get('/', (req, res)=>{
    res.send("Hello World");
    console.log("-----------------------------------");
    console.log("Logger working fine")
    console.log("-----------------------------------");

});

app.get('/access_token', access, (req, res)=>{

        res.status(200)
            .json({
                access_token : req.access_token
            })
    
})


//Lipa Na MPESA STK PUSH
app.get('/stk',access, (req, res)=>{
    
    let endpoint = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
    let auth = `Bearer ${req.access_token}`;
    let shortcode = 174379;
    let passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
    
    
    let timestamp = moment().format('YYYYMMDDHHmmss');
    
    
    const password = new Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64')

    request(
        {
            url: endpoint,
            method: "POST",
            headers: {
                'Authorization': auth
            },

            json: {
                "BusinessShortCode": "174379",
                "Password": password,
                "Timestamp": `${timestamp}`,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": "1",
                "PartyA": "254740776347",
                "PartyB": "174379",
                "PhoneNumber": "254740776347",
                "CallBackURL": "https://mpesa-nodejs.herokuapp.com/stk_callback",
                "AccountReference": "123TEST ",
                "TransactionDesc": "Process activation"
            }
        },

        function(error, response, body){

            if(error){
                console.log(error)
            }

            res.status(200)
                .json(body)

        }
    )
})



app.post('/stk_callback', (req, res)=>{
    console.log("-------STK-------");
    console.log(req.Body);
    console.log(req.Body.stkCallback.callbackMetadata);
    res.status(200)
        .json(req.Body.stkCallback.callbackMetadata)
        .json(req.body)
});










function access(req, res, next){
    //Acess token

    let consumer_key = 'i5FEMy6A8KIA7eHmKOexqpdXfnfnF1bq';
    let consumer_secret = 'v5MGNcGezQVG71dQ'

    let url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
    let auth = new Buffer.from(`${consumer_key}:${consumer_secret}`).toString('base64');

    request(  
        {
            url: url,
            headers: {
                "Authorization": `Basic ${auth}`
            }
        },
        (error, response, body)=>{
            if(error){
                console.log(error)
            }else{
                req.access_token = JSON.parse(body).access_token
                next();
            }
        }
    );
}


const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`App listening on port ${port}`);
})