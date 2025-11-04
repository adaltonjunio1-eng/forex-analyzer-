import re

# Ler o arquivo CSS
with open('css/style.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Ler o CSS correto
with open('css/divergence-fix.css', 'r', encoding='utf-8') as f:
    fixed_css = f.read()

# Encontrar e substituir a seção problemática
# Procurar pela seção com espaços unicode
pattern = r' \n / \*.*?@ k e y f r a m e s.*?\} \n \n'
replacement = '\n\n' + fixed_css + '\n'

# Fazer a substituição com regex DOTALL
new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# Salvar o arquivo corrigido
with open('css/style.css', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ CSS corrigido com sucesso!")
print("Os erros de encoding foram removidos.")
