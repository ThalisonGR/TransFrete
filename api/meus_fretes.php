<?php
/**
 * GET /api/meus_fretes.php — Lista os fretes publicados pelo anunciante logado.
 * Cada frete inclui o total de propostas (candidaturas) recebidas.
 */

declare(strict_types=1);

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

cors_headers();
session_start();

$user = require_role('anunciante');

try {
    $pdo = db();

    // Reaproveita o SELECT base (com joins de município) e injeta a contagem
    // de propostas e o filtro pelo anunciante logado.
    $sql = preg_replace(
        '/\bFROM fretes f\b/',
        ', (SELECT COUNT(*) FROM propostas p WHERE p.frete_id = f.id) AS total_propostas FROM fretes f',
        frete_base_sql(),
        1
    ) . ' WHERE f.anunciante_id = ? ORDER BY f.id DESC';

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$user['id']]);
    $rows = $stmt->fetchAll();

    $fretes = array_map(static function (array $r): array {
        $frete = map_frete($r);
        $frete['total_propostas'] = (int) $r['total_propostas'];
        return $frete;
    }, $rows);

    respond_success(['fretes' => $fretes], 200);
} catch (PDOException $e) {
    respond_error('INTERNAL_ERROR', 'Erro ao listar seus fretes.', 500);
}
