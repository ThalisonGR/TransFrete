<?php
/**
 * POST /api/proposta.php — Motorista se candidata a um frete.
 */

declare(strict_types=1);

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

cors_headers();
session_start();
require_method('POST');

$user = require_role('motorista');

$body = read_json_body();

$freteId = filter_var($body['frete_id'] ?? null, FILTER_VALIDATE_INT);
if ($freteId === false || $freteId === null || $freteId <= 0) {
    respond_error('VALIDATION_ERROR', 'frete_id inválido.', 400, ['frete_id' => 'Informe um frete válido.']);
}

try {
    $pdo = db();

    // Motorista precisa ter ao menos um veículo cadastrado.
    $stmt = $pdo->prepare('SELECT id FROM veiculos WHERE motorista_id = ? LIMIT 1');
    $stmt->execute([$user['id']]);
    if ($stmt->fetch() === false) {
        respond_error('NO_VEHICLE', 'Você precisa cadastrar um veículo antes de se candidatar.', 403);
    }

    // Frete deve existir e estar disponível.
    $stmt = $pdo->prepare('SELECT status FROM fretes WHERE id = ? LIMIT 1');
    $stmt->execute([$freteId]);
    $frete = $stmt->fetch();
    if ($frete === false) {
        respond_error('NOT_FOUND', 'Frete não encontrado.', 404);
    }
    if ($frete['status'] !== 'disponivel') {
        respond_error('CONFLICT', 'Este frete já foi fechado.', 409);
    }

    // Insere a proposta. O UNIQUE (frete_id, motorista_id) bloqueia duplicatas.
    try {
        $stmt = $pdo->prepare(
            'INSERT INTO propostas (frete_id, motorista_id, status, data)
             VALUES (?, ?, ?, NOW())'
        );
        $stmt->execute([$freteId, $user['id'], 'pendente']);
    } catch (PDOException $e) {
        // 23000 = violação de integridade (chave única).
        if ($e->getCode() === '23000') {
            respond_error('DUPLICATE_PROPOSAL', 'Você já se candidatou a este frete.', 409);
        }
        throw $e;
    }

    $id = (int) $pdo->lastInsertId();

    // Recupera a data exata gravada.
    $stmt = $pdo->prepare('SELECT data FROM propostas WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $row = $stmt->fetch();

    respond_success([
        'proposta' => [
            'id'           => $id,
            'frete_id'     => (int) $freteId,
            'motorista_id' => (int) $user['id'],
            'status'       => 'pendente',
            'data'         => $row['data'] ?? date('Y-m-d H:i:s'),
        ],
    ], 201);
} catch (PDOException $e) {
    respond_error('INTERNAL_ERROR', 'Erro ao registrar a proposta.', 500);
}
