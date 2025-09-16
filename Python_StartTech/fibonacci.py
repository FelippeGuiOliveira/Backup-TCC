def fibonacci():
    distancia = int(input('Escolha quantos números da sequencia de fibonacci você quer que apareça: '))
    lista = ['0', '1']
    for resultado in range(distancia + 1):
        resultado = int(lista[-1]) + int(lista[-2])
        lista.append(str(resultado))

    print(f'Sequencia de fibonacci: {' - '.join(lista)}')

fibonacci()