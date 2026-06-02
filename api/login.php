<?php
/**
 * POST /api/login.php — Autentica e inicia sessão segura.
 */

declare(strict_types=1);

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

cors_headers();
session_start();
require_method('POST');

$body = read_json_body();

$email = trim((string) ($body['email'] ?? ''));
$senha = (string) ($body['senha'] ?? '');

$fields = [];
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $fields['email'] = 'Informe um email válido.';
}
if ($senha === '') {
    $fields['senha'] = 'Informe a senha.';
}
if (!empty($fields)) {
    respond_error('VALIDATION_ERROR', 'Dados de login inválidos.', 400, $fields);
}

try {
    $pdo = db();

    $stmt = $pdo->prepare(
        'SELECT id, nome, email, senha, tipo_usuario FROM usuarios WHERE email = ? LIMIT 1'
    );
    $stmt->execute([$email]);
    $row = $stmt->fetch();

    if ($row === false || !password_verify($senha, $row['senha'])) {
        respond_error('UNAUTHENTICATED', 'Email ou senha incorretos.', 401);
    }

    // Previne session fixation.
    session_regenerate_id(true);

    $usuario = public_user($row);
    $_SESSION['usuario'] = $usuario;

    // Grava log de acesso.
    $log = $pdo->prepare('INSERT INTO logs_acesso (usuario_id, data_hora) VALUES (?, NOW())');
    $log->execute([$usuario['id']]);

    respond_success(['usuario' => $usuario], 200);
} catch (PDOException $e) {
    respond_error('INTERNAL_ERROR', 'Erro ao processar o login.', 500);
}
