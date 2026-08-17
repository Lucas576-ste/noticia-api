# language: pt
Funcionalidade: Criação de Notícia

  Cenário: Payload válido cria a notícia
    Dado um payload válido com titulo e descricao
    Quando eu envio POST /noticias
    Então a API responde 201 com a notícia criada

  Cenário: Payload sem o titulo é rejeitado
    Dado um payload sem o campo titulo
    Quando eu envio POST /noticias
    Então a API responde 400 e não persiste nada

  Cenário: Payload com campo fora do DTO é rejeitado
    Dado um payload com o campo autor além de titulo e descricao
    Quando eu envio POST /noticias
    Então a API responde 400 e não persiste nada
