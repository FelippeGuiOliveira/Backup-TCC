# Crie uma função que receba um número de 1 a 26 e transforme esse número em sua respectiva letra do alfabeto

def alfabeto():
    while True:
        entrada = int(input('Digite o número que representa a letra que você deseja: '))
        if entrada < 1 or entrada > 26:
            print ('entrada inválida')
        else:
            break

    listaUnicode = list(range(65, 91))
    listaLetras = [chr(n) for n in listaUnicode]
    print(f'O número escolhido foi {entrada} e a letra respectiva é {listaLetras[entrada - 1]}')

alfabeto()