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