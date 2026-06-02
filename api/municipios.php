<?php
/**
 * GET /api/municipios.php?uf=SP — Lista os municípios de uma UF (público).
 */

declare(strict_types=1);

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

cors_headers();

$uf = strtoupper(trim((string) ($_GET['uf'] ?? '')));
if (!preg_match('/^[A-Z]{2}$/', $uf)) {
    respond_error('VALIDATION_ERROR', 'UF inválida.', 400, ['uf' => 'Informe uma UF de 2 letras.']);
}

try {
    $pdo = db();
    $stmt = $pdo->prepare(
        'SELECT codigo_ibge, nome, uf_sigla
         FROM municipios
         WHERE uf_sigla = ?
         ORDER BY nome'
    );
    $stmt->execute([$uf]);
    $rows = $stmt->fetchAll();

    $municipios = array_map(static function (array $r): array {
        return [
            'codigo_ibge' => (int) $r['codigo_ibge'],
            'nome'        => $r['nome'],
            'uf_sigla'    => $r['uf_sigla'],
        ];
    }, $rows);

    respond_success(['municipios' => $municipios], 200);
} catch (PDOException $e) {
    respond_error('INTERNAL_ERROR', 'Erro ao listar municípios.', 500);
}
