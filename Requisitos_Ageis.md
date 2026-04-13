# Documento de Requisitos Ágeis - Sistema Avicena

Este documento serve como a base oficial dos requisitos do sistema **Avicena** (Glauco-VisionV2), estruturado por meio de metodologias ágeis (User Stories, Épicos e Critérios de Aceitação). O documento descreve e embasa as fases de prototipação, implementação e testes.

---

## 1. Visão Geral do Produto (Product Vision)
O Sistema Avicena é um software médico assistido por inteligência artificial projetado para que médicos e pacientes possam submeter exames de imagem, gerenciar diagnósticos, registrar evoluções clínicas através de Laudos, e garantir um fluxo assertivo no cruzamento de dados de pacientes e algoritmos preditivos especialistas.

## 2. Épicos
Os épicos são grandes blocos de funcionalidades que entregaram valor ao sistema. Foram mapeados os seguintes épicos para as Sprints da disciplina:

* **Épico 1: Gestão de Identidade e Acessos** (Focado em cadastro de contas médicas e pacientes).
* **Épico 2: Gestão Pessoal e CRM Médico** (Focado no controle e manutenção da lista de pacientes sob tutela de um médico).
* **Épico 3: Diagnósticos e Análises por Inteligência Artificial** (Focado em Upload, leitura e processamento técnico de imagens aliadas aos modelos IA).

---

## 3. Histórias de Usuário (User Stories)

Abaixo estão as histórias de usuário mapeadas, que ditam os requisitos que foram codificados (Mapeando nossos CRUDs e Regras de Negócio).

### Épico 1: Gestão de Identidade e Acessos

#### US01 - Cadastro de Usuários (Back & Front)
> **Como** médico ou paciente recém-recrutado,
> **Eu quero** criar uma conta preenchendo meus dados principais,
> **Para que** eu possa ter acesso privado à plataforma Avicena.
* **Critérios de Aceitação:**
  * O sistema deve armazenar e-mail, senha e tipo de usuário (Paciente ou Médico) de forma criptografada na base de dados (`users`).
  * Não deve permitir e-mails ou CPFs já cadastrados.

#### US02 - Autenticação Segura (Back & Front)
> **Como** médico ou paciente já registrado,
> **Eu quero** inserir minhas credenciais no portal,
> **Para que** eu possa acessar os dashboards de acordo com o meu nível de permissão (Paciente vê seus exames; Médico gerencia sua rotina livremente).
* **Critérios de Aceitação:**
  * O sistema deve autenticar o usuário gerando um esquema de Tokens. Em caso de credencial inválida, avisar ao frontend em tempo real.

---

### Épico 2: Gestão Pessoal e Relacionamento (Primeiro CRUD: Pacientes)

#### US03 - Cadastrar Pacientes
> **Como** médico do sistema Avicena,
> **Eu quero** registrar um novo perfil de paciente com Nome, CPF, Idade e Telefone,
> **Para que** eu possa vinculá-lo posteriormente aos exames processados pelas IAs.
* **Critérios de Aceitação:**
  * Endpoint de Create disponível. Interface no Dashboard Médico via botão "Novo Paciente". 
  * Associação mandatória de relacionalidade (Paciente -> Médico Responsável).

#### US04 - Listar, Editar e Excluir Pacientes (Dashboard)
> **Como** médico gestor do sistema,
> **Eu quero** acessar a tabela geral com todos os meus pacientes, editar pendências estruturais (como alteração em um CPF) e deletar perfis abandonados,
> **Para que** minha carteira de pacientes no software permaneça acurada.
* **Critérios de Aceitação:**
  * A tela *Management Patients* deve puxar listas (Read) da API correspondente com status e loading eficientes.
  * Botões de "Update" e "Delete" devem forçar o comportamento imediato do banco de dados (SQLite), protegendo as exclusões de análises dependentes do cadastro excluído (Relacional em Cascata).

---

### Épico 3: Diagnóstico e IA (Segundo CRUD: Análises)

#### US05 - Upload e Processamento de Laudo IA
> **Como** médico atendente,
> **Eu quero** selecionar um modelo de IA treinado, atrelar a um paciente do meu CRM, e anexar uma fotografia clínica,
> **Para que** eu obtenha instantaneamente os *findings*, acurácia e recomendações sistêmicas para a doença em questão.
* **Critérios de Aceitação:**
  * A tabela `analyses` deve salvar o path da imagem, associar obrigatoriamente a um `patient_id` submetido e conectar à IA escolhida (`model_id`).

#### US06 - Edição da Recomendação Final e Deleção de Análise
> **Como** um médico revisor,
> **Eu quero** acessar uma análise detalhada feita no passado, corrigir ou adicionar informações textuais na Recomendação e, se necessário, excluir toda a análise,
> **Para que** o prontuário final seja fiel ao meu know-how, podendo divergir a IA.
* **Critérios de Aceitação:**
  * Na tela "Analysis Details", se eu for médico, eu devo visualizar a opção interativa de editar campo "Recomendação" (`PUT /analyses`).
  * Na mesma tela devo visualizar a lixeira (`DELETE /analyses`) para matar a análise e o seu dado de imagem submetido no backend. 
  * Se estiver visualizando pelas lentes de um paciente (usando conta como Paciente), esses botões devem estar bloqueados no Front e no Backend.

---

## 4. Requisitos Não Funcionais (Extras)

1. **Desenho Relacional (Banco de Dados)**: O banco deve ter uma normalização adequada por meio da ORM (SQLAlchemy), obrigando o modelo de `Patient` e `Analysis` trabalharem em mão dupla. Toda Análise submetida exige a rastreabilidade via Chaves Estrangeiras (Foreign Key). 
2. **Confiabilidade**: O framework do React usará tipagem fixa com Typescript e Tailwind para as telas, refletindo status em dashboards.
3. **Restrição**: Login e Registro de conta **não** contabilizam para o requerimento de CRUD de negócio da faculdade; Devendo o requisito recair em "Pacientes" e "Análises de IA".
