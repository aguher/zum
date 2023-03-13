import { Injectable, EventEmitter } from "@angular/core";
import * as _ from "lodash";
@Injectable()
export class Common {
  public searchChanged$;
  public companiesChanged$;
  public dataCompanies: any = [];

  constructor() {
    this.searchChanged$ = new EventEmitter();
    this.companiesChanged$ = new EventEmitter();
  }

  getDateParsed(date) {
    let arrayDate = date.split("-");
    arrayDate = _.map(arrayDate, function(element) {
      return parseInt(element);
    });

    return arrayDate;
  }

  getFecha(fecha:Date){
    let d= fecha;
    let month = String(d.getMonth() + 1);
    let day = String(d.getDate());
    const year = String(d.getFullYear());
  
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
  
    return `${day}/${month}/${year}`;
  }

  getNumber(Numero:string):number{
    if (Numero){
      return parseFloat(Numero.replace(".","").replace(".","").replace(",","."));
    }else{
      return 0;
    }

  }

  getDecimals(Numero, Decimales, SepararMiles=true):string {

    //    //Ver redondeo del último decimal
    //    pot = Math.pow(10,Decimales + 1);
    //    ultimodc = parseInt(numero * pot);

    let pot = Math.pow(10, Decimales);
    let num = parseInt(Math.round(Numero * pot).toString()) / pot;
    let nume = num.toString().split('.');

    let entero = nume[0];
    let decima = nume[1];
    let fin;

    if (decima != undefined) {
        fin = Decimales - decima.length;
    }
    else {
        decima = '';
        fin = Decimales;
    }

    for (let i = 0; i < fin; i++)
        decima += String.fromCharCode(48);

    //poner los puntos cada tres decimales

    let miles = entero
    let residuo = '';

    if (miles.length > 3) {
        entero = '';

        while (miles.length > 3) {
            if (SepararMiles == true && !(miles.length == 4 && miles.indexOf('-')!=-1)) {
                residuo = '.' + miles.substring(miles.length - 3) + residuo;
            }
            else {
                residuo = miles.substring(miles.length - 3) + residuo;
            }
            miles = miles.substring(0, miles.length - 3);
            entero = miles + residuo;
        }
    }
    let devolver:string;
    if (Decimales > 0) {
        devolver = entero + ',' + decima;
    } else {
        devolver = entero;
    }
    return devolver.replace('NaN','0');
}

  getCleanedString(cadena){
    // Definimos los caracteres que queremos eliminar
    //comentado por no ser necesario y porque tarda la vida
/*     var specialChars = "!@#$^&%*()+=-[]\/{}|:<>?,.";
 
    // Los eliminamos todos
    for (var i = 0; i < specialChars.length; i++) {
        cadena= cadena.replace(new RegExp("\\" + specialChars[i], 'gi'), '');
    }    */
 
    // Lo queremos devolver limpio en minusculas
    if (cadena == null){
      return "";
    }else {
    cadena = cadena.toLowerCase();
 
    // Quitamos espacios y los sustituimos por _ porque nos gusta mas asi
    cadena = cadena.replace(/ /g,"_");
 
    // Quitamos acentos y "ñ". Fijate en que va sin comillas el primer parametro
    cadena = cadena.replace(/á/gi,"a");
    cadena = cadena.replace(/é/gi,"e");
    cadena = cadena.replace(/í/gi,"i");
    cadena = cadena.replace(/ó/gi,"o");
    cadena = cadena.replace(/ú/gi,"u");
    cadena = cadena.replace(/ñ/gi,"n");
    return cadena;
  } 
}

  updateDataCompany(company = null, fiscalYear = null) {
    if (company) {
      localStorage.setItem("selectedCompany", JSON.stringify(company));
    }
    if (fiscalYear) {
      localStorage.setItem("selectedFiscalYear", JSON.stringify(fiscalYear));
    }
  }

  getIdCompanySelected() {
    let company: any = localStorage.getItem("selectedCompany");
    if (company) {
      company = JSON.parse(company);
      return company.value.id;
    } else {
      return false;
    }
  }

  getIdCompanyYearSelected() {
    let company: any = localStorage.getItem("selectedCompany"),
      year: any = localStorage.getItem("selectedFiscalYear");
    if (company && year) {
      company = JSON.parse(company);
      year = JSON.parse(year);
      return { company: company.value.id, year: year.value.id };
    } else {
      return false;
    }
  }

  parseDatefromDate(date): String {

     if (date !== "") {
      let parsedDate: String = "",
        dated = new Date(date);
      parsedDate = String(dated.getDate());
      parsedDate += " " + this.getMonthName(dated.getMonth() + 1);
      parsedDate += " " + dated.getFullYear();
      return parsedDate;
    }

    return "";
  }

  getMonthName(month) {
    let monthInt = parseInt(month);
    switch (monthInt) {
      case 1:
        return "Ene";
      case 2:
        return "Feb";
      case 3:
        return "Mar";
      case 4:
        return "Abr";
      case 5:
        return "May";
      case 6:
        return "Jun";
      case 7:
        return "Jul";
      case 8:
        return "Ago";
      case 9:
        return "Sep";
      case 10:
        return "Oct";
      case 11:
        return "Nov";
      case 12:
        return "Dic";
    }
  }

  getMonthFromDate(date) {
    let monthInt = date.split("-")[1];
    switch (monthInt) {
      case 1:
      case "1":
      case "01":
        return "january";
      case 2:
      case "2":
      case "02":
        return "february";
      case 3:
      case "3":
      case "03":
        return "march";
      case 4:
      case "4":
      case "04":
        return "april";
      case 5:
      case "5":
      case "05":
        return "may";
      case 6:
      case "6":
      case "06":
        return "june";
      case 7:
      case "7":
      case "07":
        return "july";
      case 8:
      case "8":
      case "08":
        return "august";
      case 9:
      case "9":
      case "09":
        return "september";
      case 10:
      case "10":
        return "october";
      case 11:
      case "11":
        return "november";
      case 12:
      case "12":
        return "december";
    }
  }

  checkFloat(number: any) {
    number = String(number);
    let parse = parseFloat(number.replace(",", ""));

    return isNaN(parse) ? 0 : parse;
  }

  checkNumber(number: any) {
    number = String(number);
    if (number.indexOf(",") >= 0 && number.indexOf(".") >= 0) {
      number = number.replace(/\./g, "");
    }
    let parse = parseFloat(number.replace(",", "."));

    return isNaN(parse) ? 0 : parse;
  }

  checkNumberStr(number: any) {
    number = String(number);
    let parse = parseFloat(number.replace(",", "."));

    return isNaN(parse) ? "0" : String(parse);
  }

  currency(amount, symbolCurrency = false) {
    let currency = "";

    if (typeof amount === "string") {
      currency = parseFloat(amount).toFixed(2);
    } else if (typeof amount !== "string") {
      currency = amount.toFixed(2);
    }
    return symbolCurrency ? currency + "€" : currency;
  }

  toFixValue(amount, fixed = 2, symbol = "") {
    if (typeof amount === "string") {
      return parseFloat(amount).toFixed(fixed) + symbol;
    } else if (typeof amount !== "string") {
      return amount.toFixed(fixed) + symbol;
    }
  }

  marginCalculate(income, expense) {
    if (this.checkNumber(income) !== 0) {
      return Number(
        (this.checkNumber(income) - this.checkNumber(expense)) /
          this.checkNumber(income) *
          100
      ).toFixed(2);
    } else {
      return 0;
    }
  }

  currencyFormatES(num, showCurrency = true) {
    // if hay puntos y comas, significa que ya ha sido parseado
    if (String(num).indexOf(",") > -1 && String(num).indexOf(".") > -1) {
      num = parseFloat(
        String(num)
          .replace("€", "")
          .replace(/\./g, "")
          .replace(",", ".")
          .trim()
      );
    } else {
      num = parseFloat(
        String(num)
          .replace("€", "")
          .replace(",", ".")
          .trim()
      );
    }

    num = num
      .toFixed(2) // always two decimal digits
      .replace(".", ",") // replace decimal point character with ,
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    if (showCurrency) {
      num = num + " €";
    }
    return num;
  }

  toFloat(number: any, removeSymbol = false) {
    if (removeSymbol) {
      number = number.replace("€", "");
    }
    number = String(number);
    if (number.indexOf(",") >= 0 && number.indexOf(".") >= 0) {
      number = number.replace(/\./g, "");
    }
    let parse = parseFloat(number.replace(",", "."));

    return isNaN(parse) ? 0 : parse;
  }

  completeNumber(number: any) {
    if(number < 10) {
      return `00${number}`;
    } else if (number < 100) {
      return `0${number}`;
    }
  }
}
