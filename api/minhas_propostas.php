<?php
/**
 * GET /api/minhas_propostas.php — Candidaturas do motorista logado, com o frete.
 * Permite ao motorista acompanhar o status e acessar o frete aprovado.
 */

declare(strict_types=1);

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

cors_headers();
session_start();

$user = require_role('motorista');

try {
    $pdo = db();
    $stmt = $pdo->prepare(
        'SELECT p.id, p.status, p.data,
                f.id AS frete_id, f.preco, f.status AS frete_status,
                c.nome_categoria AS categoria_nome,
                u.nome AS anunciante_nome,
                mo.nome AS origem_nome, mo.uf_sigla AS origem_uf,
                md.nome AS destino_nome, md.uf_sigla AS destino_uf
         FROM propostas p
         INNER JOIN fretes f ON f.id = p.frete_id
         INNER JOIN categorias_carga c ON c.id = f.categoria_id
         INNER JOIN usuarios u ON u.id = f.anunciante_id
         INNER JOIN municipios mo ON mo.codigo_ibge = f.origem_ibge
         INNER JOIN municipios md ON md.codigo_ibge = f.destino_ibge
         WHERE p.motorista_id = ?
         ORDER BY p.data DESC'
    );
    $stmt->execute([$user['id']]);
    $rows = $stmt->fetchAll();

    $propostas = array_map(static function (array $r): array {
        return [
            'id'     => (int) $r['id'],
            'status' => $r['status'],
            'data'   => $r['data'],
            'frete'  => [
                'id'              => (int) $r['frete_id'],
                'origem'          => $r['origem_nome'] . ' - ' . $r['origem_uf'],
                'destino'         => $r['destino_nome'] . ' - ' . $r['destino_uf'],
                'categoria_nome'  => $r['categoria_nome'],
                'anunciante_nome' => $r['anunciante_nome'],
                'preco'           => (float) $r['preco'],
                'status'          => $r['frete_status'],
            ],
        ];
    }, $rows);

    respond_success(['propostas' => $propostas], 200);
} catch (PDOException $e) {
    respond_error('INTERNAL_ERROR', 'Erro ao listar suas candidaturas.', 500);
}
