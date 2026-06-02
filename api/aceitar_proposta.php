<?php
/**
 * POST /api/aceitar_proposta.php — O anunciante aceita um motorista para o frete.
 *
 * Efeitos (em transação):
 *   - a proposta escolhida fica 'aceita';
 *   - as demais propostas do mesmo frete ficam 'recusada';
 *   - o frete fica 'fechado' e recebe o motorista aprovado.
 *
 * Apenas o anunciante dono do frete. O frete precisa estar 'disponivel'.
 */

declare(strict_types=1);

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

cors_headers();
session_start();
require_method('POST');

$user = require_role('anunciante');

$body = read_json_body();
$propostaId = filter_var($body['proposta_id'] ?? null, FILTER_VALIDATE_INT);
if ($propostaId === false || $propostaId === null || $propostaId <= 0) {
    respond_error('VALIDATION_ERROR', 'proposta_id inválido.', 400, ['proposta_id' => 'Informe uma proposta válida.']);
}

try {
    $pdo = db();

    // Carrega a proposta + o frete relacionado.
    $stmt = $pdo->prepare(
        'SELECT p.id, p.frete_id, p.motorista_id, p.status AS proposta_status,
                f.anunciante_id, f.status AS frete_status
         FROM propostas p
         INNER JOIN fretes f ON f.id = p.frete_id
         WHERE p.id = ? LIMIT 1'
    );
    $stmt->execute([$propostaId]);
    $info = $stmt->fetch();

    if ($info === false) {
        respond_error('NOT_FOUND', 'Proposta não encontrada.', 404);
    }
    if ((int) $info['anunciante_id'] !== (int) $user['id']) {
        respond_error('FORBIDDEN', 'Você só pode aceitar propostas dos seus próprios fretes.', 403);
    }
    if ($info['frete_status'] !== 'disponivel') {
        respond_error('CONFLICT', 'Este frete já foi fechado.', 409);
    }

    $freteId = (int) $info['frete_id'];
    $motoristaId = (int) $info['motorista_id'];

    $pdo->beginTransaction();

    // Aceita a proposta escolhida.
    $pdo->prepare("UPDATE propostas SET status = 'aceita' WHERE id = ?")
        ->execute([$propostaId]);

    // Recusa as outras propostas do mesmo frete.
    $pdo->prepare("UPDATE propostas SET status = 'recusada' WHERE frete_id = ? AND id <> ?")
        ->execute([$freteId, $propostaId]);

    // Fecha o frete e registra o motorista aprovado.
    $pdo->prepare("UPDATE fretes SET status = 'fechado', motorista_id = ? WHERE id = ?")
        ->execute([$motoristaId, $freteId]);

    $pdo->commit();

    // Retorna o frete atualizado.
    $stmt = $pdo->prepare(frete_base_sql() . ' WHERE f.id = ? LIMIT 1');
    $stmt->execute([$freteId]);
    $frete = $stmt->fetch();

    respond_success(['frete' => map_frete($frete)], 200);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    respond_error('INTERNAL_ERROR', 'Erro ao aceitar a proposta.', 500);
}
