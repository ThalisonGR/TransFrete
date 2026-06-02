<?php
/**
 * GET /api/ufs.php — Lista as UFs (estados) disponíveis nos municípios (público).
 */

declare(strict_types=1);

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

cors_headers();

try {
    $pdo = db();
    $sql = 'SELECT uf_sigla AS sigla, uf_nome AS nome
            FROM municipios
            GROUP BY uf_sigla, uf_nome
            ORDER BY uf_sigla';
    $rows = $pdo->query($sql)->fetchAll();

    $ufs = array_map(static function (array $r): array {
        return ['sigla' => $r['sigla'], 'nome' => $r['nome']];
    }, $rows);

    respond_success(['ufs' => $ufs], 200);
} catch (PDOException $e) {
    respond_error('INTERNAL_ERROR', 'Erro ao listar UFs.', 500);
}
