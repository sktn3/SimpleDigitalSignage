
function getID(){
  return "1F-HGOFG7uXazixDtHU2WiYxpe_pmqOTVknItLuPOF54";
}

function sortOnList(){
  var ss = SpreadsheetApp.openById(getID());
  var sheet = ss.getSheetByName("log"); 
  
  sheet.getRange(2,1,sheet.getLastRow()-1,10).sort([{column: 1, ascending: false}]);
}

function onOpen() {
  // メニューバーにカスタムメニューを追加
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [{
    name : "logを並び替え",
    functionName : "sortOnList"
  },{
    name : "JSON clear",
    functionName : "clearCashOnActiveSheet"
  }];
  spreadsheet.addMenu("MyMenu", entries);
  //gotoLastRow();
};

function onEdit(e) {
  clearCashOnActiveSheet();
}

function clearCashOnActiveSheet(){
  const ss = SpreadsheetApp.getActiveSheet();
  //Browser.msgBox(ss.getName(), Browser.Buttons.OK);
  clearCash(ss.getName());
}


function clearCash(sheetName){
  Logger.log("clearListsCash");
  const props = PropertiesService.getScriptProperties();
  const cash = props.setProperty("JSON_"+sheetName,"");
}




//debugLog log
function debug(ary){
  
  var mode = true;
  //var mode = false;
  
  var ss = SpreadsheetApp.openById(getID());
  var shTest = ss.getSheetByName("log");
  
  if(mode){
    try{
      shTest.appendRow(ary);
    }catch(e){
      shTest.appendRow([new Date(),"Err","can not append debug msg"]);
    }
  }
}

//GET
function doGet(e){
  var ss = SpreadsheetApp.openById(getID());
  
  var me = "";
  try{ me = e.parameters.me[0]; }catch(e){ }

  var sh = "";
  try{ sh = e.parameters.sh[0]; }catch(e){ }

  var callback = "";
  try{ callback = e.parameters.callback[0]; }catch(e){ }

  var d = new Date();

  let sheet;
  try{
    sheet = ss.getSheetByName(sh);
  }catch(e){
    //debug([d,"Err",sh,callback,me,"指定されたシートがおかしい。"+e]);
    return ContentService.createTextOutput("指定された["+sh+"]がおかしい").setMimeType(ContentService.MimeType.TEXT);
  }
  
  try{
    //debug([d,"GET",sh,callback,me]);
    if(callback==""){
      return ContentService.createTextOutput(getJsonFromListOrCash(sheet)).setMimeType(ContentService.MimeType.JSON);
    }else{
      return ContentService.createTextOutput(getJsonp(sheet,callback)).setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
  }catch(e){
    //debug([d,"Err",sh,callback,me,"JSONPが作れなかった。"+e]);
    return ContentService.createTextOutput("JSONPが作れなかった").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  
  //return ContentService.createTextOutput(sjis).setMimeType(ContentService.MimeType.CSV);
}


function deleteOldLog(){
  var shlog = SpreadsheetApp.openById(getID()).getSheetByName("log");
  var logs = shlog.getRange(2,1,shlog.getLastRow(),6).getValues();

  var now = new Date();
  var old = shlog.getRange("J4").getValue();
  
  var d;
  var row = 2;
  for(var i=0; i<logs.length; i++){
    d = logs[i][0];
    if(d < old){
      try{
        shlog.deleteRow(row); //行を消せたので、次のrowは同じ番号
      }catch(e){
        row++;
      }
    }else{
      row++;
    }
    
  }
  
}



//ボタン
function checkALL(){
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  Browser.msgBox(getJsonFromList(sheet), Browser.Buttons.OK);
}

function getJsonp(sheet,callbackStr){
  return callbackStr + "(" + getJsonFromListOrCash(sheet) + ", 0);"
}

function checkURL(str){  
  if(str.match(/http/) == null){ return false; }
  if(str.match(/javascript/) != null){ return false; }
  return true;
}

function makeDate(date){
  if(checkDate(date)){
    var d = new Date(date);
    
    var min = new String(d.getMinutes());
    if(min.length <= 1){ min = "0"+min; }
    
    var sec = new String(d.getSeconds());
    if(sec.length <= 1){ sec = "0"+sec; }
    
    return d.getFullYear()+"/"+(d.getMonth()+1)+"/"+d.getDate()+" "+d.getHours()+":"+min+":"+sec;
  }else{
    return "Err";
  }
}

function checkDate(date){
  if(date == ""){ return false; }
  
  try{
    var d = new Date(date);
    return true;
  }catch(e){
    return false;
  }
}

function setOK(sheet,row){
  sheet.getRange(parseInt(row) + 2,6).setValue("OK");
  sheet.getRange(parseInt(row) + 2,7).setValue("");
}

function setNG(sheet,row,comment){
  sheet.getRange(parseInt(row) + 2,6).setValue("NG");
  sheet.getRange(parseInt(row) + 2,7).setValue(comment);
}

function clearStatus(sheet){
  sheet.getRange(2,6,sheet.getMaxRows(),2).clearContent();
}

function sliceKetsuCanma(str){
  return str.replace(/,\s*$/,"");
}

function getJsonFromListOrCash(sheet){
  const props = PropertiesService.getScriptProperties();
  const cash = props.getProperty("JSON_"+sheet.getName());
  if(cash != "" && typeof cash === 'string'){
    Logger.log("cash hit!");
    return cash;
  }else{
    Logger.log("cash Nothing");
    let json = getJsonFromList(sheet);
    props.setProperty("JSON_"+sheet.getName(), json);
    return json;
  }

}


function getJsonFromList(sheet){
  var json = "";
  var urls = sheet.getRange(2,2,sheet.getMaxRows()-1,6).getValues();
  
  clearStatus(sheet);
  
  for(var n in urls){        
    var checkFlag = true;
    var temp = "";

    var url = urls[n][0];
    var interval = parseInt(urls[n][1]);
    var dateS = urls[n][2];
    var dateE = urls[n][3];
    
    if(url == ""){
      continue;
    }

    setOK(sheet,n);

    if(!checkURL(url)){
      setNG(sheet,n,"URLがNGでスキップします");
      checkFlag = false;
    }
    
    if(interval == ""){
      setNG(sheet,n,"インターバルがNGでスキップします");
      checkFlag = false;
    }
    
    temp = '{"url":"'+url+'", "interval":'+interval+'';
    
    if(dateS!="" && !checkDate(dateS)){
      setNG(sheet,n,"掲載開始がNGでスキップします");
      checkFlag = false;
    }else if(dateS == ""){
      //空はスキップ
    }else{
      temp = temp + ', "start":"' + makeDate(dateS) + '"';
    }
    if(dateE!="" && !checkDate(dateE)){
      setNG(sheet,n,"掲載終了がNGでスキップします");
      checkFlag = false;
    }else if(dateE == ""){
      //空はスキップ
    }else{
      temp = temp + ', "end":"' + makeDate(dateE) + '"';
    }
    
    temp = temp + "},\n";
    
    if(checkFlag){
      json = json + temp;
    }
    
  }
  return "[\n" + sliceKetsuCanma(json) + "\n]"; 
  
}