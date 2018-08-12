//----------------- Funçoes utilitarias CEDERJ --------------------//

function ordem(char){
    return char.charCodeAt(0);
}

function tamanho(mensuravel){
    return mensuravel.length-1;
} 

function charAt(str,pos){
    return str.charAt(pos-1);
}

function abs(num){
    return num > 0? num : -num;
}

function concat(str1,str2){
    return str1 + str2;
}

function find(string, sub){
    if (!string.match(sub)){
        return -1;
    }

    let matches = 0;
    let index = 0;

    do{
        if(string[index] == sub[matches]){
            matches++;

        }
        else{
            matches = 0;
        }
        index++;
    } while(matches < sub.length)

    return (index - sub.length)+1;
}
//-------------------------------------------------------------------------------/

function abrirCodigoJavascript(){
    code = PeteqsHelper.execute(document.querySelector('#codearea').value);

    var janela=window.open('');
    
    with(janela){
        code = js_beautify(code, {
        'indent_size': 1,
        'indent_char': '\t'
        });
        code = code.replace(/\<br\>/gi,"\\n")
        document.write("<pre>"+code+"</pre>");
    }   
}