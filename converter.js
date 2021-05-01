
var toConvert  = `{
    colK: {
      type: Object,
      required: true
    },
    colI: {
      type: String,
      required: true,
      unique:true
    },
    colH : {
      type: Array
    },
    colG: {
      type: Boolean,
      default: false
    },
    colF: {
      type: String
    },
    colE: {
      type: Number
    },
    colD: {
      type: Number
    },
    colC: {
      type: mongoose.Schema.Types.Mixed,
      default: Date.now
    },
    colB:{
        type: Number,
        default:0
    },
    colA: {
      type: Object,
      default:-1
  }
  }`
  let Rules ={
    "name":"Domain", // You can Add the Struct Name here 
    "structIsGlobal":false,
    "globalKeys":true,
    "wantJson":true,
    "IncludeId":true
}

let StructString = `type ${Rules["name"]} struct {
$VAR}`
let toConcatString = ""
var  replaceObjects = {
  "Array":"[]interface{}",
  "String":"string",
  "Boolean":"bool",
  "Number":"int",
  "Date": "*time.Time",
  
}


  let couldNotBeConverted = ""
  let arrayOfSamples = Conversion(toConvert)

//   Extracts all the mongoose fields into Array of [key,value]
  function Conversion(fileAsString){
    keyValue = {}
    let mongooseString = fileAsString.replace(/\r\n|\r|\n/g,"")
    mongooseString = mongooseString.substring(1,mongooseString.length -1)
    let i = 0 
    let ms = mongooseString
    let ctr = 0 ; 
    let toReturn = [];
    
    while (i < mongooseString.length){ 
          
        ctr +=1
        keyStart = i 
        keyEnd = i 
        while (ms[i] != ":" && i < mongooseString.length){
            
            keyEnd = i 
            i +=1
        }
        keyEnd +=1
        let {value,counter} = manipulateValue(keyEnd,mongooseString)
        
        toReturn.push([mongooseString.substring(keyStart,keyEnd).trim(),value])
        
        if (counter > mongooseString.length || counter == -1){
            console.log(toReturn)
            return toReturn 
        }
        i = counter + 1 ;

    }
    
    return toReturn
  }

  function manipulateValue(start, str1 ){
      str = str1.substring(start,str1.length)
      toReturn = {value:undefined,counter:-1}
      endCounter = -1
        commaIn = str.indexOf(",")
        oBIndex = str.indexOf("{")
        
        if (commaIn < oBIndex || oBIndex == -1 || commaIn == -1){
            if (commaIn == -1){
                return {
                    value : str,
                    counter : -1
                }
            }
            
            let counter = start + commaIn + 1 

            if (counter >= str1.length){
                counter = -1 
            }
            return {
                value:str.substring(1,commaIn).trim(),
                counter: start + commaIn + 1
            }
        }
        else{
            startIndex = str.indexOf("type")
            while (startIndex < str.length && str[startIndex] != ":"){


                startIndex +=1
            }
            startIndex  +=1
            endIndex = startIndex
            while (endIndex < str.length && ( str[endIndex] != "}" )){

                endIndex +=1
            }
            
            endCounter = endIndex ; 

            while(endCounter < str.length && str[endCounter] != ","){
                endCounter +=1
            }
            let counter = start + endCounter
            if (counter > str1.length){
                counter = -1 
            }
            return {
                value : str.substring(startIndex,endIndex).trim().split(",")[0],
                counter : counter
            }
        }
  }
  
  



//   Checks if you want Id field in the struct
    if (Rules.IncludeId){
        toConcatString += Rules.globalKeys ? "Id" : "id"
        toConcatString += `\tprimitive.ObjectID\t`
        toConcatString += '`bson:"_id"\t'
        toConcatString +=   Rules.wantJson ? 'json:"_id"`\n' : "`\n"
    }
//  Gets Listing of all the fields that can / cannot be recovered from it 
  for (let i = 0 ; i < arrayOfSamples.length ; i++){
    let [key,type] = arrayOfSamples[i]
    let GoLangType = replaceObjects[type]
    if (GoLangType){
        toConcatString += Rules.globalKeys ? key.charAt(0).toUpperCase() + key.slice(1) : key
        toConcatString += `\t${GoLangType}\t`
        toConcatString += '`bson:"'+key+'"\t'
        toConcatString +=   Rules.wantJson ? 'json:"'+key+'"`\n' : "`\n"
        
    }
    else{
        couldNotBeConverted += Rules.globalKeys ? key.charAt(0).toUpperCase() + key.slice(1) : key
        couldNotBeConverted += `\t${type}\t`
        couldNotBeConverted += '`bson:"'+key+'"\t'
        couldNotBeConverted +=   Rules.wantJson ? 'json:"'+key+'"`\n' : "`\n"
    }
  }
StructString =  StructString.replace("$VAR",toConcatString)
console.log("Final Struct")
console.log(StructString)
console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
console.log("MiseddOUT FIELDS")
console.log(couldNotBeConverted)

