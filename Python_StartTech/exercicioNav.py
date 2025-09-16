def saudacaoNave ():
    print('=========================================== \n' \
    'Painel de Comando - Nave Espacial Solaris \n' \
    'Bem-vindo(a), comandante. Sistemas iniciados. \n' \
    '===========================================')

def menuComandos ():
    print(
    '1 - Visualizar Planetas-Alvo \n' \
    '2 - Iniciar Sequência de Pouso \n' \
    '3 - Checar Status da Nave \n' \
    '4 - Abrir compartimento de carga \n' \
    '5 - Encerrar painel de controle \n' \
    '===========================================')
    escolha = input('\nComandante, você possui 5 opções disponíveis \n' \
    'Escolha uma dessas opções: ')
    while escolha != '1':
        print('Ainda nao possuimos essa funcionalidade \n')
        escolha = input('Escolha alguma das outras opções disponíveis: ')
    print('===========================================')    

def listaPlanetas ():
    planetas = ["Zentar", "Orion IV", "Nebulon", "Krylon-7"]

    print(f'\nTotal de planetas cadastrados como destino: {len(planetas)} \n\n'
        '===========================================')
    for indice, nome in enumerate(planetas):
        print(f'{indice + 1} - {nome}')
    print('===========================================')    
    while True:
        destino = int(input('Escolha um planeta de destino: '))
        
        if 1 <= destino < len(planetas) + 1:
            print(f'Coordenadas de destino atualizadas para {planetas[destino - 1]}')
            break
        else:
            print('Essa não é uma opção válida')

def encerramento():
    print('===========================================')
    print('Encerrando painel de comando... \n' \
    'Boa Sorte na missão, Comandante')

saudacaoNave()
menuComandos()
listaPlanetas()
encerramento()