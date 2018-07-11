function TestaSeImprimaGeralinhaCorreta(){
  
  let linhas = ['imprima "i<- 0"', 'imprima "Olá Mundo"', 'imprima i[1]'];
  let resultados = ['PQ_print(target, "i<- 0");','PQ_print(target, "Olá Mundo");', 'PQ_print(target, i[1]);'];

  for(var i = 0;i<3;i++){
    return PeteqsCore.imprima(linhas[i]) == resultados[i]
  }
}

function TestaSeImprimalnGeralinhaCorreta(){

  let linhas = ['imprima "i<- 0"', 'imprima "Olá Mundo"', 'imprima i[1]'];
  let resultados = ['PQ_print(target, "i<- 0");','PQ_print(target, "Olá Mundo");', 'PQ_print(target, i[1]);'];

  for(var i = 0;i<3;i++){
    resultados[i]+="\nPQ_print(target,'<br>')"
    return PeteqsCore.imprimaln(linhas[i]) == resultados[i];
  }
}

function TestaSeAtribuiGeraLinhaCorreta(){

  let linhas = ['i<- 0', 'i<- "Olá Mundo"', 'i[1]<-3'];
  let resultados = ['i=0','i="Olá Mundo"', "".match(/i\[1\]=3/)];

  for(var i = 0; i<3;i++){
    if(i === 2){
      linha = PeteqsCore.atribui(linhas[i]);
      if(!linha.match(/i\[1\]=3/)){
        return false;
      }
    }
    else{
      if(!PeteqsCore.atribui(linhas[i]) == resultados[i]){
        return false;
      }
    }
   
  }
  return true;
}

function TestaSeSeGeraLinhaCorreta(){

}

function TestaSeSenaoGeraLinhaCorreta(){

}

function TestaSeExpConverterGeraLinhaCorreta(){

}