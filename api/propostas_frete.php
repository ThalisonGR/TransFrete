<?php
/**
 * GET /api/propostas_frete.php?frete_id=X
 * Lista os motoristas que se candidataram a um frete do anunciante logado.
 * O anunciante só pode ver as propostas dos fretes que ele mesmo publicou.
 */

declare(strict_types=1);

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

cors_headers();
session_start();

$user = require_role('anunciante');

$freteId = filter_var($_GET['frete_id'] ?? null, FILTER_VALIDATE_INT);
if ($freteId === false || $freteId === null || $freteId <= 0) {
    respond_error('VALIDATION_ERROR', 'frete_id inválido.', 400, ['frete_id' => 'Informe um frete válido.']);
}

try {
    $pdo = db();

    // O frete deve existir e pertencer ao anunciante logado.
    $stmt = $pdo->prepare('SELECT anunciante_id FROM fretes WHERE id = ? LIMIT 1');
    $stmt->execute([$freteId]);
    $frete = $stmt->fetch();

    if ($frete === false) {
        respond_error('NOT_FOUND', 'Frete não encontrado.', 404);
    }
    if ((int) $frete['anunciante_id'] !== (int) $user['id']) {
        respond_error('FORBIDDEN', 'Você só pode ver as propostas dos seus próprios fretes.', 403);
    }

    // Propostas + dados do motorista.
    $stmt = $pdo->prepare(
        'SELECT p.id, p.frete_id, p.motorista_id, p.status, p.data,
                u.nome AS motorista_nome, u.email AS motorista_email
         FROM propostas p
         INNER JOIN usuarios u ON u.id = p.motorista_id
         WHERE p.frete_id = ?
         ORDER BY p.data ASC'
    );
    $stmt->execute([$freteId]);
    $rows = $stmt->fetchAll();

    // Carrega os veículos de cada motorista (uma query só, via IN).
    $veiculosPorMotorista = [];
    $motoristaIds = array_values(array_unique(array_map(
        static fn(array $r): int => (int) $r['motorista_id'],
        $rows
    )));

    if (!empty($motoristaIds)) {
        $placeholders = implode(',', array_fill(0, count($motoristaIds), '?'));
        $vstmt = $pdo->prepare(
            "SELECT motorista_id, modelo, placa FROM veiculos
             WHERE motorista_id IN ($placeholders)"
        );
        $vstmt->execute($motoristaIds);
        foreach ($vstmt->fetchAll() as $v) {
            $mid = (int) $v['motorista_id'];
            $veiculosPorMotorista[$mid][] = [
                'modelo' => $v['modelo'],
                'placa'  => $v['placa'],
            ];
        }
    }

    $propostas = array_map(static function (array $r) use ($veiculosPorMotorista): array {
        $mid = (int) $r['motorista_id'];
        return [
            'id'           => (int) $r['id'],
            'frete_id'     => (int) $r['frete_id'],
            'motorista_id' => $mid,
            'status'       => $r['status'],
            'data'         => $r['data'],
            'motorista'    => [
                'id'       => $mid,
                'nome'     => $r['motorista_nome'],
                'email'    => $r['motorista_email'],
                'veiculos' => $veiculosPorMotorista[$mid] ?? [],
            ],
        ];
    }, $rows);

    respond_success(['propostas' => $propostas], 200);
} catch (PDOException $e) {
    respond_error('INTERNAL_ERROR', 'Erro ao listar as propostas do frete.', 500);
}
