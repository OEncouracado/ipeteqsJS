ipeteqs
=======

Interpretador da pseudolinguagem PETEQS

A linguagem PETEQS é uma pseudolinguagem utilzada no aprendizado de lógica de programação em algumas faculdades.
Especificamente na UFF. Um problema para os iniciantes é que não há como executar códigos em PETEQS. Até agora...

Este é um interpretador da linguagem que funciona baseado em tradução para uma linguagem real e execução.
Ele é escrito em ruby, tanto o tradutor como a linguagem-destino.

## Ipeteqs em Javascript?

Visando a possibilidade de executar PETEQS em qualquer lugar, ipeteqs foi portado para Javascript. Assim como o interpretador original, ele traduz a linguagem PETEQS para uma linguagem real e a executa, sendo escrito  em Javascript ambos o tradutor e o código traduzido.

Sendo importado em uma página, recebe um string de código PETEQS e retorna a execução deste código.

## A linguagem PETEQS

A linguagem PETEQS todas as operações básicas. Em PETEQS, o operador de atribuição é `<-` :

    a <- 1                  // Atribuição
    a <- 2 + 2              // Soma
    a <- 2 - 1              // Subtração
    a <- a * 20             // Multiplicação
    a <- a mod 5            // Módulo

A exceção é a divisão. PETEQS trabalha normalmente com a divisão de inteiros, onde um número dividido sempre tera seu resultado como um inteiro.

    a <- 20 / 2             // a será 10
    a <- 20/3               // a será 6

Para fazer a divisão com um número real, deve-se incluir o ponto decimal.

    a <- 20.0 / 3           // a será 6.666..

A não ser que seja explicitamente declarado no momento da divisão, IPETEQS não consegue *por agora* determinar o tipo número em tempo de execução, então o código abaixo trabalharia com divisão de inteiros, exceto no caso em que o ponto está incluso na operação.

    a <- 15
    a <- a / 4              // a será 3
    
    b <- 15
    a <- b / 4.0            // b será 3.75

    a <- 15
    b <- 4
    a <- a/b                // a será 3, não é possível determinar tipo em tempo de execução.

IPETEQS possui também desvios condicionais, que atuam nos operadores lógicos `>`(maior que),`>=`(maior que ou igual),`<`(menor que),`<=`(menor que ou igual),`<>`(diferente de),`=`(igual à):

    SE a > 0 FAÇA
      //Código aqui
    FIM SE

    SE b < 100 FAÇA
      //Faça algo aqui
    SENÂO
      //Faça outra coisa aqui
    FIM SE  

    SE C = 2
      imprimaln 'C é 2'
    SENÃO SE C <> 3
      imprimaln 'C não é 3'
    SENÃO
      imprima 'C é qualquer outro número'
    FIM SE

A linguagem também possui duas estruturas de repetição, os laços `para` e os laços `enquanto`,