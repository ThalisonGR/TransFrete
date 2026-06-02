<?php
/**
 * GET /api/detalhe_frete.php?id=X — Retorna um frete específico (público).
 */

declare(strict_types=1);

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

cors_headers();
session_start();

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if ($id === false || $id === null || $id <= 0) {
    respond_error('VALIDATION_ERROR', 'Parâmetro id inválido.', 400, ['id' => 'id obrigatório e numérico']);
}

try {
    $pdo = db();
    $sql = frete_base_sql() . ' WHERE f.id = ? LIMIT 1';
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id]);
    $row = $stmt->fetch();

    if ($row === false) {
        respond_error('NOT_FOUND', 'Frete não encontrado.', 404);
    }

    // Frete fechado é privado: só o anunciante dono e o motorista aprovado podem ver.
    if ($row['status'] === 'fechado') {
        $u = current_user();
        $uid = $u['id'] ?? null;
        $permitido = $uid !== null
            && ((int) $row['anunciante_id'] === (int) $uid
                || (int) $row['motorista_id'] === (int) $uid);
        if (!$permitido) {
            respond_error('NOT_FOUND', 'Frete não encontrado.', 404);
        }
    }

    respond_success(['frete' => map_frete($row)], 200);
} catch (PDOException $e) {
    respond_error('INTERNAL_ERROR', 'Erro ao buscar o frete.', 500);
}
