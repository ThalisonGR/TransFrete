<?php
/**
 * POST /api/cadastro.php — Cria um usuário (motorista ou anunciante).
 */

declare(strict_types=1);

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

cors_headers();
session_start();
require_method('POST');

$body = read_json_body();

$nome  = trim((string) ($body['nome'] ?? ''));
$email = trim((string) ($body['email'] ?? ''));
$senha = (string) ($body['senha'] ?? '');
$tipo  = (string) ($body['tipo_usuario'] ?? '');

$fields = [];

if ($nome === '' || mb_strlen($nome) > 120) {
    $fields['nome'] = 'Informe um nome válido (até 120 caracteres).';
}
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 160) {
    $fields['email'] = 'Informe um email válido.';
}
if (strlen($senha) < 6) {
    $fields['senha'] = 'A senha deve ter no mínimo 6 caracteres.';
}
if (!in_array($tipo, ['motorista', 'anunciante'], true)) {
    $fields['tipo_usuario'] = 'Tipo de usuário inválido.';
}

if (!empty($fields)) {
    respond_error('VALIDATION_ERROR', 'Dados de cadastro inválidos.', 400, $fields);
}

try {
    $pdo = db();

    // Verifica email duplicado.
    $stmt = $pdo->prepare('SELECT id FROM usuarios WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    if ($stmt->fetch() !== false) {
        respond_error('EMAIL_TAKEN', 'O email já está cadastrado.', 409, ['email' => 'Email já em uso']);
    }

    $hash = password_hash($senha, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare(
        'INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES (?, ?, ?, ?)'
    );
    $stmt->execute([$nome, $email, $hash, $tipo]);

    $id = (int) $pdo->lastInsertId();

    $usuario = [
        'id'           => $id,
        'nome'         => $nome,
        'email'        => $email,
        'tipo_usuario' => $tipo,
    ];

    // Loga o usuário automaticamente após o cadastro (cria a sessão).
    // Previne session fixation, igual ao login.
    session_regenerate_id(true);
    $_SESSION['usuario'] = $usuario;

    // Registra o primeiro acesso.
    $log = $pdo->prepare('INSERT INTO logs_acesso (usuario_id, data_hora) VALUES (?, NOW())');
    $log->execute([$id]);

    respond_success(['usuario' => $usuario], 201);
} catch (PDOException $e) {
    respond_error('INTERNAL_ERROR', 'Erro ao processar o cadastro.', 500);
}
