/**
 * Ipeteqs.js -> Implementação do interpretador de PETEQS ipeteqs em javascript 
 * 
 * 
 * @author leon de frança nascimento
 */
 
 var vars = [];
 
 //Usar como objeto (ex.: x = new Variavel('abc') retorna x.valor = 'abc')
 function Variavel(valor){
     return {valor:valor};
 }
 
 const PeteqsCore = {
     imprima : function(args=''){
        let statement =  PeteqsHelper.exp_converter(args);
        return `print(${statement});`
     },
     imprimaln: function(args=''){
        return PeteqsCore.imprima(args)+"print('\n')";
     },
     leia: function(args){
        
     },
     atribui: function(args){
        
     },
     se: function(cond){
        //Ex.: SE Var == Verdadeiro ENTÃO
        cond = cond.split(" ",1);  // Var == Verdadeiro ENTÃO
        cond = cond.substring(0,-6) // Var == Verdadeiro 
        cond = cond.trim();//Limpar whitespace
        
        return `if(${cond}){`;
     },
     senao: function(cond=''){
         if(cond.trim().substring(0,1) == 'se'){ //SENÃO SE var == Falso
             cond = cond.substring(2)
             cond = PeteqsCore.se(cond);
         }
         return cond ? "else "+ cond : "else{";
     },
     funcao: function(args){
         
     },
     enquanto: function(args){
         
     },
     para: function(linha){
        linha = linha.substr(4, linha.length-4).trim();

        let args =  (function(){
            let split_linha = linha.split('<-');
            let variavel = split_linha[0].trim();
            let min = split_linha[1].match('[0-9]*.')[0]; //O número é o unico grupo de captura
            let max = split_linha[1].match('(ATÉ|até) ([0-9]*.)')[2]; //O número é o segundo grupo capturado
            

            return [variavel, min, max];
        })();

        return PeteqsHelper.ptq_para(args);
     },
     fim: function(){
         
     },
     imprima: function(){
         
     },
 }
 
 var PeteqsHelper = {
     tokens: ["+","-","*","/"," mod "]
     ,
     separators: ["(",")",","]
     ,
     reserved_words: ['senão','fim','início','função']
     ,
     in_function: false
     ,
     ptq_para: function(variaveis){
         //Args é array com modelo Variavel, começo e fim
         let variavel =  variaveis[0]; 
         let começo = variaveis[1]; 
         let fim = variaveis[2];

         let code ="";

         if(fim < começo){
            code = `for(var ${variavel} = ${começo}; variavel> ${fim});variavel--){`;
            return 
         }
         else{
            code = `for(var ${variavel} = ${começo}; variavel< ${fim});variavel++){`;
            return code;
         }
       
     },
     exp_converter: function(linha){
         let conc = "";
         let final = "";
         
         return linha;
     },
     has_operator: function(line){
      let expressions = [];
      this.tokens.forEach(function(token){
          if(line.includes(token)){
            expressions[token] = true;
          }
          });
          
          return expressions;
     },
     separator_split:function(args){
       
     },
     is_num: function(arg){
        return !isNaN(parseInt(arg));
     },
     analyze: function(linha){
         linha = linha.trim();
         
         if(PeteqsHelper.has_atribution){
            if(linha.match('para|PARA')){
              PeteqsCore.para(linha);
            }
            else{
              PeteqsCore.atribui(linha);
            }
         }
         else if(linha == PeteqsHelper.reserved_words[0]){
           PeteqsCore.senao(linha);
         }
         else if (linha == PeteqsHelper.reserved_words[1]){
           
         }
         
     },
     has_atribution:function(line){
        return line.match("<-");
     },
     execute: function(comeco,fim){
         
     }
 }

 linha = 'para i<-1 até 722 faça';