/**
 * Ipeteqs.js -> Implementação do interpretador de PETEQS ipeteqs em javascript 
 * 
 * 
 * @author leon de frança nascimento
 */


//Assinatura da função PQ_print = PQ_print(target, arg1,arg2....argN)
function PQ_print(target) {
    
    //arguments[0] é target
    for (var i = 1; i < arguments.length; i++) {
        if (arguments[i]) {
            if(isNaN(Number(arguments[i]))){
            target.innerHTML += arguments[i];
            }
            else{
                target.innerHTML += arguments[i];
            }
        }
    }

}

/**
 * Núcleo da funcionalidade do PETEQS
 * 
 * Após as funções serem idenficadas pelo Helper, o PeteqsCore faz a identificação e separação dos tokens
 * e em seguida gera código Javascript equivalente.
 * 
 * Nas funções de repetição, como enquanto e para, embute-se um código salvaguarda para loops infinitos, que
 * verifica se um determinado loop está rodando a mais de 10 segundos e o para caso a execução demore demais.
 * 
 */ 
const PeteqsCore = {
    /**
    * Função de impressão:Converte a expressão a ser imprimida pela função PQ_print em uma
    * expressão válida para o Javascript através da função exp_converter, retornando a chamada 
    * em javascript
    */
    imprima: function (args = '') {
        let statement = PeteqsHelper.exp_converter(args.replace(/imprimaln|imprima/, ''));
        return `PQ_print(target,${statement});`
    },
    /**
    * Função de impressão com nova linha:Converte a expressão a ser imprimida pela 
    * função PQ_print em uma em javascript e usa a função imprima, em seguida imprime
    * uma nova linha em branco.
    */
    imprimaln: function (args = '') {
        return PeteqsCore.imprima(args) + "\nPQ_print(target,'<br>')";
    },
    /**
    * Função de entrada: Remove os tokens sintáticos do PETEQS e identifica o nome da variável.
    * Caso a variável seja um vetor, tenta criar um vetor se este não existir.
    * 
    */
    leia: function (linha) {
        linha = linha.substring(4, linha.length); //Remove o leia

        //Verifica a existência de um vetor e o inicializa caso não exista.
        let variavel = PeteqsHelper.handle_vectors(linha);
        if(PeteqsHelper.has_vector(linha)){
            return `${variavel} = prompt('Insira o valor da variável do vetor');`;
        }
        
        //Javascript faz typecasting pra string na função prompt. Aqui garantimos que os números sejam números
        return `${variavel} = prompt('Insira o valor da variável ${variavel}');
        if(!isNaN(${variavel})){
            ${variavel} = Number(${variavel})
        }`;
    },
    /**
     * Função de atribuição: Substitui as expressões PETEQS por expressões javascript,
     * lida com vetores e substitui o operador de atribuição pelo operador de atribuição 
     * do Javascript
     */
    atribui: function (args) {

        args = PeteqsHelper.exp_converter(args);

        args = PeteqsHelper.handle_vectors(args);

        return args.replace("<-", "=");
    },
    /**
     * Função condicional: Separa os tokens PETEQS e retorna uma desvio de fluxo em Javascript.
     */
    se: function (cond) {
        //Ex.: SE Var = Verdadeiro ENTÃO
        cond = cond.replace(/se/gi, '');

        if (cond.match(/então/gi)) {
            cond = cond.replace(/então/gi,"");
        }
        cond = cond.trim();

        cond = PeteqsHelper.exp_converter(cond);

        return `if(${cond}){`;
    },
    /**
     * Função condicional: Separa os tokens PETEQS e retorna uma desvio opcional em javascript
     * 
     * Equivale às estruturas ELSE e ELSE IF do Javascript.
     */
    senao: function (cond = '') {
        cond = cond.replace('senão', '');

        if (cond.match(/se/gi)) { //SENÃO SE var == Falso
            cond.replace(/se/gi, "");
            cond = PeteqsCore.se(cond);
        }
        //Se tiver uma condição (else if), retorna esta estrutura; caso contrario, somente retorna Else.
        return cond ? "}else " + cond : "}else{";
    },
    funcao: function (args) {

        PeteqsHelper.in_function = true;

        let regex = /(\S+(?=\())(\(.*\))/;
        
        let assinatura = args.match(regex);
        
        let nome = assinatura[1];
        
        let param = function(args){
            args = args.replace(/entradas?:/gi,"");
            args = args.split(/sa[íi]da[s?]:/gi);
            
            let entradas = args[0].trim().slice(1,-1);    
            
            let saidas = args[1] != null ? args[1].trim().slice(0,-1) : 'a';
            
            
            return {'entradas':entradas,'saidas':saidas};    
           
        }(assinatura[2]);

        PeteqsHelper.vars.push(param.saidas.split(","));
        
        return `function ${nome}(${param.entradas}){
            let ${param.saidas};`        
    },
    procedimento: function (args) {

        let nome = args.replace(/procedimento/gi, "");

        PeteqsHelper.in_function = true;

        return `function ${nome}(){`

    },
    enquanto: function (cond) {

        cond = cond.replace(/enquanto/gi, "");
        cond = cond.replace(/faça/gi, "");

        return `
            loopStart = Date.now();
            while(${PeteqsHelper.exp_converter(cond)}){
                if(Date.now() - loopStart > 30000){
                    PQ_print(target,'Erro no código - Loop demorou demais. Verifique se existe um loop infinito.')
                    break;
                }
            
            `;

    },
    para: function (linha) {
        linha = linha.substr(4, linha.length - 4).trim();

        let args = (function () {
            let split_linha = linha.split('<-');
            let variavel = split_linha[0].trim();
            let min = split_linha[1].trim().match(/.*(?=ATÉ|até]*)/)[0]; //O número é o unico grupo de captura
            let max = split_linha[1].replace(/(ATÉ|até)/,"").replace(/faça/gi,"").replace(min,""); //O número é o segundo grupo capturado
            
            console.log(split_linha);
            
            return [variavel, min, max];
        })();
        
        return PeteqsCore.ptq_para(args);
    },
    ptq_para: function (variaveis) {
        //Args é array com modelo Variavel, começo e fim
        let variavel = variaveis[0];
        let começo = variaveis[1];
        let fim = variaveis[2];

        let code = "";
        
        if(PeteqsHelper.is_num(começo) && PeteqsHelper.is_num(fim)){
            if (fim < começo) {
                code = `
                loopStart = Date.now();
                for(var ${variavel} = ${começo}; ${variavel}>= ${fim};${variavel}--){
                    if(Date.now() - loopStart > 30000){
                        PQ_print(target,'Erro no código - Loop demorou demais. Verifique se existe um loop infinito.')
                        break;
                    }
                    `;
                
            }
            else {
                code = `
                loopStart = Date.now();
                for(var ${variavel} = ${começo}; ${variavel}<= ${fim};${variavel}++){
                    if(Date.now() - loopStart > 30000){
                        PQ_print(target,'Erro no código - Loop demorou demais. Verifique se existe um loop infinito.')
                        break;
                    }
                    `;
               
            }
        }
        else{
             code = `
             loopStart = Date.now();
             ${variavel} = ${começo};
             if(${fim}>${começo}){
               increment = true;   
               ${variavel}--
               var condition = '${variavel} <= ${fim}';
               
              }
              else{
                increment =  false;
                ${variavel}++
                var condition = '${variavel} >= ${fim}';
              }
             while(true){
             if(Date.now() - loopStart > 30000){
                        PQ_print(target,'Erro no código - Loop demorou demais. Verifique se existe um loop infinito.')
                        break;
                    }
              if(increment){
                ${variavel}++;
              }else{
                ${variavel}--;
              }
              if(!eval(condition)){
                 break;
              }`
        }
        return code;
    },
    fim: function (linha) {

        if (PeteqsHelper.in_function && !linha.match(/para|se|enquanto|pr[oó]ximo/gi)) {
            PeteqsHelper.in_function = false;
            
            if(PeteqsHelper.vars.length>0){
              let conversion = `${PeteqsHelper.vars[PeteqsHelper.vars.length-1]}= resultado;`
              return `${conversion}
              return ${PeteqsHelper.vars.pop()} ; }`
            }
            else{
                return "}";
            }
        }
        return "}";
    }
}

const PeteqsHelper = {
    vars: []
    ,
    tokens: [" + ", " - ", " * ", "/", ' mod ', " <> ", "= ", " E ", " OU ", " NÃO ", 'VERDADEIRO', 'FALSO']
    ,
    separators: ["(", ")", ","]
    ,
    reserved_words: [/início/gi, /fim/gi, /pr[óo]ximo/gi, /senão/gi, /função/gi,/programa/gi,]
    ,
    in_function: false
    ,
    in_programa: false
    ,
    exp_converter: function (linha) {

        PeteqsHelper.tokens.forEach(function (token) {

            switch (token) {
                case '/':
                    if(linha.match("/")){
                        linha = linha += ">> 0";
                    }
                    break;
                case ' mod ':
                    linha = linha.replace(/mod/gi, '%');
                    break;
                case '= ':
                    linha = linha.replace(/(?<![<>])=/g, '==');
                    break;
                case ' <> ':
                    linha = linha.replace(token, '!=');
                    break;
                case ' E ':
                    linha = linha.replace(token, '&&');
                    break;
                case ' OU ':
                    linha = linha.replace(token, '||');
                    break;
                case ' NÃO ':
                    linha = linha.replace(token, '!');
                    break;
                case 'VERDADEIRO':
                    linha = linha.replace(/verdadeiro/gi, 'true');
                break;
                case 'FALSO':
                    linha = linha.replace(/falso/gi, 'false');
                break;
                default:
                    break;
            }
        })
        return linha;
    },
    handle_vectors: function (line) {

        if (PeteqsHelper.has_vector(line)) {
            line = PeteqsHelper.vector_exists_check(line) + line;
        }
        return line;
    },
    has_vector: function (line) {

        let regex = /\[.*\]/;

        return line.match(regex);
    },
    has_atribution: function (line) {
        return line.match("<-");
    },
    vector_exists_check: function (line) {

        let vectors = line.match(/[a-zA-Z0-9_]*(?=\[)/g);

        let code = "";

        vectors.forEach(function (vector) {
            if (vector) {
                code += `if(typeof ${vector} === 'undefined' || !${vector}){${vector} = Array("null")}`;
            }
        })

        return code;
    },
    is_num: function (arg) {
        return !isNaN(parseInt(arg));
    },
    analyze: function (linha) {
        linha = linha.trim();

        if (PeteqsHelper.has_atribution(linha)) {
            if (linha.match(/para|PARA/)) {
                return PeteqsCore.para(linha);
            }
            else {
                return PeteqsCore.atribui(linha);
            }
        }
        else if (linha.match(PeteqsHelper.reserved_words[0])) {
            return '//Início';
        }
        else if (linha.match(PeteqsHelper.reserved_words[1]) || linha.match(PeteqsHelper.reserved_words[2])) {
            return PeteqsCore.fim(linha);
        }
        else if (linha.match(/imprimaln/gi)) {
            return PeteqsCore.imprimaln(linha);
        }
        else if (linha.match(/imprima/gi)) {
            return PeteqsCore.imprima(linha);
        }
        else if (linha.match(/leia/gi)) {
            return PeteqsCore.leia(linha);
        }
        else if (linha.match(/senão/gi)) {
            return PeteqsCore.senao(linha);
        }
        else if (linha.match(/se/gi)) {
            return PeteqsCore.se(linha);
        }
        else if (linha.match(/para/gi)) {
            return PeteqsCore.para(linha);
        }
        else if (linha.match(/enquanto/gi)) {
            return PeteqsCore.enquanto(linha);
        }
        else if (linha.match(/função/gi)) {
            return PeteqsCore.funcao(linha);
        }
        else if (linha.match(/procedimento/gi)) {
            return PeteqsCore.procedimento(linha);
        }
        else if (linha.match("//")) {
            return linha; //Comentário
        }
        else if (linha.match(/Programa/gi)){
            PeteqsHelper.in_programa = true;
            return `/*** ${linha} ***/`
        }
        else { //É uma chamada de procedimento
            if (linha != "" && !PeteqsHelper.has_atribution(linha)) {
                return `if (typeof (${linha}) === 'function') {
                    ${linha}();
                }
                `;
            }
            return linha;
        }

    },
    execute: function (PQ_code, target) {

        let lines = PQ_code.split("\n");
        let code = "";
        for (var i = 0; i < lines.length; i++) {
            code += "\n" + PeteqsHelper.analyze(lines[i]);
        }
        try {
            if (target) {
                target.innerHTML = "";
                if(PeteqsHelper.in_programa == true){
                    code = code.slice(0,-1);
                }
                console.log(code);
                PQ_print(target, eval(code));
            }
            else {
                return new Function(code)();
            }
        }
        catch (e) {
            return PQ_print(target, "<br>Existe um erro no código", "<hr>", e);
        }
    }
}