# Documentação dos Testes Funcionais da API

Testes implementados com Symfony WebTestCase e DAMA Doctrine Test Bundle.  
Cada teste é executado em uma transação revertida automaticamente ao final, garantindo isolamento total.

---

## CadastroController

**Arquivo:** `tests/Controller/CadastroControllerTest.php`

| Teste | Endpoint | Descrição |
|---|---|---|
| `testDeveRegistrarPrestador` | `POST /api/cadastro/prestador` | Registro de prestador com dados válidos retorna 201 e `success: true`. |
| `testRegistroPrestadorRetorna422ComNomeVazio` | `POST /api/cadastro/prestador` | Nome em branco retorna 422. |
| `testRegistroPrestadorRetorna422ComEmailInvalido` | `POST /api/cadastro/prestador` | E-mail inválido retorna 422. |
| `testRegistroPrestadorRetorna422ComSenhaCurta` | `POST /api/cadastro/prestador` | Senha com menos de 6 caracteres retorna 422. |
| `testRegistroPrestadorRetorna422ComEmailJaEmUso` | `POST /api/cadastro/prestador` | E-mail já cadastrado retorna 422. |
| `testDeveRegistrarCliente` | `POST /api/cadastro/cliente` | Registro de cliente com dados válidos retorna 201 e `success: true`. |
| `testRegistroClienteRetorna422ComNomeVazio` | `POST /api/cadastro/cliente` | Nome em branco retorna 422. |

---

## ClienteController

**Arquivo:** `tests/Controller/ClienteControllerTest.php`

| Teste | Endpoint | Descrição |
|---|---|---|
| `testDeveRetornarListaDeServicosDoCliente` | `GET /api/cliente/servicos` | Retorna array de serviços do cliente autenticado. |
| `testServicosRetornaArrayVazioSemServicos` | `GET /api/cliente/servicos` | Retorna array vazio quando o cliente não possui serviços. |
| `testServicosRetornaEstruturaDeCamposCorreta` | `GET /api/cliente/servicos` | Verifica campos `id`, `prestador`, `endereco`, `data`, `status`, `encerradoEm`, `avaliacao`. |
| `testServicosRetornaPrestadorComCamposCorretos` | `GET /api/cliente/servicos` | Sub-objeto `prestador` contém `id`, `nome` e `nomeComercial`. |
| `testServicosNovoTemStatusOrcamento` | `GET /api/cliente/servicos` | Serviço recém-criado retorna `status: Orçamento`. |
| `testServicosConcluidoTemStatusFinalizado` | `GET /api/cliente/servicos` | Serviço concluído retorna `status: Finalizado`. |
| `testServicosCanceladoTemStatusCancelado` | `GET /api/cliente/servicos` | Serviço cancelado retorna `status: Cancelado`. |
| `testServicosNaoRetornaServicosDeOutroCliente` | `GET /api/cliente/servicos` | Outro cliente autenticado não vê serviços alheios. |
| `testServicosRetorna401SemAutenticacao` | `GET /api/cliente/servicos` | Sem token retorna 401. |
| `testServicosRetorna403ParaNaoCliente` | `GET /api/cliente/servicos` | Usuário sem `ROLE_CLIENTE` retorna 403. |
| `testDeveRetornarListaDeEnderecos` | `GET /api/cliente/enderecos` | Retorna array de endereços do cliente autenticado. |
| `testEnderecosRetornaVazioSemEnderecosCadastrados` | `GET /api/cliente/enderecos` | Retorna array vazio sem endereços cadastrados. |
| `testEnderecosRetornaEstruturaDeCamposCorreta` | `GET /api/cliente/enderecos` | Verifica campos `id`, `endereco`, `cep`, `municipio`. |
| `testEnderecosRetornaApenasDoClienteAutenticado` | `GET /api/cliente/enderecos` | Endereços de outros usuários não são retornados. |
| `testEnderecosRetorna401SemAutenticacao` | `GET /api/cliente/enderecos` | Sem token retorna 401. |

---

## PrestadorController (público)

**Arquivo:** `tests/Controller/PrestadorControllerTest.php`

| Teste | Endpoint | Descrição |
|---|---|---|
| `testDeveRetornarPerfilDoPrestador` | `GET /api/prestador/{id}` | Retorna campos `nomeComercial`, `nome`, `premium`, `municipio`, `profissoes`, `servicosConcluidos`. |
| `testPerfilNaoExigeAutenticacao` | `GET /api/prestador/{id}` | Endpoint é público, não exige token. |
| `testPerfilRetornaProfissoesComoArray` | `GET /api/prestador/{id}` | Campo `profissoes` é sempre um array. |
| `testPerfilProfissoesContemIdEDescricao` | `GET /api/prestador/{id}` | Cada item de `profissoes` contém `id` e `descricao`. |
| `testPerfilRetornaPremiumFalsoParaPrestadorInativo` | `GET /api/prestador/{id}` | `premium: false` para prestador com `ativo = false`. |
| `testPerfilRetornaPremiumVerdadeiroParaPrestadorAtivo` | `GET /api/prestador/{id}` | `premium: true` para prestador com `ativo = true`. |
| `testPerfilRetornaServicosConcluidos` | `GET /api/prestador/{id}` | `servicosConcluidos` incrementa ao criar serviço concluído. |
| `testPerfilRetorna404ParaIdInexistente` | `GET /api/prestador/{id}` | UUID inexistente retorna 404. |
| `testDeveRetornarAvaliacoesDoPrestador` | `GET /api/prestador/{id}/avaliacoes` | Retorna array de avaliações do prestador. |
| `testAvaliacoesNaoExigeAutenticacao` | `GET /api/prestador/{id}/avaliacoes` | Endpoint é público, não exige token. |
| `testAvaliacoesRetornaVazioSemAvaliacoes` | `GET /api/prestador/{id}/avaliacoes` | Retorna array vazio sem avaliações. |
| `testAvaliacoesRetornaEstruturaDeCampos` | `GET /api/prestador/{id}/avaliacoes` | Verifica campos `id`, `data`, `nota`, `comentario`, `imagens`, `servico`. |
| `testAvaliacoesRetornaNotaCorreta` | `GET /api/prestador/{id}/avaliacoes` | O valor de `nota` retornado corresponde ao informado. |
| `testAvaliacoesRetornaSubobjetoServico` | `GET /api/prestador/{id}/avaliacoes` | Sub-objeto `servico` contém `data` e `total`. |
| `testAvaliacoesRetorna404ParaIdInexistente` | `GET /api/prestador/{id}/avaliacoes` | UUID inexistente retorna 404. |

---

## ServicoController

**Arquivo:** `tests/Controller/ServicoControllerTest.php`

| Teste | Endpoint | Descrição |
|---|---|---|
| `testDeveRetornarDetalhesDoServico` | `GET /api/servico/{id}` | Retorna `servico`, `agendamentos`, `orcamentos` e `total`. |
| `testGetServicoRetornaSubobjetoServicoCompleto` | `GET /api/servico/{id}` | Sub-objeto `servico` contém campos completos incluindo `cliente`, `enderecoCompleto` e `projeto`. |
| `testGetServicoAcessivelPeloPrestador` | `GET /api/servico/{id}` | Prestador vinculado ao serviço pode acessar. |
| `testGetServicoRetorna403ParaTerceiro` | `GET /api/servico/{id}` | Usuário não participante retorna 403. |
| `testGetServicoRetorna401SemAutenticacao` | `GET /api/servico/{id}` | Sem token retorna 401. |
| `testGetServicoRetorna404ParaIdInexistente` | `GET /api/servico/{id}` | UUID inexistente retorna 404. |
| `testPrestadorDeveFinalizarServicoAtivo` | `POST /api/servico/{id}/finalizar` | Prestador finaliza serviço ativo e recebe `success: true`. |
| `testFinalizarAlteraStatusParaConcluido` | `POST /api/servico/{id}/finalizar` | Status do serviço é alterado para `Concluido` no banco. |
| `testFinalizarRetorna422ParaServicoNaoAtivo` | `POST /api/servico/{id}/finalizar` | Serviço ainda em `Orçamento` retorna 422. |
| `testFinalizarRetorna403ParaCliente` | `POST /api/servico/{id}/finalizar` | Cliente tentando finalizar retorna 403. |
| `testFinalizarRetorna404ParaIdInexistente` | `POST /api/servico/{id}/finalizar` | UUID inexistente retorna 404. |
| `testClienteDeveCancelarServico` | `POST /api/servico/{id}/cancelar` | Cliente cancela serviço e recebe `success: true`. |
| `testPrestadorDeveCancelarServico` | `POST /api/servico/{id}/cancelar` | Prestador cancela serviço e recebe `success: true`. |
| `testCancelarAlteraStatusParaCancelado` | `POST /api/servico/{id}/cancelar` | Status é alterado para cancelado no banco. |
| `testCancelarRetorna422ParaServicoConcluido` | `POST /api/servico/{id}/cancelar` | Serviço já concluído retorna 422. |
| `testCancelarRetorna403ParaTerceiro` | `POST /api/servico/{id}/cancelar` | Usuário não participante retorna 403. |
| `testCancelarRetorna404ParaIdInexistente` | `POST /api/servico/{id}/cancelar` | UUID inexistente retorna 404. |
| `testPrestadorDeveCriarAgendamento` | `POST /api/servico/{id}/agendamento` | Prestador cria proposta de agendamento com data futura válida. |
| `testAgendamentoRetorna422ComDataInvalida` | `POST /api/servico/{id}/agendamento` | Data em formato inválido retorna 422. |
| `testAgendamentoRetorna422SemData` | `POST /api/servico/{id}/agendamento` | Campo `data` ausente retorna 422. |
| `testAgendamentoRetorna403ParaCliente` | `POST /api/servico/{id}/agendamento` | Cliente tentando criar agendamento retorna 403. |
| `testClienteDeveConfirmarAgendamento` | `POST /api/servico/{id}/agendamento/{id}/confirmar` | Cliente confirma proposta de agendamento. |
| `testConfirmarAlteraStatusParaConfirmado` | `POST /api/servico/{id}/agendamento/{id}/confirmar` | Status do agendamento é alterado para `Confirmado` no banco. |
| `testConfirmarRetorna403ParaPrestador` | `POST /api/servico/{id}/agendamento/{id}/confirmar` | Prestador tentando confirmar retorna 403. |
| `testClienteDeveDeclinarAgendamento` | `POST /api/servico/{id}/agendamento/{id}/declinar` | Cliente declina proposta de agendamento. |
| `testDeclinarAlteraStatusParaRecusado` | `POST /api/servico/{id}/agendamento/{id}/declinar` | Status do agendamento é alterado para `Recusado` no banco. |
| `testDeclinarRetorna403ParaPrestador` | `POST /api/servico/{id}/agendamento/{id}/declinar` | Prestador tentando declinar retorna 403. |
| `testPrestadorDeveCriarOrcamento` | `POST /api/servico/{id}/orcamento` | Prestador adiciona lançamento financeiro ao serviço. |
| `testOrcamentoNegativoRepresentaDesconto` | `POST /api/servico/{id}/orcamento` | Valor negativo é processado como desconto e reduz o total do serviço. |
| `testOrcamentoRetorna422SemDescricao` | `POST /api/servico/{id}/orcamento` | Campo `descricao` ausente retorna 422. |
| `testOrcamentoRetorna422SemValor` | `POST /api/servico/{id}/orcamento` | Campo `valor` ausente retorna 422. |
| `testOrcamentoRetorna403ParaCliente` | `POST /api/servico/{id}/orcamento` | Cliente tentando adicionar orçamento retorna 403. |
| `testOrcamentoRetorna404ParaIdInexistente` | `POST /api/servico/{id}/orcamento` | UUID inexistente retorna 404. |

---

## AreaPrestador\DashboardController

**Arquivo:** `tests/Controller/AreaPrestador/DashboardControllerTest.php`

| Teste | Endpoint | Descrição |
|---|---|---|
| `testDeveRetornarDashboardComSucesso` | `GET /api/areaprestador/dashboard` | Retorna campos `filiado`, `premium`, `nome`, `urlPerfil`, `ativos`, `pendentes`, `concluidos`, `cancelados`. |
| `testDashboardRetornaFiliadoNuloSemFiliacao` | `GET /api/areaprestador/dashboard` | `filiado` é `null` para prestador sem vínculo empresarial. |
| `testDashboardRetornaFiliadoComDadosDaEmpresa` | `GET /api/areaprestador/dashboard` | `filiado` retorna `id` e `nome` da empresa quando há vínculo. |
| `testDashboardRetornaPremiumFalsoParaPrestadorComum` | `GET /api/areaprestador/dashboard` | `premium: false` para prestador sem `ROLE_PREMIUM`. |
| `testDashboardRetornaNomeDoNomeProfissional` | `GET /api/areaprestador/dashboard` | Campo `nome` retorna o nome profissional do prestador. |
| `testDashboardRetornaListasVaziasSemServicos` | `GET /api/areaprestador/dashboard` | Todas as listas são arrays quando não há serviços. |
| `testDeveRetornar403SemAutenticacao` | `GET /api/areaprestador/dashboard` | Sem token retorna 401. |
| `testDeveRetornar403ComUsuarioNaoPrestador` | `GET /api/areaprestador/dashboard` | Usuário sem `ROLE_PRESTADOR` retorna 403. |
| `testDeveRetornarListaDeNotificacoes` | `GET /api/areaprestador/notificacoes` | Retorna array de notificações do prestador autenticado. |
| `testNotificacoesRetornaApenasDoReceptorAutenticado` | `GET /api/areaprestador/notificacoes` | Estrutura contém `id`, `remetente`, `conteudo`, `criadoEm`. |
| `testNotificacoesNaoRetornaNotificacoesDeletadas` | `GET /api/areaprestador/notificacoes` | Notificações com `softDelete` não aparecem na listagem. |
| `testDeveAceitarConviteDeFiliacao` | `POST /api/areaprestador/convite/{id}/aceitar` | Aceitar convite retorna `success: true`. |
| `testAceitarConviteConcedePremiumAoPrestador` | `POST /api/areaprestador/convite/{id}/aceitar` | Prestador recebe `ROLE_PREMIUM` e é ativado após aceitar. |
| `testAceitarConviteCriaPortifolioSeInexistente` | `POST /api/areaprestador/convite/{id}/aceitar` | Portfólio é criado automaticamente ao aceitar o convite. |
| `testAceitarConviteFazSoftDeleteNoConvite` | `POST /api/areaprestador/convite/{id}/aceitar` | Convite recebe `deletedAt` após ser aceito. |
| `testDeveDeclinarConviteDeFiliacao` | `POST /api/areaprestador/convite/{id}/declinar` | Declinar convite retorna `success: true`. |
| `testDeclinarConviteFazSoftDeleteNoConvite` | `POST /api/areaprestador/convite/{id}/declinar` | Convite recebe `deletedAt` após ser declinado. |
| `testDeclinarConviteNaoConcedePremium` | `POST /api/areaprestador/convite/{id}/declinar` | Declinar convite não concede `ROLE_PREMIUM` ao prestador. |
| `testDeveAssinarPlanoPremium` | `POST /api/areaprestador/assinar` | Retorna `success: true` e mensagem confirmando ativação do Premium. |
| `testAssinarAtivaPrestadorEConcedePremium` | `POST /api/areaprestador/assinar` | Prestador é ativado e recebe `ROLE_PREMIUM` no banco. |
| `testAssinarCriaPortifolioSeInexistente` | `POST /api/areaprestador/assinar` | Portfólio é criado automaticamente ao assinar o plano. |

---

## Prestador\PerfilController

**Arquivo:** `tests/Controller/Prestador/PerfilControllerTest.php`

| Teste | Endpoint | Descrição |
|---|---|---|
| `testDeveRetornarDadosDoPerfilDoAutenticado` | `GET /api/prestador/perfil/editar` | Retorna campos `urlPerfil`, `nome`, `nomeProfissional`, `email`, `profissoes`, `cep`, `numero`. |
| `testPerfilRetornaEmailCorreto` | `GET /api/prestador/perfil/editar` | `email` retornado corresponde ao do prestador autenticado. |
| `testPerfilRetornaProfissoesComoArray` | `GET /api/prestador/perfil/editar` | Campo `profissoes` é sempre um array. |
| `testPerfilRetornaCepComoPrestadorCadastrado` | `GET /api/prestador/perfil/editar` | Campo `cep` retorna o CEP cadastrado do prestador. |
| `testPerfilRetorna401SemAutenticacao` | `GET /api/prestador/perfil/editar` | Sem token retorna 401. |
| `testPerfilRetorna403ParaNaoPrestador` | `GET /api/prestador/perfil/editar` | Usuário sem `ROLE_PRESTADOR` retorna 403. |
| `testDeveAtualizarPerfilComSucesso` | `POST /api/prestador/perfil/editar` | Atualização com dados válidos retorna 200 com `message`. |
| `testAtualizarPerfilPersisteDadosNoBanco` | `POST /api/prestador/perfil/editar` | `nomeProfissional` é persistido na entidade `Prestador`. |
| `testAtualizarPerfilAtualizaNomeDoUsuario` | `POST /api/prestador/perfil/editar` | `nome` é persistido na entidade `Usuario`. |
| `testAtualizarPerfilSubstituiProfissoes` | `POST /api/prestador/perfil/editar` | Profissões do prestador são substituídas pelas informadas. |
| `testAtualizarPerfilRetorna422ComNomeVazio` | `POST /api/prestador/perfil/editar` | `nome` em branco retorna 422. |
| `testAtualizarPerfilRetorna422ComCepVazio` | `POST /api/prestador/perfil/editar` | `cep` em branco retorna 422. |
| `testAtualizarPerfilRetorna422ComProfissoesVazias` | `POST /api/prestador/perfil/editar` | `profissoes: []` retorna 422. |
| `testAtualizarPerfilRetorna401SemAutenticacao` | `POST /api/prestador/perfil/editar` | Sem token retorna 401. |
| `testAtualizarPerfilRetorna403ParaNaoPrestador` | `POST /api/prestador/perfil/editar` | Usuário sem `ROLE_PRESTADOR` retorna 403. |
| `testFotoSemArquivoRetorna400` | `POST /api/prestador/perfil/foto` | Requisição sem arquivo no campo `perfil` retorna 400. |
| `testFotoRetorna401SemAutenticacao` | `POST /api/prestador/perfil/foto` | Sem token retorna 401. |

---

## Prestador\PortifolioController e Servico\GerarProjetoController

**Arquivo:** `tests/Controller/Prestador/PortifolioControllerTest.php`

| Teste | Endpoint | Descrição |
|---|---|---|
| `testDeveVisualizarPortifolioPublicamente` | `GET /api/prestador/{id}/portifolio` | Retorna `id`, `biografia`, `servicosConcluidos` e `projetos`. |
| `testPortifolioPublicoNaoExigeAutenticacao` | `GET /api/prestador/{id}/portifolio` | Endpoint é público, não exige token. |
| `testPortifolioRetornaProjetosComoArray` | `GET /api/prestador/{id}/portifolio` | Campo `projetos` é sempre um array. |
| `testPortifolioComProjetoRetornaEstruturaDoProjeto` | `GET /api/prestador/{id}/portifolio` | Cada projeto contém `id`, `titulo`, `descricao`, `regiao`, `valor`, `exibirValor`, `concluidoEm`, `exibirConcluidoEm`, `posicao`, `fotos`. |
| `testPortifolioSemPortifolioRetorna404` | `GET /api/prestador/{id}/portifolio` | Prestador sem portfólio configurado retorna 404. |
| `testPortifolioPrestadorInexistenteRetorna404` | `GET /api/prestador/{id}/portifolio` | UUID inexistente retorna 404. |
| `testDeveObterResumoDoServicoConcluido` | `GET /api/servico/{id}/projeto` | Retorna `servico`, `total` e `conclusao` de um serviço concluído. |
| `testResumoRetorna403ParaPrestadorDiferente` | `GET /api/servico/{id}/projeto` | Prestador diferente do dono do serviço retorna 403. |
| `testResumoRetorna401SemAutenticacao` | `GET /api/servico/{id}/projeto` | Sem token retorna 401. |
| `testResumoRetorna403SemRolePremium` | `GET /api/servico/{id}/projeto` | Prestador sem `ROLE_PREMIUM` retorna 403. |
| `testDeveCriarProjetoAPartirDeServicoConcluido` | `POST /api/servico/{id}/projeto` | Cria projeto no portfólio a partir de serviço concluído, retorna 201 com `success: true` e `id`. |
| `testCriarProjetoPersisteProjeto` | `POST /api/servico/{id}/projeto` | Entidade `Projeto` é persistida e associada ao portfólio no banco. |
| `testCriarProjetoRetorna422ParaServicoNaoConcluido` | `POST /api/servico/{id}/projeto` | Serviço não concluído retorna 422. |
| `testCriarProjetoRetorna422ParaServicoJaComProjeto` | `POST /api/servico/{id}/projeto` | Serviço que já gerou projeto retorna 422. |
| `testCriarProjetoRetorna422ComTituloVazio` | `POST /api/servico/{id}/projeto` | `titulo` em branco retorna 422. |
| `testCriarProjetoRetorna403ParaPrestadorDiferente` | `POST /api/servico/{id}/projeto` | Prestador diferente do dono do serviço retorna 403. |
| `testCriarProjetoRetorna403SemRolePremium` | `POST /api/servico/{id}/projeto` | Prestador sem `ROLE_PREMIUM` retorna 403. |

---

## Portifolio\GerirProjetosController

**Arquivo:** `tests/Controller/Portifolio/GerirProjetosControllerTest.php`

| Teste | Endpoint | Descrição |
|---|---|---|
| `testDeveRetornarPortifolioDoAutenticado` | `GET /api/portifolio/projeto/meu` | Retorna `projetos`, `biografia`, `servicosConcluidos` e `id` do portfólio do prestador autenticado. |
| `testPortifolioSemProjetosRetornaArrayVazio` | `GET /api/portifolio/projeto/meu` | `projetos` é array vazio quando não há projetos. |
| `testPrestadorSemPortifolioRetornaEstruturaVazia` | `GET /api/portifolio/projeto/meu` | Prestador sem portfólio retorna estrutura zerada com `id: null`. |
| `testGetMeuRetorna403SemRolePremium` | `GET /api/portifolio/projeto/meu` | Sem `ROLE_PREMIUM` retorna 403. |
| `testGetMeuRetorna401SemAutenticacao` | `GET /api/portifolio/projeto/meu` | Sem token retorna 401. |
| `testDeveCriarProjetoComSucesso` | `POST /api/portifolio/projeto` | Cria projeto retorna 201 com `success: true`, `id`, `titulo`, `descricao`, `posicao`. |
| `testCriarProjetoRetorna404SemPortifolio` | `POST /api/portifolio/projeto` | Prestador sem portfólio retorna 404. |
| `testCriarProjetoRetorna400SemTitulo` | `POST /api/portifolio/projeto` | `titulo` ausente retorna 400. |
| `testCriarProjetoRetorna400SemDescricao` | `POST /api/portifolio/projeto` | `descricao` ausente retorna 400. |
| `testCriarProjetoSemServicoConcluido` | `POST /api/portifolio/projeto` | Sem serviços concluídos retorna 400. |
| `testCriarProjetoRetorna403SemRolePremium` | `POST /api/portifolio/projeto` | Sem `ROLE_PREMIUM` retorna 403. |
| `testDeveExcluirProjetoProprio` | `DELETE /api/portifolio/projeto/{id}` | Prestador exclui projeto próprio com sucesso. |
| `testExcluirProjetoRemoveEntidadeNoBanco` | `DELETE /api/portifolio/projeto/{id}` | Projeto não é mais encontrado no banco após exclusão. |
| `testExcluirProjetoRetorna403ParaOutroPrestador` | `DELETE /api/portifolio/projeto/{id}` | Outro prestador tentando excluir retorna 403. |
| `testExcluirProjetoRetorna404ParaProjetoInexistente` | `DELETE /api/portifolio/projeto/{id}` | UUID inexistente retorna 404. |
| `testDeveEditarProjetoProprio` | `PUT /api/portifolio/projeto/{id}` | Prestador edita projeto próprio e recebe `success: true`. |
| `testEditarProjetoAtualizaDadosNoBanco` | `PUT /api/portifolio/projeto/{id}` | `titulo` e `exibirValor` são atualizados no banco. |
| `testEditarProjetoRetorna403ParaOutroPrestador` | `PUT /api/portifolio/projeto/{id}` | Outro prestador tentando editar retorna 403. |
| `testUploadSemArquivoRetorna400` | `POST /api/portifolio/projeto/{id}/upload` | Requisição sem imagens retorna 400. |
| `testUploadRetorna403ParaOutroPrestador` | `POST /api/portifolio/projeto/{id}/upload` | Outro prestador tentando fazer upload retorna 403. |
| `testExcluirFotoInexistenteRetorna404` | `DELETE /api/portifolio/projeto/foto/{id}` | UUID de foto inexistente retorna 404. |

---

## Prestador\SolicitarOrcamentoController e UiElementsController

**Arquivo:** `tests/Controller/Prestador/SolicitarOrcamentoControllerTest.php`

| Teste | Endpoint | Descrição |
|---|---|---|
| `testDeveSolicitarOrcamentoComNovoEndereco` | `POST /api/prestadores/{id}/solicitar` | Cliente solicita orçamento informando CEP e dados de endereço. Retorna `success: true` e `idServico`. |
| `testSolicitacaoCriaServicoNoBanco` | `POST /api/prestadores/{id}/solicitar` | Serviço criado é persistido no banco e localizável pelo `idServico` retornado. |
| `testDeveSolicitarOrcamentoComEnderecoExistente` | `POST /api/prestadores/{id}/solicitar` | Cliente solicita reutilizando endereço já cadastrado via `idEndereco`. |
| `testSolicitacaoComEnderecoExistenteReutilizaEndereco` | `POST /api/prestadores/{id}/solicitar` | O serviço criado referencia exatamente o endereço informado. |
| `testSolicitacaoRetorna422SemDescricao` | `POST /api/prestadores/{id}/solicitar` | `descricao` ausente retorna 422. |
| `testSolicitacaoRetorna422ComCepInvalido` | `POST /api/prestadores/{id}/solicitar` | CEP em formato inválido retorna 422. |
| `testSolicitacaoRetorna403ParaNaoCliente` | `POST /api/prestadores/{id}/solicitar` | Usuário sem `ROLE_CLIENTE` retorna 403. |
| `testSolicitacaoRetorna401SemAutenticacao` | `POST /api/prestadores/{id}/solicitar` | Sem token retorna 401. |
| `testSolicitacaoRetorna404ParaPrestadorInexistente` | `POST /api/prestadores/{id}/solicitar` | UUID de prestador inexistente retorna 404. |
| `testDeveRetornarEnderecoPorCep` | `GET /api/ui/endereco?cep=` | Retorna campos `numero` e `municipio` para um CEP válido. |
| `testBuscaCepRetornaEstruturaMunicipio` | `GET /api/ui/endereco?cep=` | Sub-objeto `municipio` contém `nome` e `uf`. |
| `testBuscaCepRetorna400ParaCepInexistente` | `GET /api/ui/endereco?cep=` | CEP inexistente retorna 400 com `errors.cep`. |
| `testBuscaCepRetorna401SemAutenticacao` | `GET /api/ui/endereco?cep=` | Sem token retorna 401. |

---

## Empresarial\PrestadorController

**Arquivo:** `tests/Controller/Empresarial/PrestadorControllerTest.php`

| Teste | Endpoint | Descrição |
|---|---|---|
| `testDeveListarPrestadoresVinculados` | `GET /api/empresarial/prestadores` | Retorna lista de prestadores vinculados à empresa autenticada. |
| `testListarPrestadoresRetornaArrayVazio` | `GET /api/empresarial/prestadores` | Array vazio quando não há prestadores vinculados. |
| `testListarPrestadoresRetornaCamposCorretos` | `GET /api/empresarial/prestadores` | Cada item contém `id` e `nomeComercial`. |
| `testListarPrestadoresRetorna403SemRoleEmpresa` | `GET /api/empresarial/prestadores` | Sem `ROLE_EMPRESA` retorna 403. |
| `testDeveCriarEVincularNovoPrestador` | `POST /api/empresarial/prestadores` | Empresa cria novo prestador e o vincula. |
| `testCriarPrestadorRetorna422ComEmailJaCadastrado` | `POST /api/empresarial/prestadores` | E-mail já existente retorna 422. |
| `testDeveConvidarPrestadorExistente` | `POST /api/empresarial/prestadores/convidar` | Empresa envia convite para prestador existente. |
| `testConvidarPrestadorCriaNotificacao` | `POST /api/empresarial/prestadores/convidar` | Notificação de convite é criada para o prestador. |
| `testConvidarPrestadorRetorna404ParaEmailInexistente` | `POST /api/empresarial/prestadores/convidar` | E-mail não cadastrado retorna 404. |
| `testDeveDesvincularPrestador` | `POST /api/empresarial/prestadores/desvincular` | Empresa desvincula prestador via UUID. |
| `testDesvincularRemoveRelacaoNoBanco` | `POST /api/empresarial/prestadores/desvincular` | Relação `EmpresaPrestador` não existe mais no banco após desvinculação. |
| `testDesvincularRetorna404ParaUuidInexistente` | `POST /api/empresarial/prestadores/desvincular` | UUID não vinculado retorna 404. |
| `testDeveListarConvitesPendentes` | `GET /api/empresarial/prestadores/pendentes` | Retorna lista de convites pendentes enviados pela empresa. |

---

## Chat\ChatController

**Arquivo:** `tests/Controller/Chat/ChatControllerTest.php`

| Teste | Endpoint | Descrição |
|---|---|---|
| `testDeveRetornarDetalhesDasSalas` | `GET /api/chat/{salaId}` | Retorna `sala`, `mensagens` e `participantes` da sala. |
| `testChatRetorna403ParaNaoParticipante` | `GET /api/chat/{salaId}` | Usuário não participante retorna 403. |
| `testChatRetorna401SemAutenticacao` | `GET /api/chat/{salaId}` | Sem token retorna 401. |
| `testDeveEnviarMensagemDeTexto` | `POST /api/chat/{salaId}/mensagem` | Participante envia mensagem de texto para a sala. |
| `testMensagemPersistidaNoBanco` | `POST /api/chat/{salaId}/mensagem` | Conteúdo da mensagem é persistido no banco no campo `conteudo`. |
| `testMensagemRetorna403ParaNaoParticipante` | `POST /api/chat/{salaId}/mensagem` | Não participante tentando enviar mensagem retorna 403. |
| `testDeveEnviarMensagemComResposta` | `POST /api/chat/{salaId}/mensagem` | Mensagem pode referenciar outra via `respondendoA`. |
| `testDeveGerarUrlDeDownload` | `GET /api/chat/{salaId}/download/{mensagemId}` | Retorna URL de download para arquivo anexado à mensagem. |
| `testDownloadRetorna403ParaNaoParticipante` | `GET /api/chat/{salaId}/download/{mensagemId}` | Não participante tentando obter URL retorna 403. |
| `testUploadArquivoRetorna400SemArquivo` | `POST /api/chat/{salaId}/upload` | Requisição sem arquivo retorna 400. |
| `testUploadRetorna403ParaNaoParticipante` | `POST /api/chat/{salaId}/upload` | Não participante tentando fazer upload retorna 403. |

---

## BuscaController

**Arquivo:** `tests/Controller/BuscaControllerTest.php`

| Teste | Endpoint | Descrição |
|---|---|---|
| `testDeveBuscarPrestadoresPorProfissao` | `GET /api/busca` | Retorna prestadores filtrados por profissão. |
| `testBuscaRetornaEstruturaDeCampos` | `GET /api/busca` | Cada item contém `id`, `nome`, `premium`, `municipio`, `profissoes`. |
| `testBuscaRetornaVazioParaProfissaoInexistente` | `GET /api/busca` | Profissão sem prestadores cadastrados retorna array vazio. |
| `testBuscaRetorna401SemAutenticacao` | `GET /api/busca` | Sem token retorna 401. |

---

## Admin Controllers

**Arquivo:** `tests/Controller/Admin/`

| Teste | Endpoint | Descrição |
|---|---|---|
| `testDeveListarProfissoes` | `GET /api/admin/profissoes` | Retorna lista de profissões cadastradas. |
| `testDeveCriarProfissao` | `POST /api/admin/profissoes` | Cria nova profissão e retorna 201. |
| `testCriarProfissaoRetorna422ComNomeVazio` | `POST /api/admin/profissoes` | Nome em branco retorna 422. |
| `testDeveListarEmpresas` | `GET /api/admin/empresas` | Retorna lista de empresas cadastradas. |
| `testDeveCriarEmpresa` | `POST /api/admin/empresas` | Cria nova empresa. |
| `testDeveListarPrestadoresAdmin` | `GET /api/admin/prestadores` | Retorna lista de prestadores. |
| `testDeveAtivarPrestador` | `POST /api/admin/prestadores/{id}/ativar` | Admin ativa um prestador. |
