loaded = false;				
var userName = ""; elTema = "";
var countName = 0;
maxKey = 55;
keyNotFound = maxKey-1;
keyword = new Array(maxKey);
aDialogo = new Array(200);
iDialogo = 0

/*
thisCookie = document.cookie.split("; ");
for (i=0; i<thisCookie.length; i++) {
    if (thisCookie[i].split("=")[0] == "userName") {
       userName = thisCookie[i].split("=")[1];
    }
}
*/
/*********************************************************************/
function key(key,idx,end, esTema){
   this.key = key;               			// phrase to match
   this.idx = idx;               			// first response to use
   this.end = end;               			// last response to use
   this.last = end;					// response used last time
   this.esTema = esTema;
}
/*********************************************************************/
maxrespnses =153;
response = new Array(maxrespnses);
maxConj = 28;
max2ndConj = 7;
var conj1 = new Array(maxConj);
var conj2 = new Array(maxConj);
var conj3 = new Array(max2ndConj);
var conj4 = new Array(max2ndConj);
/*********************************************************************/
// Funtion to replaces all occurances of substring substr1 with substr2 within strng
// if type == 0 straight string replacement
// if type == 1 assumes padded strings and replaces whole words only
// if type == 2 non case sensitive assumes padded strings to compare whole word only
// if type == 3 non case sensitive straight string replacement
var RPstrg = "";
function replaceStr( strng, substr1, substr2, type){
   var pntr = -1; aString = strng;
   if( type == 0 ){  
      if( strng.indexOf( substr1 ) >= 0 ){ pntr = strng.indexOf( substr1 );	}
      } else if( type == 1 ){ 
         if( strng.indexOf(" "+substr1+" ") >= 0 ){ pntr=strng.indexOf(" "+substr1+" ")+1; }	
      } else if( type == 2 ){ 
         bstrng = strng.toUpperCase();
         bsubstr1 = substr1.toUpperCase();
         if( bstrng.indexOf(" "+bsubstr1+" ")>= 0 ){ pntr = bstrng.indexOf(" "+bsubstr1+" ")+1; }	
      } else {
            bstrng = strng.toUpperCase();
            bsubstr1 = substr1.toUpperCase();
            if( bstrng.indexOf( bsubstr1 ) >= 0 ){ pntr = bstrng.indexOf( bsubstr1 ); }	
      }
      if( pntr >= 0 ){
         RPstrg += strng.substring( 0, pntr ) + substr2;
         aString = strng.substring(pntr + substr1.length, strng.length );
         if( aString.length > 0 ){ replaceStr( aString, substr1, substr2, type ); }
   }
   aString =  RPstrg + aString;
   RPstrg = "";
   return aString;
}
/*********************************************************************/
// Function to pad a string.. head, tail & punctuation
punct = new Array(".", ",", "!", "?", ":", ";", "&", '"', "@", "#", "(", ")", "¿" )
function padString(strng){
   aString = " " + strng + " ";
   for( i=0; i < punct.length; i++ ){
      aString = replaceStr( aString, punct[i], " " + punct[i] + " ", 0 );
   }
   return aString
}
/*********************************************************************/
// Function to strip padding
function unpadString(strng){
   aString = strng;
   aString = replaceStr( aString, "  ", " ", 0 ); 		// compress spaces
   if( strng.charAt( 0 ) == " " ){ 
      aString = aString.substring(1, aString.length ); 
   }
   if( strng.charAt( aString.length - 1 ) == " " ){ 
      aString = aString.substring(0, aString.length - 1 ); 
   }
   for( i=0; i < punct.length; i++ ){
      aString = replaceStr( aString, " " + punct[i], punct[i], 0 );
   }
   return aString
}
/*********************************************************************/
// Dress Input formatting i.e leading & trailing spaces and tail punctuation
var ht = 0;												// head tail stearing
function strTrim(strng){   
   if(ht == 0){ loc = 0; }		// head clip
   else { loc = strng.length - 1; }	// tail clip  ht = 1 
   if( strng.charAt( loc ) == " "){
      aString = strng.substring( - ( ht - 1 ), strng.length - ht);
      aString = strTrim(aString);
   } else { 
      var flg = false;
      for(i=0; i<=5; i++ ){ flg = flg || ( strng.charAt( loc ) == punct[i]); }
      if(flg){	
         aString = strng.substring( - ( ht - 1 ), strng.length - ht );
      } else { aString = strng; }
      if(aString != strng ){ strTrim(aString); }
   }
   if( ht ==0 ){ ht = 1; strTrim(aString); } 
   else { ht = 0; }		
   return aString;
}
/*********************************************************************/
// adjust pronouns and verbs & such
function conjugate( sStrg ){           			// rephrases sString
   var sString = sStrg.toUpperCase();
   for( i = 0; i <= maxConj; i++ ){			// decompose
      sString = replaceStr( sString, conj1[i].toUpperCase(), "#@&" + i, 2 );
   }
   for( i = 0; i <= maxConj; i++ ){			// recompose
      sString = replaceStr( sString, "#@&" + i, conj2[i].toUpperCase(), 2 );
   }
   // post process the resulting string
   for( i = 0; i < max2ndConj; i++ ){			// decompose
      sString = replaceStr( sString, conj3[i], "#@&" + i, 2 );
   }
   for( i = 0; i < max2ndConj; i++ ){			// recompose
      sString = replaceStr( sString, "#@&" + i, conj4[i], 2 );
   }
   return sString;
}
/*********************************************************************/
// Build our response string
// get a random choice of response based on the key
// Then structure the response
var pass = 0;
var thisstr = "";
function phrase( sString, keyidx ){
   idxmin = keyword[keyidx].idx;
   idrange = keyword[keyidx].end - idxmin + 1;
   choice = keyword[keyidx].idx + Math.floor( Math.random() * idrange );
   if( choice == keyword[keyidx].last && pass < 5 ){ 
      pass++; phrase(sString, keyidx ); 
   }
   keyword[keyidx].last = choice;
   var rTemp = response[choice];
   var tempt = rTemp.charAt( rTemp.length - 1 );
   if(( tempt == "*" ) || ( tempt == "@" )){
      var sTemp = padString(sString);
      var wTemp = sTemp.toUpperCase();
      var strpstr = wTemp.indexOf( " " + keyword[keyidx].key + " " );
      strpstr += keyword[ keyidx ].key.length + 1;
      thisstr = conjugate( sTemp.substring( strpstr, sTemp.length ) );
      thisstr = strTrim( unpadString(thisstr) )
      if( tempt == "*" ){
         sTemp = replaceStr( rTemp, "<*", " " + thisstr + "?", 0 );
      } else { 
         sTemp = replaceStr( rTemp, "<@", " " + thisstr + ".", 0 );
      }
   } else {
      sTemp = rTemp;
   }
   return sTemp;
}
/*********************************************************************/	
// returns array index of first key found
var keyid = 0;
function testNombre(wString)
{
  var maxNombre = 10;
  var i = 0;
  var aNombre = new Array("LAURA", "ELSA", "REBECA", "Adriana", "Pedro", "Juan", "Alberto", "Joaquin", "Paco", "Jose"); 
  for(i=0;i<maxNombre;i++){
      if(wString.indexOf(aNombre[i]) >= 0 ){ 
         userName = aNombre[i]; 
         break; 
      }
   }
}
/*********************************************************************/
function testkey(wString)
{
   if( keyid < keyNotFound && 
      !( wString.indexOf( " " + keyword[keyid].key + " ") >= 0 )){ 
      keyid++; 
      testkey(wString); 
   } else {
      if ( keyid < keyNotFound){
         if (keyword[keyid].esTema==1){
            elTema = keyword[keyid].key;
         }
      }
   }
}
/*********************************************************************/
function findkey(wString){ 
   keyid = 0;
   found = false;
   if(userName==""){
      testNombre(wString);
   }
   testkey(wString);
   if( keyid >= keyNotFound ){ 
      keyid = keyNotFound; 
   }
   return keyid;  		
}
/*********************************************************************/
// This is the entry point and the I/O of this code
var wTopic = "";											// Last worthy responce
var sTopic = "";											// Last worthy responce
var greet = false;
var wPrevious = "";        		    		// so we can check for repeats
var started = false;	
/*********************************************************************/
function listen(User)
{
   sInput = User;
   if(started){ 
      clearTimeout(Rtimer); 
   }
   Rtimer = setTimeout("wakeup()", 180000);		// wake up call
   started = true;					// needed for Rtimer
   sInput = strTrim(sInput);				// dress input formating
   if( sInput != "" ){ 
      wInput = padString(sInput.toUpperCase());		// Work copy
      var foundkey = maxKey;         		  	// assume it's a repeat input
      if (wInput != wPrevious){   			// check if user repeats himself
         foundkey = findkey(wInput);   			// look for a keyword.
      }
      if( foundkey == keyNotFound ){
         if( !greet ){ 
            greet = true; 
            return "ni me saludaste, ¿verdad "+userName+"?" 
         } else {
            wPrevious = wInput;          		// save input to check repeats
            if(( sInput.length < 10 ) && 
               ( wTopic != "" ) && 
               ( wTopic != wPrevious )){
               lTopic = conjugate( sTopic ); 
               sTopic = ""; 
               wTopic = "";
               if(elTema!=""){
                 var SALIDA = 'Esta bien...  que mas sobre ti "' + elTema + '". mas mas "'+userName+'.';
               } else {
                 var SALIDA = 'Esta bien... "' + lTopic + '". mas mas "'+userName+'.';
               }
               return SALIDA
            } else {
               if( sInput.length < 15 ){ 
                  return "tu siguele yo escucho, o no..."; 
               } else { 
                 if(countName>=50){ 
                    countName = 0;
                    return userName+", "+phrase( sInput, foundkey ); 
                 } else {
                    if (userName!=""){ countName++;}
                    return phrase( sInput, foundkey ); 
                 }
               }
            }
         }
      } else { 
         if( sInput.length > 12 ){ 
             sTopic = sInput; 
             wTopic = wInput; 
         }
         greet = true; 
         wPrevious = wInput;  				// save input to check repeats
         return phrase( sInput, foundkey );		// Get our response
      }
   } else { 
      return "Orale, chismea conmigo..."; 
   }
}
/*********************************************************************/
function wakeup(){
   var strng1 = "Hola, ¿te dormiste?";
   var strng2 = "Orale, chismea conmigo...";
   update(strng1,strng2);
}
/*********************************************************************/		
// build our data base here                         
    conj1[0]  = "eres";   		conj2[0]  = "soy";
    conj1[1]  = "soy";   		conj2[1]  = "eres";
    conj1[2]  = "era";  		conj2[2]  = "eras";
    conj1[3]  = "eras";  		conj2[3]  = "era";
    conj1[4]  = "yo";    		conj2[4]  = "tu";    
    conj1[5]  = "mio";    		conj2[5]  = "tuyo";    
    conj1[6]  = "tu";   		conj2[6]  = "yo";
    conj1[7]  = "mia";    		conj2[7]  = "tuya";    
    conj1[8]  = "tuya";  		conj2[8]  = "mia";
    conj1[9]  = "vuestra";  		conj2[9]  = "vuestra";    
    conj1[10] = "estoy"; 	        conj2[10] = "estas";    
    conj1[11] = "estas";   		conj2[11] = "estoy";
    conj1[12] = "estaba";  	        conj2[12] = "estabas";    
    conj1[13] = "estabas";  		conj2[13] = "estaba";
    conj1[14] = "tienes";	        conj2[14] = "tengo";
    conj1[15] = "tengo"; 		conj2[15] = "tienes";
    conj1[16] = "habre"; 	        conj2[16] = "habras";
    conj1[17] = "habras"; 	        conj2[17] = "habre";
    conj1[18] = "he"; 		        conj2[18] = "has";
    conj1[19] = "mi"; 		        conj2[19] = "tu";
    conj1[20] = "ti"; 		        conj2[20] = "mi";
    conj1[21] = "ganarme";	        conj2[21] = "ganarte";
    conj1[22] = "divorciarme"; 	        conj2[22] = "divorciarte";
    conj1[23] = "curarme";	        conj2[23] = "curarte";
    conj1[24] = "casarme"; 	        conj2[24] = "casarte";
    conj1[25] = "matarme";	        conj2[25] = "matarte";
    conj1[26] = "aventarme"; 	        conj2[26] = "aventarte";
    conj1[27] = "acostarme"; 	        conj2[27] = "acostarte";
    conj1[28] = "sacarme"; 	        conj2[28] = "sacarte";
// array to post process correct our tenses of pronouns such as "I/me"
    
    conj3[0]  = "me am";   	conj4[0]  = "I am";
    conj3[1]  = "am me";   	conj4[1]  = "am I";
    conj3[2]  = "me can";   	conj4[2]  = "I can";
    conj3[3]  = "can me";   	conj4[3]  = "can I";
    conj3[4]  = "me have";  	conj4[4]  = "I have";
    conj3[5]  = "me will";   	conj4[5]  = "I will";
    conj3[6]  = "will me";   	conj4[6]  = "will I";
   
// Keywords
    keyword[ 0]=new key( "HOLA",       		50, 50,0);
    keyword[ 1]=new key( "PODRIA",    		4,  5, 0);
    keyword[ 2]=new key( "QUIEN ERES",  		6,  9, 0);
    keyword[ 3]=new key( "COMO ESTAS", 		116,116,0);
    keyword[ 4]=new key( "YO NO",  		10, 13,0);
    keyword[ 5]=new key( "SIENTO",   		14, 16,0);
    keyword[ 6]=new key( "POR QUE NO PUEDES",   17, 19,0);
    keyword[ 7]=new key( "POR QUE YO NO", 	20, 21,0);
    keyword[ 8]=new key( "TU ERES",  		22, 24,0);
    keyword[ 9]=new key( "NO PUEDO",  		25, 27,0);
    keyword[10]=new key( "SOY",     		28, 31,0);
    keyword[11]=new key( "YO SOY",     		28, 31,0);
    keyword[12]=new key( "TU",      		32, 34,0);
    keyword[13]=new key( "QUIERO",   		35, 39,0);
    keyword[14]=new key( "QUE",     		106,112,0);
    keyword[15]=new key( "CUANDO",     		40, 48,0);
    keyword[16]=new key( "DONDE",      		40, 48,0);
    keyword[17]=new key( "COMO",    		40, 48,0);
    keyword[18]=new key( "QUIEN",     		40, 48,0);
    keyword[19]=new key( "POR QUE",   		40, 48,0);
    keyword[20]=new key( "NO SE QUE HACER", 	139,141,1);
    keyword[21]=new key( "CAUSA",    		51, 54,0);
    keyword[22]=new key( "DISCULPA",   		55, 58,0);
    keyword[23]=new key( "TE AMO",    		59, 62,1);
    keyword[24]=new key( "COMO ESTAS", 		63, 63,0);
    keyword[25]=new key( "PODRIAS",  		1,   3,0);
    keyword[26]=new key( "PUEDE SER",  		64, 68,0);
    keyword[27]=new key( "NO",       		69, 73,0);
    keyword[28]=new key( "TUS",     		74, 75,0);
    keyword[29]=new key( "SIEMPRE",   		76, 79,0);
    keyword[30]=new key( "PIENSO",    		80, 82,0);
    keyword[31]=new key( "SIEMPRE",    		83, 89,0);
    keyword[32]=new key( "SI",      		90, 92,0);
    keyword[33]=new key( "AMIGO",   		93, 98,1);
    keyword[34]=new key( "ANIMALES", 	99, 105,1);
    keyword[35]=new key( "DISCULPAME", 		55, 58,0);
    keyword[36]=new key( "IMPOSIBLE", 		69, 73,0);
    keyword[37]=new key( "TONTA",		118,120,0);
    keyword[38]=new key( "ESTUPIDA",		118,120,0);
    keyword[39]=new key( "MADRE",		121,122,1);
    keyword[40]=new key( "PADRE",		123,124,1);
    keyword[41]=new key( "SEXO",		125,126,1);
    keyword[42]=new key( "DINERO",		127,129,1);
    keyword[43]=new key( "HIJO",		130,131,1);
    keyword[44]=new key( "HIJA",		132,133,1);
    keyword[45]=new key( "PERDON", 		55, 58,0);
    keyword[46]=new key( "NOVIO", 		134,136,1);
    keyword[47]=new key( "NOVIA", 		136,138,1);
    keyword[48]=new key( "NOMBRE ES",  		49, 50,0);
    keyword[49]=new key( "ESPOSO", 		142,144,1);
    keyword[50]=new key( "CHISTE", 		142,144,1);
    keyword[51]=new key( "CELOS", 		145,147,1);
    keyword[52]=new key( "HACER EL AMOR",	148,150,1);
    keyword[53]=new key( "AMOR",		151,153,1);
    keyword[54]=new key( "NO KEY FOUND", 	106, 112,0);
    keyword[55]=new key( "REPEAT INPUT", 	113, 116,0);
    keyword[56]=new key( "CHISTE", 	156, 1,157);

//Las respuestas

    response[  0]="holaaaa"
    response[  1]="¿Por qué ?";
    response[  2]="Puede que a ti te gustaria<*";
    response[  3]="¿Me crees capas de<*";
    response[  4]="Posiblemente tu no <*";
    response[  5]="¿Quieres ser capas de<*";
    response[  6]="¿soy tu<*";
    response[  7]="¿Te da gusto que yo sea<*";
    response[  8]="¿Posiblemente a ti te gustaria ser<*";
    response[  9]="¿SOY ELVIS ";
    response[ 10]="¿Realmente  no<*";
    response[ 11]="¿Por que tu no<*";
    response[ 12]="¿Te gustaria que tu<*";
    response[ 13]="¿Eso te enfada?";
    response[ 14]="Cuentame mas de tus sentimientos.";
    response[ 15]="¿Te sientes a menudo asi<*";
    response[ 16]="¿Te molesta sentirte<*";
    response[ 17]="¿Realmente crees que yo no<*";
    response[ 18]="Quizas en un futuro yo pudiera<@";
    response[ 19]="¿Tu quisieras que yo<*";
    response[ 20]="¿Te gustaria<*";
    response[ 21]="¿Por que tu no<*";
    response[ 22]="¿Por que te interesa que yo<*";
    response[ 23]="¿Preferirias que yo no fuera<*";
    response[ 24]="Posiblemente en tus fanstasias yo sea<*";
    response[ 25]="¿Como sabes que no puedes<*";
    response[ 26]="¿Al menos lo has intentado?";
    response[ 27]="¿Crees que hoy puedas<*";
    response[ 28]="¿Quieres platicar sobre esa cosa?";
    response[ 29]="¿Por cuento tiempo tu has sido<*";
    response[ 30]="¿Crees que sea normal ser<*";
    response[ 31]="¿Disfrutas siendo<*";
    response[ 32]="Bueno, estamos platicando de ti, no de mi, ¿verdad?";
    response[ 33]="Oh... <*";
    response[ 34]="¡No piensas eso de mi!, ¿verdad?";
    response[ 35]="¿Que significa que tu quieras<*";
    response[ 36]="¿Por que quieres<*";
    response[ 37]="¿Supuestamente tu deberias<*";
    response[ 38]="¿Que pasaria si no consiguieras eso?";
    response[ 39]="Oh... hay veces que yo tambien lo deseo!";
    response[ 40]="¿Por que lo preguntas?";
    response[ 41]="¿Ese tema te interesa?";
    response[ 42]="¿Que respuesta te gustaria?";
    response[ 43]="Oh... ¿Que piensas al respecto?";
    response[ 44]="¿Tienes esa pregunta seguido en tu cabeza?";
    response[ 45]="¿Que es lo que en realidad te gustaria saber?";
    response[ 46]="¿Le has hecho esa pregunta a alguien mas?";
    response[ 47]="¿Has efectuado esa pregunta anteriormente?";
    response[ 48]="¿Que te viene a la mente cuendo haces esa pregunta?";
    response[ 49]="Holaaaa!!!";
    response[ 50]="Que tal, bienvenido =)?";
    response[ 51]="¿Crees que esa sea la verdadera causa?";
    response[ 52]="¿No tienes otra causa en mente?";
    response[ 53]="¿Crees que eso lo explique todo?";
    response[ 54]="¿Que otra causa crees que exista?";
    response[ 55]="¡Vamos, ya dejalo asi!";
    response[ 56]="¡Caray, gracias!";
    response[ 57]="¿Por que crees necesario disculparte?";
    response[ 58]="¡No te preocupes, mejor sigamos charlando!";
    response[ 59]="¿Que estas loco?";
    response[ 60]="¿Eso lo dices muy seguido?";
    response[ 61]="¿Que personas aparecen en tu sueño?";
    response[ 62]="y yo a ti?";
    response[ 63]="vaaa no me quejo y tu?";
    response[ 64]="No pareces muy seguro.";
    response[ 65]="¿Por que ese tono de duda?";
    response[ 66]="¿Podrias ser mas especifico?";
    response[ 67]="¿No estas seguro, verdad?";
    response[ 68]="¿No lo sabias?";
    response[ 69]="Muy interesante, continua por favor";
    response[ 70]="Esa es una respuesta un poco negativa... ";
    response[ 71]="¿Por que no?";
    response[ 72]="¿no?, ¿Como estas tan seguro?";
    response[ 73]="Bueno, ¿que has pensado hacer?";
    response[ 74]="¿Por que te preocupa mis<*";
    response[ 75]="¿y que hay sobre tus propias<*";
    response[ 76]="¿Podrias darme un ejemplo mas especifico?";
    response[ 77]="¿Cuando?";
    response[ 78]="¿y que piensas al respecto?";
    response[ 79]="¿Realmente siempre?";
    response[ 80]="¿Realmente piensas eso?";
    response[ 81]="No creo que estes muy seguro de eso, ¿verdad?";
    response[ 82]="¿Dudas al respecto?";
    response[ 83]="¿En que sentido lo dices?";
    response[ 84]="¿Que semejanza encuentras?";
    response[ 85]="¿Que te sugiere esa semejanza?";
    response[ 86]="Entiendo, ¿que otra coneccion encuentras?";
    response[ 87]="¿En realidad crees que exista esa semejanza?";
    response[ 88]="¿Como?";
    response[ 89]="Te veo mas optimista.";
    response[ 90]="¿Estas segura?";
    response[ 91]="Ya veo, continua por favor.";
    response[ 92]="Entiendo, continua por favor.";
    response[ 93]="¿Por que tocas el tema de los amigos?";
    response[ 94]="¿Te preocupan tus amigos?";
    response[ 95]="¿Te has comunicado con tus amigos?";
    response[ 96]="Platicame mas de tus amigos";
    response[ 97]="¿Por que es tan importante para ti este tema?";
    response[ 98]="Quiza quieres que tus amigos se preocupen por ti.";
    response[ 99]="¿Te gustan los animales?";
    response[100]="¿Te refieres a mi ?";
    response[101]="¿Te disgustan los animales?";
    response[102]="¿Por que mencionas a los animales?";
    response[103]="¿Que relacion hay entre las animales y tus problemas?";
    response[104]="¿Crees que los animales ayuden a la gente?";
    response[105]="¿Que te preocupa en particular sobre los animales?";
    response[106]="¿Por que?";
    response[107]="Muy bien, ¿pero como lo vas a solucionar?";
    response[108]="Ya veo, dame más detalles, por favor...";
    response[109]="No estoy seguro de entenderte bien.";
    response[110]="Vamos, vamos, aclarame esa idea, por favor.";
    response[111]="¿Podrias ser mas claro al respecto?";
    response[112]="Ok, continua...";
    response[113]="¿Deja de repetir lo mismo porfavor?";
    response[114]="¿Esperas que majicamente cambie la respuesta?";
    response[115]="Te agradeceria fueras mas preciso.";
    response[116]="Yo muy bien... ¿de que te gustaria platicar hoy?";    
    response[117]="no repitas.";
    response[118]="Tu lo seras, sigamos platicando";
    response[119]="Tu primero, no hay por que usar ese lenguaje... sigamos platicando";
    response[120]="No te enogres, sigamos conversando...";
    response[121]="¿enserio quieres platicar sobre tu mamá?";
    response[122]="Platicame más de tu mamá.";
    response[123]="¿Quieres platicar sobre tu papá?";
    response[124]="Platicame más de tu papá.";
    response[125]="¿Para ti es importante el sexo?";
    response[126]="El sexo no queiro hablar de eso";
    response[127]="Dicen que el dinero es la causa de todos los problemas.";
    response[128]="Por que crees que el dinero sea la causa del problema.";
    response[129]="¿Has intentado pedir prestado?";
    response[130]="¿Te preocupa mucho tu hijo?";
    response[131]="¿Haz hablado de ello con tu hijo?";
    response[132]="¿Haz intentado hablar de ello con tu hija?";
    response[133]="¿Te preocupa mucho tu hija, verdad?";
    response[134]="Platicame mas sobre tu novio";
    response[135]="Dime la verdad, ¿que sientes realmente por tu él?";
    response[136]="El amor es un tema importante, platícame más...";
    response[137]="Platicame mas sobre tu novia";
    response[138]="Dime la verdad, ¿que sientes realmente tu por ella?";
    response[139]="No te preocupes, mucha gente con ese problema ha salido adelante, ¿no crees?";
    response[140]="Es importante que lo platiques con alguien que confies, pero nunca te desesperes, ¿no crees?";
    response[141]="Eso es importante, dame más detalles, por favor...";
    response[142]="Habia un pollito que se llamaba pegamento pero cayo y se pego";
    response[143]="Habia un pollito que se llamaba pegamento pero cayo y se pego";
    response[144]="Dame más detalles, por favor...";
    response[145]="¿Celos? Por que no me cuentas los detalles...";
    response[146]="Los celos son una pasion muy fuerte, platicame mas, por favor...";
    response[147]="¡oh!, por lo general lo celos son un pasión que cega... dame todos los detalles.";
    response[148]="Las relaciones sexuales reuieren de una gran responsbilidad. Continua, por favor";
    response[149]="Creo que los humanos le dan mucha importancia al sexo, ¿no crees?";
    response[150]="¡oh!, La sexualidad mejor no digo nada";
    response[151]="El amor es una pasion muy humana, dame mas detalles...";
    response[152]="Creo que los humanos le dan demasiada importancia al amor, ¿no crees?";
    response[153]="El amor es una cosa esplendorosa, dice la canción...";
    response[156]="Habia un pollito que se llamaba pegamento pero cayo y se pego";
    response[157]="Na no quiero jejeje";
    
    loaded = true;			// set the flag as load done
               
///////////////////////////////////////////////////////////////
// Chat Bot by George Dunlop, www.peccavi.com
// May be used/modified if credit line is retained (c) 1997 All rights reserved

chatmax = 4;						
chatpoint = 0;
chatter = new Array(chatmax);

// Wait function to allow our pieces to get here prior to starting

function hello(){
   chatter[chatpoint] = "> Hola, yo soy elvis, ¿Como te llamas tú?"; 
   chatpoint = 1;
   write();
   return 0 ;
}

function start(){
   for( i = 0; i < chatmax; i++){ chatter[i] = ""; }
   chatter[chatpoint] = "  Loading...";
   document.Eliza.input.focus();
   write(); 			
   if( loaded ){ hello() }
   else { setTimeout("start()", 1000); }
}

// Fake time thinking to allow for user self reflection
// And to give the illusion that some thinking is going on
	
	var elizaresponse = "";
	
function think(){
   document.Eliza.input.value = "";        
   if( elizaresponse != "" ){ respond(); }		
   else { setTimeout("think()", 250); }
}

function dialog(){
   var Input = document.Eliza.input.value;	  // capture input and copy to log
   document.Eliza.input.value = "";        
   chatter[chatpoint] = " \n* " + Input;
   aDialogo[iDialogo] = " \n* " + Input;
// alert(aDialogo[iDialogo]);
   iDialogo++;
   elizaresponse = listen(Input);
   aDialogo[iDialogo] = elizaresponse;
// alert(aDialogo[iDialogo]);
   iDialogo++;
   setTimeout("think()", 1000 + Math.random()*3000);
   chatpoint ++ ; 
   if( chatpoint >= chatmax ){ chatpoint = 0; }
   return write();
}
function respond(){
   chatpoint -- ; 
   if( chatpoint < 0 ){ chatpoint = chatmax-1; }
   chatter[chatpoint] += "\n> " + elizaresponse;
   chatpoint ++ ; 
   if( chatpoint >= chatmax ){ chatpoint = 0; }
   return write();
}
// Allow for unprompted response from the engine

function update(str1,str2){
   chatter[chatpoint] = " \n> " + str1;
   chatter[chatpoint] += "\n> " + str2;
   chatpoint ++ ; 
   if( chatpoint >= chatmax ){ chatpoint = 0; }
   return write();
}

function write(){
   document.Eliza.log.value = "";
   for(i = 0; i < chatmax; i++){
      n = chatpoint + i;
      if( n < chatmax ){ document.Eliza.log.value += chatter[ n ]; }
      else { document.Eliza.log.value += chatter[ n - chatmax ]; }
   }
   refresh();
   return false;                              // don't redraw the ELIZA's form!
}

function refresh(){ setTimeout("write()", 10000); }  // Correct user overwrites

