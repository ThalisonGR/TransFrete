<?php
/**
 * GET /api/fretes.php — Lista todos os fretes (público).
 */

declare(strict_types=1);

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

cors_headers();
session_start();

try {
    $pdo = db();
    $sql = frete_base_sql() . " WHERE f.status = 'disponivel' ORDER BY f.id DESC";
    $rows = $pdo->query($sql)->fetchAll();

    $fretes = array_map('map_frete', $rows);

    respond_success(['fretes' => $fretes], 200);
} catch (PDOException $e) {
    respond_error('INTERNAL_ERROR', 'Erro ao listar fretes.', 500);
}
