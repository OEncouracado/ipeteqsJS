/**
 * Ipeteqs.js -> Implementação do interpretador de PETEQS ipeteqs em javascript 
 * 
 * 
 * @author leon de frança nascimento
 */

var vars = [];

//Assinatura da função PQ_print = PQ_print(target, arg1,arg2....argN)
function PQ_print(target) {

    //arguments[0] é target
    for (var i = 1; i < arguments.length; i++) {
        if (arguments[i]) {
            target.innerHTML += arguments[i];
        }
    }

}

const PeteqsCore = {
    imprima: function (args = '') {
        let statement = PeteqsHelper.exp_converter(args.replace(/imprimaln|imprima/, ''));
        return `PQ_print(target,${statement});`
    },
    imprimaln: function (args = '') {
        return PeteqsCore.imprima(args) + "\nPQ_print(target,'<br>')";
    },
    leia: function (linha) {
        linha = linha.substring(4, linha.length); //Remove o leia

        let variavel = PeteqsHelper.handle_vectors(linha);

        return `${variavel} = prompt('Insira o valor da variável');`
    },
    atribui: function (args) {

        args = PeteqsHelper.exp_converter(args);

        args = PeteqsHelper.handle_vectors(args);

        return args.replace("<-", "=");
    },
    se: function (cond) {
        //Ex.: SE Var = Verdadeiro ENTÃO
        cond = cond.replace(/SE/gi, '');

        if (cond.match(/Então/gi)) {
            cond = cond.substring(0, -6)
        }
        cond = cond.trim();

        cond = PeteqsHelper.exp_converter(cond);

        return `if(${cond}){`;
    },
    senao: function (cond = '') {
        cond = cond.replace('senão', '');

        if (cond.match(/se/gi)) { //SENÃO SE var == Falso
            cond.replace(/se/gi, "");
            cond = PeteqsCore.se(cond);
        }
        return cond ? "}else " + cond : "}else{";
    },
    funcao: function (args) {

    },
    procedimento: function (args) {

    },
    enquanto: function (cond) {

        cond = cond.replace(/enquanto/gi, "");
        cond = cond.replace(/faça/gi, "");

        return "while(" + PeteqsHelper.exp_converter(cond) + "){";

    },
    para: function (linha) {
        linha = linha.substr(4, linha.length - 4).trim();

        let args = (function () {
            let split_linha = linha.split('<-');
            let variavel = split_linha[0].trim();
            let min = split_linha[1].match('[0-9]*.')[0]; //O número é o unico grupo de captura
            let max = split_linha[1].match('(ATÉ|até) ([0-9]*.)')[2]; //O número é o segundo grupo capturado


            return [variavel, min, max];
        })();

        return PeteqsHelper.ptq_para(args);
    },
    fim: function () {
        if (PeteqsHelper.in_function) {
            PeteqsHelper.in_function = false;
        }
        return "}";
    }
}

var PeteqsHelper = {
    tokens: ["+", "-", "*", "/", " mod ", "<>", "=", " e ", " ou ", " não "]
    ,
    separators: ["(", ")", ","]
    ,
    reserved_words: ['início', 'fim', 'próximo', 'senão', 'função']
    ,
    in_function: false
    ,
    ptq_para: function (variaveis) {
        //Args é array com modelo Variavel, começo e fim
        let variavel = variaveis[0];
        let começo = variaveis[1];
        let fim = variaveis[2];

        let code = "";

        if (fim < começo) {
            code = `for(var ${variavel} = ${começo}; ${variavel}>= ${fim};${variavel}--){`;
            return
        }
        else {
            code = `for(var ${variavel} = ${começo}; ${variavel}<= ${fim};${variavel}++){`;
            return code;
        }

    },
    exp_converter: function (linha) {

        PeteqsHelper.tokens.forEach(function (token) {

            switch (token) {
                case ' mod ':
                    linha = linha.replace(token, '%');
                    break;
                case '=':
                    linha = linha.replace(token, '==');
                    break;
                case '<>':
                    linha = linha.replace(token, '!=');
                    break;
                case 'e':
                    linha = linha.replace(token, '&&');
                    break;
                case 'ou':
                    linha = linha.replace(token, '||');
                    break;
                case 'não':
                    linha = linha.replace(token, '!');
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
    has_modulo: function (line) {

        return line.match(PeteqsHelper.tokens[4]);
    },
    vector_exists_check: function (line) {

        vectors = line.match(/[a-zA-Z0-9_]*(?=\[)/g);

        code = "";

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
            if (linha.match('para|PARA')) {
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
        else { //É um comentário
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

var linha =
    `início
leia a
para i<-1 até a faça
  se i mod 2 = 0
    imprimaln i,'-- par'
  senão se i mod 3 = 0
    imprimaln 'brasil'
  fim se
próximo i

a = 3

enquanto a > 0 faça
  imprimaln 'Contando...', a
  a = a - 1
fim

a = 5

para i<-1 até 5 faça
  leia vetor[i]
  imprimaln "O", i ,"simo valor do vetor é ", vetor[i]
próximo i
`;

PeteqsHelper.execute(linha, document.getElementById('test'));