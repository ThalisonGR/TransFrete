<?php
/**
 * helpers.php — Funções utilitárias compartilhadas (CORS, respostas, auth).
 *
 * Segue o contrato em docs/API_CONTRACT.md.
 */

declare(strict_types=1);

/**
 * Emite os headers CORS do contrato e trata o preflight OPTIONS (204).
 * Deve ser chamada no topo de cada endpoint, antes de qualquer saída.
 */
function cors_headers(): void
{
    header('Access-Control-Allow-Origin: http://localhost:5173');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Content-Type: application/json; charset=utf-8');

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

/**
 * Lê e decodifica o corpo JSON da requisição (php://input).
 *
 * @return array Sempre um array (vazio se corpo ausente/ inválido).
 */
function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        return [];
    }

    return $data;
}

/**
 * Responde com sucesso no envelope { success: true, data }.
 *
 * @param mixed $data
 * @param int   $status
 */
function respond_success($data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode(
        ['success' => true, 'data' => $data],
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );
    exit;
}

/**
 * Responde com erro no envelope { success: false, error: { code, message, fields? } }.
 *
 * @param string     $code
 * @param string     $message
 * @param int        $status
 * @param array|null $fields
 */
function respond_error(string $code, string $message, int $status, ?array $fields = null): void
{
    http_response_code($status);

    $error = ['code' => $code, 'message' => $message];
    if ($fields !== null) {
        $error['fields'] = $fields;
    }

    echo json_encode(
        ['success' => false, 'error' => $error],
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );
    exit;
}

/**
 * Retorna o usuário logado (da sessão) ou null.
 * Requer session_start() já chamado.
 *
 * @return array|null
 */
function current_user(): ?array
{
    if (isset($_SESSION['usuario']) && is_array($_SESSION['usuario'])) {
        return $_SESSION['usuario'];
    }
    return null;
}

/**
 * Garante que há um usuário autenticado; senão responde 401 e encerra.
 *
 * @return array O usuário autenticado.
 */
function require_auth(): array
{
    $user = current_user();
    if ($user === null) {
        respond_error('UNAUTHENTICATED', 'Você precisa estar autenticado.', 401);
    }
    return $user;
}

/**
 * Garante que o usuário autenticado tem o papel exigido; senão 403.
 *
 * @param string $role 'motorista' | 'anunciante'
 * @return array O usuário autenticado.
 */
function require_role(string $role): array
{
    $user = require_auth();
    if (($user['tipo_usuario'] ?? null) !== $role) {
        respond_error('FORBIDDEN', 'Você não tem permissão para esta ação.', 403);
    }
    return $user;
}

/**
 * Garante que o método HTTP é o esperado; senão 400.
 */
function require_method(string $method): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== $method) {
        respond_error('VALIDATION_ERROR', 'Método HTTP não permitido para esta rota.', 400);
    }
}

/**
 * Monta o shape público de um usuário (sem o campo senha).
 *
 * @param array $row Linha do banco.
 * @return array
 */
function public_user(array $row): array
{
    return [
        'id'           => (int) $row['id'],
        'nome'         => $row['nome'],
        'email'        => $row['email'],
        'tipo_usuario' => $row['tipo_usuario'],
    ];
}

/**
 * SELECT base de fretes com todos os JOINs (anunciante, categoria e municípios
 * de origem/destino). Os endpoints anexam WHERE/ORDER conforme necessário.
 */
function frete_base_sql(): string
{
    return 'SELECT f.id, f.anunciante_id, u.nome AS anunciante_nome,
                   f.categoria_id, c.nome_categoria AS categoria_nome,
                   f.origem_ibge, mo.nome AS origem_nome, mo.uf_sigla AS origem_uf,
                   f.destino_ibge, md.nome AS destino_nome, md.uf_sigla AS destino_uf,
                   f.peso, f.preco, f.status,
                   f.motorista_id, mt.nome AS motorista_nome
            FROM fretes f
            INNER JOIN usuarios u ON u.id = f.anunciante_id
            INNER JOIN categorias_carga c ON c.id = f.categoria_id
            INNER JOIN municipios mo ON mo.codigo_ibge = f.origem_ibge
            INNER JOIN municipios md ON md.codigo_ibge = f.destino_ibge
            LEFT JOIN usuarios mt ON mt.id = f.motorista_id';
}

/**
 * Mapeia uma linha do frete_base_sql() para o shape Frete do contrato.
 * origem/destino são strings "Cidade - UF"; os códigos IBGE também são expostos.
 *
 * @param array $r
 * @return array
 */
function map_frete(array $r): array
{
    return [
        'id'              => (int) $r['id'],
        'anunciante_id'   => (int) $r['anunciante_id'],
        'anunciante_nome' => $r['anunciante_nome'],
        'categoria_id'    => (int) $r['categoria_id'],
        'categoria_nome'  => $r['categoria_nome'],
        'origem'          => $r['origem_nome'] . ' - ' . $r['origem_uf'],
        'origem_ibge'     => (int) $r['origem_ibge'],
        'origem_uf'       => $r['origem_uf'],
        'destino'         => $r['destino_nome'] . ' - ' . $r['destino_uf'],
        'destino_ibge'    => (int) $r['destino_ibge'],
        'destino_uf'      => $r['destino_uf'],
        'peso'            => (float) $r['peso'],
        'preco'           => (float) $r['preco'],
        'status'          => $r['status'],
        'motorista_id'    => $r['motorista_id'] !== null ? (int) $r['motorista_id'] : null,
        'motorista_nome'  => $r['motorista_nome'],
    ];
}
