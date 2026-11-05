"""
A planilha para o cliente revisar a biblioteca por amostragem.

    npm run planilha                               # grava relatorios/planilha-revisao.xlsx
    npm run planilha -- --novos-desde <commit>     # marca quem entrou depois daquela versão

Uma aba por nível, com o jogador, os clubes da carreira na ordem em que o
jogo mostra e as duas dicas, além de duas colunas para quem revisa marcar o
que achou. O nome de cada clube é o mesmo que aparece embaixo do escudo.
A aba "Como revisar" explica as colunas. Refeita a cada `npm run atualizar`.
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.worksheet.datavalidation import DataValidation

RAIZ = Path(__file__).resolve().parent.parent
SAIDA = RAIZ / 'relatorios' / 'planilha-revisao.xlsx'

NIVEIS = [('facil', 'Fácil'), ('intermediario', 'Intermediário'), ('dificil', 'Difícil')]
COLUNAS = [
    ('Jogador', 30),
    ('Novo', 8),
    ('Clubes da carreira', 60),
    ('Dica 1', 44),
    ('Dica 2', 60),
    ('Revisão', 18),
    ('Observação', 36),
    ('Id', 24),
]
MARCAS = ['OK', 'Corrigir carreira', 'Corrigir dica', 'Mudar de nível', 'Tirar do jogo']

FONTE = 'Arial'
VERDE = '12201A'
CINZA = 'D9D9D9'


def nomes_dos_clubes():
    """O nome que o jogo mostra embaixo do escudo, de src/dados/clubes.ts."""
    texto = (RAIZ / 'src' / 'dados' / 'clubes.ts').read_text(encoding='utf-8')
    return {
        m.group(1): json.loads(m.group(2))
        for m in re.finditer(r"\{ id: '([^']+)', nome: (\"(?:[^\"\\\\]|\\\\.)*\")", texto)
    }


def ids_da_versao(ref):
    """Os ids da biblioteca numa versão do git, para marcar quem entrou depois dela."""
    bruto = subprocess.run(['git', 'show', f'{ref}:src/dados/jogadores.json'], cwd=RAIZ,
                           capture_output=True, text=True, check=True).stdout
    return {j['id'] for j in json.loads(bruto)}


def aba_de_nivel(livro, titulo, jogadores, clubes, antigos):
    aba = livro.create_sheet(titulo)
    borda = Border(bottom=Side(style='thin', color=CINZA))
    for col, (cabecalho, largura) in enumerate(COLUNAS, start=1):
        celula = aba.cell(row=1, column=col, value=cabecalho)
        celula.font = Font(name=FONTE, bold=True, color='FFFFFF')
        celula.fill = PatternFill('solid', fgColor=VERDE)
        celula.alignment = Alignment(vertical='center')
        aba.column_dimensions[celula.column_letter].width = largura
    aba.row_dimensions[1].height = 22

    for linha, j in enumerate(sorted(jogadores, key=lambda x: x['nome'].lower()), start=2):
        nome = j['nome'] + (f" ({j['complemento']})" if j.get('complemento') else '')
        carreira = ' › '.join(clubes.get(c, c) for c in j['clubes'])
        novo = 'sim' if antigos is not None and j['id'] not in antigos else None
        valores = [nome, novo, carreira, j['dicas'][0], j['dicas'][1], None, None, j['id']]
        for col, valor in enumerate(valores, start=1):
            celula = aba.cell(row=linha, column=col, value=valor)
            celula.font = Font(name=FONTE, size=10, color='808080' if col == 8 else '000000')
            celula.alignment = Alignment(wrap_text=col in (1, 3, 4, 5, 7), vertical='top')
            celula.border = borda
        # as duas colunas de quem revisa, em amarelo
        for col in (6, 7):
            aba.cell(row=linha, column=col).fill = PatternFill('solid', fgColor='FFF2CC')

    ultima = len(jogadores) + 1
    marcas = DataValidation(type='list', formula1='"' + ','.join(MARCAS) + '"', allow_blank=True)
    marcas.add(f'F2:F{ultima}')
    aba.add_data_validation(marcas)
    aba.freeze_panes = 'B2'
    # impressa, cabe na largura da folha deitada
    aba.page_setup.orientation = 'landscape'
    aba.page_setup.fitToWidth = 1
    aba.page_setup.fitToHeight = 0
    aba.sheet_properties.pageSetUpPr.fitToPage = True
    aba.print_title_rows = '1:1'
    aba.auto_filter.ref = f'A1:H{ultima}'
    return aba


def aba_de_instrucoes(livro, contagem, total, novos):
    aba = livro.active
    aba.title = 'Como revisar'
    aba.column_dimensions['A'].width = 22
    aba.column_dimensions['B'].width = 90
    aba.page_setup.fitToWidth = 1
    aba.page_setup.fitToHeight = 0
    aba.sheet_properties.pageSetUpPr.fitToPage = True
    linhas = [
        ('Acerte o jogador pela carreira', None),
        ('Biblioteca', f'{total} jogadores: ' + ', '.join(f'{n} {c}' for n, c in contagem)),
        ('Novo', f'"sim" nos {novos} que entraram nesta ampliação; vale começar a amostra por eles.' if novos
         else 'Vazia: a planilha foi gerada sem comparar com uma versão anterior.'),
        (None, None),
        ('Como revisar', 'Escolha alguns jogadores de cada aba e confira a carreira e as duas dicas.'),
        ('Revisão', 'Coluna amarela para preencher: ' + ', '.join(MARCAS) + '.'),
        ('Observação', 'Coluna amarela para preencher: o que está errado, em poucas palavras.'),
        ('Exemplo', 'Revisão "Corrigir carreira" e Observação "falta o Santos entre o São Paulo e o Porto".'),
        (None, None),
        ('Clubes da carreira', 'Na ordem em que o jogo mostra os escudos, com o nome que aparece embaixo de cada um.'),
        ('Dica 1', 'Posição, país de nascimento e ano; a seleção, quando ele defendeu a de outro país.'),
        ('Dica 2', 'O fato que aproxima do acerto: gol em final, título, jogos por um clube.'),
        ('Id', 'O código do jogador na biblioteca; ajuda a achar o registro na hora de corrigir.'),
        (None, None),
        ('Fonte', 'Carreiras, títulos e jogos: Transfermarkt. Gerada por scripts/planilha-revisao.py.'),
    ]
    for i, (rotulo, texto) in enumerate(linhas, start=1):
        a = aba.cell(row=i, column=1, value=rotulo)
        b = aba.cell(row=i, column=2, value=texto)
        a.font = Font(name=FONTE, bold=True, size=14 if i == 1 else 10)
        b.font = Font(name=FONTE, size=10)
        b.alignment = Alignment(wrap_text=True, vertical='top')
        a.alignment = Alignment(vertical='top')
    return aba


def main():
    argumentos = argparse.ArgumentParser()
    argumentos.add_argument('--novos-desde', help='versão do git com a biblioteca de antes')
    opcoes = argumentos.parse_args()
    jogadores = json.loads((RAIZ / 'src' / 'dados' / 'jogadores.json').read_text(encoding='utf-8'))
    antigos = ids_da_versao(opcoes.novos_desde) if opcoes.novos_desde else None
    novos = sum(1 for j in jogadores if antigos is not None and j['id'] not in antigos)
    clubes = nomes_dos_clubes()
    livro = Workbook()
    contagem = [(titulo, sum(1 for j in jogadores if j['nivel'] == chave)) for chave, titulo in NIVEIS]
    aba_de_instrucoes(livro, contagem, len(jogadores), novos)
    for chave, titulo in NIVEIS:
        aba_de_nivel(livro, titulo, [j for j in jogadores if j['nivel'] == chave], clubes, antigos)
    SAIDA.parent.mkdir(exist_ok=True)
    livro.save(SAIDA)
    print(f'{SAIDA.relative_to(RAIZ)}: ' + ', '.join(f'{t} {c}' for t, c in contagem))


if __name__ == '__main__':
    sys.exit(main())
