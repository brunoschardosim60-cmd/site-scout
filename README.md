# Site Scout

Crie uma plataforma web profissional de prospecção de clientes para criação de sites, landing pages e mini sites, funcionando como um CRM inteligente de empresas.

O objetivo principal é permitir que o usuário encontre empresas que sejam potenciais clientes para criação ou reformulação de sites, visualize essas empresas no mapa, filtre por região e segmento, identifique quais possuem site e quais estão sem presença digital ou possuem um site desatualizado, e faça o controle completo da prospecção.

1. DASHBOARD PRINCIPAL

Criar um dashboard moderno mostrando:

Total de empresas cadastradas/encontradas

Empresas sem site

Empresas com site

Empresas com site aparentemente desatualizado

Empresas já contatadas

Empresas ainda não contatadas

Empresas que demonstraram interesse

Clientes fechados

Empresas por segmento

Empresas por cidade/estado

Taxa de conversão

Últimos contatos realizados

Criar gráficos e indicadores visuais.

2. MAPA INTERATIVO

Adicionar um mapa utilizando Google Maps ou alternativa compatível.

O mapa deve mostrar as empresas encontradas através de marcadores.

Cada marcador deve apresentar:

Nome da empresa

Segmento

Endereço

Cidade

Telefone

WhatsApp, quando disponível

Site

Status da empresa

Status da prospecção

Ao clicar no marcador, abrir um painel lateral com todas as informações.

Possibilitar:

Pesquisar por cidade

Pesquisar por bairro

Pesquisar por CEP

Pesquisar por estado

Pesquisar por segmento

Pesquisar por raio em quilômetros

Selecionar uma região diretamente no mapa

Ampliar a busca para outras cidades

Busca por todo o Brasil

3. BUSCA DE EMPRESAS

Criar sistema de busca de potenciais clientes.

Permitir pesquisar por:

Nome da empresa

CNPJ

CPF, quando aplicável

Segmento

Categoria

Cidade

Estado

Bairro

CEP

Exemplos de segmentos:

Restaurantes

Clínicas

Dentistas

Psicólogos

Advogados

Contadores

Oficinas

Autoelétricas

Mecânicas

Salões de beleza

Barbearias

Estéticas

Academias

Pet shops

Veterinários

Imobiliárias

Transportadoras

Empresas de eventos

Fotógrafos

Arquitetos

Engenheiros

Prestadores de serviços

Lojas

Pequenas empresas

Profissionais autônomos

Permitir adicionar segmentos personalizados.

4. ANÁLISE DE PRESENÇA DIGITAL

Para cada empresa, tentar identificar:

Possui site?

URL do site

Site acessível?

Site responsivo?

Site aparentemente atualizado?

Site com HTTPS?

Site com aparência profissional?

Possui formulário de contato?

Possui botão de WhatsApp?

Possui Google Maps?

Possui redes sociais?

Criar um indicador:

OPORTUNIDADE DE SITE

Exemplo:

🔴 Alta oportunidade
Empresa sem site.

🟠 Boa oportunidade
Empresa possui site antigo ou com problemas.

🟡 Oportunidade moderada
Empresa possui site razoável, mas pode ser modernizado.

🟢 Baixa oportunidade
Empresa já possui presença digital forte.

IMPORTANTE: essa análise deve ser apresentada como uma estimativa baseada nos dados disponíveis, e não como uma conclusão absoluta.

5. SCORE DE PROSPECÇÃO

Criar um sistema de pontuação de 0 a 100 para indicar quais empresas são melhores potenciais clientes.

Considerar fatores como:

Não possui site

Site antigo

Site não responsivo

Pouca presença digital

Possui WhatsApp

Possui telefone

Empresa ativa

Segmento com alta demanda por sites

Boa avaliação no Google

Número de avaliações

Localização

Tamanho aparente da empresa

Exemplo:

SCORE 92/100

🔥 Excelente oportunidade

Motivos:

Não possui site

Possui WhatsApp

Possui Instagram

Empresa ativa

Muitas avaliações no Google

Criar filtros para mostrar somente empresas com score acima de determinado valor.

6. CADASTRO DA EMPRESA

Cada empresa deve possuir uma página/perfil com:

Nome fantasia

Razão social

CNPJ

CPF, quando aplicável

Nome do responsável

Cargo do responsável

Telefone

WhatsApp

E-mail

Endereço

Cidade

Estado

CEP

Segmento

Site

Instagram

Facebook

Google Maps

Observações

Data de cadastro

Data do último contato

Não inventar dados pessoais. Mostrar somente informações disponíveis em fontes permitidas e públicas.

7. WHATSAPP

Criar botão:

"Conversar no WhatsApp"

Ao clicar, abrir o WhatsApp diretamente com o número da empresa.

Também criar mensagens pré-configuradas.

Exemplo para restaurante:

"Olá, tudo bem? Meu nome é Bruno, trabalho com criação de sites e soluções digitais para empresas. Encontrei o [NOME DA EMPRESA] e percebi que vocês poderiam ter uma presença digital ainda mais profissional. Posso te mostrar uma ideia de site que poderia ajudar a empresa a receber mais clientes?"

Criar mensagens diferentes para cada nicho.

Exemplos:

Restaurante

Clínica

Dentista

Barbearia

Salão

Oficina

Transportadora

Imobiliária

Advocacia

Contabilidade

Academia

Pet shop

Loja

Prestador de serviço

Permitir editar as mensagens.

Usar variáveis:

{nome_empresa}
{nome_responsavel}
{segmento}
{cidade}
{nome_vendedor}

8. CONTROLE DE PROSPECÇÃO

Cada empresa deve possuir um status:

Não contatado

Primeiro contato realizado

Aguardando resposta

Respondeu

Interessado

Reunião marcada

Proposta enviada

Negociação

Cliente fechado

Cliente perdido

Não tem interesse

Contatar novamente

Adicionar botão:

"Marcar como contatado"

Ao clicar, registrar automaticamente:

Data

Hora

Usuário

Canal utilizado

Mensagem utilizada

Observação

9. HISTÓRICO

Cada empresa deve possuir uma timeline:

17/08/2026 — Primeiro contato via WhatsApp
18/08/2026 — Cliente respondeu
19/08/2026 — Proposta enviada
22/08/2026 — Follow-up realizado

Permitir adicionar observações manualmente.

10. FOLLOW-UP

Criar sistema de lembretes.

Exemplo:

"Entrar em contato novamente em 3 dias."

Dashboard:

FOLLOW-UPS DE HOJE

Mostrar todas as empresas que precisam ser contatadas novamente.

Adicionar botão:

"WhatsApp"

"Marcar como concluído"

"Adiar"

11. FILTROS AVANÇADOS

Criar filtros combináveis:

Estado

Cidade

Bairro

Segmento

Possui site

Não possui site

Site desatualizado

Possui WhatsApp

Já contatado

Não contatado

Interessado

Score mínimo

Score máximo

Data do último contato

Exemplo:

"Mostrar clínicas odontológicas de Canoas que não possuem site, possuem WhatsApp e nunca foram contatadas."

12. LISTA DE EMPRESAS

Além do mapa, criar uma tabela/listagem.

Colunas:

Empresa | Segmento | Cidade | Site | WhatsApp | Score | Status | Último contato | Ações

Ações:

Visualizar

WhatsApp

Abrir mapa

Abrir site

Marcar contato

Adicionar observação

Permitir ordenar por:

Maior score

Menor score

Cidade

Segmento

Mais recentes

Nunca contatados

13. PRIORIZAÇÃO INTELIGENTE

Criar uma seção:

"MELHORES OPORTUNIDADES"

O sistema deve recomendar automaticamente quais empresas abordar primeiro.

Exemplo:

⭐ Clínica X — Score 96

⭐ Restaurante Y — Score 94

⭐ Oficina Z — Score 91

Mostrar o motivo da recomendação.

14. PROPOSTA DE SITE

Dentro do perfil da empresa, adicionar botão:

"Criar proposta"

Permitir selecionar:

Mini Site

Landing Page

Site Institucional

Site Completo

E-commerce

Permitir definir:

Valor

Prazo

Serviços inclusos

Observações

Gerar uma proposta visualmente profissional.

15. VISUAL

Interface moderna, profissional e rápida.

Estilo semelhante a um SaaS/CRM moderno.

Layout:

Sidebar esquerda:

Dashboard
Mapa
Empresas
Prospecção
Follow-ups
Mensagens
Propostas
Relatórios
Configurações

Área principal com cards, tabelas e mapa.

Usar modo claro e escuro.

Interface totalmente responsiva para computador, tablet e celular.

16. BANCO DE DADOS

Estruturar o banco para suportar crescimento para milhares ou milhões de empresas.

Principais tabelas:

users
companies
contacts
prospecting
messages
followups
proposals
activities
regions
segments

Relacionar corretamente empresa, responsável, contatos e histórico.

17. SEGURANÇA

Criar autenticação de usuários.

Cada usuário deve visualizar apenas os dados permitidos pela sua conta.

Proteger informações pessoais.

Não armazenar dados sensíveis desnecessariamente.

Respeitar LGPD e utilizar somente dados obtidos de fontes legalmente permitidas.

18. ESCALABILIDADE

O sistema deve começar permitindo busca por:

Cidade → Estado → Região → Brasil inteiro.

A arquitetura deve permitir futuramente:

Importação de dados

APIs de mapas

APIs de dados empresariais

Integração com WhatsApp

IA para análise de sites

IA para personalização das mensagens

Geração automática de propostas

Relatórios de vendas

19. DIFERENCIAL

Criar uma experiência onde o usuário consiga fazer o seguinte fluxo:

Escolher uma região.

Escolher um segmento.

Encontrar empresas.

Visualizar todas no mapa.

Identificar quais não possuem site.

Identificar quais possuem site ruim/desatualizado.

Ordenar pelo Score de oportunidade.

Abrir o cadastro.

Ver o responsável e canais de contato disponíveis.

Clicar em WhatsApp.

Selecionar uma mensagem específica para aquele nicho.

Enviar.

Marcar como "contatado".

Criar follow-up.

Acompanhar a negociação.

Transformar a empresa em cliente.

O objetivo é que a plataforma funcione como uma verdadeira máquina de prospecção de clientes para criação de sites, reduzindo ao máximo o trabalho manual.

Criar inicialmente com dados fictícios para demonstrar o funcionamento completo da plataforma, mas deixar a arquitetura preparada para integração com APIs reais posteriormente.

Priorizar UX, velocidade, organização e facilidade de uso.

tenho um site de criacao de mini site, https://github.com/brunoschardosim60-cmd/sweet-connection.git ele esta aqui na lovable, esta hopedado na vercel https://nexa-xi-puce.vercel.app/
faca q um botao q entre direto no site, ja na parte de criacao, com os dados reais do cliente selecionado, todas as info,, cor ja parecida com a logo do cliente, q de para baixar a ft e tudo mais do cliente seleionado

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b5cccaf8-b282-41e0-94e4-b1a98d0b6d48).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
