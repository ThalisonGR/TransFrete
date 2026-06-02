<?php
/**
 * POST /api/frete.php — Cria um frete. Apenas anunciante.
 */

declare(strict_types=1);

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

cors_headers();
session_start();
require_method('POST');

$user = require_role('anunciante');

$body = read_json_body();

$categoriaId = filter_var($body['categoria_id'] ?? null, FILTER_VALIDATE_INT);
$origemIbge  = filter_var($body['origem_ibge'] ?? null, FILTER_VALIDATE_INT);
$destinoIbge = filter_var($body['destino_ibge'] ?? null, FILTER_VALIDATE_INT);
$peso        = filter_var($body['peso'] ?? null, FILTER_VALIDATE_FLOAT);
$preco       = filter_var($body['preco'] ?? null, FILTER_VALIDATE_FLOAT);

$fields = [];
if ($categoriaId === false || $categoriaId === null || $categoriaId <= 0) {
    $fields['categoria_id'] = 'Selecione uma categoria válida.';
}
if ($origemIbge === false || $origemIbge === null || $origemIbge <= 0) {
    $fields['origem_ibge'] = 'Selecione o município de origem.';
}
if ($destinoIbge === false || $destinoIbge === null || $destinoIbge <= 0) {
    $fields['destino_ibge'] = 'Selecione o município de destino.';
}
if ($peso === false || $peso === null || $peso <= 0) {
    $fields['peso'] = 'Informe um peso válido.';
}
if ($preco === false || $preco === null || $preco <= 0) {
    $fields['preco'] = 'Informe um preço válido.';
}
if (!empty($fields)) {
    respond_error('VALIDATION_ERROR', 'Dados do frete inválidos.', 400, $fields);
}

try {
    $pdo = db();

    // Categoria deve existir.
    $stmt = $pdo->prepare('SELECT nome_categoria FROM categorias_carga WHERE id = ? LIMIT 1');
    $stmt->execute([$categoriaId]);
    $cat = $stmt->fetch();
    if ($cat === false) {
        respond_error('VALIDATION_ERROR', 'Categoria inexistente.', 400, ['categoria_id' => 'Categoria não encontrada']);
    }

    // Municípios de origem/destino devem existir.
    $stmt = $pdo->prepare('SELECT codigo_ibge FROM municipios WHERE codigo_ibge IN (?, ?)');
    $stmt->execute([$origemIbge, $destinoIbge]);
    $encontrados = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $mFields = [];
    if (!in_array($origemIbge, array_map('intval', $encontrados), true)) {
        $mFields['origem_ibge'] = 'Município de origem inválido.';
    }
    if (!in_array($destinoIbge, array_map('intval', $encontrados), true)) {
        $mFields['destino_ibge'] = 'Município de destino inválido.';
    }
    if (!empty($mFields)) {
        respond_error('VALIDATION_ERROR', 'Município inválido.', 400, $mFields);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO fretes (anunciante_id, categoria_id, origem_ibge, destino_ibge, peso, preco)
         VALUES (?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([$user['id'], $categoriaId, $origemIbge, $destinoIbge, $peso, $preco]);

    $id = (int) $pdo->lastInsertId();

    // Recupera o frete já com os nomes dos municípios (join).
    $stmt = $pdo->prepare(frete_base_sql() . ' WHERE f.id = ? LIMIT 1');
    $stmt->execute([$id]);
    $row = $stmt->fetch();

    respond_success(['frete' => map_frete($row)], 201);
} catch (PDOException $e) {
    respond_error('INTERNAL_ERROR', 'Erro ao criar o frete.', 500);
}
