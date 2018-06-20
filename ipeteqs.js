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
        return ```print(${statement});```
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
        
        return ```if(${cond}){```;
     },
     senao: function(cond=''){
         if(cond.trim().substring(0,1) == 'se'){ //SENÃO SE var == Falso
             cond = cond.substring(2)
         }
         else{
             return "else{";
         }
     },
     funcao: function(args){
         
     },
     enquanto: function(args){
         
     },
     para: function(args){
         
     },
     fim: function(){
         
     },
     imprima: function(){
         
     },
 }
 
 const PeteqsHelper = {
     tokens: ["+","-","*","/"," mod "]
     ,
     separators: ["(",")",","]
     ,
     reserved_words: ['senão','fim','início','função']
     ,
     in_function: false
     ,
     ptq_para: function(comeco,fim){
       
     },
     exp_converter: function(line){
         let conc = "";
         let final = "";
         
         
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
         
         if(PeteqsHelper.is_atribution){
           PeteqsCore.atribui(linha);
         }
         else if(linha == PeteqsHelper.reserved_words[0]){
           PeteqsCore.senao(linha);
         }
         else if (linha == PeteqsHelper.reserved_words[1]){
           
         }
         
     },
     is_atribution:function(line){
       let space = line.match(" ");
       let atribution = line.match("<-");
       
       if(!PeteqsHelper.reserved_words.includes(line)){
         if (((atribution.length < space.length && space.length != 0) && atribution != null) || space == null){
          return true
         }
       }
       else{
        return false
       }
     },
     execute: function(comeco,fim){
         
     }
 }
 
 PeteqsHelper.token_split('1+1')

 
 