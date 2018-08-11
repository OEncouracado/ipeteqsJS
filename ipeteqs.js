/**
 * Ipeteqs.js -> Implementação do interpretador de PETEQS ipeteqs em javascript 
 * 
 * 
 * @author Leon de França Nascimento
 */


//Assinatura da função PQ_print = PQ_print(target, arg1,arg2....argN)
function PQ_print(target) {

    //arguments[0] é target
    for (var i = 1; i < arguments.length; i++) {
        if (arguments[i] || arguments[i] === 0) {
            target.innerHTML += arguments[i];
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
        let statement = PeteqsHelper.exp_converter(args.replace(/^imprimaln|^imprima/gi, ''));
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
    * Caso a variável seja um vetor, tenta criar o vetor se este não existir.
    */
    leia: function (linha) {

        let code = ""

        linha = linha.substring(4, linha.length); //Remove o leia

        //Verifica a existência de um vetor e o inicializa caso não exista.
        code = PeteqsHelper.handle_vectors(linha)+"\n";
        
        code += PeteqsHelper.get_input(PeteqsHelper.has_vector(linha),linha);

        //Javascript faz typecasting pra string na função prompt. Aqui garantimos que os números sejam números        
        return code + `\nif(!isNaN(${linha})){
            ${linha} = Number(${linha})
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

        return args.replace(/<-/, "=");
    },
    /**
     * Função condicional: Separa os tokens PETEQS e retorna uma desvio condicional em Javascript.
     */
    se: function (cond) {
        //Ex.: SE Var = Verdadeiro ENTÃO
        cond = cond.replace(/se/gi, "");

        if (cond.match(/então/gi)) {
            cond = cond.replace(/então/gi, "");
        }

        cond = PeteqsHelper.exp_converter(cond.trim());

        //Torna-se: if(var == true){
        return `if(${cond}){`;
    },
    /**
     * Função condicional: Separa os tokens PETEQS e retorna uma desvio opcional em javascript
     * 
     * Equivale às estruturas ELSE e ELSE IF do Javascript.
     */
    senao: function (cond = '') {
        cond = cond.replace(/senão/gi, '');

        //A condição pode ou não estar presente
        if (cond.match(/se/gi)) {
            cond = PeteqsCore.se(cond);
        }
        //Se tiver uma condição (else if), retorna esta estrutura; caso contrario, cond é falsy('')
        return cond ? "}else " + cond : "}else{";
    },
    funcao: function (args) {

        let regex = /(\S+(?=\())(\(.*\))/;

        let assinatura = args.match(regex);

        let nome = assinatura[1];

        //A partir dos parametros da função, retorna as entradas e saídas para 
        let param = function (args) {
            args = args.replace(/entradas?:/gi, "");
            args = args.split(/sa[íi]da[s?]:/gi);

            let entradas = args[0] ? args[0].trim().slice(1, -1) : '';

            let saidas = args[1] != null ? args[1].trim().slice(0, -1) : 'variavel';


            return { 'entradas': entradas, 'saidas': saidas };

        }(assinatura[2]);

        //Atualiza as pilhas referente as funçoes
        PeteqsHelper.in_function.push(nome);
        PeteqsHelper.vars.push(param.saidas.split(","));

        return `function ${nome}(${param.entradas}){
            let ${param.saidas};`
    },
    procedimento: function (args) {

        let nome = args.replace(/procedimento/gi, "");

        return PeteqsCore.funcao(args);

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
        linha = linha.substr(4, linha.length - 4).trim(); //Remove os termos PARA e FAÇA.

        // Separa os valores a serem passados para ptq_para da sintaxe PETEQS
        let args = (function () {
            //A nome da variavel de controle é o valor antes da atribuição
            let split_linha = linha.split('<-');
            let variavel = split_linha[0].trim();

            //O começo é o unico valor antes do ATÉ
            let começo = split_linha[1].trim().match(/.*(?=ATÉ|até]*)/)[0];

            //O fim é o valor após o ATÉ e antes do FAÇA
            let fim = split_linha[1].replace(/(ATÉ|até)/, "").replace(/faça/gi, "").replace(começo, "");

            return [variavel, começo, fim];
        })();

        return PeteqsCore.ptq_para(args);
    },
    /**
     * Produz código javascript para representação de estruturas de repetição.
     * 
     * Como IPETEQS_JS não consegue diferenciar tipos/valores em tempo de execução, a não ser que os tipos estejam explicitados
     * no momento da interpretação, não há como saber qual número é maior que outro para montar um loop for.
     * 
     * Desta forma, utilizamos um loop while que avalia os valores de começo e fim no tempo de execução.
     * 
     */
    ptq_para: function (variaveis) {
        //Args é array com modelo Variavel, começo e fim
        let variavel = variaveis[0];
        let começo = variaveis[1].trim();
        let fim = variaveis[2].trim();

        let code = "";

        code = `
                 loopStart = Date.now();
                 var ${variavel} = ${começo};
                 if(${fim}>${começo}){
                   increment = true;   
                   ${variavel}--;
                   var condition_${variavel} = '${variavel} < ${fim}';
                   
                  }
                  else{
                    increment =  false;
                    ${variavel}++;
                    var condition_${variavel} = '${variavel} > ${fim}';
                  }
                 while(true){
                 if(Date.now() - loopStart > 30000){
                            PQ_print(target,'Erro no código - Loop demorou demais. Verifique se existe um loop infinito.')
                            break;
                        }
                        if(!eval(condition_${variavel})){
                            break;
                         }
                  if(increment){
                    ${variavel}++;
                  }else{
                    --${variavel};
                  }
                  `
        return code;
    },
    /**
     * Inclui as chaves que fecham um bloco. Se este bloco for uma função, inclui a declaração de retorno
     * 
     * Utiliza a pilha PeteqsHelper.vars.
     * 
     */
    fim: function (linha) {

        if (PeteqsHelper.in_function && !linha.match(/para|se|enquanto|pr[oó]ximo/gi)) {
            
            if (PeteqsHelper.vars.length > 0) {
                let funcvar = PeteqsHelper.vars.peep()

                let conversion = `${funcvar}= typeof resultado != "undefined" ? resultado : ${funcvar};`

                return `${conversion}
                   return ${PeteqsHelper.vars.pop()}; \n}`
            }
            else {
                return "}";
            }

            //Remove o flag da funçao atual da pilha de funçoes
            PeteqsHelper.in_function.pop();
        }
        return "}";
    }
};

const PeteqsHelper = {
    //Pilha que contém as variaveis
    vars: []
    ,
    vectors: []
    ,
    //Pilha que controla os blocos de funçao
    in_function: []
    ,
    //Operadores da linguagem PETEQS -- Usados em PeteqsHelper.exp_converter()
    operators: [" + ", " - ", " * ", "/", ' mod ', " <> ", "=", " E ", " OU ", " NÃO ", 'VERDADEIRO', 'FALSO']
    ,
    //Palavras reservadas
    reserved_words: [/^início/gi, /^fim/gi, /^pr[óo]ximo/gi, /^senão/gi, /^função/gi, /^programa/gi,]
    ,    
    //Determina se a linha analisada faz parte de um bloco contido em um programa
    in_programa: false
    ,
    purge:function(){
        PeteqsHelper.vars = []
        PeteqsHelper.vectors = []
        PeteqsHelper.in_function = []
    },
    /**
     * Para cada um dos operadores PETEQS, analisa a linha e substitui pelos equivalentes em Javascript. 
     * Aqui também é feita a correção da divisão como ocorre em PETEQS, pois em Javascript ela ocorre por padrão
     * em número reais.
     */
    exp_converter: function (linha) {

        PeteqsHelper.operators.forEach(function (operator) {

            switch (operator) {
                case '/':
                    if (linha.match(/(?!^).\/./)) {

                        if (!linha.match(/(?!^)\d\.\d/g)) {
                            //Caso não se especifique que deseja-se operar em números reais, trunca-se a parte decimal.
                            //Operadores bitwise em JS convertem por padrão o número para um int de 32 bits.
                            divisoes = linha.match(/(?!^)(\b.*\/.*\b)/g);

                            divisoes.forEach(function(match){
                                if(divisoes == linha){
                                    linha = linha.replace(match,"$&>>0");
                                    return;
                                }
                                linha = linha.replace(match,"($&>>0)");
                            });
                        }
                    }
                    break;
                case ' - ':
                    linha = linha.replace(/–/g, '-');
                    break;
                case ' mod ':
                    linha = linha.replace(/mod/gi, '%');
                    break;
                case '=':
                    linha = linha.replace(/[^<>!]=+/g, '==');
                    break;
                case ' <> ':
                    linha = linha.replace(/<>/g, '!=');
                    break;
                case ' E ':
                    linha = linha.replace(/ E /g, '&&');
                    break;
                case ' OU ':
                    linha = linha.replace(/ OU /g, '||');
                    break;
                case ' NÃO ':
                    linha = linha.replace(/ NÃO /g, '!');
                    break;
                case 'VERDADEIRO':
                    linha = linha.replace(/Verdadeiro/g, 'true');
                    break;
                case 'FALSO':
                    linha = linha.replace(/Falso/g, 'false');
                    break;
                default:
                    break;
            }
        });

        return linha;
    },
    /**
     * Lida com as variaveis indexadas -- Se um vetor não existe ele o cria, se existe, atribui o dado à variável
     */
    handle_vectors: function (line) {

        if (PeteqsHelper.has_vector(line)) {
            line = PeteqsHelper.vector_exists_check(line) + line;
        }
        return line;
    },
    /**
     * Regex para avaliar se a linha avaliada possui um vetor
     */
    has_vector: function (line) {

        let regex = /\[(.+?)\]/g;

        return line.match(regex);
    },
    /**
     * Regex para avaliar se a linha avaliada possui uma operação de atribuição
     */
    has_atribution: function (line) {
        return line.match(/<-/g);
    },
    /**
     * Toda vez que uma linha contem um vetor, identifica o nome das variaveis que representam vetores e 
     * inclui um código que checa se estes vetores já existem, criando o vetor dinamicamente em tempo de execução
     */
    vector_exists_check: function (line) {

        let vectors = line.match(/[a-zA-Z0-9_]*(?=\[)/g);

        let code = "";

        vectors.forEach(function (vector) {

            if(vector != ""){
                let flag = PeteqsHelper.vectors.includes(vector);
                console.log(vector + "---" + flag);

                if (!flag) {
                    //Atualiza a lista de vetores
                    PeteqsHelper.vectors.push(vector);

                    code += `if(typeof ${vector} === 'undefined' || !${vector}){\n${vector} = Array("null")\n}`;
                }
            }
        });

        return code;
    },
    get_input:function(flag,varname){
        //Flag muda a apresentaç~ao do prompt

        if (flag) {
            return `${varname} = prompt('Insira o valor da variável do vetor');`;
        }   
        else {
            return `${varname} = prompt('Insira o valor da variável ${varname}');`;
        }
    },
    /**
     * Função de análise de linha PETEQS.
     * 
     * Para cada linha, identifica a presença de palavras reservadas e operadores, chamando as funções em PeteqsCore que
     * produzem código javascript equivalente. 
     */
    analyze: function (linha) {
        linha = linha.trim();

        if (PeteqsHelper.has_atribution(linha)) {
            if (linha.match(/^para|^PARA/)) {
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
        else if (linha.match(/^imprimaln/gi)) {
            return PeteqsCore.imprimaln(linha);
        }
        else if (linha.match(/^imprima/gi)) {
            return PeteqsCore.imprima(linha);
        }
        else if (linha.match(/^leia/gi)) {
            return PeteqsCore.leia(linha);
        }
        else if (linha.match(/^senão/gi)) {
            return PeteqsCore.senao(linha);
        }
        else if (linha.match(/^se/gi)) {
            return PeteqsCore.se(linha);
        }
        else if (linha.match(/^enquanto/gi)) {
            return PeteqsCore.enquanto(linha);
        }
        else if (linha.match(/^função/gi)) {
            return PeteqsCore.funcao(linha);
        }
        else if (linha.match(/^procedimento/gi)) {
            return PeteqsCore.procedimento(linha);
        }
        else if (linha.match("//")) {
            return linha; //É um comentário
        }
        else if (linha.match(/^Programa/gi)) {
            PeteqsHelper.in_programa = true;
            return `/*** ${linha} ***/`;
        }
        else { //É uma chamada de procedimento
            let match = linha.match(/\(.*\)/gi)
            if (linha != "" && match) {

                f_name = linha.replace(/\(.*\)/gi,"")

                return `if (typeof (${f_name}) === 'function') {
                    ${linha};
                }
                `;
            }
            return linha;
        }
    },
    /**
     * Recebe um string contendo codigo em PETEQS e um alvo DOM
     * 
     * Analisa, interpreta e executa o código PETEQS no alvo designado.
     */
    execute: function (PQ_code, target) {

        //Limpa as variaveis da execução anterior
        PeteqsHelper.purge();

        PQ_code = PQ_code.replace(//g,"<-");
        let lines = PQ_code.split("\n");
        let code = "";        

        for (var i = 0; i < lines.length; i++) {
            code += "\n" + PeteqsHelper.analyze(lines[i]);
        }
        try {
            console.log(code)
            if (target) {
                target.innerHTML = "";
                if (PeteqsHelper.in_programa == true) {
                    code = code.trim().slice(0,-1);
                }
                PQ_print(target, eval(code));
            }
            else {
                return new Function(code)();
            }
        }
        catch (e) {
            console.log(e)
            return PQ_print(target, "<br>Existe um erro no código", "<hr>", e);
        }
    }
};


Array.prototype.peep = function() {
    return this[this.length-1];
}