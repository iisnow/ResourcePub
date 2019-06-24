"use strict"

const electron = require("electron"); 
const ipcr = electron.ipcRenderer; 

ipcr.on('downloadconvert', function (event, gamedata, arr) {
    if (arr[1] == arr[2]){
        $('#cornerinformation').text('DOWNLOAD & CONVERT COMPLETE, COMBINING...');
        return;
    }
    $('#cornerinformation').text(arr[1] + '/' + arr[2] + ', ' + arr[0] + ' SUCCESS, ' + (arr[1] - arr[0]) + ' FAIL');
    majsoulpaipuanalyzer.ipcrsend = true;
    majsoulpaipuanalyzer.convertsomepaipu([gamedata]);
});