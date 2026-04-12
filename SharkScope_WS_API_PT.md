# SharkScope Web Service API — Documentação

---

## Histórico de Revisões

**Notas internas CL Team (11 Abr 2026)** — Apêndice “Integração e ids de estatísticas”: lista oficial via `GET /metadata`, **Ability** (Capacidade), diferença Count vs Entries, ranking só `Date:30D`/`90D`. Ver final do documento.

**Versão 1.0.100 (10 Dez 2025)** — Pequenas clarificações.

**Versão 1.0.99 (7 Mar 2025)** — Serviço SharkScope Push removido como opção.

**Versão 1.0.98 (1 Fev 2025)** — Adicionada opção para excluir jogadores que não optaram por participar e jogadores que optaram por sair dos resultados de busca em Grupos de Jogadores.

**Versão 1.0.97 (21 Dez 2024)** — Adicionada Consulta em Linguagem Natural, restrições adicionais de filtro (Posição e HoraDoDia) e novas opções de ordenação para o filtro Limite: Maior, Menor, MaiorROI e MenorROI.

**Versão 1.0.96 (7 Ago 2024)** — Adicionados recursos de notificação de Interrupção de Rastreamento.

**Versão 1.0.95 (4 Abr 2024)** — Adicionado filtro DataFinal e esclarecido que o filtro Data existente agora usa a data de início do torneio.

**Versão 1.0.94 (9 Jan 2024)** — Adicionada capacidade de atribuir e gerenciar Visualizadores Permitidos de dados carregados via PokerCraft.

**Versão 1.0.93 (14 Dez 2023)** — Esclarecida a criação de Grupos de Jogadores e removidas referências legadas ao sinalizador Vs Jogador.

**Versão 1.0.92 (30 Nov 2023)** — **Possível quebra de compatibilidade**: A requisição `/playergroups` está obsoleta e será removida em breve. Foi substituída pela requisição `/playergroups/list`, com melhor desempenho. Esta nova requisição omite detalhes de membros; eles devem ser obtidos individualmente para cada grupo.

**Versão 1.0.91 (6 Nov 2023)** — Reduzido o custo de Torneios Concluídos para requisições de Jogadores nas redes GG, permitindo consultas de até 21 dias.

**Versão 1.0.90 (1 Nov 2023)** — Adicionada opção de privacidade ao recurso PokerCraft.

**Versão 1.0.89 (26 Out 2023)** — Adicionado recurso de Upload Direto de Resultados via PokerCraft.

**Versão 1.0.88 (29 Ago 2023)** — Esclarecidos detalhes sobre os Relatórios Diários Agendados.

**Versão 1.0.87 (14 Ago 2023)** — Atualizados Códigos de Erro e Sinalizadores de Torneio.

**Versão 1.0.86 (5 Jul 2023)** — Habilitado recurso de torneio concluído para conjunto de jogadores com qualquer intervalo de datas.

**Versão 1.0.85 (15 Abr 2023)** — Reduzido custo do recurso completedTournament para conjuntos de jogadores.

**Versão 1.0.84 (23 Ago 2022)** — Adicionado recurso completedTournament para conjunto de jogadores.

**Versão 1.0.83 (9 Mar 2022)** — Corrigido código de exemplo de Ativação de Deal.

**Versão 1.0.82 (13 Jan 2022)** — Adicionada opção de paginação ao recurso de torneio por ID.

**Versão 1.0.81 (16 Dez 2021)** — Adicionado recurso de torneios.

**Versão 1.0.80 (21 Nov 2021)** — Adicionado Histórico de Uso do Usuário.

**Versão 1.0.79 (15 Nov 2021)** — Adicionado Player Insights. Corrigido erro de digitação na URL do recurso MarketShare.

**Versão 1.0.78 (1 Mai 2021)** — Corrigido erro de digitação no tipo de Gráfico.

**Versão 1.0.77 (2 Fev 2021)** — Corrigido erro de digitação no parâmetro Ordering.

**Versão 1.0.76 (24 Dez 2020)** — Adicionados recursos Próximo/Torneio Anterior.

**Versão 1.0.75 (10 Dez 2020)** — Relatórios Diários Agendados agora disponíveis para todos os assinantes Commercial Gold e incluem métrica de capacidade por padrão (na API REST o id é **`Ability`**, não `AvAbility`; confira `PlayerStatisticsDefinitions` em `GET /metadata`).

**Versão 1.0.74 (12 Mai 2020)** — Adicionada opção noPlayers ao recurso de Torneio.

**Versão 1.0.73 (22 Abr 2020)** — Removido recurso de Classificação no Leaderboard de Jogadores (duplica funcionalidade do recurso Perfil do Jogador).

**Versão 1.0.72 (4 Mar 2020)** — Adicionada opção expandMultiEntries ao recurso de Torneio.

**Versão 1.0.71 (21 Fev 2020)** — Adicionada funcionalidade de edição de Leaderboard Privado.

---

# 1. Formato da Requisição

## 1.1. Formato da URL

Todas as chamadas de serviço web baseadas em REST são chamadas HTTPS com o seguinte formato:

```
https://www.sharkscope.com/api/nomedoapp/caminho_do_recurso?parametros
```

- **nomedoapp**: Nome da sua aplicação, atribuído pelo SharkScope mediante solicitação.
- **caminho_do_recurso**: O caminho para um recurso específico.
- **parametros**: Parâmetros da requisição, como usuário/senha e filtro.

## 1.2. Parâmetros de Autenticação

Os parâmetros da URL podem conter informações de autenticação, se necessário. Isso inclui o Nome de Usuário em texto simples e a Senha como uma representação hexadecimal do hash MD5 da senha. Exemplo:

```
?Username=alguem@algumlugar.com&Password=ea3df3c7fa3557d23d2cf889b1a4c90d
```

## 1.3. Cabeçalhos (Headers)

O cabeçalho `Accept` é obrigatório e deve conter o formato de resposta desejado (XML ou JSON).

Todas as chamadas REST que exigem autenticação podem incluir o par usuário/senha como cabeçalhos em vez de parâmetros.

| Cabeçalho  | Descrição                        | Valor/Exemplo                          |
|------------|----------------------------------|----------------------------------------|
| Accept     | Define o formato da resposta     | application/xml ou application/json    |
| Username   | Nome de usuário de autenticação  | alguem@algumlugar.com                  |
| Password   | Senha codificada                 | ea3df3c7fa3557d23d2cf889b1a4c90d       |
| User-Agent | Deve existir e não estar vazio   | Mozilla                                |

## 1.4. Codificação da Senha

Junto com o nome da aplicação, o SharkScope fornecerá uma chave de aplicação — uma chave alfanumérica em minúsculas. Todos os hashes MD5 de senhas devem ser re-codificados usando MD5 uma segunda vez, com a chave de aplicação anexada ao final.

**Exemplo em Java:**

```java
String encodedPassword = "ea3df3c7fa3557d23d2cf889b1a4c90d";
String applicationKey = "21f5e7aa7893caf0";
String key = encodedPassword.toLowerCase() + applicationKey;
byte[] defaultBytes = key.getBytes();
try {
    MessageDigest algorithm = MessageDigest.getInstance("MD5");
    algorithm.reset();
    algorithm.update(defaultBytes);
    byte messageDigest[] = algorithm.digest();
    StringBuffer hexString = new StringBuffer();
    for (int co = 0; co < messageDigest.length; co++) {
        int i = 0xFF & messageDigest[co];
        if (i < 16) hexString.append('0');
        hexString.append(Integer.toHexString(i));
    }
    return hexString.toString().toLowerCase();
} catch (NoSuchAlgorithmException nsae){ ... }
```

**Exemplo em Ruby:**

```ruby
#!/usr/bin/env ruby
require 'digest/MD5'
def encode(encoded_password, application_key)
  key = encoded_password.downcase + application_key
  Digest::MD5.hexdigest(key)
end
encode('ea3df3c7fa3557d23d2cf889b1a4c90d', '21f5e7aa7893caf0')
```

**Exemplo em C++:**

```cpp
#include <openssl/md5.h>
#include <string.h>
#include <stdio.h>
int main(int argc, char* argv[]) {
    char encodedPassword[] = "ea3df3c7fa3557d23d2cf889b1a4c90d";
    char applicationKey[] = "21f5e7aa7893caf0";
    char encodedPasswordKey[49];
    strcpy(encodedPasswordKey, encodedPassword);
    strcat(encodedPasswordKey, applicationKey);
    unsigned char messageDigest[MD5_DIGEST_LENGTH];
    MD5((unsigned char *)encodedPasswordKey, strlen(encodedPasswordKey), messageDigest);
    char encodedMessageDigest[(MD5_DIGEST_LENGTH * 2) + 1];
    for (int i = 0; i < MD5_DIGEST_LENGTH; i++)
        sprintf(encodedMessageDigest + (i * 2), "%02x", messageDigest[i]);
}
```

---

# 2. Formato da Resposta

Chamadas incorretas receberão um dos seguintes códigos de resposta:

- **404 Not Found** (Não Encontrado)
- **405 Method Not Allowed** (Método Não Permitido)

Cada chamada REST corretamente formatada receberá uma resposta do serviço web em formato XML ou JSON.

Se a chamada for malsucedida, a raiz da resposta será `ErrorResponse`; caso contrário, será apropriada à requisição (ex.: todas as chamadas de informação de jogador têm raiz `PlayerResponse`).

As raízes de resposta sempre contêm um atributo `timestamp` com o horário do servidor como representação longa do número de segundos desde a época UNIX (veja https://en.wikipedia.org/wiki/Unix_time).

Todas as respostas também contêm um elemento `UserInfo` com as informações do usuário autenticado. Recursos que não exigem autenticação também retornam um elemento `UserInfo`.

## 2.1. Objetos Básicos de Resposta

### 2.1.1. Response (Resposta)

O elemento raiz de todas as respostas é `Response`, com atributos de sucesso (`success`) e timestamp do servidor. Também contém `metadataHash` (hash mais recente dos metadados) e, opcionalmente, `appVersion`. Exemplo:

```xml
<Response success="true" timestamp="1279612806"
  metadataHash="f23ffdbb97027412c39cdba36e28b363" appVersion="3">
```

A raiz contém um elemento `UserInfo` e, se a chamada for bem-sucedida, o elemento contêiner da resposta. Se malsucedida, contém o elemento `ErrorResponse`.

### 2.1.2. UserInfo

O elemento `UserInfo` contém informações do usuário autenticado. Exemplo:

```xml
<UserInfo loggedIn="true">
  <Username>alguem@algumlugar.com</Username>
  <Regions name="Non US" code="NonUS"/>
  <Regions name="International" code="All"/>
  <RemainingSearches>56</RemainingSearches>
  <ExpirationDate>1523644928</ExpirationDate>
  <RequestLanguages>en-gb,en;q=0.7,el;q=0.3</RequestLanguages>
  <AuthorizedNetworks all="true"/>
</UserInfo>
```

Se o recurso não exigir autenticação, o `UserInfo` conterá apenas as pesquisas gratuitas restantes:

```xml
<UserInfo loggedIn="false">
  <Regions name="Non US" code="NonUS"/>
  <Regions name="International" code="All"/>
  <RemainingSearches>5</RemainingSearches>
  <RequestLanguages>en-gb,en;q=0.7,el;q=0.3</RequestLanguages>
</UserInfo>
```

O elemento `UserInfo` deve ser verificado para confirmar autenticação bem-sucedida (`loggedIn="true"`) e para verificar o número de pesquisas restantes.

### 2.1.3. ErrorResponse

O elemento raiz `ErrorResponse` contém informações de erro e é retornado quando a chamada falha. Exemplo:

```xml
<Response success="false" timestamp="1279613507">
  <ErrorResponse>
    <Error id="101002">Senha inválida.</Error>
  </ErrorResponse>
</Response>
```

O `ErrorResponse` contém um elemento `Error`. O valor é a descrição do erro em inglês e o atributo `id` contém o código do erro, que pode ser usado para localizar a mensagem.

---

# 3. Recursos

A URL raiz de todos os recursos REST é:

```
https://www.sharkscope.com/api/nomedoapp/
```

Para recursos que exigem ou permitem autenticação opcional, o par usuário/senha pode ser fornecido como parâmetros ou cabeçalhos.

## 3.1. Recursos Genéricos

### 3.1.1. Metadados

Solicita informações de metadados ao servidor. Se o parâmetro `hash` for especificado e o valor fornecido corresponder ao hash de metadados mais recente, a resposta é configurada para cache no cliente.

| Campo          | Valor                                                                 |
|----------------|-----------------------------------------------------------------------|
| Tipo           | GET                                                                   |
| Autenticação   | Não                                                                   |
| Custo          | Gratuito                                                              |
| Resposta       | Um objeto MetadataResponse com os metadados.                          |
| Caminho        | Metadata                                                              |
| Parâmetros     | hash                                                                  |
| Exemplo        | https://www.sharkscope.com/api/someapp/metadata?hash=f23ffdbb97027412c39cdba36e28b363 |

## 3.2. Recursos do Cliente SharkScope

Recursos disponíveis para fornecer informações sobre clientes construídos sobre o SharkScope, como HUD e Tournament Opener.

### 3.2.1. DownloadResource

Direciona o usuário a um link de download para a versão mais recente do aplicativo cliente (instalador ou atualizador).

| Campo          | Valor                                                           |
|----------------|-----------------------------------------------------------------|
| Tipo           | GET                                                             |
| Autenticação   | Não                                                             |
| Custo          | Gratuito                                                        |
| Resposta       | Redirecionamento para uma URL.                                  |
| Caminho        | client/[updater \| installer]                                   |
| Parâmetros     | Hash                                                            |
| Exemplo        | https://www.sharkscope.com/api/someapp/client/installer         |

### 3.2.2. Verificação de Versão

Obtém o número de versão mais recente do aplicativo cliente.

| Campo          | Valor                                                           |
|----------------|-----------------------------------------------------------------|
| Tipo           | GET                                                             |
| Autenticação   | Não                                                             |
| Custo          | Gratuito                                                        |
| Resposta       | Um objeto GenericResponse com o número de versão.              |
| Caminho        | client/[updater \| installer]/version                           |
| Parâmetros     | Hash                                                            |
| Exemplo        | https://www.sharkscope.com/api/someapp/client/versioncheck      |

## 3.3. Recursos de Jogador

Os recursos de jogador têm a seguinte URL raiz:

```
https://www.sharkscope.com/api/nomedoapp/networks/{nome_da_rede}/players/{nome_do_jogador}/
```

O nome da rede pode ser um "especificador de rede". Em alguns casos é um nome de rede ou "PlayerGroup" (usado ao solicitar grupos de jogadores). Ao solicitar grupos de jogadores, o nome do jogador é o nome do grupo.

**Especificadores de rede** permitem solicitar múltiplas redes usando `all` (todas) ou `any` (qualquer). Com `all`, todas as redes fornecidas serão usadas. Com `any`, cada rede será pesquisada em ordem até encontrar o jogador.

Exemplos:

```
https://www.sharkscope.com/api/nomedoapp/networks/all:fulltilt,pokerstars/players/al
https://www.sharkscope.com/api/nomedoapp/networks/any:fulltilt,pokerstars/players/al
```

Usando caracteres abreviados (`*` = all, `@` = any):

```
https://www.sharkscope.com/api/nomedoapp/networks/*:fulltilt,pokerstars/players/al
https://www.sharkscope.com/api/nomedoapp/networks/@:fulltilt,pokerstars/players/al
```

Se nenhuma lista de rede for fornecida, todas as redes ativas são assumidas. O nome do jogador deve sempre ser codificado em URL (UTF-8).

Todos os recursos de jogador podem ser filtrados fornecendo o parâmetro `filter` (veja seção de filtros).

### 3.3.1. Resumo (Summary)

Solicita informações resumidas do jogador: informações básicas, estatísticas gratuitas e alguns torneios recentes.

O parâmetro opcional `mode` introduz funcionalidade "versus Usuário" com três opções: `vsuseronblocked`, `normal` e `vsuser`.

Por padrão, se o jogador for um grupo e um membro estiver com opt out, o grupo inteiro é considerado como tal. Para excluir jogadores bloqueados ou não optados dos resultados do grupo, use `groupsExcludeOptedOut=true` e/ou `groupsExcludeNotOptedIn=true`.

| Campo          | Valor                                                                                                     |
|----------------|-----------------------------------------------------------------------------------------------------------|
| Tipo           | GET                                                                                                       |
| Autenticação   | Obrigatória                                                                                               |
| Custo          | 1                                                                                                         |
| Resposta       | Um objeto PlayerResponse parcialmente preenchido.                                                         |
| Caminho        | root «especificador de rede»                                                                              |
| Parâmetros     | Autenticação, filter [Opcional], mode [Opcional], lastUpdateTime [Opcional], groupsExcludeOptedOut [Opcional], groupsExcludeNotOptedIn [Opcional] |
| Exemplo        | https://www.sharkscope.com/api/someapp/networks/fulltilt/players/tom                                      |

### 3.3.2. Torneios Concluídos (Completed Tournaments)

Solicita um número específico de torneios recentes. O número e ordenação são definidos pelo parâmetro `order` (similar ao filtro Limite).

| Campo          | Valor                                                                                            |
|----------------|--------------------------------------------------------------------------------------------------|
| Tipo           | GET                                                                                              |
| Autenticação   | Obrigatória. Apenas assinantes.                                                                  |
| Custo          | 1 pesquisa por 100 torneios retornados.                                                          |
| Resposta       | Um objeto PlayerResponse parcialmente preenchido.                                                |
| Caminho        | completedTournaments «especificador de rede»                                                     |
| Parâmetros     | Autenticação, order [Opcional], Filter [Opcional], lastUpdateTime [Opcional]                     |
| Exemplo        | https://www.sharkscope.com/api/someapp/networks/fulltilt/players/tom/completedTournaments?order=Best,1~50 |

### 3.3.3. Torneios Ativos (Active Tournaments)

Solicita torneios em andamento (em registro e em execução). O número de torneios é definido pelo parâmetro `limit` (opcional). Se não fornecido, todos os torneios atuais são retornados.

> **Nota:** Intervalos de datas relativos podem ser usados com restrições de Data invertidas e não invertidas. Por exemplo, para recuperar torneios que começam nos próximos 10 minutos: `Date:0S;Date!:-600S`

| Campo          | Valor                                                                                                |
|----------------|------------------------------------------------------------------------------------------------------|
| Tipo           | GET                                                                                                  |
| Autenticação   | Obrigatória                                                                                          |
| Custo          | 1                                                                                                    |
| Resposta       | Um objeto PlayerResponse parcialmente preenchido.                                                    |
| Caminho        | activeTournaments «especificador de rede»                                                            |
| Parâmetros     | Autenticação, order [Opcional], Filter [Opcional], groupsExcludeOptedOut [Opcional], groupsExcludeNotOptedIn [Opcional] |
| Exemplo        | https://www.sharkscope.com/api/someapp/networks/fulltilt/players/tom/activeTournaments               |

### 3.3.4. Estatísticas (Statistics)

Solicita todas ou uma seleção de estatísticas, sem torneios recentes.

| Campo          | Valor                                                                                                          |
|----------------|----------------------------------------------------------------------------------------------------------------|
| Tipo           | GET                                                                                                            |
| Autenticação   | Obrigatória. Apenas assinantes.                                                                                |
| Custo          | Depende do tipo de estatísticas solicitadas.                                                                   |
| Resposta       | Um objeto PlayerResponse parcialmente preenchido.                                                              |
| Caminho        | statistics, statistics/[nome_da_estatística],... «especificador de rede»                                       |
| Parâmetros     | Autenticação, Filter [Opcional], lastUpdateTime [Opcional]                                                     |
| Exemplo        | https://www.sharkscope.com/api/someapp/networks/fulltilt/players/tom/statistics/TotalStake,TotalCashes,Streaks |

### 3.3.5. Sugestões (Suggestions)

Solicita uma lista de jogadores cujo nome começa com o prefixo fornecido.

| Campo          | Valor                                                                      |
|----------------|----------------------------------------------------------------------------|
| Tipo           | GET                                                                        |
| Autenticação   | Obrigatória                                                                |
| Custo          | Depende das estatísticas solicitadas.                                      |
| Resposta       | Um objeto SearchSuggestionResponse.                                        |
| Caminho        | suggestions                                                                |
| Parâmetros     | Limit [Opcional, padrão=25]                                                |
| Exemplo        | https://www.sharkscope.com/api/someapp/networks/fulltilt/players/tom/suggestions |

### 3.3.6. Nota do Usuário (User Note)

Obtém ou define a nota do usuário no(s) jogador(es) especificado(s).

| Campo          | Valor                                                                      |
|----------------|----------------------------------------------------------------------------|
| Tipo           | GET/POST/DELETE                                                            |
| Autenticação   | Obrigatória. Apenas assinantes.                                            |
| Custo          | 0                                                                          |
| Resposta       | Um objeto PlayerResponse parcialmente preenchido.                          |
| Caminho        | usernote                                                                   |
| Parâmetros     | notes [FormParam para POST]                                                |
| Exemplo        | https://www.sharkscope.com/api/someapp/networks/fulltilt/players/tom/usernote |

### 3.3.7. OptOut (Sair das Estatísticas)

Solicita a retirada das estatísticas de um jogador. Se o usuário tiver o privilégio `networkadmin`, o parâmetro `email` não é obrigatório e o jogador é retirado imediatamente. Caso contrário, um e-mail de confirmação é enviado. Jogadores em um leaderboard ativo não podem ser retirados sem privilégio de administrador.

| Campo          | Valor                                                                        |
|----------------|------------------------------------------------------------------------------|
| Tipo           | GET                                                                          |
| Autenticação   | Opcional                                                                     |
| Custo          | 0                                                                            |
| Resposta       | Objeto MessagesResponse com mensagem de sucesso ou falha.                    |
| Caminho        | optout                                                                       |
| Parâmetros     | Email [Opcional]                                                             |
| Exemplo        | https://www.sharkscope.com/api/someapp/networks/fulltilt/players/tom/optout  |

### 3.3.8. OptIn (Entrar nas Estatísticas)

Solicita a inclusão das estatísticas de um jogador e remove quaisquer retiradas ou resets existentes.

| Campo          | Valor                                                                        |
|----------------|------------------------------------------------------------------------------|
| Tipo           | GET                                                                          |
| Autenticação   | Obrigatória                                                                  |
| Custo          | 0                                                                            |
| Resposta       | Objeto MessagesResponse com mensagem de sucesso ou falha.                    |
| Caminho        | optin                                                                        |
| Parâmetros     | Email [Opcional]                                                             |
| Exemplo        | https://www.sharkscope.com/api/someapp/networks/fulltilt/players/tom/optin   |

### 3.3.9. Confirmar Alteração de Opt (Confirm Opt Change)

Solicita a confirmação de qualquer alteração de opt in/out, com base no ID enviado por e-mail.

| Campo          | Valor                                                                              |
|----------------|------------------------------------------------------------------------------------|
| Tipo           | GET                                                                                |
| Autenticação   | Não obrigatória                                                                    |
| Custo          | 0                                                                                  |
| Resposta       | Objeto MessagesResponse com mensagem de sucesso ou falha.                          |
| Caminho        | confirmoptchange                                                                   |
| Parâmetros     | id                                                                                 |
| Exemplo        | https://www.sharkscope.com/api/someapp/networks/fulltilt/players/tom/confirmoptchange |

### 3.3.10. Reset

Solicita o reset das estatísticas de um jogador a partir de uma data específica. Dados anteriores a essa data ficam ocultos para todos os usuários. Resets são limitados a um por rede, salvo usuários com privilégio `networkadmin`. Se nenhum `StartDateTime` for fornecido, a data/hora atual é usada.

| Campo          | Valor                                                                        |
|----------------|------------------------------------------------------------------------------|
| Tipo           | GET                                                                          |
| Autenticação   | Obrigatória. Apenas assinantes.                                              |
| Custo          | 0                                                                            |
| Resposta       | Objeto MessagesResponse com mensagem de sucesso ou falha.                    |
| Caminho        | reset                                                                        |
| Parâmetros     | StartDateTime [Opcional]                                                     |
| Exemplo        | https://www.sharkscope.com/api/someapp/networks/fulltilt/players/tom/reset   |

### 3.3.11. Gráfico (Graph)

Recupera uma imagem em formato SVG representando o status atual do jogador no SharkScope (às vezes chamado de Avatar). Os tipos de gráfico disponíveis são:

| Nome                 | Descrição                                                                 | Largura | Altura |
|----------------------|---------------------------------------------------------------------------|---------|--------|
| MiniSummary          | Placa mostrando várias estatísticas do jogador, com ícone animado de leaderboard | 130 | 65 |
| ProfitHistory        | Pequeno gráfico mostrando o histórico de lucro do jogador                | 250     | 250    |
| ProfitHistoryLarge   | Gráfico grande com histórico de lucro e outras estatísticas contextuais  | 600     | 250    |
| ByStake              | Pequeno gráfico de ROI e número de jogos por nível de aposta              | 250     | 250    |
| ByEntrants           | Pequeno gráfico de ROI e histórico de lucro por tamanho dos jogos         | 250     | 250    |
| AvatarText (Obsoleto)| Placa com estatísticas e ícone animado                                   | 130     | 65     |
| AvatarSmall (Obsoleto)| Pequeno gráfico de histórico de lucro                                   | 180     | 180    |
| AvatarLarge (Obsoleto)| Gráfico grande com histórico de lucro e estatísticas                    | 600     | 250    |

O parâmetro `freshness` define o intervalo em segundos para atualização dos dados (padrão: 10800 = 3 horas). Os gráficos são exibidos em USD.

| Campo          | Valor                                                                            |
|----------------|----------------------------------------------------------------------------------|
| Tipo           | GET                                                                              |
| Autenticação   | Obrigatória                                                                      |
| Custo          | 1                                                                                |
| Resposta       | Documento SVG com mime-type application/xhtml+xml                               |
| Caminho        | graph                                                                            |
| Parâmetros     | Autenticação, filter [Opcional], freshness [Opcional], type, width [Opcional], height [Opcional] |
| Exemplo        | https://www.sharkscope.com/api/someapp/networks/fulltilt/players/tom/graph?type=AvatarLarge |

### 3.3.12. Perfil (Profile)

Recupera o objeto do jogador incluindo o timestamp da última atividade.

| Campo          | Valor                                                                        |
|----------------|------------------------------------------------------------------------------|
| Tipo           | GET                                                                          |
| Autenticação   | Obrigatória                                                                  |
| Custo          | 0                                                                            |
| Resposta       | GenericResponse com o timestamp da última atividade.                         |
| Caminho        | lastActivity                                                                 |
| Parâmetros     | Autenticação                                                                 |
| Exemplo        | https://www.sharkscope.com/api/someapp/networks/fulltilt/players/tom/profile |

### 3.3.13. Linha do Tempo (Timeline)

Recupera a linha do tempo do jogador com todos os eventos.

| Campo          | Valor                                                                         |
|----------------|-------------------------------------------------------------------------------|
| Tipo           | GET                                                                           |
| Autenticação   | Obrigatória                                                                   |
| Custo          | 0                                                                             |
| Resposta       | PlayerResponse com a linha do tempo do jogador.                               |
| Caminho        | timeline «especificador de rede»                                              |
| Parâmetros     | Autenticação                                                                  |
| Exemplo        | https://www.sharkscope.com/api/someapp/networks/fulltilt/players/tom/timeline |

### 3.3.14. Evento da Linha do Tempo (Timeline Event)

Recupera um evento específico da linha do tempo de um jogador pelo seu ID.

| Campo          | Valor                                                                              |
|----------------|------------------------------------------------------------------------------------|
| Tipo           | GET                                                                                |
| Autenticação   | Obrigatória                                                                        |
| Custo          | 0                                                                                  |
| Resposta       | PlayerResponse com a linha do tempo do jogador.                                    |
| Caminho        | timeline/{id} «especificador de rede»                                              |
| Parâmetros     | Autenticação                                                                       |
| Exemplo        | https://www.sharkscope.com/api/someapp/networks/fulltilt/players/timeline/ABC1     |

### 3.3.15. Insights

Retorna previsões de desempenho futuro do jogador e recomendações para aumentar a lucratividade. A moeda e o fuso horário podem ser fornecidos opcionalmente.

| Campo          | Valor                                                                         |
|----------------|-------------------------------------------------------------------------------|
| Tipo           | GET                                                                           |
| Autenticação   | Obrigatória. Apenas assinantes.                                               |
| Custo          | 1 (0 se o jogador foi pesquisado no último minuto)                            |
| Resposta       | Um objeto PlayerInsightsResponse.                                             |
| Caminho        | insights                                                                      |
| Parâmetros     | currency [Opcional, padrão=USD], timezoneOffset [Opcional, padrão=7]          |
| Exemplo        | https://www.sharkscope.com/api/someapp/networks/fulltilt/players/tom/insights |

---

## 3.4. Recursos de Manutenção de Grupos de Jogadores

URL raiz dos recursos de grupos de jogadores:

```
https://www.sharkscope.com/api/nomedoapp/playergroups/{nome_do_grupo}
```

Nomes de grupos são únicos entre todos os usuários. Se o nome for "personal", a API trata como o grupo pessoal especial. Todos os recursos de grupo exigem autenticação e assinatura ativa.

### 3.4.1. Listar (List)

Solicita a lista de grupos de jogadores do usuário (apenas informações básicas, sem membros). O grupo pessoal não é incluído.

| Campo          | Valor                                                         |
|----------------|---------------------------------------------------------------|
| Tipo           | GET                                                           |
| Autenticação   | Obrigatória. Apenas assinantes.                               |
| Resposta       | Objeto PlayerGroupResponse parcialmente preenchido.           |
| Caminho        | (raiz)                                                        |
| Parâmetros     | Autenticação                                                  |
| Exemplo        | https://www.sharkscope.com/api/someapp/playergroups/list      |

### 3.4.2. Recuperação (Retrieval)

Solicita informações do grupo de jogadores, incluindo membros, para permitir adição, exclusão e modificação.

| Campo          | Valor                                                                     |
|----------------|---------------------------------------------------------------------------|
| Tipo           | GET                                                                       |
| Autenticação   | Obrigatória. Apenas assinantes.                                           |
| Resposta       | Objeto PlayerGroupResponse parcialmente preenchido.                       |
| Caminho        | (nome do grupo)                                                           |
| Parâmetros     | Autenticação                                                              |
| Exemplo        | https://www.sharkscope.com/api/someapp/playergroups/MeuGrupo              |

### 3.4.3. Modificação (Modification)

Modifica os sinalizadores (público/privado, consolidado/não consolidado) ou o nome do grupo.

| Campo          | Valor                                                                                              |
|----------------|----------------------------------------------------------------------------------------------------|
| Tipo           | GET                                                                                                |
| Autenticação   | Obrigatória. Apenas assinantes.                                                                    |
| Resposta       | Objeto PlayerGroupResponse parcialmente preenchido.                                                |
| Caminho        | Modify                                                                                             |
| Parâmetros     | Autenticação, public [Opcional], consolidated [Opcional], name [Opcional]                          |
| Exemplo        | https://www.sharkscope.com/api/someapp/playergroups/MeuGrupo/modify?public=y&consolidated=n        |

### 3.4.4. Adicionando Jogadores e Criando Grupos

Adiciona um membro ao grupo. Um grupo é criado ao adicionar o primeiro membro. Por padrão, grupos são criados como privados e consolidados.

| Campo          | Valor                                                                                       |
|----------------|---------------------------------------------------------------------------------------------|
| Tipo           | GET                                                                                         |
| Autenticação   | Obrigatória                                                                                 |
| Resposta       | Objeto PlayerGroupResponse parcialmente preenchido.                                         |
| Caminho        | members/\<rede\>/\<nomeDojogador\>                                                          |
| Parâmetros     | Autenticação, blogicon [Opcional], filter [Opcional]                                        |
| Exemplo        | https://www.sharkscope.com/api/someapp/playergroups/MeuGrupo/members/fulltilt/tom           |

### 3.4.5. Modificando Membros

Modifica o sinalizador `blogicon` de um jogador em grupos pessoais.

| Campo          | Valor                                                                                              |
|----------------|----------------------------------------------------------------------------------------------------|
| Tipo           | GET                                                                                                |
| Autenticação   | Obrigatória                                                                                        |
| Resposta       | Objeto PlayerGroupResponse parcialmente preenchido.                                                |
| Caminho        | members/\<rede\>/\<nomeDojogador\>/modify                                                          |
| Parâmetros     | Autenticação, blogicon                                                                             |
| Exemplo        | https://www.sharkscope.com/api/someapp/playergroups/personal/members/fulltilt/tom/modify?blogicon=true |

### 3.4.6. Removendo Membros

Remove um jogador do grupo. Quando o último jogador é removido, o grupo é excluído.

| Campo          | Valor                                                                                       |
|----------------|---------------------------------------------------------------------------------------------|
| Tipo           | DELETE                                                                                      |
| Autenticação   | Obrigatória. Apenas assinantes.                                                             |
| Resposta       | Objeto PlayerResponse parcialmente preenchido.                                              |
| Caminho        | members/\<rede\>/\<nomeDojogador\>                                                          |
| Parâmetros     | Autenticação                                                                                |
| Exemplo        | https://www.sharkscope.com/api/someapp/playergroups/MeuGrupo/members/fulltilt/tom           |

### 3.4.7. Excluindo o Grupo

Exclui o grupo completamente.

| Campo          | Valor                                                               |
|----------------|---------------------------------------------------------------------|
| Tipo           | DELETE                                                              |
| Autenticação   | Obrigatória. Apenas assinantes.                                     |
| Resposta       | Objeto GenericResponse com mensagem de confirmação de exclusão.     |
| Caminho        | (nome do grupo)                                                     |
| Parâmetros     | Autenticação                                                        |
| Exemplo        | https://www.sharkscope.com/api/someapp/playergroups/MeuGrupo        |

---

## 3.5. Recursos de Torneio

URL raiz dos recursos de torneio:

```
https://www.sharkscope.com/api/nomedoapp/networks/{nome(s)_da(s)_rede(s)}/tournaments
```

### 3.5.1. ID de Torneio

Solicita um torneio específico por ID. Se não encontrado, retorna erro.

Por padrão, em torneios com múltiplas entradas, os resultados de cada jogador são combinados. Use `expandMultiEntries=true` para retornar cada entrada como linha separada. Use `noPlayers=true` para retornar o torneio sem os dados dos jogadores.

| Campo          | Valor                                                                                                      |
|----------------|------------------------------------------------------------------------------------------------------------|
| Tipo           | GET                                                                                                        |
| Autenticação   | Obrigatória                                                                                                |
| Custo          | 1 (requisições subsequentes gratuitas por 3 horas)                                                        |
| Resposta       | Um objeto TournamentResponse.                                                                              |
| Caminho        | {ID do Torneio} «especificador de rede»                                                                    |
| Parâmetros     | Autenticação, lastUpdateTime [Opcional], expandMultiEntries [Opcional], noPlayers [Opcional], order [Opcional] |
| Exemplo        | https://www.sharkscope.com/api/someapp/networks/fulltilt/tournaments/123456789                              |

### 3.5.2. Registrando Torneios (Registering Tournaments)

Solicita um número específico de torneios em registro com base em filtro opcional. O número é definido pelo parâmetro `limit`. Se não fornecido, todos os torneios aplicáveis são retornados.

| Campo          | Valor                                                                                   |
|----------------|-----------------------------------------------------------------------------------------|
| Tipo           | GET                                                                                     |
| Autenticação   | Obrigatória                                                                             |
| Custo          | 1 (requisições subsequentes gratuitas por um minuto)                                   |
| Resposta       | Um objeto RegisteringTournamentResponse.                                                |
| Caminho        | (caminho raiz)                                                                          |
| Parâmetros     | Autenticação, limit, Filter [Opcional]                                                  |
| Exemplo        | https://www.sharkscope.com/api/someapp/networks/fulltilt/activeTournaments?limit=50     |

### 3.5.3. Torneios (Tournaments)

Solicita torneios concluídos sem resultados individuais dos jogadores, mas com estatísticas do torneio. Não inclui torneios com mais de 1 mês. O padrão é `Last,1~10`.

| Campo          | Valor                                                                                                |
|----------------|------------------------------------------------------------------------------------------------------|
| Tipo           | GET                                                                                                  |
| Autenticação   | Obrigatória                                                                                          |
| Custo          | 1 por 10 torneios retornados                                                                         |
| Resposta       | Um objeto CompletedTournamentResponse.                                                               |
| Caminho        | tournaments                                                                                          |
| Parâmetros     | Autenticação, Filter [Opcional], Order [Opcional]                                                    |
| Exemplo        | https://www.sharkscope.com/api/someapp/networks/fulltilt/tournaments?filter=Type:OMAHA&Order=Last,1~10 |

### 3.5.4. Torneios Concluídos (Completed Tournaments — POST)

Solicita resultados de torneios para até 2.000 jogadores. Requer assinatura Commercial Gold. Se nenhum filtro de data for fornecido, retorna dados dos últimos 4 dias (21 dias para redes GG). O custo para datas além do padrão é: número de jogadores (máx. 10) × número de dias.

| Campo          | Valor                                                                         |
|----------------|-------------------------------------------------------------------------------|
| Tipo           | POST                                                                          |
| Autenticação   | Obrigatória                                                                   |
| Custo          | 1 por jogador distinto retornado (máx. 10) quando sem filtro de data; ou 1 por jogador (máx. 10) × dias do intervalo |
| Resposta       | Um objeto CompletedTournamentResponse.                                        |
| Caminho        | completedTournaments                                                          |
| Parâmetros     | Autenticação, filter [Opcional], players                                      |
| Exemplo        | https://www.sharkscope.com/api/someapp/networks/fulltilt/completedTournaments |

### 3.5.5. Torneios Simples (Bare Tournaments)

Solicita torneios por IDs, retornando apenas informações básicas sem entradas dos participantes. Custo: 1 pesquisa por 100 torneios (arredondado para cima).

IDs podem ser separados por nova linha, vírgula, ponto e vírgula ou tabulação. Usando o especificador `allpokerstars`, todas as redes PokerStars internacionais são consultadas.

| Campo          | Valor                                                                                                        |
|----------------|--------------------------------------------------------------------------------------------------------------|
| Tipo           | GET, POST                                                                                                    |
| Autenticação   | Obrigatória                                                                                                  |
| Custo          | 1 por 100 torneios                                                                                           |
| Resposta       | Um objeto BareTournamentResponse.                                                                            |
| Caminho        | bareTournaments                                                                                              |
| Parâmetros     | Autenticação, tournamentIDs                                                                                  |
| Exemplo        | https://www.sharkscope.com/api/someapp/networks/fulltilt/bareTournaments?tournamentIDs=376797050,375781297   |

### 3.5.6. Torneios com Contagem de Fichas em Andamento (Running Chips Tournaments)

Solicita a contagem de fichas atual dos jogadores em um torneio específico. A requisição inicial envia o ID do torneio; consultas subsequentes verificam o status. O estado pode ser `SUBMITTED`, `ERROR` ou `COMPLETED`. Cache de 5 minutos. Intervalo de polling recomendado: 10 segundos. Abandone se não receber `COMPLETED` ou `ERROR` em 2 minutos.

Exemplo de resposta:

```xml
<RunningChipsResponse>
  <RunningChipsTournament network="pokerstars" tournamentId="1568330211"
    state="COMPLETED" name="$7.00 NL Hold'em [Turbo]" stake="6.45" rake="0.55">
    <players>
      <player name="simal64" chips="5914"/>
      <player name="Roll_Me_Now" chips="5671"/>
      <player name="gaita763" chips="1915"/>
      <player name="ImSingle6" chips="0" position="4"/>
    </players>
  </RunningChipsTournament>
</RunningChipsResponse>
```

| Campo          | Valor                                                                                     |
|----------------|-------------------------------------------------------------------------------------------|
| Tipo           | GET                                                                                       |
| Autenticação   | Obrigatória                                                                               |
| Custo          | 1 (resposta COMPLETED)                                                                    |
| Resposta       | Um objeto RunningChipsResponse.                                                           |
| Caminho        | chips                                                                                     |
| Parâmetros     | Autenticação                                                                              |
| Exemplo        | https://www.sharkscope.com/api/someapp/networks/pokerstars/tournaments/123456789/chips    |

### 3.5.7. Próximo Torneio (Next Tournament)

Solicita o próximo torneio concluído cronologicamente do mesmo tipo específico que o ID fornecido.

| Campo          | Valor                                                                                     |
|----------------|-------------------------------------------------------------------------------------------|
| Tipo           | GET                                                                                       |
| Autenticação   | Obrigatória                                                                               |
| Custo          | 1                                                                                         |
| Resposta       | Um objeto TournamentResponse.                                                             |
| Caminho        | next                                                                                      |
| Parâmetros     | Autenticação, expandMultiEntries [Opcional], noPlayers [Opcional]                         |
| Exemplo        | https://www.sharkscope.com/api/someapp/networks/fulltilt/tournaments/123456789/next       |

### 3.5.8. Torneio Anterior (Previous Tournament)

Solicita o torneio concluído cronologicamente anterior do mesmo tipo específico que o ID fornecido.

| Campo          | Valor                                                                                         |
|----------------|-----------------------------------------------------------------------------------------------|
| Tipo           | GET                                                                                           |
| Autenticação   | Obrigatória                                                                                   |
| Custo          | 1                                                                                             |
| Resposta       | Um objeto TournamentResponse.                                                                 |
| Caminho        | previous                                                                                      |
| Parâmetros     | Autenticação, expandMultiEntries [Opcional], noPlayers [Opcional]                             |
| Exemplo        | https://www.sharkscope.com/api/someapp/networks/fulltilt/tournaments/123456789/previous       |

---

## 3.6. Torneios Ativos

URL raiz:

```
https://www.sharkscope.com/api/nomedoapp/activeTournaments
```

### 3.6.1. Torneios Ativos dos Jogadores

Solicita os torneios ativos para múltiplos jogadores. Retorna apenas jogadores que estão jogando e não estão bloqueados.

| Campo          | Valor                                                                                                                           |
|----------------|---------------------------------------------------------------------------------------------------------------------------------|
| Tipo           | GET/POST                                                                                                                        |
| Autenticação   | Não obrigatória                                                                                                                 |
| Custo          | 1 por jogador (jogadores consultados nas últimas 3 horas não têm custo)                                                        |
| Resposta       | Um objeto PlayerResponse.                                                                                                       |
| Caminho        | (raiz)                                                                                                                          |
| Parâmetros     | networkX, playerX onde X é o índice contínuo começando em 1                                                                    |
| Exemplo        | https://www.sharkscope.com/api/someapp/activeTournaments?network1=pokerstars&player=algumjogador&network2=cake&player=outrojogador |

---

## 3.7. Recursos de Leaderboard

URL raiz:

```
https://www.sharkscope.com/api/nomedoapp/poker-leaderboards
```

### 3.7.1. Ano

Solicita os leaderboards de um ano específico.

| Campo        | Valor                                                                     |
|--------------|---------------------------------------------------------------------------|
| Tipo         | GET                                                                       |
| Autenticação | Não obrigatória                                                           |
| Custo        | 0                                                                         |
| Resposta     | Um objeto LeaderboardDisplayResponse.                                     |
| Caminho      | \<ano\>                                                                   |
| Exemplo      | https://www.sharkscope.com/api/someapp/poker-leaderboards/2010            |

### 3.7.2. Privado

Solicita os leaderboards privados.

| Campo        | Valor                                                                        |
|--------------|------------------------------------------------------------------------------|
| Tipo         | GET                                                                          |
| Autenticação | Não obrigatória                                                              |
| Custo        | 0                                                                            |
| Resposta     | Um objeto LeaderboardDisplayResponse.                                        |
| Caminho      | Private                                                                      |
| Exemplo      | https://www.sharkscope.com/api/someapp/poker-leaderboards/private            |

### 3.7.3. Categoria

Solicita os leaderboards de uma categoria específica.

| Campo        | Valor                                                                                    |
|--------------|------------------------------------------------------------------------------------------|
| Tipo         | GET                                                                                      |
| Autenticação | Não obrigatória                                                                          |
| Custo        | 0                                                                                        |
| Resposta     | Um objeto LeaderboardDisplayResponse.                                                    |
| Caminho      | \<ano\>/\<categoria\>, private/\<categoria\>                                             |
| Exemplo      | https://www.sharkscope.com/api/someapp/poker-leaderboards/2010/Scheduled                 |

### 3.7.4. Subcategoria

Solicita os leaderboards de uma subcategoria específica.

| Campo        | Valor                                                                                         |
|--------------|-----------------------------------------------------------------------------------------------|
| Tipo         | GET                                                                                           |
| Autenticação | Não obrigatória                                                                               |
| Custo        | 0                                                                                             |
| Resposta     | Um objeto LeaderboardDisplayResponse.                                                         |
| Caminho      | [caminho da categoria]/\<subcategoria\>                                                       |
| Exemplo      | https://www.sharkscope.com/api/someapp/poker-leaderboards/2010/Scheduled/$16-$35             |

### 3.7.5. Tipo de Valor

Solicita o leaderboard para um tipo de valor específico, com entradas dos jogadores.

| Campo        | Valor                                                                                              |
|--------------|----------------------------------------------------------------------------------------------------|
| Tipo         | GET                                                                                                |
| Autenticação | Não obrigatória                                                                                    |
| Custo        | 0                                                                                                  |
| Resposta     | Um objeto LeaderboardDisplayResponse com o leaderboard e jogadores.                               |
| Caminho      | [caminho da subcategoria]/\<tipo-de-valor\>                                                        |
| Exemplo      | https://www.sharkscope.com/api/someapp/poker-leaderboards/2010/Scheduled/$16-$35/total            |

---

## 3.8. Recursos de Rede

URL raiz:

```
https://www.sharkscope.com/api/nomedoapp/networks/{nome(s)_da(s)_rede(s)}
```

### 3.8.1. Cobertura (Coverage)

Solicita a cobertura da(s) rede(s). O nome da rede pode ser "*" para todas as redes.

| Campo        | Valor                                                                        |
|--------------|------------------------------------------------------------------------------|
| Tipo         | GET                                                                          |
| Autenticação | Não obrigatória                                                              |
| Custo        | 0                                                                            |
| Resposta     | Um objeto NetworkCoverageResponse.                                           |
| Caminho      | Coverage                                                                     |
| Exemplo      | https://www.sharkscope.com/api/someapp/networks/pokerstars/coverage          |

---

## 3.9. Recursos de Usuário

URL raiz:

```
https://www.sharkscope.com/api/nomedoapp/user
```

### 3.9.1. Login

Realiza confirmação de login. A resposta contém apenas o elemento `UserInfo` se bem-sucedida.

| Campo        | Valor                                              |
|--------------|----------------------------------------------------|
| Tipo         | GET                                                |
| Autenticação | Obrigatória                                        |
| Custo        | 0                                                  |
| Resposta     | Um objeto Response simples.                        |
| Caminho      | (raiz)                                             |
| Parâmetros   | Autenticação                                       |
| Exemplo      | https://www.sharkscope.com/api/someapp/user        |

### 3.9.2. Preferências (Preferences)

Solicita as preferências do usuário.

| Campo        | Valor                                                        |
|--------------|--------------------------------------------------------------|
| Tipo         | GET                                                          |
| Autenticação | Obrigatória                                                  |
| Custo        | 0                                                            |
| Resposta     | Um objeto UserPreferencesResponse.                           |
| Caminho      | Preferences                                                  |
| Exemplo      | https://www.sharkscope.com/api/someapp/user/preferences      |

### 3.9.3. URL do Blog

Solicita ou modifica a URL do blog do usuário, usada em grupos pessoais.

| Campo        | Valor                                                                                                         |
|--------------|---------------------------------------------------------------------------------------------------------------|
| Tipo         | GET/DELETE                                                                                                    |
| Autenticação | Obrigatória                                                                                                   |
| Resposta     | Um objeto BlogUrlResponse.                                                                                    |
| Caminho      | blogurl                                                                                                       |
| Parâmetros   | Autenticação, value [ao definir]                                                                              |
| Exemplo      | https://www.sharkscope.com/api/someapp/user/blogurl?value=http%3a%2f%2fblogs.sharkscopers.com%2fmyblog       |

### 3.9.4. Metadados do Usuário

Solicita informações de metadados específicas do usuário.

| Campo        | Valor                                                   |
|--------------|---------------------------------------------------------|
| Tipo         | GET                                                     |
| Autenticação | Opcional                                                |
| Custo        | Gratuito                                                |
| Resposta     | Um objeto UserMetadataResponse.                         |
| Caminho      | Metadata                                                |
| Exemplo      | https://www.sharkscope.com/api/someapp/user/metadata    |

### 3.9.5. Atualização de Preferências

Atualiza o valor de uma ou mais preferências do usuário. Se o valor estiver vazio, a preferência é removida.

| Campo        | Valor                                                                                               |
|--------------|-----------------------------------------------------------------------------------------------------|
| Tipo         | GET/POST                                                                                            |
| Autenticação | Obrigatória                                                                                         |
| Custo        | 0                                                                                                   |
| Resposta     | Um objeto UserPreferencesResponse.                                                                  |
| Caminho      | Preferences                                                                                         |
| Parâmetros   | Autenticação, nomes e valores de preferências (como parâmetros de formulário para POST)            |
| Exemplo      | https://www.sharkscope.com/api/someapp/user/preferences/update?Pref1=123.4&Pref2=&Currency=USD     |

### 3.9.6. Pagamentos (Payments)

Solicita os pagamentos do usuário.

| Campo        | Valor                                                    |
|--------------|----------------------------------------------------------|
| Tipo         | GET                                                      |
| Autenticação | Obrigatória                                              |
| Custo        | 0                                                        |
| Resposta     | Um objeto UserPaymentsResponse.                          |
| Caminho      | Payments                                                 |
| Exemplo      | https://www.sharkscope.com/api/someapp/user/payments     |

### 3.9.7. Criação/Registro

Solicita a criação/registro de um novo usuário.

A senha passada como parte da autenticação deve ser codificada apenas uma vez usando MD5 (sem a chave de aplicação descrita na seção 1.4).

| Campo        | Valor                                                              |
|--------------|--------------------------------------------------------------------|
| Tipo         | GET                                                                |
| Autenticação | Obrigatória                                                        |
| Custo        | 0                                                                  |
| Resposta     | Um objeto Response simples.                                        |
| Caminho      | Create                                                             |
| Parâmetros   | Autenticação, affID [Opcional], country [Opcional], emailOption [Opcional] |
| Exemplo      | https://www.sharkscope.com/api/someapp/user/create                 |

### 3.9.8. Lista de Filtros Salvos

Solicita a lista de filtros salvos do usuário.

| Campo        | Valor                                                     |
|--------------|-----------------------------------------------------------|
| Tipo         | GET                                                       |
| Autenticação | Obrigatória                                               |
| Custo        | 0                                                         |
| Resposta     | Um objeto UserFilters Response.                           |
| Caminho      | filters                                                   |
| Exemplo      | https://www.sharkscope.com/api/someapp/user/filters       |

### 3.9.9. Definição de Filtro Salvo por Nome

Solicita a definição de um filtro salvo pelo nome.

| Campo        | Valor                                                                    |
|--------------|--------------------------------------------------------------------------|
| Tipo         | GET                                                                      |
| Autenticação | Obrigatória                                                              |
| Custo        | 0                                                                        |
| Resposta     | Um objeto UserFilters Response.                                          |
| Caminho      | filters/{nomeFiltro}                                                     |
| Exemplo      | https://www.sharkscope.com/api/someapp/user/filters/{nomeFiltro}         |

### 3.9.10. Salvar Filtro

Solicita o salvamento da definição de um filtro com um nome.

| Campo        | Valor                                                                         |
|--------------|-------------------------------------------------------------------------------|
| Tipo         | GET                                                                           |
| Autenticação | Obrigatória                                                                   |
| Custo        | 0                                                                             |
| Resposta     | Um objeto UserFilters Response.                                               |
| Caminho      | filters/{nomeFiltro}/save                                                     |
| Parâmetros   | Autenticação, type, text                                                      |
| Exemplo      | https://www.sharkscope.com/api/someapp/user/filters/{nomeFiltro}/save         |

### 3.9.11. Excluir Filtro Salvo

Solicita a exclusão de uma definição de filtro salvo.

| Campo        | Valor                                                                           |
|--------------|---------------------------------------------------------------------------------|
| Tipo         | GET                                                                             |
| Autenticação | Obrigatória                                                                     |
| Custo        | 0                                                                               |
| Resposta     | Um objeto UserFilters Response.                                                 |
| Caminho      | filters/{nomeFiltro}/delete                                                     |
| Exemplo      | https://www.sharkscope.com/api/someapp/user/filters/{nomeFiltro}/delete         |

### 3.9.12. Alterar Endereço de E-mail

Solicita a alteração do e-mail de um usuário registrado.

| Campo        | Valor                                                    |
|--------------|----------------------------------------------------------|
| Tipo         | GET                                                      |
| Autenticação | Obrigatória                                              |
| Custo        | 0                                                        |
| Resposta     | Um objeto Response simples.                              |
| Caminho      | Change                                                   |
| Parâmetros   | Autenticação, newemail                                   |
| Exemplo      | https://www.sharkscope.com/api/someapp/user/change       |

### 3.9.13. Alterar Senha do Usuário

Solicita a alteração da senha de um usuário registrado.

| Campo        | Valor                                                    |
|--------------|----------------------------------------------------------|
| Tipo         | GET                                                      |
| Autenticação | Obrigatória                                              |
| Custo        | 0                                                        |
| Resposta     | Um objeto Response simples.                              |
| Caminho      | Change                                                   |
| Parâmetros   | Autenticação, newpassword                                |
| Exemplo      | https://www.sharkscope.com/api/someapp/user/change       |

### 3.9.14. Classes de Jogadores Específicas do Usuário

Solicita as classes de jogadores específicas do usuário (combinação das classes padrão não sobrescritas e as definidas pelo usuário).

| Campo        | Valor                                                         |
|--------------|---------------------------------------------------------------|
| Tipo         | GET                                                           |
| Autenticação | Obrigatória                                                   |
| Custo        | 0                                                             |
| Resposta     | Um objeto UserPlayerClassesResponse.                          |
| Caminho      | PlayerClasses                                                 |
| Exemplo      | https://www.sharkscope.com/api/someapp/user/playerclasses     |

### 3.9.15. Classes de Jogadores Definidas pelo Usuário

Solicita as classes de jogadores definidas e salvas anteriormente pelo usuário.

| Campo        | Valor                                                                  |
|--------------|------------------------------------------------------------------------|
| Tipo         | GET                                                                    |
| Autenticação | Obrigatória                                                            |
| Custo        | 0                                                                      |
| Resposta     | Um objeto UserPlayerClassesResponse.                                   |
| Caminho      | PlayerClasses                                                          |
| Exemplo      | https://www.sharkscope.com/api/someapp/user/playerclasses/defined      |

### 3.9.16. Criar/Modificar Classe de Jogador Definida pelo Usuário

Cria ou modifica uma classe de jogador definida pelo usuário. O parâmetro `rules` é uma string de entradas separadas por ponto e vírgula no formato `<ID_estatística>:<mínimo>~<máximo>`.

| Campo        | Valor                                                                                                                          |
|--------------|--------------------------------------------------------------------------------------------------------------------------------|
| Tipo         | GET                                                                                                                            |
| Autenticação | Obrigatória                                                                                                                    |
| Custo        | 0                                                                                                                              |
| Resposta     | Um objeto UserPlayerClassesResponse.                                                                                           |
| Caminho      | PlayerClasses                                                                                                                  |
| Parâmetros   | Autenticação, priority, rules, icon, categories, currency                                                                      |
| Exemplo      | https://www.sharkscope.com/api/someapp/user/playerclasses/defined/Fish?priority=40&rules=Count:50~*;AvProfit:*~0&icon=Fish.gif |

### 3.9.17. Excluir Classe de Jogador Definida pelo Usuário

Exclui uma classe de jogador definida pelo usuário e retorna as classes restantes.

| Campo        | Valor                                                                    |
|--------------|--------------------------------------------------------------------------|
| Tipo         | DELETE                                                                   |
| Autenticação | Obrigatória                                                              |
| Custo        | 0                                                                        |
| Resposta     | Um objeto UserPlayerClassesResponse.                                     |
| Exemplo      | https://www.sharkscope.com/api/someapp/user/playerclasses/defined/Fish   |

### 3.9.18. Informações de Revendedor

Retorna todas as informações do revendedor: pacotes comprados, crédito restante, nível de desconto, lista de pacotes atribuídos a usuários e assinaturas disponíveis.

| Campo        | Valor                                                       |
|--------------|-------------------------------------------------------------|
| Tipo         | GET                                                         |
| Autenticação | Obrigatória                                                 |
| Custo        | 0                                                           |
| Resposta     | Um objeto ResellerInfoResponse.                             |
| Caminho      | reseller                                                    |
| Exemplo      | https://www.sharkscope.com/api/someapp/user/reseller        |

### 3.9.19. Adicionar Pagamento de Revendedor

Adiciona uma assinatura à conta de um usuário, deduzindo o custo da conta do revendedor. Se o e-mail não for encontrado, uma conta é criada automaticamente.

| Campo        | Valor                                                                                              |
|--------------|----------------------------------------------------------------------------------------------------|
| Tipo         | GET                                                                                                |
| Autenticação | Obrigatória                                                                                        |
| Custo        | 0                                                                                                  |
| Resposta     | Um objeto ResellerInfoResponse.                                                                    |
| Caminho      | reseller/payment                                                                                   |
| Parâmetros   | Autenticação, userEmail, roleID                                                                    |
| Exemplo      | https://www.sharkscope.com/api/someapp/user/reseller/payment?userEmail=me%40myemail.com&roleID=341 |

### 3.9.20. Definir Permissão de Aplicação

Define a permissão para um usuário usar um aplicativo específico com data de expiração. A data de expiração deve estar em formato Unix. Se nula, a permissão não expira (perpétua).

| Campo        | Valor                                                                                    |
|--------------|------------------------------------------------------------------------------------------|
| Tipo         | PUT                                                                                      |
| Autenticação | Obrigatória                                                                              |
| Custo        | 0                                                                                        |
| Resposta     | Um objeto GenericResponse.                                                               |
| Caminho      | api/{aplicacao}/users/{usuario}/permission                                               |
| Parâmetros   | Autenticação, expiry (opcional)                                                          |
| Exemplo      | https://www.sharkscope.com/api/someapp/users/alguem@aol.com/permission?expiry=1407542400 |

### 3.9.21. Obter Permissão de Aplicação

Obtém a data de expiração da permissão de um usuário para usar um aplicativo. Retorna "Perpetual" se perpétua ou "No Permission" se sem permissão.

| Campo        | Valor                                                                      |
|--------------|----------------------------------------------------------------------------|
| Tipo         | GET                                                                        |
| Autenticação | Obrigatória                                                                |
| Custo        | 0                                                                          |
| Resposta     | Um objeto GenericResponse.                                                 |
| Exemplo      | https://www.sharkscope.com/api/someapp/users/alguem@aol.com/permission     |

### 3.9.22. Excluir Permissão de Aplicação

Exclui a permissão de um usuário para usar um aplicativo. Retorna "No Permission" em caso de sucesso ou "Unknown" em caso de falha.

| Campo        | Valor                                                                      |
|--------------|----------------------------------------------------------------------------|
| Tipo         | DELETE                                                                     |
| Autenticação | Obrigatória                                                                |
| Custo        | 0                                                                          |
| Resposta     | Um objeto GenericResponse.                                                 |
| Exemplo      | https://www.sharkscope.com/api/someapp/users/alguem@aol.com/permission     |

### 3.9.23. Notas do Usuário para Jogadores (em Massa)

Permite recuperar, definir, atualizar ou excluir notas para jogadores em massa. Para atualização, o corpo deve conter linhas com nome da rede, nome do jogador e o texto da nota. Uma linha contendo apenas "." indica o fim das notas.

| Campo        | Valor                                                    |
|--------------|----------------------------------------------------------|
| Tipo         | GET/POST                                                 |
| Autenticação | Obrigatória                                              |
| Custo        | 0                                                        |
| Resposta     | Um objeto UserNotesResponse.                             |
| Exemplo      | https://www.sharkscope.com/api/someapp/user/notes        |

### 3.9.24. Definir Gerente

Define a conta de gerente para o usuário. Gerentes podem ver e-mail, status de assinatura e redefinir nomes pessoais de jogadores.

| Campo        | Valor                                                                                  |
|--------------|----------------------------------------------------------------------------------------|
| Tipo         | GET                                                                                    |
| Autenticação | Obrigatória                                                                            |
| Custo        | 0                                                                                      |
| Resposta     | Um objeto ManagerResponse.                                                             |
| Parâmetros   | Autenticação, value                                                                    |
| Exemplo      | https://www.sharkscope.com/api/someapp/users/manager?value=gerente@gmail.com           |

### 3.9.25. Excluir Gerente

Remove o gerente atribuído da conta do usuário.

| Campo        | Valor                                                       |
|--------------|-------------------------------------------------------------|
| Tipo         | DELETE                                                      |
| Autenticação | Obrigatória                                                 |
| Custo        | 0                                                           |
| Resposta     | Um objeto ManagerResponse.                                  |
| Exemplo      | https://www.sharkscope.com/api/someapp/users/manager        |

### 3.9.26. Definir Gerente Secundário

Define a conta de gerente secundário para o usuário (apenas para assinantes).

| Campo        | Valor                                                                                        |
|--------------|----------------------------------------------------------------------------------------------|
| Tipo         | GET                                                                                          |
| Autenticação | Obrigatória                                                                                  |
| Custo        | 0                                                                                            |
| Resposta     | Um objeto ManagerResponse.                                                                   |
| Exemplo      | https://www.sharkscope.com/api/someapp/users/secondarymanager?value=gerente@gmail.com        |

### 3.9.27. Excluir Gerente Secundário

Remove o gerente secundário atribuído da conta do usuário.

| Campo        | Valor                                                                   |
|--------------|-------------------------------------------------------------------------|
| Tipo         | DELETE                                                                  |
| Autenticação | Obrigatória                                                             |
| Custo        | 0                                                                       |
| Resposta     | Um objeto ManagerResponse.                                              |
| Exemplo      | https://www.sharkscope.com/api/someapp/users/secondarymanager           |

### 3.9.28. Histórico de Uso

Retorna o histórico de uso de pesquisas do usuário, detalhado por data, rede e ação. Atualizado a cada poucos minutos.

| Campo        | Valor                                                        |
|--------------|--------------------------------------------------------------|
| Tipo         | GET                                                          |
| Autenticação | Obrigatória                                                  |
| Custo        | 1                                                            |
| Resposta     | Um objeto UserUsageHistoryResponse.                          |
| Exemplo      | https://www.sharkscope.com/api/someapp/user/usageHistory     |

---

## 3.10. Recursos de Relatórios

### 3.10.1. Relatório por Região

Gera um relatório de participação de mercado. O tipo pode ser `SNGEntrants` ou `MTTEntrants`. Parâmetros de ano e mês são opcionais.

| Campo        | Valor                                                                                                   |
|--------------|---------------------------------------------------------------------------------------------------------|
| Tipo         | GET                                                                                                     |
| Autenticação | Obrigatória                                                                                             |
| Custo        | 0                                                                                                       |
| Resposta     | Um objeto MarketShareResponse.                                                                          |
| Caminho      | reports/marketshare/regions/{regiao}                                                                    |
| Exemplo      | https://www.sharkscope.com/api/someapp/reports/marketshare/regions/FR?type=MTTEntrants&year=12&month=12 |

### 3.10.2. Relatório por Rede

Similar ao relatório por região, mas para uma rede específica.

| Campo        | Valor                                                                                                         |
|--------------|---------------------------------------------------------------------------------------------------------------|
| Tipo         | GET                                                                                                           |
| Autenticação | Obrigatória                                                                                                   |
| Custo        | 0                                                                                                             |
| Resposta     | Um objeto MarketShareResponse.                                                                                |
| Caminho      | reports/marketshare/networks/{rede}                                                                           |
| Exemplo      | https://www.sharkscope.com/api/someapp/reports/marketshare/networks/pokerstars?type=MTTEntrants&year=12&month=12 |

### 3.10.3. Relatório de Participação de Mercado por Hora (por Região)

Gera um relatório de torneios agendados por hora para uma região específica.

| Campo        | Valor                                                                                                 |
|--------------|-------------------------------------------------------------------------------------------------------|
| Tipo         | GET                                                                                                   |
| Autenticação | Obrigatória                                                                                           |
| Custo        | 0                                                                                                     |
| Resposta     | Um objeto HourlyMarketShareResponse.                                                                  |
| Exemplo      | https://www.sharkscope.com/api/someapp/reports/hourlymarketshare/regions/FR?date=2014-11-31           |

### 3.10.4. Relatório de Participação de Mercado por Hora (por Rede)

Similar ao relatório por hora por região, mas para uma rede específica.

| Campo        | Valor                                                                                                      |
|--------------|------------------------------------------------------------------------------------------------------------|
| Tipo         | GET                                                                                                        |
| Autenticação | Obrigatória                                                                                                |
| Custo        | 0                                                                                                          |
| Resposta     | Um objeto HourlyMarketShareResponse.                                                                       |
| Exemplo      | https://www.sharkscope.com/api/someapp/reports/hourlymarketshare/networks/pokerstars?date=2014-11-31       |

### 3.10.5. Relatório Diário de Torneios Agendados (por Região)

Lista os torneios agendados diários para uma data e região específicas. Os últimos 3 dias estão disponíveis para assinantes Commercial Gold. Exclui torneios abaixo de $5 e satélites com aposta abaixo de $15.

| Campo        | Valor                                                                                                     |
|--------------|-----------------------------------------------------------------------------------------------------------|
| Tipo         | GET                                                                                                       |
| Autenticação | Obrigatória                                                                                               |
| Custo        | 0                                                                                                         |
| Resposta     | Um objeto DailyScheduledTournamentsResponse.                                                              |
| Exemplo      | https://www.sharkscope.com/api/someapp/reports/dailyscheduledtournaments/regions/FR?date=2014-11-31       |

### 3.10.6. Relatório Diário de Torneios Agendados (por Rede)

Similar ao relatório diário por região, mas para uma rede específica.

| Campo        | Valor                                                                                                        |
|--------------|--------------------------------------------------------------------------------------------------------------|
| Tipo         | GET                                                                                                          |
| Autenticação | Obrigatória                                                                                                  |
| Custo        | 0                                                                                                            |
| Resposta     | Um objeto DailyScheduledTournamentsResponse.                                                                 |
| Exemplo      | https://www.sharkscope.com/api/someapp/reports/dailyscheduledtournaments/networks/pokerstars?date=2014-11-31 |

---

## 3.11. Filtro

A maioria dos recursos de jogador pode utilizar um filtro para restringir os torneios incluídos nas estatísticas. O filtro é uma coleção de restrições em vários aspectos dos jogos de poker online.

O valor do parâmetro `filter` é uma representação em string das várias restrições separadas por ponto e vírgula. O tipo e os valores da restrição são separados por dois-pontos. A restrição pode ser invertida (operação NOT) adicionando um ponto de exclamação ("!") após o nome. Exemplo:

```
?filter=Type:O,OHL,T;Type!:SAT;Stake:USD2~*
```

### 3.11.1. Restrição de Data (Date)

Define o intervalo de data/hora dos torneios com base na data de início.

| Nome     | Date                                      |
|----------|-------------------------------------------|
| Tipo     | Data                                      |
| Exemplos | Date:1Y / Date:2007 / Date:1274109174~1274130000 / Date!:1Y |

Valores possíveis: número natural seguido de 'Y', 'M', 'W', 'D', 'H' ou 'S' (ano, mês, semana, dia, hora, segundo); inteiro negativo para deslocamento futuro; ano após 2006; ou intervalo de timestamps Unix.

### 3.11.2. Restrição de Data Final (EndDate)

Define o intervalo de data/hora dos torneios com base na data de término.

| Nome     | EndDate                                                       |
|----------|---------------------------------------------------------------|
| Tipo     | Data                                                          |
| Exemplos | EndDate:1Y / EndDate:2007 / EndDate:1274109174~1274130000     |

### 3.11.3. Restrição de Dia da Semana (DayOfWeek)

Define o(s) dia(s) da semana dos torneios. Valores: Su, Mo, Tu, We, Th, Fr, Sa. Um fuso horário opcional pode ser especificado com o prefixo 'TZ,'.

| Nome     | DayOfWeek                                          |
|----------|----------------------------------------------------|
| Tipo     | Multisseleção                                      |
| Exemplos | DayOfWeek:Su / DayOfWeek:Mo,Tu,Fr / DayOfWeek:TZ,Europe/London,Mo,Tu |

### 3.11.4. Restrição de Duração (Duration)

Define o intervalo de duração dos torneios. Os intervalos podem ser seguidos de "s", "m" ou "h" (segundos, minutos ou horas). Sem sufixo, assume minutos.

| Nome     | Duration                                               |
|----------|--------------------------------------------------------|
| Tipo     | Intervalo                                              |
| Exemplos | Duration:1~10 / Duration:30s~50m / Duration!:1h~*     |

### 3.11.5. Restrição de Participantes (Entrants)

Define o número de participantes como um intervalo. Um asterisco ("*") significa "qualquer".

| Nome     | Entrants                                              |
|----------|-------------------------------------------------------|
| Tipo     | Intervalo                                             |
| Exemplos | Entrants:2~5 / Entrants:5~* / Entrants!:*~4           |

### 3.11.6. Restrição de Tipo (Type)

Define os tipos de torneio a serem incluídos.

| Nome     | Type                                                        |
|----------|-------------------------------------------------------------|
| Tipo     | Seleção múltipla                                            |
| Exemplos | Type:SO,FPP,O,OHL,HORSE,T / Type:FPP,HU,SAT / Type!:SAT   |

Opções disponíveis (seleção dos principais):

| Opção   | Categoria        | Nome                  | Descrição                                                      |
|---------|------------------|-----------------------|----------------------------------------------------------------|
| TR      | Formato          | Tiered (Escalonado)   | Prêmio é ingresso para o próximo nível                         |
| DM      | Sinalizador      | Deal Made             | Um acordo foi feito no torneio                                 |
| B       | EstruturaPrêmio  | Bounty                | Prêmios por eliminar jogadores (também: Knockout, Hitman)     |
| SO      | Formato          | Shootout              | Apenas o vencedor de cada mesa avança                          |
| HU      | Formato          | Heads Up              | 2 jogadores por mesa                                           |
| R       | Formato          | Rebuy                 | O torneio permite recompras ou add-ons                         |
| FPP     | Formato          | FPP                   | Buy-in com pontos de jogador frequente                         |
| SAT     | Formato          | Satélite              | Prêmio é entrada em outro torneio                              |
| ME      | Formato          | Multi Entry           | Jogadores podem se registrar mais de uma vez                   |
| T       | Velocidade       | Turbo                 | Blinds aumentam mais rápido que o normal                       |
| ST      | Velocidade       | Super Turbo           | Blinds aumentam mais rápido que em um Turbo                    |
| D       | Velocidade       | Deep Stack            | Stacks iniciais maiores que o normal                           |
| N       | Velocidade       | Normal                | Blinds aumentam em ritmo normal                                |
| NL      | Estrutura        | No Limit              | Sem limite                                                     |
| PL      | Estrutura        | Pot Limit             | Limite do pote                                                 |
| FL      | Estrutura        | Limit                 | Limite fixo                                                    |
| H       | Jogo             | Hold'em               | Texas Hold'em                                                  |
| O       | Jogo             | Omaha Hi              | Omaha somente alto                                             |
| OHL     | Jogo             | Omaha H/L             | Omaha Alto/Baixo                                               |
| HORSE   | Jogo             | HORSE                 | Jogo misto HORSE                                               |
| 6MX     | TamanhoMesa      | 6 Max                 | 6 jogadores por mesa                                           |

### 3.11.7. Restrição de Aposta (Stake)

Define os intervalos de aposta dos torneios. Formato: `<Código ISO da moeda>min~max[R]`. O sufixo "R" indica uso do buy-in médio incluindo recompras.

| Nome     | Stake                                                  |
|----------|--------------------------------------------------------|
| Tipo     | Intervalos de Dinheiro                                 |
| Exemplos | Stake:USD2~10,GBP*~5R / Stake:USD20                   |

### 3.11.8. Restrição de Rake (Rake)

Define os intervalos de rake dos torneios.

| Nome     | Rake                                                   |
|----------|--------------------------------------------------------|
| Tipo     | Intervalos de Dinheiro                                 |
| Exemplos | Rake:USD2~10,GBP*~5 / Rake:USD20                      |

### 3.11.9. Restrição de Aposta + Rake (Stake Plus Rake)

Define os intervalos de aposta mais rake dos torneios (similar ao Stake com Rake adicionado).

| Nome     | StakePlusRake                                               |
|----------|-------------------------------------------------------------|
| Tipo     | Intervalos de Dinheiro                                      |
| Exemplos | StakePlusRake:USD2~10,GBP*~5R / StakePlusRake:USD20        |

### 3.11.10. Restrição de Garantia (Guarantee)

Define os intervalos de garantia dos torneios.

| Nome     | Guarantee                                                   |
|----------|-------------------------------------------------------------|
| Tipo     | Intervalos de Dinheiro                                      |
| Exemplos | Guarantee:USD10~100,GBP*~500 / Guarantee:USD2000            |

### 3.11.11. Restrição de Overlay

Define os intervalos de overlay dos torneios.

| Nome     | Overlay                                                    |
|----------|------------------------------------------------------------|
| Tipo     | Intervalos de Dinheiro                                     |
| Exemplos | Overlay:USD10~100,GBP*~500 / Overlay:USD2000               |

### 3.11.12. Restrição de Prêmio (Prize)

Define o intervalo de prêmio recebido pelo jogador no torneio.

| Nome     | Prize                                                         |
|----------|---------------------------------------------------------------|
| Tipo     | Intervalos de Dinheiro                                        |
| Exemplos | Prize:USD10~200,GBP5~100 / Prize!:GBP*~100 / Prize:USD1000   |

### 3.11.13. Restrição de Pool de Prêmios (PrizePool)

Define o intervalo do pool de prêmios do torneio.

| Nome     | PrizePool                                                      |
|----------|----------------------------------------------------------------|
| Tipo     | Intervalos de Dinheiro                                         |
| Exemplos | PrizePool:USD10~200,GBP5~150 / PrizePool!:GBP*~500            |

### 3.11.14. Restrição de Classe (Class)

Define as classes de torneio a incluir: SNG (Sit & Go), SCHEDULED (Agendado) e LIVE (Ao Vivo).

| Nome     | Class                                                   |
|----------|---------------------------------------------------------|
| Tipo     | Seleção múltipla                                        |
| Exemplos | Class:SNG / Class:SCHEDULED,LIVE                        |

### 3.11.15. Restrição de Classe de Jogador (Player Class)

Define intervalos de participantes de classes de jogadores específicas em torneios em andamento ou em registro.

| Nome     | Player Class                                                               |
|----------|----------------------------------------------------------------------------|
| Tipo     | \<Classe de Jogador\>, Intervalo                                           |
| Exemplos | PlayerClass:Fish,2~4 / PlayerClass:Fish,3~4;PlayerClass:Shark,0~0          |

### 3.11.16. Restrição de Limite (Limit)

Define um intervalo de resultados baseado em contexto: Best (Melhores), Worst (Piores), First (Primeiros) e Last (Últimos). O intervalo é baseado em 1.

| Nome     | Limit                                                                        |
|----------|------------------------------------------------------------------------------|
| Tipo     | \<Contexto\>, Intervalo                                                      |
| Exemplos | Limit:Best,1~250 / Limit:Worst,251~500 / Limit:Last,1~8                     |

### 3.11.17. Restrição de Filtro Salvo

Reutiliza um filtro salvo pelo nome único. Não pode ser invertido com "!".

| Nome     | Saved              |
|----------|--------------------|
| Tipo     | Especial           |
| Exemplos | Saved:MeuFiltro    |

### 3.11.18. Versus Jogador (VersusPlayer)

Contém uma lista de jogadores; a resposta inclui `PlayerView` dos torneios contra cada jogador da lista.

| Nome     | VersusPlayer                                    |
|----------|-------------------------------------------------|
| Tipo     | Lista de nomes de jogadores                     |
| Exemplos | VersusPlayer:Tom / VersusPlayer:Tom,Tim         |

### 3.11.19. Restrição de Recompras (Rebuys)

Define o número médio de recompras a considerar no cálculo de estatísticas.

| Nome     | Rebuys         |
|----------|----------------|
| Tipo     | Número         |
| Exemplos | Rebuys:2.5     |

### 3.11.20. Restrição de Rakeback

Define o percentual de rakeback a incluir no cálculo de estatísticas.

| Nome     | Rakeback         |
|----------|------------------|
| Tipo     | Porcentagem      |
| Exemplos | Rakeback:25      |

### 3.11.21. Restrição de Nome do Torneio (TournamentName)

Filtra torneios cujo nome contém a string fornecida (ou a exclui, se invertido).

| Nome     | TournamentName                                    |
|----------|---------------------------------------------------|
| Tipo     | Texto                                             |
| Exemplos | TournamentName:Holdem / TournamentName:$5%20Hold  |

### 3.11.22. Restrição de Re-entradas (ReEntries)

Filtra torneios onde o jogador fez o número prescrito de re-entradas.

| Nome     | ReEntries    |
|----------|--------------|
| Tipo     | Inteiro      |
| Exemplos | ReEntries:2  |

### 3.11.23. Restrição de Hora do Dia (HourOfDay)

Filtra torneios com base na hora do dia (0–23) em que começaram. Um fuso horário opcional pode ser especificado com 'TZ,'.

| Nome     | HourOfDay                                              |
|----------|--------------------------------------------------------|
| Tipo     | Intervalo                                              |
| Exemplos | HourOfDay:9 / HourOfDay:TZ,Europe/London,18~23         |

### 3.11.24. Restrição de Posição (Position)

Filtra torneios onde o jogador terminou na posição prescrita. O valor `FT` designa Mesa Final (Final Table).

| Nome     | Position                                          |
|----------|---------------------------------------------------|
| Tipo     | Intervalo                                         |
| Exemplos | Position:2 / Position:1~3 / Position!:FT          |

---

## 3.12. Consulta em Linguagem Natural (Natural Language Query)

Permite descrever um filtro de torneio em linguagem natural. O sistema converte a consulta em uma string de filtro. Funciona com qualquer idioma e suporta exclusivamente pesquisas de jogadores.

Exemplos de consultas:
- "Últimos 50 torneios No Limit Bounty em maio, excluindo Super Turbos"
- "Torneios jogados nos fins de semana"
- "Meus 10 maiores torneios onde cheguei à mesa final sem re-entradas"
- "Mostre torneios Omaha Hi/Lo de 2023 com menos de 1 hora de duração"
- "Encontre torneios mystery bounty com mais de 100 jogadores"
- "Resultados com maior ROI quando não cheguei à mesa final"

| Campo        | Valor                                                                                                                                    |
|--------------|------------------------------------------------------------------------------------------------------------------------------------------|
| Tipo         | GET                                                                                                                                      |
| Autenticação | Obrigatória. Apenas assinantes.                                                                                                          |
| Custo        | 1 pesquisa                                                                                                                               |
| Resposta     | Objeto PlayerResponse parcialmente preenchido.                                                                                           |
| Parâmetros   | Autenticação, nlq, timezone [Opcional], Currency [Opcional]                                                                              |
| Exemplo      | https://www.sharkscope.com/api/someapp/networks/fulltilt/players/tom?nlq=Resultados%20com%20maior%20ROI&timezone=America/Los_Angeles     |

Se a consulta for apenas parcialmente suportada, a `PlayerResponse` pode conter um atributo adicional `nlqUnsupportedMessage` com os detalhes.

---

## 3.13. Recursos de Jogos Ausentes (Missing Games)

Resultados de torneios que existem em uma rede mas não são encontrados pelo SharkScope podem ser reportados como ausentes. Jogos reportados serão buscados e, se encontrados, adicionados ao banco de dados do SharkScope.

### 3.13.1. Jogos Ausentes por IDs de Jogo

Adiciona jogos ausentes usando os IDs de jogo para rede(s) Pokerstars.

| Campo        | Valor                                                                            |
|--------------|----------------------------------------------------------------------------------|
| Tipo         | POST                                                                             |
| Autenticação | Não obrigatória                                                                  |
| Custo        | 0                                                                                |
| Resposta     | Um objeto MissingTournamentsResponse.                                            |
| Caminho      | ReportMissingGames                                                               |
| Parâmetros   | gameids [FormParam para POST]                                                    |
| Exemplo      | https://www.sharkscope.com/api/someapp/networks/pokerstars/reportmissinggames    |

A resposta contém atributos: `total`, `processed`, `existing`, `pending`, `error`. Exemplo:

```xml
<MissingTournamentsResponse total="20" processed="15" existing="5">
  <MissingTournaments gameID="123457820" status="processed" />
  <MissingTournaments gameID="12345782a" status="error" error="ID de jogo inválido" />
</MissingTournamentsResponse>
```

### 3.13.2. Jogos Ausentes por Resumo de Torneio

Adiciona jogos ausentes usando informações do resumo de torneio da rede Pokerstars. O resumo do torneio (em texto simples) deve ser incluído no corpo da requisição, no mesmo formato do e-mail recebido do Pokerstars.

| Campo              | Valor                                                                    |
|--------------------|--------------------------------------------------------------------------|
| Tipo               | POST                                                                     |
| Autenticação       | Não obrigatória                                                          |
| Custo              | 0                                                                        |
| Resposta           | Um objeto MissingTournamentsResponse.                                    |
| Caminho            | ReportMissingGamesBySummary                                              |
| Parâmetro de Dados | Resumo do torneio do Pokerstars em texto simples                         |
| Exemplo            | https://www.sharkscope.com/api/someapp/reportmissinggamesbysummary       |

### 3.13.3. Upload Direto de Resultados via PokerCraft

Faz upload de resultados de sites baseados em PokerCraft (GGNetwork e WSOP CA-ON). O parâmetro `privacy` pode ser "public" (qualquer um pode ver) ou "private" (apenas a conta que enviou).

| Campo        | Valor                                                                                                                |
|--------------|----------------------------------------------------------------------------------------------------------------------|
| Tipo         | GET                                                                                                                  |
| Autenticação | Obrigatória                                                                                                          |
| Custo        | 0                                                                                                                    |
| Resposta     | Um objeto PokerCraftUploadResponse.                                                                                  |
| Caminho      | reportmissinggames/pokerCraftUpload/{nomearquivo}                                                                    |
| Parâmetros   | privacy [Opcional – padrão "public"]                                                                                 |
| Exemplo      | https://www.sharkscope.com/api/someapp/reportmissinggames/pokerCraftUpload/0000018b-6d38-d5ed-0000-0000d8f0260a.zip  |

### 3.13.4. Listar Visualizadores Permitidos do PokerCraft

Lista os e-mails das contas com permissão para visualizar os dados privados carregados na sua conta.

| Campo        | Valor                                                               |
|--------------|---------------------------------------------------------------------|
| Tipo         | GET                                                                 |
| Autenticação | Obrigatória                                                         |
| Custo        | 0                                                                   |
| Resposta     | Um objeto PermittedViewersResponse.                                 |
| Exemplo      | https://www.sharkscope.com/api/someapp/user/permittedViewers        |

### 3.13.5. Adicionar Visualizador Permitido do PokerCraft

Adiciona uma conta com permissão para visualizar dados privados. O e-mail fornecido deve corresponder a uma conta SharkScope existente.

| Campo        | Valor                                                                                     |
|--------------|-------------------------------------------------------------------------------------------|
| Tipo         | PUT                                                                                       |
| Autenticação | Obrigatória                                                                               |
| Custo        | 0                                                                                         |
| Resposta     | Um objeto PermittedViewersResponse.                                                       |
| Exemplo      | https://www.sharkscope.com/api/someapp/user/permittedViewers/exemplo@exemplo.com          |

### 3.13.6. Remover Visualizador Permitido do PokerCraft

Remove uma conta com permissão para visualizar dados privados.

| Campo        | Valor                                                                                     |
|--------------|-------------------------------------------------------------------------------------------|
| Tipo         | DELETE                                                                                    |
| Autenticação | Obrigatória                                                                               |
| Custo        | 0                                                                                         |
| Resposta     | Um objeto PermittedViewersResponse.                                                       |
| Exemplo      | https://www.sharkscope.com/api/someapp/user/permittedViewers/exemplo@exemplo.com          |

---

## 3.14. Recursos de Deal (Acordo)

URL raiz:

```
https://www.sharkscope.com/api/nomedoapp/deals/nome_do_deal
```

### 3.14.1. Ativação

Solicita a ativação de um deal específico. O nome do deal deve refletir um deal existente fornecido pelo SharkScope. Para deals de inscrição, use o nome "signup" ou "*". Requer um ID único e um código de ativação.

O código de ativação é derivado concatenando nome de usuário e ID único, convertendo para minúsculas e aplicando o mesmo método de codificação da senha (seção 1.4).

| Campo        | Valor                                                                                           |
|--------------|-------------------------------------------------------------------------------------------------|
| Tipo         | GET                                                                                             |
| Autenticação | Obrigatória                                                                                     |
| Custo        | 0                                                                                               |
| Resposta     | Um objeto GenericResponse.                                                                      |
| Caminho      | https://www.sharkscope.com/api/nomedoapp/deals/nome_deal/activate                              |
| Parâmetros   | ID [Obrigatório], activationCode [Obrigatório]                                                  |
| Exemplo      | https://www.sharkscope.com/api/someapp/deals/signup/activate?id=1234&activationCode=F3DE434598  |

---

## 3.15. Recursos de Leaderboard Privado

Assinantes Gold podem criar Leaderboards Privados para competições entre amigos. Até 3 leaderboards por conta, com até 100 participantes cada. Leaderboards são atualizados diariamente enquanto a assinatura Gold estiver ativa.

URL raiz:

```
https://www.sharkscope.com/api/nomedoapp/user/private-leaderboards
```

### 3.15.1. Listar

Recupera todos os leaderboards privados criados pelo usuário.

| Campo        | Valor                                                                  |
|--------------|------------------------------------------------------------------------|
| Tipo         | GET                                                                    |
| Autenticação | Obrigatória                                                            |
| Custo        | 0                                                                      |
| Resposta     | Um objeto UserPrivateLeaderboardResponse.                              |
| Exemplo      | https://www.sharkscope.com/api/someapp/user/private-leaderboards       |

### 3.15.2. Criar

Cria um novo leaderboard privado (sem participantes). Nomes de leaderboards devem ser únicos entre todos os usuários.

| Campo        | Valor                                                                                                                                                              |
|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Tipo         | GET                                                                                                                                                                |
| Autenticação | Obrigatória. Apenas assinantes Gold.                                                                                                                               |
| Custo        | 0                                                                                                                                                                  |
| Resposta     | Um objeto UserPrivateLeaderboardResponse.                                                                                                                          |
| Caminho      | create                                                                                                                                                             |
| Parâmetros   | Autenticação, filter, name, rankingstatistic, currency, mingamesfordisplay [Opcional]                                                                              |
| Exemplo      | https://www.sharkscope.com/api/someapp/user/private-leaderboards/create?name=meu%20leaderboard&filter=Entrants:9;Stake:USD15~25&rankingstatistic=Profit&currency=USD |

### 3.15.3. Editar

Edita um leaderboard privado existente.

| Campo        | Valor                                                                                                           |
|--------------|-----------------------------------------------------------------------------------------------------------------|
| Tipo         | GET                                                                                                             |
| Autenticação | Obrigatória. Apenas assinantes Gold.                                                                            |
| Custo        | 0                                                                                                               |
| Resposta     | Um objeto UserPrivateLeaderboardResponse.                                                                       |
| Caminho      | \<ID do Leaderboard Privado\>/edit                                                                              |
| Parâmetros   | Autenticação, filter [Opcional], name [Opcional], rankingstatistic [Opcional], currency [Opcional], mingamesfordisplay [Opcional] |

### 3.15.4. Excluir

Exclui completamente um leaderboard privado do usuário.

| Campo        | Valor                                                                    |
|--------------|--------------------------------------------------------------------------|
| Tipo         | DELETE                                                                   |
| Autenticação | Obrigatória                                                              |
| Custo        | 0                                                                        |
| Resposta     | Um objeto UserPrivateLeaderboardResponse.                                |
| Exemplo      | https://www.sharkscope.com/api/someapp/user/private-leaderboards/76867   |

### 3.15.5. Habilitar

Habilita um leaderboard privado para que apareça em requisições públicas e seja atualizado.

| Campo        | Valor                                                                           |
|--------------|---------------------------------------------------------------------------------|
| Tipo         | GET                                                                             |
| Autenticação | Obrigatória                                                                     |
| Custo        | 0                                                                               |
| Exemplo      | https://www.sharkscope.com/api/someapp/user/private-leaderboards/76867/enable   |

### 3.15.6. Desabilitar

Desabilita um leaderboard privado para que não apareça em requisições públicas ou seja atualizado.

| Campo        | Valor                                                                            |
|--------------|----------------------------------------------------------------------------------|
| Tipo         | GET                                                                              |
| Autenticação | Obrigatória                                                                      |
| Custo        | 0                                                                                |
| Exemplo      | https://www.sharkscope.com/api/someapp/user/private-leaderboards/76867/disable   |

### 3.15.7. Adicionar Participante

Adiciona um participante ao leaderboard privado do usuário.

| Campo        | Valor                                                                                         |
|--------------|-----------------------------------------------------------------------------------------------|
| Tipo         | GET                                                                                           |
| Autenticação | Obrigatória                                                                                   |
| Custo        | 0                                                                                             |
| Exemplo      | https://www.sharkscope.com/api/someapp/user/private-leaderboards/76867/PokerStars/Alkazar99   |

### 3.15.8. Remover Participante

Remove um participante do leaderboard privado do usuário.

| Campo        | Valor                                                                                         |
|--------------|-----------------------------------------------------------------------------------------------|
| Tipo         | DELETE                                                                                        |
| Autenticação | Obrigatória                                                                                   |
| Custo        | 0                                                                                             |
| Exemplo      | https://www.sharkscope.com/api/someapp/user/private-leaderboards/76867/PokerStars/Alkazar99   |

---

## 3.16. Recursos de Estábulo (Stable)

### 3.16.1. Obter Estábulo

Lista todos os usuários e nomes pessoais de jogadores que atribuíram a conta do usuário como gerente.

| Campo        | Valor                                               |
|--------------|-----------------------------------------------------|
| Tipo         | GET                                                 |
| Autenticação | Obrigatória                                         |
| Custo        | 0                                                   |
| Resposta     | Um objeto StableResponse.                           |
| Caminho      | /stable                                             |
| Exemplo      | https://www.sharkscope.com/api/someapp/stable       |

---

## 3.17. Recursos de Interrupção de Rastreamento (Tracking Outage)

### 3.17.1. Obter Interrupções Abertas

Lista todas as interrupções de rastreamento abertas atualmente, com informações sobre o tempo esperado de resolução.

| Campo        | Valor                                                             |
|--------------|-------------------------------------------------------------------|
| Tipo         | GET                                                               |
| Autenticação | Não obrigatória                                                   |
| Custo        | 0                                                                 |
| Resposta     | Um objeto OutageNotificationResponse.                             |
| Caminho      | /system-status/open                                               |
| Exemplo      | https://www.sharkscope.com/api/someapp/system-status/open        |

### 3.17.2. Obter Interrupções Recentes

Lista todas as interrupções de rastreamento abertas e fechadas dos últimos 3 meses.

| Campo        | Valor                                                              |
|--------------|--------------------------------------------------------------------|
| Tipo         | GET                                                                |
| Autenticação | Não obrigatória                                                    |
| Custo        | 0                                                                  |
| Resposta     | Um objeto OutageNotificationResponse.                              |
| Caminho      | /system-status/recent                                              |
| Exemplo      | https://www.sharkscope.com/api/someapp/system-status/recent       |

---

# 4. Objetos de Resposta

Todos os dados estruturais, incluindo respostas da API, são representados em XML.

## 4.1. Metadados

O objeto de resposta de metadados contém: FilterDefinition, Regions, Networks, Currencies, PlayerStatisticsDefinitions, TournamentStatisticsDefinitions e DefaultPlayerClasses.

### 4.1.1. FilterDefinition

Contêiner de objetos ConstraintDefinition.

### 4.1.2. ConstraintDefinition

Descreve uma restrição de filtro. Possui atributos `id` e `type`. Se o tipo for "Multiselect" ou "Selection", contém elementos Option com os valores possíveis. Exemplo:

```xml
<ConstraintDefinition type="Multiselect" id="Type">
  <Option type="Format" name="Tiered" description="..." id="TR" />
  <Option type="Format" name="Bounty" description="..." id="B" />
</ConstraintDefinition>
```

### 4.1.3. Regions (Regiões)

Contêiner de objetos Region.

### 4.1.4. Region (Região)

Representa regiões de redes de poker. Contém atributos: `code`, `name` e `image` (opcional).

### 4.1.5. Networks (Redes)

Contêiner de objetos Network.

### 4.1.6. Network (Rede)

Representa uma rede de poker com os seguintes atributos: `name` (nome legível), `code` (código de duas letras), `region` (região), `closed` (true se fechada). Atributos booleanos de cobertura: `hudCoverage`, `scheduledCoverage`, `sitngoCoverage`, `tournamentSelector`, `tournamentOpener`. Também contém elementos: `FullCoverageStartDate`, `FullCoverageTrackingRate`, `UpdateInterval`, `EarliestGameTrackDate`, `TrackedGamesCount`, `CoverageStage`.

### 4.1.7. Currencies (Moedas)

Contêiner de objetos Currency.

### 4.1.8. Currency (Moeda)

Representa uma moeda suportada. Atributos: `symbol` (símbolo) e `iso` (código ISO). O valor contém a taxa de câmbio. Exemplos:

```xml
<Currency symbol="R$" iso="BRL" />
<Currency symbol="€" iso="EUR" />
```

### 4.1.9. PlayerStatisticsDefinitions

Contêiner de objetos PlayerStatisticDefinition e StatisticalDataSetDefinition.

### 4.1.10. PlayerStatisticDefinition

Define uma estatística de jogador. Atributos: `id` (identificador), `name` (nome legível), `type` (tipo de valor). Exemplos:

```xml
<PlayerStatisticDefinition name="Aposta Média" type="Currency" id="AvStake"/>
<PlayerStatisticDefinition name="ROI Médio" type="Percentage" id="AvROI"/>
```

### 4.1.11. PlayerStatisticalDataSetDefinition

Define um conjunto de dados estatísticos de jogador. Atributos: `id`, `xAxisTitle`, `xAxisType` e, se tridimensional, `zAxisTitle` e `zAxisType`. Contém elementos Series. Exemplo:

```xml
<StatisticalDataSetDefinition xAxisType="Timestamp" xAxisTitle="Data" id="byDate">
  <Series type="Currency" title="Lucro Total ($)" id="totalProfit" />
  <Series type="Currency" title="ROI Médio ($)" id="averageROI" />
  <Series type="Number" title="Partidas Jogadas" id="gamesPlayed" />
</StatisticalDataSetDefinition>
```

### 4.1.12. TournamentStatisticsDefinitions

Similar a PlayerStatisticsDefinitions, mas para torneios.

### 4.1.13–4.1.14. TournamentStatisticDefinition / PlayerStatisticalDataSetDefinition (torneios)

Definem estatísticas e conjuntos de dados de torneios de forma análoga às definições de jogadores.

### 4.1.15. DefaultPlayerClasses

Contêiner das definições padrão de PlayerClass (podem ser sobrescritas pelos usuários).

### 4.1.16. PlayerClass

Representa um conjunto nomeado de regras que identificam um jogador como membro dessa classe. Atributos: `name`, `priority`, `iconUri` e categorias atribuídas.

### 4.1.17. Rule (Regra)

Representa um intervalo de valores para estatísticas específicas do jogador. Todas as regras dentro de uma classe devem ser satisfeitas para o jogador ser considerado membro.

> **Observação:** As classes de jogadores dependem dos filtros de busca aplicados. Por exemplo, um jogador pode ser "Fish" em torneios agendados e "Shark" em Sit & Gos de $10-20.

---

## 4.2. UserMetadata

O objeto de metadados do usuário contém: UserFilters e UserDefinedPlayerClasses.

### 4.2.1. UserFilters

Contêiner de objetos SavedFilter.

### 4.2.2. SavedFilter

Representa um filtro salvo pelo usuário. Atributos: `name` e `type` (Player, Tournament ou All). Exemplo:

```xml
<UserFilters>
  <SavedFilter type="All" name="Apenas SNG">Class:SNG</SavedFilter>
  <SavedFilter type="Player" name="FiltroDeTeste">Entrants:5~10</SavedFilter>
</UserFilters>
```

### 4.2.3. UserDefinedPlayerClasses

Contêiner das definições de PlayerClass definidas pelo usuário.

### 4.2.4–4.2.5. PlayerClass / Rule

Idênticos às descrições na seção 4.1.

---

## 4.3. Player (Jogador)

O objeto de resposta de jogador contém vários objetos PlayerView.

### 4.3.1. PlayerView

Visão dos dados de um jogador, definida pelo filtro e pela rede/nome do jogador. Contém os objetos Filter e Player.

### 4.3.2. Filter

Representa o filtro aplicado à requisição. Contêiner de objetos Constraint.

### 4.3.3. Constraint

Representa restrições individuais do filtro. O atributo `id` mapeia para um ConstraintDefinition. Exemplos:

```xml
<Constraint id="Game">
  <Selection id="O" />
  <Selection id="OHL" />
</Constraint>
<Constraint id="Stake">
  <Minimum>2.00</Minimum>
</Constraint>
```

### 4.3.4. Player

O objeto de jogador contém dados parcialmente preenchidos. Sempre possui atributos `name` e `network`. Opcionalmente contém: `Icon`, `Statistics`, `recentTournaments`, `completedTournaments`, `activeTournaments`.

Para grupos de jogadores consolidados, o elemento se chama `PlayerGroup`. Exemplos:

```xml
<Player network="PokerStars" name="alguem">
  <Icon type="blog" tip="Visite meu Blog" image="images/icons/blog.gif"
    url="http://www.sharkscopers.com/blog/21210" />
  <Statistics .../>
  <RecentTournaments .../>
</Player>
```

### 4.3.5. Statistics (Estatísticas)

Contêiner de objetos Statistic e StatisticalDataSet. Atributos: `optedIn` (Boolean) e `displayCurrency`. Exemplo:

```xml
<Statistics optedIn="true" displayCurrency="USD">
  <Statistic id="Count">2198</Statistic>
  <Statistic id="AvProfit">7.78</Statistic>
  <Statistic id="AvROI">25.43</Statistic>
  <Statistic id="TotalProfit">17091.70</Statistic>
</Statistics>
```

### 4.3.6. Statistic

Representa um único valor estatístico. O atributo `id` se refere ao StatisticDefinition dos metadados.

### 4.3.7. StatisticalDataSet

Representa um conjunto de valores representáveis como gráfico. O atributo `id` se refere ao StatisticalDataSetDefinition. Contém elementos Data com pontos de dados.

### 4.3.8. PlayerSuggestions

Contêiner para sugestões de jogadores, retornado no SearchSuggestionsResponse. Contém objetos Player com apenas nome, rede e ícones.

---

## 4.4. Tournament (Torneio)

O objeto de resposta de torneio contém informações sobre torneios em andamento, em registro ou concluídos.

### 4.4.1. Statistics

Torneios possuem suas próprias estatísticas e conjuntos de dados. Definições incluídas nos metadados em `TournamentStatisticsDefinitions`.

### 4.4.2. TournamentEntry

Contém informações dos participantes como objetos Player (apenas informações básicas: nome de usuário, ícones). Para torneios concluídos, inclui também posição e lucro.

---

## 4.5. Leaderboards

A resposta de metadados contém definições de leaderboard como hierarquia ou leaderboards individuais com jogadores.

**Exemplo de hierarquia:**

```xml
<LeaderboardDisplayResponse>
  <Leaderboards year="2010" subcategory="$101-$300" category="Any Game">
    <LeaderboardDisplay year="2010" valueType="average" subcategory="$101-$300" category="Any Game"/>
    <LeaderboardDisplay year="2010" valueType="total" subcategory="$101-$300" category="Any Game"/>
  </Leaderboards>
</LeaderboardDisplayResponse>
```

**Exemplo de leaderboard com jogadores:**

```xml
<LeaderboardDisplayResponse>
  <LeaderboardDisplay year="2010" valueType="total" subcategory="$101-$300" category="Any Game">
    <Rank value="132708.0" position="1" count="12216">
      <Player network="FullTilt" name="rams85"/>
    </Rank>
    <Rank value="125355.0" position="2" count="5656">
      <Player network="PokerStars" name="la_gâchette"/>
    </Rank>
  </LeaderboardDisplay>
</LeaderboardDisplayResponse>
```

---

# 5. Erros

## 5.1. Descrição

Quando uma requisição falha, uma resposta de erro é retornada no seguinte formato:

```xml
<Response success="false" timestamp="1287868980">
  <UserInfo>...</UserInfo>
  <ErrorResponse>
    <Error id="código_de_erro">Descrição do Erro</Error>
  </ErrorResponse>
</Response>
```

Se o código de erro for 0, o erro é interno e um atributo adicional é fornecido para relatar o erro ao SharkScope.

## 5.2. Códigos de Erro

| ID do Erro | Descrição                                                                                              |
|------------|--------------------------------------------------------------------------------------------------------|
| 0          | Erro interno.                                                                                          |
| 101001     | Usuário não encontrado.                                                                                |
| 101002     | Senha inválida.                                                                                        |
| 101003     | Nenhum nome de usuário ou senha fornecido.                                                             |
| 101004     | Usuário já existe.                                                                                     |
| 101005     | Usuário \<nome_de_usuário\> já registrado.                                                             |
| 101006     | Falha ao criar usuário.                                                                                |
| 101007     | Falha ao alterar o e-mail.                                                                             |
| 101008     | Endereço de e-mail inválido.                                                                           |
| 101009     | Já existe uma conta com este endereço de e-mail.                                                       |
| 101010     | Falha ao alterar a senha.                                                                              |
| 101011     | Cabeçalho User-Agent não especificado.                                                                 |
| 101012     | Informações da requisição inválidas.                                                                   |
| 101013     | Nome de usuário inválido (deve ser um endereço de e-mail válido).                                      |
| 101014     | Número do pedido não encontrado.                                                                       |
| 101015     | Falha no envio do e-mail de senha.                                                                     |
| 101016     | Usuário não pode ser excluído pois possui entradas de pagamento registradas.                           |
| 101017     | Muitos jogadores já redefinidos nesta rede. Resets são apenas para seus próprios nomes de jogador.     |
| 101024     | Conta conectada em outro lugar.                                                                        |
| 101025     | Este usuário não atribuiu você como gerente.                                                           |
| 101026     | Um e-mail de redefinição de senha já foi enviado recentemente. Tente novamente mais tarde.             |
| 102001     | Cota diária de pesquisas gratuitas esgotada.                                                           |
| 102002     | Cota diária de pesquisas esgotada.                                                                     |
| 102003     | Pesquisas pay-as-you-go esgotadas.                                                                     |
| 102004     | Operação permitida apenas para assinantes.                                                             |
| 102005     | Operação permitida apenas para assinantes Gold.                                                        |
| 102006     | Cota de pesquisas restantes muito baixa.                                                               |
| 102007     | Nenhuma pesquisa restante.                                                                             |
| 102008     | Nenhuma pesquisa gratuita restante. Assine agora para continuar!                                       |
| 102009     | Não pronto para a próxima pesquisa.                                                                    |
| 102010     | Operações complexas não permitidas sem assinatura.                                                     |
| 102011     | Operação permitida apenas para assinantes Platinum.                                                    |
| 102013     | Operação permitida apenas para assinantes Commercial Gold.                                             |
| 102014     | Operação permitida apenas para assinantes Commercial.                                                  |
| 103001     | Nome de classe de jogador inválido.                                                                    |
| 103002     | Prioridade de classe de jogador inválida.                                                              |
| 103003     | Regras de classe de jogador inválidas.                                                                 |
| 103004     | Classe de jogador não encontrada.                                                                      |
| 103005     | Atualização de classe de jogador falhou.                                                               |
| 103006     | Moeda de classe de jogador inválida.                                                                   |
| 105001     | Grupo de jogadores não encontrado.                                                                     |
| 105002     | Nome de grupo de jogadores inválido.                                                                   |
| 105003     | Nenhum membro válido especificado para o grupo.                                                        |
| 105004     | Grupo de jogadores já existe.                                                                          |
| 105005     | Jogador não é membro válido para o grupo.                                                              |
| 105006     | Jogador já está no grupo.                                                                              |
| 105007     | O grupo pode ser modificado apenas pelo seu proprietário.                                              |
| 105008     | O número máximo de jogadores para esta rede já foi adicionado ao seu grupo pessoal.                    |
| 105009     | Não é possível adicionar jogadores bloqueados a grupos.                                                |
| 105010     | Grupo pessoal não configurado.                                                                         |
| 105011     | Pelo menos um membro deve ter opt in.                                                                  |
| 105012     | A consulta do grupo de jogadores retorna muitos dados. Use um grupo não consolidado ou filtro mais restritivo. |
| 105013     | Tamanho máximo do grupo de jogadores atingido. Para grupos com mais de 25 jogadores, use assinatura Commercial. |
| 106001     | Número máximo de leaderboards privados já existe.                                                      |
| 106002     | Leaderboard privado contém número máximo de participantes.                                             |
| 106003     | Já existe um leaderboard privado com esse nome.                                                        |
| 106004     | Este jogador está bloqueado para entrar em leaderboards.                                               |
| 106005     | Esta operação só pode ser executada em leaderboards privados.                                          |
| 106006     | Este jogador já está em pelo menos um leaderboard.                                                     |
| 106007     | Este jogador foi verificado recentemente. Tente novamente mais tarde.                                  |
| 106008     | A data de término do leaderboard está muito no futuro.                                                 |
| 107001     | Código de bônus desconhecido.                                                                          |
| 107002     | Código de bônus expirado.                                                                              |
| 107003     | Código de bônus esgotado.                                                                              |
| 107004     | Código de bônus não aplicável.                                                                         |
| 107005     | Código de bônus ainda não iniciado.                                                                    |
| 107006     | Código de bônus apenas para novos usuários.                                                            |
| 200001     | Falha de autenticação.                                                                                 |
| 200002     | Nenhuma estatística válida solicitada.                                                                 |
| 200003     | Rede não encontrada.                                                                                   |
| 200004     | Jogador não encontrado ou com opt out.                                                                 |
| 200005     | Prefixo de nome de jogador inválido.                                                                   |
| 200006     | Moeda nativa inválida.                                                                                 |
| 200007     | Moeda de exibição inválida.                                                                            |
| 200008     | Limite de torneio inválido.                                                                            |
| 200009     | Modo inválido.                                                                                         |
| 200010     | Leaderboard não encontrado.                                                                            |
| 200011     | Leaderboards não encontrados.                                                                          |
| 200012     | Torneio não encontrado.                                                                                |
| 200013     | Requisição não permitida em todas as redes.                                                            |
| 200014     | Não há instalador/atualizador para este aplicativo.                                                    |
| 200015     | Aplicativo não encontrado.                                                                             |
| 200016     | Tipos de download válidos são "installer" e "updater".                                                 |
| 200017     | Moeda inválida.                                                                                        |
| 200018     | Requisição não permitida para múltiplos usuários.                                                      |
| 200019     | Jogador com opt out.                                                                                   |
| 200020     | URL inválida.                                                                                          |
| 200021     | Você deve inserir um número válido para este parâmetro.                                                |
| 200035     | Relatório não encontrado.                                                                              |
| 200036     | Tipo de relatório desconhecido.                                                                        |
| 200037     | Rede tem seu próprio procedimento de Opt/Out.                                                          |
| 200038     | Data de reset deve estar no passado.                                                                   |
| 200039     | Grupo de jogadores não encontrado.                                                                     |
| 200040     | Jogador não é membro do grupo.                                                                         |
| 200044     | O banco de dados da rede \<rede\> está em manutenção. Tente novamente mais tarde.                      |
| 200045     | Tipo de gráfico desconhecido.                                                                          |
| 200046     | ID de torneio inválido.                                                                                |
| 200047     | ID de vídeo inválido.                                                                                  |
| 200048     | Usuário deve estar logado com usuário e senha.                                                         |
| 200049     | Solicitação de remoção de Opt In falhou.                                                               |
| 200050     | Região desconhecida.                                                                                   |
| 200051     | Editor desconhecido.                                                                                   |
| 200052     | Jogador não está no torneio.                                                                           |
| 200053     | Reportar torneios ausentes não é permitido nesta rede.                                                 |
| 200054     | Evento da linha do tempo não encontrado.                                                               |
| 200055     | Requisição da linha do tempo não encontrada.                                                           |
| 200056     | Esta não é sua requisição de linha do tempo.                                                           |
| 200057     | Operação não permitida para esta rede.                                                                 |
| 200058     | Mesa do torneio não encontrada.                                                                        |
| 200059     | País não encontrado.                                                                                   |
| 200065     | As informações do resumo do torneio não estão em inglês e não podem ser analisadas.                    |
| 200066     | Informações do resumo do torneio têm formato inválido e não podem ser analisadas.                      |
| 200069     | Muitos jogos ausentes reportados. Você pode reportar no máximo 500 jogos por vez.                      |
| 200074     | Relatório manual de jogo ausente falhou.                                                               |
| 200075     | Um resultado para este jogador neste torneio já está no banco de dados.                                |
| 200076     | Um resultado para um jogador nesta posição neste torneio já está no banco de dados.                    |
| 200077     | Os detalhes do torneio fornecidos não correspondem aos que já temos registrados.                       |
| 200078     | Jogador não existe.                                                                                    |
| 200079     | A data de início do torneio deve ser anterior à data de término.                                       |
| 200080     | Jogadores PokerStars de países que permitem transferências de dinheiro devem usar o sistema do PokerStars para opt in e out. |
| 200081     | Muitos jogadores solicitados.                                                                          |
| 201003     | Servidor ocupado. Tente novamente mais tarde.                                                          |
| 201004     | Processo não encontrado.                                                                               |
| 202001     | Filtro \<filtro\> não encontrado.                                                                      |
| 202002     | Filtro inválido.                                                                                       |
| 202003     | Falha ao carregar filtros do usuário.                                                                  |
| 202004     | Falha ao salvar.                                                                                       |
| 202005     | Falha ao excluir.                                                                                      |
| 204001     | Restrição de filtro desconhecida "\<restrição\>".                                                      |
| 204002     | Restrição "\<restrição\>" não é válida para esta requisição.                                           |
| 204003     | Valor(es) inválido(s) para restrição de filtro "\<restrição\>".                                        |
| 204004     | Restrição "\<restrição\>" não é permitida para o seu nível de usuário.                                 |
| 204005     | Restrição "\<restrição\>" não pode ser invertida.                                                      |
| 204006     | Restrição "\<restrição\>" não é válida para este tipo de busca.                                        |
| 205001     | Widget não encontrado.                                                                                 |
| 205002     | Este não é o seu widget.                                                                               |
| 205003     | Falha na criação do widget.                                                                            |
| 205004     | Falha na exclusão do widget.                                                                           |
| 205005     | Falha na atualização do widget.                                                                        |
| 205006     | Parâmetro inválido.                                                                                    |
| 205007     | Sem mais pesquisas.                                                                                    |
| 205008     | Sem dados para gráfico.                                                                                |
| 300001     | Parâmetro de ordenação inválido.                                                                       |
| 300002     | Opção de ordenação inválida.                                                                           |
| 300003     | Falha ao analisar intervalo de ordenação.                                                              |
| 300004     | Intervalo de ordenação inválido.                                                                       |
| 300005     | O início do intervalo de ordenação deve ser um ou maior.                                               |
| 300006     | O fim do intervalo de ordenação deve ser maior que o início.                                           |
| 301002     | Falha na publicação por e-mail.                                                                        |
| 301003     | Requisição de notificação inválida.                                                                    |
| 301004     | Acesso inválido.                                                                                       |
| 301005     | Limite de requisições de notificação atingido.                                                         |
| 301006     | Tweet falhou.                                                                                          |
| 301007     | Publicação falhou.                                                                                     |
| 301008     | Permissões do editor desabilitadas.                                                                    |
| 400001     | Sem autorização para esta ação.                                                                        |
| 400002     | Jogador sem opt in.                                                                                    |
| 400003     | Resets não são permitidos nesta rede.                                                                  |
| 400004     | Acesso a esta rede não está autorizado.                                                                |
| 400005     | Acesso a este aplicativo não está autorizado.                                                          |

---

## Apêndice — Integração CL Team (estatísticas, cache e UI)

Esta secção documenta descobertas práticas ao alinhar o dashboard à **Pesquisa avançada** do site e ao export CSV, sem substituir a especificação oficial acima.

### A.1 Lista oficial de ids de estatísticas de jogador

- **Endpoint:** `GET https://www.sharkscope.com/api/{app}/metadata` — custo **0**, autenticação opcional conforme política atual.
- A resposta inclui `MetadataResponse` → `PlayerStatisticsDefinitions` → vários `PlayerStatisticDefinition` com atributos **`@id`** (identificador usado no path `.../statistics/{ids}`) e **`@name`** (rótulo em inglês).
- Para listar programaticamente no repositório: `npx tsx scratch/sharkscope-probe-metadata.ts` (requer variáveis SharkScope no `.env`).

**Importante — Capacidade (coluna “Ability” / UI PT “Capacidade”):** o id oficial é **`Ability`**. Não existe `AvAbility` na lista de `PlayerStatisticsDefinitions`. Pedidos do tipo `.../statistics/...,AvAbility,...` **não devolvem** essa métrica; use **`Ability`**. O changelog histórico (v1.0.75) menciona “AvAbility” no contexto de relatórios; na API REST o id canónico é **`Ability`**.

Outros ids usados no app (amostra): `Entries`, `Count`, `TotalROI`, `AvROI`, `ITM`, `TotalProfit`, `Profit`, `AvStake`, `AvEntrants`, `Entrants`, `FinshesEarly`, `FinshesLate` (grafia oficial da API, com typo em “Finshes”).

### A.2 Count vs Entries (Contagem vs Inscrições)

- **Entries** — corresponde à coluna **Inscrições** na pesquisa avançada: cada linha de entrada/reentrada conta (alinhado ao raciocínio do export CSV de torneios).
- **Count** — torneios únicos agregados (multi-entry combinado por torneio); por isso **Count ≤ Entries** quando há reentradas.

Pequenas diferenças (ex.: 459 vs 460 entradas) entre o site e o cache podem vir de **até quando** os dados foram atualizados, arredondamento ou torneios concluídos após a última sync.

### A.3 ROI total vs ROI médio

- **TotalROI** — coluna **“ROI tot.”** na UI PT (ROI agregado sobre o período filtrado).
- **AvROI** — **“ROI méd.”** (média por jogos/torneios conforme definição SharkScope).

O ranking de analytics do app ordena por **TotalROI** para alinhar ao “ROI total” do site.

### A.4 Filtros e cache (PlayerGroup / `networks/PlayerGroup/players/{grupo}/statistics/...`)

- O resumo **últimos 30 dias** do site corresponde a **`?filter=Date:30D`** (e 90 dias a `Date:90D`).
- Agregações por **tipo** (ex. só Bounty) usam `filter` adicionais (`Type:...`). O **ranking** do app deve usar **apenas** linhas de cache com `filterKey` **`?filter=Date:30D`** ou **`?filter=Date:90D`**, sem misturar com cortes por tipo — caso contrário aparecem volumes e ROIs de um **subconjunto** (ex. poucas dezenas de torneios) em vez do resumo global.

### A.5 CSV de torneios vs API de estatísticas

- O CSV exportado (colunas em português: Rede, Jogador, Stake, Resultado, …) é **histórico por torneio**.
- As estatísticas agregadas vêm do path **`statistics/{lista de ids}`** com ids em **inglês** (secção A.1). Não confundir cabeçalhos do CSV com os `@id` do JSON.

### A.6 Validação manual vs app (ordem de grandeza)

Comparações entre pesquisa manual e dashboard devem tolerar pequenas diferenças em lucro/ROI/entradas se o cache foi gerado em momento ligeiramente diferente; se a ordem de grandeza divergir muito, verificar **filtro** (`Date:30D` apenas), **id** correto (`Ability` não `AvAbility`) e **sync** recente.

### A.7 Rede (Network) em Player Group vs torneios

- **`statistics` em `networks/PlayerGroup/players/{grupo}/...`** — a API **não** aceita restrição `Network:...` no `filter` (resposta típica: `Unknown filter constraint 'Network'.`). Ou seja, não dá para obter **TotalROI / lucro só de uma rede** com uma única chamada de estatísticas agregadas do grupo.
- **`completedTournaments` no mesmo path** — cada item em `CompletedTournaments.Tournament` traz **`@network`** (ex.: `PokerStars`, `WPN`, `GGNetwork`) e **`TournamentEntry`** com o nick na rede. Com **uma busca** por até 100 torneios dá para histograma por rede e para cruzar nick ↔ rede na amostra, alinhado à coluna **Rede** do CSV de export.
- **Estatísticas por rede** — quando necessário, o caminho clássico é `networks/{rede}/players/{nick}/statistics/...` (uma combinação rede+nick por consulta), ou agregar métricas a partir da lista de torneios do grupo.

### A.8 Analytics “Por site” (gráfico) — agregado barato

- **Fonte no app:** o cron chama `completedTournaments` por **nome de grupo** (`PlayerGroup`), com `order=Last,{start}~{end}` e `filter=Date:30D` / `Date:90D`, até `SHARKSCOPE_SITE_MAX_PAGES` páginas (100 torneios por página). O resultado é agregado por rede e gravado em `sharkscope_cache` com `dataType` `group_site_breakdown_30d` / `group_site_breakdown_90d` e o mesmo `filterKey` que `?filter=Date:30D` / `?filter=Date:90D`.
- **Fórmula:** para cada torneio, lucro ≈ `TournamentEntry.@prize`, stake ≈ `@stake` no nó `Tournament`. Por rede (chaves `gg`, `pokerstars`, …): **ROI agregado = 100 × Σ lucro / Σ stake** no período (equivalente a um TotalROI sobre o conjunto agregado).
- **Custo:** da ordem de **uma busca por 100 torneios** por página (confirmar na conta SharkScope). Grupos distintos são processados **uma vez** por execução do cron (vários jogadores com o mesmo `playerGroup` não repetem chamadas).
- **Variáveis de ambiente:**
  - `SHARKSCOPE_SITE_MAX_PAGES` — teto de páginas por grupo e período (predefinido: 30).
  - `SHARKSCOPE_SYNC_SITE_NICKS` — se `1`/`true`, reativa a sincronização antiga por nick×rede (2 GET por nick; custo alto).
  - `SHARKSCOPE_ANALYTICS_SITE_FALLBACK_NICKS` — se `1`/`true`, o gráfico usa caches legados `stats_30d`/`stats_90d` por nick quando **não** houver dados `group_site_breakdown_*`.
