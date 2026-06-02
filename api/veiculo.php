<?php
/**
 * POST /api/veiculo.php — Cadastra veículo do motorista logado.
 */

declare(strict_types=1);

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

cors_headers();
session_start();
require_method('POST');

$user = require_role('motorista');

$body = read_json_body();

$modelo = trim((string) ($body['modelo'] ?? ''));
$placa  = trim((string) ($body['placa'] ?? ''));

$fields = [];
if ($modelo === '' || mb_strlen($modelo) > 120) {
    $fields['modelo'] = 'Informe o modelo do veículo (até 120 caracteres).';
}
if ($placa === '' || mb_strlen($placa) > 10) {
    $fields['placa'] = 'Informe uma placa válida (até 10 caracteres).';
}
if (!empty($fields)) {
    respond_error('VALIDATION_ERROR', 'Dados do veículo inválidos.', 400, $fields);
}

try {
    $pdo = db();

    $stmt = $pdo->prepare(
        'INSERT INTO veiculos (motorista_id, modelo, placa) VALUES (?, ?, ?)'
    );
    $stmt->execute([$user['id'], $modelo, $placa]);

    $id = (int) $pdo->lastInsertId();

    respond_success([
        'veiculo' => [
            'id'           => $id,
            'motorista_id' => (int) $user['id'],
            'modelo'       => $modelo,
            'placa'        => $placa,
        ],
    ], 201);
} catch (PDOException $e) {
    respond_error('INTERNAL_ERROR', 'Erro ao cadastrar o veículo.', 500);
}
