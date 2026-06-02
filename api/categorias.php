<?php
/**
 * GET /api/categorias.php — Lista categorias de carga (público).
 */

declare(strict_types=1);

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

cors_headers();
session_start();

try {
    $pdo = db();
    $stmt = $pdo->query('SELECT id, nome_categoria FROM categorias_carga ORDER BY nome_categoria ASC');
    $rows = $stmt->fetchAll();

    $categorias = array_map(static function (array $r): array {
        return [
            'id'             => (int) $r['id'],
            'nome_categoria' => $r['nome_categoria'],
        ];
    }, $rows);

    respond_success(['categorias' => $categorias], 200);
} catch (PDOException $e) {
    respond_error('INTERNAL_ERROR', 'Erro ao listar categorias.', 500);
}
